import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowLeft,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Clock,
  ExternalLink,
  ShieldCheck,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  formatLargeNumber,
  formatPercent,
  formatPrice,
  getAssetTypeLabel,
  getChangeColor,
} from '@/lib/utils';
import { fetchAssetByTicker, mockData } from '@/services/marketData';
import { useAppStore } from '@/hooks/useStore';
import { Layout } from '@/components/layout/Layout';
import API_ENDPOINTS from '@/config/api';
import type { Asset } from '@/types';

interface NewsItem {
  id?: string;
  title: string;
  summary?: string;
  source?: string;
  url?: string;
  publishedAt?: string;
}

function MetricCard({
  label,
  value,
  subValue,
  trend,
}: {
  label: string;
  value: string;
  subValue?: string;
  trend?: 'up' | 'down' | 'neutral';
}) {
  return (
    <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4">
      <p className="mb-1 text-xs text-slate-400">{label}</p>
      <p className="font-mono text-lg font-bold text-white">{value}</p>
      {subValue && (
        <p
          className={cn(
            'mt-1 text-xs font-mono',
            trend === 'up'
              ? 'text-emerald-400'
              : trend === 'down'
                ? 'text-red-400'
                : 'text-slate-400'
          )}
        >
          {subValue}
        </p>
      )}
    </div>
  );
}

function tradingViewSymbol(asset: Asset) {
  const ticker = String(asset.ticker || '').trim().toUpperCase();
  if (ticker.includes(':')) return ticker;

  const clean = ticker.replace(/\.SA$/i, '');

  if (ticker.endsWith('.SA') || asset.currency === 'BRL' || asset.country === 'BR') {
    return `BMFBOVESPA:${clean}`;
  }

  if (asset.type === 'crypto') {
    const crypto = clean.replace(/-USD$/i, '').replace(/USDT$/i, '');
    return `BINANCE:${crypto}USDT`;
  }

  return `NASDAQ:${clean}`;
}

function TradingViewWidget({ asset }: { asset: Asset }) {
  const container = useRef<HTMLDivElement | null>(null);
  const symbol = tradingViewSymbol(asset);

  useEffect(() => {
    const node = container.current;
    if (!node) return;

    node.innerHTML = '';

    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    widget.style.height = 'calc(100% - 32px)';
    widget.style.width = '100%';

    const attribution = document.createElement('div');
    attribution.className = 'tradingview-widget-copyright';
    attribution.innerHTML =
      '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span style="color:#67e8f9">Gráfico</span></a><span style="color:#64748b"> by TradingView</span>';

    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js';
    script.type = 'text/javascript';
    script.async = true;
    script.innerHTML = JSON.stringify({
      autosize: true,
      symbol,
      interval: 'D',
      timezone: 'exchange',
      theme: 'dark',
      backgroundColor: 'rgba(15, 23, 42, 1)',
      gridColor: 'rgba(71, 85, 105, 0.18)',
      style: '1',
      locale: 'br',
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      allow_symbol_change: true,
      save_image: false,
      calendar: false,
      support_host: 'https://www.tradingview.com',
    });

    node.appendChild(widget);
    node.appendChild(attribution);
    node.appendChild(script);

    return () => {
      node.innerHTML = '';
    };
  }, [symbol]);

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-700/40 bg-slate-900/60">
      <div className="flex flex-col gap-2 border-b border-slate-700/40 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-black text-white">
            <BarChart3 className="h-4 w-4 text-cyan-300" />
            Gráfico avançado
          </p>
          <p className="mt-1 text-xs text-slate-500">
            Visualização TradingView · símbolo {symbol}
          </p>
        </div>
        <a
          href="https://www.tradingview.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-cyan-200"
        >
          Abrir TradingView <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <div
        ref={container}
        className="tradingview-widget-container h-[430px] w-full lg:h-[520px]"
      />
    </section>
  );
}

function RelatedNews({ ticker }: { ticker: string }) {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'asset' | 'market' | 'empty'>('empty');

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      const symbol = ticker.toUpperCase();

      try {
        const response = await fetch(API_ENDPOINTS.news.stock(symbol));
        if (response.ok) {
          const payload = (await response.json()) as NewsItem[];
          if (active && Array.isArray(payload) && payload.length > 0) {
            setItems(payload.slice(0, 5));
            setMode('asset');
            return;
          }
        }
      } catch {
        // Usa o feed geral abaixo.
      }

      try {
        const response = await fetch(API_ENDPOINTS.news.list);
        if (!response.ok) throw new Error('market-news-unavailable');
        const payload = (await response.json()) as NewsItem[];
        if (active && Array.isArray(payload)) {
          setItems(payload.slice(0, 5));
          setMode(payload.length > 0 ? 'market' : 'empty');
        }
      } catch {
        if (active) {
          setItems([]);
          setMode('empty');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [ticker]);

  return (
    <section className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-black text-white">
            <Clock className="h-5 w-5 text-cyan-300" />
            Notícias e contexto
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {mode === 'asset'
              ? 'Notícias recentes relacionadas ao ativo.'
              : mode === 'market'
                ? 'Feed de mercado enquanto não há notícia específica disponível.'
                : 'Feed ao vivo indisponível no momento.'}
          </p>
        </div>
        <Link to="/noticias" className="text-xs font-bold text-cyan-300 hover:text-cyan-200">
          Ver feed
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-20 animate-pulse rounded-xl bg-slate-900/70" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <a
              key={item.id || `${item.title}-${index}`}
              href={item.url || '#'}
              target={item.url ? '_blank' : undefined}
              rel={item.url ? 'noopener noreferrer' : undefined}
              className="block rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-cyan-500/30"
            >
              <p className="text-sm font-semibold leading-relaxed text-white">{item.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{item.source || 'F-Insight Radar'}</span>
                {item.publishedAt && <span>· {new Date(item.publishedAt).toLocaleDateString('pt-BR')}</span>}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-400">
          Nenhuma notícia disponível agora. O restante da página continua utilizável para estudo do ativo.
        </div>
      )}
    </section>
  );
}

function StudyActions({ ticker }: { ticker: string }) {
  return (
    <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
      <h2 className="flex items-center gap-2 text-lg font-black text-white">
        <BookOpen className="h-5 w-5 text-cyan-300" />
        Próximos estudos
      </h2>
      <p className="mt-2 text-sm leading-relaxed text-slate-300">
        Use valuation, contexto macro, notícias e IA para formular uma hipótese antes de tomar qualquer decisão.
      </p>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <Link
          to="/graham-valor"
          className="rounded-xl border border-cyan-500/20 bg-slate-950/50 p-4 text-sm font-bold text-cyan-100 hover:border-cyan-400/50"
        >
          Graham & Valor
        </Link>
        <Link
          to="/ia-financeira"
          className="rounded-xl border border-cyan-500/20 bg-slate-950/50 p-4 text-sm font-bold text-cyan-100 hover:border-cyan-400/50"
        >
          Radar IA · {ticker.replace('.SA', '')}
        </Link>
        <Link
          to="/alertas"
          className="rounded-xl border border-cyan-500/20 bg-slate-950/50 p-4 text-sm font-bold text-cyan-100 hover:border-cyan-400/50"
        >
          Criar alerta
        </Link>
      </div>
    </section>
  );
}

export default function AssetDetails() {
  const { ticker } = useParams<{ ticker: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataMode, setDataMode] = useState<'api' | 'fallback'>('api');
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useAppStore();
  const inWatchlist = asset ? isInWatchlist(asset.ticker) : false;

  useEffect(() => {
    let active = true;

    async function loadAsset() {
      setLoading(true);
      try {
        const data = await fetchAssetByTicker(ticker || '');
        if (active) {
          setAsset(data);
          setDataMode('api');
        }
      } catch {
        const allAssets = [
          ...mockData.stocks.br,
          ...mockData.stocks.us,
          ...mockData.crypto,
          ...mockData.etfs,
          ...mockData.fiis,
        ];
        const found = allAssets.find(
          (item) => item.ticker.toUpperCase() === (ticker || '').toUpperCase()
        );
        if (active) {
          setAsset(found || null);
          setDataMode('fallback');
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAsset();
    return () => {
      active = false;
    };
  }, [ticker]);

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 rounded bg-slate-800" />
          <div className="h-[430px] rounded-2xl bg-slate-800" />
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="h-24 rounded-xl bg-slate-800" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (!asset) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <p className="text-xl text-slate-400">Ativo não encontrado</p>
          <Link to="/radar" className="mt-4 inline-block text-cyan-400 hover:text-cyan-300">
            Voltar ao Radar
          </Link>
        </div>
      </Layout>
    );
  }

  const isPositive = asset.changePercent >= 0;

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link
          to="/radar"
          className="flex items-center gap-1 text-slate-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Radar
        </Link>
        <span className="text-slate-600">/</span>
        <span className="font-medium text-white">{asset.ticker}</span>
      </div>

      <section className="mb-6 rounded-3xl border border-slate-700/40 bg-slate-900/60 p-5 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black text-white">{asset.ticker}</h1>
              <span className="rounded bg-cyan-500/10 px-2 py-1 text-xs font-bold text-cyan-300">
                {getAssetTypeLabel(asset.type)}
              </span>
              <span
                className={cn(
                  'rounded px-2 py-1 text-xs font-bold',
                  dataMode === 'api'
                    ? 'bg-emerald-500/10 text-emerald-300'
                    : 'bg-amber-500/10 text-amber-300'
                )}
              >
                {dataMode === 'api' ? 'API F-Insight' : 'modo educativo'}
              </span>
            </div>
            <p className="text-slate-400">{asset.name}</p>

            <div className="mt-5 flex flex-wrap items-end gap-4">
              <p className="font-mono text-4xl font-black text-white">
                {formatPrice(asset.price, asset.currency)}
              </p>
              <div
                className={cn(
                  'flex items-center gap-1 rounded-lg px-3 py-1.5',
                  isPositive
                    ? 'bg-emerald-500/20 text-emerald-400'
                    : 'bg-red-500/20 text-red-400'
                )}
              >
                {isPositive ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                <span className="font-mono font-bold">{formatPercent(asset.changePercent)}</span>
              </div>
              <span className={cn('pb-1 font-mono text-sm', getChangeColor(asset.change))}>
                {isPositive ? '+' : ''}
                {asset.change.toFixed(2)} {asset.currency}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() =>
                inWatchlist ? removeFromWatchlist(asset.ticker) : addToWatchlist(asset)
              }
              className={cn(
                'flex items-center gap-2 rounded-xl border px-4 py-2 font-medium transition-all',
                inWatchlist
                  ? 'border-amber-500/30 bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                  : 'border-slate-700/40 bg-slate-800/50 text-slate-400 hover:border-amber-500/30 hover:text-amber-400'
              )}
            >
              <Star className={cn('h-4 w-4', inWatchlist && 'fill-current')} />
              {inWatchlist ? 'Na Watchlist' : 'Acompanhar'}
            </button>
            <Link
              to="/alertas"
              className="rounded-xl border border-slate-700/40 bg-slate-800/50 p-2 text-slate-400 hover:text-white"
              aria-label="Abrir alertas"
            >
              <Bell className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {dataMode === 'fallback' && (
          <div className="mt-5 flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <p className="text-sm leading-relaxed text-amber-100/80">
              A API do ativo não respondeu e esta parte da tela está usando valores educativos de contingência. O gráfico TradingView e os feeds externos seguem suas próprias fontes.
            </p>
          </div>
        )}
      </section>

      <div className="mb-6">
        <TradingViewWidget asset={asset} />
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard
          label="Variação do dia"
          value={formatPercent(asset.changePercent)}
          subValue={`${asset.change >= 0 ? '+' : ''}${asset.change.toFixed(2)} ${asset.currency}`}
          trend={isPositive ? 'up' : 'down'}
        />
        <MetricCard label="Volume" value={formatLargeNumber(asset.volume)} trend="neutral" />
        <MetricCard
          label="Market cap"
          value={asset.marketCap ? formatLargeNumber(asset.marketCap) : 'N/D'}
          trend="neutral"
        />
        <MetricCard
          label="Classe"
          value={getAssetTypeLabel(asset.type)}
          subValue={asset.sector || asset.country || ''}
          trend="neutral"
        />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <RelatedNews ticker={asset.ticker} />

        <section className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
          <h2 className="flex items-center gap-2 text-lg font-black text-white">
            <Brain className="h-5 w-5 text-cyan-300" />
            Como estudar este ativo
          </h2>
          <div className="mt-4 space-y-3">
            {[
              'Compare preço e fundamentos sem transformar um único múltiplo em decisão.',
              'Leia notícias e eventos corporativos junto com o cenário macro.',
              'Observe liquidez, volatilidade, concentração e horizonte.',
              'Use simulações e hipóteses; não trate cenários como previsão.',
            ].map((item) => (
              <div
                key={item}
                className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3"
              >
                <Activity className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <p className="text-sm leading-relaxed text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <StudyActions ticker={asset.ticker} />

      <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
        <p className="text-xs leading-relaxed text-amber-100/80">
          Conteúdo informativo e educacional. O F-Insight não está recomendando compra ou venda deste ativo. Dados de terceiros podem ter atraso, regras próprias de mercado e disponibilidade variável.
        </p>
      </div>
    </Layout>
  );
}
