import React, { useState } from 'react';
import {
  BarChart3,
  TrendingDown,
  Layers,
  Calendar,
  Filter,
  ArrowRight,
  Zap,
  DollarSign,
  Fuel,
  Leaf,
  Activity,
} from 'lucide-react';
import { CURRENT_FACILITY } from '../data/controlRoomData';

interface AnalyticsViewProps {
  lang?: 'en' | 'ur';
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ lang = 'en' }) => {
  const [selectedMetric, setSelectedMetric] = useState<'PKR' | 'kWh' | 'kW' | 'Diesel' | 'CO2' | 'PF'>('PKR');
  const [selectedPeriod, setSelectedPeriod] = useState<'TODAY' | '7D' | '30D' | 'QUARTER'>('30D');

  const waterfallItems = [
    { label: 'Grid Baseline Energy', amountPkr: 14200000, type: 'ADD' },
    { label: 'Diesel Generation Cost', amountPkr: 3840000, type: 'ADD' },
    { label: 'Peak Demand Penalty (MDI)', amountPkr: 890000, type: 'ADD' },
    { label: 'Fuel Price Adjustment (FPA)', amountPkr: 1120000, type: 'ADD' },
    { label: 'LoadShift Optimization Savings', amountPkr: -2180000, type: 'SUBTRACT' },
    { label: 'Avoided Generator Run Hours', amountPkr: -3080000, type: 'SUBTRACT' },
    { label: 'Net Energy Cost (WattWise)', amountPkr: 14790000, type: 'TOTAL' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header & Analytical Controls */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              ENERGY ANALYTICS & TARIFF WATERFALL
            </h1>
            <span className="ww-badge ww-badge-live">
              <BarChart3 size={11} /> 100ms TELEMETRY ROLLUP
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Multi-dimensional cost attribution · {CURRENT_FACILITY.name} ({CURRENT_FACILITY.unit})
          </div>
        </div>

        {/* Filter and Period Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: 2 }}>
            {(['PKR', 'kWh', 'kW', 'Diesel', 'CO2', 'PF'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setSelectedMetric(m)}
                style={{
                  padding: '3px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 2,
                  border: 'none',
                  backgroundColor: selectedMetric === m ? 'var(--industrial-blue)' : 'transparent',
                  color: selectedMetric === m ? '#FFFFFF' : 'var(--text-secondary)',
                  cursor: 'pointer',
                }}
              >
                {m}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: 2 }}>
            {(['TODAY', '7D', '30D', 'QUARTER'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setSelectedPeriod(p)}
                style={{
                  padding: '3px 8px',
                  fontSize: 11,
                  fontWeight: 600,
                  borderRadius: 2,
                  border: 'none',
                  backgroundColor: selectedPeriod === p ? 'var(--bg-surface-elevated)' : 'transparent',
                  color: selectedPeriod === p ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Energy Cost Waterfall Component */}
      <div className="ww-card">
        <div className="ww-card-header">
          <span className="ww-card-title">
            <DollarSign size={13} color="var(--operational-green)" />
            Energy Cost Waterfall (Gross Energy Baseline to Net Cost)
          </span>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--operational-green)' }}>
            Net Verified Savings: Rs. 5.26 Million
          </span>
        </div>
        <div className="ww-card-body" style={{ padding: '16px 18px', overflowX: 'auto' }}>
          <div style={{ minWidth: 780, display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 10, alignItems: 'flex-end', height: 180, borderBottom: '1px solid var(--border-subtle)', paddingBottom: 10 }}>
            {waterfallItems.map((item, idx) => {
              const isNegative = item.amountPkr < 0;
              const isTotal = item.type === 'TOTAL';
              const absVal = Math.abs(item.amountPkr);
              const heightPercent = Math.min(100, Math.max(20, (absVal / 15000000) * 100));

              let barColor = 'var(--industrial-blue)';
              if (isNegative) barColor = 'var(--operational-green)';
              if (isTotal) barColor = '#38bdf8';
              if (item.label.includes('Penalty') || item.label.includes('Diesel')) barColor = 'var(--energy-amber)';

              return (
                <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%', justifyContent: 'flex-end' }}>
                  <div className="num-mono" style={{ fontSize: 11, fontWeight: 700, color: isNegative ? 'var(--operational-green)' : 'var(--text-primary)', marginBottom: 4 }}>
                    {isNegative ? '-' : ''}Rs. {(absVal / 1000000).toFixed(2)}M
                  </div>
                  <div
                    style={{
                      width: '80%',
                      height: `${heightPercent}%`,
                      backgroundColor: barColor,
                      borderRadius: 'var(--radius-xs) var(--radius-xs) 0 0',
                      transition: 'height 0.3s ease',
                    }}
                  />
                  <div style={{ fontSize: 9.5, textAlign: 'center', color: 'var(--text-secondary)', marginTop: 8, lineHeight: 1.2, height: 32 }}>
                    {item.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Hierarchical Drilldown Breakdown: Factory -> Department -> Line -> Machine */}
      <div className="ww-card">
        <div className="ww-card-header">
          <span className="ww-card-title">
            <Layers size={13} color="var(--industrial-blue-light)" />
            Factory Energy Cost Hierarchy Drilldown
          </span>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
            4-Level Modbus Sub-metering
          </span>
        </div>
        <div className="ww-table-container">
          <table className="ww-table">
            <thead>
              <tr>
                <th>Hierarchy Entity</th>
                <th>Active Demand (kW)</th>
                <th>Power Factor</th>
                <th>Monthly Cost (PKR)</th>
                <th>Specific Energy (kWh/kg)</th>
                <th>Efficiency Status</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ backgroundColor: 'var(--bg-surface-elevated)', fontWeight: 700 }}>
                <td>🏭 Crescent Weaving (Unit 04 Full Mill)</td>
                <td className="num-mono">2,840.0 kW</td>
                <td className="num-mono" style={{ color: 'var(--operational-green)' }}>0.91</td>
                <td className="num-mono">Rs. 14,790,000</td>
                <td className="num-mono">1.42 kWh/m</td>
                <td><span className="ww-badge ww-badge-live">NORMAL</span></td>
              </tr>
              <tr>
                <td style={{ paddingLeft: 24, fontWeight: 600 }}>↳ Weaving Department (PCC-WV)</td>
                <td className="num-mono">1,420.0 kW</td>
                <td className="num-mono" style={{ color: 'var(--operational-green)' }}>0.91</td>
                <td className="num-mono">Rs. 7,420,000</td>
                <td className="num-mono">0.88 kWh/m</td>
                <td><span className="ww-badge ww-badge-live">STABLE</span></td>
              </tr>
              <tr>
                <td style={{ paddingLeft: 44 }}>↳ Line 02 (Airjet Looms #11 - #20)</td>
                <td className="num-mono">428.0 kW</td>
                <td className="num-mono" style={{ color: 'var(--operational-green)' }}>0.92</td>
                <td className="num-mono">Rs. 2,240,000</td>
                <td className="num-mono">0.89 kWh/m</td>
                <td><span className="ww-badge ww-badge-live">STABLE</span></td>
              </tr>
              <tr>
                <td style={{ paddingLeft: 64, color: 'var(--energy-amber)' }}>↳ Airjet Loom #18</td>
                <td className="num-mono" style={{ color: 'var(--energy-amber)' }}>42.8 kW</td>
                <td className="num-mono">0.91</td>
                <td className="num-mono">Rs. 224,000</td>
                <td className="num-mono">0.94 kWh/m</td>
                <td><span className="ww-badge ww-badge-warning">+14% IDLE LOAD</span></td>
              </tr>
              <tr>
                <td style={{ paddingLeft: 24, fontWeight: 600 }}>↳ Dyeing & Steam Unit (PCC-DY)</td>
                <td className="num-mono">540.0 kW</td>
                <td className="num-mono" style={{ color: 'var(--operational-green)' }}>0.88</td>
                <td className="num-mono">Rs. 2,820,000</td>
                <td className="num-mono">2.10 kWh/kg</td>
                <td><span className="ww-badge ww-badge-warning">HEAVY</span></td>
              </tr>
              <tr>
                <td style={{ paddingLeft: 24, fontWeight: 600, color: 'var(--critical-red)' }}>↳ Compressor House (PCC-UT)</td>
                <td className="num-mono" style={{ color: 'var(--critical-red)' }}>260.0 kW</td>
                <td className="num-mono" style={{ color: 'var(--critical-red)' }}>0.74</td>
                <td className="num-mono">Rs. 1,360,000</td>
                <td className="num-mono">0.18 kWh/CFM</td>
                <td><span className="ww-badge ww-badge-critical">PF PENALTY</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
