import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Calculator, CheckCircle2, Filter, Info, LineChart, Play, ShieldCheck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

type Tool = 'graham' | 'screener' | 'backtesting';

interface MarketToolPageProps {
  tool: Tool;
}

const strategies = [
  'Buy & Hold',
  'Médias móveis',
  'RSI sobrevendido/sobrecomprado',
  'MACD',
  'Bollinger Bands',
  'Momentum',
];

const config = {
  graham: {
    title: 'Graham & Valor',
    eyebrow: 'Análise fundamentalista educativa',
    description: 'Estude como preço, valor estimado, lucratividade, endividamento e margem de segurança se relacionam. Nenhum valor é apresentado como atual sem uma fonte verificada.',
    icon: Calculator,
    color: 'emerald',
  },
  screener: {
    title: 'Screener de Ações',
    eyebrow: 'Pesquisa e filtros de mercado',
    description: 'Organize uma pesquisa por fundamentos, liquidez, setor e outros critérios. Métricas só aparecem quando forem recebidas de uma fonte verificada.',
    icon: Filter,
    color: 'cyan',
  },
  backtesting: {
    title: 'Backtesting',
    eyebrow: 'Simulação de estratégias',
    description: 'Entenda quais métricas um backtest precisa medir e quais limitações devem ser consideradas. A execução quantitativa completa permanece indisponível enquanto não houver histórico validado e testes matemáticos dedicados.',
    icon: LineChart,
    color: 'amber',
  },
} satisfies Record<Tool, { title: string; eyebrow: string; description: string; icon: typeof Calculator; color: string }>;

function toneClass(color: string) {
  if (color === 'emerald') return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300';
  if (color === 'amber') return 'border-amber-500/20 bg-amber-500/10 text-amber-300';
  return 'border-cyan-500/20 bg-cyan-500/10 text-cyan-300';
}

export default function MarketToolPage({ tool }: MarketToolPageProps) {
  const data = config[tool];
  const Icon = data.icon;

  return (
    <Layout>
      <section className={`mb-8 rounded-[2rem] border p-6 lg:p-10 ${toneClass(data.color)}`}>
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-current/20 bg-slate-950/40 px-3 py-1 text-xs font-black uppercase tracking-[0.16em]">
              <Icon className="h-3.5 w-3.5" />
              {data.eyebrow}
            </span>
            <h1 className="max-w-5xl text-4xl font-black leading-tight tracking-tight text-white lg:text-6xl">{data.title}</h1>
            <p className="mt-5 max-w-4xl text-lg leading-relaxed text-slate-300">{data.description}</p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-6 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-cyan-300">
                Criar conta grátis
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/premium" className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-3 text-sm font-black text-amber-200 transition-colors hover:border-amber-400/70">
                Ver recursos Premium
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-700/50 bg-slate-950/60 p-5 lg:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black text-white">
              <ShieldCheck className="h-6 w-6 text-emerald-300" />
              Uso responsável
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Esta ferramenta é informativa e educacional. Ela organiza dados, premissas e hipóteses; não gera ordem, execução nem recomendação individual de investimento.
            </p>
          </div>
        </div>
      </section>

      {tool === 'graham' && (
        <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            ['Preço vs. valor', 'Compara um preço de referência com um valor estimado somente quando ambos têm origem e premissas explícitas.'],
            ['Qualidade', 'Organiza indicadores como rentabilidade, dívida e consistência quando os fundamentos vêm de fonte verificada.'],
            ['Dividendos', 'Explica yield, payout, caixa e sustentabilidade sem transformar histórico em promessa de retorno.'],
          ].map(([title, text]) => (
            <div key={title} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
              <Calculator className="mb-4 h-7 w-7 text-emerald-300" />
              <h3 className="mb-3 text-xl font-black text-white">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{text}</p>
            </div>
          ))}
        </section>
      )}

      {tool === 'screener' && (
        <section className="mb-8 rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <div className="mb-5">
            <h2 className="text-2xl font-black text-white">Como o screener será usado</h2>
            <p className="mt-2 max-w-4xl text-sm leading-relaxed text-slate-400">
              Os filtros abaixo são exemplos de critérios de pesquisa, não resultados atuais. O F-Insight não exibe múltiplos hardcoded como se fossem dados de mercado. Resultados numéricos entram somente quando o backend entregar fundamentos verificados com fonte e data.
            </p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {[
              ['P/L', 'Comparar lucro por ação e preço com pares e histórico.'],
              ['P/VP', 'Relacionar preço de mercado e patrimônio contábil.'],
              ['Dividend Yield', 'Contextualizar proventos com payout, caixa e recorrência.'],
              ['ROE', 'Observar retorno sobre patrimônio junto com alavancagem e qualidade do lucro.'],
            ].map(([label, text]) => (
              <article key={label} className="rounded-2xl border border-cyan-500/15 bg-slate-950/40 p-4">
                <p className="font-mono font-black text-cyan-300">{label}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{text}</p>
              </article>
            ))}
          </div>
        </section>
      )}

      {tool === 'backtesting' && (
        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black text-white">
              <Play className="h-6 w-6 text-amber-300" />
              Hipóteses que podem ser estudadas
            </h2>
            <div className="space-y-3">
              {strategies.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-700/50 bg-slate-950/40 p-3">
                  <CheckCircle2 className="h-5 w-5 text-amber-300" />
                  <span className="text-sm font-semibold text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black text-white">
              <BarChart3 className="h-6 w-6 text-cyan-300" />
              Métricas necessárias
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {['Retorno total', 'Benchmark', 'Max drawdown', 'Sharpe', 'Win rate', 'Total de eventos'].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{item}</p>
                  <p className="mt-2 text-sm font-bold text-slate-300">Aguardando motor validado</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
        <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
          O F-Insight organiza informação para estudo. Decisões financeiras devem considerar objetivos, riscos, horizonte e contexto individual.
        </p>
      </section>
    </Layout>
  );
}
