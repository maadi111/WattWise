import React, { useState } from 'react';
import { Activity, ShieldCheck, AlertTriangle, Power, Gauge, Zap, Layers, RefreshCw } from 'lucide-react';
import { SensorNode, Factory, LiveTelemetry } from '../types';
import { industrialAudio } from '../services/soundEffects';

interface PowerFloorMapProps {
  nodes: SensorNode[];
  factory: Factory;
  telemetry: LiveTelemetry;
  onToggleNodeShed: (nodeId: string) => void;
  lang: 'en' | 'ur';
}

export const PowerFloorMap: React.FC<PowerFloorMapProps> = ({
  nodes,
  factory,
  telemetry,
  onToggleNodeShed,
  lang,
}) => {
  const [selectedNode, setSelectedNode] = useState<SensorNode | null>(null);

  const totalKw = nodes.reduce((acc, n) => acc + (n.isShed ? 0 : n.powerKw), 0);
  const activeNodesCount = nodes.filter(n => !n.isShed).length;
  const sheddedKw = nodes.filter(n => n.isShed).reduce((acc, n) => acc + n.powerKw, 0);

  const getPriorityBadge = (priority: SensorNode['priority']) => {
    switch (priority) {
      case 'CRITICAL_PROTECTED':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#10b981',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.35)',
            padding: '2px 8px',
            borderRadius: '9999px',
          }}>
            <ShieldCheck size={12} /> PROTECTED MID-CYCLE
          </span>
        );
      case 'SHEDDABLE_NON_CRITICAL':
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#f59e0b',
            background: 'rgba(245, 158, 11, 0.15)',
            border: '1px solid rgba(245, 158, 11, 0.35)',
            padding: '2px 8px',
            borderRadius: '9999px',
          }}>
            <Power size={12} /> AUTO-SHEDDABLE
          </span>
        );
      default:
        return (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.7rem',
            fontWeight: 700,
            color: '#38bdf8',
            background: 'rgba(56, 189, 248, 0.15)',
            border: '1px solid rgba(56, 189, 248, 0.35)',
            padding: '2px 8px',
            borderRadius: '9999px',
          }}>
            <Zap size={12} /> ESSENTIAL
          </span>
        );
    }
  };

  return (
    <div className="glass-panel">
      {/* Panel Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Layers size={22} style={{ color: 'var(--emerald-neon)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {lang === 'ur' ? 'لائیو پاور فلور میپ اور واٹ کلیمپ سینسرز' : 'Live Industrial Power Map & WattClamp™ Nodes'}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            {lang === 'ur'
              ? 'ریئل ٹائم کرنٹ ٹرانسفارمر (CT) سینسر فیڈنگ ڈیٹا، بغیر کسی شٹ ڈاؤن کے نصب کردہ'
              : `Non-intrusive split-core CT telemetry for ${factory.name} • 10 kHz harmonic sampling`}
          </p>
        </div>

        {/* Aggregate Stats */}
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Facility Load</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--emerald-neon)' }}>
              {totalKw.toFixed(1)} <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>kW</span>
            </div>
          </div>
          <div style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Current Source Cost</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 800, color: telemetry.activeSource === 'GRID' ? '#38bdf8' : '#f59e0b' }}>
              Rs. {telemetry.costPerHourPkr.toLocaleString('en-PK')}<span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>/hr</span>
            </div>
          </div>
          {sheddedKw > 0 && (
            <div style={{ background: 'rgba(244, 63, 94, 0.15)', padding: '8px 16px', borderRadius: '8px', border: '1px solid rgba(244, 63, 94, 0.4)' }}>
              <div style={{ fontSize: '0.7rem', color: 'var(--rose-neon)', textTransform: 'uppercase' }}>Non-Critical Shedded</div>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.3rem', fontWeight: 800, color: 'var(--rose-neon)' }}>
                -{sheddedKw.toFixed(1)} <span style={{ fontSize: '0.8rem' }}>kW</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sensor Nodes Floor Grid */}
      <div className="floor-map-grid">
        {nodes.map((node) => {
          const isHeavy = node.powerKw > 150;
          const isAmber = node.powerKw > 80 && node.powerKw <= 150;

          return (
            <div
              key={node.id}
              className={`node-card ${node.isShed ? 'shedded' : 'protected-active'}`}
              onClick={() => setSelectedNode(node)}
            >
              {/* Header inside card */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  {node.id} • {node.section}
                </span>
                <span className={`live-badge ${node.isShed ? 'danger' : isHeavy ? 'warning' : 'online'}`} style={{ fontSize: '0.65rem' }}>
                  {node.isShed ? 'LOAD SHED' : isHeavy ? 'HEAVY' : 'OPTIMAL'}
                </span>
              </div>

              {/* Title & Priority */}
              <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: node.isShed ? 'var(--text-muted)' : '#ffffff', marginBottom: '10px' }}>
                {node.label}
              </h3>
              
              <div style={{ marginBottom: '14px' }}>
                {getPriorityBadge(node.priority)}
              </div>

              {/* Real-time telemetry values */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', background: 'rgba(0,0,0,0.25)', padding: '10px', borderRadius: '8px' }}>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>POWER</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: node.isShed ? 'var(--text-dim)' : 'var(--emerald-neon)' }}>
                    {node.isShed ? '0.0' : node.powerKw.toFixed(1)} <span style={{ fontSize: '0.65rem' }}>kW</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>RMS AMPS</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                    {node.isShed ? '0.0' : node.currentAmps.toFixed(1)} <span style={{ fontSize: '0.65rem' }}>A</span>
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>PF / THD</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '0.95rem', color: '#38bdf8' }}>
                    {node.powerFactor} <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>/ {node.harmonicDistortionThd}%</span>
                  </div>
                </div>
              </div>

              {/* Footer quick action */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <span>CT: {node.ctRangeA}A (Class 0.5)</span>
                <span style={{ color: 'var(--cyan-neon)', fontWeight: 600 }}>Inspect Diagnostics &rarr;</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Node Detail / Diagnostics Modal */}
      {selectedNode && (
        <div className="modal-overlay" onClick={() => setSelectedNode(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
              <div>
                <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--cyan-neon)' }}>
                  WATTCLAMP™ TELEMETRY NODE: {selectedNode.id}
                </span>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginTop: '4px' }}>
                  {selectedNode.label}
                </h2>
                <div style={{ marginTop: '6px' }}>{getPriorityBadge(selectedNode.priority)}</div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="btn btn-outline btn-sm"
                style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
              >
                ✕
              </button>
            </div>

            {/* Description & Engineering Analysis */}
            <div style={{ background: 'rgba(30, 41, 59, 0.5)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '4px' }}>
                MACHINE & PROCESS VULNERABILITY ANALYSIS
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
                {selectedNode.processDescription}
              </p>
            </div>

            {/* Technical Parameters Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>CT SENSOR SPECS</span>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff', marginTop: '2px' }}>
                  Split-Core 0-{selectedNode.ctRangeA}A (IEC 61869-2)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Sampling: 10 kHz High-Speed Modbus RS-485</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>3-PHASE VOLTAGE & FREQ</span>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--emerald-neon)', marginTop: '2px' }}>
                  {selectedNode.voltageV}V AC (50.02 Hz)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Balanced Phase 1/2/3 Current</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>POWER FACTOR / EFFICIENCY</span>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#38bdf8', marginTop: '2px' }}>
                  PF: {selectedNode.powerFactor} (Active Power: {selectedNode.powerKw} kW)
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Apparent: {(selectedNode.powerKw / selectedNode.powerFactor).toFixed(1)} kVA</div>
              </div>
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>THERMAL & HARMONICS</span>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#f59e0b', marginTop: '2px' }}>
                  THD: {selectedNode.harmonicDistortionThd}% • Temp: {selectedNode.temperatureC}°C
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Status: Normal Thermal Range</div>
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                Installed: {selectedNode.installedAt} • Modbus Bus #1
              </div>
              {selectedNode.priority === 'SHEDDABLE_NON_CRITICAL' ? (
                <button
                  onClick={() => {
                    industrialAudio.playRelayClick();
                    onToggleNodeShed(selectedNode.id);
                    setSelectedNode({
                      ...selectedNode,
                      isShed: !selectedNode.isShed,
                    });
                  }}
                  className={`btn ${selectedNode.isShed ? 'btn-primary' : 'btn-danger'} btn-sm`}
                >
                  <Power size={14} />
                  {selectedNode.isShed ? 'Restore Load via WattBrain Relay' : 'Trigger Pre-emptive Load Shed'}
                </button>
              ) : (
                <div style={{ fontSize: '0.75rem', color: 'var(--emerald-neon)', fontWeight: 600 }}>
                  ✓ Locked by SwiftSwitch™ Process Protection Protocol
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
