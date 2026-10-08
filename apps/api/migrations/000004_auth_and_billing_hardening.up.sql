-- Migration 000004: Auth & Billing Hardening (H3, H4, H6)

-- 1. Lowercase Email Unique Index (H4)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users(lower(email));

-- 2. Token Version for immediate session revocation across password changes (H6 / M4)
ALTER TABLE users ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 1;

-- 3. Buyer NTN on Factories (H3)
ALTER TABLE factories ADD COLUMN IF NOT EXISTS buyer_ntn VARCHAR(32);

-- 4. DB Sequence for sequential non-colliding invoice numbering (H3)
CREATE SEQUENCE IF NOT EXISTS invoice_seq START 1001;

-- 5. Prevent duplicate invoice generation per factory & month (H3)
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_factory_month ON invoices(factory_id, month);
