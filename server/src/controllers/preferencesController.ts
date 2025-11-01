import { Response } from "express";
import { AuthRequest } from "../middleware/requireAuth";
import { Preferences } from "../models/Preferences";

/**
 * Get user preferences
 */
export const getPreferences = async (
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

    // Find user preferences
    const preferences = await Preferences.findOne({ userId: req.user.id });

    if (!preferences) {
      res.status(404).json({
        success: false,
        error: { message: "Preferences not found" },
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        preferences: {
          experienceLevel: preferences.experienceLevel,
          riskTolerance: preferences.riskTolerance,
          investmentGoals: preferences.investmentGoals,
          favoriteCryptos: preferences.favoriteCryptos,
          contentTypes: preferences.contentTypes || [],
        },
      },
    });
  } catch (error) {
    console.error("Get preferences error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to fetch preferences" },
    });
  }
};

/**
 * Save or update user preferences
 */
export const savePreferences = async (
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

    const { experienceLevel, riskTolerance, investmentGoals, favoriteCryptos, contentTypes } =
      req.body;

    // Find or create preferences
    let preferences = await Preferences.findOne({ userId: req.user.id });

    if (preferences) {
      // Update existing preferences
      preferences.experienceLevel = experienceLevel;
      preferences.riskTolerance = riskTolerance;
      preferences.investmentGoals = investmentGoals;
      preferences.favoriteCryptos = favoriteCryptos;
      preferences.contentTypes = contentTypes || [];
      await preferences.save();
    } else {
      // Create new preferences
      preferences = new Preferences({
        userId: req.user.id,
        experienceLevel,
        riskTolerance,
        investmentGoals,
        favoriteCryptos,
        contentTypes: contentTypes || [],
      });
      await preferences.save();
    }

    res.status(200).json({
      success: true,
      data: {
        preferences: {
          experienceLevel: preferences.experienceLevel,
          riskTolerance: preferences.riskTolerance,
          investmentGoals: preferences.investmentGoals,
          favoriteCryptos: preferences.favoriteCryptos,
          contentTypes: preferences.contentTypes || [],
        },
      },
    });
  } catch (error) {
    console.error("Save preferences error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to save preferences" },
    });
  }
};

