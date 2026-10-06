import React, { useState, useEffect } from 'react';
import {
  Factory,
  Building2,
  Activity,
  FileText,
  Settings,
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
  ArrowRight,
  Search,
  Network,
  Bell,
  Gauge,
  Sliders,
  Database,
  Lock,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { industrialAudio } from '../services/soundEffects';
import { SubstationCommissioningWizard } from './SubstationCommissioningWizard';
import { FLEET_MILLS_20 } from '../data/fleetData';
import { ALL_FACILITIES, CURRENT_FACILITY, DEMO_MACHINES, FacilityProfile } from '../data/controlRoomData';

interface MinimalDashboardRedesignProps {
  onOpenFleetOperations?: () => void;
  onOpenCommissioningWizard?: () => void;
  onToggleScadaView?: () => void;
  initialTab?: TabId;
}

export type TabId =
  | 'EXECUTIVE_SUMMARY'
  | 'SCADA'
  | 'SYSTEM_ARCH'
  | 'AI_ML_STACK'
  | 'SWIFTSWITCH'
  | 'SAVINGS_AUDIT'
  | 'CARBON_TRACKER'
  | 'FLEET';

export const MinimalDashboardRedesign: React.FC<MinimalDashboardRedesignProps> = ({
  onOpenFleetOperations,
  onOpenCommissioningWizard,
  onToggleScadaView,
  initialTab = 'EXECUTIVE_SUMMARY',
}) => {
  // Lock exclusively to light theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

  // Language state
  const [lang, setLang] = useState<'en' | 'ur'>('en');
  const isUrdu = lang === 'ur';

  // Active top tab
  const [activeTab, setActiveTab] = useState<TabId>(initialTab);

  // Left sidebar active item
  const [activeSidebarNav, setActiveSidebarNav] = useState<
    'EXECUTIVE' | 'SCADA' | 'SYSTEM_ARCH' | 'ANALYTICS' | 'SWIFTSWITCH' | 'SAVINGS' | 'CARBON' | 'FLEET' | 'REPORTS' | 'SETTINGS'
  >('EXECUTIVE');

  // Facility profile state
  const [currentFacility, setCurrentFacility] = useState<FacilityProfile>(CURRENT_FACILITY);
  const [facilityDropdownOpen, setFacilityDropdownOpen] = useState(false);

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');

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
  >(null);

  const [inspectedMachine, setInspectedMachine] = useState<any>(DEMO_MACHINES[0]);

  // Commissioning Wizard Modal State
  const [wizardOpen, setWizardOpen] = useState(false);

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

  const handleTabClick = (tabId: TabId) => {
    industrialAudio.playRelayClick();
    setActiveTab(tabId);
    if (tabId === 'EXECUTIVE_SUMMARY') setActiveSidebarNav('EXECUTIVE');
    else if (tabId === 'SCADA') setActiveSidebarNav('SCADA');
    else if (tabId === 'SYSTEM_ARCH') setActiveSidebarNav('SYSTEM_ARCH');
    else if (tabId === 'AI_ML_STACK') setActiveSidebarNav('ANALYTICS');
    else if (tabId === 'SWIFTSWITCH') setActiveSidebarNav('SWIFTSWITCH');
    else if (tabId === 'SAVINGS_AUDIT') setActiveSidebarNav('SAVINGS');
    else if (tabId === 'CARBON_TRACKER') setActiveSidebarNav('CARBON');
    else if (tabId === 'FLEET') setActiveSidebarNav('FLEET');
  };

  const handleSidebarClick = (navId: typeof activeSidebarNav) => {
    industrialAudio.playRelayClick();
    setActiveSidebarNav(navId);
    if (navId === 'EXECUTIVE') setActiveTab('EXECUTIVE_SUMMARY');
    else if (navId === 'SCADA') setActiveTab('SCADA');
    else if (navId === 'SYSTEM_ARCH') setActiveTab('SYSTEM_ARCH');
    else if (navId === 'ANALYTICS') setActiveTab('AI_ML_STACK');
    else if (navId === 'SWIFTSWITCH') setActiveTab('SWIFTSWITCH');
    else if (navId === 'SAVINGS') setActiveTab('SAVINGS_AUDIT');
    else if (navId === 'CARBON') setActiveTab('CARBON_TRACKER');
    else if (navId === 'FLEET') setActiveTab('FLEET');
    else if (navId === 'REPORTS') setActiveModal('URDU_REPORT_DAY');
    else if (navId === 'SETTINGS') setActiveModal('FACTORY_DETAILS');
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

        {/* Right: Quick Action Controls (Search, Language, Wizard) - No dark mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Quick Search Input */}
          <div style={{ position: 'relative' }}>
            <input
              type="text"
              placeholder={isUrdu ? 'تلاش کریں... (⌘K)' : 'Search machines, busbars... (⌘K)'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                background: '#ffffff',
                border: `1px solid ${c.border}`,
                borderRadius: '10px',
                padding: '8px 12px 8px 32px',
                fontSize: '11px',
                color: c.textPrimary,
                width: '190px',
                outline: 'none',
              }}
            />
            <Search size={13} color={c.textMuted} style={{ position: 'absolute', left: 10, top: 11 }} />
          </div>

          {/* Urdu / English Language Toggle */}
          <button
            id="btn-urdu-toggle"
            onClick={handleToggleLang}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#ffffff',
              color: c.accent,
              border: `1px solid ${c.border}`,
              padding: '8px 14px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}
          >
            <span>{isUrdu ? 'English Mode' : 'اردو موڈ'}</span>
            <RotateCcw size={12} />
          </button>

          {/* 3-Hr Substation Commissioning Wizard Button */}
          <button
            id="btn-substation-wizard"
            onClick={() => setWizardOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'linear-gradient(135deg, #0d9488, #059669)',
              color: '#ffffff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '10px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)',
              transition: 'all 0.2s ease',
            }}
          >
            <Compass size={14} />
            <span>3-Hr Substation Wizard</span>
          </button>
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
        {/* LEFT MINIMAL RAIL SIDEBAR */}
        <div
          style={{
            width: '152px',
            background: c.bgCard,
            borderRight: `1px solid ${c.borderSubtle}`,
            padding: '20px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexShrink: 0,
            height: '100%',
            overflowY: 'auto',
          }}
        >
          {/* Navigation Section Header */}
          <div style={{ width: '100%', padding: '0 6px', marginBottom: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: c.textMuted, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              {isUrdu ? 'نیویگیشن' : 'Navigation'}
            </div>
            <div style={{ height: '1px', background: c.borderSubtle, marginTop: '8px', width: '100%' }} />
          </div>

          {/* Navigation Items (10 fully functional sections) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
            {[
              { id: 'EXECUTIVE', label: 'Executive', labelUrdu: 'ایگزیکٹو', icon: Factory },
              { id: 'SCADA', label: 'SCADA Room', labelUrdu: 'اسکاڈا روم', icon: Zap },
              { id: 'SYSTEM_ARCH', label: 'Architecture', labelUrdu: 'آرکیٹیکچر', icon: Cpu },
              { id: 'ANALYTICS', label: 'AI & Analytics', labelUrdu: 'اے آئی تجزیات', icon: Activity },
              { id: 'SWIFTSWITCH', label: 'SwiftSwitch™', labelUrdu: 'سوئفٹ سوئچ™', icon: Shield },
              { id: 'SAVINGS', label: 'Meezan Ledger', labelUrdu: 'میزان لیجر', icon: Receipt },
              { id: 'CARBON', label: 'Carbon / CBAM', labelUrdu: 'کاربن سی بی اے ایم', icon: Leaf },
              { id: 'FLEET', label: '20-Mill Fleet', labelUrdu: '20 ملز فلیٹ', icon: Building2 },
              { id: 'REPORTS', label: 'Shift Reports', labelUrdu: 'شفٹ رپورٹس', icon: FileText },
              { id: 'SETTINGS', label: 'Settings', labelUrdu: 'سیٹنگز', icon: Settings },
            ].map((nav) => {
              const Icon = nav.icon;
              const isActive = activeSidebarNav === nav.id;
              return (
                <button
                  key={nav.id}
                  id={`nav-btn-${nav.id}`}
                  onClick={() => handleSidebarClick(nav.id as any)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isActive ? c.accentSoft : 'transparent',
                    color: isActive ? c.accent : c.textSecondary,
                    fontSize: '11px',
                    fontWeight: isActive ? 800 : 500,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    textAlign: 'left',
                  }}
                >
                  <Icon size={14} color={isActive ? c.accent : c.textMuted} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {isUrdu ? nav.labelUrdu : nav.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Bottom Live Pulse Status */}
          <div style={{ textAlign: 'center', width: '100%', paddingTop: '12px', borderTop: `1px solid ${c.borderSubtle}` }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
              <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
              <span style={{ fontSize: '10px', fontWeight: 700, color: '#10b981', fontFamily: 'monospace' }}>142ms</span>
            </div>
            <div style={{ fontSize: '9px', color: c.textMuted, marginTop: '2px' }}>Modbus Live</div>
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
                {activeTab === 'EXECUTIVE_SUMMARY' && (isUrdu ? 'ایگزیکٹو خلاصہ' : 'Executive Summary')}
                {activeTab === 'SCADA' && (isUrdu ? 'اسکاڈا کنٹرول روم' : 'SCADA Control Room')}
                {activeTab === 'SYSTEM_ARCH' && (isUrdu ? 'سسٹم آرکیٹیکچر' : 'System Architecture')}
                {activeTab === 'AI_ML_STACK' && (isUrdu ? 'اے آئی / تجزیات' : 'AI & Analytics')}
                {activeTab === 'SWIFTSWITCH' && 'SwiftSwitch™'}
                {activeTab === 'SAVINGS_AUDIT' && (isUrdu ? 'میزان لیجر' : 'Meezan Savings Ledger')}
                {activeTab === 'CARBON_TRACKER' && (isUrdu ? 'کاربن و سی بی اے ایم' : 'Carbon / CBAM')}
                {activeTab === 'FLEET' && (isUrdu ? '20 ملز فلیٹ' : '20-Mill Fleet')}
              </span>
            </div>

            {/* Quick Status Pill */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
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
            {activeTab === 'EXECUTIVE_SUMMARY' && (
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
                          Meezan Shariah Verified
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
                          Peak Arbitrage (MILP)
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
                          SwiftSwitch™ 0.83ms
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
                          EU CBAM Compliant
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
            {/* VIEW 2: SCADA CONTROL ROOM (MINIMAL, CLEAN & PROGRESSIVE DISCLOSURE)      */}
            {/* ========================================================================= */}
            {activeTab === 'SCADA' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                {/* Header Strip with Live Pills (NO EMOJIS) */}
                <div
                  style={{
                    background: c.bgCardElevated,
                    border: `1px solid ${c.border}`,
                    borderRadius: '16px',
                    padding: '16px 20px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                      <h2 style={{ fontSize: '16px', fontWeight: 800, color: c.textPrimary, margin: 0 }}>
                        SCADA Control Room — Industrial Energy Intelligence
                      </h2>
                    </div>
                    <div style={{ fontSize: '11px', color: c.textSecondary, marginTop: '2px' }}>
                      {currentFacility.name} · {currentFacility.disco} 11kV Feeder · High Stability Margin
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ background: '#dcfce7', color: '#059669', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Zap size={13} color="#059669" /> GRID: 401.8V (NORMAL)
                    </span>
                    <span style={{ background: '#fef9c3', color: '#b45309', padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Shield size={13} color="#b45309" /> SWIFTSWITCH ARMED (0.83ms)
                    </span>
                    <span style={{ background: c.bgPill, color: c.textSecondary, padding: '5px 12px', borderRadius: '8px', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <Radio size={13} color="#0d9488" /> MODBUS LIVE (142ms)
                    </span>
                  </div>
                </div>

                {/* 4 Primary Diagnostic Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  {/* Card 1: 11kV Grid Influx */}
                  <div
                    id="scada-card-grid"
                    onClick={() => handleCardClick('SCADA_GRID_MODAL')}
                    className="minimal-card-hover"
                    style={{
                      background: c.bgCard,
                      border: `1px solid ${c.border}`,
                      borderRadius: '14px',
                      padding: '16px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: c.textSecondary }}>PRIMARY GRID INFLUX</span>
                      <Zap size={14} color={c.accent} />
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: c.textPrimary, fontFamily: 'monospace', margin: '8px 0 4px 0' }}>
                      401.8 V
                    </div>
                    <div style={{ fontSize: '11px', color: c.textSecondary }}>
                      {currentFacility.disco} Feeder · 50.02 Hz (±0.4%)
                    </div>
                    <div style={{ fontSize: '10.5px', color: c.accent, fontWeight: 700, marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>View 3-Phase Waveforms</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>

                  {/* Card 2: SwiftSwitch Defense */}
                  <div
                    id="scada-card-swiftswitch"
                    onClick={() => handleCardClick('SCADA_ATS_MODAL')}
                    className="minimal-card-hover"
                    style={{
                      background: c.bgCard,
                      border: `1px solid ${c.border}`,
                      borderRadius: '14px',
                      padding: '16px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: c.textSecondary }}>SWIFTSWITCH™ DEFENSE</span>
                      <Shield size={14} color="#0284c7" />
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: c.textPrimary, fontFamily: 'monospace', margin: '8px 0 4px 0' }}>
                      0.83 ms
                    </div>
                    <div style={{ fontSize: '11px', color: c.textSecondary }}>
                      1.2MW Cummins Hot-Standby · Outage Risk: 87%
                    </div>
                    <div style={{ fontSize: '10.5px', color: c.accent, fontWeight: 700, marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>View ATS & Gen Audit</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>

                  {/* Card 3: LoadShift Arbitrage */}
                  <div
                    id="scada-card-loadshift"
                    onClick={() => handleCardClick('SCADA_LOADSHIFT_MODAL')}
                    className="minimal-card-hover"
                    style={{
                      background: c.bgCard,
                      border: `1px solid ${c.border}`,
                      borderRadius: '14px',
                      padding: '16px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: c.textSecondary }}>LOADSHIFT™ ARBITRAGE</span>
                      <Clock size={14} color="#10b981" />
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: c.textPrimary, fontFamily: 'monospace', margin: '8px 0 4px 0' }}>
                      782.1 kW
                    </div>
                    <div style={{ fontSize: '11px', color: c.textSecondary }}>
                      Off-Peak Window (Rs. 32.50) · Peak Curfew Armed
                    </div>
                    <div style={{ fontSize: '10.5px', color: c.accent, fontWeight: 700, marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>View MILP Schedule</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>

                  {/* Card 4: Verified Savings (MTD) */}
                  <div
                    id="scada-card-savings"
                    onClick={() => handleCardClick('SCADA_SAVINGS_MODAL')}
                    className="minimal-card-hover"
                    style={{
                      background: c.bgCard,
                      border: `1px solid ${c.border}`,
                      borderRadius: '14px',
                      padding: '16px',
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: c.textSecondary }}>VERIFIED SAVINGS (MTD)</span>
                      <Receipt size={14} color="#059669" />
                    </div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: c.textPrimary, fontFamily: 'monospace', margin: '8px 0 4px 0' }}>
                      Rs. 1.84M
                    </div>
                    <div style={{ fontSize: '11px', color: c.textSecondary }}>
                      Net Mill Profit: Rs. 1.47M (80%) · Meezan IBFT
                    </div>
                    <div style={{ fontSize: '10.5px', color: c.accent, fontWeight: 700, marginTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>View Shariah Ledger</span>
                      <ChevronRight size={12} />
                    </div>
                  </div>
                </div>

                {/* Substation Distribution Tree & Machinery Watchlist */}
                <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1.8fr) minmax(260px, 1.2fr)', gap: '16px' }}>
                  {/* Substation Power Distribution Tree */}
                  <div
                    style={{
                      background: c.bgCard,
                      border: `1px solid ${c.border}`,
                      borderRadius: '16px',
                      padding: '18px',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <div>
                        <h3 style={{ fontSize: '13px', fontWeight: 800, color: c.textPrimary, margin: 0 }}>
                          Substation Power Distribution Tree (11kV / 415V)
                        </h3>
                        <div style={{ fontSize: '10.5px', color: c.textSecondary, marginTop: '2px' }}>
                          Live busbar hierarchy from incoming DISCO feeder to production floor
                        </div>
                      </div>
                      <span style={{ background: '#dcfce7', color: '#059669', fontSize: '9.5px', fontWeight: 800, padding: '2px 8px', borderRadius: '4px' }}>
                        4 BUSBARS LIVE
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {[
                        { code: 'PCC-01', name: 'Airjet Weaving Looms (40 Tsudakoma)', kw: '420.0 kW', pf: '0.94 PF', status: 'NOMINAL', color: '#059669' },
                        { code: 'PCC-02', name: 'Thies Dyeing Vats (High-Temp Vats 1-4)', kw: '280.5 kW', pf: '0.92 PF', status: 'PROTECTED', color: '#0284c7' },
                        { code: 'PCC-03', name: 'Atlas Copco Air Compressors (100 PSI)', kw: '91.4 kW', pf: '0.89 PF', status: 'SHED ARMED', color: '#d97706' },
                        { code: 'MCC-04', name: 'HVAC & Administration Building', kw: '32.1 kW', pf: '0.91 PF', status: 'AUTO-SHEDDED', color: '#64748b' },
                      ].map((feeder) => (
                        <div
                          key={feeder.code}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            background: c.bgCardElevated,
                            border: `1px solid ${c.borderSubtle}`,
                            padding: '10px 14px',
                            borderRadius: '10px',
                          }}
                        >
                          <div>
                            <div style={{ fontSize: '12px', fontWeight: 700, color: c.textPrimary }}>
                              {feeder.code}: {feeder.name}
                            </div>
                            <div style={{ fontSize: '10px', color: c.textMuted }}>Power Factor: {feeder.pf}</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '12px', fontWeight: 800, color: c.accent, fontFamily: 'monospace' }}>
                              {feeder.kw}
                            </div>
                            <span style={{ fontSize: '8.5px', fontWeight: 800, color: feeder.color, background: '#ffffff', padding: '1px 5px', borderRadius: '3px' }}>
                              {feeder.status}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Operational Alerts & Machinery Watchlist */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    {/* Operational Alert Card */}
                    <div
                      style={{
                        background: '#fffbeb',
                        border: '1px solid #fde68a',
                        borderRadius: '14px',
                        padding: '14px 16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <AlertTriangle size={18} color="#d97706" />
                        <div>
                          <div style={{ fontSize: '12px', fontWeight: 700, color: '#92400e' }}>
                            1 Operational Warning Active
                          </div>
                          <div style={{ fontSize: '10px', color: '#b45309' }}>
                            Compressor #02 Power Factor Dip (0.81 PF)
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => triggerToast('APFC Capacitor Bank Step 4 Engaged! PF restored to 0.94.')}
                        style={{
                          background: '#d97706',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '6px',
                          fontSize: '10.5px',
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Auto-Resolve
                      </button>
                    </div>

                    {/* Critical Machinery Watchlist */}
                    <div
                      style={{
                        background: c.bgCard,
                        border: `1px solid ${c.border}`,
                        borderRadius: '14px',
                        padding: '16px',
                        flex: 1,
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: c.textPrimary }}>Critical Machinery Watchlist</span>
                        <span style={{ fontSize: '9px', color: c.textMuted }}>Live Modbus Polling</span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {DEMO_MACHINES.slice(0, 3).map((m) => (
                          <div
                            key={m.id}
                            onClick={() => {
                              setInspectedMachine(m);
                              handleCardClick('MACHINE_INSPECT_MODAL');
                            }}
                            className="minimal-card-hover"
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              background: c.bgCardElevated,
                              padding: '8px 12px',
                              borderRadius: '8px',
                              cursor: 'pointer',
                            }}
                          >
                            <div>
                              <div style={{ fontSize: '11px', fontWeight: 700, color: c.textPrimary }}>{m.name}</div>
                              <div style={{ fontSize: '9px', color: c.textMuted }}>{m.department} · {m.line}</div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontSize: '11px', fontWeight: 800, color: c.accent, fontFamily: 'monospace' }}>
                                {m.currentKw} kW
                              </div>
                              <span style={{ fontSize: '8px', fontWeight: 800, color: '#059669' }}>INSPECT →</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-time 3-Phase Harmonics & Transformer Substation Telemetry */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: c.textSecondary, marginBottom: '6px' }}>
                      3-PHASE VOLTAGE HARMONICS (THD)
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '13px' }}>
                      <span>Ph A: <strong style={{ color: '#059669' }}>1.4%</strong></span>
                      <span>Ph B: <strong style={{ color: '#059669' }}>1.6%</strong></span>
                      <span>Ph C: <strong style={{ color: '#059669' }}>1.5%</strong></span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#059669', marginTop: '6px' }}>
                      IEEE 519 Standard Compliant (&lt;5.0% THD limit)
                    </div>
                  </div>

                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: c.textSecondary, marginBottom: '6px' }}>
                      TRANSFORMER WINDING TEMP
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '20px', fontWeight: 800, color: c.textPrimary, fontFamily: 'monospace' }}>58.4 °C</span>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#059669', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>NORMAL COOLING</span>
                    </div>
                    <div style={{ fontSize: '10px', color: c.textMuted, marginTop: '4px' }}>
                      ONAN Oil Immersion · Alarm Threshold: 85.0 °C
                    </div>
                  </div>

                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: c.textSecondary, marginBottom: '6px' }}>
                      BUCHHOLZ GAS RELAY STATUS
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '15px', fontWeight: 800, color: '#059669' }}>0 ppm (STABLE)</span>
                      <span style={{ fontSize: '9px', fontWeight: 800, color: '#059669', background: '#dcfce7', padding: '2px 6px', borderRadius: '4px' }}>NO GAS TRAPPED</span>
                    </div>
                    <div style={{ fontSize: '10px', color: c.textMuted, marginTop: '4px' }}>
                      Substation 11kV/415V Interlock Healthy
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 3: SYSTEM ARCHITECTURE & SENSORS                                    */}
            {/* ========================================================================= */}
            {activeTab === 'SYSTEM_ARCH' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: c.textPrimary, margin: 0 }}>
                      System Architecture & Edge Modbus Topology
                    </h2>
                    <div style={{ fontSize: '11px', color: c.textSecondary, marginTop: '2px' }}>
                      Advantech Edge Gateways · Schneider PM5110 · Dual-SIM 4G Failover Router
                    </div>
                  </div>
                  <span style={{ background: '#dcfce7', color: '#059669', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                    IEC 61869-2 COMPLIANT
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '14px' }}>
                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Cpu size={16} color={c.accent} />
                      <strong style={{ fontSize: '13px', color: c.textPrimary }}>Advantech ADAM-6000 Gateway</strong>
                    </div>
                    <p style={{ fontSize: '11px', color: c.textSecondary, margin: '0 0 10px 0' }}>
                      Aggregates 32 Modbus RS-485 nodes over shielded twisted pair cable with 120Ω terminating resistors.
                    </p>
                    <div style={{ fontSize: '10px', color: '#059669', fontWeight: 700, fontFamily: 'monospace' }}>
                      BAUD: 9600 8N1 · LATENCY: 142ms · 0 PACKET LOSS
                    </div>
                  </div>

                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Radio size={16} color="#0284c7" />
                      <strong style={{ fontSize: '13px', color: c.textPrimary }}>Dual-SIM 4G Industrial LTE</strong>
                    </div>
                    <p style={{ fontSize: '11px', color: c.textSecondary, margin: '0 0 10px 0' }}>
                      Dual active cellular radios (Zong 4G Primary / Jazz 4G Secondary) ensure uninterrupted telemetry transmission.
                    </p>
                    <div style={{ fontSize: '10px', color: '#0284c7', fontWeight: 700, fontFamily: 'monospace' }}>
                      PRIMARY: ZONG (-68 dBm) · STANDBY: JAZZ (-74 dBm)
                    </div>
                  </div>

                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <Gauge size={16} color="#d97706" />
                      <strong style={{ fontSize: '13px', color: c.textPrimary }}>Split-Core Rogowski Coils</strong>
                    </div>
                    <p style={{ fontSize: '11px', color: c.textSecondary, margin: '0 0 10px 0' }}>
                      Clamp-on non-invasive secondary current transformers install in &lt;15 mins per transformer without power interruption.
                    </p>
                    <div style={{ fontSize: '10px', color: '#d97706', fontWeight: 700, fontFamily: 'monospace' }}>
                      CLASS 0.2S ACCURACY · 0-1000A RANGE · 180° INVERT OK
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 4: AI/ML STACK & DAY-AHEAD FORECASTING                               */}
            {/* ========================================================================= */}
            {activeTab === 'AI_ML_STACK' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: c.textPrimary, margin: 0 }}>
                      AI/ML Intelligence & Day-Ahead Forecast
                    </h2>
                    <div style={{ fontSize: '11px', color: c.textSecondary, marginTop: '2px' }}>
                      LSTM Neural Feeder Stability · MILP Load Shifting Optimization · Auto-Encoder Anomaly Detection
                    </div>
                  </div>
                  <span style={{ background: '#dcfce7', color: '#059669', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                    R² = 0.984 ACCURACY
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 800, color: c.textPrimary, margin: '0 0 8px 0' }}>
                      24-Hour Day-Ahead FESCO Grid Stability Prediction
                    </h3>
                    <p style={{ fontSize: '11px', color: c.textSecondary }}>
                      Forecasts grid brownouts and feeder trips with 87% accuracy up to 45 minutes before occurrence, triggering proactive captive pre-crank.
                    </p>
                    <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '8px', border: `1px solid ${c.borderSubtle}` }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: c.accent }}>Next Critical Feeder Curfew: 18:00 PKT</div>
                      <div style={{ fontSize: '10px', color: c.textSecondary }}>Expected Frequency Dip: 48.6 Hz (-2.8%)</div>
                    </div>
                  </div>

                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <h3 style={{ fontSize: '13px', fontWeight: 800, color: c.textPrimary, margin: '0 0 8px 0' }}>
                      Mixed-Integer Linear Programming (MILP) Solver
                    </h3>
                    <p style={{ fontSize: '11px', color: c.textSecondary }}>
                      Reschedules non-critical batches (e.g. textile dyeing vats and air compressors) from peak hours (Rs. 85/kWh) to off-peak (Rs. 32.50/kWh).
                    </p>
                    <div style={{ background: c.bgCardElevated, padding: '12px', borderRadius: '8px', border: `1px solid ${c.borderSubtle}` }}>
                      <div style={{ fontSize: '11px', fontWeight: 700, color: '#059669' }}>Calculated Monthly Tariff Savings: Rs. 1,840,000</div>
                      <div style={{ fontSize: '10px', color: c.textSecondary }}>Solver Run Time: 34ms (Branch & Bound)</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 5: SWIFTSWITCH™ BACKUP & DIESEL CURTAILMENT                         */}
            {/* ========================================================================= */}
            {activeTab === 'SWIFTSWITCH' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: c.textPrimary, margin: 0 }}>
                      SwiftSwitch™ Sub-Cycle ATS & Captive Genset Automation
                    </h2>
                    <div style={{ fontSize: '11px', color: c.textSecondary, marginTop: '2px' }}>
                      0.83ms Optical Contactor Transfer · Eliminates 15-Minute Chowkidar Lag
                    </div>
                  </div>
                  <button
                    onClick={handleAtsTestFire}
                    style={{
                      background: 'linear-gradient(135deg, #0d9488, #059669)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '8px 14px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 800,
                      cursor: 'pointer',
                      boxShadow: '0 2px 8px rgba(13, 148, 136, 0.3)',
                    }}
                  >
                    ⚡ Test-Fire 0.83ms ATS
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '14px' }}>
                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: c.textSecondary, fontWeight: 700 }}>BENCHMARK TRANSFER TIME</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: c.textPrimary, fontFamily: 'monospace', margin: '4px 0' }}>
                      0.83 ms
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#059669' }}>Sub-cycle optical thyristor firing</div>
                  </div>

                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: c.textSecondary, fontWeight: 700 }}>DIESEL RESERVE TANK</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: c.textPrimary, fontFamily: 'monospace', margin: '4px 0' }}>
                      8,400 L
                    </div>
                    <div style={{ fontSize: '10.5px', color: c.accent }}>38 hours continuous emergency runtime</div>
                  </div>

                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: c.textSecondary, fontWeight: 700 }}>PREVENTED BATCH DEFECTS</div>
                    <div style={{ fontSize: '26px', fontWeight: 800, color: c.textPrimary, fontFamily: 'monospace', margin: '4px 0' }}>
                      12 Batches
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#059669' }}>Rs. 3.4M textile yardage protected from tear</div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 6: SAVINGS AUDIT & MEEZAN BANK SHARIAH LEDGER                       */}
            {/* ========================================================================= */}
            {activeTab === 'SAVINGS_AUDIT' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: c.textPrimary, margin: 0 }}>
                      Savings Audit & Meezan Bank Shariah-Compliant Gain-Share
                    </h2>
                    <div style={{ fontSize: '11px', color: c.textSecondary, marginTop: '2px' }}>
                      IPMVP Option C Sealed Baseline · 80% Mill Cash Retained / 20% WattWise Performance Fee
                    </div>
                  </div>
                  <button
                    onClick={() => triggerToast('Meezan Bank Shariah Audit Challan downloaded!')}
                    style={{
                      background: c.bgCardElevated,
                      color: c.accent,
                      border: `1px solid ${c.border}`,
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Download size={13} /> Download Meezan Challan (.PDF)
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: c.textSecondary, fontWeight: 700 }}>GROSS VERIFIED SAVINGS</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: c.textPrimary, fontFamily: 'monospace', margin: '6px 0' }}>
                      Rs. 1,840,000
                    </div>
                    <div style={{ fontSize: '10.5px', color: c.textMuted }}>Month of March 2026</div>
                  </div>

                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: '#059669', fontWeight: 700 }}>NET FACTORY CASH (80%)</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', fontFamily: 'monospace', margin: '6px 0' }}>
                      Rs. 1,472,000
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#059669' }}>Direct bottom-line profit retained</div>
                  </div>

                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: c.accent, fontWeight: 700 }}>WATTWISE 20% GAIN-SHARE</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: c.accent, fontFamily: 'monospace', margin: '6px 0' }}>
                      Rs. 368,000
                    </div>
                    <div style={{ fontSize: '10.5px', color: c.textMuted }}>Meezan Bank IBFT Escrow Settled</div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 7: CARBON TRACKER & EU CBAM COMPLIANCE                              */}
            {/* ========================================================================= */}
            {activeTab === 'CARBON_TRACKER' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: c.textPrimary, margin: 0 }}>
                      Carbon Emissions Accounting & EU CBAM Compliance
                    </h2>
                    <div style={{ fontSize: '11px', color: c.textSecondary, marginTop: '2px' }}>
                      Scope 1 & 2 Emissions Ledger · €85/ton EU Border Tax Liability Averted
                    </div>
                  </div>
                  <button
                    onClick={() => triggerToast('EU CBAM Green Export Certificate downloaded!')}
                    style={{
                      background: 'linear-gradient(135deg, #059669, #10b981)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '7px 12px',
                      borderRadius: '8px',
                      fontSize: '11px',
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <Download size={13} /> Export CBAM Certificate (.PDF)
                  </button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: c.textSecondary, fontWeight: 700 }}>SCOPE 1 (DIESEL)</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: c.textPrimary, fontFamily: 'monospace', margin: '6px 0' }}>
                      14.2 Tons
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#059669' }}>-74% diesel runtime reduction</div>
                  </div>

                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: c.textSecondary, fontWeight: 700 }}>SCOPE 2 (GRID)</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: c.textPrimary, fontFamily: 'monospace', margin: '6px 0' }}>
                      24.2 Tons
                    </div>
                    <div style={{ fontSize: '10.5px', color: c.accent }}>0.48 kg CO2/kWh FESCO factor</div>
                  </div>

                  <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: '14px', padding: '16px' }}>
                    <div style={{ fontSize: '11px', color: c.textSecondary, fontWeight: 700 }}>EU CBAM TAX AVOIDANCE</div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: '#059669', fontFamily: 'monospace', margin: '6px 0' }}>
                      €3,264
                    </div>
                    <div style={{ fontSize: '10.5px', color: '#059669' }}>Direct European buyer rebate eligible</div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================================= */}
            {/* VIEW 8: 20-MILL INDUSTRIAL FLEET GRID                                    */}
            {/* ========================================================================= */}
            {activeTab === 'FLEET' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h2 style={{ fontSize: '18px', fontWeight: 800, color: c.textPrimary, margin: 0 }}>
                      20-Mill Industrial Fleet Grid (Pakistan Phase 3)
                    </h2>
                    <div style={{ fontSize: '11px', color: c.textSecondary, marginTop: '2px' }}>
                      Faisalabad Textile Hub · Karachi Port Export Zone · Lahore Industrial Estate
                    </div>
                  </div>
                  <span style={{ background: '#dcfce7', color: '#059669', fontSize: '10px', fontWeight: 800, padding: '3px 8px', borderRadius: '6px' }}>
                    20 MILLS ONLINE · 52.4 MW MONITORED
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                  {FLEET_MILLS_20.map((mill) => (
                    <div
                      key={mill.id}
                      onClick={() => triggerToast(`Connecting telemetry for ${mill.name}...`)}
                      className="minimal-card-hover"
                      style={{
                        background: c.bgCard,
                        border: `1px solid ${c.border}`,
                        borderRadius: '12px',
                        padding: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <strong style={{ fontSize: '12px', color: c.textPrimary }}>{mill.name}</strong>
                          <div style={{ fontSize: '10px', color: c.textMuted }}>{mill.city} · {mill.disco} Feeder</div>
                        </div>
                        <span
                          style={{
                            fontSize: '9px',
                            fontWeight: 800,
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: mill.status === 'ONLINE_HEALTHY' ? '#dcfce7' : '#fef9c3',
                            color: mill.status === 'ONLINE_HEALTHY' ? '#059669' : '#b45309',
                          }}
                        >
                          {mill.status.replace('_', ' ')}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '11px', fontFamily: 'monospace' }}>
                        <span style={{ color: c.textSecondary }}>Load: {(mill.currentKw / 1000).toFixed(2)} MW</span>
                        <span style={{ color: c.accent, fontWeight: 700 }}>Saved: Rs. {(mill.monthlySavingsPkr / 1000000).toFixed(2)}M</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
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
    </div>
  );
};
