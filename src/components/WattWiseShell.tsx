import React, { useState } from 'react';
import {
  Zap,
  Activity,
  Shield,
  Clock,
  TrendingUp,
  BarChart3,
  AlertTriangle,
  Receipt,
  FileCheck2,
  FileSpreadsheet,
  Leaf,
  Layers,
  Cpu,
  Radio,
  FileText,
  FolderGit2,
  Building2,
  Users2,
  Webhook,
  HeartPulse,
  Network,
  Search,
  Bell,
  ChevronDown,
  Menu,
  ChevronLeft,
  ChevronRight,
  Globe,
  HelpCircle,
  LogOut,
  ExternalLink,
  LayoutDashboard,
} from 'lucide-react';
import { NavSectionId } from '../types/ui';
import { CURRENT_FACILITY, ALL_FACILITIES, FacilityProfile } from '../data/controlRoomData';

interface WattWiseShellProps {
  currentSection: NavSectionId;
  onNavigate: (section: NavSectionId) => void;
  lang: 'en' | 'ur';
  onToggleLang: () => void;
  onOpenCommandPalette: () => void;
  onOpenNotifications: () => void;
  unreadNotificationsCount?: number;
  onToggleMinimalView?: () => void;
  children: React.ReactNode;
}

interface NavGroup {
  label: string;
  labelUrdu: string;
  items: {
    id: NavSectionId;
    code: string;
    title: string;
    titleUrdu: string;
    icon: React.ComponentType<{ size?: number; className?: string }>;
    badge?: string;
    badgeType?: 'live' | 'warning' | 'critical' | 'blue';
  }[];
}

export const WattWiseShell: React.FC<WattWiseShellProps> = ({
  currentSection,
  onNavigate,
  lang,
  onToggleLang,
  onOpenCommandPalette,
  onOpenNotifications,
  unreadNotificationsCount = 3,
  onToggleMinimalView,
  children,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [facilityDropdownOpen, setFacilityDropdownOpen] = useState(false);
  const [currentFacility, setCurrentFacility] = useState<FacilityProfile>(CURRENT_FACILITY);

  const navGroups: NavGroup[] = [
    {
      label: 'OPERATIONS',
      labelUrdu: 'آپریشنز',
      items: [
        { id: 'command_center', code: '01', title: 'Command Center', titleUrdu: 'کمانڈ سینٹر', icon: Zap },
        { id: 'power_floor', code: '02', title: 'Power Floor', titleUrdu: 'پاور فلور', icon: Activity, badge: '2D PLAN', badgeType: 'blue' },
        { id: 'swiftswitch', code: '03', title: 'SwiftSwitch', titleUrdu: 'سوئفٹ سوئچ', icon: Shield, badge: 'ARMED', badgeType: 'warning' },
        { id: 'loadshift', code: '04', title: 'LoadShift', titleUrdu: 'لوڈ شفٹ', icon: Clock, badge: 'OPT', badgeType: 'live' },
        { id: 'fleet_phase3', code: 'P3', title: 'Fleet Ops & Phase 3', titleUrdu: 'فلیٹ کنٹرول روم', icon: Network, badge: '20 MILLS', badgeType: 'live' },
      ],
    },
    {
      label: 'INTELLIGENCE',
      labelUrdu: 'انٹیلیجنس',
      items: [
        { id: 'grid_forecast', code: '05', title: 'Grid Forecast', titleUrdu: 'گرڈ پیش گوئی', icon: TrendingUp },
        { id: 'energy_analytics', code: '06', title: 'Energy Analytics', titleUrdu: 'توانائی تجزیات', icon: BarChart3 },
        { id: 'anomalies', code: '07', title: 'Anomalies', titleUrdu: 'بے قاعدگیاں', icon: AlertTriangle, badge: '4 ACTIVE', badgeType: 'critical' },
      ],
    },
    {
      label: 'FINANCIAL',
      labelUrdu: 'مالیاتی ریکارڈ',
      items: [
        { id: 'savings_ledger', code: '08', title: 'Savings Ledger', titleUrdu: 'بچت لیجر', icon: Receipt, badge: 'Rs. 5.26M', badgeType: 'live' },
        { id: 'utility_audit', code: '09', title: 'Utility Audit', titleUrdu: 'واپڈا بل آڈٹ', icon: FileCheck2, badge: 'DISPUTE', badgeType: 'warning' },
        { id: 'billing', code: '10', title: 'Billing', titleUrdu: 'انوائسنگ', icon: FileSpreadsheet },
      ],
    },
    {
      label: 'SUSTAINABILITY',
      labelUrdu: 'ماحولیات اور کاربن',
      items: [
        { id: 'carbon_esg', code: '11', title: 'Carbon & ESG', titleUrdu: 'کاربن و ای ایس جی', icon: Leaf, badge: 'CBAM', badgeType: 'blue' },
      ],
    },
    {
      label: 'INFRASTRUCTURE',
      labelUrdu: 'بنیادی ڈھانچہ',
      items: [
        { id: 'assets', code: '12', title: 'Assets', titleUrdu: 'مشینری اور اثاثہ جات', icon: Layers },
        { id: 'edge_controllers', code: '13', title: 'Edge Controllers', titleUrdu: 'ایج کنٹرولرز', icon: Cpu },
        { id: 'sensors', code: '14', title: 'Sensors', titleUrdu: 'سینسر نیٹ ورک', icon: Radio },
      ],
    },
    {
      label: 'REPORTING',
      labelUrdu: 'رپورٹنگ',
      items: [
        { id: 'shift_reports', code: '15', title: 'Shift Reports', titleUrdu: 'شفٹ رپورٹس', icon: FileText },
        { id: 'documents', code: '16', title: 'Documents', titleUrdu: 'دستاویزات', icon: FolderGit2 },
      ],
    },
    {
      label: 'ADMINISTRATION',
      labelUrdu: 'انتظامیہ',
      items: [
        { id: 'facilities', code: '17', title: 'Facilities', titleUrdu: 'فیکٹریاں', icon: Building2 },
        { id: 'access_control', code: '18', title: 'Users & Access', titleUrdu: 'صارفین اور اختیارات', icon: Users2 },
        { id: 'integrations', code: '19', title: 'Integrations', titleUrdu: 'انٹیگریشنز', icon: Webhook },
        { id: 'system_health', code: '20', title: 'System Health', titleUrdu: 'سسٹم کی صحت', icon: HeartPulse },
      ],
    },
    {
      label: 'PHASE 3 SCALE',
      labelUrdu: 'فیز 3 اسکیل',
      items: [
        { id: 'fleet_phase3', code: '21', title: 'Fleet Ops (20 Mills)', titleUrdu: 'فلیٹ کنٹرول روم (20 ملیں)', icon: Network, badge: 'PHASE 3', badgeType: 'live' },
      ],
    },
  ];

  // Helper for current title
  let currentTitle = 'Command Center';
  navGroups.forEach((g) => {
    g.items.forEach((item) => {
      if (item.id === currentSection) {
        currentTitle = lang === 'ur' ? item.titleUrdu : item.title;
      }
    });
  });

  return (
    <div className={`ww-shell ${lang === 'ur' ? 'font-urdu' : ''}`} dir={lang === 'ur' ? 'rtl' : 'ltr'}>
      {/* ========================================================================= */}
      {/* 4. LEFT SIDEBAR (250px expanded / 72px collapsed)                          */}
      {/* ========================================================================= */}
      <aside
        style={{
          width: collapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-expanded-width)',
          backgroundColor: 'var(--bg-surface)',
          borderRight: '1px solid var(--border-subtle)',
          display: 'flex',
          flexDirection: 'column',
          transition: 'width 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 100,
          userSelect: 'none',
        }}
      >
        {/* Logo & Facility Header */}
        <div style={{ padding: collapsed ? '12px 8px' : '14px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, overflow: 'hidden' }}>
              <img
                src="/wattwise-logo.png"
                alt="WattWise"
                style={{
                  width: 32,
                  height: 32,
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 2px 6px rgba(6, 182, 212, 0.4))',
                  flexShrink: 0,
                }}
              />
              {!collapsed && (
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 14, fontWeight: 800, letterSpacing: '0.04em', color: 'var(--text-primary)' }}>
                      WATTWISE™
                    </span>
                    <span className="ww-badge ww-badge-live" style={{ padding: '1px 5px', fontSize: 9 }}>
                      <span className="ww-pulse-green" /> LIVE
                    </span>
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                    Industrial Energy OS
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setCollapsed(!collapsed)}
              className="ww-btn ww-btn-ghost"
              style={{ padding: 4, color: 'var(--text-tertiary)' }}
              title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            >
              {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>
          </div>

          {/* Facility Selector (With ample line padding) */}
          {!collapsed && (
            <div style={{ marginTop: 12, position: 'relative' }}>
              <div
                onClick={() => setFacilityDropdownOpen(!facilityDropdownOpen)}
                style={{
                  backgroundColor: 'var(--bg-surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '12px 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  transition: 'border-color 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
              >
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', marginBottom: 4, lineHeight: 1.4 }}>
                    {currentFacility.name}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: 6, lineHeight: 1.4 }}>
                    <span>{currentFacility.unit}</span>
                    <span>·</span>
                    <span>{currentFacility.city}</span>
                    <span className="num-mono" style={{ color: 'var(--operational-green)', fontSize: 10 }}>● {currentFacility.disco}</span>
                  </div>
                </div>
                <ChevronDown size={14} color="var(--text-tertiary)" />
              </div>

              {facilityDropdownOpen && (
                <div
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    marginTop: 6,
                    backgroundColor: 'var(--bg-surface-elevated)',
                    border: '1px solid var(--border-strong)',
                    borderRadius: 'var(--radius-sm)',
                    boxShadow: 'var(--shadow-elevated)',
                    zIndex: 200,
                    overflow: 'hidden',
                    padding: '4px',
                  }}
                >
                  {ALL_FACILITIES.map((fac) => (
                    <div
                      key={fac.id}
                      onClick={() => {
                        setCurrentFacility(fac);
                        setFacilityDropdownOpen(false);
                      }}
                      style={{
                        padding: '10px 12px',
                        borderRadius: 'var(--radius-xs)',
                        marginBottom: 3,
                        cursor: 'pointer',
                        backgroundColor: currentFacility.id === fac.id ? 'var(--bg-surface-active)' : 'transparent',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = currentFacility.id === fac.id ? 'var(--bg-surface-active)' : 'transparent')}
                    >
                      <div style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3, lineHeight: 1.4 }}>
                        {fac.name} ({fac.unit})
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--text-tertiary)', lineHeight: 1.4 }}>
                        {fac.city} · {fac.disco} · {fac.connectionSanctionedMva} MVA
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scrollable Navigation Groups */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: collapsed ? '8px 4px' : '10px 8px' }}>
          {navGroups.map((group, gIdx) => (
            <div key={gIdx} style={{ marginBottom: 12 }}>
              {!collapsed && (
                <div style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-tertiary)', textTransform: 'uppercase', padding: '6px 8px 4px 8px' }}>
                  {lang === 'ur' ? group.labelUrdu : group.label}
                </div>
              )}
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentSection === item.id;
                return (
                  <div
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    title={collapsed ? (lang === 'ur' ? item.titleUrdu : item.title) : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: collapsed ? 'center' : 'space-between',
                      padding: collapsed ? '9px 0' : '6px 8px',
                      marginBottom: 2,
                      borderRadius: 'var(--radius-xs)',
                      cursor: 'pointer',
                      backgroundColor: isActive ? 'var(--industrial-blue)' : 'transparent',
                      color: isActive ? '#FFFFFF' : 'var(--text-secondary)',
                      transition: 'all 0.12s ease',
                      borderLeft: !collapsed && isActive ? '3px solid #38bdf8' : '3px solid transparent',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)';
                        e.currentTarget.style.color = 'var(--text-primary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = 'var(--text-secondary)';
                      }
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                      <Icon size={16} />
                      {!collapsed && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span className="num-mono" style={{ fontSize: 10, color: isActive ? '#bae6fd' : 'var(--text-tertiary)' }}>
                            {item.code}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: isActive ? 600 : 500 }}>
                            {lang === 'ur' ? item.titleUrdu : item.title}
                          </span>
                        </div>
                      )}
                    </div>
                    {!collapsed && item.badge && (
                      <span
                        className={`ww-badge ww-badge-${item.badgeType || 'neutral'}`}
                        style={{ fontSize: 9, padding: '1px 5px' }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Sidebar Footer: User & Controls */}
        <div style={{ padding: collapsed ? '10px 4px' : '10px 14px', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-elevated)' }}>
          {!collapsed ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    backgroundColor: 'var(--industrial-blue)',
                    color: '#FFFFFF',
                    fontSize: 11,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  HR
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: 11.5, fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
                    Hammad Raza
                  </div>
                  <div style={{ fontSize: 9.5, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                    Energy Director
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <button
                  onClick={onToggleLang}
                  className="ww-btn ww-btn-ghost"
                  style={{ padding: '3px 6px', fontSize: 10, fontWeight: 700 }}
                  title="Switch Language (English / اردو)"
                >
                  {lang === 'en' ? 'اردو' : 'EN'}
                </button>
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  backgroundColor: 'var(--industrial-blue)',
                  color: '#FFFFFF',
                  fontSize: 11,
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                HR
              </div>
              <button
                onClick={onToggleLang}
                className="ww-btn ww-btn-ghost"
                style={{ padding: 4, fontSize: 10, fontWeight: 700 }}
              >
                {lang === 'en' ? 'UR' : 'EN'}
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* ========================================================================= */}
      {/* 5. TOP COMMAND BAR & MAIN CANVAS                                          */}
      {/* ========================================================================= */}
      <div className="ww-main-viewport">
        {/* Top Command Bar */}
        <header
          style={{
            height: 'var(--topbar-height)',
            backgroundColor: 'var(--bg-surface)',
            borderBottom: '1px solid var(--border-subtle)',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            zIndex: 90,
          }}
        >
          {/* Left: Breadcrumbs */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11.5, color: 'var(--text-secondary)' }}>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{currentFacility.name}</span>
            <span>/</span>
            <span>{currentFacility.unit}</span>
            <span>/</span>
            <span style={{ color: 'var(--industrial-blue-light)', fontWeight: 600 }}>{currentTitle}</span>
          </div>

          {/* Center: Global Search Trigger (⌘ K) */}
          <button
            onClick={onOpenCommandPalette}
            style={{
              flex: 1,
              maxWidth: 420,
              height: 30,
              backgroundColor: 'var(--bg-canvas)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-xs)',
              padding: '0 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              transition: 'border-color 0.15s ease',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-strong)')}
            onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-subtle)')}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11.5 }}>
              <Search size={14} color="var(--text-tertiary)" />
              <span>Search machines, sensors, events, reports...</span>
            </div>
            <span className="num-mono" style={{ fontSize: 10, padding: '1px 5px', borderRadius: 3, backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
              ⌘ K
            </span>
          </button>

          {/* Right: Telemetry Latency, Outage Risk, Notifications & Profile */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {/* Live Connection Latency */}
            <div
              className="num-mono"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 8px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--bg-surface-elevated)',
                border: '1px solid var(--border-subtle)',
                fontSize: 11,
                color: 'var(--text-primary)',
              }}
              title="Telemetry edge sync status via Modbus RS-485 / MQTT"
            >
              <span className="ww-pulse-green" />
              <span style={{ fontWeight: 700, color: 'var(--operational-green)' }}>LIVE</span>
              <span style={{ color: 'var(--text-tertiary)' }}>142 ms</span>
            </div>

            {/* Outage Risk Pill */}
            <div
              onClick={() => onNavigate('swiftswitch')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '3px 8px',
                borderRadius: 'var(--radius-xs)',
                backgroundColor: 'var(--energy-amber-bg)',
                border: '1px solid rgba(216, 155, 36, 0.4)',
                fontSize: 11,
                cursor: 'pointer',
              }}
              title="Predicted grid feeder interruption in 09m 42s"
            >
              <span className="ww-pulse-amber" />
              <span style={{ fontWeight: 700, color: 'var(--energy-amber)' }}>OUTAGE RISK: 87%</span>
              <span className="num-mono" style={{ color: 'var(--text-primary)' }}>14:37 PKT</span>
            </div>

            {/* SwiftSwitch Status */}
            <span
              className="ww-badge ww-badge-warning"
              style={{ cursor: 'pointer' }}
              onClick={() => onNavigate('swiftswitch')}
            >
              <Shield size={11} /> ARMED
            </span>

            {/* Notification Bell */}
            <button
              onClick={onOpenNotifications}
              className="ww-btn ww-btn-ghost"
              style={{ position: 'relative', padding: 6 }}
              title="Operational Notifications"
            >
              <Bell size={16} />
              {unreadNotificationsCount > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: 2,
                    right: 2,
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    backgroundColor: 'var(--critical-red)',
                    color: '#FFFFFF',
                    fontSize: 9,
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Return to Dashboard View Button (No emojis) */}
            {onToggleMinimalView && (
              <button
                onClick={onToggleMinimalView}
                className="ww-btn"
                style={{
                  padding: '6px 12px',
                  fontSize: 11.5,
                  fontWeight: 700,
                  backgroundColor: 'rgba(13, 148, 136, 0.12)',
                  color: '#0d9488',
                  border: '1px solid rgba(13, 148, 136, 0.35)',
                  borderRadius: 'var(--radius-xs)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  cursor: 'pointer',
                  marginRight: 4,
                }}
                title="Return to Dashboard"
              >
                <LayoutDashboard size={13} />
                <span>Return to Dashboard</span>
              </button>
            )}
          </div>
        </header>

        {/* Subtle Power Trace Motif */}
        <div className="ww-power-trace" />

        {/* Working Canvas for Current View */}
        <main className="ww-canvas-content">
          {children}
        </main>
      </div>
    </div>
  );
};
