import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowDownRight,
  ArrowUpRight,
  Grid,
  List,
  Loader2,
  RefreshCcw,
  Search,
  Star,
  Wifi,
} from 'lucide-react';
import { cn, formatLargeNumber, formatPercent, formatPrice, getAssetTypeLabel } from '@/lib/utils';
import { Layout } from '@/components/layout/Layout';
import { useAppStore } from '@/hooks/useStore';
import {
  fetchLiveAssetsByMarket,
  type LiveAssetSnapshot,
  type MarketGroup,
} from '@/services/liveMarket';
import type { Asset } from '@/types';

type TypeFilter = 'all' | Asset['type'];
type SortBy = 'ticker' | 'change' | 'volume' | 'price';
type ViewMode = 'grid' | 'list';

function AssetRow({ snapshot }: { snapshot: LiveAssetSnapshot }) {
  const asset = snapshot.asset;
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useAppStore();
  const inWatchlist = isInWatchlist(asset.ticker);
  const up = asset.changePercent >= 0;

  return (
    <tr className="border-b border-slate-800/50 transition hover:bg-slate-800/30">
      <td className="px-4 py-3">
        <Link to={`/ativo/${asset.ticker}`} className="group flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-700/50">
            <span className="text-xs font-bold text-cyan-400">{asset.ticker.slice(0, 3)}</span>
          </div>
          <div>
            <p className="font-mono font-bold text-cyan-400 group-hover:text-cyan-300">{asset.ticker}</p>
            <p className="max-w-[180px] truncate text-xs text-slate-400">{asset.name}</p>
          </div>
        </Link>
      </td>
      <td className="px-4 py-3">
        <span className="rounded bg-slate-700/60 px-2 py-1 text-xs text-slate-300">{getAssetTypeLabel(asset.type)}</span>
      </td>
      <td className="px-4 py-3 text-right font-mono font-bold text-white">{formatPrice(asset.price, asset.currency)}</td>
      <td className="px-4 py-3 text-right">
        <span className={cn('inline-flex items-center gap-1 font-mono text-sm', up ? 'text-emerald-400' : 'text-red-400')}>
          {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {formatPercent(asset.changePercent)}
        </span>
      </td>
      <td className="px-4 py-3 text-right text-sm text-slate-300">{formatLargeNumber(asset.volume)}</td>
      <td className="px-4 py-3 text-right text-xs text-slate-500">{snapshot.provider || '—'}</td>
      <td className="px-4 py-3 text-right">
        <button
          onClick={() => inWatchlist ? removeFromWatchlist(asset.ticker) : addToWatchlist(asset)}
          aria-label={inWatchlist ? `Remover ${asset.ticker} da watchlist` : `Adicionar ${asset.ticker} à watchlist`}
          className={cn('rounded-lg p-2 transition', inWatchlist ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:bg-amber-500/10 hover:text-amber-400')}
        >
          <Star className={cn('h-4 w-4', inWatchlist && 'fill-current')} />
        </button>
      </td>
    </tr>
  );
}

function AssetCard({ snapshot }: { snapshot: LiveAssetSnapshot }) {
  const asset = snapshot.asset;
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useAppStore();
  const inWatchlist = isInWatchlist(asset.ticker);
  const up = asset.changePercent >= 0;

  return (
    <Link to={`/ativo/${asset.ticker}`} className="group rounded-2xl border border-slate-700/40 bg-slate-800/40 p-4 transition hover:border-primary/30 hover:bg-slate-800/70">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-lg font-black text-cyan-400 group-hover:text-cyan-300">{asset.ticker}</p>
          <p className="text-xs text-slate-400">{asset.name}</p>
        </div>
        <button
          onClick={(event) => {
            event.preventDefault();
            inWatchlist ? removeFromWatchlist(asset.ticker) : addToWatchlist(asset);
          }}
          className={cn('rounded-lg p-2 transition', inWatchlist ? 'bg-amber-500/20 text-amber-400' : 'text-slate-500 hover:text-amber-400')}
        >
          <Star className={cn('h-4 w-4', inWatchlist && 'fill-current')} />
        </button>
      </div>

      <p className="font-mono text-2xl font-black text-white">{formatPrice(asset.price, asset.currency)}</p>
      <div className="mt-2 flex items-center justify-between gap-3">
        <span className={cn('inline-flex items-center gap-1 font-mono text-sm', up ? 'text-emerald-400' : 'text-red-400')}>
          {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {formatPercent(asset.changePercent)}
        </span>
        <span className="rounded bg-slate-700/60 px-2 py-1 text-xs text-slate-300">{getAssetTypeLabel(asset.type)}</span>
      </div>
      <div className="mt-4 flex items-center justify-between border-t border-slate-700/40 pt-3 text-xs text-slate-500">
        <span>Vol. {formatLargeNumber(asset.volume)}</span>
        <span>{snapshot.provider || 'API F-Insight'}</span>
      </div>
    </Link>
  );
}

export default function Radar() {
  const [market, setMarket] = useState<MarketGroup>('br');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('ticker');
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [snapshots, setSnapshots] = useState<LiveAssetSnapshot[]>([]);
  const [source, setSource] = useState('');
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  async function loadMarket() {
    setLoading(true);
    setError('');
    try {
      const result = await fetchLiveAssetsByMarket(market);
      setSnapshots(result.snapshots);
      setSource(result.source);
      setUpdatedAt(result.updatedAt);
      if (!result.snapshots.some((item) => item.dataAvailable)) {
        setError('Nenhuma cotação ficou disponível para este mercado agora.');
      }
    } catch {
      setSnapshots([]);
      setSource('indisponível');
      setUpdatedAt(null);
      setError('A API de mercado está temporariamente indisponível. Nenhum preço de demonstração será exibido como atual.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadMarket();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [market]);

  const available = useMemo(() => snapshots.filter((item) => item.dataAvailable), [snapshots]);
  const unavailableCount = snapshots.length - available.length;

  const filtered = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const rows = available.filter((snapshot) => {
      const asset = snapshot.asset;
      if (typeFilter !== 'all' && asset.type !== typeFilter) return false;
      if (!query) return true;
      return asset.ticker.toLowerCase().includes(query) || asset.name.toLowerCase().includes(query);
    });

    return [...rows].sort((a, b) => {
      const left = a.asset;
      const right = b.asset;
      if (sortBy === 'change') return right.changePercent - left.changePercent;
      if (sortBy === 'volume') return right.volume - left.volume;
      if (sortBy === 'price') return right.price - left.price;
      return left.ticker.localeCompare(right.ticker);
    });
  }, [available, searchQuery, typeFilter, sortBy]);

  const marketLabels: Record<MarketGroup, string> = {
    br: 'Brasil',
    us: 'Estados Unidos',
    crypto: 'Cripto',
  };

  return (
    <Layout>
      <section className="mb-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/10 via-slate-900/80 to-slate-950 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">
              <Wifi className="h-3.5 w-3.5" />
              Dados reais · sem preço demo
            </div>
            <h1 className="text-3xl font-black text-white lg:text-4xl">Radar de Ativos</h1>
            <p className="mt-2 max-w-3xl text-slate-400">
              Amostra curada de ativos com cotações vindas do backend F-Insight e persistidas no data hub.
            </p>
          </div>
          <button
            onClick={() => void loadMarket()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900/70 px-4 py-3 text-sm font-bold text-slate-200 transition hover:border-primary/40 disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Atualizar
          </button>
        </div>
      </section>

      <div className="mb-5 grid grid-cols-1 gap-3 lg:grid-cols-[auto_1fr_auto_auto]">
        <div className="flex gap-2 rounded-xl border border-slate-700/40 bg-slate-900/60 p-1">
          {(['br', 'us', 'crypto'] as MarketGroup[]).map((value) => (
            <button
              key={value}
              onClick={() => setMarket(value)}
              className={cn('rounded-lg px-4 py-2 text-sm font-bold transition', market === value ? 'bg-primary text-white' : 'text-slate-400 hover:text-white')}
            >
              {marketLabels[value]}
            </button>
          ))}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Filtrar por ticker ou nome..."
            className="w-full rounded-xl border border-slate-700/40 bg-slate-900/60 py-2.5 pl-10 pr-4 text-sm text-white outline-none placeholder:text-slate-500 focus:border-primary/40"
          />
        </div>

        <select
          value={sortBy}
          onChange={(event) => setSortBy(event.target.value as SortBy)}
          className="rounded-xl border border-slate-700/40 bg-slate-900/60 px-3 py-2.5 text-sm text-slate-300 outline-none"
        >
          <option value="ticker">Ticker</option>
          <option value="change">Variação</option>
          <option value="volume">Volume</option>
          <option value="price">Preço</option>
        </select>

        <div className="flex rounded-xl border border-slate-700/40 bg-slate-900/60 p-1">
          <button onClick={() => setViewMode('grid')} className={cn('rounded-lg p-2', viewMode === 'grid' ? 'bg-slate-700 text-white' : 'text-slate-500')} aria-label="Grade">
            <Grid className="h-4 w-4" />
          </button>
          <button onClick={() => setViewMode('list')} className={cn('rounded-lg p-2', viewMode === 'list' ? 'bg-slate-700 text-white' : 'text-slate-500')} aria-label="Lista">
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {(['all', 'stock', 'etf', 'fii', 'crypto'] as TypeFilter[]).map((value) => (
          <button
            key={value}
            onClick={() => setTypeFilter(value)}
            className={cn('rounded-full border px-3 py-1.5 text-xs font-bold transition', typeFilter === value ? 'border-primary/40 bg-primary/10 text-primary' : 'border-slate-700/40 text-slate-500 hover:text-slate-300')}
          >
            {value === 'all' ? 'Todos' : getAssetTypeLabel(value)}
          </button>
        ))}
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
        <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/40 bg-slate-900/50 px-3 py-1.5">
          <Wifi className="h-3.5 w-3.5" />
          Fonte: {source || 'API F-Insight'}
        </span>
        <span>{available.length} cotações disponíveis</span>
        {unavailableCount > 0 && <span>{unavailableCount} indisponíveis</span>}
        {updatedAt && <span>Atualizado em {new Date(updatedAt).toLocaleString('pt-BR')}</span>}
      </div>

      {loading ? (
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-16 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-slate-400">Consultando mercado...</p>
        </div>
      ) : error && available.length === 0 ? (
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-10 text-center">
          <p className="font-bold text-amber-100">Dados indisponíveis no momento</p>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-relaxed text-amber-100/70">{error}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-10 text-center text-slate-400">
          Nenhum ativo disponível para os filtros atuais.
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filtered.map((snapshot) => <AssetCard key={snapshot.asset.ticker} snapshot={snapshot} />)}
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-800/40">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Ativo</th>
                  <th className="px-4 py-3">Tipo</th>
                  <th className="px-4 py-3 text-right">Preço</th>
                  <th className="px-4 py-3 text-right">Variação</th>
                  <th className="px-4 py-3 text-right">Volume</th>
                  <th className="px-4 py-3 text-right">Fonte</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((snapshot) => <AssetRow key={snapshot.asset.ticker} snapshot={snapshot} />)}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-700/40 bg-slate-800/30 p-4 text-xs leading-relaxed text-slate-400">
        O Radar organiza uma amostra de mercado para estudo. Cotações podem ter atraso e disponibilidade variável. Nenhum destaque visual representa recomendação de compra ou venda.
      </div>
    </Layout>
  );
}
