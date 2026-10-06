import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Receipt,
  Download,
  Building,
  CheckCircle2,
  ExternalLink,
  Shield,
  CreditCard,
  Printer,
} from 'lucide-react';
import { CURRENT_FACILITY } from '../data/controlRoomData';

interface BillingViewProps {
  lang?: 'en' | 'ur';
}

export const BillingView: React.FC<BillingViewProps> = ({ lang = 'en' }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              ENTERPRISE BILLING & FBR TAX INVOICING
            </h1>
            <span className="ww-badge ww-badge-live">
              <Shield size={11} /> GAIN-SHARE CONTRACT
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Performance Fee Settlement · NTN: 9482012-4 · PRA Sales Tax on Services · {CURRENT_FACILITY.name}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="ww-btn ww-btn-primary">
            <Download size={14} /> Download FBR e-Invoice (XML/PDF)
          </button>
        </div>
      </div>

      {/* Plan & Payment State Strip */}
      <div className="ww-hero-strip">
        <div className="ww-hero-item">
          <span className="ww-hero-label">Current Model</span>
          <div className="ww-hero-value" style={{ color: 'var(--industrial-blue-light)' }}>
            GAIN-SHARE
          </div>
          <span style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>
            20% of Documented Savings
          </span>
        </div>

        <div className="ww-hero-item">
          <span className="ww-hero-label">September Verified Savings</span>
          <div className="ww-hero-value" style={{ color: 'var(--operational-green)' }}>
            Rs. 5,260,000
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--operational-green)' }}>
            IPMVP Option C Verified
          </span>
        </div>

        <div className="ww-hero-item ww-hero-dominant">
          <span className="ww-hero-label" style={{ color: 'var(--energy-amber)' }}>WattWise Performance Fee</span>
          <div className="ww-hero-value" style={{ color: 'var(--energy-amber)' }}>
            Rs. 1,052,000
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--energy-amber)' }}>
            + 16% PRA Tax: Rs. 168,320
          </span>
        </div>

        <div className="ww-hero-item">
          <span className="ww-hero-label">Payment Status</span>
          <div className="ww-hero-value" style={{ color: 'var(--operational-green)' }}>
            PAID
          </div>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-secondary)' }}>
            Meezan IBFT Confirmed
          </span>
        </div>
      </div>

      {/* Enterprise Invoice Details */}
      <div className="ww-card">
        <div className="ww-card-header">
          <span className="ww-card-title">
            <Receipt size={13} color="var(--operational-green)" />
            FBR Tax Invoice #WW-INV-2026-09-004
          </span>
          <span className="num-mono" style={{ fontSize: 10.5, color: 'var(--text-tertiary)' }}>
            Date of Issue: 01-OCT-2026
          </span>
        </div>
        <div className="ww-card-body" style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.4fr) minmax(280px, 1fr)', gap: 20 }}>
          {/* Invoice Breakdown */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, backgroundColor: 'var(--bg-surface-elevated)', padding: 12, borderRadius: 'var(--radius-xs)' }}>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Service Provider</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>WattWise Pakistan (Pvt.) Ltd.</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>NTN: 8492019-3 · PRA Reg: 36-09-8420-1</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Gulberg III, Lahore, Pakistan</div>
              </div>
              <div>
                <div style={{ fontSize: 10, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>Billed Client</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginTop: 2 }}>{CURRENT_FACILITY.name}</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>NTN: 0492817-2 · STRN: 04-01-9823-001</div>
                <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Khurrianwala Industrial Zone, Faisalabad</div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="ww-table-container">
              <table className="ww-table">
                <thead>
                  <tr>
                    <th>Service Description</th>
                    <th>Baseline</th>
                    <th>Actual</th>
                    <th>Net Savings</th>
                    <th>Rate</th>
                    <th>Amount (PKR)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 600 }}>Energy Optimization Performance Share (September 2026)</td>
                    <td className="num-mono">Rs. 18.20M</td>
                    <td className="num-mono">Rs. 12.94M</td>
                    <td className="num-mono" style={{ color: 'var(--operational-green)' }}>Rs. 5.26M</td>
                    <td className="num-mono">20%</td>
                    <td className="num-mono" style={{ fontWeight: 700 }}>Rs. 1,052,000</td>
                  </tr>
                  <tr>
                    <td style={{ color: 'var(--text-secondary)' }}>Punjab Revenue Authority (PRA) Provincial Sales Tax on Services</td>
                    <td colSpan={4} style={{ color: 'var(--text-tertiary)' }}>Punjab Sales Tax Act 2012 Tariff Heading 98.12</td>
                    <td className="num-mono">Rs. 168,320</td>
                  </tr>
                  <tr style={{ backgroundColor: 'var(--bg-surface-elevated)', fontWeight: 800 }}>
                    <td colSpan={5}>TOTAL INVOICED PAYABLE</td>
                    <td className="num-mono" style={{ color: 'var(--energy-amber)', fontSize: 14 }}>
                      Rs. 1,220,320
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Payment & Banking Instructions */}
          <div style={{ backgroundColor: 'var(--bg-surface-elevated)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xs)', padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: 6 }}>
              <CreditCard size={14} color="var(--operational-green)" />
              Meezan Bank Corporate Settlement
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 11.5 }}>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Bank Name: </span>
                <b style={{ color: 'var(--text-primary)' }}>Meezan Bank Limited (Islamic Banking)</b>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Account Title: </span>
                <b style={{ color: 'var(--text-primary)' }}>WattWise Pakistan (Pvt.) Limited</b>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>IBAN: </span>
                <b className="num-mono" style={{ color: 'var(--industrial-blue-light)' }}>PK42 MEZN 0001 0293 8472 0192</b>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>Swift Code: </span>
                <b className="num-mono" style={{ color: 'var(--text-primary)' }}>MEZNPKKA</b>
              </div>
              <div>
                <span style={{ color: 'var(--text-tertiary)' }}>FBR e-Filing Verification: </span>
                <span className="ww-badge ww-badge-live" style={{ fontSize: 9 }}>IRIS VERIFIED</span>
              </div>
            </div>

            <div style={{ marginTop: 'auto', padding: 8, backgroundColor: 'rgba(39, 132, 90, 0.1)', border: '1px solid rgba(39, 132, 90, 0.3)', borderRadius: 'var(--radius-xs)', fontSize: 10.5, color: 'var(--operational-green)' }}>
              Payment received on 03-Oct-2026 via RTGS transaction #RTGS-MEZN-849201. Verified.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
