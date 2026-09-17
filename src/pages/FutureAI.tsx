import { useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Clock3,
  Gauge,
  Loader2,
  PiggyBank,
  ShieldCheck,
  Sparkles,
  Target,
  WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { runLifePlan, type LifePlanResponse } from '@/services/finsightAgentApi';

const objectives = [
  'Sair do vermelho',
  'Montar reserva',
  'Acumular patrimônio',
  'Aposentar com renda',
  'Comprar imóvel',
  'Organizar minha família',
];

function money(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

function numberValue(value: string) {
  const parsed = Number(value.replace(/\./g, '').replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function FutureAI() {
  const [objective, setObjective] = useState(objectives[1]);
  const [income, setIncome] = useState('5000');
  const [expenses, setExpenses] = useState('3800');
  const [savings, setSavings] = useState('300');
  const [debt, setDebt] = useState('0');
  const [targetAmount, setTargetAmount] = useState('50000');
  const [years, setYears] = useState('5');
  const [dependents, setDependents] = useState('0');
  const [statementText, setStatementText] = useState('');
  const [result, setResult] = useState<LifePlanResponse | null>(null);
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (numberValue(income) <= 0) {
      toast.error('Informe sua renda mensal para gerar o diagnóstico.');
      return;
    }

    setLoading(true);
    try {
      const response = await runLifePlan({
        objective,
        income: numberValue(income),
        expenses: numberValue(expenses),
        savings: numberValue(savings),
        debt: numberValue(debt),
        targetAmount: numberValue(targetAmount),
        years: Math.max(1, numberValue(years)),
        dependents: Math.max(0, numberValue(dependents)),
        statementText,
      });
      setResult(response);
    } catch {
      toast.error('O Futuro IA não conseguiu gerar seu diagnóstico agora.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <section className="mb-7 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/12 via-slate-900 to-slate-950 p-6 lg:p-8">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-center">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-widest text-emerald-300">
              <Sparkles className="h-4 w-4" /> Meu Futuro IA
            </span>
            <h1 className="max-w-4xl text-4xl font-black tracking-tight text-white lg:text-6xl">
              Seu extrato diz para onde sua vida financeira está indo.
            </h1>
            <p className="mt-4 max-w-3xl text-lg leading-relaxed text-slate-300">
              Transforme renda, gastos, dívidas e objetivos em diagnóstico, cenários e um plano simples de próximos passos.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5">
            <ShieldCheck className="mb-3 h-6 w-6 text-cyan-300" />
            <h2 className="font-bold text-white">Planejamento, não promessa</h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-300">
              Os cenários são simulações educativas. O F-Insight não recomenda ativos, não promete retorno e não movimenta dinheiro.
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[430px_1fr]">
        <section className="h-fit rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="mb-1 flex items-center gap-2 text-2xl font-bold text-white">
            <Target className="h-6 w-6 text-emerald-300" /> Seu ponto de partida
          </h2>
          <p className="mb-5 text-sm text-slate-400">Leva menos de dois minutos. Você pode ajustar e simular quantas vezes quiser.</p>

          <label className="mb-2 block text-sm font-semibold text-slate-300">O que você quer melhorar primeiro?</label>
          <div className="mb-5 flex flex-wrap gap-2">
            {objectives.map((item) => (
              <button
                key={item}
                onClick={() => setObjective(item)}
                className={`rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${objective === item ? 'border-emerald-400/40 bg-emerald-500/15 text-emerald-200' : 'border-slate-700 bg-slate-950/50 text-slate-400 hover:border-slate-600'}`}
              >
                {item}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ['Renda mensal', income, setIncome],
              ['Gastos mensais', expenses, setExpenses],
              ['Quanto guarda/mês', savings, setSavings],
              ['Dívidas totais', debt, setDebt],
              ['Meta em R$', targetAmount, setTargetAmount],
              ['Prazo em anos', years, setYears],
              ['Dependentes', dependents, setDependents],
            ].map(([label, value, setter]) => (
              <label key={String(label)} className={String(label) === 'Dependentes' ? 'col-span-2' : ''}>
                <span className="mb-1 block text-xs font-semibold text-slate-400">{String(label)}</span>
                <input
                  value={String(value)}
                  onChange={(event) => (setter as (next: string) => void)(event.target.value)}
                  inputMode="decimal"
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-3 py-3 font-mono text-white outline-none focus:border-emerald-500/50"
                />
              </label>
            ))}
          </div>

          <label className="mt-4 block">
            <span className="mb-1 block text-xs font-semibold text-slate-400">Extrato/fatura em texto (opcional)</span>
            <textarea
              rows={5}
              value={statementText}
              onChange={(event) => setStatementText(event.target.value)}
              placeholder={'Ex.: iFood R$ 82,90\nNetflix R$ 39,90\nTarifa R$ 25,00'}
              className="w-full resize-none rounded-xl border border-slate-700/50 bg-slate-950/70 px-3 py-3 text-sm text-white placeholder:text-slate-600 outline-none focus:border-emerald-500/50"
            />
          </label>

          <button
            onClick={() => void analyze()}
            disabled={loading}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 font-black text-slate-950 transition-colors hover:bg-emerald-300 disabled:opacity-60"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5" />}
            Gerar meu diagnóstico
          </button>
        </section>

        {!result ? (
          <section className="rounded-3xl border border-dashed border-slate-700 bg-slate-900/40 p-8 lg:p-12">
            <div className="mx-auto max-w-xl text-center">
              <Gauge className="mx-auto h-14 w-14 text-slate-600" />
              <h2 className="mt-5 text-2xl font-bold text-white">Seu painel de futuro aparece aqui.</h2>
              <p className="mt-3 leading-relaxed text-slate-400">
                O diagnóstico cruza folga mensal, capacidade de poupança, dívida, meta e sinais encontrados no texto do extrato.
              </p>
            </div>
          </section>
        ) : (
          <section className="space-y-5 animate-fade-in">
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-widest text-emerald-300">Seu perfil atual</p>
                  <h2 className="mt-2 text-4xl font-black text-white">{result.diagnosis.persona}</h2>
                  <p className="mt-3 max-w-3xl text-slate-300">{result.diagnosis.stage}</p>
                </div>
                <div className="min-w-[170px] rounded-2xl border border-emerald-400/20 bg-slate-950/55 p-4 text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Índice de liberdade</p>
                  <p className="mt-1 text-5xl font-black text-emerald-300">{result.diagnosis.freedomScore}</p>
                  <p className="text-xs text-slate-500">de 100</p>
                </div>
              </div>
              <div className="mt-5 rounded-2xl border border-slate-700/40 bg-slate-950/55 p-5">
                <p className="text-sm font-bold text-cyan-300">A Real</p>
                <p className="mt-2 text-lg leading-relaxed text-white">{result.diagnosis.realTalk}</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
                <WalletCards className="h-5 w-5 text-cyan-300" />
                <p className="mt-3 text-xs uppercase tracking-wider text-slate-500">Folga mensal</p>
                <p className={`mt-1 text-2xl font-black ${result.diagnosis.monthlyBalance >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>{money(result.diagnosis.monthlyBalance)}</p>
              </div>
              <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
                <PiggyBank className="h-5 w-5 text-amber-300" />
                <p className="mt-3 text-xs uppercase tracking-wider text-slate-500">Vazamento potencial</p>
                <p className="mt-1 text-2xl font-black text-amber-300">{money(result.diagnosis.leakPotential)}</p>
              </div>
              <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
                <Clock3 className="h-5 w-5 text-purple-300" />
                <p className="mt-3 text-xs uppercase tracking-wider text-slate-500">Horas recuperáveis</p>
                <p className="mt-1 text-2xl font-black text-purple-300">{result.diagnosis.workHoursRecoverable.toFixed(1).replace('.', ',')} h/mês</p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
              <h3 className="text-xl font-bold text-white">Cenários para {years} ano(s)</h3>
              <p className="mt-1 text-sm text-slate-400">Simulações com premissas diferentes; não são previsão nem promessa de retorno.</p>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl bg-slate-950/60 p-4">
                  <p className="text-xs font-bold text-slate-500">CONSERVADOR</p>
                  <p className="mt-2 text-2xl font-black text-slate-200">{money(result.scenarios.conservative)}</p>
                </div>
                <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-4">
                  <p className="text-xs font-bold text-cyan-400">BASE</p>
                  <p className="mt-2 text-2xl font-black text-cyan-200">{money(result.scenarios.base)}</p>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
                  <p className="text-xs font-bold text-emerald-400">ACELERADO</p>
                  <p className="mt-2 text-2xl font-black text-emerald-200">{money(result.scenarios.accelerated)}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
              <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5">
                <h3 className="font-bold text-white">Oportunidades detectadas</h3>
                <div className="mt-4 space-y-3">
                  {result.opportunities.map((item) => (
                    <div key={item} className="flex gap-3 rounded-xl bg-slate-950/55 p-3 text-sm text-slate-300">
                      <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-cyan-300" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl border border-amber-500/20 bg-amber-500/10 p-5">
                <h3 className="font-bold text-white">Missão dos próximos 7 dias</h3>
                <p className="mt-3 leading-relaxed text-amber-50/85">{result.missions.sevenDays}</p>
                <div className="mt-4 space-y-2">
                  {result.missions.ninetyDays.map((item) => (
                    <div key={item} className="rounded-xl border border-amber-500/10 bg-slate-950/35 p-3 text-sm text-slate-300">{item}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
              <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" />
              <p className="text-sm leading-relaxed text-amber-100/80">{result.riskNotice}</p>
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
