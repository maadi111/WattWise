package auth

import (
	"context"
	"errors"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

var ErrInvalidRefreshToken = errors.New("invalid or expired refresh token")

type TokenStore interface {
	Store(ctx context.Context, token string, userID string, ttl time.Duration) error
	Rotate(ctx context.Context, oldToken string, ttl time.Duration) (newToken string, userID string, err error)
	Revoke(ctx context.Context, token string) error
}

type RedisTokenStore struct {
	client *redis.Client
}

func NewRedisTokenStore(client *redis.Client) *RedisTokenStore {
	return &RedisTokenStore{client: client}
}

func (s *RedisTokenStore) Store(ctx context.Context, token string, userID string, ttl time.Duration) error {
	return s.client.Set(ctx, "refresh:"+token, userID, ttl).Err()
}

func (s *RedisTokenStore) Rotate(ctx context.Context, oldToken string, ttl time.Duration) (string, string, error) {
	pipe := s.client.TxPipeline()
	getCmd := pipe.Get(ctx, "refresh:"+oldToken)
	pipe.Del(ctx, "refresh:"+oldToken)
	_, err := pipe.Exec(ctx)
	if err != nil {
		return "", "", ErrInvalidRefreshToken
	}

	userID := getCmd.Val()
	if userID == "" {
		return "", "", ErrInvalidRefreshToken
	}

	newToken := uuid.New().String()
	if err := s.client.Set(ctx, "refresh:"+newToken, userID, ttl).Err(); err != nil {
		return "", "", err
	}

	return newToken, userID, nil
}

func (s *RedisTokenStore) Revoke(ctx context.Context, token string) error {
	return s.client.Del(ctx, "refresh:"+token).Err()
}

// MemoryTokenStore thread-safe fallback for local testing / offline dev
type MemoryTokenStore struct {
	mu     sync.RWMutex
	tokens map[string]memoryTokenEntry
}

type memoryTokenEntry struct {
	userID    string
	expiresAt time.Time
}

func NewMemoryTokenStore() *MemoryTokenStore {
	return &MemoryTokenStore{
		tokens: make(map[string]memoryTokenEntry),
	}
}

func (s *MemoryTokenStore) Store(ctx context.Context, token string, userID string, ttl time.Duration) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.tokens[token] = memoryTokenEntry{
		userID:    userID,
		expiresAt: time.Now().Add(ttl),
	}
	return nil
}

func (s *MemoryTokenStore) Rotate(ctx context.Context, oldToken string, ttl time.Duration) (string, string, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	entry, exists := s.tokens[oldToken]
	if !exists || time.Now().After(entry.expiresAt) {
		delete(s.tokens, oldToken)
		return "", "", ErrInvalidRefreshToken
	}

	delete(s.tokens, oldToken)
	newToken := uuid.New().String()
	s.tokens[newToken] = memoryTokenEntry{
		userID:    entry.userID,
		expiresAt: time.Now().Add(ttl),
	}

	return newToken, entry.userID, nil
}

func (s *MemoryTokenStore) Revoke(ctx context.Context, token string) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	delete(s.tokens, token)
	return nil
}

var globalTokenStore TokenStore = NewMemoryTokenStore()

func SetGlobalTokenStore(store TokenStore) {
	globalTokenStore = store
}

func GetGlobalTokenStore() TokenStore {
	return globalTokenStore
}
