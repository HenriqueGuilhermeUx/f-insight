import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Building2,
  Calculator,
  CheckCircle2,
  Clock3,
  Globe2,
  LineChart,
  LockKeyhole,
  Mail,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  WalletCards,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import API_ENDPOINTS from '@/config/api';
import { registerPublicPortalLead, type PublicPortalProfile } from '@/services/publicPortal';

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
  summary?: string;
}

interface MacroItem {
  label: string;
  value: string;
  detail: string;
  source: string;
  tone?: 'up' | 'down' | 'neutral' | 'attention';
}

const fallbackIndicators: LiveIndicator[] = [
  { symbol: 'PETR4.SA', lastPrice: 38.42, changePercent: 0.72 },
  { symbol: 'VALE3.SA', lastPrice: 61.18, changePercent: -0.35 },
  { symbol: 'ITUB4.SA', lastPrice: 34.9, changePercent: 0.41 },
  { symbol: 'BBAS3.SA', lastPrice: 29.8, changePercent: 0.22 },
  { symbol: 'WEGE3.SA', lastPrice: 42.75, changePercent: 1.12 },
  { symbol: 'BBDC4.SA', lastPrice: 14.62, changePercent: -0.18 },
  { symbol: 'ABEV3.SA', lastPrice: 12.34, changePercent: -0.41 },
  { symbol: 'RENT3.SA', lastPrice: 52.1, changePercent: 1.03 },
];

const fallbackIndexes = [
  { label: 'IBOVESPA', value: '178.002', change: 'acompanhar', tone: 'neutral' },
  { label: 'S&P 500', value: '7.600', change: '+1,48%', tone: 'up' },
  { label: 'Dólar / Real', value: 'R$ 5,10', change: '+0,15%', tone: 'up' },
  { label: 'Bitcoin', value: 'US$ 63.898', change: '+1,90%', tone: 'up' },
];

const fallbackMacro: MacroItem[] = [
  { label: 'Selic meta', value: '15,00%', detail: 'Juros altos aumentam a régua para renda variável e valorizam caixa, qualidade e previsibilidade.', source: 'cache macro F-Insight', tone: 'attention' },
  { label: 'CDI', value: 'próx. Selic', detail: 'Referência diária para comparar oportunidades contra renda fixa pós-fixada.', source: 'cache macro F-Insight', tone: 'neutral' },
  { label: 'IPCA', value: 'monitorar', detail: 'Inflação pressiona juros reais, consumo, varejo, custos e valuation.', source: 'cache macro F-Insight', tone: 'attention' },
  { label: 'IFIX', value: 'radar', detail: 'Fundos imobiliários reagem a juros longos, vacância, DY e P/VP.', source: 'cache macro F-Insight', tone: 'neutral' },
];

const fallbackNews: NewsItem[] = [
  { title: 'Mercado acompanha juros, dólar, commodities e temporada de resultados.', source: 'F-Insight Radar', category: 'Brasil', publishedAt: 'agora' },
  { title: 'Bancos, petróleo, mineração e energia seguem entre os setores de maior atenção na B3.', source: 'F-Insight Research', category: 'Ações', publishedAt: 'hoje' },
  { title: 'Juros altos exigem mais disciplina em valuation, margem de segurança e seleção de qualidade.', source: 'F-Insight Macro', category: 'Macro', publishedAt: 'hoje' },
  { title: 'Carteiras simuladas ajudam o investidor a testar ideias sem movimentar patrimônio real.', source: 'F-Insight Educação', category: 'Aprender', publishedAt: 'semana' },
];

const toolCards = [
  { title: 'Graham & Valor', text: 'Ranking educativo por margem de segurança, múltiplos, qualidade e critérios fundamentalistas.', href: '/graham-valor', icon: Calculator, tag: 'Valor' },
  { title: 'Screener de Ações', text: 'Filtre ativos por P/L, P/VP, dividend yield, ROE, setor, liquidez e sinais.', href: '/screener-acoes', icon: Target, tag: 'Pesquisa' },
  { title: 'Backtesting', text: 'Teste premissas com dados históricos antes de transformar hipótese em estratégia.', href: '/backtesting', icon: LineChart, tag: 'Simulação' },
  { title: 'IA Financeira', text: 'Explique indicadores, resuma notícias e transforme dados em linguagem simples.', href: '/premium', icon: Brain, tag: 'Premium' },
  { title: 'Carteira simulada', text: 'Monte uma carteira fictícia, acompanhe risco, concentração e evolução educativa.', href: '/premium', icon: WalletCards, tag: 'Premium' },
  { title: 'Alertas inteligentes', text: 'Preço, variação, dividendos, volatilidade e eventos importantes no radar.', href: '/alertas', icon: Bell, tag: 'Alertas' },
  { title: 'Macro & Juros', text: 'Selic, CDI, IPCA, dólar, curva de juros, IFIX e resumo macro do dia.', href: '/macro', icon: Globe2, tag: 'Macro' },
  { title: 'Relatórios semanais', text: 'Resumo de mercado, principais riscos, destaques e leitura educacional.', href: '/premium', icon: Newspaper, tag: 'Conteúdo' },
];

const premiumBullets = [
  'IA Financeira completa para explicar ativos, indicadores e notícias',
  'Screener avançado com filtros de valor, dividendos, qualidade e risco',
  'Carteira simulada com rentabilidade, concentração e aprendizado',
  'Backtesting e alertas inteligentes para estudar hipóteses com disciplina',
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
    'ABEV3.SA': 'Ambev ON',
    'RENT3.SA': 'Localiza ON',
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

function normalizeNews(payload: unknown): NewsItem[] {
  const raw = payload as { data?: NewsItem[]; news?: NewsItem[]; articles?: NewsItem[] } | NewsItem[];
  const list = Array.isArray(raw) ? raw : raw?.data || raw?.news || raw?.articles || [];
  return list.filter(Boolean).slice(0, 4);
}

function normalizeMacro(payload: unknown): MacroItem[] {
  const raw = payload as { data?: any[]; indicators?: any[]; macro?: any[]; dataPoints?: any[] } | any[];
  const list = Array.isArray(raw) ? raw : raw?.data || raw?.indicators || raw?.macro || raw?.dataPoints || [];
  if (!Array.isArray(list) || list.length === 0) return fallbackMacro;

  const parsed = list.slice(0, 6).map((item) => ({
    label: String(item.label || item.name || item.indicator || item.symbol || 'Indicador'),
    value: String(item.value || item.current || item.last || item.rate || item.formattedValue || '-'),
    detail: String(item.description || item.detail || item.summary || item.change || 'Dado macro acompanhado pelo F-Insight.'),
    source: String(item.source || item.provider || 'API F-Insight'),
    tone: 'neutral' as const,
  }));

  return parsed.length > 0 ? parsed : fallbackMacro;
}

export default function Home() {
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [news, setNews] = useState<NewsItem[]>(fallbackNews);
  const [macro, setMacro] = useState<MacroItem[]>(fallbackMacro);
  const [isLive, setIsLive] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [profile, setProfile] = useState<PublicPortalProfile>('investidor');
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

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

    fetch(API_ENDPOINTS.news.list)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        const next = normalizeNews(payload);
        if (next.length > 0) setNews(next);
      })
      .catch(() => setNews(fallbackNews));

    fetch(API_ENDPOINTS.macro.overview)
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => setMacro(normalizeMacro(payload)))
      .catch(() => setMacro(fallbackMacro));
  }, []);

  const marketData = indicators.length > 0 ? indicators : fallbackIndicators;
  const updatedAt = formatUpdatedAt(marketData[0]?.fetchedAt);

  const marketMood = useMemo(() => {
    const avg = marketData.reduce((sum, item) => sum + item.changePercent, 0) / marketData.length;
    if (avg > 0.6) return { label: 'Mercado construtivo', text: 'A amostra acompanhada está positiva. Confirme se o movimento vem de fundamento, fluxo ou notícia.' };
    if (avg < -0.6) return { label: 'Mercado pressionado', text: 'A amostra está negativa. Foque em risco, liquidez, qualidade e horizonte.' };
    return { label: 'Mercado misto', text: 'Sem direção única. Separe empresas, setores, valuation e cenário macro.' };
  }, [marketData]);

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await registerPublicPortalLead({
        name,
        email,
        profile,
        interests: ['conta-gratis', 'relatorio-semanal', 'premium-investidor'],
      });
      setRegistered(true);
      setEmail('');
      setName('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <section className="mb-6 overflow-hidden rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/14 via-slate-900 to-slate-950 p-6 lg:p-10">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
          <div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
                <Sparkles className="h-3.5 w-3.5" />
                Dados de mercado e inteligência financeira
              </span>
              <span className="rounded-full border border-slate-700 bg-slate-950/60 px-3 py-1 text-xs font-bold text-slate-400">
                Atualizado {updatedAt}
              </span>
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">
                {isLive ? 'API F-Insight ativa' : 'modo educativo/fallback'}
              </span>
            </div>

            <h1 className="max-w-5xl text-4xl font-black leading-tight tracking-tight text-white lg:text-6xl">
              Inteligência financeira ao seu alcance.
            </h1>
            <p className="mt-5 max-w-4xl text-lg leading-relaxed text-slate-300">
              Acompanhe cotações Brasil, índices de mercado, notícias, painel macro, fundamentos, Graham & Valor, screener, backtesting e IA financeira em uma experiência simples para estudar melhor suas decisões econômicas.
            </p>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#conta-gratis" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-cyan-300">
                Criar conta grátis
                <ArrowRight className="h-4 w-4" />
              </a>
              <Link to="/premium" className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-3 text-sm font-black text-amber-200 transition-colors hover:border-amber-400/70">
                Ver Premium R$ 19,90
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950/60 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-emerald-400/60">
                <LockKeyhole className="h-4 w-4" />
                Área Logada
              </Link>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-500">Gratuito para começar · Premium opcional · Área separada para clientes, assessores e escritórios</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {fallbackIndexes.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-slate-700/50 bg-slate-900/75 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-3 text-2xl font-black text-white">{item.value}</p>
                <p className={item.tone === 'up' ? 'mt-2 text-sm font-black text-emerald-300' : 'mt-2 text-sm font-black text-slate-400'}>{item.change}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-[2rem] border border-slate-700/50 bg-slate-900/60 p-5 lg:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-black text-white">
                <BarChart3 className="h-6 w-6 text-cyan-300" />
                Radar Brasil
              </h2>
              <p className="text-sm text-slate-400">Cotações acompanhadas pela API F-Insight.</p>
            </div>
            <Link to="/radar" className="text-sm font-bold text-cyan-300 hover:text-cyan-200">Ver radar</Link>
          </div>

          <div className="overflow-hidden rounded-2xl border border-slate-700/50">
            {marketData.slice(0, 8).map((asset) => {
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
          <h2 className="mb-2 flex items-center gap-2 text-2xl font-black text-white">
            <Globe2 className="h-6 w-6 text-emerald-300" />
            Painel Macro
          </h2>
          <p className="mb-5 text-sm text-slate-400">Juros, inflação, dólar e régua de oportunidade.</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-1">
            {macro.slice(0, 4).map((item) => (
              <div key={item.label} className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.15em] text-slate-500">{item.label}</p>
                  <span className="text-[10px] font-bold text-slate-600">{item.source}</span>
                </div>
                <p className="text-2xl font-black text-white">{item.value}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="rounded-[2rem] border border-slate-700/50 bg-slate-900/60 p-5 lg:p-6">
          <h2 className="mb-2 flex items-center gap-2 text-2xl font-black text-white">
            <Newspaper className="h-6 w-6 text-cyan-300" />
            Últimas notícias
          </h2>
          <p className="mb-5 text-sm text-slate-400">Mercado financeiro em tempo real, com leitura educacional.</p>
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
          <h2 className="mb-2 flex items-center gap-2 text-2xl font-black text-white">
            <Target className="h-6 w-6 text-amber-300" />
            Tudo que você precisa para investir melhor
          </h2>
          <p className="mb-5 text-sm text-slate-400">Ferramentas profissionais, dados e IA — com versão gratuita e aprofundamento no Premium.</p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {toolCards.map((tool) => {
              const Icon = tool.icon;
              return (
                <Link key={tool.title} to={tool.href} className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4 transition-colors hover:border-cyan-400/50">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/10">
                      <Icon className="h-5 w-5 text-cyan-300" />
                    </div>
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
        <div className="rounded-[2rem] border border-amber-500/20 bg-amber-500/10 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-black text-white">
            <Sparkles className="h-6 w-6 text-amber-300" />
            Premium para investidores independentes
          </h2>
          <p className="mb-5 leading-relaxed text-slate-300">
            Para quem não veio de um escritório ou assessor, o Premium individual entrega profundidade: IA completa, carteira simulada, alertas inteligentes, screener avançado e relatórios.
          </p>
          <div className="space-y-3">
            {premiumBullets.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-slate-950/30 p-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
                <span className="text-sm text-slate-200">{item}</span>
              </div>
            ))}
          </div>
          <Link to="/premium" className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-amber-300">
            Conhecer Premium R$ 19,90
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 p-6">
          <h2 className="mb-3 flex items-center gap-2 text-2xl font-black text-white">
            <Building2 className="h-6 w-6 text-emerald-300" />
            Para assessores e escritórios
          </h2>
          <p className="mb-5 leading-relaxed text-slate-300">
            A estrutura B2B continua separada: portal white-label, comunicação com clientes, relatórios do escritório, workspace do assessor e área logada protegida.
          </p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {['Portal com marca do escritório', 'App/área do cliente assessorado', 'Workspace do assessor', 'Relatórios e relacionamento'].map((item) => (
              <div key={item} className="rounded-2xl border border-emerald-500/20 bg-slate-950/30 p-3 text-sm font-semibold text-slate-200">{item}</div>
            ))}
          </div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <Link to="/assessores-escritorios" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-emerald-300">
              Conhecer solução B2B
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-slate-950/40 px-6 py-3 text-sm font-bold text-emerald-200 transition-colors hover:border-emerald-300">
              Área Logada
            </Link>
          </div>
        </div>
      </section>

      <section id="conta-gratis" className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/10 p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
          <div>
            <h2 className="mb-3 flex items-center gap-2 text-3xl font-black text-white">
              <Mail className="h-7 w-7 text-cyan-300" />
              Comece grátis e receba análises semanais
            </h2>
            <p className="leading-relaxed text-slate-300">
              Entre na base gratuita para receber relatórios, acompanhar o radar e ser avisado quando liberarmos a conta completa com watchlist, alertas e carteira simulada.
            </p>
            <p className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="h-4 w-4" />
              Plataforma informativa e educacional. Não constitui recomendação de investimento.
            </p>
          </div>

          <form onSubmit={handleRegister} className="rounded-3xl border border-slate-700/50 bg-slate-950/50 p-5">
            {registered ? (
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 p-5 text-emerald-200">
                <h3 className="mb-2 font-black">Cadastro recebido.</h3>
                <p className="text-sm text-emerald-100/80">Você entrou na lista de relatórios e acesso gratuito.</p>
              </div>
            ) : (
              <div className="space-y-3">
                <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome (opcional)" className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400" />
                <input value={email} onChange={(event) => setEmail(event.target.value)} placeholder="seu@email.com" type="email" required className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400" />
                <select value={profile} onChange={(event) => setProfile(event.target.value as PublicPortalProfile)} className="w-full rounded-2xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white outline-none focus:border-cyan-400">
                  <option value="investidor">Investidor</option>
                  <option value="assessor">Assessor</option>
                  <option value="escritorio">Escritório</option>
                  <option value="estudante">Estudante</option>
                  <option value="curioso">Estou aprendendo</option>
                </select>
                <button disabled={submitting} className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-cyan-300 disabled:opacity-60">
                  {submitting ? 'Enviando...' : 'Receber relatórios semanais'}
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-center text-xs text-slate-500">Confirmação por e-mail · Sem spam · Cancele quando quiser</p>
              </div>
            )}
          </form>
        </div>
      </section>

      <footer className="py-8 text-xs leading-relaxed text-slate-500">
        <div className="mb-3 flex items-center gap-2 font-semibold text-slate-400">
          <Clock3 className="h-4 w-4" />
          Dados de mercado fornecidos por fontes públicas e cache F-Insight; podem ter atraso e falhas temporárias.
        </div>
        <p>
          O F-Insight é uma plataforma informativa e educacional. As informações apresentadas não constituem recomendação de investimento, consultoria individualizada ou garantia de rentabilidade. Investimentos envolvem riscos.
        </p>
      </footer>
    </Layout>
  );
}
