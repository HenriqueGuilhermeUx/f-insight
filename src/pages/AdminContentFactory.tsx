import { FormEvent, useMemo, useState } from 'react';
import { Bot, CalendarDays, CheckCircle2, Clock, FileText, Sparkles, Wand2 } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { getWorkspaceStats, publishContent } from '@/services/workspace';
import { FactoryMode, FactoryTheme, generateContentPackage, getFactoryThemeLabel } from '@/services/contentFactory';

interface FactoryFormState {
  theme: FactoryTheme;
  mode: FactoryMode;
  clientId: string;
  startDate: string;
}

const themeOptions: { value: FactoryTheme; label: string }[] = [
  { value: 'macro', label: 'Macro' },
  { value: 'renda_fixa', label: 'Renda fixa' },
  { value: 'acoes', label: 'Ações' },
  { value: 'dolar', label: 'Dólar' },
  { value: 'dividendos', label: 'Dividendos' },
  { value: 'risco', label: 'Risco' },
];

export default function AdminContentFactory() {
  const [stats, setStats] = useState(() => getWorkspaceStats());
  const [created, setCreated] = useState(0);
  const [form, setForm] = useState<FactoryFormState>({
    theme: 'macro',
    mode: 'drafts',
    clientId: '',
    startDate: '',
  });

  const preview = useMemo(() => generateContentPackage({
    tenantId: stats.tenant.id,
    clientId: form.clientId || undefined,
    theme: form.theme,
    mode: form.mode,
    startDate: form.startDate || undefined,
  }), [form, stats.tenant.id]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const drafts = generateContentPackage({
      tenantId: stats.tenant.id,
      clientId: form.clientId || undefined,
      theme: form.theme,
      mode: form.mode,
      startDate: form.startDate || undefined,
    });

    drafts.forEach((item) => publishContent(item));
    setStats(getWorkspaceStats());
    setCreated(drafts.length);
    setTimeout(() => setCreated(0), 3500);
  };

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <Bot className="w-3.5 h-3.5" />
              Fábrica de Conteúdo F-Insight
            </span>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Gere pacotes editoriais para o escritório aprovar.</h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              Crie rascunhos ou agende uma sequência semanal de conteúdos educativos para alimentar o portal do cliente final.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 min-w-[280px]">
            <Sparkles className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Conteúdo recorrente</h3>
            <p className="text-sm text-slate-300 leading-relaxed">O F-Insight gera a base; o escritório revisa e publica com a própria marca.</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-6">
        <form onSubmit={submit} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6 h-fit">
          <h2 className="text-2xl font-bold text-white mb-1">Gerar pacote</h2>
          <p className="text-slate-400 mb-5">Cada pacote cria 3 conteúdos conectados ao mesmo tema.</p>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Tema</span>
              <select value={form.theme} onChange={(event) => setForm((current) => ({ ...current, theme: event.target.value as FactoryTheme }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                {themeOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Destino</span>
              <select value={form.clientId} onChange={(event) => setForm((current) => ({ ...current, clientId: event.target.value }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                <option value="">Portal geral / todos os clientes</option>
                {stats.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Modo</span>
              <select value={form.mode} onChange={(event) => setForm((current) => ({ ...current, mode: event.target.value as FactoryMode }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                <option value="drafts">Gerar como rascunhos para aprovação</option>
                <option value="weekly_schedule">Agendar sequência semanal</option>
              </select>
            </label>

            {form.mode === 'weekly_schedule' && (
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Primeira publicação</span>
                <input type="datetime-local" value={form.startDate} onChange={(event) => setForm((current) => ({ ...current, startDate: event.target.value }))} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
              </label>
            )}

            {created > 0 && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                {created} conteúdos enviados para o calendário editorial.
              </div>
            )}

            <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
              <Wand2 className="w-4 h-4" />
              Gerar pacote
            </button>
          </div>
        </form>

        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Prévia do pacote: {getFactoryThemeLabel(form.theme)}
              </h2>
              <p className="text-slate-400 mt-1">Revise a estrutura antes de gerar no calendário editorial.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">3 conteúdos</span>
          </div>

          <div className="space-y-3 mb-6">
            {preview.map((item, index) => (
              <div key={`${item.title}-${index}`} className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4">
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{item.category}</span>
                      <span className="inline-flex rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300">F-Insight</span>
                      <span className="inline-flex rounded-full bg-amber-500/10 px-2.5 py-1 text-[11px] font-bold text-amber-300">{item.status === 'scheduled' ? 'Agendado' : 'Rascunho'}</span>
                    </div>
                    <h3 className="font-bold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
                  </div>
                  {item.scheduledAt && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 shrink-0 flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(item.scheduledAt).toLocaleString('pt-BR')}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4 flex gap-3">
            <CalendarDays className="w-5 h-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-slate-300 leading-relaxed">
              Depois de gerar, os conteúdos aparecem em /admin/conteudos como rascunhos ou agendados. Só entram no portal do cliente quando estiverem publicados.
            </p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
