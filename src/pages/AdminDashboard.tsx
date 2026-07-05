import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  Briefcase,
  Building2,
  Calculator,
  FileText,
  Plus,
  Shield,
  Users,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { getWorkspaceStats } from '@/services/workspace';
import { getScheduledUpdateStats } from '@/services/updateScheduler';

export default function AdminDashboard() {
  const stats = getWorkspaceStats();
  const updateStats = getScheduledUpdateStats();

  const cards = [
    { label: 'Assessores', value: stats.advisors.length, icon: Briefcase, href: '/admin/assessores' },
    { label: 'Clientes finais', value: stats.clients.length, icon: Users, href: '/admin/clientes' },
    { label: 'Relatórios publicados', value: stats.publishedReports, icon: FileText, href: '/admin/relatorios' },
    { label: 'Conteúdos educativos', value: stats.contents.length, icon: BookOpen, href: '/admin/conteudos' },
    { label: 'Ferramentas de análise', value: 4, icon: Calculator, href: '/admin/insights' },
    { label: 'Fábrica editorial', value: 3, icon: Bot, href: '/admin/fabrica-conteudo' },
    { label: 'IA financeira', value: 6, icon: Bot, href: '/admin/ia-financeira' },
    { label: 'Atualizações', value: updateStats.active, icon: Bell, href: '/admin/atualizacoes' },
  ];

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <Building2 className="w-3.5 h-3.5" />
              Admin do escritório
            </span>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">
              Operação white-label de {stats.tenant?.brandName || 'Escritório'}.
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              Cadastre assessores, convide clientes finais e publique relatórios ou conteúdos educativos sem expor saldos, custódia ou patrimônio.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 min-w-[280px]">
            <Shield className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Modelo seguro</h3>
            <p className="text-sm text-slate-300 leading-relaxed">Portal orientativo, com curadoria e relatórios liberados pelo escritório.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Link key={card.label} to={card.href} className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-3xl font-black text-white">{card.value}</p>
              <p className="text-sm text-slate-400 mt-1">{card.label}</p>
            </Link>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-6">
        <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Próximas ações</h2>
          <p className="text-slate-400 mb-5">Fluxo mínimo para vender e operar o produto.</p>
          <div className="space-y-3">
            <Link to="/admin/assessores" className="flex items-center justify-between rounded-2xl bg-slate-950/50 border border-slate-700/40 p-4 hover:border-primary/40 transition-colors">
              <span className="text-slate-200 font-semibold">Cadastrar assessores do escritório</span>
              <Plus className="w-4 h-4 text-primary" />
            </Link>
            <Link to="/admin/clientes" className="flex items-center justify-between rounded-2xl bg-slate-950/50 border border-slate-700/40 p-4 hover:border-primary/40 transition-colors">
              <span className="text-slate-200 font-semibold">Convidar clientes finais</span>
              <Plus className="w-4 h-4 text-primary" />
            </Link>
            <Link to="/admin/relatorios" className="flex items-center justify-between rounded-2xl bg-slate-950/50 border border-slate-700/40 p-4 hover:border-primary/40 transition-colors">
              <span className="text-slate-200 font-semibold">Publicar relatório para cliente</span>
              <Plus className="w-4 h-4 text-primary" />
            </Link>
            <Link to="/admin/conteudos" className="flex items-center justify-between rounded-2xl bg-slate-950/50 border border-slate-700/40 p-4 hover:border-primary/40 transition-colors">
              <span className="text-slate-200 font-semibold">Criar conteúdo educativo</span>
              <Plus className="w-4 h-4 text-primary" />
            </Link>
            <Link to="/admin/fabrica-conteudo" className="flex items-center justify-between rounded-2xl bg-slate-950/50 border border-slate-700/40 p-4 hover:border-primary/40 transition-colors">
              <span className="text-slate-200 font-semibold">Gerar pacote editorial F-Insight</span>
              <Plus className="w-4 h-4 text-primary" />
            </Link>
            <Link to="/admin/atualizacoes" className="flex items-center justify-between rounded-2xl bg-slate-950/50 border border-slate-700/40 p-4 hover:border-primary/40 transition-colors">
              <span className="text-slate-200 font-semibold">Programar atualizações automáticas</span>
              <Plus className="w-4 h-4 text-primary" />
            </Link>
            <Link to="/admin/ia-financeira" className="flex items-center justify-between rounded-2xl bg-slate-950/50 border border-slate-700/40 p-4 hover:border-primary/40 transition-colors">
              <span className="text-slate-200 font-semibold">Abrir IA financeira do assessor</span>
              <Plus className="w-4 h-4 text-primary" />
            </Link>
            <Link to="/admin/insights" className="flex items-center justify-between rounded-2xl bg-slate-950/50 border border-slate-700/40 p-4 hover:border-primary/40 transition-colors">
              <span className="text-slate-200 font-semibold">Abrir ferramentas de análise</span>
              <Plus className="w-4 h-4 text-primary" />
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            O que já está pronto para demo
          </h2>
          <div className="space-y-3 mt-5">
            {[
              'Marca do escritório aplicada no portal',
              'Área do assessor com clientes e ações',
              'Portal do cliente final educacional e seguro',
              'Relatórios PDF white-label por ativo',
              'Biblioteca de conteúdos educativos para trilhas',
              'Fábrica editorial F-Insight com rascunhos e agendamento',
              'Central de atualizações programadas',
              'IA financeira por perfil com guardrails comerciais',
              'Ferramentas de análise por perfil',
              'Macroeconomia e sinais orientativos',
            ].map((item) => (
              <div key={item} className="rounded-xl bg-slate-950/40 border border-slate-700/40 p-3 text-sm text-slate-300">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
