package middleware

import (
	"errors"
	"net/http"
	"strings"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
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

		tokenString := parts[1]
		// Strictly enforce RS256 algorithm — reject HS256, HMAC, none, or any other method
		token, err := jwt.ParseWithClaims(
			tokenString,
			&auth.CustomClaims{},
			func(token *jwt.Token) (interface{}, error) {
				if _, ok := token.Method.(*jwt.SigningMethodRSA); !ok {
					return nil, jwt.ErrSignatureInvalid
				}
				pubKey := auth.GetRSAPublicKey()
				if pubKey == nil {
					return nil, jwt.ErrSignatureInvalid
				}
				return pubKey, nil
			},
			jwt.WithValidMethods([]string{"RS256"}),
		)

		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired token"})
			return
		}

		claims, ok := token.Claims.(*auth.CustomClaims)
		if !ok || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "unable to parse claims"})
			return
		}

		// H6 & M4: Validate token_version against current database record to revoke old sessions immediately
		userRepo := auth.GetUserRepository()
		if userRepo != nil && claims.UserID != "" {
			user, err := userRepo.FindByID(c.Request.Context(), claims.UserID)
			if err != nil {
				if errors.Is(err, auth.ErrUserNotFound) {
					// M4: Deleted user's token is immediately revoked
					c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
						"error": "user account no longer exists or was deactivated",
						"code":  "USER_DEACTIVATED",
					})
					return
				}
			} else if user != nil && claims.TokenVersion < user.TokenVersion {
				// H6: Token invalidated by password change or session revocation
				c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{
					"error": "session invalidated due to password update or revocation",
					"code":  "SESSION_REVOKED",
				})
				return
			}
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
