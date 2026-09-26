// Market Data Service — production paths must never fabricate current market values.

import { Asset, Index, NewsItem, MarketOverview } from '@/types';
import API_ENDPOINTS from '@/config/api';

type LiveIndicator = {
  symbol: string;
  lastPrice: number;
  change?: number;
  changePercent?: number;
  avgVolume?: number;
  fetchedAt?: string;
  provider?: string;
};

type LiveIndicatorsPayload = {
  source?: string;
  data?: LiveIndicator[];
};

type AssetMeta = Pick<Asset, 'ticker' | 'name' | 'type' | 'currency'> & {
  providerSymbol: string;
  sector?: string;
  country?: string;
};

const BR_ASSETS: AssetMeta[] = [
  { ticker: 'PETR4', providerSymbol: 'PETR4.SA', name: 'Petrobras PN', type: 'stock', currency: 'BRL', sector: 'Petróleo', country: 'br' },
  { ticker: 'VALE3', providerSymbol: 'VALE3.SA', name: 'Vale ON', type: 'stock', currency: 'BRL', sector: 'Mineração', country: 'br' },
  { ticker: 'ITUB4', providerSymbol: 'ITUB4.SA', name: 'Itaú Unibanco PN', type: 'stock', currency: 'BRL', sector: 'Bancos', country: 'br' },
  { ticker: 'BBDC4', providerSymbol: 'BBDC4.SA', name: 'Bradesco PN', type: 'stock', currency: 'BRL', sector: 'Bancos', country: 'br' },
  { ticker: 'ABEV3', providerSymbol: 'ABEV3.SA', name: 'Ambev ON', type: 'stock', currency: 'BRL', sector: 'Bebidas', country: 'br' },
  { ticker: 'WEGE3', providerSymbol: 'WEGE3.SA', name: 'WEG ON', type: 'stock', currency: 'BRL', sector: 'Industrial', country: 'br' },
  { ticker: 'RENT3', providerSymbol: 'RENT3.SA', name: 'Localiza ON', type: 'stock', currency: 'BRL', sector: 'Serviços', country: 'br' },
  { ticker: 'BBAS3', providerSymbol: 'BBAS3.SA', name: 'Banco do Brasil ON', type: 'stock', currency: 'BRL', sector: 'Bancos', country: 'br' },
];

const US_ASSETS: AssetMeta[] = [
  { ticker: 'AAPL', providerSymbol: 'AAPL', name: 'Apple Inc.', type: 'stock', currency: 'USD', sector: 'Technology', country: 'us' },
  { ticker: 'MSFT', providerSymbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock', currency: 'USD', sector: 'Technology', country: 'us' },
  { ticker: 'GOOGL', providerSymbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', currency: 'USD', sector: 'Technology', country: 'us' },
  { ticker: 'AMZN', providerSymbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', currency: 'USD', sector: 'Consumer', country: 'us' },
  { ticker: 'NVDA', providerSymbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock', currency: 'USD', sector: 'Technology', country: 'us' },
  { ticker: 'TSLA', providerSymbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', currency: 'USD', sector: 'Automotive', country: 'us' },
  { ticker: 'META', providerSymbol: 'META', name: 'Meta Platforms', type: 'stock', currency: 'USD', sector: 'Technology', country: 'us' },
  { ticker: 'JPM', providerSymbol: 'JPM', name: 'JPMorgan Chase', type: 'stock', currency: 'USD', sector: 'Financials', country: 'us' },
];

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Market API request failed (${response.status})`);
  return response.json() as Promise<T>;
}

function validNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function indicatorToAsset(meta: AssetMeta, indicator: LiveIndicator): Asset | null {
  if (!validNumber(indicator.lastPrice) || indicator.lastPrice <= 0) return null;
  return {
    ticker: meta.ticker,
    name: meta.name,
    price: indicator.lastPrice,
    change: validNumber(indicator.change) ? indicator.change : 0,
    changePercent: validNumber(indicator.changePercent) ? indicator.changePercent : 0,
    volume: validNumber(indicator.avgVolume) ? indicator.avgVolume : 0,
    type: meta.type,
    currency: meta.currency,
    sector: meta.sector,
    country: meta.country,
  };
}

async function fetchLiveAssets(metadata: AssetMeta[]): Promise<Asset[]> {
  const symbols = metadata.map((item) => item.providerSymbol);
  const payload = await fetchJson<LiveIndicatorsPayload>(`${API_ENDPOINTS.live.indicators}?symbols=${encodeURIComponent(symbols.join(','))}`);
  const bySymbol = new Map((payload.data || []).map((item) => [String(item.symbol || '').toUpperCase(), item]));
  return metadata
    .map((meta) => {
      const indicator = bySymbol.get(meta.providerSymbol.toUpperCase());
      return indicator ? indicatorToAsset(meta, indicator) : null;
    })
    .filter((item): item is Asset => Boolean(item));
}

function normalizeCryptoAsset(value: any): Asset | null {
  const price = Number(value?.price);
  const changePercent = Number(value?.change24h ?? value?.changePercent);
  const volume = Number(value?.volume24h ?? value?.volume ?? 0);
  if (!Number.isFinite(price) || price <= 0) return null;
  return {
    ticker: String(value?.symbol || value?.ticker || '').toUpperCase(),
    name: String(value?.name || value?.symbol || 'Crypto'),
    price,
    change: Number.isFinite(changePercent) ? price * (changePercent / 100) : 0,
    changePercent: Number.isFinite(changePercent) ? changePercent : 0,
    volume: Number.isFinite(volume) ? volume : 0,
    type: 'crypto',
    currency: 'USD',
  };
}

function normalizeIndex(value: any): Index | null {
  const numeric = Number(value?.value ?? value?.price);
  if (!Number.isFinite(numeric) || numeric <= 0 || value?.error) return null;
  return {
    ticker: String(value?.ticker ?? value?.symbol ?? ''),
    name: String(value?.name ?? value?.ticker ?? value?.symbol ?? ''),
    value: numeric,
    change: Number.isFinite(Number(value?.change)) ? Number(value.change) : 0,
    changePercent: Number.isFinite(Number(value?.changePercent)) ? Number(value.changePercent) : 0,
  };
}

export async function fetchMarketOverview(): Promise<MarketOverview> {
  const [indices, crypto] = await Promise.all([fetchIndices(), fetchAssets('crypto')]);
  const requireIndex = (ticker: string) => {
    const item = indices.find((entry) => entry.ticker === ticker);
    if (!item) throw new Error(`Índice ${ticker} indisponível.`);
    return item;
  };
  const requireCrypto = (ticker: string) => {
    const item = crypto.find((entry) => entry.ticker === ticker);
    if (!item) throw new Error(`${ticker} indisponível.`);
    return item;
  };

  return {
    brazil: {
      ibovespa: requireIndex('^BVSP'),
      smallCaps: requireIndex('SMLL'),
      ifix: requireIndex('IFIX'),
    },
    usa: {
      sp500: requireIndex('^GSPC'),
      nasdaq: requireIndex('^IXIC'),
      dow: requireIndex('^DJI'),
    },
    crypto: {
      btc: requireCrypto('BTC'),
      eth: requireCrypto('ETH'),
    },
  };
}

export async function fetchAssets(
  market: 'br' | 'us' | 'crypto',
  _type?: 'stock' | 'etf' | 'fii' | 'crypto'
): Promise<Asset[]> {
  if (market === 'br') return fetchLiveAssets(BR_ASSETS);
  if (market === 'us') return fetchLiveAssets(US_ASSETS);

  const payload = await fetchJson<any>(API_ENDPOINTS.crypto.list);
  const list = Array.isArray(payload) ? payload : payload?.data || payload?.assets || [];
  return (Array.isArray(list) ? list : [])
    .map(normalizeCryptoAsset)
    .filter((item): item is Asset => Boolean(item));
}

export async function fetchAssetByTicker(ticker: string): Promise<Asset | null> {
  const clean = String(ticker || '').trim().toUpperCase().replace(/\.SA$/, '');
  const meta = [...BR_ASSETS, ...US_ASSETS].find((item) => item.ticker === clean);
  if (meta) {
    const values = await fetchLiveAssets([meta]);
    return values[0] || null;
  }

  const crypto = await fetchAssets('crypto');
  return crypto.find((item) => item.ticker === clean) || null;
}

export async function fetchIndices(): Promise<Index[]> {
  const payload = await fetchJson<any>(API_ENDPOINTS.stocks.indices);
  const list = Array.isArray(payload) ? payload : payload?.data || [];
  return (Array.isArray(list) ? list : [])
    .map(normalizeIndex)
    .filter((item): item is Index => Boolean(item));
}

export async function fetchNews(limit = 10): Promise<NewsItem[]> {
  const payload = await fetchJson<any>(API_ENDPOINTS.news.list);
  const list = Array.isArray(payload) ? payload : payload?.data || payload?.news || payload?.articles || [];
  return (Array.isArray(list) ? list : []).filter(Boolean).slice(0, limit);
}

// Graham/valuation cards must be calculated from current fundamentals before display.
// Until a verified calculation endpoint is available, production returns no picks instead of scores fabricated in the browser.
export async function fetchGrahamPicks(): Promise<any[]> {
  return [];
}

export async function searchAssets(query: string): Promise<Asset[]> {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const groups = await Promise.allSettled([fetchAssets('br'), fetchAssets('us'), fetchAssets('crypto')]);
  const assets = groups.flatMap((result) => result.status === 'fulfilled' ? result.value : []);
  return assets.filter((asset) => asset.ticker.toLowerCase().includes(q) || asset.name.toLowerCase().includes(q));
}

export async function fetchCandles(symbol: string, resolution = 'D', from?: number, to?: number) {
  const url = `${API_ENDPOINTS.stocks.candles(symbol)}?resolution=${encodeURIComponent(resolution)}${from ? `&from=${from}` : ''}${to ? `&to=${to}` : ''}`;
  return fetchJson<{ c: number[]; h: number[]; l: number[]; o: number[]; v: number[]; t: number[] }>(url);
}

export async function fetchIndicators(symbol: string) {
  return fetchJson(API_ENDPOINTS.indicators(symbol));
}

// Compatibility export only. Production screens must never use fixture values as live market data.
export const mockData = {
  stocks: { br: [] as Asset[], us: [] as Asset[] },
  crypto: [] as Asset[],
  etfs: [] as Asset[],
  fiis: [] as Asset[],
  indices: [] as Index[],
  news: [] as NewsItem[],
  grahamPicks: [] as any[],
};
