import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import { dashboardApi } from "../../api/dashboard";

interface AIInsightWidgetProps {
  content: string;
  isLoading?: boolean;
  onVote?: (contentId: string, vote: "up" | "down") => void;
}

const AIInsightWidget = ({
  content,
  isLoading,
  onVote,
}: AIInsightWidgetProps) => {
  const [hasVoted, setHasVoted] = useState(false);

  const handleVote = async (vote: "up" | "down") => {
    if (hasVoted) return;

    // optimistic update
    setHasVoted(true);
    try {
      await dashboardApi.vote({ contentId: "ai-insight", vote });
      onVote?.("ai-insight", vote);
    } catch (error) {
      console.error("Failed to vote:", error);
      // revert on failure
      setHasVoted(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl font-semibold">
              AI Insight of the Day
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center min-h-[60vh]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <CardTitle className="text-xl font-semibold">
            AI Insight of the Day
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
            <p className="text-foreground whitespace-pre-wrap">
              {content || "AI analysis is being generated..."}
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${
                hasVoted
                  ? "text-green-700 bg-green-50"
                  : "text-green-600 hover:text-green-700"
              }`}
              onClick={() => handleVote("up")}
              disabled={hasVoted}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className={`h-8 w-8 ${
                hasVoted
                  ? "text-red-700 bg-red-50"
                  : "text-red-600 hover:text-red-700"
              }`}
              onClick={() => handleVote("down")}
              disabled={hasVoted}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIInsightWidget;
