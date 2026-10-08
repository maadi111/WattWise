package auth

import (
	"context"
	"errors"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
	"github.com/rs/zerolog/log"
)

var (
	ErrInvalidRefreshToken = errors.New("invalid or expired refresh token")
	ErrTokenReused          = errors.New("refresh token reuse detected: entire token family revoked")
)

type TokenStore interface {
	Store(ctx context.Context, token string, userID string, familyID string, ttl time.Duration) error
	Rotate(ctx context.Context, oldToken string, ttl time.Duration) (newToken string, userID string, err error)
	Revoke(ctx context.Context, token string) error
	RevokeAllForUser(ctx context.Context, userID string) error
	RevokeFamily(ctx context.Context, familyID string) error
}

type RedisTokenStore struct {
	client *redis.Client
}

func NewRedisTokenStore(client *redis.Client) *RedisTokenStore {
	return &RedisTokenStore{client: client}
}

func (s *RedisTokenStore) Store(ctx context.Context, token string, userID string, familyID string, ttl time.Duration) error {
	pipe := s.client.TxPipeline()
	pipe.Set(ctx, "refresh:"+token, userID+":"+familyID, ttl)
	pipe.Set(ctx, "family:"+familyID, token, ttl)
	pipe.SAdd(ctx, "user_families:"+userID, familyID)
	pipe.Expire(ctx, "user_families:"+userID, 30*24*time.Hour)
	_, err := pipe.Exec(ctx)
	return err
}

func (s *RedisTokenStore) Rotate(ctx context.Context, oldToken string, ttl time.Duration) (string, string, error) {
	val, err := s.client.Get(ctx, "refresh:"+oldToken).Result()
	if err != nil {
		// Check if this token was previously rotated (H7: reuse detection)
		familyID, usedErr := s.client.Get(ctx, "used_refresh:"+oldToken).Result()
		if usedErr == nil && familyID != "" {
			log.Warn().Str("family_id", familyID).Msg("SECURITY ALERT: Refresh token reuse detected! Revoking token family.")
			_ = s.RevokeFamily(ctx, familyID)
			return "", "", ErrTokenReused
		}
		return "", "", ErrInvalidRefreshToken
	}

	parts := strings.Split(val, ":")
	if len(parts) != 2 {
		return "", "", ErrInvalidRefreshToken
	}
	userID := parts[0]
	familyID := parts[1]

	newToken := uuid.New().String()

	pipe := s.client.TxPipeline()
	pipe.Del(ctx, "refresh:"+oldToken)
	// Mark old token as used for 24h to catch replays
	pipe.Set(ctx, "used_refresh:"+oldToken, familyID, 24*time.Hour)
	pipe.Set(ctx, "refresh:"+newToken, userID+":"+familyID, ttl)
	pipe.Set(ctx, "family:"+familyID, newToken, ttl)
	_, err = pipe.Exec(ctx)
	if err != nil {
		return "", "", err
	}

	return newToken, userID, nil
}

func (s *RedisTokenStore) Revoke(ctx context.Context, token string) error {
	val, err := s.client.Get(ctx, "refresh:"+token).Result()
	if err == nil {
		parts := strings.Split(val, ":")
		if len(parts) == 2 {
			_ = s.RevokeFamily(ctx, parts[1])
		}
	}
	return s.client.Del(ctx, "refresh:"+token).Err()
}

func (s *RedisTokenStore) RevokeFamily(ctx context.Context, familyID string) error {
	activeToken, _ := s.client.Get(ctx, "family:"+familyID).Result()
	pipe := s.client.TxPipeline()
	if activeToken != "" {
		pipe.Del(ctx, "refresh:"+activeToken)
	}
	pipe.Del(ctx, "family:"+familyID)
	_, err := pipe.Exec(ctx)
	return err
}

func (s *RedisTokenStore) RevokeAllForUser(ctx context.Context, userID string) error {
	families, err := s.client.SMembers(ctx, "user_families:"+userID).Result()
	if err == nil {
		for _, fam := range families {
			_ = s.RevokeFamily(ctx, fam)
		}
	}
	return s.client.Del(ctx, "user_families:"+userID).Err()
}

// MemoryTokenStore thread-safe fallback with family reuse detection
type MemoryTokenStore struct {
	mu           sync.RWMutex
	tokens       map[string]memoryTokenEntry
	usedTokens   map[string]string // oldToken -> familyID
	familyActive map[string]string // familyID -> current active token
	userFamilies map[string]map[string]bool
}

type memoryTokenEntry struct {
	userID    string
	familyID  string
	expiresAt time.Time
}

func NewMemoryTokenStore() *MemoryTokenStore {
	return &MemoryTokenStore{
		tokens:       make(map[string]memoryTokenEntry),
		usedTokens:   make(map[string]string),
		familyActive: make(map[string]string),
		userFamilies: make(map[string]map[string]bool),
	}
}

func (s *MemoryTokenStore) Store(ctx context.Context, token string, userID string, familyID string, ttl time.Duration) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	s.tokens[token] = memoryTokenEntry{
		userID:    userID,
		familyID:  familyID,
		expiresAt: time.Now().Add(ttl),
	}
	s.familyActive[familyID] = token
	if _, ok := s.userFamilies[userID]; !ok {
		s.userFamilies[userID] = make(map[string]bool)
	}
	s.userFamilies[userID][familyID] = true
	return nil
}

func (s *MemoryTokenStore) Rotate(ctx context.Context, oldToken string, ttl time.Duration) (string, string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	entry, exists := s.tokens[oldToken]
	if !exists || time.Now().After(entry.expiresAt) {
		// Check reuse
		if famID, wasUsed := s.usedTokens[oldToken]; wasUsed {
			log.Warn().Str("family_id", famID).Msg("SECURITY ALERT: Refresh token reuse detected! Revoking memory family.")
			s.revokeFamilyLocked(famID)
			return "", "", ErrTokenReused
		}
		delete(s.tokens, oldToken)
		return "", "", ErrInvalidRefreshToken
	}

	delete(s.tokens, oldToken)
	s.usedTokens[oldToken] = entry.familyID

	newToken := uuid.New().String()
	s.tokens[newToken] = memoryTokenEntry{
		userID:    entry.userID,
		familyID:  entry.familyID,
		expiresAt: time.Now().Add(ttl),
	}
	s.familyActive[entry.familyID] = newToken
	return newToken, entry.userID, nil
}

func (s *MemoryTokenStore) Revoke(ctx context.Context, token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	entry, exists := s.tokens[token]
	if exists {
		s.revokeFamilyLocked(entry.familyID)
	}
	delete(s.tokens, token)
	return nil
}

func (s *MemoryTokenStore) RevokeFamily(ctx context.Context, familyID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.revokeFamilyLocked(familyID)
	return nil
}

func (s *MemoryTokenStore) revokeFamilyLocked(familyID string) {
	if activeToken, ok := s.familyActive[familyID]; ok {
		delete(s.tokens, activeToken)
	}
	delete(s.familyActive, familyID)
}

func (s *MemoryTokenStore) RevokeAllForUser(ctx context.Context, userID string) error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if fams, ok := s.userFamilies[userID]; ok {
		for fam := range fams {
			s.revokeFamilyLocked(fam)
		}
		delete(s.userFamilies, userID)
	}
	return nil
}

var globalTokenStore TokenStore = NewMemoryTokenStore()

func SetGlobalTokenStore(store TokenStore) {
	globalTokenStore = store
}

func GetGlobalTokenStore() TokenStore {
	return globalTokenStore
}
