import { Response } from "express";
import { AuthRequest } from "../middleware/requireAuth";
import { Preferences } from "../models/Preferences";
import { fetchTopCryptos } from "../services/coinGeckoService";
import { fetchLatestNews } from "../services/cryptoPanicService";
import { getAIAnalysis } from "../services/aiService";
import { fetchTrendingMemes } from "../services/memesService";

/**
 * Get personalized dashboard data
 * Returns 4 sections: Market Overview, News, AI Analysis, Memes
 */
export const getDashboard = async (
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

    // Get user preferences
    const preferences = await Preferences.findOne({ userId: req.user.id });

    if (!preferences) {
      res.status(404).json({
        success: false,
        error: { message: "User preferences not found. Please complete onboarding." },
      });
      return;
    }

    // Fetch all dashboard sections in parallel
    const [marketData, newsData, memesData] = await Promise.all([
      fetchTopCryptos(10),
      fetchLatestNews(10),
      fetchTrendingMemes(5),
    ]);

    // Get AI analysis based on preferences and market data
    let aiAnalysis = "";
    try {
      aiAnalysis = await getAIAnalysis(
        {
          experienceLevel: preferences.experienceLevel,
          riskTolerance: preferences.riskTolerance,
          favoriteCryptos: preferences.favoriteCryptos,
        },
        marketData
      );
    } catch (error) {
      console.error("AI analysis error:", error);
      aiAnalysis = "AI analysis temporarily unavailable.";
    }

    res.status(200).json({
      success: true,
      data: {
        marketOverview: {
          title: "Market Overview",
          cryptos: marketData,
        },
        news: {
          title: "Latest News",
          articles: newsData,
        },
        aiAnalysis: {
          title: "AI Advisor",
          content: aiAnalysis,
        },
        memes: {
          title: "Trending Memes",
          items: memesData,
        },
      },
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({
      success: false,
      error: { message: "Failed to fetch dashboard data" },
    });
  }
};

