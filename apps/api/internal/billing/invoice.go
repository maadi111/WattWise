package billing

import (
	"database/sql"
	"errors"
	"fmt"
	"math"
	"net/http"
	"regexp"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/rs/zerolog/log"

	"github.com/wattwise/api/internal/auth"
	"github.com/wattwise/api/internal/config"
	"github.com/wattwise/api/internal/db"
)

var monthRegex = regexp.MustCompile(`^\d{4}-(0[1-9]|1[0-2])$`)

type SavingsRecordModel struct {
	PeriodMonth    string  `json:"period_month"`
	BaselinePkr    float64 `json:"baseline_pkr"`
	ActualPkr      float64 `json:"actual_pkr"`
	GrossSavingPkr float64 `json:"gross_saving_pkr"`
	WattwiseFeePkr float64 `json:"wattwise_fee_pkr"`
	NetSavingPkr   float64 `json:"net_saving_pkr"`
	RoiMultiple    float64 `json:"roi_multiple"`
	AuditHash      string  `json:"audit_hash"`
	Status         string  `json:"status"`
	DataSource     string  `json:"data_source"`
}

type TaxInvoice struct {
	InvoiceNumber string    `json:"invoice_number"`
	IssueDate     time.Time `json:"issue_date"`
	DueDate       time.Time `json:"due_date"`
	SellerNTN     string    `json:"seller_ntn"`
	SellerSTRN    string    `json:"seller_strn"`
	BuyerNTN      string    `json:"buyer_ntn"`
	HsnCode       string    `json:"hsn_code"`
	GrossSavings  float64   `json:"gross_savings_pkr"`
	GainShareFee  float64   `json:"gain_share_fee_pkr"`
	SalesTaxPkr   float64   `json:"sales_tax_pkr"`
	TotalPayable  float64   `json:"total_payable_pkr"`
	IbftBank      string    `json:"ibft_bank"`
	IbanNumber    string    `json:"iban_number"`
	PaymentTerms  string    `json:"payment_terms"`
	Status        string    `json:"status"`
}

// hsnCode is the FBR service classification for energy-management services (not environment-specific).
const hsnCode = "9983.15 (Energy Management & IT Optimization)"

// simulationAllowed is true only for an explicit development simulation run (never production/staging).
func simulationAllowed() bool {
	c := config.AppConfig
	return c != nil && c.IsSimulation && !c.Strict()
}

func round2(v float64) float64 { return math.Round(v*100) / 100 }

func dueDays(cfg *config.Config) int {
	if cfg.InvoiceDueDays < 1 {
		return 15
	}
	return cfg.InvoiceDueDays
}

func paymentTerms(cfg *config.Config) string {
	return fmt.Sprintf("Net-%d via IBFT / RTGS to %s", dueDays(cfg), cfg.EscrowBank)
}

func unavailable(c *gin.Context, what string) {
	c.JSON(http.StatusServiceUnavailable, gin.H{"error": what + " unavailable"})
}

func GetSavingsLedger(c *gin.Context) {
	factoryID := c.Param("id")
	if factoryID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "factory id is required"})
		return
	}

	if db.GlobalClients.DB != nil {
		rows, err := db.GlobalClients.DB.QueryContext(c.Request.Context(), `
			SELECT to_char(period_month, 'YYYY-MM'), baseline_pkr, actual_pkr, gross_saving_pkr,
			       fee_pkr, net_saving_pkr, roi_multiple, audit_hash, status
			FROM savings_records
			WHERE factory_id = $1
			ORDER BY period_month DESC`, factoryID)
		if err != nil {
			log.Error().Err(err).Msg("savings ledger query failed")
			unavailable(c, "savings ledger")
			return
		}
		defer rows.Close()
		records := []SavingsRecordModel{} // an empty ledger is a valid 200 [], not an outage
		for rows.Next() {
			var r SavingsRecordModel
			if err := rows.Scan(&r.PeriodMonth, &r.BaselinePkr, &r.ActualPkr, &r.GrossSavingPkr,
				&r.WattwiseFeePkr, &r.NetSavingPkr, &r.RoiMultiple, &r.AuditHash, &r.Status); err != nil {
				log.Error().Err(err).Msg("savings ledger scan failed")
				unavailable(c, "savings ledger")
				return
			}
			r.DataSource = "POSTGRES_IMMUTABLE_LEDGER"
			records = append(records, r)
		}
		if err := rows.Err(); err != nil {
			log.Error().Err(err).Msg("savings ledger iteration failed")
			unavailable(c, "savings ledger")
			return
		}
		c.JSON(http.StatusOK, records)
		return
	}

	if !simulationAllowed() {
		unavailable(c, "savings ledger")
		return
	}
	// Development simulation only.
	c.JSON(http.StatusOK, []SavingsRecordModel{
		{PeriodMonth: "2026-09", BaselinePkr: 18200000, ActualPkr: 12940000, GrossSavingPkr: 5260000, WattwiseFeePkr: 1052000,
			NetSavingPkr: 4208000, RoiMultiple: 4.0, AuditHash: "sha256:simulation", Status: "LOCKED", DataSource: "SIMULATION_CALIBRATED"},
	})
}

func ListInvoices(c *gin.Context) {
	factoryID := c.Param("id")
	cfg := config.AppConfig
	if factoryID == "" || cfg == nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "factory id is required"})
		return
	}

	if db.GlobalClients.DB != nil {
		rows, err := db.GlobalClients.DB.QueryContext(c.Request.Context(), `
			SELECT invoice_number, created_at, seller_ntn, seller_strn, buyer_ntn,
			       verified_savings_pkr, base_fee_pkr, sales_tax_pkr, total_payable_pkr,
			       bank_name, iban, status
			FROM invoices
			WHERE factory_id = $1
			ORDER BY created_at DESC`, factoryID)
		if err != nil {
			log.Error().Err(err).Msg("invoice list query failed")
			unavailable(c, "invoice store")
			return
		}
		defer rows.Close()
		invoices := []TaxInvoice{} // no invoices yet is a valid 200 [], not an outage
		for rows.Next() {
			var inv TaxInvoice
			if err := rows.Scan(&inv.InvoiceNumber, &inv.IssueDate, &inv.SellerNTN, &inv.SellerSTRN, &inv.BuyerNTN,
				&inv.GrossSavings, &inv.GainShareFee, &inv.SalesTaxPkr, &inv.TotalPayable,
				&inv.IbftBank, &inv.IbanNumber, &inv.Status); err != nil {
				log.Error().Err(err).Msg("invoice list scan failed")
				unavailable(c, "invoice store")
				return
			}
			inv.DueDate = inv.IssueDate.Add(time.Duration(dueDays(cfg)) * 24 * time.Hour)
			inv.HsnCode = hsnCode
			inv.PaymentTerms = paymentTerms(cfg)
			invoices = append(invoices, inv)
		}
		if err := rows.Err(); err != nil {
			log.Error().Err(err).Msg("invoice list iteration failed")
			unavailable(c, "invoice store")
			return
		}
		c.JSON(http.StatusOK, invoices)
		return
	}

	if !simulationAllowed() {
		unavailable(c, "invoice store")
		return
	}
	c.JSON(http.StatusOK, []TaxInvoice{simulatedInvoice(cfg, "2026-09")})
}

func simulatedInvoice(cfg *config.Config, month string) TaxInvoice {
	fee, tax := 1052000.0, round2(1052000.0*cfg.SalesTaxRate)
	return TaxInvoice{
		InvoiceNumber: "WW-SIM-" + month + "-0001", IssueDate: time.Now().UTC(),
		DueDate:   time.Now().UTC().Add(time.Duration(dueDays(cfg)) * 24 * time.Hour),
		SellerNTN: cfg.SellerNTN, SellerSTRN: cfg.SellerSTRN, BuyerNTN: "DEMO-BUYER-NTN", HsnCode: hsnCode,
		GrossSavings: 5260000, GainShareFee: fee, SalesTaxPkr: tax, TotalPayable: fee + tax,
		IbftBank: cfg.EscrowBank, IbanNumber: cfg.EscrowIBAN, PaymentTerms: paymentTerms(cfg), Status: "UNPAID",
	}
}

// GenerateInvoice builds one tax invoice per factory and month from the LOCKED savings ledger.
// Nothing is defaulted: the buyer NTN must be on file, the fee comes from the ledger, tax and terms from config.
func GenerateInvoice(c *gin.Context) {
	// Defence in depth: the route also uses RequireRole, but a financial write must never rely on that alone.
	val, _ := c.Get("claims")
	claims, ok := val.(*auth.CustomClaims)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication required"})
		return
	}
	if claims.Role != "super_admin" && claims.Role != "factory_owner" {
		c.JSON(http.StatusForbidden, gin.H{"error": "only super administrators and factory owners can generate invoices"})
		return
	}
	factoryID := c.Param("id")
	if factoryID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "factory id is required"})
		return
	}
	var req struct {
		Month string `json:"month" binding:"required"`
	}
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "month is required in payload"})
		return
	}
	month := req.Month
	if !monthRegex.MatchString(month) {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid month format; must match YYYY-MM (e.g. 2026-09)"})
		return
	}
	cfg := config.AppConfig
	if cfg == nil || cfg.SalesTaxRate <= 0 || cfg.SalesTaxRate >= 1 {
		unavailable(c, "invoicing (SALES_TAX_RATE not configured)")
		return
	}

	if db.GlobalClients.DB == nil {
		if simulationAllowed() {
			c.JSON(http.StatusCreated, gin.H{"message": "FBR tax invoice generated in simulation mode", "invoice": simulatedInvoice(cfg, month)})
			return
		}
		unavailable(c, "invoicing")
		return
	}

	ctx := c.Request.Context()
	var buyerNTN sql.NullString
	if err := db.GlobalClients.DB.QueryRowContext(ctx, "SELECT buyer_ntn FROM factories WHERE id = $1", factoryID).Scan(&buyerNTN); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "factory not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error looking up factory"})
		return
	}
	if !buyerNTN.Valid || strings.TrimSpace(buyerNTN.String) == "" {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": "factory has no buyer NTN on file; set buyer_ntn before invoicing"})
		return
	}

	var gross, fee float64
	err := db.GlobalClients.DB.QueryRowContext(ctx, `
		SELECT gross_saving_pkr, fee_pkr FROM savings_records
		WHERE factory_id = $1 AND to_char(period_month, 'YYYY-MM') = $2 AND status IN ('LOCKED', 'AUDITED')`,
		factoryID, month).Scan(&gross, &fee)
	if errors.Is(err, sql.ErrNoRows) {
		c.JSON(http.StatusBadRequest, gin.H{"error": fmt.Sprintf("no locked savings record exists for factory '%s' in month '%s'; audit and lock the ledger before billing", factoryID, month)})
		return
	}
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error verifying savings records"})
		return
	}
	if gross <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "gross savings for this period is zero or negative; no invoice generated"})
		return
	}
	if fee <= 0 {
		c.JSON(http.StatusUnprocessableEntity, gin.H{"error": "the locked ledger record has no fee; it cannot be invoiced"})
		return
	}

	tax := round2(fee * cfg.SalesTaxRate)
	tx, err := db.GlobalClients.DB.BeginTx(ctx, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to begin database transaction"})
		return
	}
	defer tx.Rollback() //nolint:errcheck // no-op after Commit

	var seq int64
	if err := tx.QueryRowContext(ctx, "SELECT nextval('invoice_seq')").Scan(&seq); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to allocate sequential invoice number"})
		return
	}
	now := time.Now().UTC()
	inv := TaxInvoice{
		InvoiceNumber: fmt.Sprintf("WW-INV-%s-%04d", month, seq), IssueDate: now,
		DueDate:   now.Add(time.Duration(dueDays(cfg)) * 24 * time.Hour),
		SellerNTN: cfg.SellerNTN, SellerSTRN: cfg.SellerSTRN, BuyerNTN: strings.TrimSpace(buyerNTN.String), HsnCode: hsnCode,
		GrossSavings: gross, GainShareFee: fee, SalesTaxPkr: tax, TotalPayable: round2(fee + tax),
		IbftBank: cfg.EscrowBank, IbanNumber: cfg.EscrowIBAN, PaymentTerms: paymentTerms(cfg), Status: "UNPAID",
	}
	_, err = tx.ExecContext(ctx, `
		INSERT INTO invoices (id, invoice_number, factory_id, month, seller_ntn, seller_strn, buyer_ntn,
			verified_savings_pkr, base_fee_pkr, sales_tax_pkr, total_payable_pkr, bank_name, iban, status)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)`,
		uuid.New().String(), inv.InvoiceNumber, factoryID, month, inv.SellerNTN, inv.SellerSTRN, inv.BuyerNTN,
		inv.GrossSavings, inv.GainShareFee, inv.SalesTaxPkr, inv.TotalPayable, inv.IbftBank, inv.IbanNumber, inv.Status)
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			c.JSON(http.StatusConflict, gin.H{"error": fmt.Sprintf("an invoice has already been generated for factory '%s' in month '%s'", factoryID, month)})
			return
		}
		log.Error().Err(err).Msg("failed to persist generated invoice")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database transaction failed to save invoice"})
		return
	}
	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to commit invoice transaction"})
		return
	}
	c.JSON(http.StatusCreated, gin.H{"message": "FBR tax invoice generated successfully", "invoice": inv})
}
