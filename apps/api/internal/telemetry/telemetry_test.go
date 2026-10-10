package telemetry_test

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/gorilla/websocket"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/wattwise/api/internal/auth"
	"github.com/wattwise/api/internal/config"
	"github.com/wattwise/api/internal/db"
	"github.com/wattwise/api/internal/middleware"
	"github.com/wattwise/api/internal/telemetry"
)

const goodOrigin = "http://localhost:5173"

func devConfig() *config.Config {
	return &config.Config{Env: "development", IsSimulation: true, CORSAllowedOrigins: []string{goodOrigin}}
}

func prodConfig() *config.Config {
	return &config.Config{Env: "production", IsSimulation: false, CORSAllowedOrigins: []string{"https://app.company.pk"}}
}

func newServer(t *testing.T, cfg *config.Config) (*httptest.Server, func(role string, factories ...string) string) {
	t.Helper()
	gin.SetMode(gin.TestMode)
	auth.InitRSAKeys()
	auth.InitUserRepository(nil)
	auth.SetGlobalWSTicketStore(auth.NewMemoryWSTicketStore())
	config.AppConfig = cfg
	db.GlobalClients.DB, db.GlobalClients.Influx = nil, nil

	r := gin.New()
	r.GET("/v1/ws/factories/:id", telemetry.WebSocket)
	api := r.Group("/v1", middleware.JWTAuth())
	api.POST("/ws-ticket", telemetry.CreateWSTicket)
	f := api.Group("/factories/:id", middleware.RequireFactoryAccess())
	f.GET("/telemetry/live", telemetry.LiveHandler)
	f.GET("/predictions/schedule", telemetry.PredictionsHandler)

	srv := httptest.NewServer(r)
	t.Cleanup(srv.Close)

	token := func(role string, factories ...string) string {
		c := auth.CustomClaims{
			UserID: "u1", Role: role, FactoryIDs: factories, TokenVersion: 1,
			RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour))},
		}
		s, err := jwt.NewWithClaims(jwt.SigningMethodRS256, c).SignedString(auth.GetRSAPrivateKey())
		require.NoError(t, err)
		return s
	}
	return srv, token
}

func post(t *testing.T, srv *httptest.Server, path, tok string, body any) (int, map[string]any) {
	t.Helper()
	b, _ := json.Marshal(body)
	req, _ := http.NewRequest("POST", srv.URL+path, bytes.NewReader(b))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", "Bearer "+tok)
	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()
	var out map[string]any
	_ = json.NewDecoder(resp.Body).Decode(&out)
	return resp.StatusCode, out
}

func get(t *testing.T, srv *httptest.Server, path, tok string) int {
	t.Helper()
	req, _ := http.NewRequest("GET", srv.URL+path, nil)
	req.Header.Set("Authorization", "Bearer "+tok)
	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	resp.Body.Close()
	return resp.StatusCode
}

// dial returns the open connection or, on a refused handshake, the HTTP status.
func dial(srv *httptest.Server, path, origin string, hdr http.Header) (*websocket.Conn, int) {
	if hdr == nil {
		hdr = http.Header{}
	}
	if origin != "" {
		hdr.Set("Origin", origin)
	}
	conn, resp, err := websocket.DefaultDialer.Dial("ws"+strings.TrimPrefix(srv.URL, "http")+path, hdr)
	if err != nil {
		if resp != nil {
			return nil, resp.StatusCode
		}
		return nil, 0
	}
	return conn, http.StatusSwitchingProtocols
}

func ticketFor(t *testing.T, srv *httptest.Server, tok, factoryID string) string {
	t.Helper()
	code, out := post(t, srv, "/v1/ws-ticket", tok, map[string]string{"factory_id": factoryID})
	require.Equal(t, 200, code)
	return out["ticket"].(string)
}

func TestWebSocketTicketIsSingleUse(t *testing.T) {
	srv, token := newServer(t, devConfig())
	tk := ticketFor(t, srv, token("factory_manager", "fac_a"), "fac_a")

	conn, code := dial(srv, "/v1/ws/factories/fac_a?ticket="+tk, goodOrigin, nil)
	require.Equal(t, http.StatusSwitchingProtocols, code)
	defer conn.Close()
	require.NoError(t, conn.SetReadDeadline(time.Now().Add(3*time.Second)))
	var snap telemetry.LiveSnapshot
	require.NoError(t, conn.ReadJSON(&snap))
	assert.Equal(t, "fac_a", snap.FactoryID)
	assert.NotEqual(t, "PHYSICAL_METER_INFLUX", snap.DataSource, "no Influx is configured, so the frame must be labelled as simulated")

	_, code = dial(srv, "/v1/ws/factories/fac_a?ticket="+tk, goodOrigin, nil)
	assert.Equal(t, http.StatusUnauthorized, code, "the same ticket must not open a second stream")
}

func TestWebSocketRejections(t *testing.T) {
	srv, token := newServer(t, devConfig())
	mgr := token("factory_manager", "fac_a")

	t.Run("no credentials", func(t *testing.T) {
		_, code := dial(srv, "/v1/ws/factories/fac_a", goodOrigin, nil)
		assert.Equal(t, http.StatusUnauthorized, code)
	})
	t.Run("a JWT in the URL is never accepted", func(t *testing.T) {
		_, code := dial(srv, "/v1/ws/factories/fac_a?token="+mgr, goodOrigin, nil)
		assert.Equal(t, http.StatusUnauthorized, code)
	})
	t.Run("hostile origin", func(t *testing.T) {
		_, code := dial(srv, "/v1/ws/factories/fac_a?ticket="+ticketFor(t, srv, mgr, "fac_a"), "https://evil.example", nil)
		assert.Equal(t, http.StatusForbidden, code)
	})
	t.Run("ticket bound to fac_a cannot open fac_b", func(t *testing.T) {
		_, code := dial(srv, "/v1/ws/factories/fac_b?ticket="+ticketFor(t, srv, mgr, "fac_a"), goodOrigin, nil)
		assert.Equal(t, http.StatusUnauthorized, code)
	})
	t.Run("cannot even request a ticket for a factory you lack", func(t *testing.T) {
		code, _ := post(t, srv, "/v1/ws-ticket", mgr, map[string]string{"factory_id": "fac_b"})
		assert.Equal(t, http.StatusForbidden, code)
	})
	t.Run("malformed factory id", func(t *testing.T) {
		code, _ := post(t, srv, "/v1/ws-ticket", mgr, map[string]string{"factory_id": `x") |> drop()`})
		assert.Equal(t, http.StatusBadRequest, code)
	})
	t.Run("bearer header still works for non-browser clients", func(t *testing.T) {
		conn, code := dial(srv, "/v1/ws/factories/fac_a", goodOrigin, http.Header{"Authorization": {"Bearer " + mgr}})
		assert.Equal(t, http.StatusSwitchingProtocols, code)
		if conn != nil {
			conn.Close()
		}
	})
	t.Run("bearer header for another tenant", func(t *testing.T) {
		_, code := dial(srv, "/v1/ws/factories/fac_b", goodOrigin, http.Header{"Authorization": {"Bearer " + mgr}})
		assert.Equal(t, http.StatusUnauthorized, code)
	})
}

func TestProductionNeverServesSimulatedTelemetry(t *testing.T) {
	srv, token := newServer(t, prodConfig())
	admin := token("super_admin")

	assert.Equal(t, http.StatusServiceUnavailable, get(t, srv, "/v1/factories/fac_a/telemetry/live", admin), "live snapshot")
	assert.Equal(t, http.StatusServiceUnavailable, get(t, srv, "/v1/factories/fac_a/predictions/schedule", admin), "predictions")

	tk := ticketFor(t, srv, admin, "fac_a")
	_, code := dial(srv, "/v1/ws/factories/fac_a?ticket="+tk, "https://app.company.pk", nil)
	assert.Equal(t, http.StatusServiceUnavailable, code, "the stream must be refused before upgrade, not faked")
}

func TestDevelopmentSimulationIsExplicitAndLabelled(t *testing.T) {
	srv, token := newServer(t, devConfig())
	req, _ := http.NewRequest("GET", srv.URL+"/v1/factories/fac_a/telemetry/live", nil)
	req.Header.Set("Authorization", "Bearer "+token("super_admin"))
	resp, err := http.DefaultClient.Do(req)
	require.NoError(t, err)
	defer resp.Body.Close()
	require.Equal(t, 200, resp.StatusCode)
	var snap telemetry.LiveSnapshot
	require.NoError(t, json.NewDecoder(resp.Body).Decode(&snap))
	assert.Contains(t, []string{"CALIBRATED_BASE", "SIMULATION_FALLBACK"}, snap.DataSource)

	// Without the explicit simulation flag, even a development server returns nothing fabricated.
	cfg := devConfig()
	cfg.IsSimulation = false
	srv2, token2 := newServer(t, cfg)
	assert.Equal(t, http.StatusServiceUnavailable, get(t, srv2, "/v1/factories/fac_a/telemetry/live", token2("super_admin")))
}

func TestLiveHandlerRejectsInjectionShapedFactoryIDs(t *testing.T) {
	srv, token := newServer(t, devConfig())
	admin := token("super_admin")
	for _, id := range []string{`a%22)%20%7C%3E%20drop()`, "a%20b", strings.Repeat("a", 65)} {
		assert.Equal(t, http.StatusBadRequest, get(t, srv, "/v1/factories/"+id+"/telemetry/live", admin), id)
	}
}
