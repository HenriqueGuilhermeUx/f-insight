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
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
          <CreditCard className="w-3.5 h-3.5" />
          Planos B2B para escritórios
        </span>
        <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Preços simples para lançar o F-Insight white-label.</h1>
        <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
          A cobrança é do escritório. O cliente final acessa o portal educativo sem pagar dentro da plataforma.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {plans.map((plan) => (
          <div key={plan.id} className={`rounded-3xl border p-6 ${plan.featured ? 'border-primary/60 bg-primary/10' : 'border-slate-700/40 bg-slate-800/40'}`}>
            {plan.featured && (
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-3 py-1 text-xs font-bold text-primary mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Mais indicado para piloto
              </span>
            )}
            <h2 className="text-2xl font-bold text-white mb-2">{plan.name}</h2>
            <p className="text-slate-400 min-h-[52px] mb-5">{plan.description}</p>
            <p className="text-5xl font-black text-white mb-1">{plan.price}</p>
            <p className="text-sm text-slate-500 mb-6">por mês / por escritório</p>
            <div className="space-y-3 mb-6">
              {plan.items.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  {item}
                </div>
              ))}
            </div>
            <Link to="/demo" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
              Ver demo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ))}
      </section>

      <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            Modelo de entrada recomendado
          </h2>
          <p className="text-slate-300 leading-relaxed max-w-4xl">
            Para os primeiros escritórios, eu venderia como piloto pago com setup entre R$ 1.500 e R$ 5.000 + mensalidade. Isso financia implantação, white-label e suporte direto.
          </p>
        </div>
        <Link to="/admin/cobranca" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-5 py-3 text-sm font-bold text-slate-950 hover:bg-emerald-400 transition-colors">
          Gerar cobrança Pix
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </Layout>
  );
}
