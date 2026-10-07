import React, { useState } from 'react';
import { Lock, Mail, ShieldCheck, AlertCircle, LogOut } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { isDevMockMode } from '../lib/api';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose }) => {
  const { user, login, logout, isBackendConnected } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail: string) => {
    setEmail(userEmail);
    setPassword('WattWise2026!#');
    setError(null);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} style={{ color: 'var(--emerald-neon)' }} />
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#fff' }}>
              Industrial Authentication (RS256 / Argon2id)
            </h3>
          </div>
          <button onClick={onClose} className="btn btn-outline btn-sm" style={{ borderRadius: '50%', width: '30px', height: '30px', padding: 0 }}>
            ✕
          </button>
        </div>

        {user && (
          <div style={{
            background: 'rgba(39, 132, 90, 0.1)',
            border: '1px solid var(--emerald-neon)',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--emerald-neon)', fontWeight: 600 }}>CURRENTLY AUTHENTICATED</div>
              <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>{user.fullName}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Role: <span style={{ color: '#fff', fontWeight: 600 }}>{user.role}</span> · Tenant: <span style={{ color: '#fff' }}>{user.factoryIds.join(', ')}</span></div>
            </div>
            <button
              onClick={() => logout()}
              className="btn btn-outline btn-sm"
              style={{ color: '#f87171', borderColor: 'rgba(248, 113, 113, 0.4)', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <LogOut size={13} /> Sign Out
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid #ef4444',
              borderRadius: '6px',
              padding: '10px 12px',
              color: '#fca5a5',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.5px' }}>
              WORK EMAIL
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', letterSpacing: '0.5px' }}>
              PASSWORD (ARGON2ID HASHED)
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 12px 10px 36px',
                  background: 'rgba(15, 23, 42, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '6px',
                  color: '#fff',
                  fontSize: '0.85rem'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ marginTop: '8px', width: '100%', padding: '12px', fontWeight: 700 }}
          >
            {loading ? 'Authenticating...' : 'Sign In with RS256 Credential'}
          </button>
        </form>

        {isDevMockMode() && (
          <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: 600 }}>
              DEVELOPMENT MOCK PROFILES (DEV ONLY):
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              <button
                type="button"
                onClick={() => fillCredentials('admin@wattwise.pk')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
              >
                👑 Super Admin (All Plants)
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('owner@crescentmills.com.pk')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
              >
                🏭 Mill Owner (Crescent)
              </button>
              <button
                type="button"
                onClick={() => fillCredentials('ops@crescentmills.com.pk')}
                className="btn btn-outline btn-sm"
                style={{ fontSize: '0.75rem', padding: '6px 10px' }}
              >
                ⚙️ Plant Manager (FSD Unit 4)
              </button>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '16px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <ShieldCheck size={14} style={{ color: isBackendConnected ? 'var(--emerald-neon)' : '#eab308' }} />
          <span>
            {isBackendConnected
              ? 'Connected to live Go API backend (Argon2id + RS256 PKI active)'
              : 'Standalone dev mode: Authenticates via local RS256 auth store'}
          </span>
        </div>
      </div>
    </div>
  );
};
