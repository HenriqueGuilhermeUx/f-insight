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

type Section = 'hoje' | 'futuro' | 'radar' | 'ativos' | 'mercado' | 'conta' | 'premium' | 'mais';
type AuthMode = 'login' | 'signup';
type Plan = 'free' | 'premium';
type Account = { name: string; email: string; plan: Plan };
type StoredAccount = Account & { password: string };
type LiveIndicator = { symbol: string; lastPrice: number; changePercent: number; fetchedAt?: string };
type MacroItem = { id: string; label: string; value: number; unit: string; source?: string; interpretation?: string };
type FutureReport = {
  profile: string;
  stage: string;
  realTalk: string;
  freedomScore: number;
  monthlyBalance: number;
  savingsRate: number;
  leakPotential: number;
  workHoursLost: number;
  targetLabel: string;
  conservative: number;
  base: number;
  accelerated: number;
  opportunities: string[];
  weekMission: string;
  ninetyDayPlan: string[];
  openFinanceNext: string;
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

const indexCards = [
  { label: 'IBOV', value: '178.002', change: 'acompanhar' },
  { label: 'S&P 500', value: '7.600', change: '+1,48%' },
  { label: 'Dólar', value: 'R$ 5,10', change: '+0,15%' },
  { label: 'Bitcoin', value: 'US$ 63.898', change: '+1,90%' },
];

const news = [
  { title: 'Mercado acompanha juros, dólar, commodities e temporada de balanços.', source: 'F-Insight Research' },
  { title: 'Bancos seguem sensíveis à curva de juros e qualidade do crédito.', source: 'Radar Brasil' },
  { title: 'Valuation exige disciplina quando a Selic está elevada.', source: 'Painel Macro' },
];

const screenerRows = [
  { ticker: 'PETR4', name: 'Petrobras PN', pe: '5,1x', pvp: '1,2x', dy: '12,4%', roe: '23%' },
  { ticker: 'BBAS3', name: 'Banco do Brasil ON', pe: '4,8x', pvp: '0,9x', dy: '9,8%', roe: '21%' },
  { ticker: 'VALE3', name: 'Vale ON', pe: '6,7x', pvp: '1,4x', dy: '7,1%', roe: '18%' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco PN', pe: '8,9x', pvp: '1,7x', dy: '6,2%', roe: '20%' },
];

const premiumFeatures = [
  'Meu Futuro IA: objetivos, diagnóstico comportamental e plano de longo prazo.',
  'Screener avançado por valor, dividendos, qualidade, risco e liquidez.',
  'Carteira simulada, alertas inteligentes, backtesting e relatórios semanais.',
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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function numberFromInput(value: string) {
  const normalized = value.replace(/\./g, '').replace(',', '.').replace(/[^0-9.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function cleanSymbol(symbol: string) {
  return symbol.replace('.SA', '');
}

function symbolName(symbol: string) {
  const names: Record<string, string> = {
    'PETR4.SA': 'Petrobras PN',
    'VALE3.SA': 'Vale ON',
    'ITUB4.SA': 'Itaú Unibanco PN',
    'BBAS3.SA': 'Banco do Brasil ON',
    'BBDC4.SA': 'Bradesco PN',
    'WEGE3.SA': 'WEG ON',
  };
  return names[symbol] || cleanSymbol(symbol);
}

function money(value: number) {
  return Number.isFinite(value) ? `R$ ${value.toFixed(2).replace('.', ',')}` : 'R$ 0,00';
}

function pct(value: number) {
  return Number.isFinite(value) ? `${value >= 0 ? '+' : ''}${value.toFixed(2).replace('.', ',')}%` : '0,00%';
}

function macroValue(item: MacroItem) {
  if (item.unit === 'BRL') return `R$ ${item.value.toFixed(2).replace('.', ',')}`;
  return `${item.value.toFixed(2).replace('.', ',')}%`;
}

function futureValue(monthly: number, annualRate: number, years: number) {
  const months = Math.max(1, Math.round(years * 12));
  const monthlyRate = Math.pow(1 + annualRate, 1 / 12) - 1;
  if (monthlyRate === 0) return monthly * months;
  return monthly * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

function openWeb(path: string) {
  void Linking.openURL(`${WEB_URL}${path.startsWith('/') ? path : `/${path}`}`);
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
  const [isLive, setIsLive] = useState(false);
  const [isMacroLive, setIsMacroLive] = useState(false);
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [macroItems, setMacroItems] = useState<MacroItem[]>(macroFallback);
  const [accounts, setAccounts] = useState<StoredAccount[]>([]);
  const [account, setAccount] = useState<Account | null>(null);
  const [watch, setWatch] = useState(['PETR4.SA', 'ITUB4.SA', 'BBAS3.SA']);
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

  useEffect(() => {
    let cancelled = false;

    async function boot() {
      try {
        const [savedAccounts, savedSession, savedFuture] = await Promise.all([
          AsyncStorage.getItem(ACCOUNTS_KEY),
          AsyncStorage.getItem(SESSION_KEY),
          AsyncStorage.getItem(FUTURE_REPORT_KEY),
        ]);
        if (!cancelled) {
          setAccounts(savedAccounts ? JSON.parse(savedAccounts) : []);
          if (savedSession) setAccount(JSON.parse(savedSession));
          if (savedFuture) setFutureReport(JSON.parse(savedFuture));
        }
      } catch {
        // O app continua funcionando mesmo sem storage local.
      }

      try {
        const [liveResponse, macroResponse] = await Promise.allSettled([
          fetch(`${API_URL}/api/live/indicators`),
          fetch(`${API_URL}/api/macro/overview?refresh=true`),
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
      } catch {
        if (!cancelled) {
          setIndicators([]);
          setMacroItems(macroFallback);
          setIsLive(false);
          setIsMacroLive(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    boot();
    return () => { cancelled = true; };
  }, []);

  const marketData = indicators.length > 0 ? indicators : fallbackIndicators;
  const watchedAssets = marketData.filter((item) => watch.includes(item.symbol));
  const avgChange = marketData.reduce((sum, item) => sum + item.changePercent, 0) / marketData.length;
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
    setMessage('Conta gratuita criada e salva neste aparelho. Use Entrar para acessar depois.');
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

  function toggleWatch(symbol: string) {
    setWatch((current) => (current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol]));
  }

  async function generateFutureReport() {
    const income = numberFromInput(futureIncome);
    const expenses = numberFromInput(futureExpenses);
    const debt = numberFromInput(futureDebt);
    const savings = numberFromInput(futureSavings);
    const target = numberFromInput(futureGoalAmount);
    const years = Math.max(1, numberFromInput(futureGoalYears) || 10);
    const age = Math.max(0, numberFromInput(futureAge));
    const dependents = Math.max(0, numberFromInput(futureDependents));
    const balance = income - expenses - savings;
    const savingsRate = income > 0 ? savings / income : 0;
    const debtPressure = income > 0 ? debt / income : 0;
    const leakPotential = Math.max(0, balance * 0.6 + (futureTransactions.length > 40 ? income * 0.03 : 0));
    const hourly = income > 0 ? income / 176 : 0;
    const workHoursLost = hourly > 0 ? leakPotential / hourly : 0;

    let profile = 'Malabarista';
    let stage = 'Você trabalha para manter o mês em pé.';
    let realTalk = 'Seu dinheiro entra, paga o mês e não compra futuro. A prioridade agora é criar folga antes de falar em sofisticação.';

    if (balance < 0 || debtPressure > 2) {
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
    } else if (savingsRate >= 0.1 && target > 0) {
      profile = savingsRate >= 0.25 ? 'Estrategista' : 'Construtor';
      stage = savingsRate >= 0.25 ? 'Agora o jogo é proteger, otimizar e transformar patrimônio em liberdade.' : 'Você já constrói, mas precisa conectar aportes com objetivos claros.';
      realTalk = savingsRate >= 0.25 ? 'Você está acima da média em disciplina. O próximo salto é clareza: para que vida exatamente esse patrimônio está trabalhando?' : 'Você está no caminho. Agora precisamos parar de acumular no escuro e transformar cada aporte em avanço mensurável.';
    }

    if (futureObjective === 'Sair do vermelho') {
      realTalk = debt > 0 ? `Sua prioridade não é render mais: é parar de pagar o passado. A dívida declarada de ${money(debt)} precisa virar plano de ataque.` : 'Você escolheu sair do vermelho, mas não informou dívida. Se existe parcelamento, rotativo ou atraso, coloque o valor para o diagnóstico ficar honesto.';
    }

    if (dependents > 0 && profile !== 'Sangria') {
      realTalk += ` Como existem ${dependents} dependente(s), cada vazamento também atrasa proteção familiar, reserva e escolhas futuras.`;
    }

    const score = Math.max(0, Math.min(100, Math.round(35 + savingsRate * 180 - Math.max(0, debtPressure - 0.5) * 18 + (balance > 0 ? 10 : -15) + (target > 0 ? 8 : 0))));
    const conservative = futureValue(Math.max(0, savings), 0.04, years);
    const base = futureValue(Math.max(0, savings + leakPotential * 0.5), 0.07, years);
    const accelerated = futureValue(Math.max(0, savings + leakPotential), 0.09, years);

    const opportunities = [
      leakPotential > 0 ? `Redirecionar ${money(leakPotential)} por mês de vazamentos para a meta. Isso representa ${workHoursLost.toFixed(1).replace('.', ',')} horas de trabalho recuperadas.` : 'Criar um valor mínimo automático para a meta antes do dinheiro circular no mês.',
      debt > 0 ? `Atacar a dívida de ${money(debt)} antes de aumentar risco. Dívida cara é um anti-investimento.` : 'Separar reserva de emergência antes de buscar complexidade.',
      target > 0 ? `Transformar a meta de ${money(target)} em marcos trimestrais, não em desejo distante.` : 'Definir valor alvo e prazo. Sem alvo, qualquer sobra parece progresso.',
    ];

    if (futureObjective === 'Comprar imóvel') opportunities.push('Comparar compra agora com esperar e aumentar entrada. Parcela alta pode comprar ansiedade, não casa.');
    if (futureObjective === 'Aposentar com renda') opportunities.push('Simular renda futura por cenário conservador, base e acelerado, sem depender de promessa de ativo específico.');
    if (futureObjective === 'Montar reserva') opportunities.push('Primeiro alvo: 1 mês de custo de vida. Depois 3, 6 e 12 meses, conforme estabilidade da renda.');

    const report: FutureReport = {
      profile,
      stage,
      realTalk,
      freedomScore: score,
      monthlyBalance: balance,
      savingsRate,
      leakPotential,
      workHoursLost,
      targetLabel: `${futureObjective} em ${years} anos${age > 0 ? ` · idade atual ${age}` : ''}`,
      conservative,
      base,
      accelerated,
      opportunities,
      weekMission: profile === 'Sangria' ? 'Missão 7 dias: congelar gasto variável não essencial, listar todas as dívidas e escolher uma para renegociar primeiro.' : 'Missão 7 dias: escolher um vazamento, cortar ou reduzir, e transferir o valor para uma caixinha chamada Liberdade.',
      ninetyDayPlan: [
        'Semana 1: organizar renda, custos fixos, dívidas e recorrências.',
        'Dia 30: criar folga mínima mensal e primeira meta automática.',
        'Dia 60: revisar comportamento de consumo e travar o maior vazamento.',
        'Dia 90: recalcular rota e transformar o plano em acompanhamento mensal.',
      ],
      openFinanceNext: 'Próxima evolução: conectar Open Finance para ler extratos, cartões e saldo de forma consentida, transformando este diagnóstico em acompanhamento vivo.',
    };

    setFutureReport(report);
    await AsyncStorage.setItem(FUTURE_REPORT_KEY, JSON.stringify(report));
  }

  function renderHoje() {
    return <View style={styles.stack}>
      <Card highlight>
        <Text style={styles.kicker}>F-INSIGHT PARA INVESTIDORES</Text>
        <Text style={styles.heroTitle}>Veja o mercado, planeje sua vida financeira e aprofunde com Premium.</Text>
        <Text style={styles.heroText}>Cotações, macro, notícias, radar, fundamentos e Meu Futuro IA em uma experiência simples.</Text>
        <View style={styles.rowWrap}><Text style={styles.badge}>{isLive ? 'Cotações online' : 'cotações demo'}</Text><Text style={styles.badge}>{isMacroLive ? 'Macro online BCB' : 'macro fallback'}</Text></View>
        {account ? <View style={styles.accountPill}><Text style={styles.accountPillText}>{account.plan === 'premium' ? 'Premium ativo' : 'Conta grátis ativa'} · {account.name}</Text></View> : <View style={styles.buttonRow}><Button label="Criar conta grátis" primary onPress={() => { setAuthMode('signup'); setSection('conta'); }} /><Button label="Entrar" onPress={() => { setAuthMode('login'); setSection('conta'); }} /></View>}
      </Card>
      <Card warning><Text style={styles.cardTitle}>Novo: Meu Futuro IA</Text><Text style={styles.cardText}>Escolha um objetivo, informe sua realidade e receba uma leitura direta: perfil financeiro, vazamentos, horas de vida, plano de 7 dias e cenário de longo prazo.</Text><Button label="Começar diagnóstico" primary onPress={() => setSection('futuro')} /></Card>
      <View style={styles.indexGrid}>{indexCards.map((item) => <View key={item.label} style={styles.indexCard}><Text style={styles.indexLabel}>{item.label}</Text><Text style={styles.indexValue}>{item.value}</Text><Text style={styles.greenText}>{item.change}</Text></View>)}</View>
      <Card><Text style={styles.cardTitle}>{mood.title}</Text><Text style={styles.cardText}>{mood.text}</Text></Card>
      <Card><View style={styles.sectionHeader}><Text style={styles.cardTitle}>Painel macro</Text><Text style={styles.sourceText}>{isMacroLive ? 'online BCB' : 'fallback'}</Text></View>{macroItems.map((item) => <View key={item.id || item.label} style={styles.macroRow}><View style={styles.flex1}><Text style={styles.rowTitle}>{item.label}</Text><Text style={styles.rowText}>{item.interpretation}</Text></View><View style={styles.macroValueBox}><Text style={styles.macroValue}>{macroValue(item)}</Text><Text style={styles.sourceText}>{item.source}</Text></View></View>)}</Card>
      <Card><Text style={styles.cardTitle}>Últimas notícias</Text>{news.map((item) => <View key={item.title} style={styles.newsRow}><Text style={styles.rowTitle}>{item.title}</Text><Text style={styles.rowText}>{item.source}</Text></View>)}</Card>
    </View>;
  }

  function renderFuturo() {
    return <View style={styles.stack}>
      <Card highlight>
        <Text style={styles.kicker}>MEU FUTURO IA</Text>
        <Text style={styles.heroTitle}>Seu extrato precisa virar consciência, não só categoria.</Text>
        <Text style={styles.heroText}>MVP inicial: diagnóstico por formulário e texto colado. Próximo passo: upload de extrato/fatura e Open Finance consentido.</Text>
        {!hasPremium && <View style={styles.buttonRow}><Button label="Liberar demo Premium" primary onPress={activatePremiumDemo} /><Button label="Entrar" onPress={() => { setAuthMode('login'); setSection('conta'); }} /></View>}
      </Card>

      <Card><Text style={styles.cardTitle}>1. Objetivo principal</Text><View style={styles.chipWrap}>{objectives.map((item) => <Chip key={item} label={item} active={futureObjective === item} onPress={() => setFutureObjective(item)} />)}</View></Card>

      <Card><Text style={styles.cardTitle}>2. Realidade de hoje</Text><Text style={styles.cardText}>Escolha a opção mais honesta. O app precisa mandar a real, não agradar.</Text><View style={styles.chipWrap}>{stages.map((item) => <Chip key={item} label={item} active={futureStage === item} onPress={() => setFutureStage(item)} />)}</View></Card>

      <Card><Text style={styles.cardTitle}>3. Números básicos</Text>
        <View style={styles.twoCols}><View style={styles.col}><Text style={styles.inputLabel}>Idade</Text><TextInput value={futureAge} onChangeText={setFutureAge} keyboardType="numeric" style={styles.input} /></View><View style={styles.col}><Text style={styles.inputLabel}>Dependentes</Text><TextInput value={futureDependents} onChangeText={setFutureDependents} keyboardType="numeric" style={styles.input} /></View></View>
        <Text style={styles.inputLabel}>Renda líquida mensal</Text><TextInput value={futureIncome} onChangeText={setFutureIncome} keyboardType="numeric" placeholder="8000" placeholderTextColor="#64748b" style={styles.input} />
        <Text style={styles.inputLabel}>Gastos mensais antes de guardar</Text><TextInput value={futureExpenses} onChangeText={setFutureExpenses} keyboardType="numeric" placeholder="6800" placeholderTextColor="#64748b" style={styles.input} />
        <View style={styles.twoCols}><View style={styles.col}><Text style={styles.inputLabel}>Dívidas totais</Text><TextInput value={futureDebt} onChangeText={setFutureDebt} keyboardType="numeric" style={styles.input} /></View><View style={styles.col}><Text style={styles.inputLabel}>Guarda/mês</Text><TextInput value={futureSavings} onChangeText={setFutureSavings} keyboardType="numeric" style={styles.input} /></View></View>
        <View style={styles.twoCols}><View style={styles.col}><Text style={styles.inputLabel}>Meta R$</Text><TextInput value={futureGoalAmount} onChangeText={setFutureGoalAmount} keyboardType="numeric" style={styles.input} /></View><View style={styles.col}><Text style={styles.inputLabel}>Prazo anos</Text><TextInput value={futureGoalYears} onChangeText={setFutureGoalYears} keyboardType="numeric" style={styles.input} /></View></View>
      </Card>

      <Card><Text style={styles.cardTitle}>4. Texto do extrato ou fatura</Text><Text style={styles.cardText}>Cole aqui linhas importantes do extrato/fatura. No MVP isso ajuda a IA a detectar padrões. Depois vamos trocar por upload PDF/CSV/OFX e Open Finance.</Text><TextInput value={futureTransactions} onChangeText={setFutureTransactions} multiline placeholder="Ex: IFOOD 89,90; UBER 42,00; JUROS ROTATIVO 320,00; NETFLIX 55,90..." placeholderTextColor="#64748b" style={[styles.input, styles.textArea]} /><Button label="Gerar diagnóstico" primary onPress={generateFutureReport} /></Card>

      {futureReport && <>
        <Card warning><Text style={styles.kicker}>A REAL</Text><Text style={styles.heroTitle}>{futureReport.profile}</Text><Text style={styles.cardText}>{futureReport.stage}</Text><Text style={styles.realTalk}>{futureReport.realTalk}</Text></Card>
        <View style={styles.indexGrid}><View style={styles.indexCard}><Text style={styles.indexLabel}>Saúde financeira</Text><Text style={styles.indexValue}>{futureReport.freedomScore}/100</Text></View><View style={styles.indexCard}><Text style={styles.indexLabel}>Sobra real</Text><Text style={styles.indexValue}>{money(futureReport.monthlyBalance)}</Text></View><View style={styles.indexCard}><Text style={styles.indexLabel}>Poupança</Text><Text style={styles.indexValue}>{(futureReport.savingsRate * 100).toFixed(1).replace('.', ',')}%</Text></View><View style={styles.indexCard}><Text style={styles.indexLabel}>Horas recuperáveis</Text><Text style={styles.indexValue}>{futureReport.workHoursLost.toFixed(1).replace('.', ',')}h</Text></View></View>
        <Card><Text style={styles.cardTitle}>Oportunidades encontradas</Text>{futureReport.opportunities.map((item) => <Text key={item} style={styles.bullet}>• {item}</Text>)}</Card>
        <Card><Text style={styles.cardTitle}>Cenários para {futureReport.targetLabel}</Text><View style={styles.metricsGrid}><Text style={styles.metric}>Conservador {money(futureReport.conservative)}</Text><Text style={styles.metric}>Base {money(futureReport.base)}</Text><Text style={styles.metric}>Acelerado {money(futureReport.accelerated)}</Text></View><Text style={styles.helperText}>Simulação educativa. Não é recomendação de investimento nem promessa de rentabilidade.</Text></Card>
        <Card><Text style={styles.cardTitle}>Missão da semana</Text><Text style={styles.realTalk}>{futureReport.weekMission}</Text></Card>
        <Card><Text style={styles.cardTitle}>Plano de 90 dias</Text>{futureReport.ninetyDayPlan.map((item) => <Text key={item} style={styles.bullet}>• {item}</Text>)}</Card>
        <Card><Text style={styles.cardTitle}>Open Finance depois</Text><Text style={styles.cardText}>{futureReport.openFinanceNext}</Text><Text style={styles.helperText}>Integração futura: Pluggy/Klavi para leitura consentida; Efí/Open Finance/PISP para ações assistidas em fases posteriores.</Text></Card>
      </>}
    </View>;
  }

  function renderConta() {
    return <View style={styles.stack}>
      <Card highlight><Text style={styles.kicker}>CONTA DO INVESTIDOR</Text><Text style={styles.heroTitle}>{authMode === 'signup' ? 'Crie seu acesso grátis.' : 'Entre com sua conta.'}</Text><Text style={styles.heroText}>Cliente assessorado, assessor e escritório ficam separados no menu Mais.</Text><View style={styles.segment}><Pressable onPress={() => setAuthMode('login')} style={[styles.segmentItem, authMode === 'login' && styles.segmentItemActive]}><Text style={[styles.segmentText, authMode === 'login' && styles.segmentTextActive]}>Entrar</Text></Pressable><Pressable onPress={() => setAuthMode('signup')} style={[styles.segmentItem, authMode === 'signup' && styles.segmentItemActive]}><Text style={[styles.segmentText, authMode === 'signup' && styles.segmentTextActive]}>Criar grátis</Text></Pressable></View></Card>
      <Card>{authMode === 'signup' && <><Text style={styles.inputLabel}>Nome completo</Text><TextInput value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor="#64748b" style={styles.input} /></>}<Text style={styles.inputLabel}>E-mail</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="seu@email.com" placeholderTextColor="#64748b" style={styles.input} /><Text style={styles.inputLabel}>Senha</Text><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="mínimo 6 caracteres" placeholderTextColor="#64748b" style={styles.input} />{message ? <Text style={message.includes('criada') || message.includes('liberado') || message.includes('acessada') ? styles.successBox : styles.errorBox}>{message}</Text> : null}<View style={styles.buttonRow}><Button label={authMode === 'signup' ? 'Criar conta' : 'Entrar'} primary onPress={authMode === 'signup' ? createFreeAccount : loginAccount} /><Button label="Ver mercado" onPress={() => setSection('hoje')} /></View><Text style={styles.helperText}>Para revisão Google: use o e-mail informado na Play Console e qualquer senha com 6 ou mais caracteres.</Text></Card>
    </View>;
  }

  function renderRadar() {
    return <View style={styles.stack}><Card><Text style={styles.cardTitle}>Radar Brasil</Text><Text style={styles.cardText}>Acompanhe ativos, preços e variações.</Text></Card>{loading ? <ActivityIndicator color="#22d3ee" /> : marketData.map((item) => <Pressable key={item.symbol} style={styles.assetRow} onPress={() => openWeb(`/ativo/${cleanSymbol(item.symbol)}`)}><View style={styles.flex1}><Text style={styles.assetTicker}>{cleanSymbol(item.symbol)}</Text><Text style={styles.rowText}>{symbolName(item.symbol)}</Text></View><View style={styles.assetNumbers}><Text style={styles.assetPrice}>{money(item.lastPrice)}</Text><Text style={item.changePercent >= 0 ? styles.greenText : styles.redText}>{pct(item.changePercent)}</Text></View><Pressable style={styles.watchButton} onPress={() => toggleWatch(item.symbol)}><Text style={styles.watchButtonText}>{watch.includes(item.symbol) ? '✓' : '+'}</Text></Pressable></Pressable>)}</View>;
  }

  function renderAtivos() {
    return <View style={styles.stack}><Card><Text style={styles.cardTitle}>Screener fundamentalista</Text><Text style={styles.cardText}>P/L, P/VP, dividend yield e ROE para estudar ativos.</Text></Card>{screenerRows.map((item) => <Card key={item.ticker}><View style={styles.sectionHeader}><View><Text style={styles.assetTicker}>{item.ticker}</Text><Text style={styles.rowText}>{item.name}</Text></View></View><View style={styles.metricsGrid}><Text style={styles.metric}>P/L {item.pe}</Text><Text style={styles.metric}>P/VP {item.pvp}</Text><Text style={styles.metric}>DY {item.dy}</Text><Text style={styles.metric}>ROE {item.roe}</Text></View></Card>)}<Card><Text style={styles.cardTitle}>Graham & Valor</Text><Text style={styles.cardText}>Ranking educativo por margem de segurança, múltiplos e qualidade.</Text><Button label="Ver Premium" primary onPress={() => setSection('premium')} /></Card></View>;
  }

  function renderMercado() {
    return <View style={styles.stack}><Card><Text style={styles.cardTitle}>Mercado e macro</Text><Text style={styles.cardText}>Juros, inflação, câmbio e leitura de cenário.</Text></Card>{macroItems.map((item) => <Card key={item.id || item.label}><View style={styles.sectionHeader}><Text style={styles.cardTitle}>{item.label}</Text><Text style={styles.sourceText}>{item.source}</Text></View><Text style={styles.bigValue}>{macroValue(item)}</Text><Text style={styles.cardText}>{item.interpretation}</Text></Card>)}</View>;
  }

  function renderPremium() {
    return <View style={styles.stack}><Card highlight><Text style={styles.kicker}>{hasPremium ? 'PREMIUM ATIVO' : 'PREMIUM F-INSIGHT'}</Text><Text style={styles.heroTitle}>Premium agora é sobre construir sua vida financeira.</Text><Text style={styles.heroText}>Meu Futuro IA, diagnóstico comportamental, planos de objetivo, screener, alertas e backtesting educativo.</Text>{hasPremium ? <View style={styles.accountPill}><Text style={styles.accountPillText}>Premium liberado para {account?.email}</Text></View> : <View style={styles.buttonRow}><Button label="Entrar" primary onPress={() => { setAuthMode('login'); setSection('conta'); }} /><Button label="Demo Premium" onPress={activatePremiumDemo} /></View>}</Card>{premiumFeatures.map((item) => <Card key={item}><Text style={styles.rowTitle}>✓ {item}</Text></Card>)}<Card warning><Text style={styles.cardTitle}>Meu Futuro IA</Text><Text style={styles.cardText}>Pare de olhar só mercado. Descubra se seu dinheiro está financiando seus objetivos ou sabotando sua vida.</Text><Button label="Abrir Meu Futuro IA" primary onPress={() => setSection('futuro')} /></Card></View>;
  }

  function renderMais() {
    return <View style={styles.stack}><Card><Text style={styles.cardTitle}>Minha lista</Text>{watchedAssets.length === 0 ? <Text style={styles.cardText}>Toque no + do radar para acompanhar ativos.</Text> : watchedAssets.map((item) => <View key={item.symbol} style={styles.newsRow}><Text style={styles.rowTitle}>{cleanSymbol(item.symbol)} · {money(item.lastPrice)}</Text><Text style={item.changePercent >= 0 ? styles.greenText : styles.redText}>{pct(item.changePercent)}</Text></View>)}</Card><Card><Text style={styles.cardTitle}>Área Logada institucional</Text><Text style={styles.cardText}>Cliente assessorado, assessor e escritório/admin ficam separados da conta comum.</Text><View style={styles.buttonRow}><Button label="Cliente" onPress={() => openWeb('/cliente')} /><Button label="Assessor" onPress={() => openWeb('/assessor')} /><Button label="Escritório" onPress={() => openWeb('/admin')} /></View></Card><Card><Text style={styles.cardTitle}>Privacidade</Text><View style={styles.buttonRow}><Button label="Privacidade" onPress={() => openWeb('/privacidade')} /><Button label="Excluir conta" onPress={() => openWeb('/excluir-conta')} /></View></Card><Card><Text style={styles.cardTitle}>Sair</Text><Button label="Encerrar sessão" onPress={() => void persistSession(null)} /></Card></View>;
  }

  const content = section === 'hoje' ? renderHoje() : section === 'futuro' ? renderFuturo() : section === 'radar' ? renderRadar() : section === 'ativos' ? renderAtivos() : section === 'mercado' ? renderMercado() : section === 'conta' ? renderConta() : section === 'premium' ? renderPremium() : renderMais();
  const tabs: Array<{ key: Section; label: string }> = [{ key: 'hoje', label: 'Hoje' }, { key: 'futuro', label: 'Futuro IA' }, { key: 'radar', label: 'Radar' }, { key: 'ativos', label: 'Ativos' }, { key: 'premium', label: 'Premium' }, { key: 'conta', label: account ? 'Conta' : 'Entrar' }, { key: 'mais', label: 'Mais' }];

  return <SafeAreaView style={styles.safe}><StatusBar barStyle="light-content" backgroundColor="#020617" /><View style={styles.header}><View style={styles.logo}><Text style={styles.logoText}>FI</Text></View><View style={styles.headerCopy}><Text style={styles.brand}>F-Insight</Text><Text style={styles.headerSub}>{account ? `${account.name} · ${account.plan}` : 'mercado, dados e futuro financeiro'}</Text></View><Pressable onPress={() => setSection('mais')}><Text style={styles.menuIcon}>☰</Text></Pressable></View><ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>{content}</ScrollView><View style={styles.tabbar}>{tabs.map((tab) => <Pressable key={tab.key} onPress={() => setSection(tab.key)} style={[styles.tab, section === tab.key && styles.tabActive]}><Text style={[styles.tabText, section === tab.key && styles.tabTextActive]}>{tab.label}</Text></Pressable>)}</View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#0f172a', backgroundColor: '#020617' },
  logo: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#0e7490', borderWidth: 2, borderColor: '#22d3ee' },
  logoText: { fontSize: 20, color: '#fff', fontWeight: '900' },
  headerCopy: { flex: 1 },
  brand: { color: '#fff', fontWeight: '900', fontSize: 20 },
  headerSub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  menuIcon: { color: '#e2e8f0', fontSize: 30, paddingHorizontal: 8 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 118 },
  stack: { gap: 14 },
  card: { borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#0f172a', borderRadius: 24, padding: 18 },
  cardHighlight: { borderColor: '#164e63', backgroundColor: '#082f49' },
  cardWarning: { borderColor: '#92400e', backgroundColor: '#431407' },
  kicker: { color: '#67e8f9', fontSize: 11, fontWeight: '900', letterSpacing: 1.4, marginBottom: 10 },
  heroTitle: { color: '#fff', fontSize: 27, lineHeight: 34, fontWeight: '900' },
  heroText: { color: '#cbd5e1', fontSize: 15, lineHeight: 23, marginTop: 10 },
  cardTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  cardText: { color: '#cbd5e1', fontSize: 14, lineHeight: 21, marginTop: 8 },
  realTalk: { color: '#fed7aa', fontSize: 16, lineHeight: 24, marginTop: 12, fontWeight: '800' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  badge: { color: '#67e8f9', backgroundColor: '#083344', fontSize: 11, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: 'hidden' },
  chip: { borderWidth: 1, borderColor: '#334155', backgroundColor: '#020617', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9 },
  chipActive: { backgroundColor: '#22d3ee', borderColor: '#22d3ee' },
  chipText: { color: '#cbd5e1', fontWeight: '800', fontSize: 12 },
  chipTextActive: { color: '#020617' },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  button: { borderWidth: 1, borderColor: '#334155', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#020617' },
  buttonPrimary: { backgroundColor: '#22d3ee', borderColor: '#22d3ee' },
  buttonText: { color: '#e2e8f0', fontWeight: '900', fontSize: 13 },
  buttonPrimaryText: { color: '#020617' },
  accountPill: { marginTop: 16, borderRadius: 16, backgroundColor: '#064e3b', padding: 12 },
  accountPillText: { color: '#bbf7d0', fontWeight: '900' },
  indexGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  indexCard: { width: '48%', borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#0f172a', borderRadius: 20, padding: 14 },
  indexLabel: { color: '#94a3b8', fontSize: 12, fontWeight: '900' },
  indexValue: { color: '#fff', fontSize: 21, fontWeight: '900', marginTop: 6 },
  greenText: { color: '#86efac', fontWeight: '900', marginTop: 3 },
  redText: { color: '#fca5a5', fontWeight: '900', marginTop: 3 },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  sourceText: { color: '#67e8f9', fontSize: 11, fontWeight: '900' },
  macroRow: { flexDirection: 'row', gap: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  macroValueBox: { alignItems: 'flex-end', minWidth: 92 },
  macroValue: { color: '#fff', fontSize: 18, fontWeight: '900' },
  flex1: { flex: 1 },
  rowTitle: { color: '#fff', fontWeight: '900', fontSize: 15, lineHeight: 21 },
  rowText: { color: '#94a3b8', fontSize: 13, lineHeight: 19, marginTop: 3 },
  newsRow: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b' },
  inputLabel: { color: '#cbd5e1', fontSize: 12, fontWeight: '900', marginTop: 12, marginBottom: 6 },
  input: { borderWidth: 1, borderColor: '#334155', borderRadius: 16, backgroundColor: '#020617', color: '#fff', paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 },
  textArea: { minHeight: 112, textAlignVertical: 'top', lineHeight: 20 },
  helperText: { color: '#64748b', fontSize: 12, lineHeight: 18, marginTop: 12 },
  successBox: { marginTop: 12, color: '#bbf7d0', backgroundColor: '#064e3b', padding: 12, borderRadius: 14, overflow: 'hidden', fontWeight: '800' },
  errorBox: { marginTop: 12, color: '#fecaca', backgroundColor: '#7f1d1d', padding: 12, borderRadius: 14, overflow: 'hidden', fontWeight: '800' },
  segment: { flexDirection: 'row', backgroundColor: '#020617', borderRadius: 16, padding: 4, marginTop: 16 },
  segmentItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 12 },
  segmentItemActive: { backgroundColor: '#22d3ee' },
  segmentText: { color: '#94a3b8', fontWeight: '900' },
  segmentTextActive: { color: '#020617' },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#0f172a', borderRadius: 20, padding: 14 },
  assetTicker: { color: '#67e8f9', fontWeight: '900', fontSize: 18 },
  assetNumbers: { alignItems: 'flex-end' },
  assetPrice: { color: '#fff', fontWeight: '900', fontSize: 15 },
  watchButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#083344' },
  watchButtonText: { color: '#67e8f9', fontWeight: '900', fontSize: 17 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  metric: { color: '#dbeafe', backgroundColor: '#1e293b', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, overflow: 'hidden', fontWeight: '900', fontSize: 12 },
  bigValue: { color: '#fff', fontWeight: '900', fontSize: 34, marginTop: 12 },
  twoCols: { flexDirection: 'row', gap: 10 },
  col: { flex: 1 },
  bullet: { color: '#cbd5e1', fontSize: 14, lineHeight: 21, marginTop: 8 },
  tabbar: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 4, paddingHorizontal: 6, paddingTop: 10, paddingBottom: 14, backgroundColor: '#020617', borderTopWidth: 1, borderTopColor: '#0f172a' },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 14 },
  tabActive: { backgroundColor: '#0f172a' },
  tabText: { color: '#64748b', fontWeight: '900', fontSize: 10 },
  tabTextActive: { color: '#67e8f9' },
});
