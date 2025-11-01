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

    const systemPrompt = `You are an expert cryptocurrency advisor. Provide personalized, concise, and actionable advice based on user preferences and current market data. Keep responses under 200 words.`;

    const userPrompt = `User preferences:
- Experience Level: ${preferences.experienceLevel}
- Risk Tolerance: ${preferences.riskTolerance}
- Favorite Cryptocurrencies: ${preferences.favoriteCryptos.join(", ")}

Market Data: ${JSON.stringify(marketData)}

Provide personalized crypto investment advice considering the above.`;

    const messages: OpenRouterMessage[] = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ];

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
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
    });

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
  return `Based on your profile as a ${preferences.experienceLevel} investor with ${preferences.riskTolerance} risk tolerance, focus on steady growth and avoid high-volatility assets. 
Consider diversifying your portfolio rather than investing only in ${preferences.favoriteCryptos.join(", ")}. 
Review market trends daily and avoid emotional trading.`;
};
