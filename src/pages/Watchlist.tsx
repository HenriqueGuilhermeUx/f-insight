import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Trash2,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Search,
  ChevronRight,
  AlertCircle,
  BarChart3,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, formatPercent, getChangeColor, getChangeBgColor } from '@/lib/utils';
import { fetchAssetByTicker, mockData } from '@/services/marketData';
import { useAppStore } from '@/hooks/useStore';
import { Layout } from '@/components/layout/Layout';
import { Asset, WatchlistItem } from '@/types';

function WatchlistRow({ item, onRemove }: { item: WatchlistItem; onRemove: (ticker: string) => void }) {
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAsset = async () => {
      try {
        const data = await fetchAssetByTicker(item.ticker);
        setAsset(data);
      } catch (e) {
        // Find in mock data
        const allAssets = [
          ...mockData.stocks.br,
          ...mockData.stocks.us,
          ...mockData.crypto,
        ];
        const found = allAssets.find(a => a.ticker === item.ticker);
        setAsset(found || null);
      } finally {
        setLoading(false);
      }
    };
    loadAsset();
  }, [item.ticker]);

  if (loading) {
    return (
      <tr className="border-b border-slate-800/50">
        <td className="py-4 px-4"><div className="h-8 w-24 skeleton" /></td>
        <td className="py-4 px-4"><div className="h-5 w-20 skeleton" /></td>
        <td className="py-4 px-4"><div className="h-5 w-24 skeleton ml-auto" /></td>
        <td className="py-4 px-4"><div className="h-5 w-16 skeleton ml-auto" /></td>
        <td className="py-4 px-4"><div className="h-8 w-8 skeleton ml-auto" /></td>
      </tr>
    );
  }

  if (!asset) {
    return (
      <tr className="border-b border-slate-800/50">
        <td className="py-4 px-4">
          <div className="flex items-center gap-3">
            <span className="font-mono font-bold text-cyan-400">{item.ticker}</span>
            <span className="text-xs text-slate-400">{item.name}</span>
          </div>
        </td>
        <td colSpan={3} className="py-4 px-4 text-slate-500 text-sm">
          Ativo não encontrado
        </td>
        <td className="py-4 px-4">
          <button
            onClick={() => onRemove(item.ticker)}
            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </td>
      </tr>
    );
  }

  const isPositive = asset.changePercent >= 0;

  return (
    <tr className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
      <td className="py-4 px-4">
        <Link to={`/ativo/${asset.ticker}`} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
            <span className="font-bold text-cyan-400 text-xs">{asset.ticker.slice(0, 3)}</span>
          </div>
          <div>
            <p className="font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
              {asset.ticker}
            </p>
            <p className="text-xs text-slate-400">{asset.name}</p>
          </div>
        </Link>
      </td>
      <td className="py-4 px-4">
        <span className={cn(
          'text-xs px-2 py-0.5 rounded',
          asset.type === 'stock' ? 'bg-blue-500/20 text-blue-400' :
          asset.type === 'crypto' ? 'bg-orange-500/20 text-orange-400' :
          'bg-slate-500/20 text-slate-400'
        )}>
          {asset.type.toUpperCase()}
        </span>
      </td>
      <td className="py-4 px-4 text-right">
        <p className="font-mono font-bold text-white">{formatPrice(asset.price, asset.currency)}</p>
      </td>
      <td className="py-4 px-4 text-right">
        <span className={cn(
          'font-mono text-sm px-2 py-1 rounded',
          isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        )}>
          {formatPercent(asset.changePercent)}
        </span>
      </td>
      <td className="py-4 px-4">
        <button
          onClick={() => onRemove(item.ticker)}
          className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </td>
    </tr>
  );
}

export default function Watchlist() {
  const { watchlist, removeFromWatchlist, addToWatchlist } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Asset[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);

  // Simulated search
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const q = searchQuery.toLowerCase();
    const allAssets = [
      ...mockData.stocks.br,
      ...mockData.stocks.us,
      ...mockData.crypto,
      ...mockData.etfs,
      ...mockData.fiis,
    ];
    const filtered = allAssets.filter(a =>
      a.ticker.toLowerCase().includes(q) ||
      a.name.toLowerCase().includes(q)
    ).slice(0, 10);

    setSearchResults(filtered);
  }, [searchQuery]);

  const handleRemove = (ticker: string) => {
    removeFromWatchlist(ticker);
  };

  const handleAddAsset = (asset: Asset) => {
    addToWatchlist(asset);
    setSearchQuery('');
    setShowAddModal(false);
  };

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Star className="w-6 h-6 text-amber-400" />
            Minha Watchlist
          </h1>
          <p className="text-slate-400 mt-1">
            Acompanhe seus ativos favoritos
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Adicionar
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
          <p className="text-xs text-slate-400 mb-1">Total de Ativos</p>
          <p className="text-2xl font-bold text-white">{watchlist.length}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
          <p className="text-xs text-slate-400 mb-1">Ações</p>
          <p className="text-2xl font-bold text-cyan-400">
            {watchlist.filter(w =>
              mockData.stocks.br.some(a => a.ticker === w.ticker) ||
              mockData.stocks.us.some(a => a.ticker === w.ticker)
            ).length}
          </p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
          <p className="text-xs text-slate-400 mb-1">Criptos</p>
          <p className="text-2xl font-bold text-orange-400">
            {watchlist.filter(w => mockData.crypto.some(a => a.ticker === w.ticker)).length}
          </p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
          <p className="text-xs text-slate-400 mb-1">ETFs/FIIs</p>
          <p className="text-2xl font-bold text-purple-400">
            {watchlist.filter(w =>
              mockData.etfs.some(a => a.ticker === w.ticker) ||
              mockData.fiis.some(a => a.ticker === w.ticker)
            ).length}
          </p>
        </div>
      </div>

      {/* Watchlist Table */}
      {watchlist.length === 0 ? (
        <div className="bg-slate-800/40 rounded-xl border border-slate-700/40 p-12 text-center">
          <Star className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Sua watchlist está vazia</h3>
          <p className="text-slate-400 mb-6">
            Adicione ativos para acompanhar seus preços e variações
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Adicionar Ativos
          </button>
        </div>
      ) : (
        <div className="bg-slate-800/40 rounded-xl border border-slate-700/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50 text-left text-xs text-slate-400 uppercase tracking-wider">
                  <th className="py-3 px-4 font-medium">Ativo</th>
                  <th className="py-3 px-4 font-medium">Tipo</th>
                  <th className="py-3 px-4 font-medium text-right">Preço</th>
                  <th className="py-3 px-4 font-medium text-right">Variação</th>
                  <th className="py-3 px-4 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {watchlist.map((item) => (
                  <WatchlistRow key={item.ticker} item={item} onRemove={handleRemove} />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-700/50 w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Adicionar à Watchlist</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Buscar por ticker ou nome..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
                  autoFocus
                />
              </div>
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {searchQuery.length < 2 ? (
                  <p className="text-center text-slate-500 py-4">
                    Digite pelo menos 2 caracteres para buscar
                  </p>
                ) : searchResults.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">
                    Nenhum ativo encontrado
                  </p>
                ) : (
                  searchResults.map((asset) => {
                    const isPositive = asset.changePercent >= 0;
                    return (
                      <button
                        key={asset.ticker}
                        onClick={() => handleAddAsset(asset)}
                        className="w-full flex items-center justify-between p-3 bg-slate-800/50 hover:bg-slate-800 rounded-xl transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
                            <span className="text-xs font-bold text-cyan-400">{asset.ticker.slice(0, 3)}</span>
                          </div>
                          <div className="text-left">
                            <p className="font-mono font-bold text-cyan-400">{asset.ticker}</p>
                            <p className="text-xs text-slate-400">{asset.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-white">{formatPrice(asset.price, asset.currency)}</p>
                          <span className={cn(
                            'text-xs font-mono',
                            isPositive ? 'text-emerald-400' : 'text-red-400'
                          )}>
                            {formatPercent(asset.changePercent)}
                          </span>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/radar"
          className="bg-slate-800/40 hover:bg-slate-800/70 rounded-xl p-4 border border-slate-700/40 transition-all flex items-center gap-3"
        >
          <Search className="w-5 h-5 text-cyan-400" />
          <div>
            <p className="font-semibold text-white">Explorar Ativos</p>
            <p className="text-xs text-slate-400">Busque novos ativos</p>
          </div>
        </Link>
        <Link
          to="/alertas"
          className="bg-slate-800/40 hover:bg-slate-800/70 rounded-xl p-4 border border-slate-700/40 transition-all flex items-center gap-3"
        >
          <BarChart3 className="w-5 h-5 text-amber-400" />
          <div>
            <p className="font-semibold text-white">Configurar Alertas</p>
            <p className="text-xs text-slate-400">Receba notificações de preço</p>
          </div>
        </Link>
        <Link
          to="/analises"
          className="bg-slate-800/40 hover:bg-slate-800/70 rounded-xl p-4 border border-slate-700/40 transition-all flex items-center gap-3"
        >
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          <div>
            <p className="font-semibold text-white">Ver Análises</p>
            <p className="text-xs text-slate-400">Análises Graham e valuation</p>
          </div>
        </Link>
      </div>
    </Layout>
  );
}