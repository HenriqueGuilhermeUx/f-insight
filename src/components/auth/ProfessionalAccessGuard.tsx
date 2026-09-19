import { useEffect, useState, type ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { CreditCard, Loader2, LockKeyhole, ShieldCheck } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import API_ENDPOINTS from '@/config/api';

type OfficePlan = 'trial' | 'basic' | 'pro' | 'premium' | null;

interface OfficeEntitlement {
  active: boolean;
  status: string;
  plan: OfficePlan;
  expiresAt?: string | null;
  trialEndsAt?: string | null;
}

export default function ProfessionalAccessGuard({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [office, setOffice] = useState<OfficeEntitlement | null>(null);
  const [hasTenant, setHasTenant] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!user || user.isDemo || !supabase) {
        if (mounted) setLoading(false);
        return;
      }

      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;
        const tenantId = String(session?.user?.app_metadata?.tenant_id || '').trim();
        const accessToken = session?.access_token;

        if (!tenantId || !accessToken) {
          if (mounted) {
            setHasTenant(false);
            setLoading(false);
          }
          return;
        }

        if (mounted) setHasTenant(true);
        const response = await fetch(API_ENDPOINTS.billing.entitlement, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          if (mounted) setLoading(false);
          return;
        }

        const payload = await response.json();
        if (mounted) {
          setOffice(payload?.entitlement?.office || null);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    }

    void load();
    return () => { mounted = false; };
  }, [user?.id, user?.isDemo]);

  if (loading) {
    return (
      <Layout>
        <section className="min-h-[45vh] flex items-center justify-center">
          <div className="flex items-center gap-3 text-slate-300">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            Validando acesso do escritório...
          </div>
        </section>
      </Layout>
    );
  }

  if (user?.isDemo) return <>{children}</>;

  if (!hasTenant) {
    return <Navigate to={user?.role === 'client' ? '/app' : '/cadastro-escritorio'} replace />;
  }

  // Falha temporária do endpoint de entitlement não derruba o workspace.
  if (!office || office.active) return <>{children}</>;

  const expiresAt = office.expiresAt
    ? new Date(office.expiresAt).toLocaleDateString('pt-BR')
    : null;
  const isAdmin = user?.role === 'admin';

  return (
    <Layout>
      <section className="min-h-[55vh] flex items-center justify-center">
        <div className="max-w-2xl rounded-3xl border border-amber-500/20 bg-amber-500/10 p-8 text-center">
          <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <LockKeyhole className="w-7 h-7 text-amber-300" />
          </div>
          <h1 className="text-3xl font-black text-white mb-3">Assinatura do escritório necessária</h1>
          <p className="text-slate-300 leading-relaxed mb-3">
            O período de acesso do workspace Professional terminou{expiresAt ? ` em ${expiresAt}` : ''}.
            {isAdmin
              ? ' Gere ou renove a cobrança Pix para reativar o portal, relacionamento e ferramentas do escritório.'
              : ' Peça ao administrador do escritório para renovar o plano.'}
          </p>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-950/50 px-3 py-1.5 text-xs font-bold text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
            Seus dados permanecem preservados durante a suspensão.
          </div>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {isAdmin && (
              <Link to="/admin/cobranca" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-black text-white hover:bg-primary/90">
                <CreditCard className="w-4 h-4" />
                Renovar com Pix
              </Link>
            )}
            <Link to="/" className="inline-flex items-center justify-center rounded-xl border border-slate-700/60 bg-slate-950/60 px-5 py-3 text-sm font-bold text-slate-300">
              Voltar ao início
            </Link>
          </div>
        </div>
      </section>
    </Layout>
  );
}
