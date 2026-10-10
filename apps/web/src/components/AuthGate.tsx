import React from 'react';
import { useAuth } from '../lib/auth';
import { isDevMockMode } from '../lib/api';
import { LoginModal } from '../pages/Login';

/**
 * Renders the application only for an authenticated user. Everyone else sees the sign-in screen.
 * The one exception is an explicit development run with VITE_USE_MOCKS=true, which shows the mock UI
 * (no real data) for UI work and E2E tests; that bypass can never be active in a production build.
 */
export const AuthGate: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (import.meta.env.DEV && isDevMockMode()) return <>{children}</>;

  if (loading) {
    return (
      <div role="status" aria-live="polite" style={{ padding: 32 }}>
        Checking session...
      </div>
    );
  }
  if (!isAuthenticated) {
    // The modal cannot be dismissed: until login succeeds there is nothing else to show.
    return <LoginModal isOpen onClose={() => {}} />;
  }
  return <>{children}</>;
};
