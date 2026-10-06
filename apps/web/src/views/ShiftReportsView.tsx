import React, { useState } from 'react';
import {
  FileText,
  Share2,
  Calendar,
  Clock,
  Zap,
  Fuel,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Copy,
  Check,
} from 'lucide-react';
import { SHIFT_REPORT_DATA, CURRENT_FACILITY } from '../data/controlRoomData';

interface ShiftReportsViewProps {
  lang?: 'en' | 'ur';
}

export const ShiftReportsView: React.FC<ShiftReportsViewProps> = ({ lang = 'en' }) => {
  const [selectedShift, setSelectedShift] = useState<'DAY' | 'NIGHT'>('DAY');
  const [copied, setCopied] = useState(false);

  const whatsappText = `*WATTWISE™ SHIFT REPORT*
📍 *${SHIFT_REPORT_DATA.facility}*
⏰ *${SHIFT_REPORT_DATA.shift}* — ${SHIFT_REPORT_DATA.date}
👤 *Supervisor:* ${SHIFT_REPORT_DATA.supervisor}

⚡ *Energy Consumed:* ${SHIFT_REPORT_DATA.energyConsumedKwh.toLocaleString()} kWh
🛢️ *Diesel Consumed:* ${SHIFT_REPORT_DATA.dieselUsedLiters} Liters
🛡️ *Diesel Avoided:* ${SHIFT_REPORT_DATA.dieselAvoidedLiters} Liters
💰 *Shift Savings:* Rs. ${SHIFT_REPORT_DATA.shiftSavingsPkr.toLocaleString()}
🧵 *Thread Breaks Avoided:* ${SHIFT_REPORT_DATA.threadBreaksAvoided}
🔌 *Grid Outages Pre-Empted:* ${SHIFT_REPORT_DATA.gridOutagesPreempted}

_Generated via WattWise OS at 19:00 PKT_`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(whatsappText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const shareToWhatsapp = () => {
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(whatsappText)}`, '_blank');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              PLANT SUPERVISOR SHIFT DISPATCH REPORT
            </h1>
            <span className="ww-badge ww-badge-live">
              <CheckCircle2 size={11} /> SHIFT COMPLETE
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Daily operations handover summary & WhatsApp broadcast · {CURRENT_FACILITY.name}
          </div>
        </div>

        {/* Action CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={copyToClipboard} className="ww-btn ww-btn-secondary">
            {copied ? <Check size={14} color="var(--operational-green)" /> : <Copy size={14} />}
            {copied ? 'Copied to Clipboard' : 'Copy Text'}
          </button>
          <button onClick={shareToWhatsapp} className="ww-btn ww-btn-primary" style={{ backgroundColor: '#25D366', borderColor: '#22bf5b', color: '#0D1113' }}>
            <Share2 size={14} /> SHARE TO WHATSAPP
          </button>
          <button onClick={() => window.print()} className="ww-btn ww-btn-secondary">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Large Shift Selector Banner */}
      <div className="ww-card" style={{ backgroundColor: 'var(--bg-surface)' }}>
        <div className="ww-card-body" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Clock size={20} color="var(--industrial-blue-light)" />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                CURRENT ACTIVE REPORTING PERIOD
              </div>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
                {SHIFT_REPORT_DATA.shift} — {SHIFT_REPORT_DATA.date}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            <button
              onClick={() => setSelectedShift('DAY')}
              className={`ww-btn ${selectedShift === 'DAY' ? 'ww-btn-primary' : 'ww-btn-secondary'}`}
            >
              Day Shift (07:00 — 19:00)
            </button>
            <button
              onClick={() => setSelectedShift('NIGHT')}
              className={`ww-btn ${selectedShift === 'NIGHT' ? 'ww-btn-primary' : 'ww-btn-secondary'}`}
            >
              Night Shift (19:00 — 07:00)
            </button>
          </div>
        </div>
      </div>

      {/* Operational Shift Metrics Grid */}
      <div className="ww-hero-strip">
        <div className="ww-hero-item">
          <span className="ww-hero-label">Shift Energy Consumed</span>
          <div className="ww-hero-value">
            {SHIFT_REPORT_DATA.energyConsumedKwh.toLocaleString()} <span className="ww-hero-unit">kWh</span>
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>
            Grid + Genset Combined
          </span>
        </div>

        <div className="ww-hero-item">
          <span className="ww-hero-label">Actual Diesel Used</span>
          <div className="ww-hero-value" style={{ color: 'var(--text-secondary)' }}>
            {SHIFT_REPORT_DATA.dieselUsedLiters} <span className="ww-hero-unit">Liters</span>
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
            Generator Run Time: 42 mins
          </span>
        </div>

        <div className="ww-hero-item ww-hero-dominant">
          <span className="ww-hero-label" style={{ color: 'var(--operational-green)' }}>Diesel Fuel Avoided</span>
          <div className="ww-hero-value" style={{ color: 'var(--operational-green)' }}>
            {SHIFT_REPORT_DATA.dieselAvoidedLiters} <span className="ww-hero-unit" style={{ color: 'var(--operational-green)' }}>Liters</span>
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--operational-green)' }}>
            Pre-emptive SwiftSwitch savings
          </span>
        </div>

        <div className="ww-hero-item">
          <span className="ww-hero-label">Shift Cost Savings</span>
          <div className="ww-hero-value" style={{ color: 'var(--energy-amber)' }}>
            Rs. {SHIFT_REPORT_DATA.shiftSavingsPkr.toLocaleString()}
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--energy-amber)' }}>
            Direct operating value
          </span>
        </div>

        <div className="ww-hero-item">
          <span className="ww-hero-label">Thread Breaks Avoided</span>
          <div className="ww-hero-value" style={{ color: 'var(--operational-green)' }}>
            {SHIFT_REPORT_DATA.threadBreaksAvoided}
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>
            2 Outages Pre-Empted (8ms)
          </span>
        </div>
      </div>

      {/* Major Operational Incidents */}
      <div className="ww-card">
        <div className="ww-card-header">
          <span className="ww-card-title">
            <Shield size={13} color="var(--operational-green)" />
            Shift Operational Events & Automation Log
          </span>
          <span className="num-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            Supervisor: {SHIFT_REPORT_DATA.supervisor}
          </span>
        </div>
        <div className="ww-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {SHIFT_REPORT_DATA.operationalIncidents.map((inc, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: 10, backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', borderLeft: '3px solid var(--operational-green)' }}>
              <span className="num-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--energy-amber)', whiteSpace: 'nowrap' }}>
                {inc.time}
              </span>
              <div style={{ fontSize: 12, color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {inc.event}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
