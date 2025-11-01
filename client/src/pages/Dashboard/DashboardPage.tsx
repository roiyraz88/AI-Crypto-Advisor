import { useEffect, useState, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { RefreshCw } from "lucide-react";
import { dashboardApi } from "../../api/dashboard";
import { usePreferencesStore } from "../../store/usePreferencesStore";
import type { DashboardData } from "../../types";

import { getErrorMessage } from "../../utils/errorHandler";
import MarketNewsWidget from "../../components/widgets/MarketNewsWidget";
import CoinPricesWidget from "../../components/widgets/CoinPricesWidget";
import AIInsightWidget from "../../components/widgets/AIInsightWidget";
import MemeWidget from "../../components/widgets/MemeWidget";

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
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
      const errorMessage = getErrorMessage(err);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const preferences = usePreferencesStore((s) => s.preferences);


  const contentTypes = preferences?.contentTypes ?? null;
  const showMarketNews = contentTypes
    ? contentTypes.includes("Market News")
    : true;
  const showCharts = contentTypes ? contentTypes.includes("Charts") : true;
  const showSocial = contentTypes ? contentTypes.includes("Social") : true;
  const showFun = contentTypes ? contentTypes.includes("Fun") : true;

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard, preferences]);

  useEffect(() => {
    if (!preferences || !dashboardData) return;

    const favs = (preferences.favoriteCryptos || []).map((f) =>
      String(f).toUpperCase()
    );
    if (favs.length === 0) return;

    const cryptos = dashboardData.marketOverview.cryptos;
    const favItems: typeof cryptos = [];
    const rest: typeof cryptos = [];
    const seen = new Set<string>();

    for (const f of favs) {
      const match = cryptos.find(
        (c) => c.symbol === f || c.id.toUpperCase() === f
      );
      if (match && !seen.has(match.symbol)) {
        favItems.push(match);
        seen.add(match.symbol);
      }
    }
    for (const c of cryptos) {
      if (!seen.has(c.symbol)) rest.push(c);
    }

    const newOrder = [...favItems, ...rest];
    const current = dashboardData.marketOverview.cryptos;
    const isSame =
      current.length === newOrder.length &&
      current.every((c, i) => String(c.id) === String(newOrder[i].id));

    if (!isSame) {
      setDashboardData((prev) =>
        prev
          ? {
              ...prev,
              marketOverview: { ...prev.marketOverview, cryptos: newOrder },
            }
          : prev
      );
    }
  }, [preferences, dashboardData]);

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
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchDashboard}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {showMarketNews && (
          <MarketNewsWidget
            articles={dashboardData.news.articles}
            isLoading={false}
          />
        )}

        {showCharts && (
          <CoinPricesWidget
            cryptos={dashboardData.marketOverview.cryptos}
            isLoading={false}
          />
        )}

        {showSocial && (
          <AIInsightWidget
            content={dashboardData.aiAnalysis.content}
            isLoading={false}
          />
        )}

        {showFun && (
          <MemeWidget memes={dashboardData.memes.items} isLoading={false} />
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
