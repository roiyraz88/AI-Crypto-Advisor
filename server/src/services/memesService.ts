import type { MemeData } from "./index";

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
 * Fetch trending cryptocurrency memes using AI
 * Generates creative, funny crypto-related meme concepts
 */
export const fetchTrendingMemes = async (
  limit: number = 5
): Promise<MemeData[]> => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.warn(
        "⚠ OPENROUTER_API_KEY not configured — using fallback memes"
      );
      return generateFallbackMemes(limit);
    }

    const systemPrompt = `You are a creative meme generator for cryptocurrency enthusiasts. 
Generate funny, relatable crypto meme text/titles that are popular in the crypto community.
Return a JSON object with a "memes" array containing exactly ${limit} meme objects.
Each meme object must have a "title" field with the meme text/title.
Example format:
{
  "memes": [
    {"title": "To the moon! 🚀"},
    {"title": "HODLing like a diamond 💎🙌"}
  ]
}
Make memes funny, current, and crypto-related. Keep titles under 100 characters.`;

    const userPrompt = `Generate ${limit} fresh cryptocurrency memes. Requirements:
- Funny and relatable to crypto traders/investors
- Reference popular crypto slang (HODL, moon, diamond hands, whale, rug pull, etc.)
- Current and relevant to today's crypto market sentiment
- Short, punchy text that works as a meme (max 100 chars)
- Include emojis when appropriate
- Make them original and creative

Return ONLY the JSON object with the memes array.`;

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
          "HTTP-Referer": "https://ai-crypto-advisor.com",
          "X-Title": "AI Crypto Advisor",
        },
        body: JSON.stringify({
          model: "openai/gpt-4o-mini",
          messages,
          temperature: 0.9, // Higher creativity for memes
          max_tokens: 500,
          response_format: { type: "json_object" }, // Force JSON object response
        }),
      }
    );

    if (!response.ok) {
      console.warn("⚠ AI meme generation failed — using fallback memes");
      return generateFallbackMemes(limit);
    }

    const data = (await response.json()) as OpenRouterResponse;
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return generateFallbackMemes(limit);
    }

    // Parse AI response - should be JSON object with memes array
    try {
      const parsed = JSON.parse(content);

      // Handle different response formats
      let memes: Array<{ title: string }> = [];

      if (Array.isArray(parsed)) {
        memes = parsed;
      } else if (parsed.memes && Array.isArray(parsed.memes)) {
        memes = parsed.memes;
      } else if (parsed.content && Array.isArray(parsed.content)) {
        memes = parsed.content;
      } else if (parsed.data && Array.isArray(parsed.data)) {
        memes = parsed.data;
      } else {
        // Try to extract array from text if not properly formatted
        const arrayMatch = content.match(/\[[\s\S]*\]/);
        if (arrayMatch) {
          memes = JSON.parse(arrayMatch[0]);
        }
      }

      // Convert AI-generated memes to MemeData format
      if (memes.length > 0) {
        return memes.slice(0, limit).map((meme, index) => ({
          id: `ai-meme-${Date.now()}-${index}`,
          title: meme.title || "Crypto Meme",
          url: `data:text/plain;base64,${Buffer.from(meme.title).toString(
            "base64"
          )}`,
          source: "AI Generated",
        }));
      }
    } catch (parseError) {
      console.error("Failed to parse AI meme response:", parseError);
    }

    // Fallback: Try to extract meme concepts from text
    return extractMemesFromText(content, limit);
  } catch (error) {
    console.error("AI meme generation error:", error);
    return generateFallbackMemes(limit);
  }
};

/**
 * Extract meme concepts from AI text response if JSON parsing fails
 */
const extractMemesFromText = (text: string, limit: number): MemeData[] => {
  // Try to find quoted strings or lines that look like memes
  const lines = text
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 5 && line.length < 150);

  const memes: MemeData[] = [];

  for (let i = 0; i < Math.min(lines.length, limit); i++) {
    const line = lines[i];
    if (!line) continue;

    // Remove numbering, bullets, quotes, markdown formatting
    const cleaned = line
      .replace(/^[\d\-\*\"\'\.\`\#]+/, "")
      .replace(/^[\"\']|[\"\']$/g, "")
      .trim();

    if (cleaned.length > 5 && cleaned.length < 150) {
      memes.push({
        id: `ai-meme-text-${Date.now()}-${i}`,
        title: cleaned,
        url: `data:text/plain;base64,${Buffer.from(cleaned).toString(
          "base64"
        )}`,
        source: "AI Generated",
      });
    }
  }

  return memes.length > 0 ? memes : generateFallbackMemes(limit);
};

/**
 * Fallback memes if AI generation fails
 */
const generateFallbackMemes = (limit: number): MemeData[] => {
  const fallbackMemes: MemeData[] = [
    {
      id: "fallback-1",
      title: "To the Moon! 🚀",
      url: "data:text/plain;base64,VG8gdGhlIE1vb24hIPCfkLA=",
      source: "Classic Crypto Meme",
    },
    {
      id: "fallback-2",
      title: "HODL 💎🙌",
      url: "data:text/plain;base64,SE9ETCAg8J+VqiDwn5Sw",
      source: "Classic Crypto Meme",
    },
    {
      id: "fallback-3",
      title: "When you buy the dip but it keeps dipping 😅",
      url: "data:text/plain;base64,V2hlbiB5b3UgYnV5IHRoZSBkaXAgYnV0IGl0IGtlZXBzIGRpcHBpbmcg8J+RlQ==",
      source: "Classic Crypto Meme",
    },
    {
      id: "fallback-4",
      title: "Diamond Hands Forever 💎",
      url: "data:text/plain;base64,RGlhbW9uZCBIYW5kcyBGb3JldmVyIPCflao=",
      source: "Classic Crypto Meme",
    },
    {
      id: "fallback-5",
      title: "This is fine 🔥",
      url: "data:text/plain;base64,VGhpcyBpcyBmaW5lIPCfjJE=",
      source: "Classic Crypto Meme",
    },
  ];

  return fallbackMemes.slice(0, limit);
};
