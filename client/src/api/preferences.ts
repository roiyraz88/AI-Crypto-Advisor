import axiosInstance from "./axios";
import type {
  ApiResponse,
  Preferences,
  PreferencesRequest,
} from "../types";

/**
 * Preferences API endpoints
 */
export const preferencesApi = {
  /**
   * Get user preferences
   */
  getPreferences: async (): Promise<ApiResponse<{ preferences: Preferences }>> => {
    const response = await axiosInstance.get<
      ApiResponse<{ preferences: Preferences }>
    >("/preferences");
    return response.data;
  },

  /**
   * Save or update user preferences
   */
  savePreferences: async (
    data: PreferencesRequest
  ): Promise<ApiResponse<{ preferences: Preferences }>> => {
    const response = await axiosInstance.post<
      ApiResponse<{ preferences: Preferences }>
    >("/preferences", data);
    return response.data;
  },
};

