package db

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"github.com/rs/zerolog/log"
)

// Core Schema with Append-Only Rules and Initial Seed Data
const migration000001 = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS factories (
    id VARCHAR(64) PRIMARY KEY,
    name TEXT NOT NULL,
    sector TEXT NOT NULL CHECK(sector IN ('TEXTILE','SURGICAL','FOOD','PHARMA','STEEL')),
    city TEXT NOT NULL,
    disco TEXT NOT NULL,
    wapda_feeder TEXT NOT NULL,
    plan TEXT NOT NULL DEFAULT 'STARTER (GAIN-SHARE)',
    peak_load_kw NUMERIC(10,2) NOT NULL,
    generator_kva NUMERIC(10,2) NOT NULL,
    grid_rate_pkr NUMERIC(8,2) NOT NULL DEFAULT 32.50,
    diesel_rate_pkr NUMERIC(8,2) NOT NULL DEFAULT 94.20,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('super_admin','factory_owner','factory_manager','viewer')),
    phone TEXT,
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_factory_access (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    factory_id VARCHAR(64) REFERENCES factories(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(user_id, factory_id)
);

CREATE TABLE IF NOT EXISTS sensor_nodes (
    id VARCHAR(64) PRIMARY KEY,
    factory_id VARCHAR(64) REFERENCES factories(id) ON DELETE CASCADE,
    label TEXT NOT NULL,
    section TEXT NOT NULL,
    ct_range_a INTEGER NOT NULL CHECK(ct_range_a IN (50, 200, 600)),
    phase INTEGER NOT NULL CHECK(phase IN (1, 3)),
    priority TEXT NOT NULL CHECK(priority IN ('CRITICAL_PROTECTED', 'ESSENTIAL', 'SHEDDABLE_NON_CRITICAL')),
    is_protected BOOLEAN NOT NULL DEFAULT FALSE,
    installed_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS savings_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    factory_id VARCHAR(64) REFERENCES factories(id) ON DELETE RESTRICT,
    period_month DATE NOT NULL,
    baseline_pkr NUMERIC(14,2) NOT NULL,
    actual_pkr NUMERIC(14,2) NOT NULL,
    gross_saving_pkr NUMERIC(14,2) NOT NULL,
    fee_pkr NUMERIC(14,2) NOT NULL,
    net_saving_pkr NUMERIC(14,2) NOT NULL,
    roi_multiple NUMERIC(6,2) NOT NULL,
    audit_hash CHAR(71) NOT NULL,
    locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'LOCKED' CHECK(status IN ('LOCKED', 'AUDITED', 'INVOICED')),
    UNIQUE(factory_id, period_month)
);

-- Append-Only Rules Enforcement
CREATE OR REPLACE RULE savings_no_update AS ON UPDATE TO savings_records
DO INSTEAD NOTHING;

CREATE OR REPLACE RULE savings_no_delete AS ON DELETE TO savings_records
DO INSTEAD NOTHING;

CREATE TABLE IF NOT EXISTS savings_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID REFERENCES savings_records(id),
    accessed_by UUID REFERENCES users(id),
    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET
);

CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(64) PRIMARY KEY,
    invoice_number VARCHAR(64) UNIQUE NOT NULL,
    factory_id VARCHAR(64) REFERENCES factories(id) ON DELETE RESTRICT,
    month VARCHAR(16) NOT NULL,
    seller_ntn VARCHAR(32) NOT NULL,
    seller_strn VARCHAR(32) NOT NULL,
    buyer_ntn VARCHAR(32) NOT NULL,
    verified_savings_pkr NUMERIC(14,2) NOT NULL,
    base_fee_pkr NUMERIC(14,2) NOT NULL,
    sales_tax_pkr NUMERIC(14,2) NOT NULL,
    total_payable_pkr NUMERIC(14,2) NOT NULL,
    bank_name TEXT NOT NULL,
    iban TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'UNPAID' CHECK(status IN ('UNPAID', 'SETTLED', 'DISPUTED')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
`

const migration000002 = `
INSERT INTO factories (id, name, sector, city, disco, wapda_feeder, plan, peak_load_kw, generator_kva, grid_rate_pkr, diesel_rate_pkr)
VALUES 
('fsd_mill_001', 'Crescent Weaving & Dyeing Mills (Unit 4)', 'TEXTILE', 'Faisalabad', 'FESCO', 'FSD-KHW-11KV-04 (Khurrianwala)', 'STARTER (GAIN-SHARE)', 847.30, 1250.00, 32.50, 94.20),
('slk_surg_002', 'Kashmir Surgical Instruments Ltd.', 'SURGICAL', 'Sialkot', 'GEPCO', 'SLK-DSK-11KV-12 (Daska Road)', 'GROWTH (ANNUAL SAAS)', 342.00, 500.00, 34.00, 96.80),
('lhr_steel_003', 'Ittehad Steel Re-Rolling Mills', 'STEEL', 'Lahore', 'LESCO', 'LHR-KSK-11KV-09 (Kala Shah Kaku)', 'ENTERPRISE', 1480.00, 2200.00, 31.80, 92.50)
ON CONFLICT (id) DO NOTHING;

INSERT INTO sensor_nodes (id, factory_id, label, section, ct_range_a, phase, priority, is_protected)
VALUES 
('node_01', 'fsd_mill_001', 'Weaving Shed A (Airjet Looms 1-40)', 'Weaving Department', 600, 3, 'ESSENTIAL', FALSE),
('node_02', 'fsd_mill_001', 'High-Temperature Dyeing Vats 1-4', 'Dyeing & Chemical Unit', 600, 3, 'CRITICAL_PROTECTED', TRUE),
('node_03', 'fsd_mill_001', 'Weaving Shed B (Rapier Looms 41-80)', 'Weaving Department', 200, 3, 'ESSENTIAL', FALSE),
('node_04', 'fsd_mill_001', 'Stenter Heat-Setting Frame', 'Finishing Department', 200, 3, 'CRITICAL_PROTECTED', TRUE),
('node_05', 'fsd_mill_001', 'Atlas Copco Screw Air Compressors', 'Utility Services', 200, 3, 'SHEDDABLE_NON_CRITICAL', FALSE),
('node_06', 'fsd_mill_001', 'Central Chiller & Admin HVAC', 'Facility Comfort', 200, 3, 'SHEDDABLE_NON_CRITICAL', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO savings_records (factory_id, period_month, baseline_pkr, actual_pkr, gross_saving_pkr, fee_pkr, net_saving_pkr, roi_multiple, audit_hash, status)
VALUES 
('fsd_mill_001', '2026-09-01', 18200000.00, 12940000.00, 5260000.00, 1052000.00, 4208000.00, 4.00, 'sha256:a3f890c29f81d116c8e3bf5d4e2a901f46820573be8296a241de09f18a56209b', 'LOCKED'),
('fsd_mill_001', '2026-08-01', 19100000.00, 13520000.00, 5580000.00, 1116000.00, 4464000.00, 4.00, 'sha256:7bc94401fe9a4c82b01248039c9df4a32219488dafe6c46a81bfa0024419ad21', 'AUDITED'),
('fsd_mill_001', '2026-07-01', 17800000.00, 12750000.00, 5050000.00, 1010000.00, 4040000.00, 4.00, 'sha256:5ef11329cd88ba17429d71c8901b0028a3cdfe9012354890af23b49910cd4198', 'INVOICED')
ON CONFLICT (factory_id, period_month) DO NOTHING;
`

type migration struct {
	id   string
	name string
	sql  string
}

var migrations = []migration{
	{id: "000001", name: "create_schema_and_rules", sql: migration000001},
	{id: "000002", name: "seed_initial_data", sql: migration000002},
}

// RunMigrations applies unapplied schema migrations to PostgreSQL
func RunMigrations(ctx context.Context, db *sql.DB) error {
	createMigrationsTable := `
		CREATE TABLE IF NOT EXISTS schema_migrations (
			version VARCHAR(64) PRIMARY KEY,
			applied_at TIMESTAMPTZ DEFAULT NOW()
		);
	`
	if _, err := db.ExecContext(ctx, createMigrationsTable); err != nil {
		return fmt.Errorf("failed to ensure schema_migrations table: %w", err)
	}

	for _, m := range migrations {
		var exists bool
		err := db.QueryRowContext(ctx, "SELECT EXISTS(SELECT 1 FROM schema_migrations WHERE version = $1)", m.id).Scan(&exists)
		if err != nil {
			return fmt.Errorf("failed to check migration version %s: %w", m.id, err)
		}

		if !exists {
			log.Info().Str("migration", m.id).Str("name", m.name).Msg("Applying database migration...")
			start := time.Now()

			tx, err := db.BeginTx(ctx, nil)
			if err != nil {
				return fmt.Errorf("failed to begin tx for migration %s: %w", m.id, err)
			}

			if _, err := tx.ExecContext(ctx, m.sql); err != nil {
				tx.Rollback()
				return fmt.Errorf("migration %s failed: %w", m.id, err)
			}

			if _, err := tx.ExecContext(ctx, "INSERT INTO schema_migrations (version) VALUES ($1)", m.id); err != nil {
				tx.Rollback()
				return fmt.Errorf("failed to record migration %s: %w", m.id, err)
			}

			if err := tx.Commit(); err != nil {
				return fmt.Errorf("failed to commit migration %s: %w", m.id, err)
			}

			log.Info().Str("migration", m.id).Dur("duration", time.Since(start)).Msg("Migration applied successfully.")
		}
	}

	return nil
}
