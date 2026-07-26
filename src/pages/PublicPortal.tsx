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

const fallbackIndicators: LiveIndicator[] = [
  { symbol: 'PETR4.SA', lastPrice: 38.42, changePercent: 0.72 },
  { symbol: 'VALE3.SA', lastPrice: 61.18, changePercent: -0.35 },
  { symbol: 'ITUB4.SA', lastPrice: 34.90, changePercent: 0.41 },
  { symbol: 'BBDC4.SA', lastPrice: 14.62, changePercent: -0.18 },
  { symbol: 'WEGE3.SA', lastPrice: 42.75, changePercent: 1.12 },
];

const macroCards = [
  { label: 'Juros', value: 'Custo de oportunidade alto', tone: 'Atenção', text: 'Ativos precisam justificar risco frente à renda fixa.' },
  { label: 'Dólar', value: 'Impacto setorial', tone: 'Monitorar', text: 'Exportadoras, importadoras e commodities reagem de formas diferentes.' },
  { label: 'Inflação', value: 'Sensível a serviços', tone: 'Cenário', text: 'Pressões persistentes podem mudar a leitura de juros.' },
  { label: 'Bolsa BR', value: 'Foco em qualidade', tone: 'Leitura', text: 'Margem, caixa e previsibilidade ganham peso no radar.' },
];

const analysisFeed = [
  {
    title: 'O que olhar no mercado brasileiro hoje',
    tag: 'Radar',
    text: 'Acompanhe empresas líquidas, sensibilidade a juros, câmbio e qualidade de resultado antes de tirar conclusões por preço isolado.',
  },
  {
    title: 'Valuation não é previsão exata',
    tag: 'Educação',
    text: 'O objetivo é entender faixa de valor, premissas, riscos e margem de segurança. Não é uma ordem de compra ou venda.',
  },
  {
    title: 'Por que o assessor ganha valor com contexto',
    tag: 'Escritórios',
    text: 'Um cliente que chega informado faz melhores perguntas. O escritório ganha escala com conteúdo, curadoria e relacionamento digital.',
  },
  {
    title: 'Risco principal: narrativa sem processo',
    tag: 'Risco',
    text: 'Boas decisões começam separando notícia, fundamento, cenário e adequação ao perfil. O portal organiza essa conversa.',
  },
];

const learningBlocks = [
  'Preço é o que o mercado mostra agora. Valor é uma estimativa construída com premissas.',
  'Juros altos aumentam a régua mínima para assumir risco em renda variável.',
  'Empresas exportadoras e importadoras podem reagir de forma oposta ao dólar.',
  'Relatório bom não elimina risco. Ele ajuda a fazer perguntas melhores.',
];

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
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
  };
  return names[symbol] || cleanSymbol(symbol);
}

function formatUpdatedAt(value?: string) {
  if (!value) return 'Demonstração educativa';
  return `Atualizado ${new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
}

export default function PublicPortal() {
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [isLive, setIsLive] = useState(false);
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<PublicPortalProfile>('investidor');
  const [submitting, setSubmitting] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [price, setPrice] = useState('28');
  const [fairValue, setFairValue] = useState('36');

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

  const marketData = indicators.length > 0 ? indicators : fallbackIndicators;
  const updatedAt = formatUpdatedAt(marketData[0]?.fetchedAt);

  const marketMood = useMemo(() => {
    const avg = marketData.reduce((sum, item) => sum + item.changePercent, 0) / marketData.length;
    if (avg > 0.6) return { label: 'Mercado positivo', text: 'A amostra acompanhada está com viés positivo.' };
    if (avg < -0.6) return { label: 'Mercado pressionado', text: 'A amostra acompanhada está com viés negativo.' };
    return { label: 'Mercado misto', text: 'A amostra acompanhada está sem direção única clara.' };
  }, [marketData]);

  const margin = useMemo(() => {
    const current = Number(price.replace(',', '.'));
    const target = Number(fairValue.replace(',', '.'));
    if (!current || !target) return null;
    return ((target - current) / target) * 100;
  }, [price, fairValue]);

  async function handleRegister(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    try {
      await registerPublicPortalLead({ name: '', email, profile, interests: ['portal-publico'] });
      setRegistered(true);
      setEmail('');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07111f] text-white">
      <header className="sticky top-0 z-50 border-b border-cyan-500/10 bg-[#070d19]/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-5 py-4">
          <Link to="/portal" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-cyan-400/15 shadow-lg shadow-cyan-500/10">
              <LineChart className="h-6 w-6 text-cyan-300" />
            </div>
            <div>
              <p className="text-xl font-black tracking-tight text-cyan-300">F-Insight</p>
              <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-slate-500">Portal Público</p>
            </div>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-bold text-slate-400 md:flex">
            <a href="#mercado" className="hover:text-cyan-300">Mercado</a>
            <a href="#analises" className="hover:text-cyan-300">Análises</a>
            <a href="#educacao" className="hover:text-cyan-300">Educação</a>
            <a href="#escritorios" className="hover:text-cyan-300">Para assessores e escritórios</a>
          </nav>

          <div className="flex items-center gap-2">
            <Link to="/precos" className="hidden rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-200 hover:border-cyan-400/50 sm:inline-flex">
              Para escritórios
            </Link>
            <Link to="/login" className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-bold text-emerald-300 hover:border-emerald-400/50">
              Entrar
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1500px] px-5 py-6">
        <section className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-[2rem] border border-cyan-500/20 bg-gradient-to-br from-cyan-500/12 via-slate-900 to-[#07111f] p-6 lg:p-8">
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.18em] text-cyan-300">Mercado aberto</span>
              <span className="rounded-full border border-slate-700 bg-slate-950/50 px-3 py-1 text-xs font-bold text-slate-400">{updatedAt}</span>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-300">{isLive ? 'Dados ao vivo' : 'Modo demonstrativo'}</span>
            </div>
            <h1 className="max-w-5xl text-4xl font-black leading-tight tracking-tight lg:text-6xl">
              Um painel simples para acompanhar mercado, contexto e ideias sem virar ruído.
            </h1>
            <p className="mt-5 max-w-4xl text-lg leading-relaxed text-slate-300">
              O Portal Público F-Insight organiza radar de ativos, leitura macro, análises educativas e ferramentas rápidas. Aberto para qualquer pessoa. Sem carteira real, sem recomendação individual e sem promessa de resultado.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/10 p-5">
              <Globe2 className="mb-4 h-7 w-7 text-cyan-300" />
              <h2 className="text-2xl font-black">{marketMood.label}</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">{marketMood.text}</p>
            </div>
            <div className="rounded-[2rem] border border-emerald-500/20 bg-emerald-500/10 p-5">
              <ShieldCheck className="mb-4 h-7 w-7 text-emerald-300" />
              <h2 className="text-2xl font-black">Educativo e seguro</h2>
              <p className="mt-2 text-sm leading-relaxed text-emerald-50/80">Conteúdo para entender melhor o cenário e conversar com profissionais, não para executar decisão automática.</p>
            </div>
          </div>
        </section>

        <section id="mercado" className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_420px]">
          <div className="rounded-[2rem] border border-slate-700/50 bg-slate-900/70 p-5">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-black"><BarChart3 className="h-6 w-6 text-cyan-300" /> Radar Brasil</h2>
                <p className="mt-1 text-sm text-slate-400">Ativos populares para leitura rápida de cenário.</p>
              </div>
              <Link to="/radar" className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-300">Radar completo</Link>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-800">
              <div className="grid grid-cols-[1fr_120px_110px] bg-slate-950/80 px-4 py-3 text-xs font-black uppercase tracking-[0.16em] text-slate-500">
                <span>Ativo</span>
                <span className="text-right">Preço</span>
                <span className="text-right">Variação</span>
              </div>
              {marketData.map((item) => {
                const positive = item.changePercent >= 0;
                return (
                  <div key={item.symbol} className="grid grid-cols-[1fr_120px_110px] items-center border-t border-slate-800 bg-slate-950/45 px-4 py-4">
                    <div>
                      <p className="font-mono text-base font-black text-cyan-300">{cleanSymbol(item.symbol)}</p>
                      <p className="text-xs text-slate-500">{symbolName(item.symbol)}</p>
                    </div>
                    <p className="text-right font-bold text-white">{formatMoney(item.lastPrice)}</p>
                    <p className={`flex items-center justify-end gap-1 text-right font-black ${positive ? 'text-emerald-300' : 'text-red-300'}`}>
                      {positive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {formatPercent(item.changePercent)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-700/50 bg-slate-900/70 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black"><Bell className="h-6 w-6 text-cyan-300" /> Leitura macro</h2>
            <div className="space-y-3">
              {macroCards.map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.16em] text-cyan-300">{item.label}</p>
                    <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300">{item.tone}</span>
                  </div>
                  <h3 className="font-bold text-white">{item.value}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-400">{item.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="analises" className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[0.92fr_1.08fr]">
          <div className="rounded-[2rem] border border-cyan-500/20 bg-cyan-500/10 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black"><Calculator className="h-6 w-6 text-cyan-300" /> Margem de segurança</h2>
            <p className="mb-4 text-sm leading-relaxed text-slate-300">Ferramenta conceitual para comparar preço e valor estimado. Use apenas como exercício educativo.</p>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-400">Preço atual</span>
                <input value={price} onChange={(event) => setPrice(event.target.value)} className="w-full rounded-xl border border-slate-700/60 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400/60" />
              </label>
              <label>
                <span className="mb-1 block text-xs font-bold text-slate-400">Valor estimado</span>
                <input value={fairValue} onChange={(event) => setFairValue(event.target.value)} className="w-full rounded-xl border border-slate-700/60 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400/60" />
              </label>
            </div>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
              <p className="text-sm text-slate-400">Margem estimada</p>
              <p className={`mt-1 text-5xl font-black ${(margin || 0) >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{margin === null ? '—' : formatPercent(margin)}</p>
              <p className="mt-2 text-xs leading-relaxed text-slate-500">Uma margem positiva não significa compra. Premissas podem estar erradas e o risco pode mudar.</p>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-700/50 bg-slate-900/70 p-5">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black"><Newspaper className="h-6 w-6 text-cyan-300" /> Análises e mensagens relevantes</h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {analysisFeed.map((item) => (
                <article key={item.title} className="rounded-2xl border border-slate-800 bg-slate-950/55 p-4">
                  <span className="rounded-full bg-cyan-500/10 px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-cyan-300">{item.tag}</span>
                  <h3 className="mt-3 font-black text-white">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{item.text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="educacao" className="mb-5 grid grid-cols-1 gap-4 lg:grid-cols-4">
          {learningBlocks.map((item, index) => (
            <div key={item} className="rounded-[1.5rem] border border-slate-700/50 bg-slate-900/70 p-5">
              <BookOpen className="mb-4 h-6 w-6 text-cyan-300" />
              <p className="mb-2 text-xs font-black uppercase tracking-[0.18em] text-slate-500">Conceito {index + 1}</p>
              <p className="text-sm leading-relaxed text-slate-300">{item}</p>
            </div>
          ))}
        </section>

        <section id="escritorios" className="mb-5 grid grid-cols-1 gap-4 xl:grid-cols-[1fr_420px]">
          <div className="rounded-[2rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/12 via-slate-900 to-slate-950 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
              <Target className="h-6 w-6 text-emerald-300" />
            </div>
            <h2 className="text-3xl font-black">Para assessores e escritórios</h2>
            <p className="mt-3 max-w-4xl text-slate-300 leading-relaxed">
              Este portal mostra a experiência pública. A versão para escritórios transforma inteligência de mercado em ambiente com marca própria, relatórios, curadoria e relacionamento digital com clientes.
            </p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <Link to="/precos" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black text-slate-950 hover:bg-emerald-400">
                Conhecer versão para escritórios
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/demo" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950/60 px-5 py-3 text-sm font-bold text-white hover:border-emerald-400/60">
                Ver demo comercial
              </Link>
            </div>
          </div>

          <form onSubmit={handleRegister} className="rounded-[2rem] border border-slate-700/50 bg-slate-900/70 p-5">
            <Mail className="mb-4 h-6 w-6 text-cyan-300" />
            <h2 className="text-2xl font-black">Receba a carta do mercado</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">Opcional. Deixe seu e-mail para receber novidades, análises educativas e atualizações do F-Insight.</p>
            <div className="mt-4 space-y-3">
              <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" placeholder="seu@email.com" className="w-full rounded-xl border border-slate-700/60 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600 outline-none focus:border-cyan-400/60" />
              <select value={profile} onChange={(event) => setProfile(event.target.value as PublicPortalProfile)} className="w-full rounded-xl border border-slate-700/60 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400/60">
                <option value="investidor">Investidor</option>
                <option value="assessor">Assessor</option>
                <option value="escritorio">Escritório</option>
                <option value="estudante">Estudante</option>
                <option value="curioso">Curioso</option>
              </select>
              <button disabled={!email.trim() || submitting || registered} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-60">
                {registered ? <CheckCircle2 className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
                {registered ? 'Cadastro recebido' : submitting ? 'Enviando...' : 'Quero receber'}
              </button>
            </div>
          </form>
        </section>

        <section className="rounded-[1.5rem] border border-amber-500/20 bg-amber-500/10 p-5">
          <p className="text-sm leading-relaxed text-amber-100/80">
            Aviso: o Portal Público F-Insight é informativo e educacional. Não representa recomendação individual, consultoria personalizada, carteira administrada, oferta de valor mobiliário, ordem de compra/venda ou promessa de rentabilidade.
          </p>
        </section>
      </main>
    </div>
  );
}
