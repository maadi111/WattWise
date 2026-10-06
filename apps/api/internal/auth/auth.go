package auth

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"

	"github.com/wattwise/api/internal/config"
)

type CustomClaims struct {
	UserID     string   `json:"user_id"`
	Email      string   `json:"email"`
	Role       string   `json:"role"`
	TenantID   string   `json:"tenant_id,omitempty"`
	FactoryIDs []string `json:"factory_ids"`
	jwt.RegisteredClaims
}

// UserClaims alias for backward compatibility and test suites
type UserClaims = CustomClaims

func (c *CustomClaims) HasFactory(factoryID string) bool {
	if c.Role == "super_admin" {
		return true
	}
	if c.TenantID != "" && c.TenantID == factoryID {
		return true
	}
	for _, id := range c.FactoryIDs {
		if id == factoryID {
			return true
		}
	}
	return false
}

type UserRecord struct {
	ID           string    `json:"id"`
	Email        string    `json:"email"`
	FullName     string    `json:"full_name"`
	PasswordHash string    `json:"-"`
	Role         string    `json:"role"`
	TenantID     string    `json:"tenant_id,omitempty"`
	FactoryIDs   []string  `json:"factory_ids"`
	CreatedAt    time.Time `json:"created_at"`
}

type UserStore struct {
	mu    sync.RWMutex
	users map[string]UserRecord
}

var globalStore = &UserStore{
	users: make(map[string]UserRecord),
}

func init() {
	// Initialize default bootstrap users with real argon2id hashes
	// Default password for seeded users is "WattWise2026!#"
	defaultHash, _ := HashPassword("WattWise2026!#")

	globalStore.users["admin@wattwise.pk"] = UserRecord{
		ID:           "11111111-1111-1111-1111-111111111111",
		Email:        "admin@wattwise.pk",
		FullName:     "Hammad Raza (CTO)",
		PasswordHash: defaultHash,
		Role:         "super_admin",
		TenantID:     "all",
		FactoryIDs:   []string{"fsd_mill_001", "slk_surg_002", "lhr_steel_003"},
		CreatedAt:    time.Now().UTC(),
	}

	globalStore.users["owner@crescentmills.com.pk"] = UserRecord{
		ID:           "22222222-2222-2222-2222-222222222222",
		Email:        "owner@crescentmills.com.pk",
		FullName:     "Mian Tariq Crescent (Mill Owner)",
		PasswordHash: defaultHash,
		Role:         "factory_owner",
		TenantID:     "fsd_mill_001",
		FactoryIDs:   []string{"fsd_mill_001"},
		CreatedAt:    time.Now().UTC(),
	}

	globalStore.users["ops@crescentmills.com.pk"] = UserRecord{
		ID:           "33333333-3333-3333-3333-333333333333",
		Email:        "ops@crescentmills.com.pk",
		FullName:     "Engr. Rashid (Plant Manager)",
		PasswordHash: defaultHash,
		Role:         "factory_manager",
		TenantID:     "fsd_mill_001",
		FactoryIDs:   []string{"fsd_mill_001"},
		CreatedAt:    time.Now().UTC(),
	}
}

type LoginReq struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Login(c *gin.Context) {
	var req LoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: email and password are required"})
		return
	}

	ctx := c.Request.Context()
	user, err := globalUserRepo.FindByEmail(ctx, req.Email)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	// Verify password hash via argon2id (or fallback bcrypt)
	valid, err := VerifyPassword(req.Password, user.PasswordHash)
	if err != nil || !valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	expiryDuration := time.Duration(config.AppConfig.JWTExpiryMinutes) * time.Minute

	// Generate real signed access token with RS256
	tenantID := user.TenantID
	if tenantID == "" && len(user.FactoryIDs) > 0 {
		tenantID = user.FactoryIDs[0]
	}

	claims := CustomClaims{
		UserID:     user.ID,
		Email:      user.Email,
		Role:       user.Role,
		TenantID:   tenantID,
		FactoryIDs: user.FactoryIDs,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiryDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "wattwise.pk",
			Subject:   user.ID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	tokenString, err := token.SignedString(GetRSAPrivateKey())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not issue authentication token"})
		return
	}

	// Rotate and save refresh token in Redis
	refreshUUID := uuid.New().String()
	tokenTTL := 7 * 24 * time.Hour
	_ = GetGlobalTokenStore().Store(ctx, refreshUUID, user.ID, tokenTTL)

	// Set cryptographically secure UUID refresh token in cookie
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(
		"ww_refresh",
		refreshUUID,
		int(tokenTTL.Seconds()),
		"/v1/auth",
		"",
		config.AppConfig.CookieSecure,
		true, // HttpOnly
	)

	c.JSON(http.StatusOK, gin.H{
		"access_token": tokenString,
		"expires_in":   int(expiryDuration.Seconds()),
		"token_type":   "Bearer",
		"user": gin.H{
			"id":          user.ID,
			"email":       user.Email,
			"full_name":   user.FullName,
			"role":        user.Role,
			"tenant_id":   tenantID,
			"factory_ids": user.FactoryIDs,
		},
	})
}

type RegisterReq struct {
	Email      string   `json:"email" binding:"required"`
	Password   string   `json:"password" binding:"required"`
	FullName   string   `json:"full_name" binding:"required"`
	Role       string   `json:"role"`
	TenantID   string   `json:"tenant_id"`
	FactoryIDs []string `json:"factory_ids"`
}

func Register(c *gin.Context) {
	var req RegisterReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid registration data"})
		return
	}

	if len(req.Password) < 8 {
		c.JSON(http.StatusBadRequest, gin.H{"error": "password must be at least 8 characters"})
		return
	}

	globalStore.mu.Lock()
	defer globalStore.mu.Unlock()

	if _, exists := globalStore.users[req.Email]; exists {
		c.JSON(http.StatusConflict, gin.H{"error": "user with this email already exists"})
		return
	}

	hashedStr, err := HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to secure password with argon2id"})
		return
	}

	role := req.Role
	if role == "" {
		role = "factory_manager"
	}

	newID := uuid.New().String()
	user := UserRecord{
		ID:           newID,
		Email:        req.Email,
		FullName:     req.FullName,
		PasswordHash: hashedStr,
		Role:         role,
		TenantID:     req.TenantID,
		FactoryIDs:   req.FactoryIDs,
		CreatedAt:    time.Now().UTC(),
	}

	globalStore.users[req.Email] = user

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"id":        user.ID,
			"email":     user.Email,
			"full_name": user.FullName,
			"role":      user.Role,
			"tenant_id": user.TenantID,
		},
	})
}

func Refresh(c *gin.Context) {
	cookie, err := c.Cookie("ww_refresh")
	if err != nil || cookie == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing refresh token cookie"})
		return
	}

	ctx := c.Request.Context()
	tokenTTL := 7 * 24 * time.Hour
	newToken, userID, err := GetGlobalTokenStore().Rotate(ctx, cookie, tokenTTL)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid or expired refresh token"})
		return
	}

	user, err := globalUserRepo.FindByID(ctx, userID)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "user associated with token not found"})
		return
	}

	expiryDuration := time.Duration(config.AppConfig.JWTExpiryMinutes) * time.Minute

	tenantID := user.TenantID
	if tenantID == "" && len(user.FactoryIDs) > 0 {
		tenantID = user.FactoryIDs[0]
	}

	claims := CustomClaims{
		UserID:     user.ID,
		Email:      user.Email,
		Role:       user.Role,
		TenantID:   tenantID,
		FactoryIDs: user.FactoryIDs,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiryDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "wattwise.pk",
			Subject:   user.ID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	tokenString, err := token.SignedString(GetRSAPrivateKey())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not issue refreshed token"})
		return
	}

	// Update cookie with rotated token
	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(
		"ww_refresh",
		newToken,
		int(tokenTTL.Seconds()),
		"/v1/auth",
		"",
		config.AppConfig.CookieSecure,
		true,
	)

	c.JSON(http.StatusOK, gin.H{
		"access_token": tokenString,
		"expires_in":   int(expiryDuration.Seconds()),
		"token_type":   "Bearer",
	})
}

func Logout(c *gin.Context) {
	ctx := c.Request.Context()
	cookie, _ := c.Cookie("ww_refresh")
	if cookie != "" {
		_ = GetGlobalTokenStore().Revoke(ctx, cookie)
	}

	c.SetSameSite(http.SameSiteStrictMode)
	c.SetCookie(
		"ww_refresh",
		"",
		-1,
		"/v1/auth",
		"",
		config.AppConfig.CookieSecure,
		true,
	)

	c.JSON(http.StatusOK, gin.H{
		"message": "logged out successfully",
	})
}
