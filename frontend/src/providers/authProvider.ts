import type { AuthProvider } from '@refinedev/core';
import {
  getAccessToken,
  clearTokens,
  apiRequest,
  getGoogleAuthUrl,
} from '../services/api';
import type { User } from '../types';

export const authProvider: AuthProvider = {
  login: async () => {
    
    window.location.href = getGoogleAuthUrl();
    return {
      success: true,
    };
  },

  logout: async () => {
    try {
      await apiRequest('/auth/logout', { method: 'POST' });
    } catch {
      
    }
    
    clearTokens();
    return {
      success: true,
      redirectTo: '/login',
    };
  },

  check: async () => {
    const token = getAccessToken();
    
    if (!token) {
      return {
        authenticated: false,
        redirectTo: '/login',
      };
    }

    try {
      await apiRequest<User>('/users/me');
      return {
        authenticated: true,
      };
    } catch {
      clearTokens();
      return {
        authenticated: false,
        redirectTo: '/login',
      };
    }
  },

  getIdentity: async () => {
    const token = getAccessToken();
    
    if (!token) {
      return null;
    }

    try {
      const user = await apiRequest<User>('/users/me');
      return {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
      };
    } catch {
      return null;
    }
  },

  onError: async (error) => {
    if (error.statusCode === 401) {
      return {
        logout: true,
        redirectTo: '/login',
      };
    }

    return { error };
  },
};
