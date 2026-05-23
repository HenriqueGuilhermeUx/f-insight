import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight,
  Newspaper,
  BarChart3,
  Search,
  Bookmark,
  Star,
  Activity,
  Zap,
  Target,
  Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, formatPercent, getRelativeTime, getChangeColor, formatLargeNumber } from '@/lib/utils';
import { fetchMarketOverview, fetchNews, fetchGrahamPicks, mockData } from '@/services/marketData';
import { Layout, PageLoader } from '@/components/layout/Layout';
import { Asset, Index, NewsItem } from '@/types';

function IndexCard({ index }: { index: Index }) {
  const isPositive = index.changePercent >= 0;
  return (
    <div className={cn(
      'bg-slate-800/40 hover:bg-slate-800/70 rounded-xl p-4 border border-slate-700/40 transition-all cursor-pointer',
      'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5'
    )}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-400 font-medium">{index.name}</span>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full font-medium',
          isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        )}>
          {formatPercent(index.changePercent)}
        </span>
      </div>
      <p className="text-lg font-bold font-mono text-white">
        {index.value.toLocaleString('pt-BR', { minimumFractionDigits: 0 })}
      </p>
      <p className={cn('text-xs font-mono mt-1', getChangeColor(index.changePercent))}>
        {isPositive ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
        {' '}{index.change.toFixed(2)}
      </p>
    </div>
  );
}

function AssetCard({ asset, showType = false }: { asset: Asset; showType?: boolean }) {
  const isPositive = asset.changePercent >= 0;
  return (
    <Link
      to={`/ativo/${asset.ticker}`}
      className={cn(
        'block bg-slate-800/40 hover:bg-slate-800/70 rounded-xl p-4 border border-slate-700/40 transition-all',
        'hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 group'
      )}
    >
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-cyan-400 group-hover:text-cyan-300">
              {asset.ticker}
            </span>
            {showType && (
              <span className="text-[10px] px-1.5 py-0.5 bg-slate-700/50 text-slate-400 rounded">
                {asset.type.toUpperCase()}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-0.5 truncate max-w-[120px]">{asset.name}</p>
        </div>
        <span className={cn(
          'text-xs px-2 py-0.5 rounded-full font-medium',
          isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
        )}>
          {formatPercent(asset.changePercent)}
        </span>
      </div>
      <p className="text-lg font-bold font-mono text-white">
        {formatPrice(asset.price, asset.currency)}
      </p>
      <p className={cn('text-xs font-mono mt-1', getChangeColor(asset.change))}>
        {isPositive ? <ArrowUpRight className="w-3 h-3 inline" /> : <ArrowDownRight className="w-3 h-3 inline" />}
        {' '}{asset.change.toFixed(2)} ({asset.currency})
      </p>
    </Link>
  );
}

function NewsCard({ news }: { news: NewsItem }) {
  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'block bg-slate-800/40 hover:bg-slate-800/70 rounded-xl overflow-hidden border border-slate-700/40 transition-all',
        'hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5 group'
      )}
    >
      {news.image && (
        <div className="aspect-video bg-slate-800 overflow-hidden">
          <img
            src={news.image}
            alt={news.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded">
            {news.source}
          </span>
          <span className="text-xs text-slate-500">{getRelativeTime(news.publishedAt)}</span>
        </div>
        <h3 className="font-semibold text-white group-hover:text-cyan-300 transition-colors line-clamp-2">
          {news.title}
        </h3>
        <p className="text-sm text-slate-400 mt-2 line-clamp-2">{news.summary}</p>
        <div className="flex items-center gap-2 mt-3">
          {news.tags?.slice(0, 2).map((tag) => (
            <span key={tag} className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </a>
  );
}

function TickerTape() {
  const assets = mockData.stocks.br.slice(0, 6);
  const items = [...assets, ...assets];
  return (
    <div className="bg-slate-900/80 border-y border-slate-700/40 py-2 overflow-hidden">
      <div className="animate-ticker whitespace-nowrap flex gap-8">
        {items.map((a, i) => (
          <span key={i} className="inline-flex items-center gap-2 text-sm font-mono">
            <span className="font-bold text-cyan-400">{a.ticker}</span>
            <span className="text-slate-300">{formatPrice(a.price)}</span>
            <span className={getChangeColor(a.changePercent)}>
              {a.changePercent >= 0 ? '▲' : '▼'} {Math.abs(a.changePercent).toFixed(2)}%
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

function MarketSection() {
  const [indices, setIndices] = useState<Index[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const overview = await fetchMarketOverview();
        setIndices([
          overview.brazil.ibovespa,
          overview.usa.sp500,
          overview.usa.nasdaq,
          overview.usa.dow,
        ]);
      } catch (e) {
        setIndices(mockData.indices);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-slate-800/40 rounded-xl p-4 h-24 skeleton" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {indices.map((index) => (
        <IndexCard key={index.ticker} index={index} />
      ))}
    </div>
  );
}

function TopMovers() {
  const [assets, setAssets] = useState<Asset[]>([]);

  useEffect(() => {
    // Get top gainers and losers from Brazilian stocks
    const all = mockData.stocks.br;
    const sorted = [...all].sort((a, b) => b.changePercent - a.changePercent);
    setAssets(sorted.slice(0, 6));
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {assets.map((asset) => (
        <AssetCard key={asset.ticker} asset={asset} />
      ))}
    </div>
  );
}

function CryptoSection() {
  const cryptos = mockData.crypto.slice(0, 4);
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cryptos.map((asset) => (
        <AssetCard key={asset.ticker} asset={asset} showType />
      ))}
    </div>
  );
}

function GrahamPicksSection() {
  const picks = mockData.grahamPicks.slice(0, 8);
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
      {picks.map((pick, index) => (
        <Link
          key={pick.ticker}
          to={`/ativo/${pick.ticker}`}
          className="bg-slate-800/40 hover:bg-slate-800/70 rounded-xl p-3 border border-slate-700/40 hover:border-emerald-500/30 transition-all group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-slate-500">#{index + 1}</span>
            <span className={cn(
              'text-lg font-black',
              pick.score >= 80 ? 'text-emerald-400' : pick.score >= 60 ? 'text-cyan-400' : 'text-amber-400'
            )}>
              {pick.score}
            </span>
          </div>
          <p className="font-mono font-bold text-cyan-400 group-hover:text-cyan-300 text-sm">
            {pick.ticker}
          </p>
          <p className="text-xs text-slate-400 truncate">{pick.name}</p>
          <div className="mt-2 flex items-center justify-between">
            <span className={cn(
              'text-xs px-1.5 py-0.5 rounded font-bold',
              pick.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500/20 text-cyan-400'
            )}>
              {pick.grade}
            </span>
            <span className="text-xs text-emerald-400">{pick.dy}% DY</span>
          </div>
        </Link>
      ))}
    </div>
  );
}

function NewsSection() {
  const [news, setNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    fetchNews(4).then(setNews);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {news.map((item) => (
        <NewsCard key={item.id} news={item} />
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <Layout>
      {/* Ticker Tape */}
      <TickerTape />

      {/* Hero Section */}
      <section className="py-8">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Dashboard do Mercado
            </h1>
            <p className="text-slate-400">
              Acompanhe em tempo real os principais índices e ativos
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-full text-sm">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              Mercado Aberto
            </div>
            <span className="text-sm text-slate-400">
              {new Date().toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short' })}
            </span>
          </div>
        </div>
      </section>

      {/* Market Indices */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-cyan-400" />
            Principais Índices
          </h2>
          <Link
            to="/indices"
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <MarketSection />
      </section>

      {/* Top Movers */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Maiores Altas e Baixas
          </h2>
          <Link
            to="/radar"
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            Radar Completo <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <TopMovers />
      </section>

      {/* Graham Top Picks */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-medium">
                <Shield className="w-3 h-3 inline mr-1" />
                Graham & Doddsville
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-emerald-400" />
              Top Picks por Valor Intrínseco
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Ranking baseado nos critérios de Benjamin Graham
            </p>
          </div>
          <Link
            to="/graham"
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            Análise Completa <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <GrahamPicksSection />
      </section>

      {/* Crypto Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-purple-400" />
            Criptomoedas
          </h2>
          <Link
            to="/cripto"
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            Ver Mercado <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <CryptoSection />
      </section>

      {/* News Section */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-cyan-400" />
            Últimas Notícias
          </h2>
          <Link
            to="/noticias"
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            Ver Todas <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <NewsSection />
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Link
          to="/radar"
          className="bg-gradient-to-r from-cyan-600/20 to-transparent p-6 rounded-xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
              <Search className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-cyan-300">Radar de Ativos</h3>
              <p className="text-sm text-slate-400">Busque e filtre ativos por critérios</p>
            </div>
          </div>
        </Link>
        <Link
          to="/watchlist"
          className="bg-gradient-to-r from-amber-600/20 to-transparent p-6 rounded-xl border border-amber-500/20 hover:border-amber-500/40 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Bookmark className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-amber-300">Minha Watchlist</h3>
              <p className="text-sm text-slate-400">Acompanhe seus ativos favoritos</p>
            </div>
          </div>
        </Link>
        <Link
          to="/analises"
          className="bg-gradient-to-r from-emerald-600/20 to-transparent p-6 rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-white group-hover:text-emerald-300">Análises Especializadas</h3>
              <p className="text-sm text-slate-400">Graham, valuation e mais</p>
            </div>
          </div>
        </Link>
      </section>
    </Layout>
  );
}