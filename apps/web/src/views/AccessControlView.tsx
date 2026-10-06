import React from 'react';
import { Users2, Shield, Lock, CheckCircle2, UserCheck } from 'lucide-react';
import { CURRENT_FACILITY } from '../data/controlRoomData';

interface AccessControlViewProps {
  lang?: 'en' | 'ur';
}

export const AccessControlView: React.FC<AccessControlViewProps> = ({ lang = 'en' }) => {
  const users = [
    { name: 'Hammad Raza', email: 'hammad@crescent.com.pk', role: 'Energy Manager', facility: 'Unit 04 Faisalabad', lastActive: 'Active Now', access: 'Full Operational & ML Control' },
    { name: 'M. Tariq Crescent', email: 'tariq@crescent.com.pk', role: 'Mill Owner', facility: 'All 04 Facilities', lastActive: '2h ago', access: 'Financial Audit & Approvals' },
    { name: 'Khurram Shehzad', email: 'khurram@crescent.com.pk', role: 'Plant Manager', facility: 'Unit 04 Faisalabad', lastActive: '18m ago', access: 'Shift & LoadShift Control' },
    { name: 'Engr. Bilal Aslam', email: 'bilal.aslam@crescent.com.pk', role: 'Electrical Engineer', facility: 'Unit 04 Faisalabad', lastActive: '12m ago', access: 'Relay & Switchgear Armed' },
    { name: 'M. Akram', email: 'akram.shift@crescent.com.pk', role: 'Supervisor', facility: 'Unit 04 Weaving Shed', lastActive: '34m ago', access: 'Shift Reporting & WhatsApp' },
    { name: 'Suleman Butt', email: 'suleman@crescent.com.pk', role: 'Finance Director', facility: 'Crescent Corporate', lastActive: '1d ago', access: 'WAPDA Audit & Invoices' },
    { name: 'Ayesha Siddiqui', email: 'ayesha.esg@crescent.com.pk', role: 'ESG Manager', facility: 'All Facilities', lastActive: '3h ago', access: 'Carbon & CBAM Reporting' },
    { name: 'Ali Farooq', email: 'ali.f@wattwise.ai', role: 'WattWise Field Engineer', facility: 'Unit 04 Faisalabad', lastActive: '10m ago', access: 'Edge Firmware & Calibration' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)' }}>
              USERS, ACCESS CONTROL & INDUSTRIAL RBAC
            </h1>
            <span className="ww-badge ww-badge-live">
              <Shield size={11} /> HS256 JWT RBAC
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Strict role-based permissions matrix across plant operations, finance, and engineering teams
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button className="ww-btn ww-btn-primary">
            + Invite Plant User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="ww-card">
        <div className="ww-card-header">
          <span className="ww-card-title">
            <Users2 size={13} color="var(--industrial-blue-light)" />
            Active Factory User Sessions & Access Matrix
          </span>
          <span className="num-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            8 Enterprise Roles Defined
          </span>
        </div>
        <div className="ww-table-container">
          <table className="ww-table">
            <thead>
              <tr>
                <th>User / Identity</th>
                <th>Assigned Role</th>
                <th>Facility Scope</th>
                <th>Last Active</th>
                <th>Permissions & Security Scope</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                    <div className="num-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{u.email}</div>
                  </td>
                  <td>
                    <span className="ww-badge ww-badge-blue">{u.role}</span>
                  </td>
                  <td>{u.facility}</td>
                  <td className="num-mono" style={{ fontSize: 11 }}>{u.lastActive}</td>
                  <td style={{ fontSize: 11.5, color: 'var(--text-secondary)' }}>{u.access}</td>
                  <td>
                    <span className="ww-badge ww-badge-live">
                      <UserCheck size={10} /> ACTIVE
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
