import React from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Zap,
  Activity,
  CheckCircle2,
  Clock,
  Shield,
  Info,
} from 'lucide-react';
import { CURRENT_FACILITY } from '../data/controlRoomData';

interface GridForecastViewProps {
  lang?: 'en' | 'ur';
}

export const GridForecastView: React.FC<GridForecastViewProps> = ({ lang = 'en' }) => {
  const modelSignals = [
    { signal: 'Voltage Instability Rate-of-Change (dV/dt)', impact: '+28%', desc: 'Transient voltage sags on 11kV bus over the past 30 minutes.' },
    { signal: 'Feeder Historical Trip Signature', impact: '+21%', desc: 'Monday midday thermal overload pattern on FSD-KHW-04 feeder.' },
    { signal: 'DISCO Scheduled Outage Roster', impact: '+18%', desc: 'FESCO maintenance window scheduled for downstream grid sub-station.' },
    { signal: 'Frequency Jitter & Reactive Drift', impact: '+11%', desc: 'Frequency excursions exceeding 50.05 Hz threshold.' },
    { signal: 'Regional Generation Deficit (NPCC)', impact: '+8%', desc: 'National Power Control Centre load management curtailment bulletin.' },
  ];

  const forecastPoints = [
    { time: 'NOW', prob: 24, status: 'NORMAL', duration: '—' },
    { time: '+15m', prob: 87, status: 'HIGH RISK', duration: '42m (Predicted)' },
    { time: '+30m', prob: 65, status: 'ELEVATED', duration: '25m' },
    { time: '+1h', prob: 42, status: 'MODERATE', duration: '15m' },
    { time: '+3h', prob: 12, status: 'LOW', duration: '—' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              GRID INTELLIGENCE & OUTAGE FORECAST (MODEL 1)
            </h1>
            <span className="ww-badge ww-badge-warning">
              <AlertTriangle size={11} /> HIGH RISK (14:37 PKT)
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Feeder: <b style={{ color: 'var(--text-primary)' }}>{CURRENT_FACILITY.feederCode}</b> · Calibrated with CalibratedClassifierCV
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="num-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Model Precision: <b style={{ color: 'var(--operational-green)' }}>94.2%</b> · Recall: <b style={{ color: 'var(--operational-green)' }}>91.8%</b>
          </span>
        </div>
      </div>

      {/* Hero Outage Forecast Timeline: Continuous Field */}
      <div className="ww-card">
        <div className="ww-card-header">
          <span className="ww-card-title">
            <Clock size={13} color="var(--energy-amber)" />
            Continuous Outage Risk Field (Next 3 Hours)
          </span>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--energy-amber)' }}>
            Peak Risk: 14:37 PKT (87% Probability)
          </span>
        </div>
        <div className="ww-card-body" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
            {forecastPoints.map((pt, idx) => (
              <div
                key={idx}
                style={{
                  backgroundColor: pt.prob > 70 ? 'rgba(216, 155, 36, 0.12)' : 'var(--bg-surface-elevated)',
                  border: '1px solid',
                  borderColor: pt.prob > 70 ? 'var(--energy-amber)' : 'var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 12,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="num-mono" style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {pt.time}
                  </span>
                  <span className={`ww-badge ww-badge-${pt.prob > 70 ? 'warning' : pt.prob > 40 ? 'blue' : 'live'}`} style={{ fontSize: 8.5 }}>
                    {pt.status}
                  </span>
                </div>
                <div className="num-mono" style={{ fontSize: 24, fontWeight: 800, color: pt.prob > 70 ? 'var(--energy-amber)' : 'var(--text-primary)', marginTop: 4 }}>
                  {pt.prob}%
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                  Duration: {pt.duration}
                </div>
              </div>
            ))}
          </div>

          {/* Continuous Gradient Indicator */}
          <div style={{ marginTop: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10.5, color: 'var(--text-tertiary)', marginBottom: 4 }}>
              <span>NOW (10:52 PKT)</span>
              <span style={{ color: 'var(--energy-amber)', fontWeight: 600 }}>14:37 (Peak Collapse Zone)</span>
              <span>18:00 PKT</span>
            </div>
            <div
              style={{
                height: 8,
                borderRadius: 4,
                background: 'linear-gradient(90deg, #27845A 0%, #27845A 20%, #D89B24 45%, #C7473D 52%, #D89B24 65%, #27845A 100%)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Grid Telemetry Waveform Past 24h & Next 24h */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(380px, 1.4fr) minmax(320px, 1fr)', gap: 14 }}>
        {/* Past 24h vs Next 24h Electrical Health */}
        <div className="ww-card">
          <div className="ww-card-header">
            <span className="ww-card-title">
              <Activity size={13} color="var(--industrial-blue-light)" />
              24-Hour Telemetry Trace (Voltage, Frequency & Load)
            </span>
            <span className="num-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
              100ms Continuous RMS
            </span>
          </div>
          <div className="ww-card-body" style={{ padding: 14 }}>
            <div style={{ height: 160, width: '100%', position: 'relative' }}>
              <svg width="100%" height="100%" viewBox="0 0 500 140" preserveAspectRatio="none">
                {/* Horizontal reference bands */}
                <line x1="0" y1="30" x2="500" y2="30" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="500" y2="70" stroke="var(--border-subtle)" strokeDasharray="3 3" />
                <line x1="0" y1="110" x2="500" y2="110" stroke="var(--border-subtle)" strokeDasharray="3 3" />

                {/* Grid Voltage waveform */}
                <polyline
                  fill="none"
                  stroke="var(--operational-green)"
                  strokeWidth="2"
                  points="0,65 50,68 100,66 150,62 200,70 250,68 300,74 350,95 380,120 400,105 450,72 500,68"
                />

                {/* Frequency trace */}
                <polyline
                  fill="none"
                  stroke="#38bdf8"
                  strokeWidth="1.5"
                  strokeDasharray="4 2"
                  points="0,35 60,34 120,36 180,35 240,38 300,40 350,48 400,42 500,35"
                />
              </svg>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-tertiary)', marginTop: 8 }}>
              <span>-24h (Yesterday)</span>
              <span style={{ color: 'var(--operational-green)' }}>— Voltage (401.8V Nom)</span>
              <span style={{ color: '#38bdf8' }}>--- Frequency (50.02Hz)</span>
              <span style={{ color: 'var(--critical-red)' }}>▼ Sag Zone</span>
              <span>+24h (Forecast)</span>
            </div>
          </div>
        </div>

        {/* 37. AI UX PRINCIPLE: MODEL EXPLANATION (Why?) */}
        <div className="ww-card">
          <div className="ww-card-header">
            <span className="ww-card-title">
              <Zap size={13} color="var(--energy-amber)" />
              Model Explanation (Explainable AI Attribution)
            </span>
            <span className="ww-badge ww-badge-warning">87% RISK</span>
          </div>
          <div className="ww-card-body" style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
              Why does Model 1 believe an outage is imminent on Feeder FSD-KHW-04?
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {modelSignals.map((sig, sIdx) => (
                <div key={sIdx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 8px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)' }}>
                  <div>
                    <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)' }}>
                      {sig.signal}
                    </div>
                    <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>
                      {sig.desc}
                    </div>
                  </div>
                  <div className="num-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--energy-amber)' }}>
                    {sig.impact}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: 'rgba(216, 155, 36, 0.08)', border: '1px solid rgba(216, 155, 36, 0.3)', padding: 8, borderRadius: 'var(--radius-xs)', fontSize: 11, color: 'var(--text-secondary)' }}>
              <b>Action Taken:</b> SwiftSwitch pre-warmed generator and confirmed 8ms transfer readiness.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
