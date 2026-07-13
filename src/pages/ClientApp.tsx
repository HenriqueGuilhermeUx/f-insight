import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Bell,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  Home,
  MessageCircle,
  Reply,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
} from 'lucide-react';
import API_ENDPOINTS from '@/config/api';
import { useAuth } from '@/context/AuthContext';
import { useTenant } from '@/context/TenantContext';
import { getWorkspaceStats } from '@/services/workspace';
import {
  loadAdvisorClientMessages,
  sendAdvisorClientMessage,
  topicLabels,
  type AdvisorClientMessage,
} from '@/services/advisorClientMessages';

const quickQuestions = [
  'O que eu devo ler antes da nossa próxima conversa?',
  'O que mudou no cenário de juros e dólar?',
  'Quais riscos merecem mais atenção neste mês?',
];

const educationCards = [
  { title: 'Juros e renda fixa', progress: 68, next: 'Prefixado, pós-fixado e IPCA+' },
  { title: 'Valuation sem complicação', progress: 42, next: 'Preço, valor e margem de segurança' },
  { title: 'Diversificação internacional', progress: 25, next: 'Risco cambial' },
];

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function ClientApp() {
  const { user } = useAuth();
  const { tenant, buildReportParams } = useTenant();
  const stats = getWorkspaceStats();
  const advisor = stats.advisors[0];
  const defaultClient = stats.clients[0];
  const [messages, setMessages] = useState<AdvisorClientMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [question, setQuestion] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState('');

  const reports = useMemo(() => {
    const visible = stats.reports
      .filter((report) => report.visibility === 'cliente')
      .map((report) => ({ ticker: report.ticker, title: report.title, summary: report.summary }));

    return visible.length > 0 ? visible : [
      { ticker: 'PETR4', title: 'Como ler um relatório de valuation', summary: 'Valor intrínseco e margem de segurança' },
      { ticker: 'VALE3', title: 'Dólar, commodities e empresas exportadoras', summary: 'Cenário macro e sensibilidade cambial' },
    ];
  }, [stats.reports]);

  const latestMessage = messages[0];
  const unreadCount = Math.min(messages.length, 9);

  async function refreshMessages() {
    const data = await loadAdvisorClientMessages({ limit: 8 });
    setMessages(data);
  }

  useEffect(() => {
    let mounted = true;
    loadAdvisorClientMessages({ limit: 8 }).then((data) => {
      if (mounted) setMessages(data);
    }).finally(() => {
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  function openReport(ticker: string) {
    const params = buildReportParams();
    const url = `${API_ENDPOINTS.reports.valuation(ticker)}?${params.toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  async function sendQuestion(text?: string) {
    const finalText = (text || question).trim();
    if (!finalText) return;

    setSending(true);
    setFeedback('');
    try {
      await sendAdvisorClientMessage({
        tenantId: stats.tenant?.id,
        advisorId: advisor?.id,
        clientId: defaultClient?.id,
        clientName: user?.fullName || defaultClient?.name || 'Cliente Final Demo',
        senderRole: 'client',
        senderName: user?.fullName || defaultClient?.name || 'Cliente Final Demo',
        subject: 'Dúvida pelo app do cliente',
        body: finalText,
        topic: 'question',
      });
      setQuestion('');
      setFeedback('Dúvida enviada. O assessor recebeu uma próxima ação.');
      await refreshMessages();
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white pb-24">
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-10 w-10 rounded-2xl bg-primary/20 flex items-center justify-center shrink-0 overflow-hidden">
              {tenant.logoDataUrl ? <img src={tenant.logoDataUrl} alt={tenant.brandName} className="h-full w-full object-contain p-1" /> : <Sparkles className="h-5 w-5 text-primary" />}
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black">{tenant.brandName || 'F-Insight'}</p>
              <p className="text-xs text-slate-500">App do cliente</p>
            </div>
          </div>
          <Link to="/cliente" className="rounded-full border border-slate-700/60 bg-slate-900 px-3 py-2 text-xs font-bold text-slate-200">
            Portal
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-md px-4 py-4 space-y-5">
        <section id="hoje" className="rounded-[2rem] border border-primary/20 bg-gradient-to-br from-primary/20 via-slate-900 to-slate-950 p-5 shadow-2xl shadow-primary/5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Hoje</p>
              <h1 className="mt-2 text-3xl font-black leading-tight">
                {user?.fullName ? `Olá, ${user.fullName.split(' ')[0]}` : 'Seu painel rápido'}
              </h1>
              <p className="mt-3 text-sm leading-relaxed text-slate-300">
                Tudo que importa para sua próxima conversa com o assessor: mensagens, relatórios, dúvidas e pauta.
              </p>
            </div>
            <div className="relative rounded-2xl bg-slate-950/70 p-3 border border-slate-700/40">
              <Bell className="h-5 w-5 text-primary" />
              {unreadCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-black text-white">{unreadCount}</span>}
            </div>
          </div>

          <div className="mt-5 grid grid-cols-3 gap-2">
            <a href="#mensagens" className="rounded-2xl bg-slate-950/60 p-3 text-center border border-slate-700/40">
              <MessageCircle className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-xs font-bold">Mensagens</p>
            </a>
            <a href="#relatorios" className="rounded-2xl bg-slate-950/60 p-3 text-center border border-slate-700/40">
              <FileText className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-xs font-bold">Relatórios</p>
            </a>
            <a href="#duvida" className="rounded-2xl bg-slate-950/60 p-3 text-center border border-slate-700/40">
              <Reply className="mx-auto mb-2 h-5 w-5 text-primary" />
              <p className="text-xs font-bold">Perguntar</p>
            </a>
          </div>
        </section>

        <section className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4">
          <div className="flex gap-3">
            <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-400 mt-0.5" />
            <div>
              <h2 className="font-bold">Seguro e educativo</h2>
              <p className="mt-1 text-sm leading-relaxed text-emerald-100/80">Este app não mostra saldo, custódia, extrato ou carteira real. Ele organiza conteúdo e conversa com seu assessor.</p>
            </div>
          </div>
        </section>

        <section id="mensagens" className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2"><MessageCircle className="h-5 w-5 text-primary" /> Mensagens</h2>
            <Link to="/contato" className="text-xs font-bold text-primary">Histórico</Link>
          </div>

          {loading ? (
            <div className="h-28 rounded-2xl bg-slate-800/70 skeleton" />
          ) : latestMessage ? (
            <article className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{topicLabels[latestMessage.topic] || latestMessage.topic}</span>
                <span className="text-xs text-slate-500">{formatDate(latestMessage.createdAt)}</span>
              </div>
              <h3 className="font-bold">{latestMessage.subject}</h3>
              <p className="mt-2 line-clamp-4 text-sm leading-relaxed text-slate-300">{latestMessage.body}</p>
              <Link to="/contato" className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-primary">
                Responder
                <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ) : (
            <div className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4 text-center">
              <p className="font-bold">Nenhuma mensagem ainda</p>
              <p className="mt-1 text-sm text-slate-500">Quando o assessor enviar algo, aparece aqui.</p>
            </div>
          )}
        </section>

        <section id="relatorios" className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-black flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> Relatórios</h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">{reports.length}</span>
          </div>
          <div className="space-y-3">
            {reports.map((report) => (
              <button key={`${report.ticker}-${report.title}`} onClick={() => openReport(report.ticker)} className="w-full rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4 text-left">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-mono text-sm font-black text-cyan-400">{report.ticker}</p>
                    <h3 className="mt-1 font-bold">{report.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">{report.summary}</p>
                  </div>
                  <Download className="h-5 w-5 shrink-0 text-primary" />
                </div>
              </button>
            ))}
          </div>
        </section>

        <section id="duvida" className="rounded-3xl border border-primary/20 bg-primary/10 p-4">
          <h2 className="text-xl font-black flex items-center gap-2"><Reply className="h-5 w-5 text-primary" /> Dúvida rápida</h2>
          <p className="mt-1 text-sm text-slate-300">Escreva em linguagem simples. O assessor recebe como próxima ação.</p>

          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {quickQuestions.map((item) => (
              <button key={item} onClick={() => setQuestion(item)} className="min-w-[220px] rounded-2xl border border-slate-700/50 bg-slate-950/70 p-3 text-left text-xs font-semibold text-slate-300">
                {item}
              </button>
            ))}
          </div>

          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={4}
            className="mt-4 w-full rounded-2xl border border-slate-700/50 bg-slate-950/80 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary/60"
            placeholder="Digite sua dúvida para o assessor..."
          />
          <button
            onClick={() => sendQuestion()}
            disabled={!question.trim() || sending}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 py-3 text-sm font-black text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            {sending ? 'Enviando...' : 'Enviar ao assessor'}
          </button>
          {feedback && <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-300"><CheckCircle2 className="h-4 w-4" /> {feedback}</p>}
        </section>

        <section id="conteudos" className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="mb-4 text-xl font-black flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> Aprender</h2>
          <div className="space-y-3">
            {educationCards.map((card) => (
              <div key={card.title} className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold">{card.title}</h3>
                  <Star className="h-4 w-4 text-amber-400" />
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-800">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${card.progress}%` }} />
                </div>
                <p className="mt-2 text-xs text-slate-500">Próximo: {card.next}</p>
              </div>
            ))}
          </div>
        </section>

        <section id="reuniao" className="rounded-3xl border border-slate-800 bg-slate-900/70 p-4">
          <h2 className="text-xl font-black flex items-center gap-2"><CalendarDays className="h-5 w-5 text-primary" /> Próxima conversa</h2>
          <p className="mt-2 text-sm leading-relaxed text-slate-300">Pauta sugerida: revisar cenário macro, relatórios liberados e dúvidas antes de qualquer decisão.</p>
          <button onClick={() => sendQuestion('Quero marcar uma conversa para revisar os materiais e tirar dúvidas.')} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-700/50 bg-slate-950 px-5 py-3 text-sm font-black text-white">
            Pedir conversa
            <ArrowRight className="h-4 w-4" />
          </button>
        </section>
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800 bg-slate-950/95 backdrop-blur-xl">
        <div className="mx-auto grid max-w-md grid-cols-4 px-2 py-2">
          <a href="#hoje" className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold text-slate-300">
            <Home className="h-5 w-5 text-primary" /> Hoje
          </a>
          <a href="#mensagens" className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold text-slate-300">
            <MessageCircle className="h-5 w-5 text-primary" /> Mensagens
          </a>
          <a href="#relatorios" className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold text-slate-300">
            <FileText className="h-5 w-5 text-primary" /> Relatórios
          </a>
          <a href="#duvida" className="flex flex-col items-center gap-1 rounded-2xl px-2 py-2 text-[11px] font-bold text-slate-300">
            <Reply className="h-5 w-5 text-primary" /> Perguntar
          </a>
        </div>
      </nav>
    </div>
  );
}
