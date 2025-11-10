import { create } from 'zustand';
import { api, clearTokens, setAccessToken } from '@/lib/api';

interface AuthState {
  user: null | { id: string; email: string; role: string };
  loading: boolean;
  initialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchMe: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  initialized: false,
  login: async (email: string, password: string) => {
    set({ loading: true });
    const { data } = await api.post('/auth/login', { email, password });
    setAccessToken(data.accessToken, data.refreshToken);
    await useAuthStore.getState().fetchMe();
    set({ loading: false });
  },
  logout: async () => {
    await api.post('/auth/logout');
    clearTokens();
    set({ user: null, initialized: true });
  },
  fetchMe: async () => {
    try {
      const { data } = await api.get('/auth/me');
      set({ user: data.data, initialized: true });
    } catch (error) {
      set({ user: null, initialized: true });
    }
  }
}));
