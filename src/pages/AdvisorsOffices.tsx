import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  ClipboardList,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const modules = [
  {
    title: 'Portal white-label',
    text: 'Uma experiência de inteligência financeira com a marca do escritório para gerar autoridade e presença digital.',
    icon: Building2,
  },
  {
    title: 'Workspace do assessor',
    text: 'Radar, relatórios, conteúdos e follow-ups para transformar cenário de mercado em conversa útil com clientes.',
    icon: Briefcase,
  },
  {
    title: 'Área do cliente assessorado',
    text: 'Ambiente educativo, mensagens do assessor, relatórios e app do cliente sem expor custódia, saldo ou patrimônio real.',
    icon: Users,
  },
  {
    title: 'Relacionamento recorrente',
    text: 'Comunicação registrada, atualizações programadas, alertas e relatórios para manter o cliente próximo do escritório.',
    icon: MessageCircle,
  },
];

const checklist = [
  'Portal público com dados, notícias, macro e radar para gerar audiência',
  'Página premium individual separada para investidores que não vieram de escritórios',
  'Login protegido para cliente, assessor, escritório e admin',
  'Relatórios educativos com disclaimer e sem recomendação automática',
  'White-label com marca do escritório e conteúdos próprios',
  'Painel de relacionamento para acompanhamento de clientes',
];

export default function AdvisorsOffices() {
  return (
    <Layout>
      <section className="mb-8 rounded-[2rem] border border-emerald-500/20 bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-950 p-6 lg:p-10">
        <div className="grid grid-cols-1 gap-8 xl:grid-cols-[1.05fr_0.95fr] xl:items-center">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-300">
              <Sparkles className="h-3.5 w-3.5" />
              Solução para assessores e escritórios
            </span>
            <h1 className="max-w-5xl text-4xl font-black leading-tight tracking-tight text-white lg:text-6xl">
              Um centro de inteligência para fortalecer o relacionamento com seus clientes.
            </h1>
            <p className="mt-5 max-w-4xl text-lg leading-relaxed text-slate-300">
              O F-Insight para escritórios combina portal white-label, app do cliente, workspace do assessor, relatórios e comunicação recorrente. A experiência pública atrai; a área logada organiza o relacionamento.
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <Link to="/demo" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-emerald-300">
                Ver demo comercial
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/precos" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950/60 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-emerald-400/60">
                Ver planos B2B
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-6 py-3 text-sm font-bold text-cyan-200 transition-colors hover:border-cyan-400/60">
                Área Logada
              </Link>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-700/50 bg-slate-950/60 p-5 lg:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-black text-white">
              <ShieldCheck className="h-6 w-6 text-emerald-300" />
              Sem quebrar a estrutura atual
            </h2>
            <div className="space-y-3">
              {checklist.map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-slate-700/50 bg-slate-900/70 p-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-300" />
                  <span className="text-sm leading-relaxed text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-4">
        {modules.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-400/10">
                <Icon className="h-6 w-6 text-emerald-300" />
              </div>
              <h3 className="mb-3 text-xl font-black text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{item.text}</p>
            </div>
          );
        })}
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6">
          <BarChart3 className="mb-4 h-7 w-7 text-cyan-300" />
          <h2 className="mb-3 text-3xl font-black text-white">O cliente vê valor sem ver complexidade.</h2>
          <p className="leading-relaxed text-slate-300">
            O app e o portal mostram mercado, macro, notícias, relatórios e educação. A parte de relacionamento com assessor aparece só depois do login, preservando a experiência pública limpa.
          </p>
        </div>
        <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
          <h2 className="mb-4 text-2xl font-black text-white">Fluxo ideal</h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {[
              'Usuário conhece o F-Insight pela página principal com dados e notícias',
              'Investidor independente pode assinar o Premium individual',
              'Cliente de escritório entra pela Área Logada e vê ambiente assessorado',
              'Assessor entra no workspace para relatórios, mensagens e follow-ups',
            ].map((step, index) => (
              <div key={step} className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4">
                <span className="mb-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-sm font-black text-slate-950">{index + 1}</span>
                <p className="text-sm leading-relaxed text-slate-300">{step}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
        <div>
          <h2 className="mb-2 flex items-center gap-2 text-3xl font-black text-white">
            <ClipboardList className="h-7 w-7 text-emerald-300" />
            Implantação guiada para escritórios
          </h2>
          <p className="max-w-4xl text-slate-300">Comece com piloto pago, marca própria, conteúdos iniciais e área de relacionamento pronta para clientes.</p>
        </div>
        <Link to="/cadastro-escritorio" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-6 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-emerald-300">
          Solicitar implantação
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </Layout>
  );
}
