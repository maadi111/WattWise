import React, { useState } from 'react';
import {
  Network,
  Radio,
  AlertTriangle,
  CheckCircle2,
  Send,
  Building2,
  Receipt,
  TrendingUp,
  MapPin,
  MessageSquare,
  ShieldAlert,
  DollarSign,
  ChevronRight,
  Filter,
  Sparkles,
  Compass,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { FleetMillDeployment, FleetIncident, GainShareInvoice } from '../types';
import { FLEET_MILLS_20, INITIAL_FLEET_INCIDENTS, MEEZAN_GAIN_SHARE_INVOICES, SEED_INVESTOR_PROGRESS } from '../data/fleetData';
import { SubstationCommissioningWizard } from '../components/SubstationCommissioningWizard';

interface FleetOperationsViewProps {
  lang?: 'en' | 'ur';
}

export const FleetOperationsView: React.FC<FleetOperationsViewProps> = ({ lang = 'en' }) => {
  const isUrdu = lang === 'ur';

  // Sub-tab navigation
  const [activeSubTab, setActiveSubTab] = useState<'MILLS_FLEET' | 'INCIDENT_TRIAGE' | 'MEEZAN_BILLING' | 'WHATSAPP_DIGEST' | 'SERIES_A'>('MILLS_FLEET');
  const [selectedCluster, setSelectedCluster] = useState<string>('ALL');
  const [mills] = useState<FleetMillDeployment[]>(FLEET_MILLS_20);
  const [incidents, setIncidents] = useState<FleetIncident[]>(INITIAL_FLEET_INCIDENTS);
  const [invoices] = useState<GainShareInvoice[]>(MEEZAN_GAIN_SHARE_INVOICES);
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
  const avgIngestionSla = (mills.reduce((acc, m) => acc + m.packetIngestionRate, 0) / mills.length).toFixed(2);
  const activeSev1 = incidents.filter(i => i.severity === 'SEV_1' && i.status !== 'RESOLVED').length;
  const activeSev2 = incidents.filter(i => i.severity === 'SEV_2' && i.status !== 'RESOLVED').length;

  // Acknowledge incident
  const handleAcknowledgeIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'INVESTIGATING' } : inc));
    triggerToast(`Incident ${id} acknowledged. Technician lead notified.`);
  };

  // Resolve incident
  const handleResolveIncident = (id: string) => {
    setIncidents(prev => prev.map(inc => inc.id === id ? { ...inc, status: 'RESOLVED', resolvedAt: 'Just now' } : inc));
    triggerToast(`Incident ${id} marked as RESOLVED. Post-mortem logged.`);
  };

  // Simulate SEV-1 Outage
  const handleSimulateSev1 = () => {
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
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#10b981', '#06b6d4'],
      });
    } catch {
      // safe fallback
    }
    triggerToast(`Automated WhatsApp Energy Digest successfully delivered to ${selectedMillForDigest.ownerName} (${selectedMillForDigest.ownerPhone})!`);
  };

  // Dispatch Net-15 payment reminder
  const handleSendNet15Reminder = (inv: GainShareInvoice) => {
    triggerToast(`Net-15 WhatsApp payment reminder & Meezan IBFT challan dispatched to ${inv.millName}!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toast Alert */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          border: '1px solid #10b981',
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
          <Sparkles size={18} style={{ color: '#10b981' }} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              {isUrdu ? 'فلیٹ آپریشنز اور فیز 3 کمرشل کنٹرول روم' : 'FLEET OPERATIONS & PHASE 3 COMMERCIAL CONTROL ROOM'}
            </h1>
            <span className="ww-badge ww-badge-live">
              <Network size={11} /> 20 MILLS ACTIVE
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {isUrdu
              ? 'پاکستان بھر کے ٹیکسٹائل اور صنعتی کلسٹرز کی لائیو ٹیلی میٹری، ایس ای وی انسیڈنٹ رسپانس، میزان بینک 20 فیصد منافع کا شیئر اور سرمایہ کار میٹرکس'
              : 'Multi-mill industrial telemetry, SEV-1 incident dispatch runbook, Meezan Bank gain-share billing, and USD 250K Seed round tracker'}
          </div>
        </div>

        {/* Global Action Button */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button
            onClick={() => setCommissioningWizardOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.2), rgba(16, 185, 129, 0.2))',
              border: '1px solid #06b6d4',
              color: '#06b6d4',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)',
            }}
          >
            <Compass size={14} />
            <span>Substation 3-Hr Install Wizard</span>
          </button>

          <button
            onClick={handleSimulateSev1}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(244, 63, 94, 0.15)',
              border: '1px solid #f43f5e',
              color: '#f43f5e',
              padding: '6px 12px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ShieldAlert size={14} />
            <span>Simulate SEV-1 Grid Trip</span>
          </button>
        </div>
      </div>

      {/* Top SCADA Metrics Strip (4 Fleet Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
        gap: 12,
      }}>
        <div className="ww-card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700 }}>
            <span>ACTIVE DEPLOYMENTS</span>
            <Building2 size={14} color="#06b6d4" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#06b6d4', marginTop: 6, fontFamily: 'var(--font-mono, monospace)' }}>
            20 <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>/ 20 Target</span>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            FSD (8) · MLT (4) · LHR (5) · SLK (2) · KHI (1)
          </div>
        </div>

        <div className="ww-card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700 }}>
            <span>MONTHLY RUN-RATE (MRR)</span>
            <DollarSign size={14} color="#10b981" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#10b981', marginTop: 6, fontFamily: 'var(--font-mono, monospace)' }}>
            Rs. {(totalMonthlyBilling / 1000000).toFixed(2)}M
          </div>
          <div style={{ fontSize: 11, color: '#10b981', marginTop: 2, fontWeight: 600 }}>
            Rs. {(totalMonthlyBilling * 12 / 1000000).toFixed(1)}M Annualized ARR Run-Rate
          </div>
        </div>

        <div className="ww-card" style={{ padding: 14 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700 }}>
            <span>FLEET INGESTION SLA</span>
            <Radio size={14} color="#a855f7" />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: '#c084fc', marginTop: 6, fontFamily: 'var(--font-mono, monospace)' }}>
            {avgIngestionSla}%
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            AWS Bahrain (me-south-1) · Zero Packet Drop
          </div>
        </div>

        <div className="ww-card" style={{
          padding: 14,
          background: (activeSev1 > 0 || activeSev2 > 0) ? 'rgba(244, 63, 94, 0.08)' : undefined,
          borderColor: (activeSev1 > 0 || activeSev2 > 0) ? 'rgba(244, 63, 94, 0.4)' : undefined,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: 11, fontWeight: 700 }}>
            <span>INCIDENT TRIAGE</span>
            <AlertTriangle size={14} color={activeSev1 > 0 ? '#f43f5e' : '#f59e0b'} />
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: activeSev1 > 0 ? '#f43f5e' : '#f59e0b', marginTop: 6, fontFamily: 'var(--font-mono, monospace)' }}>
            {activeSev1} SEV-1 <span style={{ fontSize: 14, color: '#f59e0b' }}>· {activeSev2} SEV-2</span>
          </div>
          <div style={{ fontSize: 11, color: activeSev1 > 0 ? '#f43f5e' : 'var(--text-tertiary)', marginTop: 2, fontWeight: 600 }}>
            {activeSev1 > 0 ? 'Field Engineer Dispatched (<15m SLA)' : 'All 20 Substations Synchronized'}
          </div>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: 6,
        borderBottom: '1px solid var(--border-default)',
        paddingBottom: 6,
        overflowX: 'auto',
      }}>
        <button
          onClick={() => setActiveSubTab('MILLS_FLEET')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeSubTab === 'MILLS_FLEET' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
            border: `1px solid ${activeSubTab === 'MILLS_FLEET' ? '#06b6d4' : 'transparent'}`,
            color: activeSubTab === 'MILLS_FLEET' ? '#06b6d4' : 'var(--text-secondary)',
            padding: '6px 14px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Building2 size={13} />
          <span>Pakistan Fleet (20 Mills)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('INCIDENT_TRIAGE')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeSubTab === 'INCIDENT_TRIAGE' ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
            border: `1px solid ${activeSubTab === 'INCIDENT_TRIAGE' ? '#f43f5e' : 'transparent'}`,
            color: activeSubTab === 'INCIDENT_TRIAGE' ? '#f43f5e' : 'var(--text-secondary)',
            padding: '6px 14px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <ShieldAlert size={13} />
          <span>Incident Triage & Runbook</span>
          {activeSev1 > 0 && (
            <span style={{ background: '#f43f5e', color: '#fff', fontSize: 10, padding: '1px 5px', borderRadius: 8 }}>
              {activeSev1}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('MEEZAN_BILLING')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeSubTab === 'MEEZAN_BILLING' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            border: `1px solid ${activeSubTab === 'MEEZAN_BILLING' ? '#10b981' : 'transparent'}`,
            color: activeSubTab === 'MEEZAN_BILLING' ? '#10b981' : 'var(--text-secondary)',
            padding: '6px 14px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <Receipt size={13} />
          <span>Meezan Gain-Share Ledger</span>
        </button>

        <button
          onClick={() => setActiveSubTab('WHATSAPP_DIGEST')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeSubTab === 'WHATSAPP_DIGEST' ? 'rgba(34, 197, 94, 0.15)' : 'transparent',
            border: `1px solid ${activeSubTab === 'WHATSAPP_DIGEST' ? '#22c55e' : 'transparent'}`,
            color: activeSubTab === 'WHATSAPP_DIGEST' ? '#22c55e' : 'var(--text-secondary)',
            padding: '6px 14px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <MessageSquare size={13} />
          <span>WhatsApp Executive Digest</span>
        </button>

        <button
          onClick={() => setActiveSubTab('SERIES_A')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeSubTab === 'SERIES_A' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
            border: `1px solid ${activeSubTab === 'SERIES_A' ? '#a855f7' : 'transparent'}`,
            color: activeSubTab === 'SERIES_A' ? '#c084fc' : 'var(--text-secondary)',
            padding: '6px 14px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <TrendingUp size={13} />
          <span>USD 250K Seed Round & Milestones</span>
        </button>
      </div>

      {/* SUB-TAB 1: MILLS FLEET */}
      {activeSubTab === 'MILLS_FLEET' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Cluster Filter */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <Filter size={12} /> Cluster:
            </span>
            {[
              { id: 'ALL', label: 'All Pakistan (20)' },
              { id: 'FAISALABAD', label: 'Faisalabad FESCO (8)' },
              { id: 'MULTAN', label: 'Multan MEPCO (4)' },
              { id: 'LAHORE_SHEIKHUPURA', label: 'Lahore LESCO (5)' },
              { id: 'SIALKOT_GUJRANWALA', label: 'Sialkot GEPCO (2)' },
              { id: 'KARACHI', label: 'Karachi K-Electric (1)' },
            ].map(c => (
              <button
                key={c.id}
                onClick={() => setSelectedCluster(c.id)}
                style={{
                  background: selectedCluster === c.id ? '#06b6d4' : 'var(--bg-card)',
                  color: selectedCluster === c.id ? '#0a0f1d' : 'var(--text-secondary)',
                  border: `1px solid ${selectedCluster === c.id ? '#06b6d4' : 'var(--border-default)'}`,
                  padding: '3px 10px',
                  borderRadius: 14,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Grid of Mills */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))',
            gap: 12,
          }}>
            {filteredMills.map(mill => {
              const isHealthy = mill.status === 'ONLINE_HEALTHY';
              const isCurtailing = mill.status === 'PEAK_CURTAILMENT';
              const isIslanded = mill.status === 'ISLANDED_GEN';
              const isWarning = mill.status === 'TELEMETRY_WARN';

              return (
                <div
                  key={mill.id}
                  className="ww-card"
                  style={{
                    padding: 14,
                    borderColor: isWarning ? 'rgba(244, 63, 94, 0.4)' : isIslanded ? 'rgba(245, 158, 11, 0.4)' : undefined,
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                        {mill.shortName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                        <MapPin size={11} /> {mill.city} · <span style={{ color: '#06b6d4', fontWeight: 600 }}>{mill.disco}</span> ({mill.feederCode})
                      </div>
                    </div>

                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '2px 6px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 700,
                      background: isHealthy ? 'rgba(16, 185, 129, 0.15)' : isCurtailing ? 'rgba(6, 182, 212, 0.15)' : isIslanded ? 'rgba(245, 158, 11, 0.15)' : 'rgba(244, 63, 94, 0.15)',
                      color: isHealthy ? '#10b981' : isCurtailing ? '#06b6d4' : isIslanded ? '#f59e0b' : '#f43f5e',
                    }}>
                      {isHealthy ? 'ONLINE' : isCurtailing ? 'CURTAILED' : isIslanded ? 'GEN' : 'WARN'}
                    </span>
                  </div>

                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: 6,
                    background: 'var(--bg-canvas)',
                    padding: 8,
                    borderRadius: 6,
                    marginBottom: 8,
                    fontSize: 11,
                  }}>
                    <div>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>Load:</span>
                      <div style={{ fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono, monospace)' }}>
                        {mill.currentKw} kW
                      </div>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-tertiary)', fontSize: 10 }}>Power Factor:</span>
                      <div style={{ fontWeight: 800, color: mill.powerFactor >= 0.92 ? '#10b981' : '#f59e0b', fontFamily: 'var(--font-mono, monospace)' }}>
                        {mill.powerFactor} PF
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, marginBottom: 8 }}>
                    <div>
                      <span style={{ color: 'var(--text-tertiary)' }}>Monthly Savings:</span>
                      <div style={{ fontWeight: 700, color: '#10b981' }}>
                        Rs. {(mill.monthlySavingsPkr / 1000).toFixed(0)}k
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ color: 'var(--text-tertiary)' }}>WattWise 20%:</span>
                      <div style={{ fontWeight: 700, color: '#06b6d4' }}>
                        Rs. {(mill.wattwiseBillingPkr / 1000).toFixed(0)}k
                      </div>
                    </div>
                  </div>

                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--border-default)',
                    paddingTop: 6,
                    fontSize: 10,
                    color: 'var(--text-tertiary)',
                  }}>
                    <span>Hub: <strong style={{ color: 'var(--text-primary)' }}>{mill.gatewayId}</strong> ({mill.packetIngestionRate}%)</span>
                    <button
                      onClick={() => {
                        setSelectedMillForDigest(mill);
                        setActiveSubTab('WHATSAPP_DIGEST');
                      }}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#06b6d4',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                      }}
                    >
                      WhatsApp Digest <ChevronRight size={10} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SUB-TAB 2: INCIDENTS */}
      {activeSubTab === 'INCIDENT_TRIAGE' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {incidents.map(inc => {
            const isSev1 = inc.severity === 'SEV_1';
            const isSev2 = inc.severity === 'SEV_2';
            const isResolved = inc.status === 'RESOLVED';

            return (
              <div
                key={inc.id}
                className="ww-card"
                style={{
                  padding: 14,
                  borderColor: isResolved ? undefined : isSev1 ? '#f43f5e' : isSev2 ? '#f59e0b' : undefined,
                  background: isResolved ? 'rgba(15, 23, 42, 0.4)' : isSev1 ? 'rgba(244, 63, 94, 0.08)' : undefined,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ flex: '1 1 450px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      padding: '1px 6px',
                      borderRadius: 3,
                      fontSize: 10,
                      fontWeight: 800,
                      background: isSev1 ? '#f43f5e' : isSev2 ? '#f59e0b' : '#3b82f6',
                      color: '#0a0f1d',
                    }}>
                      {inc.severity.replace('_', '-')}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 11, color: 'var(--text-secondary)' }}>
                      {inc.id}
                    </span>
                    <span style={{ color: '#06b6d4', fontWeight: 700, fontSize: 12 }}>
                      {inc.millName}
                    </span>
                  </div>

                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                    {inc.title}
                  </div>

                  <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>
                    {inc.description}
                  </p>

                  <div style={{ display: 'flex', gap: 12, fontSize: 10, color: 'var(--text-tertiary)' }}>
                    <span>Tech: <strong style={{ color: 'var(--text-primary)' }}>{inc.assignedTech}</strong></span>
                    <span>Elapsed: {inc.elapsedMinutes}m / SLA: &lt;{inc.slaMinutes}m</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  {inc.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleAcknowledgeIncident(inc.id)}
                      style={{
                        background: 'rgba(245, 158, 11, 0.15)',
                        border: '1px solid #f59e0b',
                        color: '#f59e0b',
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: 11,
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
                        border: '1px solid #10b981',
                        color: '#10b981',
                        padding: '4px 10px',
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Mark Resolved
                    </button>
                  ) : (
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#10b981', fontSize: 11, fontWeight: 700 }}>
                      <CheckCircle2 size={13} /> RESOLVED
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* SUB-TAB 3: MEEZAN BILLING */}
      {activeSubTab === 'MEEZAN_BILLING' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="ww-card" style={{ padding: 14, background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(6, 182, 212, 0.05))', borderColor: 'rgba(16, 185, 129, 0.3)' }}>
            <div style={{ fontSize: 11, color: '#10b981', fontWeight: 800 }}>
              CORPORATE ESCROW ACCOUNT
            </div>
            <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginTop: 2 }}>
              Meezan Bank Limited — Islamic Green Energy Division
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontFamily: 'var(--font-mono, monospace)' }}>
              IBAN: PK42 MEZN 0002 0109 4838 2901 · Account: WattWise Technologies (Pvt) Ltd
            </div>
          </div>

          <div className="ww-card" style={{ padding: 0, overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-default)', textAlign: 'left', color: 'var(--text-secondary)', background: 'var(--bg-canvas)' }}>
                  <th style={{ padding: '8px 12px' }}>Invoice ID</th>
                  <th style={{ padding: '8px 12px' }}>Mill Name</th>
                  <th style={{ padding: '8px 12px' }}>Verified Savings</th>
                  <th style={{ padding: '8px 12px' }}>Gain-Share (20%)</th>
                  <th style={{ padding: '8px 12px' }}>PRA Tax (16%)</th>
                  <th style={{ padding: '8px 12px' }}>Total Billed</th>
                  <th style={{ padding: '8px 12px' }}>Status</th>
                  <th style={{ padding: '8px 12px' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => {
                  const isPaid = inv.status === 'PAID';
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid var(--border-default)' }}>
                      <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono, monospace)', color: '#06b6d4', fontWeight: 700 }}>
                        {inv.id}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {inv.millName}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#10b981', fontFamily: 'var(--font-mono, monospace)' }}>
                        Rs. {inv.verifiedSavingsPkr.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 700, fontFamily: 'var(--font-mono, monospace)' }}>
                        Rs. {inv.gainShareFeePkr.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono, monospace)' }}>
                        Rs. {inv.praTaxPkr.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono, monospace)' }}>
                        Rs. {inv.totalPayablePkr.toLocaleString()}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          fontSize: 10,
                          fontWeight: 700,
                          background: isPaid ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                          color: isPaid ? '#10b981' : '#f59e0b',
                        }}>
                          {isPaid ? 'PAID (MEEZAN IBFT)' : 'NET-15 DUE'}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        {!isPaid ? (
                          <button
                            onClick={() => handleSendNet15Reminder(inv)}
                            style={{
                              background: 'transparent',
                              border: '1px solid #f59e0b',
                              color: '#f59e0b',
                              padding: '2px 6px',
                              borderRadius: 4,
                              fontSize: 10,
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 2,
                            }}
                          >
                            <Send size={9} /> Remind
                          </button>
                        ) : (
                          <span style={{ color: 'var(--text-tertiary)', fontSize: 10, fontFamily: 'var(--font-mono, monospace)' }}>
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

      {/* SUB-TAB 4: WHATSAPP DIGEST */}
      {activeSubTab === 'WHATSAPP_DIGEST' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          <div className="ww-card" style={{ padding: 16 }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
              Automated WhatsApp Energy Digest Dispatcher
            </h3>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 14 }}>
              Dispatches at 08:30 PKT directly to mill owners and plant directors.
            </p>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Target Mill:
              </label>
              <select
                value={selectedMillForDigest.id}
                onChange={(e) => {
                  const found = mills.find(m => m.id === e.target.value);
                  if (found) setSelectedMillForDigest(found);
                }}
                style={{
                  width: '100%',
                  background: 'var(--bg-canvas)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-primary)',
                  padding: '6px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                }}
              >
                {mills.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.city})
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 11, color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>
                Language Format:
              </label>
              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => setDigestLang('en')}
                  style={{
                    flex: 1,
                    background: digestLang === 'en' ? '#06b6d4' : 'var(--bg-canvas)',
                    color: digestLang === 'en' ? '#0a0f1d' : 'var(--text-secondary)',
                    border: '1px solid var(--border-default)',
                    padding: 6,
                    borderRadius: 4,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  English
                </button>
                <button
                  onClick={() => setDigestLang('ur')}
                  style={{
                    flex: 1,
                    background: digestLang === 'ur' ? '#10b981' : 'var(--bg-canvas)',
                    color: digestLang === 'ur' ? '#0a0f1d' : 'var(--text-secondary)',
                    border: '1px solid var(--border-default)',
                    padding: 6,
                    borderRadius: 4,
                    fontWeight: 700,
                    cursor: 'pointer',
                    fontSize: 11,
                  }}
                >
                  اردو (نستعلیق)
                </button>
              </div>
            </div>

            <button
              onClick={handleDispatchWhatsAppBlast}
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                color: '#ffffff',
                border: 'none',
                padding: '10px 14px',
                borderRadius: 6,
                fontWeight: 800,
                fontSize: 12,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <MessageSquare size={14} />
              <span>Dispatch WhatsApp Digest</span>
            </button>
          </div>

          {/* Smartphone WhatsApp Card */}
          <div style={{
            background: '#0b141a',
            border: '2px solid #202c33',
            borderRadius: 16,
            padding: 16,
            maxWidth: 380,
            margin: '0 auto',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              borderBottom: '1px solid #202c33',
              paddingBottom: 8,
              marginBottom: 12,
            }}>
              <div style={{
                width: 30,
                height: 30,
                borderRadius: '50%',
                background: '#00a884',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontWeight: 800,
                fontSize: 11,
              }}>
                WW
              </div>
              <div>
                <div style={{ color: '#e9edef', fontWeight: 700, fontSize: 12 }}>
                  WattWise™ Energy AI
                </div>
                <div style={{ color: '#8696a0', fontSize: 10 }}>
                  Verified Bot · 08:30 AM
                </div>
              </div>
            </div>

            <div style={{
              background: '#005c4b',
              color: '#e9edef',
              padding: 12,
              borderRadius: 10,
              fontSize: 11,
              lineHeight: digestLang === 'ur' ? 1.8 : 1.4,
              direction: digestLang === 'ur' ? 'rtl' : 'ltr',
            }}>
              {digestLang === 'en' ? (
                <>
                  <div style={{ fontWeight: 800, marginBottom: 4, color: '#25d366' }}>
                    ⚡ WATTWISE™ DAILY EXECUTIVE SUMMARY
                  </div>
                  <div>Dear <strong>{selectedMillForDigest.ownerName}</strong>,</div>
                  <div style={{ color: '#8696a0', fontSize: 10, marginBottom: 6 }}>
                    {selectedMillForDigest.name} — Sunday, 5 Oct 2026
                  </div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: 6, borderRadius: 4, marginBottom: 6 }}>
                    <div>📉 <strong>Power Bill Yesterday:</strong> Rs. {(selectedMillForDigest.monthlySavingsPkr / 30 * 2.8).toFixed(0)}</div>
                    <div>🎯 <strong>Baseline Target:</strong> Rs. {(selectedMillForDigest.monthlySavingsPkr / 30 * 3.8).toFixed(0)}</div>
                    <div style={{ color: '#25d366', fontWeight: 700 }}>
                      💰 <strong>Net Cash Saved:</strong> Rs. {(selectedMillForDigest.monthlySavingsPkr / 30).toFixed(0)}
                    </div>
                  </div>
                  <div style={{ fontSize: 10 }}>
                    🛡️ <strong>SwiftSwitch Action:</strong> 3.5 hrs peak hours avoided.<br />
                    ⛽ <strong>Diesel Saved:</strong> 142 Liters.<br />
                    ⚡ <strong>Power Factor:</strong> {selectedMillForDigest.powerFactor} (Zero penalty).
                  </div>
                  <div style={{ marginTop: 8, fontSize: 9, color: '#8696a0', textAlign: 'right' }}>
                    08:30 AM · Delivered ✓✓
                  </div>
                </>
              ) : (
                <>
                  <div style={{ fontWeight: 800, marginBottom: 4, color: '#25d366' }}>
                    ⚡ واٹ وائز روزانہ انرجی سمری رپورٹ
                  </div>
                  <div>محترم جناب <strong>{selectedMillForDigest.ownerName}</strong> صاحب،</div>
                  <div style={{ background: 'rgba(0,0,0,0.2)', padding: 6, borderRadius: 4, margin: '6px 0' }}>
                    <div>📉 کل کا بل: {Math.round(selectedMillForDigest.monthlySavingsPkr / 30 * 2.8).toLocaleString()} روپے</div>
                    <div style={{ color: '#25d366', fontWeight: 800 }}>
                      💰 کل کی بچت: {Math.round(selectedMillForDigest.monthlySavingsPkr / 30).toLocaleString()} روپے
                    </div>
                  </div>
                  <div style={{ fontSize: 10 }}>
                    🛡️ سوئفٹ سوئچ: 3.5 گھنٹے پیک آورز سے بچایا گیا<br />
                    ⛽ ڈیزل بچت: 142 لیٹر · پاور فیکٹر: {selectedMillForDigest.powerFactor}
                  </div>
                  <div style={{ marginTop: 8, fontSize: 9, color: '#8696a0', textAlign: 'left', direction: 'ltr' }}>
                    08:30 AM · Delivered ✓✓
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* SUB-TAB 5: SEED ROUND & SERIES A */}
      {activeSubTab === 'SERIES_A' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div className="ww-card" style={{ padding: 16, background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.12), rgba(6, 182, 212, 0.08))', borderColor: 'rgba(168, 85, 247, 0.35)' }}>
            <span className="ww-badge" style={{ background: '#a855f7', color: '#fff', fontSize: 10 }}>
              SEED ROUND FINANCING
            </span>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
              USD 250,000 (PKR 70,000,000) on Post-Money SAFE
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: 11, marginTop: 2 }}>
              Valuation Cap: USD 2,500,000 (~10% Equity) · 20% Series A Discount · 18 Months Runway
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 10 }}>
            {SEED_INVESTOR_PROGRESS.vcPipeline.map((vc, idx) => (
              <div key={idx} className="ww-card" style={{ padding: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text-primary)' }}>{vc.name}</div>
                  <span style={{
                    padding: '2px 6px',
                    borderRadius: 4,
                    fontSize: 9,
                    fontWeight: 800,
                    background: vc.status === 'COMMITTED' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)',
                    color: vc.status === 'COMMITTED' ? '#10b981' : '#06b6d4',
                  }}>
                    {vc.status}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 2 }}>Lead: {vc.partner}</div>
                <div style={{ fontSize: 10, color: '#c084fc', marginTop: 4, fontWeight: 600 }}>
                  Stage: {vc.stage}
                </div>
              </div>
            ))}
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
