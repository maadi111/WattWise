package auth

import (
	"context"
	"encoding/json"
	"errors"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/redis/go-redis/v9"
)

// WSTicketTTL is how long a WebSocket ticket stays valid.
const WSTicketTTL = 30 * time.Second

var ErrTicketInvalid = errors.New("websocket ticket invalid, expired or already used")

// WSTicket is what a ticket grants: the identity snapshot of the user and, optionally, one factory.
type WSTicket struct {
	UserID     string   `json:"user_id"`
	Role       string   `json:"role"`
	TenantID   string   `json:"tenant_id,omitempty"`
	FactoryIDs []string `json:"factory_ids"`
	FactoryID  string   `json:"factory_id,omitempty"` // when set, valid only for this factory
}

// Allows reports whether the ticket may open a stream for factoryID.
func (t *WSTicket) Allows(factoryID string) bool {
	if t.FactoryID != "" && t.FactoryID != factoryID {
		return false
	}
	c := CustomClaims{Role: t.Role, TenantID: t.TenantID, FactoryIDs: t.FactoryIDs}
	return c.HasFactory(factoryID)
}

// WSTicketStore issues short-lived, single-use tickets so browsers (which cannot set an Authorization
// header on a WebSocket) never have to put their JWT in a URL. Exactly ONE store backs a deployment:
// Redis when available (works across replicas), otherwise process memory.
type WSTicketStore interface {
	Issue(ctx context.Context, t WSTicket) (string, error)
	// Consume atomically returns and deletes the ticket; a second call always fails.
	Consume(ctx context.Context, ticket string) (*WSTicket, error)
}

// ---- in-memory ----

type MemoryWSTicketStore struct {
	mu      sync.Mutex
	tickets map[string]memTicket
	now     func() time.Time
}

type memTicket struct {
	t       WSTicket
	expires time.Time
}

func NewMemoryWSTicketStore() *MemoryWSTicketStore {
	return &MemoryWSTicketStore{tickets: map[string]memTicket{}, now: time.Now}
}

func (s *MemoryWSTicketStore) Issue(_ context.Context, t WSTicket) (string, error) {
	id := uuid.NewString()
	s.mu.Lock()
	defer s.mu.Unlock()
	now := s.now()
	for k, v := range s.tickets { // opportunistic cleanup keeps the map bounded
		if now.After(v.expires) {
			delete(s.tickets, k)
		}
	}
	s.tickets[id] = memTicket{t: t, expires: now.Add(WSTicketTTL)}
	return id, nil
}

func (s *MemoryWSTicketStore) Consume(_ context.Context, ticket string) (*WSTicket, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	v, ok := s.tickets[ticket]
	delete(s.tickets, ticket)
	if !ok || s.now().After(v.expires) {
		return nil, ErrTicketInvalid
	}
	t := v.t
	return &t, nil
}

// ---- redis ----

type RedisWSTicketStore struct{ client *redis.Client }

func NewRedisWSTicketStore(c *redis.Client) *RedisWSTicketStore {
	return &RedisWSTicketStore{client: c}
}

func (s *RedisWSTicketStore) Issue(ctx context.Context, t WSTicket) (string, error) {
	b, err := json.Marshal(t)
	if err != nil {
		return "", err
	}
	id := uuid.NewString()
	if err := s.client.Set(ctx, "ws_ticket:"+id, b, WSTicketTTL).Err(); err != nil {
		return "", err
	}
	return id, nil
}

func (s *RedisWSTicketStore) Consume(ctx context.Context, ticket string) (*WSTicket, error) {
	val, err := s.client.GetDel(ctx, "ws_ticket:"+ticket).Result() // atomic read+delete: single use
	if err != nil || val == "" {
		return nil, ErrTicketInvalid
	}
	var t WSTicket
	if err := json.Unmarshal([]byte(val), &t); err != nil {
		return nil, ErrTicketInvalid
	}
	return &t, nil
}

var (
	wsTicketStoreMu sync.RWMutex
	wsTicketStore   WSTicketStore = NewMemoryWSTicketStore()
)

func SetGlobalWSTicketStore(s WSTicketStore) {
	wsTicketStoreMu.Lock()
	defer wsTicketStoreMu.Unlock()
	wsTicketStore = s
}

func GetWSTicketStore() WSTicketStore {
	wsTicketStoreMu.RLock()
	defer wsTicketStoreMu.RUnlock()
	return wsTicketStore
}
