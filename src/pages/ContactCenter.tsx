import { FormEvent, useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Mail,
  MessageCircle,
  Phone,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { getWorkspaceStats } from '@/services/workspace';

const clientTopics = [
  'Quero entender um relatório',
  'Quero marcar uma conversa',
  'Tenho dúvida sobre risco',
  'Quero sugerir um tema educativo',
];

const advisorTopics = [
  'Pauta de reunião com cliente',
  'Publicar conteúdo para cliente',
  'Gerar material sobre notícia',
  'Solicitar suporte F-Insight',
];

export default function ContactCenter() {
  const { user } = useAuth();
  const stats = getWorkspaceStats();
  const isClient = user?.role === 'client';
  const [sent, setSent] = useState(false);
  const [subject, setSubject] = useState(isClient ? clientTopics[0] : advisorTopics[0]);
  const [message, setMessage] = useState('');

  const topics = isClient ? clientTopics : advisorTopics;
  const advisor = stats.advisors[0];
  const contactEmail = isClient ? advisor?.email || 'assessor@demo.com' : stats.tenant.ownerEmail || 'admin@demo.com';
  const contactName = isClient ? advisor?.name || 'Assessor responsável' : stats.tenant.brandName;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3500);
  };

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <MessageCircle className="w-3.5 h-3.5" />
              Central de contato
            </span>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">
              {isClient ? 'Fale com seu assessor com contexto.' : 'Organize contatos, dúvidas e próximos passos.'}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              {isClient
                ? 'Envie dúvidas sobre relatórios, conteúdos e temas educativos sem expor saldos ou posições reais.'
                : 'Use a central para transformar dúvidas em reunião, conteúdo, relatório ou follow-up com cliente.'}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 min-w-[280px]">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Comunicação segura</h3>
            <p className="text-sm text-slate-300 leading-relaxed">Contato orientativo, sem dados de custódia, extrato ou patrimônio no portal.</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-6">
        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6 h-fit">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <UserRound className="w-6 h-6 text-primary" />
            Contato principal
          </h2>
          <p className="text-slate-400 mb-5">Canal inicial para direcionar dúvidas e próximas ações.</p>

          <div className="space-y-3">
            <div className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4">
              <p className="text-xs text-slate-500 mb-1">Responsável</p>
              <p className="font-bold text-white">{contactName}</p>
            </div>
            <div className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4 flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="text-xs text-slate-500">E-mail</p>
                <p className="font-bold text-white">{contactEmail}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4 flex items-center gap-3">
              <Phone className="w-5 h-5 text-emerald-400" />
              <div>
                <p className="text-xs text-slate-500">WhatsApp</p>
                <p className="font-bold text-white">A definir pelo escritório</p>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-4 flex items-center gap-3">
              <CalendarDays className="w-5 h-5 text-amber-400" />
              <div>
                <p className="text-xs text-slate-500">Reunião</p>
                <p className="font-bold text-white">Solicitação contextual</p>
              </div>
            </div>
          </div>
        </section>

        <form onSubmit={submit} className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <Sparkles className="w-6 h-6 text-primary" />
            Abrir solicitação
          </h2>
          <p className="text-slate-400 mb-5">Nesta fase MVP, o envio fica simulado. Depois conectamos e-mail, WhatsApp ou CRM.</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            {topics.map((topic) => (
              <button
                type="button"
                key={topic}
                onClick={() => setSubject(topic)}
                className={`text-left rounded-2xl border p-4 transition-colors ${subject === topic ? 'border-primary/50 bg-primary/10' : 'border-slate-700/40 bg-slate-950/50 hover:border-primary/30'}`}
              >
                <p className="font-bold text-white">{topic}</p>
              </button>
            ))}
          </div>

          <label className="block mb-4">
            <span className="text-sm text-slate-400 mb-2 block">Assunto</span>
            <input value={subject} onChange={(event) => setSubject(event.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
          </label>

          <label className="block mb-4">
            <span className="text-sm text-slate-400 mb-2 block">Mensagem</span>
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} rows={6} placeholder="Escreva a dúvida ou contexto da conversa..." className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
          </label>

          {sent && (
            <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              Solicitação registrada na demo.
            </div>
          )}

          <button className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
            <Send className="w-4 h-4" />
            Registrar solicitação
          </button>
        </form>
      </div>
    </Layout>
  );
}
