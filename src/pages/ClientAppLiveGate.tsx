import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, Loader2, RefreshCw } from 'lucide-react';
import API_ENDPOINTS from '@/config/api';
import ClientApp from '@/pages/ClientApp';

export default function ClientAppLiveGate() {
  const [checking, setChecking] = useState(true);
  const [liveAvailable, setLiveAvailable] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function checkLiveFeed() {
      try {
        const response = await fetch(API_ENDPOINTS.live.indicators, { cache: 'no-store' });
        if (!response.ok) throw new Error('market feed unavailable');
        const payload = await response.json();
        const data = Array.isArray(payload?.data) ? payload.data : [];
        const valid = data.some((item: any) => (
          typeof item?.symbol === 'string'
          && Number.isFinite(Number(item?.lastPrice))
          && Number(item?.lastPrice) > 0
        ));
        if (mounted) setLiveAvailable(valid);
      } catch {
        if (mounted) setLiveAvailable(false);
      } finally {
        if (mounted) setChecking(false);
      }
    }

    void checkLiveFeed();
    return () => { mounted = false; };
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#07111f] text-white flex items-center justify-center px-4">
        <div className="flex items-center gap-3 text-slate-300">
          <Loader2 className="h-5 w-5 animate-spin text-cyan-300" />
          Validando dados de mercado...
        </div>
      </div>
    );
  }

  if (!liveAvailable) {
    return (
      <div className="min-h-screen bg-[#07111f] text-white flex items-center justify-center px-4">
        <div className="w-full max-w-xl rounded-[2rem] border border-amber-500/20 bg-amber-500/10 p-7 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
            <AlertTriangle className="h-7 w-7 text-amber-300" />
          </div>
          <h1 className="text-3xl font-black tracking-tight">Dados de mercado indisponíveis</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            O feed ao vivo não respondeu agora. Para preservar a integridade da informação, o F-Insight não exibe cotações simuladas ou antigas como se fossem atuais.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
            <button
              onClick={() => window.location.reload()}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 text-sm font-black text-slate-950 hover:bg-cyan-300"
            >
              <RefreshCw className="h-4 w-4" />
              Tentar novamente
            </button>
            <Link
              to="/portal"
              className="inline-flex items-center justify-center rounded-xl border border-slate-700/60 bg-slate-950/60 px-5 py-3 text-sm font-bold text-slate-300"
            >
              Ir para o portal
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ClientApp />;
}
