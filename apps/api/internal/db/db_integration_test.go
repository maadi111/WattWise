package db_test

import (
	"context"
	"database/sql"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"

	"github.com/wattwise/api/internal/db"
	"github.com/wattwise/api/internal/testutil/pgtest"
)

func count(t *testing.T, conn *sql.DB, table string) int {
	t.Helper()
	var n int
	require.NoError(t, conn.QueryRow("SELECT COUNT(*) FROM "+table).Scan(&n))
	return n
}

func TestMigrationsCreateNoBusinessData(t *testing.T) {
	conn := pgtest.Reset(t)
	ctx := context.Background()
	require.NoError(t, db.RunMigrations(ctx, conn))
	require.NoError(t, db.RunMigrations(ctx, conn), "second run must be a no-op")

	for _, table := range []string{"users", "factories", "savings_records", "invoices", "sensor_nodes"} {
		assert.Zero(t, count(t, conn, table), "%s must be empty after migrations (no demo data in production)", table)
	}
}

func TestDemoSeedIsExplicitAndIdempotent(t *testing.T) {
	conn := pgtest.Open(t)
	ctx := context.Background()
	require.NoError(t, db.RunDemoSeed(ctx, conn))
	require.NoError(t, db.RunDemoSeed(ctx, conn), "seeding twice must be safe")
	assert.Equal(t, 3, count(t, conn, "factories"))
	assert.Equal(t, 3, count(t, conn, "savings_records"))
	assert.Zero(t, count(t, conn, "users"), "demo seed must never create accounts")
}

func TestSavingsLedgerIsAppendOnly(t *testing.T) {
	conn := pgtest.Open(t)
	require.NoError(t, db.RunDemoSeed(context.Background(), conn))
	var before string
	require.NoError(t, conn.QueryRow(`SELECT audit_hash FROM savings_records ORDER BY period_month LIMIT 1`).Scan(&before))
	_, _ = conn.Exec(`UPDATE savings_records SET audit_hash = 'tampered'`)
	_, _ = conn.Exec(`DELETE FROM savings_records`)
	var after string
	require.NoError(t, conn.QueryRow(`SELECT audit_hash FROM savings_records ORDER BY period_month LIMIT 1`).Scan(&after))
	assert.Equal(t, before, after, "UPDATE/DELETE on the ledger must be blocked by the append-only rules")
}

func TestEmailUniquenessIsCaseInsensitive(t *testing.T) {
	conn := pgtest.Open(t)
	_, err := conn.Exec(`INSERT INTO users (email, password_hash, full_name, role) VALUES ('a@x.test','h','A','viewer')`)
	require.NoError(t, err)
	_, err = conn.Exec(`INSERT INTO users (email, password_hash, full_name, role) VALUES ('A@X.TEST','h','A2','viewer')`)
	assert.Error(t, err, "the database itself must refuse a case-variant duplicate email")
}
