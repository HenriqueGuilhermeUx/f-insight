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
}

const STORAGE_KEY = 'f-insight-scheduled-updates';

function now() {
  return new Date().toISOString();
}

function makeId() {
  return `update_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
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
    },
  ];
}

export function getScheduledUpdates() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createDefaultScheduledUpdates();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as ScheduledUpdate[];
  } catch {
    return createDefaultScheduledUpdates();
  }
}

export function saveScheduledUpdates(items: ScheduledUpdate[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items;
}

export function addScheduledUpdate(input: Omit<ScheduledUpdate, 'id' | 'createdAt' | 'nextRunAt' | 'status'> & { status?: UpdateStatus }) {
  const items = getScheduledUpdates();
  const update: ScheduledUpdate = {
    ...input,
    id: makeId(),
    status: input.status || 'active',
    nextRunAt: nextDateForFrequency(input.frequency, input.time),
    createdAt: now(),
  };
  const next = [update, ...items];
  saveScheduledUpdates(next);
  return update;
}

export function toggleScheduledUpdate(id: string) {
  const items = getScheduledUpdates();
  const next = items.map((item) => item.id === id ? { ...item, status: item.status === 'active' ? 'paused' as UpdateStatus : 'active' as UpdateStatus } : item);
  saveScheduledUpdates(next);
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
