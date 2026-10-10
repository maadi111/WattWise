package billing_test

import (
	"bytes"
	"database/sql"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/wattwise/api/internal/auth"
	"github.com/wattwise/api/internal/billing"
	"github.com/wattwise/api/internal/config"
	"github.com/wattwise/api/internal/db"
	"github.com/wattwise/api/internal/testutil/pgtest"
)

func testConfig() *config.Config {
	return &config.Config{
		Env: "test", SalesTaxRate: 0.18, InvoiceDueDays: 10,
		SellerNTN: "SELLER-NTN", SellerSTRN: "SELLER-STRN", EscrowBank: "Test Bank", EscrowIBAN: "PK00TEST0000000000000001",
	}
}

func router(role string) *gin.Engine {
	gin.SetMode(gin.TestMode)
	r := gin.New()
	r.Use(func(c *gin.Context) {
		if role != "" {
			c.Set("claims", &auth.CustomClaims{UserID: "u", Role: role})
		}
		c.Next()
	})
	r.GET("/f/:id/savings", billing.GetSavingsLedger)
	r.GET("/f/:id/invoices", billing.ListInvoices)
	r.POST("/f/:id/invoices/generate", billing.GenerateInvoice)
	return r
}

func call(r http.Handler, method, path string, body any) (int, map[string]any, []byte) {
	var buf bytes.Buffer
	if body != nil {
		_ = json.NewEncoder(&buf).Encode(body)
	}
	req := httptest.NewRequest(method, path, &buf)
	req.Header.Set("Content-Type", "application/json")
	w := httptest.NewRecorder()
	r.ServeHTTP(w, req)
	var out map[string]any
	_ = json.Unmarshal(w.Body.Bytes(), &out)
	return w.Code, out, w.Body.Bytes()
}

func setup(t *testing.T) *sql.DB {
	t.Helper()
	conn := pgtest.Open(t)
	config.AppConfig = testConfig()
	db.GlobalClients.DB = conn
	t.Cleanup(func() { db.GlobalClients.DB = nil })
	_, err := conn.Exec(`INSERT INTO factories (id,name,sector,city,disco,wapda_feeder,peak_load_kw,generator_kva,buyer_ntn) VALUES
		('fac_a','A','TEXTILE','Faisalabad','FESCO','F1',100,200,'BUYER-A-123'),
		('fac_nobuyer','NB','STEEL','Lahore','LESCO','F2',100,200,NULL),
		('fac_empty','E','FOOD','Multan','MEPCO','F3',100,200,'BUYER-E-1')`)
	require.NoError(t, err)
	_, err = conn.Exec(`INSERT INTO savings_records (factory_id, period_month, baseline_pkr, actual_pkr, gross_saving_pkr, fee_pkr, net_saving_pkr, roi_multiple, audit_hash, status) VALUES
		('fac_a','2026-09-01',1000000,500000,500000,100000,400000,4,'sha256:aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa','LOCKED'),
		('fac_a','2026-08-01',1000000,600000,400000,80000,320000,4,'sha256:bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb','AUDITED'),
		('fac_nobuyer','2026-09-01',1000000,500000,500000,100000,400000,4,'sha256:cccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc','LOCKED')`)
	require.NoError(t, err)
	return conn
}

func TestOnlyOwnersAndAdminsMayGenerateInvoices(t *testing.T) {
	setup(t)
	for _, role := range []string{"viewer", "factory_manager", ""} {
		code, _, _ := call(router(role), "POST", "/f/fac_a/invoices/generate", map[string]string{"month": "2026-09"})
		assert.Contains(t, []int{401, 403}, code, "role %q", role)
	}
	code, _, _ := call(router("factory_owner"), "POST", "/f/fac_a/invoices/generate", map[string]string{"month": "2026-09"})
	assert.Equal(t, 201, code)
}

func TestInvoiceIsComputedFromTheLedgerAndConfig(t *testing.T) {
	conn := setup(t)
	r := router("super_admin")

	code, out, _ := call(r, "POST", "/f/fac_a/invoices/generate", map[string]string{"month": "2026-09"})
	require.Equal(t, 201, code, out)
	inv := out["invoice"].(map[string]any)
	assert.Equal(t, 500000.0, inv["gross_savings_pkr"], "gross comes from the locked ledger")
	assert.Equal(t, 100000.0, inv["gain_share_fee_pkr"], "fee comes from the ledger, not a hardcoded 20%")
	assert.Equal(t, 18000.0, inv["sales_tax_pkr"], "tax = fee x SALES_TAX_RATE (0.18)")
	assert.Equal(t, 118000.0, inv["total_payable_pkr"])
	assert.Equal(t, "BUYER-A-123", inv["buyer_ntn"], "buyer NTN comes from the factory record")
	assert.Equal(t, "SELLER-NTN", inv["seller_ntn"])
	assert.Equal(t, "Net-10 via IBFT / RTGS to Test Bank", inv["payment_terms"])
	assert.Equal(t, "WW-INV-2026-09-1001", inv["invoice_number"])

	code, out, _ = call(r, "POST", "/f/fac_a/invoices/generate", map[string]string{"month": "2026-08"})
	require.Equal(t, 201, code, out)
	assert.Equal(t, "WW-INV-2026-08-1002", out["invoice"].(map[string]any)["invoice_number"], "numbers are sequential")
	assert.Equal(t, 80000.0, out["invoice"].(map[string]any)["gain_share_fee_pkr"])

	code, _, _ = call(r, "POST", "/f/fac_a/invoices/generate", map[string]string{"month": "2026-09"})
	assert.Equal(t, 409, code, "a month can only be invoiced once")
	var n int
	require.NoError(t, conn.QueryRow(`SELECT COUNT(*) FROM invoices WHERE factory_id='fac_a'`).Scan(&n))
	assert.Equal(t, 2, n, "exactly the two successful invoices are stored")
}

func TestInvoiceRefusesToGuess(t *testing.T) {
	setup(t)
	r := router("super_admin")
	cases := []struct {
		name, factory, month string
		want                 int
	}{
		{"invalid month", "fac_a", "abc", 400},
		{"month 13", "fac_a", "2026-13", 400},
		{"no ledger record", "fac_a", "2025-01", 400},
		{"no buyer NTN on file (no hardcoded fallback)", "fac_nobuyer", "2026-09", 422},
		{"unknown factory", "nope", "2026-09", 404},
	}
	for _, tc := range cases {
		code, _, _ := call(r, "POST", "/f/"+tc.factory+"/invoices/generate", map[string]string{"month": tc.month})
		assert.Equal(t, tc.want, code, tc.name)
	}
	code, out, _ := call(r, "GET", "/f/fac_nobuyer/invoices", nil)
	_ = out
	assert.Equal(t, 200, code)
}

func TestInvoicingFailsClosedWithoutTaxConfig(t *testing.T) {
	setup(t)
	cfg := testConfig()
	cfg.SalesTaxRate = 0
	config.AppConfig = cfg
	code, _, _ := call(router("super_admin"), "POST", "/f/fac_a/invoices/generate", map[string]string{"month": "2026-09"})
	assert.Equal(t, 503, code)
}

func TestEmptyListsAreOKNotOutages(t *testing.T) {
	setup(t)
	r := router("super_admin")
	for _, path := range []string{"/f/fac_empty/invoices", "/f/fac_empty/savings"} {
		code, _, body := call(r, "GET", path, nil)
		assert.Equal(t, 200, code, path)
		assert.JSONEq(t, `[]`, string(body), path)
	}
	code, _, body := call(r, "GET", "/f/fac_a/savings", nil)
	require.Equal(t, 200, code)
	var rows []map[string]any
	require.NoError(t, json.Unmarshal(body, &rows))
	assert.Len(t, rows, 2)
	assert.Equal(t, "POSTGRES_IMMUTABLE_LEDGER", rows[0]["data_source"])
}

func TestDatabaseOutageIsAnErrorNotFakeData(t *testing.T) {
	conn := setup(t)
	require.NoError(t, conn.Close())
	r := router("super_admin")
	for _, path := range []string{"/f/fac_a/invoices", "/f/fac_a/savings"} {
		code, _, _ := call(r, "GET", path, nil)
		assert.Equal(t, 503, code, path)
	}
}

func TestNoDatabaseOutsideSimulationIsUnavailable(t *testing.T) {
	db.GlobalClients.DB = nil
	cfg := testConfig()
	config.AppConfig = cfg
	r := router("super_admin")
	for _, path := range []string{"/f/fac_a/invoices", "/f/fac_a/savings"} {
		code, _, _ := call(r, "GET", path, nil)
		assert.Equal(t, 503, code, path)
	}
	code, _, _ := call(r, "POST", "/f/fac_a/invoices/generate", map[string]string{"month": "2026-09"})
	assert.Equal(t, 503, code)

	cfg.IsSimulation = true // explicit development simulation
	code, out, _ := call(r, "POST", "/f/fac_a/invoices/generate", map[string]string{"month": "2026-09"})
	assert.Equal(t, 201, code)
	assert.Equal(t, "DEMO-BUYER-NTN", out["invoice"].(map[string]any)["buyer_ntn"], "simulation uses a neutral demo buyer, never a real-looking NTN")
}
