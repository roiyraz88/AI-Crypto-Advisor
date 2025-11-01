// store/usePreferencesStore.ts
import { create } from "zustand";
import { getErrorMessage } from "../utils/errorHandler";
import type { Preferences, PreferencesRequest } from "../types";
import { preferencesApi } from "../api/preferences";

interface PreferencesState {
  preferences: Preferences | null;
  isLoading: boolean;
  error: string | null;

  fetchPreferences: () => Promise<void>;
  savePreferences: (prefs: PreferencesRequest) => Promise<void>;
  clearPreferences: () => void;
  hasCompletedOnboarding: () => boolean;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
  preferences: null,
  isLoading: false,
  error: null,

  fetchPreferences: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await preferencesApi.getPreferences();
      if (res.success && res.data) {
        set({ preferences: res.data.preferences, isLoading: false });
      } else {
        set({ preferences: null, isLoading: false });
      }
    } catch (error) {
    
      set({
        error: getErrorMessage(error),
        isLoading: false,
        preferences: null,
      });
    }
  },

  savePreferences: async (prefs: PreferencesRequest) => {
    try {
      set({ isLoading: true, error: null });
      const res = await preferencesApi.savePreferences(prefs);
      if (res.success && res.data) {
        set({ preferences: res.data.preferences, isLoading: false });
      } else {
        set({ error: "Failed to save preferences", isLoading: false });
      }
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      throw error;
    }
  },
  clearPreferences: () =>
    set({ preferences: null, isLoading: false, error: null }),
  hasCompletedOnboarding: () => {
    const p = get().preferences;
    if (!p) return false;
    const hasExperience = Boolean(p.experienceLevel);
    const hasRisk = Boolean(p.riskTolerance);
    const hasFavorites =
      Array.isArray(p.favoriteCryptos) && p.favoriteCryptos.length > 0;
    return hasExperience && hasRisk && hasFavorites;
  },
}));
