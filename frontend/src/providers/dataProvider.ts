import type { DataProvider } from '@refinedev/core';
import { getAccessToken, refreshAccessToken, clearTokens } from '../services/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const customFetch = async <T>(url: string, options: RequestInit = {}): Promise<T> => {
  let accessToken = getAccessToken();

  const makeRequest = async (token: string | null): Promise<Response> => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };

    return fetch(`${API_URL}${url}`, {
      ...options,
      headers: { ...headers, ...options.headers },
    });
  };

  let response = await makeRequest(accessToken);

  if (response.status === 401 && accessToken) {
    const newTokens = await refreshAccessToken();
    
    if (newTokens) {
      response = await makeRequest(newTokens.accessToken);
    } else {
      clearTokens();
      window.location.href = '/login';
      throw new Error('Session expired');
    }
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Request failed' }));
    throw new Error(error.error || 'Request failed');
  }

  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};

export const dataProvider: DataProvider = {
  getList: async ({ resource }) => {
    const data = await customFetch<unknown[]>(`/${resource}`);
    return {
      data: data as any,
      total: data.length,
    };
  },

  getOne: async ({ resource, id }) => {
    const data = await customFetch(`/${resource}/${id}`);
    return { data: data as any };
  },

  create: async ({ resource, variables }) => {
    const data = await customFetch(`/${resource}`, {
      method: 'POST',
      body: JSON.stringify(variables),
    });
    return { data: data as any };
  },

  update: async ({ resource, id, variables }) => {
    const data = await customFetch(`/${resource}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(variables),
    });
    return { data: data as any };
  },

  deleteOne: async ({ resource, id }) => {
    await customFetch(`/${resource}/${id}`, {
      method: 'DELETE',
    });
    return { data: { id } as any };
  },

  getApiUrl: () => API_URL,

  custom: async ({ url, method = 'GET', payload }) => {
    const options: RequestInit = { method };
    if (payload) {
      options.body = JSON.stringify(payload);
    }
    const data = await customFetch(url, options);
    return { data: data as any };
  },

  getMany: async ({ resource, ids }) => {
    const promises = ids.map((id) => customFetch(`/${resource}/${id}`));
    const data = await Promise.all(promises);
    return { data: data as any };
  },

  createMany: async ({ resource, variables }) => {
    const promises = variables.map((vars) =>
      customFetch(`/${resource}`, {
        method: 'POST',
        body: JSON.stringify(vars),
      })
    );
    const data = await Promise.all(promises);
    return { data: data as any };
  },

  deleteMany: async ({ resource, ids }) => {
    await Promise.all(
      ids.map((id) =>
        customFetch(`/${resource}/${id}`, { method: 'DELETE' })
      )
    );
    return { data: ids.map((id) => ({ id })) as any };
  },

  updateMany: async ({ resource, ids, variables }) => {
    const promises = ids.map((id) =>
      customFetch(`/${resource}/${id}`, {
        method: 'PUT',
        body: JSON.stringify(variables),
      })
    );
    const data = await Promise.all(promises);
    return { data: data as any };
  },
};