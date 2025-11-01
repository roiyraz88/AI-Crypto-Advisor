import axiosInstance from "./axios";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
  User,
} from "../types";


export const authApi = {
 
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/register",
      data
    );
    return response.data;
  },

 
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/login",
      data
    );
    return response.data;
  },

  /**
   * Logout user
   */
  logout: async (): Promise<void> => {
    await axiosInstance.post("/auth/logout");
  },

 
  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await axiosInstance.get<ApiResponse<{ user: User }>>(
      "/me"
    );
    return response.data;
  },

 
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>("/auth/refresh");
    return response.data;
  },
};

