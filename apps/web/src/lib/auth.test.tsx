import { act, render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const api = vi.hoisted(() => ({
  login: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  setToken: vi.fn(),
  mock: false,
}));

vi.mock('./api', () => ({
  apiClient: api,
  isDevMockMode: () => api.mock,
}));

import { AuthProvider, useAuth } from './auth';

let ctx: ReturnType<typeof useAuth>;
const Probe = () => {
  ctx = useAuth();
  return <div>{ctx.loading ? 'loading' : ctx.isAuthenticated ? 'in' : 'out'}</div>;
};

async function mount() {
  render(<AuthProvider><Probe /></AuthProvider>);
  await waitFor(() => expect(screen.queryByText('loading')).not.toBeInTheDocument());
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    api.mock = false;
    api.refresh.mockRejectedValue(new Error('no session'));
    api.logout.mockResolvedValue({});
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true }));
  });

  it('starts unauthenticated for a visitor with no session', async () => {
    await mount();
    expect(screen.getByText('out')).toBeInTheDocument();
  });

  it('a rejected login (wrong password) does NOT create a session', async () => {
    api.login.mockRejectedValue(new Error('invalid email or password'));
    await mount();
    await expect(act(() => ctx.login('root@company.pk', 'wrong-password'))).rejects.toThrow('invalid email or password');
    expect(screen.getByText('out')).toBeInTheDocument();
    expect(api.setToken).not.toHaveBeenCalledWith(expect.stringContaining('simulated'));
    expect(sessionStorage.getItem('ww_user_meta')).toBeNull();
  });

  it('a 2xx reply without an access token is an error, not a login', async () => {
    api.login.mockResolvedValue({ user: { id: '1' } });
    await mount();
    await expect(act(() => ctx.login('a@b.pk', 'pw'))).rejects.toThrow(/access token/);
    expect(screen.getByText('out')).toBeInTheDocument();
  });

  it('a real login stores the profile and never invents factories', async () => {
    api.login.mockResolvedValue({
      access_token: 'jwt', user: { id: 'u1', email: 'a@b.pk', full_name: 'A', role: 'viewer' },
    });
    await mount();
    await act(() => ctx.login('a@b.pk', 'pw'));
    expect(screen.getByText('in')).toBeInTheDocument();
    expect(ctx.user?.factoryIds).toEqual([]);
    expect(ctx.user?.isSimulation).toBe(false);
    expect(api.setToken).toHaveBeenCalledWith('jwt');
  });

  it('even with mocks enabled, a production build never simulates a login', async () => {
    api.mock = true;
    api.login.mockRejectedValue(new Error('network'));
    await mount();
    // import.meta.env.DEV is true under vitest, so emulate a production build by stubbing it.
    vi.stubEnv('DEV', false);
    await expect(act(() => ctx.login('x@y.pk', 'pw'))).rejects.toThrow('network');
    expect(screen.getByText('out')).toBeInTheDocument();
    vi.unstubAllEnvs();
  });

  it('logout clears the session', async () => {
    api.login.mockResolvedValue({ access_token: 'jwt', user: { id: 'u', email: 'a@b.pk', full_name: 'A', role: 'viewer', factory_ids: ['f1'] } });
    await mount();
    await act(() => ctx.login('a@b.pk', 'pw'));
    act(() => ctx.logout());
    expect(screen.getByText('out')).toBeInTheDocument();
    expect(sessionStorage.getItem('ww_user_meta')).toBeNull();
  });
});
