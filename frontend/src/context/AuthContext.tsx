import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { authApi } from '../api/endpoints';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasRole: (allowedRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('royal_knot_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('royal_knot_token');
      if (storedToken) {
        try {
          const profile = await authApi.getMe();
          setUser(profile);
        } catch {
          localStorage.removeItem('royal_knot_token');
          setUser(null);
          setToken(null);
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await authApi.login({ email, password });
    localStorage.setItem('royal_knot_token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('royal_knot_token');
    setUser(null);
    setToken(null);
    window.location.href = '/login';
  };

  const hasRole = (allowedRoles: UserRole[]): boolean => {
    if (!user) return false;
    if (user.role.name === 'Founder / Super Admin') return true;
    return allowedRoles.includes(user.role.name);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
