import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { type AuthRole } from '@/context/AuthContext';

export type MessageTopic = 'report' | 'news' | 'macro' | 'education' | 'meeting' | 'question';
export type MessageStatus = 'sent' | 'read' | 'archived';

export interface AdvisorClientMessage {
  id: string;
  tenantId?: string;
  advisorId?: string;
  clientId?: string;
  clientName?: string;
  senderRole: AuthRole;
  senderName: string;
  subject: string;
  body: string;
  topic: MessageTopic;
  status: MessageStatus;
  createdAt: string;
  source: 'local' | 'supabase';
  synced?: boolean;
}

export interface SendMessageInput {
  tenantId?: string;
  advisorId?: string;
  clientId?: string;
  clientName?: string;
  senderRole: AuthRole;
  senderName: string;
  subject: string;
  body: string;
  topic: MessageTopic;
}

const STORAGE_KEY = 'f-insight-advisor-client-messages';

export const topicLabels: Record<MessageTopic, string> = {
  report: 'Relatório',
  news: 'Notícia / mercado',
  macro: 'Cenário macro',
  education: 'Educação financeira',
  meeting: 'Pedido de reunião',
  question: 'Dúvida do cliente',
};

const riskyTerms = [
  'compre',
  'comprar',
  'venda',
  'vender',
  'ordem',
  'preço-alvo garantido',
  'rentabilidade garantida',
  'retorno garantido',
  'garantia de lucro',
  'recomendação personalizada automática',
];

function now() {
  return new Date().toISOString();
}

function makeLocalId() {
  return `msg_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function isUuid(value?: string) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

function readLocalMessages(): AdvisorClientMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) as AdvisorClientMessage[] : [];
  } catch {
    return [];
  }
}

function saveLocalMessages(messages: AdvisorClientMessage[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(0, 250)));
}

function toStableKey(message: Pick<AdvisorClientMessage, 'subject' | 'body' | 'createdAt' | 'senderRole'>) {
  return `${message.senderRole}|${message.subject}|${message.body}|${message.createdAt}`;
}

function mapSupabaseRow(row: any): AdvisorClientMessage {
  return {
    id: String(row.id),
    tenantId: row.tenant_id || undefined,
    advisorId: row.advisor_id || undefined,
    clientId: row.client_id || undefined,
    senderRole: row.sender_role || 'advisor',
    senderName: row.sender_role === 'client' ? 'Cliente' : row.sender_role === 'admin' ? 'Admin' : 'Assessor',
    subject: row.subject || 'Mensagem',
    body: row.body || '',
    topic: row.topic || 'education',
    status: row.status || 'sent',
    createdAt: row.created_at || now(),
    source: 'supabase',
    synced: true,
  };
}

export function checkMessageCompliance(text: string) {
  const normalized = text.toLowerCase();
  const found = riskyTerms.filter((term) => normalized.includes(term));

  return {
    ok: found.length === 0,
    found,
    warning: found.length > 0
      ? 'A mensagem parece conter linguagem de recomendação, ordem ou promessa. Ajuste para linguagem educativa/orientativa antes de enviar.'
      : 'Mensagem dentro do padrão educativo/orientativo.',
  };
}

export async function loadAdvisorClientMessages(filters?: { clientId?: string; limit?: number }) {
  const local = readLocalMessages();
  let merged = [...local];

  if (isSupabaseConfigured && supabase) {
    let query = supabase
      .from('advisor_client_messages')
      .select('id,tenant_id,advisor_id,client_id,sender_role,subject,body,topic,status,created_at')
      .order('created_at', { ascending: false })
      .limit(filters?.limit || 50);

    if (filters?.clientId && isUuid(filters.clientId)) {
      query = query.eq('client_id', filters.clientId);
    }

    const { data, error } = await query;
    if (!error && Array.isArray(data)) {
      const localKeys = new Set(local.map(toStableKey));
      const remote = data.map(mapSupabaseRow).filter((message) => !localKeys.has(toStableKey(message)));
      merged = [...local, ...remote];
    }
  }

  if (filters?.clientId) {
    merged = merged.filter((message) => !message.clientId || message.clientId === filters.clientId || !isUuid(filters.clientId));
  }

  return merged
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, filters?.limit || 50);
}

export async function sendAdvisorClientMessage(input: SendMessageInput) {
  const createdAt = now();
  const message: AdvisorClientMessage = {
    id: makeLocalId(),
    tenantId: input.tenantId,
    advisorId: input.advisorId,
    clientId: input.clientId,
    clientName: input.clientName,
    senderRole: input.senderRole,
    senderName: input.senderName,
    subject: input.subject.trim(),
    body: input.body.trim(),
    topic: input.topic,
    status: 'sent',
    createdAt,
    source: 'local',
    synced: false,
  };

  const local = readLocalMessages();
  saveLocalMessages([message, ...local]);

  if (!isSupabaseConfigured || !supabase) {
    return { message, persisted: false, error: 'Supabase frontend not configured' };
  }

  const row = {
    tenant_id: isUuid(input.tenantId) ? input.tenantId : null,
    advisor_id: isUuid(input.advisorId) ? input.advisorId : null,
    client_id: isUuid(input.clientId) ? input.clientId : null,
    sender_role: input.senderRole,
    subject: message.subject,
    body: message.body,
    topic: message.topic,
    status: message.status,
    created_at: createdAt,
  };

  const { data, error } = await supabase
    .from('advisor_client_messages')
    .insert(row)
    .select('id')
    .maybeSingle();

  if (error) {
    return { message, persisted: false, error: error.message };
  }

  const updated = { ...message, id: data?.id || message.id, source: 'supabase' as const, synced: true };
  const nextLocal = readLocalMessages().map((item) => item.id === message.id ? updated : item);
  saveLocalMessages(nextLocal);

  return { message: updated, persisted: true, error: null };
}
