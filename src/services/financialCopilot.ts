import type { AuthRole } from '@/context/AuthContext';

export interface CopilotPrompt {
  id: string;
  title: string;
  description: string;
  audience: AuthRole[];
  category: 'macro' | 'valuation' | 'risco' | 'conteudo' | 'reuniao' | 'noticias';
}

export interface CopilotAnswer {
  title: string;
  summary: string;
  bullets: string[];
  nextActions: string[];
  disclaimer: string;
}

export const copilotPrompts: CopilotPrompt[] = [
  {
    id: 'client-valuation',
    title: 'Explique valuation sem complicar',
    description: 'Versão educativa para o cliente entender preço, valor e margem de segurança.',
    audience: ['client', 'advisor', 'admin'],
    category: 'valuation',
  },
  {
    id: 'client-risk',
    title: 'Monte um checklist de risco',
    description: 'Perguntas para o cliente levar à próxima conversa com o assessor.',
    audience: ['client', 'advisor', 'admin'],
    category: 'risco',
  },
  {
    id: 'advisor-meeting',
    title: 'Preparar reunião com cliente',
    description: 'Roteiro para assessor discutir cenário, relatórios e próximos passos.',
    audience: ['advisor', 'admin'],
    category: 'reuniao',
  },
  {
    id: 'advisor-content',
    title: 'Transformar análise em conteúdo',
    description: 'Converter um tema técnico em texto educativo para o portal do cliente.',
    audience: ['advisor', 'admin'],
    category: 'conteudo',
  },
  {
    id: 'macro-week',
    title: 'Resumo macro da semana',
    description: 'Gerar pauta sobre juros, dólar, inflação e impacto nos ativos.',
    audience: ['client', 'advisor', 'admin'],
    category: 'macro',
  },
  {
    id: 'news-impact',
    title: 'Impacto das notícias no cliente',
    description: 'Traduzir notícias em perguntas e pontos de atenção para reunião.',
    audience: ['advisor', 'admin'],
    category: 'noticias',
  },
];

const answers: Record<string, CopilotAnswer> = {
  'client-valuation': {
    title: 'Valuation em linguagem simples',
    summary: 'Valuation é uma tentativa de estimar quanto um ativo poderia valer com base em fundamentos, fluxo de caixa, crescimento, risco e qualidade do negócio.',
    bullets: [
      'Preço é o que o mercado negocia hoje; valor é uma estimativa baseada em fundamentos.',
      'Margem de segurança é a diferença entre o valor estimado e o preço observado.',
      'Quanto maior a incerteza, maior deve ser o cuidado na leitura do valuation.',
      'O resultado serve como ponto de conversa, não como ordem de compra ou venda.',
    ],
    nextActions: [
      'Abrir um relatório educativo do ativo.',
      'Perguntar ao assessor quais premissas mais influenciam o valuation.',
      'Comparar risco, prazo e objetivo antes de qualquer decisão.',
    ],
    disclaimer: 'Conteúdo educativo. Não representa recomendação individual de investimento.',
  },
  'client-risk': {
    title: 'Checklist de risco para o cliente',
    summary: 'Antes de decidir, o cliente deve entender prazo, liquidez, concentração, volatilidade e cenário econômico.',
    bullets: [
      'Qual é o prazo do objetivo ligado a esse dinheiro?',
      'Existe necessidade de liquidez no curto prazo?',
      'A decisão aumenta concentração em um único ativo, setor ou indexador?',
      'O cliente está preparado para oscilações temporárias?',
    ],
    nextActions: [
      'Levar estas perguntas para a reunião.',
      'Pedir explicação sobre os principais riscos do tema.',
      'Revisar se o tema combina com o perfil educacional do cliente.',
    ],
    disclaimer: 'Ferramenta educativa para melhorar a conversa com o assessor.',
  },
  'advisor-meeting': {
    title: 'Roteiro de reunião para assessor',
    summary: 'Comece pelo cenário, conecte com conteúdos publicados e termine com perguntas abertas para evitar linguagem de recomendação automática.',
    bullets: [
      'Abrir com o que mudou no cenário macro desde a última conversa.',
      'Revisar quais relatórios e conteúdos o cliente visualizou ou deveria revisar.',
      'Traduzir riscos em linguagem simples: prazo, liquidez, concentração e volatilidade.',
      'Registrar dúvidas do cliente para virar conteúdo futuro do escritório.',
    ],
    nextActions: [
      'Publicar um conteúdo educativo complementar.',
      'Gerar PDF white-label quando houver ativo específico em discussão.',
      'Criar pauta de follow-up no calendário editorial.',
    ],
    disclaimer: 'Uso interno do assessor. Valide suitability, política do escritório e regras aplicáveis.',
  },
  'advisor-content': {
    title: 'Análise virando conteúdo',
    summary: 'A melhor forma de transformar análise em relacionamento é converter o tema técnico em pergunta, exemplo e explicação curta.',
    bullets: [
      'Comece com uma pergunta do cliente, não com jargão técnico.',
      'Explique o conceito em 3 blocos: o que é, por que importa e quais riscos observar.',
      'Evite frases conclusivas de compra ou venda.',
      'Finalize sugerindo conversa com o assessor para contextualizar.',
    ],
    nextActions: [
      'Criar rascunho em /admin/conteudos.',
      'Agendar sequência semanal na fábrica editorial.',
      'Vincular o conteúdo a uma pauta de reunião.',
    ],
    disclaimer: 'Conteúdo deve ser revisado pelo escritório antes de publicação.',
  },
  'macro-week': {
    title: 'Resumo macro da semana',
    summary: 'A pauta macro pode ser organizada em juros, inflação, dólar e impacto setorial, sempre em linguagem de orientação geral.',
    bullets: [
      'Juros: afetam renda fixa, custo de capital e valuation das empresas.',
      'Inflação: afeta poder de compra, margens e expectativas de política monetária.',
      'Dólar: impacta exportadoras, importadoras, fundos globais e proteção internacional.',
      'Bolsa: reage a lucro esperado, fluxo, risco político, commodities e cenário externo.',
    ],
    nextActions: [
      'Gerar pacote editorial de Macro.',
      'Publicar perguntas para próxima reunião.',
      'Atualizar relatórios e conteúdos no portal do cliente.',
    ],
    disclaimer: 'Resumo informativo. Não substitui análise individual.',
  },
  'news-impact': {
    title: 'Notícias virando ação comercial segura',
    summary: 'A notícia deve virar contexto e pergunta, não recomendação automática. O assessor usa a manchete para abrir conversa qualificada.',
    bullets: [
      'Identifique se a notícia é macro, setor, empresa, risco ou oportunidade educacional.',
      'Traduza o impacto em linguagem simples para o perfil do cliente.',
      'Crie uma pergunta de reunião: isso muda prazo, risco, liquidez ou diversificação?',
      'Se fizer sentido, publique conteúdo explicativo em vez de enviar opinião solta.',
    ],
    nextActions: [
      'Criar conteúdo educativo sobre a notícia.',
      'Adicionar pauta ao roteiro do assessor.',
      'Atualizar o portal com resumo semanal.',
    ],
    disclaimer: 'Use notícias como insumo de conversa, não como recomendação direta.',
  },
};

export function getPromptsForRole(role: AuthRole = 'client') {
  return copilotPrompts.filter((prompt) => prompt.audience.includes(role));
}

export function runCopilotPrompt(promptId: string): CopilotAnswer {
  return answers[promptId] || answers['macro-week'];
}
