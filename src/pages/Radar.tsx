import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ChevronDown,
  Star,
  Plus,
  SlidersHorizontal,
  X,
  Grid,
  List,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, formatPercent, formatLargeNumber, getChangeColor, getChangeBgColor, debounce, getAssetTypeLabel } from '@/lib/utils';
import { fetchAssets, searchAssets, mockData } from '@/services/marketData';
import { useAppStore } from '@/hooks/useStore';
import { Layout } from '@/components/layout/Layout';
import { Asset } from '@/types';

type MarketFilter = 'br' | 'us' | 'crypto';
type TypeFilter = 'all' | 'stock' | 'etf' | 'fii' | 'bdr' | 'crypto';
type SortBy = 'ticker' | 'change' | 'volume' | 'price' | 'marketCap' | 'pe' | 'dy';
type ViewMode = 'grid' | 'list';

function AssetRow({ asset, onAddToWatchlist }: { asset: Asset; onAddToWatchlist: (asset: Asset) => void }) {
  const isPositive = asset.changePercent >= 0;
  const { isInWatchlist, removeFromWatchlist } = useAppStore();
  const inWatchlist = isInWatchlist(asset.ticker);

  return (
    <tr className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
      <td className="py-3 px-4">
        <Link to={`/ativo/${asset.ticker}`} className="flex items-center gap-3 group">
          <div className="w-8 h-8 bg-slate-700/50 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-cyan-400">{asset.ticker.slice(0, 2)}</span>
          </div>
          <div>
            <p className="font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
              {asset.ticker}
            </p>
            <p className="text-xs text-slate-400 truncate max-w-[150px]">{asset.name}</p>
          </div>
        </Link>
      </td>
      <td className="py-3 px-4">
        <span className={cn(
          'text-xs px-2 py-0.5 rounded',
          asset.type === 'stock' ? 'bg-blue-500/20 text-blue-400' :
          asset.type === 'etf' ? 'bg-purple-500/20 text-purple-400' :
          asset.type === 'fii' ? 'bg-amber-500/20 text-amber-400' :
          asset.type === 'crypto' ? 'bg-orange-500/20 text-orange-400' :
          'bg-slate-500/20 text-slate-400'
        )}>
          {getAssetTypeLabel(asset.type)}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <p className="font-mono font-bold text-white">{formatPrice(asset.price, asset.currency)}</p>
      </td>
      <td className="py-3 px-4 text-right">
        <span className={cn('font-mono text-sm', getChangeColor(asset.change))}>
          {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <span className={cn(
          'font-mono text-sm px-2 py-0.5 rounded',
          isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        )}>
          {formatPercent(asset.changePercent)}
        </span>
      </td>
      <td className="py-3 px-4 text-right">
        <span className="text-slate-300 font-mono text-sm">
          {formatLargeNumber(asset.volume)}
        </span>
      </td>
      <td className="py-3 px-4">
        <button
          onClick={() => inWatchlist ? removeFromWatchlist(asset.ticker) : onAddToWatchlist(asset)}
          className={cn(
            'p-2 rounded-lg transition-all',
            inWatchlist
              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
              : 'bg-slate-800/50 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10'
          )}
        >
          <Star className={cn('w-4 h-4', inWatchlist && 'fill-current')} />
        </button>
      </td>
    </tr>
  );
}

function AssetCard({ asset, onAddToWatchlist }: { asset: Asset; onAddToWatchlist: (asset: Asset) => void }) {
  const isPositive = asset.changePercent >= 0;
  const { isInWatchlist, removeFromWatchlist } = useAppStore();
  const inWatchlist = isInWatchlist(asset.ticker);

  return (
    <Link
      to={`/ativo/${asset.ticker}`}
      className={cn(
        'bg-slate-800/40 hover:bg-slate-800/70 rounded-xl p-4 border border-slate-700/40 transition-all group',
        'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-cyan-400">{asset.ticker.slice(0, 3)}</span>
          </div>
          <div>
            <span className="font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
              {asset.ticker}
            </span>
            <p className="text-xs text-slate-400 truncate max-w-[100px]">{asset.name}</p>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            inWatchlist ? removeFromWatchlist(asset.ticker) : onAddToWatchlist(asset);
          }}
          className={cn(
            'p-1.5 rounded-lg transition-all',
            inWatchlist
              ? 'bg-amber-500/20 text-amber-400'
              : 'text-slate-500 hover:text-amber-400'
          )}
        >
          <Star className={cn('w-4 h-4', inWatchlist && 'fill-current')} />
        </button>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-xl font-bold font-mono text-white">
            {formatPrice(asset.price, asset.currency)}
          </p>
          <p className={cn('text-sm font-mono mt-1', getChangeColor(asset.change))}>
            {isPositive ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
            {' '}{asset.change.toFixed(2)}
          </p>
        </div>
        <span className={cn(
          'text-sm font-mono px-2 py-1 rounded-lg',
          isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        )}>
          {formatPercent(asset.changePercent)}
        </span>
      </div>
      <div className="mt-3 pt-3 border-t border-slate-700/30 flex items-center justify-between">
        <span className="text-xs text-slate-500">Vol: {formatLargeNumber(asset.volume)}</span>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded',
          asset.type === 'stock' ? 'bg-blue-500/20 text-blue-400' :
          asset.type === 'etf' ? 'bg-purple-500/20 text-purple-400' :
          asset.type === 'fii' ? 'bg-amber-500/20 text-amber-400' :
          asset.type === 'crypto' ? 'bg-orange-500/20 text-orange-400' :
          'bg-slate-500/20 text-slate-400'
        )}>
          {getAssetTypeLabel(asset.type)}
        </span>
      </div>
    </Link>
  );
}

export default function Radar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [marketFilter, setMarketFilter] = useState<MarketFilter>('br');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('ticker');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');

  const { addToWatchlist } = useAppStore();

  useEffect(() => {
    const loadAssets = async () => {
      setLoading(true);
      try {
        const data = await fetchAssets(marketFilter);
        setAssets(data);
      } catch (e) {
        // Use mock data on error
        const allAssets = marketFilter === 'br'
          ? [...mockData.stocks.br, ...mockData.etfs, ...mockData.fiis]
          : marketFilter === 'us'
          ? mockData.stocks.us
          : mockData.crypto;
        setAssets(allAssets);
      } finally {
        setLoading(false);
      }
    };
    loadAssets();
  }, [marketFilter]);

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    let result = [...assets];

    // Apply search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(a =>
        a.ticker.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q)
      );
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      result = result.filter(a => a.type === typeFilter);
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'ticker':
          comparison = a.ticker.localeCompare(b.ticker);
          break;
        case 'change':
          comparison = b.changePercent - a.changePercent;
          break;
        case 'volume':
          comparison = b.volume - a.volume;
          break;
        case 'price':
          comparison = b.price - a.price;
          break;
        case 'marketCap':
          comparison = (b.marketCap || 0) - (a.marketCap || 0);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [assets, searchQuery, typeFilter, sortBy, sortOrder]);

  const handleAddToWatchlist = (asset: Asset) => {
    addToWatchlist(asset);
  };

  return (
    <Layout>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Radar de Ativos</h1>
        <p className="text-slate-400">Busque e filtre ativos por mercado, tipo e critérios</p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por ticker ou nome..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Market Tabs */}
        <div className="flex gap-2">
          {(['br', 'us', 'crypto'] as const).map((market) => (
            <button
              key={market}
              onClick={() => setMarketFilter(market)}
              className={cn(
                'px-4 py-2 rounded-lg font-medium text-sm transition-all',
                marketFilter === market
                  ? 'bg-primary text-white'
                  : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              {market === 'br' ? '🇧🇷 Brasil' : market === 'us' ? '🇺🇸 EUA' : '₿ Cripto'}
            </button>
          ))}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all',
            showFilters
              ? 'bg-slate-700 text-white'
              : 'bg-slate-800/50 text-slate-400 hover:text-white'
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
        </button>

        {/* View Toggle */}
        <div className="flex gap-1 bg-slate-800/50 rounded-lg p-1">
          <button
            onClick={() => setViewMode('grid')}
            className={cn(
              'p-2 rounded transition-colors',
              viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            <Grid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'p-2 rounded transition-colors',
              viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
            )}
          >
            <List className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div className="bg-slate-800/50 rounded-xl p-4 mb-6 border border-slate-700/40 animate-fade-in">
          <div className="flex flex-wrap gap-6">
            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Tipo</label>
              <div className="flex flex-wrap gap-2">
                {(['all', 'stock', 'etf', 'fii', 'crypto'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setTypeFilter(type)}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-medium transition-all',
                      typeFilter === type
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'bg-slate-700/50 text-slate-400 hover:text-white'
                    )}
                  >
                    {type === 'all' ? 'Todos' : getAssetTypeLabel(type)}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2">Ordenar por</label>
              <div className="flex gap-2">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortBy)}
                  className="bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-primary/50"
                >
                  <option value="ticker">Ticker</option>
                  <option value="change">Variação</option>
                  <option value="volume">Volume</option>
                  <option value="price">Preço</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  className="p-2 bg-slate-700/50 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-slate-400">
          {loading ? 'Carregando...' : `${filteredAssets.length} ativos encontrados`}
        </p>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="text-sm text-cyan-400 hover:text-cyan-300"
          >
            Limpar busca
          </button>
        )}
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-slate-800/40 rounded-xl p-4 h-48 skeleton" />
            ))
          ) : filteredAssets.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Search className="w-12 h-12 mx-auto text-slate-600 mb-4" />
              <p className="text-slate-400">Nenhum ativo encontrado</p>
              <p className="text-sm text-slate-500 mt-2">Tente ajustar os filtros ou buscar outro termo</p>
            </div>
          ) : (
            filteredAssets.map((asset) => (
              <AssetCard key={asset.ticker} asset={asset} onAddToWatchlist={handleAddToWatchlist} />
            ))
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-slate-800/40 rounded-xl border border-slate-700/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50 text-left text-xs text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Ativo</th>
                  <th className="py-3 px-4 font-medium">Tipo</th>
                  <th className="py-3 px-4 font-medium text-right">Preço</th>
                  <th className="py-3 px-4 font-medium text-right">Variação</th>
                  <th className="py-3 px-4 font-medium text-right">%</th>
                  <th className="py-3 px-4 font-medium text-right">Volume</th>
                  <th className="py-3 px-4 font-medium w-12"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="border-b border-slate-800/50">
                      <td className="py-3 px-4"><div className="h-8 w-32 skeleton" /></td>
                      <td className="py-3 px-4"><div className="h-5 w-16 skeleton" /></td>
                      <td className="py-3 px-4"><div className="h-5 w-20 skeleton ml-auto" /></td>
                      <td className="py-3 px-4"><div className="h-5 w-16 skeleton ml-auto" /></td>
                      <td className="py-3 px-4"><div className="h-5 w-16 skeleton ml-auto" /></td>
                      <td className="py-3 px-4"><div className="h-5 w-16 skeleton ml-auto" /></td>
                      <td className="py-3 px-4"><div className="h-8 w-8 skeleton" /></td>
                    </tr>
                  ))
                ) : filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400">
                      Nenhum ativo encontrado
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset) => (
                    <AssetRow key={asset.ticker} asset={asset} onAddToWatchlist={handleAddToWatchlist} />
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </Layout>
  );
}