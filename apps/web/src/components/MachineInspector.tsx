import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle2, TrendingUp, Zap, Clock, Wrench, Shield, Thermometer, Gauge } from 'lucide-react';
import { MachineDetail } from '../types/ui';

interface MachineInspectorProps {
  machine: MachineDetail | null;
  onClose: () => void;
  lang?: 'en' | 'ur';
}

export const MachineInspector: React.FC<MachineInspectorProps> = ({
  machine,
  onClose,
  lang = 'en',
}) => {
  const [timeframe, setTimeframe] = useState<'5m' | '1h' | '6h' | '24h' | '7d' | '30d'>('1h');
  const [maintenanceCreated, setMaintenanceCreated] = useState(false);

  if (!machine) return null;

  // Mock points for SVG sparkline / signature
  const signaturePoints = [
    36.2, 38.1, 37.9, 41.2, 43.5, 42.8, 44.1, 45.2, 42.8, 41.9, 43.8, 42.8,
  ];
  const maxKw = Math.max(...signaturePoints, 50);
  const minKw = Math.min(...signaturePoints, 30);

  const getPointsSvg = () => {
    const width = 360;
    const height = 90;
    return signaturePoints
      .map((val, idx) => {
        const x = (idx / (signaturePoints.length - 1)) * width;
        const y = height - ((val - minKw) / (maxKw - minKw)) * (height - 20) - 10;
        return `${x},${y}`;
      })
      .join(' ');
  };

  return (
    <div className="ww-drawer-overlay" onClick={onClose}>
      <div className="ww-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="ww-badge ww-badge-live">
                <span className="ww-pulse-green" />
                {machine.status}
              </span>
              {machine.isProtected && (
                <span className="ww-badge ww-badge-blue">
                  <Shield size={11} /> PROTECTED LOAD
                </span>
              )}
            </div>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginTop: 4 }}>
              {machine.name}
            </h2>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {machine.department} · {machine.line} · CODE: {machine.code}
            </div>
          </div>
          <button onClick={onClose} className="ww-btn ww-btn-ghost" style={{ padding: 6 }}>
            <X size={18} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Primary Telemetry Hero */}
          <div style={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              Active Demand
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginTop: 2 }}>
              <span className="num-mono" style={{ fontSize: 36, fontWeight: 800, color: 'var(--text-primary)' }}>
                {machine.currentKw.toFixed(1)}
              </span>
              <span style={{ fontSize: 16, color: 'var(--text-secondary)', fontWeight: 600 }}>kW</span>
              <span style={{ marginLeft: 'auto', fontSize: 12, color: machine.sevenDayTrendPercent > 0 ? 'var(--energy-amber)' : 'var(--operational-green)', display: 'flex', alignItems: 'center', gap: 4 }}>
                <TrendingUp size={14} />
                +{machine.sevenDayTrendPercent}% vs 7d avg
              </span>
            </div>

            {/* Dense 2x3 Electrical Telemetry Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Current</div>
                <div className="num-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {machine.currentAmps.toFixed(1)} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>A</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Voltage</div>
                <div className="num-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {machine.voltageV.toFixed(1)} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>V</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Power Factor</div>
                <div className="num-mono" style={{ fontSize: 14, fontWeight: 600, color: machine.powerFactor < 0.85 ? 'var(--critical-red)' : 'var(--operational-green)' }}>
                  {machine.powerFactor.toFixed(2)}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Frequency</div>
                <div className="num-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {machine.frequencyHz.toFixed(2)} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Hz</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Motor Temp</div>
                <div className="num-mono" style={{ fontSize: 14, fontWeight: 600, color: machine.temperatureC > 70 ? 'var(--energy-amber)' : 'var(--text-primary)' }}>
                  {machine.temperatureC.toFixed(1)} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>°C</span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Utilization</div>
                <div className="num-mono" style={{ fontSize: 14, fontWeight: 600, color: 'var(--operational-green)' }}>
                  {machine.utilizationPercent.toFixed(1)} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Energy Signature Chart */}
          <div className="ww-card">
            <div className="ww-card-header">
              <span className="ww-card-title">
                <Zap size={13} color="var(--energy-amber)" />
                Energy Signature (Telemetry Trace)
              </span>
              <div style={{ display: 'flex', gap: 4 }}>
                {(['5m', '1h', '6h', '24h', '7d', '30d'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTimeframe(t)}
                    style={{
                      padding: '2px 6px',
                      fontSize: 10,
                      fontWeight: 600,
                      borderRadius: 3,
                      border: '1px solid',
                      borderColor: timeframe === t ? 'var(--industrial-blue)' : 'transparent',
                      backgroundColor: timeframe === t ? 'var(--industrial-blue-glow)' : 'transparent',
                      color: timeframe === t ? '#38bdf8' : 'var(--text-tertiary)',
                      cursor: 'pointer',
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div className="ww-card-body" style={{ padding: '12px 14px' }}>
              <div style={{ height: 100, position: 'relative', width: '100%' }}>
                <svg width="100%" height="100%" viewBox="0 0 360 90" preserveAspectRatio="none">
                  {/* Grid lines */}
                  <line x1="0" y1="20" x2="360" y2="20" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                  <line x1="0" y1="50" x2="360" y2="50" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                  <line x1="0" y1="80" x2="360" y2="80" stroke="var(--border-subtle)" strokeDasharray="3 3" />

                  {/* Polyline */}
                  <polyline
                    fill="none"
                    stroke="var(--operational-green)"
                    strokeWidth="2"
                    points={getPointsSvg()}
                  />
                </svg>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>
                <span>-60 mins</span>
                <span>Active: 42.8 kW (Stable)</span>
                <span>Now</span>
              </div>
            </div>
          </div>

          {/* AI Observation Card */}
          {machine.anomalyDetected ? (
            <div style={{ border: '1px solid var(--energy-amber)', backgroundColor: 'var(--energy-amber-bg)', borderRadius: 'var(--radius-sm)', padding: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--energy-amber)', fontWeight: 700, fontSize: 12 }}>
                  <AlertTriangle size={15} />
                  AI OBSERVATION (MODEL 4)
                </div>
                <span className="ww-badge ww-badge-warning">
                  {machine.anomalyDetected.confidence}% CONFIDENCE
                </span>
              </div>

              <p style={{ marginTop: 8, fontSize: 13, color: 'var(--text-primary)', fontWeight: 500, lineHeight: 1.4 }}>
                "{machine.anomalyDetected.description}"
              </p>

              <div style={{ marginTop: 10, fontSize: 11, color: 'var(--text-secondary)' }}>
                <b>Possible cause:</b> {machine.anomalyDetected.possibleCause}
              </div>
              <div style={{ marginTop: 4, fontSize: 11, color: 'var(--text-secondary)' }}>
                <b>Recommended action:</b> {machine.anomalyDetected.recommendation}
              </div>

              <div style={{ marginTop: 14 }}>
                {maintenanceCreated ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--operational-green)', fontSize: 12, fontWeight: 600 }}>
                    <CheckCircle2 size={15} /> Work Order #WO-8429 Created & Dispatched
                  </div>
                ) : (
                  <button
                    onClick={() => setMaintenanceCreated(true)}
                    className="ww-btn ww-btn-amber"
                    style={{ width: '100%' }}
                  >
                    <Wrench size={14} /> Create Maintenance Event
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div style={{ border: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', padding: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
              <CheckCircle2 size={16} color="var(--operational-green)" />
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                Operating within expected energy signature envelope (Isolation Forest anomaly score: 0.12).
              </div>
            </div>
          )}

          {/* Machine Metadata */}
          <div style={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 8, textTransform: 'uppercase' }}>
              Asset Telemetry Configuration
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11 }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>CT Sensor: </span>
                <span className="num-mono" style={{ color: 'var(--text-primary)' }}>WattClamp WC-018 (3-Phase)</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Edge Bus: </span>
                <span className="num-mono" style={{ color: 'var(--text-primary)' }}>RS-485 Modbus RTU #04</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Sampling: </span>
                <span className="num-mono" style={{ color: 'var(--text-primary)' }}>100 ms (10 Hz)</span>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Protected ATS: </span>
                <span style={{ color: 'var(--operational-green)', fontWeight: 600 }}>PRIORITY 1 (ZERO INTERRUPT)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 18px', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-tertiary)' }}>
          <span>Telemetry synchronized via WattBrain WB-04</span>
          <span className="num-mono">LATENCY: 142ms</span>
        </div>
      </div>
    </div>
  );
};
