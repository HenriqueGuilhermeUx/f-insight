import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type AuthRole = 'admin' | 'advisor' | 'client';
export type AuthPlan = 'free' | 'premium';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  role: AuthRole;
  isDemo: boolean;
  plan?: AuthPlan;
}

interface StoredAccount {
  email: string;
  password: string;
  fullName: string;
  role: AuthRole;
  plan: AuthPlan;
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
const ACCOUNTS_KEY = 'f-insight-local-accounts';
const REVIEWER_EMAIL = 'notarizex@gmail.com';
const REVIEWER_PASSWORD = 'Finsight@2026';

const seededAccounts: StoredAccount[] = [
  {
    email: REVIEWER_EMAIL,
    password: REVIEWER_PASSWORD,
    fullName: 'Revisor Google',
    role: 'client',
    plan: 'premium',
  },
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function normalizeRole(value: unknown): AuthRole {
  if (value === 'advisor' || value === 'client' || value === 'admin') return value;
  if (value === 'tenant_admin' || value === 'platform_admin') return 'admin';
  return 'client';
}

function routeForRole(role: AuthRole = 'client') {
  if (role === 'client') return '/app';
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
    plan: role === 'client' ? 'premium' : 'free',
  };
}

function userFromAccount(account: StoredAccount): AuthUser {
  return {
    id: `local-${account.email}`,
    email: account.email,
    fullName: account.fullName || account.email,
    role: account.role,
    isDemo: false,
    plan: account.plan,
  };
}

function readAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const saved = raw ? JSON.parse(raw) as StoredAccount[] : [];
    const merged = [...seededAccounts, ...saved];
    const seen = new Set<string>();
    return merged.filter((account) => {
      const key = normalizeEmail(account.email);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch {
    return seededAccounts;
  }
}

function saveAccount(account: StoredAccount) {
  const email = normalizeEmail(account.email);
  const accounts = readAccounts().filter((item) => normalizeEmail(item.email) !== email && normalizeEmail(item.email) !== REVIEWER_EMAIL);
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify([...accounts, { ...account, email }]));
}

function findAccount(email: string, password: string) {
  const normalized = normalizeEmail(email);
  return readAccounts().find((account) => normalizeEmail(account.email) === normalized && account.password === password);
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
        try {
          const { data } = await supabase.auth.getSession();
          const sessionUser = data.session?.user;
          if (sessionUser && mounted) {
            const mappedUser: AuthUser = {
              id: sessionUser.id,
              email: sessionUser.email || localUser?.email || '',
              fullName: String(sessionUser.user_metadata?.full_name || sessionUser.email || 'Usuário'),
              role: normalizeRole(sessionUser.user_metadata?.role || localUser?.role),
              isDemo: false,
              plan: localUser?.plan || 'free',
            };
            setUser(mappedUser);
            saveLocalUser(mappedUser);
          }
        } catch {
          // Mantém o acesso local para não quebrar a experiência quando o login online falhar.
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
        plan: 'free',
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
      const localAccount = findAccount(email, password);
      if (localAccount) {
        const nextUser = userFromAccount(localAccount);
        setUser(nextUser);
        saveLocalUser(nextUser);
        return nextUser;
      }

      if (supabase) {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({ email, password });
          if (error) throw error;
          if (!data.user) throw new Error('Login não retornou usuário.');
          const mappedUser: AuthUser = {
            id: data.user.id,
            email: data.user.email || email,
            fullName: String(data.user.user_metadata?.full_name || data.user.email || email),
            role: normalizeRole(data.user.user_metadata?.role),
            isDemo: false,
            plan: 'free',
          };
          setUser(mappedUser);
          saveLocalUser(mappedUser);
          return mappedUser;
        } catch {
          // Cai para a mensagem amigável abaixo.
        }
      }

      throw new Error('Não encontramos essa conta local. Crie uma conta grátis ou use o acesso de revisão informado na Play Console.');
    },
    async signUpWithPassword(input) {
      const account: StoredAccount = {
        email: normalizeEmail(input.email),
        password: input.password,
        fullName: input.fullName || input.email,
        role: input.role,
        plan: input.role === 'client' ? 'free' : 'free',
      };

      if (input.role === 'client') {
        saveAccount(account);
      }

      if (supabase) {
        try {
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
          if (data.user) {
            const profileRole = input.role === 'admin' ? 'tenant_admin' : input.role;
            await supabase.from('profiles').upsert({
              auth_user_id: data.user.id,
              email: input.email,
              full_name: input.fullName,
              role: profileRole,
            }, { onConflict: 'email' });
          }
        } catch {
          // O cadastro local continua válido mesmo quando Supabase/Netlify falhar.
        }
      }

      const nextUser = userFromAccount(account);
      setUser(nextUser);
      saveLocalUser(nextUser);
      return nextUser;
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
