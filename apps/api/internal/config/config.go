package config

import (
	"errors"
	"fmt"
	"os"
	"strconv"
	"strings"

	"github.com/rs/zerolog/log"
)

type Config struct {
	Port               string
	Env                string
	Region             string
	JWTSecret          []byte
	JWTExpiryMinutes   int
	CookieSecure       bool
	CORSAllowedOrigins []string
	PostgresURL        string
	RedisURL           string
	InfluxDBURL        string
	InfluxDBToken      string
	KafkaBrokers       string
	RateLimitRPM       int
	SellerNTN          string
	SellerSTRN         string
	EscrowBank         string
	EscrowIBAN         string
	AdminEmail         string
	AdminPassword      string
	IsSimulation       bool
	AdminFullName      string
	SalesTaxRate       float64 // fraction, e.g. 0.16; required in production/staging
	InvoiceDueDays     int
	SeedDemoData       bool // development-only sample data (SEED_DEMO_DATA=true)
}

var AppConfig *Config

func Load() *Config {
	env := os.Getenv("ENV")
	if env == "" {
		log.Fatal().Msg("FATAL CONFIG: ENV environment variable is required (must be 'development', 'staging', 'production', or 'test'). Refusing to start.")
	}
	if env != "production" && env != "staging" && env != "development" && env != "test" {
		log.Fatal().Msgf("FATAL CONFIG: Invalid ENV '%s'. Must be 'development', 'staging', 'production', or 'test'.", env)
	}

	// JWT_SECRET is optional and unused: access tokens are RS256-only (see auth.InitRSAKeys).
	jwtSecretStr := os.Getenv("JWT_SECRET")

	pgURL := os.Getenv("POSTGRES_URL")
	if pgURL == "" {
		pgURL = os.Getenv("DATABASE_URL")
	}

	sellerNTN := os.Getenv("WATTWISE_SELLER_NTN")
	sellerSTRN := os.Getenv("WATTWISE_SELLER_STRN")
	escrowBank := os.Getenv("WATTWISE_ESCROW_BANK")
	escrowIBAN := os.Getenv("WATTWISE_ESCROW_IBAN")
	adminEmail := os.Getenv("ADMIN_EMAIL")
	adminPassword := os.Getenv("ADMIN_PASSWORD")

	if env == "production" || env == "staging" {
		if pgURL == "" {
			log.Fatal().Msg("FATAL CONFIG: DATABASE_URL (or POSTGRES_URL) is required in production/staging. Refusing to start.")
		}
		if os.Getenv("REDIS_URL") == "" {
			log.Fatal().Msg("FATAL CONFIG: REDIS_URL is required in production/staging. Refusing to start.")
		}
		if os.Getenv("INFLUXDB_URL") != "" && os.Getenv("INFLUXDB_TOKEN") == "" {
			log.Fatal().Msg("FATAL CONFIG: INFLUXDB_TOKEN is required in production/staging when INFLUXDB_URL is set. Refusing to start.")
		}
		if sellerNTN == "" {
			log.Fatal().Msg("FATAL CONFIG: WATTWISE_SELLER_NTN is required in production/staging. Refusing to start.")
		}
		if sellerSTRN == "" {
			log.Fatal().Msg("FATAL CONFIG: WATTWISE_SELLER_STRN is required in production/staging. Refusing to start.")
		}
		if escrowBank == "" {
			log.Fatal().Msg("FATAL CONFIG: WATTWISE_ESCROW_BANK is required in production/staging. Refusing to start.")
		}
		if escrowIBAN == "" {
			log.Fatal().Msg("FATAL CONFIG: WATTWISE_ESCROW_IBAN is required in production/staging. Refusing to start.")
		}
		if adminEmail == "" || adminPassword == "" {
			log.Fatal().Msg("FATAL CONFIG: ADMIN_EMAIL and ADMIN_PASSWORD are required in production/staging for initial bootstrap. Refusing to start.")
		}
	} else {
		// Neutral development defaults (no real company details)
		if sellerNTN == "" {
			sellerNTN = "DEMO-NTN-0000000"
		}
		if sellerSTRN == "" {
			sellerSTRN = "DEMO-STRN-0000000"
		}
		if escrowBank == "" {
			escrowBank = "Demo Partner Bank"
		}
		if escrowIBAN == "" {
			escrowIBAN = "PK00DEMO0000000000000000"
		}
		if adminEmail == "" {
			adminEmail = "admin@wattwise.local"
		}
		if adminPassword == "" {
			adminPassword = "DevAdminPassword2026!"
		}
	}

	corsOrigins := os.Getenv("CORS_ALLOWED_ORIGINS")
	if corsOrigins == "" {
		if env == "production" || env == "staging" {
			log.Fatal().Msg("FATAL CONFIG: CORS_ALLOWED_ORIGINS is required in production/staging. Refusing to start.")
		}
		corsOrigins = "http://localhost:5173,http://127.0.0.1:5173,https://wattwise.pk"
	}
	originsList := strings.Split(corsOrigins, ",")
	for i := range originsList {
		originsList[i] = strings.TrimSpace(originsList[i])
		if env == "production" && (strings.Contains(originsList[i], "localhost") || strings.Contains(originsList[i], "127.0.0.1")) {
			log.Fatal().Msgf("FATAL CONFIG: Insecure localhost CORS origin '%s' strictly forbidden in production.", originsList[i])
		}
	}

	expiryMins, _ := strconv.Atoi(getEnv("JWT_EXPIRY_MINUTES", "15"))
	if expiryMins <= 0 {
		expiryMins = 15
	}

	cookieSecure := env == "production" || os.Getenv("COOKIE_SECURE") == "true"

	var redisURL string
	if env == "production" || env == "staging" {
		redisURL = os.Getenv("REDIS_URL")
	} else {
		redisURL = getEnv("REDIS_URL", "localhost:6379")
	}

	influxURL := os.Getenv("INFLUXDB_URL")
	var influxToken string
	if env == "production" || env == "staging" {
		influxToken = os.Getenv("INFLUXDB_TOKEN")
		if influxToken == "wattwise-dev-token" {
			log.Fatal().Msg("FATAL CONFIG: Influx token 'wattwise-dev-token' is a dev placeholder and strictly forbidden in production/staging.")
		}
	} else {
		influxToken = getEnv("INFLUXDB_TOKEN", "wattwise-dev-token")
	}

	awsRegion := os.Getenv("AWS_REGION")
	if awsRegion == "" {
		awsRegion = os.Getenv("REGION")
	}
	if (env == "production" || env == "staging") && (awsRegion == "" || awsRegion == "me-south-1-bahrain") {
		log.Fatal().Msg("FATAL CONFIG: AWS_REGION is required in production/staging (must be a valid AWS region like 'me-south-1'). Refusing to start.")
	}
	if awsRegion == "" {
		awsRegion = "me-south-1"
	}

	kafkaBrokers := os.Getenv("KAFKA_BROKERS")
	rateLimitRPM, _ := strconv.Atoi(getEnv("RATE_LIMIT_RPM", "20"))
	if rateLimitRPM <= 0 {
		rateLimitRPM = 20
	}

	isSim := pgURL == "" || os.Getenv("SIMULATION_MODE") == "true"

	strictEnv := env == "production" || env == "staging"
	salesTax := 0.0
	if raw := os.Getenv("SALES_TAX_RATE"); raw != "" {
		v, err := strconv.ParseFloat(raw, 64)
		if err != nil || v <= 0 || v >= 1 {
			log.Fatal().Msgf("FATAL CONFIG: SALES_TAX_RATE must be a fraction between 0 and 1 (got %q).", raw)
		}
		salesTax = v
	} else if !strictEnv {
		salesTax = 0.16
	}
	dueDays := 15
	if raw := os.Getenv("INVOICE_DUE_DAYS"); raw != "" {
		n, err := strconv.Atoi(raw)
		if err != nil || n < 1 || n > 365 {
			log.Fatal().Msgf("FATAL CONFIG: INVOICE_DUE_DAYS must be an integer between 1 and 365 (got %q).", raw)
		}
		dueDays = n
	}

	cfg := &Config{
		Port:               getEnv("PORT", "8080"),
		Env:                env,
		Region:             awsRegion,
		JWTSecret:          []byte(jwtSecretStr),
		JWTExpiryMinutes:   expiryMins,
		CookieSecure:       cookieSecure,
		CORSAllowedOrigins: originsList,
		PostgresURL:        pgURL,
		RedisURL:           redisURL,
		InfluxDBURL:        influxURL,
		InfluxDBToken:      influxToken,
		KafkaBrokers:       kafkaBrokers,
		RateLimitRPM:       rateLimitRPM,
		SellerNTN:          sellerNTN,
		SellerSTRN:         sellerSTRN,
		EscrowBank:         escrowBank,
		EscrowIBAN:         escrowIBAN,
		AdminEmail:         adminEmail,
		AdminPassword:      adminPassword,
		IsSimulation:       isSim,
		SalesTaxRate:       salesTax,
		AdminFullName:      getEnv("ADMIN_FULL_NAME", "Administrator"),
		InvoiceDueDays:     dueDays,
		SeedDemoData:       os.Getenv("SEED_DEMO_DATA") == "true",
	}

	if err := Validate(cfg); err != nil {
		log.Fatal().Err(err).Msg("FATAL CONFIG: Configuration validation failed")
	}

	AppConfig = cfg
	return cfg
}

// Validate verifies that configuration settings conform to production and security constraints.
func Validate(cfg *Config) error {
	if cfg == nil {
		return errors.New("config is nil")
	}
	if cfg.Env == "" {
		return errors.New("ENV environment variable is required")
	}
	if cfg.Env != "production" && cfg.Env != "staging" && cfg.Env != "development" && cfg.Env != "test" {
		return fmt.Errorf("invalid ENV '%s': must be development, staging, production, or test", cfg.Env)
	}
	if cfg.Env == "production" || cfg.Env == "staging" {
		if cfg.PostgresURL == "" {
			return errors.New("DATABASE_URL (or POSTGRES_URL) is required in production/staging")
		}
		if cfg.RedisURL == "" {
			return errors.New("REDIS_URL is required in production/staging")
		}
		if cfg.Region == "" || cfg.Region == "me-south-1-bahrain" {
			return errors.New("valid AWS_REGION (e.g. 'me-south-1') is required in production/staging")
		}
		if cfg.InfluxDBURL != "" && (cfg.InfluxDBToken == "" || cfg.InfluxDBToken == "wattwise-dev-token") {
			return errors.New("valid INFLUXDB_TOKEN is required in production/staging when INFLUXDB_URL is set")
		}
		if cfg.SellerNTN == "" || cfg.SellerSTRN == "" || cfg.EscrowBank == "" || cfg.EscrowIBAN == "" {
			return errors.New("financial credentials (NTN, STRN, Escrow Bank, IBAN) are required in production/staging")
		}
		if cfg.AdminEmail == "" || cfg.AdminPassword == "" {
			return errors.New("ADMIN_EMAIL and ADMIN_PASSWORD are required in production/staging for initial bootstrap")
		}
		if IsPlaceholderSecret(cfg.AdminPassword) || cfg.AdminPassword == "WattWise2026!#" || cfg.AdminPassword == "admin" || cfg.AdminPassword == "password123" {
			return errors.New("FATAL: default/example placeholder ADMIN_PASSWORD detected. You must set a unique strong admin password in production/staging.")
		}
		if len(cfg.CORSAllowedOrigins) == 0 {
			return errors.New("CORS_ALLOWED_ORIGINS is required in production/staging")
		}
		for _, o := range cfg.CORSAllowedOrigins {
			if cfg.Env == "production" && (strings.Contains(o, "localhost") || strings.Contains(o, "127.0.0.1")) {
				return fmt.Errorf("insecure localhost CORS origin '%s' strictly forbidden in production", o)
			}
			if o == "*" {
				return errors.New("wildcard CORS origin '*' is not allowed in production/staging")
			}
		}
		// Real telemetry is the product: refuse to run without its source instead of serving simulated data.
		if cfg.InfluxDBURL == "" {
			return errors.New("INFLUXDB_URL is required in production/staging (no simulated telemetry is served)")
		}
		if cfg.IsSimulation {
			return errors.New("SIMULATION_MODE=true is not allowed in production/staging")
		}
		if cfg.SeedDemoData {
			return errors.New("SEED_DEMO_DATA=true is not allowed in production/staging")
		}
		if cfg.SalesTaxRate <= 0 || cfg.SalesTaxRate >= 1 {
			return errors.New("SALES_TAX_RATE (a fraction between 0 and 1) is required in production/staging")
		}
		if cfg.InvoiceDueDays < 1 {
			return errors.New("INVOICE_DUE_DAYS must be at least 1 in production/staging")
		}
	}
	return nil
}

// Strict reports whether production-grade rules apply (production and staging).
func (c *Config) Strict() bool { return c.Env == "production" || c.Env == "staging" }

// IsPlaceholderSecret reports whether a secret looks like a copy-pasted template value.
func IsPlaceholderSecret(s string) bool {
	l := strings.ToLower(strings.TrimSpace(s))
	if l == "" {
		return false
	}
	for _, m := range []string{"changethis", "change-me", "changeme", "replace_me", "replace-me", "replace-in", "replace_in", "generate_secure", "your-password", "dev-token", "example"} {
		if strings.Contains(l, m) {
			return true
		}
	}
	return false
}

func getEnv(key, defaultVal string) string {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	return val
}

func IsOriginAllowed(origin string, allowed []string) bool {
	if origin == "" {
		return true
	}
	for _, o := range allowed {
		if o == "*" || strings.EqualFold(o, origin) {
			return true
		}
	}
	return false
}
