import axiosInstance from "./axios";
import type { ApiResponse, DashboardData, VoteRequest, VoteResponse } from "../types";


export const dashboardApi = {
 
  getDashboard: async (): Promise<ApiResponse<DashboardData>> => {
    const response = await axiosInstance.get<ApiResponse<DashboardData>>(
      "/dashboard"
    );
    return response.data;
  },


  vote: async (data: VoteRequest): Promise<VoteResponse> => {
    const response = await axiosInstance.post<VoteResponse>("/vote", data);
    return response.data;
  },
};

