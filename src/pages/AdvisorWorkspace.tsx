import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Download,
  FileText,
  Mail,
  MessageSquare,
  Sparkles,
  Users,
} from 'lucide-react';
import API_ENDPOINTS from '@/config/api';
import { useTenant } from '@/context/TenantContext';
import { Layout } from '@/components/layout/Layout';
import { getWorkspaceStats } from '@/services/workspace';

const actions = [
  'Consultar o Radar IA e separar os principais riscos e cenários antes da conversa.',
  'Gerar um relatório educativo do ativo ou tema que será discutido com o cliente.',
  'Registrar contexto, dúvidas e próximos passos no fluxo de relacionamento.',
  'Usar o Futuro IA para conectar mercado, objetivos e capacidade financeira do cliente.',
];

const professionalTools = [
  { title: 'Radar IA', text: 'Pergunte sobre ativos, macro, riscos e cenários em linguagem natural.', href: '/ia-financeira', icon: Sparkles },
  { title: 'Insights', text: 'Centralize ferramentas educativas, comparações e leituras para reuniões.', href: '/insights', icon: BarChart3 },
  { title: 'Relatórios', text: 'Acesse e prepare materiais de apoio para clientes e reuniões.', href: '/admin/relatorios', icon: FileText },
  { title: 'Fábrica de conteúdo', text: 'Transforme temas de mercado em conteúdo educativo para relacionamento.', href: '/admin/fabrica-conteudo', icon: MessageSquare },
  { title: 'Relacionamento', text: 'Organize acompanhamentos, próximas ações e contatos com clientes.', href: '/assessor/acompanhamentos', icon: Users },
  { title: 'Futuro IA', text: 'Veja a experiência de planejamento financeiro que o cliente pode usar.', href: '/meu-futuro', icon: CheckCircle2 },
];

export default function AdvisorWorkspace() {
  const { tenant, buildReportParams } = useTenant();
  const stats = getWorkspaceStats();
  const isDemoWorkspace = stats.tenant?.id === 'tenant_demo';
  const clients = stats.clients.slice(0, 6);

  const pipeline = [
    { label: 'Clientes cadastrados', value: stats.clients.length, icon: Users },
    { label: 'Assessores no workspace', value: stats.advisors.length, icon: Briefcase },
    { label: 'Relatórios registrados', value: stats.reports.length, icon: FileText },
    { label: 'Conteúdos no workspace', value: stats.contents.length, icon: MessageSquare },
  ];

  const openReport = (ticker = 'PETR4') => {
    const params = buildReportParams();
    const url = `${API_ENDPOINTS.reports.valuation(ticker)}?${params.toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Briefcase className="h-3.5 w-3.5" />
              Workspace do assessor
            </div>
            <h1 className="mb-4 text-3xl font-black tracking-tight text-white lg:text-5xl">
              Inteligência para atender melhor e escalar relacionamento.
            </h1>
            <p className="max-w-4xl text-lg leading-relaxed text-slate-300">
              Mercado, IA, relatórios, conteúdo e relacionamento reunidos em um fluxo profissional com a marca de {tenant.brandName}.
            </p>
            {isDemoWorkspace && (
              <p className="mt-4 inline-flex rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-200">
                Modo demonstração: os números abaixo representam apenas o workspace de exemplo.
              </p>
            )}
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/contato"
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-5 py-3 text-sm font-bold text-primary transition-colors hover:bg-primary/15"
            >
              <MessageSquare className="h-4 w-4" />
              Mensagem registrada
            </Link>
            <button
              onClick={() => openReport('PETR4')}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90"
            >
              <Download className="h-4 w-4" />
              Gerar relatório
            </button>
          </div>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {pipeline.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-slate-500">
                  {isDemoWorkspace ? 'demo' : 'workspace'}
                </span>
              </div>
              <p className="text-3xl font-black text-white">{item.value}</p>
              <p className="mt-1 text-sm text-slate-400">{item.label}</p>
            </div>
          );
        })}
      </section>

      <section className="mb-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-slate-900/70 to-slate-950 p-5 lg:p-6">
        <div className="mb-5">
          <span className="mb-2 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-cyan-300">
            <Sparkles className="h-4 w-4" />
            F-Insight Professional
          </span>
          <h2 className="text-2xl font-black text-white lg:text-3xl">Central de inteligência do assessor.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
            Reduza trabalho manual e dê mais contexto às conversas com clientes sem transformar análise em promessa ou recomendação automática.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {professionalTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.title}
                to={tool.href}
                className="group rounded-2xl border border-slate-700/50 bg-slate-950/55 p-4 transition hover:border-cyan-400/40 hover:bg-slate-950/80"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10">
                    <Icon className="h-5 w-5 text-cyan-300" />
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-slate-500 transition group-hover:text-cyan-300" />
                </div>
                <h3 className="mt-4 font-black text-white">{tool.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{tool.text}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                <Users className="h-6 w-6 text-primary" />
                Clientes do workspace
              </h2>
              <p className="mt-1 text-slate-400">Dados cadastrados no ambiente atual, sem números comerciais inventados.</p>
            </div>
            <Link
              to="/assessor/acompanhamentos"
              className="hidden items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-2 text-sm font-bold text-slate-200 transition-colors hover:border-primary/40 sm:inline-flex"
            >
              <ArrowUpRight className="h-4 w-4" />
              Acompanhamentos
            </Link>
          </div>

          {clients.length > 0 ? (
            <div className="space-y-3">
              {clients.map((client) => (
                <div key={client.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-700/40 bg-slate-950/40 p-4 lg:flex-row lg:items-center">
                  <div>
                    <h3 className="font-bold text-white">{client.name}</h3>
                    <p className="text-sm text-slate-400">
                      Perfil {client.profile} · educação {client.educationLevel}
                    </p>
                    <p className="mt-1 text-xs text-primary">
                      Status: {client.status === 'ativo' ? 'ativo' : 'convite enviado'}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Link to="/contato" className="inline-flex items-center gap-2 rounded-lg border border-slate-700/50 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 transition-colors hover:border-primary/40">
                      <Mail className="h-3.5 w-3.5" />
                      Mensagem
                    </Link>
                    <Link to="/admin/relatorios" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-primary/90">
                      <FileText className="h-3.5 w-3.5" />
                      Relatórios
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-6 text-center">
              <Users className="mx-auto h-8 w-8 text-slate-500" />
              <p className="mt-3 font-bold text-white">Nenhum cliente cadastrado neste workspace.</p>
              <p className="mt-1 text-sm text-slate-400">Cadastre clientes pelo ambiente administrativo para começar o acompanhamento.</p>
            </div>
          )}
        </section>

        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-white">
            <CheckCircle2 className="h-6 w-6 text-emerald-400" />
            Fluxo profissional sugerido
          </h2>
          <p className="mb-5 text-slate-400">Checklist operacional, não uma recomendação de investimento.</p>

          <div className="space-y-3">
            {actions.map((action, index) => (
              <div key={action} className="flex items-start gap-3 rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-black text-primary">
                  {index + 1}
                </div>
                <p className="text-sm leading-relaxed text-slate-300">{action}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
          <BarChart3 className="mb-3 h-6 w-6 text-primary" />
          <h3 className="mb-2 font-bold text-white">Inteligência de mercado</h3>
          <p className="text-sm leading-relaxed text-slate-400">Dados, macro e IA organizados para apoiar preparação de reuniões e materiais educativos.</p>
        </div>
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
          <MessageSquare className="mb-3 h-6 w-6 text-emerald-400" />
          <h3 className="mb-2 font-bold text-white">Relacionamento</h3>
          <p className="text-sm leading-relaxed text-slate-400">Centraliza contexto, acompanhamentos e comunicação para reduzir perda de informação.</p>
        </div>
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
          <FileText className="mb-3 h-6 w-6 text-amber-400" />
          <h3 className="mb-2 font-bold text-white">Materiais para clientes</h3>
          <p className="text-sm leading-relaxed text-slate-400">Relatórios e conteúdos com linguagem educativa e identificação clara de premissas e riscos.</p>
        </div>
      </section>
    </Layout>
  );
}
