import type { ContentOrigin, ContentStatus, WorkspaceContent } from '@/services/workspace';

export type FactoryTheme = 'macro' | 'renda_fixa' | 'acoes' | 'dolar' | 'dividendos' | 'risco';
export type FactoryMode = 'drafts' | 'weekly_schedule';

type ContentCategory = WorkspaceContent['category'];

interface FactoryInput {
  tenantId: string;
  clientId?: string;
  theme: FactoryTheme;
  mode: FactoryMode;
  startDate?: string;
}

export type FactoryContentDraft = Omit<WorkspaceContent, 'id' | 'createdAt' | 'publishedAt'>;

const themeLabels: Record<FactoryTheme, string> = {
  macro: 'Macro',
  renda_fixa: 'Renda fixa',
  acoes: 'Ações',
  dolar: 'Dólar',
  dividendos: 'Dividendos',
  risco: 'Risco',
};

const packages: Record<FactoryTheme, { title: string; category: ContentCategory; description: string }[]> = {
  macro: [
    {
      title: 'Resumo semanal de mercado',
      category: 'macro',
      description: 'Principais pontos da semana sobre juros, inflação, dólar e bolsa, em linguagem simples para preparar conversas com clientes.',
    },
    {
      title: 'O que acompanhar no cenário macro',
      category: 'macro',
      description: 'Lista de indicadores e temas que merecem atenção: Selic, IPCA, câmbio, atividade econômica e expectativas.',
    },
    {
      title: 'Perguntas macro para a próxima reunião',
      category: 'macro',
      description: 'Perguntas objetivas para ajudar o cliente a discutir cenário, prazo, risco e oportunidades com o assessor.',
    },
  ],
  renda_fixa: [
    {
      title: 'Renda fixa sem complicação',
      category: 'renda_fixa',
      description: 'Explicação prática sobre pós-fixado, prefixado, IPCA+ e como juros influenciam cada alternativa.',
    },
    {
      title: 'Checklist antes de escolher um título',
      category: 'renda_fixa',
      description: 'Pontos para observar: prazo, liquidez, risco de crédito, tributação, indexador e objetivo do investimento.',
    },
    {
      title: 'Juros altos e custo de oportunidade',
      category: 'renda_fixa',
      description: 'Como comparar renda fixa com outras classes de ativos sem transformar a análise em recomendação individual.',
    },
  ],
  acoes: [
    {
      title: 'Preço não é valor',
      category: 'acoes',
      description: 'Conceito educativo de valor intrínseco, preço de mercado e margem de segurança para entender relatórios de ações.',
    },
    {
      title: 'Como ler múltiplos com cuidado',
      category: 'acoes',
      description: 'Explicação simples sobre P/L, EV/EBITDA, ROE, margem e crescimento, sempre considerando setor e ciclo.',
    },
    {
      title: 'Qualidade antes de promessa',
      category: 'acoes',
      description: 'Material para discutir geração de caixa, endividamento, governança e previsibilidade de resultados.',
    },
  ],
  dolar: [
    {
      title: 'Dólar e diversificação internacional',
      category: 'dolar',
      description: 'Como câmbio pode afetar empresas, fundos internacionais, proteção patrimonial e planejamento de longo prazo.',
    },
    {
      title: 'Quem se beneficia e quem sofre com dólar alto',
      category: 'dolar',
      description: 'Leitura conceitual sobre exportadoras, importadoras, custos dolarizados e dívida em moeda estrangeira.',
    },
    {
      title: 'Risco cambial em linguagem simples',
      category: 'dolar',
      description: 'Perguntas para avaliar exposição internacional, volatilidade e horizonte de investimento.',
    },
  ],
  dividendos: [
    {
      title: 'Dividendos não são só yield',
      category: 'dividendos',
      description: 'Conceitos de payout, recorrência, caixa, dívida e sustentabilidade de distribuição de resultados.',
    },
    {
      title: 'Empresas maduras e geração de caixa',
      category: 'dividendos',
      description: 'Como analisar negócios mais previsíveis, setores defensivos e riscos de olhar apenas para dividend yield.',
    },
    {
      title: 'Perguntas sobre renda com dividendos',
      category: 'dividendos',
      description: 'Pauta educativa para discutir renda, risco, concentração e horizonte de investimento com o assessor.',
    },
  ],
  risco: [
    {
      title: 'Checklist de risco antes de decidir',
      category: 'risco',
      description: 'Perguntas sobre prazo, liquidez, concentração, volatilidade, cenário econômico e capacidade de tolerar oscilações.',
    },
    {
      title: 'Risco de concentração',
      category: 'risco',
      description: 'Material educativo sobre o perigo de depender demais de uma única tese, setor, indexador ou classe de ativos.',
    },
    {
      title: 'Volatilidade não é o único risco',
      category: 'risco',
      description: 'Conceitos de liquidez, crédito, inflação, câmbio, governança e perda permanente de capital.',
    },
  ],
};

function addDays(date: Date, days: number) {
  const copy = new Date(date);
  copy.setDate(copy.getDate() + days);
  return copy;
}

export function generateContentPackage(input: FactoryInput): FactoryContentDraft[] {
  const baseDate = input.startDate ? new Date(input.startDate) : new Date();
  const status: ContentStatus = input.mode === 'weekly_schedule' ? 'scheduled' : 'draft';
  const origin: ContentOrigin = 'f_insight';

  return packages[input.theme].map((item, index) => ({
    tenantId: input.tenantId,
    clientId: input.clientId,
    title: item.title,
    category: item.category,
    description: `${item.description} Conteúdo gerado pelo pacote F-Insight de ${themeLabels[input.theme]}.`,
    origin,
    status,
    scheduledAt: input.mode === 'weekly_schedule' ? addDays(baseDate, index).toISOString() : undefined,
  }));
}

export function getFactoryThemeLabel(theme: FactoryTheme) {
  return themeLabels[theme];
}
