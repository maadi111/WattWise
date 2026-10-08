package telemetry

import (
	"context"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"

	"github.com/wattwise/api/internal/auth"
	"github.com/wattwise/api/internal/config"
	"github.com/wattwise/api/internal/db"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		origin := r.Header.Get("Origin")
		if config.AppConfig == nil {
			return true
		}
		return config.IsOriginAllowed(origin, config.AppConfig.CORSAllowedOrigins)
	},
}

type LiveSnapshot struct {
	FactoryID          string    `json:"factory_id"`
	Timestamp          time.Time `json:"timestamp"`
	GridStatus         string    `json:"grid_status"`
	ActiveSource       string    `json:"active_source"`
	GridVoltage        float64   `json:"grid_voltage"`
	GridFrequency      float64   `json:"grid_frequency"`
	TotalKw            float64   `json:"total_kw"`
	PowerFactorAvg     float64   `json:"power_factor_avg"`
	CostPerHourPkr     int       `json:"cost_per_hour_pkr"`
	HourlyWasteAvoided int       `json:"hourly_waste_avoided_pkr"`
	DataSource         string    `json:"data_source"`
}

// In-memory one-time ticket store for WebSocket handshake (H11)
type wsTicketInfo struct {
	UserID     string
	Role       string
	FactoryIDs []string
	ExpiresAt  time.Time
}

var (
	wsTicketMu    sync.Mutex
	wsTicketCache = make(map[string]wsTicketInfo)
)

func init() {
	go func() {
		ticker := time.NewTicker(30 * time.Second)
		for range ticker.C {
			wsTicketMu.Lock()
			now := time.Now()
			for t, info := range wsTicketCache {
				if now.After(info.ExpiresAt) {
					delete(wsTicketCache, t)
				}
			}
			wsTicketMu.Unlock()
		}
	}()
}

// CreateWSTicket issues a single-use 30-second ticket for browser WebSocket connections (H11)
func CreateWSTicket(c *gin.Context) {
	val, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication required to generate websocket ticket"})
		return
	}
	claims, ok := val.(*auth.CustomClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid authentication claims"})
		return
	}

	ticket := uuid.New().String()
	ttl := 30 * time.Second

	if db.GlobalClients.Redis != nil {
		ctx := c.Request.Context()
		ticketData, _ := json.Marshal(claims)
		_ = db.GlobalClients.Redis.Set(ctx, "ws_ticket:"+ticket, ticketData, ttl).Err()
	}

	wsTicketMu.Lock()
	wsTicketCache[ticket] = wsTicketInfo{
		UserID:     claims.UserID,
		Role:       claims.Role,
		FactoryIDs: claims.FactoryIDs,
		ExpiresAt:  time.Now().Add(ttl),
	}
	wsTicketMu.Unlock()

	c.JSON(http.StatusOK, gin.H{
		"ticket":     ticket,
		"expires_in": 30,
	})
}

func validateWSTicket(ctx context.Context, ticket, factoryID string) bool {
	if ticket == "" {
		return false
	}

	// Try Redis first
	if db.GlobalClients.Redis != nil {
		val, err := db.GlobalClients.Redis.Get(ctx, "ws_ticket:"+ticket).Result()
		if err == nil && val != "" {
			_ = db.GlobalClients.Redis.Del(ctx, "ws_ticket:"+ticket)
			var claims auth.CustomClaims
			if err := json.Unmarshal([]byte(val), &claims); err == nil {
				return claims.HasFactory(factoryID)
			}
		}
	}

	// Fallback to in-memory cache
	wsTicketMu.Lock()
	defer wsTicketMu.Unlock()
	info, exists := wsTicketCache[ticket]
	if !exists || time.Now().After(info.ExpiresAt) {
		delete(wsTicketCache, ticket)
		return false
	}

	// Delete single-use ticket
	delete(wsTicketCache, ticket)

	if info.Role == "super_admin" {
		return true
	}
	for _, id := range info.FactoryIDs {
		if id == factoryID {
			return true
		}
	}
	return false
}

func LiveHandler(c *gin.Context) {
	factoryID := c.Param("id")
	ctx := c.Request.Context()

	var peakLoad float64 = 847.3
	var gridRate float64 = 32.50
	var found bool = false

	if db.GlobalClients.DB != nil {
		err := db.GlobalClients.DB.QueryRowContext(
			ctx,
			"SELECT peak_load_kw, grid_rate_pkr FROM factories WHERE id = $1",
			factoryID,
		).Scan(&peakLoad, &gridRate)
		if err == nil {
			found = true
		}
	}

	if db.GlobalClients.Influx != nil {
		queryAPI := db.GlobalClients.Influx.QueryAPI("wattwise")
		fluxQuery := fmt.Sprintf(`
			from(bucket: "sensors")
				|> range(start: -1h)
				|> filter(fn: (r) => r["_measurement"] == "factory_telemetry")
				|> filter(fn: (r) => r["factory_id"] == "%s")
				|> last()
		`, factoryID)
		result, err := queryAPI.Query(ctx, fluxQuery)
		if err == nil && result.Next() {
			record := result.Record()
			voltage, _ := record.ValueByKey("voltage").(float64)
			freq, _ := record.ValueByKey("frequency").(float64)
			kw, _ := record.ValueByKey("power_kw").(float64)
			pf, _ := record.ValueByKey("power_factor").(float64)

			if voltage > 0 && kw > 0 {
				costPerHour := int(kw * gridRate)
				snapshot := LiveSnapshot{
					FactoryID:          factoryID,
					Timestamp:          record.Time(),
					GridStatus:         "HEALTHY",
					ActiveSource:       "GRID",
					GridVoltage:        voltage,
					GridFrequency:      freq,
					TotalKw:            kw,
					PowerFactorAvg:     pf,
					CostPerHourPkr:     costPerHour,
					HourlyWasteAvoided: int(float64(costPerHour) * 0.28),
					DataSource:         "PHYSICAL_METER_INFLUX",
				}
				c.JSON(http.StatusOK, snapshot)
				return
			}
		}
	}

	dataSource := "CALIBRATED_BASE"
	if !found {
		dataSource = "SIMULATION_FALLBACK"
	}
	costPerHour := int(peakLoad * gridRate)
	snapshot := LiveSnapshot{
		FactoryID:          factoryID,
		Timestamp:          time.Now().UTC(),
		GridStatus:         "HEALTHY",
		ActiveSource:       "GRID",
		GridVoltage:        401.8,
		GridFrequency:      50.02,
		TotalKw:            peakLoad,
		PowerFactorAvg:     0.94,
		CostPerHourPkr:     costPerHour,
		HourlyWasteAvoided: int(float64(costPerHour) * 0.28),
		DataSource:         dataSource,
	}
	c.JSON(http.StatusOK, snapshot)
}

func PredictionsHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"date":        time.Now().Format("2006-01-02"),
		"data_source": "SIMULATION_CALIBRATED",
		"predicted_outages": []gin.H{
			{"start": "11:00", "end": "13:30", "confidence": 0.91, "cause": "FESCO Scheduled Feeder Load Shedding (Historical Pattern)"},
			{"start": "18:00", "end": "20:15", "confidence": 0.84, "cause": "Evening Peak Deficit (>4,800 MW)"},
		},
		"recommendations": []gin.H{
			{"time": "07:00 - 10:45", "action": "RUN_HEAVY_LOAD", "reason": "Grid stable & cheap (Rs. 32.50/kWh)"},
			{"time": "10:48", "action": "PRE_HEAT_VATS", "reason": "Pre-heat before 11:00 outage window"},
			{"time": "10:59", "action": "PRE_EMPTIVE_SWITCH", "reason": "SwiftSwitch: Start Cummins gen at T-12s"},
			{"time": "11:00 - 13:30", "action": "THROTTLE_NON_CRITICAL", "reason": "Auto-shed HVAC (-91kW) on diesel"},
		},
		"estimated_saving_pkr": 184000,
	})
}

// WebSocket handles real-time bidirectional streaming (H11: accepts ?ticket= or Bearer auth)
func WebSocket(c *gin.Context) {
	factoryID := c.Param("id")
	ticket := c.Query("ticket")
	tokenParam := c.Query("token")

	authenticated := false

	if ticket != "" {
		authenticated = validateWSTicket(c.Request.Context(), ticket, factoryID)
	} else if tokenParam != "" {
		// Also support ?token= if provided
		token, err := jwt.ParseWithClaims(
			tokenParam,
			&auth.CustomClaims{},
			func(t *jwt.Token) (interface{}, error) {
				return auth.GetRSAPublicKey(), nil
			},
		)
		if err == nil && token.Valid {
			if claims, ok := token.Claims.(*auth.CustomClaims); ok && claims.HasFactory(factoryID) {
				authenticated = true
			}
		}
	} else {
		// Check Authorization header for non-browser clients
		authHeader := c.GetHeader("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			rawToken := strings.TrimPrefix(authHeader, "Bearer ")
			token, err := jwt.ParseWithClaims(
				rawToken,
				&auth.CustomClaims{},
				func(t *jwt.Token) (interface{}, error) {
					return auth.GetRSAPublicKey(), nil
				},
			)
			if err == nil && token.Valid {
				if claims, ok := token.Claims.(*auth.CustomClaims); ok && claims.HasFactory(factoryID) {
					authenticated = true
				}
			}
		}
	}

	if !authenticated {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: valid ticket or token required for websocket stream"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Error().Err(err).Msg("Failed to upgrade WebSocket connection")
		return
	}
	defer conn.Close()

	log.Info().Str("factory_id", factoryID).Msg("Client subscribed to real-time telemetry stream")

	ticker := time.NewTicker(2 * time.Second)
	defer ticker.Stop()

	baseKw := 847.0
	for {
		select {
		case <-c.Request.Context().Done():
			return
		case <-ticker.C:
			var packet LiveSnapshot
			hasInflux := false

			// H11: Stream real Influx data if available
			if db.GlobalClients.Influx != nil {
				queryAPI := db.GlobalClients.Influx.QueryAPI("wattwise")
				fluxQuery := fmt.Sprintf(`
					from(bucket: "sensors")
						|> range(start: -5m)
						|> filter(fn: (r) => r["_measurement"] == "factory_telemetry")
						|> filter(fn: (r) => r["factory_id"] == "%s")
						|> last()
				`, factoryID)
				result, qErr := queryAPI.Query(c.Request.Context(), fluxQuery)
				if qErr == nil && result.Next() {
					rec := result.Record()
					v, _ := rec.ValueByKey("voltage").(float64)
					kw, _ := rec.ValueByKey("power_kw").(float64)
					freq, _ := rec.ValueByKey("frequency").(float64)
					pf, _ := rec.ValueByKey("power_factor").(float64)
					if v > 0 {
						packet = LiveSnapshot{
							FactoryID:          factoryID,
							Timestamp:          rec.Time(),
							GridStatus:         "HEALTHY",
							ActiveSource:       "GRID",
							GridVoltage:        v,
							GridFrequency:      freq,
							TotalKw:            kw,
							PowerFactorAvg:     pf,
							CostPerHourPkr:     int(kw * 32.5),
							HourlyWasteAvoided: 52278,
							DataSource:         "PHYSICAL_METER_INFLUX",
						}
						hasInflux = true
					}
				}
			}

			if !hasInflux {
				noise := (rand.Float64() - 0.5) * 6.0
				kw := baseKw + noise
				packet = LiveSnapshot{
					FactoryID:          factoryID,
					Timestamp:          time.Now().UTC(),
					GridStatus:         "HEALTHY",
					ActiveSource:       "GRID",
					GridVoltage:        405.0 + (rand.Float64()-0.5)*1.2,
					GridFrequency:      50.00 + (rand.Float64()-0.5)*0.03,
					TotalKw:            float64(int(kw*10)) / 10,
					PowerFactorAvg:     0.94,
					CostPerHourPkr:     int(kw * 32.5),
					HourlyWasteAvoided: 52278,
					DataSource:         "SIMULATION_CALIBRATED",
				}
			}

			payload, _ := json.Marshal(packet)
			if err := conn.WriteMessage(websocket.TextMessage, payload); err != nil {
				log.Warn().Msg("Client disconnected from WebSocket")
				return
			}
		}
	}
}
