import mongoose, { Document, Schema } from "mongoose";

export interface IPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  experienceLevel: "beginner" | "intermediate" | "advanced";
  riskTolerance: "low" | "moderate" | "high";
  investmentGoals: string[];
  favoriteCryptos: string[];
  contentTypes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const preferencesSchema = new Schema<IPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    experienceLevel: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      required: true,
    },
    riskTolerance: {
      type: String,
      enum: ["low", "moderate", "high"],
      required: true,
    },
    investmentGoals: {
      type: [String],
      required: true,
      default: [],
    },
    favoriteCryptos: {
      type: [String],
      required: true,
      default: [],
    },
    contentTypes: {
      type: [String],
      required: false,
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

export const Preferences = mongoose.model<IPreferences>(
  "Preferences",
  preferencesSchema
);

