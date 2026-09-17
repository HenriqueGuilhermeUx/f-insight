import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { WatchlistItem, Asset } from '@/types';
import { addWatchlistAsset, fetchWatchlist, removeWatchlistAsset } from '@/services/userPreferencesApi';

interface AppStore {
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;

  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;

  selectedMarket: 'br' | 'us' | 'crypto';
  setSelectedMarket: (market: 'br' | 'us' | 'crypto') => void;

  searchQuery: string;
  setSearchQuery: (query: string) => void;

  watchlist: WatchlistItem[];
  addToWatchlist: (asset: Asset) => void;
  removeFromWatchlist: (ticker: string) => void;
  isInWatchlist: (ticker: string) => boolean;
  setWatchlist: (items: WatchlistItem[]) => void;
  hydrateRemoteWatchlist: (userId?: string) => Promise<void>;
}

const demoWatchlist: WatchlistItem[] = [
  { ticker: 'PETR4', name: 'Petrobras PN', addedAt: Date.now() - 86400000 },
  { ticker: 'BTC', name: 'Bitcoin', addedAt: Date.now() - 172800000 },
  { ticker: 'AAPL', name: 'Apple Inc.', addedAt: Date.now() - 259200000 },
];

function storedUserId() {
  if (typeof window === 'undefined') return '';
  try {
    const raw = localStorage.getItem('f-insight-auth-user');
    if (!raw) return '';
    const parsed = JSON.parse(raw) as { id?: string };
    return String(parsed.id || '');
  } catch {
    return '';
  }
}

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),

      sidebarOpen: true,
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

      selectedMarket: 'br',
      setSelectedMarket: (market) => set({ selectedMarket: market }),

      searchQuery: '',
      setSearchQuery: (query) => set({ searchQuery: query }),

      watchlist: demoWatchlist,
      setWatchlist: (items) => set({ watchlist: items }),
      hydrateRemoteWatchlist: async (explicitUserId) => {
        const userId = explicitUserId || storedUserId();
        if (!userId) return;
        try {
          const remote = await fetchWatchlist(userId);
          set({ watchlist: remote });
        } catch {
          // Mantém o cache local quando a API estiver indisponível.
        }
      },
      addToWatchlist: (asset) => {
        const exists = get().watchlist.some((w) => w.ticker === asset.ticker);
        if (exists) return;

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

        const userId = storedUserId();
        if (userId) {
          void addWatchlistAsset(userId, asset)
            .then((result) => {
              if (result?.watchlist) set({ watchlist: result.watchlist });
            })
            .catch(() => undefined);
        }
      },
      removeFromWatchlist: (ticker) => {
        set((state) => ({
          watchlist: state.watchlist.filter((w) => w.ticker !== ticker),
        }));

        const userId = storedUserId();
        if (userId) {
          void removeWatchlistAsset(userId, ticker)
            .then((result) => {
              if (result?.watchlist) set({ watchlist: result.watchlist });
            })
            .catch(() => undefined);
        }
      },
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
