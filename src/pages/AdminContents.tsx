import { FormEvent, useMemo, useState } from 'react';
import { BookOpen, CalendarDays, CheckCircle2, Clock, GraduationCap, Plus, Send, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import {
  getWorkspaceStats,
  publishContent,
  type ContentOrigin,
  type ContentStatus,
  type WorkspaceContent,
} from '@/services/workspace';

type ContentCategory = WorkspaceContent['category'];

interface ContentFormState {
  title: string;
  category: ContentCategory;
  description: string;
  clientId: string;
  origin: ContentOrigin;
  status: ContentStatus;
  scheduledAt: string;
}

const categories: { value: ContentCategory; label: string; helper: string }[] = [
  { value: 'macro', label: 'Macro', helper: 'Juros, inflação, câmbio e cenário econômico.' },
  { value: 'renda_fixa', label: 'Renda fixa', helper: 'CDB, Tesouro, crédito privado, pós e IPCA+.' },
  { value: 'acoes', label: 'Ações', helper: 'Setores, empresas, valuation e fundamentos.' },
  { value: 'dolar', label: 'Dólar', helper: 'Câmbio, exterior e proteção internacional.' },
  { value: 'dividendos', label: 'Dividendos', helper: 'Renda, geração de caixa e empresas maduras.' },
  { value: 'risco', label: 'Risco', helper: 'Volatilidade, concentração e margem de segurança.' },
];

const templates: Pick<ContentFormState, 'title' | 'category' | 'description' | 'origin' | 'status'>[] = [
  {
    title: 'Resumo semanal: juros, dólar e bolsa',
    category: 'macro',
    origin: 'f_insight',
    status: 'draft',
    description: 'Rascunho F-Insight para o escritório revisar: principais movimentos da semana, impactos de juros e câmbio e perguntas para a próxima conversa com clientes.',
  },
  {
    title: 'Margem de segurança: preço não é valor',
    category: 'acoes',
    origin: 'f_insight',
    status: 'published',
    description: 'Conteúdo educativo explicando a diferença entre preço de mercado, valor intrínseco e margem de segurança, sem recomendação individual.',
  },
  {
    title: 'Checklist de risco antes de investir',
    category: 'risco',
    origin: 'office',
    status: 'scheduled',
    description: 'Material para ajudar o cliente a pensar em prazo, liquidez, concentração, volatilidade e cenário antes da conversa com o assessor.',
  },
];

function statusLabel(status?: ContentStatus) {
  if (status === 'draft') return 'Rascunho';
  if (status === 'scheduled') return 'Agendado';
  return 'Publicado';
}

function originLabel(origin?: ContentOrigin) {
  if (origin === 'f_insight') return 'F-Insight';
  if (origin === 'advisor') return 'Assessor';
  return 'Escritório';
}

function statusClass(status?: ContentStatus) {
  if (status === 'draft') return 'bg-slate-500/10 text-slate-300';
  if (status === 'scheduled') return 'bg-amber-500/10 text-amber-300';
  return 'bg-emerald-500/10 text-emerald-300';
}

export default function AdminContents() {
  const [stats, setStats] = useState(() => getWorkspaceStats());
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<ContentFormState>({
    title: 'Como interpretar a Selic no seu planejamento',
    category: 'macro',
    description: 'Material educativo para explicar, em linguagem simples, como juros afetam renda fixa, bolsa e decisões de alocação.',
    clientId: '',
    origin: 'office',
    status: 'published',
    scheduledAt: '',
  });

  const contentStats = useMemo(() => ({
    published: stats.contents.filter((item) => !item.status || item.status === 'published').length,
    scheduled: stats.contents.filter((item) => item.status === 'scheduled').length,
    draft: stats.contents.filter((item) => item.status === 'draft').length,
  }), [stats.contents]);

  const update = <K extends keyof ContentFormState>(key: K, value: ContentFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const applyTemplate = (template: Pick<ContentFormState, 'title' | 'category' | 'description' | 'origin' | 'status'>) => {
    setForm((current) => ({
      ...current,
      ...template,
      scheduledAt: template.status === 'scheduled' ? current.scheduledAt : '',
    }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const scheduledAt = form.status === 'scheduled' && form.scheduledAt
      ? new Date(form.scheduledAt).toISOString()
      : undefined;

    publishContent({
      tenantId: stats.tenant.id,
      clientId: form.clientId || undefined,
      title: form.title,
      category: form.category,
      description: form.description,
      origin: form.origin,
      status: form.status,
      scheduledAt,
    });
    setStats(getWorkspaceStats());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <BookOpen className="w-3.5 h-3.5" />
              Conteúdos educativos
            </span>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Crie, aprove e agende conteúdos para clientes.</h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              Use modelos F-Insight, conteúdos do escritório ou materiais do assessor para alimentar o portal do cliente final de forma recorrente.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 min-w-[280px]">
            <GraduationCap className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Motor editorial</h3>
            <p className="text-sm text-slate-300 leading-relaxed">F-Insight sugere, escritório aprova, assessor comenta e cliente aprende.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
          <Send className="w-6 h-6 text-emerald-400 mb-3" />
          <p className="text-3xl font-black text-white">{contentStats.published}</p>
          <p className="text-sm text-emerald-200/80">Publicados</p>
        </div>
        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-5">
          <Clock className="w-6 h-6 text-amber-400 mb-3" />
          <p className="text-3xl font-black text-white">{contentStats.scheduled}</p>
          <p className="text-sm text-amber-200/80">Agendados</p>
        </div>
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
          <BookOpen className="w-6 h-6 text-slate-300 mb-3" />
          <p className="text-3xl font-black text-white">{contentStats.draft}</p>
          <p className="text-sm text-slate-400">Rascunhos</p>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-6">
        <form onSubmit={submit} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6 h-fit">
          <h2 className="text-2xl font-bold text-white mb-1">Novo conteúdo</h2>
          <p className="text-slate-400 mb-5">Publique agora, deixe em rascunho ou agende para depois.</p>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Título</span>
              <input value={form.title} onChange={(event) => update('title', event.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Origem</span>
                <select value={form.origin} onChange={(event) => update('origin', event.target.value as ContentOrigin)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                  <option value="f_insight">F-Insight</option>
                  <option value="office">Escritório</option>
                  <option value="advisor">Assessor</option>
                </select>
              </label>

              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Status</span>
                <select value={form.status} onChange={(event) => update('status', event.target.value as ContentStatus)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                  <option value="published">Publicado</option>
                  <option value="scheduled">Agendado</option>
                  <option value="draft">Rascunho</option>
                </select>
              </label>
            </div>

            {form.status === 'scheduled' && (
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Data de publicação</span>
                <input type="datetime-local" value={form.scheduledAt} onChange={(event) => update('scheduledAt', event.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
              </label>
            )}

            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Categoria</span>
              <select value={form.category} onChange={(event) => update('category', event.target.value as ContentCategory)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                {categories.map((category) => <option key={category.value} value={category.value}>{category.label}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Liberar para cliente específico</span>
              <select value={form.clientId} onChange={(event) => update('clientId', event.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                <option value="">Todos / portal geral</option>
                {stats.clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Resumo para o cliente</span>
              <textarea rows={5} value={form.description} onChange={(event) => update('description', event.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>

            {saved && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Conteúdo salvo no calendário editorial.
              </div>
            )}

            <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Salvar conteúdo
            </button>
          </div>
        </form>

        <section className="space-y-6">
          <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
            <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-primary" />
              Modelos rápidos F-Insight
            </h2>
            <p className="text-slate-400 mb-5">Use como ponto de partida e ajuste com a linguagem do escritório.</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <button key={template.title} type="button" onClick={() => applyTemplate(template)} className="text-left rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4 hover:border-primary/40 transition-colors">
                  <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold mb-3 ${statusClass(template.status)}`}>{statusLabel(template.status)}</span>
                  <h3 className="font-bold text-white mb-2">{template.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{template.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <CalendarDays className="w-6 h-6 text-primary" />
                  Calendário editorial
                </h2>
                <p className="text-slate-400 mt-1">Conteúdos publicados, agendados e rascunhos do escritório.</p>
              </div>
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{stats.contents.length} materiais</span>
            </div>

            <div className="space-y-3">
              {stats.contents.map((content) => (
                <div key={content.id} className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4">
                  <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">
                          {categories.find((item) => item.value === content.category)?.label || content.category}
                        </span>
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold ${statusClass(content.status)}`}>{statusLabel(content.status)}</span>
                        <span className="inline-flex rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300">{originLabel(content.origin)}</span>
                      </div>
                      <h3 className="font-bold text-white mb-1">{content.title}</h3>
                      <p className="text-sm text-slate-400 leading-relaxed">{content.description}</p>
                    </div>
                    {content.scheduledAt && (
                      <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 shrink-0">
                        {new Date(content.scheduledAt).toLocaleString('pt-BR')}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}
