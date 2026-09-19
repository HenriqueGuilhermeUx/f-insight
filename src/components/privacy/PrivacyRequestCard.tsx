import { useState } from 'react';
import { CheckCircle2, Loader2, ShieldCheck } from 'lucide-react';
import { supabase } from '@/lib/supabase';

type RequestType = 'account_delete' | 'data_delete';

export default function PrivacyRequestCard({ requestType }: { requestType: RequestType }) {
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function submit() {
    if (!supabase) {
      setError('Solicitação online indisponível. Use o e-mail abaixo.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user?.id || !user.email) {
        setError('Entre na sua conta para registrar a solicitação automaticamente. Se não conseguir entrar, use o e-mail abaixo.');
        return;
      }

      const { data, error: insertError } = await supabase
        .from('finsight_privacy_requests')
        .insert({
          user_id: user.id,
          request_email: user.email,
          request_type: requestType,
          details: details.trim() || null,
        })
        .select('id')
        .single();

      if (insertError) throw insertError;
      setRequestId(data.id);
    } catch (err: any) {
      setError(err?.message || 'Não foi possível registrar a solicitação agora.');
    } finally {
      setSubmitting(false);
    }
  }

  if (requestId) {
    return (
      <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
        <div className="mb-3 flex items-center gap-3">
          <CheckCircle2 className="h-6 w-6 text-emerald-300" />
          <h2 className="text-xl font-bold text-white">Solicitação registrada</h2>
        </div>
        <p className="text-sm leading-relaxed text-slate-300">Recebemos seu pedido e ele entrou na fila de privacidade.</p>
        <p className="mt-3 break-all font-mono text-xs text-emerald-200">Protocolo: {requestId}</p>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-6">
      <div className="mb-3 flex items-center gap-3">
        <ShieldCheck className="h-6 w-6 text-emerald-300" />
        <h2 className="text-xl font-bold text-white">Solicitar dentro da conta</h2>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-slate-300">Se você estiver logado, registre o pedido diretamente no F-Insight e receba um protocolo.</p>
      <textarea
        value={details}
        onChange={(event) => setDetails(event.target.value)}
        rows={3}
        placeholder="Observações opcionais"
        className="mb-3 w-full rounded-xl border border-slate-700/60 bg-slate-950/70 px-4 py-3 text-sm text-white outline-none focus:border-emerald-400/50"
      />
      {error && <p className="mb-3 text-sm text-amber-200">{error}</p>}
      <button
        onClick={() => void submit()}
        disabled={submitting}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-400 px-5 py-3 text-sm font-black text-slate-950 disabled:opacity-50"
      >
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
        {submitting ? 'Registrando...' : 'Registrar solicitação'}
      </button>
    </div>
  );
}
