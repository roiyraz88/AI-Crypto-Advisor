
export interface User {
  id: string;
  email: string;
  name: string;
}


export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
  };
}


export type ExperienceLevel = "beginner" | "intermediate" | "advanced";
export type RiskTolerance = "low" | "moderate" | "high";
export type InvestorType =
  | "HODLer"
  | "Day Trader"
  | "NFT Collector"
  | "DeFi Enthusiast"
  | "Miner"
  | "Other";

export type ContentType = "Market News" | "Charts" | "Social" | "Fun";

export interface Preferences {
  experienceLevel: ExperienceLevel;
  riskTolerance: RiskTolerance;
  investmentGoals: string[];
  favoriteCryptos: string[];
  investorType?: InvestorType;
  contentTypes?: ContentType[];
}

export interface PreferencesRequest {
  experienceLevel: ExperienceLevel;
  riskTolerance: RiskTolerance;
  investmentGoals: string[];
  favoriteCryptos: string[];
  contentTypes?: ContentType[];
}


export interface CryptoData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
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

export interface MemeData {
  id: string;
  title: string;
  url: string;
  source: string;
}

export interface DashboardData {
  marketOverview: {
    title: string;
    cryptos: CryptoData[];
  };
  news: {
    title: string;
    articles: NewsData[];
  };
  aiAnalysis: {
    title: string;
    content: string;
  };
  memes: {
    title: string;
    items: MemeData[];
  };
}


export interface VoteRequest {
  contentId: string;
  vote: "up" | "down";
}

export interface VoteResponse {
  success: boolean;
  data: {
    vote: {
      contentId: string;
      vote: "up" | "down";
    };
  };
}


export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
}

