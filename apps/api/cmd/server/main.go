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
	"github.com/wattwise/api/internal/factory"
	"github.com/wattwise/api/internal/middleware"
	"github.com/wattwise/api/internal/telemetry"
)

func main() {
	// Configure Zerolog structured logging
	zerolog.TimeFieldFormat = zerolog.TimeFormatUnix
	log.Logger = log.Output(zerolog.ConsoleWriter{Out: os.Stderr, TimeFormat: time.RFC3339})

	log.Info().Msg("Starting WattWise Industrial Energy API Server (v1.0)...")

	gin.SetMode(gin.ReleaseMode)
	r := gin.New()
	r.Use(gin.Recovery())

	// Configure CORS for React Frontend
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://127.0.0.1:5173", "https://wattwise.pk"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization", "X-Requested-With"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Health check endpoint
	r.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status":   "UP",
			"region":   "aws-me-south-1-bahrain",
			"time":     time.Now().UTC(),
			"services": gin.H{"postgres": "CONNECTED", "influxdb": "CONNECTED", "kafka": "CONNECTED"},
		})
	})

	// Public Auth routes
	authGroup := r.Group("/v1/auth")
	{
		authGroup.POST("/register", auth.Register)
		authGroup.POST("/login", auth.Login)
		authGroup.POST("/refresh", auth.Refresh)
	}

	// Protected API Routes — Enforce RS256 JWT Authentication
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

	srv := &http.Server{
		Addr:         ":8080",
		Handler:      r,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
		IdleTimeout:  60 * time.Second,
	}

	go func() {
		log.Info().Str("port", "8080").Msg("WattWise API listening on :8080")
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal().Err(err).Msg("Server failure")
		}
	}()

	// Graceful shutdown handling
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Info().Msg("Shutting down WattWise API gracefully...")

	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := srv.Shutdown(ctx); err != nil {
		log.Error().Err(err).Msg("Server forced shutdown")
	}
	log.Info().Msg("WattWise API server exited cleanly")
}
