import axiosInstance from "./axios";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
  User,
} from "../types";

/**
 * Auth API endpoints
 */
export const authApi = {
  /**
   * Register new user
   */
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>(
      "/auth/register",
      data
    );
    return response.data;
  },

  /**
   * Login user
   */
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

  /**
   * Get current user info
   */
  getMe: async (): Promise<ApiResponse<{ user: User }>> => {
    const response = await axiosInstance.get<ApiResponse<{ user: User }>>(
      "/me"
    );
    return response.data;
  },

  /**
   * Refresh access token using refresh token
   * This is called automatically when access token expires
   */
  refreshToken: async (): Promise<AuthResponse> => {
    const response = await axiosInstance.post<AuthResponse>("/auth/refresh");
    return response.data;
  },
};

