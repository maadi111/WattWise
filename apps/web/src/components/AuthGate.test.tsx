import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const auth = vi.hoisted(() => ({ value: { isAuthenticated: false, loading: false } as Record<string, unknown> }));
const mock = vi.hoisted(() => ({ on: false }));

vi.mock('../lib/auth', () => ({ useAuth: () => auth.value }));
vi.mock('../lib/api', () => ({ isDevMockMode: () => mock.on }));
vi.mock('../pages/Login', () => ({ LoginModal: () => <div>SIGN IN FORM</div> }));

import { AuthGate } from './AuthGate';

const App = () => <div>SECRET DASHBOARD</div>;

describe('AuthGate', () => {
  beforeEach(() => {
    auth.value = { isAuthenticated: false, loading: false };
    mock.on = false;
  });

  it('shows the sign-in form, not the dashboard, to an anonymous visitor', () => {
    render(<AuthGate><App /></AuthGate>);
    expect(screen.getByText('SIGN IN FORM')).toBeInTheDocument();
    expect(screen.queryByText('SECRET DASHBOARD')).not.toBeInTheDocument();
  });

  it('never flashes the dashboard while the session is still being checked', () => {
    auth.value = { isAuthenticated: false, loading: true };
    render(<AuthGate><App /></AuthGate>);
    expect(screen.queryByText('SECRET DASHBOARD')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the dashboard once authenticated', () => {
    auth.value = { isAuthenticated: true, loading: false };
    render(<AuthGate><App /></AuthGate>);
    expect(screen.getByText('SECRET DASHBOARD')).toBeInTheDocument();
  });

  it('mock bypass needs an explicit VITE_USE_MOCKS flag (dev builds only)', () => {
    mock.on = true; // vitest runs with import.meta.env.DEV === true
    render(<AuthGate><App /></AuthGate>);
    expect(screen.getByText('SECRET DASHBOARD')).toBeInTheDocument();
  });
});
