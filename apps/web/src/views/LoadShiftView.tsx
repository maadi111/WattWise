import React, { useState } from 'react';
import {
  Clock,
  Sparkles,
  TrendingDown,
  Shield,
  Layers,
  CheckCircle2,
  AlertTriangle,
  Play,
  RotateCcw,
  Zap,
} from 'lucide-react';
import { CURRENT_FACILITY } from '../data/controlRoomData';

interface LoadShiftViewProps {
  lang?: 'en' | 'ur';
}

export const LoadShiftView: React.FC<LoadShiftViewProps> = ({ lang = 'en' }) => {
  const [isOptimized, setIsOptimized] = useState(false);
  const [optimizing, setOptimizing] = useState(false);

  const hours = Array.from({ length: 24 }, (_, i) => `${i.toString().padStart(2, '0')}:00`);

  const handleGenerateSchedule = () => {
    setOptimizing(true);
    setTimeout(() => {
      setOptimizing(false);
      setIsOptimized(true);
    }, 1200);
  };

  const scheduleRows = [
    { name: 'Warping (Frames 1-4)', defaultShift: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15], optimizedShift: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 22, 23] },
    { name: 'Sizing (Slasher 1-2)', defaultShift: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16], optimizedShift: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 23] },
    { name: 'Weaving (Airjet Looms)', defaultShift: Array.from({ length: 24 }, (_, i) => i), optimizedShift: Array.from({ length: 24 }, (_, i) => i), protected: true },
    { name: 'Dyeing (Vat #03 Protected)', defaultShift: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], optimizedShift: [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18], protected: true },
    { name: 'Finishing (Stenter #02)', defaultShift: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20], optimizedShift: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 21, 22, 23], protected: true },
    { name: 'Compressor Header (GA-90)', defaultShift: Array.from({ length: 24 }, (_, i) => i), optimizedShift: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 21, 22, 23] },
    { name: 'HVAC Warehouse / Chiller', defaultShift: [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19], optimizedShift: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 22, 23] },
    { name: 'Warehouse Packaging', defaultShift: [9, 10, 11, 12, 13, 14, 15, 16, 17, 18], optimizedShift: [7, 8, 9, 10, 11, 12, 13, 14, 15, 16] },
    { name: 'Backup Generator Reserve', defaultShift: [17, 18, 19, 20, 21, 22], optimizedShift: [19, 20] }, // Reduced hours
    { name: 'Grid Feeder Supply', defaultShift: Array.from({ length: 24 }, (_, i) => i), optimizedShift: Array.from({ length: 24 }, (_, i) => i) },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              LOADSHIFT™ PRODUCTION-AWARE OPTIMIZATION
            </h1>
            <span className="ww-badge ww-badge-live">
              <Sparkles size={11} /> MILP CP-SAT ENGINE
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Date: <b style={{ color: 'var(--text-primary)' }}>Today (5 Oct 2026)</b> · Factory: <b style={{ color: 'var(--text-primary)' }}>{CURRENT_FACILITY.name}</b> · Objective: Minimize energy cost while preserving production throughput
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleGenerateSchedule}
            disabled={optimizing}
            className="ww-btn ww-btn-primary"
          >
            <Sparkles size={14} /> {optimizing ? 'Solving Constraints...' : isOptimized ? 'SCHEDULE ACTIVE' : 'GENERATE OPTIMAL SCHEDULE'}
          </button>
          {isOptimized && (
            <button onClick={() => setIsOptimized(false)} className="ww-btn ww-btn-secondary">
              <RotateCcw size={14} /> Reset Baseline
            </button>
          )}
        </div>
      </div>

      {/* AI Optimization Outcome Strip */}
      <div className="ww-hero-strip">
        <div className="ww-hero-item">
          <span className="ww-hero-label">Current Plan Cost</span>
          <div className="ww-hero-value" style={{ color: 'var(--text-secondary)' }}>
            Rs. 3.82 <span className="ww-hero-unit">Million</span>
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
            Baseline Unshifted Roster
          </span>
        </div>

        <div className="ww-hero-item">
          <span className="ww-hero-label">Optimized Plan Cost</span>
          <div className="ww-hero-value" style={{ color: 'var(--operational-green)' }}>
            Rs. 3.31 <span className="ww-hero-unit">Million</span>
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--operational-green)' }}>
            Peak-tariff curtailment active
          </span>
        </div>

        <div className="ww-hero-item ww-hero-dominant">
          <span className="ww-hero-label" style={{ color: 'var(--energy-amber)' }}>Projected Daily Savings</span>
          <div className="ww-hero-value" style={{ color: 'var(--energy-amber)' }}>
            Rs. 510,000
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--energy-amber)' }}>
            13.3% Cost Reduction
          </span>
        </div>

        <div className="ww-hero-item">
          <span className="ww-hero-label">Generator Hours Reduced</span>
          <div className="ww-hero-value">
            4.7 <span className="ww-hero-unit">Hours</span>
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--operational-green)' }}>
            Avoided expensive diesel
          </span>
        </div>

        <div className="ww-hero-item">
          <span className="ww-hero-label">Avoided Carbon Emissions</span>
          <div className="ww-hero-value">
            1.26 <span className="ww-hero-unit">tCO₂e</span>
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
            EU CBAM Verified
          </span>
        </div>
      </div>

      {/* Constraints & Dependencies Banner */}
      <div style={{ backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Shield size={14} color="var(--energy-amber)" />
          <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
            <b>Protected Non-Sheddable:</b> Dyeing Vat #3 · Stenter #2 · Finishing Line #4
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Layers size={14} color="var(--industrial-blue-light)" />
          <span style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
            <b>Production Dependencies:</b> Warping → Sizing → Weaving → Dyeing → Finishing
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, backgroundColor: 'var(--industrial-blue)', borderRadius: 2 }} /> Grid
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, backgroundColor: 'var(--energy-amber)', borderRadius: 2 }} /> Peak Tariff
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, backgroundColor: 'var(--operational-green)', borderRadius: 2 }} /> Optimized
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ width: 10, height: 10, backgroundColor: 'var(--critical-red)', borderRadius: 2 }} /> Protected
          </span>
        </div>
      </div>

      {/* 24-Hour Scheduling Timeline */}
      <div className="ww-card">
        <div className="ww-card-header">
          <span className="ww-card-title">
            <Clock size={13} color="var(--industrial-blue-light)" />
            24-Hour Production Energy Scheduling Matrix (00:00 — 24:00)
          </span>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
            {isOptimized ? 'OPTIMIZED SCHEDULE ACTIVE' : 'HISTORICAL BASELINE VIEW'}
          </span>
        </div>

        <div className="ww-card-body" style={{ padding: '12px 14px', overflowX: 'auto' }}>
          <div style={{ minWidth: 920 }}>
            {/* Hour Axis */}
            <div style={{ display: 'grid', gridTemplateColumns: '180px repeat(24, 1fr)', gap: 2, marginBottom: 8, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 6 }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                PROCESS / MACHINE
              </div>
              {hours.map((h, i) => (
                <div key={i} className="num-mono" style={{ fontSize: 9.5, textAlign: 'center', color: i >= 17 && i <= 21 ? 'var(--energy-amber)' : 'var(--text-tertiary)' }}>
                  {i % 2 === 0 ? h.slice(0, 2) : ''}
                </div>
              ))}
            </div>

            {/* Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {scheduleRows.map((row, rIdx) => {
                const activeHours = isOptimized ? row.optimizedShift : row.defaultShift;
                return (
                  <div
                    key={rIdx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '180px repeat(24, 1fr)',
                      gap: 2,
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                      {row.name}
                    </div>

                    {hours.map((_, hIdx) => {
                      const isActive = activeHours.includes(hIdx);
                      const isPeak = hIdx >= 17 && hIdx <= 21; // 17:00 - 22:00 FESCO peak TOU
                      let bg = 'var(--bg-surface-elevated)';

                      if (isActive) {
                        if (row.protected) {
                          bg = 'rgba(199, 71, 61, 0.4)';
                        } else if (isOptimized && isPeak) {
                          bg = 'var(--energy-amber)';
                        } else if (isOptimized) {
                          bg = 'var(--operational-green)';
                        } else {
                          bg = 'var(--industrial-blue)';
                        }
                      }

                      return (
                        <div
                          key={hIdx}
                          title={`${row.name} at ${hours[hIdx]}: ${isActive ? 'ACTIVE' : 'IDLE'}`}
                          style={{
                            height: 20,
                            borderRadius: 2,
                            backgroundColor: bg,
                            border: isPeak ? '1px solid rgba(216, 155, 36, 0.3)' : '1px solid transparent',
                            transition: 'background-color 0.2s ease',
                          }}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
