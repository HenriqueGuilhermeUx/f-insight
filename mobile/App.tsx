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
type MacroItem = { id: string; label: string; value: number; unit: string; date?: string; source?: string; interpretation?: string };

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

const macroFallback: MacroItem[] = [
  { id: 'selic', label: 'Selic Meta', value: 14.0, unit: '% a.a.', source: 'fallback offline', interpretation: 'Taxa básica ainda alta. O app tenta atualizar online pela API F-Insight/BCB.' },
  { id: 'ipca', label: 'IPCA Mensal', value: 0.38, unit: '% m/m', source: 'fallback offline', interpretation: 'Inflação impacta juros futuros, margens corporativas e poder de compra.' },
  { id: 'usdbrl', label: 'Dólar Comercial', value: 5.1, unit: 'BRL', source: 'fallback offline', interpretation: 'Câmbio afeta inflação, commodities, exportadoras e empresas com dívida em dólar.' },
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

function macroValue(item: MacroItem) {
  if (item.unit === 'BRL') return `R$ ${item.value.toFixed(2).replace('.', ',')}`;
  const decimals = item.value % 1 === 0 ? 2 : 2;
  return `${item.value.toFixed(decimals).replace('.', ',')}%`;
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
  const [isMacroLive, setIsMacroLive] = useState(false);
  const [macroUpdatedAt, setMacroUpdatedAt] = useState<string | undefined>();
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [macroItems, setMacroItems] = useState<MacroItem[]>(macroFallback);
  const [watch, setWatch] = useState(['PETR4.SA', 'ITUB4.SA', 'BBAS3.SA']);
  const [price, setPrice] = useState('28');
  const [fairValue, setFairValue] = useState('36');

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
        } else {
          setIndicators([]);
          setIsLive(false);
        }

        if (macroResponse.status === 'fulfilled' && macroResponse.value.ok) {
          const payload = await macroResponse.value.json();
          const data = Array.isArray(payload?.indicators) ? payload.indicators : [];
          if (data.length > 0) {
            setMacroItems(data);
            setMacroUpdatedAt(payload?.updatedAt);
            setIsMacroLive(String(payload?.source || '').includes('online') || String(payload?.source || '').includes('banco-central'));
          }
        } else {
          setMacroItems(macroFallback);
          setIsMacroLive(false);
        }
      } catch {
        if (!cancelled) {
          setIndicators([]);
          setIsLive(false);
          setMacroItems(macroFallback);
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

  function openLoggedArea() {
    Alert.alert('Área Logada', 'Escolha o tipo de acesso:', [
      { text: 'Cliente', onPress: () => openWeb('/cliente') },
      { text: 'Assessor', onPress: () => openWeb('/assessor') },
      { text: 'Escritório/Admin', onPress: () => openWeb('/admin') },
      { text: 'Cancelar', style: 'cancel' },
    ]);
  }

  function renderHoje() {
    return (
      <View style={styles.stack}>
        <Card highlight>
          <Text style={styles.kicker}>DADOS EM TEMPO REAL</Text>
          <Text style={styles.heroTitle}>Inteligência financeira clara para acompanhar o mercado.</Text>
          <Text style={styles.heroText}>Cotações, notícias, macro, fundamentos, radar e ferramentas educativas no celular.</Text>
          <View style={styles.rowWrap}>
            <Badge tone={isLive ? 'green' : 'amber'}>{isLive ? 'Cotações online' : 'cotações demo'}</Badge>
            <Badge tone={isMacroLive ? 'green' : 'amber'}>{isMacroLive ? 'Macro online BCB' : 'macro fallback'}</Badge>
            <Badge tone="dark">Atualizado {clock(macroUpdatedAt || marketData[0]?.fetchedAt)}</Badge>
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
            <Text style={styles.sourceText}>{isMacroLive ? 'Fonte: Banco Central online' : 'Fallback offline'}</Text>
          </View>
          {macroItems.map((item) => (
            <View key={item.id || item.label} style={styles.macroRow}>
              <View style={styles.flex1}>
                <Text style={styles.rowTitle}>{item.label}</Text>
                <Text style={styles.rowText}>{item.interpretation || 'Indicador macroeconômico acompanhado pelo F-Insight.'}</Text>
              </View>
              <View style={styles.macroValueBox}>
                <Text style={styles.macroValue}>{macroValue(item)}</Text>
                <Text style={styles.sourceText}>{item.source || item.date || 'online'}</Text>
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
                <Text style={styles.watchText}>{watch.includes(item.symbol) ? '✓' : '+'}</Text>
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
          <Text style={styles.cardTitle}>Ativos e fundamentos</Text>
          <Text style={styles.cardText}>Screener educativo com múltiplos, dividendos e qualidade.</Text>
        </Card>
        {screener.map((item) => (
          <Pressable key={item.ticker} style={styles.screenerRow} onPress={() => openWeb(`/ativo/${item.ticker}`)}>
            <View style={styles.flex1}>
              <Text style={styles.assetTicker}>{item.ticker}</Text>
              <Text style={styles.rowText}>{item.name}</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metric}>P/L {item.pe}</Text>
                <Text style={styles.metric}>P/VP {item.pvp}</Text>
                <Text style={styles.metric}>DY {item.dy}</Text>
                <Text style={styles.metric}>ROE {item.roe}</Text>
              </View>
            </View>
            <Badge tone="blue">{item.tag}</Badge>
          </Pressable>
        ))}
        <Card>
          <Text style={styles.cardTitle}>Margem de segurança</Text>
          <Text style={styles.cardText}>Exercício educativo para comparar preço atual e valor estimado.</Text>
          <View style={styles.inputRow}>
            <TextInput value={price} onChangeText={setPrice} keyboardType="numeric" placeholder="Preço" placeholderTextColor="#64748b" style={styles.input} />
            <TextInput value={fairValue} onChangeText={setFairValue} keyboardType="numeric" placeholder="Valor justo" placeholderTextColor="#64748b" style={styles.input} />
          </View>
          <Text style={styles.resultText}>{margin === null ? 'Informe preço e valor.' : `Margem estimada: ${margin.toFixed(1).replace('.', ',')}%`}</Text>
        </Card>
      </View>
    );
  }

  function renderMercado() {
    return (
      <View style={styles.stack}>
        <Card>
          <Text style={styles.cardTitle}>Mercado e macro</Text>
          <Text style={styles.cardText}>Juros, inflação, câmbio e leitura de cenário em linguagem simples.</Text>
        </Card>
        {macroItems.map((item) => (
          <Card key={`mercado-${item.id || item.label}`}>
            <View style={styles.sectionHeader}>
              <Text style={styles.cardTitle}>{item.label}</Text>
              <Text style={styles.macroValue}>{macroValue(item)}</Text>
            </View>
            <Text style={styles.cardText}>{item.interpretation || 'Indicador acompanhado para leitura macro.'}</Text>
            <Text style={styles.sourceText}>Fonte: {item.source || 'API F-Insight'} · {item.date || clock(macroUpdatedAt)}</Text>
          </Card>
        ))}
      </View>
    );
  }

  function renderMais() {
    return (
      <View style={styles.stack}>
        <Card highlight>
          <Text style={styles.cardTitle}>F-Insight Premium</Text>
          <Text style={styles.priceText}>R$ 19,90/mês</Text>
          {premiumFeatures.map((item) => <Text key={item} style={styles.bullet}>• {item}</Text>)}
          <Button label="Conhecer Premium" primary onPress={() => openWeb('/premium')} />
        </Card>
        <Card>
          <Text style={styles.cardTitle}>Área Logada</Text>
          <Text style={styles.cardText}>Acesso discreto para clientes assessorados, assessores e escritórios.</Text>
          <Button label="Abrir Área Logada" onPress={openLoggedArea} />
        </Card>
        <Card>
          <Text style={styles.cardTitle}>Privacidade</Text>
          <View style={styles.buttonRow}>
            <Button label="Privacidade" onPress={() => openWeb('/privacidade')} />
            <Button label="Excluir conta" onPress={() => openWeb('/excluir-conta')} />
          </View>
        </Card>
      </View>
    );
  }

  const content = section === 'radar' ? renderRadar() : section === 'ativos' ? renderAtivos() : section === 'mercado' ? renderMercado() : section === 'mais' ? renderMais() : renderHoje();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>F-Insight</Text>
          <Text style={styles.subtitle}>Mercado, macro e inteligência financeira</Text>
        </View>
        <Pressable onPress={openLoggedArea} style={styles.loginPill}>
          <Text style={styles.loginText}>Área Logada</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>{content}</ScrollView>
      <View style={styles.bottomNav}>
        {[
          ['hoje', 'Hoje'],
          ['radar', 'Radar'],
          ['ativos', 'Ativos'],
          ['mercado', 'Mercado'],
          ['mais', 'Mais'],
        ].map(([key, label]) => (
          <Pressable key={key} onPress={() => setSection(key as Section)} style={[styles.navItem, section === key && styles.navItemActive]}>
            <Text style={[styles.navText, section === key && styles.navTextActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617', paddingTop: Platform.OS === 'android' ? 8 : 0 },
  header: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#1e293b', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  logo: { color: '#e2e8f0', fontSize: 24, fontWeight: '900' },
  subtitle: { color: '#64748b', fontSize: 11, fontWeight: '700' },
  loginPill: { borderWidth: 1, borderColor: '#334155', borderRadius: 999, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#0f172a' },
  loginText: { color: '#cbd5e1', fontSize: 12, fontWeight: '800' },
  content: { padding: 16, paddingBottom: 112 },
  stack: { gap: 14 },
  card: { borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#0f172a', borderRadius: 22, padding: 16 },
  cardHighlight: { borderColor: '#164e63', backgroundColor: '#082f49' },
  kicker: { color: '#67e8f9', fontSize: 11, fontWeight: '900', letterSpacing: 1.4, marginBottom: 8 },
  heroTitle: { color: '#f8fafc', fontSize: 26, lineHeight: 31, fontWeight: '900' },
  heroText: { color: '#cbd5e1', fontSize: 14, lineHeight: 21, marginTop: 10 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 14 },
  badge: { overflow: 'hidden', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 5, fontSize: 11, fontWeight: '900' },
  badgeBlue: { color: '#67e8f9', backgroundColor: '#083344' },
  badgeGreen: { color: '#86efac', backgroundColor: '#064e3b' },
  badgeAmber: { color: '#fde68a', backgroundColor: '#451a03' },
  badgeRed: { color: '#fecaca', backgroundColor: '#450a0a' },
  badgeDark: { color: '#cbd5e1', backgroundColor: '#1e293b' },
  buttonRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 14 },
  button: { borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#0f172a' },
  buttonPrimary: { backgroundColor: '#22d3ee', borderColor: '#22d3ee' },
  buttonText: { color: '#e2e8f0', fontWeight: '900', fontSize: 13 },
  buttonPrimaryText: { color: '#082f49' },
  indexGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  indexCard: { width: '48%', borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#0b1220', borderRadius: 18, padding: 14 },
  indexLabel: { color: '#64748b', fontSize: 11, fontWeight: '900' },
  indexValue: { color: '#f8fafc', fontSize: 20, fontWeight: '900', marginTop: 8 },
  cardTitle: { color: '#f8fafc', fontSize: 18, fontWeight: '900' },
  cardText: { color: '#94a3b8', fontSize: 14, lineHeight: 21, marginTop: 8 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 8 },
  sourceText: { color: '#64748b', fontSize: 10, fontWeight: '700' },
  macroRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 12, marginTop: 12 },
  flex1: { flex: 1 },
  rowTitle: { color: '#e2e8f0', fontSize: 14, fontWeight: '900' },
  rowText: { color: '#94a3b8', fontSize: 12, lineHeight: 17, marginTop: 3 },
  macroValueBox: { alignItems: 'flex-end', maxWidth: 120 },
  macroValue: { color: '#67e8f9', fontSize: 17, fontWeight: '900' },
  newsRow: { borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 12, marginTop: 12 },
  greenText: { color: '#86efac', fontWeight: '900' },
  redText: { color: '#fca5a5', fontWeight: '900' },
  mutedText: { color: '#94a3b8', fontWeight: '900' },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#0f172a', borderRadius: 18, padding: 14 },
  assetTicker: { color: '#67e8f9', fontSize: 17, fontWeight: '900' },
  assetNumbers: { alignItems: 'flex-end' },
  assetPrice: { color: '#f8fafc', fontSize: 14, fontWeight: '900' },
  watchButton: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center', backgroundColor: '#1e293b' },
  watchText: { color: '#67e8f9', fontWeight: '900', fontSize: 16 },
  screenerRow: { borderWidth: 1, borderColor: '#1e293b', backgroundColor: '#0f172a', borderRadius: 18, padding: 14, gap: 12, flexDirection: 'row', alignItems: 'center' },
  metricRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  metric: { color: '#cbd5e1', fontSize: 11, fontWeight: '800', backgroundColor: '#1e293b', paddingHorizontal: 7, paddingVertical: 4, borderRadius: 8 },
  inputRow: { flexDirection: 'row', gap: 10, marginTop: 14 },
  input: { flex: 1, borderWidth: 1, borderColor: '#334155', color: '#f8fafc', backgroundColor: '#020617', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
  resultText: { color: '#86efac', fontWeight: '900', marginTop: 12 },
  priceText: { color: '#67e8f9', fontSize: 30, fontWeight: '900', marginVertical: 8 },
  bullet: { color: '#cbd5e1', fontSize: 14, lineHeight: 22, marginVertical: 3 },
  bottomNav: { position: 'absolute', left: 0, right: 0, bottom: 0, paddingHorizontal: 10, paddingTop: 10, paddingBottom: Platform.OS === 'android' ? 18 : 22, backgroundColor: '#020617', borderTopWidth: 1, borderTopColor: '#1e293b', flexDirection: 'row', gap: 6 },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14 },
  navItemActive: { backgroundColor: '#083344' },
  navText: { color: '#64748b', fontWeight: '900', fontSize: 12 },
  navTextActive: { color: '#67e8f9' },
});
