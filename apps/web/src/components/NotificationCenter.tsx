import React, { useState } from 'react';
import { X, AlertTriangle, AlertCircle, TrendingDown, DollarSign, Server, ArrowRight, Check } from 'lucide-react';
import { NavSectionId } from '../types/ui';

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: NavSectionId) => void;
}

interface OperationalNotification {
  id: string;
  category: 'CRITICAL' | 'ATTENTION' | 'OPTIMIZATION' | 'FINANCIAL' | 'SYSTEM';
  title: string;
  body: string;
  timestamp: string;
  targetNav: NavSectionId;
  read: boolean;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  isOpen,
  onClose,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'CRITICAL' | 'ATTENTION' | 'FINANCIAL'>('ALL');
  const [notifications, setNotifications] = useState<OperationalNotification[]>([
    {
      id: 'notif-1',
      category: 'CRITICAL',
      title: 'Grid instability detected — 87% outage probability',
      body: 'Rapid voltage rate-of-change (dV/dt = -3.2 V/s) on Khurrianwala 11kV Feeder. SwiftSwitch armed for pre-emptive transfer.',
      timestamp: '10:52:14 PKT',
      targetNav: 'swiftswitch',
      read: false,
    },
    {
      id: 'notif-2',
      category: 'ATTENTION',
      title: 'Compressor #2 PF dropped below 0.75 threshold',
      body: 'Power factor degradation detected on Atlas Copco GA-90 Compressor (PF 0.71). Reactive energy surcharge risk active.',
      timestamp: '09:13:00 PKT',
      targetNav: 'anomalies',
      read: false,
    },
    {
      id: 'notif-3',
      category: 'FINANCIAL',
      title: 'August utility audit identified Rs. 618,480 potential recovery',
      body: 'FESCO billed 351,200 kWh vs 334,020 kWh measured. NEPRA Chapter 4 Section 21 dispute dossier is ready for filing.',
      timestamp: '08:45:10 PKT',
      targetNav: 'utility_audit',
      read: false,
    },
    {
      id: 'notif-4',
      category: 'FINANCIAL',
      title: 'Monthly savings certificate is ready (SHA-256 verified)',
      body: 'September 2026 documented savings: Rs. 5.26M. Digital cryptographic certificate generated.',
      timestamp: '08:00:00 PKT',
      targetNav: 'savings_ledger',
      read: true,
    },
    {
      id: 'notif-5',
      category: 'SYSTEM',
      title: 'Edge controller WB-04 LTE failover standby confirmed',
      body: 'Primary Ethernet heartbeat active (18ms). Cellular backup APN operational.',
      timestamp: '07:30:00 PKT',
      targetNav: 'system_health',
      read: true,
    },
  ]);

  if (!isOpen) return null;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const filtered = notifications.filter((n) => {
    if (filter === 'ALL') return true;
    return n.category === filter;
  });

  const getCategoryBadge = (cat: OperationalNotification['category']) => {
    switch (cat) {
      case 'CRITICAL':
        return <span className="ww-badge ww-badge-critical"><AlertCircle size={10} /> CRITICAL</span>;
      case 'ATTENTION':
        return <span className="ww-badge ww-badge-warning"><AlertTriangle size={10} /> ATTENTION</span>;
      case 'OPTIMIZATION':
        return <span className="ww-badge ww-badge-blue"><TrendingDown size={10} /> OPTIMIZATION</span>;
      case 'FINANCIAL':
        return <span className="ww-badge ww-badge-live"><DollarSign size={10} /> FINANCIAL</span>;
      case 'SYSTEM':
        return <span className="ww-badge ww-badge-neutral"><Server size={10} /> SYSTEM</span>;
    }
  };

  return (
    <div className="ww-drawer-overlay" onClick={onClose}>
      <div className="ww-drawer" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
              Operational Incident Center
            </h2>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
              Real-time telemetry alerts & events
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={markAllAsRead} className="ww-btn ww-btn-ghost" style={{ fontSize: 11, padding: '4px 8px' }}>
              <Check size={13} /> Mark read
            </button>
            <button onClick={onClose} className="ww-btn ww-btn-ghost" style={{ padding: 6 }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div style={{ padding: '8px 18px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', gap: 6, backgroundColor: 'var(--bg-surface)' }}>
          {(['ALL', 'CRITICAL', 'ATTENTION', 'FINANCIAL'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '3px 8px',
                fontSize: 10.5,
                fontWeight: 600,
                borderRadius: 3,
                border: '1px solid',
                borderColor: filter === f ? 'var(--industrial-blue)' : 'var(--border-subtle)',
                backgroundColor: filter === f ? 'var(--industrial-blue-glow)' : 'transparent',
                color: filter === f ? '#38bdf8' : 'var(--text-secondary)',
                cursor: 'pointer',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => {
                onNavigate(item.targetNav);
                onClose();
              }}
              style={{
                padding: 12,
                borderRadius: 'var(--radius-sm)',
                backgroundColor: item.read ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)',
                border: '1px solid',
                borderColor: item.category === 'CRITICAL' && !item.read ? 'rgba(199, 71, 61, 0.5)' : 'var(--border-subtle)',
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = item.read ? 'var(--bg-surface-elevated)' : 'var(--bg-surface)')}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                {getCategoryBadge(item.category)}
                <span className="num-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                  {item.timestamp}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: item.read ? 600 : 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                {item.title}
              </div>
              <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                {item.body}
              </div>
              <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--industrial-blue-light)', fontWeight: 600 }}>
                Investigate in {item.targetNav.replace('_', ' ').toUpperCase()} <ArrowRight size={12} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
