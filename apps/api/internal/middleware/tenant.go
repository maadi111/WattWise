package middleware

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/wattwise/api/internal/auth"
)

// RequireFactoryAccess strictly enforces tenant isolation.
// Factory A can NEVER see Factory B's sensor readings or ledger.
func RequireFactoryAccess() gin.HandlerFunc {
	return func(c *gin.Context) {
		val, exists := c.Get("claims")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
			return
		}

		claims, ok := val.(*auth.CustomClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "invalid auth state"})
			return
		}

		factoryID := c.Param("id")
		if factoryID == "" {
			c.AbortWithStatusJSON(http.StatusBadRequest, gin.H{"error": "missing factory_id parameter"})
			return
		}

		// Verify the requested factory is in the user's allowed list
		if !claims.HasFactory(factoryID) {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error":       "access denied: you do not have permission for this industrial facility",
				"factory_id":  factoryID,
				"tenant_rule": "strict_multi_tenant_isolation_enforced",
			})
			return
		}

		c.Set("factory_id", factoryID) // safe to use downstream
		c.Next()
	}
}

// RequireRole enforces role-based access control (RBAC) across API operations.
func RequireRole(allowedRoles ...string) gin.HandlerFunc {
	allowed := make(map[string]bool)
	for _, r := range allowedRoles {
		allowed[r] = true
	}
	return func(c *gin.Context) {
		val, exists := c.Get("claims")
		if !exists {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unauthenticated"})
			return
		}

		claims, ok := val.(*auth.CustomClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusInternalServerError, gin.H{"error": "invalid auth state"})
			return
		}

		if !allowed[claims.Role] {
			c.AbortWithStatusJSON(http.StatusForbidden, gin.H{
				"error": "access denied: insufficient permissions for this operation",
				"role":  claims.Role,
			})
			return
		}

		c.Next()
	}
}

