// Package pgtest provides a clean, fully migrated PostgreSQL database for integration tests.
// Tests are skipped unless TEST_POSTGRES_URL points at a DISPOSABLE database: every WattWise table in it is dropped.
package pgtest

import (
	"context"
	"database/sql"
	"os"
	"testing"

	_ "github.com/lib/pq"
	"github.com/stretchr/testify/require"

	"github.com/wattwise/api/internal/db"
)

// Reset drops every WattWise table and returns an unmigrated connection.
func Reset(t *testing.T) *sql.DB {
	t.Helper()
	url := os.Getenv("TEST_POSTGRES_URL")
	if url == "" {
		t.Skip("TEST_POSTGRES_URL not set; skipping PostgreSQL integration test")
	}
	conn, err := sql.Open("postgres", url)
	require.NoError(t, err)
	t.Cleanup(func() { _ = conn.Close() })
	require.NoError(t, conn.Ping())
	_, err = conn.Exec(`DROP TABLE IF EXISTS incidents, invoices, savings_audit_log, savings_records, sensor_nodes,
		user_factory_access, users, factories, schema_migrations CASCADE; DROP SEQUENCE IF EXISTS invoice_seq;`)
	require.NoError(t, err)
	return conn
}

// Open resets the database and applies all production migrations.
func Open(t *testing.T) *sql.DB {
	t.Helper()
	conn := Reset(t)
	require.NoError(t, db.RunMigrations(context.Background(), conn))
	return conn
}
