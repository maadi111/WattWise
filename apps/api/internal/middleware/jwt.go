package middleware

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/wattwise/api/internal/auth"
)

func JWTAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "authorization header required"})
			return
		}

		parts := strings.Split(authHeader, " ")
		if len(parts) != 2 || parts[0] != "Bearer" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid bearer token format"})
			return
		}

		claims, err := auth.AuthenticateAccessToken(c.Request.Context(), parts[1])
		switch {
		case errors.Is(err, auth.ErrUserDeactivated):
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error(), "code": "USER_DEACTIVATED"})
			return
		case errors.Is(err, auth.ErrSessionRevoked):
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": err.Error(), "code": "SESSION_REVOKED"})
			return
		case errors.Is(err, auth.ErrAuthBackend):
			// Fail closed: if the user store cannot be checked, the token cannot be trusted.
			c.AbortWithStatusJSON(http.StatusServiceUnavailable, gin.H{"error": "authentication service unavailable"})
			return
		case err != nil:
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			return
		}
		// Enforce must_change_password strictly: block all endpoints except password change and logout
		if claims.MustChangePassword {
			path := c.Request.URL.Path
			if path != "/v1/auth/change-password" && path != "/v1/auth/logout" {
				c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
					"error": "password change required before accessing platform",
					"code":  "PASSWORD_CHANGE_REQUIRED",
				})
				return
			}
		}

		c.Set("claims", claims)
		c.Next()
	}
}
