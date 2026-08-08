import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
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

type Section = 'hoje' | 'radar' | 'ativos' | 'mercado' | 'mais';
type LiveIndicator = { symbol: string; lastPrice: number; changePercent: number; fetchedAt?: string };
type NewsItem = { title: string; source: string; time: string };

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

const indexes = [
  { label: 'IBOV', value: '178.002', change: '0,00%', tone: 'flat' },
  { label: 'S&P 500', value: '7.600', change: '+1,48%', tone: 'up' },
  { label: 'Dólar', value: 'R$ 5,10', change: '+0,15%', tone: 'up' },
  { label: 'Bitcoin', value: 'US$ 63.898', change: '+1,90%', tone: 'up' },
];

const macroFallback = [
  { label: 'Selic Meta', value: '14,25%', source: 'Banco Central', text: 'Taxa básica ainda alta. Compare risco de ações com renda fixa antes de assumir exposição.' },
  { label: 'CDI', value: '14,15%', source: 'estimativa educativa', text: 'Referência para pós-fixados e custo de oportunidade no curto prazo.' },
  { label: 'IPCA', value: '4,2%', source: 'painel macro', text: 'Inflação exige atenção em consumo, varejo, juros reais e margens.' },
  { label: 'Dólar', value: 'R$ 5,10', source: 'mercado', text: 'Impacta exportadoras, importadoras, commodities e inflação.' },
];

const fallbackNews: NewsItem[] = [
  { title: 'Mercado acompanha juros, dólar, commodities e temporada de balanços.', source: 'F-Insight Research', time: 'agora' },
  { title: 'Ações ligadas a commodities reagem a câmbio e sinais da China.', source: 'Radar Brasil', time: '2h' },
  { title: 'Bancos seguem sensíveis à curva de juros e qualidade do crédito.', source: 'Mercado', time: '4h' },
];

const screener = [
  { ticker: 'PETR4', name: 'Petrobras PN', pe: '5,1x', pvp: '1,2x', dy: '12,4%', roe: '23%', tag: 'Valor' },
  { ticker: 'BBAS3', name: 'Banco do Brasil ON', pe: '4,8x', pvp: '0,9x', dy: '9,8%', roe: '21%', tag: 'Dividendos' },
  { ticker: 'VALE3', name: 'Vale ON', pe: '6,7x', pvp: '1,4x', dy: '7,1%', roe: '18%', tag: 'Commodities' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco PN', pe: '8,9x', pvp: '1,7x', dy: '6,2%', roe: '20%', tag: 'Qualidade' },
  { ticker: 'WEGE3', name: 'WEG ON', pe: '32,0x', pvp: '8,4x', dy: '1,5%', roe: '27%', tag: 'Crescimento' },
];

const premiumFeatures = [
  'IA financeira completa para explicar ativos, indicadores e cenário.',
  'Screener avançado com filtros de valor, dividendos, qualidade e risco.',
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

function parseNumber(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
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

function Badge({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' | 'red' | 'dark' }) {
  const toneStyle = tone === 'green' ? styles.badgeGreen : tone === 'amber' ? styles.badgeAmber : tone === 'red' ? styles.badgeRed : tone === 'dark' ? styles.badgeDark : styles.badgeBlue;
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
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [watch, setWatch] = useState(['PETR4.SA', 'ITUB4.SA', 'BBAS3.SA']);
  const [price, setPrice] = useState('28');
  const [fairValue, setFairValue] = useState('36');

  useEffect(() => {
    fetch(`${API_URL}/api/live/indicators`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        const data = Array.isArray(payload?.data) ? payload.data : [];
        setIndicators(data);
        setIsLive(data.length > 0);
      })
      .catch(() => {
        setIndicators([]);
        setIsLive(false);
      })
      .finally(() => setLoading(false));
  }, []);

  const marketData = indicators.length > 0 ? indicators : fallbackIndicators;
  const watchedAssets = marketData.filter((item) => watch.includes(item.symbol));
  const avgChange = marketData.reduce((sum, item) => sum + item.changePercent, 0) / marketData.length;

  const marketMood = useMemo(() => {
    if (avgChange > 0.6) return { title: 'Mercado construtivo', text: 'A amostra acompanhada está positiva. Confirme fundamento, fluxo e notícia antes de agir.' };
    if (avgChange < -0.6) return { title: 'Mercado pressionado', text: 'A amostra está negativa. Priorize risco, liquidez, qualidade e horizonte.' };
    return { title: 'Mercado misto', text: 'Sem direção única. Separe empresas, setores, valuation e cenário macro.' };
  }, [avgChange]);

  const margin = useMemo(() => {
    const current = parseNumber(price);
    const target = parseNumber(fairValue);
    if (!current || !target) return null;
    return ((target - current) / target) * 100;
  }, [price, fairValue]);

  function toggleWatch(symbol: string) {
    setWatch((current) => (current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol]));
  }

  function renderHoje() {
    return (
      <View style={styles.stack}>
        <Card highlight>
          <Text style={styles.kicker}>DADOS EM TEMPO REAL</Text>
          <Text style={styles.heroTitle}>Inteligência financeira clara para acompanhar o mercado.</Text>
          <Text style={styles.heroText}>Cotações, notícias, macro, fundamentos, radar e ferramentas educativas no celular.</Text>
          <View style={styles.rowWrap}>
            <Badge tone={isLive ? 'green' : 'amber'}>{isLive ? 'API ativa' : 'modo educativo'}</Badge>
            <Badge tone="dark">Atualizado {clock(marketData[0]?.fetchedAt)}</Badge>
          </View>
          <View style={styles.buttonRow}>
            <Button label="Criar conta grátis" primary onPress={() => openWeb('/login')} />
            <Button label="Premium R$19,90" onPress={() => openWeb('/premium')} />
          </View>
        </Card>

        <View style={styles.indexGrid}>
          {indexes.map((item) => (
            <View key={item.label} style={styles.indexCard}>
              <Text style={styles.indexLabel}>{item.label}</Text>
              <Text style={styles.indexValue}>{item.value}</Text>
              <Text style={item.tone === 'up' ? styles.greenText : styles.mutedText}>{item.change}</Text>
            </View>
          ))}
        </View>

        <Card>
          <Text style={styles.cardTitle}>{marketMood.title}</Text>
          <Text style={styles.cardText}>{marketMood.text}</Text>
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.cardTitle}>Painel macro</Text>
            <Text style={styles.sourceText}>Selic: Banco Central</Text>
          </View>
          {macroFallback.map((item) => (
            <View key={item.label} style={styles.macroRow}>
              <View style={styles.flex1}>
                <Text style={styles.rowTitle}>{item.label}</Text>
                <Text style={styles.rowText}>{item.text}</Text>
              </View>
              <View style={styles.macroValueBox}>
                <Text style={styles.macroValue}>{item.value}</Text>
                <Text style={styles.sourceText}>{item.source}</Text>
              </View>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Últimas notícias</Text>
          {fallbackNews.map((item) => (
            <View key={item.title} style={styles.newsRow}>
              <Text style={styles.rowTitle}>{item.title}</Text>
              <Text style={styles.rowText}>{item.source} · {item.time}</Text>
            </View>
          ))}
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
              <Pressable style={styles.watchButton} onPress={() => toggleWatch(item.symbol)}>
                <Text style={styles.watchButtonText}>{watch.includes(item.symbol) ? '✓' : '+'}</Text>
              </Pressable>
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
          <Text style={styles.cardTitle}>Screener de ações</Text>
          <Text style={styles.cardText}>Filtros educativos por P/L, P/VP, DY, ROE e qualidade.</Text>
          <View style={styles.buttonRow}>
            <Button label="Graham & Valor" onPress={() => openWeb('/graham-valor')} />
            <Button label="Screener completo" onPress={() => openWeb('/screener-acoes')} />
          </View>
        </Card>

        {screener.map((item) => (
          <View key={item.ticker} style={styles.screenerRow}>
            <View style={styles.flex1}>
              <Text style={styles.assetTicker}>{item.ticker}</Text>
              <Text style={styles.rowText}>{item.name}</Text>
              <Badge tone="green">{item.tag}</Badge>
            </View>
            <View style={styles.metricsGrid}>
              <Text style={styles.metric}>P/L {item.pe}</Text>
              <Text style={styles.metric}>P/VP {item.pvp}</Text>
              <Text style={styles.metric}>DY {item.dy}</Text>
              <Text style={styles.metric}>ROE {item.roe}</Text>
            </View>
          </View>
        ))}

        <Card>
          <Text style={styles.cardTitle}>Margem de segurança</Text>
          <Text style={styles.cardText}>Exercício educativo para comparar preço atual e valor estimado.</Text>
          <View style={styles.inputGrid}>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Preço atual</Text>
              <TextInput keyboardType="numeric" value={price} onChangeText={setPrice} style={styles.input} placeholderTextColor="#64748b" />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Valor estimado</Text>
              <TextInput keyboardType="numeric" value={fairValue} onChangeText={setFairValue} style={styles.input} placeholderTextColor="#64748b" />
            </View>
          </View>
          <Text style={styles.bigResult}>{margin === null ? 'Informe valores' : `${margin.toFixed(1).replace('.', ',')}%`}</Text>
        </Card>
      </View>
    );
  }

  function renderMercado() {
    return (
      <View style={styles.stack}>
        <Card>
          <Text style={styles.cardTitle}>Mercado e macro</Text>
          <Text style={styles.cardText}>Juros, inflação, dólar, calendário econômico e leitura de cenário.</Text>
        </Card>
        {macroFallback.map((item) => (
          <Card key={item.label}>
            <View style={styles.macroRowNoBorder}>
              <View style={styles.flex1}>
                <Text style={styles.rowTitle}>{item.label}</Text>
                <Text style={styles.rowText}>{item.text}</Text>
              </View>
              <Text style={styles.bigValue}>{item.value}</Text>
            </View>
          </Card>
        ))}
        <Card>
          <Text style={styles.cardTitle}>Backtesting</Text>
          <Text style={styles.cardText}>Teste ideias com histórico antes de transformar tese em estratégia.</Text>
          <Button label="Abrir backtesting" onPress={() => openWeb('/backtesting')} />
        </Card>
      </View>
    );
  }

  function renderMais() {
    return (
      <View style={styles.stack}>
        <Card highlight>
          <Text style={styles.kicker}>PREMIUM INDIVIDUAL</Text>
          <Text style={styles.cardTitle}>F-Insight Premium · R$ 19,90/mês</Text>
          {premiumFeatures.map((item) => <Text key={item} style={styles.bullet}>• {item}</Text>)}
          <Button label="Conhecer Premium" primary onPress={() => openWeb('/premium')} />
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Área Logada</Text>
          <Text style={styles.cardText}>Acesso discreto para cliente assessorado, assessor, escritório e admin.</Text>
          <View style={styles.buttonGrid}>
            <Button label="Cliente" onPress={() => openWeb('/cliente')} />
            <Button label="Assessor" onPress={() => openWeb('/assessor')} />
            <Button label="Escritório/Admin" onPress={() => openWeb('/admin')} />
            <Button label="Login" onPress={() => openWeb('/login')} />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Privacidade</Text>
          <Text style={styles.cardText}>Política de privacidade, exclusão de conta e exclusão de dados.</Text>
          <View style={styles.buttonGrid}>
            <Button label="Privacidade" onPress={() => openWeb('/privacidade')} />
            <Button label="Excluir conta" onPress={() => openWeb('/excluir-conta')} />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Aviso educacional</Text>
          <Text style={styles.cardText}>Informações de mercado não constituem recomendação de investimento. Use como apoio educativo.</Text>
        </Card>
      </View>
    );
  }

  const content = section === 'hoje' ? renderHoje() : section === 'radar' ? renderRadar() : section === 'ativos' ? renderAtivos() : section === 'mercado' ? renderMercado() : renderMais();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" translucent={false} />
      <View style={styles.root}>
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>F-Insight</Text>
            <Text style={styles.subtitle}>Radar financeiro</Text>
          </View>
          <Pressable style={styles.loginPill} onPress={() => openWeb('/login')}>
            <Text style={styles.loginText}>Área Logada</Text>
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {content}
        </ScrollView>

        <View style={styles.nav}>
          {([
            ['hoje', 'Hoje'],
            ['radar', 'Radar'],
            ['ativos', 'Ativos'],
            ['mercado', 'Mercado'],
            ['mais', 'Mais'],
          ] as Array<[Section, string]>).map(([key, label]) => (
            <Pressable key={key} style={[styles.navItem, section === key && styles.navItemActive]} onPress={() => setSection(key)}>
              <Text style={[styles.navText, section === key && styles.navTextActive]}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#020617', paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0 },
  root: { flex: 1, backgroundColor: '#020617' },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#0f172a', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  logo: { color: '#e2e8f0', fontSize: 22, fontWeight: '900' },
  subtitle: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2 },
  loginPill: { borderWidth: 1, borderColor: '#334155', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#0f172a' },
  loginText: { color: '#67e8f9', fontWeight: '800', fontSize: 12 },
  scrollContent: { padding: 16, paddingBottom: 116 },
  stack: { gap: 14 },
  card: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 22, padding: 16 },
  cardHighlight: { borderColor: '#155e75', backgroundColor: '#082f49' },
  kicker: { color: '#67e8f9', fontSize: 11, fontWeight: '900', letterSpacing: 1.3, marginBottom: 8 },
  heroTitle: { color: '#f8fafc', fontSize: 27, lineHeight: 32, fontWeight: '900', marginBottom: 10 },
  heroText: { color: '#cbd5e1', fontSize: 14, lineHeight: 21, marginBottom: 14 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 4 },
  badge: { overflow: 'hidden', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontSize: 11, fontWeight: '900' },
  badgeBlue: { backgroundColor: '#083344', color: '#67e8f9' },
  badgeGreen: { backgroundColor: '#064e3b', color: '#6ee7b7' },
  badgeAmber: { backgroundColor: '#451a03', color: '#fcd34d' },
  badgeRed: { backgroundColor: '#450a0a', color: '#fca5a5' },
  badgeDark: { backgroundColor: '#020617', color: '#94a3b8' },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 16 },
  buttonGrid: { gap: 10, marginTop: 12 },
  button: { borderWidth: 1, borderColor: '#334155', backgroundColor: '#020617', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 14, alignItems: 'center' },
  buttonPrimary: { backgroundColor: '#22d3ee', borderColor: '#22d3ee' },
  buttonText: { color: '#e2e8f0', fontSize: 13, fontWeight: '900' },
  buttonPrimaryText: { color: '#020617' },
  indexGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  indexCard: { width: '48%', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 18, padding: 13 },
  indexLabel: { color: '#64748b', fontSize: 10, fontWeight: '900', letterSpacing: 1.1 },
  indexValue: { color: '#f8fafc', fontSize: 18, fontWeight: '900', marginTop: 6 },
  greenText: { color: '#34d399', fontSize: 12, fontWeight: '900' },
  redText: { color: '#fb7185', fontSize: 12, fontWeight: '900' },
  mutedText: { color: '#94a3b8', fontSize: 12, fontWeight: '800' },
  cardTitle: { color: '#f8fafc', fontSize: 19, fontWeight: '900', marginBottom: 8 },
  cardText: { color: '#cbd5e1', fontSize: 13, lineHeight: 19 },
  sourceText: { color: '#64748b', fontSize: 10, fontWeight: '800' },
  sectionHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 10 },
  macroRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#1e293b' },
  macroRowNoBorder: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'center' },
  macroValueBox: { alignItems: 'flex-end', minWidth: 86 },
  macroValue: { color: '#f8fafc', fontSize: 18, fontWeight: '900' },
  bigValue: { color: '#f8fafc', fontSize: 24, fontWeight: '900' },
  flex1: { flex: 1 },
  rowTitle: { color: '#e2e8f0', fontSize: 14, fontWeight: '900', marginBottom: 3 },
  rowText: { color: '#94a3b8', fontSize: 12, lineHeight: 17 },
  newsRow: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#1e293b' },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 18, padding: 14 },
  assetTicker: { color: '#67e8f9', fontSize: 16, fontWeight: '900' },
  assetNumbers: { alignItems: 'flex-end' },
  assetPrice: { color: '#f8fafc', fontSize: 15, fontWeight: '900' },
  watchButton: { height: 32, width: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#083344' },
  watchButtonText: { color: '#67e8f9', fontSize: 16, fontWeight: '900' },
  screenerRow: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 18, padding: 14, gap: 10 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metric: { backgroundColor: '#020617', color: '#cbd5e1', borderWidth: 1, borderColor: '#1e293b', borderRadius: 10, paddingHorizontal: 8, paddingVertical: 6, fontSize: 11, fontWeight: '800' },
  inputGrid: { flexDirection: 'row', gap: 10, marginTop: 14 },
  inputBox: { flex: 1 },
  inputLabel: { color: '#94a3b8', fontSize: 11, marginBottom: 6, fontWeight: '800' },
  input: { backgroundColor: '#020617', borderWidth: 1, borderColor: '#334155', borderRadius: 12, color: '#f8fafc', paddingHorizontal: 12, paddingVertical: 10, fontWeight: '800' },
  bigResult: { color: '#67e8f9', fontSize: 30, fontWeight: '900', marginTop: 14 },
  bullet: { color: '#cbd5e1', fontSize: 13, lineHeight: 20, marginBottom: 8 },
  nav: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: '#020617', borderWidth: 1, borderColor: '#1e293b', borderRadius: 22, padding: 6, flexDirection: 'row', justifyContent: 'space-between' },
  navItem: { flex: 1, paddingVertical: 11, alignItems: 'center', borderRadius: 16 },
  navItemActive: { backgroundColor: '#083344' },
  navText: { color: '#64748b', fontSize: 11, fontWeight: '900' },
  navTextActive: { color: '#67e8f9' },
});
