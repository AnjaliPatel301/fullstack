import { create } from 'zustand';
import { courierAPI } from '../services/api';

const TOKEN_KEY = 'luxefit_courier_token';
const COURIER_KEY = 'luxefit_courier_user';

export const useCourierStore = create((set, get) => ({
  courier: null,
  courierToken: null,
  isCourierAuth: false,
  isLoading: false,

  initCourier: () => {
    const token = localStorage.getItem(TOKEN_KEY);
    const courierStr = localStorage.getItem(COURIER_KEY);
    if (token && courierStr) {
      try {
        const courier = JSON.parse(courierStr);
        set({ courierToken: token, courier, isCourierAuth: true });
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(COURIER_KEY);
      }
    }
  },

  courierLogin: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await courierAPI.login({ email, password });
      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(COURIER_KEY, JSON.stringify(data.courier));
      set({ courier: data.courier, courierToken: data.token, isCourierAuth: true });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    } finally {
      set({ isLoading: false });
    }
  },

  courierLogout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(COURIER_KEY);
    set({ courier: null, courierToken: null, isCourierAuth: false });
  },
}));
