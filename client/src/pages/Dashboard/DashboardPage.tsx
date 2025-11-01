import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw, Lock } from "lucide-react";
import { dashboardApi } from "../../api/dashboard";
import type { DashboardData } from "../../types";
import { usePreferencesStore } from "../../store/usePreferencesStore";
import { getErrorMessage } from "../../utils/errorHandler";
import MarketNewsWidget from "../../components/widgets/MarketNewsWidget";
import CoinPricesWidget from "../../components/widgets/CoinPricesWidget";
import AIInsightWidget from "../../components/widgets/AIInsightWidget";
import MemeWidget from "../../components/widgets/MemeWidget";

const DashboardPage = () => {
  const navigate = useNavigate();
  const { hasCompletedOnboarding } = usePreferencesStore();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requiresOnboarding, setRequiresOnboarding] = useState(false);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await dashboardApi.getDashboard();

      if (response.success && response.data) {
        setDashboardData(response.data);
        // Check if onboarding is required from response or store
        const requiresOnboardingFlag = (response.data as any).requiresOnboarding;
        setRequiresOnboarding(
          requiresOnboardingFlag !== undefined
            ? requiresOnboardingFlag
            : !hasCompletedOnboarding()
        );
      } else {
        setError(response.error?.message || "Failed to load dashboard");
      }
    } catch (err: unknown) {
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, [hasCompletedOnboarding]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            <Button onClick={fetchDashboard}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!dashboardData) {
    return (
      <Card>
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-4">
            <p className="text-muted-foreground">No data available</p>
            <Button onClick={fetchDashboard}>Refresh</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const showLockedState = requiresOnboarding || !hasCompletedOnboarding();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          {showLockedState && (
            <Button
              variant="default"
              onClick={() => navigate("/onboarding")}
              className="mr-2"
            >
              Complete Onboarding
            </Button>
          )}
          <Button variant="outline" onClick={fetchDashboard} disabled={isLoading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Onboarding Banner */}
      {showLockedState && (
        <Alert>
          <Lock className="h-4 w-4" />
          <AlertDescription>
            Complete onboarding to unlock personalized AI insights and full dashboard features.{" "}
            <Button
              variant="link"
              className="p-0 h-auto font-semibold"
              onClick={() => navigate("/onboarding")}
            >
              Get Started →
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Grid Layout for Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market News Widget - Always available */}
        <MarketNewsWidget
          articles={dashboardData.news.articles}
          isLoading={false}
        />

        {/* Coin Prices Widget - Always available */}
        <CoinPricesWidget
          cryptos={dashboardData.marketOverview.cryptos}
          isLoading={false}
        />

        {/* AI Insight Widget - Locked until onboarding */}
        {showLockedState ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                AI Advisor
                <Lock className="h-4 w-4 text-muted-foreground" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <Lock className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground text-center">
                  Complete onboarding to unlock personalized AI insights tailored to your
                  investment preferences.
                </p>
                <Button onClick={() => navigate("/onboarding")}>
                  Complete Onboarding
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <AIInsightWidget
            content={dashboardData.aiAnalysis.content}
            isLoading={false}
          />
        )}

        {/* Meme Widget - Always available */}
        <MemeWidget memes={dashboardData.memes.items} isLoading={false} />
      </div>
    </div>
  );
};

export default DashboardPage;
