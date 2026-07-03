import { Link, Navigate, useLocation } from 'react-router-dom';
import { ArrowRight, Lock, LogOut, UserRound } from 'lucide-react';
import { Layout, PageLoader } from '@/components/layout/Layout';
import { AuthRole, useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: AuthRole[];
}

const roleLabels: Record<AuthRole, string> = {
  admin: 'Admin',
  advisor: 'Assessor',
  client: 'Cliente',
};

function allowedRouteForRole(role: AuthRole) {
  if (role === 'client') return '/cliente';
  if (role === 'advisor') return '/assessor';
  return '/admin';
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, loading, logout } = useAuth();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    const allowedRoute = allowedRouteForRole(user.role);

    return (
      <Layout>
        <section className="min-h-[55vh] flex items-center justify-center">
          <div className="max-w-2xl rounded-3xl border border-amber-500/20 bg-amber-500/10 p-8 text-center">
            <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Lock className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-3xl font-black text-white mb-3">Acesso restrito</h1>
            <p className="text-slate-300 leading-relaxed mb-5">
              Seu perfil atual é <strong>{roleLabels[user.role]}</strong>. Esta área aceita apenas: <strong>{roles.map((role) => roleLabels[role]).join(', ')}</strong>.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                to={allowedRoute}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
              >
                <UserRound className="w-4 h-4" />
                Ir para minha área
              </Link>
              <button
                onClick={() => void logout()}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/50 bg-slate-950/70 px-5 py-3 text-sm font-bold text-white hover:border-primary/40 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sair e trocar perfil
              </button>
              <Link
                to="/login"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/50 bg-slate-950/70 px-5 py-3 text-sm font-bold text-slate-300 hover:border-primary/40 transition-colors"
              >
                Login demo
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return <>{children}</>;
}
