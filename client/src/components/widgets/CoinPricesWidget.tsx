import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown, TrendingUp, TrendingDown } from "lucide-react";
import type { CryptoData } from "../../types";
import { dashboardApi } from "../../api/dashboard";

interface CoinPricesWidgetProps {
  cryptos: CryptoData[];
  isLoading?: boolean;
  onVote?: (contentId: string, vote: "up" | "down") => void;
}

const CoinPricesWidget = ({
  cryptos,
  isLoading,
  onVote,
}: CoinPricesWidgetProps) => {
  const [votedItems, setVotedItems] = useState<Set<string>>(new Set());

  const handleVote = async (contentId: string, vote: "up" | "down") => {
    if (votedItems.has(contentId)) return;

    try {
      await dashboardApi.vote({ contentId, vote });
      setVotedItems((prev) => new Set(prev).add(contentId));
      onVote?.(contentId, vote);
    } catch (error) {
      console.error("Failed to vote:", error);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1) {
      return price.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
    }
    return price.toLocaleString("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 6,
      maximumFractionDigits: 8,
    });
  };

  const formatChange = (change: number) => {
    const isPositive = change >= 0;
    return (
      <div
        className={`flex items-center gap-1 ${
          isPositive ? "text-green-600" : "text-red-600"
        }`}
      >
        {isPositive ? (
          <TrendingUp className="w-4 h-4" />
        ) : (
          <TrendingDown className="w-4 h-4" />
        )}
        <span>{Math.abs(change).toFixed(2)}%</span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Coin Prices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!cryptos || cryptos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Coin Prices</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No market data available at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Coin Prices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {cryptos.slice(0, 10).map((crypto) => (
          <div
            key={crypto.id}
            className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">
                  {crypto.symbol}
                </Badge>
                <span className="font-semibold">{crypto.name}</span>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium">{formatPrice(crypto.price)}</span>
                {formatChange(crypto.change24h)}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-green-600 hover:text-green-700"
                onClick={() => handleVote(`crypto-${crypto.id}`, "up")}
                disabled={votedItems.has(`crypto-${crypto.id}`)}
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600 hover:text-red-700"
                onClick={() => handleVote(`crypto-${crypto.id}`, "down")}
                disabled={votedItems.has(`crypto-${crypto.id}`)}
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default CoinPricesWidget;
