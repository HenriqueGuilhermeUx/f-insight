import { getWorkspaceStats } from '@/services/workspace';
import { getScheduledUpdates } from '@/services/updateScheduler';

export type FollowUpPriority = 'alta' | 'media' | 'baixa';
export type FollowUpStatus = 'open' | 'done';
export type FollowUpReason = 'report' | 'macro' | 'content' | 'risk' | 'meeting' | 'news';

export interface FollowUpTask {
  id: string;
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
    },
  ];
}

export function getFollowUps() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = generateFollowUpsFromWorkspace();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as FollowUpTask[];
  } catch {
    return generateFollowUpsFromWorkspace();
  }
}

export function saveFollowUps(items: FollowUpTask[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  return items;
}

export function createFollowUp(input: Omit<FollowUpTask, 'id' | 'createdAt' | 'status'>) {
  const items = getFollowUps();
  const task: FollowUpTask = {
    ...input,
    id: makeId(),
    status: 'open',
    createdAt: now(),
  };
  const next = [task, ...items];
  saveFollowUps(next);
  return task;
}

export function markFollowUpDone(id: string) {
  const items = getFollowUps();
  const next = items.map((item) => item.id === id ? { ...item, status: 'done' as FollowUpStatus } : item);
  saveFollowUps(next);
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
