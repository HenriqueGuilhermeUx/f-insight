import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Copy, CreditCard, ExternalLink, Loader2, QrCode, ShieldCheck, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import API_ENDPOINTS from '@/config/api';
import { getWorkspaceStats } from '@/services/workspace';

type PlanId = 'basic' | 'pro' | 'premium';

interface BillingPlan {
  id: PlanId;
  name: string;
  priceCents: number;
  description: string;
}

interface Invoice {
  planId: PlanId;
  planName: string;
  amountCents: number;
  status: string;
  correlationId: string;
  paymentLinkUrl?: string;
  brCode?: string;
  qrCodeImage?: string;
}

const fallbackPlans: BillingPlan[] = [
  { id: 'basic', name: 'F-Insight Basic', priceCents: 49700, description: 'Portal white-label, relatórios e cliente final.' },
  { id: 'pro', name: 'F-Insight Pro', priceCents: 99700, description: 'Basic + conteúdo semanal e calendário editorial.' },
  { id: 'premium', name: 'F-Insight Premium', priceCents: 199700, description: 'Pro + ferramentas Graham, radar premium, PDF e automações.' },
];

const planHighlights: Record<PlanId, string[]> = {
  basic: ['Portal do cliente', 'Relatórios white-label', 'Comunicação registrada'],
  pro: ['Tudo do Basic', 'Conteúdo semanal', 'Calendário editorial'],
  premium: ['Tudo do Pro', 'Radar premium', 'Automações e PDFs avançados'],
};

function formatMoney(cents: number) {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function Billing() {
  const stats = getWorkspaceStats();
  const [plans, setPlans] = useState<BillingPlan[]>(fallbackPlans);
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('pro');
  const [customerName, setCustomerName] = useState(stats.tenant?.brandName || 'Escritório Demo');
  const [customerEmail, setCustomerEmail] = useState('financeiro@escritorio.com.br');
  const [customerTaxId, setCustomerTaxId] = useState('');
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    fetch(API_ENDPOINTS.billing.plans)
      .then((response) => response.ok ? response.json() : null)
      .then((payload) => {
        if (payload?.plans?.length) setPlans(payload.plans);
        setDemoMode(Boolean(payload && !payload.wooviConfigured));
      })
      .catch(() => setPlans(fallbackPlans));
  }, []);

  const activePlan = useMemo(() => plans.find((plan) => plan.id === selectedPlan) || plans[1] || fallbackPlans[1], [plans, selectedPlan]);

  async function createCharge() {
    setLoading(true);
    setInvoice(null);
    try {
      const response = await fetch(API_ENDPOINTS.billing.checkout, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId: stats.tenant?.id,
          planId: selectedPlan,
          customerName,
          customerEmail,
          customerTaxId: customerTaxId || undefined,
        }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload?.message || 'Falha ao gerar cobrança');
      setDemoMode(Boolean(payload.demoMode));
      setInvoice(payload.invoice);
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Falha ao gerar cobrança');
    } finally {
      setLoading(false);
    }
  }

  async function copyPixCode() {
    if (!invoice?.brCode) return;
    await navigator.clipboard.writeText(invoice.brCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <CreditCard className="w-3.5 h-3.5" />
              Cobrança Pix
            </span>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Assinatura do escritório.</h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              Gere uma cobrança Pix para ativar ou renovar o F-Insight white-label do escritório. O fluxo usa Woovi quando a chave estiver configurada.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 min-w-[280px]">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Cobrança B2B</h3>
            <p className="text-sm text-slate-300 leading-relaxed">O cliente final não paga aqui. A cobrança é do escritório que usa a plataforma.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6">
        <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Escolha o plano</h2>
          <p className="text-slate-400 mb-5">Valores podem ser ajustados por variável de ambiente no backend.</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {plans.map((plan) => (
              <button
                key={plan.id}
                onClick={() => setSelectedPlan(plan.id)}
                className={`rounded-2xl border p-5 text-left transition-all ${selectedPlan === plan.id ? 'border-primary/60 bg-primary/10' : 'border-slate-700/40 bg-slate-950/40 hover:border-primary/30'}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-white">{plan.name.replace('F-Insight ', '')}</h3>
                  {selectedPlan === plan.id && <CheckCircle2 className="w-5 h-5 text-primary" />}
                </div>
                <p className="text-3xl font-black text-white mb-2">{formatMoney(plan.priceCents)}</p>
                <p className="text-xs text-slate-500 mb-4">por mês</p>
                <p className="text-sm text-slate-300 leading-relaxed mb-4">{plan.description}</p>
                <div className="space-y-2">
                  {(planHighlights[plan.id] || []).map((item) => (
                    <p key={item} className="text-xs text-slate-400 flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-primary" />
                      {item}
                    </p>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="block">
              <span className="block text-sm font-semibold text-slate-300 mb-2">Nome do escritório</span>
              <input value={customerName} onChange={(event) => setCustomerName(event.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-slate-300 mb-2">E-mail financeiro</span>
              <input value={customerEmail} onChange={(event) => setCustomerEmail(event.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
            </label>
            <label className="block md:col-span-2">
              <span className="block text-sm font-semibold text-slate-300 mb-2">CNPJ/CPF do pagador</span>
              <input value={customerTaxId} onChange={(event) => setCustomerTaxId(event.target.value)} placeholder="Opcional no MVP" className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white placeholder:text-slate-500 outline-none focus:border-primary/50" />
            </label>
          </div>

          <button
            onClick={createCharge}
            disabled={loading || !customerName.trim() || !customerEmail.trim()}
            className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <QrCode className="w-4 h-4" />}
            {loading ? 'Gerando cobrança...' : `Gerar Pix de ${formatMoney(activePlan.priceCents)}`}
          </button>
        </div>

        <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Pagamento</h2>
          <p className="text-slate-400 mb-5">Envie o link ou copie o Pix para o escritório pagar.</p>

          {!invoice ? (
            <div className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-8 text-center">
              <QrCode className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="font-bold text-white">Nenhuma cobrança gerada ainda.</p>
              <p className="text-sm text-slate-500 mt-1">Escolha o plano e gere o Pix.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {demoMode && (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100/80">
                  Modo demonstração ativo. Configure a chave Woovi no Render para gerar cobrança real.
                </div>
              )}

              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5">
                <p className="text-sm text-slate-300">{invoice.planName}</p>
                <p className="text-4xl font-black text-white mt-1">{formatMoney(invoice.amountCents)}</p>
                <p className="text-xs text-slate-400 mt-2">Status: {invoice.status}</p>
              </div>

              {invoice.qrCodeImage && (
                <div className="rounded-2xl border border-slate-700/40 bg-white p-4">
                  <img src={invoice.qrCodeImage} alt="QR Code Pix" className="w-full max-w-[260px] mx-auto" />
                </div>
              )}

              {invoice.brCode && (
                <div className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4">
                  <p className="text-xs text-slate-500 mb-2">Pix copia e cola</p>
                  <p className="text-xs text-slate-300 break-all leading-relaxed max-h-24 overflow-y-auto">{invoice.brCode}</p>
                  <button onClick={copyPixCode} className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900 px-4 py-2.5 text-sm font-bold text-white hover:border-primary/50 transition-colors">
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copiado' : 'Copiar Pix'}
                  </button>
                </div>
              )}

              {invoice.paymentLinkUrl && (
                <a href={invoice.paymentLinkUrl} target="_blank" rel="noreferrer" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
                  <ExternalLink className="w-4 h-4" />
                  Abrir link de pagamento
                </a>
              )}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
