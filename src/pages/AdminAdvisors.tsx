import { FormEvent, useState } from 'react';
import { Briefcase, Mail, Plus, Send, UserPlus } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { addAdvisor, getWorkspace, getWorkspaceStats } from '@/services/workspace';

export default function AdminAdvisors() {
  const initialStats = getWorkspaceStats();
  const [advisors, setAdvisors] = useState(initialStats.advisors);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    roleTitle: 'Assessor de Investimentos',
  });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const workspace = getWorkspace();
    const advisor = addAdvisor({
      tenantId: workspace.activeTenantId,
      name: form.name || 'Novo Assessor',
      email: form.email || 'assessor@escritorio.com',
      phone: form.phone,
      roleTitle: form.roleTitle,
    });
    setAdvisors((current) => [advisor, ...current]);
    setForm({ name: '', email: '', phone: '', roleTitle: 'Assessor de Investimentos' });
  };

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6 lg:p-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
          <Briefcase className="w-3.5 h-3.5" />
          Gestão de assessores
        </span>
        <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Assessores do escritório</h1>
        <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">Cadastre a equipe que poderá publicar relatórios, criar clientes finais e conduzir a curadoria educacional.</p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[420px_1fr] gap-6">
        <form onSubmit={submit} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6 h-fit">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-5">
            <UserPlus className="w-5 h-5 text-primary" />
            Novo assessor
          </h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Nome</span>
              <input value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">E-mail</span>
              <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Telefone</span>
              <input value={form.phone} onChange={(e) => update('phone', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Cargo</span>
              <input value={form.roleTitle} onChange={(e) => update('roleTitle', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Cadastrar e enviar convite
            </button>
          </div>
        </form>

        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-xl font-bold text-white mb-5">Equipe cadastrada</h2>
          <div className="space-y-3">
            {advisors.map((advisor) => (
              <div key={advisor.id} className="rounded-2xl border border-slate-700/40 bg-slate-950/40 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div>
                  <h3 className="font-bold text-white">{advisor.name}</h3>
                  <p className="text-sm text-slate-400">{advisor.roleTitle}</p>
                  <p className="text-xs text-primary mt-1 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    {advisor.email}
                  </p>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 w-fit">
                  <Send className="w-3.5 h-3.5" />
                  {advisor.status === 'ativo' ? 'Ativo' : 'Convite enviado'}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
