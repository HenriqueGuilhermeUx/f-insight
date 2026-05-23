import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Bell,
  Share2,
  ExternalLink,
  RefreshCw,
  ChevronRight,
  Clock,
  DollarSign,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, formatPercent, formatLargeNumber, getChangeColor, getScoreColor, getGradeFromScore, getAssetTypeLabel } from '@/lib/utils';
import { fetchAssetByTicker, mockData } from '@/services/marketData';
import { useAppStore } from '@/hooks/useStore';
import { Layout } from '@/components/layout/Layout';
import { Asset } from '@/types';

function MetricCard({ label, value, subValue, trend }: { label: string; value: string; subValue?: string; trend?: 'up' | 'down' | 'neutral' }) {
  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      <p className="text-lg font-bold font-mono text-white">{value}</p>
      {subValue && (
        <p className={cn(
          'text-xs font-mono mt-1',
          trend === 'up' ? 'text-emerald-400' : trend === 'down' ? 'text-red-400' : 'text-slate-400'
        )}>
          {subValue}
        </p>
      )}
    </div>
  );
}

function TradingViewWidget() {
  // TradingView Lightweight Charts widget
  return (
    <div className="bg-slate-800/40 rounded-xl overflow-hidden border border-slate-700/40">
      <div className="p-4 border-b border-slate-700/40 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
          <span className="text-sm text-slate-400">Gráfico em Tempo Real</span>
        </div>
        <div className="flex gap-2">
          {['1D', '1S', '1M', '1A'].map((period) => (
            <button
              key={period}
              className={cn(
                'px-3 py-1 rounded text-xs font-medium transition-colors',
                period === '1M'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-slate-700/50 text-slate-400 hover:text-white'
              )}
            >
              {period}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[400px] bg-slate-900/50 flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">TradingView Chart</p>
          <p className="text-xs text-slate-500 mt-1">Widget integrado</p>
        </div>
      </div>
    </div>
  );
}

function TechnicalIndicators() {
  const indicators = [
    { name: 'RSI (14)', value: '68.5', signal: 'buy' },
    { name: 'MACD', value: '1.25', signal: 'buy' },
    { name: 'MM50', value: '45.20', signal: 'neutral' },
    { name: 'MM200', value: '42.15', signal: 'sell' },
    { name: 'BB Lower', value: '38.50', signal: 'neutral' },
    { name: 'Volume', value: '48.5M', signal: 'neutral' },
  ];

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'text-emerald-400 bg-emerald-500/20';
      case 'sell': return 'text-red-400 bg-red-500/20';
      default: return 'text-amber-400 bg-amber-500/20';
    }
  };

  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Activity className="w-4 h-4 text-cyan-400" />
        Indicadores Técnicos
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {indicators.map((ind) => (
          <div key={ind.name} className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-xs text-slate-400">{ind.name}</p>
            <p className="text-lg font-bold font-mono text-white">{ind.value}</p>
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded font-medium mt-1 inline-block', getSignalColor(ind.signal))}>
              {ind.signal === 'buy' ? 'COMPRA' : ind.signal === 'sell' ? 'VENDA' : 'NEUTRO'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function FundamentalData({ asset }: { asset: Asset }) {
  const fundamentals = [
    { label: 'P/L', value: '8.5x', good: true },
    { label: 'P/VP', value: '1.2x', good: true },
    { label: 'DY', value: '8.5%', good: true },
    { label: 'ROE', value: '18.5%', good: true },
    { label: 'Dívida/PL', value: '0.85', good: true },
    { label: 'Margem', value: '32.5%', good: true },
  ];

  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <PieChart className="w-4 h-4 text-cyan-400" />
        Fundamentos
      </h3>
      <div className="grid grid-cols-3 gap-3">
        {fundamentals.map((f) => (
          <div key={f.label} className="bg-slate-900/50 rounded-lg p-3">
            <p className="text-xs text-slate-400">{f.label}</p>
            <p className={cn('text-lg font-bold font-mono', f.good ? 'text-emerald-400' : 'text-red-400')}>
              {f.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RelatedNews() {
  const news = mockData.news.slice(0, 3);

  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
      <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
        <Clock className="w-4 h-4 text-cyan-400" />
        Notícias Relacionadas
      </h3>
      <div className="space-y-3">
        {news.map((item) => (
          <a
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-slate-900/50 rounded-lg p-3 hover:bg-slate-800/50 transition-colors group"
          >
            <p className="text-sm text-white group-hover:text-cyan-300 line-clamp-2">{item.title}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-slate-500">{item.source}</span>
              <span className="text-xs text-slate-600">•</span>
              <span className="text-xs text-slate-500">há 2h</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

export default function AssetDetails() {
  const { ticker } = useParams<{ ticker: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useAppStore();
  const inWatchlist = asset ? isInWatchlist(asset.ticker) : false;

  useEffect(() => {
    const loadAsset = async () => {
      setLoading(true);
      try {
        const data = await fetchAssetByTicker(ticker || '');
        setAsset(data);
      } catch (e) {
        // Try to find in mock data
        const allAssets = [
          ...mockData.stocks.br,
          ...mockData.stocks.us,
          ...mockData.crypto,
          ...mockData.etfs,
          ...mockData.fiis,
        ];
        const found = allAssets.find(a => a.ticker.toUpperCase() === (ticker || '').toUpperCase());
        setAsset(found || null);
      } finally {
        setLoading(false);
      }
    };
    loadAsset();
  }, [ticker]);

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-slate-800 rounded" />
          <div className="h-64 bg-slate-800 rounded-xl" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-slate-800 rounded-xl" />)}
          </div>
        </div>
      </Layout>
    );
  }

  if (!asset) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-xl text-slate-400">Ativo não encontrado</p>
          <Link to="/radar" className="text-cyan-400 hover:text-cyan-300 mt-4 inline-block">
            Voltar ao Radar
          </Link>
        </div>
      </Layout>
    );
  }

  const isPositive = asset.changePercent >= 0;

  return (
    <Layout>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <Link to="/radar" className="text-slate-400 hover:text-white flex items-center gap-1 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Radar
        </Link>
        <span className="text-slate-600">/</span>
        <span className="text-white font-medium">{asset.ticker}</span>
      </div>

      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start justify-between gap-6 mb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold text-white">{asset.ticker}</h1>
            <span className={cn(
              'text-sm px-2 py-1 rounded font-medium',
              asset.type === 'stock' ? 'bg-blue-500/20 text-blue-400' :
              asset.type === 'etf' ? 'bg-purple-500/20 text-purple-400' :
              asset.type === 'fii' ? 'bg-amber-500/20 text-amber-400' :
              asset.type === 'crypto' ? 'bg-orange-500/20 text-orange-400' :
              'bg-slate-500/20 text-slate-400'
            )}>
              {getAssetTypeLabel(asset.type)}
            </span>
          </div>
          <p className="text-slate-400">{asset.name}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => inWatchlist ? removeFromWatchlist(asset.ticker) : addToWatchlist(asset)}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all',
              inWatchlist
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/30'
                : 'bg-slate-800/50 text-slate-400 border border-slate-700/40 hover:text-amber-400 hover:border-amber-500/30'
            )}
          >
            <Star className={cn('w-4 h-4', inWatchlist && 'fill-current')} />
            {inWatchlist ? 'Na Watchlist' : 'Adicionar'}
          </button>
          <button className="p-2 bg-slate-800/50 rounded-xl text-slate-400 hover:text-white border border-slate-700/40">
            <Bell className="w-5 h-5" />
          </button>
          <button className="p-2 bg-slate-800/50 rounded-xl text-slate-400 hover:text-white border border-slate-700/40">
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Price Section */}
      <div className="bg-slate-800/40 rounded-xl p-6 border border-slate-700/40 mb-6">
        <div className="flex items-end gap-6">
          <div>
            <p className="text-xs text-slate-400 mb-1">Preço Atual</p>
            <p className="text-4xl font-bold font-mono text-white">
              {formatPrice(asset.price, asset.currency)}
            </p>
          </div>
          <div className="flex items-center gap-4 pb-2">
            <div className={cn(
              'flex items-center gap-1 px-3 py-1.5 rounded-lg',
              isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            )}>
              {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span className="font-mono font-bold">{formatPercent(asset.changePercent)}</span>
            </div>
            <div className={cn('font-mono', getChangeColor(asset.change))}>
              {isPositive ? '+' : ''}{asset.change.toFixed(2)} {asset.currency}
            </div>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="mb-6">
        <TradingViewWidget />
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Variação Dia"
          value={formatPercent(asset.changePercent)}
          subValue={`${asset.change >= 0 ? '+' : ''}${asset.change.toFixed(2)} ${asset.currency}`}
          trend={isPositive ? 'up' : 'down'}
        />
        <MetricCard
          label="Volume"
          value={formatLargeNumber(asset.volume)}
          trend="neutral"
        />
        <MetricCard
          label="Market Cap"
          value={asset.marketCap ? formatLargeNumber(asset.marketCap) : 'N/A'}
          trend="neutral"
        />
        <MetricCard
          label="Tipo"
          value={getAssetTypeLabel(asset.type)}
          subValue={asset.sector || asset.country || ''}
          trend="neutral"
        />
      </div>

      {/* Technical & Fundamental */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <TechnicalIndicators />
        <FundamentalData asset={asset} />
      </div>

      {/* Related News */}
      <RelatedNews />

      {/* Graham Score (if applicable) */}
      <div className="mt-6 bg-gradient-to-r from-emerald-900/30 to-transparent rounded-xl p-6 border border-emerald-500/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl font-black text-emerald-400">78</span>
            </div>
            <div>
              <p className="text-xs text-emerald-400 font-medium mb-1">Graham Score</p>
              <p className="text-xl font-bold text-white">Boa oportunidade de investimento</p>
              <p className="text-sm text-slate-400 mt-1">P/L de 8.5x com DY de 8.5% - Margem de segurança elevada</p>
            </div>
          </div>
          <Link
            to="/graham"
            className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition-colors"
          >
            Ver Análise Completa
          </Link>
        </div>
      </div>
    </Layout>
  );
}