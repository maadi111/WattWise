import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from './api';

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
  login: (email: string, password?: string) => Promise<void>;
  logout: () => void;
  isBackendConnected: boolean;
}

const DEFAULT_USER: UserProfile = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'admin@wattwise.pk',
  fullName: 'Muhammad Hammad Latif (Lead Architect)',
  role: 'super_admin',
  factoryIds: ['fsd_mill_001', 'slk_surg_002', 'lhr_steel_003'],
  isSimulation: true,
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_USER,
  isAuthenticated: true,
  login: async () => {},
  logout: () => {},
  isBackendConnected: false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('ww_user_profile');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return DEFAULT_USER;
      }
    }
    return DEFAULT_USER;
  });
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  useEffect(() => {
    // Check if backend API is reachable
    fetch((import.meta.env.VITE_API_URL || 'http://localhost:8080/v1') + '/../healthz')
      .then((res) => {
        if (res.ok) setIsBackendConnected(true);
      })
      .catch(() => {
        setIsBackendConnected(false);
      });
  }, []);

  const login = async (email: string, password = 'WattWise2026!#') => {
    try {
      // Attempt genuine authentication against Go backend
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
        localStorage.setItem('ww_user_profile', JSON.stringify(profile));
        setIsBackendConnected(true);
        return;
      }
    } catch {
      console.info('[WattWise Auth] Backend API offline; proceeding in client simulation mode');
    }

    // Calibrated simulation fallback for offline demo
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
    } else if (email.includes('ops')) {
      profile = {
        id: '33333333-3333-3333-3333-333333333333',
        email,
        fullName: 'Engr. Rashid (Plant Manager)',
        role: 'factory_manager',
        factoryIds: ['fsd_mill_001'],
        isSimulation: true,
      };
    } else {
      profile = { ...DEFAULT_USER, isSimulation: true };
    }

    setUser(profile);
    localStorage.setItem('ww_user_profile', JSON.stringify(profile));
    apiClient.setToken('simulated_jwt_token_for_' + profile.role);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('ww_user_profile');
    apiClient.setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isBackendConnected }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
