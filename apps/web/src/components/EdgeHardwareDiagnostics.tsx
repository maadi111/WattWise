import React, { useState } from 'react';
import { Cpu, HardDrive, Wifi, Radio, Server, Code2, Database, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Factory } from '../types';

interface EdgeHardwareDiagnosticsProps {
  factory: Factory;
  lang: 'en' | 'ur';
}

const PYTHON_EDGE_CODE = `# WattBrain Edge OS — Core Process Manager
# Runs as systemd service on Ubuntu 22.04 (ARM64)
import asyncio
from wattbrain.sensor_bus import ModbusCTBus
from wattbrain.inference import LoadPredictor
from wattbrain.mqtt_client import WattMQTT
from wattbrain.relay_ctrl import RelayController
from wattbrain.local_store import RingBuffer

SAMPLE_INTERVAL_MS = 100 # 10 Hz per channel
PUBLISH_INTERVAL_S = 5   # Aggregate + send every 5s
PREDICTION_WINDOW  = 900 # 15-min rolling inference window

async def main_loop():
    bus = ModbusCTBus(ports=["/dev/ttyUSB0", "/dev/ttyUSB1"])
    predictor = LoadPredictor.from_onnx("models/loadshift_v2.onnx")
    mqtt = WattMQTT(broker="mqtt.wattwise.pk", tls=True)
    relay = RelayController(gpio_map=RELAY_CONFIG)
    buffer = RingBuffer(max_hours=72)

    while True:
        readings = await bus.read_all() # <5ms
        buffer.append(readings)

        if buffer.seconds_elapsed() % PUBLISH_INTERVAL_S == 0:
            agg = buffer.aggregate_last(seconds=PUBLISH_INTERVAL_S)
            await mqtt.publish(f"factory/{FACTORY_ID}/telemetry", agg)

        prediction = predictor.infer(buffer.last(PREDICTION_WINDOW))
        if prediction.grid_drop_confidence > 0.85:
            # Pre-empt ATS switchover 8-12 seconds before grid drop!
            relay.execute(prediction.recommended_actions)

        await asyncio.sleep(SAMPLE_INTERVAL_MS / 1000)`;

const GO_INGESTION_CODE = `// WattWise Cloud — Sensor Ingestion Service (Go)
// Handles ~50,000 sensor readings/second at scale
package ingestion

type TelemetryPacket struct {
    FactoryID    string    \`json:"factory_id"\`
    NodeID       string    \`json:"node_id"\`
    Timestamp    time.Time \`json:"ts"\`
    CurrentAmps  float64   \`json:"i_rms"\`
    VoltageV     float64   \`json:"v_rms"\`
    PowerW       float64   \`json:"power_w"\`
    PowerFactor  float64   \`json:"pf"\`
    GridSource   bool      \`json:"on_grid"\`
}

func (h *Handler) IngestBatch(packets []TelemetryPacket) error {
    points := make([]influxdb.Point, len(packets))
    for i, p := range packets {
        points[i] = influxdb.NewPoint(
            "sensor_reading",
            map[string]string{"factory": p.FactoryID, "node": p.NodeID},
            map[string]interface{}{
                "i_rms": p.CurrentAmps,
                "power_w": p.PowerW,
                "on_grid": p.GridSource,
            },
            p.Timestamp,
        )
    }
    return h.influx.WritePoints(context.Background(), points)
}`;

const POSTGRES_SCHEMA = `-- Multi-tenant factory registry
CREATE TABLE factories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    sector TEXT CHECK(sector IN ('TEXTILE','SURGICAL','FOOD','PHARMA','STEEL')),
    city TEXT,
    wapda_feeder TEXT, -- feeder ID for outage scraping
    plan TEXT DEFAULT 'STARTER',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sensor node registry per factory
CREATE TABLE sensor_nodes (
    id UUID PRIMARY KEY,
    factory_id UUID REFERENCES factories(id),
    label TEXT, -- e.g. "Loom Section A"
    ct_range_a INTEGER, -- 50 / 200 / 600
    phase INTEGER CHECK(phase IN (1,3)),
    installed_at TIMESTAMPTZ,
    last_seen TIMESTAMPTZ
);

-- Savings ledger (immutable, append-only)
CREATE TABLE savings_records (
    id UUID PRIMARY KEY,
    factory_id UUID REFERENCES factories(id),
    period_month DATE,
    baseline_pkr NUMERIC(14,2),
    actual_pkr NUMERIC(14,2),
    gross_saving_pkr NUMERIC(14,2),
    fee_pkr NUMERIC(14,2),
    audit_hash CHAR(64), -- SHA-256 of raw data snapshot
    locked_at TIMESTAMPTZ,
    UNIQUE(factory_id, period_month)
);`;

export const EdgeHardwareDiagnostics: React.FC<EdgeHardwareDiagnosticsProps> = ({ factory, lang }) => {
  const [activeTab, setActiveTab] = useState<'VITALS' | 'PYTHON' | 'GO' | 'SQL'>('VITALS');

  return (
    <div className="glass-panel">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={22} style={{ color: 'var(--cyan-neon)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {lang === 'ur' ? 'واٹ برین™ ایج کنٹرولر اور ہارڈ ویئر ڈائیگنوسٹکس' : 'WattBrain™ Edge Controller & Hardware Architecture'}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            {lang === 'ur'
              ? 'آن سائٹ کلاؤڈ لیس خود مختار کنٹرولر، 72 گھنٹے کا آف لائن بفر اور آنکس مشین لرننگ'
              : 'On-site industrial Raspberry Pi CM4 controller with 72h offline autonomy & ONNX Runtime ML engine'}
          </p>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setActiveTab('VITALS')}
            className={`btn btn-sm ${activeTab === 'VITALS' ? 'btn-primary' : 'btn-outline'}`}
          >
            Hardware Specs
          </button>
          <button
            onClick={() => setActiveTab('PYTHON')}
            className={`btn btn-sm ${activeTab === 'PYTHON' ? 'btn-primary' : 'btn-outline'}`}
          >
            wattbrain/main.py
          </button>
          <button
            onClick={() => setActiveTab('GO')}
            className={`btn btn-sm ${activeTab === 'GO' ? 'btn-primary' : 'btn-outline'}`}
          >
            ingestion/handler.go
          </button>
          <button
            onClick={() => setActiveTab('SQL')}
            className={`btn btn-sm ${activeTab === 'SQL' ? 'btn-primary' : 'btn-outline'}`}
          >
            PostgreSQL Schema
          </button>
        </div>
      </div>

      {activeTab === 'VITALS' && (
        <div style={{ marginTop: '20px' }}>
          {/* Hardware Specs Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--cyan-neon)', fontWeight: 700, fontSize: '0.85rem' }}>
                <Cpu size={18} /> Compute & Core OS
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginTop: '8px' }}>
                Raspberry Pi CM4 (ARM64)
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                4GB LPDDR4 • Ubuntu 22.04 LTS • ONNX Runtime 1.16+
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--emerald-neon)', marginTop: '6px' }}>
                CPU Temp: 42.1°C (Passive Industrial Enclosure)
              </div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--amber-neon)', fontWeight: 700, fontSize: '0.85rem' }}>
                <HardDrive size={18} /> 72-Hour Offline Storage
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginTop: '8px' }}>
                SQLite Local Ring Buffer
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                32GB eMMC + 128GB High-Endurance MicroSD
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--emerald-neon)', marginTop: '6px' }}>
                Zero Cloud Dependency for Critical Switchover
              </div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald-neon)', fontWeight: 700, fontSize: '0.85rem' }}>
                <Wifi size={18} /> Multi-Network Fallback
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginTop: '8px' }}>
                Triple Redundancy Bridge
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Gigabit Ethernet Primary &rarr; 4G LTE USB Failover &rarr; LoRa
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--emerald-neon)', marginTop: '6px' }}>
                MQTT Ping: 28ms to AWS ME-South-1 (Bahrain)
              </div>
            </div>

            <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a5b4fc', fontWeight: 700, fontSize: '0.85rem' }}>
                <Radio size={18} /> Industrial Relays & I/O
              </div>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: '#fff', marginTop: '8px' }}>
                8x Digital Relays + 4x RS-485
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                24VDC/10A contacts for ATS & Load Shedding
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--emerald-neon)', marginTop: '6px' }}>
                Up to 128 Modbus CT Nodes per WattBrain
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'PYTHON' && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Production code from Page 10 of WattWise Documentation:
          </div>
          <pre style={{
            background: '#080c16',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: '#a7f3d0',
            overflowX: 'auto',
            lineHeight: 1.5,
          }}>
            {PYTHON_EDGE_CODE}
          </pre>
        </div>
      )}

      {activeTab === 'GO' && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            Production Ingestion Service from Page 11 of WattWise Documentation:
          </div>
          <pre style={{
            background: '#080c16',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: '#7dd3fc',
            overflowX: 'auto',
            lineHeight: 1.5,
          }}>
            {GO_INGESTION_CODE}
          </pre>
        </div>
      )}

      {activeTab === 'SQL' && (
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
            PostgreSQL 16 Multi-Tenant Schema from Page 17 of WattWise Documentation:
          </div>
          <pre style={{
            background: '#080c16',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            padding: '16px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.8rem',
            color: '#fed7aa',
            overflowX: 'auto',
            lineHeight: 1.5,
          }}>
            {POSTGRES_SCHEMA}
          </pre>
        </div>
      )}
    </div>
  );
};
