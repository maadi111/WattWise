package auth

import (
	"errors"
	"net/http"
	"net/mail"
	"strings"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/lib/pq"
	"github.com/rs/zerolog/log"

	"github.com/wattwise/api/internal/config"
)

// Precomputed Argon2id dummy hash for timing mitigation (H8)
const dummyArgon2Hash = "$argon2id$v=19$m=65536,t=3,p=4$ZHVtbXlzYWx0MTIzNDU2$O6b0WqT2pZ0vW5q3U9s1b8y7x6w5v4u3t2s1r0q9p8o"

var commonPasswordDenylist = map[string]bool{
	"password123456":                     true,
	"123456789012":                       true,
	"changethisstrongbootstrappassword":  true,
	"changethisstrongbootstrappassword2026!#": true,
	"wattwise2026!#":                     true,
	"administrator1":                     true,
	"qwertyuiop12":                       true,
	"letmein12345":                       true,
	"welcome12345":                       true,
}

type CustomClaims struct {
	UserID             string   `json:"user_id"`
	Email              string   `json:"email"`
	Role               string   `json:"role"`
	TenantID           string   `json:"tenant_id,omitempty"`
	FactoryIDs         []string `json:"factory_ids"`
	MustChangePassword bool     `json:"must_change_password"`
	TokenVersion       int      `json:"token_version"`
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
	ID                 string    `json:"id"`
	Email              string    `json:"email"`
	FullName           string    `json:"full_name"`
	PasswordHash       string    `json:"-"`
	Role               string    `json:"role"`
	TenantID           string    `json:"tenant_id,omitempty"`
	FactoryIDs         []string  `json:"factory_ids"`
	MustChangePassword bool      `json:"must_change_password"`
	TokenVersion       int       `json:"token_version"`
	CreatedAt          time.Time `json:"created_at"`
}

type LoginReq struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func validatePasswordStrength(password string) error {
	if len(password) < 12 {
		return errors.New("password must be at least 12 characters")
	}
	if commonPasswordDenylist[strings.ToLower(strings.TrimSpace(password))] {
		return errors.New("password is too common or easily guessable; please choose a stronger passphrase")
	}
	return nil
}

func validateEmail(email string) (string, error) {
	norm := strings.ToLower(strings.TrimSpace(email))
	addr, err := mail.ParseAddress(norm)
	if err != nil || addr.Address != norm || !strings.Contains(norm, ".") {
		return "", errors.New("invalid email address format")
	}
	return norm, nil
}

func Login(c *gin.Context) {
	var req LoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload: email and password are required"})
		return
	}

	normEmail, err := validateEmail(req.Email)
	if err != nil {
		// Run dummy argon2 verify to prevent timing enumeration (H8)
		_, _ = VerifyPassword(req.Password, dummyArgon2Hash)
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	ctx := c.Request.Context()
	if globalUserRepo == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "authentication database service unavailable"})
		return
	}

	user, err := globalUserRepo.FindByEmail(ctx, normEmail)
	if err != nil {
		// H8: Run dummy argon2 verify so unknown user takes identical ~160ms computation
		_, _ = VerifyPassword(req.Password, dummyArgon2Hash)
		if errors.Is(err, ErrUserNotFound) {
			log.Warn().Str("email", normEmail).Msg("Login failed: user not found")
		} else {
			log.Error().Err(err).Str("email", normEmail).Msg("Database query error during FindByEmail")
		}
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	// Verify password hash via argon2id
	valid, err := VerifyPassword(req.Password, user.PasswordHash)
	if err != nil || !valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	expiryDuration := time.Duration(config.AppConfig.JWTExpiryMinutes) * time.Minute

	tenantID := user.TenantID
	if tenantID == "" && len(user.FactoryIDs) > 0 {
		tenantID = user.FactoryIDs[0]
	}

	claims := CustomClaims{
		UserID:             user.ID,
		Email:              user.Email,
		Role:               user.Role,
		TenantID:           tenantID,
		FactoryIDs:         user.FactoryIDs,
		MustChangePassword: user.MustChangePassword,
		TokenVersion:       user.TokenVersion,
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

	// Rotate and save refresh token with family tracking (H7)
	refreshUUID := uuid.New().String()
	familyID := uuid.New().String()
	tokenTTL := 7 * 24 * time.Hour
	_ = GetGlobalTokenStore().Store(ctx, refreshUUID, user.ID, familyID, tokenTTL)

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
		"access_token":         tokenString,
		"expires_in":           int(expiryDuration.Seconds()),
		"token_type":           "Bearer",
		"must_change_password": user.MustChangePassword,
		"user": gin.H{
			"id":                   user.ID,
			"email":                user.Email,
			"full_name":            user.FullName,
			"role":                 user.Role,
			"tenant_id":            tenantID,
			"factory_ids":          user.FactoryIDs,
			"must_change_password": user.MustChangePassword,
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
	// Only super_admin can register/provision new accounts
	val, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "authentication required to provision users"})
		return
	}
	callerClaims, ok := val.(*CustomClaims)
	if !ok || callerClaims.Role != "super_admin" {
		c.JSON(http.StatusForbidden, gin.H{"error": "forbidden: only super_admin can register users"})
		return
	}

	var req RegisterReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid registration data"})
		return
	}

	normEmail, err := validateEmail(req.Email)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid email address: " + err.Error()})
		return
	}

	if err := validatePasswordStrength(req.Password); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	validRoles := map[string]bool{
		"super_admin":     true,
		"factory_owner":   true,
		"factory_manager": true,
		"viewer":          true,
	}
	role := req.Role
	if role == "" {
		role = "viewer"
	}
	if !validRoles[role] {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid role; must be super_admin, factory_owner, factory_manager, or viewer"})
		return
	}

	// M1: Non-admin roles must have at least one factory assignment
	if role != "super_admin" && len(req.FactoryIDs) == 0 && req.TenantID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "at least one factory assignment (factory_ids or tenant_id) is required for non-admin roles"})
		return
	}

	ctx := c.Request.Context()
	if globalUserRepo == nil {
		c.JSON(http.StatusServiceUnavailable, gin.H{"error": "database connection unavailable"})
		return
	}

	// Check if user already exists in PostgreSQL
	existing, _ := globalUserRepo.FindByEmail(ctx, normEmail)
	if existing != nil {
		c.JSON(http.StatusConflict, gin.H{"error": "user with this email already exists"})
		return
	}

	hashedStr, err := HashPassword(req.Password)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to secure password with argon2id"})
		return
	}

	newID := uuid.New().String()
	user := UserRecord{
		ID:                 newID,
		Email:              normEmail,
		FullName:           strings.TrimSpace(req.FullName),
		PasswordHash:       hashedStr,
		Role:               role,
		TenantID:           req.TenantID,
		FactoryIDs:         req.FactoryIDs,
		MustChangePassword: true, // M2: Admin-created users must change password on first login
		TokenVersion:       1,
		CreatedAt:          time.Now().UTC(),
	}

	if err := globalUserRepo.CreateUser(ctx, &user); err != nil {
		// M1: Map PG foreign key violation (23503) to 400 Bad Request
		var pqErr *pq.Error
		if errors.As(err, &pqErr) && pqErr.Code == "23503" {
			c.JSON(http.StatusBadRequest, gin.H{"error": "invalid factory_id: referenced factory does not exist in system"})
			return
		}
		log.Error().Err(err).Msg("Failed to persist user in database")
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not create user record in database"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "User registered successfully",
		"user": gin.H{
			"id":                   user.ID,
			"email":                user.Email,
			"full_name":            user.FullName,
			"role":                 user.Role,
			"tenant_id":            user.TenantID,
			"must_change_password": user.MustChangePassword,
		},
	})
}

type ChangePasswordReq struct {
	CurrentPassword string `json:"current_password" binding:"required"`
	NewPassword     string `json:"new_password" binding:"required"`
}

func ChangePassword(c *gin.Context) {
	var req ChangePasswordReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "current_password and new_password are required"})
		return
	}

	if err := validatePasswordStrength(req.NewPassword); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	claimsVal, exists := c.Get("claims")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	claims := claimsVal.(*CustomClaims)

	ctx := c.Request.Context()
	user, err := globalUserRepo.FindByID(ctx, claims.UserID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	valid, err := VerifyPassword(req.CurrentPassword, user.PasswordHash)
	if err != nil || !valid {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "current password incorrect"})
		return
	}

	newHash, err := HashPassword(req.NewPassword)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to hash new password"})
		return
	}

	// Update password and increment token_version in DB (H6, M4)
	if err := globalUserRepo.UpdatePassword(ctx, user.ID, newHash); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update password"})
		return
	}

	// H6: Revoke all existing refresh tokens for this user upon password change
	_ = GetGlobalTokenStore().RevokeAllForUser(ctx, user.ID)

	c.JSON(http.StatusOK, gin.H{"message": "password updated successfully"})
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
		if errors.Is(err, ErrTokenReused) {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "token reuse detected: all sessions revoked"})
			return
		}
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
		UserID:             user.ID,
		Email:              user.Email,
		Role:               user.Role,
		TenantID:           tenantID,
		FactoryIDs:         user.FactoryIDs,
		MustChangePassword: user.MustChangePassword,
		TokenVersion:       user.TokenVersion,
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
