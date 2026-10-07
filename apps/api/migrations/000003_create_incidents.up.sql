-- Migration 000003: Operational Incidents & On-Call Dispatch Registry
CREATE TABLE IF NOT EXISTS incidents (
    id VARCHAR(64) PRIMARY KEY,
    severity VARCHAR(16) NOT NULL CHECK(severity IN ('SEV-1', 'SEV-2', 'SEV-3', 'SEV-4')),
    factory_id VARCHAR(64) REFERENCES factories(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    trigger_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    assigned_to TEXT NOT NULL,
    sla_response_sec INTEGER NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'TRIGGERED' CHECK(status IN ('TRIGGERED', 'ACKNOWLEDGED', 'MITIGATED', 'RESOLVED')),
    fail_safe_held BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_factory_status ON incidents(factory_id, status);
