-- WattWise PostgreSQL Production Schema
-- Migration 000001: Create Core Tables & Append-Only Audit Rules

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Multi-Tenant Factory Registry
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

-- 2. User & RBAC Accounts
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


-- 3. Tenant Isolation Mapping
CREATE TABLE IF NOT EXISTS user_factory_access (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    factory_id VARCHAR(64) REFERENCES factories(id) ON DELETE CASCADE,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY(user_id, factory_id)
);

-- 4. Sensor Nodes (WattClamp Registry)
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

-- 5. Savings Ledger (Append-Only at Database Level)
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
    audit_hash CHAR(71) NOT NULL, -- "sha256:" + 64 hex
    locked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'LOCKED' CHECK(status IN ('LOCKED', 'AUDITED', 'INVOICED')),
    UNIQUE(factory_id, period_month)
);

-- Enforce Immutability via PostgreSQL Rules (Strict Append-Only for Audit Integrity)
CREATE OR REPLACE RULE savings_no_update AS ON UPDATE TO savings_records
DO INSTEAD NOTHING;

CREATE OR REPLACE RULE savings_no_delete AS ON DELETE TO savings_records
DO INSTEAD NOTHING;

-- 6. Audit Trail for Financial Disputes
CREATE TABLE IF NOT EXISTS savings_audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    record_id UUID REFERENCES savings_records(id),
    accessed_by UUID REFERENCES users(id),
    accessed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET
);

-- 7. FBR & Bank Corporate Invoices
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
