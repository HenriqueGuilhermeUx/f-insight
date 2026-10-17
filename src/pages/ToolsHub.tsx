import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Calculator,
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

const advisorTools = [
  {
    title: 'Valuation Graham',
    description: 'Organize premissas de valor, margem de segurança e relação preço x valor antes de gerar qualquer material.',
    icon: Calculator,
    action: 'Abrir estudo',
    href: '/graham-valor',
  },
  {
    title: 'Radar de ativos',
    description: 'Leitura de ativos, preço, variação e contexto para priorizar estudos — sem indicação automática de compra ou venda.',
    icon: TrendingUp,
    action: 'Abrir Radar',
    href: '/radar',
  },
  {
    title: 'Macro cockpit',
    description: 'Selic, IPCA, dólar e indicadores para transformar mercado em pauta de reunião.',
    icon: BarChart3,
    action: 'Abrir Macro',
    href: '/macro',
  },
  {
    title: 'Relatórios white-label',
    description: 'Materiais com marca, cores, fontes e premissas explícitas do escritório.',
    icon: FileText,
    action: 'Abrir relatórios',
    href: '/admin/relatorios',
  },
];

const clientTools = [
  { title: 'Entenda valor justo', description: 'Diferença entre preço, valor estimado e margem de segurança.', icon: Calculator },
  { title: 'Checklist de risco', description: 'Perguntas sobre concentração, volatilidade, liquidez, prazo e cenário.', icon: ShieldCheck },
  { title: 'Dividendos sem confusão', description: 'Conceitos de yield, payout, caixa e sustentabilidade.', icon: Percent },
  { title: 'Perguntas para reunião', description: 'Pauta simples para conversar melhor com seu assessor.', icon: HelpCircle },
];

const rules = [
  'Cliente final recebe versão educativa das ferramentas.',
  'Admin e assessor acessam a versão operacional para preparar estudos, relatórios e pautas.',
  'O portal segue sem saldo, custódia, extrato, ordem ou execução de investimento.',
  'Nenhum PDF de valuation pode usar preço ou valor estimado fictício como fallback.',
  'Todo material mantém linguagem informativa, premissas, fontes e disclaimer do escritório.',
];

export default function ToolsHub() {
  const { user } = useAuth();
  const { tenant } = useTenant();
  const isClient = user?.role === 'client';

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
              {isClient ? 'Ferramentas educativas para entender melhor.' : 'Cockpit de análise para escritório e assessor.'}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              {isClient
                ? 'Acesso conceitual para entender mercado, risco, valuation e premissas antes de tomar decisões.'
                : `Use ferramentas de análise, conteúdo e relatórios para fortalecer o relacionamento de ${tenant.brandName}, sempre com fontes e premissas explícitas.`}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 min-w-[280px]">
            <Lock className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Acesso por perfil</h3>
            <p className="text-sm text-slate-300 leading-relaxed">Modo operacional para escritório e modo educativo para cliente final.</p>
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
                <Link to={tool.href} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
                  {tool.action}
                  <ArrowRight className="w-4 h-4" />
                </Link>
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
