package middleware

import (
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/rs/zerolog/log"
	"github.com/wattwise/api/internal/auth"
)

// RequestLogger injects a correlation trace ID and logs structured request metrics via Zerolog
func RequestLogger() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()

		// Trace correlation ID
		traceID := c.GetHeader("X-Request-ID")
		if traceID == "" {
			traceID = uuid.New().String()
		}
		c.Header("X-Request-ID", traceID)
		c.Set("trace_id", traceID)

		// Process request
		c.Next()

		duration := time.Since(start)
		status := c.Writer.Status()

		// Extract user and tenant context if authenticated
		userID := ""
		tenantID := ""
		if val, exists := c.Get("claims"); exists {
			if claims, ok := val.(*auth.CustomClaims); ok {
				userID = claims.UserID
				tenantID = claims.TenantID
			}
		}

		logger := log.With().
			Str("trace_id", traceID).
			Str("method", c.Request.Method).
			Str("path", c.Request.URL.Path).
			Int("status", status).
			Int64("duration_ms", duration.Milliseconds()).
			Str("client_ip", c.ClientIP()).
			Logger()

		if userID != "" {
			logger = logger.With().Str("user_id", userID).Str("tenant_id", tenantID).Logger()
		}

		if status >= 500 {
			logger.Error().Msg("HTTP Request completed with server error")
		} else if status >= 400 {
			logger.Warn().Msg("HTTP Request completed with client error")
		} else {
			logger.Info().Msg("HTTP Request processed successfully")
		}
	}
}
