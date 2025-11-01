import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import Cookies from "js-cookie";

/**
 * Flag to prevent infinite refresh loops
 */
let isRefreshing = false;

/**
 * Queue of failed requests waiting for token refresh
 */
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (error: unknown) => void;
}> = [];

/**
 * Process the queue of failed requests after refresh
 */
const processQueue = (error: AxiosError | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

/**
 * Axios instance with base configuration
 */
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // Important for HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Request interceptor
 */
axiosInstance.interceptors.request.use(
  (config) => {
    // HTTP-only cookies are sent automatically, no need to add headers
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor with automatic token refresh
 */
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // Handle 401 Unauthorized - attempt to refresh token
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      // If already refreshing, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => {
            return axiosInstance(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      // Check if it's a refresh endpoint to avoid loop
      if (originalRequest.url?.includes("/auth/refresh")) {
        // Refresh failed, logout user
        Cookies.remove("token");
        Cookies.remove("refreshToken");
        if (
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/signup")
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(error);
      }

      // Start refresh process
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call refresh endpoint
        await axios.post(
          `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        // Refresh successful, process queue and retry original request
        processQueue(null, null);
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh failed, logout user
        processQueue(refreshError as AxiosError, null);
        Cookies.remove("token");
        Cookies.remove("refreshToken");
        if (
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/signup")
        ) {
          window.location.href = "/login";
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Handle network errors
    if (!error.response) {
      error.message = "Network error. Please check your connection.";
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

