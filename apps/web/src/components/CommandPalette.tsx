import React, { useState, useEffect } from 'react';
import { Search, Zap, Activity, Cpu, Shield, FileText, Database, Settings, ArrowRight, X } from 'lucide-react';
import { NavSectionId } from '../types/ui';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (section: NavSectionId) => void;
  onInspectMachine?: (machineId: string) => void;
}

interface CommandItem {
  id: string;
  title: string;
  category: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  action: () => void;
  shortcut?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onNavigate,
  onInspectMachine,
}) => {
  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (⌘K / Ctrl+K and Escape)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const commands: CommandItem[] = [
    {
      id: 'cmd-center',
      title: 'Go to Command Center',
      category: 'Operations',
      icon: Zap,
      action: () => { onNavigate('command_center'); onClose(); },
      shortcut: 'G C',
    },
    {
      id: 'power-floor',
      title: 'Open Factory Power Floor (2D Interactive Plan)',
      category: 'Operations',
      icon: Activity,
      action: () => { onNavigate('power_floor'); onClose(); },
      shortcut: 'G P',
    },
    {
      id: 'swiftswitch-sim',
      title: 'Start SwiftSwitch™ Pre-Emptive Transfer Simulation',
      category: 'Operations',
      icon: Shield,
      action: () => { onNavigate('swiftswitch'); onClose(); },
      shortcut: 'S W',
    },
    {
      id: 'loadshift-schedule',
      title: 'Generate LoadShift™ Optimal Production Schedule',
      category: 'Operations',
      icon: Database,
      action: () => { onNavigate('loadshift'); onClose(); },
      shortcut: 'L S',
    },
    {
      id: 'savings-certificate',
      title: 'Generate Verified Monthly Savings Certificate (SHA-256)',
      category: 'Financial',
      icon: FileText,
      action: () => { onNavigate('savings_ledger'); onClose(); },
      shortcut: 'S C',
    },
    {
      id: 'utility-audit',
      title: 'Open Utility Audit (FESCO / WAPDA Reconciliation)',
      category: 'Financial',
      icon: FileText,
      action: () => { onNavigate('utility_audit'); onClose(); },
      shortcut: 'U A',
    },
    {
      id: 'carbon-report',
      title: 'Generate Carbon & ESG Export-Readiness Report',
      category: 'Sustainability',
      icon: FileText,
      action: () => { onNavigate('carbon_esg'); onClose(); },
    },
    {
      id: 'inspect-loom18',
      title: 'Inspect Machine: Airjet Loom #18 (Weaving Hall)',
      category: 'Machines',
      icon: Cpu,
      action: () => {
        if (onInspectMachine) onInspectMachine('loom-18');
        onClose();
      },
    },
    {
      id: 'inspect-comp1',
      title: 'Inspect Machine: Atlas Copco GA-90 Compressor #01',
      category: 'Machines',
      icon: Cpu,
      action: () => {
        if (onInspectMachine) onInspectMachine('compressor-01');
        onClose();
      },
    },
    {
      id: 'sys-health',
      title: 'Inspect System Health & Telemetry Observability',
      category: 'System',
      icon: Settings,
      action: () => { onNavigate('system_health'); onClose(); },
    },
  ];

  const filtered = commands.filter(
    (cmd) =>
      cmd.title.toLowerCase().includes(query.toLowerCase()) ||
      cmd.category.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="ww-palette-overlay" onClick={onClose}>
      <div className="ww-palette-dialog" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          <Search size={18} color="var(--text-secondary)" style={{ marginRight: 10 }} />
          <input
            autoFocus
            type="text"
            placeholder="Search machines, sensors, events, reports, actions..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              fontSize: 14,
              fontFamily: 'var(--font-sans)',
            }}
          />
          <button
            onClick={onClose}
            className="ww-btn ww-btn-ghost"
            style={{ padding: 4 }}
          >
            <X size={16} />
          </button>
        </div>

        <div style={{ maxHeight: 380, overflowY: 'auto', padding: '8px 0' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: 13 }}>
              No matching commands or machines found for "{query}".
            </div>
          ) : (
            filtered.map((cmd) => {
              const Icon = cmd.icon;
              return (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '9px 16px',
                    cursor: 'pointer',
                    transition: 'background-color 0.15s ease',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--bg-surface-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ padding: 6, borderRadius: 'var(--radius-xs)', backgroundColor: 'var(--bg-surface-elevated)', color: 'var(--industrial-blue-light)' }}>
                      <Icon size={16} />
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-primary)', fontSize: 13, fontWeight: 500 }}>
                        {cmd.title}
                      </div>
                      <div style={{ color: 'var(--text-tertiary)', fontSize: 11 }}>
                        {cmd.category}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {cmd.shortcut && (
                      <span className="num-mono" style={{ fontSize: 11, padding: '2px 6px', borderRadius: 3, backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-secondary)' }}>
                        {cmd.shortcut}
                      </span>
                    )}
                    <ArrowRight size={14} color="var(--text-tertiary)" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-subtle)', backgroundColor: 'var(--bg-surface-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: 'var(--text-tertiary)' }}>
          <span>Navigation: <b style={{ color: 'var(--text-secondary)' }}>↑ ↓</b> to navigate, <b style={{ color: 'var(--text-secondary)' }}>↵</b> to select</span>
          <span>Close: <b style={{ color: 'var(--text-secondary)' }}>ESC</b></span>
        </div>
      </div>
    </div>
  );
};
