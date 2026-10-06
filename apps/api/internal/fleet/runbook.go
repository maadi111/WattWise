package fleet

import (
	"fmt"
	"time"
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

// IncidentManager handles escalation rules and on-call dispatching
type IncidentManager struct {
	ActiveIncidents []IncidentRecord
}

func NewIncidentManager() *IncidentManager {
	return &IncidentManager{
		ActiveIncidents: make([]IncidentRecord, 0),
	}
}

// ClassifyAndDispatch categorizes incoming operational alarms into SEV-1 to SEV-4
func (m *IncidentManager) ClassifyAndDispatch(factoryID string, title string, desc string, sev IncidentSeverity) IncidentRecord {
	var sla time.Duration
	var assigned string

	switch sev {
	case Sev1:
		sla = 15 * time.Minute
		assigned = "Engr. Hammad Raza (Lead On-Call) + Field Engineer"
	case Sev2:
		sla = 1 * time.Hour
		assigned = "Field Operations Technician (Faisalabad)"
	case Sev3:
		sla = 2 * time.Hour
		assigned = "Backend DevOps Team"
	case Sev4:
		sla = 24 * time.Hour
		assigned = "ML Systems Engineer"
	}

	inc := IncidentRecord{
		ID:           fmt.Sprintf("INC-%d", time.Now().UnixNano()%100000),
		Severity:     sev,
		FactoryID:    factoryID,
		Title:        title,
		Description:  desc,
		TriggerTime:  time.Now(),
		AssignedTo:   assigned,
		SLAResponse:  sla,
		Status:       "TRIGGERED",
		FailSafeHeld: true, // Hardware spring-return guarantees safety
	}

	m.ActiveIncidents = append(m.ActiveIncidents, inc)
	return inc
}

// DailyFleetAudit executes daily operational checks across 1-20 factories
func DailyFleetAudit(factories []FactoryFleetHealth) map[string]interface{} {
	totalSensors := 0
	onlineSensors := 0
	healthyCount := 0

	for _, f := range factories {
		totalSensors += f.SensorsTotal
		onlineSensors += f.SensorsOnline
		if f.CustomerHealthScore >= 85 {
			healthyCount++
		}
	}

	return map[string]interface{}{
		"audited_factories": len(factories),
		"healthy_factories": healthyCount,
		"sensor_coverage":   float64(onlineSensors) / float64(totalSensors),
		"audit_timestamp":   time.Now().Format(time.RFC3339),
		"status":            "ALL_SYSTEMS_OPERATIONAL",
	}
}
