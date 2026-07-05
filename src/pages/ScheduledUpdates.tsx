import { FormEvent, useState } from 'react';
import {
  Bell,
  Bot,
  CalendarDays,
  CheckCircle2,
  Clock,
  PauseCircle,
  PlayCircle,
  Plus,
  Radio,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import {
  addScheduledUpdate,
  getScheduledUpdateStats,
  getScheduledUpdates,
  ScheduledUpdate,
  toggleScheduledUpdate,
  UpdateChannel,
  UpdateFrequency,
  UpdateKind,
} from '@/services/updateScheduler';

interface FormState {
  title: string;
  kind: UpdateKind;
  audience: ScheduledUpdate['audience'];
  channel: UpdateChannel;
  frequency: UpdateFrequency;
  dayOfWeek: string;
  time: string;
  description: string;
}

const kindLabels: Record<UpdateKind, string> = {
  macro: 'Macro',
  news: 'Notícias',
  content: 'Conteúdo',
  report: 'Relatório',
  meeting: 'Reunião',
  risk: 'Risco',
};

const frequencyLabels: Record<UpdateFrequency, string> = {
  daily: 'Diário',
  weekly: 'Semanal',
  monthly: 'Mensal',
  event_driven: 'Por evento',
};

const channelLabels: Record<UpdateChannel, string> = {
  portal: 'Portal',
  email: 'E-mail',
  whatsapp: 'WhatsApp',
  crm: 'CRM',
};

const audienceLabels: Record<ScheduledUpdate['audience'], string> = {
  all_clients: 'Todos os clientes',
  client_segment: 'Segmento de clientes',
  specific_client: 'Cliente específico',
  advisors: 'Assessores',
};

export default function ScheduledUpdates() {
  const [items, setItems] = useState(() => getScheduledUpdates());
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: 'Resumo semanal para clientes',
    kind: 'macro',
    audience: 'all_clients',
    channel: 'portal',
    frequency: 'weekly',
    dayOfWeek: 'segunda',
    time: '08:00',
    description: 'Gerar rascunho de atualização com cenário macro, notícias relevantes e perguntas para reunião.',
  });

  const stats = getScheduledUpdateStats();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    addScheduledUpdate(form);
    setItems(getScheduledUpdates());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggle = (id: string) => {
    setItems(toggleScheduledUpdate(id));
  };

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <Radio className="w-3.5 h-3.5" />
              Atualizações programadas
            </span>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Programe relacionamento recorrente.</h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              Configure rotinas de mercado, notícias, conteúdos, relatórios e lembretes para manter clientes e assessores sempre atualizados.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 min-w-[280px]">
            <Bot className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Motor automático</h3>
            <p className="text-sm text-slate-300 leading-relaxed">Nesta fase, criamos a régua visual. Depois conectamos cron, e-mail, WhatsApp e CRM.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5">
          <Bell className="w-6 h-6 text-primary mb-3" />
          <p className="text-3xl font-black text-white">{stats.total}</p>
          <p className="text-sm text-slate-300">Rotinas</p>
        </div>
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <PlayCircle className="w-6 h-6 text-emerald-400 mb-3" />
          <p className="text-3xl font-black text-white">{stats.active}</p>
          <p className="text-sm text-emerald-200/80">Ativas</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <PauseCircle className="w-6 h-6 text-amber-400 mb-3" />
          <p className="text-3xl font-black text-white">{stats.paused}</p>
          <p className="text-sm text-amber-200/80">Pausadas</p>
        </div>
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
          <Send className="w-6 h-6 text-slate-300 mb-3" />
          <p className="text-3xl font-black text-white">{stats.portal}</p>
          <p className="text-sm text-slate-400">Via portal</p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-6">
        <form onSubmit={submit} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6 h-fit">
          <h2 className="text-2xl font-bold text-white mb-1">Nova rotina</h2>
          <p className="text-slate-400 mb-5">Crie uma régua recorrente para portal, e-mail, WhatsApp ou CRM.</p>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Nome da atualização</span>
              <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Tipo</span>
                <select value={form.kind} onChange={(event) => setForm((current) => ({ ...current, kind: event.target.value as UpdateKind }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                  {Object.entries(kindLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Público</span>
                <select value={form.audience} onChange={(event) => setForm((current) => ({ ...current, audience: event.target.value as ScheduledUpdate['audience'] }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                  {Object.entries(audienceLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Canal</span>
                <select value={form.channel} onChange={(event) => setForm((current) => ({ ...current, channel: event.target.value as UpdateChannel }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                  {Object.entries(channelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Frequência</span>
                <select value={form.frequency} onChange={(event) => setForm((current) => ({ ...current, frequency: event.target.value as UpdateFrequency }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                  {Object.entries(frequencyLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Dia</span>
                <select value={form.dayOfWeek} onChange={(event) => setForm((current) => ({ ...current, dayOfWeek: event.target.value }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                  {['segunda', 'terça', 'quarta', 'quinta', 'sexta'].map((day) => <option key={day} value={day}>{day}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Horário</span>
                <input type="time" value={form.time} onChange={(event) => setForm((current) => ({ ...current, time: event.target.value }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
              </label>
            </div>

            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Descrição</span>
              <textarea rows={4} value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>

            {saved && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Rotina programada na demo.
              </div>
            )}

            <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Criar rotina
            </button>
          </div>
        </form>

        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <CalendarDays className="w-6 h-6 text-primary" />
                Régua ativa do escritório
              </h2>
              <p className="text-slate-400 mt-1">Rotinas de atualização para relacionamento, conteúdo e follow-up.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{items.length} configuradas</span>
          </div>

          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{kindLabels[item.kind]}</span>
                      <span className="inline-flex rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300">{frequencyLabels[item.frequency]}</span>
                      <span className="inline-flex rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300">{channelLabels[item.channel]}</span>
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${item.status === 'active' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-amber-500/10 text-amber-300'}`}>{item.status === 'active' ? 'Ativa' : 'Pausada'}</span>
                    </div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed mb-3">{item.description}</p>
                    <p className="text-xs text-slate-500">Público: {audienceLabels[item.audience]}</p>
                  </div>
                  <div className="flex flex-col gap-3 min-w-[210px]">
                    <div className="rounded-xl border border-slate-700/40 bg-slate-900/70 px-3 py-2 text-xs text-slate-300 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-primary" />
                      Próxima: {new Date(item.nextRunAt).toLocaleString('pt-BR')}
                    </div>
                    <button onClick={() => toggle(item.id)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:border-primary/50 transition-colors">
                      {item.status === 'active' ? <PauseCircle className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                      {item.status === 'active' ? 'Pausar' : 'Ativar'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 flex gap-3">
            <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-100/80 leading-relaxed">
              MVP visual: as rotinas ficam salvas no navegador. A próxima etapa é mover isso para Supabase + cron para disparo real por portal, e-mail, WhatsApp ou CRM.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
