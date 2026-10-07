package factory

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/wattwise/api/internal/auth"
	"github.com/wattwise/api/internal/middleware"
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

func TestCreateFactoryRequiresSuperAdmin(t *testing.T) {
	r := gin.New()
	r.Use(middleware.JWTAuth())
	r.POST("/factories", middleware.RequireRole("super_admin"), Create)

	factoryPayload := FactoryModel{
		ID:          "new_test_mill_001",
		Name:        "New Textile Unit",
		Sector:      "TEXTILE",
		City:        "Faisalabad",
		Disco:       "FESCO",
		WapdaFeeder: "FSD-11KV",
		PeakLoadKw:  500.0,
	}
	body, _ := json.Marshal(factoryPayload)

	// 1. Viewer attempt -> 403 Forbidden
	viewerToken := issueRS256Token(t, auth.CustomClaims{
		UserID: "viewer-1",
		Role:   "viewer",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		},
	})

	wViewer := httptest.NewRecorder()
	reqViewer, _ := http.NewRequest("POST", "/factories", bytes.NewBuffer(body))
	reqViewer.Header.Set("Authorization", "Bearer "+viewerToken)
	reqViewer.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(wViewer, reqViewer)
	assert.Equal(t, http.StatusForbidden, wViewer.Code)

	// 2. Super admin attempt -> 201 Created
	adminToken := issueRS256Token(t, auth.CustomClaims{
		UserID: "admin-1",
		Role:   "super_admin",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		},
	})

	wAdmin := httptest.NewRecorder()
	reqAdmin, _ := http.NewRequest("POST", "/factories", bytes.NewBuffer(body))
	reqAdmin.Header.Set("Authorization", "Bearer "+adminToken)
	reqAdmin.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(wAdmin, reqAdmin)
	assert.Equal(t, http.StatusCreated, wAdmin.Code)

	// 3. Duplicate ID attempt -> 409 Conflict
	wDup := httptest.NewRecorder()
	reqDup, _ := http.NewRequest("POST", "/factories", bytes.NewBuffer(body))
	reqDup.Header.Set("Authorization", "Bearer "+adminToken)
	reqDup.Header.Set("Content-Type", "application/json")
	r.ServeHTTP(wDup, reqDup)
	assert.Equal(t, http.StatusConflict, wDup.Code)
	assert.Contains(t, wDup.Body.String(), "already exists")
}

func TestListFactoriesTenantIsolation(t *testing.T) {
	r := gin.New()
	r.Use(middleware.JWTAuth())
	r.GET("/factories", List)

	// Manager with access only to Crescent Weaving
	managerToken := issueRS256Token(t, auth.CustomClaims{
		UserID:     "manager-1",
		Role:       "factory_manager",
		FactoryIDs: []string{"fsd_mill_001"},
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(1 * time.Hour)),
		},
	})

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/factories", nil)
	req.Header.Set("Authorization", "Bearer "+managerToken)
	r.ServeHTTP(w, req)

	assert.Equal(t, http.StatusOK, w.Code)
	var returned []FactoryModel
	err := json.Unmarshal(w.Body.Bytes(), &returned)
	require.NoError(t, err)

	for _, fac := range returned {
		assert.Equal(t, "fsd_mill_001", fac.ID, "Manager must only receive factories in their authorized tenant list")
	}
}
