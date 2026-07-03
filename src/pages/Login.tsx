import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Briefcase, Building2, Lock, LogIn, Shield, Sparkles, UserRound } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { AuthRole, useAuth } from '@/context/AuthContext';
import { isSupabaseConfigured } from '@/lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const { enterDemo, signInWithPassword, signUpWithPassword, routeForRole } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'admin' as AuthRole,
  });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

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
            role: form.role,
          });

      navigate(routeForRole(user.role));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const startDemo = (role: AuthRole) => {
    const user = enterDemo(role);
    navigate(routeForRole(user.role));
  };

  const demoOptions = [
    { role: 'admin' as AuthRole, title: 'Entrar como Admin', description: 'Gerenciar escritório, assessores, clientes e publicações.', icon: Building2 },
    { role: 'advisor' as AuthRole, title: 'Entrar como Assessor', description: 'Ver carteira de clientes, ações sugeridas e relatórios.', icon: Briefcase },
    { role: 'client' as AuthRole, title: 'Entrar como Cliente', description: 'Abrir portal educacional e conteúdos liberados.', icon: UserRound },
  ];

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <Lock className="w-3.5 h-3.5" />
              Acesso F-Insight White Label
            </span>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Entre no ambiente do escritório.</h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              Use login real com Supabase ou modo demo para apresentar rapidamente a plataforma a escritórios, assessores e clientes.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 min-w-[280px]">
            <Shield className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Acesso seguro</h3>
            <p className="text-sm text-slate-300 leading-relaxed">O portal segue sem exibir saldos, custódia ou posição real do cliente.</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-6">
        <form onSubmit={submit} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6 h-fit">
          <div className="flex rounded-xl bg-slate-950/60 border border-slate-700/40 p-1 mb-5">
            <button type="button" onClick={() => setMode('login')} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${mode === 'login' ? 'bg-primary text-white' : 'text-slate-400'}`}>Login</button>
            <button type="button" onClick={() => setMode('signup')} className={`flex-1 rounded-lg px-3 py-2 text-sm font-bold transition-colors ${mode === 'signup' ? 'bg-primary text-white' : 'text-slate-400'}`}>Criar acesso</button>
          </div>

          {!isSupabaseConfigured && (
            <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-sm text-amber-100/80">
              Supabase ainda não está ativo no frontend. Confira a variável VITE_SUPABASE_ANON_KEY no Netlify.
            </div>
          )}

          <div className="space-y-4">
            {mode === 'signup' && (
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Nome completo</span>
                <input value={form.fullName} onChange={(e) => update('fullName', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
              </label>
            )}
            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">E-mail</span>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Senha</span>
              <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>
            {mode === 'signup' && (
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Perfil</span>
                <select value={form.role} onChange={(e) => update('role', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                  <option value="admin">Admin do escritório</option>
                  <option value="advisor">Assessor</option>
                  <option value="client">Cliente final</option>
                </select>
              </label>
            )}

            {message && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{message}</p>}

            <button disabled={loading} className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors disabled:opacity-60">
              <LogIn className="w-4 h-4" />
              {loading ? 'Entrando...' : mode === 'login' ? 'Entrar' : 'Criar acesso'}
            </button>
          </div>
        </form>

        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Entrada rápida para demonstração
          </h2>
          <p className="text-slate-400 mb-5">Use estes acessos para apresentar a plataforma imediatamente, sem depender de confirmação de e-mail.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {demoOptions.map((option) => {
              const Icon = option.icon;
              return (
                <button key={option.role} onClick={() => startDemo(option.role)} className="text-left rounded-2xl border border-slate-700/40 bg-slate-950/40 p-5 hover:border-primary/40 transition-colors">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-white mb-2">{option.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{option.description}</p>
                </button>
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
}
