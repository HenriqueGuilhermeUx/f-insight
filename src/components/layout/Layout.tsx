import { useState, useEffect, type ComponentType, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  TrendingUp,
  Menu,
  X,
  Users,
  Briefcase,
  Building2,
  LogIn,
  LogOut,
  CalendarDays,
  ClipboardList,
  MessageCircle,
  CreditCard,
  ShieldCheck,
  Zap,
  Globe2,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/hooks/useStore';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  roles?: Array<'admin' | 'advisor' | 'client'>;
  public?: boolean;
}

const navItems: NavItem[] = [
  { label: 'Início', href: '/', icon: Home, public: true },
  { label: 'Radar', href: '/radar', icon: TrendingUp, public: true },
  { label: 'Mercado', href: '/macro', icon: Globe2, public: true },
  { label: 'Análises', href: '/analises', icon: BarChart3, public: true },
  { label: 'Premium', href: '/premium', icon: CreditCard, public: true },
  { label: 'Assessores', href: '/assessores-escritorios', icon: Building2, public: true },
  { label: 'Área Logada', href: '/area-logada', icon: LogIn, public: true },
  { label: 'Admin', href: '/admin', icon: Building2, roles: ['admin'] },
  { label: 'Implantação', href: '/admin/onboarding', icon: ShieldCheck, roles: ['admin'] },
  { label: 'Cobrança', href: '/admin/cobranca', icon: CreditCard, roles: ['admin'] },
  { label: 'Automações', href: '/admin/automacoes', icon: Zap, roles: ['admin'] },
  { label: 'Assessor', href: '/assessor', icon: Briefcase, roles: ['admin', 'advisor'] },
  { label: 'App Cliente', href: '/app', icon: Users, roles: ['admin', 'advisor', 'client'] },
  { label: 'Comunicação', href: '/contato', icon: MessageCircle, roles: ['admin', 'advisor', 'client'] },
  { label: 'Relacionamento', href: '/admin/acompanhamentos', icon: ClipboardList, roles: ['admin', 'advisor'] },
  { label: 'Atualizações', href: '/admin/atualizacoes', icon: CalendarDays, roles: ['admin', 'advisor'] },
];

const publicBrandPaths = [
  '/',
  '/portal',
  '/radar',
  '/watchlist',
  '/noticias',
  '/analises',
  '/alertas',
  '/macro',
  '/graham-valor',
  '/screener-acoes',
  '/backtesting',
  '/premium',
  '/assessores-escritorios',
  '/area-logada',
  '/cadastro-gratis',
  '/criar-conta',
  '/precos',
  '/demo',
  '/login',
  '/termos',
  '/privacidade',
  '/politica-de-privacidade',
  '/excluir-conta',
  '/excluir-dados',
  '/aviso-educacional',
  '/onboarding',
  '/cadastro-escritorio',
];

interface LayoutProps {
  children: ReactNode;
}

function roleLabel(role: string) {
  if (role === 'client') return 'Cliente';
  if (role === 'advisor') return 'Assessor';
  return 'Admin';
}

function roleHomePath(role: string) {
  if (role === 'client') return '/cliente';
  if (role === 'advisor') return '/assessor';
  return '/admin';
}

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme } = useAppStore();
  const { tenant } = useTenant();
  const { user, logout } = useAuth();

  const isPublicBrand = publicBrandPaths.includes(location.pathname) || location.pathname.startsWith('/ativo/');
  const brandName = isPublicBrand ? 'F-Insight' : tenant.brandName || 'F-Insight';
  const showTenantLogo = !isPublicBrand && Boolean(tenant.logoDataUrl);
  const visibleNav = navItems.filter((item) => item.public || (user && item.roles?.includes(user.role)));
  const loggedAreaPath = user ? roleHomePath(user.role) : '/area-logada';

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div
      className={cn(
        'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
        theme === 'light' && 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
      )}
    >
      <header className="sticky top-0 z-50 glass border-b border-slate-700/40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between gap-4 h-16">
            <Link to="/" className="flex items-center gap-3 min-w-0 shrink-0 max-w-[55%] lg:max-w-none">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 overflow-hidden shrink-0">
                {showTenantLogo ? (
                  <img src={tenant.logoDataUrl} alt={brandName} className="w-full h-full object-contain p-1" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="hidden sm:flex items-center min-w-0">
                <h1
                  className={cn(
                    'text-lg md:text-xl font-bold gradient-text leading-tight truncate max-w-[150px] md:max-w-[220px]',
                    theme === 'light' && 'text-slate-900'
                  )}
                >
                  {brandName}
                </h1>
              </div>
            </Link>

            <nav className="hidden xl:flex items-center gap-1 overflow-x-auto max-w-[60vw]">
              {visibleNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap',
                      isActive
                        ? 'bg-primary/10 text-primary border border-primary/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              {!user && (
                <Link
                  to="/cadastro-gratis"
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-cyan-400 text-slate-950 text-sm font-black hover:bg-cyan-300 transition-colors"
                >
                  Criar conta
                </Link>
              )}

              {user ? (
                <button
                  onClick={() => void logout()}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm hover:bg-emerald-500/15 transition-colors"
                  title={user.email}
                >
                  <LogOut className="w-4 h-4" />
                  {user.isDemo ? `Demo ${roleLabel(user.role)}` : roleLabel(user.role)}
                </button>
              ) : (
                <Link
                  to="/area-logada"
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm hover:bg-emerald-500/15 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Área Logada
                </Link>
              )}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="xl:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="xl:hidden fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-lg animate-fade-in">
          <div className="flex flex-col p-4 pt-20 overflow-y-auto max-h-screen">
            {!user && (
              <Link
                to="/cadastro-gratis"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-black text-slate-950 bg-cyan-400 mb-2"
              >
                Criar conta grátis
              </Link>
            )}
            <Link
              to={loggedAreaPath}
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium text-emerald-400 bg-emerald-500/10 mb-2"
            >
              <LogIn className="w-6 h-6" />
              {user ? `Área ${roleLabel(user.role)}` : 'Área Logada'}
            </Link>
            {visibleNav.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition-all',
                    isActive ? 'bg-primary/10 text-primary' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  )}
                >
                  <Icon className="w-6 h-6" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      <main className="container mx-auto px-4 py-6">{children}</main>

      <footer className="border-t border-slate-800/50 mt-12 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center overflow-hidden">
                {showTenantLogo ? (
                  <img src={tenant.logoDataUrl} alt={brandName} className="w-full h-full object-contain p-1" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="text-slate-400 text-sm">
                © 2026 {brandName}. Inteligência financeira educativa.
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-slate-500">
              <Link to="/radar" className="hover:text-slate-300 transition-colors">Radar</Link>
              <Link to="/premium" className="hover:text-slate-300 transition-colors">Premium</Link>
              <Link to="/assessores-escritorios" className="hover:text-slate-300 transition-colors">Assessores</Link>
              <Link to="/termos" className="hover:text-slate-300 transition-colors">Termos</Link>
              <Link to="/privacidade" className="hover:text-slate-300 transition-colors">Privacidade</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        <p className="text-slate-400">Carregando...</p>
      </div>
    </div>
  );
}
