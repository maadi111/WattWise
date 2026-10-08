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
	"github.com/wattwise/api/internal/fleet"
	"github.com/wattwise/api/internal/ingest"
	"github.com/wattwise/api/internal/middleware"
	"github.com/wattwise/api/internal/telemetry"
)

func main() {
	startTime := time.Now()

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
		if cfg.Env == "production" || cfg.Env == "staging" {
			log.Fatal().Err(err).Msg("FATAL: Database initialization failed in production/staging environment")
		}
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

	// H9: Prevent IP spoofing via X-Forwarded-For by untrusted proxies
	_ = r.SetTrustedProxies(nil)

	r.Use(gin.Recovery())
	r.Use(middleware.RequestLogger())
	// M3: Production security headers
	r.Use(middleware.SecurityHeaders())

	// H10: Maximum request body limit (1 MB) to prevent memory exhaustion
	r.Use(func(c *gin.Context) {
		if c.Request.Body != nil {
			c.Request.Body = http.MaxBytesReader(c.Writer, c.Request.Body, 1<<20)
		}
		c.Next()
	})

	// Configure CORS dynamically from environment
	r.Use(cors.New(cors.Config{
		AllowOrigins:     cfg.CORSAllowedOrigins,
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With", "X-Request-ID"},
		ExposeHeaders:    []string{"Content-Length", "X-Request-ID"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Liveness Probes (/health and /healthz) (H14: fixed uptime calculation)
	healthHandler := func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":     "HEALTHY",
			"uptime_sec": int64(time.Since(startTime).Seconds()),
			"version":    "v1.0.0",
		})
	}
	r.GET("/healthz", healthHandler)
	r.GET("/health", healthHandler)

	// Readiness Probes (/readyz) — H14: minimal public disclosure unless authenticated
	readinessHandler := func(c *gin.Context) {
		status := db.CheckReadiness(c.Request.Context())
		httpStatus := http.StatusOK
		if !status.AllReady && cfg.Env == "production" {
			httpStatus = http.StatusServiceUnavailable
		}

		// Minimal public health check without leaking infrastructure topology
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" && cfg.Env == "production" {
			c.JSON(httpStatus, gin.H{
				"ready": status.AllReady,
			})
			return
		}

		c.JSON(httpStatus, gin.H{
			"ready":           status.AllReady,
			"environment":     cfg.Env,
			"region":          cfg.Region,
			"simulation_mode": cfg.IsSimulation,
			"dependencies":    status,
			"checked_at":      time.Now().UTC(),
		})
	}
	r.GET("/readyz", readinessHandler)
	r.GET("/readiness", readinessHandler)

	// Prometheus Metrics Exporter (/metrics) — Protected in production
	metricsHandler := gin.WrapH(promhttp.Handler())
	r.GET("/metrics", func(c *gin.Context) {
		if cfg.Env == "production" {
			// Require internal token or localhost check
			metricToken := c.GetHeader("X-Metrics-Token")
			if metricToken == "" || metricToken != os.Getenv("METRICS_TOKEN") {
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "metrics endpoint restricted"})
				return
			}
		}
		metricsHandler(c)
	})

	// Rate limiters for auth and streaming endpoints (H9: composite IP + email limit)
	authLimiter := middleware.LoginRateLimiter(cfg.RateLimitRPM)
	wsLimiter := middleware.RateLimiter(60)

	// Public Auth routes
	authGroup := r.Group("/v1/auth")
	{
		authGroup.POST("/login", authLimiter, auth.Login)
		authGroup.POST("/refresh", authLimiter, auth.Refresh)
		authGroup.POST("/logout", auth.Logout)
	}

	// H11: WebSocket route outside JWT middleware group because browser WebSocket API
	// does not support setting custom Authorization headers. Authenticates via ?ticket= or ?token=.
	r.GET("/v1/ws/factories/:id", wsLimiter, telemetry.WebSocket)

	// Protected API Routes — Enforces RS256 JWT Authentication
	api := r.Group("/v1", middleware.JWTAuth())
	{
		// H11: One-time ticket generation for WebSocket handshake
		api.POST("/ws-ticket", telemetry.CreateWSTicket)

		api.POST("/auth/register", middleware.RequireRole("super_admin"), auth.Register)
		api.POST("/auth/change-password", auth.ChangePassword)
		api.GET("/factories", factory.List)
		api.POST("/factories", middleware.RequireRole("super_admin"), factory.Create)

		// M7: Incident Management routes
		api.GET("/incidents", fleet.ListIncidentsHandler)
		api.POST("/incidents", fleet.CreateIncidentHandler)
		api.POST("/incidents/:id/ack", fleet.AcknowledgeIncidentHandler)
		api.POST("/incidents/:id/resolve", fleet.ResolveIncidentHandler)

		// Factory-Specific Endpoints — Enforces Strict Multi-Tenant Isolation
		factoryGroup := api.Group("/factories/:id", middleware.RequireFactoryAccess())
		{
			factoryGroup.GET("", factory.GetByID)
			factoryGroup.GET("/nodes", factory.ListNodes)
			factoryGroup.GET("/telemetry/live", telemetry.LiveHandler)
			factoryGroup.GET("/predictions/schedule", telemetry.PredictionsHandler)
			factoryGroup.GET("/savings", billing.GetSavingsLedger)
			factoryGroup.GET("/invoices", billing.ListInvoices)
			// H2: Only super_admin or factory_owner can generate invoices
			factoryGroup.POST("/invoices/generate", middleware.RequireRole("super_admin", "factory_owner"), billing.GenerateInvoice)
		}
	}

	listenAddr := ":" + cfg.Port
	srv := &http.Server{
		Addr:              listenAddr,
		Handler:           r,
		ReadHeaderTimeout: 5 * time.Second,  // H10: Mitigation for Slowloris attacks
		ReadTimeout:       15 * time.Second, // H10: Connection timeout bounds
		WriteTimeout:      15 * time.Second,
		IdleTimeout:       60 * time.Second,
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
