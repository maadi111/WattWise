package fleet

import (
	"context"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

func TestClassifyAndDispatchEscalation(t *testing.T) {
	mgr := NewIncidentManager()
	ctx := context.Background()

	// SEV-1: Relay failure
	inc1 := mgr.ClassifyAndDispatch(ctx, "fsd_mill_001", "ATS transfer timeout", "Contactor feedback delayed", Sev1)
	assert.Equal(t, Sev1, inc1.Severity)
	assert.Equal(t, 15*time.Minute, inc1.SLAResponse)
	assert.NotEmpty(t, inc1.AssignedTo)
	assert.True(t, inc1.FailSafeHeld)

	// SEV-2: Sensor dropout
	inc2 := mgr.ClassifyAndDispatch(ctx, "slk_surg_002", "Modbus RS-485 loop disconnect", "PCC-02 node packet timeout", Sev2)
	assert.Equal(t, Sev2, inc2.Severity)
	assert.Equal(t, 1*time.Hour, inc2.SLAResponse)

	// Verify active retrieval
	active := mgr.GetActiveIncidents(ctx, "")
	assert.Len(t, active, 2)
}

func TestDailyFleetAuditDynamicStatus(t *testing.T) {
	// 1. All healthy -> OPERATIONAL
	allHealthy := []FactoryFleetHealth{
		{FactoryID: "fac_1", CustomerHealthScore: 95, SensorsTotal: 10, SensorsOnline: 10},
		{FactoryID: "fac_2", CustomerHealthScore: 90, SensorsTotal: 10, SensorsOnline: 10},
	}
	res1 := DailyFleetAudit(allHealthy)
	assert.Equal(t, "OPERATIONAL", res1["status"])
	assert.Equal(t, 1.0, res1["sensor_coverage"])

	// 2. Minor degradation -> DEGRADED
	degraded := []FactoryFleetHealth{
		{FactoryID: "fac_1", CustomerHealthScore: 95, SensorsTotal: 10, SensorsOnline: 10},
		{FactoryID: "fac_2", CustomerHealthScore: 80, SensorsTotal: 10, SensorsOnline: 10},
	}
	res2 := DailyFleetAudit(degraded)
	assert.Equal(t, "DEGRADED", res2["status"])

	// 3. Critical sensor dropout or low health -> CRITICAL
	critical := []FactoryFleetHealth{
		{FactoryID: "fac_1", CustomerHealthScore: 50, SensorsTotal: 10, SensorsOnline: 5},
	}
	res3 := DailyFleetAudit(critical)
	assert.Equal(t, "CRITICAL", res3["status"])
}
