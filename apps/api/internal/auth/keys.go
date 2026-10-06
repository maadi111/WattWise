package auth

import (
	"crypto/rand"
	"crypto/rsa"
	"os"
	"sync"

	"github.com/golang-jwt/jwt/v5"
	"github.com/rs/zerolog/log"
)

var (
	rsaPrivateKey *rsa.PrivateKey
	rsaPublicKey  *rsa.PublicKey
	keysOnce      sync.Once
)

// InitRSAKeys loads RSA keys from environment PEM strings or generates an ephemeral 2048-bit RSA key pair
func InitRSAKeys() {
	keysOnce.Do(func() {
		privPEM := os.Getenv("RSA_PRIVATE_KEY_PEM")
		pubPEM := os.Getenv("RSA_PUBLIC_KEY_PEM")

		if privPEM != "" {
			privKey, err := jwt.ParseRSAPrivateKeyFromPEM([]byte(privPEM))
			if err != nil {
				log.Fatal().Err(err).Msg("FATAL: Failed to parse RSA_PRIVATE_KEY_PEM")
			}
			rsaPrivateKey = privKey
			rsaPublicKey = &privKey.PublicKey
			log.Info().Msg("Successfully loaded RS256 RSA keys from environment PEM")
			return
		}

		privPath := os.Getenv("RSA_PRIVATE_KEY_PATH")
		if privPath != "" {
			data, err := os.ReadFile(privPath)
			if err != nil {
				log.Fatal().Err(err).Msgf("FATAL: Failed to read RSA private key file at %s", privPath)
			}
			privKey, err := jwt.ParseRSAPrivateKeyFromPEM(data)
			if err != nil {
				log.Fatal().Err(err).Msg("FATAL: Failed to parse RSA private key from file")
			}
			rsaPrivateKey = privKey
			rsaPublicKey = &privKey.PublicKey
			log.Info().Msgf("Successfully loaded RS256 RSA keys from file %s", privPath)
			return
		}

		// Fallback: Generate secure 2048-bit RSA key pair dynamically
		log.Warn().Msg("SECURITY: No RSA_PRIVATE_KEY_PEM provided. Generating ephemeral 2048-bit RS256 key pair for session.")
		genKey, err := rsa.GenerateKey(rand.Reader, 2048)
		if err != nil {
			log.Fatal().Err(err).Msg("FATAL: Failed to generate ephemeral RSA key pair")
		}
		rsaPrivateKey = genKey
		rsaPublicKey = &genKey.PublicKey
		log.Info().Msg("Ephemeral 2048-bit RS256 key pair initialized successfully.")
	})
}

func GetRSAPrivateKey() *rsa.PrivateKey {
	if rsaPrivateKey == nil {
		InitRSAKeys()
	}
	return rsaPrivateKey
}

func GetRSAPublicKey() *rsa.PublicKey {
	if rsaPublicKey == nil {
		InitRSAKeys()
	}
	return rsaPublicKey
}
