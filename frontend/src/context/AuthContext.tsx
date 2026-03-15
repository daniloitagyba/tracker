import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  getAccessToken,
  clearTokens,
  apiRequest,
  getGoogleAuthUrl,
} from '../services/api';
import type { User } from '../types';

interface Identity {
  id: string;
  name: string;
  avatar?: string;
}

interface AuthContextValue {
  identity: Identity | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [identity, setIdentity] = useState<Identity | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    const token = getAccessToken();
    if (!token) {
      setIdentity(null);
      setIsLoading(false);
      return;
    }

    try {
      const user = await apiRequest<User>('/users/me');
      setIdentity({ id: user.id, name: user.name, avatar: user.avatar });
    } catch {
      clearTokens();
      setIdentity(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = () => {
    window.location.href = getGoogleAuthUrl();
  };

  const logout = async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    clearTokens();
    setIdentity(null);
  };

  return (
    <AuthContext.Provider
      value={{
        identity,
        isAuthenticated: !!identity,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
