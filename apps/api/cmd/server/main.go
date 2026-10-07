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
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"github.com/rs/zerolog"
	"github.com/rs/zerolog/log"

	"github.com/wattwise/api/internal/auth"
	"github.com/wattwise/api/internal/billing"
	"github.com/wattwise/api/internal/config"
	"github.com/wattwise/api/internal/db"
	"github.com/wattwise/api/internal/factory"
	"github.com/wattwise/api/internal/ingest"
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

	// Initialize RS256 Asymmetric Keys
	auth.InitRSAKeys()

	// Initialize Database, Redis, InfluxDB, Kafka
	bgCtx, bgCancel := context.WithCancel(context.Background())
	defer bgCancel()

	if err := db.Init(bgCtx, cfg); err != nil {
		log.Error().Err(err).Msg("Database initialization warning")
	}

	// Initialize User Repository and Token Store
	auth.InitUserRepository(db.GlobalClients.DB)
	if db.GlobalClients.DB != nil {
		if err := auth.BootstrapInitialAdmin(bgCtx, cfg.AdminEmail, cfg.AdminPassword, "Muhammad Hammad Latif (System Administrator)"); err != nil {
			log.Warn().Err(err).Msg("Admin bootstrapping check failed")
		}
	}
	if db.GlobalClients.Redis != nil {
		auth.SetGlobalTokenStore(auth.NewRedisTokenStore(db.GlobalClients.Redis))
		log.Info().Msg("Configured Redis-backed refresh token rotation store.")
	}


	// Start MQTT -> Kafka -> InfluxDB ingestion pipeline
	ingestPipeline := ingest.StartPipeline(bgCtx, cfg)

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

	// Liveness Probe (/healthz)
	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":      "HEALTHY",
			"uptime_sec":  time.Now().Unix(),
			"version":     "v1.0.0",
			"environment": cfg.Env,
		})
	})

	// Readiness Probe (/readyz) — Actually pings Postgres, Redis, InfluxDB, and Kafka
	r.GET("/readyz", func(c *gin.Context) {
		status := db.CheckReadiness(c.Request.Context())
		httpStatus := http.StatusOK
		if !status.AllReady && cfg.Env == "production" {
			httpStatus = http.StatusServiceUnavailable
		}
		c.JSON(httpStatus, gin.H{
			"ready":           status.AllReady,
			"environment":     cfg.Env,
			"region":          cfg.Region,
			"simulation_mode": cfg.IsSimulation,
			"dependencies":    status,
			"checked_at":      time.Now().UTC(),
		})
	})

	// Prometheus Metrics Exporter (/metrics)
	r.GET("/metrics", gin.WrapH(promhttp.Handler()))

	// Rate limiter for auth endpoints
	authLimiter := middleware.RateLimiter(cfg.RateLimitRPM)

	// Public Auth routes
	authGroup := r.Group("/v1/auth")
	{
		authGroup.POST("/register", authLimiter, auth.Register)
		authGroup.POST("/login", authLimiter, auth.Login)
		authGroup.POST("/refresh", authLimiter, auth.Refresh)
		authGroup.POST("/logout", auth.Logout)
	}

	// Protected API Routes — Enforces RS256 JWT Authentication
	api := r.Group("/v1", middleware.JWTAuth())
	{
		api.POST("/auth/change-password", auth.ChangePassword)
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
		log.Info().Str("addr", listenAddr).Msg("WattWise API server listening")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("Server failure")
		}
	}()

	// Graceful shutdown handling
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("Shutting down WattWise API server...")

	if ingestPipeline != nil {
		ingestPipeline.Stop()
	}

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	if err := srv.Shutdown(ctx); err != nil {
		log.Fatal().Err(err).Msg("Server forced to shutdown")
	}

	log.Info().Msg("WattWise API server exited cleanly")
}
