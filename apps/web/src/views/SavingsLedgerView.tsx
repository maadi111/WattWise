import React, { useState } from 'react';
import {
  Receipt,
  FileCheck2,
  Lock,
  Download,
  ExternalLink,
  Shield,
  CheckCircle2,
  FileText,
  DollarSign,
  TrendingDown,
  X,
  Printer,
} from 'lucide-react';
import { CURRENT_FACILITY, SAVINGS_LEDGER_DATA } from '../data/controlRoomData';

interface SavingsLedgerViewProps {
  lang?: 'en' | 'ur';
}

export const SavingsLedgerView: React.FC<SavingsLedgerViewProps> = ({ lang = 'en' }) => {
  const [certModalOpen, setCertModalOpen] = useState(false);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              SAVINGSLEDGER™ VERIFIED ENERGY SAVINGS
            </h1>
            <span className="ww-badge ww-badge-live">
              <Lock size={11} /> SHA-256 IMMUTABLE
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Cryptographically audited gain-share reconciliation · {CURRENT_FACILITY.name} ({CURRENT_FACILITY.unit})
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setCertModalOpen(true)}
            className="ww-btn ww-btn-primary"
          >
            <FileText size={14} /> GENERATE CERTIFICATE
          </button>
        </div>
      </div>

      {/* Large Figure Banner */}
      <div className="ww-card" style={{ borderLeft: '4px solid var(--operational-green)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="ww-card-body" style={{ padding: '18px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Documented September 2026 Verified Savings
            </div>
            <div className="num-mono" style={{ fontSize: 36, fontWeight: 900, color: 'var(--operational-green)', letterSpacing: '-0.02em', marginTop: 2 }}>
              Rs. {SAVINGS_LEDGER_DATA.headlineSavingsPkr.toLocaleString()}
            </div>
            <div style={{ fontSize: 11.5, color: 'var(--text-tertiary)', marginTop: 4 }}>
              Audited in compliance with IPMVP Option C (Whole Facility Counterfactual Regression)
            </div>
          </div>

          {/* Verification Status Badges */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--bg-surface-elevated)', padding: '6px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: 11 }}>
              <CheckCircle2 size={13} color="var(--operational-green)" />
              <span>BASELINE: <b style={{ color: 'var(--text-primary)' }}>FROZEN</b></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--bg-surface-elevated)', padding: '6px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: 11 }}>
              <Lock size={13} color="var(--operational-green)" />
              <span>HASH: <b style={{ color: 'var(--operational-green)' }}>SHA-256 VERIFIED</b></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--bg-surface-elevated)', padding: '6px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: 11 }}>
              <Shield size={13} color="var(--operational-green)" />
              <span>TELEMETRY: <b style={{ color: 'var(--text-primary)' }}>IMMUTABLE</b></span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: 'var(--bg-surface-elevated)', padding: '6px 10px', borderRadius: 'var(--radius-xs)', border: '1px solid var(--border-subtle)', fontSize: 11 }}>
              <FileCheck2 size={13} color="var(--operational-green)" />
              <span>CERTIFICATE: <b style={{ color: 'var(--operational-green)' }}>READY</b></span>
            </div>
          </div>
        </div>
      </div>

      {/* Three-Way Calculation Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
        {/* Step 1: Baseline */}
        <div className="ww-card">
          <div className="ww-card-body" style={{ padding: 14 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Counterfactual Baseline
            </div>
            <div className="num-mono" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              Rs. 18.20M
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>
              Prophet ML model without WattWise
            </div>
          </div>
        </div>

        {/* Minus Sign */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--text-tertiary)', fontWeight: 800 }}>
          −
        </div>

        {/* Step 2: Actual */}
        <div className="ww-card">
          <div className="ww-card-body" style={{ padding: 14 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Actual Energy Cost
            </div>
            <div className="num-mono" style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              Rs. 12.94M
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>
              FESCO B-3 grid + diesel consumed
            </div>
          </div>
        </div>

        {/* Equals Sign */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: 'var(--operational-green)', fontWeight: 800 }}>
          =
        </div>

        {/* Step 3: Documented Savings */}
        <div className="ww-card" style={{ border: '1px solid var(--operational-green)', backgroundColor: 'var(--operational-green-bg)' }}>
          <div className="ww-card-body" style={{ padding: 14 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--operational-green)', textTransform: 'uppercase' }}>
              Documented Savings
            </div>
            <div className="num-mono" style={{ fontSize: 20, fontWeight: 800, color: 'var(--operational-green)', marginTop: 4 }}>
              Rs. 5.26M
            </div>
            <div style={{ fontSize: 10, color: 'var(--operational-green)', marginTop: 2 }}>
              Documented 28.9% reduction
            </div>
          </div>
        </div>

        {/* WattWise 20% */}
        <div className="ww-card">
          <div className="ww-card-body" style={{ padding: 14 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              WattWise 20% Gain-Share
            </div>
            <div className="num-mono" style={{ fontSize: 20, fontWeight: 800, color: '#38bdf8', marginTop: 4 }}>
              Rs. 1.052M
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-secondary)', marginTop: 2 }}>
              Zero-risk performance fee
            </div>
          </div>
        </div>

        {/* Factory 80% */}
        <div className="ww-card" style={{ border: '1px solid var(--energy-amber)', backgroundColor: 'var(--energy-amber-bg)' }}>
          <div className="ww-card-body" style={{ padding: 14 }}>
            <div style={{ fontSize: 10.5, fontWeight: 700, color: 'var(--energy-amber)', textTransform: 'uppercase' }}>
              Factory Retained (80%)
            </div>
            <div className="num-mono" style={{ fontSize: 20, fontWeight: 800, color: 'var(--energy-amber)', marginTop: 4 }}>
              Rs. 4.208M
            </div>
            <div style={{ fontSize: 10, color: 'var(--energy-amber)', marginTop: 2 }}>
              Direct mill bottom line
            </div>
          </div>
        </div>
      </div>

      {/* Auditable Ledger Table with SHA-256 Digest */}
      <div className="ww-card">
        <div className="ww-card-header">
          <span className="ww-card-title">
            <Receipt size={13} color="var(--operational-green)" />
            Auditable Monthly Energy Reconciliation Ledger
          </span>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
            SHA-256 Root Hash Verified
          </span>
        </div>
        <div className="ww-table-container">
          <table className="ww-table">
            <thead>
              <tr>
                <th>Billing Period</th>
                <th>Baseline (PKR)</th>
                <th>Actual Cost (PKR)</th>
                <th>Documented Savings</th>
                <th>WattWise Fee (20%)</th>
                <th>Factory Gain (80%)</th>
                <th>Verification</th>
                <th>Cryptographic SHA-256</th>
              </tr>
            </thead>
            <tbody>
              {SAVINGS_LEDGER_DATA.monthlyLedger.map((row, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>{row.date}</td>
                  <td className="num-mono">Rs. {(row.baselinePkr / 1000000).toFixed(2)}M</td>
                  <td className="num-mono">Rs. {(row.actualPkr / 1000000).toFixed(2)}M</td>
                  <td className="num-mono" style={{ fontWeight: 700, color: 'var(--operational-green)' }}>
                    Rs. {(row.savingsPkr / 1000000).toFixed(2)}M
                  </td>
                  <td className="num-mono" style={{ color: '#38bdf8' }}>
                    Rs. {(row.wattwiseFeePkr / 1000000).toFixed(3)}M
                  </td>
                  <td className="num-mono" style={{ fontWeight: 700, color: 'var(--energy-amber)' }}>
                    Rs. {(row.factoryGainPkr / 1000000).toFixed(3)}M
                  </td>
                  <td>
                    <span className="ww-badge ww-badge-live">
                      <CheckCircle2 size={10} /> {row.status}
                    </span>
                  </td>
                  <td className="num-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                    {row.sha256}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 17. SAVINGS CERTIFICATE MODAL PREVIEW */}
      {certModalOpen && (
        <div className="ww-drawer-overlay" onClick={() => setCertModalOpen(false)}>
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
            {/* Modal Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #101416', paddingBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, backgroundColor: '#0B3445', color: '#FFFFFF', borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>
                  W
                </div>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0B3445', letterSpacing: '0.04em' }}>
                    WATTWISE™ ENERGY SAVINGS CERTIFICATE
                  </h2>
                  <div style={{ fontSize: 10, color: '#626B70', textTransform: 'uppercase' }}>
                    CERTIFICATE ID: {SAVINGS_LEDGER_DATA.verificationStatus.certificateId}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => window.print()} className="ww-btn ww-btn-secondary" style={{ color: '#101416', borderColor: '#D9DEDF' }}>
                  <Printer size={14} /> Print / PDF
                </button>
                <button onClick={() => setCertModalOpen(false)} className="ww-btn ww-btn-ghost" style={{ padding: 4 }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* Certificate Body */}
            <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, backgroundColor: '#F5F6F4', padding: 14, borderRadius: 4 }}>
                <div>
                  <div style={{ fontSize: 10, color: '#626B70', textTransform: 'uppercase' }}>Certified Beneficiary</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#101416' }}>{CURRENT_FACILITY.name}</div>
                  <div style={{ fontSize: 11, color: '#626B70' }}>{CURRENT_FACILITY.unit} · {CURRENT_FACILITY.city}, Pakistan</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, color: '#626B70', textTransform: 'uppercase' }}>Reconciliation Period</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: '#101416' }}>1 September 2026 — 30 September 2026</div>
                  <div style={{ fontSize: 11, color: '#626B70' }}>Utility DISCO: {CURRENT_FACILITY.disco} ({CURRENT_FACILITY.feederCode})</div>
                </div>
              </div>

              {/* Verified Metrics Table */}
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, marginTop: 8 }}>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #D9DEDF', padding: '8px 0' }}>
                    <td style={{ padding: 8, color: '#626B70' }}>Counterfactual Baseline (IPMVP Option C)</td>
                    <td style={{ padding: 8, textAlign: 'right', fontWeight: 700 }} className="num-mono">Rs. 18,200,000</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #D9DEDF' }}>
                    <td style={{ padding: 8, color: '#626B70' }}>Actual Measured Energy Cost</td>
                    <td style={{ padding: 8, textAlign: 'right', fontWeight: 700 }} className="num-mono">Rs. 12,940,000</td>
                  </tr>
                  <tr style={{ borderBottom: '2px solid #0B3445', backgroundColor: '#F0FDF4' }}>
                    <td style={{ padding: 10, fontWeight: 800, color: '#27845A' }}>DOCUMENTED VERIFIED SAVINGS</td>
                    <td style={{ padding: 10, textAlign: 'right', fontWeight: 900, color: '#27845A', fontSize: 16 }} className="num-mono">
                      Rs. 5,260,000
                    </td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #D9DEDF' }}>
                    <td style={{ padding: 8, color: '#626B70' }}>WattWise Performance Share (20%)</td>
                    <td style={{ padding: 8, textAlign: 'right', fontWeight: 700, color: '#124B63' }} className="num-mono">Rs. 1,052,000</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #D9DEDF' }}>
                    <td style={{ padding: 8, color: '#626B70' }}>Factory Retained Value (80%)</td>
                    <td style={{ padding: 8, textAlign: 'right', fontWeight: 800, color: '#D89B24' }} className="num-mono">Rs. 4,208,000</td>
                  </tr>
                </tbody>
              </table>

              {/* Cryptographic SHA-256 Proof */}
              <div style={{ backgroundColor: '#F5F6F4', padding: 12, borderRadius: 4, fontSize: 10.5 }}>
                <div style={{ fontWeight: 700, color: '#101416', textTransform: 'uppercase' }}>Cryptographic Telemetry Proof</div>
                <div className="num-mono" style={{ color: '#124B63', wordBreak: 'break-all', marginTop: 4 }}>
                  SHA-256 Digest: {SAVINGS_LEDGER_DATA.verificationStatus.sha256Hash}
                </div>
                <div style={{ color: '#626B70', marginTop: 4 }}>
                  Telemetry Coverage: 100% (2,592,000 continuous 100ms records without packet drop)
                </div>
              </div>

              {/* Signatures */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, marginTop: 24, paddingTop: 16, borderTop: '1px solid #D9DEDF' }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#101416' }}>Engr. Hammad Raza</div>
                  <div style={{ fontSize: 10, color: '#626B70' }}>Director of Field Engineering · WattWise™</div>
                  <div style={{ fontSize: 9.5, color: '#27845A', marginTop: 2 }}>Digitally Signed (RS256 PKI Verified)</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: '#101416' }}>M. Tariq Crescent</div>
                  <div style={{ fontSize: 10, color: '#626B70' }}>Managing Director · Crescent Weaving Mills</div>
                  <div style={{ fontSize: 9.5, color: '#626B70', marginTop: 2 }}>Counter-Signed for Settlement</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
