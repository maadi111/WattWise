import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, UserCheck, Building } from 'lucide-react';
import { useAuth, UserRole } from '../lib/auth';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { user, login, logout } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>(user?.role || 'super_admin');

  if (!isOpen) return null;

  const handleRoleSelect = async (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'super_admin') {
      await login('admin@wattwise.pk');
    } else if (role === 'factory_owner') {
      await login('owner@crescentmills.com.pk');
    } else if (role === 'factory_manager') {
      await login('ops@crescentmills.com.pk');
    } else {
      await login('auditor@meezanbank.com.pk');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} style={{ color: 'var(--emerald-neon)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
              Multi-Tenant Authentication & RBAC
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-outline btn-sm" style={{ borderRadius: '50%', width: '30px', height: '30px', padding: 0 }}>
            ✕
          </button>
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Select an identity to test multi-tenant data isolation and role-based permissions (Sprint 1):
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* Role 1: Super Admin */}
          <div
            onClick={() => handleRoleSelect('super_admin')}
            style={{
              background: user?.role === 'super_admin' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(30, 41, 59, 0.4)',
              border: user?.role === 'super_admin' ? '1px solid var(--emerald-neon)' : '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '12px 16px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Hammad (CTO / Super Admin)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>admin@wattwise.pk • Access to all 3 factories & billing</div>
            </div>
            {user?.role === 'super_admin' && <ShieldCheck size={18} style={{ color: 'var(--emerald-neon)' }} />}
          </div>

          {/* Role 2: Factory Owner */}
          <div
            onClick={() => handleRoleSelect('factory_owner')}
            style={{
              background: user?.role === 'factory_owner' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(30, 41, 59, 0.4)',
              border: user?.role === 'factory_owner' ? '1px solid var(--cyan-neon)' : '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '12px 16px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Mian Tariq (Mill Owner / CEO)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>owner@crescentmills.com.pk • Crescent Unit 4 only</div>
            </div>
            {user?.role === 'factory_owner' && <UserCheck size={18} style={{ color: 'var(--cyan-neon)' }} />}
          </div>

          {/* Role 3: Plant Operations Manager */}
          <div
            onClick={() => handleRoleSelect('factory_manager')}
            style={{
              background: user?.role === 'factory_manager' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(30, 41, 59, 0.4)',
              border: user?.role === 'factory_manager' ? '1px solid var(--amber-neon)' : '1px solid var(--border-subtle)',
              borderRadius: '8px',
              padding: '12px 16px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>Engr. Rashid (Plant Manager)</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>ops@crescentmills.com.pk • Automation controls & shift reports</div>
            </div>
            {user?.role === 'factory_manager' && <Building size={18} style={{ color: 'var(--amber-neon)' }} />}
          </div>
        </div>

        <div style={{ marginTop: '20px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-primary btn-sm">
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
