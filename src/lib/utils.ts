import { clsx, ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price with currency
export function formatPrice(value: number, currency: 'BRL' | 'USD' = 'BRL'): string {
  const locale = currency === 'BRL' ? 'pt-BR' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

// Format large numbers with suffix
export function formatLargeNumber(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
}

// Format percentage
export function formatPercent(value: number, showSign = true): string {
  const sign = showSign && value > 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}

// Get relative time
export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 1) return 'agora';
  if (diffMin < 60) return `${diffMin}min`;
  if (diffHour < 24) return `${diffHour}h`;
  if (diffDay < 7) return `${diffDay}d`;
  return date.toLocaleDateString('pt-BR');
}

// Color utilities
export function getChangeColor(value: number): string {
  if (value > 0) return 'text-emerald-400';
  if (value < 0) return 'text-red-400';
  return 'text-amber-400';
}

export function getChangeBgColor(value: number): string {
  if (value > 0) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
  if (value < 0) return 'bg-red-500/20 text-red-400 border-red-500/30';
  return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
}

export function getScoreColor(score: number): string {
  if (score >= 80) return 'text-emerald-400';
  if (score >= 60) return 'text-cyan-400';
  if (score >= 40) return 'text-amber-400';
  return 'text-red-400';
}

export function getScoreBgColor(score: number): string {
  if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
  if (score >= 60) return 'bg-cyan-500/20 border-cyan-500/30';
  if (score >= 40) return 'bg-amber-500/20 border-amber-500/30';
  return 'bg-red-500/20 border-red-500/30';
}

export function getGradeFromScore(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B';
  if (score >= 50) return 'C+';
  if (score >= 40) return 'C';
  return 'D';
}

// Debounce utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Validate ticker
export function isValidTicker(ticker: string): boolean {
  return /^[A-Z0-9.-]{1,10}$/.test(ticker);
}

// Truncate text
export function truncate(str: string, length: number): string {
  return str.length > length ? str.substring(0, length) + '...' : str;
}

// Format volume
export function formatVolume(volume: number): string {
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(1)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(1)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(1)}K`;
  return volume.toString();
}

// Get asset type label
export function getAssetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    stock: 'Ação',
    etf: 'ETF',
    fii: 'FII',
    bdr: 'BDR',
    crypto: 'Cripto',
  };
  return labels[type] || type;
}

// Calculate percentage change
export function calcChange(current: number, previous: number): number {
  return ((current - previous) / previous) * 100;
}