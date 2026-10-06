import React, { useState, useEffect } from 'react';
import { Zap, Play, RotateCcw, ShieldCheck, AlertOctagon, CheckCircle2, ArrowRight, Clock, BatteryCharging, PowerOff } from 'lucide-react';
import { Factory, SwiftSwitchState } from '../types';
import { industrialAudio } from '../services/soundEffects';

interface SwiftSwitchSimulatorProps {
  factory: Factory;
  swiftSwitch: SwiftSwitchState;
  onUpdateState: (newState: Partial<SwiftSwitchState>) => void;
  lang: 'en' | 'ur';
}

export const SwiftSwitchSimulator: React.FC<SwiftSwitchSimulatorProps> = ({
  factory,
  swiftSwitch,
  onUpdateState,
  lang,
}) => {
  const [simulationActive, setSimulationActive] = useState(false);
  const [phase, setPhase] = useState<'IDLE' | 'SAG_DETECTED' | 'PRE_IGNITION' | 'SEAMLESS_TRANSFER' | 'ISLANDED_DIESEL' | 'GRID_RETURN_10S' | 'GRID_RESTORED'>('IDLE');
  const [countdown, setCountdown] = useState(12);
  const [voltageCheckTimer, setVoltageCheckTimer] = useState(10);
  const [logMessages, setLogMessages] = useState<string[]>([
    'System standby: WattBrain listening on RS-485 Modbus CT nodes and WAPDA feeder telemetry.',
    'Grid parameter nominal: 404.8V AC, 50.01 Hz, THD 2.8%.',
  ]);

  const addLog = (msg: string) => {
    const time = new Date().toLocaleTimeString();
    setLogMessages(prev => [`[${time}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const handleStartSimulation = () => {
    setSimulationActive(true);
    setPhase('SAG_DETECTED');
    setCountdown(12);
    industrialAudio.playPreSwitchAlert();
    addLog('CRITICAL: WAPDA Feeder frequency sagged from 50.0Hz to 48.91Hz. GOP Model confidence: 92.4%!');
    onUpdateState({
      status: 'OUTAGE_PREDICTED',
      countdownSeconds: 12,
      confidenceScore: 0.92,
    });
  };

  const handleReset = () => {
    setSimulationActive(false);
    setPhase('IDLE');
    setCountdown(12);
    setVoltageCheckTimer(10);
    onUpdateState({
      status: 'MONITORING_GRID',
      countdownSeconds: 0,
      preShedNonCritical: false,
      protectedVatsLocked: true,
    });
    addLog('Simulation reset: Returned to normal WAPDA grid monitoring.');
    industrialAudio.playSuccessChime();
  };

  // State machine runner
  useEffect(() => {
    if (!simulationActive) return;

    let timer: ReturnType<typeof setTimeout>;

    if (phase === 'SAG_DETECTED') {
      timer = setTimeout(() => {
        setPhase('PRE_IGNITION');
        industrialAudio.playPreSwitchAlert();
        addLog('SWIFTSWITCH™ TRIGGER: Starting Cummins 1250kVA generator cold at T-8 seconds prior to grid blackout.');
        onUpdateState({ status: 'WARMING_GENERATOR', countdownSeconds: 8 });
      }, 2000);
    } else if (phase === 'PRE_IGNITION') {
      timer = setTimeout(() => {
        setPhase('SEAMLESS_TRANSFER');
        industrialAudio.playRelayClick();
        addLog('ATS PRE-EMPTIVE ENGAGEMENT: Digital relays activated! Non-critical HVAC & secondary compressors shed (-91.4 kW).');
        addLog('PROTECTED PROCESS MID-CYCLE LOCK: Fong’s Dyeing Vats & Bruckner Stenter secured with uninterrupted power.');
        onUpdateState({
          status: 'SEAMLESS_TRANSFER',
          preShedNonCritical: true,
          protectedVatsLocked: true,
          transferDurationMs: 8,
        });
      }, 3000);
    } else if (phase === 'SEAMLESS_TRANSFER') {
      timer = setTimeout(() => {
        setPhase('ISLANDED_DIESEL');
        industrialAudio.playSuccessChime();
        addLog('SUCCESS: WAPDA grid completely dropped at 11:00:00. Factory experienced ZERO RPM drop on looms and zero dye batch ruin!');
        onUpdateState({
          status: 'ISLANDED_GENERATOR',
        });
      }, 2500);
    }

    return () => clearTimeout(timer);
  }, [simulationActive, phase]);

  // Grid return simulation
  const handleSimulateGridReturn = () => {
    setPhase('GRID_RETURN_10S');
    setVoltageCheckTimer(10);
    addLog('GRID RETURN DETECTED: WAPDA 11kV voltage returned. Initiating mandatory 10-second voltage stability verification check...');
    onUpdateState({ status: 'GRID_RETURN_VERIFYING' });

    let count = 10;
    const interval = setInterval(() => {
      count -= 1;
      setVoltageCheckTimer(count);
      if (count <= 0) {
        clearInterval(interval);
        industrialAudio.playRelayClick();
        setPhase('GRID_RESTORED');
        addLog('GRID STABILITY VERIFIED: 10s check passed (>400V, 50.0Hz). Seamlessly transferred factory back to WAPDA grid! Generator idling cool down.');
        onUpdateState({
          status: 'MONITORING_GRID',
          preShedNonCritical: false,
        });
        industrialAudio.playSuccessChime();
      }
    }, 800);
  };

  return (
    <div className="glass-panel highlight-emerald">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Zap size={22} style={{ color: 'var(--emerald-neon)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {lang === 'ur' ? 'سوئفٹ سوئچ™ خودکار پیشگی سوئچنگ سمیلیٹر' : 'SwiftSwitch™ Pre-Emptive Automation Engine'}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            {lang === 'ur'
              ? 'بجلی جانے سے 8 تا 12 سیکنڈ قبل جنریٹر اسٹارٹ اور اے ٹی ایس سوئچ اوور — گرڈ گرنے سے پہلے، بعد میں نہیں'
              : 'Triggers generator switchover 8–12 seconds BEFORE predicted load shedding — before the grid drops, not after.'}
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          {phase === 'IDLE' && (
            <button
              onClick={handleStartSimulation}
              className="btn btn-primary"
              style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #e11d48 100%)' }}
            >
              <Play size={16} /> Simulate Impending WAPDA Grid Trip
            </button>
          )}

          {phase === 'ISLANDED_DIESEL' && (
            <button onClick={handleSimulateGridReturn} className="btn btn-primary">
              <CheckCircle2 size={16} /> Simulate WAPDA Grid Return & 10s Verification
            </button>
          )}

          {(phase !== 'IDLE' && phase !== 'GRID_RETURN_10S') && (
            <button onClick={handleReset} className="btn btn-outline">
              <RotateCcw size={16} /> Reset Engine
            </button>
          )}
        </div>
      </div>

      {/* Visual Live State Sequence */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '20px' }}>
        {/* Step 1 */}
        <div style={{
          background: phase === 'IDLE' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 41, 59, 0.4)',
          border: phase === 'IDLE' ? '1px solid var(--emerald-neon)' : '1px solid var(--border-subtle)',
          padding: '14px',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>STAGE 1 • 24/7 SENSING</div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginTop: '4px' }}>WAPDA Grid Normal</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald-neon)', marginTop: '4px' }}>405V • 50.01 Hz</div>
        </div>

        {/* Step 2 */}
        <div style={{
          background: phase === 'SAG_DETECTED' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(30, 41, 59, 0.4)',
          border: phase === 'SAG_DETECTED' ? '1px solid var(--amber-neon)' : '1px solid var(--border-subtle)',
          padding: '14px',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>STAGE 2 • T - 12 SECONDS</div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginTop: '4px' }}>Grid Frequency Sag</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--amber-neon)', marginTop: '4px' }}>48.91 Hz • GOP 92% Conf</div>
        </div>

        {/* Step 3 */}
        <div style={{
          background: phase === 'PRE_IGNITION' ? 'rgba(244, 63, 94, 0.2)' : 'rgba(30, 41, 59, 0.4)',
          border: phase === 'PRE_IGNITION' ? '1px solid var(--rose-neon)' : '1px solid var(--border-subtle)',
          padding: '14px',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>STAGE 3 • T - 8 SECONDS</div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginTop: '4px' }}>Pre-Emptive Generator Start</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--rose-neon)', marginTop: '4px' }}>Cummins 1250kVA Spun Up</div>
        </div>

        {/* Step 4 */}
        <div style={{
          background: (phase === 'SEAMLESS_TRANSFER' || phase === 'ISLANDED_DIESEL') ? 'rgba(16, 185, 129, 0.2)' : 'rgba(30, 41, 59, 0.4)',
          border: (phase === 'SEAMLESS_TRANSFER' || phase === 'ISLANDED_DIESEL') ? '1px solid var(--emerald-neon)' : '1px solid var(--border-subtle)',
          padding: '14px',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>STAGE 4 • SEAMLESS ATS</div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginTop: '4px' }}>Zero-Flicker Transfer</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--emerald-neon)', marginTop: '4px' }}>8ms Transfer • Vats Locked</div>
        </div>

        {/* Step 5 */}
        <div style={{
          background: (phase === 'GRID_RETURN_10S' || phase === 'GRID_RESTORED') ? 'rgba(6, 182, 212, 0.2)' : 'rgba(30, 41, 59, 0.4)',
          border: (phase === 'GRID_RETURN_10S' || phase === 'GRID_RESTORED') ? '1px solid var(--cyan-neon)' : '1px solid var(--border-subtle)',
          padding: '14px',
          borderRadius: '8px',
        }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontWeight: 700 }}>STAGE 5 • RETURN PROTOCOL</div>
          <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginTop: '4px' }}>10s Anti-Hunting Check</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--cyan-neon)', marginTop: '4px' }}>
            {phase === 'GRID_RETURN_10S' ? `Verifying: ${voltageCheckTimer}s left` : 'Grid Stability Locked'}
          </div>
        </div>
      </div>

      {/* Side-by-side: The Unforgiving Reality in Pakistan */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '16px', marginTop: '20px' }}>
        {/* Conventional Pakistan Mill */}
        <div style={{ background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.25)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--rose-neon)', fontWeight: 800, fontSize: '0.9rem' }}>
            <AlertOctagon size={18} /> Traditional Method: Manual Chowkidar Switching
          </div>
          <ul style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '18px' }}>
            <li><strong style={{ color: '#fff' }}>3–15 minute blackout lag:</strong> Chowkidar runs to generator room after seeing factory lights off.</li>
            <li><strong style={{ color: '#fff' }}>Irreversible Textile Damage:</strong> 40+ yarn thread breaks on rapier/airjet looms, knot defects, rejected fabric.</li>
            <li><strong style={{ color: '#fff' }}>Ruined Dyeing Lots:</strong> Dyeing vats lose pressure mid-cycle, costing Rs. 280,000–450,000 in batch rejections.</li>
            <li><strong style={{ color: '#fff' }}>Blind Diesel Burning:</strong> Generator runs at full fuel burn rate even when sections are idle.</li>
          </ul>
        </div>

        {/* WattWise AI SwiftSwitch */}
        <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald-neon)', fontWeight: 800, fontSize: '0.9rem' }}>
            <ShieldCheck size={18} /> WattWise™ AI SwiftSwitch™ Pre-Emptive Automation
          </div>
          <ul style={{ marginTop: '10px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.8, paddingLeft: '18px' }}>
            <li><strong style={{ color: '#fff' }}>8–12 second pre-emptive ignition:</strong> Generator starts before WAPDA feeder trips, eliminating cold warm-up lag.</li>
            <li><strong style={{ color: '#fff' }}>Zero-Flicker Synchronized ATS:</strong> Seamless 8-millisecond switchover with zero spindle/loom speed interruption.</li>
            <li><strong style={{ color: '#fff' }}>Protected Process Mid-Cycle Lock:</strong> Dyeing vessels & stenters are protected mid-cycle regardless of grid instability.</li>
            <li><strong style={{ color: '#fff' }}>Auto-Load Shedding (-91.4 kW):</strong> HVAC & auxiliary compressors auto-shed, saving Rs. 24,000–48,000/hr in wasted diesel.</li>
          </ul>
        </div>
      </div>

      {/* Live Edge Telemetry Log Console */}
      <div style={{ marginTop: '20px', background: '#080c16', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '12px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '6px' }}>
          <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--emerald-neon)', fontWeight: 700 }}>
            WATTBRAIN™ EDGE CONTROLLER AUDIT LOG (ONNX INFERENCE + RELAY BUS)
          </span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
            BUFFER: 72H SQLITE ACTIVE
          </span>
        </div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-muted)', maxHeight: '120px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {logMessages.map((log, idx) => (
            <div key={idx} style={{ color: log.includes('CRITICAL') ? 'var(--rose-neon)' : log.includes('SUCCESS') ? 'var(--emerald-neon)' : log.includes('SWIFTSWITCH') ? 'var(--amber-neon)' : 'inherit' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
