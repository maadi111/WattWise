import React, { useState } from 'react';
import {
  Leaf,
  FileCheck2,
  CheckCircle2,
  Download,
  ExternalLink,
  Shield,
  TrendingDown,
  Globe,
  Printer,
  X,
} from 'lucide-react';
import { CARBON_ESG_DATA, CURRENT_FACILITY } from '../data/controlRoomData';

interface CarbonEsgViewProps {
  lang?: 'en' | 'ur';
}

export const CarbonEsgView: React.FC<CarbonEsgViewProps> = ({ lang = 'en' }) => {
  const [esgModalOpen, setEsgModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              CARBON ACCOUNTING & EU CBAM EXPORT READINESS
            </h1>
            <span className="ww-badge ww-badge-live">
              <Leaf size={11} /> SCOPE 1 + SCOPE 2 VERIFIED
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Audit-grade carbon compliance for European and North American buyers · {CURRENT_FACILITY.name}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setEsgModalOpen(true)}
            className="ww-btn ww-btn-primary"
          >
            <FileCheck2 size={14} /> GENERATE ESG COMPLIANCE DOSSIER
          </button>
        </div>
      </div>

      {/* Hero Carbon Emissions Strip */}
      <div className="ww-hero-strip">
        <div className="ww-hero-item">
          <span className="ww-hero-label">Total Monthly Emissions</span>
          <div className="ww-hero-value" style={{ color: 'var(--text-primary)' }}>
            284.7 <span className="ww-hero-unit">tCO₂e</span>
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
            Scope 1 (Diesel) + Scope 2 (Grid)
          </span>
        </div>

        <div className="ww-hero-item ww-hero-dominant">
          <span className="ww-hero-label" style={{ color: 'var(--operational-green)' }}>Avoided Monthly Emissions</span>
          <div className="ww-hero-value" style={{ color: 'var(--operational-green)' }}>
            38.4 <span className="ww-hero-unit" style={{ color: 'var(--operational-green)' }}>tCO₂e</span>
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--operational-green)' }}>
            13.5% Net Facility Decarbonization
          </span>
        </div>

        <div className="ww-hero-item">
          <span className="ww-hero-label">Avoided Diesel Consumption</span>
          <div className="ww-hero-value" style={{ color: 'var(--text-primary)' }}>
            14,250 <span className="ww-hero-unit">Liters</span>
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--operational-green)' }}>
            Rs. 4,061,250 Fuel Cost Saved
          </span>
        </div>

        <div className="ww-hero-item">
          <span className="ww-hero-label">Export Audit Status</span>
          <div className="ww-hero-value" style={{ color: 'var(--operational-green)' }}>
            READY
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>
            Higg FEM / EU CBAM Compliant
          </span>
        </div>
      </div>

      {/* Source Split & Conversion Paths */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1.4fr) minmax(320px, 1fr)', gap: 14 }}>
        {/* Source Split Conversion Paths */}
        <div className="ww-card">
          <div className="ww-card-header">
            <span className="ww-card-title">
              <Leaf size={13} color="var(--operational-green)" />
              Energy-to-Carbon Conversion Paths
            </span>
            <span className="num-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
              ISO 14064-1 Factors
            </span>
          </div>
          <div className="ww-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {/* Grid Path */}
            <div style={{ padding: 12, backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Scope 2: FESCO Grid Electricity
                </span>
                <span className="num-mono" style={{ fontSize: 12, fontWeight: 700, color: '#38bdf8' }}>
                  246.3 tCO₂e (86.5%)
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                586,400 kWh consumed × 0.42 kg CO₂e/kWh (Pakistan National Grid Average Factor).
              </div>
            </div>

            {/* Diesel Path */}
            <div style={{ padding: 12, backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                  Scope 1: Backup Caterpillar Diesel Generators
                </span>
                <span className="num-mono" style={{ fontSize: 12, fontWeight: 700, color: 'var(--energy-amber)' }}>
                  38.4 tCO₂e (13.5%)
                </span>
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>
                14,320 Liters diesel combusted × 2.68 kg CO₂e/Liter. Pre-emptive SwiftSwitch averted an additional 14,250 Liters.
              </div>
            </div>
          </div>
        </div>

        {/* Export Readiness Checklist */}
        <div className="ww-card">
          <div className="ww-card-header">
            <span className="ww-card-title">
              <Globe size={13} color="#38bdf8" />
              Global Buyer Export-Readiness Checklist
            </span>
            <span className="ww-badge ww-badge-live">100% READY</span>
          </div>
          <div className="ww-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CARBON_ESG_DATA.exportReadinessChecklist.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={14} color="var(--operational-green)" />
                  <span style={{ fontSize: 11.5, color: 'var(--text-primary)', fontWeight: 500 }}>
                    {item.label}
                  </span>
                </div>
                <span className="num-mono" style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>
                  {item.standard}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ESG Report Modal */}
      {esgModalOpen && (
        <div className="ww-drawer-overlay" onClick={() => setEsgModalOpen(false)}>
          <div
            style={{
              width: 720,
              maxWidth: '95vw',
              maxHeight: '90vh',
              overflowY: 'auto',
              backgroundColor: '#FFFFFF',
              color: '#101416',
              borderRadius: 'var(--radius-sm)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.75)',
              padding: 32,
              margin: 'auto',
              fontFamily: 'var(--font-sans)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #27845A', paddingBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#27845A' }}>
                  WATTWISE™ CARBON & ESG AUDIT REPORT
                </h2>
                <div style={{ fontSize: 11, color: '#626B70' }}>
                  Export-Ready Emissions Disclosure · EU CBAM & Higg FEM Format
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => window.print()} className="ww-btn ww-btn-secondary" style={{ color: '#101416', borderColor: '#D9DEDF' }}>
                  <Printer size={14} /> Print Report
                </button>
                <button onClick={() => setEsgModalOpen(false)} className="ww-btn ww-btn-ghost" style={{ padding: 4 }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14, fontSize: 12 }}>
              <div style={{ backgroundColor: '#F0FDF4', padding: 12, borderRadius: 4 }}>
                <b>Verification Statement:</b> Energy activity telemetry logged directly from WattClamp physical sensors conforms to ISO 14064-3 third-party assurance requirements. Zero estimated or self-reported data.
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 8 }}>
                <div style={{ padding: 10, border: '1px solid #D9DEDF', borderRadius: 4 }}>
                  <div style={{ color: '#626B70', fontSize: 10 }}>Net Monthly Emissions</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#101416' }} className="num-mono">284.7 tCO₂e</div>
                </div>
                <div style={{ padding: 10, border: '1px solid #D9DEDF', borderRadius: 4 }}>
                  <div style={{ color: '#626B70', fontSize: 10 }}>Avoided via WattWise</div>
                  <div style={{ fontSize: 20, fontWeight: 800, color: '#27845A' }} className="num-mono">-38.4 tCO₂e (13.5%)</div>
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <b>Certified By:</b> WattWise Sustainability Assurance Engine · Hash: e3b0c44298fc1c...
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
