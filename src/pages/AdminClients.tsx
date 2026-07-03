import { FormEvent, useMemo, useState } from 'react';
import { Copy, Mail, Plus, Send, UserPlus, Users } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { addClient, getInviteUrl, getWorkspace, getWorkspaceStats, WorkspaceClient } from '@/services/workspace';

const interestOptions = ['Juros', 'Renda fixa', 'Dividendos', 'Dólar', 'Valuation', 'Risco', 'Exterior'];

type ClientFormState = {
  name: string;
  email: string;
  phone: string;
  profile: WorkspaceClient['profile'];
  educationLevel: WorkspaceClient['educationLevel'];
  interests: string[];
};

export default function AdminClients() {
  const initialStats = getWorkspaceStats();
  const [clients, setClients] = useState(initialStats.clients);
  const [copiedToken, setCopiedToken] = useState('');
  const [form, setForm] = useState<ClientFormState>({
    name: '',
    email: '',
    phone: '',
    profile: 'moderado',
    educationLevel: 'intermediario',
    interests: ['Juros', 'Valuation'],
  });

  const advisors = useMemo(() => getWorkspaceStats().advisors, []);

  const update = <K extends keyof ClientFormState>(key: K, value: ClientFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const toggleInterest = (item: string) => {
    const exists = form.interests.includes(item);
    update('interests', exists ? form.interests.filter((value) => value !== item) : [...form.interests, item]);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const workspace = getWorkspace();
    const advisorId = workspace.activeAdvisorId || advisors[0]?.id || 'advisor_demo';
    const client = addClient({
      tenantId: workspace.activeTenantId,
      advisorId,
      name: form.name || 'Novo Cliente',
      email: form.email || 'cliente@email.com',
      phone: form.phone,
      profile: form.profile,
      educationLevel: form.educationLevel,
      interests: form.interests,
    });
    setClients((current) => [client, ...current]);
    setForm({ name: '', email: '', phone: '', profile: 'moderado', educationLevel: 'intermediario', interests: ['Juros', 'Valuation'] });
  };

  const copyInvite = async (token: string) => {
    const url = getInviteUrl(token);
    await navigator.clipboard?.writeText(url);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(''), 1800);
  };

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6 lg:p-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
          <Users className="w-3.5 h-3.5" />
          Clientes finais
        </span>
        <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Convide clientes para o portal educacional.</h1>
        <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">Cada cliente recebe uma área com relatórios, conteúdos e perguntas liberadas pelo escritório, sem exibir saldos ou posição real.</p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-6">
        <form onSubmit={submit} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6 h-fit">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-5">
            <UserPlus className="w-5 h-5 text-primary" />
            Novo cliente final
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
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Perfil</span>
                <select value={form.profile} onChange={(e) => update('profile', e.target.value as WorkspaceClient['profile'])} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                  <option value="conservador">Conservador</option>
                  <option value="moderado">Moderado</option>
                  <option value="arrojado">Arrojado</option>
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Educação</span>
                <select value={form.educationLevel} onChange={(e) => update('educationLevel', e.target.value as WorkspaceClient['educationLevel'])} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                  <option value="iniciante">Iniciante</option>
                  <option value="intermediario">Intermediário</option>
                  <option value="avancado">Avançado</option>
                </select>
              </label>
            </div>
            <div>
              <span className="text-sm text-slate-400 mb-2 block">Temas liberados</span>
              <div className="flex flex-wrap gap-2">
                {interestOptions.map((item) => (
                  <button key={item} type="button" onClick={() => toggleInterest(item)} className={`rounded-full px-3 py-1.5 text-xs font-bold border transition-colors ${form.interests.includes(item) ? 'bg-primary/15 text-primary border-primary/30' : 'bg-slate-950/50 text-slate-400 border-slate-700/50'}`}>
                    {item}
                  </button>
                ))}
              </div>
            </div>
            <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Criar cliente e gerar convite
            </button>
          </div>
        </form>

        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-xl font-bold text-white mb-5">Clientes cadastrados</h2>
          <div className="space-y-3">
            {clients.map((client) => (
              <div key={client.id} className="rounded-2xl border border-slate-700/40 bg-slate-950/40 p-4">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-white">{client.name}</h3>
                    <p className="text-sm text-slate-400">Perfil {client.profile} · educação {client.educationLevel}</p>
                    <p className="text-xs text-primary mt-1 flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{client.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => copyInvite(client.inviteToken)} className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200 border border-slate-700/50 hover:border-primary/40 transition-colors">
                      <Copy className="w-3.5 h-3.5" />
                      {copiedToken === client.inviteToken ? 'Copiado' : 'Copiar convite'}
                    </button>
                    <span className="inline-flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary border border-primary/20">
                      <Send className="w-3.5 h-3.5" />
                      {client.inviteToken}
                    </span>
                  </div>
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {client.interests.map((interest) => (
                    <span key={interest} className="rounded-full bg-slate-900/80 px-2.5 py-1 text-[11px] text-slate-400 border border-slate-700/40">{interest}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
