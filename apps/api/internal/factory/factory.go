package factory

import (
	"database/sql"
	"net/http"
	"sync"

	"github.com/gin-gonic/gin"
	"github.com/lib/pq"
	"github.com/rs/zerolog/log"

	"github.com/wattwise/api/internal/auth"
	"github.com/wattwise/api/internal/config"
	"github.com/wattwise/api/internal/db"
)

type FactoryModel struct {
	ID            string  `json:"id"`
	Name          string  `json:"name"`
	Sector        string  `json:"sector"`
	City          string  `json:"city"`
	Disco         string  `json:"disco"`
	WapdaFeeder   string  `json:"wapda_feeder"`
	Plan          string  `json:"plan"`
	PeakLoadKw    float64 `json:"peak_load_kw"`
	GeneratorKva  float64 `json:"generator_kva"`
	GridRatePkr   float64 `json:"grid_rate_pkr"`
	DieselRatePkr float64 `json:"diesel_rate_pkr"`
	BuyerNTN      string  `json:"buyer_ntn,omitempty"`
}

type NodeModel struct {
	ID          string `json:"id"`
	FactoryID   string `json:"factory_id"`
	Label       string `json:"label"`
	Section     string `json:"section"`
	CtRangeA    int    `json:"ct_range_a"`
	Phase       int    `json:"phase"`
	Priority    string `json:"priority"`
	IsProtected bool   `json:"is_protected"`
}

var (
	devMu             sync.RWMutex
	devSimulationPool = []FactoryModel{
		{
			ID:            "fsd_mill_001",
			Name:          "Crescent Weaving & Dyeing Mills (Unit 4)",
			Sector:        "TEXTILE",
			City:          "Faisalabad",
			Disco:         "FESCO",
			WapdaFeeder:   "FSD-KHW-11KV-04 (Khurrianwala)",
			Plan:          "STARTER (GAIN-SHARE)",
			PeakLoadKw:    847.30,
			GeneratorKva:  1250.00,
			GridRatePkr:   32.50,
			DieselRatePkr: 94.20,
			BuyerNTN:      "0814923-2",
		},
		{
			ID:            "slk_surg_002",
			Name:          "Kashmir Surgical Instruments Ltd.",
			Sector:        "SURGICAL",
			City:          "Sialkot",
			Disco:         "GEPCO",
			WapdaFeeder:   "SLK-DSK-11KV-12 (Daska Road)",
			Plan:          "GROWTH (ANNUAL SAAS)",
			PeakLoadKw:    342.00,
			GeneratorKva:  500.00,
			GridRatePkr:   34.00,
			DieselRatePkr: 96.80,
			BuyerNTN:      "1938472-5",
		},
		{
			ID:            "lhr_steel_003",
			Name:          "Ittehad Steel Re-Rolling Mills",
			Sector:        "STEEL",
			City:          "Lahore",
			Disco:         "LESCO",
			WapdaFeeder:   "LHR-KSK-11KV-09 (Kala Shah Kaku)",
			Plan:          "ENTERPRISE",
			PeakLoadKw:    1480.00,
			GeneratorKva:  2200.00,
			GridRatePkr:   31.80,
			DieselRatePkr: 92.50,
			BuyerNTN:      "2491028-1",
		},
	}
)

func List(c *gin.Context) {
	val, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	claims := val.(*auth.CustomClaims)
	cfg := config.AppConfig

	// Execute real query against PostgreSQL if available
	if db.GlobalClients.DB != nil {
		ctx := c.Request.Context()
		query := `SELECT id, name, sector, city, disco, wapda_feeder, plan, peak_load_kw, generator_kva, grid_rate_pkr, diesel_rate_pkr, COALESCE(buyer_ntn, '') FROM factories`
		rows, err := db.GlobalClients.DB.QueryContext(ctx, query)
		if err != nil {
			log.Error().Err(err).Msg("Database query failed for factories")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error querying factories"})
			return
		}
		defer rows.Close()

		factories := make([]FactoryModel, 0)
		for rows.Next() {
			var f FactoryModel
			if scanErr := rows.Scan(
				&f.ID, &f.Name, &f.Sector, &f.City, &f.Disco,
				&f.WapdaFeeder, &f.Plan, &f.PeakLoadKw, &f.GeneratorKva,
				&f.GridRatePkr, &f.DieselRatePkr, &f.BuyerNTN,
			); scanErr == nil {
				if claims.HasFactory(f.ID) {
					factories = append(factories, f)
				}
			}
		}
		c.JSON(http.StatusOK, factories)
		return
	}

	// M6: Gate simulation fallback on cfg.IsSimulation; return 503 otherwise
	if cfg == nil || !cfg.IsSimulation {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "factory service unavailable and simulation mode is disabled"})
		return
	}

	devMu.RLock()
	defer devMu.RUnlock()
	var allowed []FactoryModel
	for _, f := range devSimulationPool {
		if claims.HasFactory(f.ID) {
			allowed = append(allowed, f)
		}
	}
	c.JSON(http.StatusOK, allowed)
}

func GetByID(c *gin.Context) {
	factoryID := c.Param("id")
	cfg := config.AppConfig

	if db.GlobalClients.DB != nil {
		ctx := c.Request.Context()
		query := `SELECT id, name, sector, city, disco, wapda_feeder, plan, peak_load_kw, generator_kva, grid_rate_pkr, diesel_rate_pkr, COALESCE(buyer_ntn, '') FROM factories WHERE id = $1`
		var f FactoryModel
		err := db.GlobalClients.DB.QueryRowContext(ctx, query, factoryID).Scan(
			&f.ID, &f.Name, &f.Sector, &f.City, &f.Disco,
			&f.WapdaFeeder, &f.Plan, &f.PeakLoadKw, &f.GeneratorKva,
			&f.GridRatePkr, &f.DieselRatePkr, &f.BuyerNTN,
		)
		if err == nil {
			c.JSON(http.StatusOK, f)
			return
		}
		if err == sql.ErrNoRows {
			c.JSON(http.StatusNotFound, gin.H{"error": "factory not found"})
			return
		}
		log.Error().Err(err).Msg("Database query error for factory lookup")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "database error querying factory"})
		return
	}

	// M6: Gate simulation fallback on cfg.IsSimulation
	if cfg == nil || !cfg.IsSimulation {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "factory service unavailable and simulation mode is disabled"})
		return
	}

	devMu.RLock()
	defer devMu.RUnlock()
	for _, f := range devSimulationPool {
		if f.ID == factoryID {
			c.JSON(http.StatusOK, f)
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "factory not found"})
}

func ListNodes(c *gin.Context) {
	factoryID := c.Param("id")
	cfg := config.AppConfig

	if db.GlobalClients.DB != nil {
		ctx := c.Request.Context()
		query := `SELECT id, factory_id, label, section, ct_range_a, phase, priority, is_protected FROM sensor_nodes WHERE factory_id = $1`
		rows, err := db.GlobalClients.DB.QueryContext(ctx, query, factoryID)
		if err != nil {
			log.Error().Err(err).Msg("Database query error for sensor nodes")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error querying sensor nodes"})
			return
		}
		defer rows.Close()

		nodes := make([]NodeModel, 0)
		for rows.Next() {
			var n NodeModel
			if scanErr := rows.Scan(
				&n.ID, &n.FactoryID, &n.Label, &n.Section,
				&n.CtRangeA, &n.Phase, &n.Priority, &n.IsProtected,
			); scanErr == nil {
				nodes = append(nodes, n)
			}
		}
		c.JSON(http.StatusOK, nodes)
		return
	}

	// M6: Gate simulation fallback
	if cfg == nil || !cfg.IsSimulation {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "sensor node service unavailable and simulation mode is disabled"})
		return
	}

	nodes := []NodeModel{
		{ID: "node_01", FactoryID: factoryID, Label: "Weaving Shed A (Airjet Looms 1-40)", Section: "Weaving Department", CtRangeA: 600, Phase: 3, Priority: "ESSENTIAL", IsProtected: false},
		{ID: "node_02", FactoryID: factoryID, Label: "High-Temperature Dyeing Vats 1-4", Section: "Dyeing & Chemical Unit", CtRangeA: 600, Phase: 3, Priority: "CRITICAL_PROTECTED", IsProtected: true},
		{ID: "node_03", FactoryID: factoryID, Label: "Weaving Shed B (Rapier Looms 41-80)", Section: "Weaving Department", CtRangeA: 200, Phase: 3, Priority: "ESSENTIAL", IsProtected: false},
		{ID: "node_04", FactoryID: factoryID, Label: "Stenter Heat-Setting Frame", Section: "Finishing Department", CtRangeA: 200, Phase: 3, Priority: "CRITICAL_PROTECTED", IsProtected: true},
		{ID: "node_05", FactoryID: factoryID, Label: "Atlas Copco Screw Air Compressors", Section: "Utility Services", CtRangeA: 200, Phase: 3, Priority: "SHEDDABLE_NON_CRITICAL", IsProtected: false},
		{ID: "node_06", FactoryID: factoryID, Label: "Central Chiller & Admin HVAC", Section: "Facility Comfort", CtRangeA: 200, Phase: 3, Priority: "SHEDDABLE_NON_CRITICAL", IsProtected: false},
	}
	c.JSON(http.StatusOK, nodes)
}

func Create(c *gin.Context) {
	val, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	claims, ok := val.(*auth.CustomClaims)
	if !ok || claims.Role != "super_admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden: only super_admin can create new factories"})
		return
	}

	var f FactoryModel
	if err := c.ShouldBindJSON(&f); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid factory payload"})
		return
	}

	if f.ID == "" || f.Name == "" || f.Sector == "" || f.City == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "factory id, name, sector, and city are mandatory fields"})
		return
	}
	if f.PeakLoadKw <= 0 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "peak_load_kw must be greater than zero"})
		return
	}

	if db.GlobalClients.DB != nil {
		ctx := c.Request.Context()
		insertQuery := `
			INSERT INTO factories (id, name, sector, city, disco, wapda_feeder, plan, peak_load_kw, generator_kva, grid_rate_pkr, diesel_rate_pkr, buyer_ntn)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
		`
		_, err := db.GlobalClients.DB.ExecContext(
			ctx, insertQuery,
			f.ID, f.Name, f.Sector, f.City, f.Disco, f.WapdaFeeder,
			f.Plan, f.PeakLoadKw, f.GeneratorKva, f.GridRatePkr, f.DieselRatePkr, f.BuyerNTN,
		)
		if err != nil {
			if pqErr, ok := err.(*pq.Error); ok && pqErr.Code == "23505" {
				c.JSON(http.StatusConflict, gin.H{"error": "factory with this ID already exists", "factory_id": f.ID})
				return
			}
			log.Error().Err(err).Msg("Failed to persist factory to PostgreSQL")
			c.JSON(http.StatusInternalServerError, gin.H{"error": "database error creating factory"})
			return
		}
		c.JSON(http.StatusCreated, f)
		return
	}

	cfg := config.AppConfig
	if cfg == nil || !cfg.IsSimulation {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "database unavailable and simulation mode is disabled"})
		return
	}

	devMu.Lock()
	defer devMu.Unlock()
	for _, existing := range devSimulationPool {
		if existing.ID == f.ID {
			c.JSON(http.StatusConflict, gin.H{"error": "factory with this ID already exists", "factory_id": f.ID})
			return
		}
	}

	devSimulationPool = append(devSimulationPool, f)
	c.JSON(http.StatusCreated, f)
}
