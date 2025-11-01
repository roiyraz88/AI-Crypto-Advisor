import { Response } from "express";
import { AuthRequest } from "../middleware/requireAuth";
import { Vote } from "../models/Vote";

/**
 * Save or update a vote (thumbs up/down)
 */
export const saveVote = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: { message: "User not authenticated" },
      });
      return;
    }

    const { contentId, vote } = req.body;

    // Find existing vote
    let existingVote = await Vote.findOne({
      userId: req.user.id,
      contentId,
    });

    if (existingVote) {
      // Update existing vote
      existingVote.vote = vote;
      await existingVote.save();
    } else {
      // Create new vote
      existingVote = new Vote({
        userId: req.user.id,
        contentId,
        vote,
      });
      await existingVote.save();
    }

    res.status(200).json({
      success: true,
      data: {
        vote: {
          contentId: existingVote.contentId,
          vote: existingVote.vote,
        },
      },
    });
  } catch (error) {
    console.error("Vote error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to save vote" },
    });
  }
};

