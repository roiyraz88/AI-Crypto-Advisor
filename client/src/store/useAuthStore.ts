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

  // Actions
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

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.login({ email, password });

      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        // Fetch user preferences after successful login
        try {
          await usePreferencesStore.getState().fetchPreferences();
        } catch (prefError) {
          // Preferences not found is OK (means onboarding needed)
          console.log("Preferences not found, onboarding required");
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to login. Please check your credentials.";
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  register: async (email: string, password: string, name: string) => {
    try {
      set({ isLoading: true, error: null });
      const response = await authApi.register({ email, password, name });

      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        // New users won't have preferences yet, but try to fetch anyway
        try {
          await usePreferencesStore.getState().fetchPreferences();
        } catch (prefError) {
          // Preferences not found is OK for new users
          console.log("Preferences not found for new user");
        }
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to register. Please try again.";
      set({
        error: errorMessage,
        isLoading: false,
        isAuthenticated: false,
        user: null,
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      Cookies.remove("token");
      Cookies.remove("refreshToken");
      set({
        user: null,
        isAuthenticated: false,
        error: null,
      });
      // Clear preferences from store on logout
      usePreferencesStore.getState().clearPreferences();
    }
  },

  fetchUser: async () => {
    try {
      set({ isLoading: true });
      const response = await authApi.getMe();

      if (response.success && response.data) {
        set({
          user: response.data.user,
          isAuthenticated: true,
          isLoading: false,
          error: null,
        });
        // Fetch user preferences after successful authentication
        try {
          await usePreferencesStore.getState().fetchPreferences();
        } catch (prefError) {
          // Preferences not found is OK (means onboarding needed)
          console.log("Preferences not found, onboarding required");
        }
      } else {
        set({
          isAuthenticated: false,
          user: null,
          isLoading: false,
        });
      }
    } catch (error) {
      set({
        isAuthenticated: false,
        user: null,
        isLoading: false,
      });
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));

