package billing

import (
	"database/sql"
	"errors"
	"fmt"
	"net/http"
	"regexp"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/rs/zerolog/log"

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

func GetSavingsLedger(c *gin.Context) {
	factoryID := c.Param("id")
	if factoryID == "" {
		factoryID = "fsd_mill_001"
	}
	cfg := config.AppConfig

	if db.GlobalClients.DB != nil {
		ctx := c.Request.Context()
		query := `
			SELECT to_char(period_month, 'YYYY-MM'), baseline_pkr, actual_pkr, gross_saving_pkr,
			       fee_pkr, net_saving_pkr, roi_multiple, audit_hash, status
			FROM savings_records
			WHERE factory_id = $1
			ORDER BY period_month DESC
		`
		rows, err := db.GlobalClients.DB.QueryContext(ctx, query, factoryID)
		if err == nil {
			defer rows.Close()
			var records []SavingsRecordModel
			for rows.Next() {
				var r SavingsRecordModel
				if scanErr := rows.Scan(
					&r.PeriodMonth, &r.BaselinePkr, &r.ActualPkr, &r.GrossSavingPkr,
					&r.WattwiseFeePkr, &r.NetSavingPkr, &r.RoiMultiple, &r.AuditHash, &r.Status,
				); scanErr == nil {
					r.DataSource = "POSTGRES_IMMUTABLE_LEDGER"
					records = append(records, r)
				}
			}
			if len(records) > 0 {
				c.JSON(http.StatusOK, records)
				return
			}
		} else {
			log.Warn().Err(err).Msg("Database query failed for savings ledger")
		}
	}

	// M6: Gate simulation fallback strictly on cfg.IsSimulation; return 503 otherwise
	if cfg == nil || !cfg.IsSimulation {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "database ledger unavailable and simulation mode is disabled",
		})
		return
	}

	// Fallback simulation records for local development / testing only
	c.JSON(http.StatusOK, []SavingsRecordModel{
		{
			PeriodMonth:    "2026-09",
			BaselinePkr:    18200000.00,
			ActualPkr:      12940000.00,
			GrossSavingPkr: 5260000.00,
			WattwiseFeePkr: 1052000.00,
			NetSavingPkr:   4208000.00,
			RoiMultiple:    4.0,
			AuditHash:      "sha256:a3f890c29f81d116c8e3bf5d4e2a901f46820573be8296a241de09f18a56209b",
			Status:         "LOCKED",
			DataSource:     "SIMULATION_CALIBRATED",
		},
		{
			PeriodMonth:    "2026-08",
			BaselinePkr:    19100000.00,
			ActualPkr:      13520000.00,
			GrossSavingPkr: 5580000.00,
			WattwiseFeePkr: 1116000.00,
			NetSavingPkr:   4464000.00,
			RoiMultiple:    4.0,
			AuditHash:      "sha256:7bc94401fe9a4c82b01248039c9df4a32219488dafe6c46a81bfa0024419ad21",
			Status:         "AUDITED",
			DataSource:     "SIMULATION_CALIBRATED",
		},
	})
}

func ListInvoices(c *gin.Context) {
	factoryID := c.Param("id")
	if factoryID == "" {
		factoryID = "fsd_mill_001"
	}
	cfg := config.AppConfig

	if db.GlobalClients.DB != nil {
		ctx := c.Request.Context()
		query := `
			SELECT invoice_number, created_at, seller_ntn, seller_strn, buyer_ntn,
			       verified_savings_pkr, base_fee_pkr, sales_tax_pkr, total_payable_pkr,
			       bank_name, iban, status
			FROM invoices
			WHERE factory_id = $1
			ORDER BY created_at DESC
		`
		rows, err := db.GlobalClients.DB.QueryContext(ctx, query, factoryID)
		if err == nil {
			defer rows.Close()
			var invoices []TaxInvoice
			for rows.Next() {
				var inv TaxInvoice
				if scanErr := rows.Scan(
					&inv.InvoiceNumber, &inv.IssueDate, &inv.SellerNTN, &inv.SellerSTRN, &inv.BuyerNTN,
					&inv.GrossSavings, &inv.GainShareFee, &inv.SalesTaxPkr, &inv.TotalPayable,
					&inv.IbftBank, &inv.IbanNumber, &inv.Status,
				); scanErr == nil {
					inv.DueDate = inv.IssueDate.Add(15 * 24 * time.Hour)
					inv.HsnCode = "9983.15 (Energy Management & IT Optimization)"
					inv.PaymentTerms = "Net-15 via Meezan Islamic IBFT / RTGS"
					invoices = append(invoices, inv)
				}
			}
			if len(invoices) > 0 {
				c.JSON(http.StatusOK, invoices)
				return
			}
		}
	}

	// M6: Gate simulation fallback strictly on cfg.IsSimulation
	if cfg == nil || !cfg.IsSimulation {
		c.JSON(http.StatusServiceUnavailable, gin.H{
			"error": "database invoice store unavailable and simulation mode is disabled",
		})
		return
	}

	c.JSON(http.StatusOK, []TaxInvoice{
		{
			InvoiceNumber: "WW-INV-2026-09-0042",
			IssueDate:     time.Date(2026, 10, 5, 0, 0, 0, 0, time.UTC),
			DueDate:       time.Date(2026, 10, 20, 0, 0, 0, 0, time.UTC),
			SellerNTN:     cfg.SellerNTN,
			SellerSTRN:    cfg.SellerSTRN,
			BuyerNTN:      "0814923-2",
			HsnCode:       "9983.15 (Energy Management & IT Optimization)",
			GrossSavings:  5260000.00,
			GainShareFee:  1052000.00,
			SalesTaxPkr:   168320.00,
			TotalPayable:  1220320.00,
			IbftBank:      cfg.EscrowBank,
			IbanNumber:    cfg.EscrowIBAN,
			PaymentTerms:  "Net-15 via Meezan Islamic IBFT / RTGS",
			Status:        "UNPAID",
		},
	})
}

func GenerateInvoice(c *gin.Context) {
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
	// H3: Validate month format strictly against ^\d{4}-(0[1-9]|1[0-2])$
	if !monthRegex.MatchString(month) {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid month format; must match YYYY-MM (e.g. 2026-09)",
		})
		return
	}

	cfg := config.AppConfig
	ctx := c.Request.Context()

	if db.GlobalClients.DB == nil {
		if cfg != nil && cfg.IsSimulation {
			// Dev simulation fallback
			inv := TaxInvoice{
				InvoiceNumber: fmt.Sprintf("WW-SIM-%s-1001", month),
				IssueDate:     time.Now().UTC(),
				DueDate:       time.Now().UTC().Add(15 * 24 * time.Hour),
				SellerNTN:     cfg.SellerNTN,
				SellerSTRN:    cfg.SellerSTRN,
				BuyerNTN:      "0814923-2",
				HsnCode:       "9983.15 (Energy Management & IT Optimization)",
				GrossSavings:  5260000.00,
				GainShareFee:  1052000.00,
				SalesTaxPkr:   168320.00,
				TotalPayable:  1220320.00,
				IbftBank:      cfg.EscrowBank,
				IbanNumber:    cfg.EscrowIBAN,
				PaymentTerms:  "Net-15 via Meezan Islamic IBFT / RTGS",
				Status:        "UNPAID",
			}
			c.JSON(http.StatusCreated, gin.H{
				"message": "FBR tax invoice generated in simulation mode",
				"invoice": inv,
			})
			return
		}
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "database connection unavailable"})
		return
	}

	// 1. Fetch factory buyer_ntn from database (H3: Store buyer_ntn on the factory)
	var buyerNTN sql.NullString
	err := db.GlobalClients.DB.QueryRowContext(ctx, "SELECT buyer_ntn FROM factories WHERE id = $1", factoryID).Scan(&buyerNTN)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusNotFound, gin.H{"error": "factory not found"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error looking up factory"})
		return
	}
	actualBuyerNTN := "0814923-2"
	if buyerNTN.Valid && buyerNTN.String != "" {
		actualBuyerNTN = buyerNTN.String
	}

	// 2. Compute savings from the locked savings_records (H3)
	var grossSavings float64
	var feePkr float64
	savingsQuery := `
		SELECT gross_saving_pkr, fee_pkr
		FROM savings_records
		WHERE factory_id = $1 AND to_char(period_month, 'YYYY-MM') = $2 AND status IN ('LOCKED', 'AUDITED')
	`
	err = db.GlobalClients.DB.QueryRowContext(ctx, savingsQuery, factoryID, month).Scan(&grossSavings, &feePkr)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			c.JSON(http.StatusBadRequest, gin.H{
				"error": fmt.Sprintf("no locked savings record exists for factory '%s' in month '%s'; audit and lock ledger before billing", factoryID, month),
			})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error verifying savings records"})
		return
	}

	if grossSavings <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "gross savings for this period is zero or negative; no invoice generated",
		})
		return
	}

	// Standard fee (20%) and sales tax (16%)
	gainShareFee := feePkr
	if gainShareFee <= 0 {
		gainShareFee = grossSavings * 0.20
	}
	salesTax := gainShareFee * 0.16
	totalPayable := gainShareFee + salesTax

	// 3. Sequential invoice number from DB sequence (H3: invoice_seq)
	tx, err := db.GlobalClients.DB.BeginTx(ctx, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to begin database transaction"})
		return
	}
	defer tx.Rollback()

	var seqVal int64
	err = tx.QueryRowContext(ctx, "SELECT nextval('invoice_seq')").Scan(&seqVal)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to allocate sequential invoice number"})
		return
	}
	invNumber := fmt.Sprintf("WW-INV-%s-%04d", month, seqVal)

	inv := TaxInvoice{
		InvoiceNumber: invNumber,
		IssueDate:     time.Now().UTC(),
		DueDate:       time.Now().UTC().Add(15 * 24 * time.Hour),
		SellerNTN:     cfg.SellerNTN,
		SellerSTRN:    cfg.SellerSTRN,
		BuyerNTN:      actualBuyerNTN,
		HsnCode:       "9983.15 (Energy Management & IT Optimization)",
		GrossSavings:  grossSavings,
		GainShareFee:  gainShareFee,
		SalesTaxPkr:   salesTax,
		TotalPayable:  totalPayable,
		IbftBank:      cfg.EscrowBank,
		IbanNumber:    cfg.EscrowIBAN,
		PaymentTerms:  "Net-15 via Meezan Islamic IBFT / RTGS",
		Status:        "UNPAID",
	}

	// 4. Run insert in transaction; handle unique constraint (factory_id, month) -> 409 Conflict
	insertQuery := `
		INSERT INTO invoices (
			id, invoice_number, factory_id, month, seller_ntn, seller_strn, buyer_ntn,
			verified_savings_pkr, base_fee_pkr, sales_tax_pkr, total_payable_pkr, bank_name, iban, status
		)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
	`
	_, err = tx.ExecContext(
		ctx, insertQuery,
		uuid.New().String(), inv.InvoiceNumber, factoryID, month,
		inv.SellerNTN, inv.SellerSTRN, inv.BuyerNTN,
		inv.GrossSavings, inv.GainShareFee, inv.SalesTaxPkr, inv.TotalPayable,
		inv.IbftBank, inv.IbanNumber, inv.Status,
	)
	if err != nil {
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23505" {
			c.JSON(http.StatusConflict, gin.H{
				"error": fmt.Sprintf("an invoice has already been generated for factory '%s' in month '%s'", factoryID, month),
			})
			return
		}
		log.Error().Err(err).Msg("Failed to persist generated invoice in transaction")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database transaction failed to save invoice"})
		return
	}

	if err := tx.Commit(); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to commit invoice transaction"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "FBR tax invoice generated successfully",
		"invoice": inv,
	})
}
