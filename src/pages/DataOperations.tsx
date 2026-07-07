import { useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  Database,
  Newspaper,
  RefreshCcw,
  Router,
  Server,
  ShieldCheck,
  Timer,
  Wifi,
  XCircle,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import API_ENDPOINTS from '@/config/api';

interface LiveStatus {
  supabase?: boolean;
  cache?: {
    lastNewsRefreshAt?: string | null;
    lastIndicatorsRefreshAt?: string | null;
    lastMacroRefreshAt?: string | null;
    source?: string;
  };
  lastRuns?: Array<{
    kind: string;
    status: string;
    ran_at: string;
    metadata?: Record<string, unknown>;
  }>;
  macro?: {
    updatedAt?: string;
    source?: string;
  };
}

function formatDate(value?: string | null) {
  if (!value) return 'Ainda não executado';
  return new Date(value).toLocaleString('pt-BR');
}

export default function DataOperations() {
  const [status, setStatus] = useState<LiveStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API_ENDPOINTS.live.status);
      if (!response.ok) throw new Error('Status API unavailable');
      const data = await response.json();
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar status');
    } finally {
      setLoading(false);
    }
  };

  const runRefresh = async () => {
    setRefreshing(true);
    setError('');
    try {
      const response = await fetch(API_ENDPOINTS.live.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!response.ok) throw new Error('Refresh API unavailable');
      await loadStatus();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao rodar refresh');
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    void loadStatus();
  }, []);

  const cards = [
    {
      label: 'Supabase backend',
      value: status?.supabase ? 'Conectado' : 'Pendente',
      icon: Database,
      ok: Boolean(status?.supabase),
      helper: 'Banco principal para cache, histórico e dados operacionais.',
    },
    {
      label: 'Notícias',
      value: formatDate(status?.cache?.lastNewsRefreshAt),
      icon: Newspaper,
      ok: Boolean(status?.cache?.lastNewsRefreshAt),
      helper: 'Refresh programado a cada 30 minutos no backend.',
    },
    {
      label: 'Indicadores',
      value: formatDate(status?.cache?.lastIndicatorsRefreshAt),
      icon: Activity,
      ok: Boolean(status?.cache?.lastIndicatorsRefreshAt),
      helper: 'Refresh programado de hora em hora para ativos monitorados.',
    },
    {
      label: 'Macro',
      value: formatDate(status?.cache?.lastMacroRefreshAt || status?.macro?.updatedAt),
      icon: Timer,
      ok: Boolean(status?.cache?.lastMacroRefreshAt || status?.macro?.updatedAt),
      helper: 'Refresh programado a cada 6 horas com fontes públicas.',
    },
  ];

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <Server className="w-3.5 h-3.5" />
              Operação de dados
            </span>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Supabase, notícias, indicadores e cron.</h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              Painel para verificar se as informações estão rodando ao vivo, sendo cacheadas no Supabase e atualizadas pelo backend.
            </p>
          </div>
          <button
            onClick={runRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-60 transition-colors"
          >
            <RefreshCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Atualizando...' : 'Rodar refresh agora'}
          </button>
        </div>
      </section>

      {error && (
        <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 flex gap-3">
          <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-100/80 leading-relaxed">{error}. Verifique deploy do backend, variáveis de ambiente e Supabase.</p>
        </div>
      )}

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.label} className={`rounded-2xl border p-5 ${card.ok ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-amber-500/20 bg-amber-500/10'}`}>
              <div className="flex items-center justify-between mb-4">
                <Icon className={card.ok ? 'w-6 h-6 text-emerald-400' : 'w-6 h-6 text-amber-400'} />
                {card.ok ? <CheckCircle2 className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-amber-400" />}
              </div>
              <p className="text-sm text-slate-400 mb-1">{card.label}</p>
              <p className="text-xl font-black text-white">{loading ? 'Carregando...' : card.value}</p>
              <p className="text-xs text-slate-400 mt-3 leading-relaxed">{card.helper}</p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_0.85fr] gap-6">
        <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-5">
            <Router className="w-6 h-6 text-primary" />
            Últimas execuções
          </h2>
          <div className="space-y-3">
            {(status?.lastRuns || []).length > 0 ? status?.lastRuns?.map((run, index) => (
              <div key={`${run.kind}-${run.ran_at}-${index}`} className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{run.kind}</span>
                    <span className={run.status === 'success' ? 'rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-bold text-emerald-300' : 'rounded-full bg-red-500/10 px-2.5 py-1 text-[11px] font-bold text-red-300'}>
                      {run.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{formatDate(run.ran_at)}</p>
                </div>
                <p className="text-xs text-slate-500 max-w-lg truncate">{JSON.stringify(run.metadata || {})}</p>
              </div>
            )) : (
              <div className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4 text-sm text-slate-400">
                Sem logs ainda. Rode o refresh manual ou aguarde o cron.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-5">
            <Wifi className="w-6 h-6 text-emerald-400" />
            Checklist para 100% produção
          </h2>
          <div className="space-y-3">
            {[
              'Rodar supabase/live_data_foundation.sql',
              'Configurar SUPABASE_URL no Render',
              'Configurar SUPABASE_SERVICE_ROLE_KEY no Render',
              'Configurar FINNHUB_API_KEY no Render',
              'Manter ENABLE_CRON diferente de false',
              'Redeploy do backend f-insight-api',
              'Redeploy do frontend f-insight',
            ].map((item) => (
              <div key={item} className="rounded-xl bg-slate-950/50 border border-slate-700/40 p-3 flex gap-3">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
