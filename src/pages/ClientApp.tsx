import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Briefcase,
  Calculator,
  CheckCircle2,
  Download,
  FileText,
  Home,
  LineChart,
  MessageCircle,
  PiggyBank,
  Reply,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
  WalletCards,
} from 'lucide-react';
import API_ENDPOINTS from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { getWorkspaceStats } from '@/services/workspace';
import {
  loadAdvisorClientMessages,
  sendAdvisorClientMessage,
  topicLabels,
  type AdvisorClientMessage,
} from '@/services/advisorClientMessages';

interface LiveIndicator {
  symbol: string;
  lastPrice: number;
  changePercent: number;
  fetchedAt?: string;
}

const fallbackIndicators: LiveIndicator[] = [
  { symbol: 'PETR4.SA', lastPrice: 38.42, changePercent: 0.72 },
  { symbol: 'VALE3.SA', lastPrice: 61.18, changePercent: -0.35 },
  { symbol: 'ITUB4.SA', lastPrice: 34.90, changePercent: 0.41 },
  { symbol: 'BBDC4.SA', lastPrice: 14.62, changePercent: -0.18 },
  { symbol: 'WEGE3.SA', lastPrice: 42.75, changePercent: 1.12 },
];

const quickQuestions = [
  'O que mudou no cenário de juros e dólar?',
  'Quais riscos merecem atenção antes da próxima conversa?',
  'Que relatório eu deveria ler primeiro?',
];

const decisionChecklist = [
  'Entendi o cenário macro?',
  'Sei qual risco principal estou assumindo?',
  'Comparei preço, valor e prazo?',
  'Conversei com um profissional antes de agir?',
];

const educationCards = [
  { title: 'Juros e renda fixa', progress: 68, next: 'Custo de oportunidade' },
  { title: 'Valuation sem complicação', progress: 42, next: 'Margem de segurança' },
  { title: 'Dólar e proteção', progress: 31, next: 'Exposição cambial' },
];

const STORAGE_KEY = 'f-insight-app-watchlist';

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
  };
  return names[symbol] || cleanSymbol(symbol);
}

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function formatUpdatedAt(value?: string) {
  if (!value) return 'modo educativo';
  return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function loadWatchlist() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as string[] : ['PETR4.SA', 'ITUB4.SA'];
  } catch {
    return ['PETR4.SA', 'ITUB4.SA'];
  }
}

export default function ClientApp() {
  const { user } = useAuth();
  const { tenant, buildReportParams } = useTenant();
  const stats = getWorkspaceStats();
  const advisor = stats.advisors[0];
  const defaultClient = stats.clients[0];
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [messages, setMessages] = useState<AdvisorClientMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(Boolean(user));
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>(() => loadWatchlist());
  const [price, setPrice] = useState('28');
  const [fairValue, setFairValue] = useState('36');
  const [usdExpense, setUsdExpense] = useState('500');
  const [usdRate, setUsdRate] = useState('5.12');

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
  }, []);

  useEffect(() => {
    if (!user) return;
    let mounted = true;
    loadAdvisorClientMessages({ limit: 8 }).then((data) => {
      if (mounted) setMessages(data);
    }).finally(() => {
      if (mounted) setLoadingMessages(false);
    });
    return () => { mounted = false; };
  }, [user]);

  const marketData = indicators.length > 0 ? indicators : fallbackIndicators;
  const latestMessage = messages[0];
  const watchedAssets = marketData.filter((item) => watchlist.includes(item.symbol));
  const unreadCount = Math.min(messages.length, 9);
  const updatedAt = formatUpdatedAt(marketData[0]?.fetchedAt);

  const reports = useMemo(() => {
    const visible = stats.reports
      .filter((report) => report.visibility === 'cliente')
      .map((report) => ({ ticker: report.ticker, title: report.title, summary: report.summary }));

    return visible.length > 0 ? visible : [
      { ticker: 'PETR4', title: 'Como ler um relatório de valuation', summary: 'Valor intrínseco e margem de segurança' },
      { ticker: 'VALE3', title: 'Dólar, commodities e empresas exportadoras', summary: 'Cenário macro e sensibilidade cambial' },
    ];
  }, [stats.reports]);

  const marketMood = useMemo(() => {
    const avg = marketData.reduce((sum, item) => sum + item.changePercent, 0) / marketData.length;
    if (avg > 0.6) return { label: 'Mercado construtivo', text: 'A amostra acompanhada está positiva. Vale checar se o movimento vem de fundamento, fluxo ou notícia.' };
    if (avg < -0.6) return { label: 'Mercado pressionado', text: 'A amostra acompanhada está negativa. O foco deve ser risco, liquidez e qualidade.' };
    return { label: 'Mercado misto', text: 'Sem direção única. Bom momento para separar empresas, setores e cenário macro.' };
  }, [marketData]);

  const margin = useMemo(() => {
    const current = Number(price.replace(',', '.'));
    const target = Number(fairValue.replace(',', '.'));
    if (!current || !target) return null;
    return ((target - current) / target) * 100;
  }, [price, fairValue]);

  const dollarImpact = useMemo(() => {
    const amount = Number(usdExpense.replace(',', '.'));
    const rate = Number(usdRate.replace(',', '.'));
    if (!amount || !rate) return null;
    return amount * rate;
  }, [usdExpense, usdRate]);

  function toggleWatch(symbol: string) {
    setWatchlist((current) => {
      const next = current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }

  function openReport(ticker: string) {
    const params = buildReportParams();
    const url = `${API_ENDPOINTS.reports.valuation(ticker)}?${params.toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function refreshMessages() {
    const data = await loadAdvisorClientMessages({ limit: 8 });
    setMessages(data);
  }

  async function sendQuestion(text?: string) {
    if (!user) {
      setFeedback('Entre como cliente ou acesse a demo para enviar dúvidas ao assessor.');
      return;
    }

    const finalText = (text || question).trim();
    if (!finalText) return;

    setSending(true);
    setFeedback('');
    try {
      await sendAdvisorClientMessage({
        tenantId: stats.tenant?.id,
        advisorId: advisor?.id,
        clientId: defaultClient?.id,
        clientName: user.fullName || defaultClient?.name || 'Cliente Final Demo',
        senderRole: 'client',
        senderName: user.fullName || defaultClient?.name || 'Cliente Final Demo',
        subject: 'Dúvida pelo app F-Insight',
        body: finalText,
        topic: 'question',
      });
      setQuestion('');
      setFeedback('Dúvida enviada. O assessor recebeu uma próxima ação.');
      await refreshMessages();
    } finally {
      setSending(false);
    }
  }

  const isProfessional = user?.role === 'advisor' || user?.role === 'admin';
  const isClient = user?.role === 'client' || user?.role === 'advisor' || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-[#07111f] text-white pb-24">
      <header className="sticky top-0 z-50 border-b border-cyan-500/10 bg-[#070d19]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <Link to="/app" className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 shadow-lg shadow-cyan-500/10 overflow-hidden shrink-0">
              {tenant.logoDataUrl && user ? <img src={tenant.logoDataUrl} alt={tenant.brandName} className="h-full w-full object-contain p-1" /> : <LineChart className="h-6 w-6 text-cyan-300" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-lg font-black tracking-tight text-cyan-300">F-Insight App</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">{user ? `${user.role === 'client' ? 'Cliente' : user.role === 'advisor' ? 'Assessor' : 'Admin'} · ${tenant.brandName}` : 'Mercado · decisões · educação'}</p>
            </div>
          </Link>

          <div className="flex items-center gap-2">
            <span className="hidden rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-300 sm:inline-flex">
              {isLive ? 'Dados ao vivo' : 'Modo educativo'}
            </span>
            <Link to={user ? '/portal' : '/login'} className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-3 py-2 text-xs font-bold text-cyan-200 hover:border-cyan-400/50">
              {user ? 'Portal' : 'Entrar'}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5 space-y-5">
        <section id="hoje" className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/12 via-slate-900 to-[#07111f] p-5 lg:p-7">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Hoje</span>
              <span className="rounded-full border border-slate-700 bg-slate-950/50 px-3 py-1 text-xs font-bold text-slate-400">Atualizado {updatedAt}</span>
            </div>
            <h1 className="max-w-3xl text-4xl font-black leading-tight tracking-tight lg:text-6xl">
              Seu centro de decisões econômicas.
            </h1>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-300 lg:text-lg">
              Acompanhe mercado, sinais, ativos de interesse, ferramentas educativas e, se você for cliente ou assessor, acesse mensagens, relatórios e próximas ações no mesmo app.
            </p>
            <div className="mt-5 grid grid-cols-3 gap-2">
              <a href="#mercado" className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-3 text-center">
                <BarChart3 className="mx-auto mb-2 h-5 w-5 text-cyan-300" />
                <p className="text-xs font-black">Mercado</p>
              </a>
              <a href="#sinais" className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-3 text-center">
                <Bell className="mx-auto mb-2 h-5 w-5 text-amber-300" />
                <p className="text-xs font-black">Sinais</p>
              </a>
              <a href="#acoes" className="rounded-2xl border border-slate-700/50 bg-slate-950/60 p-3 text-center">
                <Target className="mx-auto mb-2 h-5 w-5 text-emerald-300" />
                <p className="text-xs font-black">Ações</p>
              </a>
            </div>
          </div>

          <div id="sinais" className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/10 p-5">
              <Search className="mb-4 h-7 w-7 text-cyan-300" />
              <h2 className="text-2xl font-black">{marketMood.label}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{marketMood.text}</p>
            </div>
            <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 p-5">
              <ShieldCheck className="mb-4 h-7 w-7 text-emerald-300" />
              <h2 className="text-2xl font-black">Decisão com processo</h2>
              <p className="mt-2 text-sm leading-relaxed text-emerald-50/80">O app informa, sinaliza e organiza perguntas. Não substitui recomendação profissional nem mostra carteira real.</p>
            </div>
          </div>
        </section>

        <section id="mercado" className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_390px]">
          <div className="rounded-[2rem] border border-slate-700/50 bg-slate-900/70 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-black"><BarChart3 className="h-6 w-6 text-cyan-300" /> Radar de ativos</h2>
                <p className="mt-1 text-sm text-slate-400">Toque na estrela para acompanhar e criar sua lista de atenção.</p>
              </div>
              <Link to="/radar" className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300">Radar completo</Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <div className="grid grid-cols-[1fr_95px_90px_44px] bg-slate-950/80 px-3 py-3 text-xs font-black uppercase tracking-[0.14em] text-slate-500 sm:grid-cols-[1fr_120px_110px_54px]">
                <span>Ativo</span>
                <span className="text-right">Preço</span>
                <span className="text-right">Var.</span>
                <span />
              </div>
              {marketData.map((item) => {
                const positive = item.changePercent >= 0;
                const watched = watchlist.includes(item.symbol);
                return (
                  <div key={item.symbol} className="grid grid-cols-[1fr_95px_90px_44px] items-center border-t border-slate-800 bg-slate-950/45 px-3 py-4 sm:grid-cols-[1fr_120px_110px_54px]">
                    <div>
                      <p className="font-mono text-base font-black text-cyan-300">{cleanSymbol(item.symbol)}</p>
                      <p className="text-xs text-slate-500">{symbolName(item.symbol)}</p>
                    </div>
                    <p className="text-right text-sm font-bold text-white sm:text-base">{formatMoney(item.lastPrice)}</p>
                    <p className={`flex items-center justify-end gap-1 text-right text-sm font-black sm:text-base ${positive ? 'text-emerald-300' : 'text-red-300'}`}>
                      {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {formatPercent(item.changePercent)}
                    </p>
                    <button onClick={() => toggleWatch(item.symbol)} className={`ml-auto flex h-9 w-9 items-center justify-center rounded-xl border ${watched ? 'border-amber-400/30 bg-amber-400/10 text-amber-300' : 'border-slate-700 bg-slate-900 text-slate-500'}`}>
                      <Star className="h-4 w-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-700/50 bg-slate-900/70 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black"><Bell className="h-6 w-6 text-cyan-300" /> Minha lista</h2>
            {watchedAssets.length === 0 ? (
              <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4 text-sm text-slate-400">Marque ativos no radar para acompanhar aqui.</div>
            ) : (
              <div className="space-y-3">
                {watchedAssets.map((item) => (
                  <div key={item.symbol} className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-mono font-black text-cyan-300">{cleanSymbol(item.symbol)}</p>
                        <p className="text-xs text-slate-500">{symbolName(item.symbol)}</p>
                      </div>
                      <p className={item.changePercent >= 0 ? 'font-black text-emerald-300' : 'font-black text-red-300'}>{formatPercent(item.changePercent)}</p>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">Sinal: acompanhar variação, notícia relevante e relatório disponível.</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section id="ferramentas" className="grid grid-cols-1 gap-4 xl:grid-cols-3">
          <div className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/10 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><Calculator className="h-5 w-5 text-cyan-300" /> Margem de segurança</h2>
            <p className="mb-4 text-sm leading-relaxed text-slate-300">Compare preço e valor estimado como exercício educativo.</p>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-400">Preço</span>
                <input value={price} onChange={(event) => setPrice(event.target.value)} className="w-full rounded-xl border border-slate-700/60 bg-slate-950 px-3 py-3 text-white outline-none focus:border-cyan-400/60" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-400">Valor</span>
                <input value={fairValue} onChange={(event) => setFairValue(event.target.value)} className="w-full rounded-xl border border-slate-700/60 bg-slate-950 px-3 py-3 text-white outline-none focus:border-cyan-400/60" />
              </label>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Margem estimada</p>
              <p className={`mt-1 text-4xl font-black ${(margin || 0) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{margin === null ? '—' : formatPercent(margin)}</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-700/50 bg-slate-900/70 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><WalletCards className="h-5 w-5 text-emerald-300" /> Exposição ao dólar</h2>
            <p className="mb-4 text-sm leading-relaxed text-slate-400">Simule impacto de gastos ou compromissos em dólar.</p>
            <div className="grid grid-cols-2 gap-3">
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-400">US$</span>
                <input value={usdExpense} onChange={(event) => setUsdExpense(event.target.value)} className="w-full rounded-xl border border-slate-700/60 bg-slate-950 px-3 py-3 text-white outline-none focus:border-emerald-400/60" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-400">Câmbio</span>
                <input value={usdRate} onChange={(event) => setUsdRate(event.target.value)} className="w-full rounded-xl border border-slate-700/60 bg-slate-950 px-3 py-3 text-white outline-none focus:border-emerald-400/60" />
              </label>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Impacto em reais</p>
              <p className="mt-1 text-4xl font-black text-emerald-300">{dollarImpact === null ? '—' : formatMoney(dollarImpact)}</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-amber-500/20 bg-amber-500/10 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-xl font-black"><PiggyBank className="h-5 w-5 text-amber-300" /> Checklist antes de agir</h2>
            <div className="space-y-3">
              {decisionChecklist.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-amber-500/10 bg-slate-950/45 p-3">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-amber-300" />
                  <p className="text-sm text-amber-50/80">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {isClient && (
          <section id="cliente" className="grid grid-cols-1 gap-4 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[2rem] border border-slate-700/50 bg-slate-900/70 p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <h2 className="flex items-center gap-2 text-2xl font-black"><MessageCircle className="h-6 w-6 text-cyan-300" /> Mensagens</h2>
                <Link to="/contato" className="text-sm font-bold text-cyan-300">Histórico</Link>
              </div>
              {loadingMessages ? (
                <div className="h-28 rounded-2xl bg-slate-800/70 skeleton" />
              ) : latestMessage ? (
                <article className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-cyan-300">{topicLabels[latestMessage.topic] || latestMessage.topic}</span>
                    <span className="text-xs text-slate-500">{formatDate(latestMessage.createdAt)}</span>
                  </div>
                  <h3 className="font-black text-white">{latestMessage.subject}</h3>
                  <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-400">{latestMessage.body}</p>
                  <Link to="/contato" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-cyan-300">Responder <ArrowRight className="h-4 w-4" /></Link>
                </article>
              ) : (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4 text-sm text-slate-400">Nenhuma mensagem ainda.</div>
              )}
            </div>

            <div className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/10 p-5">
              <h2 className="flex items-center gap-2 text-2xl font-black"><Reply className="h-6 w-6 text-cyan-300" /> Perguntar ao assessor</h2>
              <p className="mt-1 text-sm text-slate-300">A dúvida vira próxima ação para o assessor.</p>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {quickQuestions.map((item) => (
                  <button key={item} onClick={() => setQuestion(item)} className="min-w-[220px] rounded-2xl border border-slate-700/50 bg-slate-950/70 p-3 text-left text-xs font-semibold text-slate-300">{item}</button>
                ))}
              </div>
              <textarea value={question} onChange={(event) => setQuestion(event.target.value)} rows={4} className="mt-4 w-full rounded-2xl border border-slate-700/50 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-cyan-400/60" placeholder="Digite sua dúvida..." />
              <button onClick={() => sendQuestion()} disabled={!question.trim() || sending} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-50">
                <Send className="h-4 w-4" /> {sending ? 'Enviando...' : 'Enviar ao assessor'}
              </button>
              {feedback && <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-300"><CheckCircle2 className="h-4 w-4" /> {feedback}</p>}
            </div>
          </section>
        )}

        <section id="relatorios" className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_390px]">
          <div className="rounded-[2rem] border border-slate-700/50 bg-slate-900/70 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="flex items-center gap-2 text-2xl font-black"><FileText className="h-6 w-6 text-cyan-300" /> Relatórios e estudos</h2>
              <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-xs font-bold text-cyan-300">{reports.length}</span>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {reports.map((report) => (
                <button key={`${report.ticker}-${report.title}`} onClick={() => openReport(report.ticker)} className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4 text-left">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-sm font-black text-cyan-300">{report.ticker}</p>
                      <h3 className="mt-1 font-black text-white">{report.title}</h3>
                      <p className="mt-1 text-xs leading-relaxed text-slate-500">{report.summary}</p>
                    </div>
                    <Download className="h-5 w-5 shrink-0 text-cyan-300" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div id="aprender" className="rounded-[2rem] border border-slate-700/50 bg-slate-900/70 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black"><BookOpen className="h-6 w-6 text-cyan-300" /> Aprender</h2>
            <div className="space-y-3">
              {educationCards.map((card) => (
                <div key={card.title} className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="font-black text-white">{card.title}</h3>
                    <Star className="h-4 w-4 text-amber-300" />
                  </div>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-cyan-400" style={{ width: `${card.progress}%` }} />
                  </div>
                  <p className="mt-2 text-xs text-slate-500">Próximo: {card.next}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {isProfessional ? (
          <section id="acoes" className="rounded-[2rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/12 via-slate-900 to-slate-950 p-5">
            <h2 className="flex items-center gap-2 text-2xl font-black"><Briefcase className="h-6 w-6 text-emerald-300" /> Área profissional</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">Como assessor ou admin, você usa o mesmo app para entender o que o cliente vê e acessar rapidamente relacionamento, comunicação e workspace.</p>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <Link to="/assessor" className="rounded-2xl border border-emerald-500/20 bg-slate-950/55 p-4 font-bold text-emerald-200"><Users className="mb-3 h-5 w-5" /> Workspace</Link>
              <Link to="/contato" className="rounded-2xl border border-emerald-500/20 bg-slate-950/55 p-4 font-bold text-emerald-200"><MessageCircle className="mb-3 h-5 w-5" /> Comunicação</Link>
              <Link to="/admin/acompanhamentos" className="rounded-2xl border border-emerald-500/20 bg-slate-950/55 p-4 font-bold text-emerald-200"><Target className="mb-3 h-5 w-5" /> Relacionamento</Link>
            </div>
          </section>
        ) : !user ? (
          <section id="acoes" className="rounded-[2rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/12 via-slate-900 to-slate-950 p-5">
            <h2 className="flex items-center gap-2 text-2xl font-black"><Users className="h-6 w-6 text-emerald-300" /> Quer usar com assessor ou escritório?</h2>
            <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">Entre para salvar preferências, receber relatórios, mandar dúvidas ao assessor e acessar a versão white-label quando seu escritório estiver habilitado.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950">Entrar no app <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/demo" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950/60 px-5 py-3 text-sm font-bold text-white">Ver demo</Link>
            </div>
          </section>
        ) : null}

        <section className="rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10 p-5">
          <p className="text-sm leading-relaxed text-amber-100/80">
            Aviso: o F-Insight App tem finalidade informativa e educacional. Ele não representa recomendação individual, consultoria personalizada, carteira administrada, oferta de valor mobiliário, ordem de compra/venda ou promessa de rentabilidade.
          </p>
        </section>
      </main>

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-800 bg-slate-950/95 px-3 py-2 backdrop-blur-xl lg:hidden">
        <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
          <a href="#hoje" className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold text-slate-300"><Home className="h-5 w-5 text-cyan-300" /> Hoje</a>
          <a href="#mercado" className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold text-slate-300"><BarChart3 className="h-5 w-5 text-cyan-300" /> Mercado</a>
          <a href="#ferramentas" className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold text-slate-300"><Calculator className="h-5 w-5 text-cyan-300" /> Usar</a>
          <a href="#relatorios" className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold text-slate-300"><FileText className="h-5 w-5 text-cyan-300" /> Estudos</a>
          <a href="#acoes" className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold text-slate-300"><Reply className="h-5 w-5 text-cyan-300" /> Ações</a>
        </div>
      </nav>
    </div>
  );
}
