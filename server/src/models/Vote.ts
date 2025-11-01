import mongoose, { Document, Schema } from "mongoose";

export interface IVote extends Document {
  userId: mongoose.Types.ObjectId;
  contentId: string;
  vote: "up" | "down";
  createdAt: Date;
  updatedAt: Date;
}

const voteSchema = new Schema<IVote>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contentId: {
      type: String,
      required: true,
    },
    vote: {
      type: String,
      enum: ["up", "down"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Ensure one vote per user per content
voteSchema.index({ userId: 1, contentId: 1 }, { unique: true });

export const Vote = mongoose.model<IVote>("Vote", voteSchema);

