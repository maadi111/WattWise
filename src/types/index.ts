export type IndustrySector = 'TEXTILE' | 'SURGICAL' | 'FOOD' | 'PHARMA' | 'STEEL';

export interface Factory {
  id: string;
  name: string;
  sector: IndustrySector;
  city: string;
  disco: string; // FESCO, GEPCO, LESCO, K-Electric
  wapdaFeeder: string;
  plan: 'STARTER (GAIN-SHARE)' | 'GROWTH (ANNUAL SAAS)' | 'ENTERPRISE';
  peakLoadKw: number;
  generatorKva: number;
  dieselCostPerLiterPkr: number;
  gridRatePerKwhPkr: number;
  dieselRatePerKwhPkr: number;
  nodesCount: number;
  monthlyAverageSavingsPkr: number;
}

export type LoadPriority = 'CRITICAL_PROTECTED' | 'ESSENTIAL' | 'SHEDDABLE_NON_CRITICAL';

export interface SensorNode {
  id: string;
  factoryId: string;
  label: string;
  section: string;
  ctRangeA: 50 | 200 | 600;
  phase: 1 | 3;
  currentAmps: number;
  voltageV: number;
  powerKw: number;
  powerFactor: number;
  temperatureC: number;
  harmonicDistortionThd: number;
  onGrid: boolean;
  isShed: boolean;
  priority: LoadPriority;
  processDescription: string;
  installedAt: string;
  lastSeen: string;
}

export interface LiveTelemetry {
  factoryId: string;
  timestamp: string;
  gridStatus: 'HEALTHY' | 'FREQUENCY_SAG' | 'VOLTAGE_DIP' | 'OUTAGE_ACTIVE' | 'STABILIZING';
  activeSource: 'GRID' | 'DIESEL_GEN';
  gridVoltage: number;
  gridFrequency: number;
  totalKw: number;
  powerFactorAvg: number;
  costPerHourPkr: number;
  gridCostPerHourPkr: number;
  dieselCostPerHourPkr: number;
  hourlyWasteAvoidedPkr: number;
  dieselFuelRateLph: number;
  nodes: {
    id: string;
    label: string;
    kw: number;
    amps: number;
    status: 'ACTIVE' | 'SHED' | 'PROTECTED';
  }[];
}

export interface PredictedOutage {
  id: string;
  start: string;
  end: string;
  durationMinutes: number;
  confidence: number;
  cause: string;
  triggerType: 'WAPDA_ROSTER' | 'FREQUENCY_ANOMALY' | 'NEPRA_GENERATION_DEFICIT';
}

export interface ScheduleRecommendation {
  id: string;
  time: string;
  action: 'RUN_HEAVY_LOAD' | 'PRE_HEAT_VATS' | 'THROTTLE_NON_CRITICAL' | 'PRE_EMPTIVE_SWITCH' | 'RETURN_TO_GRID';
  description: string;
  affectedSections: string[];
  estimatedSavingPkr: number;
  urgency: 'NORMAL' | 'HIGH' | 'CRITICAL';
}

export interface SavingsRecord {
  periodMonth: string;
  baselinePkr: number;
  actualPkr: number;
  grossSavingPkr: number;
  wattwiseFeePkr: number;
  netSavingPkr: number;
  roiMultiple: number;
  auditHash: string;
  lockedAt: string;
  dieselHoursSaved: number;
  co2AvoidedKg: number;
  generatorRunHours: number;
  status: 'LOCKED' | 'AUDITED' | 'INVOICED';
}

export interface WapdaBillAudit {
  month: string;
  consumerNumber: string;
  tariffCategory: string;
  billedUnits: number;
  actualSensorUnits: number;
  discrepancyUnits: number;
  discrepancyPercent: number;
  overbilledAmountPkr: number;
  fuelPriceAdjustmentPkr: number;
  quarterlyAdjustmentPkr: number;
  taxesAndSurchargesPkr: number;
  disputeStatus: 'DETECTED' | 'EVIDENCE_READY' | 'DISPUTED_WITH_NEPRA';
}

export interface SwiftSwitchState {
  status: 'MONITORING_GRID' | 'OUTAGE_PREDICTED' | 'WARMING_GENERATOR' | 'SEAMLESS_TRANSFER' | 'ISLANDED_GENERATOR' | 'GRID_RETURN_VERIFYING';
  countdownSeconds: number;
  confidenceScore: number;
  preShedNonCritical: boolean;
  protectedVatsLocked: boolean;
  transferDurationMs: number;
  outageTimeExpected: string;
  voltageCheckPassedSeconds: number;
}

export type MillCluster = 'FAISALABAD' | 'MULTAN' | 'LAHORE_SHEIKHUPURA' | 'SIALKOT_GUJRANWALA' | 'KARACHI';

export interface FleetMillDeployment {
  id: string;
  name: string;
  shortName: string;
  sector: IndustrySector;
  cluster: MillCluster;
  city: string;
  province: 'Punjab' | 'Sindh' | 'KP';
  disco: 'FESCO' | 'LESCO' | 'MEPCO' | 'GEPCO' | 'K-Electric';
  feederCode: string;
  status: 'ONLINE_HEALTHY' | 'PEAK_CURTAILMENT' | 'ISLANDED_GEN' | 'TELEMETRY_WARN';
  peakLoadKw: number;
  currentKw: number;
  powerFactor: number;
  monthlySavingsPkr: number;
  wattwiseBillingPkr: number;
  billingStatus: 'PAID_MEEZAN' | 'NET_15_PENDING' | 'AUDIT_STAGE';
  gatewayId: string;
  packetIngestionRate: number; // e.g. 99.9%
  lastPing: string;
  installedDate: string;
  ownerName: string;
  ownerPhone: string;
}

export type IncidentSeverity = 'SEV_1' | 'SEV_2' | 'SEV_3' | 'SEV_4';

export interface FleetIncident {
  id: string;
  millId: string;
  millName: string;
  feederCode: string;
  severity: IncidentSeverity;
  title: string;
  description: string;
  slaMinutes: number;
  elapsedMinutes: number;
  status: 'ACTIVE' | 'INVESTIGATING' | 'RESOLVED';
  assignedTech: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface GainShareInvoice {
  id: string;
  millId: string;
  millName: string;
  month: string;
  verifiedSavingsPkr: number;
  gainShareFeePkr: number;
  praTaxPkr: number; // 16% PRA
  totalPayablePkr: number;
  status: 'PAID' | 'DUE_NET_15' | 'OVERDUE' | 'AUDIT_REVIEW';
  dueDate: string;
  paidDate?: string;
  meezanRef?: string;
  cprChallanNumber?: string;
}

export interface WhatsAppDigestData {
  millId: string;
  millName: string;
  ownerName: string;
  dateStr: string;
  yesterdayCostPkr: number;
  baselineCostPkr: number;
  netSavingsPkr: number;
  peakHoursAvoided: number;
  peakSavingsPkr: number;
  dieselLitersSaved: number;
  powerFactor: number;
  pfPenaltyStatus: 'SAFE' | 'WARNING';
}
