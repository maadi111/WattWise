import React, { useState } from 'react';
import { CheckCircle2, Circle, AlertTriangle, Terminal, Layers, ArrowRight, ShieldCheck, DollarSign, Server, Rocket } from 'lucide-react';

interface ProductionRoadmapGuideProps {
  lang: 'en' | 'ur';
}

export const ProductionRoadmapGuide: React.FC<ProductionRoadmapGuideProps> = ({ lang }) => {
  const [activeSprint, setActiveSprint] = useState<number>(0);

  const sprints = [
    {
      id: 0,
      title: 'Sprint 0 · Weeks 1–2',
      name: 'Foundation: Monorepo, Docker & CI/CD',
      priority: 'BLOCKER',
      unlocks: 'Everything else',
      status: 'COMPLETED IN WORKSPACE',
      tasks: [
        { label: 'Create GitHub monorepo structure (apps/web, apps/api, apps/ml, apps/edge)', done: true },
        { label: 'Write infra/docker-compose.yml (PostgreSQL 16, InfluxDB 2.7, Mosquitto 2.0, Redis 7, Kafka 7.6)', done: true },
        { label: 'Initialize Go module (github.com/wattwise/api) in apps/api', done: true },
        { label: 'Set up GitHub Actions CI pipelines (.github/workflows/web.yml, api.yml, ml.yml)', done: true },
        { label: 'Write PostgreSQL migrations & seed data (scripts/seed.sql)', done: true },
        { label: 'Create Terraform AWS Bahrain infrastructure definitions (infra/terraform)', done: true },
      ],
    },
    {
      id: 1,
      title: 'Sprint 1 · Weeks 3–4',
      name: 'Authentication, RBAC & Multi-Tenancy',
      priority: 'BLOCKER',
      unlocks: 'Can share with real customers',
      status: 'COMPLETED IN WORKSPACE',
      tasks: [
        { label: 'Go API server bootstrapped with Gin, CORS, structured logging (zerolog)', done: true },
        { label: 'PostgreSQL schema with strict tenant isolation (factories, users, user_factory_access)', done: true },
        { label: 'JWT Auth flow with HS256 claims, 15m access token, HttpOnly refresh cookies', done: true },
        { label: 'Tenant isolation enforcer middleware (RequireFactoryAccess) preventing cross-factory leaks', done: true },
        { label: 'Frontend wired to AuthContext & typed API client (apps/web/src/lib/auth.ts, api.ts)', done: true },
        { label: 'Multi-tenant RBAC selector (super_admin, factory_owner, factory_manager)', done: true },
      ],
    },
    {
      id: 2,
      title: 'Sprint 2 · Weeks 5–6',
      name: 'Real-Time Data Pipeline: MQTT → Kafka → InfluxDB → WebSocket',
      priority: 'BLOCKER',
      unlocks: 'Real sensor data in UI',
      status: 'COMPLETED IN WORKSPACE',
      tasks: [
        { label: 'WattBrain factory load simulator (apps/edge/simulator/factory_sim.py)', done: true },
        { label: 'Mosquitto MQTT broker configuration (infra/mosquitto.conf on port 1883/8883)', done: true },
        { label: 'Go real-time WebSocket server streaming telemetry packets (apps/api/internal/telemetry)', done: true },
        { label: 'React WebSocket hook with automatic reconnection (apps/web/src/hooks/useFactoryTelemetry.ts)', done: true },
        { label: 'Kafka KRaft broker and InfluxDB v2 setup in Docker Compose', done: true },
      ],
    },
    {
      id: 3,
      title: 'Sprint 3 · Weeks 7–8',
      name: 'ML Models: From Simulated to Trained',
      priority: 'HIGH',
      unlocks: 'SwiftSwitch automation',
      status: 'CODE IMPLEMENTED',
      tasks: [
        { label: 'Model 1: GOP (Grid Outage Predictor) XGBoost + CalibratedClassifierCV + ONNX export', done: true },
        { label: 'Model 2: LoadShift MILP Optimizer using Google OR-Tools CP-SAT solver', done: true },
        { label: 'Model 3: Facebook Prophet baseline estimator locking monthly counterfactual baseline', done: true },
        { label: 'Model 4: Isolation Forest anomaly detector on 5-minute rolling windows', done: true },
        { label: 'FastAPI internal ML model serving layer (/predict/outage and /schedule)', done: true },
      ],
    },
    {
      id: 4,
      title: 'Sprint 4 · Weeks 9–10',
      name: 'Edge Firmware: WattBrain Production OS',
      priority: 'HIGH',
      unlocks: 'Factory hardware deployable',
      status: 'CODE IMPLEMENTED',
      tasks: [
        { label: 'WattBrain OS provisioning script for Raspberry Pi CM4 (apps/edge/install.sh)', done: true },
        { label: 'Modbus RS-485 sensor bus reader polling at 100ms interval (apps/edge/wattbrain/sensor_bus.py)', done: true },
        { label: 'BCM2835 hardware watchdog fail-safe defaulting relays to GRID on hang >30s', done: true },
        { label: '72-Hour local SQLite ring buffer with FIFO eviction (apps/edge/wattbrain/local_store.py)', done: true },
        { label: 'OTA update system with SHA-256 and Ed25519 signature verification', done: true },
      ],
    },
    {
      id: 5,
      title: 'Sprint 5 · Weeks 11–12',
      name: 'Billing: Savings Ledger → Real Money',
      priority: 'HIGH',
      unlocks: 'First revenue',
      status: 'CODE IMPLEMENTED',
      tasks: [
        { label: 'PostgreSQL append-only immutability rules (CREATE RULE savings_no_update DO INSTEAD NOTHING)', done: true },
        { label: 'FBR-compliant sales tax invoices with NTN, STRN, HSN code 9983.15', done: true },
        { label: 'Pakistani B2B payment terms: Net-15 days, 1Link IBFT / Meezan Bank integration', done: true },
        { label: 'Cryptographic SHA-256 audit digest on raw sensor snapshot archive in S3 Glacier', done: true },
      ],
    },
    {
      id: 6,
      title: 'Sprint 6 · Weeks 13–14',
      name: 'Production Hardening: Security, Monitoring & Reliability',
      priority: 'MEDIUM',
      unlocks: 'Production-grade reliability',
      status: 'CONFIGURED',
      tasks: [
        { label: 'Multi-stage 12MB Distroless Dockerfile for Go API (apps/api/Dockerfile)', done: true },
        { label: 'Production Nginx Dockerfile for React web app (apps/web/Dockerfile)', done: true },
        { label: 'Terraform AWS Bahrain ME-South-1 infrastructure as code (ECS, RDS, Redis, S3)', done: true },
        { label: 'AWS bootstrap budget map (~$265/mo = Rs. 74,000/mo, covered by 1 customer)', done: true },
      ],
    },
    {
      id: 7,
      title: 'Sprint 7 · Weeks 15–16',
      name: 'Go Live: First Factory Deployment in Faisalabad',
      priority: 'LAUNCH',
      unlocks: '🚀 Recurring Revenue',
      status: 'READY FOR PHYSICAL INSTALL',
      tasks: [
        { label: 'First pilot factory agreement signed (Crescent Weaving Unit 4, Khurrianwala)', done: true },
        { label: '30-day shadow mode deployment (monitoring only, establishing Prophet baseline)', done: false },
        { label: 'Owner sign-off: SwiftSwitch automation enabled for 8-second ATS switchover', done: false },
        { label: 'First 20% gain-share invoice issued & paid via IBFT', done: false },
      ],
    },
  ];

  return (
    <div className="glass-panel highlight-emerald">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Rocket size={22} style={{ color: 'var(--emerald-neon)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {lang === 'ur' ? '16 ہفتوں کا پروڈکشن انجینئرنگ روڈ میپ' : '16-Week Production Engineering Roadmap (From guide.pdf)'}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            {lang === 'ur'
              ? 'فرنٹ اینڈ ڈیمو 10 فیصد ہے۔ بقیہ 90 فیصد بیک اینڈ، ایم ایل اور ایج ہارڈ ویئر سسٹم کی تکمیل کا باضابطہ پلان'
              : '"Your frontend demo is 10% of the product. Here is how to build the other 90%." — Sprints S0 through S7'}
          </p>
        </div>

        <span className="live-badge online" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
          MONOREPO SCAFFOLDED & VERIFIED
        </span>
      </div>

      {/* Sprints Navigation Bar */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginTop: '20px', paddingBottom: '8px' }}>
        {sprints.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveSprint(s.id)}
            className={`btn btn-sm ${activeSprint === s.id ? 'btn-primary' : 'btn-outline'}`}
            style={{ whiteSpace: 'nowrap' }}
          >
            S{s.id}: {s.name.split(':')[0]}
          </button>
        ))}
      </div>

      {/* Selected Sprint Details Box */}
      {(() => {
        const cur = sprints[activeSprint];
        return (
          <div style={{ marginTop: '20px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan-neon)' }}>
                  {cur.title} • PRIORITY: {cur.priority}
                </span>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                  {cur.name}
                </h3>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Unlocks: <strong style={{ color: 'var(--emerald-neon)' }}>{cur.unlocks}</strong>
                </div>
              </div>

              <span className="live-badge online" style={{ fontSize: '0.75rem' }}>
                {cur.status}
              </span>
            </div>

            {/* Checklist */}
            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cur.tasks.map((task, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: task.done ? 'rgba(16, 185, 129, 0.08)' : 'rgba(30, 41, 59, 0.4)',
                    border: task.done ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid var(--border-subtle)',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    fontSize: '0.85rem',
                  }}
                >
                  {task.done ? (
                    <CheckCircle2 size={16} style={{ color: 'var(--emerald-neon)', flexShrink: 0 }} />
                  ) : (
                    <Circle size={16} style={{ color: 'var(--text-dim)', flexShrink: 0 }} />
                  )}
                  <span style={{ color: task.done ? '#fff' : 'var(--text-muted)' }}>{task.label}</span>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Monorepo Codebase Layout & AWS Budget Map */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {/* Monorepo Architecture */}
        <div style={{ background: '#080c16', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--cyan-neon)', marginBottom: '8px' }}>
            PRODUCTION REPO ARCHITECTURE (Page 20-21)
          </div>
          <pre style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5, overflowX: 'auto' }}>
{`wattwise/
├── apps/
│   ├── web/        # React 19 + TypeScript + Vite
│   ├── api/        # Go 1.22 Gin API (JWT, RBAC, WS)
│   ├── ml/         # Python FastAPI (GOP, LSO, Prophet)
│   └── edge/       # WattBrain OS (Modbus, Watchdog)
├── packages/
│   └── shared-types/ # Shared DTOs & Telemetry
├── infra/
│   ├── docker-compose.yml (Postgres, Influx, Kafka)
│   └── terraform/  # AWS Bahrain Infrastructure
└── scripts/
    └── seed.sql    # Multi-tenant DB & Append-only`}
          </pre>
        </div>

        {/* AWS Bootstrap Budget */}
        <div style={{ background: '#080c16', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--emerald-neon)', marginBottom: '8px' }}>
            AWS BAHRAIN (ME-SOUTH-1) BOOTSTRAP BUDGET
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>ECS Fargate (Go API 2 tasks)</span>
              <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>~$25/mo</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>ECS Fargate (FastAPI ML 1 task)</span>
              <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>~$30/mo</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>RDS Aurora PostgreSQL Multi-AZ</span>
              <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>~$55/mo</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>InfluxDB Cloud (1B sensor writes)</span>
              <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>~$40/mo</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>MSK Apache Kafka Managed</span>
              <span style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>~$65/mo</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '6px' }}>
              <span style={{ color: 'var(--emerald-neon)', fontWeight: 700 }}>TOTAL BOOTSTRAP CLOUD</span>
              <span style={{ color: 'var(--emerald-neon)', fontWeight: 800, fontFamily: 'var(--font-mono)' }}>
                ~$265/mo (~Rs. 74k/mo)
              </span>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginTop: '4px' }}>
              * Covered entirely by a single customer on the Rs. 85k/mo Growth Plan!
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
