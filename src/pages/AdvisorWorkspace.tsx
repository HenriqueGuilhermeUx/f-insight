import {
  ArrowUpRight,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock,
  Download,
  FileText,
  Mail,
  MessageSquare,
  Plus,
  Send,
  Sparkles,
  Users,
} from 'lucide-react';
import API_ENDPOINTS from '@/config/api';
import { useTenant } from '@/context/TenantContext';
import { Layout } from '@/components/layout/Layout';

const clients = [
  { name: 'Cliente Alta Renda 01', profile: 'Moderado', lastAccess: 'Hoje', status: 'Relatório PETR4 aberto' },
  { name: 'Cliente Alta Renda 02', profile: 'Conservador', lastAccess: 'Ontem', status: 'Aguardando revisão mensal' },
  { name: 'Cliente Alta Renda 03', profile: 'Arrojado', lastAccess: '2 dias', status: 'Novo sinal macro disponível' },
];

const actions = [
  'Gerar PDF PETR4 para reunião de hoje',
  'Enviar resumo macro semanal para clientes moderados',
  'Revisar exposição a dólar na carteira modelo',
  'Atualizar comentário do assessor no portal do cliente',
];

const pipeline = [
  { label: 'Clientes com relatório novo', value: 12, icon: FileText },
  { label: 'Reuniões na semana', value: 8, icon: Clock },
  { label: 'Sinais ativos para comentar', value: 3, icon: Sparkles },
  { label: 'PDFs gerados no mês', value: 46, icon: Download },
];

export default function AdvisorWorkspace() {
  const { tenant, buildReportParams } = useTenant();

  const openReport = (ticker = 'PETR4') => {
    const params = buildReportParams();
    const url = `${API_ENDPOINTS.reports.valuation(ticker)}?${params.toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <Briefcase className="w-3.5 h-3.5" />
              Workspace do assessor
            </div>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">
              Central para atender melhor, vender mais valor e escalar relacionamento.
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              Aqui o escritório transforma dados em conversa: relatórios prontos, sinais para comentar, clientes para acionar e materiais com a marca de {tenant.brandName}.
            </p>
          </div>
          <button
            onClick={() => openReport('PETR4')}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
          >
            <Download className="w-4 h-4" />
            Gerar PDF agora
          </button>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {pipeline.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.label} className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-3xl font-black text-white">{item.value}</p>
              <p className="text-sm text-slate-400 mt-1">{item.label}</p>
            </div>
          );
        })}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <div className="flex items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Clientes para acompanhar
              </h2>
              <p className="text-slate-400 mt-1">O foco é gerar ação comercial e cuidado percebido.</p>
            </div>
            <button className="hidden sm:inline-flex items-center gap-2 rounded-xl border border-slate-700/50 bg-slate-950/50 px-4 py-2 text-sm font-bold text-slate-200 hover:border-primary/40 transition-colors">
              <Plus className="w-4 h-4" />
              Novo cliente
            </button>
          </div>

          <div className="space-y-3">
            {clients.map((client) => (
              <div key={client.name} className="rounded-2xl border border-slate-700/40 bg-slate-950/40 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white">{client.name}</h3>
                  <p className="text-sm text-slate-400">Perfil {client.profile} · último acesso: {client.lastAccess}</p>
                  <p className="text-xs text-primary mt-1">{client.status}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 border border-slate-700/50 hover:border-primary/40 transition-colors">
                    <Mail className="w-3.5 h-3.5" />
                    E-mail
                  </button>
                  <button className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-xs font-bold text-white hover:bg-primary/90 transition-colors">
                    <Send className="w-3.5 h-3.5" />
                    Enviar relatório
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            Próximas melhores ações
          </h2>
          <p className="text-slate-400 mb-5">Checklist prático para transformar inteligência em relacionamento.</p>

          <div className="space-y-3">
            {actions.map((action, index) => (
              <div key={action} className="rounded-2xl bg-slate-950/50 border border-slate-700/40 p-4 flex items-start gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{action}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
          <BarChart3 className="w-6 h-6 text-primary mb-3" />
          <h3 className="font-bold text-white mb-2">Relevante para o escritório</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Gera escala, padroniza discurso e aumenta percepção de profissionalismo.</p>
        </div>
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
          <MessageSquare className="w-6 h-6 text-emerald-400 mb-3" />
          <h3 className="font-bold text-white mb-2">Relevante para o assessor</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Entrega pauta pronta para reuniões, follow-up e educação financeira do cliente.</p>
        </div>
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
          <FileText className="w-6 h-6 text-amber-400 mb-3" />
          <h3 className="font-bold text-white mb-2">Relevante para o cliente final</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Mostra o que mudou, por que importa e qual decisão precisa ser discutida.</p>
        </div>
      </section>
    </Layout>
  );
}
