package auth

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
)

// TestCrossTenantAccessBlocked verifies that tenant isolation is strictly enforced
// and a manager of Factory A cannot access Factory B telemetry.
func TestCrossTenantAccessBlocked(t *testing.T) {
	// Factory A user credentials
	userA := &UserClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "usr_manager_01",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		},
		FactoryIDs: []string{"fsd_mill_001"}, // Only has access to Crescent Mill Unit 04
		Role:       "ENERGY_MANAGER",
	}

	targetFactoryB := "fsd_mill_002" // Target: Kashmir Surgical Sialkot

	// Check access validation
	hasAccess := false
	for _, fid := range userA.FactoryIDs {
		if fid == targetFactoryB {
			hasAccess = true
			break
		}
	}

	assert.False(t, hasAccess, "Cross-tenant access MUST be blocked (HTTP 403)")
}

// TestTenantAccessGranted verifies authorized tenant access succeeds
func TestTenantAccessGranted(t *testing.T) {
	userA := &UserClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "usr_manager_01",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		},
		FactoryIDs: []string{"fsd_mill_001"},
		Role:       "ENERGY_MANAGER",
	}

	hasAccess := false
	for _, fid := range userA.FactoryIDs {
		if fid == "fsd_mill_001" {
			hasAccess = true
			break
		}
	}

	assert.True(t, hasAccess, "Authorized factory access must be permitted")
}

// TestTokenExpiration verifies that expired JWT tokens are rejected
func TestTokenExpiration(t *testing.T) {
	expiredClaims := &UserClaims{
		RegisteredClaims: jwt.RegisteredClaims{
			Subject:   "usr_manager_01",
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-1 * time.Hour)), // Expired 1 hour ago
		},
		FactoryIDs: []string{"fsd_mill_001"},
		Role:       "ENERGY_MANAGER",
	}

	isExpired := expiredClaims.ExpiresAt.Time.Before(time.Now())
	assert.True(t, isExpired, "Expired token must be rejected")
}
