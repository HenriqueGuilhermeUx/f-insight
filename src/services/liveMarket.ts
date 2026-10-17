import API_ENDPOINTS from '@/config/api';
import type { Asset } from '@/types';

export type MarketGroup = 'br' | 'us' | 'crypto';

export interface AssetCatalogEntry {
  ticker: string;
  providerSymbol: string;
  name: string;
  type: Asset['type'];
  currency: Asset['currency'];
  market: MarketGroup;
  sector?: string;
  country?: string;
}

export interface LiveAssetSnapshot {
  asset: Asset;
  provider: string | null;
  providerSymbol: string;
  fetchedAt: string | null;
  dataAvailable: boolean;
}

interface LiveIndicator {
  symbol: string;
  provider?: string;
  providerSymbol?: string;
  lastPrice?: number;
  change?: number;
  changePercent?: number;
  avgVolume?: number;
  fetchedAt?: string;
}

interface LivePayload {
  source?: string;
  data?: LiveIndicator[];
  dataUpdatedAt?: string | null;
  responseAt?: string | null;
  dataAgeSeconds?: number | null;
}

export const ASSET_CATALOG: AssetCatalogEntry[] = [
  { ticker: 'PETR4', providerSymbol: 'PETR4.SA', name: 'Petrobras PN', type: 'stock', currency: 'BRL', market: 'br', sector: 'Energia', country: 'BR' },
  { ticker: 'VALE3', providerSymbol: 'VALE3.SA', name: 'Vale ON', type: 'stock', currency: 'BRL', market: 'br', sector: 'Mineração', country: 'BR' },
  { ticker: 'ITUB4', providerSymbol: 'ITUB4.SA', name: 'Itaú Unibanco PN', type: 'stock', currency: 'BRL', market: 'br', sector: 'Financeiro', country: 'BR' },
  { ticker: 'BBDC4', providerSymbol: 'BBDC4.SA', name: 'Bradesco PN', type: 'stock', currency: 'BRL', market: 'br', sector: 'Financeiro', country: 'BR' },
  { ticker: 'WEGE3', providerSymbol: 'WEGE3.SA', name: 'WEG ON', type: 'stock', currency: 'BRL', market: 'br', sector: 'Industrial', country: 'BR' },
  { ticker: 'IVVB11', providerSymbol: 'IVVB11.SA', name: 'iShares S&P 500', type: 'etf', currency: 'BRL', market: 'br', sector: 'ETF', country: 'BR' },
  { ticker: 'HGLG11', providerSymbol: 'HGLG11.SA', name: 'CSHG Logística FII', type: 'fii', currency: 'BRL', market: 'br', sector: 'FII', country: 'BR' },
  { ticker: 'AAPL', providerSymbol: 'AAPL', name: 'Apple Inc.', type: 'stock', currency: 'USD', market: 'us', sector: 'Technology', country: 'US' },
  { ticker: 'MSFT', providerSymbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock', currency: 'USD', market: 'us', sector: 'Technology', country: 'US' },
  { ticker: 'GOOGL', providerSymbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', currency: 'USD', market: 'us', sector: 'Technology', country: 'US' },
  { ticker: 'AMZN', providerSymbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', currency: 'USD', market: 'us', sector: 'Consumer', country: 'US' },
  { ticker: 'NVDA', providerSymbol: 'NVDA', name: 'NVIDIA Corp.', type: 'stock', currency: 'USD', market: 'us', sector: 'Technology', country: 'US' },
  { ticker: 'TSLA', providerSymbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', currency: 'USD', market: 'us', sector: 'Automotive', country: 'US' },
  { ticker: 'META', providerSymbol: 'META', name: 'Meta Platforms', type: 'stock', currency: 'USD', market: 'us', sector: 'Technology', country: 'US' },
  { ticker: 'BTC', providerSymbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto', currency: 'USD', market: 'crypto', country: 'GLOBAL' },
  { ticker: 'ETH', providerSymbol: 'ETH-USD', name: 'Ethereum', type: 'crypto', currency: 'USD', market: 'crypto', country: 'GLOBAL' },
  { ticker: 'SOL', providerSymbol: 'SOL-USD', name: 'Solana', type: 'crypto', currency: 'USD', market: 'crypto', country: 'GLOBAL' },
  { ticker: 'BNB', providerSymbol: 'BNB-USD', name: 'BNB', type: 'crypto', currency: 'USD', market: 'crypto', country: 'GLOBAL' },
  { ticker: 'XRP', providerSymbol: 'XRP-USD', name: 'XRP', type: 'crypto', currency: 'USD', market: 'crypto', country: 'GLOBAL' },
  { ticker: 'ADA', providerSymbol: 'ADA-USD', name: 'Cardano', type: 'crypto', currency: 'USD', market: 'crypto', country: 'GLOBAL' },
  { ticker: 'DOGE', providerSymbol: 'DOGE-USD', name: 'Dogecoin', type: 'crypto', currency: 'USD', market: 'crypto', country: 'GLOBAL' },
];

export function catalogEntry(ticker: string) {
  const normalized = String(ticker || '').replace(/\.SA$/i, '').toUpperCase();
  return ASSET_CATALOG.find((item) => item.ticker === normalized) || null;
}

export function searchAssetCatalog(query: string, market?: MarketGroup) {
  const normalized = query.trim().toLowerCase();
  if (normalized.length < 2) return [];
  return ASSET_CATALOG
    .filter((item) => !market || item.market === market)
    .filter((item) => item.ticker.toLowerCase().includes(normalized) || item.name.toLowerCase().includes(normalized))
    .slice(0, 12);
}

function inferEntry(ticker: string): AssetCatalogEntry {
  const normalized = String(ticker || '').replace(/\.SA$/i, '').toUpperCase();
  const known = catalogEntry(normalized);
  if (known) return known;
  const looksBrazilian = /\d{1,2}$/.test(normalized);
  return {
    ticker: normalized,
    providerSymbol: looksBrazilian ? `${normalized}.SA` : normalized,
    name: normalized,
    type: 'stock',
    currency: looksBrazilian ? 'BRL' : 'USD',
    market: looksBrazilian ? 'br' : 'us',
    country: looksBrazilian ? 'BR' : 'US',
  };
}

function emptyAsset(meta: AssetCatalogEntry): Asset {
  return {
    ticker: meta.ticker,
    name: meta.name,
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    type: meta.type,
    currency: meta.currency,
    sector: meta.sector,
    country: meta.country,
  };
}

export async function fetchLiveAssetSnapshots(tickers: string[]): Promise<{
  snapshots: LiveAssetSnapshot[];
  source: string;
  updatedAt: string | null;
}> {
  const metas = [...new Map(tickers.filter(Boolean).map((ticker) => {
    const meta = inferEntry(ticker);
    return [meta.ticker, meta] as const;
  })).values()];

  if (metas.length === 0) return { snapshots: [], source: 'empty', updatedAt: null };

  const providerSymbols = metas.map((item) => item.providerSymbol);
  const url = `${API_ENDPOINTS.live.indicators}?symbols=${encodeURIComponent(providerSymbols.join(','))}`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Live market unavailable (${response.status})`);

  const payload = await response.json() as LivePayload;
  const rows = Array.isArray(payload?.data) ? payload.data : [];
  const bySymbol = new Map(rows.map((row) => [String(row.symbol || '').toUpperCase(), row]));

  const snapshots = metas.map((meta) => {
    const row = bySymbol.get(meta.providerSymbol.toUpperCase());
    const lastPrice = Number(row?.lastPrice || 0);
    const dataAvailable = Number.isFinite(lastPrice) && lastPrice > 0;
    return {
      asset: dataAvailable
        ? {
            ...emptyAsset(meta),
            price: lastPrice,
            change: Number(row?.change || 0),
            changePercent: Number(row?.changePercent || 0),
            volume: Number(row?.avgVolume || 0),
          }
        : emptyAsset(meta),
      provider: row?.provider ? String(row.provider) : null,
      providerSymbol: meta.providerSymbol,
      fetchedAt: row?.fetchedAt ? String(row.fetchedAt) : null,
      dataAvailable,
    } satisfies LiveAssetSnapshot;
  });

  const latestRowTimestamp = snapshots
    .map((item) => item.fetchedAt)
    .filter((value): value is string => Boolean(value))
    .sort()
    .at(-1) || null;

  return {
    snapshots,
    source: String(payload?.source || 'live-api'),
    updatedAt: latestRowTimestamp || payload?.dataUpdatedAt || null,
  };
}

export async function fetchLiveAssetSnapshot(ticker: string) {
  const result = await fetchLiveAssetSnapshots([ticker]);
  return result.snapshots[0] || null;
}

export async function fetchLiveAssetsByMarket(market: MarketGroup) {
  const entries = ASSET_CATALOG.filter((item) => item.market === market);
  return fetchLiveAssetSnapshots(entries.map((item) => item.ticker));
}

export function watchlistAssetInput(entry: AssetCatalogEntry): Pick<Asset, 'ticker' | 'name' | 'type'> {
  return { ticker: entry.ticker, name: entry.name, type: entry.type };
}
