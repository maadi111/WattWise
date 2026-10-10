package auth

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/redis/go-redis/v9"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
)

func TestWSTicketAllows(t *testing.T) {
	assert.True(t, (&WSTicket{Role: "super_admin"}).Allows("any"))
	assert.True(t, (&WSTicket{Role: "factory_manager", FactoryIDs: []string{"a"}}).Allows("a"))
	assert.False(t, (&WSTicket{Role: "factory_manager", FactoryIDs: []string{"a"}}).Allows("b"))
	assert.False(t, (&WSTicket{Role: "super_admin", FactoryID: "a"}).Allows("b"), "a factory-bound ticket is bound even for admins")
	assert.True(t, (&WSTicket{Role: "factory_manager", FactoryIDs: []string{"a"}, FactoryID: "a"}).Allows("a"))
}

func storeContract(t *testing.T, s WSTicketStore) {
	ctx := context.Background()
	id, err := s.Issue(ctx, WSTicket{UserID: "u1", Role: "viewer", FactoryIDs: []string{"a"}})
	require.NoError(t, err)

	got, err := s.Consume(ctx, id)
	require.NoError(t, err)
	assert.Equal(t, "u1", got.UserID)

	_, err = s.Consume(ctx, id)
	assert.ErrorIs(t, err, ErrTicketInvalid, "a ticket must work exactly once")

	_, err = s.Consume(ctx, "never-issued")
	assert.ErrorIs(t, err, ErrTicketInvalid)
}

func TestMemoryWSTicketStore(t *testing.T) {
	storeContract(t, NewMemoryWSTicketStore())
}

func TestMemoryWSTicketExpires(t *testing.T) {
	s := NewMemoryWSTicketStore()
	now := time.Now()
	s.now = func() time.Time { return now }
	id, err := s.Issue(context.Background(), WSTicket{UserID: "u"})
	require.NoError(t, err)
	s.now = func() time.Time { return now.Add(WSTicketTTL + time.Second) }
	_, err = s.Consume(context.Background(), id)
	assert.ErrorIs(t, err, ErrTicketInvalid)
}

func TestRedisWSTicketStore(t *testing.T) {
	addr := os.Getenv("TEST_REDIS_ADDR")
	if addr == "" {
		t.Skip("TEST_REDIS_ADDR not set")
	}
	client := redis.NewClient(&redis.Options{Addr: addr})
	t.Cleanup(func() { _ = client.Close() })
	require.NoError(t, client.Ping(context.Background()).Err())
	storeContract(t, NewRedisWSTicketStore(client))
}
