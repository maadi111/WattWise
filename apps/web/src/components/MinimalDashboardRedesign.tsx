import React, { useState, useEffect } from 'react';
import {
  Factory,
  Building2,
  Activity,
  FileText,
  TrendingUp,
  Clock,
  Leaf,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Shield,
  Cpu,
  Layers,
  Download,
  Share2,
  Compass,
  ChevronDown,
  ChevronRight,
  X,
  Sparkles,
  BarChart3,
  Receipt,
  Check,
  Radio,
  Search,
  Network,
  Bell,
  Sliders,
  FileCheck2,
  FileSpreadsheet,
  FolderGit2,
  Users2,
  Webhook,
  HeartPulse,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { industrialAudio } from '../services/soundEffects';
import { SubstationCommissioningWizard } from './SubstationCommissioningWizard';
import { ALL_FACILITIES, CURRENT_FACILITY, DEMO_MACHINES, FacilityProfile } from '../data/controlRoomData';
import { CommandPalette } from './CommandPalette';
import { NotificationCenter } from './NotificationCenter';
import { MachineInspector } from './MachineInspector';
import { ProductPitchOverview } from './ProductPitchOverview';
import { ProductionRoadmapGuide } from './ProductionRoadmapGuide';
import { MachineDetail, NavSectionId } from '../types/ui';

// Lazy-loaded Full Views
const CommandCenterView = React.lazy(() => import('../views/CommandCenterView').then((m) => ({ default: m.CommandCenterView })));
const PowerFloorView = React.lazy(() => import('../views/PowerFloorView').then((m) => ({ default: m.PowerFloorView })));
const SwiftSwitchView = React.lazy(() => import('../views/SwiftSwitchView').then((m) => ({ default: m.SwiftSwitchView })));
const LoadShiftView = React.lazy(() => import('../views/LoadShiftView').then((m) => ({ default: m.LoadShiftView })));
const GridForecastView = React.lazy(() => import('../views/GridForecastView').then((m) => ({ default: m.GridForecastView })));
const AnalyticsView = React.lazy(() => import('../views/AnalyticsView').then((m) => ({ default: m.AnalyticsView })));
const AnomaliesView = React.lazy(() => import('../views/AnomaliesView').then((m) => ({ default: m.AnomaliesView })));
const SavingsLedgerView = React.lazy(() => import('../views/SavingsLedgerView').then((m) => ({ default: m.SavingsLedgerView })));
const UtilityAuditView = React.lazy(() => import('../views/UtilityAuditView').then((m) => ({ default: m.UtilityAuditView })));
const BillingView = React.lazy(() => import('../views/BillingView').then((m) => ({ default: m.BillingView })));
const CarbonEsgView = React.lazy(() => import('../views/CarbonEsgView').then((m) => ({ default: m.CarbonEsgView })));
const AssetsView = React.lazy(() => import('../views/AssetsView').then((m) => ({ default: m.AssetsView })));
const EdgeControllersView = React.lazy(() => import('../views/EdgeControllersView').then((m) => ({ default: m.EdgeControllersView })));
const SensorNetworkView = React.lazy(() => import('../views/SensorNetworkView').then((m) => ({ default: m.SensorNetworkView })));
const ShiftReportsView = React.lazy(() => import('../views/ShiftReportsView').then((m) => ({ default: m.ShiftReportsView })));
const DocumentsView = React.lazy(() => import('../views/DocumentsView').then((m) => ({ default: m.DocumentsView })));
const FacilitiesView = React.lazy(() => import('../views/FacilitiesView').then((m) => ({ default: m.FacilitiesView })));
const AccessControlView = React.lazy(() => import('../views/AccessControlView').then((m) => ({ default: m.AccessControlView })));
const IntegrationsView = React.lazy(() => import('../views/IntegrationsView').then((m) => ({ default: m.IntegrationsView })));
const SystemHealthView = React.lazy(() => import('../views/SystemHealthView').then((m) => ({ default: m.SystemHealthView })));
const FleetOperationsView = React.lazy(() => import('../views/FleetOperationsView').then((m) => ({ default: m.FleetOperationsView })));

interface MinimalDashboardRedesignProps {
  onOpenFleetOperations?: () => void;
  onOpenCommissioningWizard?: () => void;
  onToggleScadaView?: () => void;
  initialTab?: NavSectionId;
}

interface NavGroup {
  label: string;
  labelUrdu: string;
  items: {
    id: NavSectionId;
    code: string;
    title: string;
    titleUrdu: string;
    icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
    badge?: string;
    badgeType?: 'live' | 'warning' | 'critical' | 'blue';
  }[];
}

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
];

export const MinimalDashboardRedesign: React.FC<MinimalDashboardRedesignProps> = ({
  onOpenFleetOperations: _onOpenFleetOperations,
  onOpenCommissioningWizard: _onOpenCommissioningWizard,
  onToggleScadaView: _onToggleScadaView,
  initialTab = 'command_center',
}) => {
  // Lock exclusively to light theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  // Language state
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const isUrdu = lang === 'ur';

  // Read optional URL parameters for deep-linking & direct section access
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
  const initialSectionFromUrl = urlParams?.get('tab') as NavSectionId | null;
  const initialScadaFromUrl = urlParams?.get('scada') === 'true';
  const initialModalFromUrl = urlParams?.get('modal') as any;

  // Active navigation section
  const [activeSection, setActiveSection] = useState<NavSectionId>(
    initialSectionFromUrl || (initialTab && (initialTab as any) !== 'EXECUTIVE_SUMMARY' ? initialTab : 'command_center')
  );
  // Inside Command Center: toggle between Minimal Executive Summary & SCADA Control Room
  const [scadaControlRoomActive, setScadaControlRoomActive] = useState<boolean>(initialScadaFromUrl);

  // Facility profile state
  const [currentFacility, setCurrentFacility] = useState<FacilityProfile>(CURRENT_FACILITY);
  const [facilityDropdownOpen, setFacilityDropdownOpen] = useState(false);

  // Modal / Card Details State (Progressive Disclosure)
  const [activeModal, setActiveModal] = useState<
    | null
    | 'FACTORY_DETAILS'
    | 'SAVINGS_DRAWER'
    | 'PERCENT_SAVINGS_DRAWER'
    | 'GEN_HOURS_DRAWER'
    | 'CARBON_DRAWER'
    | 'URDU_REPORT_DAY'
    | 'URDU_REPORT_NIGHT'
    | 'CRISIS_MODAL'
    | 'SECTOR_MODAL'
    | 'FLEET_DRAWER'
    | 'SCADA_GRID_MODAL'
    | 'SCADA_ATS_MODAL'
    | 'SCADA_LOADSHIFT_MODAL'
    | 'SCADA_SAVINGS_MODAL'
    | 'MACHINE_INSPECT_MODAL'
  >(initialModalFromUrl || null);

  // Drawers and Modals State
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(urlParams?.get('cmd') === 'true');
  const [notificationsOpen, setNotificationsOpen] = useState(urlParams?.get('notif') === 'true');
  const [pitchOpen, setPitchOpen] = useState(urlParams?.get('pitch') === 'true');
  const [roadmapOpen, setRoadmapOpen] = useState(urlParams?.get('roadmap') === 'true');
  const [inspectedMachine, setInspectedMachine] = useState<MachineDetail | null>(null);

  // Global Keyboard Shortcut: ⌘ K or Ctrl+K for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Commissioning Wizard Modal State
  const [wizardOpen, setWizardOpen] = useState(urlParams?.get('wizard') === 'true');

  // Toast feedback state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleToggleLang = () => {
    industrialAudio.playRelayClick();
    const nextLang = lang === 'en' ? 'ur' : 'en';
    setLang(nextLang);
    triggerToast(nextLang === 'ur' ? 'اردو موڈ فعال ہو گیا' : 'Switched to English Mode');
  };

  const handleCardClick = (modalId: any) => {
    industrialAudio.playRelayClick();
    setActiveModal(modalId);
  };

  const handleNavClick = (sectionId: NavSectionId) => {
    industrialAudio.playRelayClick();
    setActiveSection(sectionId);
    setScadaControlRoomActive(false);
  };

  const handleInspectMachineById = (id: string) => {
    const found = DEMO_MACHINES.find((m) => m.id === id) || DEMO_MACHINES[0];
    setInspectedMachine(found as MachineDetail);
  };

  const getSectionTitle = (secId: NavSectionId) => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (item.id === secId) {
          return isUrdu ? item.titleUrdu : item.title;
        }
      }
    }
    return isUrdu ? 'کمانڈ سینٹر' : 'Command Center';
  };

  const renderNavBadge = (badge?: string, badgeType?: 'live' | 'warning' | 'critical' | 'blue') => {
    if (!badge) return null;
    let bg = '#dcfce7';
    let text = '#15803d';
    let border = 'rgba(21, 128, 61, 0.2)';
    if (badgeType === 'warning') {
      bg = '#fef3c7';
      text = '#b45309';
      border = 'rgba(180, 83, 9, 0.2)';
    } else if (badgeType === 'critical') {
      bg = '#fee2e2';
      text = '#dc2626';
      border = 'rgba(220, 38, 38, 0.2)';
    } else if (badgeType === 'blue') {
      bg = '#e0f2fe';
      text = '#0284c7';
      border = 'rgba(2, 132, 199, 0.2)';
    }
    return (
      <span
        style={{
          fontSize: '9px',
          fontWeight: 800,
          padding: '2px 5px',
          borderRadius: '4px',
          background: bg,
          color: text,
          border: `1px solid ${border}`,
          letterSpacing: '0.02em',
          fontFamily: 'monospace',
          whiteSpace: 'nowrap',
        }}
      >
        {badge}
      </span>
    );
  };

  const handleSimulateWhatsApp = () => {
    industrialAudio.playSuccessChime();
    confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    triggerToast('WhatsApp digest dispatched to Mill Director (+92 300 8472911)');
  };

  const handleAtsTestFire = () => {
    industrialAudio.playPreSwitchAlert();
    confetti({ particleCount: 90, spread: 70, origin: { y: 0.5 } });
    triggerToast('SwiftSwitch™ 0.83ms ATS Test Fire Executed! Contactor synchronized.');
  };

  // Pure Serene Mint / Light Color Tokens (No dark mode)
  const c = {
    bgCanvas: 'linear-gradient(135deg, #e6f7f2 0%, #f0fdf9 40%, #e8f5f1 100%)',
    bgCard: '#ffffff',
    bgCardElevated: '#f8fafc',
    bgCardInteractive: '#f0fdf9',
    bgPill: '#eaf4f2',
    bgPillActive: '#ffffff',
    border: 'rgba(209, 231, 227, 0.85)',
    borderSubtle: '#eef3f2',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    accent: '#0d9488',
    accentDark: '#0f766e',
    accentSoft: '#e6f7f2',
    shadow: '0 20px 60px rgba(18, 75, 99, 0.08), 0 1px 3px rgba(0, 0, 0, 0.02)',
    modalOverlay: 'rgba(15, 23, 42, 0.45)',
  };

  const modalBackdropStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: c.modalOverlay,
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
    animation: 'fadeIn 0.2s ease-out',
  };

  const modalContainerStyle: React.CSSProperties = {
    background: c.bgCard,
    border: `1px solid ${c.border}`,
    borderRadius: '20px',
    boxShadow: '0 25px 60px rgba(18, 75, 99, 0.16)',
    width: '100%',
    maxWidth: '680px',
    maxHeight: '90vh',
    overflowY: 'auto',
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    color: c.textPrimary,
  };

  const modalHeaderStyle: React.CSSProperties = {
    padding: '20px 24px',
    borderBottom: `1px solid ${c.borderSubtle}`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: c.bgCardElevated,
  };

  const closeBtnStyle: React.CSSProperties = {
    background: '#f1f5f9',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: c.textSecondary,
    transition: 'all 0.15s ease',
  };

  return (
    <div
      style={{
        height: '100vh',
        maxHeight: '100vh',
        width: '100%',
        background: c.bgCanvas,
        position: 'relative',
        padding: '14px 24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: isUrdu ? 'var(--font-urdu, "Noto Nastaliq Urdu", serif)' : 'var(--font-sans, "Plus Jakarta Sans", sans-serif)',
        overflow: 'hidden',
        color: c.textPrimary,
      }}
    >
      {/* Decorative Botanical Leaf Silhouettes */}
      <svg
        style={{ position: 'fixed', top: -10, right: -10, width: 220, height: 220, opacity: 0.18, pointerEvents: 'none' }}
        viewBox="0 0 200 200"
        fill={c.accent}
      >
        <path d="M180,0 C120,20 80,80 70,140 C60,110 50,70 10,60 C40,110 70,160 110,180 C150,150 180,90 200,30 Z" />
      </svg>
      <svg
        style={{ position: 'fixed', bottom: -20, left: -20, width: 260, height: 260, opacity: 0.14, pointerEvents: 'none' }}
        viewBox="0 0 200 200"
        fill={c.accentDark}
      >
        <path d="M0,180 C40,140 90,120 150,120 C120,150 90,180 50,200 Z M30,100 C70,90 120,70 180,40 C140,80 100,130 60,160 Z" />
      </svg>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '24px',
            right: '32px',
            background: c.bgCard,
            border: `1px solid ${c.accent}`,
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.25)',
            color: c.textPrimary,
            padding: '12px 20px',
            borderRadius: '12px',
            zIndex: 10000,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.875rem',
            fontWeight: 600,
            animation: 'fadeIn 0.25s ease-out',
          }}
        >
          <Sparkles size={16} color={c.accent} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP HEADER BAR (Logo, Subtitle, Facility Switcher with increased line padding, Search, Language, Wizard) */}
      <div
        style={{
          width: '100%',
          maxWidth: '1360px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px',
          padding: '0 4px',
          flexWrap: 'wrap',
          gap: '12px',
          flexShrink: 0,
        }}
      >
        {/* Left: Brand Logo & Facility Selector (With ample line padding) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src="/wattwise-logo.png"
              alt="WattWise Logo"
              style={{
                height: '38px',
                width: 'auto',
                maxWidth: '44px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 2px 8px rgba(6, 182, 212, 0.3))',
              }}
            />
            <span style={{ fontSize: '22px', fontWeight: 800, color: c.textPrimary, letterSpacing: '-0.02em' }}>
              Watt<span style={{ color: c.accent }}>Wise</span>
            </span>
          </div>

          {/* Select Mill Dropdown Button with enhanced line padding */}
          <div style={{ position: 'relative' }}>
            <button
              id="facility-selector-btn"
              onClick={() => setFacilityDropdownOpen((prev) => !prev)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                background: '#ffffff',
                border: `1px solid rgba(209, 231, 227, 0.9)`,
                borderRadius: '12px',
                padding: '12px 18px',
                color: c.textPrimary,
                cursor: 'pointer',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                transition: 'all 0.15s ease',
              }}
            >
              <Building2 size={18} color={c.accent} />
              <div style={{ textAlign: 'left', lineHeight: 1.6 }}>
                <div style={{ fontSize: '13px', fontWeight: 700, color: c.textPrimary, marginBottom: '6px' }}>
                  {currentFacility.name} ({currentFacility.unit})
                </div>
                <div style={{ fontSize: '11.5px', color: c.textSecondary, lineHeight: 1.5 }}>
                  {currentFacility.city} · {currentFacility.disco} 11kV Feeder
                </div>
              </div>
              <ChevronDown size={14} color={c.textMuted} style={{ marginLeft: '6px' }} />
            </button>

            {facilityDropdownOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  width: '340px',
                  background: '#ffffff',
                  border: `1px solid ${c.border}`,
                  borderRadius: '14px',
                  boxShadow: '0 16px 36px rgba(18, 75, 99, 0.12)',
                  zIndex: 1000,
                  overflow: 'hidden',
                  padding: '8px',
                }}
              >
                {ALL_FACILITIES.map((fac) => (
                  <div
                    key={fac.id}
                    onClick={() => {
                      setCurrentFacility(fac);
                      setFacilityDropdownOpen(false);
                      triggerToast(`Switched active facility to ${fac.name}`);
                    }}
                    style={{
                      padding: '14px 18px',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      background: currentFacility.id === fac.id ? c.bgCardInteractive : 'transparent',
                      border: currentFacility.id === fac.id ? `1px solid ${c.border}` : '1px solid transparent',
                      marginBottom: '6px',
                      transition: 'all 0.15s ease',
                    }}
                    onMouseEnter={(e) => {
                      if (currentFacility.id !== fac.id) e.currentTarget.style.background = '#f8fafc';
                    }}
                    onMouseLeave={(e) => {
                      if (currentFacility.id !== fac.id) e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{ fontSize: '13px', fontWeight: 700, color: c.textPrimary, marginBottom: '6px', lineHeight: 1.4 }}>
                      {fac.name} ({fac.unit})
                    </div>
                    <div style={{ fontSize: '11.5px', color: c.textSecondary, lineHeight: 1.5 }}>
                      {fac.city} · {fac.disco} · {fac.connectionSanctionedMva} MVA Sanctioned
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center: Hero Subtitle */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Zap size={18} color={c.accent} fill={c.accent} />
            <h1 style={{ fontSize: '17px', fontWeight: 800, color: c.textPrimary, margin: 0 }}>
              Industrial Energy Intelligence Platform
            </h1>
          </div>
          <div style={{ fontSize: '12px', color: c.textSecondary, marginTop: '2px', fontWeight: 500 }}>
            {isUrdu
              ? 'پاکستان کے مینوفیکچرنگ سیکٹر کے لیے مصنوعی ذہانت سے لیس توانائی کنٹرول سسٹم'
              : "AI-Powered Energy Intelligence for Pakistan's Manufacturing"}
          </div>
        </div>

        {/* Right: Operational Telemetry & Quick Action Controls (Zero emojis) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          {/* Outage Risk Pill */}
          <div
            id="top-outage-risk-pill"
            onClick={() => handleNavClick('swiftswitch')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 10px',
              borderRadius: '8px',
              background: '#fef3c7',
              border: '1px solid rgba(217, 119, 6, 0.3)',
              fontSize: '11px',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            title="Predicted grid feeder interruption in 09m 42s — Click to inspect SwiftSwitch"
          >
            <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />
            <span style={{ fontWeight: 800, color: '#b45309' }}>OUTAGE RISK: 87%</span>
            <span style={{ fontFamily: 'monospace', color: '#92400e', fontWeight: 600 }}>14:37 PKT</span>
          </div>

          {/* SwiftSwitch Status */}
          <span
            id="top-swiftswitch-pill"
            onClick={() => handleNavClick('swiftswitch')}
            style={{
              cursor: 'pointer',
              background: '#e0f2fe',
              color: '#0284c7',
              border: '1px solid rgba(2, 132, 199, 0.25)',
              padding: '6px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
            }}
            title="SwiftSwitch™ Sub-Cycle ATS Armed (0.83ms)"
          >
            <Shield size={12} />
            <span>ARMED (0.83ms)</span>
          </span>

          {/* Quick Search Trigger (⌘K) */}
          <div
            id="top-search-trigger"
            onClick={() => setCommandPaletteOpen(true)}
            style={{
              position: 'relative',
              cursor: 'pointer',
            }}
            title="Global Search & Machine Registry (⌘K)"
          >
            <div
              style={{
                background: '#ffffff',
                border: `1px solid ${c.border}`,
                borderRadius: '8px',
                padding: '6px 10px 6px 28px',
                fontSize: '11px',
                color: c.textMuted,
                width: '145px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>{isUrdu ? 'تلاش کریں...' : 'Search...'}</span>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  padding: '1px 4px',
                  borderRadius: '3px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  color: '#475569',
                }}
              >
                ⌘K
              </span>
            </div>
            <Search size={12} color={c.textMuted} style={{ position: 'absolute', left: 9, top: 8 }} />
          </div>

          {/* Notification Bell with unread counter */}
          <button
            id="top-notification-bell"
            onClick={() => setNotificationsOpen(true)}
            style={{
              position: 'relative',
              background: '#ffffff',
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
              padding: '6px 9px',
              cursor: 'pointer',
              color: c.textSecondary,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
            title="Operational Notifications (3 unread)"
          >
            <Bell size={15} />
            <span
              style={{
                position: 'absolute',
                top: -3,
                right: -3,
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: '#dc2626',
                color: '#ffffff',
                fontSize: '8.5px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1.5px solid #ffffff',
              }}
            >
              3
            </span>
          </button>

          {/* Urdu / English Language Toggle */}
          <button
            id="btn-urdu-toggle"
            onClick={handleToggleLang}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: '#ffffff',
              color: c.accent,
              border: `1px solid ${c.border}`,
              padding: '6px 11px',
              borderRadius: '8px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <span>{isUrdu ? 'English' : 'اردو'}</span>
            <RotateCcw size={11} />
          </button>

          {/* 3-Hr Substation Commissioning Wizard Button */}
          <button
            id="btn-substation-wizard"
            onClick={() => setWizardOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              background: 'linear-gradient(135deg, #0d9488, #059669)',
              color: '#ffffff',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '11.5px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <Compass size={13} />
            <span>3-Hr Wizard</span>
          </button>

          {/* User Profile Avatar */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              padding: '4px 8px 4px 5px',
              background: '#ffffff',
              border: `1px solid ${c.border}`,
              borderRadius: '8px',
            }}
          >
            <div
              style={{
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #0d9488, #059669)',
                color: '#ffffff',
                fontSize: '9.5px',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              HR
            </div>
            <div style={{ textAlign: 'left', lineHeight: 1.1 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: c.textPrimary }}>Hammad Raza</div>
              <div style={{ fontSize: '8.5px', color: c.textMuted }}>Energy Director</div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN FLOATED MINIMAL CONTAINER CARD (WITH SMOOTH INNER SCROLLING) */}
      <div
        style={{
          width: '100%',
          maxWidth: '1360px',
          flex: 1,
          height: 'calc(100vh - 85px)',
          maxHeight: 'calc(100vh - 85px)',
          minHeight: 0,
          background: c.bgCard,
          borderRadius: '24px',
          boxShadow: c.shadow,
          border: `1px solid ${c.border}`,
          overflow: 'hidden',
          display: 'flex',
          transition: 'all 0.3s ease',
        }}
      >
        {/* LEFT MINIMAL RAIL SIDEBAR - ALL 21 SECTIONS RESTORED */}
        <div
          style={{
            width: '225px',
            background: c.bgCard,
            borderRight: `1px solid ${c.borderSubtle}`,
            padding: '14px 8px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'stretch',
            flexShrink: 0,
            height: '100%',
            overflowY: 'auto',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%' }}>
            {navGroups.map((group, gIdx) => (
              <div key={gIdx} style={{ width: '100%' }}>
                {/* Group Label */}
                <div
                  style={{
                    fontSize: '9.5px',
                    fontWeight: 800,
                    color: c.textMuted,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    padding: '4px 8px 3px 8px',
                  }}
                >
                  {isUrdu ? group.labelUrdu : group.label}
                </div>

                {/* Items in this group */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', width: '100%' }}>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        id={`nav-btn-${item.id}`}
                        onClick={() => handleNavClick(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          width: '100%',
                          padding: '6px 8px',
                          borderRadius: '8px',
                          border: 'none',
                          background: isActive ? c.accentSoft : 'transparent',
                          color: isActive ? c.accent : c.textSecondary,
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                          textAlign: 'left',
                          borderLeft: isActive ? `3px solid ${c.accent}` : '3px solid transparent',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px', minWidth: 0, overflow: 'hidden' }}>
                          <Icon size={14} color={isActive ? c.accent : c.textMuted} />
                          <span
                            style={{
                              fontSize: '10px',
                              fontFamily: 'monospace',
                              fontWeight: 700,
                              color: isActive ? c.accent : c.textMuted,
                              minWidth: '16px',
                            }}
                          >
                            {item.code}
                          </span>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: isActive ? 700 : 500,
                              color: isActive ? c.textPrimary : c.textSecondary,
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {isUrdu ? item.titleUrdu : item.title}
                          </span>
                        </div>

                        {item.badge && (
                          <div style={{ flexShrink: 0, marginLeft: '4px' }}>
                            {renderNavBadge(item.badge, item.badgeType)}
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Live Pulse Status */}
          <div style={{ textAlign: 'center', width: '100%', paddingTop: '10px', marginTop: '12px', borderTop: `1px solid ${c.borderSubtle}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>142ms</span>
            </div>
            <div style={{ fontSize: '9px', color: c.textMuted, marginTop: '2px' }}>Modbus Live · 20 Mills</div>
          </div>
        </div>

        {/* RIGHT CONTENT AREA WITH INDEPENDENT SCROLLING */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', minWidth: 0, minHeight: 0, overflow: 'hidden' }}>
          {/* TOP HEADER BAR: Active Module Breadcrumb & Zero-Downtime Telemetry */}
          <div
            id="top-pane-header"
            style={{
              padding: '12px 24px',
              borderBottom: `1px solid ${c.borderSubtle}`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: c.bgCardElevated,
              flexShrink: 0,
            }}
          >
            {/* Active Module Title / Breadcrumb */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '11px', color: c.textMuted, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {isUrdu ? 'ماڈیول' : 'Module'}
              </span>
              <span style={{ color: c.border, fontWeight: 300 }}>/</span>
              <span style={{ fontSize: '13px', color: c.accent, fontWeight: 800 }}>
                {getSectionTitle(activeSection)}
              </span>

              {/* If on Command Center, provide a toggle between Executive Summary & SCADA Control Room */}
              {activeSection === 'command_center' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginLeft: '12px' }}>
                  <button
                    onClick={() => setScadaControlRoomActive(false)}
                    style={{
                      background: !scadaControlRoomActive ? c.accent : 'transparent',
                      color: !scadaControlRoomActive ? '#ffffff' : c.textSecondary,
                      border: !scadaControlRoomActive ? 'none' : `1px solid ${c.border}`,
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isUrdu ? 'ایگزیکٹو خلاصہ' : 'Executive Summary'}
                  </button>
                  <button
                    onClick={() => setScadaControlRoomActive(true)}
                    style={{
                      background: scadaControlRoomActive ? c.accent : 'transparent',
                      color: scadaControlRoomActive ? '#ffffff' : c.textSecondary,
                      border: scadaControlRoomActive ? 'none' : `1px solid ${c.border}`,
                      padding: '3px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {isUrdu ? 'اسکاڈا کنٹرول روم' : 'SCADA Control Room'}
                  </button>
                </div>
              )}
            </div>

            {/* Quick Status Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#0d9488',
                  background: '#e6f7f2',
                  border: '1px solid #bbf7d0',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
                title="Calibrated simulation profile based on Crescent Weaving & Dyeing Mills (80 Airjet Looms, FESCO 11kV Feeder). Connect physical Modbus RS-485 edge hardware for live facility telemetry."
              >
                <Activity size={12} />
                <span>SIMULATION BENCHMARK (415V)</span>
              </span>
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#059669',
                  background: '#dcfce7',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                }}
              >
                <CheckCircle2 size={12} />
                <span>Zero-Downtime Live</span>
              </span>
            </div>
          </div>

          {/* MAIN CANVAS BODY WITH SMOOTH SCROLLING */}
          <div
            className="minimal-scroll"
            style={{
              padding: '24px 28px',
              flex: 1,
              minHeight: 0,
              maxHeight: '100%',
              overflowY: 'auto',
              overflowX: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            {/* ========================================================================= */}
            {/* VIEW 1: EXECUTIVE SUMMARY (ZERO EMOJIS - CRISP PROFESSIONAL ICONS)        */}
            {/* ========================================================================= */}
            {activeSection === 'command_center' && !scadaControlRoomActive && (
              <>
                {/* Section Title with Decorative Water Waves */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: c.textPrimary, margin: 0 }}>
                      {isUrdu ? 'ایگزیکٹو خلاصہ — صنعتی توانائی انٹیلیجنس' : 'Executive Summary'}
                    </h2>
                    <div style={{ fontSize: '11px', color: c.textSecondary, marginTop: '2px' }}>
                      {isUrdu
                        ? `${currentFacility.name} (${currentFacility.unit}) · لائیو گریڈ اور جنریٹر بچت کارکردگی`
                        : `${currentFacility.name} (${currentFacility.unit}) · Real-time savings & grid mitigation`}
                    </div>
                  </div>

                  {/* Decorative Subtle Wave Lines */}
                  <svg width="80" height="24" viewBox="0 0 80 24" fill="none" stroke={c.textMuted} strokeWidth="1.5" opacity="0.6">
                    <path d="M0,12 Q20,3 40,12 T80,12 M0,18 Q20,9 40,18 T80,18" />
                  </svg>
                </div>

                {/* Top Interactive Grid: Factory Illustration (Left) + 4 Metrics (Center) + 2 Urdu Shift Cards (Right) */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(240px, 1.1fr) minmax(360px, 1.8fr) minmax(220px, 1fr)',
                    gap: '16px',
                    alignItems: 'stretch',
                  }}
                >
                  {/* Card 1: Serene Factory & Solar Substation Illustration */}
                  <div
                    id="factory-illustration-btn"
                    onClick={() => handleCardClick('FACTORY_DETAILS')}
                    className="minimal-card-hover"
                    style={{
                      background: c.bgCard,
                      border: `1px solid ${c.border}`,
                      borderRadius: '16px',
                      padding: '16px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      position: 'relative',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                      <div>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: c.textPrimary }}>
                          {currentFacility.unit} Substation
                        </span>
                        <div style={{ fontSize: '10px', color: c.textSecondary }}>11kV / 415V Dual Transformer</div>
                      </div>
                      <span
                        style={{
                          fontSize: '9px',
                          fontWeight: 700,
                          background: '#dcfce7',
                          color: '#059669',
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        CONNECTED
                      </span>
                    </div>

                    {/* Clean SVG Factory & Solar Micro-Illustration */}
                    <div style={{ width: '100%', height: '110px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg viewBox="0 0 320 160" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                        <rect x="0" y="0" width="320" height="160" rx="12" fill="#f0fdf9" />
                        <path d="M10,135 Q80,125 160,135 T310,135 L310,155 L10,155 Z" fill="#e6f7f2" />
                        <circle cx="270" cy="40" r="18" fill="#fef08a" opacity={0.8} />
                        <line x1="270" y1="16" x2="270" y2="10" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
                        <line x1="294" y1="40" x2="300" y2="40" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
                        <line x1="287" y1="23" x2="292" y2="18" stroke="#eab308" strokeWidth="2" strokeLinecap="round" />
                        <rect x="180" y="80" width="10" height="50" fill="#94a3b8" />
                        <rect x="195" y="65" width="12" height="65" fill="#64748b" />
                        <rect x="60" y="85" width="160" height="50" rx="4" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
                        <path d="M60,85 L85,70 L110,85 L135,70 L160,85 L185,70 L210,85 L220,85 L220,135 L60,135 Z" fill="#0f766e" opacity={0.85} />
                        <polygon points="230,120 280,105 295,125 245,140" fill="#0369a1" stroke={c.accent} strokeWidth="1" />
                        <line x1="242" y1="116" x2="257" y2="136" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                        <line x1="255" y1="112" x2="270" y2="132" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                        <line x1="268" y1="108" x2="283" y2="128" stroke="#ffffff" strokeWidth="1" opacity="0.6" />
                        <circle cx="95" cy="50" r="10" fill="#ffffff" stroke={c.accent} strokeWidth="2" />
                        <path d="M92,48 L98,48 M95,45 L95,53" stroke={c.accent} strokeWidth="2" strokeLinecap="round" />
                      </svg>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '10px', color: c.accent, fontWeight: 700 }}>Click to reveal transformer map</span>
                      <ChevronRight size={14} color={c.accent} />
                    </div>
                  </div>

                  {/* 2x2 Clean Minimal Stat Cards (NO EMOJIS - PROFESSIONAL LUCIDE ICONS) */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    {/* Stat 1: Total Verified Savings */}
                    <div
                      id="card-total-savings"
                      onClick={() => handleCardClick('SAVINGS_DRAWER')}
                      className="minimal-card-hover"
                      style={{
                        background: c.bgCard,
                        border: `1px solid ${c.border}`,
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Receipt size={14} color="#0d9488" />
                          <span style={{ fontSize: '11px', color: c.textSecondary, fontWeight: 600 }}>Total Verified Savings</span>
                        </div>
                        <TrendingUp size={14} color={c.accent} />
                      </div>
                      <div style={{ margin: '8px 0' }}>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: c.textPrimary, fontFamily: 'monospace' }}>
                          Rs. 5.2M
                        </div>
                        <div style={{ fontSize: '10px', color: '#059669', fontWeight: 600 }}>
                          Meezan Ledger (Demo Benchmark)
                        </div>
                      </div>
                      <div style={{ fontSize: '10px', color: c.accent, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>View Ledger</span>
                        <ChevronRight size={12} />
                      </div>
                    </div>

                    {/* Stat 2: Monthly Savings % */}
                    <div
                      id="card-monthly-savings-pct"
                      onClick={() => handleCardClick('PERCENT_SAVINGS_DRAWER')}
                      className="minimal-card-hover"
                      style={{
                        background: c.bgCard,
                        border: `1px solid ${c.border}`,
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <TrendingUp size={14} color="#0d9488" />
                          <span style={{ fontSize: '11px', color: c.textSecondary, fontWeight: 600 }}>Monthly Savings %</span>
                        </div>
                        <BarChart3 size={14} color={c.accent} />
                      </div>
                      <div style={{ margin: '8px 0' }}>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: c.textPrimary, fontFamily: 'monospace' }}>
                          35%
                        </div>
                        <div style={{ fontSize: '10px', color: '#059669', fontWeight: 600 }}>
                          MILP LoadShift Benchmark
                        </div>
                      </div>
                      <div style={{ fontSize: '10px', color: c.accent, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>View MILP Math</span>
                        <ChevronRight size={12} />
                      </div>
                    </div>

                    {/* Stat 3: Avoided Generator Hours */}
                    <div
                      id="card-avoided-gen-hours"
                      onClick={() => handleCardClick('GEN_HOURS_DRAWER')}
                      className="minimal-card-hover"
                      style={{
                        background: c.bgCard,
                        border: `1px solid ${c.border}`,
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Zap size={14} color="#d97706" />
                          <span style={{ fontSize: '11px', color: c.textSecondary, fontWeight: 600 }}>Avoided Generator Hours</span>
                        </div>
                        <Clock size={14} color="#d97706" />
                      </div>
                      <div style={{ margin: '8px 0' }}>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: c.textPrimary, fontFamily: 'monospace' }}>
                          142 hrs
                        </div>
                        <div style={{ fontSize: '10px', color: '#d97706', fontWeight: 600 }}>
                          SwiftSwitch™ Hardware Spec
                        </div>
                      </div>
                      <div style={{ fontSize: '10px', color: c.accent, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>View ATS Log</span>
                        <ChevronRight size={12} />
                      </div>
                    </div>

                    {/* Stat 4: CO2 Prevented */}
                    <div
                      id="card-co2-prevented"
                      onClick={() => handleCardClick('CARBON_DRAWER')}
                      className="minimal-card-hover"
                      style={{
                        background: c.bgCard,
                        border: `1px solid ${c.border}`,
                        borderRadius: '16px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Leaf size={14} color="#10b981" />
                          <span style={{ fontSize: '11px', color: c.textSecondary, fontWeight: 600 }}>CO2 Prevented</span>
                        </div>
                        <Leaf size={14} color="#10b981" />
                      </div>
                      <div style={{ margin: '8px 0' }}>
                        <div style={{ fontSize: '20px', fontWeight: 800, color: c.textPrimary, fontFamily: 'monospace' }}>
                          38.4 Tons
                        </div>
                        <div style={{ fontSize: '10px', color: '#059669', fontWeight: 600 }}>
                          EU CBAM Audit Benchmark
                        </div>
                      </div>
                      <div style={{ fontSize: '10px', color: c.accent, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>View CBAM Audit</span>
                        <ChevronRight size={12} />
                      </div>
                    </div>
                  </div>

                  {/* Dual Urdu Supervisor Shift Cards */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Shift Card 1: Day Shift */}
                    <div
                      id="card-urdu-shift-report-1"
                      onClick={() => handleCardClick('URDU_REPORT_DAY')}
                      className="minimal-card-hover"
                      style={{
                        background: c.bgCard,
                        border: `1px solid ${c.border}`,
                        borderRadius: '16px',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: c.textPrimary }}>
                          Supervisor Shift Report (اردو)
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#0d9488', background: c.accentSoft, padding: '2px 6px', borderRadius: '4px' }}>
                          DAY SHIFT
                        </span>
                      </div>
                      <div style={{ direction: 'rtl', textAlign: 'right', margin: '6px 0', fontFamily: 'var(--font-urdu, "Noto Nastaliq Urdu", serif)' }}>
                        <div style={{ fontSize: '12px', color: c.textPrimary, lineHeight: 1.6 }}>
                          دن کے شفٹ کی رپورٹ: لوڈ شفٹنگ کی بچت اور جنریٹر بند رہا۔
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: c.textMuted }}>استاد لیاقت علی · 08:00 - 16:00</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSimulateWhatsApp();
                          }}
                          style={{
                            background: '#25D366',
                            color: '#ffffff',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '9.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Share2 size={10} /> WhatsApp
                        </button>
                      </div>
                    </div>

                    {/* Shift Card 2: Night Shift */}
                    <div
                      id="card-urdu-shift-report-2"
                      onClick={() => handleCardClick('URDU_REPORT_NIGHT')}
                      className="minimal-card-hover"
                      style={{
                        background: c.bgCard,
                        border: `1px solid ${c.border}`,
                        borderRadius: '16px',
                        padding: '14px 16px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: c.textPrimary }}>
                          Supervisor Shift Report (اردو)
                        </span>
                        <span style={{ fontSize: '9px', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '2px 6px', borderRadius: '4px' }}>
                          NIGHT SHIFT
                        </span>
                      </div>
                      <div style={{ direction: 'rtl', textAlign: 'right', margin: '6px 0', fontFamily: 'var(--font-urdu, "Noto Nastaliq Urdu", serif)' }}>
                        <div style={{ fontSize: '12px', color: c.textPrimary, lineHeight: 1.6 }}>
                          دوسرے شفٹ کی رپورٹ: وولٹیج اتار چڑھاؤ پر فوری بیک اپ۔
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '10px', color: c.textMuted }}>محمد نواز · 16:00 - 00:00</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSimulateWhatsApp();
                          }}
                          style={{
                            background: '#25D366',
                            color: '#ffffff',
                            border: 'none',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '9.5px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Share2 size={10} /> WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Row: Pakistan Energy Crisis Bar Chart (Left) + Impact by Sector Progress Bars (Right - ZERO EMOJIS) */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1.2fr) minmax(320px, 1.8fr)', gap: '16px' }}>
                  {/* Card Bottom Left: Pakistan Energy Crisis (Solved) */}
                  <div
                    id="card-energy-crisis"
                    onClick={() => handleCardClick('CRISIS_MODAL')}
                    className="minimal-card-hover"
                    style={{
                      background: c.bgCard,
                      border: `1px solid ${c.border}`,
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '14px', fontWeight: 800, color: c.textPrimary, margin: 0 }}>
                          Pakistan Energy Crisis (Solved)
                        </h3>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: '#059669', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>
                          -35% TARIFF ARBITRAGE
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: c.textSecondary, marginTop: '3px' }}>
                        Pakistan Energy Crisis (Solved) WattWise vs Conventional Loom Operation
                      </div>
                    </div>

                    {/* Minimal Comparative Bar Chart Graphic */}
                    <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: '32px', height: '140px', padding: '16px 0' }}>
                      {/* Conventional Bar */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontSize: '11px', color: '#dc2626', fontWeight: 800 }}>Rs. 85/kWh</div>
                        <div
                          style={{
                            width: '46px',
                            height: '100px',
                            background: '#cbd5e1',
                            borderRadius: '8px 8px 0 0',
                            transition: 'height 0.3s ease',
                          }}
                        />
                        <div style={{ fontSize: '11px', color: c.textSecondary, fontWeight: 600 }}>Conventional</div>
                      </div>

                      {/* Clean Arrow Indicator */}
                      <div style={{ paddingBottom: '30px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            background: '#f0fdf9',
                            border: `1px solid ${c.border}`,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: c.accent,
                          }}
                        >
                          →
                        </div>
                      </div>

                      {/* WattWise Optimized Bar */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                        <div style={{ fontSize: '11px', color: '#059669', fontWeight: 800 }}>Rs. 32.50/kWh</div>
                        <div
                          style={{
                            width: '46px',
                            height: '52px',
                            background: 'linear-gradient(180deg, #0d9488 0%, #0f766e 100%)',
                            borderRadius: '8px 8px 0 0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#ffffff',
                          }}
                        >
                          <Check size={18} strokeWidth={3} />
                        </div>
                        <div style={{ fontSize: '11px', color: c.accent, fontWeight: 800 }}>WattWise</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: c.accent, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Click to view Rs. 250B Crisis Breakdown</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>

                  {/* Card Bottom Right: Impact by Sector (ZERO EMOJIS - CRISP SVG ICONS) */}
                  <div
                    id="card-impact-sector"
                    onClick={() => handleCardClick('SECTOR_MODAL')}
                    className="minimal-card-hover"
                    style={{
                      background: c.bgCard,
                      border: `1px solid ${c.border}`,
                      borderRadius: '16px',
                      padding: '20px',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div>
                      <h3 style={{ fontSize: '14px', fontWeight: 800, color: c.textPrimary, margin: 0 }}>
                        Impact by Sector
                      </h3>
                      <div style={{ fontSize: '11px', color: c.textSecondary, marginTop: '3px' }}>
                        Waste Curtailment and Arbitrage Achieved across Pakistani Industrial Clusters
                      </div>
                    </div>

                    {/* Progress Bar Rows (NO EMOJIS) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', margin: '14px 0' }}>
                      {/* Textile */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: c.textPrimary, marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Layers size={13} color="#059669" />
                            <span>Textile & Weaving</span>
                          </div>
                          <span style={{ color: '#059669' }}>50% waste eliminated</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: '50%', height: '100%', background: '#059669', borderRadius: '4px' }} />
                        </div>
                      </div>

                      {/* Steel */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: c.textPrimary, marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Cpu size={13} color="#0d9488" />
                            <span>Steel Re-Rolling</span>
                          </div>
                          <span style={{ color: c.accent }}>25% waste eliminated</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: '25%', height: '100%', background: c.accent, borderRadius: '4px' }} />
                        </div>
                      </div>

                      {/* Chemical & Dyeing */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: c.textPrimary, marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Activity size={13} color="#14b8a6" />
                            <span>Chemical & High-Temp Dyeing Vats</span>
                          </div>
                          <span style={{ color: '#14b8a6' }}>14% waste eliminated</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: '14%', height: '100%', background: '#14b8a6', borderRadius: '4px' }} />
                        </div>
                      </div>

                      {/* Surgical & Engineering */}
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: 700, color: c.textPrimary, marginBottom: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Sliders size={13} color="#2dd4bf" />
                            <span>Surgical & Precision CNC (Sialkot)</span>
                          </div>
                          <span style={{ color: '#2dd4bf' }}>2% waste eliminated</span>
                        </div>
                        <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: '10%', height: '100%', background: '#2dd4bf', borderRadius: '4px' }} />
                        </div>
                      </div>
                    </div>

                    <div style={{ fontSize: '11px', color: c.accent, fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>Click to view cluster ROI benchmarks</span>
                      <ChevronRight size={14} />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ========================================================================= */}
            {/* VIEW 2: SCADA CONTROL ROOM (FULL OPERATIONAL TELEMETRY & SUBSTATION SCADA)*/}
            {/* ========================================================================= */}
            <React.Suspense fallback={<div style={{ padding: '40px', textAlign: 'center', color: c.textMuted }}>Loading industrial module...</div>}>
            {activeSection === 'command_center' && scadaControlRoomActive && (
              <CommandCenterView
                onNavigate={handleNavClick}
                onInspectMachine={(m) => setInspectedMachine(m)}
                lang={lang}
              />
            )}

            {/* ========================================================================= */}
            {/* VIEW 02: POWER FLOOR (2D ARCHITECTURAL TELEMETRY & MACHINERY GRID)        */}
            {/* ========================================================================= */}
            {activeSection === 'power_floor' && (
              <PowerFloorView
                onInspectMachine={(m) => {
                  setInspectedMachine(m);
                  setActiveModal('MACHINE_INSPECT_MODAL');
                }}
                lang={lang}
              />
            )}

            {/* ========================================================================= */}
            {/* VIEW 03: SWIFTSWITCH (SUB-CYCLE ATS CONTROLLER & DIESEL CURTAILMENT)      */}
            {/* ========================================================================= */}
            {activeSection === 'swiftswitch' && (
              <SwiftSwitchView lang={lang} />
            )}

            {/* ========================================================================= */}
            {/* VIEW 04: LOADSHIFT (MILP PEAK ARBITRAGE SOLVER & SCHEDULE OPTIMIZER)     */}
            {/* ========================================================================= */}
            {activeSection === 'loadshift' && (
              <LoadShiftView lang={lang} />
            )}

            {/* ========================================================================= */}
            {/* VIEW P3: FLEET OPS & PHASE 3 (20-MILL NATIONAL INDUSTRIAL OVERVIEW)       */}
            {/* ========================================================================= */}
            {activeSection === 'fleet_phase3' && (
              <FleetOperationsView lang={lang} />
            )}

            {/* ========================================================================= */}
            {/* VIEW 05: GRID FORECAST (24-HR DAY-AHEAD OUTAGE PREDICTOR)                 */}
            {/* ========================================================================= */}
            {activeSection === 'grid_forecast' && (
              <GridForecastView lang={lang} />
            )}

            {/* ========================================================================= */}
            {/* VIEW 06: ENERGY ANALYTICS (POWER FACTOR, HARMONICS & REACTIVE POWER)     */}
            {/* ========================================================================= */}
            {activeSection === 'energy_analytics' && (
              <AnalyticsView lang={lang} />
            )}

            {/* ========================================================================= */}
            {/* VIEW 07: ANOMALIES (4 ACTIVE INDUSTRIAL FAULT DETECTIONS)                 */}
            {/* ========================================================================= */}
            {activeSection === 'anomalies' && (
              <AnomaliesView
                onInspectMachine={handleInspectMachineById}
                lang={lang}
              />
            )}

            {/* ========================================================================= */}
            {/* VIEW 08: SAVINGS LEDGER (MEEZAN BANK SHARIAH ESCROW & 80/20 GAIN SHARE)   */}
            {/* ========================================================================= */}
            {activeSection === 'savings_ledger' && (
              <SavingsLedgerView lang={lang} />
            )}

            {/* ========================================================================= */}
            {/* VIEW 09: UTILITY AUDIT (WAPDA / LESCO OVERBILLING & FUEL SURCHARGE AUDIT)  */}
            {/* ========================================================================= */}
            {activeSection === 'utility_audit' && (
              <UtilityAuditView lang={lang} />
            )}

            {/* ========================================================================= */}
            {/* VIEW 10: BILLING (AUTOMATED MONTHLY ESCROW RELEASES & RECEIPTS)           */}
            {/* ========================================================================= */}
            {activeSection === 'billing' && (
              <BillingView lang={lang} />
            )}

            {/* ========================================================================= */}
            {/* VIEW 11: CARBON & ESG (EU CBAM TAX ACCOUNTING & DECARBONIZATION)          */}
            {/* ========================================================================= */}
            {activeSection === 'carbon_esg' && (
              <CarbonEsgView lang={lang} />
            )}

            {/* ========================================================================= */}
            {/* VIEW 12: ASSETS (84 MONITORED FACTORY MACHINES & HEALTH INDEX)            */}
            {/* ========================================================================= */}
            {activeSection === 'assets' && (
              <AssetsView
                onInspectMachine={(m) => {
                  setInspectedMachine(m);
                  setActiveModal('MACHINE_INSPECT_MODAL');
                }}
                lang={lang}
              />
            )}

            {/* ========================================================================= */}
            {/* VIEW 13: EDGE CONTROLLERS (RUST / ESP32 GATEWAYS & RS-485 TELEMETRY)      */}
            {/* ========================================================================= */}
            {activeSection === 'edge_controllers' && (
              <EdgeControllersView lang={lang} />
            )}

            {/* ========================================================================= */}
            {/* VIEW 14: SENSORS (CURRENT TRANSFORMERS & ROGOWSKI COILS NETWORK)          */}
            {/* ========================================================================= */}
            {activeSection === 'sensors' && (
              <SensorNetworkView lang={lang} />
            )}

            {/* ========================================================================= */}
            {/* VIEW 15: SHIFT REPORTS (A/B/C SHIFT HANDOVER LOGS & SUPERVISOR SIGNOFFS)  */}
            {/* ========================================================================= */}
            {activeSection === 'shift_reports' && (
              <ShiftReportsView lang={lang} />
            )}

            {/* ========================================================================= */}
            {/* VIEW 16: DOCUMENTS (SINGLE LINE DIAGRAMS, BLUEPRINTS & APPROVALS)         */}
            {/* ========================================================================= */}
            {activeSection === 'documents' && (
              <DocumentsView lang={lang} />
            )}

            {/* ========================================================================= */}
            {/* VIEW 17: FACILITIES (MULTI-SITE MILL DIRECTORY & SANCTIONED MVA)          */}
            {/* ========================================================================= */}
            {activeSection === 'facilities' && (
              <FacilitiesView lang={lang} />
            )}

            {/* ========================================================================= */}
            {/* VIEW 18: USERS & ACCESS (RBAC PERMISSIONS & SHIFT ACCESS CONTROL)         */}
            {/* ========================================================================= */}
            {activeSection === 'access_control' && (
              <AccessControlView lang={lang} />
            )}

            {/* ========================================================================= */}
            {/* VIEW 19: INTEGRATIONS (SAP S/4HANA ERP, SCADA OPC-UA, WHATSAPP BUSINESS) */}
            {/* ========================================================================= */}
            {activeSection === 'integrations' && (
              <IntegrationsView lang={lang} />
            )}

            {/* ========================================================================= */}
            {/* VIEW 20: SYSTEM HEALTH (MQTT BROKER, EDGE LATENCY & HEALTH STATUS)        */}
            {/* ========================================================================= */}
            {activeSection === 'system_health' && (
              <SystemHealthView lang={lang} />
            )}
            </React.Suspense>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PROGRESSIVE DISCLOSURE MODALS & DRAWERS (CLICK-TO-REVEAL FULL DETAILS)    */}
      {/* ========================================================================= */}

      {/* MODAL 1: FACTORY & SUBSTATION DETAILS */}
      {activeModal === 'FACTORY_DETAILS' && (
        <div style={modalBackdropStyle}>
          <div style={modalContainerStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Factory size={20} color={c.accent} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: c.textPrimary }}>
                  {currentFacility.name} — Substation & Electrical Asset Architecture
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div style={{ background: c.bgCardElevated, padding: '14px', borderRadius: '12px', border: `1px solid ${c.borderSubtle}` }}>
                  <div style={{ fontSize: '11px', color: c.textMuted }}>DISCO FEEDER</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: c.textPrimary, marginTop: '2px' }}>
                    {currentFacility.feederCode}
                  </div>
                  <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px' }}>Sanctioned: {currentFacility.connectionSanctionedMva} MVA</div>
                </div>
                <div style={{ background: c.bgCardElevated, padding: '14px', borderRadius: '12px', border: `1px solid ${c.borderSubtle}` }}>
                  <div style={{ fontSize: '11px', color: c.textMuted }}>CAPTIVE BACKUP</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: c.textPrimary, marginTop: '2px' }}>
                    Cummins QSK23 1250 kVA
                  </div>
                  <div style={{ fontSize: '11px', color: c.accent, marginTop: '4px' }}>Sub-Cycle ATS: 0.83ms Ready</div>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveModal(null);
                  setWizardOpen(true);
                }}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0d9488, #059669)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Launch 3-Hour Rapid Substation Commissioning Wizard
              </button>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  background: '#f1f5f9',
                  color: c.textPrimary,
                  border: `1px solid ${c.border}`,
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SAVINGS LEDGER DRAWER */}
      {activeModal === 'SAVINGS_DRAWER' && (
        <div style={modalBackdropStyle}>
          <div style={modalContainerStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Receipt size={20} color={c.accent} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: c.textPrimary }}>
                  Verified Savings & Meezan Bank Gain-Share Ledger
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '20px' }}>
                <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '10px', color: c.textMuted }}>TOTAL SAVINGS</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: c.textPrimary }}>Rs. 5,200,000</div>
                </div>
                <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '10px', color: '#059669' }}>80% MILL PROFIT</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>Rs. 4,160,000</div>
                </div>
                <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '10px' }}>
                  <div style={{ fontSize: '10px', color: c.accent }}>20% WATTWISE FEE</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: c.accent }}>Rs. 1,040,000</div>
                </div>
              </div>
              <button
                onClick={() => triggerToast('Meezan Bank Shariah-Compliant Audit Ledger (.PDF) downloaded!')}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0d9488, #059669)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Download size={16} /> Download Certified Meezan Bank Audit (.PDF)
              </button>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  background: '#f1f5f9',
                  color: c.textPrimary,
                  border: `1px solid ${c.border}`,
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: LOADSHIFT MILP DRAWER */}
      {activeModal === 'PERCENT_SAVINGS_DRAWER' && (
        <div style={modalBackdropStyle}>
          <div style={modalContainerStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={20} color={c.accent} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: c.textPrimary }}>
                  LoadShift™ MILP Optimization & Peak Curtailment
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '12px', color: c.textSecondary, marginBottom: '16px' }}>
                Mixed-Integer Linear Programming solves batch schedules across dyeing vats and compressors to prevent peak tariff penalties.
              </p>
              <div style={{ background: c.bgCardElevated, padding: '14px', borderRadius: '10px', border: `1px solid ${c.borderSubtle}`, marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: c.textPrimary }}>Peak Hours Avoidance: 18:00 - 22:00 PKT</div>
                <div style={{ fontSize: '11px', color: c.textMuted, marginTop: '4px' }}>
                  Differential: Rs. 85.00/kWh (Peak) vs Rs. 32.50/kWh (Off-Peak) = 61.7% Unit Arbitrage
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ width: '100%', background: c.accent, color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: SWIFTSWITCH ATS DRAWER */}
      {activeModal === 'GEN_HOURS_DRAWER' && (
        <div style={modalBackdropStyle}>
          <div style={modalContainerStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={20} color="#0284c7" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: c.textPrimary }}>
                  SwiftSwitch™ Sub-Cycle ATS & Generator Mitigation
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ fontSize: '12px', color: c.textSecondary, marginBottom: '16px' }}>
                Eliminates the 3 to 15 minute "Chowkidar Lag". Predicts frequency drop at T-12s and pre-emptively spins the Cummins engine.
              </div>
              <button
                onClick={handleAtsTestFire}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0d9488, #059669)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Execute 0.83ms Test-Fire Switchover
              </button>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  background: '#f1f5f9',
                  color: c.textPrimary,
                  border: `1px solid ${c.border}`,
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: CARBON & EU CBAM DRAWER */}
      {activeModal === 'CARBON_DRAWER' && (
        <div style={modalBackdropStyle}>
          <div style={modalContainerStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Leaf size={20} color="#10b981" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: c.textPrimary }}>
                  EU CBAM Compliance & Carbon Accounting
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ fontSize: '12px', color: c.textSecondary, marginBottom: '16px' }}>
                Avoids European Union Carbon Border Adjustment Mechanism tax liabilities for textile and steel exports.
              </div>
              <button
                onClick={() => triggerToast('EU CBAM Compliance Certificate Exported (.PDF)')}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #059669, #10b981)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Download size={16} /> Export Verified EU CBAM Certificate (.PDF)
              </button>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  background: '#f1f5f9',
                  color: c.textPrimary,
                  border: `1px solid ${c.border}`,
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 6: URDU SUPERVISOR SHIFT REPORT MODAL */}
      {(activeModal === 'URDU_REPORT_DAY' || activeModal === 'URDU_REPORT_NIGHT') && (
        <div style={modalBackdropStyle}>
          <div style={modalContainerStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <FileText size={20} color={c.accent} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: c.textPrimary }}>
                  {activeModal === 'URDU_REPORT_DAY' ? 'دن کی شفٹ رپورٹ (Day Shift)' : 'رات کی شفٹ رپورٹ (Night Shift)'}
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ direction: 'rtl', textAlign: 'right', fontFamily: 'var(--font-urdu, "Noto Nastaliq Urdu", serif)', lineHeight: 1.8, fontSize: '14px', color: c.textPrimary, marginBottom: '20px' }}>
                {activeModal === 'URDU_REPORT_DAY' ? (
                  <>
                    محترم ڈائریکٹر صاحب، دن کی شفٹ میں تمام ویونگ لومز عام گرڈ پر ہموار چلیں۔ لوڈ شفٹ الگورتھم نے شام کے وقت ہائی ٹیرف پینلٹی سے <strong>Rs. 61,334</strong> کی بچت کی۔ کوئی غیر متوقع بندش نہیں ہوئی۔
                  </>
                ) : (
                  <>
                    محترم ڈائریکٹر صاحب، رات کی شفٹ میں فیسکو فیڈر پر وولٹیج کا اتار چڑھاؤ محسوس ہوا لیکن سوئفٹ سوئچ نے صفر اعشاریہ تراسی ملی سیکنڈ میں بیک اپ سنبھال لیا۔ دھاگے کے لاٹ کو کوئی نقصان نہیں پہنچا۔
                  </>
                )}
              </div>
              <button
                onClick={handleSimulateWhatsApp}
                style={{
                  width: '100%',
                  background: '#25D366',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                }}
              >
                <Share2 size={16} /> Dispatch WhatsApp Audio & PDF Digest
              </button>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  background: '#f1f5f9',
                  color: c.textPrimary,
                  border: `1px solid ${c.border}`,
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 7: CRISIS MODAL */}
      {activeModal === 'CRISIS_MODAL' && (
        <div style={modalBackdropStyle}>
          <div style={modalContainerStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <TrendingUp size={20} color="#059669" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: c.textPrimary }}>
                  Pakistan Industrial Energy Crisis — Rs. 250B Waste Solved
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '12px', color: c.textSecondary, lineHeight: 1.6, marginBottom: '16px' }}>
                Pakistani textile mills face Rs. 85/kWh peak tariffs and frequent feeder blackouts. WattWise eliminates unnecessary diesel generation and curtails peak consumption automatically.
              </p>
              <button onClick={() => setActiveModal(null)} style={{ width: '100%', background: c.accent, color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 8: SECTOR MODAL */}
      {activeModal === 'SECTOR_MODAL' && (
        <div style={modalBackdropStyle}>
          <div style={modalContainerStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BarChart3 size={20} color={c.accent} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: c.textPrimary }}>
                  Industrial Sector Impact & Savings Breakdown
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '12px', color: c.textSecondary, marginBottom: '16px' }}>
                WattWise is currently deployed across Textile (Faisalabad), Steel (Lahore), Chemical (Sheikhupura), and Surgical (Sialkot).
              </p>
              <button onClick={() => setActiveModal(null)} style={{ width: '100%', background: c.accent, color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 9: SCADA GRID INFLUX MODAL */}
      {activeModal === 'SCADA_GRID_MODAL' && (
        <div style={modalBackdropStyle}>
          <div style={modalContainerStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={20} color={c.accent} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: c.textPrimary }}>
                  11kV Primary Grid Feeder & Waveform Telemetry
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: c.textMuted }}>VOLTAGE</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: c.textPrimary }}>401.8 V</div>
                </div>
                <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: c.textMuted }}>FREQUENCY</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: c.textPrimary }}>50.02 Hz</div>
                </div>
                <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#059669' }}>POWER FACTOR</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#059669' }}>0.94 PF</div>
                </div>
              </div>
              <button
                onClick={() => triggerToast('NEPRA Section 21 Legal Dispute Dossier Exported!')}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0d9488, #059669)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Download size={14} /> Export Grid Quality Certificate (PDF)
              </button>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  background: '#f1f5f9',
                  color: c.textPrimary,
                  border: `1px solid ${c.border}`,
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 10: SCADA ATS MODAL */}
      {activeModal === 'SCADA_ATS_MODAL' && (
        <div style={modalBackdropStyle}>
          <div style={modalContainerStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Shield size={20} color="#0284c7" />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: c.textPrimary }}>
                  SwiftSwitch™ Sub-Cycle ATS & Captive Genset Automation
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: c.textMuted }}>ATS TIME</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: c.accent }}>0.83 ms</div>
                </div>
                <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: c.textMuted }}>DIESEL TANK</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: c.textPrimary }}>8,400 L</div>
                </div>
                <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#059669' }}>DEFECTS SAVED</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: '#059669' }}>12 Batches</div>
                </div>
              </div>
              <button
                onClick={handleAtsTestFire}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0d9488, #059669)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '12px',
                  borderRadius: '10px',
                  fontSize: '13px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Execute 0.83ms Test-Fire Switchover
              </button>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  background: '#f1f5f9',
                  color: c.textPrimary,
                  border: `1px solid ${c.border}`,
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 11: SCADA LOADSHIFT MODAL */}
      {activeModal === 'SCADA_LOADSHIFT_MODAL' && (
        <div style={modalBackdropStyle}>
          <div style={modalContainerStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Clock size={20} color={c.accent} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: c.textPrimary }}>
                  LoadShift™ MILP Process Optimization Schedule
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ background: c.bgCardElevated, padding: '14px', borderRadius: '10px', marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: c.textPrimary }}>
                  Curfew Protection Status: ARMED (18:00 - 22:00 PKT)
                </div>
                <div style={{ fontSize: '11px', color: '#059669', marginTop: '4px' }}>
                  Avoided MDI Penalty: Rs. 61,334 / day
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ width: '100%', background: c.accent, color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 12: SCADA SAVINGS MODAL */}
      {activeModal === 'SCADA_SAVINGS_MODAL' && (
        <div style={modalBackdropStyle}>
          <div style={modalContainerStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Receipt size={20} color={c.accent} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: c.textPrimary }}>
                  Verified Savings & Meezan Bank Gain-Share Ledger
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '16px' }}>
                <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: c.textMuted }}>GROSS SAVED</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: c.textPrimary }}>Rs. 1,840,000</div>
                </div>
                <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: '#059669' }}>MILL CASH (80%)</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#059669' }}>Rs. 1,472,000</div>
                </div>
                <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: c.accent }}>WATTWISE 20%</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: c.accent }}>Rs. 368,000</div>
                </div>
              </div>
              <button
                onClick={() => triggerToast('Meezan Bank Shariah Audit Downloaded!')}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #0d9488, #059669)',
                  color: '#ffffff',
                  border: 'none',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Download size={14} /> Download Meezan Bank Audit (.PDF)
              </button>
              <button
                onClick={() => setActiveModal(null)}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  background: '#f1f5f9',
                  color: c.textPrimary,
                  border: `1px solid ${c.border}`,
                  padding: '10px',
                  borderRadius: '8px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 13: MACHINERY INSPECT MODAL */}
      {activeModal === 'MACHINE_INSPECT_MODAL' && inspectedMachine && (
        <div style={modalBackdropStyle}>
          <div style={modalContainerStyle}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Sliders size={20} color={c.accent} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: c.textPrimary }}>
                  Machinery Diagnostics — {inspectedMachine.name}
                </h3>
              </div>
              <button onClick={() => setActiveModal(null)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: c.textMuted }}>ACTIVE POWER</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: c.accent }}>{inspectedMachine.currentKw} kW</div>
                </div>
                <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: c.textMuted }}>POWER FACTOR</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: c.textPrimary }}>{inspectedMachine.powerFactor} PF</div>
                </div>
                <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: c.textMuted }}>VOLTAGE</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: c.textPrimary }}>{inspectedMachine.voltageV} V</div>
                </div>
                <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '10px', color: c.textMuted }}>CURRENT</div>
                  <div style={{ fontSize: '16px', fontWeight: 800, color: c.textPrimary }}>{inspectedMachine.currentAmps} A</div>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} style={{ width: '100%', background: c.accent, color: '#ffffff', border: 'none', padding: '10px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBSTATION 3-HOUR RAPID INSTALL & COMMISSIONING WIZARD MODAL */}
      <SubstationCommissioningWizard
        isOpen={wizardOpen}
        onClose={() => setWizardOpen(false)}
        lang={lang}
      />

      {/* Global Command Palette (⌘ K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={handleNavClick}
        onInspectMachine={handleInspectMachineById}
      />

      {/* Global Notification Center Drawer */}
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNavigate={handleNavClick}
      />

      {/* Contextual Right-Side Machine Inspector */}
      <MachineInspector
        machine={inspectedMachine}
        onClose={() => setInspectedMachine(null)}
        lang={lang}
      />

      {/* Venture Pitch Overview Modal */}
      {pitchOpen && (
        <div style={modalBackdropStyle}>
          <div style={{ ...modalContainerStyle, maxWidth: '960px' }}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <BarChart3 size={20} color={c.accent} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: c.textPrimary }}>
                  {isUrdu ? 'واٹ وائز ایگزیکٹو سمری اور بزنس ماڈل' : 'WattWise™ Venture Pitch & Business Model'}
                </h3>
              </div>
              <button onClick={() => setPitchOpen(false)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px', maxHeight: '78vh', overflowY: 'auto' }}>
              <ProductPitchOverview lang={lang} />
              <button
                onClick={() => setPitchOpen(false)}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  background: '#f1f5f9',
                  color: c.textPrimary,
                  border: `1px solid ${c.border}`,
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Production Roadmap Guide Modal */}
      {roadmapOpen && (
        <div style={modalBackdropStyle}>
          <div style={{ ...modalContainerStyle, maxWidth: '960px' }}>
            <div style={modalHeaderStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={20} color={c.accent} />
                <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0, color: c.textPrimary }}>
                  {isUrdu ? 'پروڈکشن روڈ میپ اور اسپرنٹ گائیڈ' : 'Production Architecture Roadmap (Sprints 0–6)'}
                </h3>
              </div>
              <button onClick={() => setRoadmapOpen(false)} style={closeBtnStyle}>
                <X size={16} />
              </button>
            </div>
            <div style={{ padding: '24px', maxHeight: '78vh', overflowY: 'auto' }}>
              <ProductionRoadmapGuide lang={lang} />
              <button
                onClick={() => setRoadmapOpen(false)}
                style={{
                  width: '100%',
                  marginTop: '16px',
                  background: '#f1f5f9',
                  color: c.textPrimary,
                  border: `1px solid ${c.border}`,
                  padding: '10px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
