import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  CheckCircle2,
  LineChart,
  Mail,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import API_ENDPOINTS from '@/config/api';
import {
  getSavedPublicPortalLead,
  registerPublicPortalLead,
  type PublicPortalLead,
  type PublicPortalProfile,
} from '@/services/publicPortal';

interface LiveIndicator {
  symbol: string;
  provider: string;
  lastPrice: number;
  change: number;
  changePercent: number;
  fetchedAt: string;
}

const interests = ['Mercado brasileiro', 'Macro', 'Renda fixa', 'Ações', 'Educação financeira', 'Relatórios'];

const educationBlocks = [
  {
    title: 'Juros mudam o custo de oportunidade',
    text: 'Quando a taxa de juros está alta, qualquer ativo precisa competir com alternativas mais conservadoras. Por isso, preço, qualidade e geração de caixa importam mais.',
  },
  {
    title: 'Dólar afeta empresas de formas diferentes',
    text: 'Exportadoras, importadoras, empresas endividadas em moeda estrangeira e setores regulados podem reagir de maneiras bem distintas ao câmbio.',
  },
  {
    title: 'Valuation é faixa, não número mágico',
    text: 'Um valor estimado depende de premissas. O importante é entender margem de segurança, riscos e sensibilidade do cenário.',
  },
];

function formatMoney(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatPercent(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function symbolName(symbol: string) {
  const names: Record<string, string> = {
    'PETR4.SA': 'Petrobras PN',
    'VALE3.SA': 'Vale ON',
    'ITUB4.SA': 'Itaú Unibanco PN',
    'BBDC4.SA': 'Bradesco PN',
    'WEGE3.SA': 'WEG ON',
  };
  return names[symbol] || symbol.replace('.SA', '');
}

export default function PublicPortal() {
  const [lead, setLead] = useState<PublicPortalLead | null>(() => getSavedPublicPortalLead());
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profile, setProfile] = useState<PublicPortalProfile>('investidor');
  const [selectedInterests, setSelectedInterests] = useState<string[]>(['Mercado brasileiro', 'Educação financeira']);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [loadingIndicators, setLoadingIndicators] = useState(true);
  const [price, setPrice] = useState('28');
  const [fairValue, setFairValue] = useState('36');

  useEffect(() => {
    fetch(API_ENDPOINTS.live.indicators)
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => setIndicators(payload?.data || []))
      .catch(() => setIndicators([]))
      .finally(() => setLoadingIndicators(false));
  }, []);

  const marketMood = useMemo(() => {
    if (!indicators.length) return { label: 'Aguardando dados', text: 'O radar público fica mais útil quando os dados ao vivo estão disponíveis.' };
    const avg = indicators.reduce((sum, item) => sum + item.changePercent, 0) / indicators.length;
    if (avg > 0.6) return { label: 'Mercado positivo', text: 'A amostra acompanhada está com viés positivo no momento.' };
    if (avg < -0.6) return { label: 'Mercado pressionado', text: 'A amostra acompanhada está com viés negativo no momento.' };
    return { label: 'Mercado misto', text: 'A amostra acompanhada está sem direção única clara no momento.' };
  }, [indicators]);

  const margin = useMemo(() => {
    const current = Number(price.replace(',', '.'));
    const target = Number(fairValue.replace(',', '.'));
    if (!current || !target) return null;
    return ((target - current) / target) * 100;
  }, [price, fairValue]);

  function toggleInterest(item: string) {
    setSelectedInterests((current) => current.includes(item)
      ? current.filter((interest) => interest !== item)
      : [...current, item]
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!email.trim()) return;
    setSubmitting(true);
    setFeedback('');
    try {
      const result = await registerPublicPortalLead({ name, email, profile, interests: selectedInterests });
      setLead(result.lead);
      setFeedback('Cadastro liberado. Bem-vindo ao Portal Público F-Insight.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/20 via-slate-900 to-slate-950 p-6 lg:p-10 overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              Portal público gratuito
            </span>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-white mb-5 leading-tight">
              Inteligência de mercado simples para qualquer pessoa acompanhar melhor o cenário.
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed max-w-4xl mb-7">
              Um portal aberto do F-Insight com radar público, explicações educativas, ferramentas rápidas e conteúdo para investidores, assessores e curiosos. Sem recomendação individual, sem carteira real e sem promessa de resultado.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <a href="#acessar" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
                {lead ? 'Abrir ferramentas' : 'Cadastrar e acessar'}
                <ArrowRight className="w-4 h-4" />
              </a>
              <Link to="/precos" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/50 bg-slate-950/60 px-6 py-3 text-sm font-bold text-white hover:border-primary/50 transition-colors">
                Quero para meu escritório
              </Link>
            </div>
          </div>

          <div id="acessar" className="rounded-3xl border border-slate-700/40 bg-slate-950/70 p-5 lg:p-6">
            {lead ? (
              <div>
                <CheckCircle2 className="w-9 h-9 text-emerald-400 mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Acesso liberado</h2>
                <p className="text-slate-400 mb-5">Você está usando o portal como {lead.profile}. As ferramentas públicas estão disponíveis abaixo.</p>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-100/80">
                  {lead.email}
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <Mail className="w-8 h-8 text-primary mb-4" />
                <h2 className="text-2xl font-bold text-white mb-2">Acesse grátis</h2>
                <p className="text-slate-400 mb-5">Entre com seu e-mail para liberar radar público, ferramentas educativas e conteúdos.</p>
                <div className="space-y-3">
                  <input
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Nome"
                    className="w-full rounded-xl border border-slate-700/50 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-primary/50"
                  />
                  <input
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="E-mail"
                    type="email"
                    className="w-full rounded-xl border border-slate-700/50 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-primary/50"
                  />
                  <select
                    value={profile}
                    onChange={(event) => setProfile(event.target.value as PublicPortalProfile)}
                    className="w-full rounded-xl border border-slate-700/50 bg-slate-950 px-4 py-3 text-white outline-none focus:border-primary/50"
                  >
                    <option value="investidor">Investidor</option>
                    <option value="assessor">Assessor</option>
                    <option value="escritorio">Escritório</option>
                    <option value="estudante">Estudante</option>
                    <option value="curioso">Curioso</option>
                  </select>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {interests.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => toggleInterest(item)}
                      className={`rounded-full px-3 py-1.5 text-xs font-bold border ${selectedInterests.includes(item) ? 'border-primary/40 bg-primary/10 text-primary' : 'border-slate-700/50 bg-slate-900 text-slate-400'}`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <button
                  disabled={!email.trim() || submitting}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? 'Liberando...' : 'Liberar acesso'}
                  <ArrowRight className="w-4 h-4" />
                </button>
                {feedback && <p className="text-sm text-emerald-300 mt-3">{feedback}</p>}
              </form>
            )}
          </div>
        </div>
      </section>

      {lead && (
        <>
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            <div className="rounded-3xl border border-primary/20 bg-primary/10 p-5">
              <LineChart className="w-7 h-7 text-primary mb-4" />
              <h2 className="text-2xl font-black text-white mb-2">{marketMood.label}</h2>
              <p className="text-sm text-slate-300 leading-relaxed">{marketMood.text}</p>
            </div>
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5">
              <ShieldCheck className="w-7 h-7 text-emerald-400 mb-4" />
              <h2 className="text-2xl font-black text-white mb-2">Educativo</h2>
              <p className="text-sm text-emerald-100/80 leading-relaxed">Conteúdo informativo para aprender e conversar melhor, não para executar decisão automática.</p>
            </div>
            <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5">
              <Users className="w-7 h-7 text-primary mb-4" />
              <h2 className="text-2xl font-black text-white mb-2">Para escritórios</h2>
              <p className="text-sm text-slate-400 leading-relaxed">A versão white-label transforma este portal em app com marca, comunicação e relatórios para clientes.</p>
            </div>
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6 mb-8">
            <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-primary" />
                    Radar público Brasil
                  </h2>
                  <p className="text-slate-400 mt-1">Acompanhamento simples de ativos populares para leitura de cenário.</p>
                </div>
                <Link to="/radar" className="text-sm font-bold text-primary">Abrir radar completo</Link>
              </div>

              <div className="space-y-3">
                {loadingIndicators ? (
                  Array.from({ length: 5 }).map((_, index) => <div key={index} className="h-20 rounded-2xl bg-slate-950/50 skeleton" />)
                ) : indicators.length === 0 ? (
                  <div className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-5 text-slate-400">Dados ao vivo indisponíveis agora.</div>
                ) : indicators.slice(0, 5).map((item) => {
                  const positive = item.changePercent >= 0;
                  return (
                    <div key={item.symbol} className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="font-mono font-black text-cyan-400">{item.symbol.replace('.SA', '')}</p>
                        <h3 className="font-bold text-white">{symbolName(item.symbol)}</h3>
                        <p className="text-xs text-slate-500">Fonte: {item.provider}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-white">{formatMoney(item.lastPrice)}</p>
                        <p className={`text-sm font-bold flex items-center justify-end gap-1 ${positive ? 'text-emerald-400' : 'text-red-400'}`}>
                          {positive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          {formatPercent(item.changePercent)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl border border-primary/20 bg-primary/10 p-5 lg:p-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                  <Calculator className="w-6 h-6 text-primary" />
                  Margem de segurança educativa
                </h2>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">Compare preço atual e valor estimado para entender o conceito. Não é recomendação.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label>
                    <span className="text-xs text-slate-400 block mb-1">Preço atual</span>
                    <input value={price} onChange={(event) => setPrice(event.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950 px-4 py-3 text-white outline-none focus:border-primary/50" />
                  </label>
                  <label>
                    <span className="text-xs text-slate-400 block mb-1">Valor estimado</span>
                    <input value={fairValue} onChange={(event) => setFairValue(event.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950 px-4 py-3 text-white outline-none focus:border-primary/50" />
                  </label>
                </div>
                <div className="mt-4 rounded-2xl border border-slate-700/40 bg-slate-950/60 p-4">
                  <p className="text-sm text-slate-400">Margem estimada</p>
                  <p className={`text-4xl font-black mt-1 ${(margin || 0) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{margin === null ? '—' : formatPercent(margin)}</p>
                  <p className="text-xs text-slate-500 mt-2">Quanto maior a margem, maior o espaço entre preço e valor estimado. As premissas podem estar erradas.</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-4">
                  <Target className="w-6 h-6 text-primary" />
                  Próximo passo
                </h2>
                <p className="text-slate-400 leading-relaxed mb-4">Quer transformar isso em portal com sua marca, app do cliente, relatórios e comunicação do seu escritório?</p>
                <Link to="/precos" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
                  Ver planos white-label
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            {educationBlocks.map((item) => (
              <div key={item.title} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5">
                <BookOpen className="w-6 h-6 text-primary mb-4" />
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{item.text}</p>
              </div>
            ))}
          </section>
        </>
      )}

      <section className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5 lg:p-6">
        <p className="text-sm text-amber-100/80 leading-relaxed">
          Aviso: o Portal Público F-Insight tem finalidade educacional e informativa. Ele não representa recomendação individual, oferta de valor mobiliário, promessa de rentabilidade, consultoria personalizada, carteira administrada, ordem de compra/venda ou substituição de orientação profissional.
        </p>
      </section>
    </Layout>
  );
}
