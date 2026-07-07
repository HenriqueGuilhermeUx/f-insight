import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { getWorkspaceStats } from '@/services/workspace';
import { getScheduledUpdates } from '@/services/updateScheduler';

export type FollowUpPriority = 'alta' | 'media' | 'baixa';
export type FollowUpStatus = 'open' | 'done';
export type FollowUpReason = 'report' | 'macro' | 'content' | 'risk' | 'meeting' | 'news';

export interface FollowUpTask {
  id: string;
  tenantId?: string;
  advisorId?: string;
  clientId?: string;
  clientName: string;
  clientProfile: string;
  title: string;
  reason: FollowUpReason;
  priority: FollowUpPriority;
  suggestedAction: string;
  script: string;
  status: FollowUpStatus;
  dueAt: string;
  createdAt: string;
  source?: 'local' | 'supabase';
  synced?: boolean;
}

const STORAGE_KEY = 'f-insight-followups';

function now() {
  return new Date().toISOString();
}

function addDays(days: number) {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString();
}

function makeId(prefix = 'followup') {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function isUuid(value?: string) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function reasonLabel(reason: FollowUpReason) {
  const labels: Record<FollowUpReason, string> = {
    report: 'Relatório',
    macro: 'Macro',
    content: 'Conteúdo',
    risk: 'Risco',
    meeting: 'Reunião',
    news: 'Notícia',
  };
  return labels[reason];
}

function readLocalFollowUps(): FollowUpTask[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FollowUpTask[];
  } catch {
    return [];
  }
}

function saveLocalFollowUps(items: FollowUpTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items.slice(0, 250)));
}

function stableKey(item: Pick<FollowUpTask, 'title' | 'clientName' | 'dueAt'>) {
  return `${item.clientName}|${item.title}|${item.dueAt}`;
}

function mapSupabaseTask(row: any): FollowUpTask {
  return {
    id: String(row.id),
    tenantId: row.tenant_id || undefined,
    advisorId: row.advisor_id || undefined,
    clientId: row.client_id || undefined,
    clientName: row.client_name || 'Cliente Final Demo',
    clientProfile: row.client_profile || 'moderado',
    title: row.title || 'Follow-up',
    reason: row.reason || 'content',
    priority: row.priority || 'media',
    suggestedAction: row.suggested_action || '',
    script: row.script || '',
    status: row.status || 'open',
    dueAt: row.due_at || now(),
    createdAt: row.created_at || now(),
    source: 'supabase',
    synced: true,
  };
}

async function syncFollowUpToSupabase(task: FollowUpTask) {
  if (!isSupabaseConfigured || !supabase) return { ok: false, error: 'Supabase frontend not configured' };

  const row = {
    tenant_id: isUuid(task.tenantId) ? task.tenantId : null,
    advisor_id: isUuid(task.advisorId) ? task.advisorId : null,
    client_id: isUuid(task.clientId) ? task.clientId : null,
    client_name: task.clientName,
    client_profile: task.clientProfile,
    title: task.title,
    reason: task.reason,
    priority: task.priority,
    suggested_action: task.suggestedAction,
    script: task.script,
    status: task.status,
    due_at: task.dueAt,
    created_at: task.createdAt,
  };

  const { data, error } = await supabase
    .from('follow_up_tasks')
    .insert(row)
    .select('id')
    .maybeSingle();

  if (error) return { ok: false, error: error.message };

  const next = readLocalFollowUps().map((item) => (
    item.id === task.id ? { ...item, id: data?.id || item.id, source: 'supabase' as const, synced: true } : item
  ));
  saveLocalFollowUps(next);
  return { ok: true, id: data?.id };
}

export function generateFollowUpsFromWorkspace(): FollowUpTask[] {
  const stats = getWorkspaceStats();
  const scheduled = getScheduledUpdates();
  const client = stats.clients[0];
  const latestReport = stats.reports.find((report) => report.visibility === 'cliente');
  const latestContent = stats.contents.find((content) => !content.status || content.status === 'published');
  const macroRoutine = scheduled.find((item) => item.kind === 'macro' && item.status === 'active');

  const clientName = client?.name || 'Cliente Final Demo';
  const clientProfile = client?.profile || 'moderado';

  return [
    {
      id: 'demo_followup_report',
      clientName,
      clientProfile,
      title: latestReport ? `Comentar relatório ${latestReport.ticker}` : 'Comentar relatório liberado',
      reason: 'report',
      priority: 'alta',
      suggestedAction: 'Abrir conversa com o cliente sobre o relatório liberado no portal.',
      script: latestReport
        ? `Olá! Liberei um material sobre ${latestReport.ticker} no seu portal. Vale olharmos juntos as premissas, riscos e principais pontos antes de qualquer decisão.`
        : 'Olá! Liberei um relatório no seu portal. Podemos revisar juntos os principais pontos e dúvidas?',
      status: 'open',
      dueAt: addDays(1),
      createdAt: now(),
      source: 'local',
    },
    {
      id: 'demo_followup_macro',
      clientName,
      clientProfile,
      title: macroRoutine ? 'Resumo macro semanal ativo' : 'Criar pauta macro para reunião',
      reason: 'macro',
      priority: 'media',
      suggestedAction: 'Usar juros, dólar e inflação como pauta educativa de conversa.',
      script: 'Separei alguns pontos sobre juros, dólar e inflação que podem ajudar na nossa próxima conversa. A ideia é entender cenário e riscos, sem pressa para decidir nada fora de contexto.',
      status: 'open',
      dueAt: addDays(2),
      createdAt: now(),
      source: 'local',
    },
    {
      id: 'demo_followup_content',
      clientName,
      clientProfile,
      title: latestContent ? `Reforçar conteúdo: ${latestContent.title}` : 'Sugerir conteúdo educativo',
      reason: 'content',
      priority: 'baixa',
      suggestedAction: 'Enviar conteúdo educativo para preparar a próxima reunião.',
      script: latestContent
        ? `Publiquei um conteúdo educativo chamado "${latestContent.title}". Ele ajuda a entender o tema antes da nossa conversa.`
        : 'Publiquei um conteúdo educativo no portal para apoiar nossa próxima conversa.',
      status: 'open',
      dueAt: addDays(4),
      createdAt: now(),
      source: 'local',
    },
    {
      id: 'demo_followup_risk',
      clientName,
      clientProfile,
      title: 'Revisar checklist de risco',
      reason: 'risk',
      priority: clientProfile === 'arrojado' ? 'alta' : 'media',
      suggestedAction: 'Discutir prazo, liquidez, concentração e volatilidade em linguagem simples.',
      script: 'Antes de qualquer nova decisão, queria revisar rapidamente prazo, liquidez, concentração e tolerância a oscilação. Isso ajuda a manter tudo alinhado ao seu perfil.',
      status: 'open',
      dueAt: addDays(5),
      createdAt: now(),
      source: 'local',
    },
  ];
}

export function getFollowUps() {
  try {
    const local = readLocalFollowUps();
    if (local.length === 0) {
      const seeded = generateFollowUpsFromWorkspace();
      saveLocalFollowUps(seeded);
      return seeded;
    }
    return local;
  } catch {
    return generateFollowUpsFromWorkspace();
  }
}

export async function loadFollowUpsFromSupabase() {
  const local = getFollowUps();

  if (!isSupabaseConfigured || !supabase) return local;

  const { data, error } = await supabase
    .from('follow_up_tasks')
    .select('id,tenant_id,advisor_id,client_id,client_name,client_profile,title,reason,priority,suggested_action,script,status,due_at,created_at')
    .order('created_at', { ascending: false })
    .limit(100);

  if (error || !Array.isArray(data)) return local;

  const localKeys = new Set(local.map(stableKey));
  const remote = data.map(mapSupabaseTask).filter((item) => !localKeys.has(stableKey(item)));
  const merged = [...remote, ...local]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 250);

  saveLocalFollowUps(merged);
  return merged;
}

export function saveFollowUps(items: FollowUpTask[]) {
  saveLocalFollowUps(items);
  return items;
}

export function createFollowUp(input: Omit<FollowUpTask, 'id' | 'createdAt' | 'status'>) {
  const items = getFollowUps();
  const task: FollowUpTask = {
    ...input,
    id: makeId(),
    status: 'open',
    createdAt: now(),
    source: 'local',
    synced: false,
  };
  const next = [task, ...items];
  saveFollowUps(next);
  void syncFollowUpToSupabase(task);
  return task;
}

export function markFollowUpDone(id: string) {
  const items = getFollowUps();
  const next = items.map((item) => item.id === id ? { ...item, status: 'done' as FollowUpStatus } : item);
  saveFollowUps(next);

  if (isUuid(id) && isSupabaseConfigured && supabase) {
    void supabase
      .from('follow_up_tasks')
      .update({ status: 'done', completed_at: now(), updated_at: now() })
      .eq('id', id);
  }

  return next;
}

export function resetFollowUpsFromWorkspace() {
  const tasks = generateFollowUpsFromWorkspace();
  saveFollowUps(tasks);
  return tasks;
}

export function getFollowUpStats() {
  const items = getFollowUps();
  return {
    total: items.length,
    open: items.filter((item) => item.status === 'open').length,
    done: items.filter((item) => item.status === 'done').length,
    high: items.filter((item) => item.priority === 'alta' && item.status === 'open').length,
  };
}

export function getReasonLabel(reason: FollowUpReason) {
  return reasonLabel(reason);
}
