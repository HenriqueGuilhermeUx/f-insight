import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  ArrowRight,
  Bot,
  BookOpen,
  CheckCircle2,
  FileText,
  Loader2,
  MessageCircle,
  Send,
  ShieldCheck,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { toast } from 'sonner';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import { getPromptsForRole, runCopilotPrompt } from '@/services/financialCopilot';
import { runRadarAgent, type RadarAgentResponse } from '@/services/finsightAgentApi';

const exampleQueries = [
  'Analise PETR4 nos últimos 12 meses',
  'Compare BTC, dólar e juros nos últimos 6 meses',
  'Quais riscos eu deveria observar antes de estudar VALE3?',
];

export default function FinancialCopilot() {
  const { user } = useAuth();
  const prompts = useMemo(() => getPromptsForRole(user?.role || 'client'), [user?.role]);
  const [selectedPromptId, setSelectedPromptId] = useState(prompts[0]?.id || 'macro-week');
  const answer = runCopilotPrompt(selectedPromptId);
  const isClient = user?.role === 'client';

  const [query, setQuery] = useState('');
  const [radarResult, setRadarResult] = useState<RadarAgentResponse | null>(null);
  const [radarLoading, setRadarLoading] = useState(false);

  async function handleRadarQuery() {
    const cleanQuery = query.trim();
    if (cleanQuery.length < 4) {
      toast.error('Digite uma pergunta um pouco mais completa.');
      return;
    }

    setRadarLoading(true);
    try {
      const result = await runRadarAgent({ query: cleanQuery });
      setRadarResult(result);
    } catch {
      toast.error('O Radar IA não conseguiu responder agora. Tente novamente em instantes.');
    } finally {
      setRadarLoading(false);
    }
  }

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <Bot className="w-3.5 h-3.5" />
              F-Insight Agent
            </span>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">
              {isClient ? 'Pergunte sobre dinheiro e mercado em linguagem natural.' : 'Copiloto de inteligência para assessores e escritórios.'}
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              {isClient
                ? 'Pesquise cenários, entenda riscos e transforme dúvidas financeiras em uma análise estruturada — sem robô de trade e sem promessa de retorno.'
                : 'Transforme temas de mercado em pesquisa, roteiro de reunião, conteúdo e próximos passos com guardrails profissionais.'}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 min-w-[280px]">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-2">IA assistiva</h3>
            <p className="text-sm text-slate-300 leading-relaxed">Sem ordem de compra/venda, sem promessa de rentabilidade e sem execução automática.</p>
          </div>
        </div>
      </section>

      <section className="mb-8 rounded-3xl border border-cyan-500/20 bg-slate-800/40 p-5 lg:p-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-5">
          <div>
            <span className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-cyan-400 mb-2">
              <Sparkles className="w-4 h-4" /> Radar IA ao vivo
            </span>
            <h2 className="text-2xl lg:text-3xl font-bold text-white">Digite o que você quer analisar.</h2>
            <p className="text-slate-400 mt-2">O agente organiza a pergunta, identifica o ativo e monta um roteiro de pesquisa e simulação.</p>
          </div>
          {radarResult && (
            <div className="rounded-xl border border-slate-700/50 bg-slate-950/60 px-4 py-3 text-xs text-slate-400">
              <span className="text-slate-500">Modo:</span>{' '}
              <span className="font-semibold text-cyan-300">{radarResult.normalized.mode}</span>
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <textarea
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                void handleRadarQuery();
              }
            }}
            rows={2}
            placeholder="Ex.: analise PETR4 nos últimos 12 meses e me mostre os principais riscos"
            className="flex-1 resize-none rounded-2xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-cyan-500/50"
          />
          <button
            disabled={radarLoading}
            onClick={() => void handleRadarQuery()}
            className="inline-flex min-w-[145px] items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 font-bold text-slate-950 transition-colors hover:bg-cyan-400 disabled:opacity-60"
          >
            {radarLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            Analisar
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {exampleQueries.map((example) => (
            <button
              key={example}
              onClick={() => setQuery(example)}
              className="rounded-full border border-slate-700/50 bg-slate-900/70 px-3 py-1.5 text-xs text-slate-400 hover:border-cyan-500/30 hover:text-cyan-300 transition-colors"
            >
              {example}
            </button>
          ))}
        </div>

        {radarResult && (
          <div className="mt-6 grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5 animate-fade-in">
            <div className="rounded-2xl border border-cyan-500/20 bg-slate-950/60 p-5">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-bold text-cyan-300">{radarResult.normalized.symbol}</span>
                <span className="rounded-full bg-slate-800 px-3 py-1 text-xs text-slate-400">{radarResult.normalized.assetClass}</span>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{radarResult.answer.headline}</h3>
              <p className="text-slate-300 leading-relaxed mb-5">{radarResult.answer.summary}</p>

              <h4 className="font-semibold text-white mb-3">O que observar</h4>
              <div className="space-y-2">
                {radarResult.answer.whatToCheck.map((item) => (
                  <div key={item} className="flex gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                    <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-300">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-slate-700/40 bg-slate-950/60 p-5">
                <h4 className="font-bold text-white mb-3">Plano da análise</h4>
                <ol className="space-y-3">
                  {radarResult.answer.simulationPlan.map((item, index) => (
                    <li key={item} className="flex gap-3 text-sm text-slate-300">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary">{index + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-100/80 leading-relaxed">{radarResult.riskNotice}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-[430px_1fr] gap-6">
        <section className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6 h-fit">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2 mb-2">
            <MessageCircle className="w-6 h-6 text-primary" />
            Perguntas prontas
          </h2>
          <p className="text-slate-400 mb-5">Escolha uma tarefa e o copiloto monta uma resposta educativa com próximos passos.</p>

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
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Base educativa</span>
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
