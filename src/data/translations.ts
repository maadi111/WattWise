export interface TranslationDictionary {
  brandTitle: string;
  tagline: string;
  liveGrid: string;
  activeSource: string;
  gridPower: string;
  dieselGen: string;
  savingsThisMonth: string;
  grossSavings: string;
  gainShareFee: string;
  netClientProfit: string;
  powerFloorMap: string;
  swiftSwitchAutomation: string;
  loadShiftScheduler: string;
  savingsLedger: string;
  wapdaAudit: string;
  carbonTracker: string;
  edgeHardware: string;
  pitchDeck: string;
  shiftReportUrdu: string;
  simulateBlackout: string;
  restoreGrid: string;
  recalculateSchedule: string;
  downloadCertificate: string;
  outagePredictedIn: string;
  generatorPreStarting: string;
  seamlessTransferActive: string;
  nonCriticalLoadsShed: string;
  protectedVatsLocked: string;
  fleetPhase3: string;
  fleetSubtitle: string;
}

export const translations: Record<'en' | 'ur', TranslationDictionary> = {
  en: {
    brandTitle: 'WattWise™ Industrial Intelligence',
    tagline: 'Cut industrial energy costs by 25–40% without changing a single machine',
    liveGrid: 'WAPDA 11kV Feeder Live',
    activeSource: 'Active Power Source',
    gridPower: 'National Grid (WAPDA)',
    dieselGen: 'Diesel Generator (Captive)',
    savingsThisMonth: 'Verified Savings This Month',
    grossSavings: 'Gross Savings Documented',
    gainShareFee: 'WattWise 20% Gain-Share',
    netClientProfit: 'Net Factory Economic Gain',
    powerFloorMap: 'Live Power Map',
    swiftSwitchAutomation: 'SwiftSwitch™ Automation',
    loadShiftScheduler: 'LoadShift™ Scheduler',
    savingsLedger: 'SavingsLedger™ Reports',
    wapdaAudit: 'WAPDA Bill Audit',
    carbonTracker: 'GSP+ Carbon Tracker',
    edgeHardware: 'WattBrain™ Diagnostics',
    pitchDeck: 'Business & Pitch Deck',
    shiftReportUrdu: 'Urdu Shift Report (اردو رپورٹ)',
    simulateBlackout: 'Simulate Grid Frequency Collapse',
    restoreGrid: 'Simulate Grid Voltage Restoration',
    recalculateSchedule: 'Re-run MILP Optimization',
    downloadCertificate: 'Download ESCO Savings Certificate (PDF)',
    outagePredictedIn: 'Grid Trip Imminent in',
    generatorPreStarting: 'Generator Pre-igniting (-8s)',
    seamlessTransferActive: 'Zero-Flicker ATS Transfer Active',
    nonCriticalLoadsShed: 'Non-critical Loads Shed (HVAC/Pumps)',
    protectedVatsLocked: 'Protected Dyeing Vats Locked Mid-Cycle',
    fleetPhase3: 'Fleet Ops (20 Mills)',
    fleetSubtitle: 'Pakistan 20-Mill Industrial Fleet Telemetry & Phase 3 Control Room',
  },
  ur: {
    brandTitle: 'واٹ وائز — صنعتی توانائی انٹیلی جنس',
    tagline: 'بغیر کسی مشین کو تبدیل کیے فیکٹری کے بجلی کے اخراجات میں 25 تا 40 فیصد کمی لائیں',
    liveGrid: 'واپڈا 11 کے وی فیڈر آن لائن',
    activeSource: 'موجودہ بجلی کا ذریعہ',
    gridPower: 'قومی گرڈ (واپڈا / فیسکو)',
    dieselGen: 'ڈیزل جنریٹر (کیپٹو پاور)',
    savingsThisMonth: 'رواں ماہ تصدیق شدہ بچت',
    grossSavings: 'مجموعی توانائی کی بچت',
    gainShareFee: 'واٹ وائز 20 فیصد منافع کا حصہ',
    netClientProfit: 'مل مالک کا خالص منافع',
    powerFloorMap: 'فیکٹری فلور پاور میپ',
    swiftSwitchAutomation: 'سوئفٹ سوئچ™ خودکار نظام',
    loadShiftScheduler: 'لوڈ شفٹ™ شیڈولر',
    savingsLedger: 'بچت لیجر™ آڈٹ رپورٹس',
    wapdaAudit: 'واپڈا بل کا موازنہ و آڈٹ',
    carbonTracker: 'جی ایس پی پلس کاربن ٹریکر',
    edgeHardware: 'واٹ برین™ ہارڈ ویئر تفصیلات',
    pitchDeck: 'کاروباری منصوبہ اور پچ ڈیک',
    shiftReportUrdu: 'شفٹ انرجی رپورٹ (اردو)',
    simulateBlackout: 'گرڈ فریکوئنسی فالٹ پیدا کریں',
    restoreGrid: 'واپڈا بجلی بحالی کا تجربہ کریں',
    recalculateSchedule: 'اے آئی شیڈول دوبارہ بنائیں',
    downloadCertificate: 'بینک آڈٹ سرٹیفکیٹ ڈاؤن لوڈ کریں (پی ڈی ایف)',
    outagePredictedIn: 'لوڈ شیڈنگ متوقع تا وقت',
    generatorPreStarting: 'جنریٹر پیشگی اسٹارٹ ہو رہا ہے (8 سیکنڈ قبل)',
    seamlessTransferActive: 'بغیر بجلی کٹے خودکار منتقلی فعال',
    nonCriticalLoadsShed: 'غیر ضروری لوڈ (اے سی / پمپس) بند کر دیے گئے',
    protectedVatsLocked: 'رنگائی کے حوضوں کو بند ہونے سے بچا لیا گیا',
    fleetPhase3: 'فلیٹ کنٹرول روم (20 فیکٹریاں)',
    fleetSubtitle: 'پاکستان بھر کی 20 صنعتی فیکٹریوں کی لائیو مانیٹرنگ اور فیز 3 کمرشل کنٹرول روم',
  },
};

