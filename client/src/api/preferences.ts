import axiosInstance from "./axios";
import type {
  ApiResponse,
  Preferences,
  PreferencesRequest,
} from "../types";


export const preferencesApi = {
 
  getPreferences: async (): Promise<ApiResponse<{ preferences: Preferences }>> => {
    const response = await axiosInstance.get<
      ApiResponse<{ preferences: Preferences }>
    >("/preferences");
    return response.data;
  },


  savePreferences: async (
    data: PreferencesRequest
  ): Promise<ApiResponse<{ preferences: Preferences }>> => {
    const response = await axiosInstance.post<
      ApiResponse<{ preferences: Preferences }>
    >("/preferences", data);
    return response.data;
  },
};

