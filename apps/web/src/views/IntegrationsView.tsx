import React from 'react';
import { Webhook, CheckCircle2, AlertTriangle, ExternalLink, Zap, Radio, Cloud, Shield } from 'lucide-react';
import { CURRENT_FACILITY } from '../data/controlRoomData';

interface IntegrationsViewProps {
  lang?: 'en' | 'ur';
}

export const IntegrationsView: React.FC<IntegrationsViewProps> = ({ lang = 'en' }) => {
  const integrations = [
    { name: 'FESCO AMR Automatic Meter Reading', category: 'Utility DISCO', status: 'CONNECTED', latency: '48ms', desc: 'Direct digital meter polling protocol for 11kV feeder line telemetry.' },
    { name: 'LESCO Feeder Telemetry API', category: 'Utility DISCO', status: 'CONNECTED', latency: '62ms', desc: 'Downstream Lahore grid substation outage feed.' },
    { name: 'GEPCO Special Economic Zone Portal', category: 'Utility DISCO', status: 'CONNECTED', latency: '84ms', desc: 'Gujranwala/Hattar feeder synchronization.' },
    { name: 'K-Electric SCADA Gateway', category: 'Utility DISCO', status: 'STANDBY', latency: '—', desc: 'Karachi coastal cluster integration interface.' },
    { name: 'WhatsApp Business API (Meta Cloud)', category: 'Operational Dispatch', status: 'CONNECTED', latency: '120ms', desc: 'Automatic shift report broadcast & emergency outage dispatch.' },
    { name: 'SAP Business One (ERP Connector)', category: 'Enterprise ERP', status: 'CONNECTED', latency: '24ms', desc: 'Bi-directional sync of production job orders for LoadShift constraints.' },
    { name: 'Oracle NetSuite ERP', category: 'Enterprise ERP', status: 'CONFIGURED', latency: '—', desc: 'General ledger journal vouchers for verified energy savings fee.' },
    { name: 'AWS Cloud Infrastructure (me-south-1)', category: 'Cloud Host', status: 'CONNECTED', latency: '18ms', desc: 'TimescaleDB telemetry ingest & ML prediction endpoints.' },
    { name: 'MQTT Mosquitto Industrial Broker', category: 'Edge IoT Bus', status: 'CONNECTED', latency: '4ms', desc: 'Local TLS edge messaging with WattBrain controllers.' },
    { name: 'Modbus RS-485 RTU Physical Bus', category: 'Hardware Bus', status: 'CONNECTED', latency: '1ms', desc: 'Sub-cycle serial telemetry from 28 WattClamp sensors.' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              INDUSTRIAL CONNECTORS & ERP INTEGRATIONS
            </h1>
            <span className="ww-badge ww-badge-live">
              <Webhook size={11} /> 9/10 ACTIVE PIPELINES
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Utility DISCOs, ERPs, Cloud backends and local hardware industrial protocols
          </div>
        </div>
      </div>

      {/* Integrations Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 12 }}>
        {integrations.map((item, idx) => (
          <div key={idx} className="ww-card" style={{ backgroundColor: 'var(--bg-surface)' }}>
            <div className="ww-card-header">
              <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-primary)' }}>
                {item.name}
              </span>
              <span className={`ww-badge ww-badge-${item.status === 'CONNECTED' ? 'live' : 'neutral'}`}>
                {item.status}
              </span>
            </div>
            <div className="ww-card-body" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Category: <b>{item.category}</b> · Latency: <b className="num-mono" style={{ color: 'var(--operational-green)' }}>{item.latency}</b>
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {item.desc}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
