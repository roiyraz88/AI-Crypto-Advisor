/**
 * CryptoPanic API Service
 * Fetches cryptocurrency news and sentiment data
 */

interface CryptoPanicNews {
  id: number;
  title: string;
  url: string;
  published_at: string;
  source: string;
  votes: {
    negative: number;
    positive: number;
  };
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

interface CryptoPanicApiResponse {
  results: CryptoPanicNews[];
}

/**
 * Fetch latest cryptocurrency news from CryptoPanic
 */
export const fetchLatestNews = async (limit: number = 10): Promise<NewsData[]> => {
  try {
    const apiKey = process.env.CRYPTOPANIC_API_KEY;
    if (!apiKey) {
      throw new Error("CRYPTOPANIC_API_KEY is not configured");
    }

    const response = await fetch(
      `https://cryptopanic.com/api/v1/posts/?auth_token=${apiKey}&public=true&filter=hot&currencies=USD`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch data from CryptoPanic");
    }

    const data = (await response.json()) as CryptoPanicApiResponse;

    const news = data.results ?? [];

    return news.slice(0, limit).map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      publishedAt: item.published_at,
      source: item.source,
      sentiment: {
        negative: item.votes.negative,
        positive: item.votes.positive,
      },
    }));
  } catch (error) {
    console.error("CryptoPanic API error:", error);
    return loadFallbackNews(limit);
  }
};

/**
 * Fallback data if CryptoPanic API fails
 */
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
