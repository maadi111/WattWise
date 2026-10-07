package auth

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestArgon2idPasswordHashingAndVerification(t *testing.T) {
	password := "WattWise2026!#StrongIndustrialKey"

	hash, err := HashPassword(password)
	require.NoError(t, err)
	assert.NotEmpty(t, hash)
	assert.Contains(t, hash, "$argon2id$")

	// Valid password check
	valid, err := VerifyPassword(password, hash)
	require.NoError(t, err)
	assert.True(t, valid, "Argon2id must successfully verify the original password")

	// Invalid password check
	wrongValid, err := VerifyPassword("WrongPassword123!", hash)
	require.NoError(t, err)
	assert.False(t, wrongValid, "Argon2id must reject incorrect passwords")
}

func TestRS256TokenIssuanceAndVerification(t *testing.T) {
	InitRSAKeys()
	privKey := GetRSAPrivateKey()
	pubKey := GetRSAPublicKey()
	require.NotNil(t, privKey, "RSA private key must be initialized")
	require.NotNil(t, pubKey, "RSA public key must be initialized")

	claims := CustomClaims{
		UserID:             "user-fsd-101",
		Email:              "manager@crescentmills.com.pk",
		Role:               "factory_manager",
		TenantID:           "fsd_mill_001",
		FactoryIDs:         []string{"fsd_mill_001"},
		MustChangePassword: false,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "wattwise.pk",
			Subject:   "user-fsd-101",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	tokenStr, err := token.SignedString(privKey)
	require.NoError(t, err, "RS256 signing must succeed")
	assert.NotEmpty(t, tokenStr)

	// Parse and verify token using public key
	parsedToken, err := jwt.ParseWithClaims(
		tokenStr,
		&CustomClaims{},
		func(token *jwt.Token) (interface{}, error) {
			if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			return pubKey, nil
		},
		jwt.WithValidMethods([]string{"RS256"}),
	)

	require.NoError(t, err)
	assert.True(t, parsedToken.Valid)
	parsedClaims, ok := parsedToken.Claims.(*CustomClaims)
	require.True(t, ok)
	assert.Equal(t, "user-fsd-101", parsedClaims.UserID)
	assert.Equal(t, "factory_manager", parsedClaims.Role)
	assert.Equal(t, "fsd_mill_001", parsedClaims.TenantID)
	assert.False(t, parsedClaims.MustChangePassword)
}

func TestCustomClaimsFactoryAccess(t *testing.T) {
	// Super admin has universal access
	adminClaims := CustomClaims{
		UserID: "admin-1",
		Role:   "super_admin",
	}
	assert.True(t, adminClaims.HasFactory("any_factory_123"))

	// Manager with explicit factory
	managerClaims := CustomClaims{
		UserID:     "manager-1",
		Role:       "factory_manager",
		FactoryIDs: []string{"fsd_mill_001", "slk_surg_002"},
	}
	assert.True(t, managerClaims.HasFactory("fsd_mill_001"))
	assert.True(t, managerClaims.HasFactory("slk_surg_002"))
	assert.False(t, managerClaims.HasFactory("lhr_steel_003"))

	// Viewer with single tenant ID
	viewerClaims := CustomClaims{
		UserID:   "viewer-1",
		Role:     "viewer",
		TenantID: "fsd_mill_001",
	}
	assert.True(t, viewerClaims.HasFactory("fsd_mill_001"))
	assert.False(t, viewerClaims.HasFactory("slk_surg_002"))
}
