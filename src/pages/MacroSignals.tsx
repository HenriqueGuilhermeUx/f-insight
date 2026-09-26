import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  RefreshCw,
  Shield,
  WifiOff,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import API_ENDPOINTS from '@/config/api';
import { useTenant } from '@/context/TenantContext';
import { Layout } from '@/components/layout/Layout';
import { MacroIndicator, MacroObservation, MacroOverview } from '@/types';

const emptyOverview: MacroOverview = {
  updatedAt: null,
  source: 'unavailable',
  indicators: [],
  observations: [],
  signals: [],
  degraded: true,
  failures: [],
};

function formatValue(indicator: MacroIndicator) {
  if (indicator.id === 'usdbrl') {
    return indicator.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }
  return `${indicator.value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${indicator.unit}`;
}

function TrendIcon({ trend }: { trend: MacroIndicator['trend'] }) {
  if (trend === 'up') return <ArrowUpRight className="w-4 h-4 text-amber-400" />;
  if (trend === 'down') return <ArrowDownRight className="w-4 h-4 text-emerald-400" />;
  return <Activity className="w-4 h-4 text-cyan-400" />;
}

function MacroCard({ indicator }: { indicator: MacroIndicator }) {
  return (
    <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/40 hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-slate-400 mb-1">{indicator.label}</p>
          <p className="text-2xl font-bold text-white font-mono">{formatValue(indicator)}</p>
        </div>
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <TrendIcon trend={indicator.trend} />
        </div>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed">{indicator.interpretation}</p>
      <div className="mt-4 space-y-1 text-xs text-slate-500">
        <p>Referência: {indicator.date}</p>
        {indicator.source && <p>Fonte: {indicator.source}</p>}
      </div>
    </div>
  );
}

function ObservationCard({ observation }: { observation: MacroObservation }) {
  return (
    <article className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
      <div className="mb-3 flex items-center gap-2">
        <BookOpen className="h-5 w-5 text-cyan-300" />
        <span className="text-[11px] font-black uppercase tracking-[0.12em] text-cyan-300">{observation.topic}</span>
      </div>
      <h3 className="text-lg font-bold text-white">{observation.title}</h3>
      <p className="mt-2 text-sm font-semibold text-slate-200">{observation.summary}</p>
      <p className="mt-3 text-sm leading-relaxed text-slate-400">{observation.explanation}</p>
      <p className="mt-4 text-xs text-slate-500">Fonte: {observation.source} · Referência: {observation.referenceDate}</p>
    </article>
  );
}

export default function MacroSignals() {
  const { tenant } = useTenant();
  const [overview, setOverview] = useState<MacroOverview>(emptyOverview);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const lastUpdated = useMemo(() => {
    if (!overview.updatedAt) return 'indisponível';
    const parsed = new Date(overview.updatedAt);
    if (Number.isNaN(parsed.getTime())) return 'indisponível';
    return parsed.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  }, [overview.updatedAt]);

  const loadOverview = async (forceRefresh = false) => {
    forceRefresh ? setRefreshing(true) : setLoading(true);
    setError('');
    try {
      if (forceRefresh) {
        const refreshResponse = await fetch(API_ENDPOINTS.macro.refresh, { method: 'POST' });
        if (!refreshResponse.ok) throw new Error('Não foi possível atualizar as fontes macroeconômicas.');
      }
      const response = await fetch(API_ENDPOINTS.macro.overview);
      if (!response.ok) throw new Error('Dados macroeconômicos indisponíveis.');
      const data = await response.json() as Partial<MacroOverview>;
      setOverview({
        ...emptyOverview,
        ...data,
        indicators: Array.isArray(data.indicators) ? data.indicators : [],
        observations: Array.isArray(data.observations) ? data.observations : [],
        signals: [],
      });
    } catch (cause) {
      setOverview(emptyOverview);
      setError(cause instanceof Error ? cause.message : 'Dados macroeconômicos indisponíveis.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadOverview(false);
  }, []);

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 bg-primary/15 text-primary rounded-full font-medium">
                <Shield className="w-3 h-3 inline mr-1" />
                Informação para {tenant.brandName}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Macroeconomia & Contexto
            </h1>
            <p className="text-slate-400 mt-2 max-w-3xl">
              Indicadores oficiais e explicações de contexto para estudo. Sem ranking de ativos, sinal de alocação ou recomendação automática.
            </p>
          </div>
          <button
            onClick={() => void loadOverview(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/70 text-slate-200 rounded-lg border border-slate-700/50 hover:border-primary/40 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            Atualizar fontes
          </button>
        </div>
      </div>

      {loading ? (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((item) => <div key={item} className="h-48 rounded-xl border border-slate-700/40 bg-slate-800/40 skeleton" />)}
        </section>
      ) : overview.indicators.length > 0 ? (
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          {overview.indicators.map((indicator) => <MacroCard key={indicator.id} indicator={indicator} />)}
        </section>
      ) : (
        <section className="mb-8 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-6">
          <div className="flex items-start gap-3">
            <WifiOff className="mt-0.5 h-6 w-6 shrink-0 text-amber-300" />
            <div>
              <h2 className="font-bold text-white">Indicadores temporariamente indisponíveis</h2>
              <p className="mt-1 text-sm leading-relaxed text-slate-300">O F-Insight não substitui falhas do Banco Central por Selic, IPCA ou câmbio fictícios.</p>
              {error && <p className="mt-2 text-xs text-amber-200">{error}</p>}
            </div>
          </div>
        </section>
      )}

      <section className="mb-8 rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 via-slate-800/60 to-slate-900/60 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Transparência da leitura</h2>
            <p className="mt-1 text-sm text-slate-400">Fonte agregada: {overview.source} · Cache atualizado em {lastUpdated}</p>
          </div>
          <div className="text-xs text-slate-400">
            {overview.degraded ? `${overview.failures?.length || 0} fonte(s) com falha nesta coleta.` : 'Fontes consultadas sem falha registrada nesta coleta.'}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-white">Leituras de contexto</h2>
          <p className="mt-1 text-sm text-slate-400">Explicações neutras sobre como juros, inflação e câmbio podem afetar diferentes situações. Não são ações sugeridas.</p>
        </div>
        {overview.observations.length > 0 ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
            {overview.observations.map((observation) => <ObservationCard key={observation.id} observation={observation} />)}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/40 p-6 text-center text-sm text-slate-400">
            As observações aparecem somente quando existe indicador oficial disponível para contextualizar.
          </div>
        )}
      </section>
    </Layout>
  );
}
