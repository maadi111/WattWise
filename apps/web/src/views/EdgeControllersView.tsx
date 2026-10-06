import React, { useState } from 'react';
import { Cpu, Radio, Shield, HardDrive, Thermometer, Activity, CheckCircle2, RotateCcw, Zap } from 'lucide-react';
import { CURRENT_FACILITY } from '../data/controlRoomData';

interface EdgeControllersViewProps {
  lang?: 'en' | 'ur';
}

export const EdgeControllersView: React.FC<EdgeControllersViewProps> = ({ lang = 'en' }) => {
  const [selectedController, setSelectedController] = useState('WB-04');
  const [pingResult, setPingResult] = useState<string | null>(null);

  const testWatchdog = () => {
    setPingResult('Pinging BCM2835 hardware watchdog timer... Heartbeat confirmed. (0 drops, 12ms roundtrip)');
    setTimeout(() => setPingResult(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              EDGE CONTROLLERS & WATTBRAIN™ FIRMWARE
            </h1>
            <span className="ww-badge ww-badge-live">
              <span className="ww-pulse-green" /> 100% HARDWARE HEALTH
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Industrial ARMv8 Embedded Firmware · 72-Hour SQLite Circular Ring Buffer · Watchdog Fail-Safe
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={testWatchdog} className="ww-btn ww-btn-secondary">
            <Activity size={14} /> Test Hardware Watchdog
          </button>
        </div>
      </div>

      {pingResult && (
        <div style={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--operational-green)', color: 'var(--operational-green)', padding: 10, borderRadius: 'var(--radius-xs)', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} /> {pingResult}
        </div>
      )}

      {/* Edge Controller Tiles Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 14 }}>
        {/* Device Tile: WB-04 (Crescent Weaving) */}
        <div
          onClick={() => setSelectedController('WB-04')}
          className="ww-card"
          style={{
            border: '1px solid',
            borderColor: selectedController === 'WB-04' ? 'var(--industrial-blue-light)' : 'var(--border-subtle)',
            backgroundColor: 'var(--bg-surface)',
            cursor: 'pointer',
          }}
        >
          <div className="ww-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--operational-green)' }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>WB-04 (Primary Edge Unit)</span>
            </div>
            <span className="ww-badge ww-badge-live">ONLINE</span>
          </div>

          <div className="ww-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
              Location: <b>{CURRENT_FACILITY.name}</b> · Sub-station MDB-01 Bus
            </div>

            {/* Hardware Metrics 2x2 */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 8, borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>CPU Load</div>
                <div className="num-mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  18%
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 8, borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>RAM Usage</div>
                <div className="num-mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  42% <span style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>(1.7GB)</span>
                </div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 8, borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Core Temp</div>
                <div className="num-mono" style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  47°C
                </div>
              </div>
            </div>

            {/* Network & Local Buffer */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11, borderTop: '1px solid var(--border-subtle)', paddingTop: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Network Uplink:</span>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>GbE Ethernet (10.0.4.12) · LTE Backup Standby</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Offline Circular Buffer:</span>
                <span className="num-mono" style={{ fontWeight: 700, color: 'var(--operational-green)' }}>18.4h / 72.0h Capacity Used</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-tertiary)' }}>Firmware Version:</span>
                <span className="num-mono" style={{ color: 'var(--text-secondary)' }}>WattBrain-OS v2.4.1-arm64</span>
              </div>
            </div>
          </div>
        </div>

        {/* Device Tile: WB-01 (Lahore Backup) */}
        <div className="ww-card" style={{ backgroundColor: 'var(--bg-surface)' }}>
          <div className="ww-card-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--operational-green)' }} />
              <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>WB-01 (Lahore Spinning)</span>
            </div>
            <span className="ww-badge ww-badge-live">ONLINE</span>
          </div>
          <div className="ww-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>
              Location: <b>Crescent Spinning Unit 01</b> · Kala Shah Kaku
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 8, borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>CPU</div>
                <div className="num-mono" style={{ fontSize: 15, fontWeight: 700 }}>22%</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 8, borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>RAM</div>
                <div className="num-mono" style={{ fontSize: 15, fontWeight: 700 }}>38%</div>
              </div>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: 8, borderRadius: 'var(--radius-xs)' }}>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>TEMP</div>
                <div className="num-mono" style={{ fontSize: 15, fontWeight: 700 }}>45°C</div>
              </div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Buffer: 4.2h / 72.0h · Modbus Bus 1-16 Synced
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
