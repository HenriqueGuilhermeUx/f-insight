import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
  Download,
  FileText,
  HelpCircle,
  Lock,
  Percent,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import API_ENDPOINTS from '@/config/api';

const advisorTools = [
  {
    title: 'Valuation Graham',
    description: 'Estimativa educacional de valor, margem de segurança e relação preço x valor para apoiar relatórios.',
    icon: Calculator,
    action: 'Gerar PDF PETR4',
    type: 'pdf' as const,
    ticker: 'PETR4',
  },
  {
    title: 'Radar de ativos',
    description: 'Leitura de ativos, múltiplos, preço, tendência e sinais orientativos para priorizar estudos.',
    icon: TrendingUp,
    action: 'Abrir Radar',
    type: 'link' as const,
    href: '/radar',
  },
  {
    title: 'Macro cockpit',
    description: 'Selic, IPCA, dólar e indicadores para transformar mercado em pauta de reunião.',
    icon: BarChart3,
    action: 'Abrir Macro',
    type: 'link' as const,
    href: '/macro',
  },
  {
    title: 'PDF white-label',
    description: 'Relatórios com marca, cores e disclaimer do escritório.',
    icon: FileText,
    action: 'Publicar relatório',
    type: 'link' as const,
    href: '/admin/relatorios',
  },
];

const clientTools = [
  { title: 'Entenda valor justo', description: 'Diferença entre preço, valor intrínseco e margem de segurança.', icon: Calculator },
  { title: 'Checklist de risco', description: 'Perguntas sobre concentração, volatilidade, liquidez, prazo e cenário.', icon: ShieldCheck },
  { title: 'Dividendos sem confusão', description: 'Conceitos de yield, payout, caixa e sustentabilidade.', icon: Percent },
  { title: 'Perguntas para reunião', description: 'Pauta simples para conversar melhor com seu assessor.', icon: HelpCircle },
];

const rules = [
  'Cliente final recebe versão educativa das ferramentas.',
  'Admin e assessor acessam a versão operacional para preparar relatórios e pautas.',
  'O portal segue sem saldo, custódia, extrato ou posição real.',
  'Todo material mantém linguagem informativa e disclaimer do escritório.',
];

export default function ToolsHub() {
  const { user } = useAuth();
  const { buildReportParams, tenant } = useTenant();
  const isClient = user?.role === 'client';

  const openValuationPdf = (ticker: string) => {
    const params = buildReportParams();
    const url = `${API_ENDPOINTS.reports.valuation(ticker)}?${params.toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <Calculator className="w-3.5 h-3.5" />
              Ferramentas F-Insight
            </span>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">
              {isClient ? 'Ferramentas educativas para conversar melhor.' : 'Cockpit de análise para escritório e assessor.'}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              {isClient
                ? 'Acesso conceitual para entender melhor mercado, risco e valuation antes da conversa com o assessor.'
                : `Use ferramentas de análise, conteúdo e PDF white-label para fortalecer o relacionamento de ${tenant.brandName}.`}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 min-w-[280px]">
            <Lock className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Acesso por perfil</h3>
            <p className="text-sm text-slate-300 leading-relaxed">Modo completo para escritório e modo educativo para cliente final.</p>
          </div>
        </div>
      </section>

      {!isClient && (
        <section className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
          {advisorTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <div key={tool.title} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 hover:border-primary/40 transition-colors">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{tool.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed mb-5">{tool.description}</p>
                {tool.type === 'pdf' ? (
                  <button
                    onClick={() => openValuationPdf(tool.ticker)}
                    className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    {tool.action}
                  </button>
                ) : (
                  <Link to={tool.href} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
                    {tool.action}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                )}
              </div>
            );
          })}
        </section>
      )}

      <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-5">
            <BookOpen className="w-6 h-6 text-primary" />
            Versão educativa para cliente final
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clientTools.map((tool) => {
              const Icon = tool.icon;
              return (
                <div key={tool.title} className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4">
                  <Icon className="w-6 h-6 text-primary mb-3" />
                  <h3 className="font-bold text-white mb-2">{tool.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{tool.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-5">
            <Target className="w-6 h-6 text-emerald-400" />
            Regras de uso
          </h2>
          <div className="space-y-3 mb-6">
            {rules.map((item) => (
              <div key={item} className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4 flex gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
          {!isClient && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Link to="/admin/conteudos" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950/70 px-5 py-3 text-sm font-bold text-white border border-slate-700/50 hover:border-primary/50 transition-colors">
                <BookOpen className="w-4 h-4" />
                Criar conteúdo
              </Link>
              <Link to="/admin/clientes" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950/70 px-5 py-3 text-sm font-bold text-white border border-slate-700/50 hover:border-primary/50 transition-colors">
                <Users className="w-4 h-4" />
                Ver clientes
              </Link>
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
