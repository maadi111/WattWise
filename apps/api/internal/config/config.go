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

	jwtSecretStr := os.Getenv("JWT_SECRET")
	if jwtSecretStr == "" {
		log.Fatal().Msg("FATAL CONFIG: JWT_SECRET environment variable is required. Refusing to start.")
	}

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
	if len(cfg.JWTSecret) == 0 {
		return errors.New("JWT_SECRET environment variable is required")
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
		if cfg.AdminPassword == "ChangeThisStrongBootstrapPassword2026!#" || cfg.AdminPassword == "WattWise2026!#" || cfg.AdminPassword == "admin" || cfg.AdminPassword == "password123" {
			return errors.New("FATAL: default/example placeholder ADMIN_PASSWORD detected. You must set a unique strong admin password in production/staging.")
		}
		if len(cfg.CORSAllowedOrigins) == 0 {
			return errors.New("CORS_ALLOWED_ORIGINS is required in production/staging")
		}
		for _, o := range cfg.CORSAllowedOrigins {
			if cfg.Env == "production" && (strings.Contains(o, "localhost") || strings.Contains(o, "127.0.0.1")) {
				return fmt.Errorf("insecure localhost CORS origin '%s' strictly forbidden in production", o)
			}
		}
	}
	return nil
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
