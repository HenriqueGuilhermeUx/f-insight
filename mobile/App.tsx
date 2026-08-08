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

type Section = 'hoje' | 'radar' | 'ativos' | 'mercado' | 'conta' | 'mais';
type LiveIndicator = { symbol: string; lastPrice: number; changePercent: number; fetchedAt?: string };
type MacroItem = { id: string; label: string; value: number; unit: string; date?: string; source?: string; interpretation?: string };
type FreeAccount = { name: string; email: string };

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
  { title: 'Valuation exige mais disciplina quando a Selic está elevada.', source: 'Painel Macro', time: 'hoje' },
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

function macroValue(item: MacroItem) {
  if (item.unit === 'BRL') return `R$ ${item.value.toFixed(2).replace('.', ',')}`;
  return `${item.value.toFixed(2).replace('.', ',')}%`;
}

function clock(value?: string) {
  if (!value) return 'base educativa';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'base educativa';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
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
  const [account, setAccount] = useState<FreeAccount | null>(null);
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
    return () => {
      cancelled = true;
    };
  }, []);

  const marketData = indicators.length > 0 ? indicators : fallbackIndicators;
  const watchedAssets = marketData.filter((item) => watch.includes(item.symbol));
  const avgChange = marketData.reduce((sum, item) => sum + item.changePercent, 0) / marketData.length;

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
    setAccount({ name: name.trim(), email: email.trim() });
    setMessage('Conta gratuita criada neste app. Agora você vê mais ferramentas e pode avaliar o Premium.');
    setSection('hoje');
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
            <View style={styles.accountPill}>
              <Text style={styles.accountPillText}>Conta grátis ativa: {account.name}</Text>
            </View>
          ) : (
            <View style={styles.buttonRow}>
              <Button label="Criar conta grátis" primary onPress={() => setSection('conta')} />
              <Button label="Ver Premium" onPress={() => openWeb('/premium')} />
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

        <Card>
          <Text style={styles.cardTitle}>{mood.title}</Text>
          <Text style={styles.cardText}>{mood.text}</Text>
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Painel macro</Text>
            <Text style={styles.sourceText}>{isMacroLive ? 'online BCB' : 'fallback offline'}</Text>
          </View>
          {macroItems.map((item) => (
            <View key={item.id || item.label} style={styles.macroRow}>
              <View style={styles.flex1}>
                <Text style={styles.rowTitle}>{item.label}</Text>
                <Text style={styles.rowText}>{item.interpretation || 'Indicador macro acompanhado pelo F-Insight.'}</Text>
              </View>
              <View style={styles.macroValueBox}>
                <Text style={styles.macroValue}>{macroValue(item)}</Text>
                <Text style={styles.sourceText}>{item.source || 'API'}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Últimas notícias</Text>
          {news.map((item) => (
            <View key={item.title} style={styles.newsRow}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowText}>{item.source} · {item.time}</Text>
            </View>
          ))}
        </Card>

        {!account && (
          <Card>
            <Text style={styles.cardTitle}>Por que criar conta grátis?</Text>
            <Text style={styles.cardText}>Libera watchlist no app, ferramentas de estudo e caminho para Premium. A área de cliente assessorado/assessor/escritório fica separada para não confundir.</Text>
            <View style={styles.buttonRow}>
              <Button label="Criar conta" primary onPress={() => setSection('conta')} />
              <Button label="Área Logada" onPress={() => openWeb('/area-logada')} />
            </View>
          </Card>
        )}
      </View>
    );
  }

  function renderConta() {
    return (
      <View style={styles.stack}>
        <Card highlight>
          <Text style={styles.kicker}>CONTA GRATUITA</Text>
          <Text style={styles.heroTitle}>Crie seu acesso como investidor.</Text>
          <Text style={styles.heroText}>Aqui não é ambiente de escritório. É uma conta simples para acompanhar mercado, usar ferramentas e conhecer o Premium.</Text>
        </Card>

        <Card>
          <Text style={styles.inputLabel}>Nome completo</Text>
          <TextInput value={name} onChangeText={setName} placeholder="Seu nome" placeholderTextColor="#64748b" style={styles.input} />
          <Text style={styles.inputLabel}>E-mail</Text>
          <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" placeholder="seu@email.com" placeholderTextColor="#64748b" style={styles.input} />
          <Text style={styles.inputLabel}>Senha</Text>
          <TextInput value={password} onChangeText={setPassword} secureTextEntry placeholder="mínimo 6 caracteres" placeholderTextColor="#64748b" style={styles.input} />
          {message ? <Text style={message.includes('criada') ? styles.successBox : styles.errorBox}>{message}</Text> : null}
          <Button label="Criar acesso gratuito" primary onPress={createFreeAccount} />
          <Text style={styles.disclaimer}>Este cadastro local não expõe patrimônio, saldo ou posição real. A autenticação completa será conectada à conta online do F-Insight.</Text>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Já é cliente, assessor ou escritório?</Text>
          <Text style={styles.cardText}>Use a Área Logada institucional, separada da conta gratuita do investidor avulso.</Text>
          <Button label="Abrir Área Logada" onPress={() => openWeb('/area-logada')} />
        </Card>
      </View>
    );
  }

  function renderRadar() {
    return (
      <View style={styles.stack}>
        <Card>
          <Text style={styles.cardTitle}>Radar Brasil</Text>
          <Text style={styles.cardText}>Acompanhe os principais ativos, preços e variações.</Text>
        </Card>
        {loading ? (
          <ActivityIndicator color="#22d3ee" />
        ) : (
          marketData.map((item) => (
            <Pressable key={item.symbol} style={styles.assetRow} onPress={() => openWeb(`/ativo/${cleanSymbol(item.symbol)}`)}>
              <View style={styles.flex1}>
                <Text style={styles.assetTicker}>{cleanSymbol(item.symbol)}</Text>
                <Text style={styles.rowText}>{symbolName(item.symbol)}</Text>
              </View>
              <View style={styles.assetNumbers}>
                <Text style={styles.assetPrice}>{money(item.lastPrice)}</Text>
                <Text style={item.changePercent >= 0 ? styles.greenText : styles.redText}>{pct(item.changePercent)}</Text>
              </View>
              {account && (
                <Pressable style={styles.watchButton} onPress={() => toggleWatch(item.symbol)}>
                  <Text style={styles.watchText}>{watch.includes(item.symbol) ? '✓' : '+'}</Text>
                </Pressable>
              )}
            </Pressable>
          ))
        )}
      </View>
    );
  }

  function renderAtivos() {
    return (
      <View style={styles.stack}>
        <Card>
          <Text style={styles.cardTitle}>Ativos e fundamentos</Text>
          <Text style={styles.cardText}>Screener educativo com P/L, P/VP, dividend yield, ROE e leitura de valor.</Text>
        </Card>
        {screenerRows.map((item) => (
          <Card key={item.ticker}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.assetTicker}>{item.ticker}</Text>
                <Text style={styles.rowText}>{item.name}</Text>
              </View>
              <Badge tone="blue">{item.tag}</Badge>
            </View>
            <View style={styles.metricsGrid}>
              <Text style={styles.metric}>P/L {item.pe}</Text>
              <Text style={styles.metric}>P/VP {item.pvp}</Text>
              <Text style={styles.metric}>DY {item.dy}</Text>
              <Text style={styles.metric}>ROE {item.roe}</Text>
            </View>
          </Card>
        ))}
      </View>
    );
  }

  function renderMercado() {
    return (
      <View style={styles.stack}>
        <Card>
          <Text style={styles.cardTitle}>Mercado e macro</Text>
          <Text style={styles.cardText}>Selic, inflação, dólar, notícias e régua de oportunidade.</Text>
        </Card>
        {renderHoje()}
      </View>
    );
  }

  function renderMais() {
    return (
      <View style={styles.stack}>
        {account && (
          <Card highlight>
            <Text style={styles.cardTitle}>Sua conta gratuita</Text>
            <Text style={styles.cardText}>{account.name} · {account.email}</Text>
            <Text style={styles.cardText}>Próximo passo: ativar Premium para IA, carteira simulada, alertas e backtesting.</Text>
          </Card>
        )}

        <Card>
          <Text style={styles.cardTitle}>Premium R$ 19,90/mês</Text>
          {premiumFeatures.map((item) => <Text key={item} style={styles.listItem}>• {item}</Text>)}
          <View style={styles.buttonRow}>
            <Button label="Conhecer Premium" primary onPress={() => openWeb('/premium')} />
            <Button label="Área Logada" onPress={() => openWeb('/area-logada')} />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Área Logada institucional</Text>
          <Text style={styles.cardText}>Para cliente assessorado, assessor e escritório/admin. Essa área fica separada da conta gratuita do investidor.</Text>
          <Button label="Abrir Área Logada" onPress={() => openWeb('/area-logada')} />
        </Card>
      </View>
    );
  }

  function renderContent() {
    if (section === 'conta') return renderConta();
    if (section === 'radar') return renderRadar();
    if (section === 'ativos') return renderAtivos();
    if (section === 'mercado') return renderMercado();
    if (section === 'mais') return renderMais();
    return renderHoje();
  }

  const tabs: Array<{ key: Section; label: string }> = [
    { key: 'hoje', label: 'Hoje' },
    { key: 'radar', label: 'Radar' },
    { key: 'ativos', label: 'Ativos' },
    { key: 'mercado', label: 'Mercado' },
    { key: 'mais', label: 'Mais' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <View style={styles.header}>
        <View style={styles.logo}><Text style={styles.logoText}>↗</Text></View>
        <View style={styles.headerTextBox}>
          <Text style={styles.headerTitle}>F-Insight</Text>
          <Text style={styles.headerSubtitle}>{account ? 'Conta grátis ativa' : 'Mercado aberto'}</Text>
        </View>
        <Pressable onPress={() => openWeb('/area-logada')} style={styles.headerButton}>
          <Text style={styles.headerButtonText}>Área Logada</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {renderContent()}
      </ScrollView>

      <View style={styles.bottomNav}>
        {tabs.map((tab) => (
          <Pressable key={tab.key} onPress={() => setSection(tab.key)} style={[styles.navItem, section === tab.key && styles.navItemActive]}>
            <Text style={[styles.navText, section === tab.key && styles.navTextActive]}>{tab.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#0f172a', backgroundColor: '#020617' },
  logo: { width: 52, height: 52, borderRadius: 18, backgroundColor: '#22d3ee', alignItems: 'center', justifyContent: 'center' },
  logoText: { color: '#020617', fontSize: 32, fontWeight: '900' },
  headerTextBox: { flex: 1 },
  headerTitle: { color: '#fff', fontWeight: '900', fontSize: 20 },
  headerSubtitle: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  headerButton: { borderWidth: 1, borderColor: '#334155', paddingHorizontal: 10, paddingVertical: 9, borderRadius: 12, backgroundColor: '#0f172a' },
  headerButtonText: { color: '#a7f3d0', fontSize: 11, fontWeight: '900' },
  content: { padding: 16, paddingBottom: 108 },
  stack: { gap: 14 },
  card: { borderRadius: 24, borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#0f172a', padding: 18 },
  cardHighlight: { backgroundColor: '#0b2235', borderColor: '#155e75' },
  kicker: { color: '#22d3ee', fontSize: 11, fontWeight: '900', letterSpacing: 1.5, marginBottom: 10 },
  heroTitle: { color: '#fff', fontSize: 28, lineHeight: 34, fontWeight: '900' },
  heroText: { color: '#cbd5e1', fontSize: 15, lineHeight: 23, marginTop: 12 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  badge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, overflow: 'hidden', fontSize: 11, fontWeight: '900' },
  badgeBlue: { color: '#67e8f9', backgroundColor: '#0e749020' },
  badgeGreen: { color: '#86efac', backgroundColor: '#16a34a22' },
  badgeAmber: { color: '#fde68a', backgroundColor: '#f59e0b22' },
  badgeDark: { color: '#cbd5e1', backgroundColor: '#020617' },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  button: { flexGrow: 1, borderWidth: 1, borderColor: '#334155', borderRadius: 16, paddingVertical: 14, paddingHorizontal: 16, alignItems: 'center', backgroundColor: '#020617' },
  buttonPrimary: { backgroundColor: '#22d3ee', borderColor: '#22d3ee' },
  buttonText: { color: '#e2e8f0', fontWeight: '900' },
  buttonPrimaryText: { color: '#020617' },
  accountPill: { marginTop: 16, borderRadius: 16, backgroundColor: '#16a34a22', padding: 12, borderWidth: 1, borderColor: '#16a34a55' },
  accountPillText: { color: '#bbf7d0', fontWeight: '900' },
  indexGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  indexCard: { width: '48%', borderRadius: 20, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', padding: 14 },
  indexLabel: { color: '#64748b', fontSize: 11, fontWeight: '900', letterSpacing: 1 },
  indexValue: { color: '#fff', fontSize: 18, fontWeight: '900', marginTop: 8 },
  greenText: { color: '#86efac', fontWeight: '900' },
  redText: { color: '#fca5a5', fontWeight: '900' },
  mutedText: { color: '#94a3b8', fontWeight: '800' },
  cardTitle: { color: '#fff', fontSize: 20, fontWeight: '900' },
  cardText: { color: '#cbd5e1', fontSize: 14, lineHeight: 22, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginBottom: 10 },
  sourceText: { color: '#64748b', fontSize: 10, fontWeight: '800' },
  macroRow: { flexDirection: 'row', gap: 12, borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 12, marginTop: 12 },
  flex1: { flex: 1 },
  rowTitle: { color: '#fff', fontWeight: '900', fontSize: 15 },
  rowText: { color: '#94a3b8', fontSize: 12, lineHeight: 18, marginTop: 4 },
  macroValueBox: { minWidth: 92, alignItems: 'flex-end' },
  macroValue: { color: '#22d3ee', fontWeight: '900', fontSize: 18 },
  newsRow: { borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 12, marginTop: 12 },
  inputLabel: { color: '#94a3b8', fontWeight: '800', marginBottom: 8, marginTop: 10 },
  input: { backgroundColor: '#020617', borderWidth: 1, borderColor: '#1e293b', borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14, color: '#fff', fontSize: 16 },
  successBox: { color: '#bbf7d0', backgroundColor: '#16a34a22', borderColor: '#16a34a55', borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 12 },
  errorBox: { color: '#fecaca', backgroundColor: '#ef444422', borderColor: '#ef444455', borderWidth: 1, borderRadius: 14, padding: 12, marginTop: 12 },
  disclaimer: { color: '#64748b', fontSize: 11, lineHeight: 17, marginTop: 12 },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 18, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', padding: 14 },
  assetTicker: { color: '#67e8f9', fontWeight: '900', fontSize: 18 },
  assetNumbers: { alignItems: 'flex-end' },
  assetPrice: { color: '#fff', fontWeight: '900' },
  watchButton: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#22d3ee', alignItems: 'center', justifyContent: 'center' },
  watchText: { color: '#020617', fontWeight: '900', fontSize: 18 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  metric: { color: '#e2e8f0', backgroundColor: '#020617', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 8, fontWeight: '800' },
  listItem: { color: '#cbd5e1', fontSize: 14, lineHeight: 21, marginTop: 8 },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, flexDirection: 'row', gap: 6, paddingHorizontal: 10, paddingTop: 10, paddingBottom: Platform.OS === 'android' ? 18 : 24, backgroundColor: '#020617', borderTopWidth: 1, borderTopColor: '#0f172a' },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14 },
  navItemActive: { backgroundColor: '#0e749022' },
  navText: { color: '#64748b', fontSize: 11, fontWeight: '900' },
  navTextActive: { color: '#67e8f9' },
});
