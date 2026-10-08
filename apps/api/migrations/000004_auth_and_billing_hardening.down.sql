DROP INDEX IF EXISTS idx_invoices_factory_month;
DROP SEQUENCE IF EXISTS invoice_seq;
ALTER TABLE factories DROP COLUMN IF EXISTS buyer_ntn;
ALTER TABLE users DROP COLUMN IF EXISTS token_version;
DROP INDEX IF EXISTS idx_users_email_lower;
