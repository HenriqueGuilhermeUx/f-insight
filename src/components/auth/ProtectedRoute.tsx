import { Navigate, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';
import { Layout, PageLoader } from '@/components/layout/Layout';
import { AuthRole, useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: AuthRole[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) return <PageLoader />;

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  if (roles?.length && !roles.includes(user.role)) {
    return (
      <Layout>
        <section className="min-h-[55vh] flex items-center justify-center">
          <div className="max-w-xl rounded-3xl border border-amber-500/20 bg-amber-500/10 p-8 text-center">
            <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Lock className="w-7 h-7 text-amber-400" />
            </div>
            <h1 className="text-3xl font-black text-white mb-3">Acesso restrito</h1>
            <p className="text-slate-300 leading-relaxed">
              Seu perfil atual é <strong>{user.role}</strong>. Esta área exige outro tipo de acesso.
            </p>
          </div>
        </section>
      </Layout>
    );
  }

  return <>{children}</>;
}
