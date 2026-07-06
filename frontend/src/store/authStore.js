import { create } from 'zustand';
import { authAPI } from '../services/api';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  initAuth: () => {
    const token = localStorage.getItem('luxefit_token');
    const userStr = localStorage.getItem('luxefit_user');
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ token, user, isAuthenticated: true });
      } catch { localStorage.clear(); }
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const data = await authAPI.login(credentials);
      localStorage.setItem('luxefit_token', data.token);
      localStorage.setItem('luxefit_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: error.message };
    }
  },

  register: async (userData) => {
    set({ isLoading: true });
    try {
      const data = await authAPI.register(userData);
      localStorage.setItem('luxefit_token', data.token);
      localStorage.setItem('luxefit_user', JSON.stringify(data.user));
      set({ user: data.user, token: data.token, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      return { success: false, message: error.message };
    }
  },

  logout: () => {
    localStorage.removeItem('luxefit_token');
    localStorage.removeItem('luxefit_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  updateUser: (userData) => {
    const updated = { ...get().user, ...userData };
    localStorage.setItem('luxefit_user', JSON.stringify(updated));
    set({ user: updated });
  },
}));
