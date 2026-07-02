import { useEffect, useMemo, useState } from 'react';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Download,
  FileText,
  RefreshCw,
  Shield,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import API_ENDPOINTS from '@/config/api';
import { useTenant } from '@/context/TenantContext';
import { Layout } from '@/components/layout/Layout';
import { AllocationSignal, MacroIndicator, MacroOverview } from '@/types';

const fallbackOverview: MacroOverview = {
  updatedAt: new Date().toISOString(),
  source: 'demo',
  indicators: [
    {
      id: 'selic',
      label: 'Selic Meta',
      value: 10.5,
      unit: '% a.a.',
      date: new Date().toISOString().slice(0, 10),
      trend: 'neutral',
      interpretation: 'Principal referência para taxa de desconto, renda fixa e múltiplos de ações.',
    },
    {
      id: 'ipca',
      label: 'IPCA Mensal',
      value: 0.38,
      unit: '% m/m',
      date: new Date().toISOString().slice(0, 10),
      trend: 'neutral',
      interpretation: 'Inflação impacta juros futuros, margens corporativas e poder de compra.',
    },
    {
      id: 'usdbrl',
      label: 'Dólar Comercial',
      value: 5.2,
      unit: 'BRL',
      date: new Date().toISOString().slice(0, 10),
      trend: 'neutral',
      interpretation: 'Câmbio afeta inflação, commodities, exportadoras e empresas com dívida em dólar.',
    },
  ],
  signals: [
    {
      id: 'demo-signal',
      title: 'Juros relevantes: priorizar valuation, caixa e dividendos',
      type: 'macro_value',
      impact: 'moderado',
      status: 'monitorando',
      tickers: ['PETR4', 'VALE3', 'ITUB4'],
      summary: 'Cenário favorece relatórios focados em margem de segurança e qualidade dos fluxos de caixa.',
      rationale: 'Juros altos aumentam a taxa de desconto e penalizam empresas muito dependentes de crescimento futuro.',
      suggestedAction: 'Gerar relatório white-label para ativos com Graham Score elevado antes da reunião com o cliente.',
      generatedAt: new Date().toISOString(),
    },
  ],
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
      <p className="text-xs text-slate-500 mt-4">Último dado: {indicator.date}</p>
    </div>
  );
}

function SignalCard({ signal, onReport }: { signal: AllocationSignal; onReport: (ticker: string) => void }) {
  const firstTicker = signal.tickers?.[0] || 'PETR4';
  const isHighImpact = signal.impact === 'alto';

  return (
    <div className="bg-slate-800/40 rounded-xl p-5 border border-slate-700/40 hover:border-primary/30 transition-all">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={cn(
              'text-[11px] px-2 py-1 rounded-full font-semibold uppercase tracking-wide',
              isHighImpact ? 'bg-amber-500/20 text-amber-400' : 'bg-cyan-500/20 text-cyan-400'
            )}>
              Impacto {signal.impact}
            </span>
            <span className="text-[11px] px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold uppercase tracking-wide">
              {signal.status}
            </span>
          </div>
          <h3 className="text-lg font-bold text-white leading-snug">{signal.title}</h3>
        </div>
        <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
          {isHighImpact ? <AlertTriangle className="w-5 h-5 text-amber-400" /> : <Zap className="w-5 h-5 text-primary" />}
        </div>
      </div>

      <p className="text-sm text-slate-300 leading-relaxed mb-4">{signal.summary}</p>
      <div className="bg-slate-900/60 rounded-lg p-3 mb-4">
        <p className="text-xs text-slate-500 mb-1">Leitura técnica</p>
        <p className="text-sm text-slate-400 leading-relaxed">{signal.rationale}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {signal.tickers?.map((ticker) => (
          <button
            key={ticker}
            onClick={() => onReport(ticker)}
            className="px-2.5 py-1 rounded-lg bg-slate-900/70 border border-slate-700/50 text-cyan-400 font-mono text-xs hover:border-primary/50 transition-colors"
          >
            {ticker}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-slate-700/40">
        <p className="text-xs text-slate-400">{signal.suggestedAction}</p>
        <button
          onClick={() => onReport(firstTicker)}
          className="inline-flex items-center justify-center gap-2 px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Download className="w-4 h-4" />
          PDF {firstTicker}
        </button>
      </div>
    </div>
  );
}

export default function MacroSignals() {
  const { tenant, buildReportParams } = useTenant();
  const [overview, setOverview] = useState<MacroOverview>(fallbackOverview);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const lastUpdated = useMemo(() => {
    try {
      return new Date(overview.updatedAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
    } catch {
      return 'agora';
    }
  }, [overview.updatedAt]);

  const loadOverview = async (forceRefresh = false) => {
    forceRefresh ? setRefreshing(true) : setLoading(true);
    try {
      if (forceRefresh) {
        await fetch(API_ENDPOINTS.macro.refresh, { method: 'POST' });
      }
      const response = await fetch(API_ENDPOINTS.macro.overview);
      if (!response.ok) throw new Error('Macro API unavailable');
      const data = await response.json();
      setOverview({ ...fallbackOverview, ...data });
    } catch {
      setOverview(fallbackOverview);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadOverview(false);
  }, []);

  const openReport = (ticker: string) => {
    const params = buildReportParams();
    const url = `${API_ENDPOINTS.reports.valuation(ticker)}?${params.toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs px-2 py-0.5 bg-primary/15 text-primary rounded-full font-medium">
                <Shield className="w-3 h-3 inline mr-1" />
                White Label para {tenant.brandName}
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-primary" />
              Macroeconomia & Sinais de Alocação
            </h1>
            <p className="text-slate-400 mt-2 max-w-3xl">
              Painel de leitura macro com gatilhos automáticos para apoiar relatórios, reuniões e comunicação com clientes.
            </p>
          </div>
          <button
            onClick={() => loadOverview(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-slate-800/70 text-slate-200 rounded-lg border border-slate-700/50 hover:border-primary/40 transition-colors disabled:opacity-60"
          >
            <RefreshCw className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            Atualizar macro
          </button>
        </div>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {(loading ? fallbackOverview.indicators : overview.indicators).map((indicator) => (
          <MacroCard key={indicator.id} indicator={indicator} />
        ))}
      </section>

      <section className="bg-gradient-to-r from-primary/15 via-slate-800/60 to-slate-900/60 rounded-2xl p-5 border border-primary/20 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Relatórios white-label prontos para cliente</h2>
              <p className="text-sm text-slate-400 mt-1">
                Gere PDFs com as cores e nome do escritório atual. O cliente recebe um material com a marca de {tenant.brandName}.
              </p>
              <p className="text-xs text-slate-500 mt-2">Fonte: {overview.source} · Atualizado em {lastUpdated}</p>
            </div>
          </div>
          <button
            onClick={() => openReport('PETR4')}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Baixar PDF Demo PETR4
          </button>
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-secondary" />
              Sinais Ativos
            </h2>
            <p className="text-sm text-slate-400 mt-1">Gatilhos práticos para relatórios, carteira e reuniões com clientes.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {(loading ? fallbackOverview.signals : overview.signals).map((signal) => (
            <SignalCard key={signal.id} signal={signal} onReport={openReport} />
          ))}
        </div>
      </section>
    </Layout>
  );
}
