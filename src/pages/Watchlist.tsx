import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  Bell,
  Loader2,
  Plus,
  Search,
  Star,
  Trash2,
  Wifi,
  X,
} from 'lucide-react';
import { cn, formatPercent, formatPrice, getAssetTypeLabel } from '@/lib/utils';
import { Layout } from '@/components/layout/Layout';
import { useAppStore } from '@/hooks/useStore';
import {
  catalogEntry,
  fetchLiveAssetSnapshots,
  searchAssetCatalog,
  watchlistAssetInput,
  type LiveAssetSnapshot,
} from '@/services/liveMarket';

export default function Watchlist() {
  const { watchlist, removeFromWatchlist, addToWatchlist } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [snapshots, setSnapshots] = useState<Record<string, LiveAssetSnapshot>>({});

  const tickerKey = useMemo(
    () => watchlist.map((item) => item.ticker.toUpperCase()).sort().join('|'),
    [watchlist],
  );

  useEffect(() => {
    let active = true;

    async function load() {
      if (!tickerKey) {
        setSnapshots({});
        setSource('');
        setUpdatedAt(null);
        return;
      }

      setLoading(true);
      try {
        const result = await fetchLiveAssetSnapshots(tickerKey.split('|'));
        if (!active) return;
        setSnapshots(
          Object.fromEntries(result.snapshots.map((snapshot) => [snapshot.asset.ticker, snapshot])),
        );
        setSource(result.source);
        setUpdatedAt(result.updatedAt);
      } catch {
        if (!active) return;
        setSnapshots({});
        setSource('indisponível');
        setUpdatedAt(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [tickerKey]);

  const searchResults = useMemo(() => searchAssetCatalog(searchQuery), [searchQuery]);

  const liveCount = Object.values(snapshots).filter((item) => item.dataAvailable).length;
  const stockCount = watchlist.filter((item) => catalogEntry(item.ticker)?.type === 'stock').length;
  const alternativeCount = watchlist.filter((item) => {
    const type = catalogEntry(item.ticker)?.type;
    return type === 'crypto' || type === 'etf' || type === 'fii';
  }).length;

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-white">
            <Star className="h-6 w-6 text-amber-400" />
            Minha Watchlist
          </h1>
          <p className="mt-1 text-slate-400">
            Acompanhe preços e variações sem dados de demonstração misturados ao mercado real.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-white transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Adicionar
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4">
          <p className="mb-1 text-xs text-slate-400">Ativos acompanhados</p>
          <p className="text-2xl font-bold text-white">{watchlist.length}</p>
        </div>
        <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4">
          <p className="mb-1 text-xs text-slate-400">Com cotação disponível</p>
          <p className="text-2xl font-bold text-emerald-400">{liveCount}</p>
        </div>
        <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4">
          <p className="mb-1 text-xs text-slate-400">Ações</p>
          <p className="text-2xl font-bold text-cyan-400">{stockCount}</p>
        </div>
        <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4">
          <p className="mb-1 text-xs text-slate-400">Cripto / ETF / FII</p>
          <p className="text-2xl font-bold text-purple-400">{alternativeCount}</p>
        </div>
      </div>

      {watchlist.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-900/60 px-3 py-1.5">
            {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wifi className="h-3.5 w-3.5" />}
            {loading ? 'Atualizando mercado...' : `Fonte: ${source || 'API F-Insight'}`}
          </span>
          {updatedAt && (
            <span>
              Atualizado em {new Date(updatedAt).toLocaleString('pt-BR')}
            </span>
          )}
        </div>
      )}

      {watchlist.length === 0 ? (
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-12 text-center">
          <Star className="mx-auto mb-4 h-16 w-16 text-slate-600" />
          <h3 className="mb-2 text-xl font-bold text-white">Sua watchlist está vazia</h3>
          <p className="mb-6 text-slate-400">
            Adicione ativos para acompanhar o mercado com persistência na sua conta.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="rounded-xl bg-primary px-6 py-3 font-bold text-white transition hover:bg-primary/90"
          >
            <Plus className="mr-2 inline h-4 w-4" />
            Adicionar ativo
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-800/40">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3 font-medium">Ativo</th>
                  <th className="px-4 py-3 font-medium">Tipo</th>
                  <th className="px-4 py-3 text-right font-medium">Preço</th>
                  <th className="px-4 py-3 text-right font-medium">Variação</th>
                  <th className="px-4 py-3 text-right font-medium">Fonte</th>
                  <th className="w-16 px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {watchlist.map((item) => {
                  const snapshot = snapshots[item.ticker.toUpperCase()];
                  const meta = catalogEntry(item.ticker);
                  const asset = snapshot?.asset;
                  const available = Boolean(snapshot?.dataAvailable && asset);
                  const isPositive = (asset?.changePercent || 0) >= 0;

                  return (
                    <tr key={item.ticker} className="border-b border-slate-800/50 transition hover:bg-slate-800/30">
                      <td className="px-4 py-4">
                        <Link to={`/ativo/${item.ticker}`} className="group flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-700/50">
                            <span className="text-xs font-bold text-cyan-400">{item.ticker.slice(0, 3)}</span>
                          </div>
                          <div>
                            <p className="font-mono font-bold text-cyan-400 group-hover:text-cyan-300">{item.ticker}</p>
                            <p className="text-xs text-slate-400">{item.name}</p>
                          </div>
                        </Link>
                      </td>
                      <td className="px-4 py-4">
                        <span className="rounded bg-slate-700/60 px-2 py-1 text-xs text-slate-300">
                          {meta ? getAssetTypeLabel(meta.type) : 'Ativo'}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right font-mono font-bold text-white">
                        {available && asset ? formatPrice(asset.price, asset.currency) : '—'}
                      </td>
                      <td className="px-4 py-4 text-right">
                        {available && asset ? (
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 rounded px-2 py-1 font-mono text-sm',
                              isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400',
                            )}
                          >
                            {isPositive ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                            {formatPercent(asset.changePercent)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-500">indisponível</span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-right text-xs text-slate-500">
                        {snapshot?.provider || '—'}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => removeFromWatchlist(item.ticker)}
                          aria-label={`Remover ${item.ticker}`}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        <Link to="/radar" className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 transition hover:bg-slate-800/70">
          <Search className="mb-2 h-5 w-5 text-cyan-400" />
          <p className="font-semibold text-white">Explorar mercado</p>
          <p className="mt-1 text-xs text-slate-400">Adicione ativos a partir do Radar.</p>
        </Link>
        <Link to="/alertas" className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 transition hover:bg-slate-800/70">
          <Bell className="mb-2 h-5 w-5 text-amber-400" />
          <p className="font-semibold text-white">Configurar alertas</p>
          <p className="mt-1 text-xs text-slate-400">Acompanhe condições de preço e variação.</p>
        </Link>
        <Link to="/ia-financeira" className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4 transition hover:bg-slate-800/70">
          <Wifi className="mb-2 h-5 w-5 text-emerald-400" />
          <p className="font-semibold text-white">Levar ao Radar IA</p>
          <p className="mt-1 text-xs text-slate-400">Organize hipóteses, riscos e próximos estudos.</p>
        </Link>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <div>
                <h3 className="text-lg font-bold text-white">Adicionar à Watchlist</h3>
                <p className="text-xs text-slate-500">A busca usa um catálogo de símbolos; a cotação vem da API ao vivo.</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4">
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder="Ticker ou nome..."
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 py-3 pl-10 pr-4 text-white outline-none placeholder:text-slate-500 focus:border-primary/50"
                  autoFocus
                />
              </div>

              <div className="max-h-80 space-y-2 overflow-y-auto">
                {searchQuery.trim().length < 2 ? (
                  <p className="py-6 text-center text-sm text-slate-500">Digite pelo menos 2 caracteres.</p>
                ) : searchResults.length === 0 ? (
                  <p className="py-6 text-center text-sm text-slate-500">Nenhum ativo no catálogo atual.</p>
                ) : (
                  searchResults.map((entry) => (
                    <button
                      key={entry.ticker}
                      onClick={() => {
                        addToWatchlist(watchlistAssetInput(entry));
                        setSearchQuery('');
                        setShowAddModal(false);
                      }}
                      className="flex w-full items-center justify-between rounded-xl bg-slate-800/50 p-3 text-left transition hover:bg-slate-800"
                    >
                      <div>
                        <p className="font-mono font-bold text-cyan-400">{entry.ticker}</p>
                        <p className="text-xs text-slate-400">{entry.name}</p>
                      </div>
                      <span className="rounded bg-slate-700/60 px-2 py-1 text-xs text-slate-300">{getAssetTypeLabel(entry.type)}</span>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-700/40 bg-slate-800/30 p-4 text-xs leading-relaxed text-slate-400">
        Cotações são informativas e podem ter atraso ou indisponibilidade temporária. O F-Insight não executa ordens nem transforma variação de preço em recomendação de investimento.
      </div>
    </Layout>
  );
}
