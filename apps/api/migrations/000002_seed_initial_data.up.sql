-- WattWise Seed Data Migration 000002
-- Initial neutral factory profiles, sensor nodes, and audit ledger structure

-- 1. Initial Demonstration Factories
INSERT INTO factories (id, name, sector, city, disco, wapda_feeder, plan, peak_load_kw, generator_kva, grid_rate_pkr, diesel_rate_pkr)
VALUES 
('fsd_mill_001', 'Crescent Weaving & Dyeing Mills (Unit 4)', 'TEXTILE', 'Faisalabad', 'FESCO', 'FSD-KHW-11KV-04 (Khurrianwala)', 'STARTER (GAIN-SHARE)', 847.30, 1250.00, 32.50, 94.20),
('slk_surg_002', 'Kashmir Surgical Instruments Ltd.', 'SURGICAL', 'Sialkot', 'GEPCO', 'SLK-DSK-11KV-12 (Daska Road)', 'GROWTH (ANNUAL SAAS)', 342.00, 500.00, 34.00, 96.80),
('lhr_steel_003', 'Ittehad Steel Re-Rolling Mills', 'STEEL', 'Lahore', 'LESCO', 'LHR-KSK-11KV-09 (Kala Shah Kaku)', 'ENTERPRISE', 1480.00, 2200.00, 31.80, 92.50)
ON CONFLICT (id) DO NOTHING;

-- 2. Initial Sensor Nodes (WattClamp Substation Configuration)
INSERT INTO sensor_nodes (id, factory_id, label, section, ct_range_a, phase, priority, is_protected)
VALUES 
('node_01', 'fsd_mill_001', 'Weaving Shed A (Airjet Looms 1-40)', 'Weaving Department', 600, 3, 'ESSENTIAL', FALSE),
('node_02', 'fsd_mill_001', 'High-Temperature Dyeing Vats 1-4', 'Dyeing & Chemical Unit', 600, 3, 'CRITICAL_PROTECTED', TRUE),
('node_03', 'fsd_mill_001', 'Weaving Shed B (Rapier Looms 41-80)', 'Weaving Department', 200, 3, 'ESSENTIAL', FALSE),
('node_04', 'fsd_mill_001', 'Stenter Heat-Setting Frame', 'Finishing Department', 200, 3, 'CRITICAL_PROTECTED', TRUE),
('node_05', 'fsd_mill_001', 'Atlas Copco Screw Air Compressors', 'Utility Services', 200, 3, 'SHEDDABLE_NON_CRITICAL', FALSE),
('node_06', 'fsd_mill_001', 'Central Chiller & Admin HVAC', 'Facility Comfort', 200, 3, 'SHEDDABLE_NON_CRITICAL', FALSE)
ON CONFLICT (id) DO NOTHING;

-- 3. Historical Savings Ledger (Append-Only Cryptographic Audit Baseline)
INSERT INTO savings_records (factory_id, period_month, baseline_pkr, actual_pkr, gross_saving_pkr, fee_pkr, net_saving_pkr, roi_multiple, audit_hash, status)
VALUES 
('fsd_mill_001', '2026-09-01', 18200000.00, 12940000.00, 5260000.00, 1052000.00, 4208000.00, 4.00, 'sha256:a3f890c29f81d116c8e3bf5d4e2a901f46820573be8296a241de09f18a56209b', 'LOCKED'),
('fsd_mill_001', '2026-08-01', 19100000.00, 13520000.00, 5580000.00, 1116000.00, 4464000.00, 4.00, 'sha256:7bc94401fe9a4c82b01248039c9df4a32219488dafe6c46a81bfa0024419ad21', 'AUDITED'),
('fsd_mill_001', '2026-07-01', 17800000.00, 12750000.00, 5050000.00, 1010000.00, 4040000.00, 4.00, 'sha256:5ef11329cd88ba17429d71c8901b0028a3cdfe9012354890af23b49910cd4198', 'INVOICED')
ON CONFLICT (factory_id, period_month) DO NOTHING;
