import { useState, useEffect } from 'react';
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
  ChevronRight,
  Eye,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/hooks/useStore';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

const navItems: NavItem[] = [
  { label: 'Início', href: '/', icon: Home },
  { label: 'Radar', href: '/radar', icon: Search },
  { label: 'Análises', href: '/analises', icon: BarChart3 },
  { label: 'Notícias', href: '/noticias', icon: Newspaper },
  { label: 'Watchlist', href: '/watchlist', icon: Bookmark },
  { label: 'Alertas', href: '/alertas', icon: Bell },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { theme, sidebarOpen, setSidebarOpen, watchlist } = useAppStore();

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <div className={cn(
      'min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950',
      theme === 'light' && 'bg-gradient-to-br from-slate-50 via-white to-slate-100'
    )}>
      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b border-slate-700/40">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className={cn(
                  "text-xl font-bold gradient-text",
                  theme === 'light' && "text-slate-900"
                )}>
                  F-Insight
                </h1>
                <p className="text-xs text-slate-400 -mt-0.5">Análise Inteligente</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
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

            {/* Right side actions */}
            <div className="flex items-center gap-3">
              {/* Watchlist indicator */}
              <Link
                to="/watchlist"
                className="relative p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                <Star className="w-5 h-5 text-amber-400" />
                {watchlist.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {watchlist.length}
                  </span>
                )}
              </Link>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-800/50 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Menu className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 bg-slate-950/95 backdrop-blur-lg animate-fade-in">
          <div className="flex flex-col p-4 pt-20">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg text-lg font-medium transition-all',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
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

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/50 mt-12 py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-slate-400 text-sm">
                © 2024 F-Insight. Todos os direitos reservados.
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