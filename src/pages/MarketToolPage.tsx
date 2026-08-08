import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Calculator, CheckCircle2, Filter, Info, LineChart, Play, ShieldCheck, Target } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

type Tool = 'graham' | 'screener' | 'backtesting';

interface MarketToolPageProps {
  tool: Tool;
}

const screenerRows = [
  { ticker: 'PETR4', name: 'Petrobras PN', pe: '5,1x', pvp: '1,2x', dy: '12,4%', roe: '23%', score: 'Valor' },
  { ticker: 'BBAS3', name: 'Banco do Brasil ON', pe: '4,8x', pvp: '0,9x', dy: '9,8%', roe: '21%', score: 'Dividendos' },
  { ticker: 'VALE3', name: 'Vale ON', pe: '6,7x', pvp: '1,4x', dy: '7,1%', roe: '18%', score: 'Commodities' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco PN', pe: '8,9x', pvp: '1,7x', dy: '6,2%', roe: '20%', score: 'Qualidade' },
];

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
    description: 'Estude ativos com uma leitura baseada em critérios de valor: P/L, P/VP, dividend yield, ROE, dívida, lucro e margem de segurança.',
    icon: Calculator,
    color: 'emerald',
  },
  screener: {
    title: 'Screener de Ações',
    eyebrow: 'Pesquisa e filtros de mercado',
    description: 'Filtre ações por fundamentos, dividendos, liquidez, setor, qualidade e sinais para encontrar ideias de estudo com mais disciplina.',
    icon: Filter,
    color: 'cyan',
  },
  backtesting: {
    title: 'Backtesting',
    eyebrow: 'Simulação de estratégias',
    description: 'Teste hipóteses com histórico, compare contra buy & hold e entenda risco, drawdown e consistência antes de operar uma ideia.',
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
                Aprofundar no Premium
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-700/50 bg-slate-950/60 p-5 lg:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black text-white">
              <ShieldCheck className="h-6 w-6 text-emerald-300" />
              Uso responsável
            </h2>
            <p className="text-sm leading-relaxed text-slate-300">
              Esta ferramenta é informativa e educacional. Ela ajuda a organizar estudo e hipóteses, mas não substitui análise individualizada, suitability ou recomendação profissional.
            </p>
          </div>
        </div>
      </section>

      {tool === 'graham' && (
        <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {[
            ['Preço vs Valor', 'Compara preço atual com valor estimado e margem de segurança.'],
            ['Qualidade', 'Observa ROE, dívida, consistência de lucro e saúde financeira.'],
            ['Dividendos', 'Avalia dividend yield, payout e sustentabilidade dos proventos.'],
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
          <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Amostra do screener</h2>
              <p className="text-sm text-slate-400">A versão completa libera filtros combinados, watchlists e exportação.</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {['P/L < 10', 'P/VP < 2', 'DY > 5%', 'ROE > 15%'].map((filter) => (
                <span key={filter} className="rounded-full border border-cyan-500/20 bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-200">{filter}</span>
              ))}
            </div>
          </div>
          <div className="overflow-hidden rounded-2xl border border-slate-700/50">
            {screenerRows.map((row) => (
              <Link key={row.ticker} to={`/ativo/${row.ticker}.SA`} className="grid grid-cols-[1fr_repeat(4,auto)] items-center gap-4 border-b border-slate-800 bg-slate-950/40 px-4 py-3 text-sm last:border-b-0 hover:bg-slate-800/40">
                <div>
                  <p className="font-mono text-lg font-black text-cyan-300">{row.ticker}</p>
                  <p className="text-xs text-slate-500">{row.name}</p>
                </div>
                <span className="font-mono text-slate-300">P/L {row.pe}</span>
                <span className="font-mono text-slate-300">P/VP {row.pvp}</span>
                <span className="font-mono text-emerald-300">DY {row.dy}</span>
                <span className="hidden rounded-full bg-slate-800 px-2 py-1 text-xs font-bold text-slate-300 sm:inline-flex">{row.score}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {tool === 'backtesting' && (
        <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black text-white">
              <Play className="h-6 w-6 text-amber-300" />
              Estratégias disponíveis
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
              Métricas do estudo
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {['Retorno total', 'Buy & Hold', 'Max drawdown', 'Sharpe', 'Win rate', 'Total de trades'].map((item) => (
                <div key={item} className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-4">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-slate-500">{item}</p>
                  <p className="mt-2 text-lg font-black text-white">Premium</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
        <p className="flex items-start gap-2 text-sm leading-relaxed text-slate-400">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
          O F-Insight organiza dados para estudo. Decisões financeiras devem considerar perfil, objetivos, riscos, horizonte e orientação profissional quando necessário.
        </p>
      </section>
    </Layout>
  );
}
