import { FormEvent, useEffect, useState } from 'react';
import {
  Bot,
  CheckCircle2,
  ClipboardList,
  Clock,
  MessageCircle,
  Plus,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import {
  createFollowUp,
  FollowUpPriority,
  FollowUpReason,
  getFollowUps,
  getFollowUpStats,
  getReasonLabel,
  loadFollowUpsFromSupabase,
  markFollowUpDone,
  resetFollowUpsFromWorkspace,
} from '@/services/followUpEngine';
import { getWorkspaceStats } from '@/services/workspace';

interface FormState {
  clientName: string;
  clientProfile: string;
  title: string;
  reason: FollowUpReason;
  priority: FollowUpPriority;
  suggestedAction: string;
  script: string;
  dueAt: string;
}

const priorityClasses: Record<FollowUpPriority, string> = {
  alta: 'bg-red-500/10 text-red-300 border-red-500/20',
  media: 'bg-amber-500/10 text-amber-300 border-amber-500/20',
  baixa: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20',
};

export default function AdvisorFollowUps() {
  const stats = getWorkspaceStats();
  const firstClient = stats.clients[0];
  const [items, setItems] = useState(() => getFollowUps());
  const [saved, setSaved] = useState(false);
  const [loadingRemote, setLoadingRemote] = useState(true);
  const [form, setForm] = useState<FormState>({
    clientName: firstClient?.name || 'Cliente Final Demo',
    clientProfile: firstClient?.profile || 'moderado',
    title: 'Follow-up sobre relatório liberado',
    reason: 'report',
    priority: 'media',
    suggestedAction: 'Enviar mensagem contextual e sugerir conversa rápida.',
    script: 'Olá! Liberei um material no portal e acho que vale revisarmos juntos os principais pontos, riscos e dúvidas antes de qualquer decisão.',
    dueAt: new Date(Date.now() + 86400000).toISOString().slice(0, 16),
  });

  useEffect(() => {
    let mounted = true;
    loadFollowUpsFromSupabase().then((data) => {
      if (mounted) setItems(data);
    }).finally(() => {
      if (mounted) setLoadingRemote(false);
    });
    return () => { mounted = false; };
  }, []);

  const liveStats = {
    total: items.length,
    open: items.filter((item) => item.status === 'open').length,
    done: items.filter((item) => item.status === 'done').length,
    high: items.filter((item) => item.priority === 'alta' && item.status === 'open').length,
  };
  const fallbackStats = getFollowUpStats();
  const followStats = items.length > 0 ? liveStats : fallbackStats;
  const openItems = items.filter((item) => item.status === 'open');
  const doneItems = items.filter((item) => item.status === 'done');

  const submit = (event: FormEvent) => {
    event.preventDefault();
    createFollowUp({
      ...form,
      dueAt: new Date(form.dueAt).toISOString(),
    });
    setItems(getFollowUps());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const complete = (id: string) => {
    setItems(markFollowUpDone(id));
  };

  const regenerate = () => {
    setItems(resetFollowUpsFromWorkspace());
  };

  const reloadRemote = async () => {
    setLoadingRemote(true);
    try {
      setItems(await loadFollowUpsFromSupabase());
    } finally {
      setLoadingRemote(false);
    }
  };

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <Target className="w-3.5 h-3.5" />
              Cockpit de follow-up
            </span>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Clientes que precisam de ação agora.</h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              Transforme mensagens, relatórios, notícias, conteúdos e sinais macro em próximos passos claros para o assessor.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 min-w-[280px]">
            <Bot className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Motor assistivo</h3>
            <p className="text-sm text-slate-300 leading-relaxed">Sugere ação e texto de abordagem, sem recomendação automática de investimento.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5">
          <ClipboardList className="w-6 h-6 text-primary mb-3" />
          <p className="text-3xl font-black text-white">{followStats.total}</p>
          <p className="text-sm text-slate-300">Ações</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <Clock className="w-6 h-6 text-amber-400 mb-3" />
          <p className="text-3xl font-black text-white">{followStats.open}</p>
          <p className="text-sm text-amber-200/80">Abertas</p>
        </div>
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5">
          <Sparkles className="w-6 h-6 text-red-400 mb-3" />
          <p className="text-3xl font-black text-white">{followStats.high}</p>
          <p className="text-sm text-red-200/80">Alta prioridade</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <CheckCircle2 className="w-6 h-6 text-emerald-400 mb-3" />
          <p className="text-3xl font-black text-white">{followStats.done}</p>
          <p className="text-sm text-emerald-200/80">Concluídas</p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-6">
        <form onSubmit={submit} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6 h-fit">
          <h2 className="text-2xl font-bold text-white mb-1">Nova ação</h2>
          <p className="text-slate-400 mb-5">Crie um follow-up com texto de abordagem pronto.</p>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Cliente</span>
              <select value={form.clientName} onChange={(event) => setForm((current) => ({ ...current, clientName: event.target.value }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                {stats.clients.map((client) => <option key={client.id} value={client.name}>{client.name}</option>)}
                {stats.clients.length === 0 && <option value="Cliente Final Demo">Cliente Final Demo</option>}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Título</span>
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Motivo</span>
                <select value={form.reason} onChange={(event) => setForm((current) => ({ ...current, reason: event.target.value as FollowUpReason }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                  {(['report', 'macro', 'content', 'risk', 'meeting', 'news'] as FollowUpReason[]).map((reason) => <option key={reason} value={reason}>{getReasonLabel(reason)}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Prioridade</span>
                <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as FollowUpPriority }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                  <option value="alta">Alta</option>
                  <option value="media">Média</option>
                  <option value="baixa">Baixa</option>
                </select>
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Prazo</span>
              <input type="datetime-local" value={form.dueAt} onChange={(event) => setForm((current) => ({ ...current, dueAt: event.target.value }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>

            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Ação sugerida</span>
              <textarea rows={3} value={form.suggestedAction} onChange={(event) => setForm((current) => ({ ...current, suggestedAction: event.target.value }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>

            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Texto pronto para abordagem</span>
              <textarea rows={5} value={form.script} onChange={(event) => setForm((current) => ({ ...current, script: event.target.value }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>

            {saved && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Follow-up criado e sincronizado.
              </div>
            )}

            <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Criar follow-up
            </button>
          </div>
        </form>

        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Fila de relacionamento
              </h2>
              <p className="text-slate-400 mt-1">Ações abertas, textos prontos e prioridades do assessor.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <button onClick={reloadRemote} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-2.5 text-sm font-bold text-white hover:border-primary/50 transition-colors">
                <RefreshCcw className="w-4 h-4" />
                {loadingRemote ? 'Sincronizando...' : 'Sincronizar'}
              </button>
              <button onClick={regenerate} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-2.5 text-sm font-bold text-white hover:border-primary/50 transition-colors">
                <RefreshCcw className="w-4 h-4" />
                Regerar sugestões
              </button>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {openItems.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4">
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{getReasonLabel(item.reason)}</span>
                      <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-bold ${priorityClasses[item.priority]}`}>Prioridade {item.priority}</span>
                      <span className="inline-flex rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-400">{item.synced ? 'Supabase' : 'Local'}</span>
                    </div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400 mb-2">{item.clientName} · perfil {item.clientProfile}</p>
                    <p className="text-sm text-slate-300 leading-relaxed mb-3">{item.suggestedAction}</p>
                    <div className="rounded-xl border border-slate-700/40 bg-slate-900/70 p-3">
                      <p className="text-xs text-slate-500 mb-1">Texto sugerido</p>
                      <p className="text-sm text-slate-300 leading-relaxed">{item.script}</p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 min-w-[190px]">
                    <div className="rounded-xl border border-slate-700/40 bg-slate-900/70 px-3 py-2 text-xs text-slate-300 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      {new Date(item.dueAt).toLocaleString('pt-BR')}
                    </div>
                    <button onClick={() => complete(item.id)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
                      <Send className="w-4 h-4" />
                      Marcar feito
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {doneItems.length > 0 && (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <h3 className="font-bold text-white flex items-center gap-2 mb-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                Concluídos
              </h3>
              <div className="space-y-2">
                {doneItems.slice(0, 4).map((item) => <p key={item.id} className="text-sm text-emerald-100/80">{item.title} · {item.clientName}</p>)}
              </div>
            </div>
          )}

          <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 flex gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-100/80 leading-relaxed">
              As sugestões são operacionais e educativas. A decisão, recomendação ou adequação ao perfil deve seguir o processo do escritório.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
