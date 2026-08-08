import { FormEvent, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, BarChart3, Briefcase, Building2, CheckCircle2, Lock, LogIn, Shield, Sparkles, UserRound } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { AuthRole, useAuth } from '@/context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { enterDemo, signInWithPassword, signUpWithPassword, routeForRole } = useAuth();
  const startsAsSignup = location.pathname.includes('cadastro') || new URLSearchParams(location.search).get('mode') === 'signup';
  const [mode, setMode] = useState<'login' | 'signup'>(startsAsSignup ? 'signup' : 'login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
  });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const title = useMemo(() => {
    if (mode === 'signup') return 'Crie sua conta gratuita.';
    return 'Entre no F-Insight.';
  }, [mode]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const user = mode === 'login'
        ? await signInWithPassword(form.email, form.password)
        : await signUpWithPassword({
            email: form.email,
            password: form.password,
            fullName: form.fullName || form.email,
            role: 'client',
          });

      navigate(routeForRole(user.role));
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : 'Falha ao autenticar.';
      const friendly = rawMessage.toLowerCase().includes('failed to fetch')
        ? 'Não conseguimos conectar ao login online agora. Tente novamente ou use a demonstração.'
        : rawMessage;
      setMessage(friendly);
    } finally {
      setLoading(false);
    }
  };

  const startDemo = (role: AuthRole) => {
    const user = enterDemo(role);
    navigate(routeForRole(user.role));
  };

  const demoOptions = [
    { role: 'client' as AuthRole, title: 'Cliente assessorado', description: 'Ver experiência educacional de cliente vinculado a assessor.', icon: UserRound },
    { role: 'advisor' as AuthRole, title: 'Assessor', description: 'Ver workspace, clientes, relacionamento e relatórios.', icon: Briefcase },
    { role: 'admin' as AuthRole, title: 'Escritório/Admin', description: 'Gerenciar escritório, assessores, clientes e operação.', icon: Building2 },
  ];

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/12 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <Link to="/" className="mb-5 inline-flex items-center gap-2 text-sm font-bold text-cyan-300 hover:text-cyan-200">
          <ArrowLeft className="h-4 w-4" />
          Voltar ao mercado
        </Link>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-cyan-200">
              <Sparkles className="h-3.5 w-3.5" />
              Conta gratuita para investidores
            </span>
            <h1 className="mb-4 text-3xl font-black tracking-tight text-white lg:text-5xl">{title}</h1>
            <p className="max-w-4xl text-lg leading-relaxed text-slate-300">
              A conta gratuita é para qualquer investidor acompanhar mercado, radar, macro, notícias e ferramentas educativas. A área de assessores e escritórios fica separada, sem confundir sua experiência.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 lg:min-w-[300px]">
            <Shield className="mb-3 h-6 w-6 text-emerald-400" />
            <h3 className="mb-2 font-bold text-white">Informativo e educacional</h3>
            <p className="text-sm leading-relaxed text-slate-300">Sem saldos, sem custódia, sem ordens e sem promessa de rentabilidade.</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[430px_1fr]">
        <form onSubmit={submit} className="h-fit rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <div className="mb-5 flex rounded-xl border border-slate-700/40 bg-slate-950/60 p-1">
            <button type="button" onClick={() => setMode('login')} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${mode === 'login' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400'}`}>Login</button>
            <button type="button" onClick={() => setMode('signup')} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${mode === 'signup' ? 'bg-cyan-400 text-slate-950' : 'text-slate-400'}`}>Criar acesso</button>
          </div>

          <div className="space-y-4">
            {mode === 'signup' && (
              <label className="block">
                <span className="mb-2 block text-sm text-slate-400">Nome completo</span>
                <input required value={form.fullName} onChange={(e) => update('fullName', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-300/60" placeholder="Seu nome" />
              </label>
            )}
            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">E-mail</span>
              <input required type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-300/60" placeholder="seu@email.com" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">Senha</span>
              <input required type="password" minLength={6} value={form.password} onChange={(e) => update('password', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-cyan-300/60" placeholder="mínimo 6 caracteres" />
            </label>

            {message && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{message}</p>}

            <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-cyan-300 disabled:opacity-60">
              <LogIn className="h-4 w-4" />
              {loading ? 'Processando...' : mode === 'login' ? 'Entrar' : 'Criar conta grátis'}
            </button>

            <p className="text-xs leading-relaxed text-slate-500">
              Ao continuar, você acessa a experiência gratuita do F-Insight. Recursos avançados ficam no Premium. Clientes de assessores devem usar a Área Logada.
            </p>
          </div>
        </form>

        <section className="space-y-6">
          <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/10 p-5 lg:p-6">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-white">
              <BarChart3 className="h-6 w-6 text-cyan-300" />
              Depois de entrar você vê mais recursos
            </h2>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {['Watchlist e radar pessoal', 'Painel macro e notícias completas', 'Screener básico e Graham & Valor', 'Oferta Premium com IA, alertas e carteira simulada'].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl border border-cyan-500/20 bg-slate-950/30 p-4 text-sm text-slate-200">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-cyan-300" />
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-5 lg:p-6">
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-2xl font-bold text-white">
                  <Lock className="h-6 w-6 text-emerald-300" />
                  Área Logada institucional
                </h2>
                <p className="mt-2 text-sm text-slate-300">Use esta área somente se você já é cliente assessorado, assessor ou escritório.</p>
              </div>
              <Link to="/area-logada" className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-emerald-300">
                Abrir opções
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {demoOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <button key={option.role} onClick={() => startDemo(option.role)} className="rounded-2xl border border-slate-700/40 bg-slate-950/40 p-5 text-left transition-colors hover:border-emerald-400/40">
                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-400/10">
                      <Icon className="h-6 w-6 text-emerald-300" />
                    </div>
                    <h3 className="mb-2 font-bold text-white">Demo: {option.title}</h3>
                    <p className="text-sm leading-relaxed text-slate-400">{option.description}</p>
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
