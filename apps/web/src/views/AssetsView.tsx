import React, { useState } from 'react';
import { Layers, Cpu, Shield, Activity, Search, Filter, ChevronRight, CheckCircle2 } from 'lucide-react';
import { DEMO_MACHINES, CURRENT_FACILITY } from '../data/controlRoomData';
import { MachineDetail } from '../types/ui';

interface AssetsViewProps {
  onInspectMachine: (machine: MachineDetail) => void;
  lang?: 'en' | 'ur';
}

export const AssetsView: React.FC<AssetsViewProps> = ({ onInspectMachine, lang = 'en' }) => {
  const [activeTab, setActiveTab] = useState<'ALL' | 'MACHINES' | 'CONTROLLERS' | 'SENSORS' | 'GENERATORS'>('ALL');
  const [search, setSearch] = useState('');

  const assets = [
    { id: 'loom-18', name: 'Airjet Loom #18', type: 'Production Machine', location: 'Weaving Hall / Line 02', status: 'RUNNING', health: '94%', lastSeen: '100ms ago', serial: 'TSUDA-920-184' },
    { id: 'loom-12', name: 'Airjet Loom #12', type: 'Production Machine', location: 'Weaving Hall / Line 01', status: 'RUNNING', health: '98%', lastSeen: '100ms ago', serial: 'TSUDA-920-112' },
    { id: 'dye-03', name: 'High-Temp Dyeing Vat #03', type: 'Protected Process', location: 'Dyeing Plant Line 1', status: 'RUNNING', health: '92%', lastSeen: '100ms ago', serial: 'THIES-IM-039' },
    { id: 'stenter-02', name: 'Monforts Stenter Frame #02', type: 'Protected Process', location: 'Finishing Line 2', status: 'RUNNING', health: '96%', lastSeen: '100ms ago', serial: 'MONF-TX-202' },
    { id: 'comp-01', name: 'Atlas Copco GA-90 Compressor #01', type: 'Utility Asset', location: 'Compressor House', status: 'RUNNING', health: '78%', lastSeen: '100ms ago', serial: 'AC-GA90-849' },
    { id: 'wb-04', name: 'WattBrain WB-04 Edge Controller', type: 'Edge Controller', location: 'Sub-station MDB-01', status: 'ONLINE', health: '99.9%', lastSeen: '10ms ago', serial: 'WB-OCT-2026-04' },
    { id: 'cat-gen', name: 'Caterpillar C32 1,250 kVA Generator', type: 'Power Generation', location: 'Generator Yard', status: 'STANDBY', health: '100%', lastSeen: '100ms ago', serial: 'CAT-C32-9482' },
    { id: 'ats-vcb', name: 'Vacuum Circuit Breaker (VCB) ATS', type: 'Switchgear', location: 'PCC Room', status: 'ARMED', health: '100%', lastSeen: '100ms ago', serial: 'ABB-VD4-3500' },
  ];

  const filtered = assets.filter((a) => a.name.toLowerCase().includes(search.toLowerCase()) || a.location.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              PHYSICAL INFRASTRUCTURE & ASSET REGISTRY
            </h1>
            <span className="ww-badge ww-badge-live">
              <Layers size={11} /> 28 MONITORED ASSETS
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Central device registry, calibration records & hardware telemetry · {CURRENT_FACILITY.name}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: '4px 8px' }}>
            <Search size={14} color="var(--text-tertiary)" style={{ marginRight: 6 }} />
            <input
              type="text"
              placeholder="Search assets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ background: 'transparent', border: 'none', outline: 'none', color: 'var(--text-primary)', fontSize: 12 }}
            />
          </div>
        </div>
      </div>

      {/* Assets Table */}
      <div className="ww-card">
        <div className="ww-card-header">
          <span className="ww-card-title">
            <Cpu size={13} color="var(--industrial-blue-light)" />
            Industrial Asset Telemetry Table
          </span>
          <span className="num-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            Showing {filtered.length} Registered Nodes
          </span>
        </div>
        <div className="ww-table-container">
          <table className="ww-table">
            <thead>
              <tr>
                <th>Asset Name</th>
                <th>Type</th>
                <th>Installation Location</th>
                <th>Status</th>
                <th>Health Score</th>
                <th>Serial Number</th>
                <th>Last Heartbeat</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{item.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{item.type}</td>
                  <td>{item.location}</td>
                  <td>
                    <span className="ww-badge ww-badge-live">
                      <span className="ww-pulse-green" /> {item.status}
                    </span>
                  </td>
                  <td className="num-mono" style={{ color: 'var(--operational-green)', fontWeight: 600 }}>{item.health}</td>
                  <td className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>{item.serial}</td>
                  <td className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>{item.lastSeen}</td>
                  <td>
                    <button
                      onClick={() => onInspectMachine(DEMO_MACHINES[0])}
                      className="ww-btn ww-btn-ghost"
                      style={{ fontSize: 11, padding: '2px 6px' }}
                    >
                      Inspect <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
