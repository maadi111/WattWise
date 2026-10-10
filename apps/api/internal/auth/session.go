package auth

import (
	"context"
	"errors"

	"github.com/golang-jwt/jwt/v5"
)

var (
	ErrInvalidToken    = errors.New("invalid or expired token")
	ErrSessionRevoked  = errors.New("session invalidated due to password update or revocation")
	ErrUserDeactivated = errors.New("user account no longer exists or was deactivated")
	// ErrAuthBackend means the user store could not be consulted. Callers must fail closed.
	ErrAuthBackend = errors.New("authentication backend unavailable")
)

// AuthenticateAccessToken is the single place that turns a raw bearer token into trusted claims.
// It pins RS256, then checks the user still exists and the token_version has not been revoked.
// If the user store errors it fails closed (ErrAuthBackend) instead of letting the request through.
// When no user repository is configured (unit tests without a database) only the signature is checked.
func AuthenticateAccessToken(ctx context.Context, raw string) (*CustomClaims, error) {
	token, err := jwt.ParseWithClaims(raw, &CustomClaims{},
		func(t *jwt.Token) (interface{}, error) {
			if _, ok := t.Method.(*jwt.SigningMethodRSA); !ok {
				return nil, jwt.ErrSignatureInvalid
			}
			key := GetRSAPublicKey()
			if key == nil {
				return nil, jwt.ErrSignatureInvalid
			}
			return key, nil
		},
		jwt.WithValidMethods([]string{"RS256"}),
	)
	if err != nil || token == nil || !token.Valid {
		return nil, ErrInvalidToken
	}
	claims, ok := token.Claims.(*CustomClaims)
	if !ok {
		return nil, ErrInvalidToken
	}

	if repo := GetUserRepository(); repo != nil && claims.UserID != "" {
		user, err := repo.FindByID(ctx, claims.UserID)
		switch {
		case errors.Is(err, ErrUserNotFound):
			return nil, ErrUserDeactivated
		case err != nil:
			return nil, ErrAuthBackend
		case claims.TokenVersion < user.TokenVersion:
			return nil, ErrSessionRevoked
		}
	}
	return claims, nil
}
