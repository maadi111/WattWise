import React from 'react';
import { HeartPulse, Activity, CheckCircle2, Shield, AlertTriangle, Server, Database, Radio } from 'lucide-react';

interface SystemHealthViewProps {
  lang?: 'en' | 'ur';
}

export const SystemHealthView: React.FC<SystemHealthViewProps> = ({ lang = 'en' }) => {
  const components = [
    { name: 'Go 1.22 REST & Gin API Gateway', type: 'Backend Core', latency: '14 ms', health: 'HEALTHY', errorRate: '0.001%', heartbeat: '1s ago' },
    { name: 'Mosquitto MQTT 2.0 TLS Broker', type: 'Edge Telemetry Bus', latency: '4 ms', health: 'HEALTHY', errorRate: '0.000%', heartbeat: '100ms ago' },
    { name: 'Apache Kafka KRaft Event Stream', type: 'High-Throughput Log', latency: '8 ms', health: 'HEALTHY', errorRate: '0.000%', heartbeat: '200ms ago' },
    { name: 'InfluxDB 2.7 / TimescaleDB', type: 'Time-Series Store', latency: '12 ms', health: 'HEALTHY', errorRate: '0.002%', heartbeat: '500ms ago' },
    { name: 'PostgreSQL 16 (Append-Only Rules)', type: 'Relational Store', latency: '5 ms', health: 'HEALTHY', errorRate: '0.000%', heartbeat: '1s ago' },
    { name: 'Redis 7 In-Memory Cache', type: 'Real-Time State', latency: '2 ms', health: 'HEALTHY', errorRate: '0.000%', heartbeat: '100ms ago' },
    { name: 'Python 3.11 ML Inference Engine', type: 'AI Prediction Pod', latency: '88 ms', health: 'HEALTHY', errorRate: '0.010%', heartbeat: '2s ago' },
    { name: 'WattBrain WB-04 Edge Firmware', type: 'Embedded Device', latency: '1 ms', health: 'HEALTHY', errorRate: '0.000%', heartbeat: '100ms ago' },
    { name: 'WebSocket Real-Time Broadcast', type: 'Live Streaming', latency: '142 ms', health: 'HEALTHY', errorRate: '0.000%', heartbeat: '100ms ago' },
    { name: 'AWS Bahrain (me-south-1) Cloud', type: 'VPC Infrastructure', latency: '22 ms', health: 'HEALTHY', errorRate: '0.000%', heartbeat: '5s ago' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              SYSTEM OBSERVABILITY & TECHNICAL HEALTH
            </h1>
            <span className="ww-badge ww-badge-live">
              <span className="ww-pulse-green" /> ALL 10 SUBSYSTEMS NOMINAL
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Low-latency distributed infrastructure status · Telemetry ingest buffer: 0 drops
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="num-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            System Uptime: <b style={{ color: 'var(--operational-green)' }}>99.98%</b> · Mean Ingest Latency: <b style={{ color: 'var(--operational-green)' }}>14ms</b>
          </span>
        </div>
      </div>

      {/* System Health Table */}
      <div className="ww-card">
        <div className="ww-card-header">
          <span className="ww-card-title">
            <HeartPulse size={13} color="var(--operational-green)" />
            Distributed Architecture Observability Metric Log
          </span>
          <span className="num-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            Prometheus & OpenTelemetry Scraped
          </span>
        </div>
        <div className="ww-table-container">
          <table className="ww-table">
            <thead>
              <tr>
                <th>Infrastructure Subsystem</th>
                <th>Architectural Role</th>
                <th>Roundtrip Latency</th>
                <th>Health Status</th>
                <th>Error Rate (24h)</th>
                <th>Last Heartbeat</th>
              </tr>
            </thead>
            <tbody>
              {components.map((comp, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{comp.name}</td>
                  <td style={{ color: 'var(--text-secondary)' }}>{comp.type}</td>
                  <td className="num-mono" style={{ color: 'var(--operational-green)', fontWeight: 600 }}>{comp.latency}</td>
                  <td>
                    <span className="ww-badge ww-badge-live">
                      <CheckCircle2 size={10} /> {comp.health}
                    </span>
                  </td>
                  <td className="num-mono" style={{ color: 'var(--text-secondary)' }}>{comp.errorRate}</td>
                  <td className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>{comp.heartbeat}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
