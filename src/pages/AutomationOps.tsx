import { Link } from 'react-router-dom';
import { Activity, ArrowRight, Bell, Bot, CheckCircle2, CreditCard, HeartPulse, Mail, MessageCircle, ShieldCheck, Zap } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import API_ENDPOINTS from '@/config/api';

const flows = [
  {
    title: 'Pagamento aprovado → implantação',
    description: 'Woovi confirma pagamento, n8n ativa o onboarding, registra evento e envia boas-vindas ao escritório.',
    icon: CreditCard,
    status: 'Prioridade 1',
  },
  {
    title: 'Cliente perguntou → alerta assessor',
    description: 'Dúvida enviada pelo app vira próxima ação e pode gerar alerta se ficar sem resposta.',
    icon: MessageCircle,
    status: 'Prioridade 2',
  },
  {
    title: 'Novo relatório → aviso ao cliente',
    description: 'Relatório ou conteúdo publicado dispara e-mail/WhatsApp com link para o app do cliente.',
    icon: Mail,
    status: 'Prioridade 3',
  },
  {
    title: 'Resumo semanal do escritório',
    description: 'Toda semana o admin recebe mensagens, dúvidas, relatórios, ações abertas e uso do relacionamento digital.',
    icon: Bot,
    status: 'Premium',
  },
  {
    title: 'Health check operacional',
    description: 'n8n monitora API, dados ao vivo, Supabase e automações. Se cair, você recebe alerta.',
    icon: HeartPulse,
    status: 'Operação',
  },
];

const endpoints = [
  ['Health da automação', `${API_ENDPOINTS.baseUrl}/api/automation/health`],
  ['Log de execução', `${API_ENDPOINTS.baseUrl}/api/automation/log`],
  ['Ativar escritório', `${API_ENDPOINTS.baseUrl}/api/automation/office-activated`],
  ['Alerta de cliente', `${API_ENDPOINTS.baseUrl}/api/automation/client-alert`],
  ['Webhook Woovi', `${API_ENDPOINTS.baseUrl}/api/billing/webhooks/woovi`],
];

const setup = [
  'Rodar o SQL supabase/n8n_automation_foundation.sql',
  'Fazer deploy do backend no Render',
  'Testar GET /api/automation/health',
  'Criar no n8n o fluxo de Health Check',
  'Criar o fluxo Woovi pago → implantação',
  'Criar o fluxo Cliente perguntou → assessor',
];

export default function AutomationOps() {
  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <Zap className="w-3.5 h-3.5" />
              Automação n8n
            </span>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Cérebro operacional do F-Insight.</h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              Use o n8n na Oracle Cloud para transformar cobrança, conteúdo, mensagens, alertas e monitoramento em rotinas automáticas do produto.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 min-w-[280px]">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Sem trocar o core</h3>
            <p className="text-sm text-slate-300 leading-relaxed">Netlify, Render e Supabase continuam como produto. O n8n cuida dos eventos e rotinas.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
        {flows.map((flow) => {
          const Icon = flow.icon;
          return (
            <div key={flow.title} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5">
              <div className="flex items-center justify-between gap-3 mb-4">
                <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{flow.status}</span>
              </div>
              <h2 className="font-bold text-white mb-2">{flow.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed">{flow.description}</p>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-5">
            <Activity className="w-6 h-6 text-primary" />
            Endpoints para conectar no n8n
          </h2>
          <div className="space-y-3">
            {endpoints.map(([label, url]) => (
              <div key={label} className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4">
                <p className="text-sm font-bold text-white mb-1">{label}</p>
                <p className="text-xs text-slate-400 break-all font-mono">{url}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-5">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
            Ordem de implantação
          </h2>
          <div className="space-y-3">
            {setup.map((item, index) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4">
                <div className="w-7 h-7 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">{index + 1}</div>
                <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-primary/20 bg-primary/10 p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Primeiro fluxo recomendado
          </h2>
          <p className="text-slate-300 mt-1">Comece pelo Health Check. Depois conecte Woovi pago → implantação do escritório.</p>
        </div>
        <Link to="/admin/onboarding" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
          Abrir implantação
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </Layout>
  );
}
