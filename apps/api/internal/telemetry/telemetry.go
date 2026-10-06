package telemetry

import (
	"encoding/json"
	"math/rand"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
	"github.com/rs/zerolog/log"
)

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		return true // Allow React Vite origin
	},
}

type LiveSnapshot struct {
	FactoryID            string    `json:"factory_id"`
	Timestamp            time.Time `json:"timestamp"`
	GridStatus           string    `json:"grid_status"`
	ActiveSource         string    `json:"active_source"`
	GridVoltage          float64   `json:"grid_voltage"`
	GridFrequency        float64   `json:"grid_frequency"`
	TotalKw              float64   `json:"total_kw"`
	PowerFactorAvg       float64   `json:"power_factor_avg"`
	CostPerHourPkr       int       `json:"cost_per_hour_pkr"`
	HourlyWasteAvoided   int       `json:"hourly_waste_avoided_pkr"`
}

func LiveHandler(c *gin.Context) {
	factoryID := c.Param("id")
	snapshot := LiveSnapshot{
		FactoryID:          factoryID,
		Timestamp:          time.Now().UTC(),
		GridStatus:         "HEALTHY",
		ActiveSource:       "GRID",
		GridVoltage:        405.2,
		GridFrequency:      50.01,
		TotalKw:            847.3,
		PowerFactorAvg:     0.94,
		CostPerHourPkr:     27537,
		HourlyWasteAvoided: 52278,
	}
	c.JSON(http.StatusOK, snapshot)
}

func PredictionsHandler(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"date": time.Now().Format("2006-01-02"),
		"predicted_outages": []gin.H{
			{"start": "11:00", "end": "13:30", "confidence": 0.91, "cause": "FESCO Scheduled Feeder Load Shedding"},
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
		log.Error().Err(err).Msg("Failed to upgrade WebSocket")
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
			// Stream realistic micro-fluctuations
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
			}

			payload, _ := json.Marshal(packet)
			if err := conn.WriteMessage(websocket.TextMessage, payload); err != nil {
				log.Warn().Msg("Client disconnected from WebSocket")
				return
			}
		}
	}
}
