import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ThumbsUp, ThumbsDown, ExternalLink } from "lucide-react";
import type { NewsData } from "../../types";
import { dashboardApi } from "../../api/dashboard";

interface MarketNewsWidgetProps {
  articles: NewsData[];
  isLoading?: boolean;
  onVote?: (contentId: string, vote: "up" | "down") => void;
}

const MarketNewsWidget = ({
  articles,
  isLoading,
  onVote,
}: MarketNewsWidgetProps) => {
  const [votedItems, setVotedItems] = useState<Set<string>>(new Set());
  const [items, setItems] = useState<NewsData[]>(articles || []);

  // keep local items in sync with incoming props
  useEffect(() => {
    setItems(articles || []);
  }, [articles]);

  const handleVote = async (contentId: string, vote: "up" | "down") => {
    if (votedItems.has(contentId)) return;

    // optimistic update
    setVotedItems((prev) => new Set(prev).add(contentId));
    setItems((prev) =>
      prev.map((it) =>
        String(it.id) === String(contentId)
          ? {
              ...it,
              sentiment: {
                positive: it.sentiment.positive + (vote === "up" ? 1 : 0),
                negative: it.sentiment.negative + (vote === "down" ? 1 : 0),
              },
            }
          : it
      )
    );

    try {
      await dashboardApi.vote({ contentId: contentId.toString(), vote });
      onVote?.(contentId, vote);
    } catch (error) {
      console.error("Failed to vote:", error);
      // revert optimistic update on failure
      setVotedItems((prev) => {
        const copy = new Set(prev);
        copy.delete(contentId);
        return copy;
      });
      setItems((prev) =>
        prev.map((it) =>
          String(it.id) === String(contentId)
            ? {
                ...it,
                sentiment: {
                  positive: Math.max(
                    0,
                    it.sentiment.positive - (vote === "up" ? 1 : 0)
                  ),
                  negative: Math.max(
                    0,
                    it.sentiment.negative - (vote === "down" ? 1 : 0)
                  ),
                },
              }
            : it
        )
      );
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Market News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Market News</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-muted-foreground text-center">
              No news available at the moment.
            </p>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Please check back later or ensure the CryptoPanic API key is
              configured.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Market News</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {items.slice(0, 5).map((article) => (
          <div
            key={article.id}
            className="border-b border-border pb-4 last:border-0 last:pb-0"
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <a
                  href={article.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-primary flex-1 flex items-center hover:underline"
                >
                  {article.title}
                  <ExternalLink className="inline-block h-3 w-3 ml-1" />
                </a>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{article.source}</span>
                  <span>
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </span>
                  <span>
                    👍 {article.sentiment.positive} 👎{" "}
                    {article.sentiment.negative}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${
                      votedItems.has(article.id.toString())
                        ? "text-green-700 bg-green-50"
                        : "text-green-600 hover:text-green-700"
                    }`}
                    onClick={() => handleVote(article.id.toString(), "up")}
                    disabled={votedItems.has(article.id.toString())}
                  >
                    <ThumbsUp className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`h-8 w-8 ${
                      votedItems.has(article.id.toString())
                        ? "text-red-700 bg-red-50"
                        : "text-red-600 hover:text-red-700"
                    }`}
                    onClick={() => handleVote(article.id.toString(), "down")}
                    disabled={votedItems.has(article.id.toString())}
                  >
                    <ThumbsDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default MarketNewsWidget;
