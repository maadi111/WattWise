import React, { useState } from 'react';
import {
  FileCheck2,
  UploadCloud,
  FileText,
  AlertTriangle,
  Download,
  ExternalLink,
  CheckCircle2,
  TrendingDown,
  Layers,
  Printer,
  X,
} from 'lucide-react';
import { UTILITY_BILL_AUDIT_DATA, CURRENT_FACILITY } from '../data/controlRoomData';

interface UtilityAuditViewProps {
  lang?: 'en' | 'ur';
}

export const UtilityAuditView: React.FC<UtilityAuditViewProps> = ({ lang = 'en' }) => {
  const [dossierModalOpen, setDossierModalOpen] = useState(false);
  const [selectedDisco, setSelectedDisco] = useState<'FESCO' | 'LESCO' | 'GEPCO' | 'K-ELECTRIC'>('FESCO');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              UTILITY AUDIT & WAPDA BILL RECONCILIATION
            </h1>
            <span className="ww-badge ww-badge-warning">
              <AlertTriangle size={11} /> 4.89% OVER-BILLING DETECTED
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            DISCO Tariff & Metering Verification: <b>FESCO · LESCO · GEPCO · K-ELECTRIC</b> · {CURRENT_FACILITY.name}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => setDossierModalOpen(true)}
            className="ww-btn ww-btn-primary"
          >
            <FileText size={14} /> GENERATE DISPUTE DOSSIER (NEPRA SEC. 21)
          </button>
        </div>
      </div>

      {/* Bill Upload & Ingestion Area */}
      <div className="ww-card" style={{ border: '1px dashed var(--border-interactive)', backgroundColor: 'var(--bg-surface)' }}>
        <div className="ww-card-body" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ padding: 12, borderRadius: 'var(--radius-sm)', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--industrial-blue-light)' }}>
              <UploadCloud size={24} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                Ingest Official Monthly Utility Bill (PDF / Scanned)
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
                Auto OCR extracts Reference No, B-3 TOU Peak/Off-Peak Units, MDI (kW), FPA and Electricity Duty
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="ww-badge ww-badge-live" style={{ fontSize: 10 }}>
              <CheckCircle2 size={11} /> OCR PARSED: AUGUST 2026
            </span>
            <button className="ww-btn ww-btn-secondary">
              Upload New PDF
            </button>
          </div>
        </div>
      </div>

      {/* Split-Screen Reconciliation: Official Utility Bill vs WattWise Measured */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        {/* Left Side: Official Utility Bill */}
        <div className="ww-card" style={{ borderTop: '3px solid var(--text-tertiary)' }}>
          <div className="ww-card-header">
            <span className="ww-card-title">
              <FileText size={13} color="var(--text-tertiary)" /> Official Utility Bill (FESCO Invoice)
            </span>
            <span className="num-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
              REF: {UTILITY_BILL_AUDIT_DATA.referenceNo}
            </span>
          </div>
          <div className="ww-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Billing Period</span>
              <span className="num-mono" style={{ fontWeight: 600 }}>{UTILITY_BILL_AUDIT_DATA.billingPeriod}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Total Charged Energy</span>
              <span className="num-mono" style={{ fontWeight: 800, fontSize: 15, color: 'var(--text-primary)' }}>
                {UTILITY_BILL_AUDIT_DATA.officialBillUnitsKwh.toLocaleString()} <span style={{ fontSize: 11 }}>kWh</span>
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Peak Units Charged</span>
              <span className="num-mono" style={{ fontWeight: 600 }}>
                {UTILITY_BILL_AUDIT_DATA.peakOffPeakAudit.officialPeakUnits.toLocaleString()} kWh
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Off-Peak Units Charged</span>
              <span className="num-mono" style={{ fontWeight: 600 }}>
                {UTILITY_BILL_AUDIT_DATA.peakOffPeakAudit.officialOffPeakUnits.toLocaleString()} kWh
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Maximum Demand Indicator (MDI)</span>
              <span className="num-mono" style={{ fontWeight: 600 }}>3,180 kW</span>
            </div>
          </div>
        </div>

        {/* Right Side: WattWise Measured Telemetry */}
        <div className="ww-card" style={{ borderTop: '3px solid var(--operational-green)' }}>
          <div className="ww-card-header">
            <span className="ww-card-title">
              <CheckCircle2 size={13} color="var(--operational-green)" /> WattWise Measured (Sub-Station CTs)
            </span>
            <span className="num-mono" style={{ fontSize: 10, color: 'var(--operational-green)' }}>
              CLASS 0.2S METERING
            </span>
          </div>
          <div className="ww-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Continuous Ingestion Window</span>
              <span className="num-mono" style={{ fontWeight: 600, color: 'var(--operational-green)' }}>744h (100% Coverage)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Actual Consumed Energy</span>
              <span className="num-mono" style={{ fontWeight: 800, fontSize: 15, color: 'var(--operational-green)' }}>
                {UTILITY_BILL_AUDIT_DATA.wattwiseMeasuredUnitsKwh.toLocaleString()} <span style={{ fontSize: 11 }}>kWh</span>
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>True Measured Peak Units</span>
              <span className="num-mono" style={{ fontWeight: 600 }}>
                {UTILITY_BILL_AUDIT_DATA.peakOffPeakAudit.wattwisePeakUnits.toLocaleString()} kWh
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>True Measured Off-Peak</span>
              <span className="num-mono" style={{ fontWeight: 600 }}>
                {UTILITY_BILL_AUDIT_DATA.peakOffPeakAudit.wattwiseOffPeakUnits.toLocaleString()} kWh
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Actual MDI (15m Window)</span>
              <span className="num-mono" style={{ fontWeight: 600, color: 'var(--operational-green)' }}>2,840 kW</span>
            </div>
          </div>
        </div>
      </div>

      {/* Discrepancy Highlight Banner & Potential Claim */}
      <div className="ww-card" style={{ border: '1px solid var(--energy-amber)', backgroundColor: 'var(--energy-amber-bg)' }}>
        <div className="ww-card-body" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--energy-amber)', textTransform: 'uppercase' }}>
              Calculated Over-Billing Discrepancy
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginTop: 4 }}>
              <span className="num-mono" style={{ fontSize: 24, fontWeight: 900, color: 'var(--text-primary)' }}>
                +{UTILITY_BILL_AUDIT_DATA.unitDifferenceKwh.toLocaleString()} kWh
              </span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--energy-amber)' }}>
                ({UTILITY_BILL_AUDIT_DATA.variancePercent}% Overcharge)
              </span>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>
              Divergence observed primarily during unannounced feeder trip intervals where utility meter continued running on auxiliary backfeed.
            </div>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
              Recoverable Financial Claim
            </div>
            <div className="num-mono" style={{ fontSize: 28, fontWeight: 900, color: 'var(--energy-amber)', marginTop: 2 }}>
              Rs. {UTILITY_BILL_AUDIT_DATA.financialImpactPkr.totalPotentialRecovery.toLocaleString()}
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
              Includes Base Tariff + FPA Surcharge + General Sales Tax
            </div>
          </div>
        </div>
      </div>

      {/* NEPRA DOSSIER MODAL */}
      {dossierModalOpen && (
        <div className="ww-drawer-overlay" onClick={() => setDossierModalOpen(false)}>
          <div
            style={{
              width: 760,
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #0B3445', paddingBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 900, color: '#0B3445' }}>
                  NEPRA SECTION 21 DISPUTE DOSSIER
                </h2>
                <div style={{ fontSize: 11, color: '#626B70' }}>
                  Consumer Dispute Filing against Faisalabad Electric Supply Company (FESCO)
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={() => window.print()} className="ww-btn ww-btn-secondary" style={{ color: '#101416', borderColor: '#D9DEDF' }}>
                  <Printer size={14} /> Print Dossier
                </button>
                <button onClick={() => setDossierModalOpen(false)} className="ww-btn ww-btn-ghost" style={{ padding: 4 }}>
                  <X size={18} />
                </button>
              </div>
            </div>

            <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 14, fontSize: 12, lineHeight: 1.5 }}>
              <div style={{ backgroundColor: '#F5F6F4', padding: 12, borderRadius: 4 }}>
                <b>Legal Grounding:</b> {UTILITY_BILL_AUDIT_DATA.nepraReference}. Consumer has maintained uninterrupted secondary Class 0.2S continuous telemetry demonstrating clear discrepancy with billing meter.
              </div>

              <div style={{ fontWeight: 700, fontSize: 13, color: '#0B3445', marginTop: 4 }}>
                1. Executive Summary & Monetary Claim
              </div>
              <p>
                During the August 2026 billing cycle, FESCO charged 351,200 kWh under Tariff B-3. WattWise IoT telemetry deployed at Crescent Weaving Unit 04 logged exactly 334,020 kWh. Total illegitimate billing: <b>17,180 kWh (Rs. 618,480)</b>.
              </p>

              <div style={{ fontWeight: 700, fontSize: 13, color: '#0B3445' }}>
                2. Discrepancy Breakdown Table
              </div>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11.5 }}>
                <thead>
                  <tr style={{ backgroundColor: '#F5F6F4', borderBottom: '1px solid #D9DEDF' }}>
                    <th style={{ padding: 6, textAlign: 'left' }}>Component</th>
                    <th style={{ padding: 6, textAlign: 'right' }}>FESCO Billed</th>
                    <th style={{ padding: 6, textAlign: 'right' }}>WattWise Measured</th>
                    <th style={{ padding: 6, textAlign: 'right' }}>Discrepancy (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: '1px solid #D9DEDF' }}>
                    <td style={{ padding: 6 }}>Peak TOU Tariff (Units)</td>
                    <td style={{ padding: 6, textAlign: 'right' }} className="num-mono">98,400 kWh</td>
                    <td style={{ padding: 6, textAlign: 'right' }} className="num-mono">91,200 kWh</td>
                    <td style={{ padding: 6, textAlign: 'right', fontWeight: 700 }} className="num-mono">Rs. 288,000</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #D9DEDF' }}>
                    <td style={{ padding: 6 }}>Off-Peak TOU Tariff (Units)</td>
                    <td style={{ padding: 6, textAlign: 'right' }} className="num-mono">252,800 kWh</td>
                    <td style={{ padding: 6, textAlign: 'right' }} className="num-mono">242,820 kWh</td>
                    <td style={{ padding: 6, textAlign: 'right', fontWeight: 700 }} className="num-mono">Rs. 270,350</td>
                  </tr>
                  <tr style={{ borderBottom: '1px solid #D9DEDF' }}>
                    <td style={{ padding: 6 }}>Fuel Price Adjustment (FPA)</td>
                    <td style={{ padding: 6, textAlign: 'right' }} className="num-mono">—</td>
                    <td style={{ padding: 6, textAlign: 'right' }} className="num-mono">—</td>
                    <td style={{ padding: 6, textAlign: 'right', fontWeight: 700 }} className="num-mono">Rs. 42,950</td>
                  </tr>
                  <tr style={{ backgroundColor: '#F0FDF4', fontWeight: 800 }}>
                    <td style={{ padding: 8 }}>Total Claim for Credit Note</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>—</td>
                    <td style={{ padding: 8, textAlign: 'right' }}>—</td>
                    <td style={{ padding: 8, textAlign: 'right', color: '#27845A', fontSize: 13 }} className="num-mono">
                      Rs. 618,480
                    </td>
                  </tr>
                </tbody>
              </table>

              <div style={{ marginTop: 12 }}>
                <b>Certified By:</b> Engr. Hammad Raza, Energy Manager (PEC #ELECT-48201) & WattWise Legal Audit Cell.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
