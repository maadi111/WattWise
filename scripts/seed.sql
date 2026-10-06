-- WattWise PostgreSQL Production Schema & Seed Data
-- Conforms to WattWise Product Documentation & 16-Week Production Guide

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

-- Enforce Immutability via PostgreSQL Rules (Page 17 of Guide)
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

-- ==========================================
-- SEED INITIAL FACTORIES & DEMO ACCOUNTS
-- ==========================================

INSERT INTO factories (id, name, sector, city, disco, wapda_feeder, plan, peak_load_kw, generator_kva, grid_rate_pkr, diesel_rate_pkr)
VALUES 
('fsd_mill_001', 'Crescent Weaving & Dyeing Mills (Unit 4)', 'TEXTILE', 'Faisalabad', 'FESCO', 'FSD-KHW-11KV-04 (Khurrianwala)', 'STARTER (GAIN-SHARE)', 847.30, 1250.00, 32.50, 94.20),
('slk_surg_002', 'Kashmir Surgical Instruments Ltd.', 'SURGICAL', 'Sialkot', 'GEPCO', 'SLK-DSK-11KV-12 (Daska Road)', 'GROWTH (ANNUAL SAAS)', 342.00, 500.00, 34.00, 96.80),
('lhr_steel_003', 'Ittehad Steel Re-Rolling Mills', 'STEEL', 'Lahore', 'LESCO', 'LHR-KSK-11KV-09 (Kala Shah Kaku)', 'ENTERPRISE', 1480.00, 2200.00, 31.80, 92.50)
ON CONFLICT (id) DO NOTHING;

-- Seed Users
-- Password hash corresponds to: 'WattWise2026!'
INSERT INTO users (id, email, password_hash, full_name, role, phone)
VALUES 
('11111111-1111-1111-1111-111111111111', 'admin@wattwise.pk', '$2a$12$e8Y4V5FwUu9tQ1/31V4L2eG7xN9.K4eC1wJ2bN8mK1l8o7q8u2i1.', 'Hammad (CTO)', 'super_admin', '+923001234567'),
('22222222-2222-2222-2222-222222222222', 'owner@crescentmills.com.pk', '$2a$12$e8Y4V5FwUu9tQ1/31V4L2eG7xN9.K4eC1wJ2bN8mK1l8o7q8u2i1.', 'Mian Tariq (Mill Owner)', 'factory_owner', '+923219876543'),
('33333333-3333-3333-3333-333333333333', 'ops@crescentmills.com.pk', '$2a$12$e8Y4V5FwUu9tQ1/31V4L2eG7xN9.K4eC1wJ2bN8mK1l8o7q8u2i1.', 'Engr. Rashid (Plant Manager)', 'factory_manager', '+923334567890')
ON CONFLICT (email) DO NOTHING;

-- Grant Factory Access
INSERT INTO user_factory_access (user_id, factory_id)
VALUES 
('22222222-2222-2222-2222-222222222222', 'fsd_mill_001'),
('33333333-3333-3333-3333-333333333333', 'fsd_mill_001')
ON CONFLICT DO NOTHING;

-- Seed Sensor Nodes
INSERT INTO sensor_nodes (id, factory_id, label, section, ct_range_a, phase, priority, is_protected)
VALUES 
('node_01', 'fsd_mill_001', 'Weaving Shed A (Airjet Looms 1-40)', 'Weaving Department', 600, 3, 'ESSENTIAL', FALSE),
('node_02', 'fsd_mill_001', 'High-Temperature Dyeing Vats 1-4', 'Dyeing & Chemical Unit', 600, 3, 'CRITICAL_PROTECTED', TRUE),
('node_03', 'fsd_mill_001', 'Weaving Shed B (Rapier Looms 41-80)', 'Weaving Department', 200, 3, 'ESSENTIAL', FALSE),
('node_04', 'fsd_mill_001', 'Stenter Heat-Setting Frame', 'Finishing Department', 200, 3, 'CRITICAL_PROTECTED', TRUE),
('node_05', 'fsd_mill_001', 'Atlas Copco Screw Air Compressors', 'Utility Services', 200, 3, 'SHEDDABLE_NON_CRITICAL', FALSE),
('node_06', 'fsd_mill_001', 'Central Chiller & Admin HVAC', 'Facility Comfort', 200, 3, 'SHEDDABLE_NON_CRITICAL', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Seed Savings Records
INSERT INTO savings_records (factory_id, period_month, baseline_pkr, actual_pkr, gross_saving_pkr, fee_pkr, net_saving_pkr, roi_multiple, audit_hash, status)
VALUES 
('fsd_mill_001', '2026-09-01', 18200000.00, 12940000.00, 5260000.00, 1052000.00, 4208000.00, 4.00, 'sha256:a3f890c29f81d116c8e3bf5d4e2a901f46820573be8296a241de09f18a56209b', 'LOCKED'),
('fsd_mill_001', '2026-08-01', 19100000.00, 13520000.00, 5580000.00, 1116000.00, 4464000.00, 4.00, 'sha256:7bc94401fe9a4c82b01248039c9df4a32219488dafe6c46a81bfa0024419ad21', 'AUDITED'),
('fsd_mill_001', '2026-07-01', 17800000.00, 12750000.00, 5050000.00, 1010000.00, 4040000.00, 4.00, 'sha256:5ef11329cd88ba17429d71c8901b0028a3cdfe9012354890af23b49910cd4198', 'INVOICED')
ON CONFLICT (factory_id, period_month) DO NOTHING;
