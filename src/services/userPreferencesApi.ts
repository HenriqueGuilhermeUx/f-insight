import type { Asset, WatchlistItem } from '@/types';

const API_URL = (import.meta.env.VITE_API_URL || 'https://f-insight-api.onrender.com').replace(/\/$/, '');

interface RemoteWatchlistItem {
  ticker: string;
  name: string;
  type?: string;
  addedAt: string | number;
}

export interface RemoteAlert {
  id: string;
  ticker: string;
  type: string;
  value: number;
  enabled: boolean;
  createdAt: string;
  triggeredAt: string | null;
}

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data?.error || data?.message || `Erro ${response.status}`);
  }
  return data as T;
}

function userPathId(userId: string) {
  return encodeURIComponent(String(userId || '').trim());
}

function normalizeWatchlist(items: RemoteWatchlistItem[]): WatchlistItem[] {
  return items.map((item) => ({
    ticker: item.ticker,
    name: item.name || item.ticker,
    addedAt: typeof item.addedAt === 'number' ? item.addedAt : (Date.parse(item.addedAt) || Date.now()),
  }));
}

export async function fetchWatchlist(userId: string): Promise<WatchlistItem[]> {
  if (!userId) return [];
  const items = await api<RemoteWatchlistItem[]>(`/api/watchlist/${userPathId(userId)}`);
  return normalizeWatchlist(items);
}

export async function addWatchlistAsset(userId: string, asset: Asset) {
  if (!userId) return null;
  const result = await api<{ success: boolean; watchlist: RemoteWatchlistItem[] }>(`/api/watchlist/${userPathId(userId)}`, {
    method: 'POST',
    body: JSON.stringify({ ticker: asset.ticker, name: asset.name, type: asset.type }),
  });
  return { ...result, watchlist: normalizeWatchlist(result.watchlist || []) };
}

export async function removeWatchlistAsset(userId: string, ticker: string) {
  if (!userId) return null;
  const result = await api<{ success: boolean; watchlist: RemoteWatchlistItem[] }>(
    `/api/watchlist/${userPathId(userId)}/${encodeURIComponent(ticker)}`,
    { method: 'DELETE' },
  );
  return { ...result, watchlist: normalizeWatchlist(result.watchlist || []) };
}

export async function fetchAlerts(userId: string): Promise<RemoteAlert[]> {
  if (!userId) return [];
  return api<RemoteAlert[]>(`/api/alerts/${userPathId(userId)}`);
}

export async function createAlert(input: {
  userId: string;
  ticker: string;
  type: string;
  value: number;
  enabled?: boolean;
}) {
  return api<{ success: boolean; alert: RemoteAlert }>('/api/alerts', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export async function updateAlert(alertId: string, input: { enabled?: boolean; value?: number }) {
  return api<{ success: boolean; alert: RemoteAlert }>(`/api/alerts/${encodeURIComponent(alertId)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  });
}

export async function deleteAlert(alertId: string) {
  return api<{ success: boolean }>(`/api/alerts/${encodeURIComponent(alertId)}`, { method: 'DELETE' });
}
