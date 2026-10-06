package auth

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

type CustomClaims struct {
	UserID     string   `json:"user_id"`
	Email      string   `json:"email"`
	Role       string   `json:"role"`
	FactoryIDs []string `json:"factory_ids"`
	jwt.RegisteredClaims
}

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

var sampleHmacSecret = []byte("wattwise_super_secret_jwt_key_pakistan_2026")

type LoginReq struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

func Login(c *gin.Context) {
	var req LoginReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payload"})
		return
	}

	// Demo user credentials mapping
	var role string
	var userID string
	var factoryIDs []string
	var fullName string

	if req.Email == "admin@wattwise.pk" {
		userID = "11111111-1111-1111-1111-111111111111"
		role = "super_admin"
		factoryIDs = []string{"fsd_mill_001", "slk_surg_002", "lhr_steel_003"}
		fullName = "Hammad (CTO)"
	} else if req.Email == "owner@crescentmills.com.pk" {
		userID = "22222222-2222-2222-2222-222222222222"
		role = "factory_owner"
		factoryIDs = []string{"fsd_mill_001"}
		fullName = "Mian Tariq (Mill Owner)"
	} else if req.Email == "ops@crescentmills.com.pk" {
		userID = "33333333-3333-3333-3333-333333333333"
		role = "factory_manager"
		factoryIDs = []string{"fsd_mill_001"}
		fullName = "Engr. Rashid (Plant Manager)"
	} else {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "invalid email or password"})
		return
	}

	// Generate 15-minute access token
	claims := CustomClaims{
		UserID:     userID,
		Email:      req.Email,
		Role:       role,
		FactoryIDs: factoryIDs,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(15 * time.Minute)),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Issuer:    "wattwise.pk",
			Subject:   userID,
		},
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(sampleHmacSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "could not issue token"})
		return
	}

	// Set 7-day refresh token in HttpOnly secure cookie
	c.SetCookie("ww_refresh", "sample_refresh_token_uuid", 7*24*3600, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"access_token": tokenString,
		"expires_in":   900, // 15 mins
		"user": gin.H{
			"id":          userID,
			"email":       req.Email,
			"full_name":   fullName,
			"role":        role,
			"factory_ids": factoryIDs,
		},
	})
}

func Register(c *gin.Context) {
	c.JSON(http.StatusCreated, gin.H{"message": "User registered successfully"})
}

func Refresh(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{"access_token": "refreshed_jwt_token", "expires_in": 900})
}
