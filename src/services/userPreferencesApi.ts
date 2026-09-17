import type { Asset, WatchlistItem } from '@/types';

const API_URL = (import.meta.env.VITE_API_URL || 'https://f-insight-api.onrender.com').replace(/\/$/, '');

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

export async function fetchWatchlist(userId: string): Promise<WatchlistItem[]> {
  if (!userId) return [];
  return api<WatchlistItem[]>(`/api/watchlist/${userPathId(userId)}`);
}

export async function addWatchlistAsset(userId: string, asset: Asset) {
  if (!userId) return null;
  return api<{ success: boolean; watchlist: WatchlistItem[] }>(`/api/watchlist/${userPathId(userId)}`, {
    method: 'POST',
    body: JSON.stringify({ ticker: asset.ticker, name: asset.name, type: asset.type }),
  });
}

export async function removeWatchlistAsset(userId: string, ticker: string) {
  if (!userId) return null;
  return api<{ success: boolean; watchlist: WatchlistItem[] }>(
    `/api/watchlist/${userPathId(userId)}/${encodeURIComponent(ticker)}`,
    { method: 'DELETE' },
  );
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
