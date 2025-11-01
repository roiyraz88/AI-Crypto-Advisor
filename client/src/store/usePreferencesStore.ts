import { create } from "zustand";
import type { Preferences, PreferencesRequest } from "../types";
import { preferencesApi } from "../api/preferences";

interface PreferencesState {
  preferences: Preferences | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  savePreferences: (data: PreferencesRequest) => Promise<void>;
  fetchPreferences: () => Promise<void>;
  clearError: () => void;
  clearPreferences: () => void;
  hasCompletedOnboarding: () => boolean;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  preferences: null,
  isLoading: false,
  error: null,

  savePreferences: async (data: PreferencesRequest) => {
    try {
      set({ isLoading: true, error: null });
      const response = await preferencesApi.savePreferences(data);

      if (response.success && response.data) {
        set({
          preferences: response.data.preferences,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save preferences. Please try again.";
      set({
        error: errorMessage,
        isLoading: false,
      });
      throw error;
    }
  },

  fetchPreferences: async () => {
    try {
      set({ isLoading: true, error: null });
      const response = await preferencesApi.getPreferences();

      if (response.success && response.data) {
        set({
          preferences: response.data.preferences,
          isLoading: false,
          error: null,
        });
      } else {
        // No preferences found (user hasn't completed onboarding)
        set({
          preferences: null,
          isLoading: false,
          error: null,
        });
      }
    } catch (error: unknown) {
      // 404 means no preferences exist (not an error, just means onboarding needed)
      if (
        error &&
        typeof error === "object" &&
        "response" in error &&
        (error as { response?: { status?: number } }).response?.status === 404
      ) {
        set({
          preferences: null,
          isLoading: false,
          error: null,
        });
      } else {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to fetch preferences";
        set({
          preferences: null,
          isLoading: false,
          error: errorMessage,
        });
      }
    }
  },

  hasCompletedOnboarding: () => {
    const { preferences } = get();
    return preferences !== null;
  },

  clearError: () => {
    set({ error: null });
  },

  /**
   * Clear preferences from store (used on logout)
   */
  clearPreferences: () => {
    set({ preferences: null, error: null });
  },
}));

