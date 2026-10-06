package factory

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/wattwise/api/internal/auth"
)

type FactoryModel struct {
	ID             string  `json:"id"`
	Name           string  `json:"name"`
	Sector         string  `json:"sector"`
	City           string  `json:"city"`
	Disco          string  `json:"disco"`
	WapdaFeeder    string  `json:"wapda_feeder"`
	Plan           string  `json:"plan"`
	PeakLoadKw     float64 `json:"peak_load_kw"`
	GeneratorKva   float64 `json:"generator_kva"`
	GridRatePkr    float64 `json:"grid_rate_pkr"`
	DieselRatePkr  float64 `json:"diesel_rate_pkr"`
}

type NodeModel struct {
	ID          string  `json:"id"`
	FactoryID   string  `json:"factory_id"`
	Label       string  `json:"label"`
	Section     string  `json:"section"`
	CtRangeA    int     `json:"ct_range_a"`
	Phase       int     `json:"phase"`
	Priority    string  `json:"priority"`
	IsProtected bool    `json:"is_protected"`
}

var sampleFactories = []FactoryModel{
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
	},
}

func List(c *gin.Context) {
	val, _ := c.Get("claims")
	claims := val.(*auth.CustomClaims)

	var allowed []FactoryModel
	for _, f := range sampleFactories {
		if claims.HasFactory(f.ID) {
			allowed = append(allowed, f)
		}
	}
	c.JSON(http.StatusOK, allowed)
}

func GetByID(c *gin.Context) {
	factoryID := c.Param("id")
	for _, f := range sampleFactories {
		if f.ID == factoryID {
			c.JSON(http.StatusOK, f)
			return
		}
	}
	c.JSON(http.StatusNotFound, gin.H{"error": "factory not found"})
}

func Create(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"message": "Factory registered in tenant catalog"})
}

func ListNodes(c *gin.Context) {
	factoryID := c.Param("id")
	c.JSON(http.StatusOK, []NodeModel{
		{ID: "node_01", FactoryID: factoryID, Label: "Weaving Shed A (Airjet Looms 1-40)", Section: "Weaving Department", CtRangeA: 600, Phase: 3, Priority: "ESSENTIAL", IsProtected: false},
		{ID: "node_02", FactoryID: factoryID, Label: "High-Temperature Dyeing Vats 1-4", Section: "Dyeing & Chemical Unit", CtRangeA: 600, Phase: 3, Priority: "CRITICAL_PROTECTED", IsProtected: true},
		{ID: "node_03", FactoryID: factoryID, Label: "Weaving Shed B (Rapier Looms 41-80)", Section: "Weaving Department", CtRangeA: 200, Phase: 3, Priority: "ESSENTIAL", IsProtected: false},
		{ID: "node_04", FactoryID: factoryID, Label: "Stenter Heat-Setting Frame", Section: "Finishing Department", CtRangeA: 200, Phase: 3, Priority: "CRITICAL_PROTECTED", IsProtected: true},
		{ID: "node_05", FactoryID: factoryID, Label: "Atlas Copco Screw Air Compressors", Section: "Utility Services", CtRangeA: 200, Phase: 3, Priority: "SHEDDABLE_NON_CRITICAL", IsProtected: false},
		{ID: "node_06", FactoryID: factoryID, Label: "Central Chiller & Admin HVAC", Section: "Facility Comfort", CtRangeA: 200, Phase: 3, Priority: "SHEDDABLE_NON_CRITICAL", IsProtected: false},
	})
}
