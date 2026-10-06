import React, { useState, useEffect } from 'react';
import { NavSectionId, MachineDetail } from './types/ui';
import { WattWiseShell } from './components/WattWiseShell';
import { CommandPalette } from './components/CommandPalette';
import { NotificationCenter } from './components/NotificationCenter';
import { MachineInspector } from './components/MachineInspector';

// View Imports
import { CommandCenterView } from './views/CommandCenterView';
import { PowerFloorView } from './views/PowerFloorView';
import { SwiftSwitchView } from './views/SwiftSwitchView';
import { LoadShiftView } from './views/LoadShiftView';
import { GridForecastView } from './views/GridForecastView';
import { AnalyticsView } from './views/AnalyticsView';
import { AnomaliesView } from './views/AnomaliesView';
import { SavingsLedgerView } from './views/SavingsLedgerView';
import { UtilityAuditView } from './views/UtilityAuditView';
import { BillingView } from './views/BillingView';
import { CarbonEsgView } from './views/CarbonEsgView';
import { AssetsView } from './views/AssetsView';
import { EdgeControllersView } from './views/EdgeControllersView';
import { SensorNetworkView } from './views/SensorNetworkView';
import { ShiftReportsView } from './views/ShiftReportsView';
import { DocumentsView } from './views/DocumentsView';
import { FacilitiesView } from './views/FacilitiesView';
import { AccessControlView } from './views/AccessControlView';
import { IntegrationsView } from './views/IntegrationsView';
import { SystemHealthView } from './views/SystemHealthView';
import { FleetOperationsView } from './views/FleetOperationsView';

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
        {renderActiveView()}
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
