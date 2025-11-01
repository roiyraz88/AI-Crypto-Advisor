/**
 * CoinGecko API Service
 * Fetches cryptocurrency market data with caching + fallback
 */

import NodeCache from "node-cache";

export interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
}

/**
 * Response type for /coins/markets
 */
interface CoinGeckoMarketCoin {
  id: string;
  name: string;
  symbol: string;
  current_price: number;
  market_cap: number;
  price_change_percentage_24h: number;
}

/**
 * Response type for /coins/{id}
 */
interface CoinGeckoSingleCoinResponse {
  id: string;
  name: string;
  symbol: string;
  market_data: {
    current_price: { usd: number };
    price_change_percentage_24h: number;
    market_cap: { usd: number };
  };
}

/** Cache for 5 minutes */
const cache = new NodeCache({ stdTTL: 300 });

/**
 * Fetch top cryptocurrencies from CoinGecko
 */
export const fetchTopCryptos = async (
  limit: number = 10,
  favorites?: string[] | null,
  onlyFavorites: boolean = false
): Promise<CryptoData[]> => {
  const favKey = (favorites || [])
    .map((f) => String(f).toUpperCase())
    .join(",");
  const cacheKey = `top_${limit}_${favKey}`;
  const cached = cache.get<CryptoData[]>(cacheKey);

  if (cached) return cached;

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
    );

    if (!response.ok) {
      console.warn("⚠ CoinGecko unavailable — using fallback data");
      return loadFallbackTopCryptos();
    }

    const data = (await response.json()) as CoinGeckoMarketCoin[];

    const result = data.map((coin) => ({
      id: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      marketCap: coin.market_cap,
    }));
    // If onlyFavorites requested and favorites provided, fetch each favorite by id
    if (onlyFavorites && favorites && favorites.length > 0) {
      const favItems: CryptoData[] = [];
      for (const f of favorites) {
        try {
          const coin = await fetchCryptoById(String(f).toLowerCase());
          if (coin) favItems.push(coin);
        } catch (e) {
          // ignore individual failures
        }
      }

      // return only the favorites found (respect order)
      cache.set(cacheKey, favItems);
      return favItems;
    }

    // If favorites provided, reorder to put favorites first (in the order provided)
    let ordered = result;
    if (favorites && favorites.length > 0) {
      const favsUpper = favorites.map((f) => String(f).toUpperCase());
      const favItems: CryptoData[] = [];
      const rest: CryptoData[] = [];
      const seen = new Set<string>();

      // push favorites in the order specified
      for (const f of favsUpper) {
        const match = result.find(
          (r) => r.symbol === f || r.id.toUpperCase() === f
        );
        if (match && !seen.has(match.symbol)) {
          favItems.push(match);
          seen.add(match.symbol);
        }
      }

      // then append remaining coins
      for (const r of result) {
        if (!seen.has(r.symbol)) rest.push(r);
      }

      // If some favorites weren't present in the top results, try fetching them directly by id
      // favorites are passed as strings that are most commonly coin ids (e.g. 'bitcoin').
      const missingFavs = favsUpper.filter((f) => ![...seen].includes(f));
      for (const mf of missingFavs) {
        try {
          const id = mf.toLowerCase();
          const extra = await fetchCryptoById(id);
          if (extra && !seen.has(extra.symbol)) {
            favItems.push(extra);
            seen.add(extra.symbol);
          }
        } catch {}
      }

      ordered = [...favItems, ...rest];
    }

    cache.set(cacheKey, ordered);
    return ordered;
  } catch (error) {
    console.error("CoinGecko API error:", error);
    return loadFallbackTopCryptos();
  }
};

/**
 * Fetch specific cryptocurrency data by ID
 */
export const fetchCryptoById = async (
  id: string
): Promise<CryptoData | null> => {
  const cacheKey = `coin_${id}`;
  const cached = cache.get<CryptoData>(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${id}?localization=false&tickers=false&market_data=true`
    );

    if (!response.ok) return null;

    const data = (await response.json()) as CoinGeckoSingleCoinResponse;

    const result: CryptoData = {
      id: data.id,
      name: data.name,
      symbol: data.symbol.toUpperCase(),
      price: data.market_data.current_price.usd,
      change24h: data.market_data.price_change_percentage_24h,
      marketCap: data.market_data.market_cap.usd,
    };

    cache.set(cacheKey, result);
    return result;
  } catch (error) {
    console.error("CoinGecko API error:", error);
    return null;
  }
};

/**
 * Local Fallback (if API fails)
 */
const loadFallbackTopCryptos = (): CryptoData[] => {
  return [
    {
      id: "bitcoin",
      name: "Bitcoin",
      symbol: "BTC",
      price: 67000,
      change24h: 1.2,
      marketCap: 880000000000,
    },
    {
      id: "ethereum",
      name: "Ethereum",
      symbol: "ETH",
      price: 3500,
      change24h: -0.4,
      marketCap: 420000000000,
    },
    {
      id: "solana",
      name: "Solana",
      symbol: "SOL",
      price: 155,
      change24h: 2.1,
      marketCap: 70000000000,
    },
  ];
};
