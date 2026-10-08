import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient, isDevMockMode } from './api';

export type UserRole = 'super_admin' | 'factory_owner' | 'factory_manager' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  factoryIds: string[];
  isSimulation?: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isBackendConnected: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  isBackendConnected: false,
  loading: true,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // H12: Start unauthenticated by default; no automatic super_admin fallback
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if backend API is reachable and attempt silent refresh via HttpOnly cookie
    const initAuth = async () => {
      try {
        const healthRes = await fetch(
          (import.meta.env.VITE_API_URL || 'http://localhost:8080/v1') + '/../healthz'
        );
        if (healthRes.ok) {
          setIsBackendConnected(true);
        }

        // Silent session restore via refresh cookie
        const refreshRes = await apiClient.refresh();
        if (refreshRes && refreshRes.access_token) {
          apiClient.setToken(refreshRes.access_token);
          // Restore user profile from memory or API
          const saved = sessionStorage.getItem('ww_user_meta');
          if (saved) {
            setUser(JSON.parse(saved));
          }
        }
      } catch {
        // Not authenticated or refresh expired
        apiClient.setToken(null);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Genuine authentication against Go backend (RS256 + Argon2id)
      const res = await apiClient.login(email, password);
      if (res && res.access_token) {
        apiClient.setToken(res.access_token);
        const profile: UserProfile = {
          id: res.user.id,
          email: res.user.email,
          fullName: res.user.full_name,
          role: res.user.role as UserRole,
          factoryIds: res.user.factory_ids || ['fsd_mill_001'],
          isSimulation: false,
        };
        setUser(profile);
        sessionStorage.setItem('ww_user_meta', JSON.stringify(profile));
        setIsBackendConnected(true);
        return;
      }
    } catch (err: any) {
      // H12: In production or without explicit mock flag, propagate genuine 401 error
      if (!isDevMockMode() || !import.meta.env.DEV) {
        throw err;
      }

      console.info('[WattWise Auth] DEV mode with VITE_USE_MOCKS active; simulating local role');
      let profile: UserProfile;
      if (email.includes('owner')) {
        profile = {
          id: '22222222-2222-2222-2222-222222222222',
          email,
          fullName: 'Mian Tariq Crescent (Mill Owner)',
          role: 'factory_owner',
          factoryIds: ['fsd_mill_001'],
          isSimulation: true,
        };
      } else if (email.includes('ops') || email.includes('manager')) {
        profile = {
          id: '33333333-3333-3333-3333-333333333333',
          email,
          fullName: 'Engr. Rashid (Plant Manager)',
          role: 'factory_manager',
          factoryIds: ['fsd_mill_001'],
          isSimulation: true,
        };
      } else {
        profile = {
          id: '11111111-1111-1111-1111-111111111111',
          email,
          fullName: 'Muhammad Hammad Latif (Lead Architect)',
          role: 'super_admin',
          factoryIds: ['fsd_mill_001', 'slk_surg_002', 'lhr_steel_003'],
          isSimulation: true,
        };
      }

      setUser(profile);
      sessionStorage.setItem('ww_user_meta', JSON.stringify(profile));
      apiClient.setToken('simulated_jwt_token_for_' + profile.role);
    }
  };

  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('ww_user_meta');
    apiClient.setToken(null);
    apiClient.logout().catch(() => {});
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        isBackendConnected,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
