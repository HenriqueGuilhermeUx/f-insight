// Type definitions for the investment platform

export interface Asset {
  ticker: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  type: 'stock' | 'etf' | 'crypto' | 'fii' | 'bdr';
  currency: 'BRL' | 'USD';
  sector?: string;
  country?: string;
  logo?: string;
}

export interface Index {
  ticker: string;
  name: string;
  value: number;
  change: number;
  changePercent: number;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  publishedAt: string;
  image?: string;
  tags: string[];
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface WatchlistItem {
  ticker: string;
  name: string;
  addedAt: number;
  targetPrice?: number;
  notes?: string;
}

export interface Alert {
  id: string;
  ticker: string;
  type: 'price' | 'percent' | 'rsi' | 'macd';
  condition: 'above' | 'below';
  value: number;
  isActive: boolean;
  triggeredAt?: string;
}

export interface PortfolioItem {
  ticker: string;
  name: string;
  quantity: number;
  avgPrice: number;
  currentPrice?: number;
  type: 'stock' | 'etf' | 'crypto' | 'fii' | 'bdr';
}

export interface TechnicalIndicator {
  name: string;
  value: number;
  signal?: 'buy' | 'sell' | 'neutral';
  description?: string;
}

export interface FundamentalMetric {
  name: string;
  value: number | string;
  benchmark?: number;
  signal?: 'good' | 'bad' | 'neutral';
}

export interface GrahamScore {
  ticker: string;
  name: string;
  score: number;
  grade: string;
  intrinsicValue?: number;
  marginOfSafety?: number;
  pe?: number;
  pb?: number;
  dy?: number;
  roe?: number;
  debtEquity?: number;
  isRealData?: boolean;
}

export interface MarketOverview {
  brazil: {
    ibovespa: Index;
    smallCaps: Index;
    ifix: Index;
  };
  usa: {
    sp500: Index;
    nasdaq: Index;
    dow: Index;
  };
  crypto: {
    btc: Asset;
    eth: Asset;
  };
}

export interface ScreenerFilter {
  sector?: string;
  country?: 'br' | 'us' | 'crypto';
  marketCapMin?: number;
  marketCapMax?: number;
  peMin?: number;
  peMax?: number;
  dyMin?: number;
  sortBy?: 'ticker' | 'change' | 'volume' | 'marketCap' | 'pe' | 'dy';
  sortOrder?: 'asc' | 'desc';
}

export type PageType =
  | 'home'
  | 'radar'
  | 'watchlist'
  | 'asset'
  | 'news'
  | 'analysis'
  | 'portfolio'
  | 'alerts';

export interface AppState {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  searchQuery: string;
  selectedMarket: 'br' | 'us' | 'crypto';
}