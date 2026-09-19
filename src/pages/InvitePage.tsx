import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Lock, Shield, Sparkles } from 'lucide-react';
import { Layout, PageLoader } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { getWorkspace } from '@/services/workspace';
import { acceptProfessionalInvite, getProfessionalInvite, type ProfessionalInvite } from '@/services/supabaseWorkspace';

export default function InvitePage() {
  const { token = '' } = useParams();
  const { user } = useAuth();
  const [invite, setInvite] = useState<ProfessionalInvite | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError('');
      try {
        const remote = token ? await getProfessionalInvite(token) : null;
        if (mounted && remote) {
          setInvite(remote);
          return;
        }

        const workspace = getWorkspace();
        const localClient = workspace.clients.find((item) => item.inviteToken === token);
        const localTenant = workspace.tenants.find((item) => item.id === localClient?.tenantId) || workspace.tenants[0];
        if (mounted && localClient && localTenant) {
          setInvite({
            valid: true,
            role: 'client',
            targetName: localClient.name,
            tenantName: localTenant.name,
            brandName: localTenant.brandName,
            expiresAt: new Date(Date.now() + 86_400_000).toISOString(),
            acceptedAt: null,
          });
        }
      } catch (cause) {
        if (mounted) setError(cause instanceof Error ? cause.message : 'Não foi possível consultar este convite.');
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => { mounted = false; };
  }, [token]);

  const accept = async () => {
    if (!token) return;
    setAccepting(true);
    setError('');
    try {
      const accepted = await acceptProfessionalInvite(token);
      window.location.assign(accepted.role === 'advisor' ? '/assessor' : '/cliente');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível aceitar o convite.');
      setAccepting(false);
    }
  };

  if (loading) return <PageLoader />;
  const valid = Boolean(invite?.valid && !invite.acceptedAt);

  return (
    <Layout>
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-2xl rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/90 to-slate-950 p-6 lg:p-8 text-center">
          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            {valid ? <CheckCircle2 className="w-8 h-8 text-emerald-400" /> : <Lock className="w-8 h-8 text-amber-400" />}
          </div>

          {valid && invite ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Convite válido
              </span>
              <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Bem-vindo, {invite.targetName}.</h1>
              <p className="text-slate-300 text-lg leading-relaxed mb-3">
                {invite.brandName} liberou seu acesso ao {invite.role === 'advisor' ? 'workspace profissional' : 'portal educacional'} do F-Insight.
              </p>
              <p className="text-sm text-slate-400 mb-6">Por segurança, o convite só pode ser aceito por uma conta autenticada com o mesmo e-mail para o qual ele foi emitido.</p>

              {user ? (
                <button disabled={accepting} onClick={() => void accept()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors disabled:opacity-60">
                  {accepting ? 'Ativando acesso...' : 'Aceitar convite e entrar'}
                </button>
              ) : (
                <Link to={`/login?invite=${encodeURIComponent(token)}`} className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
                  Entrar para aceitar convite
                </Link>
              )}
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 mb-4">
                <Shield className="w-3.5 h-3.5" />
                Convite indisponível
              </span>
              <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Link inválido, expirado ou já utilizado.</h1>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">Peça ao escritório ou assessor um novo convite para acessar o portal.</p>
              <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950/70 px-6 py-3 text-sm font-bold text-white border border-slate-700/50 hover:border-primary/50 transition-colors">
                Voltar
              </Link>
            </>
          )}

          {error && <p className="mt-5 rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-200">{error}</p>}
        </div>
      </section>
    </Layout>
  );
}
