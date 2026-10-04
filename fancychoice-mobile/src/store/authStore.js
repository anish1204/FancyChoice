import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authAPI } from '../services/api';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  loading: false,
  error: null,

  restore: async () => {
    try {
      const [token, user] = await Promise.all([
        AsyncStorage.getItem('token'),
        AsyncStorage.getItem('user'),
      ]);
      if (token) set({ token, user: user ? JSON.parse(user) : null });
    } catch (e) {
      // Storage blocked (e.g. Brave shields / private mode) — start logged out.
      console.warn('[auth] restore failed, starting logged out:', e?.message || e);
    }
  },

  sendOtp: async (phone) => {
    set({ loading: true, error: null });
    try {
      const data = await authAPI.sendOtp(phone);
      set({ loading: false });
      return data; // { devOtp } in dev bypass mode
    } catch (e) {
      set({ loading: false, error: e.response?.data?.message || e.message });
      throw e;
    }
  },

  verifyOtp: async (phone, otp) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await authAPI.verifyOtp(phone, otp);
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, token, loading: false });
    } catch (e) {
      set({ loading: false, error: e.response?.data?.message || e.message });
      throw e;
    }
  },

  signup: async (body) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await authAPI.signup(body);
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, token, loading: false });
    } catch (e) {
      set({ loading: false, error: e.response?.data?.message || e.message });
      throw e;
    }
  },

  loginPassword: async (identifier, password) => {
    set({ loading: true, error: null });
    try {
      const { user, token } = await authAPI.login(identifier, password);
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('user', JSON.stringify(user));
      set({ user, token, loading: false });
    } catch (e) {
      set({ loading: false, error: e.response?.data?.message || e.message });
      throw e;
    }
  },

  logout: async () => {
    await AsyncStorage.multiRemove(['token', 'user']);
    set({ user: null, token: null });
  },
}));
