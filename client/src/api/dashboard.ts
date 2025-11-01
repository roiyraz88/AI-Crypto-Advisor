import axiosInstance from "./axios";
import type { ApiResponse, DashboardData, VoteRequest, VoteResponse } from "../types";

/**
 * Dashboard API endpoints
 */
export const dashboardApi = {
  /**
   * Get dashboard data
   */
  getDashboard: async (): Promise<ApiResponse<DashboardData>> => {
    const response = await axiosInstance.get<ApiResponse<DashboardData>>(
      "/dashboard"
    );
    return response.data;
  },

  /**
   * Save vote (thumbs up/down)
   */
  vote: async (data: VoteRequest): Promise<VoteResponse> => {
    const response = await axiosInstance.post<VoteResponse>("/vote", data);
    return response.data;
  },
};

