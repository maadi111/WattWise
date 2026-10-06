package billing

import (
	"fmt"
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/wattwise/api/internal/config"
)

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
	DataSource     string  `json:"data_source"` // e.g. "SIMULATION_CALIBRATED" or "LIVE_METER"
}

type TaxInvoice struct {
	InvoiceNumber string    `json:"invoice_number"`
	IssueDate     time.Time `json:"issue_date"`
	DueDate       time.Time `json:"due_date"`
	SellerNTN     string    `json:"seller_ntn"`
	SellerSTRN    string    `json:"seller_strn"`
	BuyerNTN      string    `json:"buyer_ntn"`
	HsnCode       string    `json:"hsn_code"` // IT Service / Energy Audit
	GrossSavings  float64   `json:"gross_savings_pkr"`
	GainShareFee  float64   `json:"gain_share_fee_pkr"` // 20%
	SalesTaxPkr   float64   `json:"sales_tax_pkr"`      // PRA 16% on services
	TotalPayable  float64   `json:"total_payable_pkr"`
	IbftBank      string    `json:"ibft_bank"`
	IbanNumber    string    `json:"iban_number"`
	PaymentTerms  string    `json:"payment_terms"`
	Status        string    `json:"status"`
}

// TenantRegistry holds metadata for registered industrial customers
var tenantBuyerNTNs = map[string]string{
	"fsd_mill_001": "0814923-2", // Crescent Weaving & Dyeing Mills
	"slk_surg_002": "1938472-5", // Sialkot Precision Surgical
	"lhr_steel_003": "2491028-1", // Mughalpura Steel Re-Rolling
}

func getBuyerNTN(factoryID string) string {
	if ntn, ok := tenantBuyerNTNs[factoryID]; ok {
		return ntn
	}
	return "0000000-0"
}

func GetSavingsLedger(c *gin.Context) {
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
	cfg := config.AppConfig

	c.JSON(http.StatusOK, []TaxInvoice{
		{
			InvoiceNumber: "WW-INV-2026-09-0042",
			IssueDate:     time.Date(2026, 10, 5, 0, 0, 0, 0, time.UTC),
			DueDate:       time.Date(2026, 10, 20, 0, 0, 0, 0, time.UTC),
			SellerNTN:     cfg.SellerNTN,
			SellerSTRN:    cfg.SellerSTRN,
			BuyerNTN:      getBuyerNTN(factoryID),
			HsnCode:       "9983.15 (Energy Management & IT Optimization)",
			GrossSavings:  5260000.00,
			GainShareFee:  1052000.00,
			SalesTaxPkr:   168320.00, // 16% PRA
			TotalPayable:  1220320.00,
			IbftBank:      cfg.EscrowBank,
			IbanNumber:    cfg.EscrowIBAN,
			PaymentTerms:  "Net-15 Days via IBFT. Late fee: 1.5%/month markup.",
			Status:        "PAID",
		},
	})
}

func GenerateInvoice(c *gin.Context) {
	factoryID := c.Param("id")
	cfg := config.AppConfig

	inv := TaxInvoice{
		InvoiceNumber: fmt.Sprintf("WW-INV-%d-%s", time.Now().Unix(), factoryID),
		IssueDate:     time.Now().UTC(),
		DueDate:       time.Now().UTC().Add(15 * 24 * time.Hour),
		SellerNTN:     cfg.SellerNTN,
		SellerSTRN:    cfg.SellerSTRN,
		BuyerNTN:      getBuyerNTN(factoryID),
		HsnCode:       "9983.15",
		GrossSavings:  5260000.00,
		GainShareFee:  1052000.00,
		SalesTaxPkr:   168320.00,
		TotalPayable:  1220320.00,
		IbftBank:      cfg.EscrowBank,
		IbanNumber:    cfg.EscrowIBAN,
		PaymentTerms:  "Net-15 days. Reconcile via 1Link IBFT / Meezan Corporate API.",
		Status:        "ISSUED",
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":    "FBR-compliant tax invoice generated",
		"factory_id": factoryID,
		"invoice":    inv,
	})
}
