import React, { useState } from 'react';
import { Zap, Volume2, VolumeX, Globe, Building2, ShieldAlert, Cpu, UserCheck, Radio } from 'lucide-react';
import { Factory, LiveTelemetry, SwiftSwitchState } from '../types';
import { translations } from '../data/translations';
import { industrialAudio } from '../services/soundEffects';
import { useAuth } from '../lib/auth';
import { LoginModal } from '../pages/Login';

interface HeaderProps {
  factories: Factory[];
  selectedFactory: Factory;
  onSelectFactory: (factory: Factory) => void;
  telemetry: LiveTelemetry;
  swiftSwitch: SwiftSwitchState;
  lang: 'en' | 'ur';
  onToggleLang: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenUrduReport: () => void;
  isWebSocketLive?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  factories,
  selectedFactory,
  onSelectFactory,
  telemetry,
  swiftSwitch,
  lang,
  onToggleLang,
  soundEnabled,
  onToggleSound,
  onOpenUrduReport,
  isWebSocketLive = false,
}) => {
  const { user } = useAuth();
  const [loginModalOpen, setLoginModalOpen] = useState(false);
  const t = translations[lang];
  const isUrdu = lang === 'ur';

  const isPreWarning = swiftSwitch.status === 'OUTAGE_PREDICTED' || swiftSwitch.status === 'WARMING_GENERATOR';
  const isSwitching = swiftSwitch.status === 'SEAMLESS_TRANSFER';

  // Filter factories based on user's tenant permissions
  const availableFactories = factories.filter(f => user?.role === 'super_admin' || user?.factoryIds.includes(f.id));

  return (
    <header className="top-header">
      {/* Imminent Pre-emptive Switchover Alert Banner */}
      {(isPreWarning || isSwitching) && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(244, 63, 94, 0.95), rgba(245, 158, 11, 0.95))',
          color: '#ffffff',
          padding: '8px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 700,
          fontSize: '0.85rem',
          boxShadow: '0 4px 20px rgba(244, 63, 94, 0.4)',
          marginBottom: '12px',
          borderRadius: '8px',
          animation: 'pulse 1.5s infinite',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={20} className="pulse-dot" />
            <span>
              {isPreWarning
                ? `⚡ SWIFTSWITCH™ PRE-EMPTIVE ACTION: WAPDA grid collapse predicted in ${swiftSwitch.countdownSeconds}s! Pre-igniting 1250kVA generator.`
                : '⚡ SWIFTSWITCH™ TRANSFER ACTIVE: Seamless 8-second zero-flicker ATS transfer in progress! 91.4kW non-critical loads shed.'}
            </span>
          </div>
          <span style={{ fontFamily: 'var(--font-mono)', background: 'rgba(0,0,0,0.3)', padding: '2px 8px', borderRadius: '4px' }}>
            CONFIDENCE: {(swiftSwitch.confidenceScore * 100).toFixed(0)}%
          </span>
        </div>
      )}

      <div className="header-inner">
        <div className="brand-section">
          <div className="brand-icon-box">
            <Zap size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 className={`brand-title ${isUrdu ? 'urdu-text' : ''}`}>
                {t.brandTitle}
              </h1>
              <span className={`live-badge ${telemetry.activeSource === 'GRID' ? 'online' : 'warning'}`}>
                <span className="pulse-dot" />
                {telemetry.activeSource === 'GRID' ? 'GRID: LIVE' : 'CAPTIVE GEN'}
              </span>
              <span className={`live-badge ${isWebSocketLive ? 'online' : 'warning'}`} style={{ fontSize: '0.65rem' }}>
                <Radio size={10} />
                {isWebSocketLive ? 'WS: LIVE' : 'STREAM: READY'}
              </span>
            </div>
            <div className={`brand-subtitle ${isUrdu ? 'urdu-text' : ''}`}>
              <span>{t.tagline}</span>
              <span style={{ color: 'var(--text-dim)' }}>•</span>
              <span style={{ color: 'var(--cyan-neon)' }}>v1.0 (AWS Bahrain)</span>
            </div>
          </div>
        </div>

        {/* Center / Right Control Cluster */}
        <div className="header-actions">
          {/* Running Savings Ticker */}
          <div className="top-savings-chip">
            <span className={`savings-label ${isUrdu ? 'urdu-text' : ''}`}>{t.savingsThisMonth}</span>
            <span className="savings-val" style={{ color: 'var(--emerald-neon)' }}>
              Rs. {selectedFactory.monthlyAverageSavingsPkr.toLocaleString('en-PK')}
            </span>
          </div>

          {/* Multi-Tenant Factory Selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Building2 size={16} style={{ color: 'var(--text-muted)' }} />
            <select
              aria-label="Select Industrial Facility"
              className="factory-select-box"
              value={selectedFactory.id}
              onChange={(e) => {
                const target = availableFactories.find(f => f.id === e.target.value);
                if (target) onSelectFactory(target);
              }}
            >
              {availableFactories.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.city})
                </option>
              ))}
            </select>
          </div>

          {/* User / RBAC Account Button */}
          <button
            onClick={() => setLoginModalOpen(true)}
            className="btn btn-outline btn-sm"
            title="Switch User Role / Test Multi-Tenant Auth"
            style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem' }}
          >
            <UserCheck size={14} style={{ color: 'var(--cyan-neon)' }} />
            <span>{user?.fullName.split(' ')[0]} ({user?.role === 'super_admin' ? 'CTO' : user?.role === 'factory_owner' ? 'Owner' : 'Mgr'})</span>
          </button>

          {/* Urdu Shift Report Button */}
          <button
            onClick={onOpenUrduReport}
            className="btn btn-outline btn-sm urdu-text"
            title="Generate automated shift summary in Urdu"
            style={{ fontSize: '0.85rem', borderColor: 'rgba(6, 182, 212, 0.4)', color: 'var(--cyan-neon)' }}
          >
            {t.shiftReportUrdu}
          </button>

          {/* Urdu / English Language Switcher */}
          <button
            onClick={onToggleLang}
            className="btn btn-outline btn-sm"
            title="Switch Language (English / اردو)"
            style={{ minWidth: '40px' }}
          >
            <Globe size={14} />
            <span style={{ fontWeight: 700 }}>{lang === 'en' ? 'اردو' : 'EN'}</span>
          </button>

          {/* Audio Synthesizer Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              industrialAudio.setSoundEnabled(next);
              onToggleSound();
              if (next) industrialAudio.playSuccessChime();
            }}
            className="btn btn-outline btn-sm"
            title={soundEnabled ? 'Mute Industrial Sound Effects' : 'Enable Industrial Sound Effects'}
          >
            {soundEnabled ? <Volume2 size={15} style={{ color: 'var(--emerald-neon)' }} /> : <VolumeX size={15} style={{ color: 'var(--text-dim)' }} />}
          </button>
        </div>
      </div>

      <LoginModal isOpen={loginModalOpen} onClose={() => setLoginModalOpen(false)} />
    </header>
  );
};
