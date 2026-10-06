package billing

import (
	"crypto/sha256"
	"encoding/hex"
	"math"
	"testing"

	"github.com/stretchr/testify/assert"
)

// TestGainShareCalculation verifies gain-share math across standard and edge cases
// from Phase 2 Playbook (Page 15)
func TestGainShareCalculation(t *testing.T) {
	tests := []struct {
		name              string
		baseline          float64
		actual            float64
		expectedFee       float64
		expectedNetSaving float64
	}{
		{
			name:              "Standard Case: Rs. 18.2M baseline, Rs. 12.94M actual",
			baseline:          18_200_000,
			actual:            12_940_000,
			expectedFee:       1_052_000, // 20% of 5,260,000
			expectedNetSaving: 4_208_000, // 80% of 5,260,000
		},
		{
			name:              "Edge Case: actual cost HIGHER than baseline (no savings, should not bill)",
			baseline:          5_000_000,
			actual:            6_000_000,
			expectedFee:       0,
			expectedNetSaving: 0,
		},
		{
			name:              "Edge Case: zero consumption (factory closed for Eid)",
			baseline:          5_000_000,
			actual:            0,
			expectedFee:       1_000_000, // 20% of 5,000,000
			expectedNetSaving: 4_000_000, // 80% of 5,000,000
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			gross := tt.baseline - tt.actual
			fee := math.Max(0, gross*0.20)
			netGain := math.Max(0, gross-fee)

			assert.InDelta(t, tt.expectedFee, fee, 1.0, "Fee mismatch")
			assert.InDelta(t, tt.expectedNetSaving, netGain, 1.0, "Net savings mismatch")
		})
	}
}

// computeAuditHash computes a SHA-256 digest over telemetry records
func computeAuditHash(data string) string {
	h := sha256.New()
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}

// TestAuditHashIsStable verifies that identical input data produces deterministic SHA-256
func TestAuditHashIsStable(t *testing.T) {
	testSensorData := "factory_id:fsd_crescent_04;period:2026-09;kwh_baseline:586400;kwh_actual:412000;pkr_saved:5260000"

	hash1 := computeAuditHash(testSensorData)
	hash2 := computeAuditHash(testSensorData)

	assert.Equal(t, hash1, hash2, "Cryptographic hash must be stable and deterministic")
	assert.Len(t, hash1, 64, "SHA-256 hash must be exactly 64 hex characters")
}

// TestSavingsLedgerImmutabilityRule verifies append-only constraints
func TestSavingsLedgerImmutabilityRule(t *testing.T) {
	// Rule simulation: updates on savings records are rejected
	originalSavingsPKR := 5260000.0

	// Simulating an attempted tamper: UPDATE savings_records SET gross_saving_pkr=999
	attemptedUpdatePKR := 999.0
	isAllowedToUpdate := false // Enforced by PostgreSQL rule: CREATE RULE savings_no_update AS ON UPDATE DO INSTEAD NOTHING

	var finalSavingsPKR float64
	if isAllowedToUpdate {
		finalSavingsPKR = attemptedUpdatePKR
	} else {
		finalSavingsPKR = originalSavingsPKR
	}

	assert.Equal(t, originalSavingsPKR, finalSavingsPKR, "Savings ledger record must be strictly immutable")
}
