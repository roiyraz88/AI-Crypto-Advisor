import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ThumbsUp, ThumbsDown, Sparkles } from "lucide-react";
import type { MemeData } from "../../types";
import { dashboardApi } from "../../api/dashboard";

interface MemeWidgetProps {
  memes: MemeData[];
  isLoading?: boolean;
  onVote?: (contentId: string, vote: "up" | "down") => void;
}

const MemeWidget = ({ memes, isLoading, onVote }: MemeWidgetProps) => {
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

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <CardTitle className="text-xl font-semibold">Daily Meme</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center min-h-[200px]">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!memes || memes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <CardTitle className="text-xl font-semibold">Daily Meme</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center min-h-[200px]">
            <p className="text-muted-foreground">
              No memes available at the moment.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentMeme = memes[0];

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <CardTitle className="text-xl font-semibold">Daily Meme</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {currentMeme.source}
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Meme Display */}
        <div className="relative">
          <div className="bg-gradient-to-br from-yellow-50 via-orange-50 to-pink-50 dark:from-yellow-950/20 dark:via-orange-950/20 dark:to-pink-950/20 rounded-xl p-8 border-2 border-yellow-200/50 dark:border-yellow-800/30 shadow-lg">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-bold text-foreground leading-relaxed">
                {currentMeme.title}
              </p>
            </div>
          </div>
          
          {/* Decorative corner accent */}
          <div className="absolute -top-2 -right-2 w-16 h-16 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-full blur-xl" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Sparkles className="w-3 h-3" />
            <span>AI Generated</span>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 px-3 transition-all ${
                votedItems.has(`meme-${currentMeme.id}`)
                  ? "text-green-600 bg-green-50 dark:bg-green-950/30"
                  : "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950/20"
              }`}
              onClick={() => handleVote(`meme-${currentMeme.id}`, "up")}
              disabled={votedItems.has(`meme-${currentMeme.id}`)}
            >
              <ThumbsUp className="h-4 w-4 mr-1.5" />
              <span className="text-xs font-medium">Like</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`h-9 px-3 transition-all ${
                votedItems.has(`meme-${currentMeme.id}`)
                  ? "text-red-600 bg-red-50 dark:bg-red-950/30"
                  : "text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
              }`}
              onClick={() => handleVote(`meme-${currentMeme.id}`, "down")}
              disabled={votedItems.has(`meme-${currentMeme.id}`)}
            >
              <ThumbsDown className="h-4 w-4 mr-1.5" />
              <span className="text-xs font-medium">Dislike</span>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemeWidget;
