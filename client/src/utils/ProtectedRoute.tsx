import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { usePreferencesStore } from "../store/usePreferencesStore";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
}

export const ProtectedRoute = ({
  children,
  requireOnboarding = false,
}: ProtectedRouteProps) => {
  const { isAuthenticated, isLoading } = useAuthStore();
  const { hasCompletedOnboarding } = usePreferencesStore();
  const location = useLocation();

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

  // Authenticated but onboarding required
  if (requireOnboarding && !hasCompletedOnboarding()) {
    // Avoid redirect loop if already on onboarding
    if (location.pathname !== "/onboarding") {
      return <Navigate to="/onboarding" replace />;
    }
  }

  return <>{children}</>;
};
