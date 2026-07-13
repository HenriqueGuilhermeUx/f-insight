import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  CreditCard,
  MessageCircle,
  Shield,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const personas = [
  {
    title: 'Escritório',
    icon: Building2,
    href: '/admin',
    text: 'Portal com sua marca, clientes organizados, relatórios, conteúdo, cobrança e operação comercial em um só lugar.',
  },
  {
    title: 'Assessor',
    icon: Briefcase,
    href: '/assessor',
    text: 'Workspace para transformar mercado, relatórios e dúvidas em conversas registradas e próximas ações.',
  },
  {
    title: 'Cliente',
    icon: Users,
    href: '/app',
    text: 'App mobile simples com mensagens do assessor, relatórios liberados, dúvidas rápidas e pauta para reunião.',
  },
];

const modules = [
  'Portal white-label do escritório',
  'App mobile do cliente final',
  'Radar e dados de mercado ao vivo',
  'Relatórios e conteúdos educativos',
  'Comunicação assessor-cliente',
  'Cockpit de relacionamento e próximas ações',
  'Cobrança Pix do escritório',
];

const proofPoints = [
  { label: 'Sem custódia', text: 'Não precisamos integrar saldo, extrato ou posição real para lançar.' },
  { label: 'Mais relacionamento', text: 'O assessor ganha contexto, histórico e próxima ação após cada interação.' },
  { label: 'Mais percepção de valor', text: 'O cliente vê inteligência, conteúdo e curadoria com a marca do escritório.' },
];

export default function Home() {
  return (
    <Layout>
      <section className="relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/20 via-slate-900 to-slate-950 p-6 lg:p-10 mb-8">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-8 items-center">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              Plataforma white-label para escritórios de investimento
            </span>
            <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-white mb-5 leading-tight">
              Inteligência, conteúdo e relacionamento digital com a marca do seu escritório.
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed max-w-4xl mb-7">
              O F-Insight ajuda escritórios a entregar relatórios, radar de mercado, mensagens, conteúdos educativos e um app simples para clientes finais — sem expor saldo, custódia ou carteira real.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link to="/demo" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
                Ver demo guiada
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link to="/app" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/50 bg-slate-950/60 px-6 py-3 text-sm font-bold text-white hover:border-primary/50 transition-colors">
                Abrir app do cliente
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700/40 bg-slate-950/60 p-5 lg:p-6">
            <h2 className="text-2xl font-bold text-white mb-4">O que o escritório ganha</h2>
            <div className="space-y-3">
              {modules.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-700/40 bg-slate-900/70 p-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                  <span className="text-sm font-semibold text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {personas.map((item) => {
          const Icon = item.icon;
          return (
            <Link key={item.title} to={item.href} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6 hover:border-primary/40 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3 group-hover:text-primary transition-colors">Visão {item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed mb-5">{item.text}</p>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                Abrir experiência
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6 mb-8">
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
          <Shield className="w-7 h-7 text-emerald-400 mb-4" />
          <h2 className="text-3xl font-black text-white mb-3">Mais seguro para vender e implantar.</h2>
          <p className="text-slate-300 leading-relaxed">
            A primeira versão é educacional e orientativa. O escritório entrega valor sem depender de integração com corretora, patrimônio, custódia, extrato ou recomendação automática.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {proofPoints.map((item) => (
            <div key={item.label} className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
              <h3 className="font-bold text-white mb-2">{item.label}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        <Link to="/app" className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5 hover:border-primary/40 transition-colors">
          <BookOpen className="w-6 h-6 text-primary mb-3" />
          <h3 className="font-bold text-white mb-2">App do cliente</h3>
          <p className="text-sm text-slate-400">Mensagens, relatórios, dúvidas rápidas e pauta de reunião.</p>
        </Link>
        <Link to="/contato" className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5 hover:border-primary/40 transition-colors">
          <MessageCircle className="w-6 h-6 text-primary mb-3" />
          <h3 className="font-bold text-white mb-2">Comunicação</h3>
          <p className="text-sm text-slate-400">Mensagens registradas com contexto educativo.</p>
        </Link>
        <Link to="/admin/acompanhamentos" className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5 hover:border-primary/40 transition-colors">
          <Target className="w-6 h-6 text-primary mb-3" />
          <h3 className="font-bold text-white mb-2">Relacionamento</h3>
          <p className="text-sm text-slate-400">Próximas ações e textos prontos para o assessor.</p>
        </Link>
        <Link to="/admin/cobranca" className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5 hover:border-primary/40 transition-colors">
          <CreditCard className="w-6 h-6 text-primary mb-3" />
          <h3 className="font-bold text-white mb-2">Cobrança Pix</h3>
          <p className="text-sm text-slate-400">Planos B2B para ativação do escritório.</p>
        </Link>
      </section>

      <section className="rounded-3xl border border-primary/20 bg-primary/10 p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <h2 className="text-3xl font-black text-white mb-2">Pronto para piloto pago.</h2>
          <p className="text-slate-300">Comece com poucos escritórios parceiros, white-label, suporte direto e cobrança mensal.</p>
        </div>
        <Link to="/onboarding" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
          Ver implantação
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </Layout>
  );
}
