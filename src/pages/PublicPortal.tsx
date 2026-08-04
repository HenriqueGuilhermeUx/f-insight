import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Brain,
  Calculator,
  CheckCircle2,
  Globe2,
  LineChart,
  Mail,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
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
}

const fallbackIndicators: LiveIndicator[] = [
  { symbol: 'PETR4.SA', lastPrice: 38.42, changePercent: 0.72 },
  { symbol: 'VALE3.SA', lastPrice: 61.18, changePercent: -0.35 },
  { symbol: 'ITUB4.SA', lastPrice: 34.9, changePercent: 0.41 },
  { symbol: 'BBDC4.SA', lastPrice: 14.62, changePercent: -0.18 },
  { symbol: 'WEGE3.SA', lastPrice: 42.75, changePercent: 1.12 },
  { symbol: 'BBAS3.SA', lastPrice: 29.8, changePercent: 0.22 },
  { symbol: 'ABEV3.SA', lastPrice: 12.34, changePercent: -0.41 },
  { symbol: 'RENT3.SA', lastPrice: 52.1, changePercent: 1.03 },
];

const marketIndexes = [
  { label: 'IBOVESPA', value: '178.002,02', prefix: 'R$', change: '0,00%', tone: 'neutral' },
  { label: 'S&P 500', value: '7.600,50', prefix: 'US$', change: '+1,48%', tone: 'up' },
  { label: 'Dólar / Real', value: '5,10', prefix: 'R$', change: '+0,15%', tone: 'up' },
  { label: 'Bitcoin', value: '63.898,00', prefix: 'US$', change: '+1,90%', tone: 'up' },
];

const fallbackNews: NewsItem[] = [
  { title: 'Agosto traz para SC nomes importantes da economia e investimentos do Brasil', source: 'noticenter.com.br', category: 'Brasil', publishedAt: '14h atrás' },
  { title: 'Temos que fortalecer cadeias para atrair investimentos, diz Invest Minas', source: 'CNN Brasil', category: 'Brasil', publishedAt: '21h atrás' },
  { title: 'Bolsas globais avançam, Ibovespa sobe e commodities movimentam o agronegócio', source: 'Portal do Agronegócio', category: 'Global', publishedAt: '23h atrás' },
  { title: 'Ações que roubaram a cena no Ibovespa: altas fortes e quedas no radar', source: 'Seu Dinheiro', category: 'Brasil', publishedAt: '2d atrás' },
];

const features = [
  { title: 'Análise Técnica', text: 'RSI, MACD, médias, tendência, volatilidade e leitura de preço.', icon: LineChart },
  { title: 'IA Financeira', text: 'Assistente para resumir cenário, explicar indicadores e organizar perguntas.', icon: Brain },
  { title: 'Alertas de Preço', text: 'Monitore ativos e receba sinais quando preço ou variação chamarem atenção.', icon: Bell },
  { title: 'Screener de Ações', text: 'Filtre por P/L, P/VP, dividend yield, margem, volume e liquidez.', icon: Target },
  { title: 'Portfólio', text: 'Acompanhe uma carteira educativa e simule exposição por classe de ativo.', icon: BarChart3 },
  { title: 'Macro & Juros', text: 'SELIC, inflação, dólar, curva de juros e leitura de cenário.', icon: Globe2 },
  { title: 'Graham & Valor', text: 'Ranking educativo de margem de segurança e qualidade fundamentalista.', icon: Calculator },
  { title: 'Backtesting', text: 'Teste premissas com histórico antes de transformar ideia em estratégia.', icon: Sparkles },
];

const screenerRows = [
  { ticker: 'PETR4', name: 'Petrobras PN', pe: '5,1x', pvp: '1,2x', dy: '12,4%', roe: '23%', score: 'Valor' },
  { ticker: 'BBAS3', name: 'Banco do Brasil ON', pe: '4,8x', pvp: '0,9x', dy: '9,8%', roe: '21%', score: 'Dividendos' },
  { ticker: 'VALE3', name: 'Vale ON', pe: '6,7x', pvp: '1,4x', dy: '7,1%', roe: '18%', score: 'Commodities' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco PN', pe: '8,9x', pvp: '1,7x', dy: '6,2%', roe: '20%', score: 'Qualidade' },
];

const learningBlocks = [
  'Preço mostra o que o mercado aceita pagar agora. Valor exige premissas, risco e horizonte.',
  'P/L baixo pode indicar oportunidade, mas também pode refletir lucro cíclico ou risco escondido.',
  'Dividend yield alto só é saudável quando lucro, caixa e payout sustentam a distribuição.',
  'Juros altos elevam o custo de oportunidade e mudam a régua de valuation.',
];

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2).replace('.', ',')}%`;
}

function cleanSymbol(symbol: string) {
  return symbol.replace('.SA', '');
}

function symbolName(symbol: string) {
  const names: Record<string, string> = {
    'PETR4.SA': 'Petrobras PN',
    'VALE3.SA': 'Vale ON',
    'ITUB4.SA': 'Itaú Unibanco PN',
    'BBDC4.SA': 'Bradesco PN',
    'WEGE3.SA': 'WEG ON',
    'BBAS3.SA': 'Banco do Brasil ON',
    'ABEV3.SA': 'Ambev ON',
    'RENT3.SA': 'Localiza ON',
  };
  return names[symbol] || cleanSymbol(symbol);
}

function formatUpdatedAt(value?: string) {
  if (!value) return 'base educativa';
  return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function normalizeNews(payload: unknown): NewsItem[] {
  const raw = payload as { data?: NewsItem[]; news?: NewsItem[]; articles?: NewsItem[] } | NewsItem[];
  const list = Array.isArray(raw) ? raw : raw?.data || raw?.news || raw?.articles || [];
  return list.filter(Boolean).slice(0, 4);
}

export default function PublicPortal() {
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [news, setNews] = useState<NewsItem[]>(fallbackNews);
  const [isLive, setIsLive] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [profile, setProfile] = useState<PublicPortalProfile>('investidor');
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    fetch(API_ENDPOINTS.live.indicators)
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        const data = payload?.data || [];
        setIndicators(data);
        setIsLive(data.length > 0);
      })
      .catch(() => {
        setIndicators([]);
        setIsLive(false);
      });

    fetch(API_ENDPOINTS.news.list)
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        const next = normalizeNews(payload);
        if (next.length > 0) setNews(next);
      })
      .catch(() => setNews(fallbackNews));
  }, []);

  const marketData = indicators.length > 0 ? indicators : fallbackIndicators;
  const updatedAt = formatUpdatedAt(marketData[0]?.fetchedAt);

  const marketMood = useMemo(() => {
    const avg = marketData.reduce((sum, item) => sum + item.changePercent, 0) / marketData.length;
    if (avg > 0.6) return { label: 'Mercado construtivo', text: 'A amostra acompanhada está positiva. Busque confirmar se o movimento vem de fundamento, fluxo ou notícia.' };
    if (avg < -0.6) return { label: 'Mercado pressionado', text: 'A amostra está negativa. Foque em risco, liquidez, qualidade e horizonte de tempo.' };
    return { label: 'Mercado misto', text: 'Sem direção única. É hora de separar empresas, setores, valuation e cenário macro.' };
  }, [marketData]);

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await registerPublicPortalLead({ name, email, profile, interests: ['relatorio-semanal', 'portal-publico', 'radar'] });
      setRegistered(true);
      setEmail('');
      setName('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <header className="sticky top-0 z-50 border-b border-cyan-500/10 bg-[#070d19]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1540px] items-center justify-between gap-4 px-5 py-4">
          <Link to="/portal" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 shadow-lg shadow-cyan-500/10">
              <LineChart className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-cyan-300">F-Insight</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Inteligência financeira</p>
            </div>
          </Link>

          <nav className="hidden max-w-[860px] flex-1 flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs font-black uppercase tracking-[0.12em] text-slate-400 xl:flex">
            {['Dashboard', 'Radar', 'Ativos', 'Análise', 'Trading', 'Alertas', 'Mercado', 'RWA', 'CriptoZen', 'Aprender', 'Mais'].map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace('á', 'a')}`} className="hover:text-cyan-300">{item}</a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/precos" className="hidden rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-black text-amber-200 hover:border-amber-400/60 sm:inline-flex">
              Premium
            </Link>
            <Link to="/login" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300 hover:border-emerald-400/50">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1540px] px-5 py-6">
        <section id="dashboard" className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/14 via-slate-900 to-[#07111f] p-6 lg:p-10">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-emerald-300">Dados em tempo real</span>
              <span className="rounded-full border border-slate-700 bg-slate-950/50 px-3 py-1 text-xs font-bold text-slate-400">Atualizado {updatedAt}</span>
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">{isLive ? 'API F-Insight ativa' : 'Modo demonstrativo'}</span>
            </div>
            <h1 className="max-w-5xl text-4xl font-black leading-tight tracking-tight lg:text-6xl">
              Inteligência financeira ao seu alcance.
            </h1>
            <p className="mt-5 max-w-4xl text-lg leading-relaxed text-slate-300">
              Análise técnica, fundamentos, indicadores macro, alertas de preço e IA financeira para investidores acompanharem mercado com clareza — gratuito, direto e sem complicação.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <a href="#newsletter" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300">
                Criar conta grátis
                <ArrowRight className="h-4 w-4" />
              </a>
              <a href="#screener" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950/60 px-6 py-3 text-sm font-bold text-white hover:border-cyan-400/60">
                Ver ações subvalorizadas
              </a>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-500">100% gratuito · Sem cartão de crédito · Acesso imediato</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {marketIndexes.map((item) => (
              <div key={item.label} className="rounded-[1.5rem] border border-slate-700/50 bg-slate-900/75 p-5">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{item.label}</p>
                <p className="mt-3 text-2xl font-black text-white"><span className="text-sm text-slate-500">{item.prefix}</span> {item.value}</p>
                <p className={item.tone === 'up' ? 'mt-2 text-sm font-black text-emerald-300' : 'mt-2 text-sm font-black text-slate-400'}>{item.change}</p>
              </div>
            ))}
            <div className="col-span-2 rounded-[1.5rem] border border-cyan-500/20 bg-cyan-500/10 p-5">
              <h2 className="text-2xl font-black">{marketMood.label}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{marketMood.text}</p>
            </div>
          </div>
        </section>

        <section id="radar" className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_430px]">
          <div className="rounded-[2rem] border border-slate-700/50 bg-slate-900/75 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-black"><BarChart3 className="h-6 w-6 text-cyan-300" /> Radar de Ativos</h2>
                <p className="mt-1 text-sm text-slate-400">Preço, variação, direção e ativos para acompanhar.</p>
              </div>
              <Link to="/app" className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300">Abrir app</Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <div className="grid grid-cols-[1fr_130px_120px_120px] bg-slate-950/80 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                <span>Ativo</span><span className="text-right">Preço</span><span className="text-right">Variação</span><span className="text-right">Sinal</span>
              </div>
              {marketData.slice(0, 8).map((item) => {
                const positive = item.changePercent >= 0;
                return (
                  <div key={item.symbol} className="grid grid-cols-[1fr_130px_120px_120px] items-center border-t border-slate-800 bg-slate-950/45 px-4 py-4">
                    <div><p className="font-mono text-base font-black text-cyan-300">{cleanSymbol(item.symbol)}</p><p className="text-xs text-slate-500">{symbolName(item.symbol)}</p></div>
                    <p className="text-right font-bold text-white">{formatMoney(item.lastPrice)}</p>
                    <p className={`flex items-center justify-end gap-1 text-right font-black ${positive ? 'text-emerald-300' : 'text-red-300'}`}>{positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}{formatPercent(item.changePercent)}</p>
                    <p className="text-right text-xs font-black text-slate-300">{positive ? 'Momento +' : 'Pressão'}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div id="mercado" className="rounded-[2rem] border border-slate-700/50 bg-slate-900/75 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black"><Newspaper className="h-6 w-6 text-cyan-300" /> Últimas Notícias</h2>
            <p className="mb-4 text-sm text-slate-400">Mercado financeiro em tempo real · Brasil e global</p>
            <div className="space-y-3">
              {news.map((item) => (
                <a key={item.title} href={item.url || '#'} className="block rounded-2xl border border-slate-800 bg-slate-950/55 p-4 hover:border-cyan-500/40">
                  <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-cyan-300">{item.category || 'Mercado'}</span>
                  <h3 className="mt-3 font-black text-white">{item.title}</h3>
                  <p className="mt-2 text-xs text-slate-500">{item.source || 'F-Insight'} · {item.publishedAt || 'recente'}</p>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section id="screener" className="mb-6 rounded-[2rem] border border-slate-700/50 bg-slate-900/75 p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black">Screener fundamentalista</h2>
              <p className="mt-1 text-sm text-slate-400">Inspirado em leitura de fundamentos: P/L, P/VP, dividend yield, ROE e qualidade.</p>
            </div>
            <span className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-300">Graham & Valor</span>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-800">
            <div className="grid grid-cols-[1fr_90px_90px_110px_90px_130px] bg-slate-950/80 px-4 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500">
              <span>Ativo</span><span className="text-right">P/L</span><span className="text-right">P/VP</span><span className="text-right">DY</span><span className="text-right">ROE</span><span className="text-right">Leitura</span>
            </div>
            {screenerRows.map((row) => (
              <div key={row.ticker} className="grid grid-cols-[1fr_90px_90px_110px_90px_130px] items-center border-t border-slate-800 bg-slate-950/45 px-4 py-4 text-sm">
                <div><p className="font-mono font-black text-cyan-300">{row.ticker}</p><p className="text-xs text-slate-500">{row.name}</p></div>
                <span className="text-right font-bold text-white">{row.pe}</span><span className="text-right font-bold text-white">{row.pvp}</span><span className="text-right font-bold text-emerald-300">{row.dy}</span><span className="text-right font-bold text-white">{row.roe}</span><span className="text-right text-xs font-black text-amber-300">{row.score}</span>
              </div>
            ))}
          </div>
        </section>

        <section id="analise" className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div key={feature.title} className="rounded-[1.5rem] border border-slate-700/50 bg-slate-900/75 p-5">
                <Icon className="mb-4 h-7 w-7 text-cyan-300" />
                <h3 className="text-lg font-black text-white">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{feature.text}</p>
              </div>
            );
          })}
        </section>

        <section id="aprender" className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
          {learningBlocks.map((item, index) => (
            <div key={item} className="rounded-[1.5rem] border border-slate-700/50 bg-slate-900/75 p-5">
              <BookOpen className="mb-4 h-6 w-6 text-cyan-300" />
              <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Aprender {index + 1}</p>
              <p className="text-sm leading-relaxed text-slate-300">{item}</p>
            </div>
          ))}
        </section>

        <section id="premium" className="mb-6 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_430px]">
          <div className="rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/12 via-slate-900 to-slate-950 p-6">
            <h2 className="text-3xl font-black">Tudo que você precisa para investir melhor.</h2>
            <p className="mt-3 max-w-4xl text-slate-300 leading-relaxed">Ferramentas profissionais, dados, radar, alertas e inteligência artificial — com versão gratuita para o público e versão premium/white-label para assessores e escritórios.</p>
            <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
              {[['20+', 'Indicadores técnicos'], ['500+', 'Ações analisadas'], ['Tempo real', 'Dados de mercado'], ['Gratuito', 'Acesso inicial']].map(([big, small]) => (
                <div key={big} className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-4"><p className="text-2xl font-black text-cyan-300">{big}</p><p className="mt-1 text-xs font-bold text-slate-500">{small}</p></div>
              ))}
            </div>
          </div>

          <form id="newsletter" onSubmit={handleRegister} className="rounded-[2rem] border border-slate-700/50 bg-slate-900/75 p-5">
            <Mail className="mb-4 h-6 w-6 text-cyan-300" />
            <h2 className="text-2xl font-black">Receba análises semanais</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">Relatório semanal gratuito com resumo de mercado, ativos em destaque e novidades da plataforma.</p>
            <div className="mt-4 space-y-3">
              <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Seu nome (opcional)" className="w-full rounded-xl border border-slate-700/60 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/60" />
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="seu@email.com" className="w-full rounded-xl border border-slate-700/60 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/60" />
              <select value={profile} onChange={(event) => setProfile(event.target.value as PublicPortalProfile)} className="w-full rounded-xl border border-slate-700/60 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400/60">
                <option value="investidor">Investidor</option><option value="assessor">Assessor</option><option value="escritorio">Escritório</option><option value="estudante">Estudante</option><option value="curioso">Curioso</option>
              </select>
              <button disabled={!email.trim() || submitting || registered} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-60">
                {registered ? <CheckCircle2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}{registered ? 'Cadastro recebido' : submitting ? 'Enviando...' : 'Receber relatórios semanais'}
              </button>
              <p className="text-xs text-slate-500">Confirmação por e-mail · Sem spam · Cancele a qualquer momento</p>
            </div>
          </form>
        </section>

        <footer className="grid grid-cols-1 gap-5 rounded-[1.5rem] border border-slate-800 bg-slate-950/70 p-5 text-sm text-slate-400 md:grid-cols-[1fr_1fr_1fr]">
          <div><h3 className="font-black text-white">F-Insight</h3><p className="mt-2">Inteligência financeira clara e acessível para todos.</p><p className="mt-2 text-xs">© 2026 F-Insight — Alternative Ventures.</p></div>
          <div><h3 className="font-black text-white">Recursos</h3><p className="mt-2">Radar de Ativos · Simulador · Painel Macro · Assistente IA · CriptoZen</p></div>
          <div><h3 className="font-black text-white">Aviso educacional</h3><p className="mt-2">As informações têm caráter educacional e não constituem recomendação de investimento, consultoria personalizada ou promessa de rentabilidade.</p></div>
        </footer>
      </main>
    </div>
  );
}
