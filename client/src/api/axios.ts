import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";

let isRefreshing = false;
let failedQueue: Array<{ resolve: (v?: unknown) => void; reject: (e: unknown) => void }> = [];

const processQueue = (error: AxiosError | null) => {
  failedQueue.forEach((p) => (error ? p.reject(error) : p.resolve()));
  failedQueue = [];
};

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, 
  headers: { "Content-Type": "application/json" },
});

axiosInstance.interceptors.request.use(
  (config) => config,
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retry?: boolean }) | undefined;

    if (error.response?.status === 401 && original && !original._retry) {
      if (original.url?.includes("/auth/refresh")) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve: () => resolve(axiosInstance(original)), reject });
        });
      }

      try {
        isRefreshing = true;
        original._retry = true;
        await axiosInstance.post("/auth/refresh");
        processQueue(null);
        isRefreshing = false;
        return axiosInstance(original);
      } catch (rfErr) {
        processQueue(rfErr as AxiosError);
        isRefreshing = false;
        return Promise.reject(rfErr);
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
