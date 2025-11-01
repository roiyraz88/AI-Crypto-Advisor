import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";
import { dashboardApi } from "../../api/dashboard";
import type { DashboardData } from "../../types";
import MarketNewsWidget from "../../components/widgets/MarketNewsWidget";
import CoinPricesWidget from "../../components/widgets/CoinPricesWidget";
import AIInsightWidget from "../../components/widgets/AIInsightWidget";
import MemeWidget from "../../components/widgets/MemeWidget";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await dashboardApi.getDashboard();

      if (response.success && response.data) {
        setDashboardData(response.data);
      } else {
        setError(response.error?.message || "Failed to load dashboard");
      }
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to load dashboard";
      setError(errorMessage);

      // If it's a 404, it means preferences aren't set yet - redirect to onboarding
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          navigate("/onboarding");
          return;
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

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

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button variant="outline" onClick={fetchDashboard} disabled={isLoading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Grid Layout for Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market News Widget */}
        <MarketNewsWidget
          articles={dashboardData.news.articles}
          isLoading={false}
        />

        {/* Coin Prices Widget */}
        <CoinPricesWidget
          cryptos={dashboardData.marketOverview.cryptos}
          isLoading={false}
        />

        {/* AI Insight Widget */}
        <AIInsightWidget
          content={dashboardData.aiAnalysis.content}
          isLoading={false}
        />

        {/* Meme Widget */}
        <MemeWidget memes={dashboardData.memes.items} isLoading={false} />
      </div>
    </div>
  );
};

export default DashboardPage;
