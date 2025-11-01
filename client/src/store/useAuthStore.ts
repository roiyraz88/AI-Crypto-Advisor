import { create } from "zustand";
import type { User } from "../types";
import { authApi } from "../api/auth";
import Cookies from "js-cookie";
import { usePreferencesStore } from "./usePreferencesStore";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  fetchUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    try {
      set({ isLoading: true, error: null });
      const res = await authApi.login({ email, password });
      if (res.success && res.data) {
        set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        await usePreferencesStore.getState().fetchPreferences().catch(() => {});
      }
    } catch (e: any) {
      set({
        error: e?.message ?? "Failed to login. Please check your credentials.",
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw e;
    }
  },

  register: async (email, password, name) => {
    try {
      set({ isLoading: true, error: null });
      const res = await authApi.register({ email, password, name });
      if (res.success && res.data) {
        set({ user: res.data.user, isAuthenticated: true, isLoading: false });
        await usePreferencesStore.getState().fetchPreferences().catch(() => {});
      }
    } catch (e: any) {
      set({
        error: e?.message ?? "Failed to register. Please try again.",
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw e;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch {}
    Cookies.remove("token");
    Cookies.remove("refreshToken");
    set({ user: null, isAuthenticated: false, error: null });
    usePreferencesStore.getState().clearPreferences();
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const res = await authApi.getMe(); 
      if (res.success && res.data) {
        set({ user: res.data.user, isAuthenticated: true, isLoading: false, error: null });
        await usePreferencesStore.getState().fetchPreferences().catch(() => {});
      } else {
        set({ isAuthenticated: false, user: null, isLoading: false });
      }
    } catch {
      set({ isAuthenticated: false, user: null, isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
