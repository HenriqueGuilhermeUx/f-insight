import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Bot,
  BookOpen,
  CheckCircle2,
  FileText,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { getPromptsForRole, runCopilotPrompt } from '@/services/financialCopilot';

export default function FinancialCopilot() {
  const { user } = useAuth();
  const prompts = useMemo(() => getPromptsForRole(user?.role || 'client'), [user?.role]);
  const [selectedPromptId, setSelectedPromptId] = useState(prompts[0]?.id || 'macro-week');
  const answer = runCopilotPrompt(selectedPromptId);
  const isClient = user?.role === 'client';

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <Bot className="w-3.5 h-3.5" />
              IA Financeira F-Insight
            </span>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">
              {isClient ? 'Copiloto educativo para clientes.' : 'Copiloto moderno para assessores e escritórios.'}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              {isClient
                ? 'Uma IA em linguagem simples para explicar conceitos, riscos e perguntas para levar ao assessor.'
                : 'Uma IA para transformar análise em reunião, conteúdo, relatórios e relacionamento recorrente com clientes.'}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 min-w-[280px]">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-2">Guardrails comerciais</h3>
            <p className="text-sm text-slate-300 leading-relaxed">Sem carteira real, sem ordem de compra/venda e sem recomendação individual automática.</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-6">
        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6 h-fit">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            Perguntas prontas
          </h2>
          <p className="text-slate-400 mb-5">Escolha uma tarefa e o copiloto monta a resposta com próximos passos.</p>

          <div className="space-y-3">
            {prompts.map((prompt) => (
              <button
                key={prompt.id}
                onClick={() => setSelectedPromptId(prompt.id)}
                className={`w-full text-left rounded-2xl border p-4 transition-colors ${selectedPromptId === prompt.id ? 'border-primary/50 bg-primary/10' : 'border-slate-700/40 bg-slate-950/50 hover:border-primary/30'}`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <h3 className="font-bold text-white">{prompt.title}</h3>
                  <ArrowRight className="w-4 h-4 text-slate-500" />
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{prompt.description}</p>
              </button>
            ))}
          </div>
        </section>

        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                {answer.title}
              </h2>
              <p className="text-slate-400 mt-1">{answer.summary}</p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">IA assistiva</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_0.9fr] gap-5">
            <div className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-5">
              <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-primary" />
                Explicação / roteiro
              </h3>
              <div className="space-y-3">
                {answer.bullets.map((item) => (
                  <div key={item} className="flex gap-3 rounded-xl bg-slate-900/70 border border-slate-700/30 p-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300 leading-relaxed">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-700/40 bg-slate-950/50 p-5">
              <h3 className="font-bold text-white flex items-center gap-2 mb-4">
                <Wand2 className="w-5 h-5 text-amber-400" />
                Próximas ações
              </h3>
              <div className="space-y-3 mb-5">
                {answer.nextActions.map((item) => (
                  <div key={item} className="rounded-xl bg-slate-900/70 border border-slate-700/30 p-3 text-sm text-slate-300">
                    {item}
                  </div>
                ))}
              </div>

              {!isClient && (
                <div className="grid grid-cols-1 gap-3">
                  <Link to="/admin/conteudos" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
                    <FileText className="w-4 h-4" />
                    Criar conteúdo
                  </Link>
                  <Link to="/admin/fabrica-conteudo" className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700/50 bg-slate-900 px-4 py-3 text-sm font-bold text-white hover:border-primary/50 transition-colors">
                    <Bot className="w-4 h-4" />
                    Gerar pacote editorial
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 flex gap-3">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-100/80 leading-relaxed">{answer.disclaimer}</p>
          </div>
        </section>
      </div>
    </Layout>
  );
}
