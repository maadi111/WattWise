import React from 'react';
import { Users2, Shield, UserCheck } from 'lucide-react';
import { useAuth } from '../lib/auth';

interface AccessControlViewProps {
  lang?: 'en' | 'ur';
}

export const AccessControlView: React.FC<AccessControlViewProps> = () => {
  const { user } = useAuth();

  const activeUsers = user
    ? [
        {
          name: user.fullName,
          email: user.email,
          role: user.role === 'super_admin' ? 'Super Administrator' : user.role === 'factory_owner' ? 'Factory Owner' : 'Operations Manager',
          facility: user.factoryIds.join(', ') || 'All Monitored Facilities',
          lastActive: 'Active Now',
          access: user.role === 'super_admin' ? 'Full System & Fleet Audit' : 'Tenant Operational Dashboard',
        },
      ]
    : [];

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
              <Shield size={11} /> RS256 PKI RBAC
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>
            Cryptographically enforced role-based permissions matrix across plant operations, finance, and engineering teams
          </div>
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
            Enterprise Roles Active
          </span>
        </div>
        <div className="ww-table-container">
          <table className="ww-table">
            <thead>
              <tr>
                <th>User / Identity</th>
                <th>Role</th>
                <th>Assigned Facility</th>
                <th>Session Status</th>
                <th>Permissions Boundary</th>
              </tr>
            </thead>
            <tbody>
              {activeUsers.map((u, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <UserCheck size={14} color="var(--emerald-neon)" />
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="ww-badge ww-badge-neutral">{u.role}</span>
                  </td>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.facility}</td>
                  <td>
                    <span className="ww-badge ww-badge-live">{u.lastActive}</span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{u.access}</td>
                </tr>
              ))}
              {activeUsers.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '24px', color: 'var(--text-tertiary)' }}>
                    No active authenticated session. Please sign in with your enterprise credentials.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
