import { Navigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component
 * Waits for authentication check to complete before rendering
 * Redirects to login if not authenticated
 * NO onboarding requirement - dashboard handles locked state
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuthStore();

  // Show loading until auth status is known
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Not authenticated → send to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Authenticated → render children
  return <>{children}</>;
};
