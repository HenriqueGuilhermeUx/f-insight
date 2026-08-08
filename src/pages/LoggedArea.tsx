import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Briefcase, Building2, LockKeyhole, ShieldCheck, UserRound } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { AuthRole, useAuth } from '@/context/AuthContext';

const accessCards = [
  {
    role: 'client' as AuthRole,
    title: 'Cliente assessorado',
    text: 'Acesse mensagens, relatórios e conteúdos enviados pelo seu assessor ou escritório.',
    href: '/cliente',
    icon: UserRound,
  },
  {
    role: 'advisor' as AuthRole,
    title: 'Assessor',
    text: 'Abra o workspace de relacionamento, clientes, follow-ups e relatórios.',
    href: '/assessor',
    icon: Briefcase,
  },
  {
    role: 'admin' as AuthRole,
    title: 'Escritório/Admin',
    text: 'Gerencie assessores, clientes, relatórios, cobrança, automações e white-label.',
    href: '/admin',
    icon: Building2,
  },
];

export default function LoggedArea() {
  const navigate = useNavigate();
  const { user, enterDemo, routeForRole } = useAuth();

  function startDemo(role: AuthRole) {
    const nextUser = enterDemo(role);
    navigate(routeForRole(nextUser.role));
  }

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/12 via-slate-900 to-slate-950 p-6 lg:p-8">
        <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-emerald-300 hover:text-emerald-200">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao F-Insight público
        </Link>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-emerald-200">
              <LockKeyhole className="h-3.5 w-3.5" />
              Área Logada
            </span>
            <h1 className="mb-4 text-3xl font-black tracking-tight text-white lg:text-5xl">Escolha seu tipo de acesso.</h1>
            <p className="max-w-4xl text-lg leading-relaxed text-slate-300">
              Esta área é para quem já usa o F-Insight por meio de um assessor, escritório ou operação interna. Se você é investidor independente, crie uma conta gratuita no app público.
            </p>
          </div>
          <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 p-5 lg:min-w-[300px]">
            <ShieldCheck className="mb-3 h-6 w-6 text-cyan-300" />
            <h3 className="mb-2 font-bold text-white">Separado do app público</h3>
            <p className="text-sm leading-relaxed text-slate-300">Cliente avulso usa conta gratuita/Premium. Cliente assessorado, assessor e escritório entram por aqui.</p>
          </div>
        </div>
      </section>

      <section className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-3">
        {accessCards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6">
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-400/10">
                <Icon className="h-7 w-7 text-emerald-300" />
              </div>
              <h2 className="mb-3 text-2xl font-black text-white">{card.title}</h2>
              <p className="mb-6 min-h-[72px] text-sm leading-relaxed text-slate-400">{card.text}</p>
              <div className="flex flex-col gap-3">
                <Link to="/login" className="rounded-xl bg-emerald-400 px-5 py-3 text-center text-sm font-black text-slate-950 hover:bg-emerald-300">
                  Entrar com e-mail e senha
                </Link>
                <button onClick={() => startDemo(card.role)} className="rounded-xl border border-slate-700/60 bg-slate-950/40 px-5 py-3 text-sm font-bold text-slate-200 hover:border-emerald-400/50">
                  Abrir demo de {card.title}
                </button>
              </div>
            </div>
          );
        })}
      </section>

      <section className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="mb-2 text-2xl font-black text-white">É investidor independente?</h2>
            <p className="text-slate-300">Use o F-Insight público, acompanhe mercado e evolua para o Premium quando quiser.</p>
          </div>
          <Link to="/cadastro-gratis" className="rounded-xl bg-cyan-400 px-6 py-3 text-center text-sm font-black text-slate-950 hover:bg-cyan-300">
            Criar conta gratuita
          </Link>
        </div>
      </section>
    </Layout>
  );
}
