package middleware

import (
	"database/sql"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/wattwise/api/internal/auth"
)

func TestJWTAuthFailsClosedWhenUserStoreIsDown(t *testing.T) {
	gin.SetMode(gin.TestMode)
	auth.InitRSAKeys()
	broken, err := sql.Open("postgres", "postgres://nobody:x@127.0.0.1:1/none?sslmode=disable&connect_timeout=1")
	require.NoError(t, err)
	auth.InitUserRepository(broken)
	t.Cleanup(func() { auth.InitUserRepository(nil) })

	claims := auth.CustomClaims{
		UserID: "11111111-1111-1111-1111-111111111111", Role: "super_admin", TokenVersion: 1,
		RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour))},
	}
	tok, err := jwt.NewWithClaims(jwt.SigningMethodRS256, claims).SignedString(auth.GetRSAPrivateKey())
	require.NoError(t, err)

	r := gin.New()
	r.GET("/x", JWTAuth(), func(c *gin.Context) { c.String(200, "reached handler") })
	w := httptest.NewRecorder()
	req := httptest.NewRequest("GET", "/x", nil)
	req.Header.Set("Authorization", "Bearer "+tok)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusServiceUnavailable, w.Code)
	assert.NotContains(t, w.Body.String(), "reached handler", "an unverifiable token must never reach the handler")
}
