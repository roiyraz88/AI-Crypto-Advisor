/**
 * AI Service using OpenRouter API
 * Provides AI-powered crypto analysis and recommendations
 */

interface OpenRouterMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

interface OpenRouterChoice {
  message: { content: string };
}

interface OpenRouterResponse {
  choices: OpenRouterChoice[];
}

/**
 * Get AI analysis based on user preferences and market data
 */
export const getAIAnalysis = async (
  preferences: {
    experienceLevel: string;
    riskTolerance: string;
    favoriteCryptos: string[];
  },
  marketData: unknown
): Promise<string> => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      throw new Error("OPENROUTER_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert cryptocurrency advisor. Provide personalized, concise, and actionable advice based on user preferences and current market data. Keep responses under 200 words. When possible, give a short 2-3 bullet tactical suggestion and one broader strategic idea.`;

    // Create a contextual hint based on experience and risk
    const experienceHint = (() => {
      switch (preferences.experienceLevel) {
        case "beginner":
          return "User is a beginner — prefer simple explanations, avoid jargon, recommend gradual exposure and dollar-cost averaging.";
        case "intermediate":
          return "User has some experience — include portfolio allocation considerations and risk management tips.";
        case "advanced":
          return "User is advanced — include tactical ideas, possible hedges, and trade execution considerations.";
        default:
          return "Provide balanced, clear advice appropriate for a general audience.";
      }
    })();

    const riskHint = (() => {
      switch (preferences.riskTolerance) {
        case "low":
          return "Conservative stance: emphasize capital preservation and lower-volatility assets.";
        case "moderate":
          return "Balanced stance: mix of growth and stable assets; consider position sizing rules.";
        case "high":
          return "Aggressive stance: may include higher-volatility ideas but remind user about risk controls.";
        default:
          return "Mention risk management briefly.";
      }
    })();

    const favoritesText =
      preferences.favoriteCryptos && preferences.favoriteCryptos.length > 0
        ? preferences.favoriteCryptos.join(", ")
        : "(no favorites provided)";

    const userPrompt = `User preferences:\n- Experience Level: ${
      preferences.experienceLevel
    }\n- Risk Tolerance: ${
      preferences.riskTolerance
    }\n- Favorite Cryptocurrencies: ${favoritesText}\n\nContext hints: ${experienceHint} ${riskHint}\n\nMarket Data: ${JSON.stringify(
      marketData
    )}\n\nProvide personalized crypto investment advice considering the above, with short tactical bullets and one strategic recommendation.`;

    const messages: OpenRouterMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages,
          temperature: 0.7,
          max_tokens: 300,
        }),
      }
    );

    if (!response.ok) {
      console.warn("⚠ AI request failed — using fallback advice.");
      return fallbackAIAdvice(preferences);
    }

    const data = (await response.json()) as OpenRouterResponse;

    return data.choices?.[0]?.message?.content ?? fallbackAIAdvice(preferences);
  } catch (error) {
    console.error("AI Service error:", error);
    return fallbackAIAdvice(preferences);
  }
};

/**
 * AI Fallback - works if API key missing, rate limit, or offline
 */
const fallbackAIAdvice = (preferences: {
  experienceLevel: string;
  riskTolerance: string;
  favoriteCryptos: string[];
}): string => {
  const favs =
    preferences.favoriteCryptos && preferences.favoriteCryptos.length > 0
      ? preferences.favoriteCryptos.join(", ")
      : "a diversified set of blue-chip cryptos (e.g. BTC, ETH)";

  return `Based on your profile as a ${preferences.experienceLevel} investor with ${preferences.riskTolerance} risk tolerance, prefer steady allocation and risk controls. Consider diversifying your portfolio rather than investing only in ${favs}. Review dollar-cost averaging strategies for entry and set stop-losses for high-volatility positions.`;
};
