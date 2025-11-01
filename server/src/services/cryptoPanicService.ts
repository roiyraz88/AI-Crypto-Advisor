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

export const fetchLatestNews = async (limit: number = 10): Promise<NewsData[]> => {
  try {
    const apiKey = process.env.CRYPTOPANIC_API_KEY;
    if (!apiKey) throw new Error("CRYPTOPANIC_API_KEY is not configured");

    const url = `https://cryptopanic.com/api/developer/v2/posts/`;

    const response = await fetch(`${url}?auth_token=${apiKey}&filter=news&public=true`);

    if (!response.ok) throw new Error("Failed to fetch data from CryptoPanic");

    const data = (await response.json()) as CryptoPanicApiResponse;

    const news = data.results ?? [];

    return news.slice(0, limit).map((item) => ({
      id: item.id,
      title: item.title,
      url: item.url,
      publishedAt: item.published_at,
      source: item.source?.title ?? "Unknown",
      sentiment: {
        negative: item.votes?.negative ?? 0,
        positive: item.votes?.positive ?? 0,
      },
    }));
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
