package telemetry

import (
	"context"
	"errors"
	"fmt"
	"math/rand"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"

	"github.com/wattwise/api/internal/auth"
	"github.com/wattwise/api/internal/config"
	"github.com/wattwise/api/internal/db"
)

const (
	influxOrg    = "wattwise"
	influxBucket = "sensors"
	streamEvery  = 2 * time.Second
)

var (
	// factoryIDPattern guards the only value interpolated into a Flux query.
	factoryIDPattern = regexp.MustCompile(`^[A-Za-z0-9_-]{1,64}$`)

	// ErrSourceUnavailable means no real telemetry source can answer and simulation is not permitted.
	ErrSourceUnavailable = errors.New("telemetry source unavailable")

	upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
		CheckOrigin: func(r *http.Request) bool {
			if config.AppConfig == nil {
				return false // fail closed when unconfigured
			}
			return config.IsOriginAllowed(r.Header.Get("Origin"), config.AppConfig.CORSAllowedOrigins)
		},
	}
)

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

// simulationAllowed is true only for an explicit development simulation run. Production and staging
// never serve generated data: they return real measurements or an error.
func simulationAllowed() bool {
	c := config.AppConfig
	return c != nil && c.IsSimulation && !c.Strict()
}

// CreateWSTicket issues a single-use 30-second ticket for a browser WebSocket connection.
// Optional JSON body {"factory_id": "..."} binds the ticket to one factory (access is verified now).
func CreateWSTicket(c *gin.Context) {
	val, exists := c.Get("claims")
	claims, ok := val.(*auth.CustomClaims)
	if !exists || !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication required to generate websocket ticket"})
		return
	}

	var body struct {
		FactoryID string `json:"factory_id"`
	}
	_ = c.ShouldBindJSON(&body) // body is optional
	if body.FactoryID != "" {
		if !factoryIDPattern.MatchString(body.FactoryID) {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid factory_id"})
			return
		}
		if !claims.HasFactory(body.FactoryID) {
			c.JSON(http.StatusForbidden, gin.H{"error": "access denied to this factory"})
			return
		}
	}

	ticket, err := auth.GetWSTicketStore().Issue(c.Request.Context(), auth.WSTicket{
		UserID:     claims.UserID,
		Role:       claims.Role,
		TenantID:   claims.TenantID,
		FactoryIDs: claims.FactoryIDs,
		FactoryID:  body.FactoryID,
	})
	if err != nil {
		log.Error().Err(err).Msg("could not issue websocket ticket")
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "ticket service unavailable"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"ticket": ticket, "expires_in": int(auth.WSTicketTTL.Seconds())})
}

// factorySpec returns the registered peak load and grid rate; found is false when unknown.
func factorySpec(ctx context.Context, factoryID string) (peakLoad, gridRate float64, found bool) {
	peakLoad, gridRate = 847.3, 32.50 // only used to shape simulated data
	if db.GlobalClients.DB != nil {
		if err := db.GlobalClients.DB.QueryRowContext(ctx,
			"SELECT peak_load_kw, grid_rate_pkr FROM factories WHERE id = $1", factoryID,
		).Scan(&peakLoad, &gridRate); err == nil {
			found = true
		}
	}
	return peakLoad, gridRate, found
}

// queryInflux returns the latest real measurement inside window ("-1h", "-5m"), (nil, nil) if there is none.
func queryInflux(ctx context.Context, factoryID, window string, gridRate float64) (*LiveSnapshot, error) {
	if !factoryIDPattern.MatchString(factoryID) {
		return nil, fmt.Errorf("invalid factory id")
	}
	client := db.GlobalClients.Influx
	if client == nil {
		return nil, ErrSourceUnavailable
	}
	flux := fmt.Sprintf(`
		from(bucket: "%s")
			|> range(start: %s)
			|> filter(fn: (r) => r["_measurement"] == "factory_telemetry")
			|> filter(fn: (r) => r["factory_id"] == "%s")
			|> last()
	`, influxBucket, window, factoryID)
	result, err := client.QueryAPI(influxOrg).Query(ctx, flux)
	if err != nil {
		return nil, ErrSourceUnavailable
	}
	defer result.Close()
	if !result.Next() {
		return nil, nil
	}
	rec := result.Record()
	voltage, _ := rec.ValueByKey("voltage").(float64)
	freq, _ := rec.ValueByKey("frequency").(float64)
	kw, _ := rec.ValueByKey("power_kw").(float64)
	pf, _ := rec.ValueByKey("power_factor").(float64)
	if voltage <= 0 || kw <= 0 {
		return nil, nil
	}
	cost := int(kw * gridRate)
	return &LiveSnapshot{
		FactoryID: factoryID, Timestamp: rec.Time(), GridStatus: "HEALTHY", ActiveSource: "GRID",
		GridVoltage: voltage, GridFrequency: freq, TotalKw: kw, PowerFactorAvg: pf,
		CostPerHourPkr: cost, HourlyWasteAvoided: int(float64(cost) * 0.28), DataSource: "PHYSICAL_METER_INFLUX",
	}, nil
}

func simulatedSnapshot(factoryID string, peakLoad, gridRate float64, found, jitter bool) LiveSnapshot {
	volt, freq, kw := 401.8, 50.02, peakLoad
	if jitter {
		volt += rand.Float64()*6 - 3
		freq += rand.Float64()*0.06 - 0.03
		kw += rand.Float64()*40 - 20
	}
	source := "CALIBRATED_BASE"
	if !found {
		source = "SIMULATION_FALLBACK"
	}
	cost := int(kw * gridRate)
	return LiveSnapshot{
		FactoryID: factoryID, Timestamp: time.Now().UTC(), GridStatus: "HEALTHY", ActiveSource: "GRID",
		GridVoltage: volt, GridFrequency: freq, TotalKw: kw, PowerFactorAvg: 0.94,
		CostPerHourPkr: cost, HourlyWasteAvoided: int(float64(cost) * 0.28), DataSource: source,
	}
}

// snapshotFor returns real data, or simulated data only when simulation is explicitly allowed.
func snapshotFor(ctx context.Context, factoryID, window string, jitter bool) (LiveSnapshot, error) {
	peak, rate, found := factorySpec(ctx, factoryID)
	snap, err := queryInflux(ctx, factoryID, window, rate)
	if err == nil && snap != nil {
		return *snap, nil
	}
	if simulationAllowed() {
		return simulatedSnapshot(factoryID, peak, rate, found, jitter), nil
	}
	return LiveSnapshot{}, ErrSourceUnavailable
}

func LiveHandler(c *gin.Context) {
	factoryID := c.Param("id")
	if !factoryIDPattern.MatchString(factoryID) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid factory id"})
		return
	}
	snap, err := snapshotFor(c.Request.Context(), factoryID, "-1h", false)
	if err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "no recent telemetry available for this factory"})
		return
	}
	c.JSON(http.StatusOK, snap)
}

// PredictionsHandler: the outage forecast needs the ML service, which is not wired into this API yet.
// Until it is, only an explicit development simulation may return the sample schedule.
func PredictionsHandler(c *gin.Context) {
	if !simulationAllowed() {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "prediction service is not connected"})
		return
	}
	c.JSON(http.StatusOK, gin.H{
		"date":        time.Now().Format("2006-01-02"),
		"data_source": "SIMULATION_CALIBRATED",
		"predicted_outages": []gin.H{
			{"start": "11:00", "end": "13:30", "confidence": 0.91, "cause": "FESCO Scheduled Feeder Load Shedding (Historical Pattern)"},
			{"start": "18:00", "end": "20:15", "confidence": 0.84, "cause": "Evening Peak Deficit (>4,800 MW)"},
		},
		"recommendations": []gin.H{
			{"time": "07:00 - 10:45", "action": "RUN_HEAVY_LOAD", "reason": "Grid stable & cheap"},
			{"time": "10:59", "action": "PRE_EMPTIVE_SWITCH", "reason": "SwiftSwitch: start generator at T-12s"},
		},
		"estimated_saving_pkr": 184000,
	})
}

// authenticateWS accepts ONLY a single-use ?ticket= (browsers) or an Authorization: Bearer header
// (non-browser clients). A JWT in the URL is never accepted: URLs end up in logs, proxies and history.
func authenticateWS(c *gin.Context, factoryID string) bool {
	ctx := c.Request.Context()
	if ticket := c.Query("ticket"); ticket != "" {
		t, err := auth.GetWSTicketStore().Consume(ctx, ticket)
		return err == nil && t.Allows(factoryID)
	}
	if strings.HasPrefix(c.GetHeader("Authorization"), "Bearer ") {
		claims, err := auth.AuthenticateAccessToken(ctx, strings.TrimPrefix(c.GetHeader("Authorization"), "Bearer "))
		return err == nil && !claims.MustChangePassword && claims.HasFactory(factoryID)
	}
	return false
}

// WebSocket streams live telemetry for one factory.
func WebSocket(c *gin.Context) {
	factoryID := c.Param("id")
	if !factoryIDPattern.MatchString(factoryID) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid factory id"})
		return
	}
	if !authenticateWS(c, factoryID) {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized: a valid single-use ticket or bearer token is required"})
		return
	}
	// Decide availability BEFORE upgrading so a client never receives a fake stream.
	if _, err := snapshotFor(c.Request.Context(), factoryID, "-5m", true); err != nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "no recent telemetry available for this factory"})
		return
	}

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		log.Error().Err(err).Msg("Failed to upgrade WebSocket connection")
		return
	}
	defer conn.Close()

	ticker := time.NewTicker(streamEvery)
	defer ticker.Stop()
	for {
		snap, err := snapshotFor(c.Request.Context(), factoryID, "-5m", true)
		if err != nil {
			_ = conn.WriteControl(websocket.CloseMessage,
				websocket.FormatCloseMessage(websocket.CloseTryAgainLater, "telemetry unavailable"), time.Now().Add(time.Second))
			return
		}
		if conn.WriteJSON(snap) != nil {
			return
		}
		select {
		case <-c.Request.Context().Done():
			return
		case <-ticker.C:
		}
	}
}
