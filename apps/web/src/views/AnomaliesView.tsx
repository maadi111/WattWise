import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Activity,
  CheckCircle2,
  Wrench,
  Search,
  ExternalLink,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';
import { CURRENT_FACILITY } from '../data/controlRoomData';

interface AnomaliesViewProps {
  onInspectMachine?: (machineId: string) => void;
  lang?: 'en' | 'ur';
}

interface AnomalyIncident {
  id: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  asset: string;
  location: string;
  telemetryMetric: string;
  detectedAt: string;
  confidence: number;
  rootCause: string;
  status: 'INVESTIGATING' | 'DISPATCHED' | 'MONITORING';
}

export const AnomaliesView: React.FC<AnomaliesViewProps> = ({
  onInspectMachine,
  lang = 'en',
}) => {
  const [selectedIncident, setSelectedIncident] = useState<AnomalyIncident | null>(null);

  const incidents: AnomalyIncident[] = [
    {
      id: 'ANOM-8041',
      severity: 'HIGH',
      title: 'Transient Voltage Sag (Grid Feeder Instability)',
      asset: 'Main Distribution Board (MDB-01)',
      location: 'Sub-station #01 Incoming',
      telemetryMetric: '370.2 V (7.8% below 400V nominal)',
      detectedAt: '10:41:22 PKT',
      confidence: 96,
      rootCause: '132kV transmission substation switching surge on Khurrianwala grid feeder.',
      status: 'INVESTIGATING',
    },
    {
      id: 'ANOM-8039',
      severity: 'MEDIUM',
      title: 'Power Factor Degradation & Reactive Penalty',
      asset: 'Atlas Copco GA-90 Compressor #02',
      location: 'Compressor House',
      telemetryMetric: 'PF 0.71 (Below 0.85 threshold)',
      detectedAt: '09:13:00 PKT',
      confidence: 91,
      rootCause: 'Unloader valve cycling with defective 25 kVAR capacitor bank fuse.',
      status: 'DISPATCHED',
    },
    {
      id: 'ANOM-8035',
      severity: 'HIGH',
      title: 'Sensor Telemetry Integrity (Physical Displacement)',
      asset: 'WattClamp Node WC-018',
      location: 'Weaving Line 02 Busbar',
      telemetryMetric: 'Phase B Signal Ratio Divergence (24% imbalance)',
      detectedAt: '08:24:18 PKT',
      confidence: 98,
      rootCause: 'Vibration from adjacent heavy loom causing split-core clamp air gap.',
      status: 'DISPATCHED',
    },
    {
      id: 'ANOM-8028',
      severity: 'LOW',
      title: 'Harmonic Current Distortion (THD-I Elevation)',
      asset: 'Dyeing Sub-station (PCC-DY)',
      location: 'Dyeing & Chemical Plant',
      telemetryMetric: 'THD-I 6.8% (Above 5.0% IEEE 519 limit)',
      detectedAt: '06:45:10 PKT',
      confidence: 84,
      rootCause: '5th harmonic injection from variable frequency inverter drives on circulation pumps.',
      status: 'MONITORING',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              ANOMALY ENGINE & INCIDENT CONSOLE
            </h1>
            <span className="ww-badge ww-badge-critical">
              <AlertTriangle size={11} /> 4 ACTIVE OBSERVATIONS
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Isolation Forest (Model 4) Unsupervised Anomaly Detection · {CURRENT_FACILITY.name} ({CURRENT_FACILITY.unit})
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="num-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            Telemetry Scan Frequency: <b style={{ color: 'var(--operational-green)' }}>10 Hz (Real-time)</b>
          </span>
        </div>
      </div>

      {/* Incident Console Table */}
      <div className="ww-card">
        <div className="ww-card-header">
          <span className="ww-card-title">
            <Activity size={13} color="var(--critical-red)" />
            Active Electrical Telemetry Incidents
          </span>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
            Real-time Dispatch Active
          </span>
        </div>
        <div className="ww-table-container">
          <table className="ww-table">
            <thead>
              <tr>
                <th>Severity</th>
                <th>Incident ID</th>
                <th>Anomaly Description</th>
                <th>Asset / Location</th>
                <th>Telemetry Trigger</th>
                <th>Detected</th>
                <th>Confidence</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {incidents.map((inc) => (
                <tr
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  style={{ cursor: 'pointer' }}
                >
                  <td>
                    {inc.severity === 'HIGH' && (
                      <span className="ww-badge ww-badge-critical">
                        <AlertCircle size={10} /> HIGH
                      </span>
                    )}
                    {inc.severity === 'MEDIUM' && (
                      <span className="ww-badge ww-badge-warning">
                        <AlertTriangle size={10} /> MEDIUM
                      </span>
                    )}
                    {inc.severity === 'LOW' && (
                      <span className="ww-badge ww-badge-neutral">
                        LOW
                      </span>
                    )}
                  </td>
                  <td className="num-mono" style={{ fontWeight: 600 }}>{inc.id}</td>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{inc.title}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{inc.asset}</td>
                  <td className="num-mono" style={{ color: inc.severity === 'HIGH' ? 'var(--critical-red)' : 'var(--text-primary)' }}>
                    {inc.telemetryMetric}
                  </td>
                  <td className="num-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{inc.detectedAt}</td>
                  <td className="num-mono" style={{ color: 'var(--operational-green)', fontWeight: 600 }}>{inc.confidence}%</td>
                  <td>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedIncident(inc);
                      }}
                      className="ww-btn ww-btn-ghost"
                      style={{ fontSize: 11, padding: '2px 6px' }}
                    >
                      Investigate <ChevronRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Incident Drawer or Deep Dive Modal */}
      {selectedIncident && (
        <div className="ww-card" style={{ borderLeft: '3px solid var(--critical-red)' }}>
          <div className="ww-card-header" style={{ justifyContent: 'space-between' }}>
            <span className="ww-card-title" style={{ color: 'var(--critical-red)' }}>
              <AlertCircle size={14} /> Incident Investigation: {selectedIncident.id} — {selectedIncident.title}
            </span>
            <button onClick={() => setSelectedIncident(null)} className="ww-btn ww-btn-ghost" style={{ padding: 4 }}>
              Close
            </button>
          </div>
          <div className="ww-card-body" style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(280px, 1fr)', gap: 16 }}>
            <div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Root Cause Hypothesis</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginTop: 4 }}>
                {selectedIncident.rootCause}
              </div>

              <div style={{ marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 11.5 }}>
                <div>
                  <span style={{ color: 'var(--text-tertiary)' }}>Monitored Asset: </span>
                  <b style={{ color: 'var(--text-primary)' }}>{selectedIncident.asset}</b>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)' }}>Physical Location: </span>
                  <b style={{ color: 'var(--text-primary)' }}>{selectedIncident.location}</b>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)' }}>Timestamp: </span>
                  <b className="num-mono" style={{ color: 'var(--text-primary)' }}>{selectedIncident.detectedAt}</b>
                </div>
                <div>
                  <span style={{ color: 'var(--text-tertiary)' }}>Detection Model: </span>
                  <b style={{ color: 'var(--operational-green)' }}>Isolation Forest (contamination=0.03)</b>
                </div>
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: 12, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase' }}>
                  Operational Remediation Action
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.4 }}>
                  Dispatched high-priority work order to on-shift electrical foreman via WhatsApp integration.
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                <button className="ww-btn ww-btn-primary" style={{ flex: 1 }}>
                  <Wrench size={13} /> Dispatch Field Engineer
                </button>
                <button className="ww-btn ww-btn-secondary" style={{ flex: 1 }}>
                  Acknowledge Incident
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
