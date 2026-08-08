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

type Section = 'hoje' | 'radar' | 'ativos' | 'mercado' | 'conta' | 'premium' | 'mais';
type LiveIndicator = { symbol: string; lastPrice: number; changePercent: number; fetchedAt?: string };
type MacroItem = { id: string; label: string; value: number; unit: string; date?: string; source?: string; interpretation?: string };
type Account = { name: string; email: string; plan: 'free' | 'premium' };
type StoredAccount = Account & { password: string };

let localAccounts: StoredAccount[] = [];

const fallbackIndicators: LiveIndicator[] = [
  { symbol: 'PETR4.SA', lastPrice: 38.42, changePercent: 0.72 },
  { symbol: 'VALE3.SA', lastPrice: 61.18, changePercent: -0.35 },
  { symbol: 'ITUB4.SA', lastPrice: 34.9, changePercent: 0.41 },
  { symbol: 'BBAS3.SA', lastPrice: 29.8, changePercent: 0.22 },
  { symbol: 'WEGE3.SA', lastPrice: 42.75, changePercent: 1.12 },
  { symbol: 'BBDC4.SA', lastPrice: 14.62, changePercent: -0.18 },
  { symbol: 'ABEV3.SA', lastPrice: 12.34, changePercent: -0.41 },
  { symbol: 'RENT3.SA', lastPrice: 52.1, changePercent: 1.03 },
];

const indexCards = [
  { label: 'IBOV', value: '178.002', change: 'acompanhar', up: true },
  { label: 'S&P 500', value: '7.600', change: '+1,48%', up: true },
  { label: 'Dólar', value: 'R$ 5,10', change: '+0,15%', up: true },
  { label: 'Bitcoin', value: 'US$ 63.898', change: '+1,90%', up: true },
];

const macroFallback: MacroItem[] = [
  { id: 'selic', label: 'Selic Meta', value: 14.0, unit: '% a.a.', source: 'fallback offline', interpretation: 'Taxa básica ainda alta. O app tenta atualizar online pela API F-Insight/BCB.' },
  { id: 'ipca', label: 'IPCA Mensal', value: 0.38, unit: '% m/m', source: 'fallback offline', interpretation: 'Inflação impacta juros futuros, margens corporativas e poder de compra.' },
  { id: 'usdbrl', label: 'Dólar Comercial', value: 5.1, unit: 'BRL', source: 'fallback offline', interpretation: 'Câmbio afeta inflação, commodities, exportadoras e empresas com dívida em dólar.' },
];

const news = [
  { title: 'Mercado acompanha juros, dólar, commodities e temporada de balanços.', source: 'F-Insight Research', time: 'agora' },
  { title: 'Bancos seguem sensíveis à curva de juros e qualidade do crédito.', source: 'Radar Brasil', time: '2h' },
  { title: 'Valuation exige disciplina quando a Selic está elevada.', source: 'Painel Macro', time: 'hoje' },
];

const screenerRows = [
  { ticker: 'PETR4', name: 'Petrobras PN', pe: '5,1x', pvp: '1,2x', dy: '12,4%', roe: '23%', tag: 'Valor' },
  { ticker: 'BBAS3', name: 'Banco do Brasil ON', pe: '4,8x', pvp: '0,9x', dy: '9,8%', roe: '21%', tag: 'Dividendos' },
  { ticker: 'VALE3', name: 'Vale ON', pe: '6,7x', pvp: '1,4x', dy: '7,1%', roe: '18%', tag: 'Commodities' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco PN', pe: '8,9x', pvp: '1,7x', dy: '6,2%', roe: '20%', tag: 'Qualidade' },
];

const premiumFeatures = [
  'IA financeira completa para explicar ativos, notícias, indicadores e cenário.',
  'Screener avançado com filtros de valor, dividendos, qualidade, risco e liquidez.',
  'Carteira simulada, alertas inteligentes, backtesting e relatórios semanais.',
];

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
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
    'ABEV3.SA': 'Ambev ON',
    'RENT3.SA': 'Localiza ON',
  };
  return names[symbol] || cleanSymbol(symbol);
}

function money(value: number) {
  if (!Number.isFinite(value)) return 'R$ 0,00';
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
}

function pct(value: number) {
  if (!Number.isFinite(value)) return '0,00%';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2).replace('.', ',')}%`;
}

function clock(value?: string) {
  if (!value) return 'base educativa';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'base educativa';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function macroValue(item: MacroItem) {
  if (item.unit === 'BRL') return `R$ ${item.value.toFixed(2).replace('.', ',')}`;
  return `${item.value.toFixed(2).replace('.', ',')}%`;
}

function openWeb(path: string) {
  const safePath = path.startsWith('/') ? path : `/${path}`;
  void Linking.openURL(`${WEB_URL}${safePath}`);
}

function Card({ children, highlight = false }: { children: React.ReactNode; highlight?: boolean }) {
  return <View style={[styles.card, highlight && styles.cardHighlight]}>{children}</View>;
}

function Badge({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' | 'dark' }) {
  const toneStyle = tone === 'green' ? styles.badgeGreen : tone === 'amber' ? styles.badgeAmber : tone === 'dark' ? styles.badgeDark : styles.badgeBlue;
  return <Text style={[styles.badge, toneStyle]}>{children}</Text>;
}

function Button({ label, onPress, primary = false }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.button, primary && styles.buttonPrimary]}>
      <Text style={[styles.buttonText, primary && styles.buttonPrimaryText]}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  const [section, setSection] = useState<Section>('hoje');
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [isMacroLive, setIsMacroLive] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<string | undefined>();
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [macroItems, setMacroItems] = useState<MacroItem[]>(macroFallback);
  const [watch, setWatch] = useState(['PETR4.SA', 'ITUB4.SA', 'BBAS3.SA']);
  const [account, setAccount] = useState<Account | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      setLoading(true);
      try {
        const [indicatorsResponse, macroResponse] = await Promise.allSettled([
          fetch(`${API_URL}/api/live/indicators`),
          fetch(`${API_URL}/api/macro/overview?refresh=true`),
        ]);

        if (cancelled) return;

        if (indicatorsResponse.status === 'fulfilled' && indicatorsResponse.value.ok) {
          const payload = await indicatorsResponse.value.json();
          const data = Array.isArray(payload?.data) ? payload.data : [];
          setIndicators(data);
          setIsLive(data.length > 0);
          setUpdatedAt(data[0]?.fetchedAt);
        } else {
          setIndicators([]);
          setIsLive(false);
        }

        if (macroResponse.status === 'fulfilled' && macroResponse.value.ok) {
          const payload = await macroResponse.value.json();
          const data = Array.isArray(payload?.indicators) ? payload.indicators : [];
          if (data.length > 0) {
            setMacroItems(data);
            setIsMacroLive(String(payload?.source || '').includes('online') || String(payload?.source || '').includes('banco-central'));
            setUpdatedAt(payload?.updatedAt || updatedAt);
          }
        } else {
          setMacroItems(macroFallback);
          setIsMacroLive(false);
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

    loadData();
    return () => { cancelled = true; };
  }, []);

  const marketData = indicators.length > 0 ? indicators : fallbackIndicators;
  const watchedAssets = marketData.filter((item) => watch.includes(item.symbol));
  const avgChange = marketData.reduce((sum, item) => sum + item.changePercent, 0) / marketData.length;
  const hasPremium = account?.plan === 'premium';

  const mood = useMemo(() => {
    if (avgChange > 0.6) return { title: 'Mercado construtivo', text: 'A amostra acompanhada está positiva. Confirme fundamento, fluxo e notícia antes de decidir.' };
    if (avgChange < -0.6) return { title: 'Mercado pressionado', text: 'A amostra está negativa. Foque em risco, liquidez, qualidade e horizonte.' };
    return { title: 'Mercado misto', text: 'Sem direção única. Separe empresas, setores, valuation e cenário macro.' };
  }, [avgChange]);

  function toggleWatch(symbol: string) {
    setWatch((current) => (current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol]));
  }

  function createFreeAccount() {
    if (!name.trim() || !email.trim() || password.length < 6) {
      setMessage('Preencha nome, e-mail e senha com pelo menos 6 caracteres.');
      return;
    }
    const nextAccount: StoredAccount = { name: name.trim(), email: normalizeEmail(email), password, plan: 'free' };
    localAccounts = [...localAccounts.filter((item) => normalizeEmail(item.email) !== nextAccount.email), nextAccount];
    setAccount({ name: nextAccount.name, email: nextAccount.email, plan: nextAccount.plan });
    setMessage('Conta gratuita criada. Use Entrar para acessar novamente nesta instalação.');
    setSection('hoje');
  }

  function loginAccount() {
    const normalized = normalizeEmail(email);
    if (normalized === REVIEWER_EMAIL && password.length >= 6) {
      const next = { name: 'Revisor Google', email: REVIEWER_EMAIL, plan: 'premium' as const };
      setAccount(next);
      setMessage('Premium liberado para revisão.');
      setSection('premium');
      return;
    }
    const found = localAccounts.find((item) => normalizeEmail(item.email) === normalized && item.password === password);
    if (!found) {
      setMessage('Conta não encontrada. Crie uma conta grátis ou use o acesso informado ao revisor da Play Console.');
      return;
    }
    setAccount({ name: found.name, email: found.email, plan: found.plan });
    setMessage(found.plan === 'premium' ? 'Premium liberado.' : 'Conta gratuita acessada.');
    setSection(found.plan === 'premium' ? 'premium' : 'hoje');
  }

  function activatePremiumDemo() {
    if (!account) {
      setMessage('Entre com uma conta antes de visualizar o Premium.');
      setSection('conta');
      return;
    }
    setAccount({ ...account, plan: 'premium' });
    setMessage('Premium demonstrativo liberado nesta instalação. A cobrança real será ativada com Google Play Billing.');
    setSection('premium');
  }

  function renderHoje() {
    return (
      <View style={styles.stack}>
        <Card highlight>
          <Text style={styles.kicker}>F-INSIGHT PARA INVESTIDORES</Text>
          <Text style={styles.heroTitle}>Veja o mercado, crie sua conta grátis e aprofunde com Premium.</Text>
          <Text style={styles.heroText}>Cotações, macro, notícias, radar, fundamentos, screener, Graham & Valor e ferramentas educativas em uma experiência simples.</Text>
          <View style={styles.rowWrap}>
            <Badge tone={isLive ? 'green' : 'amber'}>{isLive ? 'Cotações online' : 'cotações demo'}</Badge>
            <Badge tone={isMacroLive ? 'green' : 'amber'}>{isMacroLive ? 'Macro online BCB' : 'macro fallback'}</Badge>
            <Badge tone="dark">Atualizado {clock(updatedAt)}</Badge>
          </View>
          {account ? (
            <View style={styles.accountPill}><Text style={styles.accountPillText}>{account.plan === 'premium' ? 'Premium ativo' : 'Conta grátis ativa'} · {account.name}</Text></View>
          ) : (
            <View style={styles.buttonRow}>
              <Button label="Criar conta grátis" primary onPress={() => { setAuthMode('signup'); setSection('conta'); }} />
              <Button label="Entrar" onPress={() => { setAuthMode('login'); setSection('conta'); }} />
            </View>
          )}
        </Card>
        <View style={styles.indexGrid}>
          {indexCards.map((item) => (
            <View key={item.label} style={styles.indexCard}>
              <Text style={styles.indexLabel}>{item.label}</Text>
              <Text style={styles.indexValue}>{item.value}</Text>
              <Text style={item.up ? styles.greenText : styles.mutedText}>{item.change}</Text>
            </View>
          ))}
        </View>
        <Card><Text style={styles.cardTitle}>{mood.title}</Text><Text style={styles.cardText}>{mood.text}</Text></Card>
        <Card>
          <View style={styles.sectionHeader}><Text style={styles.cardTitle}>Painel macro</Text><Text style={styles.sourceText}>{isMacroLive ? 'online BCB' : 'fallback offline'}</Text></View>
          {macroItems.map((item) => (
            <View key={item.id || item.label} style={styles.macroRow}>
              <View style={styles.flex1}><Text style={styles.rowTitle}>{item.label}</Text><Text style={styles.rowText}>{item.interpretation || 'Indicador macro acompanhado pelo F-Insight.'}</Text></View>
              <View style={styles.macroValueBox}><Text style={styles.macroValue}>{macroValue(item)}</Text><Text style={styles.sourceText}>{item.source || 'API'}</Text></View>
            </View>
          ))}
        </Card>
        <Card>
          <Text style={styles.cardTitle}>Últimas notícias</Text>
          {news.map((item) => <View key={item.title} style={styles.newsRow}><Text style={styles.rowTitle}>{item.title}</Text><Text style={styles.rowText}>{item.source} · {item.time}</Text></View>)}
        </Card>
      </View>
    );
  }

  function renderConta() {
    return (
      <View style={styles.stack}>
        <Card highlight>
          <Text style={styles.kicker}>CONTA DO INVESTIDOR</Text>
          <Text style={styles.heroTitle}>{authMode === 'signup' ? 'Crie seu acesso grátis.' : 'Entre com sua conta.'}</Text>
          <Text style={styles.heroText}>Esta área é para o investidor comum. Cliente assessorado, assessor e escritório ficam em Área Logada no menu Mais.</Text>
          <View style={styles.segment}>
            <Pressable onPress={() => setAuthMode('login')} style={[styles.segmentItem, authMode === 'login' && styles.segmentItemActive]}><Text style={[styles.segmentText, authMode === 'login' && styles.segmentTextActive]}>Entrar</Text></Pressable>
            <Pressable onPress={() => setAuthMode('signup')} style={[styles.segmentItem, authMode === 'signup' && styles.segmentItemActive]}><Text style={[styles.segmentText, authMode === 'signup' && styles.segmentTextActive]}>Criar grátis</Text></Pressable>
          </View>
        </Card>
        <Card>
          {authMode === 'signup' && <><Text style={styles.inputLabel}>Nome completo</Text><TextInput value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor="#64748b" style={styles.input} /></>}
          <Text style={styles.inputLabel}>E-mail</Text><TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="seu@email.com" placeholderTextColor="#64748b" style={styles.input} />
          <Text style={styles.inputLabel}>Senha</Text><TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="mínimo 6 caracteres" placeholderTextColor="#64748b" style={styles.input} />
          {message ? <Text style={message.includes('liberado') || message.includes('criada') || message.includes('acessada') ? styles.successBox : styles.errorBox}>{message}</Text> : null}
          <View style={styles.buttonRow}><Button label={authMode === 'signup' ? 'Criar conta' : 'Entrar'} primary onPress={authMode === 'signup' ? createFreeAccount : loginAccount} /><Button label="Ver mercado" onPress={() => setSection('hoje')} /></View>
          <Text style={styles.helperText}>Para revisão Google, use o acesso informado na Play Console. Esse acesso abre Premium sem cobrança.</Text>
        </Card>
      </View>
    );
  }

  function renderRadar() {
    return <View style={styles.stack}><Card><Text style={styles.cardTitle}>Radar Brasil</Text><Text style={styles.cardText}>Acompanhe os principais ativos, preços e variações.</Text></Card>{loading ? <ActivityIndicator color="#22d3ee" /> : marketData.map((item) => <Pressable key={item.symbol} style={styles.assetRow} onPress={() => openWeb(`/ativo/${cleanSymbol(item.symbol)}`)}><View style={styles.flex1}><Text style={styles.assetTicker}>{cleanSymbol(item.symbol)}</Text><Text style={styles.rowText}>{symbolName(item.symbol)}</Text></View><View style={styles.assetNumbers}><Text style={styles.assetPrice}>{money(item.lastPrice)}</Text><Text style={item.changePercent >= 0 ? styles.greenText : styles.redText}>{pct(item.changePercent)}</Text></View><Pressable style={styles.watchButton} onPress={() => toggleWatch(item.symbol)}><Text style={styles.watchButtonText}>{watch.includes(item.symbol) ? '✓' : '+'}</Text></Pressable></Pressable>)}</View>;
  }

  function renderAtivos() {
    return <View style={styles.stack}><Card><Text style={styles.cardTitle}>Screener fundamentalista</Text><Text style={styles.cardText}>P/L, P/VP, dividend yield e ROE para começar a estudar ativos.</Text></Card>{screenerRows.map((item) => <Card key={item.ticker}><View style={styles.sectionHeader}><View><Text style={styles.assetTicker}>{item.ticker}</Text><Text style={styles.rowText}>{item.name}</Text></View><Badge tone="blue">{item.tag}</Badge></View><View style={styles.metricsGrid}><Text style={styles.metric}>P/L {item.pe}</Text><Text style={styles.metric}>P/VP {item.pvp}</Text><Text style={styles.metric}>DY {item.dy}</Text><Text style={styles.metric}>ROE {item.roe}</Text></View></Card>)}<Card><Text style={styles.cardTitle}>Graham & Valor</Text><Text style={styles.cardText}>Ranking educativo por margem de segurança, múltiplos e qualidade. Premium aprofunda filtros e comparações.</Text><Button label="Ver Premium" primary onPress={() => setSection('premium')} /></Card></View>;
  }

  function renderMercado() {
    return <View style={styles.stack}><Card><Text style={styles.cardTitle}>Mercado e macro</Text><Text style={styles.cardText}>Juros, inflação, câmbio e leitura de cenário para orientar estudos.</Text></Card>{macroItems.map((item) => <Card key={item.id || item.label}><View style={styles.sectionHeader}><Text style={styles.cardTitle}>{item.label}</Text><Badge tone={item.source?.includes('BCB') ? 'green' : 'amber'}>{item.source || 'API'}</Badge></View><Text style={styles.bigValue}>{macroValue(item)}</Text><Text style={styles.cardText}>{item.interpretation}</Text></Card>)}<Card><Text style={styles.cardTitle}>Notícias</Text>{news.map((item) => <View key={item.title} style={styles.newsRow}><Text style={styles.rowTitle}>{item.title}</Text><Text style={styles.rowText}>{item.source} · {item.time}</Text></View>)}</Card></View>;
  }

  function renderPremium() {
    return <View style={styles.stack}><Card highlight><Text style={styles.kicker}>{hasPremium ? 'PREMIUM ATIVO' : 'PREMIUM F-INSIGHT'}</Text><Text style={styles.heroTitle}>IA, carteira simulada, alertas e backtesting.</Text><Text style={styles.heroText}>A cobrança real dentro do Android será feita apenas quando Google Play Billing estiver integrado. Para revisão, o acesso premium é liberado sem pagamento.</Text>{hasPremium ? <View style={styles.accountPill}><Text style={styles.accountPillText}>Acesso Premium liberado para {account?.email}</Text></View> : <View style={styles.buttonRow}><Button label="Entrar" primary onPress={() => { setAuthMode('login'); setSection('conta'); }} /><Button label="Demo Premium" onPress={activatePremiumDemo} /></View>}</Card>{premiumFeatures.map((feature) => <Card key={feature}><Text style={styles.rowTitle}>✓ {feature}</Text></Card>)}<Card><Text style={styles.cardTitle}>IA Financeira</Text><Text style={styles.cardText}>{hasPremium ? 'Pergunte sobre ativos, fundamentos, macro e notícias. Módulo em expansão.' : 'Entre com uma conta Premium de revisão ou aguarde a liberação comercial via Google Play Billing.'}</Text></Card></View>;
  }

  function renderMais() {
    return <View style={styles.stack}><Card><Text style={styles.cardTitle}>Minha lista</Text>{watchedAssets.length === 0 ? <Text style={styles.cardText}>Toque no + do radar para acompanhar ativos.</Text> : watchedAssets.map((item) => <View key={item.symbol} style={styles.newsRow}><Text style={styles.rowTitle}>{cleanSymbol(item.symbol)} · {money(item.lastPrice)}</Text><Text style={item.changePercent >= 0 ? styles.greenText : styles.redText}>{pct(item.changePercent)}</Text></View>)}</Card><Card><Text style={styles.cardTitle}>Área Logada institucional</Text><Text style={styles.cardText}>Para cliente assessorado, assessor e escritório/admin. Separado da conta comum do investidor.</Text><View style={styles.buttonRow}><Button label="Cliente" onPress={() => openWeb('/cliente')} /><Button label="Assessor" onPress={() => openWeb('/assessor')} /><Button label="Escritório" onPress={() => openWeb('/admin')} /></View></Card><Card><Text style={styles.cardTitle}>Privacidade</Text><View style={styles.buttonRow}><Button label="Privacidade" onPress={() => openWeb('/privacidade')} /><Button label="Excluir conta" onPress={() => openWeb('/excluir-conta')} /></View></Card></View>;
  }

  const content = section === 'hoje' ? renderHoje() : section === 'radar' ? renderRadar() : section === 'ativos' ? renderAtivos() : section === 'mercado' ? renderMercado() : section === 'conta' ? renderConta() : section === 'premium' ? renderPremium() : renderMais();
  const tabs: Array<{ key: Section; label: string }> = [{ key: 'hoje', label: 'Hoje' }, { key: 'radar', label: 'Radar' }, { key: 'ativos', label: 'Ativos' }, { key: 'mercado', label: 'Mercado' }, { key: 'conta', label: account ? 'Conta' : 'Entrar' }, { key: 'mais', label: 'Mais' }];

  return <SafeAreaView style={styles.safe}><StatusBar barStyle="light-content" backgroundColor="#020617" /><View style={styles.header}><View style={styles.logo}><Text style={styles.logoText}>↗</Text></View><View style={styles.headerCopy}><Text style={styles.brand}>F-Insight</Text><Text style={styles.headerSub}>{account ? `${account.name} · ${account.plan}` : 'mercado, dados e inteligência'}</Text></View><Pressable onPress={() => setSection('mais')}><Text style={styles.menuIcon}>☰</Text></Pressable></View><ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>{content}</ScrollView><View style={styles.tabbar}>{tabs.map((tab) => <Pressable key={tab.key} onPress={() => setSection(tab.key)} style={[styles.tab, section === tab.key && styles.tabActive]}><Text style={[styles.tabText, section === tab.key && styles.tabTextActive]}>{tab.label}</Text></Pressable>)}</View></SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#0f172a', backgroundColor: '#020617' },
  logo: { width: 52, height: 52, borderRadius: 18, alignItems: 'center', justifyContent: 'center', backgroundColor: '#22d3ee' },
  logoText: { fontSize: 30, color: '#020617', fontWeight: '900' },
  headerCopy: { flex: 1 },
  brand: { color: '#fff', fontWeight: '900', fontSize: 20 },
  headerSub: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  menuIcon: { color: '#e2e8f0', fontSize: 30, paddingHorizontal: 8 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 112 },
  stack: { gap: 14 },
  card: { borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#0f172a', borderRadius: 24, padding: 18 },
  cardHighlight: { borderColor: '#164e63', backgroundColor: '#082f49' },
  kicker: { color: '#67e8f9', fontSize: 11, fontWeight: '900', letterSpacing: 1.4, marginBottom: 10 },
  heroTitle: { color: '#fff', fontSize: 28, lineHeight: 34, fontWeight: '900' },
  heroText: { color: '#cbd5e1', fontSize: 15, lineHeight: 23, marginTop: 10 },
  cardTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  cardText: { color: '#cbd5e1', fontSize: 14, lineHeight: 21, marginTop: 8 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 16 },
  badge: { fontSize: 11, fontWeight: '900', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, overflow: 'hidden' },
  badgeBlue: { color: '#67e8f9', backgroundColor: '#083344' },
  badgeGreen: { color: '#86efac', backgroundColor: '#064e3b' },
  badgeAmber: { color: '#fde68a', backgroundColor: '#451a03' },
  badgeDark: { color: '#cbd5e1', backgroundColor: '#111827' },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  button: { borderWidth: 1, borderColor: '#334155', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#020617' },
  buttonPrimary: { backgroundColor: '#22d3ee', borderColor: '#22d3ee' },
  buttonText: { color: '#e2e8f0', fontWeight: '900', fontSize: 13 },
  buttonPrimaryText: { color: '#020617' },
  accountPill: { marginTop: 16, borderRadius: 16, backgroundColor: '#064e3b', padding: 12 },
  accountPillText: { color: '#bbf7d0', fontWeight: '900' },
  indexGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  indexCard: { width: '48%', borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#0f172a', borderRadius: 20, padding: 14 },
  indexLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '900' },
  indexValue: { color: '#fff', fontWeight: '900', fontSize: 20, marginTop: 6 },
  greenText: { color: '#86efac', fontWeight: '900' },
  redText: { color: '#fca5a5', fontWeight: '900' },
  mutedText: { color: '#94a3b8', fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  macroRow: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 12, marginTop: 12 },
  flex1: { flex: 1 },
  rowTitle: { color: '#fff', fontSize: 15, fontWeight: '900' },
  rowText: { color: '#94a3b8', fontSize: 12, lineHeight: 18, marginTop: 3 },
  sourceText: { color: '#64748b', fontSize: 10, fontWeight: '800' },
  macroValueBox: { alignItems: 'flex-end', maxWidth: 110 },
  macroValue: { color: '#fff', fontWeight: '900', fontSize: 18 },
  bigValue: { color: '#fff', fontWeight: '900', fontSize: 34, marginVertical: 10 },
  newsRow: { borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 12, marginTop: 12 },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#0f172a', borderRadius: 18, padding: 14 },
  assetTicker: { color: '#67e8f9', fontWeight: '900', fontSize: 18 },
  assetNumbers: { alignItems: 'flex-end' },
  assetPrice: { color: '#fff', fontWeight: '900', fontSize: 14 },
  watchButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#083344', alignItems: 'center', justifyContent: 'center' },
  watchButtonText: { color: '#67e8f9', fontWeight: '900', fontSize: 18 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  metric: { width: '47%', color: '#e2e8f0', backgroundColor: '#020617', borderRadius: 12, padding: 10, fontWeight: '800' },
  segment: { flexDirection: 'row', borderRadius: 18, backgroundColor: '#020617', padding: 4, marginTop: 16 },
  segmentItem: { flex: 1, borderRadius: 14, paddingVertical: 12, alignItems: 'center' },
  segmentItemActive: { backgroundColor: '#22d3ee' },
  segmentText: { color: '#94a3b8', fontWeight: '900' },
  segmentTextActive: { color: '#020617' },
  inputLabel: { color: '#94a3b8', fontWeight: '800', marginTop: 12, marginBottom: 6 },
  input: { color: '#fff', borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#020617', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 13, fontSize: 16 },
  helperText: { color: '#64748b', fontSize: 12, lineHeight: 18, marginTop: 12 },
  successBox: { color: '#bbf7d0', backgroundColor: '#064e3b', borderRadius: 14, padding: 12, marginTop: 12, fontWeight: '800' },
  errorBox: { color: '#fecaca', backgroundColor: '#451a1a', borderRadius: 14, padding: 12, marginTop: 12, fontWeight: '800' },
  tabbar: { position: 'absolute', left: 12, right: 12, bottom: 12, flexDirection: 'row', gap: 6, backgroundColor: '#020617', borderWidth: 1, borderColor: '#1e293b', borderRadius: 24, padding: 8 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 16 },
  tabActive: { backgroundColor: '#22d3ee' },
  tabText: { color: '#94a3b8', fontSize: 11, fontWeight: '900' },
  tabTextActive: { color: '#020617' },
});
