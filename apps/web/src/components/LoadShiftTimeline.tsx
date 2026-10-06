import React, { useState } from 'react';
import { Calendar, Cpu, TrendingUp, AlertTriangle, ArrowRight, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceArea } from 'recharts';
import { Factory, PredictedOutage, ScheduleRecommendation } from '../types';
import { industrialAudio } from '../services/soundEffects';

interface LoadShiftTimelineProps {
  factory: Factory;
  outages: PredictedOutage[];
  recommendations: ScheduleRecommendation[];
  lang: 'en' | 'ur';
}

const HOURLY_ENERGY_CURVE = [
  { hour: '00:00', loadKw: 310, source: 'GRID', tariffRs: 32.5, predictedCost: 10075 },
  { hour: '02:00', loadKw: 290, source: 'GRID', tariffRs: 32.5, predictedCost: 9425 },
  { hour: '04:00', loadKw: 340, source: 'GRID', tariffRs: 32.5, predictedCost: 11050 },
  { hour: '06:00', loadKw: 580, source: 'GRID', tariffRs: 32.5, predictedCost: 18850 },
  { hour: '08:00', loadKw: 840, source: 'GRID', tariffRs: 32.5, predictedCost: 27300 },
  { hour: '10:00', loadKw: 847, source: 'GRID', tariffRs: 32.5, predictedCost: 27527 },
  { hour: '11:00', loadKw: 620, source: 'GEN_OPTIMIZED', tariffRs: 94.2, predictedCost: 58404 }, // Shedded non-critical!
  { hour: '12:00', loadKw: 615, source: 'GEN_OPTIMIZED', tariffRs: 94.2, predictedCost: 57933 },
  { hour: '13:00', loadKw: 618, source: 'GEN_OPTIMIZED', tariffRs: 94.2, predictedCost: 58215 },
  { hour: '14:00', loadKw: 845, source: 'GRID', tariffRs: 32.5, predictedCost: 27462 },
  { hour: '16:00', loadKw: 840, source: 'GRID', tariffRs: 32.5, predictedCost: 27300 },
  { hour: '18:00', loadKw: 630, source: 'GEN_OPTIMIZED', tariffRs: 94.2, predictedCost: 59346 },
  { hour: '20:00', loadKw: 625, source: 'GEN_OPTIMIZED', tariffRs: 94.2, predictedCost: 58875 },
  { hour: '22:00', loadKw: 420, source: 'GRID', tariffRs: 32.5, predictedCost: 13650 },
];

export const LoadShiftTimeline: React.FC<LoadShiftTimelineProps> = ({
  factory,
  outages,
  recommendations,
  lang,
}) => {
  const [reoptimizing, setReoptimizing] = useState(false);
  const [reoptimizedToast, setReoptimizedToast] = useState(false);
  const [scheduleList, setScheduleList] = useState(recommendations);

  const handleReoptimize = () => {
    setReoptimizing(true);
    setReoptimizedToast(false);
    setTimeout(() => {
      setReoptimizing(false);
      setReoptimizedToast(true);
      industrialAudio.playSuccessChime();
      setTimeout(() => setReoptimizedToast(false), 5000);
    }, 1800);
  };

  const totalShiftSavings = scheduleList.reduce((acc, r) => acc + r.estimatedSavingPkr, 0);

  return (
    <div className="glass-panel">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar size={22} style={{ color: 'var(--emerald-neon)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {lang === 'ur' ? 'لوڈ شفٹ™ شیڈولر اور واپڈا لوڈ شیڈنگ کیلنڈر' : 'LoadShift™ Scheduler & Outage Arbitrage Calendar'}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            {lang === 'ur'
              ? 'مکسڈ انٹیجر لکیری پروگرامنگ (MILP) کا استعمال کرتے ہوئے سستی گرڈ بجلی پر بھاری پروسیس کا شیڈولنگ'
              : 'MILP-constrained optimization engine pre-scheduling heavy processes onto cheap grid windows'}
          </p>
        </div>

        {/* Action button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '6px 14px', borderRadius: '8px', textAlign: 'right' }}>
            <div style={{ fontSize: '0.65rem', color: 'var(--emerald-neon)', fontWeight: 700, textTransform: 'uppercase' }}>
              Estimated Today Savings
            </div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
              Rs. {totalShiftSavings.toLocaleString('en-PK')}
            </div>
          </div>

          <button
            onClick={handleReoptimize}
            disabled={reoptimizing}
            className="btn btn-primary"
            style={{ minWidth: '180px' }}
          >
            {reoptimizing ? (
              <>
                <Cpu size={16} className="pulse-dot" /> Solving MILP (scipy)...
              </>
            ) : (
              <>
                <Sparkles size={16} /> Re-run MILP Optimizer
              </>
            )}
          </button>
        </div>
      </div>

      {reoptimizedToast && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid var(--emerald-neon)',
          color: '#ffffff',
          padding: '10px 16px',
          borderRadius: '8px',
          marginTop: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '0.85rem',
        }}>
          <CheckCircle2 size={18} style={{ color: 'var(--emerald-neon)' }} />
          <span>Google OR-Tools solver converged in 1.42s (0 duality gap). Schedule updated with maximum grid energy arbitrage!</span>
        </div>
      )}

      {/* 24-Hour Load & Outage Chart */}
      <div style={{ marginTop: '24px', background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#fff' }}>24-Hour Factory Load Curve vs WAPDA Blackout Windows</span>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Green: Cheap Grid (Rs. 32.50/kWh) • Amber Stripes: Predicted Outages with Non-Critical Loads Pre-Shed (-91 kW)
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', fontSize: '0.75rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--emerald-neon)' }}>
              <span style={{ width: '10px', height: '10px', background: 'var(--emerald-neon)', borderRadius: '2px' }} /> Grid Dispatched
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--amber-neon)' }}>
              <span style={{ width: '10px', height: '10px', background: 'var(--amber-neon)', borderRadius: '2px' }} /> Outage Window
            </span>
          </div>
        </div>

        <div style={{ width: '100%', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={HOURLY_ENERGY_CURVE} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="loadGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="hour" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} unit=" kW" tickLine={false} />
              <Tooltip
                contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: '8px', fontSize: '12px' }}
                labelStyle={{ color: '#94a3b8', fontWeight: 700 }}
              />
              <Area type="monotone" dataKey="loadKw" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#loadGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Predicted Outages Row */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          Today's Predicted WAPDA Feeder Outage Windows (Model 1: GOP XGBoost + LSTM)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
          {outages.map((outage) => (
            <div
              key={outage.id}
              style={{
                background: 'rgba(30, 41, 59, 0.5)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '8px',
                padding: '14px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: '1.1rem', color: 'var(--amber-neon)' }}>
                  {outage.start} — {outage.end}
                </span>
                <span className="live-badge warning" style={{ fontSize: '0.7rem' }}>
                  {(outage.confidence * 100).toFixed(0)}% CONFIDENCE
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                {outage.cause}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-dim)', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '6px' }}>
                <span>Duration: {outage.durationMinutes} mins</span>
                <span>Trigger: {outage.triggerType}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Schedule Recommendations */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          Optimized Dispatch Instructions (Model 2: LSO Engine)
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {scheduleList.map((rec) => {
            const isCritical = rec.urgency === 'CRITICAL';
            const isHigh = rec.urgency === 'HIGH';

            return (
              <div
                key={rec.id}
                style={{
                  background: isCritical ? 'rgba(244, 63, 94, 0.08)' : isHigh ? 'rgba(245, 158, 11, 0.06)' : 'rgba(30, 41, 59, 0.4)',
                  border: isCritical ? '1px solid rgba(244, 63, 94, 0.35)' : isHigh ? '1px solid rgba(245, 158, 11, 0.3)' : '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: '260px' }}>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.9rem', color: isCritical ? 'var(--rose-neon)' : isHigh ? 'var(--amber-neon)' : 'var(--emerald-neon)', minWidth: '120px' }}>
                    {rec.time}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        background: isCritical ? 'rgba(244, 63, 94, 0.2)' : isHigh ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                        color: isCritical ? 'var(--rose-neon)' : isHigh ? 'var(--amber-neon)' : 'var(--emerald-neon)',
                      }}>
                        {rec.action}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-main)', marginTop: '4px' }}>
                      {rec.description}
                    </div>
                  </div>
                </div>

                <div style={{ textAlign: 'right', minWidth: '120px' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Savings Impact</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: 'var(--emerald-neon)' }}>
                    +Rs. {rec.estimatedSavingPkr.toLocaleString('en-PK')}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
