import React, { useState, useEffect } from 'react';
import { NavSectionId, MachineDetail } from './types/ui';
import { WattWiseShell } from './components/WattWiseShell';
import { CommandPalette } from './components/CommandPalette';
import { NotificationCenter } from './components/NotificationCenter';
import { MachineInspector } from './components/MachineInspector';

// Lazy-loaded Industrial Views for dynamic code-splitting
const CommandCenterView = React.lazy(() => import('./views/CommandCenterView').then((m) => ({ default: m.CommandCenterView })));
const PowerFloorView = React.lazy(() => import('./views/PowerFloorView').then((m) => ({ default: m.PowerFloorView })));
const SwiftSwitchView = React.lazy(() => import('./views/SwiftSwitchView').then((m) => ({ default: m.SwiftSwitchView })));
const LoadShiftView = React.lazy(() => import('./views/LoadShiftView').then((m) => ({ default: m.LoadShiftView })));
const GridForecastView = React.lazy(() => import('./views/GridForecastView').then((m) => ({ default: m.GridForecastView })));
const AnalyticsView = React.lazy(() => import('./views/AnalyticsView').then((m) => ({ default: m.AnalyticsView })));
const AnomaliesView = React.lazy(() => import('./views/AnomaliesView').then((m) => ({ default: m.AnomaliesView })));
const SavingsLedgerView = React.lazy(() => import('./views/SavingsLedgerView').then((m) => ({ default: m.SavingsLedgerView })));
const UtilityAuditView = React.lazy(() => import('./views/UtilityAuditView').then((m) => ({ default: m.UtilityAuditView })));
const BillingView = React.lazy(() => import('./views/BillingView').then((m) => ({ default: m.BillingView })));
const CarbonEsgView = React.lazy(() => import('./views/CarbonEsgView').then((m) => ({ default: m.CarbonEsgView })));
const AssetsView = React.lazy(() => import('./views/AssetsView').then((m) => ({ default: m.AssetsView })));
const EdgeControllersView = React.lazy(() => import('./views/EdgeControllersView').then((m) => ({ default: m.EdgeControllersView })));
const SensorNetworkView = React.lazy(() => import('./views/SensorNetworkView').then((m) => ({ default: m.SensorNetworkView })));
const ShiftReportsView = React.lazy(() => import('./views/ShiftReportsView').then((m) => ({ default: m.ShiftReportsView })));
const DocumentsView = React.lazy(() => import('./views/DocumentsView').then((m) => ({ default: m.DocumentsView })));
const FacilitiesView = React.lazy(() => import('./views/FacilitiesView').then((m) => ({ default: m.FacilitiesView })));
const AccessControlView = React.lazy(() => import('./views/AccessControlView').then((m) => ({ default: m.AccessControlView })));
const IntegrationsView = React.lazy(() => import('./views/IntegrationsView').then((m) => ({ default: m.IntegrationsView })));
const SystemHealthView = React.lazy(() => import('./views/SystemHealthView').then((m) => ({ default: m.SystemHealthView })));
const FleetOperationsView = React.lazy(() => import('./views/FleetOperationsView').then((m) => ({ default: m.FleetOperationsView })));

import { DEMO_MACHINES } from './data/controlRoomData';
import { MinimalDashboardRedesign } from './components/MinimalDashboardRedesign';

export const App: React.FC = () => {
  const [viewMode, setViewMode] = useState<'minimal' | 'scada'>('minimal');
  const [currentSection, setCurrentSection] = useState<NavSectionId>('command_center');
  const [lang, setLang] = useState<'en' | 'ur'>('en');

  // Drawers and Modals State
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [inspectedMachine, setInspectedMachine] = useState<MachineDetail | null>(null);

  // Permanently lock document root to light theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
  }, []);

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

  const handleInspectMachineById = (id: string) => {
    const found = DEMO_MACHINES.find((m) => m.id === id) || DEMO_MACHINES[0];
    setInspectedMachine(found);
  };

  const renderActiveView = () => {
    switch (currentSection) {
      case 'command_center':
        return (
          <CommandCenterView
            onNavigate={(sec) => setCurrentSection(sec)}
            onInspectMachine={(m) => setInspectedMachine(m)}
            lang={lang}
          />
        );
      case 'power_floor':
        return (
          <PowerFloorView
            onInspectMachine={(m) => setInspectedMachine(m)}
            lang={lang}
          />
        );
      case 'swiftswitch':
        return <SwiftSwitchView lang={lang} />;
      case 'loadshift':
        return <LoadShiftView lang={lang} />;
      case 'grid_forecast':
        return <GridForecastView lang={lang} />;
      case 'energy_analytics':
        return <AnalyticsView lang={lang} />;
      case 'anomalies':
        return <AnomaliesView onInspectMachine={handleInspectMachineById} lang={lang} />;
      case 'savings_ledger':
        return <SavingsLedgerView lang={lang} />;
      case 'utility_audit':
        return <UtilityAuditView lang={lang} />;
      case 'billing':
        return <BillingView lang={lang} />;
      case 'carbon_esg':
        return <CarbonEsgView lang={lang} />;
      case 'assets':
        return (
          <AssetsView
            onInspectMachine={(m) => setInspectedMachine(m)}
            lang={lang}
          />
        );
      case 'edge_controllers':
        return <EdgeControllersView lang={lang} />;
      case 'sensors':
        return <SensorNetworkView lang={lang} />;
      case 'shift_reports':
        return <ShiftReportsView lang={lang} />;
      case 'documents':
        return <DocumentsView lang={lang} />;
      case 'facilities':
        return <FacilitiesView lang={lang} />;
      case 'access_control':
        return <AccessControlView lang={lang} />;
      case 'integrations':
        return <IntegrationsView lang={lang} />;
      case 'system_health':
        return <SystemHealthView lang={lang} />;
      case 'fleet_phase3':
        return <FleetOperationsView lang={lang} />;
      default:
        return (
          <CommandCenterView
            onNavigate={(sec) => setCurrentSection(sec)}
            onInspectMachine={(m) => setInspectedMachine(m)}
            lang={lang}
          />
        );
    }
  };

  if (viewMode === 'minimal') {
    return (
      <MinimalDashboardRedesign
        onOpenFleetOperations={() => {
          setViewMode('scada');
          setCurrentSection('fleet_phase3');
        }}
        onToggleScadaView={() => setViewMode('scada')}
      />
    );
  }

  return (
    <>
      <WattWiseShell
        currentSection={currentSection}
        onNavigate={(sec) => setCurrentSection(sec)}
        lang={lang}
        onToggleLang={() => setLang((prev) => (prev === 'en' ? 'ur' : 'en'))}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onOpenNotifications={() => setNotificationsOpen(true)}
        unreadNotificationsCount={3}
        onToggleMinimalView={() => setViewMode('minimal')}
      >
        <React.Suspense
          fallback={
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', color: 'var(--text-muted)' }}>
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    display: 'inline-block',
                    width: '32px',
                    height: '32px',
                    border: '3px solid rgba(16, 185, 129, 0.2)',
                    borderTopColor: '#10b981',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                <div style={{ marginTop: '12px', fontSize: '0.85rem', fontWeight: 600 }}>Loading industrial module...</div>
              </div>
            </div>
          }
        >
          {renderActiveView()}
        </React.Suspense>
      </WattWiseShell>

      {/* Global Command Palette (⌘ K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onNavigate={(sec) => setCurrentSection(sec)}
        onInspectMachine={handleInspectMachineById}
      />

      {/* Global Notification Center Drawer */}
      <NotificationCenter
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        onNavigate={(sec) => setCurrentSection(sec)}
      />

      {/* Contextual Right-Side Machine Inspector */}
      <MachineInspector
        machine={inspectedMachine}
        onClose={() => setInspectedMachine(null)}
        lang={lang}
      />
    </>
  );
};

export default App;
