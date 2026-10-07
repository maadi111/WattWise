package db

import (
	"context"
	"database/sql"
	"fmt"
	"net"
	"strings"
	"time"

	influxdb2 "github.com/influxdata/influxdb-client-go/v2"
	_ "github.com/lib/pq"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog/log"
	"github.com/segmentio/kafka-go"

	"github.com/wattwise/api/internal/config"
)

type Clients struct {
	DB           *sql.DB
	Redis        *redis.Client
	Influx       influxdb2.Client
	KafkaBrokers string
}

var GlobalClients = &Clients{}

// Init initializes connections to PostgreSQL, Redis, InfluxDB, and Kafka
func Init(ctx context.Context, cfg *config.Config) error {
	GlobalClients.KafkaBrokers = cfg.KafkaBrokers

	// 1. PostgreSQL
	if cfg.PostgresURL != "" {
		log.Info().Msg("Connecting to PostgreSQL database...")
		dbConn, err := sql.Open("postgres", cfg.PostgresURL)
		if err != nil {
			log.Warn().Err(err).Msg("Failed to open PostgreSQL connection")
		} else {
			dbConn.SetMaxOpenConns(25)
			dbConn.SetMaxIdleConns(5)
			dbConn.SetConnMaxLifetime(5 * time.Minute)

			pingCtx, cancel := context.WithTimeout(ctx, 3*time.Second)
			if err := dbConn.PingContext(pingCtx); err != nil {
				cancel()
				if cfg.Env == "production" || cfg.Env == "staging" {
					return fmt.Errorf("FATAL: PostgreSQL ping failed in %s environment: %w", cfg.Env, err)
				}
				log.Warn().Err(err).Msg("PostgreSQL ping failed (running in simulation/unconnected mode)")
			} else {
				cancel()
				GlobalClients.DB = dbConn
				log.Info().Msg("Connected to PostgreSQL successfully.")

				// Run migrations — must be fatal if it fails
				if err := RunMigrations(ctx, dbConn); err != nil {
					return fmt.Errorf("FATAL: failed to run PostgreSQL migrations: %w", err)
				}
			}
		}
	} else {
		if cfg.Env == "production" || cfg.Env == "staging" {
			return fmt.Errorf("FATAL: POSTGRES_URL required in %s environment", cfg.Env)
		}
		log.Info().Msg("POSTGRES_URL not provided; running with in-memory persistence")
	}

	// 2. Redis
	redisURL := cfg.RedisURL
	if redisURL == "" {
		if cfg.Env == "production" || cfg.Env == "staging" {
			return fmt.Errorf("FATAL: REDIS_URL required in %s environment", cfg.Env)
		}
		redisURL = "localhost:6379"
	}
	rdb := redis.NewClient(&redis.Options{
		Addr: redisURL,
	})
	pingCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
	if err := rdb.Ping(pingCtx).Err(); err != nil {
		cancel()
		if cfg.Env == "production" || cfg.Env == "staging" {
			return fmt.Errorf("FATAL: Redis ping failed at %s in %s environment: %w", redisURL, cfg.Env, err)
		}
		log.Warn().Err(err).Msgf("Redis unavailable at %s; refresh token rotation running with in-memory store", redisURL)
	} else {
		cancel()
		GlobalClients.Redis = rdb
		log.Info().Msgf("Connected to Redis successfully at %s", redisURL)
	}

	// 3. InfluxDB
	if cfg.InfluxDBURL != "" {
		token := cfg.InfluxDBToken
		if token == "" {
			if cfg.Env == "production" || cfg.Env == "staging" {
				return fmt.Errorf("FATAL: INFLUXDB_TOKEN required in %s environment", cfg.Env)
			}
			token = "wattwise-dev-token"
		}
		influxClient := influxdb2.NewClient(cfg.InfluxDBURL, token)
		pingCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
		ready, err := influxClient.Ping(pingCtx)
		cancel()
		if err != nil || !ready {
			if cfg.Env == "production" || cfg.Env == "staging" {
				return fmt.Errorf("FATAL: InfluxDB ping failed at %s in %s environment: %w", cfg.InfluxDBURL, cfg.Env, err)
			}
			log.Warn().Err(err).Msg("InfluxDB ping failed; using simulated telemetry")
		} else {
			GlobalClients.Influx = influxClient
			log.Info().Msg("Connected to InfluxDB v2 successfully.")
		}
	}

	return nil
}

// DependencyStatus contains real connection health results
type DependencyStatus struct {
	Postgres string `json:"postgres"`
	Redis    string `json:"redis"`
	InfluxDB string `json:"influxdb"`
	Kafka    string `json:"kafka"`
	AllReady bool   `json:"all_ready"`
}

// CheckReadiness checks real active socket connections
func CheckReadiness(ctx context.Context) DependencyStatus {
	status := DependencyStatus{
		Postgres: "DISCONNECTED",
		Redis:    "DISCONNECTED",
		InfluxDB: "DISCONNECTED",
		Kafka:    "DISCONNECTED",
		AllReady: true,
	}

	// Check Postgres
	if GlobalClients.DB != nil {
		pingCtx, cancel := context.WithTimeout(ctx, 2*time.Second)
		defer cancel()
		if err := GlobalClients.DB.PingContext(pingCtx); err == nil {
			status.Postgres = "CONNECTED"
		} else {
			status.Postgres = fmt.Sprintf("DEGRADED: %v", err)
			status.AllReady = false
		}
	} else {
		status.Postgres = "NOT_CONFIGURED"
		status.AllReady = false
	}

	// Check Redis
	if GlobalClients.Redis != nil {
		pingCtx, cancel := context.WithTimeout(ctx, 1*time.Second)
		defer cancel()
		if err := GlobalClients.Redis.Ping(pingCtx).Err(); err == nil {
			status.Redis = "CONNECTED"
		} else {
			status.Redis = fmt.Sprintf("DEGRADED: %v", err)
		}
	} else {
		status.Redis = "MEMORY_FALLBACK"
	}

	// Check InfluxDB
	if GlobalClients.Influx != nil {
		pingCtx, cancel := context.WithTimeout(ctx, 1*time.Second)
		defer cancel()
		if ready, err := GlobalClients.Influx.Ping(pingCtx); err == nil && ready {
			status.InfluxDB = "CONNECTED"
		} else {
			status.InfluxDB = "DEGRADED"
			status.AllReady = false
		}
	} else {
		status.InfluxDB = "NOT_CONFIGURED"
		status.AllReady = false
	}

	// Check Kafka
	if GlobalClients.KafkaBrokers != "" {
		brokers := strings.Split(GlobalClients.KafkaBrokers, ",")
		if len(brokers) > 0 {
			broker := strings.TrimSpace(brokers[0])
			conn, err := net.DialTimeout("tcp", broker, 1*time.Second)
			if err == nil {
				conn.Close()
				status.Kafka = "CONNECTED"
			} else {
				// Try kafka dialer
				kConn, kErr := kafka.DialContext(ctx, "tcp", broker)
				if kErr == nil {
					kConn.Close()
					status.Kafka = "CONNECTED"
				} else {
					status.Kafka = fmt.Sprintf("UNREACHABLE: %v", err)
					status.AllReady = false
				}
			}
		}
	} else {
		status.Kafka = "NOT_CONFIGURED"
		status.AllReady = false
	}

	return status
}
