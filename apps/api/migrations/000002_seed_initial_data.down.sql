-- Rollback seed data

DELETE FROM invoices WHERE id = 'inv_2026_09_001';
DELETE FROM savings_records WHERE factory_id = 'fsd_mill_001';
DELETE FROM sensor_nodes WHERE factory_id = 'fsd_mill_001';
DELETE FROM user_factory_access WHERE factory_id IN ('fsd_mill_001', 'slk_surg_002', 'lhr_steel_003');
DELETE FROM users WHERE email IN ('admin@wattwise.pk', 'owner@crescentmills.com.pk', 'ops@crescentmills.com.pk');
DELETE FROM factories WHERE id IN ('fsd_mill_001', 'slk_surg_002', 'lhr_steel_003');
