import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from './api';

export type UserRole = 'super_admin' | 'factory_owner' | 'factory_manager' | 'viewer';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  factoryIds: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  login: (email: string, role?: UserRole) => void;
  logout: () => void;
}

const DEFAULT_USER: UserProfile = {
  id: '11111111-1111-1111-1111-111111111111',
  email: 'admin@wattwise.pk',
  fullName: 'Hammad (CTO & Lead Architect)',
  role: 'super_admin',
  factoryIds: ['fsd_mill_001', 'slk_surg_002', 'lhr_steel_003'],
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_USER,
  isAuthenticated: true,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(DEFAULT_USER);

  const login = (email: string, role: UserRole = 'super_admin') => {
    let profile: UserProfile;
    if (email.includes('owner')) {
      profile = {
        id: '22222222-2222-2222-2222-222222222222',
        email,
        fullName: 'Mian Tariq (Mill Owner)',
        role: 'factory_owner',
        factoryIds: ['fsd_mill_001'],
      };
    } else if (email.includes('ops')) {
      profile = {
        id: '33333333-3333-3333-3333-333333333333',
        email,
        fullName: 'Engr. Rashid (Plant Manager)',
        role: 'factory_manager',
        factoryIds: ['fsd_mill_001'],
      };
    } else {
      profile = DEFAULT_USER;
    }
    setUser(profile);
    apiClient.setToken('sample_signed_jwt_token_for_' + profile.role);
  };

  const logout = () => {
    setUser(null);
    apiClient.setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
