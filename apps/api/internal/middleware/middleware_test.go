package middleware

import (
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

func init() {
	gin.SetMode(gin.TestMode)
	auth.InitRSAKeys()
}

func issueRS256Token(t *testing.T, claims auth.CustomClaims) string {
	privKey := auth.GetRSAPrivateKey()
	require.NotNil(t, privKey)
	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	tokenStr, err := token.SignedString(privKey)
	require.NoError(t, err)
	return tokenStr
}

func TestJWTAuthAcceptsValidRS256Token(t *testing.T) {
	r := gin.New()
	r.Use(JWTAuth())
	r.GET("/test", func(c *gin.Context) {
		val, _ := c.Get("claims")
		claims := val.(*auth.CustomClaims)
		c.JSON(http.StatusOK, gin.H{"user_id": claims.UserID})
	})

	token := issueRS256Token(t, auth.CustomClaims{
		UserID:             "user-1",
		Role:               "factory_manager",
		MustChangePassword: false,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		},
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+token)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	assert.Contains(t, w.Body.String(), "user-1")
}

func TestJWTAuthRejectsForgedHS256Token(t *testing.T) {
	r := gin.New()
	r.Use(JWTAuth())
	r.GET("/test", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	// Attacker crafts an HS256 token signed with an HMAC secret
	forgedClaims := auth.CustomClaims{
		UserID:             "attacker",
		Role:               "super_admin",
		MustChangePassword: false,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		},
	}
	forgedToken := jwt.NewWithClaims(jwt.SigningMethodHS256, forgedClaims)
	forgedTokenStr, err := forgedToken.SignedString([]byte("super_secret_forged_key!"))
	require.NoError(t, err)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/test", nil)
	req.Header.Set("Authorization", "Bearer "+forgedTokenStr)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusUnauthorized, w.Code, "Forged HS256 tokens MUST be strictly rejected")
	assert.Contains(t, w.Body.String(), "invalid or expired token")
}

func TestJWTAuthEnforcesMustChangePassword(t *testing.T) {
	r := gin.New()
	r.Use(JWTAuth())
	r.GET("/v1/factories", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})
	r.POST("/v1/auth/change-password", func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	token := issueRS256Token(t, auth.CustomClaims{
		UserID:             "admin-bootstrap",
		Role:               "super_admin",
		MustChangePassword: true,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		},
	})

	// 1. Regular API call should be blocked with 403 Forbidden
	w1 := httptest.NewRecorder()
	req1, _ := http.NewRequest("GET", "/v1/factories", nil)
	req1.Header.Set("Authorization", "Bearer "+token)
	r.ServeHTTP(w1, req1)

	assert.Equal(t, http.StatusForbidden, w1.Code)
	assert.Contains(t, w1.Body.String(), "PASSWORD_CHANGE_REQUIRED")

	// 2. Change password endpoint should be permitted
	w2 := httptest.NewRecorder()
	req2, _ := http.NewRequest("POST", "/v1/auth/change-password", nil)
	req2.Header.Set("Authorization", "Bearer "+token)
	r.ServeHTTP(w2, req2)

	assert.Equal(t, http.StatusOK, w2.Code)
}

func TestRequireRoleEnforcesRBAC(t *testing.T) {
	r := gin.New()
	r.Use(JWTAuth())
	r.POST("/admin-only", RequireRole("super_admin"), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	// Viewer token
	viewerToken := issueRS256Token(t, auth.CustomClaims{
		UserID: "viewer-1",
		Role:   "viewer",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		},
	})

	wViewer := httptest.NewRecorder()
	reqViewer, _ := http.NewRequest("POST", "/admin-only", nil)
	reqViewer.Header.Set("Authorization", "Bearer "+viewerToken)
	r.ServeHTTP(wViewer, reqViewer)
	assert.Equal(t, http.StatusForbidden, wViewer.Code)

	// Super Admin token
	adminToken := issueRS256Token(t, auth.CustomClaims{
		UserID: "admin-1",
		Role:   "super_admin",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		},
	})

	wAdmin := httptest.NewRecorder()
	reqAdmin, _ := http.NewRequest("POST", "/admin-only", nil)
	reqAdmin.Header.Set("Authorization", "Bearer "+adminToken)
	r.ServeHTTP(wAdmin, reqAdmin)
	assert.Equal(t, http.StatusOK, wAdmin.Code)
}

func TestRequireFactoryAccessEnforcesTenantIsolation(t *testing.T) {
	r := gin.New()
	r.Use(JWTAuth())
	r.GET("/factories/:id/telemetry", RequireFactoryAccess(), func(c *gin.Context) {
		c.Status(http.StatusOK)
	})

	// User with access only to Crescent Weaving fsd_mill_001
	token := issueRS256Token(t, auth.CustomClaims{
		UserID:     "manager-fsd",
		Role:       "factory_manager",
		FactoryIDs: []string{"fsd_mill_001"},
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		},
	})

	// 1. Authorized factory access
	wAuth := httptest.NewRecorder()
	reqAuth, _ := http.NewRequest("GET", "/factories/fsd_mill_001/telemetry", nil)
	reqAuth.Header.Set("Authorization", "Bearer "+token)
	r.ServeHTTP(wAuth, reqAuth)
	assert.Equal(t, http.StatusOK, wAuth.Code)

	// 2. Unauthorized cross-tenant factory access
	wCross := httptest.NewRecorder()
	reqCross, _ := http.NewRequest("GET", "/factories/slk_surg_002/telemetry", nil)
	reqCross.Header.Set("Authorization", "Bearer "+token)
	r.ServeHTTP(wCross, reqCross)
	assert.Equal(t, http.StatusForbidden, wCross.Code)
	assert.Contains(t, wCross.Body.String(), "strict_multi_tenant_isolation_enforced")
}
