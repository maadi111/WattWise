import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Thermometer,
  Gauge,
  Zap,
  Info,
  Shield,
  AlertTriangle,
  ChevronRight,
  Maximize2,
} from 'lucide-react';
import { FloorZone, MachineDetail } from '../types/ui';
import { DEMO_FLOOR_ZONES, DEMO_MACHINES, CURRENT_FACILITY } from '../data/controlRoomData';

interface PowerFloorViewProps {
  onInspectMachine: (machine: MachineDetail) => void;
  lang?: 'en' | 'ur';
}

export const PowerFloorView: React.FC<PowerFloorViewProps> = ({
  onInspectMachine,
  lang = 'en',
}) => {
  const [selectedZone, setSelectedZone] = useState<FloorZone>(DEMO_FLOOR_ZONES[0]);
  const [hoveredZone, setHoveredZone] = useState<FloorZone | null>(null);

  const getStatusBadge = (status: FloorZone['status']) => {
    switch (status) {
      case 'STABLE':
        return <span className="ww-badge ww-badge-live"><span className="ww-pulse-green" /> STABLE</span>;
      case 'HEAVY':
        return <span className="ww-badge ww-badge-warning"><span className="ww-pulse-amber" /> HEAVY LOAD</span>;
      case 'CRITICAL':
        return <span className="ww-badge ww-badge-critical"><span className="ww-pulse-red" /> ATTENTION</span>;
      case 'SHED':
        return <span className="ww-badge ww-badge-neutral">SHED</span>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              {lang === 'ur' ? 'فیکٹری پاور فلور — 2D نقشہ' : 'Factory Power Floor — 2D Architectural Telemetry'}
            </h1>
            <span className="ww-badge ww-badge-blue">
              <Layers size={11} /> 10 ZONES MONITORED
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Interactive single-line electrical spatial mapping · {CURRENT_FACILITY.name} ({CURRENT_FACILITY.unit})
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="num-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Total Facility Demand: <b style={{ color: 'var(--text-primary)' }}>2.84 MW</b> · Aggregated PF: <b style={{ color: 'var(--operational-green)' }}>0.91</b>
          </span>
        </div>
      </div>

      {/* Main Grid: 2D Interactive Architectural Floor Canvas + Contextual Zone Panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(550px, 1.8fr) minmax(320px, 1fr)', gap: 14 }}>
        {/* 2D Architectural Floor Plan Layout */}
        <div className="ww-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ww-card-header">
            <span className="ww-card-title">
              <Activity size={13} color="var(--operational-green)" />
              Mill Spatial Layout & Sub-Station Feeder Grid
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10.5, color: 'var(--text-tertiary)' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="ww-pulse-green" /> Running
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span className="ww-pulse-amber" /> Peak / Warning
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--border-strong)' }} /> Shed
              </span>
            </div>
          </div>

          <div className="ww-card-body" style={{ flex: 1, padding: 14, backgroundColor: 'var(--bg-canvas)' }}>
            {/* Spatial Architectural Layout Representation */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gridAutoRows: '75px',
                gap: 8,
                position: 'relative',
              }}
            >
              {/* Zone 1: Weaving Hall (Large Center Area) */}
              <div
                onClick={() => setSelectedZone(DEMO_FLOOR_ZONES[0])}
                onMouseEnter={() => setHoveredZone(DEMO_FLOOR_ZONES[0])}
                onMouseLeave={() => setHoveredZone(null)}
                style={{
                  gridColumn: 'span 7',
                  gridRow: 'span 2',
                  backgroundColor: selectedZone.id === 'weaving-hall' ? 'rgba(18, 75, 99, 0.35)' : 'var(--bg-surface)',
                  border: '1px solid',
                  borderColor: selectedZone.id === 'weaving-hall' ? 'var(--industrial-blue-light)' : 'var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {DEMO_FLOOR_ZONES[0].name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                      {DEMO_FLOOR_ZONES[0].code} · Tsudakoma Airjet Looms
                    </div>
                  </div>
                  {getStatusBadge(DEMO_FLOOR_ZONES[0].status)}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div className="num-mono" style={{ fontSize: 20, fontWeight: 800, color: 'var(--operational-green)' }}>
                      {DEMO_FLOOR_ZONES[0].currentMw.toFixed(2)} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>MW</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                      PF {DEMO_FLOOR_ZONES[0].powerFactor} · {DEMO_FLOOR_ZONES[0].temperatureC}°C
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', fontSize: 10.5, color: 'var(--text-secondary)' }}>
                    <span className="num-mono" style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                      {DEMO_FLOOR_ZONES[0].activeCount}/{DEMO_FLOOR_ZONES[0].totalCount}
                    </span> active looms
                  </div>
                </div>
              </div>

              {/* Zone 2: Spinning & Ring Frames */}
              <div
                onClick={() => setSelectedZone(DEMO_FLOOR_ZONES[1])}
                onMouseEnter={() => setHoveredZone(DEMO_FLOOR_ZONES[1])}
                onMouseLeave={() => setHoveredZone(null)}
                style={{
                  gridColumn: 'span 5',
                  gridRow: 'span 2',
                  backgroundColor: selectedZone.id === 'spinning-section' ? 'rgba(18, 75, 99, 0.35)' : 'var(--bg-surface)',
                  border: '1px solid',
                  borderColor: selectedZone.id === 'spinning-section' ? 'var(--industrial-blue-light)' : 'var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 10,
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'all 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {DEMO_FLOOR_ZONES[1].name}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                      {DEMO_FLOOR_ZONES[1].code}
                    </div>
                  </div>
                  {getStatusBadge(DEMO_FLOOR_ZONES[1].status)}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                  <div>
                    <div className="num-mono" style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {DEMO_FLOOR_ZONES[1].currentMw.toFixed(2)} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>MW</span>
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                      PF {DEMO_FLOOR_ZONES[1].powerFactor}
                    </div>
                  </div>
                  <span className="num-mono" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
                    {DEMO_FLOOR_ZONES[1].activeCount}/{DEMO_FLOOR_ZONES[1].totalCount} online
                  </span>
                </div>
              </div>

              {/* Zone 3: Warping & Sizing */}
              <div
                onClick={() => setSelectedZone(DEMO_FLOOR_ZONES[2])}
                style={{
                  gridColumn: 'span 4',
                  backgroundColor: selectedZone.id === 'warping-sizing' ? 'rgba(18, 75, 99, 0.35)' : 'var(--bg-surface)',
                  border: '1px solid',
                  borderColor: selectedZone.id === 'warping-sizing' ? 'var(--industrial-blue-light)' : 'var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {DEMO_FLOOR_ZONES[2].name}
                </div>
                <div className="num-mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  {DEMO_FLOOR_ZONES[2].currentMw.toFixed(2)} MW
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>
                  PF 0.89 · {DEMO_FLOOR_ZONES[2].activeCount} units
                </div>
              </div>

              {/* Zone 4: Dyeing Vats */}
              <div
                onClick={() => setSelectedZone(DEMO_FLOOR_ZONES[3])}
                style={{
                  gridColumn: 'span 4',
                  backgroundColor: selectedZone.id === 'dyeing-unit' ? 'rgba(18, 75, 99, 0.35)' : 'var(--bg-surface)',
                  border: '1px solid',
                  borderColor: selectedZone.id === 'dyeing-unit' ? 'var(--industrial-blue-light)' : 'var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {DEMO_FLOOR_ZONES[3].name}
                  </div>
                  <span className="ww-badge ww-badge-warning" style={{ fontSize: 8 }}>PROTECTED</span>
                </div>
                <div className="num-mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  {DEMO_FLOOR_ZONES[3].currentMw.toFixed(2)} MW
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>
                  132.5°C · {DEMO_FLOOR_ZONES[3].activeCount} Vats active
                </div>
              </div>

              {/* Zone 5: Finishing & Stenters */}
              <div
                onClick={() => setSelectedZone(DEMO_FLOOR_ZONES[4])}
                style={{
                  gridColumn: 'span 4',
                  backgroundColor: selectedZone.id === 'finishing-hall' ? 'rgba(18, 75, 99, 0.35)' : 'var(--bg-surface)',
                  border: '1px solid',
                  borderColor: selectedZone.id === 'finishing-hall' ? 'var(--industrial-blue-light)' : 'var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {DEMO_FLOOR_ZONES[4].name}
                </div>
                <div className="num-mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  {DEMO_FLOOR_ZONES[4].currentMw.toFixed(2)} MW
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>
                  Monforts Stenter #2
                </div>
              </div>

              {/* Zone 6: Compressor House (Critical) */}
              <div
                onClick={() => setSelectedZone(DEMO_FLOOR_ZONES[5])}
                style={{
                  gridColumn: 'span 3',
                  backgroundColor: selectedZone.id === 'compressor-room' ? 'rgba(199, 71, 61, 0.25)' : 'var(--bg-surface)',
                  border: '1px solid',
                  borderColor: 'var(--critical-red)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--critical-red)' }}>
                    {DEMO_FLOOR_ZONES[5].name}
                  </div>
                  <span className="ww-badge ww-badge-critical" style={{ fontSize: 8 }}>PF 0.74</span>
                </div>
                <div className="num-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  {DEMO_FLOOR_ZONES[5].currentMw.toFixed(2)} MW
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--critical-red)' }}>
                  Atlas Copco GA-90
                </div>
              </div>

              {/* Zone 7: Generator & ATS */}
              <div
                onClick={() => setSelectedZone(DEMO_FLOOR_ZONES[6])}
                style={{
                  gridColumn: 'span 3',
                  backgroundColor: selectedZone.id === 'generator-room' ? 'rgba(18, 75, 99, 0.35)' : 'var(--bg-surface)',
                  border: '1px solid',
                  borderColor: selectedZone.id === 'generator-room' ? 'var(--industrial-blue-light)' : 'var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {DEMO_FLOOR_ZONES[6].name}
                </div>
                <div className="num-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--operational-green)', marginTop: 2 }}>
                  STANDBY (0 MW)
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>
                  Caterpillar 1,250 kVA
                </div>
              </div>

              {/* Zone 8: Sub-station & PCC */}
              <div
                onClick={() => setSelectedZone(DEMO_FLOOR_ZONES[7])}
                style={{
                  gridColumn: 'span 2',
                  backgroundColor: selectedZone.id === 'utility-room' ? 'rgba(18, 75, 99, 0.35)' : 'var(--bg-surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {DEMO_FLOOR_ZONES[7].name}
                </div>
                <div className="num-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  0.08 MW
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>
                  MDB-01 Bus
                </div>
              </div>

              {/* Zone 9: Warehouse (Shed) */}
              <div
                onClick={() => setSelectedZone(DEMO_FLOOR_ZONES[8])}
                style={{
                  gridColumn: 'span 2',
                  backgroundColor: selectedZone.id === 'warehouse' ? 'rgba(18, 75, 99, 0.35)' : 'var(--bg-surface)',
                  border: '1px dashed var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {DEMO_FLOOR_ZONES[8].name}
                </div>
                <div className="num-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)', marginTop: 2 }}>
                  0.04 MW
                </div>
                <span className="ww-badge ww-badge-neutral" style={{ fontSize: 8 }}>SHEDDABLE</span>
              </div>

              {/* Zone 10: Administration */}
              <div
                onClick={() => setSelectedZone(DEMO_FLOOR_ZONES[9])}
                style={{
                  gridColumn: 'span 2',
                  backgroundColor: selectedZone.id === 'admin' ? 'rgba(18, 75, 99, 0.35)' : 'var(--bg-surface)',
                  border: '1px solid var(--border-strong)',
                  borderRadius: 'var(--radius-sm)',
                  padding: 8,
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {DEMO_FLOOR_ZONES[9].name}
                </div>
                <div className="num-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>
                  0.03 MW
                </div>
                <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)' }}>
                  HVAC / Lighting
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Selected Zone Deep Dive Panel */}
        <div className="ww-card" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="ww-card-header">
            <span className="ww-card-title">
              <Gauge size={13} color="var(--industrial-blue-light)" />
              Zone Telemetry: {selectedZone.name}
            </span>
            {getStatusBadge(selectedZone.status)}
          </div>

          <div className="ww-card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {/* Zone Telemetry Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 10, borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Active Demand</div>
                <div className="num-mono" style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {selectedZone.currentMw.toFixed(2)} <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>MW</span>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 10, borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Power Factor</div>
                <div className="num-mono" style={{ fontSize: 20, fontWeight: 700, color: selectedZone.powerFactor < 0.85 ? 'var(--critical-red)' : 'var(--operational-green)' }}>
                  {selectedZone.powerFactor.toFixed(2)}
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 10, borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Ambient Temp</div>
                <div className="num-mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
                  {selectedZone.temperatureC}°C
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 10, borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Energy Efficiency</div>
                <div className="num-mono" style={{ fontSize: 16, fontWeight: 600, color: 'var(--operational-green)' }}>
                  {selectedZone.efficiencyPercent}%
                </div>
              </div>
            </div>

            {/* Individual Machines in this Zone */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: 8 }}>
                Monitored Machines in Zone ({selectedZone.machines.length > 0 ? selectedZone.machines.length : 'All Lines Aggregated'})
              </div>

              {selectedZone.machines.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {selectedZone.machines.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => onInspectMachine(m)}
                      style={{
                        padding: '8px 10px',
                        backgroundColor: 'var(--bg-surface-elevated)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-xs)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--industrial-blue-light)')}
                      onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
                    >
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>
                          {m.name}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                          {m.line} · Code: {m.code}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div className="num-mono" style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
                          {m.currentKw.toFixed(1)} kW
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--industrial-blue-light)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
                          Inspect <ChevronRight size={11} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '14px', backgroundColor: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-xs)', color: 'var(--text-secondary)', fontSize: 11.5, textAlign: 'center' }}>
                  24 sub-meters logging on Modbus RS-485 loop. Click machine on list or inspect feeder.
                </div>
              )}
            </div>

            {/* Quick action */}
            <div style={{ marginTop: 'auto' }}>
              <button
                onClick={() => onInspectMachine(DEMO_MACHINES[0])}
                className="ww-btn ww-btn-primary"
                style={{ width: '100%' }}
              >
                Inspect Zone Telemetry In Drawer <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
