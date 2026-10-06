export type NavSectionId =
  | 'command_center'
  | 'power_floor'
  | 'swiftswitch'
  | 'loadshift'
  | 'grid_forecast'
  | 'energy_analytics'
  | 'anomalies'
  | 'savings_ledger'
  | 'utility_audit'
  | 'billing'
  | 'carbon_esg'
  | 'assets'
  | 'edge_controllers'
  | 'sensors'
  | 'shift_reports'
  | 'documents'
  | 'facilities'
  | 'access_control'
  | 'integrations'
  | 'system_health'
  | 'fleet_phase3'
  | 'roadmap';

export interface MachineDetail {
  id: string;
  name: string;
  code: string;
  line: string;
  department: string;
  status: 'RUNNING' | 'IDLE' | 'MAINTENANCE' | 'SHED';
  currentKw: number;
  currentAmps: number;
  voltageV: number;
  powerFactor: number;
  frequencyHz: number;
  temperatureC: number;
  utilizationPercent: number;
  dailyConsumptionKwh: number;
  sevenDayTrendPercent: number;
  isProtected: boolean;
  anomalyDetected?: {
    title: string;
    description: string;
    confidence: number;
    possibleCause: string;
    recommendation: string;
  };
}

export interface FloorZone {
  id: string;
  name: string;
  nameUrdu: string;
  code: string;
  currentMw: number;
  powerFactor: number;
  activeCount: number;
  totalCount: number;
  status: 'STABLE' | 'HEAVY' | 'CRITICAL' | 'SHED';
  temperatureC: number;
  efficiencyPercent: number;
  machines: MachineDetail[];
}

export interface EnergyFlowNode {
  id: string;
  name: string;
  type: 'SOURCE' | 'TRANSFORMER' | 'DISTRIBUTION' | 'LINE' | 'LOAD';
  voltage: string;
  currentKw: number;
  powerFactor: number;
  status: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'SHED';
  children?: EnergyFlowNode[];
}

export interface OperationalAlert {
  id: string;
  category: 'CRITICAL' | 'ATTENTION' | 'OPTIMIZATION' | 'FINANCIAL' | 'SYSTEM';
  title: string;
  description: string;
  metric: string;
  timestamp: string;
  actionLabel: string;
  targetNav: NavSectionId;
}
