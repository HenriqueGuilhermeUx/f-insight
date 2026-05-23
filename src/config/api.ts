const API_URL = import.meta.env.VITE_API_URL || 'https://f-insight-api.onrender.com';

export const API_ENDPOINTS = {
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
  indicators: (symbol: string) => `${API_URL}/api/indicators/${symbol}`,
  watchlist: (userId: string) => `${API_URL}/api/watchlist/${userId}`,
  alerts: (userId: string) => `${API_URL}/api/alerts/${userId}`
};

export default API_ENDPOINTS;