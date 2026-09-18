import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  Brain,
  Calculator,
  CheckCircle2,
  Clock3,
  CreditCard,
  LineChart,
  Loader2,
  Newspaper,
  Radar,
  ShieldCheck,
  Sparkles,
  Target,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import API_ENDPOINTS from '@/config/api';

const freeItems = [
  'Cotações principais e radar público',
  'Notícias e resumo macro básico',
  'Top sinais gratuitos e conteúdos educativos',
  'Conta gratuita para acompanhar o mercado e conhecer o app',
];

const premiumItems = [
  'Meu Futuro IA para transformar renda, gastos, dívidas e metas em um plano financeiro',
  'Radar IA em linguagem natural para organizar pesquisas, riscos e cenários de mercado',
  'Diagnóstico financeiro com perfil, folga mensal, vazamentos e custo em horas de vida',
  'Cenários de objetivos com premissas conservadora, base e acelerada',
  'Alertas e watchlists sincronizados com sua conta',
  'Screener avançado, Graham & Valor e comparador de ativos',
  'Carteira simulada, concentração e ferramentas de risco',
  'Backtesting educativo, relatórios premium e calendário econômico',
];

const featureCards = [
  { title: 'Meu Futuro IA', text: 'Veja se seu dinheiro está financiando seus objetivos ou atrasando a vida que você quer construir.', icon: Sparkles },
  { title: 'Radar IA', text: 'Pergunte em linguagem natural o que quer estudar e receba contexto, riscos e um roteiro de análise.', icon: Radar },
  { title: 'Plano de 7 e 90 dias', text: 'Transforme o diagnóstico em pequenas ações financeiras e acompanhe sua evolução.', icon: Clock3 },
  { title: 'IA Financeira', text: 'Entenda fundamentos, cenário, notícias e indicadores sem linguagem desnecessariamente complicada.', icon: Brain },
  { title: 'Alertas inteligentes', text: 'Acompanhe preço e variações importantes sem transformar alertas em ordens automáticas.', icon: Bell },
  { title: 'Ferramentas de estudo', text: 'Use screener, Graham & Valor, simulações e backtesting para testar hipóteses.', icon: Calculator },
];

interface CheckoutResponse {
  ok: boolean;
  demoMode?: boolean;
  error?: string;
  message?: string;
  invoice?: {
    correlationId?: string;
    paymentLinkUrl?: string | null;
    brCode?: string | null;
    amountCents?: number;
  };
}

async function billingHeaders() {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (!supabase) return headers;
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
}

export default function PremiumIndividual() {
  const { user } = useAuth();
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');
  const [pixCode, setPixCode] = useState('');

  async function startCheckout() {
    if (!user || checkoutLoading) return;

    setCheckoutLoading(true);
    setCheckoutError('');
    setPixCode('');

    try {
      const headers = await billingHeaders();
      const response = await fetch(API_ENDPOINTS.billing.checkout, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          tenantId: user.id,
          planId: 'individual',
          customerName: user.fullName,
          customerEmail: user.email,
        }),
      });

      const payload = (await response.json()) as CheckoutResponse;
      if (!response.ok || !payload.ok) {
        if (response.status === 401) {
          throw new Error('Sua sessão online precisa ser confirmada. Saia, entre novamente e tente assinar o Premium.');
        }
        throw new Error(payload.message || payload.error || 'Não foi possível gerar a cobrança.');
      }

      if (payload.invoice?.paymentLinkUrl) {
        window.location.assign(payload.invoice.paymentLinkUrl);
        return;
      }

      if (payload.invoice?.brCode) {
        setPixCode(payload.invoice.brCode);
        return;
      }

      throw new Error('A cobrança foi criada, mas o provedor não retornou link ou código Pix.');
    } catch (error) {
      setCheckoutError(error instanceof Error ? error.message : 'Falha ao iniciar pagamento.');
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function copyPix() {
    if (!pixCode) return;
    await navigator.clipboard.writeText(pixCode);
  }

  return (
    <Layout>
      <section className="mb-8 rounded-[2rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950 p-6 lg:p-10">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-200">
              <Sparkles className="h-3.5 w-3.5" />
              F-Insight Premium
            </span>
            <h1 className="max-w-5xl text-4xl font-black leading-tight tracking-tight text-white lg:text-6xl">
              IA para construir sua vida financeira — não só para olhar o mercado.
            </h1>
            <p className="mt-5 max-w-4xl text-lg leading-relaxed text-slate-300">
              Entenda para onde seu dinheiro está indo, transforme metas em cenários e use o mercado como parte de um plano maior. O Premium reúne Meu Futuro IA, Radar IA, alertas, screener, simulações e ferramentas educativas em uma só experiência.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/cadastro-gratis?mode=signup" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-emerald-300">
                Criar conta grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/meu-futuro" className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-400/40 bg-slate-950/60 px-6 py-3 text-sm font-bold text-emerald-200 transition-colors hover:border-emerald-300">
                Conhecer Meu Futuro IA
              </Link>
              <Link to="/ia-financeira" className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/30 bg-cyan-500/10 px-6 py-3 text-sm font-bold text-cyan-200 transition-colors hover:border-cyan-300">
                Abrir Radar IA
              </Link>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-500">Conteúdo educativo e de simulação · Sem recomendação individualizada · Sem promessa de rentabilidade</p>
          </div>

          <div className="rounded-[2rem] border border-emerald-500/30 bg-emerald-500/10 p-6 text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-200">Plano Premium Individual</p>
            <div className="my-5 flex items-end justify-center gap-2">
              <span className="text-6xl font-black text-white">R$ 19,90</span>
              <span className="pb-2 text-sm font-bold text-slate-400">/mês</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">Para quem quer transformar dados financeiros em clareza, acompanhamento e um plano de evolução.</p>

            <div className="mt-5">
              {user ? (
                <button
                  type="button"
                  onClick={startCheckout}
                  disabled={checkoutLoading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300 disabled:cursor-wait disabled:opacity-70"
                >
                  {checkoutLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                  {checkoutLoading ? 'Gerando Pix...' : 'Assinar Premium via Pix'}
                </button>
              ) : (
                <Link
                  to="/cadastro-gratis?mode=signup&next=/premium"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 transition hover:bg-emerald-300"
                >
                  Criar conta para assinar
                  <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              {checkoutError && (
                <p className="mt-3 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-left text-xs font-semibold text-red-200">
                  {checkoutError}
                </p>
              )}

              {pixCode && (
                <div className="mt-3 rounded-xl border border-emerald-500/20 bg-slate-950/60 p-3 text-left">
                  <p className="text-xs font-bold text-emerald-200">Pix copia e cola</p>
                  <p className="mt-2 break-all font-mono text-[11px] text-slate-400">{pixCode}</p>
                  <button type="button" onClick={copyPix} className="mt-3 text-xs font-black text-cyan-300 hover:text-cyan-200">
                    Copiar código Pix
                  </button>
                </div>
              )}
            </div>

            <div className="mt-5 grid gap-3 text-left">
              <div className="rounded-2xl border border-emerald-500/20 bg-slate-950/50 p-4">
                <p className="mb-1 flex items-center gap-2 text-sm font-black text-white"><Target className="h-4 w-4 text-emerald-300" /> Vida financeira</p>
                <p className="text-sm text-slate-400">Metas, gastos, dívidas, reserva e cenários de longo prazo.</p>
              </div>
              <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/50 p-4">
                <p className="mb-1 flex items-center gap-2 text-sm font-black text-white"><LineChart className="h-4 w-4 text-cyan-300" /> Mercado</p>
                <p className="text-sm text-slate-400">Radar, contexto, riscos, simulações e ferramentas de estudo.</p>
              </div>
              <div className="rounded-2xl border border-slate-700/50 bg-slate-950/50 p-4">
                <p className="mb-1 flex items-center gap-2 text-sm font-black text-white"><ShieldCheck className="h-4 w-4 text-amber-300" /> Guardrails</p>
                <p className="text-sm text-slate-400">A IA explica e simula; não executa ordens nem decide pelo usuário.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
          <h2 className="mb-4 text-2xl font-black text-white">Grátis para começar</h2>
          <div className="space-y-3">
            {freeItems.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-700/50 bg-slate-950/40 p-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                <span className="text-sm text-slate-300">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-emerald-500/30 bg-emerald-500/10 p-6">
          <h2 className="mb-4 text-2xl font-black text-white">Premium Individual · R$ 19,90/mês</h2>
          <div className="space-y-3">
            {premiumItems.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-emerald-500/20 bg-slate-950/40 p-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                <span className="text-sm text-slate-200">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {featureCards.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10">
                <Icon className="h-6 w-6 text-emerald-300" />
              </div>
              <h3 className="mb-3 text-xl font-black text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{item.text}</p>
            </div>
          );
        })}
      </section>

      <section className="mb-8 rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-3xl font-black text-white">
              <Newspaper className="h-7 w-7 text-cyan-300" />
              Vida financeira + inteligência de mercado
            </h2>
            <p className="max-w-4xl text-slate-300">O F-Insight começa pela sua realidade financeira e adiciona ferramentas de mercado quando elas ajudam a estudar uma decisão. O objetivo é mais clareza, não mais ruído.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/graham-valor" className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-slate-950/40 px-5 py-3 text-sm font-bold text-cyan-200 transition-colors hover:border-cyan-300">Graham & Valor</Link>
            <Link to="/screener-acoes" className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-slate-950/40 px-5 py-3 text-sm font-bold text-cyan-200 transition-colors hover:border-cyan-300">Screener</Link>
            <Link to="/backtesting" className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-slate-950/40 px-5 py-3 text-sm font-bold text-cyan-200 transition-colors hover:border-cyan-300">Backtesting</Link>
          </div>
        </div>
      </section>

      <footer className="py-8 text-xs leading-relaxed text-slate-500">
        <p>O F-Insight Premium é uma plataforma de informação, educação e simulação. As informações não constituem recomendação de investimento, consultoria individualizada ou garantia de resultado.</p>
      </footer>
    </Layout>
  );
}
