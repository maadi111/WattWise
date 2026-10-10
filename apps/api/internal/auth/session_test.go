package auth_test

import (
	"context"
	"database/sql"
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/wattwise/api/internal/auth"
	"github.com/wattwise/api/internal/testutil/pgtest"
)

func sign(t *testing.T, method jwt.SigningMethod, key any, c auth.CustomClaims) string {
	t.Helper()
	s, err := jwt.NewWithClaims(method, c).SignedString(key)
	require.NoError(t, err)
	return s
}

func claimsFor(u *auth.UserRecord, exp time.Time) auth.CustomClaims {
	return auth.CustomClaims{
		UserID: u.ID, Email: u.Email, Role: u.Role, FactoryIDs: u.FactoryIDs, TokenVersion: u.TokenVersion,
		RegisteredClaims: jwt.RegisteredClaims{ExpiresAt: jwt.NewNumericDate(exp), IssuedAt: jwt.NewNumericDate(time.Now()), Subject: u.ID},
	}
}

func TestAuthenticateAccessToken(t *testing.T) {
	auth.InitRSAKeys()
	conn := pgtest.Open(t)
	auth.InitUserRepository(conn)
	ctx := context.Background()

	repo := auth.GetUserRepository()
	user := &auth.UserRecord{ID: uuid.NewString(), Email: "u@company.pk", FullName: "U", PasswordHash: "x", Role: "super_admin", TokenVersion: 1}
	require.NoError(t, repo.CreateUser(ctx, user))
	fresh, err := repo.FindByID(ctx, user.ID)
	require.NoError(t, err)
	good := sign(t, jwt.SigningMethodRS256, auth.GetRSAPrivateKey(), claimsFor(fresh, time.Now().Add(time.Hour)))

	t.Run("valid token", func(t *testing.T) {
		c, err := auth.AuthenticateAccessToken(ctx, good)
		require.NoError(t, err)
		assert.Equal(t, user.ID, c.UserID)
	})
	t.Run("expired", func(t *testing.T) {
		tok := sign(t, jwt.SigningMethodRS256, auth.GetRSAPrivateKey(), claimsFor(fresh, time.Now().Add(-time.Minute)))
		_, err := auth.AuthenticateAccessToken(ctx, tok)
		assert.ErrorIs(t, err, auth.ErrInvalidToken)
	})
	t.Run("HS256 with a guessable secret", func(t *testing.T) {
		tok := sign(t, jwt.SigningMethodHS256, []byte("dev-secret-for-test"), claimsFor(fresh, time.Now().Add(time.Hour)))
		_, err := auth.AuthenticateAccessToken(ctx, tok)
		assert.ErrorIs(t, err, auth.ErrInvalidToken)
	})
	t.Run("garbage", func(t *testing.T) {
		_, err := auth.AuthenticateAccessToken(ctx, "not.a.jwt")
		assert.ErrorIs(t, err, auth.ErrInvalidToken)
	})
	t.Run("password change revokes older tokens immediately", func(t *testing.T) {
		require.NoError(t, repo.UpdatePassword(ctx, user.ID, "new-hash"))
		_, err := auth.AuthenticateAccessToken(ctx, good)
		assert.ErrorIs(t, err, auth.ErrSessionRevoked)
	})
	t.Run("deleted user", func(t *testing.T) {
		_, err := conn.Exec(`DELETE FROM users WHERE id = $1`, user.ID)
		require.NoError(t, err)
		_, err = auth.AuthenticateAccessToken(ctx, good)
		assert.ErrorIs(t, err, auth.ErrUserDeactivated)
	})
}

// If the user store cannot be consulted the token must NOT be trusted (fail closed).
func TestAuthenticateAccessTokenFailsClosedWhenUserStoreIsDown(t *testing.T) {
	auth.InitRSAKeys()
	broken, err := sql.Open("postgres", "postgres://nobody:x@127.0.0.1:1/none?sslmode=disable&connect_timeout=1")
	require.NoError(t, err)
	auth.InitUserRepository(broken)
	t.Cleanup(func() { auth.InitUserRepository(nil) })

	tok := sign(t, jwt.SigningMethodRS256, auth.GetRSAPrivateKey(),
		claimsFor(&auth.UserRecord{ID: "11111111-1111-1111-1111-111111111111", Role: "super_admin", TokenVersion: 1}, time.Now().Add(time.Hour)))
	_, err = auth.AuthenticateAccessToken(context.Background(), tok)
	assert.ErrorIs(t, err, auth.ErrAuthBackend)
}
