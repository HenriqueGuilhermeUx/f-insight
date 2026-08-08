import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Brain,
  Calculator,
  CheckCircle2,
  LineChart,
  Newspaper,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const freeItems = [
  'Cotações principais e radar público',
  'Notícias e resumo macro básico',
  'Top sinais gratuitos e conteúdos educativos',
  'Acesso inicial ao app e relatório semanal',
];

const premiumItems = [
  'IA Financeira completa para explicar ativos, indicadores e notícias',
  'Screener avançado por P/L, P/VP, DY, ROE, setor, risco e liquidez',
  'Graham & Valor completo com margem de segurança e ranking educativo',
  'Carteira simulada com evolução, concentração e dividendos estimados',
  'Alertas inteligentes de preço, variação, dividendos e volatilidade',
  'Backtesting para testar hipóteses com histórico e métricas de risco',
  'Relatórios semanais premium e calendário econômico',
  'Watchlists ilimitadas e comparador de ativos',
];

const featureCards = [
  { title: 'IA Financeira', text: 'Pergunte sobre fundamentos, cenário, notícias, indicadores e riscos em linguagem simples.', icon: Brain },
  { title: 'Screener avançado', text: 'Encontre ativos por valor, dividendos, qualidade, liquidez e filtros combinados.', icon: Target },
  { title: 'Graham & Valor', text: 'Use critérios fundamentalistas para estudar margem de segurança sem promessa de recomendação.', icon: Calculator },
  { title: 'Carteira simulada', text: 'Teste ideias, acompanhe concentração, risco e evolução sem mexer no patrimônio real.', icon: WalletCards },
  { title: 'Alertas inteligentes', text: 'Receba avisos sobre preço, volatilidade, dividendos, eventos e mudanças relevantes.', icon: Bell },
  { title: 'Backtesting', text: 'Compare estratégias com buy & hold, drawdown, retorno e histórico de operações simuladas.', icon: LineChart },
];

export default function PremiumIndividual() {
  return (
    <Layout>
      <section className="mb-8 rounded-[2rem] border border-amber-500/20 bg-gradient-to-br from-amber-500/15 via-slate-900 to-slate-950 p-6 lg:p-10">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-amber-200">
              <Sparkles className="h-3.5 w-3.5" />
              Premium individual para investidores
            </span>
            <h1 className="max-w-5xl text-4xl font-black leading-tight tracking-tight text-white lg:text-6xl">
              Mais profundidade para estudar o mercado com IA, dados e ferramentas.
            </h1>
            <p className="mt-5 max-w-4xl text-lg leading-relaxed text-slate-300">
              O Premium é para o investidor que não veio por um escritório ou assessor e quer usar o F-Insight como copiloto financeiro educacional: IA completa, screener, Graham & Valor, alertas, carteira simulada e backtesting.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-amber-400 px-6 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-amber-300">
                Criar conta e ativar Premium
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/app" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950/60 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-amber-400/60">
                Abrir app gratuito
              </Link>
            </div>
            <p className="mt-4 text-xs font-semibold text-slate-500">Conteúdo educativo · Sem recomendação individualizada · Cancele quando quiser</p>
          </div>

          <div className="rounded-[2rem] border border-amber-500/30 bg-amber-500/10 p-6 text-center">
            <p className="text-sm font-black uppercase tracking-[0.18em] text-amber-200">Plano Premium</p>
            <div className="my-5 flex items-end justify-center gap-2">
              <span className="text-6xl font-black text-white">R$ 19,90</span>
              <span className="pb-2 text-sm font-bold text-slate-400">/mês</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">Ideal para pessoa física que quer estudar melhor suas decisões econômicas sem depender de um escritório.</p>
            <div className="mt-5 rounded-2xl border border-slate-700/50 bg-slate-950/50 p-4 text-left">
              <p className="mb-2 flex items-center gap-2 text-sm font-black text-white">
                <ShieldCheck className="h-4 w-4 text-emerald-300" />
                Separado da estrutura B2B
              </p>
              <p className="text-sm text-slate-400">Clientes de assessores continuam usando a área logada do escritório. O Premium individual atende quem chega direto pela plataforma pública.</p>
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

        <div className="rounded-3xl border border-amber-500/30 bg-amber-500/10 p-6">
          <h2 className="mb-4 text-2xl font-black text-white">Premium R$ 19,90</h2>
          <div className="space-y-3">
            {premiumItems.map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-amber-500/20 bg-slate-950/40 p-3">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
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
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-400/10">
                <Icon className="h-6 w-6 text-amber-300" />
              </div>
              <h3 className="mb-3 text-xl font-black text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{item.text}</p>
            </div>
          );
        })}
      </section>

      <section className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6 lg:p-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <h2 className="mb-2 flex items-center gap-2 text-3xl font-black text-white">
              <Newspaper className="h-7 w-7 text-cyan-300" />
              Aprofundamento sem tirar valor do gratuito
            </h2>
            <p className="max-w-4xl text-slate-300">A página principal continua útil e aberta. O Premium entra quando o usuário quer personalização, automação, IA completa e ferramentas mais profundas.</p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/graham-valor" className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-slate-950/40 px-5 py-3 text-sm font-bold text-cyan-200 transition-colors hover:border-cyan-300">
              Graham & Valor
            </Link>
            <Link to="/screener-acoes" className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-slate-950/40 px-5 py-3 text-sm font-bold text-cyan-200 transition-colors hover:border-cyan-300">
              Screener
            </Link>
            <Link to="/backtesting" className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-400/40 bg-slate-950/40 px-5 py-3 text-sm font-bold text-cyan-200 transition-colors hover:border-cyan-300">
              Backtesting
            </Link>
          </div>
        </div>
      </section>

      <footer className="py-8 text-xs leading-relaxed text-slate-500">
        <p>O F-Insight Premium é uma plataforma de informação, educação e simulação. As informações não constituem recomendação de investimento, consultoria individualizada ou garantia de resultado.</p>
      </footer>
    </Layout>
  );
}
