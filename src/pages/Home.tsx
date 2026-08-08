import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  Building2,
  Calculator,
  CheckCircle2,
  Globe2,
  LineChart,
  LockKeyhole,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import API_ENDPOINTS from '@/config/api';

interface LiveIndicator {
  symbol: string;
  lastPrice: number;
  changePercent: number;
  fetchedAt?: string;
}

interface NewsItem {
  title: string;
  source?: string;
  category?: string;
  url?: string;
  publishedAt?: string;
}

interface MacroItem {
  id?: string;
  label: string;
  value: number | string;
  unit?: string;
  source?: string;
  interpretation?: string;
  detail?: string;
}

const fallbackIndicators: LiveIndicator[] = [
  { symbol: 'PETR4.SA', lastPrice: 38.42, changePercent: 0.72 },
  { symbol: 'VALE3.SA', lastPrice: 61.18, changePercent: -0.35 },
  { symbol: 'ITUB4.SA', lastPrice: 34.9, changePercent: 0.41 },
  { symbol: 'BBAS3.SA', lastPrice: 29.8, changePercent: 0.22 },
  { symbol: 'WEGE3.SA', lastPrice: 42.75, changePercent: 1.12 },
  { symbol: 'BBDC4.SA', lastPrice: 14.62, changePercent: -0.18 },
];

const fallbackIndexes = [
  { label: 'IBOVESPA', value: '178.002', change: 'radar' },
  { label: 'S&P 500', value: '7.600', change: '+1,48%' },
  { label: 'Dólar / Real', value: 'R$ 5,10', change: '+0,15%' },
  { label: 'Bitcoin', value: 'US$ 63.898', change: '+1,90%' },
];

const fallbackMacro: MacroItem[] = [
  { id: 'selic', label: 'Selic Meta', value: 14.0, unit: '% a.a.', source: 'fallback offline', interpretation: 'O app tenta atualizar online pela API F-Insight/BCB.' },
  { id: 'ipca', label: 'IPCA Mensal', value: 0.38, unit: '% m/m', source: 'fallback offline', interpretation: 'Inflação impacta juros futuros, margens corporativas e poder de compra.' },
  { id: 'usdbrl', label: 'Dólar Comercial', value: 5.1, unit: 'BRL', source: 'fallback offline', interpretation: 'Câmbio afeta inflação, commodities e empresas exportadoras.' },
  { id: 'ifix', label: 'IFIX', value: 'radar', unit: '', source: 'painel F-Insight', interpretation: 'FIIs reagem a juros longos, vacância, DY e P/VP.' },
];

const fallbackNews: NewsItem[] = [
  { title: 'Mercado acompanha juros, dólar, commodities e temporada de resultados.', source: 'F-Insight Radar', category: 'Brasil', publishedAt: 'agora' },
  { title: 'Bancos, petróleo, mineração e energia seguem entre os setores de maior atenção na B3.', source: 'F-Insight Research', category: 'Ações', publishedAt: 'hoje' },
  { title: 'Juros altos exigem disciplina em valuation, margem de segurança e qualidade.', source: 'F-Insight Macro', category: 'Macro', publishedAt: 'hoje' },
];

const tools = [
  { title: 'Graham & Valor', text: 'Estude margem de segurança, múltiplos, qualidade e valor.', href: '/graham-valor', icon: Calculator, tag: 'grátis' },
  { title: 'Screener de Ações', text: 'Filtre por P/L, P/VP, DY, ROE, liquidez e setor.', href: '/screener-acoes', icon: Target, tag: 'grátis' },
  { title: 'Backtesting', text: 'Teste hipóteses com histórico antes de transformar ideia em estratégia.', href: '/backtesting', icon: LineChart, tag: 'premium' },
  { title: 'IA Financeira', text: 'Explique ativos, notícias, indicadores e cenário em linguagem simples.', href: '/premium', icon: Brain, tag: 'premium' },
  { title: 'Carteira simulada', text: 'Monte uma carteira fictícia e acompanhe risco, concentração e aprendizado.', href: '/premium', icon: WalletCards, tag: 'premium' },
  { title: 'Alertas inteligentes', text: 'Preço, variação, dividendos, volatilidade e eventos importantes.', href: '/alertas', icon: Bell, tag: 'premium' },
];

function cleanSymbol(symbol: string) {
  return symbol.replace('.SA', '');
}

function symbolName(symbol: string) {
  const names: Record<string, string> = {
    'PETR4.SA': 'Petrobras PN',
    'VALE3.SA': 'Vale ON',
    'ITUB4.SA': 'Itaú Unibanco PN',
    'BBAS3.SA': 'Banco do Brasil ON',
    'BBDC4.SA': 'Bradesco PN',
    'WEGE3.SA': 'WEG ON',
  };
  return names[symbol] || cleanSymbol(symbol);
}

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2).replace('.', ',')}%`;
}

function formatUpdatedAt(value?: string) {
  if (!value) return 'modo educativo';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'modo educativo';
  return date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function formatMacroValue(item: MacroItem) {
  if (typeof item.value === 'string') return item.value;
  if (item.unit === 'BRL') return `R$ ${item.value.toFixed(2).replace('.', ',')}`;
  if (item.unit?.includes('%')) return `${item.value.toFixed(2).replace('.', ',')}%`;
  return String(item.value);
}

function normalizeNews(payload: unknown): NewsItem[] {
  const raw = payload as { data?: NewsItem[]; news?: NewsItem[]; articles?: NewsItem[] } | NewsItem[];
  const list = Array.isArray(raw) ? raw : raw?.data || raw?.news || raw?.articles || [];
  return list.filter(Boolean).slice(0, 3);
}

function normalizeMacro(payload: unknown): MacroItem[] {
  const raw = payload as { indicators?: MacroItem[]; data?: MacroItem[] } | MacroItem[];
  const list = Array.isArray(raw) ? raw : raw?.indicators || raw?.data || [];
  if (!Array.isArray(list) || list.length === 0) return fallbackMacro;
  return list.slice(0, 4);
}

export default function Home() {
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [news, setNews] = useState<NewsItem[]>(fallbackNews);
  const [macro, setMacro] = useState<MacroItem[]>(fallbackMacro);
  const [isLive, setIsLive] = useState(false);
  const [isMacroLive, setIsMacroLive] = useState(false);
  const [macroUpdatedAt, setMacroUpdatedAt] = useState<string | undefined>();

  useEffect(() => {
    fetch(API_ENDPOINTS.live.indicators)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const data = Array.isArray(payload?.data) ? payload.data : [];
        setIndicators(data);
        setIsLive(data.length > 0);
      })
      .catch(() => {
        setIndicators([]);
        setIsLive(false);
      });

    fetch(`${API_ENDPOINTS.macro.overview}?refresh=true`)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        setMacro(normalizeMacro(payload));
        setMacroUpdatedAt(payload?.updatedAt);
        setIsMacroLive(String(payload?.source || '').includes('online') || String(payload?.source || '').includes('banco-central'));
      })
      .catch(() => {
        setMacro(fallbackMacro);
        setIsMacroLive(false);
      });

    fetch(API_ENDPOINTS.news.list)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const next = normalizeNews(payload);
        if (next.length > 0) setNews(next);
      })
      .catch(() => setNews(fallbackNews));
  }, []);

  const marketData = indicators.length > 0 ? indicators : fallbackIndicators;
  const updatedAt = formatUpdatedAt(macroUpdatedAt || marketData[0]?.fetchedAt);

  const marketMood = useMemo(() => {
    const avg = marketData.reduce((sum, item) => sum + item.changePercent, 0) / marketData.length;
    if (avg > 0.6) return { label: 'Mercado construtivo', text: 'A amostra acompanhada está positiva. Confirme fundamento, fluxo e notícia antes de agir.' };
    if (avg < -0.6) return { label: 'Mercado pressionado', text: 'A amostra está negativa. Priorize risco, liquidez, qualidade e horizonte.' };
    return { label: 'Mercado misto', text: 'Sem direção única. Separe empresas, setores, valuation e cenário macro.' };
  }, [marketData]);

  return (
    <Layout>
      <section className="mb-6 overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/14 via-slate-900 to-slate-950 p-6 lg:p-10">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                Mercado, macro e ferramentas financeiras
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-bold text-slate-400">
                Atualizado {updatedAt}
              </span>
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                {isLive || isMacroLive ? 'dados online' : 'modo educativo/fallback'}
              </span>
            </div>

            <h1 className="max-w-5xl text-4xl font-black leading-tight tracking-tight text-white lg:text-6xl">
              Veja o mercado. Crie sua conta. Evolua para o Premium quando fizer sentido.
            </h1>
            <p className="mt-5 max-w-4xl text-lg leading-relaxed text-slate-300">
              O F-Insight ajuda qualquer investidor a acompanhar cotações, notícias, Selic, dólar, fundamentos, screener, Graham & Valor e ferramentas educativas em uma experiência simples.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/cadastro-gratis" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-cyan-300">
                Criar conta grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/premium" className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-3 text-sm font-black text-amber-200 transition-colors hover:border-amber-400/70">
                Ver Premium R$ 19,90
              </Link>
              <Link to="/area-logada" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950/60 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-emerald-400/60">
                <LockKeyhole className="h-4 w-4" />
                Área Logada
              </Link>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-500">Gratuito para começar · Premium opcional · Área separada para cliente assessorado, assessor e escritório</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {fallbackIndexes.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-slate-700/50 bg-slate-900/75 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
                <p className="mt-2 text-sm font-black text-emerald-300">{item.change}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-700/50 bg-slate-900/60 p-5 lg:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-black text-white"><BarChart3 className="h-6 w-6 text-cyan-300" /> Radar Brasil</h2>
              <p className="text-sm text-slate-400">Cotações e variações acompanhadas pela API F-Insight.</p>
            </div>
            <Link to="/radar" className="text-sm font-bold text-cyan-300 hover:text-cyan-200">Ver radar</Link>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-700/50">
            {marketData.slice(0, 6).map((asset) => {
              const up = asset.changePercent >= 0;
              return (
                <Link key={asset.symbol} to={`/ativo/${asset.symbol}`} className="grid grid-cols-[1fr_auto_auto] items-center gap-4 border-b border-slate-800 bg-slate-950/40 px-4 py-3 last:border-b-0 hover:bg-slate-800/40">
                  <div>
                    <p className="font-mono text-lg font-black text-cyan-300">{cleanSymbol(asset.symbol)}</p>
                    <p className="text-xs text-slate-500">{symbolName(asset.symbol)}</p>
                  </div>
                  <p className="font-mono text-sm font-bold text-white">{formatMoney(asset.lastPrice)}</p>
                  <p className={up ? 'font-mono text-sm font-black text-emerald-300' : 'font-mono text-sm font-black text-red-300'}>{formatPercent(asset.changePercent)}</p>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-700/50 bg-slate-900/60 p-5 lg:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-black text-white"><Globe2 className="h-6 w-6 text-emerald-300" /> Painel Macro</h2>
              <p className="text-sm text-slate-400">Selic, inflação, dólar e régua de oportunidade.</p>
            </div>
            <span className={isMacroLive ? 'text-xs font-bold text-emerald-300' : 'text-xs font-bold text-amber-300'}>{isMacroLive ? 'BCB online' : 'fallback'}</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {macro.slice(0, 4).map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">{item.label}</p>
                  <span className="text-[10px] font-bold text-slate-600">{item.source || 'F-Insight'}</span>
                </div>
                <p className="text-2xl font-black text-white">{formatMacroValue(item)}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.interpretation || item.detail || 'Indicador macro acompanhado pelo F-Insight.'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2rem] border border-slate-700/50 bg-slate-900/60 p-5 lg:p-6">
          <h2 className="mb-2 flex items-center gap-2 text-2xl font-black text-white"><Newspaper className="h-6 w-6 text-cyan-300" /> Últimas notícias</h2>
          <p className="mb-5 text-sm text-slate-400">Principais movimentos do mercado com leitura educacional.</p>
          <div className="space-y-3">
            {news.map((item, index) => (
              <a key={`${item.title}-${index}`} href={item.url || '#'} target={item.url ? '_blank' : undefined} rel="noreferrer" className="block rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4 hover:border-cyan-400/40">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-cyan-500/10 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-cyan-300">{item.category || 'Mercado'}</span>
                  <span className="text-xs text-slate-500">{item.publishedAt || 'recente'}</span>
                </div>
                <p className="font-bold leading-snug text-white">{item.title}</p>
                <p className="mt-2 text-xs text-slate-500">{item.source || 'Fonte pública'}</p>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-slate-700/50 bg-slate-900/60 p-5 lg:p-6">
          <h2 className="mb-2 flex items-center gap-2 text-2xl font-black text-white"><Target className="h-6 w-6 text-amber-300" /> Ferramentas para estudar melhor</h2>
          <p className="mb-5 text-sm text-slate-400">Comece grátis. Aprofunde no Premium quando quiser IA, alertas e carteira simulada.</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {tools.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.title} to={tool.href} className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4 transition-colors hover:border-cyan-400/50">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10"><Icon className="h-5 w-5 text-cyan-300" /></div>
                    <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">{tool.tag}</span>
                  </div>
                  <h3 className="font-black text-white">{tool.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{tool.text}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr]">
        <div className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/10 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-black text-white"><TrendingUp className="h-6 w-6 text-cyan-300" /> Conta gratuita para qualquer investidor</h2>
          <p className="mb-5 leading-relaxed text-slate-300">Crie acesso com nome, e-mail e senha. Depois você entra no app, acompanha mais informações e vê a oferta Premium sem confundir com área de escritório.</p>
          <Link to="/cadastro-gratis" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-cyan-300">Criar conta grátis <ArrowRight className="h-4 w-4" /></Link>
        </div>

        <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-black text-white"><Building2 className="h-6 w-6 text-emerald-300" /> Área logada separada</h2>
          <p className="mb-5 leading-relaxed text-slate-300">Se você é cliente de assessor, assessor ou escritório, entra por uma área própria. A experiência do investidor avulso fica limpa.</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/area-logada" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-emerald-300">Abrir Área Logada</Link>
            <Link to="/assessores-escritorios" className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-slate-950/40 px-6 py-3 text-sm font-bold text-emerald-200 transition-colors hover:border-emerald-300">Para assessores e escritórios</Link>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-slate-700/50 bg-slate-900/60 p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-2xl font-black text-white"><ShieldCheck className="h-6 w-6 text-emerald-300" /> Aviso educacional</h2>
            <p className="max-w-4xl text-sm leading-relaxed text-slate-400">O F-Insight é informativo e educacional. Não executa ordens, não mostra custódia real e não constitui recomendação individualizada de investimento.</p>
          </div>
          <Link to="/privacidade" className="text-sm font-bold text-slate-400 hover:text-white">Privacidade e dados</Link>
        </div>
      </section>
    </Layout>
  );
}
