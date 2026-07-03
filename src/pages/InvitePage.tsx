import { Link, useParams } from 'react-router-dom';
import { CheckCircle2, Lock, Shield, Sparkles } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { getWorkspace } from '@/services/workspace';

export default function InvitePage() {
  const { token } = useParams();
  const workspace = getWorkspace();
  const client = workspace.clients.find((item) => item.inviteToken === token);
  const tenant = workspace.tenants.find((item) => item.id === client?.tenantId) || workspace.tenants[0];

  return (
    <Layout>
      <section className="min-h-[60vh] flex items-center justify-center">
        <div className="w-full max-w-2xl rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/90 to-slate-950 p-6 lg:p-8 text-center">
          <div className="mx-auto mb-5 w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            {client ? <CheckCircle2 className="w-8 h-8 text-emerald-400" /> : <Lock className="w-8 h-8 text-amber-400" />}
          </div>

          {client ? (
            <>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-bold text-emerald-400 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Convite válido
              </span>
              <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">
                Bem-vindo, {client.name}.
              </h1>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                {tenant?.brandName} liberou seu acesso ao portal educacional de inteligência de mercado. Você verá relatórios, conceitos e perguntas para discutir com seu assessor — sem saldos ou posições reais.
              </p>
              <Link to="/cliente" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
                Entrar no portal do cliente
              </Link>
            </>
          ) : (
            <>
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-xs font-bold text-amber-400 mb-4">
                <Shield className="w-3.5 h-3.5" />
                Convite não encontrado
              </span>
              <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Link inválido ou expirado.</h1>
              <p className="text-slate-300 text-lg leading-relaxed mb-6">Peça ao seu assessor um novo convite para acessar o portal.</p>
              <Link to="/" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950/70 px-6 py-3 text-sm font-bold text-white border border-slate-700/50 hover:border-primary/50 transition-colors">
                Voltar
              </Link>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}
