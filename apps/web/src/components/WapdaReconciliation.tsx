import React, { useState } from 'react';
import { Receipt, AlertTriangle, CheckCircle2, FileCheck, Upload, Download, ArrowRight, ShieldAlert } from 'lucide-react';
import { Factory, WapdaBillAudit } from '../types';
import { WAPDA_BILL_AUDITS } from '../data/mockData';
import { industrialAudio } from '../services/soundEffects';

interface WapdaReconciliationProps {
  factory: Factory;
  lang: 'en' | 'ur';
}

export const WapdaReconciliation: React.FC<WapdaReconciliationProps> = ({ factory, lang }) => {
  const [audits, setAudits] = useState<WapdaBillAudit[]>(WAPDA_BILL_AUDITS);
  const [selectedAudit, setSelectedAudit] = useState<WapdaBillAudit>(WAPDA_BILL_AUDITS[0]);
  const [showClaimLetter, setShowClaimLetter] = useState(false);

  const handleSimulateUpload = () => {
    industrialAudio.playSuccessChime();
    alert('Simulated WAPDA/FESCO industrial bill OCR parsing completed! Telemetry cross-verified against 10kHz CT sensor logs.');
  };

  return (
    <div className="glass-panel">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Receipt size={22} style={{ color: 'var(--amber-neon)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {lang === 'ur' ? 'واپڈا بل کا موازنہ و ڈسکوز آڈٹ سسٹم' : 'WAPDA Bill Reconciliation & Utility Overbilling Audit'}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            {lang === 'ur'
              ? 'واپڈا کے بھیجے گئے بل کا واٹ کلیمپ سینسرز کے اصل یونٹس سے موازنہ کر کے غلط اوور بلنگ کی نشاندہی'
              : 'Annotating utility billing lines with Class 0.5 CT ground-truth data to catch overbilling errors (FESCO/LESCO/GEPCO)'}
          </p>
        </div>

        <button onClick={handleSimulateUpload} className="btn btn-outline">
          <Upload size={16} /> Upload New WAPDA Bill (PDF/Scan)
        </button>
      </div>

      {/* Discrepancy Highlight Banner */}
      <div style={{
        marginTop: '20px',
        background: 'rgba(245, 158, 11, 0.12)',
        border: '1px solid rgba(245, 158, 11, 0.35)',
        borderRadius: '10px',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '14px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={26} style={{ color: 'var(--amber-neon)' }} />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>
              BILLING DISCREPANCY FLAGGED: {selectedAudit.month}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              {factory.disco} billed <strong style={{ color: '#fff' }}>{selectedAudit.billedUnits.toLocaleString('en-PK')} units</strong>, while WattClamp™ recorded exactly <strong style={{ color: 'var(--emerald-neon)' }}>{selectedAudit.actualSensorUnits.toLocaleString('en-PK')} units</strong>.
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--amber-neon)', textTransform: 'uppercase', fontWeight: 700 }}>
            Claimable Overbilled Amount
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--amber-neon)' }}>
            Rs. {selectedAudit.overbilledAmountPkr.toLocaleString('en-PK')}
          </div>
        </div>
      </div>

      {/* Comparison Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {/* WAPDA Stated Bill */}
        <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>
            OFFICIAL {factory.disco} BILLING SLIP
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            Consumer #: {selectedAudit.consumerNumber}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Tariff: {selectedAudit.tariffCategory}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Billed Consumption</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>{selectedAudit.billedUnits.toLocaleString('en-PK')} kWh</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Fuel Price Adjustment (FPA)</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>Rs. {selectedAudit.fuelPriceAdjustmentPkr.toLocaleString('en-PK')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Quarterly Adjustment (QTA)</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>Rs. {selectedAudit.quarterlyAdjustmentPkr.toLocaleString('en-PK')}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Surcharges & Taxes</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: '#fff' }}>Rs. {selectedAudit.taxesAndSurchargesPkr.toLocaleString('en-PK')}</span>
            </div>
          </div>
        </div>

        {/* WattWise CT Ground Truth */}
        <div style={{ background: 'rgba(16, 185, 129, 0.05)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '18px' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-neon)', textTransform: 'uppercase' }}>
            WATTWISE™ CT CLAMP GROUND TRUTH
          </div>
          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            Verified 10 kHz High-Frequency Log
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
            Sensor Node Accuracy: ±0.5% (Class 0.5 IEC)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Actual Grid Energy Ingested</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--emerald-neon)' }}>
                {selectedAudit.actualSensorUnits.toLocaleString('en-PK')} kWh
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Phantom / Overcharged Units</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--rose-neon)' }}>
                +{selectedAudit.discrepancyUnits.toLocaleString('en-PK')} kWh ({selectedAudit.discrepancyPercent}%)
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>MDI Peak Demand Recorded</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--emerald-neon)' }}>847 kW (Under 950 kW sanction)</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Audit Dispute Status</span>
              <span className="live-badge warning" style={{ fontSize: '0.65rem' }}>{selectedAudit.disputeStatus}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Footer */}
      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button
          onClick={() => setShowClaimLetter(!showClaimLetter)}
          className="btn btn-primary"
        >
          <FileCheck size={16} /> {showClaimLetter ? 'Hide NEPRA Dispute Dossier' : 'Generate NEPRA Legal Dispute Dossier'}
        </button>
      </div>

      {/* Generated Legal Dispute Letter */}
      {showClaimLetter && (
        <div style={{
          marginTop: '20px',
          background: '#080c16',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px',
          padding: '24px',
          fontFamily: 'var(--font-mono)',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          lineHeight: 1.7,
        }}>
          <div style={{ color: 'var(--amber-neon)', fontWeight: 700, marginBottom: '10px', fontSize: '0.9rem' }}>
            OFFICIAL NOTICE OF ERRONEOUS BILLING & RECONCILIATION DEMAND
          </div>
          <div>To: Executive Engineer (XEN) / Commercial Manager, {factory.disco} Headquarters.</div>
          <div>Subject: Formal Dispute Regarding Consumer # {selectedAudit.consumerNumber} for {selectedAudit.month}.</div>
          <br />
          <div>Dear Sir/Madam,</div>
          <div>
            Pursuant to Section 21 of the NEPRA Act (Consumer Service Manual), our industrial client {factory.name} hereby formally contests the electricity bill issued for {selectedAudit.month}.
          </div>
          <div>
            Ground-truth Class 0.5 independent current transformer monitoring established an actual industrial import of {selectedAudit.actualSensorUnits.toLocaleString('en-PK')} units, whereas your meter register reflected {selectedAudit.billedUnits.toLocaleString('en-PK')} units — resulting in an unjustified excess billing of {selectedAudit.discrepancyUnits.toLocaleString('en-PK')} units (amounting to Rs. {selectedAudit.overbilledAmountPkr.toLocaleString('en-PK')}).
          </div>
          <br />
          <div style={{ color: '#fff' }}>
            We attach the cryptographic SHA-256 timestamped 10-second interval telemetry log for your joint testing under NEPRA regulations.
          </div>
        </div>
      )}
    </div>
  );
};
