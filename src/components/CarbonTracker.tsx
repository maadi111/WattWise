import React from 'react';
import { Leaf, Award, Globe, TrendingDown, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Factory } from '../types';

interface CarbonTrackerProps {
  factory: Factory;
  lang: 'en' | 'ur';
}

export const CarbonTracker: React.FC<CarbonTrackerProps> = ({ factory, lang }) => {
  const dieselLitresSaved = 14250; // Litres saved this month
  const co2AvoidedKg = 38400; // 38.4 Tons avoided
  const treesEquivalent = 1745;
  const complianceScore = 98.4;

  return (
    <div className="glass-panel">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Leaf size={22} style={{ color: 'var(--emerald-neon)' }} />
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
              {lang === 'ur' ? 'جی ایس پی پلس کاربن اخراج رپورٹ اور یورپی ایکسپورٹ سرٹیفکیٹ' : 'EU GSP+ Carbon Emission & ESG Sustainability Tracker'}
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
            {lang === 'ur'
              ? 'ڈیزل جنریٹر کا غیر ضروری استعمال کم کر کے کاربن ڈائی آکسائیڈ میں کمی اور یورپی خریداروں کے لیے سرٹیفکیٹ'
              : 'Verifiable Scope 1 & 2 carbon reduction data for European & US buyer sustainability audits (GSP+)'}
          </p>
        </div>

        <span className="live-badge online" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>
          <CheckCircle2 size={15} /> GSP+ COMPLIANT CERTIFIED
        </span>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '20px' }}>
        <div style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '10px', padding: '18px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--emerald-neon)', fontWeight: 700, textTransform: 'uppercase' }}>
            Monthly CO₂ Avoided
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            {(co2AvoidedKg / 1000).toFixed(1)} <span style={{ fontSize: '0.85rem', color: 'var(--emerald-neon)' }}>Metric Tons</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Through generator runtime optimization
          </div>
        </div>

        <div style={{ background: 'rgba(6, 182, 212, 0.12)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '10px', padding: '18px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--cyan-neon)', fontWeight: 700, textTransform: 'uppercase' }}>
            Diesel Fuel Conserved
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            {dieselLitresSaved.toLocaleString('en-PK')} <span style={{ fontSize: '0.85rem', color: 'var(--cyan-neon)' }}>Litres</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Direct Scope 1 combustion reduction
          </div>
        </div>

        <div style={{ background: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.3)', borderRadius: '10px', padding: '18px' }}>
          <div style={{ fontSize: '0.7rem', color: '#a5b4fc', fontWeight: 700, textTransform: 'uppercase' }}>
            Forest Sequestration Equivalent
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            {treesEquivalent.toLocaleString('en-PK')} <span style={{ fontSize: '0.85rem', color: '#a5b4fc' }}>Trees / Yr</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Equates to 18.2 hectares of urban forest
          </div>
        </div>

        <div style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '10px', padding: '18px' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--amber-neon)', fontWeight: 700, textTransform: 'uppercase' }}>
            ESG Buyer Audit Score
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginTop: '4px' }}>
            {complianceScore}% <span style={{ fontSize: '0.85rem', color: 'var(--amber-neon)' }}>Grade A+</span>
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            Inditex & H&M Sustainable Supplier Tier 1
          </div>
        </div>
      </div>

      {/* Rationale and Comparison */}
      <div style={{ marginTop: '24px', background: 'rgba(30, 41, 59, 0.4)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '18px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#fff', marginBottom: '8px' }}>
          Carbon Intensity Comparison: High-Speed Diesel vs Optimized Grid
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
          In Pakistan, captive industrial diesel generation emits approximately <strong style={{ color: 'var(--rose-neon)' }}>0.78 kg CO₂ per kWh</strong>. By contrast, the national grid (with Tarbela, Mangla, and solar energy mixes) averages <strong style={{ color: 'var(--emerald-neon)' }}>0.41 kg CO₂ per kWh</strong>. By shifting 142 hours of avoidable generator runtime to grid windows and shedding idle loads, {factory.name} permanently cut monthly emissions by 38.4 Tons.
        </p>
      </div>
    </div>
  );
};
