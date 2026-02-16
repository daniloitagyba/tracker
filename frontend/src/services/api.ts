import type { AuthTokens } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const TOKEN_KEY = 'tracker_access_token';
const REFRESH_TOKEN_KEY = 'tracker_refresh_token';

export const getAccessToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

export const getRefreshToken = (): string | null => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setTokens = (tokens: AuthTokens): void => {
  localStorage.setItem(TOKEN_KEY, tokens.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
};

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const refreshAccessToken = async (): Promise<AuthTokens | null> => {
  const refreshToken = getRefreshToken();
  
  if (!refreshToken) {
    return null;
  }

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) {
      clearTokens();
      return null;
    }

    const tokens: AuthTokens = await response.json();
    setTokens(tokens);
    return tokens;
  } catch {
    clearTokens();
    return null;
  }
};

export const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  let accessToken = getAccessToken();

  const makeRequest = async (token: string | null): Promise<Response> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    return fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });
  };

  let response = await makeRequest(accessToken);

  if (response.status === 401 && accessToken) {
    const newTokens = await refreshAccessToken();
    
    if (newTokens) {
      response = await makeRequest(newTokens.accessToken);
    } else {
      throw new Error('Session expired');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
};

export const getGoogleAuthUrl = (): string => {
  return `${API_URL}/auth/google`;
};
