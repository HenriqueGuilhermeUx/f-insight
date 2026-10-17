import { FormEvent, useMemo, useState } from 'react';
import { FileText, Plus, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { getWorkspace, getWorkspaceStats, publishReport, WorkspaceReport } from '@/services/workspace';

type ReportFormState = {
  ticker: string;
  title: string;
  summary: string;
  type: WorkspaceReport['type'];
  clientId: string;
};

export default function AdminReports() {
  const initialStats = getWorkspaceStats();
  const [reports, setReports] = useState(initialStats.reports);
  const clients = useMemo(() => initialStats.clients, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<ReportFormState>({
    ticker: 'PETR4',
    title: 'Como ler um estudo de valuation',
    summary: 'Material orientativo para explicar preço, valor estimado, premissas e margem de segurança.',
    type: 'valuation',
    clientId: clients[0]?.id || '',
  });

  const update = <K extends keyof ReportFormState>(key: K, value: ReportFormState[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    try {
      const workspace = getWorkspace();
      const report = await publishReport({
        tenantId: workspace.activeTenantId,
        advisorId: workspace.activeAdvisorId,
        clientId: form.clientId || undefined,
        ticker: form.ticker.toUpperCase(),
        title: form.title,
        summary: form.summary,
        type: form.type,
        visibility: form.clientId ? 'cliente' : 'interno',
      });
      setReports((current) => [report, ...current]);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível publicar o relatório.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6 lg:p-8">
        <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary">
          <FileText className="h-3.5 w-3.5" />
          Publicação de materiais
        </span>
        <h1 className="mb-4 text-3xl font-black tracking-tight text-white lg:text-5xl">Publique materiais para clientes finais.</h1>
        <p className="max-w-4xl text-lg leading-relaxed text-slate-300">
          Organize conteúdos orientativos por cliente, sem mostrar saldos, custódia ou carteira real. PDFs de valuation só serão gerados quando preço, valor estimado, método, fonte e data de referência estiverem explícitos.
        </p>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[440px_1fr]">
        <form onSubmit={submit} className="h-fit rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="mb-5 flex items-center gap-2 text-xl font-bold text-white">
            <Sparkles className="h-5 w-5 text-primary" />
            Novo material
          </h2>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">Ticker / Tema</span>
              <input required value={form.ticker} onChange={(e) => update('ticker', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 font-mono text-white outline-none focus:border-primary/50" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">Título</span>
              <input required value={form.title} onChange={(e) => update('title', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">Resumo para o cliente</span>
              <textarea value={form.summary} onChange={(e) => update('summary', e.target.value)} rows={4} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">Tipo</span>
              <select value={form.type} onChange={(e) => update('type', e.target.value as WorkspaceReport['type'])} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                <option value="valuation">Valuation</option>
                <option value="macro">Macro</option>
                <option value="educacional">Educacional</option>
                <option value="reuniao">Pauta de reunião</option>
              </select>
            </label>
            <label className="block">
              <span className="mb-2 block text-sm text-slate-400">Liberar para cliente</span>
              <select value={form.clientId} onChange={(e) => update('clientId', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                <option value="">Apenas interno</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </label>
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3 text-xs leading-relaxed text-cyan-100/80">
              Esta tela publica o material e seu contexto. Ela não cria preço-alvo, recomendação ou PDF com números padrão. O gerador de valuation exige entradas verificadas.
            </div>
            {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
            <button disabled={loading} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-primary/90 disabled:opacity-60">
              <Plus className="h-4 w-4" />
              {loading ? 'Publicando...' : 'Publicar material'}
            </button>
          </div>
        </form>

        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="mb-5 text-xl font-bold text-white">Materiais publicados</h2>
          <div className="space-y-3">
            {reports.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/40 p-8 text-center text-sm text-slate-400">Nenhum material publicado neste workspace.</div>
            ) : reports.map((report) => {
              const client = clients.find((item) => item.id === report.clientId);
              return (
                <article key={report.id} className="rounded-2xl border border-slate-700/40 bg-slate-950/40 p-4">
                  <p className="font-mono font-bold text-cyan-400">{report.ticker}</p>
                  <h3 className="font-bold text-white">{report.title}</h3>
                  <p className="mt-1 text-sm text-slate-400">{report.summary}</p>
                  <p className="mt-2 text-xs text-primary">{client ? `Liberado para ${client.name}` : 'Apenas interno'} · {report.type}</p>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
}
