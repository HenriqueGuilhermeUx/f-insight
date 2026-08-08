import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CreditCard, ShieldCheck, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const plans = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'R$ 497',
    description: 'Para validar o portal white-label com clientes finais.',
    items: ['Portal do cliente', 'Relatórios white-label', 'Comunicação registrada', 'Área básica do assessor'],
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 997',
    description: 'Para escritórios que querem conteúdo recorrente e relacionamento ativo.',
    featured: true,
    items: ['Tudo do Basic', 'Conteúdo semanal', 'Calendário editorial', 'Cockpit de relacionamento', 'Atualizações programadas'],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 'R$ 1.997',
    description: 'Para escritórios que querem uma experiência mais premium e automatizada.',
    items: ['Tudo do Pro', 'Radar premium', 'Ferramentas Graham', 'PDFs avançados', 'Automações e suporte prioritário'],
  },
];

export default function Pricing() {
  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          <CreditCard className="h-3.5 w-3.5" />
          Planos B2B para escritórios
        </span>
        <h1 className="mb-4 text-3xl font-black tracking-tight text-white lg:text-5xl">Preços simples para lançar o F-Insight white-label.</h1>
        <p className="max-w-4xl text-lg leading-relaxed text-slate-300">
          Esta página é para assessores e escritórios. O Premium individual de R$ 19,90 fica separado em uma área própria para investidores independentes.
        </p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link to="/assessores-escritorios" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/60 bg-slate-950/60 px-5 py-3 text-sm font-bold text-white transition-colors hover:border-primary/50">
            Conhecer solução para escritórios
          </Link>
          <Link to="/premium" className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-sm font-bold text-amber-200 transition-colors hover:border-amber-400/60">
            Premium individual
          </Link>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {plans.map((plan) => (
          <div key={plan.id} className={`rounded-3xl border p-6 ${plan.featured ? 'border-primary/60 bg-primary/10' : 'border-slate-700/40 bg-slate-800/40'}`}>
            {plan.featured && (
              <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                Mais indicado para piloto
              </span>
            )}
            <h2 className="mb-2 text-2xl font-bold text-white">{plan.name}</h2>
            <p className="mb-5 min-h-[52px] text-slate-400">{plan.description}</p>
            <p className="mb-1 text-5xl font-black text-white">{plan.price}</p>
            <p className="mb-6 text-sm text-slate-500">por mês / por escritório</p>
            <div className="mb-6 space-y-3">
              {plan.items.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                  {item}
                </div>
              ))}
            </div>
            <Link to="/demo" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90">
              Ver demo
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        ))}
      </section>

      <section className="flex flex-col justify-between gap-5 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 lg:flex-row lg:items-center lg:p-8">
        <div>
          <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-white">
            <ShieldCheck className="h-6 w-6 text-emerald-400" />
            Modelo de entrada recomendado
          </h2>
          <p className="max-w-4xl leading-relaxed text-slate-300">
            Para os primeiros escritórios, eu venderia como piloto pago com setup entre R$ 1.500 e R$ 5.000 + mensalidade. Isso financia implantação, white-label e suporte direto.
          </p>
        </div>
        <Link to="/cadastro-escritorio" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-emerald-300">
          Solicitar implantação
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </Layout>
  );
}
