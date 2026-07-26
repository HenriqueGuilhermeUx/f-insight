import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Briefcase,
  Building2,
  CheckCircle2,
  Globe2,
  MessageCircle,
  Shield,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const benefits = [
  {
    title: 'Autoridade para o escritório',
    icon: Building2,
    text: 'Uma experiência digital com inteligência de mercado, relatórios e curadoria com a marca do escritório.',
  },
  {
    title: 'Produtividade para o assessor',
    icon: Briefcase,
    text: 'Mais contexto para conversas, menos improviso e materiais prontos para explicar cenário e riscos.',
  },
  {
    title: 'Clareza para o cliente',
    icon: Users,
    text: 'Um ambiente educativo para acompanhar conteúdos e relatórios sem expor carteira, saldo ou custódia.',
  },
];

const platformBlocks = [
  'Portal público para gerar audiência e leads',
  'Ambiente white-label para escritórios',
  'Radar de mercado e leitura macro',
  'Relatórios educativos com linguagem clara',
  'Conteúdo para relacionamento recorrente',
  'Experiência segura, sem dados de custódia',
];

const useCases = [
  'Escritórios que querem parecer mais digitais e premium',
  'Assessores que precisam explicar mercado com mais consistência',
  'Clientes que querem entender cenário sem receber ruído ou promessa',
  'Operações que desejam transformar conteúdo em relacionamento',
];

export default function Home() {
  return (
    <Layout>
      <section className="relative mb-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/20 via-slate-900 to-slate-950 p-6 lg:p-10">
        <div className="absolute right-0 top-0 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative grid grid-cols-1 gap-8 xl:grid-cols-[1.08fr_0.92fr] xl:items-center">
          <div>
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Inteligência de mercado para escritórios de investimento
            </span>
            <h1 className="mb-5 max-w-5xl text-4xl font-black leading-tight tracking-tight text-white lg:text-6xl">
              Transforme informação de mercado em relacionamento com clientes.
            </h1>
            <p className="mb-7 max-w-4xl text-lg leading-relaxed text-slate-300">
              O F-Insight combina portal público, radar de mercado, relatórios educativos e uma plataforma white-label para escritórios entregarem mais contexto, presença digital e percepção de valor aos clientes.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link to="/portal" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90">
                Abrir portal público
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/precos" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/50 bg-slate-950/60 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-primary/50">
                Para assessores e escritórios
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700/40 bg-slate-950/60 p-5 lg:p-6">
            <h2 className="mb-4 text-2xl font-bold text-white">O que o F-Insight entrega</h2>
            <div className="space-y-3">
              {platformBlocks.map((item) => (
                <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-700/40 bg-slate-900/70 p-3">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-400" />
                  <span className="text-sm font-semibold text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {benefits.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.title} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 text-2xl font-bold text-white">{item.title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{item.text}</p>
            </div>
          );
        })}
      </section>

      <section className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
          <Shield className="mb-4 h-7 w-7 text-emerald-400" />
          <h2 className="mb-3 text-3xl font-black text-white">Seguro para começar.</h2>
          <p className="leading-relaxed text-slate-300">
            A proposta inicial é informativa e educacional. Não depende de integração com corretora, patrimônio, extrato, custódia ou recomendação automática para gerar valor.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {useCases.map((item) => (
            <div key={item} className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
              <Target className="mb-3 h-5 w-5 text-primary" />
              <p className="text-sm leading-relaxed text-slate-300">{item}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Link to="/portal" className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5 transition-colors hover:border-primary/40">
          <Globe2 className="mb-3 h-6 w-6 text-primary" />
          <h3 className="mb-2 font-bold text-white">Portal público</h3>
          <p className="text-sm text-slate-400">Audiência, autoridade e leads com conteúdo aberto.</p>
        </Link>
        <Link to="/radar" className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5 transition-colors hover:border-primary/40">
          <BarChart3 className="mb-3 h-6 w-6 text-primary" />
          <h3 className="mb-2 font-bold text-white">Radar de mercado</h3>
          <p className="text-sm text-slate-400">Ativos, sinais e leitura de cenário para análise educativa.</p>
        </Link>
        <Link to="/precos" className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5 transition-colors hover:border-primary/40">
          <BookOpen className="mb-3 h-6 w-6 text-primary" />
          <h3 className="mb-2 font-bold text-white">White-label</h3>
          <p className="text-sm text-slate-400">Experiência com marca do escritório para clientes e assessores.</p>
        </Link>
        <Link to="/demo" className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5 transition-colors hover:border-primary/40">
          <MessageCircle className="mb-3 h-6 w-6 text-primary" />
          <h3 className="mb-2 font-bold text-white">Demo comercial</h3>
          <p className="text-sm text-slate-400">Veja as visões de escritório, assessor e cliente.</p>
        </Link>
      </section>

      <section className="flex flex-col gap-5 rounded-3xl border border-primary/20 bg-primary/10 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-8">
        <div>
          <h2 className="mb-2 text-3xl font-black text-white">Comece pelo portal. Venda a versão white-label.</h2>
          <p className="text-slate-300">O portal público gera confiança. A plataforma para escritórios monetiza a operação.</p>
        </div>
        <Link to="/portal" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90">
          Abrir portal
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </Layout>
  );
}
