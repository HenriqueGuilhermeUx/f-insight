import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type AuthRole = 'admin' | 'advisor' | 'client';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: AuthRole;
  isDemo: boolean;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithPassword: (email: string, password: string) => Promise<AuthUser>;
  signUpWithPassword: (input: { email: string; password: string; fullName: string; role: AuthRole }) => Promise<AuthUser>;
  enterDemo: (role: AuthRole) => AuthUser;
  logout: () => Promise<void>;
  routeForRole: (role?: AuthRole) => string;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'f-insight-auth-user';

function normalizeRole(value: unknown): AuthRole {
  if (value === 'advisor' || value === 'client' || value === 'admin') return value;
  if (value === 'tenant_admin' || value === 'platform_admin') return 'admin';
  return 'admin';
}

function routeForRole(role: AuthRole = 'admin') {
  if (role === 'client') return '/cliente';
  if (role === 'advisor') return '/assessor';
  return '/admin';
}

function demoUser(role: AuthRole): AuthUser {
  const names: Record<AuthRole, string> = {
    admin: 'Admin Demo',
    advisor: 'Assessor Demo',
    client: 'Cliente Final Demo',
  };

  return {
    id: `demo-${role}`,
    email: `${role}@demo.com`,
    fullName: names[role],
    role,
    isDemo: true,
  };
}

function saveLocalUser(user: AuthUser | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

function readLocalUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function boot() {
      const localUser = readLocalUser();
      if (localUser && mounted) setUser(localUser);

      if (isSupabaseConfigured && supabase) {
        const { data } = await supabase.auth.getSession();
        const sessionUser = data.session?.user;
        if (sessionUser && mounted) {
          const mappedUser: AuthUser = {
            id: sessionUser.id,
            email: sessionUser.email || localUser?.email || '',
            fullName: String(sessionUser.user_metadata?.full_name || sessionUser.email || 'Usuário'),
            role: normalizeRole(sessionUser.user_metadata?.role || localUser?.role),
            isDemo: false,
          };
          setUser(mappedUser);
          saveLocalUser(mappedUser);
        }
      }

      if (mounted) setLoading(false);
    }

    void boot();

    const subscription = supabase?.auth.onAuthStateChange((_event, session) => {
      if (!session?.user) return;
      const mappedUser: AuthUser = {
        id: session.user.id,
        email: session.user.email || '',
        fullName: String(session.user.user_metadata?.full_name || session.user.email || 'Usuário'),
        role: normalizeRole(session.user.user_metadata?.role),
        isDemo: false,
      };
      setUser(mappedUser);
      saveLocalUser(mappedUser);
    });

    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isAuthenticated: Boolean(user),
    routeForRole,
    enterDemo(role) {
      const nextUser = demoUser(role);
      setUser(nextUser);
      saveLocalUser(nextUser);
      return nextUser;
    },
    async signInWithPassword(email: string, password: string) {
      if (!supabase) throw new Error('Supabase não configurado. Use o modo demo ou confira a anon key.');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.user) throw new Error('Login não retornou usuário.');
      const mappedUser: AuthUser = {
        id: data.user.id,
        email: data.user.email || email,
        fullName: String(data.user.user_metadata?.full_name || data.user.email || email),
        role: normalizeRole(data.user.user_metadata?.role),
        isDemo: false,
      };
      setUser(mappedUser);
      saveLocalUser(mappedUser);
      return mappedUser;
    },
    async signUpWithPassword(input) {
      if (!supabase) throw new Error('Supabase não configurado. Use o modo demo ou confira a anon key.');
      const { data, error } = await supabase.auth.signUp({
        email: input.email,
        password: input.password,
        options: {
          data: {
            full_name: input.fullName,
            role: input.role,
          },
        },
      });
      if (error) throw error;
      if (!data.user) throw new Error('Cadastro não retornou usuário.');

      const profileRole = input.role === 'admin' ? 'tenant_admin' : input.role;
      await supabase.from('profiles').upsert({
        auth_user_id: data.user.id,
        email: input.email,
        full_name: input.fullName,
        role: profileRole,
      }, { onConflict: 'email' });

      const mappedUser: AuthUser = {
        id: data.user.id,
        email: input.email,
        fullName: input.fullName,
        role: input.role,
        isDemo: false,
      };
      setUser(mappedUser);
      saveLocalUser(mappedUser);
      return mappedUser;
    },
    async logout() {
      saveLocalUser(null);
      setUser(null);
      if (supabase) await supabase.auth.signOut();
    },
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
