import { FormEvent, useState } from 'react';
import { BookOpen, CheckCircle2, GraduationCap, Plus, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { getWorkspaceStats, publishContent, WorkspaceContent } from '@/services/workspace';

type ContentCategory = WorkspaceContent['category'];

interface ContentFormState {
  title: string;
  category: ContentCategory;
  description: string;
  clientId: string;
}

const categories: { value: ContentCategory; label: string; helper: string }[] = [
  { value: 'macro', label: 'Macro', helper: 'Juros, inflação, câmbio e cenário econômico.' },
  { value: 'renda_fixa', label: 'Renda fixa', helper: 'CDB, Tesouro, crédito privado, pós e IPCA+.' },
  { value: 'acoes', label: 'Ações', helper: 'Setores, empresas, valuation e fundamentos.' },
  { value: 'dolar', label: 'Dólar', helper: 'Câmbio, exterior e proteção internacional.' },
  { value: 'dividendos', label: 'Dividendos', helper: 'Renda, geração de caixa e empresas maduras.' },
  { value: 'risco', label: 'Risco', helper: 'Volatilidade, concentração e margem de segurança.' },
];

export default function AdminContents() {
  const [stats, setStats] = useState(() => getWorkspaceStats());
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState<ContentFormState>({
    title: 'Como interpretar a Selic no seu planejamento',
    category: 'macro',
    description: 'Material educativo para explicar, em linguagem simples, como juros afetam renda fixa, bolsa e decisões de alocação.',
    clientId: '',
  });

  const update = <K extends keyof ContentFormState>(key: K, value: ContentFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    publishContent({
      tenantId: stats.tenant.id,
      clientId: form.clientId || undefined,
      title: form.title,
      category: form.category,
      description: form.description,
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
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Publique trilhas e materiais para o cliente.</h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              Transforme a inteligência do escritório em conteúdo simples, seguro e orientativo para o portal do cliente final.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 min-w-[280px]">
            <GraduationCap className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Sem recomendação individual</h3>
            <p className="text-sm text-slate-300 leading-relaxed">Conteúdo educacional para preparar conversas, não para substituir suitability ou assessoria.</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-6">
        <form onSubmit={submit} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6 h-fit">
          <h2 className="text-2xl font-bold text-white mb-1">Novo conteúdo</h2>
          <p className="text-slate-400 mb-5">O material aparece nas trilhas do portal do cliente.</p>

          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Título</span>
              <input
                value={form.title}
                onChange={(event) => update('title', event.target.value)}
                className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50"
              />
            </label>

            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Categoria</span>
              <select
                value={form.category}
                onChange={(event) => update('category', event.target.value as ContentCategory)}
                className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50"
              >
                {categories.map((category) => (
                  <option key={category.value} value={category.value}>{category.label}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Liberar para cliente específico</span>
              <select
                value={form.clientId}
                onChange={(event) => update('clientId', event.target.value)}
                className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50"
              >
                <option value="">Todos / portal geral</option>
                {stats.clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </label>

            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Resumo para o cliente</span>
              <textarea
                rows={5}
                value={form.description}
                onChange={(event) => update('description', event.target.value)}
                className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50"
              />
            </label>

            {saved && (
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Conteúdo publicado no portal.
              </div>
            )}

            <button className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
              <Plus className="w-4 h-4" />
              Publicar conteúdo
            </button>
          </div>
        </form>

        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                Biblioteca do escritório
              </h2>
              <p className="text-slate-400 mt-1">Conteúdos disponíveis para compor o mini Bloomberg educativo.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{stats.contents.length} materiais</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
            {categories.map((category) => (
              <div key={category.value} className="rounded-2xl border border-slate-700/40 bg-slate-950/40 p-4">
                <p className="font-bold text-white mb-1">{category.label}</p>
                <p className="text-xs text-slate-400 leading-relaxed">{category.helper}</p>
              </div>
            ))}
          </div>

          <div className="space-y-3">
            {stats.contents.map((content) => (
              <div key={content.id} className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary mb-3">
                      {categories.find((item) => item.value === content.category)?.label || content.category}
                    </span>
                    <h3 className="font-bold text-white mb-1">{content.title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{content.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
}
