import React, { useState } from 'react';
import {
  Network,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  Receipt,
  FileCheck,
  TrendingUp,
  MapPin,
  ExternalLink,
  PhoneCall,
  MessageSquare,
  ShieldAlert,
  Zap,
  DollarSign,
  ChevronRight,
  Filter,
  Check,
  Sparkles,
  Info,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FleetMillDeployment, FleetIncident, GainShareInvoice, WhatsAppDigestData, MillCluster } from '../types';
import { FLEET_MILLS_20, INITIAL_FLEET_INCIDENTS, MEEZAN_GAIN_SHARE_INVOICES, SAMPLE_WHATSAPP_DIGEST, SEED_INVESTOR_PROGRESS } from '../data/fleetData';
import { industrialAudio } from '../services/soundEffects';
import { SubstationCommissioningWizard } from './SubstationCommissioningWizard';

interface FleetOperationsCenterProps {
  lang: 'en' | 'ur';
}

export const FleetOperationsCenter: React.FC<FleetOperationsCenterProps> = ({ lang }) => {
  const isUrdu = lang === 'ur';

  // State management
  const [activeSubTab, setActiveSubTab] = useState<'MILLS_FLEET' | 'INCIDENT_TRIAGE' | 'MEEZAN_BILLING' | 'WHATSAPP_DIGEST' | 'SERIES_A'>('MILLS_FLEET');
  const [selectedCluster, setSelectedCluster] = useState<string>('ALL');
  const [mills, setMills] = useState<FleetMillDeployment[]>(FLEET_MILLS_20);
  const [incidents, setIncidents] = useState<FleetIncident[]>(INITIAL_FLEET_INCIDENTS);
  const [invoices, setInvoices] = useState<GainShareInvoice[]>(MEEZAN_GAIN_SHARE_INVOICES);
  const [selectedMillForDigest, setSelectedMillForDigest] = useState<FleetMillDeployment>(FLEET_MILLS_20[0]);
  const [digestLang, setDigestLang] = useState<'en' | 'ur'>('en');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [commissioningWizardOpen, setCommissioningWizardOpen] = useState<boolean>(false);

  // Helper to trigger toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered mills
  const filteredMills = selectedCluster === 'ALL'
    ? mills
    : mills.filter(m => m.cluster === selectedCluster);

  // Aggregated totals
  const totalMonthlyBilling = mills.reduce((acc, m) => acc + m.wattwiseBillingPkr, 0);
  const totalVerifiedSavings = mills.reduce((acc, m) => acc + m.monthlySavingsPkr, 0);
  const avgIngestionSla = (mills.reduce((acc, m) => acc + m.packetIngestionRate, 0) / mills.length).toFixed(2);
  const activeSev1 = incidents.filter(i => i.severity === 'SEV_1' && i.status !== 'RESOLVED').length;
  const activeSev2 = incidents.filter(i => i.severity === 'SEV_2' && i.status !== 'RESOLVED').length;

  // Acknowledge incident
  const handleAcknowledgeIncident = (id: string) => {
    industrialAudio.playClick();
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'INVESTIGATING' } : inc));
    triggerToast(`Incident ${id} acknowledged. Technician lead notified.`);
  };

  // Resolve incident
  const handleResolveIncident = (id: string) => {
    industrialAudio.playSuccessChime();
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'RESOLVED', resolvedAt: 'Just now' } : inc));
    triggerToast(`Incident ${id} marked as RESOLVED. Post-mortem logged.`);
  };

  // Simulate SEV-1 Outage
  const handleSimulateSev1 = () => {
    industrialAudio.playAlarmChime();
    const newInc: FleetIncident = {
      id: `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      millId: 'mill_fsd_05',
      millName: 'Nishat Mills Ltd (Dyeing & Finishing FSD)',
      feederCode: 'FSD-SKT-11KV-06',
      severity: 'SEV_1',
      title: 'FESCO 11kV Feeder Frequency Collapse (<48.5Hz)',
      description: 'Grid frequency sag detected. SwiftSwitch pre-emptive switchover armed. Generator synchronizing.',
      slaMinutes: 15,
      elapsedMinutes: 1,
      status: 'ACTIVE',
      assignedTech: 'Engr. Tariq Mehmood (On-Call Field Lead)',
      createdAt: 'Just now',
    };
    setIncidents(prev => [newInc, ...prev]);
    setActiveSubTab('INCIDENT_TRIAGE');
    triggerToast('CRITICAL SEV-1 SIMULATED: SwiftSwitch armed & technician dispatch triggered!');
  };

  // Dispatch WhatsApp blast
  const handleDispatchWhatsAppBlast = () => {
    industrialAudio.playSuccessChime();
    confetti({
      particleCount: 75,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#10b981', '#06b6d4'],
    });
    triggerToast(`Automated WhatsApp Energy Digest successfully delivered to ${selectedMillForDigest.ownerName} (${selectedMillForDigest.ownerPhone})!`);
  };

  // Dispatch Net-15 payment reminder
  const handleSendNet15Reminder = (inv: GainShareInvoice) => {
    industrialAudio.playClick();
    triggerToast(`Net-15 WhatsApp payment reminder & Meezan IBFT challan dispatched to ${inv.millName}!`);
  };

  return (
    <div className="glass-panel" style={{ position: 'relative' }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          border: '1px solid var(--emerald-neon)',
          boxShadow: '0 8px 30px rgba(16, 185, 129, 0.35)',
          color: '#ffffff',
          padding: '14px 20px',
          borderRadius: '10px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.875rem',
          fontWeight: 600,
          animation: 'slideUp 0.3s ease-out',
        }}>
          <Sparkles size={18} style={{ color: 'var(--emerald-neon)' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Network size={24} style={{ color: 'var(--cyan-neon)' }} />
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800 }}>
              {isUrdu ? 'فلیٹ آپریشنز اور فیز 3 کمرشل کنٹرول روم' : 'Fleet Operations & Phase 3 Commercial Control Room'}
            </h2>
            <span style={{
              background: 'rgba(6, 182, 212, 0.15)',
              color: 'var(--cyan-neon)',
              border: '1px solid rgba(6, 182, 212, 0.3)',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
            }}>
              20 MILLS LIVE
            </span>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            {isUrdu
              ? 'پاکستان بھر کے ٹیکسٹائل اور صنعتی کلسٹرز کی لائیو ٹیلی میٹری، ایس ای وی انسیڈنٹ رسپانس، میزان بینک 20 فیصد منافع کا شیئر اور سرمایہ کار میٹرکس'
              : 'Multi-mill industrial telemetry, SEV-1 incident dispatch runbook, Meezan Bank gain-share billing, and USD 250K Seed round tracker'}
          </p>
        </div>

        {/* Global Action Button */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setCommissioningWizardOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))',
              border: '1px solid var(--cyan-neon)',
              color: 'var(--cyan-neon)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <Compass size={16} />
            <span>{isUrdu ? '3 گھنٹے انسٹال وزرڈ' : 'Substation 3-Hr Install Wizard'}</span>
          </button>

          <button
            onClick={handleSimulateSev1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid var(--rose-neon)',
              color: 'var(--rose-neon)',
              padding: '8px 14px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 700,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <ShieldAlert size={16} />
            <span>{isUrdu ? 'ایس ای وی 1 فالٹ ٹرگر کریں' : 'Simulate SEV-1 Grid Outage'}</span>
          </button>
        </div>
      </div>

      {/* Top SCADA Metrics Strip (4 Fleet Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '14px',
        marginBottom: '24px',
      }}>
        {/* Metric 1: Active Deployments */}
        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>{isUrdu ? 'فعال فیکٹریاں' : 'Active Deployments'}</span>
            <Building2 size={16} style={{ color: 'var(--cyan-neon)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--cyan-neon)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            20 <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600 }}>/ 20 Target</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            FSD (8) • MLT (4) • LHR (5) • SLK (2) • KHI (1)
          </div>
        </div>

        {/* Metric 2: Monthly Run-Rate Revenue */}
        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>{isUrdu ? 'ماہانہ ریکرنگ ریونیو' : 'Monthly Run-Rate (MRR)'}</span>
            <DollarSign size={16} style={{ color: 'var(--emerald-neon)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--emerald-neon)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            Rs. {(totalMonthlyBilling / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald-neon)', marginTop: '4px', fontWeight: 600 }}>
            Rs. {(totalMonthlyBilling * 12 / 1000000).toFixed(1)}M Annualized ARR Run-Rate
          </div>
        </div>

        {/* Metric 3: Fleet Ingestion SLA */}
        <div style={{ background: 'var(--bg-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>{isUrdu ? 'ٹیلی میٹری اپ ٹائم' : 'Fleet Ingestion SLA'}</span>
            <Radio size={16} style={{ color: '#a855f7' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#c084fc', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            {avgIngestionSla}%
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            AWS Bahrain (me-south-1) • Zero Packet Drop
          </div>
        </div>

        {/* Metric 4: Active Incidents Status */}
        <div style={{
          background: (activeSev1 > 0 || activeSev2 > 0) ? 'rgba(244, 63, 94, 0.08)' : 'var(--bg-card)',
          padding: '16px',
          borderRadius: '12px',
          border: `1px solid ${(activeSev1 > 0 || activeSev2 > 0) ? 'rgba(244, 63, 94, 0.35)' : 'var(--border-subtle)'}`,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase' }}>
            <span>{isUrdu ? 'انسیڈنٹ مانیٹر' : 'Incident Triage'}</span>
            <AlertTriangle size={16} style={{ color: activeSev1 > 0 ? 'var(--rose-neon)' : 'var(--amber-neon)' }} />
          </div>
          <div style={{ fontSize: '1.6rem', fontWeight: 800, color: activeSev1 > 0 ? 'var(--rose-neon)' : 'var(--amber-neon)', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
            {activeSev1} SEV-1 <span style={{ fontSize: '1rem', color: 'var(--amber-neon)' }}>• {activeSev2} SEV-2</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: activeSev1 > 0 ? 'var(--rose-neon)' : 'var(--text-muted)', marginTop: '4px', fontWeight: 600 }}>
            {activeSev1 > 0 ? 'Field Engineer Dispatched (<15m SLA)' : 'All 20 Substations Synchronized'}
          </div>
        </div>
      </div>

      {/* Internal Sub-Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        borderBottom: '1px solid var(--border-subtle)',
        marginBottom: '20px',
        overflowX: 'auto',
        paddingBottom: '8px',
      }}>
        <button
          onClick={() => setActiveSubTab('MILLS_FLEET')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'MILLS_FLEET' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
            border: `1px solid ${activeSubTab === 'MILLS_FLEET' ? 'var(--cyan-neon)' : 'transparent'}`,
            color: activeSubTab === 'MILLS_FLEET' ? 'var(--cyan-neon)' : 'var(--text-muted)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Building2 size={16} />
          <span>{isUrdu ? 'پاکستان انڈسٹریل فلیٹ (20 ملیں)' : 'Pakistan Industrial Fleet (20 Mills)'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('INCIDENT_TRIAGE')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'INCIDENT_TRIAGE' ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
            border: `1px solid ${activeSubTab === 'INCIDENT_TRIAGE' ? 'var(--rose-neon)' : 'transparent'}`,
            color: activeSubTab === 'INCIDENT_TRIAGE' ? 'var(--rose-neon)' : 'var(--text-muted)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <ShieldAlert size={16} />
          <span>{isUrdu ? 'انسیڈنٹ رن بک اور ٹریج (SEV-1 تا 4)' : 'Incident Runbook & Triage'}</span>
          {activeSev1 > 0 && (
            <span style={{ background: 'var(--rose-neon)', color: '#fff', fontSize: '0.65rem', padding: '1px 6px', borderRadius: '10px' }}>
              {activeSev1}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('MEEZAN_BILLING')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'MEEZAN_BILLING' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            border: `1px solid ${activeSubTab === 'MEEZAN_BILLING' ? 'var(--emerald-neon)' : 'transparent'}`,
            color: activeSubTab === 'MEEZAN_BILLING' ? 'var(--emerald-neon)' : 'var(--text-muted)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Receipt size={16} />
          <span>{isUrdu ? 'میزان بینک 20 فیصد بلنگ لیجر' : 'Meezan Bank Gain-Share Ledger'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('WHATSAPP_DIGEST')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'WHATSAPP_DIGEST' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
            border: `1px solid ${activeSubTab === 'WHATSAPP_DIGEST' ? '#22c55e' : 'transparent'}`,
            color: activeSubTab === 'WHATSAPP_DIGEST' ? '#22c55e' : 'var(--text-muted)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <MessageSquare size={16} />
          <span>{isUrdu ? 'واٹس ایپ ڈائجسٹ ڈسپیچر' : 'WhatsApp Executive Digest'}</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SERIES_A')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: activeSubTab === 'SERIES_A' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
            border: `1px solid ${activeSubTab === 'SERIES_A' ? '#a855f7' : 'transparent'}`,
            color: activeSubTab === 'SERIES_A' ? '#c084fc' : 'var(--text-muted)',
            padding: '8px 16px',
            borderRadius: '8px',
            fontSize: '0.85rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <TrendingUp size={16} />
          <span>{isUrdu ? 'سیڈ راؤنڈ اور سیریز اے ٹریکر' : 'USD 250K Seed Round & Milestones'}</span>
        </button>
      </div>

      {/* SUB-TAB 1: PAKISTAN INDUSTRIAL FLEET GRID */}
      {activeSubTab === 'MILLS_FLEET' && (
        <div>
          {/* Cluster Filter Buttons */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Filter size={14} /> {isUrdu ? 'کلسٹر فلٹر:' : 'Industrial Cluster:'}
            </span>
            {[
              { id: 'ALL', label: 'All Pakistan (20)' },
              { id: 'FAISALABAD', label: 'Faisalabad Beachhead (8)' },
              { id: 'MULTAN', label: 'Multan MEPCO (4)' },
              { id: 'LAHORE_SHEIKHUPURA', label: 'Lahore LESCO (5)' },
              { id: 'SIALKOT_GUJRANWALA', label: 'Sialkot GEPCO (2)' },
              { id: 'KARACHI', label: 'Karachi K-Electric (1)' },
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCluster(c.id)}
                style={{
                  background: selectedCluster === c.id ? 'var(--cyan-neon)' : 'var(--bg-card)',
                  color: selectedCluster === c.id ? '#0a0f1d' : 'var(--text-muted)',
                  border: `1px solid ${selectedCluster === c.id ? 'var(--cyan-neon)' : 'var(--border-subtle)'}`,
                  padding: '4px 12px',
                  borderRadius: '20px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Mills Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '14px',
          }}>
            {filteredMills.map(mill => {
              const isHealthy = mill.status === 'ONLINE_HEALTHY';
              const isCurtailing = mill.status === 'PEAK_CURTAILMENT';
              const isIslanded = mill.status === 'ISLANDED_GEN';
              const isWarning = mill.status === 'TELEMETRY_WARN';

              return (
                <div
                  key={mill.id}
                  style={{
                    background: 'var(--bg-card)',
                    border: `1px solid ${isWarning ? 'rgba(244, 63, 94, 0.4)' : isIslanded ? 'rgba(245, 158, 11, 0.4)' : 'var(--border-subtle)'}`,
                    borderRadius: '12px',
                    padding: '16px',
                    position: 'relative',
                    transition: 'all 0.2s',
                  }}
                >
                  {/* Card Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                    <div>
                      <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-main)' }}>
                        {mill.shortName}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <MapPin size={12} /> {mill.city} • <span style={{ color: 'var(--cyan-neon)', fontWeight: 600 }}>{mill.disco}</span> ({mill.feederCode})
                      </div>
                    </div>

                    {/* Status Badge */}
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      background: isHealthy ? 'rgba(16, 185, 129, 0.15)' : isCurtailing ? 'rgba(6, 182, 212, 0.15)' : isIslanded ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                      color: isHealthy ? 'var(--emerald-neon)' : isCurtailing ? 'var(--cyan-neon)' : isIslanded ? 'var(--amber-neon)' : 'var(--rose-neon)',
                      border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.3)' : isCurtailing ? 'rgba(6, 182, 212, 0.3)' : isIslanded ? 'rgba(245, 158, 11, 0.3)' : 'rgba(244, 63, 94, 0.3)'}`,
                    }}>
                      <span style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: isHealthy ? 'var(--emerald-neon)' : isCurtailing ? 'var(--cyan-neon)' : isIslanded ? 'var(--amber-neon)' : 'var(--rose-neon)',
                        animation: 'pulse 1.5s infinite',
                      }} />
                      {isHealthy ? 'ONLINE' : isCurtailing ? 'CURTAILED' : isIslanded ? 'CAPTIVE GEN' : 'TELEMETRY'}
                    </span>
                  </div>

                  {/* Telemetry Metrics */}
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    padding: '10px',
                    borderRadius: '8px',
                    marginBottom: '10px',
                    fontSize: '0.8rem',
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Real-Time Load:</span>
                      <div style={{ fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                        {mill.currentKw} kW <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ {mill.peakLoadKw}</span>
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.7rem' }}>Power Factor:</span>
                      <div style={{ fontWeight: 800, color: mill.powerFactor >= 0.92 ? 'var(--emerald-neon)' : 'var(--amber-neon)', fontFamily: 'var(--font-mono)' }}>
                        {mill.powerFactor} PF
                      </div>
                    </div>
                  </div>

                  {/* Financial Savings & Billing */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: '10px' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Monthly Savings:</span>
                      <div style={{ fontWeight: 700, color: 'var(--emerald-neon)' }}>
                        Rs. {(mill.monthlySavingsPkr / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--text-muted)' }}>WattWise 20%:</span>
                      <div style={{ fontWeight: 700, color: 'var(--cyan-neon)' }}>
                        Rs. {(mill.wattwiseBillingPkr / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>

                  {/* Card Footer */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '8px',
                    fontSize: '0.7rem',
                    color: 'var(--text-muted)',
                  }}>
                    <span>Hub: <strong style={{ color: '#fff' }}>{mill.gatewayId}</strong> ({mill.packetIngestionRate}%)</span>
                    <button
                      onClick={() => {
                        setSelectedMillForDigest(mill);
                        setActiveSubTab('WHATSAPP_DIGEST');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--cyan-neon)',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      WhatsApp Digest <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INCIDENT RUNBOOK & TRIAGE (SEV-1 TO SEV-4) */}
      {activeSubTab === 'INCIDENT_TRIAGE' && (
        <div>
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            padding: '14px 18px',
            borderRadius: '10px',
            border: '1px solid var(--border-subtle)',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                {isUrdu ? 'ایس ایل اے اور تکنیکی ایمرجنسی ایسکلیشن پروٹوکول' : 'Fleet Incident SLA & Runbook Protocol (apps/api/internal/fleet)'}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                SEV-1 (&lt;15m) • SEV-2 (&lt;1h) • SEV-3 (&lt;2h) • SEV-4 (&lt;24h) • On-Call Lead: Engr. Tariq Mehmood (PEC #ELECT-48291)
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <span style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--rose-neon)', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: 700 }}>
                {incidents.filter(i => i.status !== 'RESOLVED').length} UNRESOLVED
              </span>
            </div>
          </div>

          {/* Incidents Table / Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {incidents.map(inc => {
              const isSev1 = inc.severity === 'SEV_1';
              const isSev2 = inc.severity === 'SEV_2';
              const isSev3 = inc.severity === 'SEV_3';
              const isResolved = inc.status === 'RESOLVED';

              return (
                <div
                  key={inc.id}
                  style={{
                    background: isResolved ? 'rgba(15, 23, 42, 0.4)' : isSev1 ? 'rgba(244, 63, 94, 0.08)' : 'var(--bg-card)',
                    border: `1px solid ${isResolved ? 'var(--border-subtle)' : isSev1 ? 'var(--rose-neon)' : isSev2 ? 'var(--amber-neon)' : 'var(--border-subtle)'}`,
                    borderRadius: '10px',
                    padding: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    flexWrap: 'wrap',
                    gap: '16px',
                  }}
                >
                  <div style={{ flex: '1 1 500px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span style={{
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: isSev1 ? 'var(--rose-neon)' : isSev2 ? 'var(--amber-neon)' : isSev3 ? '#3b82f6' : '#64748b',
                        color: '#0a0f1d',
                      }}>
                        {inc.severity.replace('_', '-')}
                      </span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {inc.id}
                      </span>
                      <span style={{ color: 'var(--cyan-neon)', fontWeight: 700, fontSize: '0.8rem' }}>
                        {inc.millName}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        ({inc.feederCode})
                      </span>
                    </div>

                    <div style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
                      {inc.title}
                    </div>

                    <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                      {inc.description}
                    </p>

                    <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span>Assigned: <strong style={{ color: '#fff' }}>{inc.assignedTech}</strong></span>
                      <span>Created: {inc.createdAt}</span>
                      <span>SLA: <strong style={{ color: isSev1 ? 'var(--rose-neon)' : '#fff' }}>&lt;{inc.slaMinutes}m</strong></span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {inc.status === 'ACTIVE' && (
                      <button
                        onClick={() => handleAcknowledgeIncident(inc.id)}
                        style={{
                          background: 'rgba(245, 158, 11, 0.15)',
                          border: '1px solid var(--amber-neon)',
                          color: 'var(--amber-neon)',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Acknowledge
                      </button>
                    )}

                    {inc.status !== 'RESOLVED' ? (
                      <button
                        onClick={() => handleResolveIncident(inc.id)}
                        style={{
                          background: 'rgba(16, 185, 129, 0.15)',
                          border: '1px solid var(--emerald-neon)',
                          color: 'var(--emerald-neon)',
                          padding: '6px 14px',
                          borderRadius: '6px',
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Mark Resolved
                      </button>
                    ) : (
                      <span style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        color: 'var(--emerald-neon)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}>
                        <CheckCircle2 size={16} /> RESOLVED
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: MEEZAN BANK GAIN-SHARE BILLING LEDGER */}
      {activeSubTab === 'MEEZAN_BILLING' && (
        <div>
          {/* Bank Account Info Box */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.05))',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--emerald-neon)', fontWeight: 800, textTransform: 'uppercase' }}>
                Corporate Collection Escrow Account
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
                Meezan Bank Limited — Islamic Green Energy Div
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                Account Title: WattWise Technologies (Pvt) Ltd • IBAN: PK42 MEZN 0002 0109 4838 2901
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>March 2026 Collection Rate:</div>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald-neon)', fontFamily: 'var(--font-mono)' }}>
                92.4% Net-15 Settled
              </div>
            </div>
          </div>

          {/* Invoices List */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.825rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-subtle)', textAlign: 'left', color: 'var(--text-muted)' }}>
                  <th style={{ padding: '10px' }}>Invoice ID</th>
                  <th style={{ padding: '10px' }}>Mill Name</th>
                  <th style={{ padding: '10px' }}>Verified Savings</th>
                  <th style={{ padding: '10px' }}>20% Gain-Share</th>
                  <th style={{ padding: '10px' }}>PRA Tax (16%)</th>
                  <th style={{ padding: '10px' }}>Total Billed</th>
                  <th style={{ padding: '10px' }}>Status</th>
                  <th style={{ padding: '10px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const isPaid = inv.status === 'PAID';
                  const isPending = inv.status === 'DUE_NET_15';

                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid rgba(255, 255, 255, 0.05)' }}>
                      <td style={{ padding: '12px 10px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--cyan-neon)' }}>
                        {inv.id}
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: 700 }}>
                        {inv.millName}
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--emerald-neon)', fontFamily: 'var(--font-mono)' }}>
                        Rs. {inv.verifiedSavingsPkr.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>
                        Rs. {inv.gainShareFeePkr.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Rs. {inv.praTaxPkr.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 10px', fontWeight: 800, color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
                        Rs. {inv.totalPayablePkr.toLocaleString()}
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        <span style={{
                          padding: '3px 8px',
                          borderRadius: '4px',
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          background: isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: isPaid ? 'var(--emerald-neon)' : 'var(--amber-neon)',
                          border: `1px solid ${isPaid ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        }}>
                          {isPaid ? 'PAID (MEEZAN IBFT)' : 'NET-15 PENDING'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 10px' }}>
                        {isPending ? (
                          <button
                            onClick={() => handleSendNet15Reminder(inv)}
                            style={{
                              background: 'transparent',
                              border: '1px solid var(--amber-neon)',
                              color: 'var(--amber-neon)',
                              padding: '4px 8px',
                              borderRadius: '4px',
                              fontSize: '0.7rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Send size={10} /> Send Reminder
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                            {inv.cprChallanNumber}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: BILINGUAL WHATSAPP EXECUTIVE DIGEST SIMULATOR */}
      {activeSubTab === 'WHATSAPP_DIGEST' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '24px' }}>
          {/* Left: Controls & Context */}
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px' }}>
              {isUrdu ? 'روزانہ واٹس ایپ ایگزیکٹو انرجی ڈائجسٹ' : 'Daily Automated WhatsApp Energy Digest'}
            </h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
              {isUrdu
                ? 'مل مالکان ڈیسک ٹاپ ڈیش بورڈ کم ہی کھولتے ہیں۔ یہ خودکار سروس روزانہ صبح 08:30 بجے تفصیلی بچت اور لوڈ شیڈنگ رپورٹ بھیجتی ہے۔'
                : 'Mill owners check WhatsApp every morning. This service auto-dispatches an unchallengeable daily energy summary at 08:30 PKT directly to the C-suite.'}
            </p>

            {/* Mill Selector */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Select Mill Recipient:
              </label>
              <select
                value={selectedMillForDigest.id}
                onChange={(e) => {
                  const found = mills.find(m => m.id === e.target.value);
                  if (found) setSelectedMillForDigest(found);
                }}
                style={{
                  width: '100%',
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  color: '#fff',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '0.85rem',
                }}
              >
                {mills.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.city})
                  </option>
                ))}
              </select>
            </div>

            {/* Language Toggle for Digest */}
            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Digest Language:
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => setDigestLang('en')}
                  style={{
                    flex: 1,
                    background: digestLang === 'en' ? 'var(--cyan-neon)' : 'var(--bg-secondary)',
                    color: digestLang === 'en' ? '#0a0f1d' : 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                  }}
                >
                  English Digest
                </button>
                <button
                  onClick={() => setDigestLang('ur')}
                  style={{
                    flex: 1,
                    background: digestLang === 'ur' ? 'var(--emerald-neon)' : 'var(--bg-secondary)',
                    color: digestLang === 'ur' ? '#0a0f1d' : 'var(--text-muted)',
                    border: '1px solid var(--border-subtle)',
                    padding: '8px',
                    borderRadius: '6px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontFamily: 'var(--font-urdu)',
                  }}
                >
                  اردو ڈائجسٹ (نستعلیق)
                </button>
              </div>
            </div>

            {/* Blast Dispatch Button */}
            <button
              onClick={handleDispatchWhatsAppBlast}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#ffffff',
                border: 'none',
                padding: '12px 20px',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                boxShadow: '0 4px 20px rgba(34, 197, 94, 0.35)',
              }}
            >
              <MessageSquare size={18} />
              <span>Dispatch WhatsApp Blast to Mill Owner</span>
            </button>
          </div>

          {/* Right: Realistic WhatsApp Mobile Simulator Card */}
          <div style={{
            background: '#0b141a',
            border: '2px solid #202c33',
            borderRadius: '24px',
            padding: '20px',
            maxWidth: '420px',
            margin: '0 auto',
            boxShadow: '0 12px 40px rgba(0,0,0,0.6)',
          }}>
            {/* WhatsApp Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              borderBottom: '1px solid #202c33',
              paddingBottom: '12px',
              marginBottom: '16px',
            }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#00a884',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: '0.85rem',
              }}>
                WW
              </div>
              <div>
                <div style={{ color: '#e9edef', fontWeight: 700, fontSize: '0.9rem' }}>
                  WattWise™ Energy AI
                </div>
                <div style={{ color: '#8696a0', fontSize: '0.7rem' }}>
                  Official Verified Industrial Bot • 08:30 AM
                </div>
              </div>
            </div>

            {/* WhatsApp Bubble */}
            <div style={{
              background: '#005c4b',
              color: '#e9edef',
              padding: '14px',
              borderRadius: '12px',
              fontSize: '0.825rem',
              lineHeight: digestLang === 'ur' ? 1.9 : 1.5,
              direction: digestLang === 'ur' ? 'rtl' : 'ltr',
              fontFamily: digestLang === 'ur' ? 'var(--font-urdu)' : 'inherit',
            }}>
              {digestLang === 'en' ? (
                <>
                  <div style={{ fontWeight: 800, marginBottom: '6px', color: '#25d366' }}>
                    ⚡ WATTWISE™ DAILY EXECUTIVE SUMMARY
                  </div>
                  <div>Dear <strong>{selectedMillForDigest.ownerName}</strong>,</div>
                  <div style={{ color: '#8696a0', fontSize: '0.75rem', marginBottom: '8px' }}>
                    {selectedMillForDigest.name} — Sunday, 5 Oct 2026
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', marginBottom: '8px' }}>
                    <div>📉 <strong>Power Bill Yesterday:</strong> Rs. {(selectedMillForDigest.monthlySavingsPkr / 30 * 2.8).toFixed(0)}</div>
                    <div>🎯 <strong>Baseline Target:</strong> Rs. {(selectedMillForDigest.monthlySavingsPkr / 30 * 3.8).toFixed(0)}</div>
                    <div style={{ color: '#25d366', fontWeight: 700 }}>
                      💰 <strong>Net Cash Saved Yesterday:</strong> Rs. {(selectedMillForDigest.monthlySavingsPkr / 30).toFixed(0)}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', marginBottom: '6px' }}>
                    🛡️ <strong>SwiftSwitch Action:</strong> 3.5 hrs peak hours avoided on FESCO grid (saved Rs. 52,400 penalty).
                  </div>
                  <div style={{ fontSize: '0.75rem', marginBottom: '6px' }}>
                    ⛽ <strong>Diesel Saved:</strong> 142 Liters via load curtailment.
                  </div>
                  <div style={{ fontSize: '0.75rem' }}>
                    ⚡ <strong>Power Factor:</strong> {selectedMillForDigest.powerFactor} (Zero low-PF penalty applied).
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#8696a0', textAlign: 'right' }}>
                    08:30 AM • Delivered ✓✓
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 800, marginBottom: '6px', color: '#25d366', fontSize: '0.95rem' }}>
                    ⚡ واٹ وائز روزانہ انرجی سمری رپورٹ
                  </div>
                  <div>محترم جناب <strong>{selectedMillForDigest.ownerName}</strong> صاحب،</div>
                  <div style={{ color: '#8696a0', fontSize: '0.75rem', marginBottom: '8px' }}>
                    {selectedMillForDigest.name} — اتوار، 5 اکتوبر 2026
                  </div>

                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '6px', marginBottom: '8px' }}>
                    <div>📉 <strong>کل کا کل بجلی خرچ:</strong> {Math.round(selectedMillForDigest.monthlySavingsPkr / 30 * 2.8).toLocaleString()} روپے</div>
                    <div>🎯 <strong>پیشن گوئی ہدف (بیس لائن):</strong> {Math.round(selectedMillForDigest.monthlySavingsPkr / 30 * 3.8).toLocaleString()} روپے</div>
                    <div style={{ color: '#25d366', fontWeight: 800 }}>
                      💰 <strong>کل کی خالص بچت:</strong> {Math.round(selectedMillForDigest.monthlySavingsPkr / 30).toLocaleString()} روپے
                    </div>
                  </div>

                  <div style={{ fontSize: '0.75rem', marginBottom: '6px' }}>
                    🛡️ <strong>سوئفٹ سوئچ خودکار کارروائی:</strong> پیک آورز میں 3.5 گھنٹے کا لوڈ شفٹ کر کے جرمانے سے بچایا گیا۔
                  </div>
                  <div style={{ fontSize: '0.75rem', marginBottom: '6px' }}>
                    ⛽ <strong>ڈیزل کی بچت:</strong> 142 لیٹر ڈیزل فالتو چلنے سے بچا لیا گیا۔
                  </div>
                  <div style={{ fontSize: '0.75rem' }}>
                    ⚡ <strong>پاور فیکٹر:</strong> {selectedMillForDigest.powerFactor} (فیسکو سرچارج سے 100 فیصد محفوظ)۔
                  </div>

                  <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#8696a0', textAlign: 'left', direction: 'ltr' }}>
                    08:30 AM • Delivered ✓✓
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: USD 250K SEED ROUND & SERIES A PROGRESS */}
      {activeSubTab === 'SERIES_A' && (
        <div>
          {/* Seed Terms Header */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(6, 182, 212, 0.08))',
            border: '1px solid rgba(168, 85, 247, 0.35)',
            borderRadius: '12px',
            padding: '20px',
            marginBottom: '20px',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <span style={{ background: '#a855f7', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 800 }}>
                  SEED ROUND FINANCING
                </span>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '6px' }}>
                  Target: USD 250,000 (PKR 70,000,000) on Post-Money SAFE
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '2px' }}>
                  Valuation Cap: USD 2,500,000 (~10% Equity) • 20% Series A Discount • Y-Combinator Standard SAFE
                </p>
              </div>

              <div style={{ textAlign: 'right' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Runway to Series A:</span>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#c084fc', fontFamily: 'var(--font-mono)' }}>
                  18 Months
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald-neon)', fontWeight: 700 }}>
                  Breakeven at 120 Mills
                </span>
              </div>
            </div>
          </div>

          {/* VC Target Pipeline */}
          <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '12px' }}>
            Pakistani & Regional Institutional VC Due Diligence Pipeline
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px', marginBottom: '24px' }}>
            {SEED_INVESTOR_PROGRESS.vcPipeline.map((vc, idx) => (
              <div
                key={idx}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{vc.name}</div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    background: vc.status === 'COMMITTED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                    color: vc.status === 'COMMITTED' ? 'var(--emerald-neon)' : 'var(--cyan-neon)',
                  }}>
                    {vc.status}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Lead Partner: {vc.partner}</div>
                <div style={{ fontSize: '0.75rem', color: '#c084fc', marginTop: '6px', fontWeight: 600 }}>
                  Stage: {vc.stage}
                </div>
              </div>
            ))}
          </div>

          {/* 90-Day Execution Calendar Overview */}
          <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '12px' }}>
            90-Day Master Milestone Calendar Status (Weeks 1–12)
          </h4>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
            <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(16, 185, 129, 0.4)' }}>
              <div style={{ color: 'var(--emerald-neon)', fontSize: '0.75rem', fontWeight: 800 }}>WEEKS 1–4 (SUB-PHASE 3A)</div>
              <div style={{ fontWeight: 700, marginTop: '4px' }}>Pilot Activation & Shadow Validation</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Mill #1 (Crescent) 3-hr clamp-on, 30-day baseline freeze, executive boardroom presentation completed.
              </div>
              <div style={{ color: 'var(--emerald-neon)', fontSize: '0.75rem', fontWeight: 800, marginTop: '8px' }}>
                ✓ 100% COMPLETED
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(6, 182, 212, 0.4)' }}>
              <div style={{ color: 'var(--cyan-neon)', fontSize: '0.75rem', fontWeight: 800 }}>WEEKS 5–8 (SUB-PHASE 3B)</div>
              <div style={{ fontWeight: 700, marginTop: '4px' }}>First Revenue & Early Cohort</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                First Meezan Bank invoice collected (Rs. 426k), Mills #2–#6 onboarded under APTMA 15% rate, Field CSR hired.
              </div>
              <div style={{ color: 'var(--cyan-neon)', fontSize: '0.75rem', fontWeight: 800, marginTop: '8px' }}>
                ✓ 100% COMPLETED
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(168, 85, 247, 0.4)' }}>
              <div style={{ color: '#c084fc', fontSize: '0.75rem', fontWeight: 800 }}>WEEKS 9–12 (SUB-PHASE 3C)</div>
              <div style={{ fontWeight: 700, marginTop: '4px' }}>Scale to 20 & Seed Round Close</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Commercial Co-Founder CEO active, 20 mills live, Rs. 5.64M monthly billing, SAFE round execution.
              </div>
              <div style={{ color: '#c084fc', fontSize: '0.75rem', fontWeight: 800, marginTop: '8px' }}>
                🚀 20 MILLS LIVE & SAFE TERM SHEET
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Substation 3-Hour Rapid Install & Commissioning Wizard Modal */}
      <SubstationCommissioningWizard
        isOpen={commissioningWizardOpen}
        onClose={() => setCommissioningWizardOpen(false)}
        lang={lang}
      />
    </div>
  );
};
