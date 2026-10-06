package auth

import (
	"net/http"
	"sync"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"

	"github.com/wattwise/api/internal/config"
)

type CustomClaims struct {
	UserID     string   `json:"user_id"`
	Email      string   `json:"email"`
	Role       string   `json:"role"`
	FactoryIDs []string `json:"factory_ids"`
	jwt.RegisteredClaims
}

// UserClaims alias for backward compatibility and test suites
type UserClaims = CustomClaims

func (c *CustomClaims) HasFactory(factoryID string) bool {
	if c.Role == "super_admin" {
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
	ID           string   `json:"id"`
	Email        string   `json:"email"`
	FullName     string   `json:"full_name"`
	PasswordHash string   `json:"-"`
	Role         string   `json:"role"`
	FactoryIDs   []string `json:"factory_ids"`
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
	// Initialize default bootstrap users with real bcrypt hashes
	// Default password for seeded users is "WattWise2026!#"
	hashedPw, _ := bcrypt.GenerateFromPassword([]byte("WattWise2026!#"), bcrypt.DefaultCost)
	defaultHash := string(hashedPw)

	globalStore.users["admin@wattwise.pk"] = UserRecord{
		ID:           "11111111-1111-1111-1111-111111111111",
		Email:        "admin@wattwise.pk",
		FullName:     "Hammad Raza (CTO)",
		PasswordHash: defaultHash,
		Role:         "super_admin",
		FactoryIDs:   []string{"fsd_mill_001", "slk_surg_002", "lhr_steel_003"},
		CreatedAt:    time.Now().UTC(),
	}

	globalStore.users["owner@crescentmills.com.pk"] = UserRecord{
		ID:           "22222222-2222-2222-2222-222222222222",
		Email:        "owner@crescentmills.com.pk",
		FullName:     "Mian Tariq Crescent (Mill Owner)",
		PasswordHash: defaultHash,
		Role:         "factory_owner",
		FactoryIDs:   []string{"fsd_mill_001"},
		CreatedAt:    time.Now().UTC(),
	}

	globalStore.users["ops@crescentmills.com.pk"] = UserRecord{
		ID:           "33333333-3333-3333-3333-333333333333",
		Email:        "ops@crescentmills.com.pk",
		FullName:     "Engr. Rashid (Plant Manager)",
		PasswordHash: defaultHash,
		Role:         "factory_manager",
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

	globalStore.mu.RLock()
	user, exists := globalStore.users[req.Email]
	globalStore.mu.RUnlock()

	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	// Verify password hash via bcrypt
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	jwtSecret := config.AppConfig.JWTSecret
	expiryDuration := time.Duration(config.AppConfig.JWTExpiryMinutes) * time.Minute

	// Generate real signed access token
	claims := CustomClaims{
		UserID:     user.ID,
		Email:      user.Email,
		Role:       user.Role,
		FactoryIDs: user.FactoryIDs,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiryDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "wattwise.pk",
			Subject:   user.ID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not issue authentication token"})
		return
	}

	// Set cryptographically secure UUID refresh token in cookie
	refreshUUID := uuid.New().String()
	c.SetCookie(
		"ww_refresh",
		refreshUUID,
		7*24*3600,
		"/v1/auth/refresh",
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
			"factory_ids": user.FactoryIDs,
		},
	})
}

type RegisterReq struct {
	Email      string   `json:"email" binding:"required"`
	Password   string   `json:"password" binding:"required"`
	FullName   string   `json:"full_name" binding:"required"`
	Role       string   `json:"role"`
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

	hashedBytes, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to secure password"})
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
		PasswordHash: string(hashedBytes),
		Role:         role,
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
		},
	})
}

func Refresh(c *gin.Context) {
	cookie, err := c.Cookie("ww_refresh")
	if err != nil || cookie == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "missing refresh token cookie"})
		return
	}

	// Issue a new token with refreshed expiry
	jwtSecret := config.AppConfig.JWTSecret
	expiryDuration := time.Duration(config.AppConfig.JWTExpiryMinutes) * time.Minute

	claims := CustomClaims{
		UserID: "11111111-1111-1111-1111-111111111111",
		Email:  "admin@wattwise.pk",
		Role:   "super_admin",
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(expiryDuration)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "wattwise.pk",
			Subject:   "11111111-1111-1111-1111-111111111111",
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not issue refreshed token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"access_token": tokenString,
		"expires_in":   int(expiryDuration.Seconds()),
		"token_type":   "Bearer",
	})
}
