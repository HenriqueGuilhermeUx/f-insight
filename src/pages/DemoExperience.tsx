import { useNavigate } from 'react-router-dom';
import { Building2, Briefcase, Users, ArrowRight, PlayCircle, ShieldCheck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth, type AuthRole } from '@/context/AuthContext';

const demos: Array<{ role: AuthRole; title: string; subtitle: string; icon: typeof Building2; route: string; bullets: string[] }> = [
  {
    role: 'admin',
    title: 'Ver como escritório',
    subtitle: 'Operação, planos, clientes, cobrança e implantação white-label.',
    icon: Building2,
    route: '/admin',
    bullets: ['Admin Dashboard', 'Cobrança Pix', 'White-label', 'Conteúdos e relatórios'],
  },
  {
    role: 'advisor',
    title: 'Ver como assessor',
    subtitle: 'Workspace comercial, comunicação e cockpit de relacionamento.',
    icon: Briefcase,
    route: '/assessor',
    bullets: ['Clientes para acompanhar', 'Mensagens registradas', 'Próximas ações', 'Textos de abordagem'],
  },
  {
    role: 'client',
    title: 'Ver como cliente',
    subtitle: 'Portal educativo com relatórios, mensagens e dúvidas rápidas.',
    icon: Users,
    route: '/cliente',
    bullets: ['Relatórios liberados', 'Mensagens do assessor', 'Dúvida rápida', 'Pauta da próxima reunião'],
  },
];

export default function DemoExperience() {
  const { enterDemo } = useAuth();
  const navigate = useNavigate();

  function openDemo(role: AuthRole, route: string) {
    enterDemo(role);
    navigate(route);
  }

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
          <PlayCircle className="w-3.5 h-3.5" />
          Demo guiada
        </span>
        <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Escolha a visão que quer apresentar.</h1>
        <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
          Use esta tela em reunião comercial para alternar rapidamente entre a experiência do escritório, do assessor e do cliente final.
        </p>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {demos.map((demo) => {
          const Icon = demo.icon;
          return (
            <button key={demo.role} onClick={() => openDemo(demo.role, demo.route)} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6 text-left hover:border-primary/50 transition-colors group">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <Icon className="w-7 h-7 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-primary transition-colors">{demo.title}</h2>
              <p className="text-slate-400 leading-relaxed mb-5">{demo.subtitle}</p>
              <div className="space-y-2 mb-6">
                {demo.bullets.map((item) => (
                  <p key={item} className="text-sm text-slate-300">• {item}</p>
                ))}
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-bold text-primary">
                Entrar nessa visão
                <ArrowRight className="w-4 h-4" />
              </span>
            </button>
          );
        })}
      </section>

      <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6 flex gap-4">
        <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
        <div>
          <h2 className="font-bold text-white mb-2">Script sugerido para venda</h2>
          <p className="text-slate-300 leading-relaxed">
            “Primeiro eu mostro como o escritório opera a plataforma, depois como o assessor ganha produtividade e por último como o cliente final percebe valor sem ver saldo, custódia ou carteira real.”
          </p>
        </div>
      </section>
    </Layout>
  );
}
