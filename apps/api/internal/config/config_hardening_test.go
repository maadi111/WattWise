package config

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func prodConfig() *Config {
	return &Config{
		Env: "production", PostgresURL: "postgresql://u:p@db.internal:5432/ww", RedisURL: "redis.internal:6379",
		Region: "me-south-1", InfluxDBURL: "http://influx.internal:8086", InfluxDBToken: "real-token-value",
		SellerNTN: "1234567-8", SellerSTRN: "0000000000001", EscrowBank: "Test Bank", EscrowIBAN: "PK00TEST0000000000000001",
		AdminEmail: "admin@company.pk", AdminPassword: "Zq9-vivid-harbor-lantern",
		CORSAllowedOrigins: []string{"https://app.company.pk"}, SalesTaxRate: 0.16, InvoiceDueDays: 15,
	}
}

func TestProductionBaselineIsValid(t *testing.T) {
	require.NoError(t, Validate(prodConfig()))
}

func TestProductionRejectsUnsafeSettings(t *testing.T) {
	cases := map[string]func(c *Config){
		"no influx (would serve fake telemetry)": func(c *Config) { c.InfluxDBURL = "" },
		"simulation mode":                        func(c *Config) { c.IsSimulation = true },
		"demo seed":                              func(c *Config) { c.SeedDemoData = true },
		"missing sales tax":                      func(c *Config) { c.SalesTaxRate = 0 },
		"sales tax of 16 instead of 0.16":        func(c *Config) { c.SalesTaxRate = 16 },
		"wildcard CORS":                          func(c *Config) { c.CORSAllowedOrigins = []string{"*"} },
		"placeholder admin pw (variant)":         func(c *Config) { c.AdminPassword = "ChangeThisStrongBootstrapPassword2027!!" },
		"placeholder influx token":               func(c *Config) { c.InfluxDBToken = "wattwise-dev-token" },
		"invalid AWS region":                     func(c *Config) { c.Region = "me-south-1-bahrain" },
	}
	for name, mutate := range cases {
		c := prodConfig()
		mutate(c)
		assert.Error(t, Validate(c), name)
	}
	for _, env := range []string{"staging"} {
		c := prodConfig()
		c.Env = env
		c.IsSimulation = true
		assert.Error(t, Validate(c), env+" is strict too")
	}
}

func TestJWTSecretIsNoLongerRequired(t *testing.T) {
	c := prodConfig()
	c.JWTSecret = nil
	assert.NoError(t, Validate(c), "access tokens are RS256-only; an unused HMAC secret must not be demanded")
}

func TestPlaceholderDetection(t *testing.T) {
	for _, s := range []string{"ChangeThisStrongBootstrapPassword2026!#", "changeme-please", "REPLACE_ME", "my-example-secret", "GENERATE_SECURE_RANDOM_ADMIN_PASSWORD_MIN_16_CHARS", "wattwise-dev-token-replace-in-prod"} {
		assert.True(t, IsPlaceholderSecret(s), s)
	}
	for _, s := range []string{"", "Zq9-vivid-harbor-lantern", "k3J!x9Lm2Qp7"} {
		assert.False(t, IsPlaceholderSecret(s), s)
	}
}

func TestStrictHelper(t *testing.T) {
	assert.True(t, (&Config{Env: "production"}).Strict())
	assert.True(t, (&Config{Env: "staging"}).Strict())
	assert.False(t, (&Config{Env: "development"}).Strict())
	assert.False(t, (&Config{Env: "test"}).Strict())
}
