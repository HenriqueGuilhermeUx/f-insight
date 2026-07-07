import { useState, useEffect, type ComponentType, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  TrendingUp,
  Bell,
  Bookmark,
  Newspaper,
  BarChart3,
  Settings,
  Menu,
  X,
  Activity,
  Star,
  Users,
  Briefcase,
  Building2,
  LogIn,
  LogOut,
  Bot,
  CalendarDays,
  ClipboardList,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/hooks/useStore';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Início', href: '/', icon: Home },
  { label: 'Admin', href: '/admin', icon: Building2 },
  { label: 'Assessor', href: '/assessor', icon: Briefcase },
  { label: 'Cliente', href: '/cliente', icon: Users },
  { label: 'IA', href: '/ia-financeira', icon: Bot },
  { label: 'Insights', href: '/insights', icon: Sparkles },
  { label: 'Contato', href: '/contato', icon: MessageCircle },
  { label: 'Atualizações', href: '/admin/atualizacoes', icon: CalendarDays },
  { label: 'Acompanhamentos', href: '/admin/acompanhamentos', icon: ClipboardList },
  { label: 'Macro', href: '/macro', icon: Activity },
  { label: 'Radar', href: '/radar', icon: Search },
  { label: 'Análises', href: '/analises', icon: BarChart3 },
  { label: 'Notícias', href: '/noticias', icon: Newspaper },
  { label: 'Watchlist', href: '/watchlist', icon: Bookmark },
  { label: 'Alertas', href: '/alertas', icon: Bell },
  { label: 'Marca', href: '/white-label', icon: Settings },
];

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, watchlist } = useAppStore();
  const { tenant } = useTenant();
  const { user, logout } = useAuth();

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
                {tenant.logoDataUrl ? (
                  <img src={tenant.logoDataUrl} alt={tenant.brandName} className="w-full h-full object-contain p-1" />
                ) : (
                  <TrendingUp className="w-5 h-5 text-white" />
                )}
              </div>
              <div className="hidden sm:flex items-center min-w-0">
                <h1
                  className={cn(
                    'text-lg md:text-xl font-bold gradient-text leading-tight truncate max-w-[140px] md:max-w-[180px] xl:max-w-[240px]',
                    theme === 'light' && 'text-slate-900'
                  )}
                >
                  {tenant.brandName || 'F-Insight'}
                </h1>
              </div>
            </Link>

            <nav className="hidden 2xl:flex items-center gap-1 overflow-x-auto max-w-[58vw]">
              {navItems.map((item) => {
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
                    {item.badge && (
                      <span className="ml-1 px-1.5 py-0.5 text-xs bg-red-500 text-white rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                to="/admin"
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200 border border-slate-700/50 text-sm hover:border-primary/40 transition-colors"
              >
                <Building2 className="w-4 h-4" />
                Admin
              </Link>
              <Link
                to="/assessor"
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-800/60 text-slate-200 border border-slate-700/50 text-sm hover:border-primary/40 transition-colors"
              >
                <Briefcase className="w-4 h-4" />
                Assessor
              </Link>
              <Link
                to="/ia-financeira"
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm hover:bg-primary/15 transition-colors"
              >
                <Bot className="w-4 h-4" />
                IA
              </Link>
              <Link
                to="/cliente"
                className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 text-primary border border-primary/20 text-sm hover:bg-primary/15 transition-colors"
              >
                <Users className="w-4 h-4" />
                Cliente
              </Link>

              {user ? (
                <button
                  onClick={() => void logout()}
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm hover:bg-emerald-500/15 transition-colors"
                  title={user.email}
                >
                  <LogOut className="w-4 h-4" />
                  {user.isDemo ? 'Demo' : user.role}
                </button>
              ) : (
                <Link
                  to="/login"
                  className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-sm hover:bg-emerald-500/15 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Login
                </Link>
              )}

              <Link to="/watchlist" className="relative p-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                <Star className="w-5 h-5 text-amber-400" />
                {watchlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {watchlist.length}
                  </span>
                )}
              </Link>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="2xl:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div className="2xl:hidden fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-lg animate-fade-in">
          <div className="flex flex-col p-4 pt-20 overflow-y-auto max-h-screen">
            <Link
              to="/login"
              className="flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium text-emerald-400 bg-emerald-500/10 mb-2"
            >
              <LogIn className="w-6 h-6" />
              {user ? `Sessão: ${user.role}` : 'Login'}
            </Link>
            {navItems.map((item) => {
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
                {tenant.logoDataUrl ? (
                  <img src={tenant.logoDataUrl} alt={tenant.brandName} className="w-full h-full object-contain p-1" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-white" />
                )}
              </div>
              <span className="text-slate-400 text-sm">
                © 2026 {tenant.brandName}. Powered by F-Insight White Label.
              </span>
            </div>
            <div className="flex items-center gap-6 text-sm text-slate-500">
              <Link to="/privacidade" className="hover:text-slate-300 transition-colors">
                Privacidade
              </Link>
              <Link to="/termos" className="hover:text-slate-300 transition-colors">
                Termos
              </Link>
              <Link to="/contato" className="hover:text-slate-300 transition-colors">
                Contato
              </Link>
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
