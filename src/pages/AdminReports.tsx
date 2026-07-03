import { FormEvent, useMemo, useState } from 'react';
import { Download, FileText, Plus, Send, Sparkles } from 'lucide-react';
import API_ENDPOINTS from '@/config/api';
import { Layout } from '@/components/layout/Layout';
import { getWorkspace, getWorkspaceStats, publishReport, WorkspaceReport } from '@/services/workspace';
import { useTenant } from '@/context/TenantContext';

export default function AdminReports() {
  const { buildReportParams } = useTenant();
  const initialStats = getWorkspaceStats();
  const [reports, setReports] = useState(initialStats.reports);
  const clients = useMemo(() => initialStats.clients, []);
  const [form, setForm] = useState({
    ticker: 'PETR4',
    title: 'Como ler um relatório de valuation',
    summary: 'Material orientativo para explicar preço, valor intrínseco e margem de segurança.',
    type: 'valuation' as WorkspaceReport['type'],
    clientId: clients[0]?.id || '',
  });

  const update = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }));

  const openPdf = (ticker: string) => {
    const params = buildReportParams();
    const normalizedTicker = ticker === 'MACRO' ? 'PETR4' : ticker;
    const url = `${API_ENDPOINTS.reports.valuation(normalizedTicker)}?${params.toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const workspace = getWorkspace();
    const report = publishReport({
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
  };

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-slate-700/40 bg-slate-800/40 p-6 lg:p-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
          <FileText className="w-3.5 h-3.5" />
          Publicação de relatórios
        </span>
        <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Publique materiais para clientes finais.</h1>
        <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">Gere relatórios white-label e libere conteúdos orientativos por cliente, sem mostrar saldos, custódia ou carteira real.</p>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[440px_1fr] gap-6">
        <form onSubmit={submit} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6 h-fit">
          <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-5">
            <Sparkles className="w-5 h-5 text-primary" />
            Novo material
          </h2>
          <div className="space-y-4">
            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Ticker / Tema</span>
              <input value={form.ticker} onChange={(e) => update('ticker', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white font-mono outline-none focus:border-primary/50" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Título</span>
              <input value={form.title} onChange={(e) => update('title', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Resumo para o cliente</span>
              <textarea value={form.summary} onChange={(e) => update('summary', e.target.value)} rows={4} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>
            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Tipo</span>
              <select value={form.type} onChange={(e) => update('type', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                <option value="valuation">Valuation</option>
                <option value="macro">Macro</option>
                <option value="educacional">Educacional</option>
                <option value="reuniao">Pauta de reunião</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-slate-400 mb-2 block">Liberar para cliente</span>
              <select value={form.clientId} onChange={(e) => update('clientId', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50">
                <option value="">Apenas interno</option>
                {clients.map((client) => <option key={client.id} value={client.id}>{client.name}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button type="button" onClick={() => openPdf(form.ticker)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/50 bg-slate-950/70 px-5 py-3 text-sm font-bold text-slate-200 hover:border-primary/40 transition-colors">
                <Download className="w-4 h-4" />
                Ver PDF
              </button>
              <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                Publicar
              </button>
            </div>
          </div>
        </form>

        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-xl font-bold text-white mb-5">Materiais publicados</h2>
          <div className="space-y-3">
            {reports.map((report) => {
              const client = clients.find((item) => item.id === report.clientId);
              return (
                <div key={report.id} className="rounded-2xl border border-slate-700/40 bg-slate-950/40 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div>
                    <p className="font-mono font-bold text-cyan-400">{report.ticker}</p>
                    <h3 className="font-bold text-white">{report.title}</h3>
                    <p className="text-sm text-slate-400 mt-1">{report.summary}</p>
                    <p className="text-xs text-primary mt-2">{client ? `Liberado para ${client.name}` : 'Apenas interno'} · {report.type}</p>
                  </div>
                  <button onClick={() => openPdf(report.ticker)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary border border-primary/20 hover:bg-primary/15 transition-colors">
                    <Send className="w-4 h-4" />
                    Abrir
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </Layout>
  );
}
