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
	IsSimulation       bool
}

var AppConfig *Config

func Load() *Config {
	env := getEnv("ENV", "development")
	jwtSecretStr := os.Getenv("JWT_SECRET")

	if jwtSecretStr == "" {
		if env == "production" {
			log.Fatal().Msg("FATAL: JWT_SECRET environment variable is required in production. Refusing to start.")
		}
		jwtSecretStr = "wattwise_super_secret_jwt_key_pakistan_2026"
		log.Warn().Msg("SECURITY WARNING: Using default development JWT secret. Set JWT_SECRET in production!")
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

	pgURL := os.Getenv("POSTGRES_URL")
	if pgURL == "" {
		pgURL = os.Getenv("DATABASE_URL")
	}
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
		SellerNTN:          getEnv("WATTWISE_SELLER_NTN", "9041284-7"),
		SellerSTRN:         getEnv("WATTWISE_SELLER_STRN", "3277876123456"),
		EscrowBank:         getEnv("WATTWISE_ESCROW_BANK", "Meezan Bank Ltd. (Islamic Corporate Banking)"),
		EscrowIBAN:         getEnv("WATTWISE_ESCROW_IBAN", "PK42MEZN0001000987654321"),
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
