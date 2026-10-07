package config

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestValidateConfigSuccessDevelopment(t *testing.T) {
	cfg := &Config{
		Env:       "development",
		JWTSecret: []byte("dev-jwt-secret-key-32-bytes-long!"),
	}
	assert.NoError(t, Validate(cfg))
}

func TestValidateConfigRejectsMissingEnv(t *testing.T) {
	cfg := &Config{
		JWTSecret: []byte("secret"),
	}
	err := Validate(cfg)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "ENV environment variable is required")
}

func TestValidateConfigRejectsMissingProductionDB(t *testing.T) {
	cfg := &Config{
		Env:           "production",
		JWTSecret:     []byte("secret-key-long-enough-32-chars!"),
		RedisURL:      "redis.internal:6379",
		SellerNTN:     "1234567-8",
		SellerSTRN:    "12-34-5678-001-99",
		EscrowBank:    "Meezan Bank Ltd",
		EscrowIBAN:    "PK44MEZN0001234567890123",
		AdminEmail:    "admin@wattwise.pk",
		AdminPassword: "StrongPassword123!",
	}
	err := Validate(cfg)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "DATABASE_URL (or POSTGRES_URL) is required")
}

func TestValidateConfigRejectsMissingProductionRedis(t *testing.T) {
	cfg := &Config{
		Env:           "production",
		JWTSecret:     []byte("secret-key-long-enough-32-chars!"),
		PostgresURL:   "postgresql://user:pass@db.internal:5432/wattwise",
		SellerNTN:     "1234567-8",
		SellerSTRN:    "12-34-5678-001-99",
		EscrowBank:    "Meezan Bank Ltd",
		EscrowIBAN:    "PK44MEZN0001234567890123",
		AdminEmail:    "admin@wattwise.pk",
		AdminPassword: "StrongPassword123!",
	}
	err := Validate(cfg)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "REDIS_URL is required in production/staging")
}

func TestValidateConfigRejectsLocalhostCORSInProduction(t *testing.T) {
	cfg := &Config{
		Env:                "production",
		JWTSecret:          []byte("secret-key-long-enough-32-chars!"),
		PostgresURL:        "postgresql://user:pass@db.internal:5432/wattwise",
		RedisURL:           "redis.internal:6379",
		SellerNTN:          "1234567-8",
		SellerSTRN:         "12-34-5678-001-99",
		EscrowBank:         "Meezan Bank Ltd",
		EscrowIBAN:         "PK44MEZN0001234567890123",
		AdminEmail:         "admin@wattwise.pk",
		AdminPassword:      "StrongPassword123!",
		CORSAllowedOrigins: []string{"https://wattwise.pk", "http://localhost:5173"},
	}
	err := Validate(cfg)
	assert.Error(t, err)
	assert.Contains(t, err.Error(), "insecure localhost CORS origin")
}
