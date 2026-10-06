import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Zap,
  Cpu,
  Radio,
  FileText,
  Download,
  ArrowRight,
  ArrowLeft,
  Lock,
  Layers,
  Sparkles,
  X,
  Compass,
  Check,
  FileCheck,
  Activity,
  Award,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Factory } from '../types';
import { industrialAudio } from '../services/soundEffects';

interface SubstationCommissioningWizardProps {
  factory?: Factory;
  isOpen: boolean;
  onClose: () => void;
  lang?: 'en' | 'ur';
}

export const SubstationCommissioningWizard: React.FC<SubstationCommissioningWizardProps> = ({
  factory,
  isOpen,
  onClose,
  lang = 'en',
}) => {
  if (!isOpen) return null;

  const isUrdu = lang === 'ur';

  // Step state: 1 to 5
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Safety state
  const [safetyChecks, setSafetyChecks] = useState({
    gloves1000v: true,
    arcFlashVisor: true,
    lvBusbarOnly: true,
    fusedDisconnectInstalled: true,
    zeroShutdownVerified: true,
  });
  const [pecEngineer, setPecEngineer] = useState('Engr. Tariq Mehmood (PEC #ELECT-48291)');
  const [millSupervisor, setMillSupervisor] = useState('Ustad Liaquat Ali (Substation Supervisor)');

  // Step 2: Rogowski state
  const [modbusBaud, setModbusBaud] = useState('9600');
  const [detectedMeters, setDetectedMeters] = useState([
    { id: '1', model: 'Schneider Electric PM5110', busAddress: '0x01', status: 'LOCKED_9600_8N1' },
    { id: '2', model: 'WattBrain High-Speed ADC Hub (WB-04)', busAddress: '0x02', status: 'ACTIVE_10HZ' },
  ]);
  const [primarySignalRssi, setPrimarySignalRssi] = useState(-68); // dBm

  // Step 3: Phase & Polarity state
  const [phasePolarity, setPhasePolarity] = useState({
    phaseA: 'NORMAL',
    phaseB: 'REVERSED', // Demo reversed to show software inversion!
    phaseC: 'NORMAL',
  });
  const [phaseBInverted, setPhaseBInverted] = useState(false);

  // Step 4: Baseline agreement state
  const [baselineIndexKwh, setBaselineIndexKwh] = useState('14,892,104');
  const [specificEnergyKwhPerMeter, setSpecificEnergyKwhPerMeter] = useState('0.485');
  const [residentDirectorSign, setResidentDirectorSign] = useState('Mian Tariq Crescent');
  const [baselineLocked, setBaselineLocked] = useState(false);

  // Step 5: Presentation exported state
  const [presentationGenerated, setPresentationGenerated] = useState(false);

  // Toggle safety checklist
  const toggleSafetyCheck = (key: keyof typeof safetyChecks) => {
    industrialAudio.playClick();
    setSafetyChecks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Step Navigation
  const handleNextStep = () => {
    industrialAudio.playClick();
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    industrialAudio.playClick();
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  // Invert Phase B Polarity
  const handleInvertPhaseB = () => {
    industrialAudio.playSuccessChime();
    setPhaseBInverted(!phaseBInverted);
  };

  // Lock baseline
  const handleLockBaseline = () => {
    industrialAudio.playSuccessChime();
    setBaselineLocked(true);
  };

  // Generate Report
  const handleGenerateReport = () => {
    industrialAudio.playSuccessChime();
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#0d9488', '#10b981', '#06b6d4'],
    });
    setPresentationGenerated(true);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.45)',
        backdropFilter: 'blur(8px)',
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        overflowY: 'auto',
      }}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #d1e7e3',
          boxShadow: '0 25px 60px rgba(18, 75, 99, 0.16)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '920px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          color: '#0f172a',
          fontFamily: isUrdu ? 'var(--font-urdu, "Noto Nastaliq Urdu", serif)' : 'inherit',
        }}
      >
        {/* Modal Top Header */}
        <div
          style={{
            padding: '18px 24px',
            borderBottom: '1px solid #eef3f2',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'linear-gradient(180deg, #f8fafc 0%, #ffffff 100%)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                background: '#e6f7f2',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid #bbf7d0',
                color: '#0d9488',
              }}
            >
              <Compass size={20} />
            </div>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a' }}>
                {isUrdu ? 'سب اسٹیشن 3 گھنٹے ریپڈ کمیشننگ وزرڈ' : 'Substation 3-Hour Rapid Install & Commissioning Wizard'}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                {isUrdu
                  ? 'نان انویسو کلیمپ آن سینسرز · بغیر فیکٹری بند کیے · آئی ای سی 61869-2 مصدقہ'
                  : 'Zero-Downtime Rogowski Clamp Installation Protocol · IEC 61869-2 & IEC 60947-1 Compliance'}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: '#f1f5f9',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.15s ease',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Step Progress Indicator (1 to 5) */}
        <div
          style={{
            padding: '12px 24px',
            background: '#fafcfc',
            borderBottom: '1px solid #eef3f2',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            overflowX: 'auto',
            gap: '8px',
          }}
        >
          {[
            { num: 1, title: '1. Safety & PPE', icon: ShieldCheck },
            { num: 2, title: '2. Modbus & Coils', icon: Radio },
            { num: 3, title: '3. Phase & Polarity', icon: RotateCw },
            { num: 4, title: '4. Baseline Freeze', icon: Lock },
            { num: 5, title: '5. Boardroom Audit', icon: Award },
          ].map((s) => {
            const isActive = currentStep === s.num;
            const isCompleted = currentStep > s.num;
            const Icon = s.icon;

            return (
              <button
                key={s.num}
                onClick={() => setCurrentStep(s.num)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  padding: '8px 14px',
                  borderRadius: '10px',
                  background: isActive ? '#0d9488' : isCompleted ? '#dcfce7' : '#f1f5f9',
                  border: `1px solid ${isActive ? '#0d9488' : isCompleted ? '#86efac' : 'transparent'}`,
                  color: isActive ? '#ffffff' : isCompleted ? '#059669' : '#64748b',
                  fontSize: '12px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.15s ease',
                }}
              >
                <Icon size={14} />
                <span>{s.title}</span>
                {isCompleted && <Check size={12} strokeWidth={3} />}
              </button>
            );
          })}
        </div>

        {/* Modal Scrollable Body */}
        <div className="minimal-scroll" style={{ padding: '24px', overflowY: 'auto', flex: 1, minHeight: 0 }}>
          {/* ========================================================================= */}
          {/* STEP 1: SAFETY CHECKLIST & CERTIFIED SIGN-OFF                             */}
          {/* ========================================================================= */}
          {currentStep === 1 && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Step 1: Substation Safety Inspection & PPE Verification
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                  Textile 11kV/415V substations operate under intense electrical stress. Installation strictly interfaces with low-voltage secondary busbars (415V/230V). <strong>Zero disruption to mill spinning or weaving production.</strong>
                </p>
              </div>

              {/* Checklist Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
                {[
                  { key: 'gloves1000v', label: '1000V Insulating Safety Gloves (Class 0) inspected and tested for air leaks' },
                  { key: 'arcFlashVisor', label: '12 cal/cm² Arc Flash Face Shield and Fire-Retardant coveralls equipped' },
                  { key: 'lvBusbarOnly', label: 'Secondary LV (415V/230V) busbar location confirmed (No contact with 11kV primary)' },
                  { key: 'fusedDisconnectInstalled', label: 'IP20 touch-proof ceramic fuse carrier (2A / 500V) in place for voltage taps' },
                  { key: 'zeroShutdownVerified', label: 'Zero-Shutdown Verification: Production looms & dyeing vats remain live' },
                ].map((item) => {
                  const isChecked = safetyChecks[item.key as keyof typeof safetyChecks];
                  return (
                    <div
                      key={item.key}
                      onClick={() => toggleSafetyCheck(item.key as keyof typeof safetyChecks)}
                      style={{
                        background: isChecked ? '#f0fdf4' : '#ffffff',
                        border: `1px solid ${isChecked ? '#86efac' : '#e2e8f0'}`,
                        padding: '12px 16px',
                        borderRadius: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <div
                        style={{
                          width: '20px',
                          height: '20px',
                          borderRadius: '6px',
                          background: isChecked ? '#10b981' : '#ffffff',
                          border: `1px solid ${isChecked ? '#10b981' : '#cbd5e1'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                        }}
                      >
                        {isChecked && <Check size={14} strokeWidth={3} />}
                      </div>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{item.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Personnel Form */}
              <div
                style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                }}
              >
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                    PEC Certified Lead Field Engineer:
                  </label>
                  <input
                    type="text"
                    value={pecEngineer}
                    onChange={(e) => setPecEngineer(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '11px', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '6px' }}>
                    Mill Substation Supervisor Countersign:
                  </label>
                  <input
                    type="text"
                    value={millSupervisor}
                    onChange={(e) => setMillSupervisor(e.target.value)}
                    style={{
                      width: '100%',
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#0f172a',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 2: ROGOWSKI COILS & MODBUS RS-485 AUTO-DISCOVERY                     */}
          {/* ========================================================================= */}
          {currentStep === 2 && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Step 2: Non-Invasive Rogowski Clamp-On & Modbus RS-485 Daisy Chain
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                  Clip split-core Rogowski coils onto Phase L1, L2, L3 and Neutral busbars. Auto-scans Modbus baud rates to lock into existing Schneider PM5000 / Janitza digital power meters.
                </p>
              </div>

              {/* Graphic Representation of Busbars */}
              <div
                style={{
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '20px',
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: '12px',
                  textAlign: 'center',
                }}
              >
                {[
                  { phase: 'Phase A (Red)', color: '#dc2626', ct: 'Rogowski Coil A (0-1000A)' },
                  { phase: 'Phase B (Yellow)', color: '#ca8a04', ct: 'Rogowski Coil B (0-1000A)' },
                  { phase: 'Phase C (Blue)', color: '#2563eb', ct: 'Rogowski Coil C (0-1000A)' },
                  { phase: 'Neutral (Black)', color: '#64748b', ct: 'Neutral Clamp (Return)' },
                ].map((p, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#ffffff',
                      padding: '14px',
                      borderRadius: '10px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: p.color, margin: '0 auto 8px auto' }} />
                    <div style={{ fontWeight: 800, fontSize: '13px', color: p.color }}>{p.phase}</div>
                    <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>{p.ct}</div>
                    <div
                      style={{
                        marginTop: '8px',
                        fontSize: '10px',
                        background: '#dcfce7',
                        color: '#059669',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontWeight: 700,
                        display: 'inline-block',
                      }}
                    >
                      ✓ CLAMPED & ARMED
                    </div>
                  </div>
                ))}
              </div>

              {/* Modbus & 4G Network Strip */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                }}
              >
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>MODBUS RS-485 BUS STATUS</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#0d9488', marginTop: '4px' }}>
                    Auto-Locked at 9600 Baud (8-N-1)
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                    Discovered: <strong>Schneider Electric PM5110</strong> (Addr: 0x01) + <strong>WattBrain Core</strong> (Addr: 0x02)
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>DUAL-SIM 4G LTE TELEMETRY</div>
                  <div style={{ fontSize: '15px', fontWeight: 800, color: '#16a34a', marginTop: '4px' }}>
                    Zong 4G Primary (Signal: {primarySignalRssi} dBm)
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '6px' }}>
                    Backup: <strong>Jazz M2M LTE</strong> on hot-standby · AWS Bahrain latency: <strong>48ms</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 3: PHASE SEQUENCE & POLARITY VERIFICATION (PHASOR DIAGRAM)           */}
          {/* ========================================================================= */}
          {currentStep === 3 && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Step 3: Real-Time Phase Angle & Directionality Verification
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                  Detects and fixes reversed current transformer coils (which cause negative kW active power readings) via <strong>Software Polarity Inversion</strong> without physically unclamping busbars.
                </p>
              </div>

              {/* Phasor Diagram & Metrics Row */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(260px, 1fr) minmax(320px, 1.2fr)',
                  gap: '20px',
                  alignItems: 'center',
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '16px',
                }}
              >
                {/* SVG Phasor Diagram */}
                <div style={{ textAlign: 'center' }}>
                  <svg width="220" height="220" viewBox="0 0 220 220" style={{ margin: '0 auto' }}>
                    {/* Circle & Crosshairs */}
                    <circle cx="110" cy="110" r="95" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 4" />
                    <line x1="110" y1="15" x2="110" y2="205" stroke="#e2e8f0" strokeWidth="1" />
                    <line x1="15" y1="110" x2="205" y2="110" stroke="#e2e8f0" strokeWidth="1" />

                    {/* Vector Phase A (0 deg - pointing East/Right) */}
                    <line x1="110" y1="110" x2="195" y2="110" stroke="#dc2626" strokeWidth="3" />
                    <text x="200" y="114" fill="#dc2626" fontSize="11" fontWeight="bold">Va (0°)</text>

                    {/* Vector Phase B (120 deg or 300 deg depending on inversion) */}
                    <line
                      x1="110"
                      y1="110"
                      x2={phaseBInverted ? "65" : "155"}
                      y2={phaseBInverted ? "188" : "32"}
                      stroke="#ca8a04"
                      strokeWidth="3"
                    />
                    <text x={phaseBInverted ? "35" : "160"} y={phaseBInverted ? "200" : "28"} fill="#ca8a04" fontSize="11" fontWeight="bold">
                      {phaseBInverted ? 'Vb (120°)' : 'Vb (REV 300°)'}
                    </text>

                    {/* Vector Phase C (240 deg) */}
                    <line x1="110" y1="110" x2="65" y2="32" stroke="#2563eb" strokeWidth="3" />
                    <text x="35" y="28" fill="#2563eb" fontSize="11" fontWeight="bold">Vc (240°)</text>

                    {/* Center point */}
                    <circle cx="110" cy="110" r="4" fill="#0d9488" />
                  </svg>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '6px' }}>
                    120° Balanced 3-Phase Vector Diagram
                  </div>
                </div>

                {/* Live Voltage / Current Matrix */}
                <div>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: 700, marginBottom: '8px' }}>
                    LIVE MEASURED VALUES:
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #fecaca' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#dc2626' }}>Phase A</div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>234.2 V</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>412.5 A</div>
                    </div>

                    <div
                      style={{
                        background: phaseBInverted ? '#ffffff' : '#fff1f2',
                        padding: '10px',
                        borderRadius: '8px',
                        border: `1px solid ${phaseBInverted ? '#fef08a' : '#fecdd3'}`,
                      }}
                    >
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#ca8a04' }}>Phase B</div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>232.8 V</div>
                      <div style={{ fontSize: '11px', color: phaseBInverted ? '#64748b' : '#e11d48', fontWeight: 700 }}>
                        {phaseBInverted ? '408.2 A (+kW)' : '-408.2 A (-kW)'}
                      </div>
                    </div>

                    <div style={{ background: '#ffffff', padding: '10px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                      <div style={{ fontSize: '10px', fontWeight: 700, color: '#2563eb' }}>Phase C</div>
                      <div style={{ fontWeight: 800, fontSize: '14px', color: '#0f172a' }}>235.1 V</div>
                      <div style={{ fontSize: '11px', color: '#64748b' }}>415.0 A</div>
                    </div>
                  </div>

                  {/* Software Polarity Inversion Control */}
                  {!phaseBInverted ? (
                    <div
                      style={{
                        background: '#fff1f2',
                        border: '1px solid #fecdd3',
                        padding: '14px',
                        borderRadius: '10px',
                        marginBottom: '10px',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#e11d48', fontWeight: 700, fontSize: '12px' }}>
                        <AlertTriangle size={16} />
                        <span>REVERSED POLARITY DETECTED ON PHASE B!</span>
                      </div>
                      <p style={{ fontSize: '11px', color: '#475569', marginTop: '4px', lineHeight: 1.4 }}>
                        Rogowski coil clamped in reverse orientation, producing negative active power (-kW).
                      </p>
                      <button
                        onClick={handleInvertPhaseB}
                        style={{
                          marginTop: '8px',
                          background: '#e11d48',
                          color: '#ffffff',
                          border: 'none',
                          padding: '6px 12px',
                          borderRadius: '8px',
                          fontSize: '11px',
                          fontWeight: 700,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <RotateCw size={14} /> Invert Phase B in DSP Software
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        background: '#f0fdf4',
                        border: '1px solid #86efac',
                        padding: '12px 14px',
                        borderRadius: '10px',
                        color: '#166534',
                        fontWeight: 700,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <CheckCircle2 size={16} color="#16a34a" />
                      <span>Phase B Polarity Software Inverted. Active Power: 274.6 kW (+PF 0.94)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 4: 30-DAY BASELINE FREEZE AGREEMENT (IPMVP OPTION C)                 */}
          {/* ========================================================================= */}
          {currentStep === 4 && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Step 4: 30-Day Baseline Freeze Agreement (IPMVP Option C Protocol)
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                  Locks the pre-pilot specific energy consumption baseline to prevent gain-share disputes. Based on International Performance Measurement & Verification Protocol (IPMVP).
                </p>
              </div>

              {/* Baseline Document Card */}
              <div
                style={{
                  background: '#f8fafc',
                  padding: '20px',
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '20px',
                }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block' }}>
                      Industrial Facility:
                    </label>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0f172a', marginTop: '2px' }}>
                      Crescent Weaving & Dyeing Mills (Unit 4)
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block' }}>
                      FESCO Dedicated Feeder ID:
                    </label>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: '#0d9488', marginTop: '2px' }}>
                      FSD-KHW-11KV-04 (Khurrianwala)
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block' }}>
                      Starting Utility Active Energy Index (kWh):
                    </label>
                    <input
                      type="text"
                      value={baselineIndexKwh}
                      onChange={(e) => setBaselineIndexKwh(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        marginTop: '4px',
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '11px', fontWeight: 700, color: '#64748b', display: 'block' }}>
                      Agreed Specific Energy Baseline (kWh / meter):
                    </label>
                    <input
                      type="text"
                      value={specificEnergyKwhPerMeter}
                      onChange={(e) => setSpecificEnergyKwhPerMeter(e.target.value)}
                      style={{
                        width: '100%',
                        background: '#ffffff',
                        border: '1px solid #cbd5e1',
                        color: '#0f172a',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        marginTop: '4px',
                        fontFamily: 'var(--font-mono, monospace)',
                      }}
                    />
                  </div>
                </div>

                {/* Lock Signature */}
                <div
                  style={{
                    borderTop: '1px solid #e2e8f0',
                    paddingTop: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <span style={{ fontSize: '11px', color: '#64748b', fontWeight: 600 }}>Resident Director Counter-Signatory:</span>
                    <div style={{ fontWeight: 800, color: '#059669', fontSize: '13px' }}>{residentDirectorSign}</div>
                  </div>

                  {!baselineLocked ? (
                    <button
                      onClick={handleLockBaseline}
                      style={{
                        background: 'linear-gradient(135deg, #0d9488, #059669)',
                        color: '#ffffff',
                        border: 'none',
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 2px 8px rgba(13, 148, 136, 0.25)',
                      }}
                    >
                      <Lock size={14} /> Lock & Seal Baseline
                    </button>
                  ) : (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        background: '#dcfce7',
                        color: '#059669',
                        padding: '6px 12px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: 800,
                      }}
                    >
                      <CheckCircle2 size={16} /> BASELINE SEALED (SHA-256 LOCKED)
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* STEP 5: ONE-CLICK EXECUTIVE BOARDROOM AUDIT DECK GENERATOR                */}
          {/* ========================================================================= */}
          {currentStep === 5 && (
            <div>
              <div style={{ marginBottom: '16px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Step 5: Executive Boardroom Energy Audit & Contract Presentation
                </h3>
                <p style={{ fontSize: '13px', color: '#475569', marginTop: '4px' }}>
                  Auto-compiles the 30-day recorded shadow telemetry into a boardroom-ready presentation deck for the Mill Owner and Board of Directors.
                </p>
              </div>

              {/* Presentation Slide Highlights */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                  gap: '12px',
                  marginBottom: '20px',
                }}
              >
                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>SLIDE 1: TOTAL POWER WASTE</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
                    Rs. 1,840,000
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                    10.0% verified waste documented over 30 days
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>SLIDE 2: PEAK HOUR CURTAILMENT</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#0284c7', marginTop: '4px' }}>
                    3.5 Hours/Day
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                    Protected against Rs. 85/kWh peak penalties
                  </div>
                </div>

                <div style={{ background: '#ffffff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 700 }}>SLIDE 3: COMMERCIAL OFFER</div>
                  <div style={{ fontSize: '22px', fontWeight: 800, color: '#0d9488', marginTop: '4px' }}>
                    20% Gain-Share
                  </div>
                  <div style={{ fontSize: '12px', color: '#475569', marginTop: '4px' }}>
                    Mill keeps <strong>Rs. 1,472,000 net profit</strong> each month
                  </div>
                </div>
              </div>

              {/* Action Box */}
              <div
                style={{
                  background: 'linear-gradient(135deg, #f0fdf9 0%, #e6f7f2 100%)',
                  border: '1px solid #d1e7e3',
                  borderRadius: '14px',
                  padding: '24px',
                  textAlign: 'center',
                }}
              >
                <Award size={36} color="#0d9488" style={{ margin: '0 auto 8px auto' }} />
                <h4 style={{ fontSize: '16px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                  Boardroom Audit Deck Ready for C-Suite Handover
                </h4>
                <p style={{ fontSize: '12px', color: '#475569', maxWidth: '500px', margin: '6px auto 18px auto' }}>
                  Includes IPMVP Option C verification, raw CSV telemetry hashes, and Meezan Bank corporate payment challans.
                </p>

                <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
                  <button
                    onClick={handleGenerateReport}
                    style={{
                      background: 'linear-gradient(135deg, #0d9488, #059669)',
                      color: '#ffffff',
                      border: 'none',
                      padding: '10px 22px',
                      borderRadius: '10px',
                      fontWeight: 800,
                      fontSize: '13px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(13, 148, 136, 0.25)',
                    }}
                  >
                    <Download size={16} />
                    <span>Download Boardroom Audit Deck (PDF)</span>
                  </button>

                  <button
                    onClick={onClose}
                    style={{
                      background: '#ffffff',
                      color: '#334155',
                      border: '1px solid #cbd5e1',
                      padding: '10px 18px',
                      borderRadius: '10px',
                      fontWeight: 700,
                      fontSize: '13px',
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

        {/* Modal Bottom Footer Navigation */}
        <div
          style={{
            padding: '14px 24px',
            borderTop: '1px solid #eef3f2',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#fafcfc',
          }}
        >
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            style={{
              background: '#ffffff',
              border: '1px solid #cbd5e1',
              color: currentStep === 1 ? '#94a3b8' : '#334155',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 700,
              cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ArrowLeft size={14} /> Previous Step
          </button>

          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>
            Step {currentStep} of 5
          </span>

          <button
            onClick={handleNextStep}
            disabled={currentStep === 5}
            style={{
              background: currentStep === 5 ? '#cbd5e1' : 'linear-gradient(135deg, #0d9488, #059669)',
              border: 'none',
              color: '#ffffff',
              padding: '8px 18px',
              borderRadius: '8px',
              fontSize: '12px',
              fontWeight: 800,
              cursor: currentStep === 5 ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: currentStep === 5 ? 'none' : '0 2px 8px rgba(13, 148, 136, 0.25)',
            }}
          >
            Next Step <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};
