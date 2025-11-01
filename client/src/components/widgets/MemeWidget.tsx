import { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { ThumbsUp, ThumbsDown, Smile } from "lucide-react";
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
            <Smile className="w-5 h-5 text-yellow-600" />
            <CardTitle className="text-xl font-semibold">Fun Meme</CardTitle>
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

  if (!memes || memes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Smile className="w-5 h-5 text-yellow-600" />
            <CardTitle className="text-xl font-semibold">Fun Meme</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No memes available at the moment.
          </p>
        </CardContent>
      </Card>
    );
  }

  const currentMeme = memes[0];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Smile className="w-5 h-5 text-yellow-600" />
          <CardTitle className="text-xl font-semibold">Fun Meme</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3">
          <div className="bg-muted rounded-lg p-4 text-center">
            <h4 className="font-semibold mb-2">{currentMeme.title}</h4>
            <div className="flex items-center justify-center mb-4">
              <img
                src={currentMeme.url}
                alt={currentMeme.title}
                className="max-w-full h-auto rounded-lg"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    "https://via.placeholder.com/400x300?text=Meme+Not+Available";
                }}
              />
            </div>
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Source: {currentMeme.source}</span>
              <a
                href={currentMeme.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary text-sm hover:underline"
              >
                View Original
              </a>
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-green-600 hover:text-green-700"
              onClick={() => handleVote(`meme-${currentMeme.id}`, "up")}
              disabled={votedItems.has(`meme-${currentMeme.id}`)}
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-600 hover:text-red-700"
              onClick={() => handleVote(`meme-${currentMeme.id}`, "down")}
              disabled={votedItems.has(`meme-${currentMeme.id}`)}
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default MemeWidget;
