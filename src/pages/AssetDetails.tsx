import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Activity,
  ArrowDownRight,
  ArrowLeft,
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
import { cn, formatLargeNumber, formatPercent, formatPrice, getAssetTypeLabel } from '@/lib/utils';
import { useAppStore } from '@/hooks/useStore';
import { Layout } from '@/components/layout/Layout';
import API_ENDPOINTS from '@/config/api';
import { catalogEntry, fetchLiveAssetSnapshot } from '@/services/liveMarket';
import type { Asset } from '@/types';

interface NewsItem {
  id?: string;
  title: string;
  source?: string;
  url?: string;
  publishedAt?: string;
}

function emptyAssetForTicker(ticker: string): Asset | null {
  const meta = catalogEntry(ticker);
  if (!meta) return null;
  return {
    ticker: meta.ticker,
    name: meta.name,
    price: 0,
    change: 0,
    changePercent: 0,
    volume: 0,
    type: meta.type,
    currency: meta.currency,
    sector: meta.sector,
    country: meta.country,
  };
}

function tradingViewSymbol(asset: Asset) {
  const ticker = asset.ticker.toUpperCase().replace(/\.SA$/i, '');
  if (asset.type === 'crypto') return `BINANCE:${ticker}USDT`;
  if (asset.currency === 'BRL' || asset.country === 'BR') return `BMFBOVESPA:${ticker}`;
  return `NASDAQ:${ticker}`;
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
    attribution.innerHTML = '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span style="color:#67e8f9">Gráfico</span></a><span style="color:#64748b"> by TradingView</span>';

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
          <p className="mt-1 text-xs text-slate-500">Visualização TradingView · {symbol}</p>
        </div>
        <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-bold text-cyan-300 hover:text-cyan-200">
          Abrir TradingView <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
      <div ref={container} className="tradingview-widget-container h-[430px] w-full lg:h-[520px]" />
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
      try {
        const response = await fetch(API_ENDPOINTS.news.stock(ticker.toUpperCase()));
        if (response.ok) {
          const payload = await response.json() as NewsItem[];
          if (active && Array.isArray(payload) && payload.length > 0) {
            setItems(payload.slice(0, 5));
            setMode('asset');
            return;
          }
        }
      } catch {
        // Tenta o feed geral abaixo.
      }

      try {
        const response = await fetch(API_ENDPOINTS.news.list);
        if (!response.ok) throw new Error('news-unavailable');
        const payload = await response.json() as NewsItem[];
        if (active) {
          setItems(Array.isArray(payload) ? payload.slice(0, 5) : []);
          setMode(Array.isArray(payload) && payload.length > 0 ? 'market' : 'empty');
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
            {mode === 'asset' ? 'Notícias recentes relacionadas ao ativo.' : mode === 'market' ? 'Feed geral enquanto não há notícia específica.' : 'Feed indisponível agora.'}
          </p>
        </div>
        <Link to="/noticias" className="text-xs font-bold text-cyan-300 hover:text-cyan-200">Ver feed</Link>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-slate-900/70" />)}</div>
      ) : items.length > 0 ? (
        <div className="space-y-3">
          {items.map((item, index) => (
            <a key={item.id || `${item.title}-${index}`} href={item.url || '#'} target={item.url ? '_blank' : undefined} rel={item.url ? 'noopener noreferrer' : undefined} className="block rounded-xl border border-slate-800 bg-slate-950/50 p-4 transition hover:border-cyan-500/30">
              <p className="text-sm font-semibold leading-relaxed text-white">{item.title}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                <span>{item.source || 'F-Insight Radar'}</span>
                {item.publishedAt && <span>· {new Date(item.publishedAt).toLocaleDateString('pt-BR')}</span>}
              </div>
            </a>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 text-sm text-slate-400">Nenhuma notícia disponível agora.</div>
      )}
    </section>
  );
}

function MetricCard({ label, value, subValue }: { label: string; value: string; subValue?: string }) {
  return (
    <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4">
      <p className="mb-1 text-xs text-slate-400">{label}</p>
      <p className="font-mono text-lg font-bold text-white">{value}</p>
      {subValue && <p className="mt-1 text-xs text-slate-500">{subValue}</p>}
    </div>
  );
}

export default function AssetDetails() {
  const { ticker = '' } = useParams<{ ticker: string }>();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [loading, setLoading] = useState(true);
  const [dataAvailable, setDataAvailable] = useState(false);
  const [provider, setProvider] = useState<string | null>(null);
  const [fetchedAt, setFetchedAt] = useState<string | null>(null);
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useAppStore();

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      try {
        const snapshot = await fetchLiveAssetSnapshot(ticker);
        if (!active) return;
        if (snapshot) {
          setAsset(snapshot.asset);
          setDataAvailable(snapshot.dataAvailable);
          setProvider(snapshot.provider);
          setFetchedAt(snapshot.fetchedAt);
        } else {
          setAsset(emptyAssetForTicker(ticker));
          setDataAvailable(false);
          setProvider(null);
          setFetchedAt(null);
        }
      } catch {
        if (!active) return;
        setAsset(emptyAssetForTicker(ticker));
        setDataAvailable(false);
        setProvider(null);
        setFetchedAt(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
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
        </div>
      </Layout>
    );
  }

  if (!asset) {
    return (
      <Layout>
        <div className="py-20 text-center">
          <p className="text-xl text-slate-400">Ativo fora do catálogo atual.</p>
          <Link to="/radar" className="mt-4 inline-block text-cyan-400 hover:text-cyan-300">Voltar ao Radar</Link>
        </div>
      </Layout>
    );
  }

  const inWatchlist = isInWatchlist(asset.ticker);
  const isPositive = asset.changePercent >= 0;

  return (
    <Layout>
      <div className="mb-6 flex items-center gap-2 text-sm">
        <Link to="/radar" className="flex items-center gap-1 text-slate-400 transition hover:text-white">
          <ArrowLeft className="h-4 w-4" /> Radar
        </Link>
        <span className="text-slate-600">/</span>
        <span className="font-medium text-white">{asset.ticker}</span>
      </div>

      <section className="mb-6 rounded-3xl border border-slate-700/40 bg-slate-900/60 p-5 lg:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="mb-2 flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-black text-white">{asset.ticker}</h1>
              <span className="rounded bg-cyan-500/10 px-2 py-1 text-xs font-bold text-cyan-300">{getAssetTypeLabel(asset.type)}</span>
              <span className={cn('rounded px-2 py-1 text-xs font-bold', dataAvailable ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300')}>
                {dataAvailable ? `dados atuais${provider ? ` · ${provider}` : ''}` : 'cotação indisponível'}
              </span>
            </div>
            <p className="text-slate-400">{asset.name}</p>

            <div className="mt-5 flex flex-wrap items-end gap-4">
              <p className="font-mono text-4xl font-black text-white">
                {dataAvailable ? formatPrice(asset.price, asset.currency) : '—'}
              </p>
              {dataAvailable && (
                <>
                  <div className={cn('flex items-center gap-1 rounded-lg px-3 py-1.5', isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400')}>
                    {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                    <span className="font-mono font-bold">{formatPercent(asset.changePercent)}</span>
                  </div>
                  <span className={cn('pb-1 font-mono text-sm', isPositive ? 'text-emerald-400' : 'text-red-400')}>
                    {asset.change >= 0 ? '+' : ''}{asset.change.toFixed(2)} {asset.currency}
                  </span>
                </>
              )}
            </div>
            {fetchedAt && <p className="mt-2 text-xs text-slate-600">Atualizado em {new Date(fetchedAt).toLocaleString('pt-BR')}</p>}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => inWatchlist ? removeFromWatchlist(asset.ticker) : addToWatchlist(asset)}
              className={cn('flex items-center gap-2 rounded-xl border px-4 py-2 font-medium transition', inWatchlist ? 'border-amber-500/30 bg-amber-500/20 text-amber-400' : 'border-slate-700/40 bg-slate-800/50 text-slate-400 hover:border-amber-500/30 hover:text-amber-400')}
            >
              <Star className={cn('h-4 w-4', inWatchlist && 'fill-current')} />
              {inWatchlist ? 'Na Watchlist' : 'Acompanhar'}
            </button>
            <Link to="/alertas" className="rounded-xl border border-slate-700/40 bg-slate-800/50 p-2 text-slate-400 hover:text-white" aria-label="Abrir alertas">
              <Bell className="h-5 w-5" />
            </Link>
          </div>
        </div>

        {!dataAvailable && (
          <div className="mt-5 flex gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
            <p className="text-sm leading-relaxed text-amber-100/80">
              A cotação da API F-Insight não está disponível agora. Nenhum preço fictício é exibido. O gráfico TradingView e o feed de notícias seguem suas próprias fontes.
            </p>
          </div>
        )}
      </section>

      <div className="mb-6"><TradingViewWidget asset={asset} /></div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MetricCard label="Variação" value={dataAvailable ? formatPercent(asset.changePercent) : '—'} subValue={dataAvailable ? `${asset.change >= 0 ? '+' : ''}${asset.change.toFixed(2)} ${asset.currency}` : 'aguardando mercado'} />
        <MetricCard label="Volume médio" value={dataAvailable ? formatLargeNumber(asset.volume) : '—'} />
        <MetricCard label="Fonte da cotação" value={provider || '—'} />
        <MetricCard label="Classe" value={getAssetTypeLabel(asset.type)} subValue={asset.sector || asset.country || ''} />
      </div>

      <div className="mb-6 grid grid-cols-1 gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <RelatedNews ticker={asset.ticker} />
        <section className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
          <h2 className="flex items-center gap-2 text-lg font-black text-white"><Brain className="h-5 w-5 text-cyan-300" /> Como estudar este ativo</h2>
          <div className="mt-4 space-y-3">
            {[
              'Compare preço, fundamentos e contexto; não use uma métrica isolada.',
              'Leia notícias e eventos corporativos junto com o cenário macro.',
              'Observe liquidez, volatilidade, concentração e horizonte.',
              'Use simulações como hipóteses, não como previsão.',
            ].map((item) => (
              <div key={item} className="flex gap-3 rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                <Activity className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                <p className="text-sm leading-relaxed text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
        <h2 className="flex items-center gap-2 text-lg font-black text-white"><BookOpen className="h-5 w-5 text-cyan-300" /> Próximos estudos</h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-300">Leve o ativo para outras ferramentas do F-Insight e organize sua análise.</p>
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link to="/graham-valor" className="rounded-xl border border-cyan-500/20 bg-slate-950/50 p-4 text-sm font-bold text-cyan-100 hover:border-cyan-400/50">Graham & Valor</Link>
          <Link to="/ia-financeira" className="rounded-xl border border-cyan-500/20 bg-slate-950/50 p-4 text-sm font-bold text-cyan-100 hover:border-cyan-400/50">Radar IA · {asset.ticker}</Link>
          <Link to="/alertas" className="rounded-xl border border-cyan-500/20 bg-slate-950/50 p-4 text-sm font-bold text-cyan-100 hover:border-cyan-400/50">Criar alerta</Link>
        </div>
      </section>

      <div className="mt-6 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
        <p className="text-xs leading-relaxed text-amber-100/80">Conteúdo informativo e educacional. O F-Insight não recomenda compra ou venda. Dados de terceiros podem ter atraso e disponibilidade variável.</p>
      </div>
    </Layout>
  );
}
