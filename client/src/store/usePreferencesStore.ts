// store/usePreferencesStore.ts
import axiosInstance from "../api/axios";

export const usePreferencesStore = create((set) => ({
  preferences: null,
  isLoading: false,
  error: null,

  fetchPreferences: async () => {
    try {
      set({ isLoading: true, error: null });
      const res = await axiosInstance.get("/preferences/me"); // ✅ שולח קוקיז
      set({ preferences: res.data.data, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      throw error;
    }
  },

  savePreferences: async (prefs) => {
    try {
      set({ isLoading: true, error: null });
      const res = await axiosInstance.post("/preferences", prefs); // ✅ שולח קוקיז
      set({ preferences: res.data.data, isLoading: false });
    } catch (error) {
      set({ error: getErrorMessage(error), isLoading: false });
      throw error;
    }
  },
}));
