import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getWorkspaceStats } from '@/services/workspace';

export type UpdateFrequency = 'daily' | 'weekly' | 'monthly' | 'event_driven';
export type UpdateChannel = 'portal' | 'email' | 'whatsapp' | 'crm';
export type UpdateStatus = 'active' | 'paused';
export type UpdateKind = 'macro' | 'news' | 'content' | 'report' | 'meeting' | 'risk';

export interface ScheduledUpdate {
  id: string;
  title: string;
  kind: UpdateKind;
  audience: 'all_clients' | 'client_segment' | 'specific_client' | 'advisors';
  channel: UpdateChannel;
  frequency: UpdateFrequency;
  dayOfWeek?: string;
  time?: string;
  status: UpdateStatus;
  lastRunAt?: string;
  nextRunAt: string;
  description: string;
  createdAt: string;
  source?: 'local' | 'supabase';
  synced?: boolean;
}

const STORAGE_KEY = 'f-insight-scheduled-updates';

function now() {
  return new Date().toISOString();
}

function makeId() {
  return `update_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function isUuid(value?: string | null) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function currentTenantId() {
  try {
    const tenantId = getWorkspaceStats().tenant?.id;
    return isUuid(tenantId) ? tenantId : null;
  } catch {
    return null;
  }
}

function nextDateForFrequency(frequency: UpdateFrequency, time = '08:00') {
  const date = new Date();
  const [hour, minute] = time.split(':').map(Number);
  date.setHours(hour || 8, minute || 0, 0, 0);

  if (date.getTime() <= Date.now()) date.setDate(date.getDate() + 1);
  if (frequency === 'weekly') date.setDate(date.getDate() + 7);
  if (frequency === 'monthly') date.setMonth(date.getMonth() + 1);
  if (frequency === 'event_driven') date.setDate(date.getDate() + 2);

  return date.toISOString();
}

export function createDefaultScheduledUpdates(): ScheduledUpdate[] {
  return [
    {
      id: 'update_demo_macro_weekly',
      title: 'Resumo macro semanal',
      kind: 'macro',
      audience: 'all_clients',
      channel: 'portal',
      frequency: 'weekly',
      dayOfWeek: 'segunda',
      time: '08:00',
      status: 'active',
      nextRunAt: nextDateForFrequency('weekly', '08:00'),
      description: 'Gera rascunho com juros, inflação, dólar, bolsa e perguntas para reunião.',
      createdAt: now(),
      source: 'local',
    },
    {
      id: 'update_demo_news_daily',
      title: 'Radar de notícias para assessores',
      kind: 'news',
      audience: 'advisors',
      channel: 'portal',
      frequency: 'daily',
      time: '09:00',
      status: 'active',
      nextRunAt: nextDateForFrequency('daily', '09:00'),
      description: 'Resume notícias relevantes e sugere quais podem virar conteúdo ou pauta comercial.',
      createdAt: now(),
      source: 'local',
    },
    {
      id: 'update_demo_risk_monthly',
      title: 'Checklist mensal de risco',
      kind: 'risk',
      audience: 'all_clients',
      channel: 'portal',
      frequency: 'monthly',
      time: '10:00',
      status: 'paused',
      nextRunAt: nextDateForFrequency('monthly', '10:00'),
      description: 'Publica lembrete educativo sobre concentração, liquidez, prazo e volatilidade.',
      createdAt: now(),
      source: 'local',
    },
  ];
}

function readLocalUpdates(): ScheduledUpdate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as ScheduledUpdate[];
  } catch {
    return [];
  }
}

export function getScheduledUpdates() {
  const saved = readLocalUpdates();
  if (saved.length > 0) return saved;

  if (currentTenantId()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  const seeded = createDefaultScheduledUpdates();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

export function saveScheduledUpdates(items: ScheduledUpdate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items;
}

function mapRemote(row: any): ScheduledUpdate {
  return {
    id: String(row.id),
    title: row.title,
    kind: row.kind,
    audience: row.audience,
    channel: row.channel,
    frequency: row.frequency,
    dayOfWeek: row.day_of_week || undefined,
    time: row.run_time || undefined,
    status: row.status,
    lastRunAt: row.last_run_at || undefined,
    nextRunAt: row.next_run_at,
    description: row.description || '',
    createdAt: row.created_at,
    source: 'supabase',
    synced: true,
  };
}

async function syncScheduledUpdateToSupabase(update: ScheduledUpdate, tenantId: string) {
  if (!isSupabaseConfigured || !supabase || !isUuid(tenantId)) return null;

  const { data, error } = await supabase
    .from('scheduled_updates')
    .insert({
      tenant_id: tenantId,
      title: update.title,
      kind: update.kind,
      audience: update.audience,
      channel: update.channel,
      frequency: update.frequency,
      day_of_week: update.dayOfWeek || null,
      run_time: update.time || null,
      status: update.status,
      last_run_at: update.lastRunAt || null,
      next_run_at: update.nextRunAt,
      description: update.description,
      created_at: update.createdAt,
    })
    .select('id')
    .single();

  if (error || !data?.id) return null;

  const next = readLocalUpdates().map((item) => (
    item.id === update.id
      ? { ...item, id: data.id, source: 'supabase' as const, synced: true }
      : item
  ));
  saveScheduledUpdates(next);
  return data.id as string;
}

export async function loadScheduledUpdatesFromSupabase() {
  const local = getScheduledUpdates();
  const tenantId = currentTenantId();
  if (!tenantId || !isSupabaseConfigured || !supabase) return local;

  const { data, error } = await supabase
    .from('scheduled_updates')
    .select('id,title,kind,audience,channel,frequency,day_of_week,run_time,status,last_run_at,next_run_at,description,created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (error || !Array.isArray(data)) return local;

  const remote = data.map(mapRemote);
  const unsynced = local.filter((item) => !isUuid(item.id) && !item.id.startsWith('update_demo_'));
  const merged = [...remote, ...unsynced]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  saveScheduledUpdates(merged);
  for (const item of unsynced) void syncScheduledUpdateToSupabase(item, tenantId);
  return merged;
}

export function addScheduledUpdate(input: Omit<ScheduledUpdate, 'id' | 'createdAt' | 'nextRunAt' | 'status'> & { status?: UpdateStatus }) {
  const items = getScheduledUpdates();
  const update: ScheduledUpdate = {
    ...input,
    id: makeId(),
    status: input.status || 'active',
    nextRunAt: nextDateForFrequency(input.frequency, input.time),
    createdAt: now(),
    source: 'local',
    synced: false,
  };
  const next = [update, ...items];
  saveScheduledUpdates(next);

  const tenantId = currentTenantId();
  if (tenantId) void syncScheduledUpdateToSupabase(update, tenantId);
  return update;
}

export function toggleScheduledUpdate(id: string) {
  const items = getScheduledUpdates();
  const next = items.map((item) => item.id === id
    ? { ...item, status: item.status === 'active' ? 'paused' as UpdateStatus : 'active' as UpdateStatus }
    : item);
  saveScheduledUpdates(next);

  const changed = next.find((item) => item.id === id);
  if (changed && isUuid(id) && isSupabaseConfigured && supabase) {
    void supabase
      .from('scheduled_updates')
      .update({ status: changed.status, updated_at: now() })
      .eq('id', id);
  }

  return next;
}

export function getScheduledUpdateStats() {
  const items = getScheduledUpdates();
  return {
    total: items.length,
    active: items.filter((item) => item.status === 'active').length,
    paused: items.filter((item) => item.status === 'paused').length,
    portal: items.filter((item) => item.channel === 'portal').length,
  };
}
