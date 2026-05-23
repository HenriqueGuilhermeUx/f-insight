// Market Data Service - Integrates with Backend API

import { Asset, Index, NewsItem, MarketOverview } from '@/types';
import API_ENDPOINTS from '@/config/api';

// Fallback mock data for when API is not available
const BRAZILIAN_STOCKS: Asset[] = [
  { ticker: 'PETR4', name: 'Petrobras PN', price: 38.52, change: 1.25, changePercent: 3.35, volume: 48500000, type: 'stock', currency: 'BRL', sector: 'Petroleo', country: 'br' },
  { ticker: 'VALE3', name: 'Vale ON', price: 68.90, change: -0.85, changePercent: -1.22, volume: 32100000, type: 'stock', currency: 'BRL', sector: 'Mineracao', country: 'br' },
  { ticker: 'ITUB4', name: 'Itau Unibanco PN', price: 32.45, change: 0.32, changePercent: 0.99, volume: 28900000, type: 'stock', currency: 'BRL', sector: 'Bancos', country: 'br' },
  { ticker: 'BBDC4', name: 'Bradesco PN', price: 14.78, change: -0.22, changePercent: -1.47, volume: 41200000, type: 'stock', currency: 'BRL', sector: 'Bancos', country: 'br' },
  { ticker: 'ABEV3', name: 'Ambev ON', price: 11.92, change: 0.08, changePercent: 0.68, volume: 19800000, type: 'stock', currency: 'BRL', sector: 'Bebidas', country: 'br' },
  { ticker: 'WEGE3', name: 'WEG ON', price: 44.25, change: 1.15, changePercent: 2.67, volume: 15600000, type: 'stock', currency: 'BRL', sector: 'Eletro', country: 'br' },
  { ticker: 'RENT3', name: 'Localiza ON', price: 52.80, change: -0.95, changePercent: -1.77, volume: 8900000, type: 'stock', currency: 'BRL', sector: 'Aluguel', country: 'br' },
  { ticker: 'EQTL3', name: 'Equatorial ON', price: 35.60, change: 0.45, changePercent: 1.28, volume: 6700000, type: 'stock', currency: 'BRL', sector: 'Energia', country: 'br' },
  { ticker: 'HAPV3', name: 'Hapvida ON', price: 3.85, change: -0.12, changePercent: -3.02, volume: 34500000, type: 'stock', currency: 'BRL', sector: 'Saude', country: 'br' },
  { ticker: 'MELI3', name: 'Mercado Livre ON', price: 1825.50, change: 25.30, changePercent: 1.40, volume: 2100000, type: 'stock', currency: 'BRL', sector: 'Varejo', country: 'br' },
];

const US_STOCKS: Asset[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', price: 178.72, change: 2.15, changePercent: 1.22, volume: 58200000, type: 'stock', currency: 'USD', sector: 'Tech', country: 'us' },
  { ticker: 'MSFT', name: 'Microsoft Corp.', price: 378.91, change: 4.82, changePercent: 1.29, volume: 22100000, type: 'stock', currency: 'USD', sector: 'Tech', country: 'us' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', price: 141.80, change: -0.95, changePercent: -0.67, volume: 18500000, type: 'stock', currency: 'USD', sector: 'Tech', country: 'us' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', price: 178.25, change: 3.45, changePercent: 1.97, volume: 35600000, type: 'stock', currency: 'USD', sector: 'Tech', country: 'us' },
  { ticker: 'NVDA', name: 'NVIDIA Corp.', price: 875.38, change: 22.50, changePercent: 2.64, volume: 42100000, type: 'stock', currency: 'USD', sector: 'Tech', country: 'us' },
  { ticker: 'TSLA', name: 'Tesla Inc.', price: 248.50, change: -5.20, changePercent: -2.05, volume: 95800000, type: 'stock', currency: 'USD', sector: 'Auto', country: 'us' },
  { ticker: 'META', name: 'Meta Platforms', price: 505.75, change: 8.30, changePercent: 1.67, volume: 15300000, type: 'stock', currency: 'USD', sector: 'Tech', country: 'us' },
  { ticker: 'JPM', name: 'JPMorgan Chase', price: 198.45, change: 1.85, changePercent: 0.94, volume: 8900000, type: 'stock', currency: 'USD', sector: 'Finance', country: 'us' },
];

const CRYPTO_ASSETS: Asset[] = [
  { ticker: 'BTC', name: 'Bitcoin', price: 69542.80, change: 1850.50, changePercent: 2.73, volume: 28500000000, type: 'crypto', currency: 'USD' },
  { ticker: 'ETH', name: 'Ethereum', price: 3812.45, change: 95.30, changePercent: 2.56, volume: 15200000000, type: 'crypto', currency: 'USD' },
  { ticker: 'BNB', name: 'Binance Coin', price: 598.20, change: -12.40, changePercent: -2.03, volume: 1850000000, type: 'crypto', currency: 'USD' },
  { ticker: 'SOL', name: 'Solana', price: 172.85, change: 8.45, changePercent: 5.14, volume: 3200000000, type: 'crypto', currency: 'USD' },
  { ticker: 'XRP', name: 'Ripple', price: 0.52, change: 0.02, changePercent: 4.00, volume: 1200000000, type: 'crypto', currency: 'USD' },
  { ticker: 'ADA', name: 'Cardano', price: 0.45, change: -0.015, changePercent: -3.23, volume: 480000000, type: 'crypto', currency: 'USD' },
  { ticker: 'DOGE', name: 'Dogecoin', price: 0.125, change: 0.008, changePercent: 6.84, volume: 890000000, type: 'crypto', currency: 'USD' },
  { ticker: 'AVAX', name: 'Avalanche', price: 38.50, change: 1.20, changePercent: 3.22, volume: 520000000, type: 'crypto', currency: 'USD' },
];

const INDICES: Index[] = [
  { ticker: '^BVSP', name: 'Ibovespa', value: 128450.82, change: 1850.45, changePercent: 1.46 },
  { ticker: '^GSPC', name: 'S&P 500', value: 5248.49, change: 45.23, changePercent: 0.87 },
  { ticker: '^IXIC', name: 'NASDAQ', value: 16420.58, change: 185.42, changePercent: 1.14 },
  { ticker: '^DJI', name: 'Dow Jones', value: 39512.84, change: 245.30, changePercent: 0.62 },
  { ticker: '^NYA', name: 'NYSE Composite', value: 18520.45, change: 125.80, changePercent: 0.68 },
];

const NEWS: NewsItem[] = [
  {
    id: '1',
    title: 'Petrobras announces new pre-salt discovery in Santos Basin',
    summary: 'State-owned oil company discovers significant reserves in new offshore field.',
    source: 'Reuters',
    url: '#',
    publishedAt: new Date(Date.now() - 1800000).toISOString(),
    image: 'https://images.unsplash.com/photo-1614644147798-f8c0fc9da7f6?w=400',
    tags: ['Petroleo', 'Petrobras'],
    sentiment: 'positive',
  },
  {
    id: '2',
    title: 'Fed signals potential rate cuts in second half of 2024',
    summary: 'Federal Reserve indicates inflation is trending toward 2% target, opening door for easing.',
    source: 'Bloomberg',
    url: '#',
    publishedAt: new Date(Date.now() - 3600000).toISOString(),
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400',
    tags: ['Fed', 'Juros'],
    sentiment: 'positive',
  },
  {
    id: '3',
    title: 'Bitcoin ETF sees record inflows amid institutional demand',
    summary: 'Spot Bitcoin ETFs attract $1.2B in single day as crypto rally continues.',
    source: 'CoinDesk',
    url: '#',
    publishedAt: new Date(Date.now() - 5400000).toISOString(),
    image: 'https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400',
    tags: ['Bitcoin', 'ETF', 'Crypto'],
    sentiment: 'positive',
  },
  {
    id: '4',
    title: 'Brazil GDP growth surprises to upside in Q1',
    summary: 'Economic activity expands 0.8% quarter-over-quarter, beating analyst estimates.',
    source: 'Estadao',
    url: '#',
    publishedAt: new Date(Date.now() - 7200000).toISOString(),
    image: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=400',
    tags: ['Brasil', 'PIB'],
    sentiment: 'positive',
  },
  {
    id: '5',
    title: 'NVIDIA surpasses expectations with AI chip demand',
    summary: 'Semiconductor giant reports 400% year-over-year revenue growth driven by AI investments.',
    source: 'CNBC',
    url: '#',
    publishedAt: new Date(Date.now() - 10800000).toISOString(),
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400',
    tags: ['NVIDIA', 'Tech', 'IA'],
    sentiment: 'positive',
  },
  {
    id: '6',
    title: 'Itaú reports record quarterly profit, raises guidance',
    summary: 'Largest Latin American bank exceeds estimates with strong credit growth.',
    source: 'Valor',
    url: '#',
    publishedAt: new Date(Date.now() - 14400000).toISOString(),
    tags: ['Itaú', 'Bancos'],
    sentiment: 'positive',
  },
];

const GRAHAM_PICKS: any[] = [
  { ticker: 'PETR4', name: 'Petrobras PN', score: 85, grade: 'A', pe: 5.2, pb: 0.85, dy: 12.5, roe: 18.5 },
  { ticker: 'VALE3', name: 'Vale ON', score: 78, grade: 'B+', pe: 7.8, pb: 1.15, dy: 8.2, roe: 15.2 },
  { ticker: 'ITUB4', name: 'Itau Unibanco', score: 82, grade: 'A-', pe: 8.5, pb: 1.45, dy: 7.8, roe: 17.1 },
  { ticker: 'WEGE3', name: 'WEG ON', score: 75, grade: 'B+', pe: 18.5, pb: 3.2, dy: 3.2, roe: 22.5 },
  { ticker: 'ABEV3', name: 'Ambev ON', score: 80, grade: 'A-', pe: 12.5, pb: 2.8, dy: 5.5, roe: 24.2 },
  { ticker: 'BBDC4', name: 'Bradesco PN', score: 70, grade: 'B', pe: 9.2, pb: 1.2, dy: 6.8, roe: 14.5 },
  { ticker: 'EQTL3', name: 'Equatorial ON', score: 72, grade: 'B', pe: 11.5, pb: 2.1, dy: 5.2, roe: 19.5 },
  { ticker: 'RENT3', name: 'Localiza ON', score: 68, grade: 'B-', pe: 14.8, pb: 3.5, dy: 4.1, roe: 28.5 },
];

// Helper to check if API is available
async function fetchFromAPI<T>(url: string, fallback: T): Promise<T> {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error('API request failed');
    return await response.json();
  } catch (error) {
    console.warn(`API unavailable, using fallback: ${url}`);
    return fallback;
  }
}

// API Functions
export async function fetchMarketOverview(): Promise<MarketOverview> {
  const indicesData = await fetchFromAPI(API_ENDPOINTS.stocks.indices, INDICES);

  return {
    brazil: {
      ibovespa: indicesData.find((i: Index) => i.ticker === '^BVSP') || INDICES[0],
      smallCaps: { ticker: 'SMLL', name: 'Small Caps', value: 28542.50, change: 245.30, changePercent: 0.87 },
      ifix: { ticker: 'IFIX', name: 'IFIX', value: 3450.82, change: 12.45, changePercent: 0.36 },
    },
    usa: {
      sp500: indicesData.find((i: Index) => i.ticker === '^GSPC') || INDICES[1],
      nasdaq: indicesData.find((i: Index) => i.ticker === '^IXIC') || INDICES[2],
      dow: indicesData.find((i: Index) => i.ticker === '^DJI') || INDICES[3],
    },
    crypto: {
      btc: CRYPTO_ASSETS[0],
      eth: CRYPTO_ASSETS[1],
    },
  };
}

export async function fetchAssets(
  market: 'br' | 'us' | 'crypto',
  type?: 'stock' | 'etf' | 'fii' | 'crypto'
): Promise<Asset[]> {
  switch (market) {
    case 'br':
      return BRAZILIAN_STOCKS;
    case 'us':
      return US_STOCKS;
    case 'crypto':
      const cryptoData = await fetchFromAPI(API_ENDPOINTS.crypto.list, CRYPTO_ASSETS);
      return cryptoData.map((c: any) => ({
        ticker: c.symbol,
        name: c.name,
        price: c.price,
        change: c.price * (c.change24h / 100),
        changePercent: c.change24h,
        volume: c.volume24h,
        type: 'crypto',
        currency: 'USD',
      }));
    default:
      return [...BRAZILIAN_STOCKS, ...US_STOCKS, ...CRYPTO_ASSETS];
  }
}

export async function fetchAssetByTicker(ticker: string): Promise<Asset | null> {
  const allAssets = [...BRAZILIAN_STOCKS, ...US_STOCKS, ...CRYPTO_ASSETS];
  return allAssets.find(a => a.ticker.toUpperCase() === ticker.toUpperCase()) || null;
}

export async function fetchIndices(): Promise<Index[]> {
  return fetchFromAPI(API_ENDPOINTS.stocks.indices, INDICES);
}

export async function fetchNews(limit = 10): Promise<NewsItem[]> {
  const newsData = await fetchFromAPI(API_ENDPOINTS.news.list, NEWS);
  return newsData.slice(0, limit);
}

export async function fetchGrahamPicks(): Promise<any[]> {
  return GRAHAM_PICKS;
}

export async function searchAssets(query: string): Promise<Asset[]> {
  const q = query.toLowerCase();
  const allAssets = [...BRAZILIAN_STOCKS, ...US_STOCKS, ...CRYPTO_ASSETS];
  return allAssets.filter(a =>
    a.ticker.toLowerCase().includes(q) ||
    a.name.toLowerCase().includes(q)
  );
}

// Fetch candles for chart
export async function fetchCandles(symbol: string, resolution = 'D', from?: number, to?: number) {
  const url = `${API_ENDPOINTS.stocks.candles(symbol)}?resolution=${resolution}${from ? `&from=${from}` : ''}${to ? `&to=${to}` : ''}`;
  return fetchFromAPI(url, { c: [], h: [], l: [], o: [], v: [], t: [] });
}

// Fetch indicators for technical analysis
export async function fetchIndicators(symbol: string) {
  return fetchFromAPI(API_ENDPOINTS.indicators(symbol), {
    rsi: 50,
    sma50: 0,
    sma200: 0,
    macd: { line: 0, signal: 0, histogram: 0 },
    bollinger: { upper: 0, middle: 0, lower: 0 },
    support: 0,
    resistance: 0,
  });
}

// ETFs for demo
const ETFs: Asset[] = [
  { ticker: 'IVVB11', name: 'iShares S&P 500', price: 135.80, change: 1.45, changePercent: 1.08, volume: 2500000, type: 'etf', currency: 'BRL' },
  { ticker: 'SPXI11', name: 'SPX S&P 500', price: 142.50, change: 1.65, changePercent: 1.17, volume: 890000, type: 'etf', currency: 'BRL' },
  { ticker: 'SMAL11', name: 'SMAL11 Small Caps', price: 185.20, change: -2.30, changePercent: -1.23, volume: 1200000, type: 'etf', currency: 'BRL' },
  { ticker: 'XPLG11', name: 'XP Longo Prazo', price: 98.75, change: 0.45, changePercent: 0.46, volume: 450000, type: 'etf', currency: 'BRL' },
  { ticker: 'MXRF11', name: 'Maxi Retorno', price: 10.25, change: 0.05, changePercent: 0.49, volume: 3200000, type: 'etf', currency: 'BRL' },
];

// FIIs for demo
const FIIs: Asset[] = [
  { ticker: 'HGLG11', name: 'CSHG Logistica', price: 168.50, change: 0.85, changePercent: 0.51, volume: 850000, type: 'fii', currency: 'BRL' },
  { ticker: 'XPML11', name: 'XP Malls', price: 98.30, change: -0.45, changePercent: -0.46, volume: 1200000, type: 'fii', currency: 'BRL' },
  { ticker: 'VILG11', name: 'Vinci Logistica', price: 112.40, change: 0.60, changePercent: 0.54, volume: 650000, type: 'fii', currency: 'BRL' },
  { ticker: 'BRCO11', name: 'BTG Pactual Corp', price: 88.90, change: 0.25, changePercent: 0.28, volume: 420000, type: 'fii', currency: 'BRL' },
  { ticker: 'HCTR11', name: 'Hedge Credits', price: 102.15, change: -0.35, changePercent: -0.34, volume: 380000, type: 'fii', currency: 'BRL' },
];

// Export all data for offline/demo
export const mockData = {
  stocks: {
    br: BRAZILIAN_STOCKS,
    us: US_STOCKS,
  },
  crypto: CRYPTO_ASSETS,
  etfs: ETFs,
  fiis: FIIs,
  indices: INDICES,
  news: NEWS,
  grahamPicks: GRAHAM_PICKS,
};