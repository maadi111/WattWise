package config

import (
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
		log.Fatal().Msg("FATAL CONFIG: ENV environment variable is required (must be 'development', 'staging', or 'production'). Refusing to start.")
	}
	if env != "production" && env != "staging" && env != "development" {
		log.Fatal().Msgf("FATAL CONFIG: Invalid ENV '%s'. Must be 'development', 'staging', or 'production'.", env)
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

	corsOrigins := getEnv("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173,https://wattwise.pk")
	originsList := strings.Split(corsOrigins, ",")
	for i := range originsList {
		originsList[i] = strings.TrimSpace(originsList[i])
	}

	expiryMins, _ := strconv.Atoi(getEnv("JWT_EXPIRY_MINUTES", "15"))
	if expiryMins <= 0 {
		expiryMins = 15
	}

	cookieSecure := env == "production" || os.Getenv("COOKIE_SECURE") == "true"
	redisURL := getEnv("REDIS_URL", "localhost:6379")
	influxURL := os.Getenv("INFLUXDB_URL")
	influxToken := getEnv("INFLUXDB_TOKEN", "wattwise-dev-token")
	kafkaBrokers := os.Getenv("KAFKA_BROKERS")
	rateLimitRPM, _ := strconv.Atoi(getEnv("RATE_LIMIT_RPM", "20"))
	if rateLimitRPM <= 0 {
		rateLimitRPM = 20
	}

	isSim := pgURL == "" || os.Getenv("SIMULATION_MODE") == "true"

	cfg := &Config{
		Port:               getEnv("PORT", "8080"),
		Env:                env,
		Region:             getEnv("AWS_REGION", getEnv("REGION", "me-south-1-bahrain")),
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

	AppConfig = cfg
	return cfg
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
