import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, CreditCard, Palette, PlayCircle, ShieldCheck, Users } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';

const steps = [
  {
    title: '1. Configurar marca do escritório',
    description: 'Nome, logo, cor, disclaimer e identidade visual para o portal white-label.',
    href: '/white-label',
    icon: Palette,
  },
  {
    title: '2. Cadastrar assessores e clientes',
    description: 'Organizar usuários, perfis, convites e primeira base de clientes para a demo.',
    href: '/admin/clientes',
    icon: Users,
  },
  {
    title: '3. Ativar cobrança Pix',
    description: 'Gerar cobrança B2B para setup, mensalidade ou piloto pago do escritório.',
    href: '/admin/cobranca',
    icon: CreditCard,
  },
  {
    title: '4. Validar experiência demo',
    description: 'Testar as visões de Admin, Assessor e Cliente antes da reunião comercial.',
    href: '/demo',
    icon: PlayCircle,
  },
];

const productionChecks = [
  'Rodar o SQL supabase/billing_woovi_mvp.sql no Supabase',
  'Configurar WOOVI_API_KEY no Render',
  'Configurar APP_URL=https://f-insight.netlify.app no Render',
  'Fazer deploy do backend com cache limpo',
  'Fazer deploy do frontend com cache limpo',
  'Gerar uma cobrança teste em /admin/cobranca',
];

export default function OfficeOnboarding() {
  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Implantação do escritório
        </span>
        <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Do primeiro contato ao piloto pago.</h1>
        <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
          Use este checklist para implantar um novo escritório, preparar a demo e ativar a cobrança sem travar no operacional.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-5 mb-8">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Link key={step.title} to={step.href} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 hover:border-primary/40 transition-colors group">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h2 className="font-bold text-white mb-2 group-hover:text-primary transition-colors">{step.title}</h2>
              <p className="text-sm text-slate-400 leading-relaxed mb-5">{step.description}</p>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                Abrir
                <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          );
        })}
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6">
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
          <ShieldCheck className="w-7 h-7 text-emerald-400 mb-4" />
          <h2 className="text-2xl font-bold text-white mb-3">Posicionamento da venda</h2>
          <p className="text-slate-300 leading-relaxed mb-4">
            Venda como piloto white-label para relacionamento e inteligência de mercado. Não venda como corretora, carteira, extrato, custódia ou recomendador automático.
          </p>
          <p className="text-sm text-emerald-100/80 leading-relaxed">
            Frase curta: “Nós colocamos uma camada premium de conteúdo, relatórios e relacionamento digital entre o escritório e o cliente final.”
          </p>
        </div>

        <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
          <h2 className="text-2xl font-bold text-white mb-5">Checklist técnico para cobrança real</h2>
          <div className="space-y-3">
            {productionChecks.map((item) => (
              <div key={item} className="flex gap-3 rounded-2xl border border-slate-700/40 bg-slate-950/50 p-3">
                <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
