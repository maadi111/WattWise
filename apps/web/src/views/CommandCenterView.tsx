import React, { useState } from 'react';
import {
  Zap,
  Activity,
  Shield,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Layers,
  Cpu,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  X,
  RotateCcw,
  Receipt,
  Download,
  Share2,
  Sparkles,
  Leaf,
  Radio,
  FileText,
  BarChart3,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { NavSectionId, MachineDetail } from '../types/ui';
import {
  CURRENT_FACILITY,
  OPERATIONAL_ALERTS,
  POWER_FLOW_TREE,
  DEMO_MACHINES,
} from '../data/controlRoomData';
import { industrialAudio } from '../services/soundEffects';

interface CommandCenterViewProps {
  onNavigate: (section: NavSectionId) => void;
  onInspectMachine: (machine: MachineDetail) => void;
  lang?: 'en' | 'ur';
}

export const CommandCenterView: React.FC<CommandCenterViewProps> = ({
  onNavigate,
  onInspectMachine,
  lang = 'en',
}) => {
  const isUrdu = lang === 'ur';

  // Active progressive disclosure modal state
  const [activeModal, setActiveModal] = useState<
    null | 'GRID_FEEDER' | 'SWIFTSWITCH_MODAL' | 'LOADSHIFT_MODAL' | 'SAVINGS_MODAL' | 'POWER_TREE_MODAL' | 'ALERTS_MODAL'
  >(null);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleOpenModal = (modal: typeof activeModal) => {
    industrialAudio.playRelayClick();
    setActiveModal(modal);
  };

  const handleSimulateSwitchover = () => {
    industrialAudio.playSuccessChime();
    confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
    triggerToast('⚡ SwiftSwitch Test-Fire Executed: Contactor Transfer in 0.83ms!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            right: '24px',
            background: '#0f172a',
            color: '#ffffff',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '13px',
            fontWeight: 600,
          }}
        >
          <Sparkles size={16} color="#10b981" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Header & Operational Status Banner */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '16px',
          padding: '20px 24px',
          border: '1px solid #d1e7e3',
          boxShadow: '0 4px 20px rgba(18, 75, 99, 0.04)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: '#10b981',
                boxShadow: '0 0 10px #10b981',
                display: 'inline-block',
              }}
            />
            <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
              {isUrdu ? 'صنعتی کنٹرول روم — کریسنٹ ویونگ اینڈ ڈائینگ' : 'SCADA Control Room — Industrial Energy Intelligence'}
            </h1>
          </div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
            {CURRENT_FACILITY.name} ({CURRENT_FACILITY.unit}) · {CURRENT_FACILITY.city} · FESCO 11kV Feeder A-11 · High Stability Margin
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              background: '#dcfce7',
              color: '#059669',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Zap size={13} />
            <span>GRID: 401.8V (NORMAL)</span>
          </span>

          <span
            style={{
              background: '#fef3c7',
              color: '#d97706',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <Shield size={13} />
            <span>SWIFTSWITCH ARMED (0.83ms)</span>
          </span>

          <span
            style={{
              background: '#f1f5f9',
              color: '#475569',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 700,
              fontFamily: 'var(--font-mono, monospace)',
            }}
          >
            MODBUS LIVE (142ms)
          </span>
        </div>
      </div>

      {/* 4 Core Minimal SCADA Control Cards (Click to Reveal) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        {/* Card 1: 11kV Grid Influx & Waveform Diagnostics */}
        <div
          id="scada-card-grid"
          onClick={() => handleOpenModal('GRID_FEEDER')}
          className="minimal-card-hover"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>
                PRIMARY GRID INFLUX
              </span>
              <Zap size={16} color="#0d9488" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '10px', fontFamily: 'var(--font-mono, monospace)' }}>
              401.8 V
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              FESCO Khurrianwala Feeder · 50.02 Hz (±0.4%)
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#0d9488', fontWeight: 700 }}>
            <span>Click to view 3-Phase Waveforms</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Card 2: SwiftSwitch™ Contactor & Outage Defense */}
        <div
          id="scada-card-swiftswitch"
          onClick={() => handleOpenModal('SWIFTSWITCH_MODAL')}
          className="minimal-card-hover"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0284c7', textTransform: 'uppercase' }}>
                SWIFTSWITCH™ DEFENSE
              </span>
              <Shield size={16} color="#0284c7" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '10px', fontFamily: 'var(--font-mono, monospace)' }}>
              0.83 ms
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              1.2MW Cummins Hot-Standby · Outage Risk: 87% (09m 42s)
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#0284c7', fontWeight: 700 }}>
            <span>Click to view ATS & Generator Audit</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Card 3: LoadShift™ Process Curfew & Peak Arbitrage */}
        <div
          id="scada-card-loadshift"
          onClick={() => handleOpenModal('LOADSHIFT_MODAL')}
          className="minimal-card-hover"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#16a34a', textTransform: 'uppercase' }}>
                LOADSHIFT™ ARBITRAGE
              </span>
              <Clock size={16} color="#16a34a" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '10px', fontFamily: 'var(--font-mono, monospace)' }}>
              782.1 kW
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Off-Peak Window (Rs. 32.50) · Peak Curfew 18:00 Armed
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#16a34a', fontWeight: 700 }}>
            <span>Click to view MILP Process Gantt</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Card 4: Financial Reconciliation & Meezan Bank Escrow */}
        <div
          id="scada-card-savings"
          onClick={() => handleOpenModal('SAVINGS_MODAL')}
          className="minimal-card-hover"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            position: 'relative',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: 800, color: '#0d9488', textTransform: 'uppercase' }}>
                VERIFIED SAVINGS (MTD)
              </span>
              <Receipt size={16} color="#0d9488" />
            </div>
            <div style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', marginTop: '10px', fontFamily: 'var(--font-mono, monospace)' }}>
              Rs. 1.84M
            </div>
            <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
              Net Mill Profit: Rs. 1.47M (80%) · Meezan Bank IBFT
            </div>
          </div>
          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#0d9488', fontWeight: 700 }}>
            <span>Click to view Shariah Billing Ledger</span>
            <ChevronRight size={14} />
          </div>
        </div>
      </div>

      {/* Secondary Row: Substation Power Flow Tree & Machine Status */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 1.3fr) minmax(320px, 1fr)', gap: '16px' }}>
        {/* Left: Substation Power Flow Tree Card */}
        <div
          id="scada-card-power-tree"
          onClick={() => handleOpenModal('POWER_TREE_MODAL')}
          className="minimal-card-hover"
          style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Substation Power Distribution Tree (11kV / 415V)
                </h3>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                  Live hierarchy from incoming FESCO feeder through secondary busbars
                </div>
              </div>
              <span style={{ fontSize: '11px', fontWeight: 700, color: '#0d9488', background: '#e6f7f2', padding: '4px 8px', borderRadius: '6px' }}>
                4 BUSBARS LIVE
              </span>
            </div>

            {/* Tree Branch Diagram */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {[
                { name: 'PCC-01: Airjet Weaving Looms (40 Tsudakoma)', load: '420.0 kW', pf: '0.94 PF', status: 'NOMINAL', color: '#059669' },
                { name: 'PCC-02: Thies Dyeing Vats (High-Temp Vats 1-4)', load: '280.5 kW', pf: '0.92 PF', status: 'PROTECTED', color: '#0284c7' },
                { name: 'PCC-03: Atlas Copco Air Compressors (100 PSI)', load: '91.4 kW', pf: '0.89 PF', status: 'SHED ARMED', color: '#d97706' },
                { name: 'MCC-04: HVAC & Administration Building', load: '32.1 kW', pf: '0.91 PF', status: 'AUTO-SHEDDED', color: '#64748b' },
              ].map((bus, idx) => (
                <div
                  key={idx}
                  style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '12px 16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>{bus.name}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Power Factor: {bus.pf}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '13px', fontWeight: 800, color: '#0f172a', fontFamily: 'var(--font-mono, monospace)' }}>
                      {bus.load}
                    </div>
                    <span style={{ fontSize: '10px', fontWeight: 800, color: bus.color, background: '#ffffff', border: `1px solid ${bus.color}40`, padding: '2px 6px', borderRadius: '4px' }}>
                      {bus.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '11px', color: '#0d9488', fontWeight: 700 }}>
            <span>Click to inspect feeder breaker telemetry</span>
            <ChevronRight size={14} />
          </div>
        </div>

        {/* Right: Critical Machines & Active Anomalies Card */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Active Alert Summary Card */}
          <div
            id="scada-card-alerts"
            onClick={() => handleOpenModal('ALERTS_MODAL')}
            className="minimal-card-hover"
            style={{
              background: '#fffbeb',
              borderRadius: '16px',
              padding: '18px 20px',
              border: '1px solid #fde68a',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <AlertTriangle size={18} color="#d97706" />
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#92400e' }}>
                  1 Operational Warning Active
                </div>
                <div style={{ fontSize: '11px', color: '#b45309', marginTop: '2px' }}>
                  Compressor #02 Power Factor Dip (0.81 PF) · Click to resolve
                </div>
              </div>
            </div>
            <ChevronRight size={16} color="#92400e" />
          </div>

          {/* Machine Watchlist Card */}
          <div
            style={{
              background: '#ffffff',
              borderRadius: '16px',
              padding: '20px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <h3 style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Critical Machinery Watchlist
                </h3>
                <span style={{ fontSize: '11px', color: '#64748b' }}>Live Modbus Polling</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {DEMO_MACHINES.slice(0, 3).map((machine) => (
                  <div
                    key={machine.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onInspectMachine(machine);
                    }}
                    style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#0d9488')}
                    onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#e2e8f0')}
                  >
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#0f172a' }}>{machine.name}</div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>{machine.department} · {machine.line}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', fontWeight: 800, color: '#0d9488', fontFamily: 'var(--font-mono, monospace)' }}>
                        {machine.currentKw} kW
                      </div>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#059669', background: '#dcfce7', padding: '1px 5px', borderRadius: '3px' }}>
                        INSPECT →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: '14px', fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
              Click any machine to open contextual engineering inspector
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PROGRESSIVE DISCLOSURE MODALS                                             */}
      {/* ========================================================================= */}

      {/* Modal 1: Grid Feeder & Waveform Modal */}
      {activeModal === 'GRID_FEEDER' && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={iconBoxStyle}><Zap size={18} color="#0d9488" /></div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  11kV Primary Grid Feeder & Waveform Telemetry
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '18px' }}>
                Real-time 100ms Modbus polling from Schneider PM5110 revenue meter on FESCO Feeder A-11 (Khurrianwala).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
                <div style={subcardStyle}>
                  <div style={labelStyle}>PHASE A-B-C VOLTAGE</div>
                  <div style={{ ...valStyle, color: '#0d9488' }}>401.8 V</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Nominal ±0.4% Balance</div>
                </div>
                <div style={subcardStyle}>
                  <div style={labelStyle}>GRID FREQUENCY</div>
                  <div style={{ ...valStyle, color: '#0284c7' }}>50.02 Hz</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Shed threshold: 48.5 Hz</div>
                </div>
                <div style={subcardStyle}>
                  <div style={labelStyle}>POWER FACTOR</div>
                  <div style={{ ...valStyle, color: '#16a34a' }}>0.94 PF</div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>Zero DISCO Penalty</div>
                </div>
              </div>

              <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <strong style={{ fontSize: '13px', color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                  NEPRA Section 21 Power Quality Dossier:
                </strong>
                <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: 1.5 }}>
                  Voltage stability certified within ±5% tolerance. Total Harmonic Distortion (THD) is 2.1% (well below the 5.0% IEEE-519 ceiling). If DISCO imposes low power factor surcharges, 1-click legal dispute dossier is available.
                </p>
              </div>

              <button
                onClick={() => {
                  triggerToast('NEPRA Section 21 Dispute Dossier Exported (.PDF)');
                  setActiveModal(null);
                }}
                style={primaryBtnStyle}
              >
                <Download size={14} /> Export Grid Quality Certificate (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: SwiftSwitch Modal */}
      {activeModal === 'SWIFTSWITCH_MODAL' && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={iconBoxStyle}><Shield size={18} color="#0284c7" /></div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  SwiftSwitch™ Sub-Cycle ATS & Captive Genset Automation
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '18px' }}>
                Eliminates the 3 to 15 minute "Chowkidar Lag". Predicts frequency drop at T-12s and pre-emptively spins the 1.2MW Cummins QSK23 engine.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
                <div style={subcardStyle}>
                  <div style={labelStyle}>BENCHMARK TRANSFER</div>
                  <div style={{ ...valStyle, color: '#0284c7' }}>0.83 ms</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Microsecond ATS action</div>
                </div>
                <div style={subcardStyle}>
                  <div style={labelStyle}>DIESEL RESERVE TANK</div>
                  <div style={{ ...valStyle, color: '#0d9488' }}>8,400 Liters</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>38 hours continuous run</div>
                </div>
                <div style={subcardStyle}>
                  <div style={labelStyle}>BATCH DEFECTS PREVENTED</div>
                  <div style={{ ...valStyle, color: '#16a34a' }}>12 Batches</div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>Rs. 3.4M value protected</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handleSimulateSwitchover} style={primaryBtnStyle}>
                  <Zap size={14} /> Execute 0.83ms Test-Fire Switchover
                </button>
                <button onClick={() => setActiveModal(null)} style={secondaryBtnStyle}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: LoadShift Modal */}
      {activeModal === 'LOADSHIFT_MODAL' && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={iconBoxStyle}><Clock size={18} color="#16a34a" /></div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  LoadShift™ MILP Process Schedule & Peak Tariff Curfew
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '18px' }}>
                Schedules heavy dyeing vats and warping away from NEPRA peak tariff window (18:00 to 22:00 at Rs. 85.40/kWh) into cheap off-peak hours (Rs. 32.50/kWh).
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
                <div style={subcardStyle}>
                  <div style={labelStyle}>PEAK TARIFF (18:00-22:00)</div>
                  <div style={{ ...valStyle, color: '#ef4444' }}>Rs. 85.40</div>
                  <div style={{ fontSize: '11px', color: '#ef4444', fontWeight: 700 }}>Curfew Armed</div>
                </div>
                <div style={subcardStyle}>
                  <div style={labelStyle}>OFF-PEAK GRID (00:00-17:00)</div>
                  <div style={{ ...valStyle, color: '#16a34a' }}>Rs. 32.50</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Primary Production Window</div>
                </div>
                <div style={subcardStyle}>
                  <div style={labelStyle}>DAILY PEAK SAVINGS</div>
                  <div style={{ ...valStyle, color: '#0d9488' }}>Rs. 61,334</div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>26% cost reduction</div>
                </div>
              </div>

              <button onClick={() => setActiveModal(null)} style={primaryBtnStyle}>
                Return to SCADA View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Savings & Meezan Bank Modal */}
      {activeModal === 'SAVINGS_MODAL' && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={iconBoxStyle}><Receipt size={18} color="#0d9488" /></div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Verified Savings & Meezan Bank Gain-Share Ledger
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '18px' }}>
                Counterfactual baseline sealed via IPMVP Option C protocol. Invoiced via Meezan Bank Shariah-compliant escrow.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px', marginBottom: '20px' }}>
                <div style={subcardStyle}>
                  <div style={labelStyle}>GROSS VERIFIED SAVINGS</div>
                  <div style={{ ...valStyle, color: '#0d9488' }}>Rs. 1,840,000</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Month of March 2026</div>
                </div>
                <div style={subcardStyle}>
                  <div style={labelStyle}>NET FACTORY CASH (80%)</div>
                  <div style={{ ...valStyle, color: '#16a34a' }}>Rs. 1,472,000</div>
                  <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>Direct Bottom-Line Profit</div>
                </div>
                <div style={subcardStyle}>
                  <div style={labelStyle}>WATTWISE 20% GAIN-SHARE</div>
                  <div style={{ ...valStyle, color: '#0284c7' }}>Rs. 368,000</div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>Meezan IBFT Settled</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    triggerToast('Meezan Bank Shariah Audit Statement Downloaded (.PDF)');
                    setActiveModal(null);
                  }}
                  style={primaryBtnStyle}
                >
                  <Download size={14} /> Download Meezan Bank Audit (.PDF)
                </button>
                <button onClick={() => setActiveModal(null)} style={secondaryBtnStyle}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Power Tree Modal */}
      {activeModal === 'POWER_TREE_MODAL' && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={iconBoxStyle}><Layers size={18} color="#0d9488" /></div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Substation Breaker & Transformer Telemetry
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '16px' }}>
                <strong style={{ fontSize: '13px', color: '#0f172a' }}>Transformer T-1 (2.5 MVA · 11kV / 415V Dyn11):</strong>
                <div style={{ fontSize: '12px', color: '#64748b', marginTop: '4px' }}>
                  Oil Temperature: 54°C (Normal) · Winding Temp: 62°C · Loading: 48.2% · Buchholz Relay: NORMAL
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                {DEMO_MACHINES.map((m) => (
                  <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: '#ffffff', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                    <div>
                      <strong style={{ fontSize: '12px', color: '#0f172a' }}>{m.name}</strong>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>{m.department} · {m.line} · PF: {m.powerFactor}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '13px', fontWeight: 800, color: '#0d9488', fontFamily: 'var(--font-mono, monospace)' }}>
                        {m.currentKw} kW
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button onClick={() => setActiveModal(null)} style={primaryBtnStyle}>
                Return to SCADA View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 6: Alerts Modal */}
      {activeModal === 'ALERTS_MODAL' && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={iconBoxStyle}><AlertTriangle size={18} color="#d97706" /></div>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Active Operational Anomalies & Fault Mitigation
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}><X size={18} /></button>
            </div>
            <div style={{ padding: '24px', overflowY: 'auto' }}>
              <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '12px', padding: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#92400e' }}>
                  Compressor #02: Low Power Factor Detected (0.81 PF)
                </div>
                <p style={{ fontSize: '12px', color: '#b45309', marginTop: '4px', margin: 0 }}>
                  Unloaded run cycle causing reactive power draw. WattWise APFC automatic capacitor bank stage 3 scheduled to switch in.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  onClick={() => {
                    triggerToast('APFC Stage 3 Capacitors Engaged. Power Factor Restored to 0.94 PF.');
                    setActiveModal(null);
                  }}
                  style={primaryBtnStyle}
                >
                  <CheckCircle2 size={14} /> Auto-Engage APFC Capacitor Bank
                </button>
                <button onClick={() => setActiveModal(null)} style={secondaryBtnStyle}>
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Reusable Modal Styles
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(15, 23, 42, 0.45)',
  backdropFilter: 'blur(8px)',
  zIndex: 9999,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
};

const modalContentStyle: React.CSSProperties = {
  background: '#ffffff',
  borderRadius: '20px',
  width: '100%',
  maxWidth: '720px',
  maxHeight: '85vh',
  boxShadow: '0 25px 60px rgba(18, 75, 99, 0.16)',
  border: '1px solid #d1e7e3',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
  color: '#0f172a',
};

const modalHeaderStyle: React.CSSProperties = {
  padding: '18px 24px',
  borderBottom: '1px solid #eef3f2',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: '#fafcfc',
};

const iconBoxStyle: React.CSSProperties = {
  width: '32px',
  height: '32px',
  borderRadius: '8px',
  background: '#e6f7f2',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const closeBtnStyle: React.CSSProperties = {
  background: '#f1f5f9',
  border: 'none',
  color: '#64748b',
  cursor: 'pointer',
  padding: '6px',
  borderRadius: '8px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

const subcardStyle: React.CSSProperties = {
  background: '#f8fafc',
  border: '1px solid #e2e8f0',
  borderRadius: '12px',
  padding: '16px',
};

const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  fontWeight: 700,
  color: '#64748b',
  marginBottom: '4px',
};

const valStyle: React.CSSProperties = {
  fontSize: '22px',
  fontWeight: 800,
  fontFamily: 'var(--font-mono, monospace)',
  marginBottom: '4px',
};

const primaryBtnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #0d9488, #059669)',
  color: '#ffffff',
  border: 'none',
  padding: '10px 20px',
  borderRadius: '10px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)',
};

const secondaryBtnStyle: React.CSSProperties = {
  background: '#ffffff',
  color: '#334155',
  border: '1px solid #cbd5e1',
  padding: '10px 18px',
  borderRadius: '10px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
};
