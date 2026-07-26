import { supabase, isSupabaseConfigured } from '@/lib/supabase';

export type PublicPortalProfile = 'investidor' | 'assessor' | 'escritorio' | 'estudante' | 'curioso';

export interface PublicPortalLead {
  email: string;
  name?: string;
  profile: PublicPortalProfile;
  interests: string[];
  source: string;
  createdAt: string;
}

export interface RegisterPublicPortalInput {
  email: string;
  name?: string;
  profile?: PublicPortalProfile;
  interests?: string[];
}

const STORAGE_KEY = 'f-insight-public-portal-lead';

function cleanEmail(email: string) {
  return email.trim().toLowerCase();
}

export function getSavedPublicPortalLead(): PublicPortalLead | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function registerPublicPortalLead(input: RegisterPublicPortalInput) {
  const lead: PublicPortalLead = {
    email: cleanEmail(input.email),
    name: input.name?.trim() || undefined,
    profile: input.profile || 'investidor',
    interests: input.interests?.length ? input.interests : ['mercado', 'educacao', 'relatorios'],
    source: 'public_portal',
    createdAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(lead));

  if (!isSupabaseConfigured || !supabase) {
    return { persisted: false, lead, error: 'Supabase não configurado' };
  }

  const { error } = await supabase
    .from('public_portal_leads')
    .upsert({
      email: lead.email,
      name: lead.name || null,
      profile: lead.profile,
      interests: lead.interests,
      source: lead.source,
      last_seen_at: lead.createdAt,
    }, { onConflict: 'email' });

  return { persisted: !error, lead, error: error?.message };
}
