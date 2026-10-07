package telemetry

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"
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
	DataSource         string    `json:"data_source"` // Explicitly notes simulation vs physical meter
}

func LiveHandler(c *gin.Context) {
	factoryID := c.Param("id")
	ctx := c.Request.Context()

	// 1. Look up factory specifications from PostgreSQL if available
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

	// 2. Query real physical meter readings from InfluxDB if connected
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

	// 3. Fallback: Baseline based on factory's actual parameters from DB
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

// WebSocket handles real-time bidirectional streaming to the React dashboard.
func WebSocket(c *gin.Context) {
	factoryID := c.Param("id")

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
		case <-ticker.C:
			// Stream realistic micro-fluctuations (calibrated simulation)
			noise := (rand.Float64() - 0.5) * 6.0
			kw := baseKw + noise

			packet := LiveSnapshot{
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

			payload, _ := json.Marshal(packet)
			if err := conn.WriteMessage(websocket.TextMessage, payload); err != nil {
				log.Warn().Msg("Client disconnected from WebSocket")
				return
			}
		}
	}
}
