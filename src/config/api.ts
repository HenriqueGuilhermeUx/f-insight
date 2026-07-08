const API_URL = import.meta.env.VITE_API_URL || 'https://f-insight-api.onrender.com';

export const API_ENDPOINTS = {
  baseUrl: API_URL,
  stocks: {
    brazil: `${API_URL}/api/stocks/brazil`,
    us: `${API_URL}/api/stocks/us`,
    indices: `${API_URL}/api/stocks/indices`,
    candles: (symbol: string) => `${API_URL}/api/stocks/candles/${symbol}`,
    fundamentals: (symbol: string) => `${API_URL}/api/stocks/fundamentals/${symbol}`
  },
  crypto: {
    list: `${API_URL}/api/crypto/list`,
    details: (id: string) => `${API_URL}/api/crypto/${id}`,
    history: (id: string) => `${API_URL}/api/crypto/${id}/history`
  },
  news: {
    list: `${API_URL}/api/news`,
    stock: (symbol: string) => `${API_URL}/api/news/stock/${symbol}`,
    sentiment: (symbol: string) => `${API_URL}/api/news/sentiment/${symbol}`
  },
  live: {
    status: `${API_URL}/api/live/status`,
    indicators: `${API_URL}/api/live/indicators`,
    refresh: `${API_URL}/api/live/refresh`,
    refreshNews: `${API_URL}/api/live/refresh/news`,
    refreshIndicators: `${API_URL}/api/live/refresh/indicators`,
    refreshMacro: `${API_URL}/api/live/refresh/macro`
  },
  billing: {
    plans: `${API_URL}/api/billing/plans`,
    checkout: `${API_URL}/api/billing/checkout`,
    invoice: (correlationId: string) => `${API_URL}/api/billing/invoice/${correlationId}`
  },
  macro: {
    overview: `${API_URL}/api/macro/overview`,
    refresh: `${API_URL}/api/macro/refresh`
  },
  signals: {
    active: `${API_URL}/api/signals/active`,
    byTicker: (symbol: string) => `${API_URL}/api/signals/by-ticker/${symbol}`
  },
  tenants: {
    current: `${API_URL}/api/tenants/current`,
    byId: (tenantId: string) => `${API_URL}/api/tenants/${tenantId}`
  },
  reports: {
    valuation: (symbol: string) => `${API_URL}/api/reports/valuation/${symbol}.pdf`
  },
  indicators: (symbol: string) => `${API_URL}/api/indicators/${symbol}`,
  watchlist: (userId: string) => `${API_URL}/api/watchlist/${userId}`,
  alerts: (userId: string) => `${API_URL}/api/alerts/${userId}`
};

export default API_ENDPOINTS;
