import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Download,
  FileText,
  HelpCircle,
  Lock,
  MessageCircle,
  Reply,
  Send,
  Shield,
  Sparkles,
  Target,
} from 'lucide-react';
import API_ENDPOINTS from '@/config/api';
import { useTenant } from '@/context/TenantContext';
import { useAuth } from '@/context/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { getWorkspaceStats } from '@/services/workspace';
import {
  loadAdvisorClientMessages,
  sendAdvisorClientMessage,
  topicLabels,
  type AdvisorClientMessage,
} from '@/services/advisorClientMessages';

const weeklyThemes = [
  {
    title: 'Juros e renda fixa',
    description: 'Como a Selic influencia títulos pós-fixados, crédito privado e o custo de oportunidade da bolsa.',
    tag: 'Macro',
  },
  {
    title: 'Dólar e proteção internacional',
    description: 'O que a variação cambial pode significar para empresas exportadoras, fundos globais e diversificação.',
    tag: 'Câmbio',
  },
  {
    title: 'Dividendos e empresas maduras',
    description: 'Por que geração de caixa, previsibilidade e margem de segurança voltam ao radar em ciclos de juros altos.',
    tag: 'Educação',
  },
  {
    title: 'Valuation sem complicação',
    description: 'Entenda diferença entre preço, valor intrínseco, margem de segurança e risco de pagar caro.',
    tag: 'Conceito',
  },
];

const fallbackReports = [
  { ticker: 'PETR4', title: 'Como ler um relatório de valuation', summary: 'Valor intrínseco e margem de segurança' },
  { ticker: 'VALE3', title: 'Dólar, commodities e empresas exportadoras', summary: 'Cenário macro e sensibilidade cambial' },
  { ticker: 'ITUB4', title: 'Bancos, juros e qualidade de resultado', summary: 'ROE, crédito e dividendos' },
];

const fallbackTracks = [
  { title: 'Renda fixa na prática', progress: 68, next: 'Prefixado, pós-fixado e IPCA+' },
  { title: 'Ações de valor', progress: 42, next: 'Margem de segurança' },
  { title: 'Diversificação internacional', progress: 25, next: 'Risco cambial' },
];

const meetingQuestions = [
  'O que mudou no cenário de juros desde nossa última conversa?',
  'Faz sentido revisar exposição a ativos sensíveis ao dólar?',
  'Quais relatórios devo ler antes da próxima decisão?',
  'Que riscos merecem mais atenção neste mês?',
];

function categoryLabel(category: string) {
  const labels: Record<string, string> = {
    macro: 'Macro',
    renda_fixa: 'Renda fixa',
    acoes: 'Ações',
    dolar: 'Dólar',
    dividendos: 'Dividendos',
    risco: 'Risco',
  };
  return labels[category] || category;
}

function formatDate(value: string) {
  return new Date(value).toLocaleString('pt-BR');
}

export default function ClientPortal() {
  const { tenant, buildReportParams } = useTenant();
  const { user } = useAuth();
  const stats = getWorkspaceStats();
  const defaultClient = stats.clients[0];
  const advisor = stats.advisors[0];
  const [messages, setMessages] = useState<AdvisorClientMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(true);
  const [quickSubject, setQuickSubject] = useState('Dúvida pelo portal do cliente');
  const [quickBody, setQuickBody] = useState('');
  const [quickSending, setQuickSending] = useState(false);
  const [quickFeedback, setQuickFeedback] = useState('');

  async function refreshMessages() {
    const data = await loadAdvisorClientMessages({ limit: 5 });
    setMessages(data);
  }

  useEffect(() => {
    let mounted = true;
    loadAdvisorClientMessages({ limit: 5 }).then((data) => {
      if (mounted) setMessages(data);
    }).finally(() => {
      if (mounted) setMessagesLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  const reports = stats.reports
    .filter((report) => report.visibility === 'cliente')
    .map((report) => ({ ticker: report.ticker, title: report.title, summary: report.summary }));

  const visibleReports = reports.length > 0 ? reports : fallbackReports;
  const visibleTracks = stats.contents.length > 0
    ? stats.contents.map((content, index) => ({
        title: content.title,
        progress: Math.max(25, 72 - index * 12),
        next: categoryLabel(content.category),
      }))
    : fallbackTracks;

  const openReport = (ticker: string) => {
    const params = buildReportParams();
    const normalizedTicker = ticker === 'MACRO' ? 'PETR4' : ticker;
    const url = `${API_ENDPOINTS.reports.valuation(normalizedTicker)}?${params.toString()}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const sendQuickReply = async () => {
    if (!quickBody.trim()) return;
    setQuickSending(true);
    setQuickFeedback('');
    try {
      const result = await sendAdvisorClientMessage({
        tenantId: stats.tenant?.id,
        advisorId: advisor?.id,
        clientId: defaultClient?.id,
        clientName: user?.fullName || defaultClient?.name || 'Cliente Final Demo',
        senderRole: 'client',
        senderName: user?.fullName || defaultClient?.name || 'Cliente Final Demo',
        subject: quickSubject.trim() || 'Dúvida pelo portal do cliente',
        body: quickBody,
        topic: 'question',
      });

      setQuickBody('');
      setQuickSubject('Dúvida pelo portal do cliente');
      setQuickFeedback(result.persisted
        ? 'Dúvida enviada ao assessor e registrada no Supabase.'
        : 'Dúvida salva localmente. O follow-up do assessor também foi criado.'
      );
      await refreshMessages();
    } finally {
      setQuickSending(false);
    }
  };

  return (
    <Layout>
      <section className="mb-8 overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-400">
                <Lock className="h-3.5 w-3.5" />
                Sem saldos, sem posições, sem patrimônio exposto
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                Curadoria de {tenant.brandName}
              </span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">
              {user?.fullName ? `${user.fullName}, inteligência de mercado para decidir melhor.` : 'Inteligência de mercado para você decidir melhor com seu assessor.'}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed">
              Este portal não substitui sua corretora nem mostra seus investimentos reais. Ele organiza mercado, conceitos, relatórios, mensagens do assessor e perguntas úteis para você chegar mais preparado às conversas importantes.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-700/50 bg-slate-950/70 p-5 min-w-[290px]">
            <p className="text-sm text-slate-400 mb-1">Resumo orientativo da semana</p>
            <p className="text-3xl font-black text-white">Juros, dólar e valuation</p>
            <p className="text-sm text-primary flex items-center gap-1 mt-3">
              <ArrowUpRight className="w-4 h-4" />
              {visibleReports.length} materiais para discutir
            </p>
            <div className="mt-5 space-y-2">
              <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-700/40">
                <p className="text-xs text-slate-500">Foco</p>
                <p className="font-bold text-white">Educação + relatórios</p>
              </div>
              <div className="rounded-xl bg-slate-900/80 p-3 border border-slate-700/40">
                <p className="text-xs text-slate-500">Comunicação</p>
                <p className="font-bold text-white">{messages.length || 0} mensagens recentes</p>
              </div>
              <Link to="/contato" className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
                <MessageCircle className="w-4 h-4" />
                Falar com o assessor
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-8">
        {weeklyThemes.map((item) => (
          <div key={item.title} className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5 hover:border-primary/30 transition-colors">
            <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary mb-4">{item.tag}</span>
            <h3 className="font-bold text-white mb-2">{item.title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
          </div>
        ))}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6">
        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <FileText className="w-6 h-6 text-primary" />
                Relatórios e conteúdos liberados para você
              </h2>
              <p className="text-slate-400 mt-1">Materiais orientativos selecionados pelo escritório, sem exibir saldos ou posições reais.</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{visibleReports.length} liberados</span>
          </div>

          <div className="space-y-3">
            {visibleReports.map((report) => (
              <div key={`${report.ticker}-${report.title}`} className="rounded-2xl border border-slate-700/40 bg-slate-950/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-mono font-black">
                    {report.ticker.slice(0, 2)}
                  </div>
                  <div>
                    <p className="font-mono font-bold text-cyan-400">{report.ticker}</p>
                    <h3 className="font-bold text-white">{report.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">Liberado pelo assessor · {report.summary}</p>
                  </div>
                </div>
                <button
                  onClick={() => openReport(report.ticker)}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Abrir PDF
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-primary/20 bg-primary/10 p-5 lg:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <MessageCircle className="w-6 h-6 text-primary" />
                Mensagens do assessor
              </h2>
              <p className="text-slate-300/80 mt-1">Últimas orientações, comentários e pautas registradas no portal.</p>
            </div>
            <Link to="/contato" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950/70 px-4 py-2.5 text-sm font-bold text-white border border-slate-700/50 hover:border-primary/50 transition-colors">
              <Reply className="w-4 h-4" />
              Histórico
            </Link>
          </div>

          <div className="space-y-3">
            {messagesLoading ? (
              Array.from({ length: 3 }).map((_, index) => <div key={index} className="h-24 rounded-2xl bg-slate-950/40 skeleton" />)
            ) : messages.length === 0 ? (
              <div className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-5 text-center">
                <MessageCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="font-bold text-white">Nenhuma mensagem ainda.</p>
                <p className="text-sm text-slate-400 mt-1">Quando o assessor enviar uma atualização, ela aparecerá aqui.</p>
              </div>
            ) : messages.slice(0, 4).map((message) => (
              <article key={message.id} className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-bold text-primary">{topicLabels[message.topic] || message.topic}</span>
                  <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[11px] font-bold text-slate-400">{message.synced ? 'Supabase' : 'Local'}</span>
                </div>
                <h3 className="font-bold text-white">{message.subject}</h3>
                <p className="text-xs text-slate-500 mt-1">{message.senderName} · {formatDate(message.createdAt)}</p>
                <p className="text-sm text-slate-300 leading-relaxed mt-3 line-clamp-3">{message.body}</p>
              </article>
            ))}
          </div>

          <div className="mt-5 rounded-2xl border border-slate-700/40 bg-slate-950/60 p-4">
            <h3 className="font-bold text-white flex items-center gap-2 mb-3">
              <Reply className="w-4 h-4 text-primary" />
              Enviar dúvida rápida
            </h3>
            <input
              value={quickSubject}
              onChange={(event) => setQuickSubject(event.target.value)}
              className="mb-3 w-full rounded-xl border border-slate-700/50 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary/50"
              placeholder="Assunto da dúvida"
            />
            <textarea
              value={quickBody}
              onChange={(event) => setQuickBody(event.target.value)}
              rows={4}
              className="w-full rounded-xl border border-slate-700/50 bg-slate-950 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none focus:border-primary/50"
              placeholder="Escreva sua dúvida para o assessor..."
            />
            <button
              type="button"
              onClick={sendQuickReply}
              disabled={!quickBody.trim() || quickSending}
              className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-4 h-4" />
              {quickSending ? 'Enviando...' : 'Enviar dúvida ao assessor'}
            </button>
            {quickFeedback && (
              <p className="mt-3 flex items-center gap-2 text-sm text-emerald-300">
                <CheckCircle2 className="w-4 h-4" />
                {quickFeedback}
              </p>
            )}
          </div>
        </section>
      </div>

      <section className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-6 mt-8">
        <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-5">
            <BookOpen className="w-6 h-6 text-primary" />
            Trilhas de conhecimento
          </h2>
          <div className="space-y-4">
            {visibleTracks.map((track) => (
              <div key={track.title} className="rounded-2xl border border-slate-700/40 bg-slate-950/40 p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-bold text-white">{track.title}</h3>
                  <span className="text-xs text-slate-500">{track.progress}%</span>
                </div>
                <div className="h-2 rounded-full bg-slate-900 overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-gradient-primary" style={{ width: `${track.progress}%` }} />
                </div>
                <p className="text-xs text-slate-400">Próximo conceito: {track.next}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-5">
            <HelpCircle className="w-6 h-6 text-emerald-400" />
            Perguntas para sua próxima reunião
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {meetingQuestions.map((question, index) => (
              <div key={question} className="rounded-2xl bg-slate-950/50 border border-slate-700/40 p-4 flex gap-3">
                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-xs font-black shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{question}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-8">
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
          <BarChart3 className="w-6 h-6 text-primary mb-3" />
          <h3 className="font-bold text-white mb-2">Mini Bloomberg educativo</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Mercado, macro, notícias e conceitos organizados para aprendizado, não para mostrar patrimônio.</p>
        </div>
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
          <Target className="w-6 h-6 text-emerald-400 mb-3" />
          <h3 className="font-bold text-white mb-2">Curadoria do assessor</h3>
          <p className="text-sm text-slate-400 leading-relaxed">O escritório escolhe temas, relatórios, mensagens e perguntas relevantes para cada perfil educacional.</p>
        </div>
        <div className="rounded-2xl border border-slate-700/40 bg-slate-800/40 p-5">
          <Shield className="w-6 h-6 text-amber-400 mb-3" />
          <h3 className="font-bold text-white mb-2">Mais seguro para lançar</h3>
          <p className="text-sm text-slate-400 leading-relaxed">Sem integração com custódia, saldo, extrato ou posição real nesta fase do produto.</p>
        </div>
      </section>

      <section className="mt-8 rounded-3xl border border-primary/20 bg-primary/10 p-5 lg:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <CalendarDays className="w-6 h-6 text-primary" />
            Próxima conversa com o assessor
          </h2>
          <p className="text-slate-400 mt-1">Sugestão de pauta: revisar cenário macro, relatórios liberados e dúvidas conceituais antes de qualquer decisão.</p>
        </div>
        <Link to="/contato" className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950/70 px-5 py-3 text-sm font-bold text-white border border-slate-700/50 hover:border-primary/50 transition-colors">
          <MessageCircle className="w-4 h-4" />
          Falar com o assessor
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>

      <section className="mt-6 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
        <p className="text-sm text-amber-100/80 leading-relaxed">
          Conteúdo educacional e informativo. As informações do portal não representam recomendação individual, extrato, custódia ou posição real do cliente. Decisões devem ser discutidas com o assessor responsável.
        </p>
      </section>
    </Layout>
  );
}
