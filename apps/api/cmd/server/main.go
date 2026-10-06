package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"
	"github.com/wattwise/api/internal/auth"
	"github.com/wattwise/api/internal/billing"
	"github.com/wattwise/api/internal/config"
	"github.com/wattwise/api/internal/factory"
	"github.com/wattwise/api/internal/middleware"
	"github.com/wattwise/api/internal/telemetry"
)

func main() {
	// Configure Zerolog structured logging
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339})

	cfg := config.Load()
	log.Info().
		Str("env", cfg.Env).
		Str("port", cfg.Port).
		Str("region", cfg.Region).
		Bool("simulation_mode", cfg.IsSimulation).
		Msg("Starting WattWise Industrial Energy API Server (v1.0)...")

	if cfg.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	} else {
		gin.SetMode(gin.DebugMode)
	}

	r := gin.New()
	r.Use(gin.Recovery())

	// Configure CORS dynamically from environment
	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.CORSAllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Honest Health Check endpoint reporting real connection / simulation modes
	r.GET("/healthz", func(c *gin.Context) {
		pgStatus := "SIMULATION_MODE (IN_MEMORY)"
		if cfg.PostgresURL != "" {
			pgStatus = "CONFIGURED"
		}
		influxStatus := "SIMULATION_MODE (SYNTHETIC_GENERATOR)"
		if cfg.InfluxDBURL != "" {
			influxStatus = "CONFIGURED"
		}
		kafkaStatus := "SIMULATION_MODE (LOCAL_CHANNEL)"
		if cfg.KafkaBrokers != "" {
			kafkaStatus = "CONFIGURED"
		}

		overallStatus := "UP_SIMULATION"
		if !cfg.IsSimulation {
			overallStatus = "UP_PRODUCTION"
		}

		c.JSON(http.StatusOK, gin.H{
			"status":          overallStatus,
			"environment":     cfg.Env,
			"region":          cfg.Region,
			"simulation_mode": cfg.IsSimulation,
			"time":            time.Now().UTC(),
			"services": gin.H{
				"postgres": pgStatus,
				"influxdb": influxStatus,
				"kafka":    kafkaStatus,
			},
		})
	})

	// Public Auth routes
	authGroup := r.Group("/v1/auth")
	{
		authGroup.POST("/register", auth.Register)
		authGroup.POST("/login", auth.Login)
		authGroup.POST("/refresh", auth.Refresh)
	}

	// Protected API Routes — Enforces JWT Authentication
	api := r.Group("/v1", middleware.JWTAuth())
	{
		api.GET("/factories", factory.List)
		api.POST("/factories", factory.Create)

		// Factory-Specific Endpoints — Enforces Strict Multi-Tenant Isolation
		factoryGroup := api.Group("/factories/:id", middleware.RequireFactoryAccess())
		{
			factoryGroup.GET("", factory.GetByID)
			factoryGroup.GET("/nodes", factory.ListNodes)
			factoryGroup.GET("/telemetry/live", telemetry.LiveHandler)
			factoryGroup.GET("/predictions/schedule", telemetry.PredictionsHandler)
			factoryGroup.GET("/savings", billing.GetSavingsLedger)
			factoryGroup.GET("/invoices", billing.ListInvoices)
			factoryGroup.POST("/invoices/generate", billing.GenerateInvoice)
		}

		// Real-time WebSocket streaming
		api.GET("/ws/factories/:id", middleware.RequireFactoryAccess(), telemetry.WebSocket)
	}

	listenAddr := ":" + cfg.Port
	srv := &http.Server{
		Addr:         listenAddr,
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Info().Str("addr", listenAddr).Msg("WattWise API server started")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("Server failure")
		}
	}()

	// Graceful shutdown handling
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("Shutting down WattWise API server...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal().Err(err).Msg("Server forced to shutdown")
	}

	log.Info().Msg("WattWise API server exited cleanly")
}
