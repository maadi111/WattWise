import React, { useState, useEffect } from 'react';
import {
  Radio,
  Activity,
  Cpu,
  Shield,
  CheckCircle2,
  ChevronRight,
  AlertTriangle,
  RotateCw,
  Terminal,
  Zap,
  Play,
  Square,
  Lock,
  Flame,
  ArrowRight,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { industrialAudio } from '../services/soundEffects';

interface SensorNetworkViewProps {
  lang?: 'en' | 'ur';
}

interface ModbusPacketLog {
  id: string;
  timestamp: string;
  unitId: number;
  meterName: string;
  funcCode: string;
  regRange: string;
  rawHex: string;
  latencyMs: number;
  crcStatus: 'VALID' | 'ERROR';
}

export const SensorNetworkView: React.FC<SensorNetworkViewProps> = ({ lang = 'en' }) => {
  const isUrdu = lang === 'ur';

  const [activeTab, setActiveTab] = useState<'NODES' | 'FRAME_SNIFFER' | 'REGISTER_MAP' | 'FAULT_INJECTION'>('NODES');
  const [selectedUnit, setSelectedUnit] = useState<number>(1);
  const [isSniffing, setIsSniffing] = useState<boolean>(true);
  const [packetLogs, setPacketLogs] = useState<ModbusPacketLog[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Dynamic Fault Injection States
  const [frequencySagActive, setFrequencySagActive] = useState<boolean>(false);
  const [polarityBReversed, setPolarityBReversed] = useState<boolean>(false);
  const [voltageBrownout, setVoltageBrownout] = useState<boolean>(false);
  const [harmonicsSpike, setHarmonicsSpike] = useState<boolean>(false);
  const [atsContactorTransferred, setAtsContactorTransferred] = useState<boolean>(false);

  // Helper Toast
  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Sensor Nodes
  const sensorNodes = [
    { id: 'WC-001', name: 'MDB-01 Main 11kV Grid Incomer', type: 'Schneider Electric PM8000', bus: 'RS-485 Loop A', signal: '-58 dBm', currentKw: frequencySagActive ? 0.0 : 850.4, voltageV: voltageBrownout ? 320.5 : 405.2, freqHz: frequencySagActive ? 48.12 : 50.02, temp: '38°C', health: frequencySagActive ? 'CRITICAL' : 'NORMAL' },
    { id: 'WC-002', name: 'Standby 1.2MW Diesel Generator', type: 'Janitza UMG 604E', bus: 'RS-485 Loop A', signal: '-55 dBm', currentKw: atsContactorTransferred ? 850.4 : 0.0, voltageV: 404.8, freqHz: 50.00, temp: '32°C', health: 'NORMAL' },
    { id: 'WC-003', name: 'Ring Spinning Shed Sub-Feeder (PCC-SP)', type: 'Schneider PM5560 Class 0.2S', bus: 'RS-485 Loop B', signal: '-62 dBm', currentKw: 380.2, voltageV: voltageBrownout ? 319.8 : 404.5, freqHz: frequencySagActive ? 48.12 : 50.02, temp: '41°C', health: 'NORMAL' },
    { id: 'WC-004', name: 'Air-Jet Weaving Shed Sub-Feeder (PCC-WV)', type: 'Schneider PM5560 Class 0.2S', bus: 'RS-485 Loop B', signal: '-64 dBm', currentKw: polarityBReversed ? -290.5 : 290.5, voltageV: voltageBrownout ? 321.0 : 404.0, freqHz: frequencySagActive ? 48.12 : 50.02, temp: '39°C', health: polarityBReversed ? 'WARNING' : 'NORMAL' },
    { id: 'WC-005', name: 'Thies Dyeing Vats 1-4 (PCC-DY)', type: 'WattClamp High-Temp Rogowski (800A)', bus: 'RS-485 Loop C', signal: '-60 dBm', currentKw: 145.4, voltageV: 400.9, freqHz: 50.02, temp: '54°C', health: 'NORMAL' },
    { id: 'WC-008', name: 'Atlas Copco GA-90 Compressor House', type: 'WattClamp Split-Core CT (400A)', bus: 'RS-485 Loop C', signal: '-68 dBm', currentKw: 91.0, voltageV: 402.0, freqHz: 50.02, temp: '44°C', health: 'NORMAL' },
    { id: 'WC-010', name: 'WattBrain Core & SwiftSwitch Relay Node', type: 'ARM Cortex-M4 Microsecond Contactor Box', bus: 'Internal I2C / RS-485', signal: '-42 dBm', currentKw: 12.5, voltageV: 230.0, freqHz: 50.00, temp: '36°C', health: 'NORMAL' },
  ];

  // Simulated live frame sniffer stream
  useEffect(() => {
    if (!isSniffing) return;

    const interval = setInterval(() => {
      const units = [
        { id: 1, name: 'Schneider PM8000', regs: '3000-3020', hex: '01 03 14 43 6A 00 00 43 66 33 33 43 69 99 9A 42 F0' },
        { id: 2, name: 'Janitza UMG 604', regs: '3110-3112', hex: '02 03 04 42 48 0A 3D B4 8E' },
        { id: 3, name: 'Spinning PM5560', regs: '3060-3068', hex: '03 03 08 43 BD B3 33 42 E8 00 00 A1 22' },
        { id: 10, name: 'WattBrain Relays', regs: 'Coil 0x01-0x05', hex: '0A 01 01 05 92 11' },
      ];

      const u = units[Math.floor(Math.random() * units.length)];
      const now = new Date();
      const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${now.getMilliseconds().toString().padStart(3, '0')}`;

      const newLog: ModbusPacketLog = {
        id: `PKT-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        timestamp: timeStr,
        unitId: u.id,
        meterName: u.name,
        funcCode: u.id === 10 ? '0x01 (Read Coils)' : '0x03 (Read Holding Regs)',
        regRange: u.regs,
        rawHex: u.hex,
        latencyMs: Number((6.5 + Math.random() * 5.2).toFixed(2)),
        crcStatus: 'VALID',
      };

      setPacketLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    }, 400);

    return () => clearInterval(interval);
  }, [isSniffing]);

  // Handle Invert Polarity in DSP
  const handleInvertPolarity = () => {
    industrialAudio.playRelayClick();
    setPolarityBReversed((prev) => !prev);
    triggerToast(
      polarityBReversed
        ? 'Phase B Polarity Software Inverted. Active Power restored to +290.5 kW!'
        : 'Phase B Polarity Reversed! Negative active power (-290.5 kW) simulated.'
    );
  };

  // Handle Frequency Sag Injection
  const handleToggleFrequencySag = () => {
    if (!frequencySagActive) {
      industrialAudio.playPreSwitchAlert();
      setFrequencySagActive(true);
      triggerToast('CRITICAL: WAPDA Feeder Frequency Sag to 48.12 Hz (<48.5Hz threshold) injected!');
    } else {
      industrialAudio.playSuccessChime();
      setFrequencySagActive(false);
      triggerToast('Grid frequency restored to nominal 50.02 Hz.');
    }
  };

  // Handle SwiftSwitch Contactor Transfer
  const handleTriggerATS = () => {
    industrialAudio.playRelayClick();
    setAtsContactorTransferred(true);
    setFrequencySagActive(false);
    confetti({ particleCount: 60, spread: 55, origin: { y: 0.6 } });
    triggerToast('⚡ SWIFTSWITCH EXECUTED: ATS Contactor transferred load to Generator in 0.83 ms!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'linear-gradient(135deg, #0f172a, #1e293b)',
          border: '1px solid #06b6d4',
          boxShadow: '0 8px 30px rgba(6, 182, 212, 0.35)',
          color: '#ffffff',
          padding: '12px 18px',
          borderRadius: '8px',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '0.85rem',
          fontWeight: 600,
        }}>
          <Sparkles size={16} color="#06b6d4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              {isUrdu ? 'سینسر نیٹ ورک اور انڈسٹریل موڈبس RS-485 / TCP کنٹرول' : 'SENSOR NETWORK & INDUSTRIAL MODBUS RS-485 / TCP SUITE'}
            </h1>
            <span className="ww-badge ww-badge-live">
              <Radio size={11} /> 28 MODBUS NODES ACTIVE
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            {isUrdu
              ? 'شنائیڈر PM8000 اور یانٹزا میٹرز کی لائیو ٹیلی میٹری، رو فریم اسنیفر، آئی ای ای ای 754 فلوٹ ڈی کوڈنگ اور سب سائیکل سوئفٹ سوئچ ٹیسٹنگ'
              : 'Live Schneider PM8000 & Janitza multi-drop telemetry, raw hex frame sniffer, IEEE-754 register map, and sub-cycle fault injection'}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="num-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            TCP Endpoint: <b style={{ color: 'var(--operational-green)' }}>127.0.0.1:5020</b> · RTU Baud: <b style={{ color: 'var(--text-primary)' }}>38,400 8N1</b>
          </span>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div style={{
        display: 'flex',
        gap: 6,
        borderBottom: '1px solid var(--border-default)',
        paddingBottom: 6,
        overflowX: 'auto',
      }}>
        <button
          onClick={() => setActiveTab('NODES')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeTab === 'NODES' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
            border: `1px solid ${activeTab === 'NODES' ? '#06b6d4' : 'transparent'}`,
            color: activeTab === 'NODES' ? '#06b6d4' : 'var(--text-secondary)',
            padding: '6px 14px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Radio size={13} />
          <span>Sensor Registry & Topology</span>
        </button>

        <button
          onClick={() => setActiveTab('FRAME_SNIFFER')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeTab === 'FRAME_SNIFFER' ? 'rgba(16, 185, 129, 0.15)' : 'transparent',
            border: `1px solid ${activeTab === 'FRAME_SNIFFER' ? '#10b981' : 'transparent'}`,
            color: activeTab === 'FRAME_SNIFFER' ? '#10b981' : 'var(--text-secondary)',
            padding: '6px 14px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Terminal size={13} />
          <span>Live Frame Sniffer & Hex Stream</span>
        </button>

        <button
          onClick={() => setActiveTab('REGISTER_MAP')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeTab === 'REGISTER_MAP' ? 'rgba(168, 85, 247, 0.15)' : 'transparent',
            border: `1px solid ${activeTab === 'REGISTER_MAP' ? '#a855f7' : 'transparent'}`,
            color: activeTab === 'REGISTER_MAP' ? '#c084fc' : 'var(--text-secondary)',
            padding: '6px 14px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Cpu size={13} />
          <span>Holding Register Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('FAULT_INJECTION')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: activeTab === 'FAULT_INJECTION' ? 'rgba(244, 63, 94, 0.15)' : 'transparent',
            border: `1px solid ${activeTab === 'FAULT_INJECTION' ? '#f43f5e' : 'transparent'}`,
            color: activeTab === 'FAULT_INJECTION' ? '#f43f5e' : 'var(--text-secondary)',
            padding: '6px 14px',
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <Flame size={13} />
          <span>Substation Fault Injector</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: SENSOR NODES REGISTRY                                              */}
      {/* ========================================================================= */}
      {activeTab === 'NODES' && (
        <div className="ww-card">
          <div className="ww-card-header">
            <span className="ww-card-title">
              <Radio size={13} color="var(--operational-green)" />
              Multi-Drop RS-485 / Modbus TCP Node Registry
            </span>
            <span className="num-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
              Polling: 100ms (<b style={{ color: '#10b981' }}>10 Hz</b>) · CRC-16 Checksum: Valid
            </span>
          </div>
          <div className="ww-table-container">
            <table className="ww-table">
              <thead>
                <tr>
                  <th>Node ID</th>
                  <th>Monitored Bus / Load</th>
                  <th>Transducer Hardware</th>
                  <th>RS-485 Channel</th>
                  <th>Signal</th>
                  <th>Active Power</th>
                  <th>Voltage</th>
                  <th>Freq (Hz)</th>
                  <th>Temp</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {sensorNodes.map((s) => (
                  <tr key={s.id}>
                    <td className="num-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{s.id}</td>
                    <td style={{ fontWeight: 600 }}>{s.name}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{s.type}</td>
                    <td>{s.bus}</td>
                    <td className="num-mono">{s.signal}</td>
                    <td className="num-mono" style={{
                      fontWeight: 700,
                      color: s.currentKw < 0 ? '#f43f5e' : '#10b981',
                    }}>
                      {s.currentKw.toFixed(1)} kW {s.currentKw < 0 && '(-kW Reversed)'}
                    </td>
                    <td className="num-mono">{s.voltageV.toFixed(1)} V</td>
                    <td className="num-mono" style={{
                      color: s.freqHz < 48.5 ? '#f43f5e' : 'var(--text-primary)',
                      fontWeight: s.freqHz < 48.5 ? 800 : 500,
                    }}>
                      {s.freqHz.toFixed(2)} Hz
                    </td>
                    <td className="num-mono">{s.temp}</td>
                    <td>
                      {s.health === 'NORMAL' ? (
                        <span className="ww-badge ww-badge-live">ONLINE</span>
                      ) : s.health === 'CRITICAL' ? (
                        <span className="ww-badge ww-badge-critical">GRID SAG</span>
                      ) : (
                        <span className="ww-badge ww-badge-warning">CHECK CT POLARITY</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: LIVE FRAME SNIFFER                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'FRAME_SNIFFER' && (
        <div className="ww-card" style={{ padding: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Terminal size={16} color="#10b981" />
              <h3 style={{ fontSize: 14, fontWeight: 800 }}>
                Live Industrial Modbus RS-485 / TCP Frame Stream
              </h3>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => setIsSniffing(!isSniffing)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  background: isSniffing ? 'rgba(244, 63, 94, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  border: `1px solid ${isSniffing ? '#f43f5e' : '#10b981'}`,
                  color: isSniffing ? '#f43f5e' : '#10b981',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {isSniffing ? <Square size={12} /> : <Play size={12} />}
                <span>{isSniffing ? 'Pause Sniffer' : 'Resume Sniffer'}</span>
              </button>

              <button
                onClick={() => setPacketLogs([])}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-secondary)',
                  padding: '4px 10px',
                  borderRadius: 6,
                  fontSize: 11,
                  cursor: 'pointer',
                }}
              >
                Clear Buffer
              </button>
            </div>
          </div>

          <div style={{
            background: '#050914',
            borderRadius: 8,
            border: '1px solid #1e293b',
            padding: 12,
            maxHeight: 420,
            overflowY: 'auto',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 11,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '90px 70px 140px 180px 1fr 70px 60px', paddingBottom: 6, borderBottom: '1px solid #1e293b', color: '#64748b', fontWeight: 700 }}>
              <div>TIMESTAMP</div>
              <div>SLAVE ID</div>
              <div>DEVICE</div>
              <div>FUNCTION</div>
              <div>RAW MODBUS HEX PAYLOAD</div>
              <div>LATENCY</div>
              <div>STATUS</div>
            </div>

            {packetLogs.map((p) => (
              <div
                key={p.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '90px 70px 140px 180px 1fr 70px 60px',
                  padding: '6px 0',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.03)',
                  alignItems: 'center',
                }}
              >
                <div style={{ color: '#94a3b8' }}>{p.timestamp}</div>
                <div style={{ color: '#06b6d4', fontWeight: 700 }}>0x0{p.unitId.toString(16).toUpperCase()}</div>
                <div style={{ color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.meterName}</div>
                <div style={{ color: '#c084fc' }}>{p.funcCode}</div>
                <div style={{ color: '#10b981', letterSpacing: 1 }}>{p.rawHex}</div>
                <div style={{ color: '#f59e0b' }}>{p.latencyMs}ms</div>
                <div>
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', padding: '1px 5px', borderRadius: 4, fontSize: 9, fontWeight: 700 }}>
                    {p.crcStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HOLDING REGISTER MAP INSPECTOR                                      */}
      {/* ========================================================================= */}
      {activeTab === 'REGISTER_MAP' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* Unit Selector */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>Target Meter:</span>
            {[
              { id: 1, label: 'Unit 0x01: Schneider PM8000 (11kV Grid)' },
              { id: 2, label: 'Unit 0x02: Janitza UMG 604 (1.2MW Gen)' },
              { id: 3, label: 'Unit 0x03: Schneider PM5560 (Spinning)' },
              { id: 10, label: 'Unit 0x0A: WattBrain Edge Relays & Coils' },
            ].map((u) => (
              <button
                key={u.id}
                onClick={() => setSelectedUnit(u.id)}
                style={{
                  background: selectedUnit === u.id ? 'rgba(6, 182, 212, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${selectedUnit === u.id ? '#06b6d4' : 'var(--border-default)'}`,
                  color: selectedUnit === u.id ? '#06b6d4' : 'var(--text-secondary)',
                  padding: '6px 12px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {u.label}
              </button>
            ))}
          </div>

          {/* Register Inspector Grid */}
          <div className="ww-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <span className="ww-card-title">
                <Cpu size={14} color="#06b6d4" />
                Live Holding Registers (IEEE-754 Big-Endian Word Order)
              </span>
              <span className="num-mono" style={{ fontSize: 11, color: '#10b981' }}>
                Refreshed at 20 Hz (50ms interval)
              </span>
            </div>

            <div className="ww-table-container">
              <table className="ww-table">
                <thead>
                  <tr>
                    <th>Address Range</th>
                    <th>Metric Name</th>
                    <th>Data Type</th>
                    <th>Raw Words (High / Low)</th>
                    <th>Decoded Engineering Value</th>
                    <th>Quality</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="num-mono" style={{ fontWeight: 700 }}>3000 – 3001</td>
                    <td>Phase A RMS Current (IA)</td>
                    <td className="num-mono">Float32</td>
                    <td className="num-mono" style={{ color: '#06b6d4' }}>0x436A / 0x0000</td>
                    <td className="num-mono" style={{ fontWeight: 800, color: '#10b981' }}>412.5 A</td>
                    <td><span className="ww-badge ww-badge-live">GOOD</span></td>
                  </tr>
                  <tr>
                    <td className="num-mono" style={{ fontWeight: 700 }}>3002 – 3003</td>
                    <td>Phase B RMS Current (IB)</td>
                    <td className="num-mono">Float32</td>
                    <td className="num-mono" style={{ color: '#06b6d4' }}>
                      {polarityBReversed ? '0xC366 / 0x3333' : '0x4366 / 0x3333'}
                    </td>
                    <td className="num-mono" style={{
                      fontWeight: 800,
                      color: polarityBReversed ? '#f43f5e' : '#10b981',
                    }}>
                      {polarityBReversed ? '-408.2 A (REVERSED)' : '+408.2 A (INVERTED DSP)'}
                    </td>
                    <td>
                      <span className={`ww-badge ${polarityBReversed ? 'ww-badge-critical' : 'ww-badge-live'}`}>
                        {polarityBReversed ? 'PHASE ERROR' : 'GOOD'}
                      </span>
                    </td>
                  </tr>
                  <tr>
                    <td className="num-mono" style={{ fontWeight: 700 }}>3004 – 3005</td>
                    <td>Phase C RMS Current (IC)</td>
                    <td className="num-mono">Float32</td>
                    <td className="num-mono" style={{ color: '#06b6d4' }}>0x4369 / 0x999A</td>
                    <td className="num-mono" style={{ fontWeight: 800, color: '#10b981' }}>415.0 A</td>
                    <td><span className="ww-badge ww-badge-live">GOOD</span></td>
                  </tr>
                  <tr>
                    <td className="num-mono" style={{ fontWeight: 700 }}>3026 – 3027</td>
                    <td>Average Line-to-Line Voltage (VLL)</td>
                    <td className="num-mono">Float32</td>
                    <td className="num-mono" style={{ color: '#06b6d4' }}>
                      {voltageBrownout ? '0x43A0 / 0x4000' : '0x43CA / 0x999A'}
                    </td>
                    <td className="num-mono" style={{ fontWeight: 800, color: voltageBrownout ? '#f59e0b' : '#10b981' }}>
                      {voltageBrownout ? '320.5 V (BROWNOUT)' : '405.2 V'}
                    </td>
                    <td><span className={`ww-badge ${voltageBrownout ? 'ww-badge-warning' : 'ww-badge-live'}`}>{voltageBrownout ? 'UNDERVOLTAGE' : 'GOOD'}</span></td>
                  </tr>
                  <tr>
                    <td className="num-mono" style={{ fontWeight: 700 }}>3060 – 3061</td>
                    <td>Total 3-Phase Active Power (kW)</td>
                    <td className="num-mono">Float32</td>
                    <td className="num-mono" style={{ color: '#06b6d4' }}>0x4454 / 0x999A</td>
                    <td className="num-mono" style={{ fontWeight: 800, color: '#10b981' }}>
                      {frequencySagActive ? '0.0 kW (ISLANDED)' : '850.4 kW'}
                    </td>
                    <td><span className="ww-badge ww-badge-live">GOOD</span></td>
                  </tr>
                  <tr>
                    <td className="num-mono" style={{ fontWeight: 700 }}>3084 – 3085</td>
                    <td>Total Power Factor (cos φ)</td>
                    <td className="num-mono">Float32</td>
                    <td className="num-mono" style={{ color: '#06b6d4' }}>0x3F70 / 0xA3D7</td>
                    <td className="num-mono" style={{ fontWeight: 800, color: '#10b981' }}>0.94 PF</td>
                    <td><span className="ww-badge ww-badge-live">ZERO PENALTY</span></td>
                  </tr>
                  <tr>
                    <td className="num-mono" style={{ fontWeight: 700 }}>3110 – 3111</td>
                    <td>Grid Feeder Frequency (Hz)</td>
                    <td className="num-mono">Float32</td>
                    <td className="num-mono" style={{ color: '#06b6d4' }}>
                      {frequencySagActive ? '0x4240 / 0x7AE1' : '0x4248 / 0x147B'}
                    </td>
                    <td className="num-mono" style={{
                      fontWeight: 800,
                      color: frequencySagActive ? '#f43f5e' : '#10b981',
                    }}>
                      {frequencySagActive ? '48.12 Hz (COLLAPSE)' : '50.02 Hz'}
                    </td>
                    <td>
                      <span className={`ww-badge ${frequencySagActive ? 'ww-badge-critical' : 'ww-badge-live'}`}>
                        {frequencySagActive ? 'TRIP THRESHOLD' : 'GOOD'}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: SUBSTATION FAULT INJECTION CONSOLE                                   */}
      {/* ========================================================================= */}
      {activeTab === 'FAULT_INJECTION' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
          {/* Card 1: Grid Frequency Sag */}
          <div className="ww-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>
                WAPDA 11kV Feeder Frequency Sag
              </div>
              <span className={`ww-badge ${frequencySagActive ? 'ww-badge-critical' : 'ww-badge-live'}`}>
                {frequencySagActive ? 'ACTIVE ANOMALY' : 'NORMAL'}
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>
              Simulates localized grid tripping precursor where frequency drops below 48.5 Hz. Verifies that SwiftSwitch autonomous transfer arms within 10ms.
            </p>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <button
                onClick={handleToggleFrequencySag}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: frequencySagActive ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                  border: `1px solid ${frequencySagActive ? '#10b981' : '#f43f5e'}`,
                  color: frequencySagActive ? '#10b981' : '#f43f5e',
                  padding: '8px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <AlertTriangle size={14} />
                <span>{frequencySagActive ? 'Restore 50.0 Hz Grid' : 'Inject Sag (<48.5 Hz)'}</span>
              </button>
            </div>
          </div>

          {/* Card 2: Software Polarity Inversion */}
          <div className="ww-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>
                Phase B Rogowski Polarity Reversal
              </div>
              <span className={`ww-badge ${polarityBReversed ? 'ww-badge-warning' : 'ww-badge-live'}`}>
                {polarityBReversed ? 'REVERSED CT' : 'INVERTED (NORMAL)'}
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>
              Emulates a physical backwards clamp on Phase B causing negative active power (-kW). Tests DSP coil 0x05 software polarity inversion.
            </p>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <button
                onClick={handleInvertPolarity}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: 'rgba(6, 182, 212, 0.2)',
                  border: '1px solid #06b6d4',
                  color: '#06b6d4',
                  padding: '8px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <RotateCw size={14} />
                <span>{polarityBReversed ? 'Apply DSP Software Invert (+kW)' : 'Simulate Reverse Clamp (-kW)'}</span>
              </button>
            </div>
          </div>

          {/* Card 3: SwiftSwitch Contactor Trigger */}
          <div className="ww-card" style={{ padding: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)' }}>
                SwiftSwitch Microsecond ATS Contactor
              </div>
              <span className={`ww-badge ${atsContactorTransferred ? 'ww-badge-live' : 'ww-badge-warning'}`}>
                {atsContactorTransferred ? 'ON GENERATOR' : 'GRID ARMED'}
              </span>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 6 }}>
              Forces Modbus Coil 0x02 to transfer factory load from 11kV grid to 1.2MW Diesel Generator. Benchmarked transfer time: <strong>0.83 ms</strong>.
            </p>
            <div style={{ marginTop: 14, display: 'flex', gap: 8 }}>
              <button
                onClick={handleTriggerATS}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.3), rgba(6, 182, 212, 0.3))',
                  border: '1px solid #10b981',
                  color: '#10b981',
                  padding: '8px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                <Zap size={14} />
                <span>Fire Modbus ATS Pulse (Coil 0x02)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
