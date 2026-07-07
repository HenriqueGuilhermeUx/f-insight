import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { CheckCircle2, MessageCircle, Send, ShieldCheck, Users } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { getWorkspaceStats } from '@/services/workspace';
import {
  checkMessageCompliance,
  loadAdvisorClientMessages,
  sendAdvisorClientMessage,
  topicLabels,
  type AdvisorClientMessage,
  type MessageTopic,
} from '@/services/advisorClientMessages';

const templates = [
  {
    label: 'Relatório publicado',
    topic: 'report' as MessageTopic,
    subject: 'Novo material disponível no portal',
    body: 'Olá! Publiquei um material educativo no portal para apoiar nossa próxima conversa. Use como ponto de partida e me avise se quiser marcar uma reunião para entender os principais pontos.',
  },
  {
    label: 'Cenário macro',
    topic: 'macro' as MessageTopic,
    subject: 'Atualização sobre juros, inflação e dólar',
    body: 'Olá! Atualizei o cenário macro no portal com pontos sobre juros, inflação e dólar. Vale acompanhar esses fatores antes da nossa próxima reunião.',
  },
  {
    label: 'Notícia relevante',
    topic: 'news' as MessageTopic,
    subject: 'Notícia de mercado para acompanhar',
    body: 'Olá! Separei uma notícia de mercado que pode ajudar no acompanhamento do cenário econômico. O objetivo é informativo e educativo.',
  },
  {
    label: 'Agendar conversa',
    topic: 'meeting' as MessageTopic,
    subject: 'Pedido de reunião',
    body: 'Olá! Gostaria de marcar uma conversa para entender melhor os materiais publicados no portal e tirar dúvidas sobre o cenário atual.',
  },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR');
}

export default function MessagesCenter() {
  const { user } = useAuth();
  const stats = getWorkspaceStats();
  const tenant = stats.tenant;
  const advisor = stats.advisors[0];
  const defaultClient = stats.clients[0];
  const [selectedClientId, setSelectedClientId] = useState(defaultClient?.id || '');
  const selectedClient = useMemo(
    () => stats.clients.find((client) => client.id === selectedClientId) || defaultClient,
    [stats.clients, selectedClientId, defaultClient]
  );

  const [topic, setTopic] = useState<MessageTopic>(user?.role === 'client' ? 'question' : 'education');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [messages, setMessages] = useState<AdvisorClientMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');

  const compliance = checkMessageCompliance(`${subject} ${body}`);
  const canSend = Boolean(user && selectedClient && subject.trim() && body.trim() && compliance.ok);

  async function refreshMessages() {
    setLoading(true);
    try {
      const data = await loadAdvisorClientMessages({ clientId: selectedClient?.id, limit: 60 });
      setMessages(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refreshMessages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClientId]);

  function applyTemplate(template: typeof templates[number]) {
    setTopic(template.topic);
    setSubject(template.subject);
    setBody(template.body);
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!user || !selectedClient || !canSend) return;

    setSending(true);
    setFeedback('');
    try {
      const result = await sendAdvisorClientMessage({
        tenantId: tenant?.id,
        advisorId: advisor?.id,
        clientId: selectedClient.id,
        clientName: selectedClient.name,
        senderRole: user.role,
        senderName: user.fullName,
        subject,
        body,
        topic,
      });

      setSubject('');
      setBody('');
      setTopic(user.role === 'client' ? 'question' : 'education');
      setFeedback(result.persisted ? 'Mensagem salva no Supabase.' : 'Mensagem salva localmente.');
      await refreshMessages();
    } finally {
      setSending(false);
    }
  }

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <MessageCircle className="w-3.5 h-3.5" />
              Mensagens
            </span>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">Comunicação com contexto.</h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              Canal para relatórios, notícias, cenário macro, conteúdos educativos, dúvidas e pedidos de reunião.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 min-w-[260px]">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Padrão seguro</h3>
            <p className="text-sm text-slate-300 leading-relaxed">Mensagens com linguagem informativa, educativa e registrada.</p>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <form onSubmit={handleSubmit} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white mb-2">Nova mensagem</h2>
          <p className="text-sm text-slate-400 mb-5">Escolha o cliente, o tema e registre a conversa.</p>

          {user?.role !== 'client' && (
            <label className="block mb-4">
              <span className="block text-sm font-semibold text-slate-300 mb-2">Cliente</span>
              <select
                value={selectedClientId}
                onChange={(event) => setSelectedClientId(event.target.value)}
                className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white focus:outline-none focus:border-primary/50"
              >
                {stats.clients.map((client) => (
                  <option key={client.id} value={client.id}>{client.name} · {client.profile}</option>
                ))}
              </select>
            </label>
          )}

          <label className="block mb-4">
            <span className="block text-sm font-semibold text-slate-300 mb-2">Tema</span>
            <select
              value={topic}
              onChange={(event) => setTopic(event.target.value as MessageTopic)}
              className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white focus:outline-none focus:border-primary/50"
            >
              {(Object.keys(topicLabels) as MessageTopic[]).map((key) => (
                <option key={key} value={key}>{topicLabels[key]}</option>
              ))}
            </select>
          </label>

          <label className="block mb-4">
            <span className="block text-sm font-semibold text-slate-300 mb-2">Assunto</span>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              placeholder="Ex.: Novo material no portal"
              className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
            />
          </label>

          <label className="block mb-4">
            <span className="block text-sm font-semibold text-slate-300 mb-2">Mensagem</span>
            <textarea
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={8}
              placeholder="Escreva uma mensagem educativa e objetiva..."
              className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
            />
          </label>

          <div className={`rounded-2xl border p-4 mb-4 ${compliance.ok ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-amber-500/20 bg-amber-500/10'}`}>
            <div className="flex gap-3">
              <CheckCircle2 className={`w-5 h-5 shrink-0 mt-0.5 ${compliance.ok ? 'text-emerald-400' : 'text-amber-400'}`} />
              <div>
                <p className="text-sm font-bold text-white">Validação de linguagem</p>
                <p className="text-sm text-slate-300 mt-1">{compliance.warning}</p>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <p className="text-sm font-semibold text-slate-300 mb-2">Modelos rápidos</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {templates.map((template) => (
                <button
                  key={template.label}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="rounded-xl border border-slate-700/50 bg-slate-950/50 p-3 text-left text-sm text-slate-300 hover:border-primary/40 hover:text-white transition-colors"
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          <button
            disabled={!canSend || sending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Enviando...' : 'Enviar mensagem'}
          </button>
          {feedback && <p className="text-sm text-emerald-300 mt-3">{feedback}</p>}
        </form>

        <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-white">Histórico</h2>
              <p className="text-sm text-slate-400">{selectedClient?.name || 'Cliente'} · {selectedClient?.profile || 'perfil'}</p>
            </div>
            <div className="rounded-xl border border-slate-700/50 bg-slate-950/50 px-3 py-2 text-xs text-slate-400 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              {messages.length} mensagens
            </div>
          </div>

          <div className="space-y-3 max-h-[720px] overflow-y-auto pr-1">
            {loading ? (
              Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-28 rounded-2xl bg-slate-950/50 skeleton" />)
            ) : messages.length === 0 ? (
              <div className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-6 text-center">
                <MessageCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-300 font-semibold">Nenhuma mensagem ainda.</p>
                <p className="text-sm text-slate-500 mt-1">Envie a primeira atualização para iniciar o histórico.</p>
              </div>
            ) : messages.map((message) => (
              <article key={message.id} className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{topicLabels[message.topic] || message.topic}</span>
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-300">{message.senderRole}</span>
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-400">{message.synced ? 'Supabase' : 'Local'}</span>
                </div>
                <h3 className="font-bold text-white">{message.subject}</h3>
                <p className="text-xs text-slate-400 mt-1">{message.senderName} · {formatDate(message.createdAt)}</p>
                <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-wrap mt-3">{message.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
}
