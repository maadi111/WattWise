import React from 'react';
import { DollarSign, TrendingUp, Users, Target, ShieldCheck, Award, Building, BarChart3, AlertCircle } from 'lucide-react';
import { translations } from '../data/translations';

interface ProductPitchOverviewProps {
  lang: 'en' | 'ur';
}

export const ProductPitchOverview: React.FC<ProductPitchOverviewProps> = ({ lang }) => {
  return (
    <div className="glass-panel">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 size={22} style={{ color: 'var(--emerald-neon)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {lang === 'ur' ? 'واٹ وائز ایگزیکٹو سمری اور بزنس ماڈل' : 'WattWise™ Executive Summary & Venture Pitch'}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            {lang === 'ur'
              ? 'پاکستان کے صنعتی شعبے کے لیے اے آئی پاورڈ لوڈ انٹیلی جنس اور 20 فیصد سیونگز شیئر ماڈل'
              : 'Addressing Pakistan’s Rs. 180–250B annual industrial load shedding waste via 20% Gain-Share SaaS'}
          </p>
        </div>

        <span className="live-badge online" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
          CONFIDENTIAL · INVESTOR DOCUMENTATION
        </span>
      </div>

      {/* The Crisis in Numbers (Page 2 of PDF) */}
      <div style={{ marginTop: '20px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          The Energy Crisis in Numbers (Pakistan 2024–2026)
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <div style={{ background: 'rgba(244, 63, 94, 0.1)', border: '1px solid rgba(244, 63, 94, 0.3)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--rose-neon)' }}>
              18–22 hrs
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>Average Daily Shedding</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>On industrial feeder lines in Punjab & Sindh</div>
          </div>

          <div style={{ background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--amber-neon)' }}>
              3.5x Cost
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>Diesel vs Grid Rate</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Diesel @ Rs. 94/kWh vs Grid @ Rs. 32/kWh</div>
          </div>

          <div style={{ background: 'rgba(99, 102, 241, 0.1)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: '#a5b4fc' }}>
              Rs. 2.8T
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>Annual Subsidy Bill</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Government reducing power subsidies rapidly</div>
          </div>

          <div style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '2rem', fontWeight: 800, color: 'var(--emerald-neon)' }}>
              0 Units
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#fff', marginTop: '2px' }}>Using AI Load Dispatch</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Massive uncontested blue-ocean market opportunity</div>
          </div>
        </div>
      </div>

      {/* The Core Thesis (Page 1 of PDF) */}
      <div style={{
        marginTop: '24px',
        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(6, 182, 212, 0.08))',
        border: '1px solid rgba(16, 185, 129, 0.4)',
        borderRadius: '12px',
        padding: '20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--emerald-neon)', fontWeight: 800, fontSize: '1rem' }}>
          ⚡ CORE THESIS & VALUE PROPOSITION
        </div>
        <p style={{ fontSize: '0.95rem', color: '#fff', marginTop: '8px', lineHeight: 1.6, fontStyle: 'italic' }}>
          "We don't sell energy. We sell the intelligence to use it better. Our sensor hardware is the wedge; our recurring SaaS revenue is the business. We take 20% of documented savings — zero upfront cost to the factory."
        </p>
      </div>

      {/* Pricing Models (Page 20 of PDF) */}
      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
          Three-Tier Go-To-Market Pricing Strategy
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          {/* Plan 1 */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>CUSTOMER ACQUISITION TIER</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>STARTER (GAIN-SHARE)</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--emerald-neon)', marginTop: '8px' }}>
              20%
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>of monthly verified savings — zero cap, zero upfront</div>
            <ul style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.9, paddingLeft: '16px' }}>
              <li>Up to 20 WattClamp™ sensor nodes</li>
              <li>1x WattBrain™ edge unit included free</li>
              <li>LoadShift™ daily predictions</li>
              <li>Basic SCADA web dashboard</li>
              <li>Monthly Savings Certificate PDF</li>
              <li>WhatsApp & SMS outage alerts</li>
            </ul>
          </div>

          {/* Plan 2 */}
          <div style={{ background: 'rgba(16, 185, 129, 0.08)', border: '1px solid var(--emerald-neon)', borderRadius: '12px', padding: '20px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '16px', background: 'var(--emerald-neon)', color: '#000', fontSize: '0.65rem', fontWeight: 800, padding: '2px 8px', borderRadius: '9999px' }}>
              RECOMMENDED ANNUAL
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--emerald-neon)', textTransform: 'uppercase' }}>ANNUAL SAAS CONTRACT</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>GROWTH (ANNUAL SAAS)</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: '#fff', marginTop: '8px' }}>
              Rs. 85,000 <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>/ month</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--emerald-neon)' }}>Billed annually (71% Gross Margin)</div>
            <ul style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-main)', lineHeight: 1.9, paddingLeft: '16px' }}>
              <li>Up to 64 sensor nodes (all MDB panels)</li>
              <li>2x WattBrain™ edge controllers</li>
              <li>SwiftSwitch™ 8-second ATS automation</li>
              <li>Full LoadShift™ MILP optimizer</li>
              <li>Interactive visual floor map</li>
              <li>EU GSP+ Carbon Emission Report</li>
              <li>Dedicated Faisalabad Field CSR</li>
            </ul>
          </div>

          {/* Plan 3 */}
          <div style={{ background: 'rgba(30, 41, 59, 0.5)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '20px' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-dim)', textTransform: 'uppercase' }}>CONGLOMERATES & EXPORTERS</span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>ENTERPRISE</div>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--cyan-neon)', marginTop: '8px' }}>
              Custom
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Negotiated per multi-mill enterprise</div>
            <ul style={{ marginTop: '16px', fontSize: '0.8rem', color: 'var(--text-muted)', lineHeight: 1.9, paddingLeft: '16px' }}>
              <li>Unlimited sensor nodes across all plants</li>
              <li>Multi-site centralized management</li>
              <li>Custom ML model weights per feeder</li>
              <li>ERP integration (SAP B1, NetSuite)</li>
              <li>99.9% uptime SLA</li>
              <li>Bank-grade savings audit underwriting</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Unit Economics & 36-Month Projections (Pages 20, 21 of PDF) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px', marginTop: '24px' }}>
        {/* Unit Economics */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '18px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
            Unit Economics (Growth Plan — Per Customer / Month)
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Monthly Subscription Revenue</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#fff' }}>+Rs. 85,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Hardware BOM Amortization (3yr)</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--rose-neon)' }}>-Rs. 12,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Cloud Infrastructure (AWS Bahrain)</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--rose-neon)' }}>-Rs. 4,500</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Field CSR Allocation (1 per 25 mills)</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--rose-neon)' }}>-Rs. 8,000</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '8px' }}>
              <span style={{ fontWeight: 800, color: 'var(--emerald-neon)' }}>GROSS MARGIN PER MILL</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: 'var(--emerald-neon)' }}>
                Rs. 60,500 (71.2%)
              </span>
            </div>
          </div>
        </div>

        {/* Financial Roadmap */}
        <div style={{ background: 'rgba(15, 23, 42, 0.6)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '18px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff', marginBottom: '12px' }}>
            36-Month Scale & Operating Breakeven
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Month 6 (Pilot)</span>
              <span style={{ color: '#fff' }}>5 mills • Rs. 600K MRR</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Month 12 (APTMA Scale)</span>
              <span style={{ color: '#fff' }}>20 mills • Rs. 1.7M MRR</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--emerald-neon)', fontWeight: 700 }}>Month 20 (Breakeven Point)</span>
              <span style={{ color: 'var(--emerald-neon)', fontWeight: 700 }}>120 mills • Cashflow Positive</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
              <span style={{ color: 'var(--text-muted)' }}>Month 24 (Series A Expansion)</span>
              <span style={{ color: '#fff' }}>200 mills • Rs. 204M ARR</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Month 36 (National Leader)</span>
              <span style={{ color: 'var(--cyan-neon)', fontWeight: 800 }}>850 mills • Rs. 867M ARR (45% EBITDA)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leadership Profile Note from Page 24 */}
      <div style={{ marginTop: '20px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <div style={{ color: 'var(--cyan-neon)', fontWeight: 700, marginBottom: '2px' }}>
          FOUNDING ENGINEERING LEADERSHIP (Page 24)
        </div>
        <div>
          CTO / Co-Founder Profile: Full-stack + IoT. Builds the WattBrain prototype and cloud platform. Comfortable in Python (ML), Go (backend), and embedded Linux. Background: CS/EE degree + 2+ years industry.
        </div>
      </div>
    </div>
  );
};
