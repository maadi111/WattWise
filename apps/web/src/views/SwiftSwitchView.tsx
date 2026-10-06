import React, { useState, useEffect } from 'react';
import {
  Shield,
  Zap,
  Play,
  RotateCcw,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { CURRENT_FACILITY } from '../data/controlRoomData';

interface SwiftSwitchViewProps {
  lang?: 'en' | 'ur';
}

export const SwiftSwitchView: React.FC<SwiftSwitchViewProps> = ({ lang = 'en' }) => {
  const [simulationActive, setSimulationActive] = useState(false);
  const [simStep, setSimStep] = useState(0);

  const simulationSteps = [
    { label: 'Normal Grid State', time: 'T - 15.0s', desc: 'Grid 401.8V, 50.02Hz stable. Generator pre-warmed on standby.' },
    { label: 'Harmonic Jitter & Sag Detected', time: 'T - 12.0s', desc: 'Model 1 (XGBoost) flags feeder instability. Probability ramps to 87%.' },
    { label: 'Generator Crank & Ignition', time: 'T - 8.0s', desc: 'Relay 01 pulses starter motor. Caterpillar C32 engine accelerates to 1500 RPM.' },
    { label: 'Non-Critical Loads Shed', time: 'T - 4.0s', desc: 'Warehouse HVAC & secondary compressor shed via Modbus coils. 91.4 kW relieved.' },
    { label: 'Pre-Emptive ATS Transfer (8ms)', time: 'T - 0.008s', desc: 'Vacuum circuit breaker shifts bus to synchronized generator before collapse.' },
    { label: 'Grid Collapse (0V / 0Hz)', time: 'T + 0.0s', desc: 'FESCO 11kV Feeder collapses completely. Zero factory looms interrupted!' },
    { label: 'Generator Steady Supply', time: 'T + 10.0s', desc: 'Factory running at 2.45 MW clean power. Thread break counter: 0.' },
    { label: 'Grid Recovery & Anti-Hunting Return', time: 'T + 45.0s', desc: 'Grid voltage monitored for 300s stability before bump-less return.' },
  ];

  // Simulation timer loop
  useEffect(() => {
    let timer: any;
    if (simulationActive) {
      timer = setInterval(() => {
        setSimStep((prev) => {
          if (prev >= simulationSteps.length - 1) {
            setSimulationActive(false);
            return prev;
          }
          return prev + 1;
        });
      }, 1800);
    }
    return () => clearInterval(timer);
  }, [simulationActive, simulationSteps.length]);

  const startSimulation = () => {
    setSimStep(0);
    setSimulationActive(true);
  };

  const resetSimulation = () => {
    setSimulationActive(false);
    setSimStep(0);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              SWIFTSWITCH™ PRE-EMPTIVE POWER TRANSFER
            </h1>
            <span className="ww-badge ww-badge-warning" style={{ fontSize: 11, padding: '3px 8px' }}>
              <Shield size={12} /> ARMED (STANDBY)
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            8-Second Ahead Outage Prediction & Sub-Cycle ATS Actuation · {CURRENT_FACILITY.name} ({CURRENT_FACILITY.unit})
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={startSimulation}
            disabled={simulationActive}
            className="ww-btn ww-btn-amber"
          >
            <Play size={14} /> {simulationActive ? 'Running Simulation...' : 'RUN SWIFTSWITCH SIMULATION'}
          </button>
          {simStep > 0 && !simulationActive && (
            <button onClick={resetSimulation} className="ww-btn ww-btn-secondary">
              <RotateCcw size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Visual: Horizontal Timeline demonstrating action BEFORE outage */}
      <div className="ww-card">
        <div className="ww-card-header">
          <span className="ww-card-title">
            <Clock size={13} color="var(--energy-amber)" />
            Pre-Emptive Actuation Sequence (Acts BEFORE Grid Collapses)
          </span>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
            Patent-Pending Sub-Cycle Logic
          </span>
        </div>
        <div className="ww-card-body" style={{ padding: '20px 18px', overflowX: 'auto' }}>
          <div style={{ minWidth: 800, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {/* Timeline horizontal background bar */}
            <div
              style={{
                position: 'absolute',
                top: 24,
                left: 40,
                right: 40,
                height: 3,
                backgroundColor: 'var(--border-strong)',
                zIndex: 1,
              }}
            >
              {/* Highlight bar up to current simulation step */}
              <div
                style={{
                  height: '100%',
                  width: `${(simStep / (simulationSteps.length - 1)) * 100}%`,
                  backgroundColor: 'var(--energy-amber)',
                  transition: 'width 0.4s ease',
                }}
              />
            </div>

            {/* Step 1: T - 12.0s */}
            <div style={{ zIndex: 2, textAlign: 'center', width: 140 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: simStep >= 1 ? 'var(--energy-amber)' : 'var(--bg-surface-elevated)',
                  border: '2px solid var(--energy-amber)',
                  color: simStep >= 1 ? '#0D1113' : 'var(--energy-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                1
              </div>
              <div className="num-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--energy-amber)', marginTop: 8 }}>
                T - 12.0s
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                Grid Instability
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>
                Harmonic sag flagged
              </div>
            </div>

            {/* Step 2: T - 8.0s */}
            <div style={{ zIndex: 2, textAlign: 'center', width: 140 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: simStep >= 2 ? 'var(--energy-amber)' : 'var(--bg-surface-elevated)',
                  border: '2px solid var(--energy-amber)',
                  color: simStep >= 2 ? '#0D1113' : 'var(--energy-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                2
              </div>
              <div className="num-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--energy-amber)', marginTop: 8 }}>
                T - 8.0s
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                Generator Ignition
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>
                Relay 01 crank pulse
              </div>
            </div>

            {/* Step 3: T - 4.0s */}
            <div style={{ zIndex: 2, textAlign: 'center', width: 140 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: simStep >= 3 ? 'var(--energy-amber)' : 'var(--bg-surface-elevated)',
                  border: '2px solid var(--energy-amber)',
                  color: simStep >= 3 ? '#0D1113' : 'var(--energy-amber)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                3
              </div>
              <div className="num-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--energy-amber)', marginTop: 8 }}>
                T - 4.0s
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', marginTop: 2 }}>
                Load Shedding
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>
                Non-critical shed (91kW)
              </div>
            </div>

            {/* Step 4: T - 0.008s */}
            <div style={{ zIndex: 2, textAlign: 'center', width: 150 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  backgroundColor: simStep >= 4 ? 'var(--operational-green)' : 'var(--bg-surface-elevated)',
                  border: '2px solid var(--operational-green)',
                  color: simStep >= 4 ? '#FFFFFF' : 'var(--operational-green)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  fontWeight: 800,
                  fontSize: 11,
                }}
              >
                ATS
              </div>
              <div className="num-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--operational-green)', marginTop: 6 }}>
                T - 0.008s
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--operational-green)', marginTop: 2 }}>
                ATS Transfer (8ms)
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>
                Sub-cycle transfer
              </div>
            </div>

            {/* Step 5: T + 0.0s */}
            <div style={{ zIndex: 2, textAlign: 'center', width: 140 }}>
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  backgroundColor: simStep >= 5 ? 'var(--critical-red)' : 'var(--bg-surface-elevated)',
                  border: '2px solid var(--critical-red)',
                  color: simStep >= 5 ? '#FFFFFF' : 'var(--critical-red)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto',
                  fontWeight: 700,
                  fontSize: 11,
                }}
              >
                0s
              </div>
              <div className="num-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--critical-red)', marginTop: 8 }}>
                T + 0.0s
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--critical-red)', marginTop: 2 }}>
                Grid Collapse
              </div>
              <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>
                0 interruption observed
              </div>
            </div>
          </div>

          {/* Simulation Status readout */}
          {simulationActive && (
            <div style={{ marginTop: 20, padding: 12, backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--energy-amber)', borderRadius: 'var(--radius-xs)', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div className="ww-pulse-amber" />
              <div>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--energy-amber)' }}>
                  SIMULATION ACTIVE: {simulationSteps[simStep].label} ({simulationSteps[simStep].time})
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-primary)', marginTop: 2 }}>
                  {simulationSteps[simStep].desc}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid State & Outage Prediction Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12 }}>
        {/* Live Power State */}
        <div className="ww-card">
          <div className="ww-card-header">
            <span className="ww-card-title">
              <Zap size={13} color="var(--operational-green)" /> Live Power Bus State
            </span>
            <span className="ww-badge ww-badge-live">SYNCHRONIZED</span>
          </div>
          <div className="ww-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Grid Incoming</span>
              <span className="num-mono" style={{ fontWeight: 700, color: 'var(--operational-green)' }}>
                401.8 V · 50.02 Hz
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Generator Auxiliary</span>
              <span className="num-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                STANDBY (58°C Block Heat)
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Automatic Transfer Switch (ATS)</span>
              <span className="num-mono" style={{ fontWeight: 700, color: 'var(--industrial-blue-light)' }}>
                GRID BUS (ARMED FOR AUTO)
              </span>
            </div>
          </div>
        </div>

        {/* Prediction Card */}
        <div className="ww-card">
          <div className="ww-card-header">
            <span className="ww-card-title">
              <AlertTriangle size={13} color="var(--energy-amber)" /> Grid Outage Prediction (Model 1)
            </span>
            <span className="ww-badge ww-badge-warning">87% RISK</span>
          </div>
          <div className="ww-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
              <span className="num-mono" style={{ fontSize: 28, fontWeight: 800, color: 'var(--energy-amber)' }}>
                87%
              </span>
              <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Confidence: <b>High (Calibrated XGBoost)</b>
              </span>
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-primary)' }}>
              Estimated event time: <b className="num-mono">14:37 PKT</b> (in 09m 42s)
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', backgroundColor: 'var(--bg-surface-elevated)', padding: 8, borderRadius: 'var(--radius-xs)' }}>
              Pre-ignition pulse will trigger at <b>14:36:52 PKT</b> if voltage gradient continues to degrade.
            </div>
          </div>
        </div>

        {/* Simulation Outcome Metrics */}
        <div className="ww-card">
          <div className="ww-card-header">
            <span className="ww-card-title">
              <Shield size={13} color="var(--operational-green)" /> Avoided Downtime Metrics
            </span>
            <span className="num-mono" style={{ fontSize: 10, color: 'var(--operational-green)' }}>PROTECTED</span>
          </div>
          <div className="ww-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>BLACKOUT DURATION</span>
              <span className="num-mono" style={{ fontSize: 16, fontWeight: 800, color: 'var(--operational-green)' }}>
                0.008 sec (8ms)
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>PRODUCTION INTERRUPTION</span>
              <span className="num-mono" style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
                0 LOOMS
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>ESTIMATED LOSS AVOIDED</span>
              <span className="num-mono" style={{ fontSize: 16, fontWeight: 800, color: 'var(--operational-green)' }}>
                Rs. 450,000
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Automation Actions Table */}
      <div className="ww-card">
        <div className="ww-card-header">
          <span className="ww-card-title">
            <Cpu size={13} color="var(--industrial-blue-light)" />
            SwiftSwitch Automation Action Matrix
          </span>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
            Hardware Controller: WattBrain WB-04
          </span>
        </div>
        <div className="ww-table-container">
          <table className="ww-table">
            <thead>
              <tr>
                <th>Automation Sequence</th>
                <th>Target Mechanism</th>
                <th>Timing Offset</th>
                <th>Current Status</th>
                <th>Fail-Safe Mode</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ fontWeight: 600 }}>Generator Pre-Start</td>
                <td>Relay 01 (Dry Contact to Caterpillar ECM)</td>
                <td className="num-mono">T - 8.0s</td>
                <td><span className="ww-badge ww-badge-warning">ARMED</span></td>
                <td>BCM2835 Hardware Watchdog Active</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Non-Critical Load Shedding</td>
                <td>Modbus Coil Write to PCC-04 Aux Panel</td>
                <td className="num-mono">T - 4.0s</td>
                <td><span className="ww-badge ww-badge-warning">ARMED</span></td>
                <td>Automatic Re-engage on Grid Restoration</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Protected Process Lock</td>
                <td>Thies Dyeing Vat #03 & Monforts Stenter #02</td>
                <td className="num-mono">Continuous</td>
                <td><span className="ww-badge ww-badge-live">ACTIVE</span></td>
                <td>Priority 1 Non-Sheddable Guarantee</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>ATS Sub-Cycle Transfer</td>
                <td>Vacuum Circuit Breaker (VCB) Actuator</td>
                <td className="num-mono">T - 0.008s</td>
                <td><span className="ww-badge ww-badge-warning">ARMED</span></td>
                <td>Mechanical Interlock Against Cross-Feed</td>
              </tr>
              <tr>
                <td style={{ fontWeight: 600 }}>Anti-Hunting Return</td>
                <td>Grid Quality Monitor (300s Validation Window)</td>
                <td className="num-mono">T + 300s</td>
                <td><span className="ww-badge ww-badge-warning">ARMED</span></td>
                <td>Prevents Rapid Cycling on Unstable Return</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
