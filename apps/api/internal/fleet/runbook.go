package fleet

import (
	"context"
	"fmt"
	"os"
	"time"

	"github.com/rs/zerolog/log"
	"github.com/wattwise/api/internal/db"
)

// IncidentSeverity defines operational severity levels from Phase 3 Playbook (Section 04)
type IncidentSeverity string

const (
	Sev1 IncidentSeverity = "SEV-1" // Production-impacting relay issue (Immediate human response < 15m)
	Sev2 IncidentSeverity = "SEV-2" // Critical sensor dropout / Modbus loop disconnect (< 1h)
	Sev3 IncidentSeverity = "SEV-3" // Dashboard or WebSocket outage (< 2h)
	Sev4 IncidentSeverity = "SEV-4" // Degraded ML accuracy or model drift (< 24h)
)

// IncidentRecord represents an active operational event
type IncidentRecord struct {
	ID           string           `json:"id"`
	Severity     IncidentSeverity `json:"severity"`
	FactoryID    string           `json:"factory_id"`
	Title        string           `json:"title"`
	Description  string           `json:"description"`
	TriggerTime  time.Time        `json:"trigger_time"`
	AssignedTo   string           `json:"assigned_to"`
	SLAResponse  time.Duration    `json:"sla_response"`
	Status       string           `json:"status"` // TRIGGERED | ACKNOWLEDGED | MITIGATED | RESOLVED
	FailSafeHeld bool             `json:"fail_safe_held"`
}

// OnCallConfig defines dynamic escalation assignees (P1-1)
type OnCallConfig struct {
	Sev1 string `json:"sev1"`
	Sev2 string `json:"sev2"`
	Sev3 string `json:"sev3"`
	Sev4 string `json:"sev4"`
}

func LoadOnCallConfig() OnCallConfig {
	return OnCallConfig{
		Sev1: getEnv("ONCALL_SEV1_ASSIGNEE", "Engr. Hammad Raza (Lead On-Call) + Field Engineer"),
		Sev2: getEnv("ONCALL_SEV2_ASSIGNEE", "Field Operations Technician (Faisalabad Cluster)"),
		Sev3: getEnv("ONCALL_SEV3_ASSIGNEE", "Backend DevOps & Infrastructure Team"),
		Sev4: getEnv("ONCALL_SEV4_ASSIGNEE", "ML Systems & Outage Model Engineer"),
	}
}

func getEnv(key, defVal string) string {
	if val := os.Getenv(key); val != "" {
		return val
	}
	return defVal
}

// FactoryFleetHealth represents the operational telemetry health of a monitored mill
type FactoryFleetHealth struct {
	FactoryID           string    `json:"factory_id"`
	FactoryName         string    `json:"factory_name"`
	City                string    `json:"city"`
	EdgeControllerID    string    `json:"edge_controller_id"`
	SensorsOnline       int       `json:"sensors_online"`
	SensorsTotal        int       `json:"sensors_total"`
	LastHeartbeat       time.Time `json:"last_heartbeat"`
	KafkaLagMessages    int64     `json:"kafka_lag_messages"`
	GOPAccuracy24h      float64   `json:"gop_accuracy_24h"`
	ActiveSwitchover    bool      `json:"active_switchover"`
	CustomerHealthScore int       `json:"customer_health_score"` // 0-100
}

// IncidentManager handles escalation rules and on-call dispatching (P1-2: Persisted to Postgres)
type IncidentManager struct {
	ActiveIncidents []IncidentRecord
	OnCall          OnCallConfig
}

func NewIncidentManager() *IncidentManager {
	return &IncidentManager{
		ActiveIncidents: make([]IncidentRecord, 0),
		OnCall:          LoadOnCallConfig(),
	}
}

// ClassifyAndDispatch categorizes incoming alarms into SEV-1 to SEV-4 and persists to PostgreSQL
func (m *IncidentManager) ClassifyAndDispatch(ctx context.Context, factoryID string, title string, desc string, sev IncidentSeverity) IncidentRecord {
	var sla time.Duration
	var assigned string

	switch sev {
	case Sev1:
		sla = 15 * time.Minute
		assigned = m.OnCall.Sev1
	case Sev2:
		sla = 1 * time.Hour
		assigned = m.OnCall.Sev2
	case Sev3:
		sla = 2 * time.Hour
		assigned = m.OnCall.Sev3
	case Sev4:
		sla = 24 * time.Hour
		assigned = m.OnCall.Sev4
	}

	inc := IncidentRecord{
		ID:           fmt.Sprintf("INC-%d", time.Now().UnixNano()%100000),
		Severity:     sev,
		FactoryID:    factoryID,
		Title:        title,
		Description:  desc,
		TriggerTime:  time.Now().UTC(),
		AssignedTo:   assigned,
		SLAResponse:  sla,
		Status:       "TRIGGERED",
		FailSafeHeld: true, // Hardware spring-return guarantees safety
	}

	// P1-2: Persist incident record to PostgreSQL database
	if db.GlobalClients.DB != nil {
		query := `
			INSERT INTO incidents (id, severity, factory_id, title, description, trigger_time, assigned_to, sla_response_sec, status, fail_safe_held)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
		`
		_, err := db.GlobalClients.DB.ExecContext(
			ctx, query,
			inc.ID, string(inc.Severity), inc.FactoryID, inc.Title, inc.Description,
			inc.TriggerTime, inc.AssignedTo, int(inc.SLAResponse.Seconds()), inc.Status, inc.FailSafeHeld,
		)
		if err != nil {
			log.Error().Err(err).Str("incident_id", inc.ID).Msg("Failed to persist incident to PostgreSQL")
		} else {
			log.Info().Str("incident_id", inc.ID).Str("sev", string(inc.Severity)).Str("assigned_to", inc.AssignedTo).Msg("Incident persisted to PostgreSQL")
		}
	}

	m.ActiveIncidents = append(m.ActiveIncidents, inc)
	return inc
}

// GetActiveIncidents retrieves active unresolved incidents from PostgreSQL or memory
func (m *IncidentManager) GetActiveIncidents(ctx context.Context, factoryID string) []IncidentRecord {
	if db.GlobalClients.DB != nil {
		query := `
			SELECT id, severity, factory_id, title, description, trigger_time, assigned_to, sla_response_sec, status, fail_safe_held
			FROM incidents
			WHERE ($1 = '' OR factory_id = $1) AND status != 'RESOLVED'
			ORDER BY trigger_time DESC
		`
		rows, err := db.GlobalClients.DB.QueryContext(ctx, query, factoryID)
		if err == nil {
			defer rows.Close()
			var records []IncidentRecord
			for rows.Next() {
				var r IncidentRecord
				var sevStr string
				var slaSec int
				if scanErr := rows.Scan(
					&r.ID, &sevStr, &r.FactoryID, &r.Title, &r.Description,
					&r.TriggerTime, &r.AssignedTo, &slaSec, &r.Status, &r.FailSafeHeld,
				); scanErr == nil {
					r.Severity = IncidentSeverity(sevStr)
					r.SLAResponse = time.Duration(slaSec) * time.Second
					records = append(records, r)
				}
			}
			return records
		}
	}

	var active []IncidentRecord
	for _, inc := range m.ActiveIncidents {
		if (factoryID == "" || inc.FactoryID == factoryID) && inc.Status != "RESOLVED" {
			active = append(active, inc)
		}
	}
	return active
}

// DailyFleetAudit executes daily operational checks across 1-20 factories (P2-3: dynamically derived status)
func DailyFleetAudit(factories []FactoryFleetHealth) map[string]interface{} {
	totalSensors := 0
	onlineSensors := 0
	healthyCount := 0
	criticalCount := 0

	for _, f := range factories {
		totalSensors += f.SensorsTotal
		onlineSensors += f.SensorsOnline
		if f.CustomerHealthScore >= 85 {
			healthyCount++
		} else if f.CustomerHealthScore < 60 {
			criticalCount++
		}
	}

	sensorCoverage := 1.0
	if totalSensors > 0 {
		sensorCoverage = float64(onlineSensors) / float64(totalSensors)
	}

	// P2-3: Dynamic status derivation
	status := "OPERATIONAL"
	if len(factories) > 0 {
		if criticalCount > 0 || sensorCoverage < 0.70 {
			status = "CRITICAL"
		} else if healthyCount < len(factories) || sensorCoverage < 0.90 {
			status = "DEGRADED"
		}
	}

	return map[string]interface{}{
		"audited_factories": len(factories),
		"healthy_factories": healthyCount,
		"sensor_coverage":   sensorCoverage,
		"audit_timestamp":   time.Now().UTC().Format(time.RFC3339),
		"status":            status,
	}
}
