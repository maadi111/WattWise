package db_test

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/wattwise/api/internal/db"
)

func TestRedisOptionsAcceptsHostPortAndURL(t *testing.T) {
	o, err := db.RedisOptions("redis.internal:6379")
	require.NoError(t, err)
	assert.Equal(t, "redis.internal:6379", o.Addr)

	o, err = db.RedisOptions("redis://:s3cret@cache.internal:6380/2")
	require.NoError(t, err)
	assert.Equal(t, "cache.internal:6380", o.Addr)
	assert.Equal(t, "s3cret", o.Password)
	assert.Equal(t, 2, o.DB)

	o, err = db.RedisOptions("rediss://cache.internal:6379/0")
	require.NoError(t, err)
	assert.NotNil(t, o.TLSConfig, "rediss:// must enable TLS")

	_, err = db.RedisOptions("")
	assert.Error(t, err)
	_, err = db.RedisOptions("redis://%zz")
	assert.Error(t, err)
}
