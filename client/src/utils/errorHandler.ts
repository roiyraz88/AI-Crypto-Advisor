import { AxiosError } from "axios";


export const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error && "response" in error) {
    const axiosError = error as AxiosError<{
      success?: boolean;
      error?: { message?: string; details?: unknown };
    }>;

    const status = axiosError.response?.status;
    const errorData = axiosError.response?.data;

    if (errorData?.error?.message) {
      return errorData.error.message;
    }

    switch (status) {
      case 400:
        return "Invalid request. Please check your input and try again.";
      case 401:
        return "Authentication failed. Please check your credentials.";
      case 403:
        return "You don't have permission to perform this action.";
      case 404:
        return "The requested resource was not found.";
      case 409:
        return "This action conflicts with existing data.";
      case 422:
        return "Invalid data provided. Please check your input.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Server error. Please try again later.";
      case 503:
        return "Service temporarily unavailable. Please try again later.";
      default:
        return "An unexpected error occurred. Please try again.";
    }
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    if (message.includes("network")) {
      return "Network error. Please check your internet connection.";
    }
    
    if (message.includes("timeout")) {
      return "Request timed out. Please try again.";
    }

    if (message.includes("failed with status code")) {
      return "Server error. Please try again.";
    }

    return "Something went wrong. Please try again.";
  }

  return "An unexpected error occurred. Please try again.";
};


export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    return (
      message.includes("network") ||
      message.includes("failed to fetch") ||
      message.includes("networkerror")
    );
  }
  return false;
};


export const isValidationError = (error: unknown): boolean => {
  if (error instanceof Error && "response" in error) {
    const axiosError = error as AxiosError;
    return [400, 422].includes(axiosError.response?.status || 0);
  }
  return false;
};

