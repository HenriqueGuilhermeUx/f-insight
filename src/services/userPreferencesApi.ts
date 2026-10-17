import type { Asset, WatchlistItem } from '@/types';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';

const API_URL = (import.meta.env.VITE_API_URL || 'https://f-insight-api.onrender.com').replace(/\/$/, '');

type WatchlistAssetInput = Pick<Asset, 'ticker' | 'name' | 'type'>;

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

async function authenticatedHeaders() {
  if (!supabase) throw new Error('Sessão online indisponível.');
  const { data, error } = await supabase.auth.getSession();
  if (error || !data.session?.access_token) throw new Error('Faça login novamente para acessar seus dados.');
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.session.access_token}`,
  };
}

function usesAuthenticatedOwnerApi() {
  // Production with Supabase configured must always use owner-bound /me routes.
  // Never downgrade to arbitrary-user compatibility paths because a health probe failed.
  return Boolean(isSupabaseConfigured && supabase);
}

async function api<T>(path: string, init?: RequestInit, authenticated = false): Promise<T> {
  const baseHeaders = authenticated ? await authenticatedHeaders() : { 'Content-Type': 'application/json' };
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { ...baseHeaders, ...(init?.headers || {}) },
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data?.error || data?.message || `Erro ${response.status}`);
  return data as T;
}

function userStorageKey(userId: string) {
  const input = String(userId || '').trim().toLowerCase();
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `usr_${(hash >>> 0).toString(16).padStart(8, '0')}`;
}

function userPathId(userId: string) {
  return encodeURIComponent(userStorageKey(userId));
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
  const ownerApi = usesAuthenticatedOwnerApi();
  const path = ownerApi ? '/api/watchlist/me' : `/api/watchlist/${userPathId(userId)}`;
  const items = await api<RemoteWatchlistItem[]>(path, undefined, ownerApi);
  return normalizeWatchlist(items);
}

export async function addWatchlistAsset(userId: string, asset: WatchlistAssetInput) {
  if (!userId) return null;
  const ownerApi = usesAuthenticatedOwnerApi();
  const path = ownerApi ? '/api/watchlist/me' : `/api/watchlist/${userPathId(userId)}`;
  const result = await api<{ success: boolean; watchlist: RemoteWatchlistItem[] }>(path, {
    method: 'POST',
    body: JSON.stringify({ ticker: asset.ticker, name: asset.name, type: asset.type }),
  }, ownerApi);
  return { ...result, watchlist: normalizeWatchlist(result.watchlist || []) };
}

export async function removeWatchlistAsset(userId: string, ticker: string) {
  if (!userId) return null;
  const ownerApi = usesAuthenticatedOwnerApi();
  const path = ownerApi
    ? `/api/watchlist/me/${encodeURIComponent(ticker)}`
    : `/api/watchlist/${userPathId(userId)}/${encodeURIComponent(ticker)}`;
  const result = await api<{ success: boolean; watchlist: RemoteWatchlistItem[] }>(path, { method: 'DELETE' }, ownerApi);
  return { ...result, watchlist: normalizeWatchlist(result.watchlist || []) };
}

export async function fetchAlerts(userId: string): Promise<RemoteAlert[]> {
  if (!userId) return [];
  const ownerApi = usesAuthenticatedOwnerApi();
  const path = ownerApi ? '/api/alerts/me' : `/api/alerts/${userPathId(userId)}`;
  return api<RemoteAlert[]>(path, undefined, ownerApi);
}

export async function createAlert(input: {
  userId: string;
  ticker: string;
  type: string;
  value: number;
  enabled?: boolean;
}) {
  const ownerApi = usesAuthenticatedOwnerApi();
  const body = ownerApi
    ? { ticker: input.ticker, type: input.type, value: input.value, enabled: input.enabled }
    : { ...input, userId: userStorageKey(input.userId) };

  return api<{ success: boolean; alert: RemoteAlert }>('/api/alerts', {
    method: 'POST',
    body: JSON.stringify(body),
  }, ownerApi);
}

export async function updateAlert(alertId: string, input: { enabled?: boolean; value?: number }) {
  const ownerApi = usesAuthenticatedOwnerApi();
  return api<{ success: boolean; alert: RemoteAlert }>(`/api/alerts/${encodeURIComponent(alertId)}`, {
    method: 'PATCH',
    body: JSON.stringify(input),
  }, ownerApi);
}

export async function deleteAlert(alertId: string) {
  const ownerApi = usesAuthenticatedOwnerApi();
  return api<{ success: boolean }>(`/api/alerts/${encodeURIComponent(alertId)}`, { method: 'DELETE' }, ownerApi);
}
