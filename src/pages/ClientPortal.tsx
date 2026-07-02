import {
  ArrowUpRight,
  BadgeCheck,
  CalendarDays,
  Download,
  FileText,
  Lock,
  MessageCircle,
  PieChart,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
} from 'lucide-react';
import API_ENDPOINTS from '@/config/api';
import { useTenant } from '@/context/TenantContext';
import { Layout } from '@/components/layout/Layout';

const portfolio = [
  { label: 'Ações Brasil', value: 42, note: 'valor e dividendos' },
  { label: 'Renda Fixa', value: 34, note: 'defensivo' },
  { label: 'Exterior', value: 16, note: 'proteção cambial' },
  { label: 'Caixa', value: 8, note: 'oportunidades' },
];

const reports = [
  { ticker: 'PETR4', title: 'Valuation e margem de segurança', status: 'Atualizado hoje' },
  { ticker: 'VALE3', title: 'Cenário cambial e commodities', status: 'Novo sinal macro' },
  { ticker: 'ITUB4', title: 'Qualidade, ROE e dividendos', status: 'Revisão mensal' },
];

const plainLanguageSignals = [
  {
    title: 'Juros altos pedem mais disciplina',
    text: 'O cenário favorece empresas lucrativas, com caixa forte e preço descontado. Crescimento caro deve ser analisado com mais cautela.',
  },
  {
    title: 'Dólar mexe com exportadoras',
    text: 'Empresas com receita em dólar podem se beneficiar, mas dívida em dólar e custos também precisam ser observados.',
  },
  {
    title: 'Inflação impacta poder de compra',
    text: 'Companhias com poder de repasse e margens resilientes tendem a proteger melhor o resultado.',
  },
];

export default function ClientPortal() {
  const { tenant, buildReportParams } = useTenant();

  const openReport = (ticker: string) => {
    const params = buildReportParams();
    const url = `${API_ENDPOINTS.reports.valuation(ticker)}?${params.toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Layout>
      <section className="mb-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <Lock className="h-3.5 w-3.5" />
                Ambiente seguro do cliente
              </span>
              <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {tenant.brandName}
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">
              Seu painel de investimentos, explicado de forma simples.
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Acompanhe relatórios, sinais de mercado e decisões da sua carteira com a curadoria do seu escritório. Sem excesso de jargão. Com clareza para tomar decisões melhores junto ao assessor.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-5 min-w-[280px]">
            <p className="text-sm text-slate-400 mb-1">Resumo da carteira modelo</p>
            <p className="text-4xl font-black text-white">+12,4%</p>
            <p className="text-sm text-emerald-400 flex items-center gap-1 mt-1">
              <ArrowUpRight className="w-4 h-4" />
              desempenho no ano
            </p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-700/40">
                <p className="text-xs text-slate-500">Risco</p>
                <p className="font-bold text-white">Moderado</p>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-700/40">
                <p className="text-xs text-slate-500">Revisão</p>
                <p className="font-bold text-white">Mensal</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {portfolio.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
            <p className="text-sm text-slate-400 mb-2">{item.label}</p>
            <div className="flex items-end gap-2 mb-3">
              <p className="text-3xl font-black text-white">{item.value}%</p>
              <span className="text-xs text-slate-500 mb-1">da estratégia</span>
            </div>
            <div className="h-2 rounded-full bg-slate-900 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${item.value}%` }} />
            </div>
            <p className="text-xs text-slate-500 mt-3">{item.note}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Relatórios para você
              </h2>
              <p className="text-slate-400 mt-1">Materiais prontos para ler, baixar e discutir com seu assessor.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">3 novos</span>
          </div>

          <div className="space-y-3">
            {reports.map((report) => (
              <div key={report.ticker} className="rounded-2xl border border-slate-700/40 bg-slate-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-mono font-black">
                    {report.ticker.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-mono font-bold text-cyan-400">{report.ticker}</p>
                    <h3 className="font-bold text-white">{report.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{report.status}</p>
                  </div>
                </div>
                <button
                  onClick={() => openReport(report.ticker)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Baixar PDF
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-amber-400" />
            O que isso significa?
          </h2>
          <p className="text-slate-400 mb-5">Sinais técnicos traduzidos em linguagem de cliente.</p>

          <div className="space-y-3">
            {plainLanguageSignals.map((signal) => (
              <div key={signal.title} className="rounded-2xl bg-slate-950/50 border border-slate-700/40 p-4">
                <h3 className="font-bold text-white mb-2">{signal.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{signal.text}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
          <PieChart className="w-6 h-6 text-primary mb-3" />
          <h3 className="font-bold text-white mb-2">Carteira clara</h3>
          <p className="text-sm text-slate-400 leading-relaxed">O cliente entende onde está alocado e por que cada classe existe na estratégia.</p>
        </div>
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
          <Target className="w-6 h-6 text-emerald-400 mb-3" />
          <h3 className="font-bold text-white mb-2">Decisão guiada</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Relatórios e sinais viram pauta objetiva para reuniões, rebalanceamentos e comunicação.</p>
        </div>
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
          <Shield className="w-6 h-6 text-amber-400 mb-3" />
          <h3 className="font-bold text-white mb-2">Confiança no escritório</h3>
          <p className="text-sm text-slate-400 leading-relaxed">A experiência digital reforça autoridade, organização e percepção de cuidado.</p>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-primary/20 bg-primary/10 p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            Próxima conversa com o assessor
          </h2>
          <p className="text-slate-400 mt-1">Sugestão de pauta: revisar sinais macro, carteira modelo e relatórios atualizados.</p>
        </div>
        <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950/70 px-5 py-3 text-sm font-bold text-white border border-slate-700/50 hover:border-primary/50 transition-colors">
          <MessageCircle className="w-4 h-4" />
          Falar com o assessor
        </button>
      </section>
    </Layout>
  );
}
