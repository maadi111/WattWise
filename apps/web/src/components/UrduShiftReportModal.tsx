import React from 'react';
import { FileText, Download, Share2, CheckCircle2, Zap, Clock, ShieldCheck } from 'lucide-react';
import { Factory, SensorNode, LiveTelemetry } from '../types';

interface UrduShiftReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  factory: Factory;
  telemetry: LiveTelemetry;
  nodes: SensorNode[];
}

export const UrduShiftReportModal: React.FC<UrduShiftReportModalProps> = ({
  isOpen,
  onClose,
  factory,
  telemetry,
  nodes,
}) => {
  if (!isOpen) return null;

  const totalKw = nodes.reduce((acc, n) => acc + (n.isShed ? 0 : n.powerKw), 0);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="live-badge online" style={{ fontSize: '0.7rem' }}>تصدیق شدہ شفٹ رپورٹ</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>SHIFT #1 (07:00 - 19:00 PKT)</span>
            </div>
            <h2 className="urdu-text" style={{ fontSize: '1.45rem', fontWeight: 700, marginTop: '6px', color: '#fff' }}>
              روزانہ شفٹ انرجی اور بچت رپورٹ
            </h2>
          </div>
          <button
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ borderRadius: '50%', width: '32px', height: '32px', padding: 0 }}
          >
            ✕
          </button>
        </div>

        {/* Factory Details Box */}
        <div className="urdu-text" style={{ background: 'rgba(30, 41, 59, 0.6)', padding: '16px', borderRadius: '10px', border: '1px solid var(--border-subtle)', marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', color: '#fff', fontWeight: 600 }}>
            <span>کارخانہ: {factory.name}</span>
            <span>شہر: {factory.city} ({factory.disco})</span>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
            بجلی فیڈر: {factory.wapdaFeeder} • تاریخ: {new Date().toLocaleDateString('ur-PK')}
          </div>
        </div>

        {/* Core Shift Metrics in Urdu */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', marginBottom: '20px' }}>
          <div className="urdu-text" style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--emerald-neon)' }}>رواں شفٹ میں ڈیزل کی بچت:</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
              Rs. 184,000
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              سوئفٹ سوئچ کے بروقت فیصلے کی بدولت
            </div>
          </div>

          <div className="urdu-text" style={{ background: 'rgba(6, 182, 212, 0.1)', border: '1px solid rgba(6, 182, 212, 0.3)', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--cyan-neon)' }}>بغیر تعطل چلنے والی مشینیں:</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
              100% پروٹیکشن
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              رنگائی کے حوض اور لومز محفوظ رہے
            </div>
          </div>

          <div className="urdu-text" style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>موجودہ لوڈ (کلو واٹ):</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: '#fff', marginTop: '2px' }}>
              {totalKw.toFixed(1)} kW
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              پاور فیکٹر: 0.94 (بہترین کارکردگی)
            </div>
          </div>

          <div className="urdu-text" style={{ background: 'rgba(30, 41, 59, 0.4)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '14px' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>غیر ضروری لوڈ کی بندش:</span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.4rem', fontWeight: 800, color: 'var(--amber-neon)', marginTop: '2px' }}>
              -91.4 kW
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              ایڈمن اے سی اور سیکنڈری پمپس بند رہے
            </div>
          </div>
        </div>

        {/* Supervisor Summary Text */}
        <div className="urdu-text" style={{ background: '#080c16', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '16px', fontSize: '0.9rem', color: '#cbd5e1', lineHeight: 2, marginBottom: '20px' }}>
          <strong>شفٹ سپروائزر خلاصہ:</strong><br />
          واپڈا گرڈ پر 11:00 بجے لوڈ شیڈنگ کی پیشگی اطلاع 12 سیکنڈ قبل موصول ہو گئی تھی۔ سوئفٹ سوئچ نے جنریٹر کو پیشگی اسٹارٹ کر کے پاور ٹرانسفر مکمل کیا جس سے کسی بھی ایئر جیٹ لوم پر دھاگہ نہیں ٹوٹا اور نہ ہی رنگائی کا بیچ خراب ہوا۔ نان کریٹیکل ائیر کنڈیشنگ کو جنریٹر کے دورانیہ میں بند رکھا گیا جس سے 42 لیٹر ڈیزل کی بچت ہوئی۔
        </div>

        {/* Footer actions */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
            واٹ وائز کلاؤڈ سروسز • خودکار پی ڈی ایف تیار
          </span>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => {
                alert('شفٹ خلاصہ واٹس ایپ پر ارسال کر دیا گیا!');
                onClose();
              }}
              className="btn btn-outline btn-sm urdu-text"
              style={{ fontSize: '0.85rem' }}
            >
              <Share2 size={14} /> واٹس ایپ پر بھیجیں
            </button>
            <button onClick={onClose} className="btn btn-primary btn-sm urdu-text" style={{ fontSize: '0.85rem' }}>
              مکمل
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
