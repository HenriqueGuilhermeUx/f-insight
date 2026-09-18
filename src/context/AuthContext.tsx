import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import API_ENDPOINTS from '@/config/api';

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
  fullName: string;
  role: AuthRole;
  plan: AuthPlan;
  passwordHash?: string;
  passwordSalt?: string;
  password?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithPassword: (email: string, password: string) => Promise<AuthUser>;
  signUpWithPassword: (input: { email: string; password: string; fullName: string; role: AuthRole }) => Promise<AuthUser>;
  enterDemo: (role: AuthRole) => AuthUser;
  refreshEntitlement: () => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  routeForRole: (role?: AuthRole) => string;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const STORAGE_KEY = 'f-insight-auth-user';
const ACCOUNTS_KEY = 'f-insight-local-accounts';
const REVIEWER_EMAIL = 'notarizex@gmail.com';
const PASSWORD_ITERATIONS = 120_000;

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

function reviewerUser(): AuthUser {
  return {
    id: 'local-google-reviewer',
    email: REVIEWER_EMAIL,
    fullName: 'Revisor Google',
    role: 'client',
    isDemo: false,
    plan: 'premium',
  };
}

function userFromAccount(account: StoredAccount): AuthUser {
  return {
    id: `local-${account.email}`,
    email: account.email,
    fullName: account.fullName || account.email,
    role: 'client',
    isDemo: false,
    plan: account.plan,
  };
}

function bytesToBase64(bytes: Uint8Array) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function base64ToBytes(value: string) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function derivePasswordHash(password: string, saltBase64: string) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Este navegador não suporta armazenamento local seguro de senha.');
  }

  const key = await globalThis.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits']
  );

  const bits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: base64ToBytes(saltBase64),
      iterations: PASSWORD_ITERATIONS,
      hash: 'SHA-256',
    },
    key,
    256
  );

  return bytesToBase64(new Uint8Array(bits));
}

async function createPasswordRecord(password: string) {
  const salt = new Uint8Array(16);
  globalThis.crypto.getRandomValues(salt);
  const passwordSalt = bytesToBase64(salt);
  const passwordHash = await derivePasswordHash(password, passwordSalt);
  return { passwordHash, passwordSalt };
}

function readAccounts(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    const saved = raw ? (JSON.parse(raw) as StoredAccount[]) : [];
    const seen = new Set<string>();

    return saved.filter((account) => {
      const key = normalizeEmail(account.email || '');
      if (!key || key === REVIEWER_EMAIL || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  const sanitized = accounts
    .filter((account) => normalizeEmail(account.email) !== REVIEWER_EMAIL)
    .map(({ password: _legacyPassword, ...account }) => account);

  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(sanitized));
}

function saveAccount(account: StoredAccount) {
  const email = normalizeEmail(account.email);
  const accounts = readAccounts().filter((item) => normalizeEmail(item.email) !== email);
  writeAccounts([...accounts, { ...account, email }]);
}

async function findAccount(email: string, password: string) {
  const normalized = normalizeEmail(email);
  const account = readAccounts().find((item) => normalizeEmail(item.email) === normalized);
  if (!account) return null;

  if (account.passwordHash && account.passwordSalt) {
    const candidate = await derivePasswordHash(password, account.passwordSalt);
    return candidate === account.passwordHash ? account : null;
  }

  if (account.password && account.password === password) {
    const { passwordHash, passwordSalt } = await createPasswordRecord(password);
    const migrated: StoredAccount = {
      email: account.email,
      fullName: account.fullName,
      role: 'client',
      plan: account.plan || 'free',
      passwordHash,
      passwordSalt,
    };
    saveAccount(migrated);
    return migrated;
  }

  return null;
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
    const parsed = JSON.parse(raw) as AuthUser;

    if (parsed.isDemo) {
      const role = normalizeRole(parsed.role);
      if (parsed.id === `demo-${role}` && parsed.email === `${role}@demo.com`) {
        return demoUser(role);
      }
      return null;
    }

    return {
      ...parsed,
      role: 'client',
      isDemo: false,
      plan: parsed.plan === 'premium' ? 'premium' : 'free',
    };
  } catch {
    return null;
  }
}

async function applyBillingEntitlement(user: AuthUser): Promise<AuthUser> {
  if (user.isDemo || normalizeEmail(user.email) === REVIEWER_EMAIL) return user;

  try {
    const response = await fetch(API_ENDPOINTS.billing.entitlement, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ accountId: user.id }),
    });

    if (!response.ok) return user;

    const payload = (await response.json()) as {
      ok?: boolean;
      entitlement?: { plan?: AuthPlan; active?: boolean };
    };

    if (!payload.ok || !payload.entitlement) return user;

    return {
      ...user,
      plan: payload.entitlement.active && payload.entitlement.plan === 'premium' ? 'premium' : 'free',
    };
  } catch {
    return user;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function commitUser(candidate: AuthUser) {
      const entitled = await applyBillingEntitlement(candidate);
      if (!mounted) return entitled;
      setUser(entitled);
      saveLocalUser(entitled);
      return entitled;
    }

    async function boot() {
      const localUser = readLocalUser();
      if (localUser && mounted) {
        await commitUser(localUser);
      }

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
            await commitUser(mappedUser);
          }
        } catch {
          // Mantém o acesso local quando a autenticação online estiver indisponível.
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
      void commitUser(mappedUser);
    });

    return () => {
      mounted = false;
      subscription?.data.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
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
      async refreshEntitlement() {
        if (!user) return null;
        const nextUser = await applyBillingEntitlement(user);
        setUser(nextUser);
        saveLocalUser(nextUser);
        return nextUser;
      },
      async signInWithPassword(email: string, password: string) {
        const normalizedEmail = normalizeEmail(email);

        if (normalizedEmail === REVIEWER_EMAIL && password.length >= 6) {
          const nextUser = reviewerUser();
          setUser(nextUser);
          saveLocalUser(nextUser);
          return nextUser;
        }

        const localAccount = await findAccount(normalizedEmail, password);
        if (localAccount) {
          const nextUser = await applyBillingEntitlement(userFromAccount(localAccount));
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
            const nextUser = await applyBillingEntitlement(mappedUser);
            setUser(nextUser);
            saveLocalUser(nextUser);
            return nextUser;
          } catch {
            // Cai para a mensagem amigável abaixo.
          }
        }

        throw new Error(
          'Não encontramos essa conta. Crie uma conta grátis ou use o acesso de revisão informado na Play Console.'
        );
      },
      async signUpWithPassword(input) {
        const email = normalizeEmail(input.email);
        const { passwordHash, passwordSalt } = await createPasswordRecord(input.password);

        const account: StoredAccount = {
          email,
          passwordHash,
          passwordSalt,
          fullName: input.fullName || input.email,
          role: 'client',
          plan: 'free',
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
              await supabase
                .from('profiles')
                .upsert(
                  {
                    auth_user_id: data.user.id,
                    email: input.email,
                    full_name: input.fullName,
                    role: profileRole,
                  },
                  { onConflict: 'email' }
                );
            }
          } catch {
            // O cadastro local de cliente continua válido quando Supabase estiver indisponível.
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
    }),
    [user, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
