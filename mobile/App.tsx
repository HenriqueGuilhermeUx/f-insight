import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://f-insight-api.onrender.com';
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://f-insight.netlify.app';
const REVIEWER_EMAIL = ['notarizex', 'gmail.com'].join('@');
const ACCOUNTS_KEY = 'finsight-mobile-accounts';
const SESSION_KEY = 'finsight-mobile-session';
const FUTURE_REPORT_KEY = 'finsight-mobile-future-report';
const RADAR_REPORT_KEY = 'finsight-mobile-radar-report';

type Section = 'hoje' | 'futuro' | 'radarIa' | 'mercado' | 'conta' | 'premium' | 'mais';
type AuthMode = 'login' | 'signup';
type Plan = 'free' | 'premium';
type Account = { name: string; email: string; plan: Plan };
type StoredAccount = Account & { password: string };
type LiveIndicator = { symbol: string; lastPrice: number; changePercent: number; fetchedAt?: string };
type MacroItem = { id?: string; label: string; value: number; unit: string; source?: string; interpretation?: string };

type FutureReport = {
  profile?: string;
  stage?: string;
  realTalk?: string;
  freedomScore?: number;
  monthlyBalance?: number;
  savingsRate?: number;
  leakPotential?: number;
  workHoursLost?: number;
  targetLabel?: string;
  conservative?: number;
  base?: number;
  accelerated?: number;
  opportunities?: string[];
  weekMission?: string;
  ninetyDayPlan?: string[];
  openFinanceNext?: string;
  riskNotice?: string;
};

type RadarReport = {
  mode?: string;
  normalizedSymbol?: string;
  educationalSummary?: string;
  researchPlan?: string[];
  simulationPlan?: string[];
  risks?: string[];
  investorQuestions?: string[];
  riskNotice?: string;
};

const fallbackIndicators: LiveIndicator[] = [
  { symbol: 'PETR4.SA', lastPrice: 38.42, changePercent: 0.72 },
  { symbol: 'VALE3.SA', lastPrice: 61.18, changePercent: -0.35 },
  { symbol: 'ITUB4.SA', lastPrice: 34.9, changePercent: 0.41 },
  { symbol: 'BBAS3.SA', lastPrice: 29.8, changePercent: 0.22 },
  { symbol: 'WEGE3.SA', lastPrice: 42.75, changePercent: 1.12 },
  { symbol: 'BBDC4.SA', lastPrice: 14.62, changePercent: -0.18 },
];

const macroFallback: MacroItem[] = [
  { id: 'selic', label: 'Selic Meta', value: 14.0, unit: '% a.a.', source: 'fallback offline', interpretation: 'O app tenta atualizar online pela API F-Insight/BCB.' },
  { id: 'ipca', label: 'IPCA Mensal', value: 0.38, unit: '% m/m', source: 'fallback offline', interpretation: 'Inflação impacta juros, margens e poder de compra.' },
  { id: 'usdbrl', label: 'Dólar Comercial', value: 5.1, unit: 'BRL', source: 'fallback offline', interpretation: 'Câmbio afeta inflação, commodities e exportadoras.' },
];

const objectives = [
  'Sair do vermelho',
  'Montar reserva',
  'Acumular patrimônio',
  'Aposentar com renda',
  'Comprar imóvel',
  'Organizar família',
];

const stages = [
  'Falta dinheiro',
  'Não sobra',
  'Sobra e não guardo',
  'Guardo, mas sem plano',
  'Invisto sem objetivo',
  'Tenho patrimônio',
];

const quickRadarPrompts = [
  'Analise BTC nos últimos 6 meses sem recomendar compra.',
  'Compare Selic, dólar e Ibovespa para uma pessoa de longo prazo.',
  'Simule aportes mensais no IBOV de forma educativa.',
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function numberFromInput(value: string | number | undefined) {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  const normalized = String(value || '').replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function money(value?: number) {
  const safe = Number.isFinite(value) ? Number(value) : 0;
  return `R$ ${safe.toFixed(2).replace('.', ',')}`;
}

function pct(value?: number) {
  const safe = Number.isFinite(value) ? Number(value) : 0;
  return `${safe >= 0 ? '+' : ''}${safe.toFixed(2).replace('.', ',')}%`;
}

function macroValue(item: MacroItem) {
  if (item.unit === 'BRL') return money(item.value);
  return `${Number(item.value || 0).toFixed(2).replace('.', ',')}%`;
}

function futureValue(monthly: number, annualRate: number, years: number) {
  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
  if (monthlyRate === 0) return monthly * months;
  return monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

function cleanSymbol(symbol: string) {
  return symbol.replace('.SA', '');
}

function openWeb(path: string) {
  void Linking.openURL(`${WEB_URL}${path.startsWith('/') ? path : `/${path}`}`);
}

async function postJson<T>(path: string, body: Record<string, unknown>): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`API ${response.status}`);
  return response.json();
}

function Card({ children, highlight = false, warning = false }: { children: React.ReactNode; highlight?: boolean; warning?: boolean }) {
  return <View style={[styles.card, highlight && styles.cardHighlight, warning && styles.cardWarning]}>{children}</View>;
}

function Button({ label, onPress, primary = false }: { label: string; onPress: () => void; primary?: boolean }) {
  return <Pressable onPress={onPress} style={[styles.button, primary && styles.buttonPrimary]}><Text style={[styles.buttonText, primary && styles.buttonPrimaryText]}>{label}</Text></Pressable>;
}

function Chip({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return <Pressable onPress={onPress} style={[styles.chip, active && styles.chipActive]}><Text style={[styles.chipText, active && styles.chipTextActive]}>{label}</Text></Pressable>;
}

export default function App() {
  const [section, setSection] = useState<Section>('hoje');
  const [authMode, setAuthMode] = useState<AuthMode>('signup');
  const [loading, setLoading] = useState(true);
  const [agentOnline, setAgentOnline] = useState(false);
  const [isLive, setIsLive] = useState(false);
  const [isMacroLive, setIsMacroLive] = useState(false);
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [macroItems, setMacroItems] = useState<MacroItem[]>(macroFallback);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const [futureObjective, setFutureObjective] = useState(objectives[0]);
  const [futureStage, setFutureStage] = useState(stages[1]);
  const [futureAge, setFutureAge] = useState('35');
  const [futureDependents, setFutureDependents] = useState('0');
  const [futureIncome, setFutureIncome] = useState('8000');
  const [futureExpenses, setFutureExpenses] = useState('6800');
  const [futureDebt, setFutureDebt] = useState('0');
  const [futureSavings, setFutureSavings] = useState('300');
  const [futureGoalAmount, setFutureGoalAmount] = useState('300000');
  const [futureGoalYears, setFutureGoalYears] = useState('15');
  const [futureTransactions, setFutureTransactions] = useState('');
  const [futureReport, setFutureReport] = useState<FutureReport | null>(null);
  const [futureLoading, setFutureLoading] = useState(false);

  const [radarPrompt, setRadarPrompt] = useState('Analise PETR4 nos últimos 12 meses sem recomendar compra.');
  const [radarSymbol, setRadarSymbol] = useState('PETR4.SA');
  const [radarReport, setRadarReport] = useState<RadarReport | null>(null);
  const [radarLoading, setRadarLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const [savedAccounts, savedSession, savedFuture, savedRadar] = await Promise.all([
          AsyncStorage.getItem(ACCOUNTS_KEY),
          AsyncStorage.getItem(SESSION_KEY),
          AsyncStorage.getItem(FUTURE_REPORT_KEY),
          AsyncStorage.getItem(RADAR_REPORT_KEY),
        ]);
        if (!cancelled) {
          setAccounts(savedAccounts ? JSON.parse(savedAccounts) : []);
          if (savedSession) setAccount(JSON.parse(savedSession));
          if (savedFuture) setFutureReport(JSON.parse(savedFuture));
          if (savedRadar) setRadarReport(JSON.parse(savedRadar));
        }
      } catch {
        // O app continua mesmo sem storage.
      }

      try {
        const [liveResponse, macroResponse, agentResponse] = await Promise.allSettled([
          fetch(`${API_URL}/api/live/indicators`),
          fetch(`${API_URL}/api/macro/overview?refresh=true`),
          fetch(`${API_URL}/api/agent/health`),
        ]);
        if (cancelled) return;

        if (liveResponse.status === 'fulfilled' && liveResponse.value.ok) {
          const payload = await liveResponse.value.json();
          const data = Array.isArray(payload?.data) ? payload.data : [];
          setIndicators(data);
          setIsLive(data.length > 0);
        }

        if (macroResponse.status === 'fulfilled' && macroResponse.value.ok) {
          const payload = await macroResponse.value.json();
          const data = Array.isArray(payload?.indicators) ? payload.indicators : [];
          if (data.length > 0) {
            setMacroItems(data);
            setIsMacroLive(String(payload?.source || '').includes('online') || String(payload?.source || '').includes('banco-central'));
          }
        }

        if (agentResponse.status === 'fulfilled' && agentResponse.value.ok) {
          setAgentOnline(true);
        }
      } catch {
        if (!cancelled) {
          setIndicators([]);
          setMacroItems(macroFallback);
          setIsLive(false);
          setIsMacroLive(false);
          setAgentOnline(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    boot();
    return () => { cancelled = true; };
  }, []);

  const marketData = indicators.length > 0 ? indicators : fallbackIndicators;
  const avgChange = marketData.reduce((sum, item) => sum + item.changePercent, 0) / Math.max(1, marketData.length);
  const hasPremium = account?.plan === 'premium';

  const mood = useMemo(() => {
    if (avgChange > 0.6) return { title: 'Mercado construtivo', text: 'A amostra acompanhada está positiva. Confirme fundamento, fluxo e notícia antes de decidir.' };
    if (avgChange < -0.6) return { title: 'Mercado pressionado', text: 'A amostra está negativa. Foque em risco, liquidez e qualidade.' };
    return { title: 'Mercado misto', text: 'Sem direção única. Separe empresas, setores, valuation e cenário macro.' };
  }, [avgChange]);

  async function persistSession(nextAccount: Account | null) {
    setAccount(nextAccount);
    if (nextAccount) await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(nextAccount));
    else await AsyncStorage.removeItem(SESSION_KEY);
  }

  async function persistAccounts(nextAccounts: StoredAccount[]) {
    setAccounts(nextAccounts);
    await AsyncStorage.setItem(ACCOUNTS_KEY, JSON.stringify(nextAccounts));
  }

  async function createFreeAccount() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setMessage('Preencha nome, e-mail e senha com pelo menos 6 caracteres.');
      return;
    }
    const next: StoredAccount = { name: name.trim(), email: normalizeEmail(email), password, plan: 'free' };
    const nextAccounts = [...accounts.filter((item) => normalizeEmail(item.email) !== next.email), next];
    await persistAccounts(nextAccounts);
    await persistSession({ name: next.name, email: next.email, plan: next.plan });
    setMessage('Conta gratuita criada e salva neste aparelho.');
    setSection('futuro');
  }

  async function loginAccount() {
    const normalized = normalizeEmail(email);
    if (normalized === REVIEWER_EMAIL && password.length >= 6) {
      const reviewer = { name: 'Revisor Google', email: REVIEWER_EMAIL, plan: 'premium' as const };
      await persistSession(reviewer);
      setMessage('Premium liberado para revisão.');
      setSection('futuro');
      return;
    }
    const found = accounts.find((item) => normalizeEmail(item.email) === normalized && item.password === password);
    if (!found) {
      setMessage('Conta não encontrada. Crie uma conta grátis ou use o acesso de revisão informado na Play Console.');
      return;
    }
    await persistSession({ name: found.name, email: found.email, plan: found.plan });
    setMessage(found.plan === 'premium' ? 'Premium liberado.' : 'Conta gratuita acessada.');
    setSection('futuro');
  }

  async function activatePremiumDemo() {
    if (!account) {
      setMessage('Entre com uma conta antes de visualizar o Premium.');
      setSection('conta');
      return;
    }
    const next = { ...account, plan: 'premium' as const };
    await persistSession(next);
    setMessage('Premium demonstrativo liberado. A cobrança real será ativada com Google Play Billing.');
    setSection('futuro');
  }

  function localFutureReport(): FutureReport {
    const income = numberFromInput(futureIncome);
    const expenses = numberFromInput(futureExpenses);
    const debt = numberFromInput(futureDebt);
    const savings = numberFromInput(futureSavings);
    const target = numberFromInput(futureGoalAmount);
    const years = Math.max(1, numberFromInput(futureGoalYears) || 10);
    const balance = income - expenses - savings;
    const savingsRate = income > 0 ? savings / income : 0;
    const leakPotential = Math.max(0, balance * 0.6 + (futureTransactions.length > 40 ? income * 0.03 : 0));
    const hourly = income > 0 ? income / 176 : 0;
    const workHoursLost = hourly > 0 ? leakPotential / hourly : 0;

    let profile = 'Malabarista';
    let stage = 'Você trabalha para manter o mês em pé.';
    let realTalk = 'Seu dinheiro entra, paga o mês e não compra futuro. A prioridade agora é criar folga antes de falar em sofisticação.';

    if (balance < 0 || debt > income * 2) {
      profile = 'Sangria';
      stage = 'O buraco precisa parar antes de qualquer plano bonito.';
      realTalk = 'Você não precisa de uma carteira incrível agora. Precisa estancar a sangria: dívida, custo fixo e gasto impulsivo estão tomando seu poder de escolha.';
    } else if (balance > income * 0.12 && savings < balance * 0.5) {
      profile = 'Vazamento Silencioso';
      stage = 'Sobra dinheiro, mas ele desaparece sem virar patrimônio.';
      realTalk = 'O problema não é falta de renda. É falta de direção. Seu extrato provavelmente está financiando conveniência antes de financiar liberdade.';
    } else if (savingsRate > 0 && savingsRate < 0.1) {
      profile = 'Poupador Fraco';
      stage = 'Você guarda, mas pouco para o tamanho da sua ambição.';
      realTalk = 'Você começou certo, mas ainda está negociando com o próprio futuro. A meta precisa virar boleto positivo todo mês.';
    } else if (savingsRate >= 0.1) {
      profile = savingsRate >= 0.25 ? 'Estrategista' : 'Construtor';
      stage = savingsRate >= 0.25 ? 'Agora o jogo é proteger, otimizar e transformar patrimônio em liberdade.' : 'Você já constrói, mas precisa conectar aportes com objetivos claros.';
      realTalk = savingsRate >= 0.25 ? 'Você está acima da média em disciplina. O próximo salto é clareza: para que vida exatamente esse patrimônio está trabalhando?' : 'Você está no caminho. Agora precisamos parar de acumular no escuro e transformar cada aporte em avanço mensurável.';
    }

    const score = Math.max(0, Math.min(100, Math.round(35 + savingsRate * 180 + (balance > 0 ? 10 : -15) - (debt > income ? 12 : 0))));
    return {
      profile,
      stage,
      realTalk,
      freedomScore: score,
      monthlyBalance: balance,
      savingsRate,
      leakPotential,
      workHoursLost,
      targetLabel: `${futureObjective} em ${years} anos`,
      conservative: futureValue(Math.max(0, savings), 0.04, years),
      base: futureValue(Math.max(0, savings + leakPotential * 0.5), 0.07, years),
      accelerated: futureValue(Math.max(0, savings + leakPotential), 0.09, years),
      opportunities: [
        leakPotential > 0 ? `Redirecionar ${money(leakPotential)} por mês de vazamentos para a meta.` : 'Criar um valor mínimo automático para a meta antes do dinheiro circular no mês.',
        debt > 0 ? `Atacar a dívida de ${money(debt)} antes de aumentar risco. Dívida cara é um anti-investimento.` : 'Separar reserva de emergência antes de buscar complexidade.',
        target > 0 ? `Transformar a meta de ${money(target)} em marcos trimestrais.` : 'Definir valor alvo e prazo. Sem alvo, qualquer sobra parece progresso.',
      ],
      weekMission: profile === 'Sangria' ? 'Missão 7 dias: congelar gasto variável não essencial, listar todas as dívidas e renegociar uma.' : 'Missão 7 dias: cortar um vazamento e transferir o valor para uma caixinha chamada Liberdade.',
      ninetyDayPlan: ['Semana 1: organizar renda, custos fixos, dívidas e recorrências.', 'Dia 30: criar folga mínima mensal.', 'Dia 60: travar o maior vazamento.', 'Dia 90: recalcular rota e criar acompanhamento mensal.'],
      openFinanceNext: 'Próxima evolução: Open Finance para transformar este diagnóstico em acompanhamento vivo.',
      riskNotice: 'Conteúdo educativo. Não é recomendação individualizada de investimento.',
    };
  }

  async function generateFutureReport() {
    setFutureLoading(true);
    try {
      const payload = {
        objective: futureObjective,
        currentStage: futureStage,
        age: numberFromInput(futureAge),
        dependents: numberFromInput(futureDependents),
        monthlyIncome: numberFromInput(futureIncome),
        monthlyExpenses: numberFromInput(futureExpenses),
        totalDebt: numberFromInput(futureDebt),
        monthlySavings: numberFromInput(futureSavings),
        goalAmount: numberFromInput(futureGoalAmount),
        goalYears: numberFromInput(futureGoalYears),
        rawTransactionsText: futureTransactions,
      };
      const remote = await postJson<FutureReport>('/api/agent/life-plan', payload);
      setFutureReport(remote);
      setAgentOnline(true);
      await AsyncStorage.setItem(FUTURE_REPORT_KEY, JSON.stringify(remote));
    } catch {
      const fallback = localFutureReport();
      setFutureReport(fallback);
      await AsyncStorage.setItem(FUTURE_REPORT_KEY, JSON.stringify(fallback));
    } finally {
      setFutureLoading(false);
    }
  }

  async function generateRadarReport() {
    setRadarLoading(true);
    try {
      const remote = await postJson<RadarReport>('/api/agent/radar', {
        prompt: radarPrompt,
        symbol: radarSymbol,
        horizon: '12 meses',
        userObjective: futureObjective,
      });
      setRadarReport(remote);
      setAgentOnline(true);
      await AsyncStorage.setItem(RADAR_REPORT_KEY, JSON.stringify(remote));
    } catch {
      const fallback: RadarReport = {
        mode: 'fallback-local',
        normalizedSymbol: radarSymbol.toUpperCase(),
        educationalSummary: 'O agente online ainda não respondeu. Use isto como roteiro educativo: entenda preço, fundamentos, cenário macro, risco e horizonte antes de qualquer decisão.',
        researchPlan: ['Coletar histórico de preço e volatilidade.', 'Comparar com juros, dólar e cenário macro.', 'Separar tese de longo prazo de ruído de curto prazo.'],
        simulationPlan: ['Simular aporte mensal.', 'Comparar cenário conservador, base e acelerado.', 'Exibir limitações da simulação.'],
        risks: ['Não é recomendação de compra ou venda.', 'Resultado passado não garante resultado futuro.', 'Simulação não captura eventos inesperados.'],
        investorQuestions: ['Esse ativo conversa com meu objetivo?', 'Meu prazo suporta volatilidade?', 'Estou buscando tese ou emoção?'],
        riskNotice: 'Conteúdo educativo e de simulação. Não executa ordens.',
      };
      setRadarReport(fallback);
      await AsyncStorage.setItem(RADAR_REPORT_KEY, JSON.stringify(fallback));
    } finally {
      setRadarLoading(false);
    }
  }

  function renderHoje() {
    return <View style={styles.stack}>
      <Card highlight>
        <Text style={styles.kicker}>F-INSIGHT PUBLICADO NA GOOGLE PLAY</Text>
        <Text style={styles.heroTitle}>Mercado, Futuro IA e Radar IA em um só app.</Text>
        <Text style={styles.heroText}>Agora o F-Insight conecta objetivos de vida, diagnóstico financeiro e análise educativa de mercado.</Text>
        <View style={styles.rowWrap}>
          <Text style={styles.badge}>{isLive ? 'Cotações online' : 'cotações demo'}</Text>
          <Text style={styles.badge}>{isMacroLive ? 'Macro online BCB' : 'macro fallback'}</Text>
          <Text style={styles.badge}>{agentOnline ? 'Agent online' : 'Agent fallback'}</Text>
        </View>
        {account ? <View style={styles.accountPill}><Text style={styles.accountPillText}>{account.plan === 'premium' ? 'Premium ativo' : 'Conta grátis ativa'} · {account.name}</Text></View> : <View style={styles.buttonRow}><Button label="Criar conta grátis" primary onPress={() => { setAuthMode('signup'); setSection('conta'); }} /><Button label="Entrar" onPress={() => { setAuthMode('login'); setSection('conta'); }} /></View>}
      </Card>
      <Card warning><Text style={styles.cardTitle}>Meu Futuro IA</Text><Text style={styles.cardText}>Descubra se seu dinheiro financia seus objetivos ou sabota sua vida. Perfil, a real, vazamentos e plano de 90 dias.</Text><Button label="Começar Futuro IA" primary onPress={() => setSection('futuro')} /></Card>
      <Card><Text style={styles.cardTitle}>Radar IA</Text><Text style={styles.cardText}>Digite o que quer analisar em linguagem natural. O agente devolve roteiro educativo, riscos e simulação sem recomendar compra ou venda.</Text><Button label="Abrir Radar IA" onPress={() => setSection('radarIa')} /></Card>
      <Card><Text style={styles.cardTitle}>{mood.title}</Text><Text style={styles.cardText}>{mood.text}</Text></Card>
    </View>;
  }

  function renderConta() {
    return <View style={styles.stack}>
      <Card highlight><Text style={styles.kicker}>CONTA DO INVESTIDOR</Text><Text style={styles.heroTitle}>{authMode === 'signup' ? 'Crie seu acesso grátis.' : 'Entre com sua conta.'}</Text><Text style={styles.heroText}>Cliente assessorado, assessor e escritório ficam separados no menu Mais.</Text><View style={styles.segment}><Pressable onPress={() => setAuthMode('login')} style={[styles.segmentItem, authMode === 'login' && styles.segmentItemActive]}><Text style={[styles.segmentText, authMode === 'login' && styles.segmentTextActive]}>Entrar</Text></Pressable><Pressable onPress={() => setAuthMode('signup')} style={[styles.segmentItem, authMode === 'signup' && styles.segmentItemActive]}><Text style={[styles.segmentText, authMode === 'signup' && styles.segmentTextActive]}>Criar grátis</Text></Pressable></View></Card>
      <Card>{authMode === 'signup' && <><Text style={styles.inputLabel}>Nome completo</Text><TextInput value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor="#64748b" style={styles.input} /></>}<Text style={styles.inputLabel}>E-mail</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="seu@email.com" placeholderTextColor="#64748b" style={styles.input} /><Text style={styles.inputLabel}>Senha</Text><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="mínimo 6 caracteres" placeholderTextColor="#64748b" style={styles.input} />{message ? <Text style={message.includes('criada') || message.includes('liberado') || message.includes('acessada') ? styles.successBox : styles.errorBox}>{message}</Text> : null}<View style={styles.buttonRow}><Button label={authMode === 'signup' ? 'Criar conta' : 'Entrar'} primary onPress={authMode === 'signup' ? createFreeAccount : loginAccount} /><Button label="Ver app" onPress={() => setSection('hoje')} /></View><Text style={styles.helperText}>Revisão Google: notarizex@gmail.com + qualquer senha com 6+ caracteres.</Text></Card>
    </View>;
  }

  function renderFuturo() {
    return <View style={styles.stack}>
      <Card highlight><Text style={styles.kicker}>MEU FUTURO IA</Text><Text style={styles.heroTitle}>Seu extrato precisa virar consciência.</Text><Text style={styles.heroText}>Agora conectado ao F-Insight Agent quando o backend estiver publicado; se estiver offline, o app usa fallback local.</Text>{!hasPremium && <View style={styles.buttonRow}><Button label="Liberar demo Premium" primary onPress={activatePremiumDemo} /><Button label="Entrar" onPress={() => { setAuthMode('login'); setSection('conta'); }} /></View>}</Card>
      <Card><Text style={styles.cardTitle}>1. Objetivo principal</Text><View style={styles.chipWrap}>{objectives.map((item) => <Chip key={item} label={item} active={futureObjective === item} onPress={() => setFutureObjective(item)} />)}</View></Card>
      <Card><Text style={styles.cardTitle}>2. Realidade de hoje</Text><Text style={styles.cardText}>Escolha a opção mais honesta. O app precisa mandar a real, não agradar.</Text><View style={styles.chipWrap}>{stages.map((item) => <Chip key={item} label={item} active={futureStage === item} onPress={() => setFutureStage(item)} />)}</View></Card>
      <Card><Text style={styles.cardTitle}>3. Números básicos</Text>
        <View style={styles.twoCols}><View style={styles.col}><Text style={styles.inputLabel}>Idade</Text><TextInput value={futureAge} onChangeText={setFutureAge} keyboardType="numeric" style={styles.input} /></View><View style={styles.col}><Text style={styles.inputLabel}>Dependentes</Text><TextInput value={futureDependents} onChangeText={setFutureDependents} keyboardType="numeric" style={styles.input} /></View></View>
        <Text style={styles.inputLabel}>Renda líquida mensal</Text><TextInput value={futureIncome} onChangeText={setFutureIncome} keyboardType="numeric" placeholder="8000" placeholderTextColor="#64748b" style={styles.input} />
        <Text style={styles.inputLabel}>Gastos mensais antes de guardar</Text><TextInput value={futureExpenses} onChangeText={setFutureExpenses} keyboardType="numeric" placeholder="6800" placeholderTextColor="#64748b" style={styles.input} />
        <View style={styles.twoCols}><View style={styles.col}><Text style={styles.inputLabel}>Dívidas totais</Text><TextInput value={futureDebt} onChangeText={setFutureDebt} keyboardType="numeric" style={styles.input} /></View><View style={styles.col}><Text style={styles.inputLabel}>Guarda/mês</Text><TextInput value={futureSavings} onChangeText={setFutureSavings} keyboardType="numeric" style={styles.input} /></View></View>
        <View style={styles.twoCols}><View style={styles.col}><Text style={styles.inputLabel}>Meta R$</Text><TextInput value={futureGoalAmount} onChangeText={setFutureGoalAmount} keyboardType="numeric" style={styles.input} /></View><View style={styles.col}><Text style={styles.inputLabel}>Prazo anos</Text><TextInput value={futureGoalYears} onChangeText={setFutureGoalYears} keyboardType="numeric" style={styles.input} /></View></View>
      </Card>
      <Card><Text style={styles.cardTitle}>4. Extrato/fatura opcional</Text><Text style={styles.cardText}>Cole linhas de extrato ou fatura. Futuramente entra upload PDF/CSV/OFX e Open Finance consentido.</Text><TextInput value={futureTransactions} onChangeText={setFutureTransactions} multiline placeholder="Ex: IFOOD R$ 82,90\nJUROS ROTATIVO R$ 140,00\nNETFLIX R$ 39,90" placeholderTextColor="#64748b" style={[styles.input, styles.textarea]} /><Button label={futureLoading ? 'Analisando...' : 'Gerar diagnóstico'} primary onPress={generateFutureReport} /></Card>
      {futureLoading && <ActivityIndicator color="#22d3ee" />}
      {futureReport && <Card warning><Text style={styles.kicker}>A REAL</Text><Text style={styles.heroTitle}>{futureReport.profile}</Text><Text style={styles.cardText}>{futureReport.stage}</Text><Text style={styles.realTalk}>{futureReport.realTalk}</Text><View style={styles.metricsGrid}><Text style={styles.metric}>Saúde {futureReport.freedomScore || 0}/100</Text><Text style={styles.metric}>Sobra {money(futureReport.monthlyBalance)}</Text><Text style={styles.metric}>Vazamento {money(futureReport.leakPotential)}</Text><Text style={styles.metric}>Horas {Number(futureReport.workHoursLost || 0).toFixed(1).replace('.', ',')}</Text></View><Text style={styles.cardTitle}>Cenários</Text><Text style={styles.rowText}>Conservador: {money(futureReport.conservative)}</Text><Text style={styles.rowText}>Base: {money(futureReport.base)}</Text><Text style={styles.rowText}>Acelerado: {money(futureReport.accelerated)}</Text><Text style={styles.cardTitle}>Oportunidades</Text>{(futureReport.opportunities || []).map((item) => <Text key={item} style={styles.bullet}>• {item}</Text>)}<Text style={styles.cardTitle}>Missão</Text><Text style={styles.cardText}>{futureReport.weekMission}</Text><Text style={styles.cardTitle}>Plano 90 dias</Text>{(futureReport.ninetyDayPlan || []).map((item) => <Text key={item} style={styles.bullet}>• {item}</Text>)}<Text style={styles.notice}>{futureReport.riskNotice}</Text></Card>}
    </View>;
  }

  function renderRadarIa() {
    return <View style={styles.stack}>
      <Card highlight><Text style={styles.kicker}>RADAR IA</Text><Text style={styles.heroTitle}>Digite o que quer analisar em linguagem natural.</Text><Text style={styles.heroText}>O agente entrega pesquisa, simulação e riscos. Não recomenda compra, venda nem executa ordens.</Text><View style={styles.rowWrap}><Text style={styles.badge}>{agentOnline ? 'Agent online' : 'Agent fallback'}</Text></View></Card>
      <Card><Text style={styles.cardTitle}>Pergunta</Text><TextInput value={radarPrompt} onChangeText={setRadarPrompt} multiline placeholder="Ex: analise BTC nos últimos 6 meses" placeholderTextColor="#64748b" style={[styles.input, styles.textareaSmall]} /><Text style={styles.inputLabel}>Ativo opcional</Text><TextInput value={radarSymbol} onChangeText={setRadarSymbol} autoCapitalize="characters" placeholder="PETR4.SA, BTC, IBOV..." placeholderTextColor="#64748b" style={styles.input} /><View style={styles.chipWrap}>{quickRadarPrompts.map((item) => <Chip key={item} label={item} active={radarPrompt === item} onPress={() => setRadarPrompt(item)} />)}</View><Button label={radarLoading ? 'Analisando...' : 'Gerar Radar IA'} primary onPress={generateRadarReport} /></Card>
      {radarLoading && <ActivityIndicator color="#22d3ee" />}
      {radarReport && <Card warning><Text style={styles.kicker}>{radarReport.mode || 'RADAR IA'}</Text><Text style={styles.heroTitle}>{radarReport.normalizedSymbol || 'Análise educativa'}</Text><Text style={styles.realTalk}>{radarReport.educationalSummary}</Text><Text style={styles.cardTitle}>Plano de pesquisa</Text>{(radarReport.researchPlan || []).map((item) => <Text key={item} style={styles.bullet}>• {item}</Text>)}<Text style={styles.cardTitle}>Plano de simulação</Text>{(radarReport.simulationPlan || []).map((item) => <Text key={item} style={styles.bullet}>• {item}</Text>)}<Text style={styles.cardTitle}>Riscos</Text>{(radarReport.risks || []).map((item) => <Text key={item} style={styles.bullet}>• {item}</Text>)}<Text style={styles.cardTitle}>Perguntas para você</Text>{(radarReport.investorQuestions || []).map((item) => <Text key={item} style={styles.bullet}>• {item}</Text>)}<Text style={styles.notice}>{radarReport.riskNotice}</Text></Card>}
    </View>;
  }

  function renderMercado() {
    return <View style={styles.stack}><Card><Text style={styles.cardTitle}>Mercado e macro</Text><Text style={styles.cardText}>Juros, inflação, câmbio e leitura de cenário.</Text></Card>{loading ? <ActivityIndicator color="#22d3ee" /> : macroItems.map((item) => <Card key={item.id || item.label}><View style={styles.sectionHeader}><Text style={styles.cardTitle}>{item.label}</Text><Text style={styles.sourceText}>{item.source}</Text></View><Text style={styles.bigValue}>{macroValue(item)}</Text><Text style={styles.cardText}>{item.interpretation}</Text></Card>)}<Card><Text style={styles.cardTitle}>Radar de ativos</Text>{marketData.map((item) => <View key={item.symbol} style={styles.assetRow}><View style={styles.flex1}><Text style={styles.assetTicker}>{cleanSymbol(item.symbol)}</Text><Text style={styles.rowText}>{item.symbol}</Text></View><View style={styles.assetNumbers}><Text style={styles.assetPrice}>{money(item.lastPrice)}</Text><Text style={item.changePercent >= 0 ? styles.greenText : styles.redText}>{pct(item.changePercent)}</Text></View></View>)}</Card></View>;
  }

  function renderPremium() {
    return <View style={styles.stack}><Card highlight><Text style={styles.kicker}>{hasPremium ? 'PREMIUM ATIVO' : 'PREMIUM F-INSIGHT'}</Text><Text style={styles.heroTitle}>Futuro IA + Radar IA + simulações.</Text><Text style={styles.heroText}>No Android, cobrança comercial deve usar Google Play Billing. Para revisão, o Premium é liberado sem pagamento.</Text>{hasPremium ? <View style={styles.accountPill}><Text style={styles.accountPillText}>Premium liberado para {account?.email}</Text></View> : <View style={styles.buttonRow}><Button label="Entrar" primary onPress={() => { setAuthMode('login'); setSection('conta'); }} /><Button label="Demo Premium" onPress={activatePremiumDemo} /></View>}</Card><Card><Text style={styles.rowTitle}>✓ Meu Futuro IA: objetivos, diagnóstico e plano de longo prazo.</Text></Card><Card><Text style={styles.rowTitle}>✓ Radar IA: análise educativa em linguagem natural.</Text></Card><Card><Text style={styles.rowTitle}>✓ Backtest educativo e simulações sem recomendação de compra/venda.</Text></Card></View>;
  }

  function renderMais() {
    return <View style={styles.stack}><Card><Text style={styles.cardTitle}>Área Logada institucional</Text><Text style={styles.cardText}>Cliente assessorado, assessor e escritório/admin ficam separados da conta comum.</Text><View style={styles.buttonRow}><Button label="Cliente" onPress={() => openWeb('/cliente')} /><Button label="Assessor" onPress={() => openWeb('/assessor')} /><Button label="Escritório" onPress={() => openWeb('/admin')} /></View></Card><Card><Text style={styles.cardTitle}>Privacidade</Text><View style={styles.buttonRow}><Button label="Privacidade" onPress={() => openWeb('/privacidade')} /><Button label="Excluir conta" onPress={() => openWeb('/excluir-conta')} /></View></Card>{account && <Card><Text style={styles.cardTitle}>Sessão</Text><Text style={styles.cardText}>{account.name} · {account.email}</Text><Button label="Sair" onPress={() => void persistSession(null)} /></Card>}</View>;
  }

  const content = section === 'hoje' ? renderHoje() : section === 'futuro' ? renderFuturo() : section === 'radarIa' ? renderRadarIa() : section === 'mercado' ? renderMercado() : section === 'conta' ? renderConta() : section === 'premium' ? renderPremium() : renderMais();
  const tabs: Array<{ key: Section; label: string }> = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'futuro', label: 'Futuro IA' },
    { key: 'radarIa', label: 'Radar IA' },
    { key: 'mercado', label: 'Mercado' },
    { key: 'conta', label: account ? 'Conta' : 'Entrar' },
    { key: 'mais', label: 'Mais' },
  ];

  return <SafeAreaView style={styles.safe}><StatusBar barStyle="light-content" backgroundColor="#020617" /><View style={styles.header}><View style={styles.logo}><Text style={styles.logoText}>FI</Text></View><View style={styles.headerCopy}><Text style={styles.brand}>F-Insight</Text><Text style={styles.headerSub}>{account ? `${account.name} · ${account.plan}` : 'mercado, futuro e IA'}</Text></View><Pressable onPress={() => setSection('mais')}><Text style={styles.menuIcon}>☰</Text></Pressable></View><ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>{content}</ScrollView><View style={styles.tabbar}>{tabs.map((tab) => <Pressable key={tab.key} onPress={() => setSection(tab.key)} style={[styles.tab, section === tab.key && styles.tabActive]}><Text style={[styles.tabText, section === tab.key && styles.tabTextActive]}>{tab.label}</Text></Pressable>)}</View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#0f172a', backgroundColor: '#020617' },
  logo: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0e7490', borderWidth: 1, borderColor: '#22d3ee' },
  logoText: { fontSize: 20, color: '#fff', fontWeight: '900' },
  headerCopy: { flex: 1 },
  brand: { color: '#fff', fontWeight: '900', fontSize: 20 },
  headerSub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  menuIcon: { color: '#e2e8f0', fontSize: 30, paddingHorizontal: 8 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 122 },
  stack: { gap: 14 },
  card: { borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#0f172a', borderRadius: 24, padding: 18 },
  cardHighlight: { borderColor: '#164e63', backgroundColor: '#082f49' },
  cardWarning: { borderColor: '#92400e', backgroundColor: '#451a03' },
  kicker: { color: '#67e8f9', fontSize: 11, fontWeight: '900', letterSpacing: 1.4, marginBottom: 10 },
  heroTitle: { color: '#fff', fontSize: 27, lineHeight: 33, fontWeight: '900' },
  heroText: { color: '#cbd5e1', fontSize: 15, lineHeight: 23, marginTop: 10 },
  cardTitle: { color: '#fff', fontSize: 20, fontWeight: '900', marginTop: 8 },
  cardText: { color: '#cbd5e1', fontSize: 14, lineHeight: 21, marginTop: 8 },
  realTalk: { color: '#ffedd5', fontSize: 16, lineHeight: 24, marginTop: 14, fontWeight: '800' },
  notice: { color: '#fef3c7', fontSize: 12, lineHeight: 18, marginTop: 14 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  badge: { color: '#67e8f9', backgroundColor: '#083344', fontSize: 11, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: 'hidden' },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  button: { borderWidth: 1, borderColor: '#334155', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#020617', marginTop: 12 },
  buttonPrimary: { backgroundColor: '#22d3ee', borderColor: '#22d3ee' },
  buttonText: { color: '#e2e8f0', fontWeight: '900', fontSize: 13 },
  buttonPrimaryText: { color: '#020617' },
  accountPill: { marginTop: 16, borderRadius: 16, backgroundColor: '#064e3b', padding: 12 },
  accountPillText: { color: '#bbf7d0', fontWeight: '900' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 12 },
  sourceText: { color: '#94a3b8', fontSize: 11, marginTop: 4 },
  bigValue: { color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 10 },
  rowTitle: { color: '#fff', fontSize: 16, fontWeight: '900', lineHeight: 22 },
  rowText: { color: '#cbd5e1', fontSize: 13, lineHeight: 19, marginTop: 4 },
  bullet: { color: '#fde68a', fontSize: 14, lineHeight: 22, marginTop: 6 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  chip: { borderWidth: 1, borderColor: '#334155', backgroundColor: '#020617', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  chipActive: { backgroundColor: '#22d3ee', borderColor: '#22d3ee' },
  chipText: { color: '#cbd5e1', fontWeight: '800', fontSize: 12 },
  chipTextActive: { color: '#020617' },
  inputLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '900', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#334155', backgroundColor: '#020617', color: '#fff', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textarea: { minHeight: 122, textAlignVertical: 'top' },
  textareaSmall: { minHeight: 88, textAlignVertical: 'top' },
  twoCols: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  segment: { flexDirection: 'row', gap: 8, padding: 4, backgroundColor: '#020617', borderRadius: 16, marginTop: 16 },
  segmentItem: { flex: 1, borderRadius: 12, paddingVertical: 10, alignItems: 'center' },
  segmentItemActive: { backgroundColor: '#22d3ee' },
  segmentText: { color: '#cbd5e1', fontWeight: '900' },
  segmentTextActive: { color: '#020617' },
  successBox: { color: '#bbf7d0', backgroundColor: '#064e3b', padding: 12, borderRadius: 14, marginTop: 12, fontWeight: '800' },
  errorBox: { color: '#fecaca', backgroundColor: '#7f1d1d', padding: 12, borderRadius: 14, marginTop: 12, fontWeight: '800' },
  helperText: { color: '#94a3b8', fontSize: 12, lineHeight: 18, marginTop: 12 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14, marginBottom: 8 },
  metric: { color: '#fff', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 9, fontWeight: '900', fontSize: 12, overflow: 'hidden' },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: '#1e293b', paddingVertical: 12 },
  flex1: { flex: 1 },
  assetTicker: { color: '#67e8f9', fontSize: 17, fontWeight: '900' },
  assetNumbers: { alignItems: 'flex-end' },
  assetPrice: { color: '#fff', fontSize: 16, fontWeight: '900' },
  greenText: { color: '#86efac', fontWeight: '900', marginTop: 4 },
  redText: { color: '#fca5a5', fontWeight: '900', marginTop: 4 },
  tabbar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 5, paddingHorizontal: 8, paddingTop: 10, paddingBottom: 14, backgroundColor: '#020617', borderTopWidth: 1, borderTopColor: '#0f172a' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 12 },
  tabActive: { backgroundColor: '#083344' },
  tabText: { color: '#94a3b8', fontSize: 10, fontWeight: '900' },
  tabTextActive: { color: '#67e8f9' },
});
