import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WatchlistItem, Asset } from '@/types';

interface AppStore {
  // Theme
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  // Market filter
  selectedMarket: 'br' | 'us' | 'crypto';
  setSelectedMarket: (market: 'br' | 'us' | 'crypto') => void;

  // Search
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Watchlist
  watchlist: WatchlistItem[];
  addToWatchlist: (asset: Asset) => void;
  removeFromWatchlist: (ticker: string) => void;
  isInWatchlist: (ticker: string) => boolean;
}

// Demo watchlist for initial state
const demoWatchlist: WatchlistItem[] = [
  { ticker: 'PETR4', name: 'Petrobras PN', addedAt: Date.now() - 86400000 },
  { ticker: 'BTC', name: 'Bitcoin', addedAt: Date.now() - 172800000 },
  { ticker: 'AAPL', name: 'Apple Inc.', addedAt: Date.now() - 259200000 },
];

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      // Theme
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      // Sidebar
      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      // Market
      selectedMarket: 'br',
      setSelectedMarket: (market) => set({ selectedMarket: market }),

      // Search
      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      // Watchlist
      watchlist: demoWatchlist,
      addToWatchlist: (asset) => {
        const exists = get().watchlist.some((w) => w.ticker === asset.ticker);
        if (!exists) {
          set((state) => ({
            watchlist: [
              ...state.watchlist,
              {
                ticker: asset.ticker,
                name: asset.name,
                addedAt: Date.now(),
              },
            ],
          }));
        }
      },
      removeFromWatchlist: (ticker) =>
        set((state) => ({
          watchlist: state.watchlist.filter((w) => w.ticker !== ticker),
        })),
      isInWatchlist: (ticker) => get().watchlist.some((w) => w.ticker === ticker),
    }),
    {
      name: 'invest-platform-storage',
      partialize: (state) => ({
        theme: state.theme,
        sidebarOpen: state.sidebarOpen,
        selectedMarket: state.selectedMarket,
        watchlist: state.watchlist,
      }),
    }
  )
);