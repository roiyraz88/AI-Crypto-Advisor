/**
 * CryptoPanic API Service (Developer Plan - v2)
 */

interface CryptoPanicNewsItem {
  id: number;
  title: string;
  url: string;
  published_at: string;
  source: {
    title: string;
  };
  votes: {
    negative: number;
    positive: number;
  };
}

interface CryptoPanicApiResponse {
  results: CryptoPanicNewsItem[];
}

export interface NewsData {
  id: number;
  title: string;
  url: string;
  publishedAt: string;
  source: string;
  sentiment: {
    negative: number;
    positive: number;
  };
}
export const fetchLatestNews = async (
  limit: number = 10,
  filterSymbols?: string[] | null,
  filterOnly: boolean = false
): Promise<NewsData[]> => {
  try {
    const apiKey = process.env.CRYPTOPANIC_API_KEY;
    if (!apiKey) throw new Error("CRYPTOPANIC_API_KEY is not configured");

    const url = `https://cryptopanic.com/api/developer/v2/posts/`;

    const response = await fetch(`${url}?auth_token=${apiKey}&filter=news&public=true`);

    if (!response.ok) throw new Error("Failed to fetch data from CryptoPanic");

    const data = (await response.json()) as CryptoPanicApiResponse;

    const news = data.results ?? [];

    // Normalize filter symbols to lower-case if provided
    const rawSymbols = (filterSymbols || []).map((s) => String(s).toLowerCase()).filter(Boolean);

    // map some common coin ids to their ticker symbols for better matching
    const idToSymbol: Record<string, string> = {
      bitcoin: "BTC",
      ethereum: "ETH",
      solana: "SOL",
      cardano: "ADA",
      polkadot: "DOT",
      chainlink: "LINK",
      polygon: "MATIC",
      "avalanche-2": "AVAX",
      uniswap: "UNI",
      litecoin: "LTC",
      tether: "USDT",
      binancecoin: "BNB",
    };

    const symbols = rawSymbols
      .flatMap((s) => {
        const up = s.toUpperCase();
        const alias = idToSymbol[s];
        return alias ? [up, alias] : [up];
      })
      .map((s) => s.toUpperCase())
      .filter(Boolean);

    // Helper: map CryptoPanic item to NewsData
    const mapItem = (item: CryptoPanicNewsItem): NewsData => ({
      id: item.id,
      title: item.title,
      url: item.url,
      publishedAt: item.published_at,
      source: item.source?.title ?? "Unknown",
      sentiment: {
        negative: item.votes?.negative ?? 0,
        positive: item.votes?.positive ?? 0,
      },
    });

    const mapped = news.map(mapItem);

    // If symbols provided, prioritize or filter articles that mention those symbols in the title or url.
    if (symbols.length > 0) {
      const scoreArticle = (a: NewsData) => {
        const text = (a.title + " " + a.url + " " + a.source).toUpperCase();
        let score = 0;
        for (const s of symbols) {
          if (text.includes(s)) score += 2;
          // also match common coin names (basic check)
          if (s === "BTC" && text.includes("BITCOIN")) score += 2;
          if (s === "ETH" && text.includes("ETHEREUM")) score += 2;
          if (s === "SOL" && text.includes("SOLANA")) score += 2;
        }
        return score;
      };

      const scored = mapped.map((a) => ({ a, score: scoreArticle(a) }));

      if (filterOnly) {
        // Return only articles that matched (score > 0), sorted by score then date. If none matched, fall back to top news
        const matched = scored
          .filter((s) => s.score > 0)
          .sort((x, y) => (y.score - x.score) || (new Date(y.a.publishedAt).getTime() - new Date(x.a.publishedAt).getTime()))
          .map((s) => s.a);
        if (matched.length > 0) return matched.slice(0, limit);
        // no matches — fall through to return general news below
      }

      const prioritized = scored
        .sort((x, y) => (y.score - x.score) || (new Date(y.a.publishedAt).getTime() - new Date(x.a.publishedAt).getTime()))
        .map((s) => s.a);

      // If no prioritized matches (all scores 0), fallback to normal order
      const hasMatches = prioritized.some((p) => scoreArticle(p) > 0);
      return (hasMatches ? prioritized : mapped).slice(0, limit);
    }

    return mapped.slice(0, limit);
  } catch (error) {
    console.error("CryptoPanic API error:", error);
    return loadFallbackNews(limit);
  }
};

const loadFallbackNews = (limit: number): NewsData[] => {
  const fallback: NewsData[] = [
    {
      id: 1,
      title: "Crypto market shows volatility as BTC dips 2%",
      url: "https://example.com/news1",
      publishedAt: new Date().toISOString(),
      source: "Fallback News",
      sentiment: { positive: 120, negative: 30 },
    },
    {
      id: 2,
      title: "Ethereum developers announce upgrade timeline",
      url: "https://example.com/news2",
      publishedAt: new Date().toISOString(),
      source: "Fallback News",
      sentiment: { positive: 200, negative: 10 },
    },
  ];

  return fallback.slice(0, limit);
};
