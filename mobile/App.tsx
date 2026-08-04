import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
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

type AppMode = 'public' | 'client' | 'advisor' | 'office';
type Section = 'dashboard' | 'radar' | 'ativos' | 'mercado' | 'mais';

type LiveIndicator = {
  symbol: string;
  lastPrice: number;
  changePercent: number;
  fetchedAt?: string;
};

type Insight = {
  title: string;
  text: string;
  tag: string;
};

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

const macro = [
  { label: 'Selic', value: '15,00%', text: 'Custo de oportunidade alto. Renda variável precisa justificar risco.' },
  { label: 'IPCA', value: '4,2%', text: 'Inflação ainda exige atenção em consumo, varejo e juros reais.' },
  { label: 'Dólar', value: 'R$ 5,10', text: 'Impacta exportadoras, importadoras, commodities e inflação.' },
];

const screener = [
  { ticker: 'PETR4', name: 'Petrobras PN', pe: '5,1x', pvp: '1,2x', dy: '12,4%', roe: '23%', tag: 'Valor' },
  { ticker: 'BBAS3', name: 'Banco do Brasil ON', pe: '4,8x', pvp: '0,9x', dy: '9,8%', roe: '21%', tag: 'Dividendos' },
  { ticker: 'VALE3', name: 'Vale ON', pe: '6,7x', pvp: '1,4x', dy: '7,1%', roe: '18%', tag: 'Commodities' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco PN', pe: '8,9x', pvp: '1,7x', dy: '6,2%', roe: '20%', tag: 'Qualidade' },
  { ticker: 'WEGE3', name: 'WEG ON', pe: '32,0x', pvp: '8,4x', dy: '1,5%', roe: '27%', tag: 'Crescimento' },
];

const insights: Insight[] = [
  { tag: 'Mercado', title: 'Juros ainda definem a régua', text: 'Com taxa alta, compare retorno esperado de ações com renda fixa antes de assumir risco.' },
  { tag: 'Fundamentos', title: 'P/L baixo não basta', text: 'Lucro cíclico, dívida, governança e margem importam tanto quanto múltiplos baratos.' },
  { tag: 'Dividendos', title: 'DY alto precisa de qualidade', text: 'Olhe payout, caixa, previsibilidade e histórico antes de concluir que o dividendo é sustentável.' },
];

const news = [
  { title: 'Bolsas globais avançam enquanto mercado monitora juros, commodities e dólar.', source: 'Mercado Global', time: 'agora' },
  { title: 'Temporada de balanços coloca margens, caixa e endividamento no centro da análise.', source: 'F-Insight Research', time: '2h' },
  { title: 'Ações ligadas a commodities reagem a câmbio e China; bancos seguem sensíveis à curva de juros.', source: 'Radar Brasil', time: '4h' },
];

const tools = [
  { title: 'Margem de segurança', text: 'Compare preço atual e valor estimado como exercício educativo.' },
  { title: 'Checklist de decisão', text: 'Cenário, risco, prazo, fundamento e adequação antes de agir.' },
  { title: 'Alertas de preço', text: 'Próxima etapa: avisos quando um ativo atingir preço ou variação relevante.' },
  { title: 'IA Financeira', text: 'Próxima etapa: explicar indicadores e resumir ativos em linguagem simples.' },
];

const learning = [
  'Preço é uma cotação. Valor é uma estimativa dependente de premissas.',
  'P/L e P/VP ajudam, mas não substituem análise de qualidade, caixa e risco.',
  'Dividend yield alto pode ser oportunidade ou alerta de risco. Confira sustentabilidade.',
  'Juros altos aumentam a régua para renda variável e reduzem tolerância a erro.',
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
  if (!value) return 'modo educativo';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'modo educativo';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function openWeb(path: string) {
  const safePath = path.startsWith('/') ? path : `/${path}`;
  void Linking.openURL(`${WEB_URL}${safePath}`);
}

function Card({ children, muted = false }: { children: React.ReactNode; muted?: boolean }) {
  return <View style={[styles.card, muted && styles.cardMuted]}>{children}</View>;
}

function Badge({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' | 'red' | 'dark' }) {
  const style = tone === 'green' ? styles.badgeGreen : tone === 'amber' ? styles.badgeAmber : tone === 'red' ? styles.badgeRed : tone === 'dark' ? styles.badgeDark : styles.badgeBlue;
  return <Text style={[styles.badge, style]}>{children}</Text>;
}

function SmallButton({ label, onPress, primary = false }: { label: string; onPress: () => void; primary?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.smallButton, primary && styles.smallButtonPrimary]}>
      <Text style={[styles.smallButtonText, primary && styles.smallButtonPrimaryText]}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  const [section, setSection] = useState<Section>('dashboard');
  const [mode, setMode] = useState<AppMode>('public');
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [watch, setWatch] = useState(['PETR4.SA', 'ITUB4.SA', 'BBAS3.SA']);
  const [price, setPrice] = useState('28');
  const [fairValue, setFairValue] = useState('36');
  const [question, setQuestion] = useState('');

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
    if (avgChange > 0.6) return { title: 'Mercado construtivo', text: 'A amostra acompanhada está positiva. Verifique se o movimento vem de fundamento, fluxo ou notícia.' };
    if (avgChange < -0.6) return { title: 'Mercado pressionado', text: 'A amostra acompanhada está negativa. Foque em risco, liquidez e qualidade.' };
    return { title: 'Mercado misto', text: 'Sem direção única. Separe empresas, setores e cenário macro antes de agir.' };
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

  function askAdvisor() {
    if (mode === 'public') {
      Alert.alert('Área logada', 'Entre como cliente para enviar dúvidas ao assessor.');
      return;
    }
    if (!question.trim()) return;
    Alert.alert('Dúvida registrada', 'Na versão logada, seu assessor recebe essa mensagem como próxima ação.');
    setQuestion('');
  }

  function renderHeaderCopy() {
    if (mode === 'client') return 'Cliente assessorado';
    if (mode === 'advisor') return 'Assessor';
    if (mode === 'office') return 'Escritório';
    return 'Público';
  }

  function renderDashboard() {
    return (
      <View style={styles.stack}>
        <Card>
          <View style={styles.heroTop}>
            <View style={styles.flex1}>
              <Text style={styles.kicker}>DADOS EM TEMPO REAL</Text>
              <Text style={styles.heroTitle}>Inteligência financeira clara para acompanhar o mercado.</Text>
              <Text style={styles.heroText}>Radar, fundamentos, notícias, macro, alertas e aprendizado. Sem corretora, sem carteira real e sem recomendação automática.</Text>
              <View style={styles.rowWrap}>
                <Badge tone={isLive ? 'green' : 'amber'}>{isLive ? 'API ativa' : 'modo educativo'}</Badge>
                <Badge tone="dark">Atualizado {clock(marketData[0]?.fetchedAt)}</Badge>
              </View>
            </View>
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

        <View style={styles.quickGrid}>
          <Pressable style={styles.quickCard} onPress={() => setSection('radar')}>
            <Text style={styles.quickIcon}>RA</Text>
            <Text style={styles.quickTitle}>Radar</Text>
            <Text style={styles.quickText}>Preço, variação e sinais.</Text>
          </Pressable>
          <Pressable style={styles.quickCard} onPress={() => setSection('ativos')}>
            <Text style={styles.quickIcon}>FU</Text>
            <Text style={styles.quickTitle}>Fundamentos</Text>
            <Text style={styles.quickText}>P/L, P/VP, DY e ROE.</Text>
          </Pressable>
        </View>

        {insights.map((item) => (
          <Card key={item.title} muted>
            <Badge>{item.tag}</Badge>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardText}>{item.text}</Text>
          </Card>
        ))}
      </View>
    );
  }

  function renderRadar() {
    return (
      <View style={styles.stack}>
        <View>
          <Text style={styles.screenTitle}>Radar de ativos</Text>
          <Text style={styles.screenSubtitle}>Acompanhe ativos relevantes, salve na lista e observe direção do dia.</Text>
        </View>
        {loading ? <ActivityIndicator color="#22d3ee" /> : null}
        {marketData.map((item) => {
          const positive = item.changePercent >= 0;
          const watched = watch.includes(item.symbol);
          return (
            <Card key={item.symbol}>
              <View style={styles.assetRow}>
                <View style={styles.tickerMark}><Text style={styles.tickerMarkText}>{cleanSymbol(item.symbol).slice(0, 2)}</Text></View>
                <View style={styles.flex1}>
                  <Text style={styles.assetTicker}>{cleanSymbol(item.symbol)}</Text>
                  <Text style={styles.assetName}>{symbolName(item.symbol)}</Text>
                  <Text style={styles.signalText}>{positive ? 'Sinal: momento positivo no dia' : 'Sinal: pressão no dia'}</Text>
                </View>
                <View style={styles.assetRight}>
                  <Text style={styles.assetPrice}>{money(item.lastPrice)}</Text>
                  <Text style={positive ? styles.greenTextStrong : styles.redTextStrong}>{pct(item.changePercent)}</Text>
                  <Pressable onPress={() => toggleWatch(item.symbol)}><Text style={watched ? styles.starActive : styles.star}>★</Text></Pressable>
                </View>
              </View>
            </Card>
          );
        })}
      </View>
    );
  }

  function renderAtivos() {
    return (
      <View style={styles.stack}>
        <View>
          <Text style={styles.screenTitle}>Ativos e fundamentos</Text>
          <Text style={styles.screenSubtitle}>Screener simplificado para leitura fundamentalista.</Text>
        </View>
        {screener.map((row) => (
          <Card key={row.ticker}>
            <View style={styles.assetRowTop}>
              <View>
                <Text style={styles.assetTicker}>{row.ticker}</Text>
                <Text style={styles.assetName}>{row.name}</Text>
              </View>
              <Badge tone="amber">{row.tag}</Badge>
            </View>
            <View style={styles.metricsGrid}>
              <View><Text style={styles.metricLabel}>P/L</Text><Text style={styles.metricValue}>{row.pe}</Text></View>
              <View><Text style={styles.metricLabel}>P/VP</Text><Text style={styles.metricValue}>{row.pvp}</Text></View>
              <View><Text style={styles.metricLabel}>DY</Text><Text style={styles.metricValueGreen}>{row.dy}</Text></View>
              <View><Text style={styles.metricLabel}>ROE</Text><Text style={styles.metricValue}>{row.roe}</Text></View>
            </View>
          </Card>
        ))}

        <Card>
          <Text style={styles.cardTitle}>Margem de segurança</Text>
          <Text style={styles.cardText}>Ferramenta educativa para comparar preço atual e valor estimado.</Text>
          <View style={styles.inputGrid}>
            <View style={styles.inputBox}><Text style={styles.inputLabel}>Preço</Text><TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={styles.input} /></View>
            <View style={styles.inputBox}><Text style={styles.inputLabel}>Valor</Text><TextInput value={fairValue} onChangeText={setFairValue} keyboardType="decimal-pad" style={styles.input} /></View>
          </View>
          <Text style={[styles.bigMetric, (margin || 0) >= 0 ? styles.greenText : styles.redText]}>{margin === null ? '—' : pct(margin)}</Text>
        </Card>
      </View>
    );
  }

  function renderMercado() {
    return (
      <View style={styles.stack}>
        <View>
          <Text style={styles.screenTitle}>Mercado</Text>
          <Text style={styles.screenSubtitle}>Notícias, macro e pontos de atenção para o investidor.</Text>
        </View>
        {news.map((item) => (
          <Card key={item.title}>
            <Badge tone="dark">{item.source} · {item.time}</Badge>
            <Text style={styles.cardTitle}>{item.title}</Text>
          </Card>
        ))}
        {macro.map((item) => (
          <Card key={item.label} muted>
            <View style={styles.assetRowTop}>
              <Text style={styles.cardTitle}>{item.label}</Text>
              <Text style={styles.macroValue}>{item.value}</Text>
            </View>
            <Text style={styles.cardText}>{item.text}</Text>
          </Card>
        ))}
      </View>
    );
  }

  function renderMais() {
    return (
      <View style={styles.stack}>
        <View>
          <Text style={styles.screenTitle}>Mais</Text>
          <Text style={styles.screenSubtitle}>Aprenda, configure alertas e acesse a área logada quando fizer sentido.</Text>
        </View>

        <Card>
          <View style={styles.assetRowTop}>
            <View>
              <Text style={styles.cardTitle}>Área Logada</Text>
              <Text style={styles.cardText}>Discreta e separada do conteúdo público. Escolha seu acesso.</Text>
            </View>
            <Badge tone="green">{renderHeaderCopy()}</Badge>
          </View>
          <View style={styles.loginGrid}>
            <SmallButton label="Cliente" onPress={() => { setMode('client'); openWeb('/cliente/app'); }} primary />
            <SmallButton label="Assessor" onPress={() => { setMode('advisor'); openWeb('/assessor'); }} />
            <SmallButton label="Escritório" onPress={() => { setMode('office'); openWeb('/admin'); }} />
          </View>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Ferramentas úteis</Text>
          {tools.map((tool) => (
            <View key={tool.title} style={styles.listItem}>
              <Text style={styles.listTitle}>{tool.title}</Text>
              <Text style={styles.cardText}>{tool.text}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Aprender</Text>
          {learning.map((item, index) => (
            <View key={item} style={styles.learnRow}>
              <Text style={styles.learnNumber}>{index + 1}</Text>
              <Text style={styles.learnText}>{item}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Perguntar ao assessor</Text>
          <Text style={styles.cardText}>Disponível para cliente logado. No modo público, use apenas como rascunho.</Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            placeholder="Digite sua dúvida..."
            placeholderTextColor="#64748b"
            multiline
            style={[styles.input, styles.textArea]}
          />
          <Pressable onPress={askAdvisor} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Enviar dúvida</Text></Pressable>
        </Card>
      </View>
    );
  }

  const content = section === 'dashboard' ? renderDashboard() : section === 'radar' ? renderRadar() : section === 'ativos' ? renderAtivos() : section === 'mercado' ? renderMercado() : renderMais();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <View style={styles.header}>
        <View style={styles.logoMark}><Text style={styles.logoMarkText}>FI</Text></View>
        <View style={styles.flex1}>
          <Text style={styles.logoText}>F-Insight</Text>
          <Text style={styles.logoSub}>Inteligência financeira</Text>
        </View>
        <Pressable onPress={() => setSection('mais')} style={styles.loggedButton}><Text style={styles.loggedButtonText}>Área Logada</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>{content}</ScrollView>

      <View style={styles.bottomNav}>
        {([
          ['dashboard', 'Dashboard'],
          ['radar', 'Radar'],
          ['ativos', 'Ativos'],
          ['mercado', 'Mercado'],
          ['mais', 'Mais'],
        ] as Array<[Section, string]>).map(([key, label]) => (
          <Pressable key={key} onPress={() => setSection(key)} style={[styles.navItem, section === key && styles.navItemActive]}>
            <Text style={[styles.navLabel, section === key && styles.navLabelActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  flex1: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#0f172a', backgroundColor: '#020617' },
  logoMark: { width: 40, height: 40, borderRadius: 14, backgroundColor: '#0891b2', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  logoMarkText: { color: '#fff', fontWeight: '900', fontSize: 15 },
  logoText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  logoSub: { color: '#64748b', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 1 },
  loggedButton: { borderWidth: 1, borderColor: '#334155', backgroundColor: '#0f172a', borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8 },
  loggedButtonText: { color: '#cbd5e1', fontSize: 11, fontWeight: '900' },
  scroll: { padding: 16, paddingBottom: 112 },
  stack: { gap: 14 },
  heroTop: { flexDirection: 'row', alignItems: 'flex-start' },
  kicker: { color: '#22d3ee', fontSize: 11, fontWeight: '900', letterSpacing: 1.7, marginBottom: 8 },
  heroTitle: { color: '#fff', fontSize: 30, lineHeight: 36, fontWeight: '900' },
  heroText: { color: '#cbd5e1', fontSize: 15, lineHeight: 22, marginTop: 12, marginBottom: 14 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  card: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 24, padding: 16 },
  cardMuted: { backgroundColor: '#0b1220' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 7 },
  cardText: { color: '#94a3b8', fontSize: 14, lineHeight: 20 },
  badge: { alignSelf: 'flex-start', borderRadius: 999, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5, marginRight: 8, marginBottom: 10, fontSize: 10, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.8 },
  badgeBlue: { backgroundColor: '#155e7522', color: '#67e8f9' },
  badgeGreen: { backgroundColor: '#16a34a22', color: '#86efac' },
  badgeAmber: { backgroundColor: '#f59e0b22', color: '#fcd34d' },
  badgeRed: { backgroundColor: '#dc262622', color: '#fca5a5' },
  badgeDark: { backgroundColor: '#1e293b', color: '#cbd5e1' },
  indexGrid: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: -5 },
  indexCard: { width: '50%', padding: 5 },
  indexLabel: { color: '#64748b', fontSize: 11, fontWeight: '900', letterSpacing: 1.1 },
  indexValue: { color: '#fff', fontSize: 22, fontWeight: '900', marginTop: 7 },
  mutedText: { color: '#94a3b8', fontWeight: '900', marginTop: 4 },
  greenText: { color: '#34d399' },
  redText: { color: '#f87171' },
  greenTextStrong: { color: '#34d399', fontWeight: '900', marginTop: 5 },
  redTextStrong: { color: '#f87171', fontWeight: '900', marginTop: 5 },
  quickGrid: { flexDirection: 'row', gap: 12 },
  quickCard: { flex: 1, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 22, padding: 14 },
  quickIcon: { color: '#22d3ee', fontWeight: '900', fontSize: 17, marginBottom: 12 },
  quickTitle: { color: '#fff', fontWeight: '900', fontSize: 16 },
  quickText: { color: '#94a3b8', fontSize: 12, marginTop: 5, lineHeight: 17 },
  screenTitle: { color: '#fff', fontSize: 29, fontWeight: '900' },
  screenSubtitle: { color: '#94a3b8', fontSize: 15, lineHeight: 22, marginTop: 5 },
  assetRow: { flexDirection: 'row', alignItems: 'center' },
  assetRowTop: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  tickerMark: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#155e75', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  tickerMarkText: { color: '#67e8f9', fontWeight: '900' },
  assetTicker: { color: '#fff', fontSize: 17, fontWeight: '900' },
  assetName: { color: '#94a3b8', fontSize: 12, marginTop: 3 },
  signalText: { color: '#64748b', fontSize: 11, marginTop: 6, fontWeight: '800' },
  assetRight: { alignItems: 'flex-end', marginLeft: 10 },
  assetPrice: { color: '#fff', fontWeight: '900', fontSize: 14 },
  star: { color: '#64748b', fontSize: 20, marginTop: 5 },
  starActive: { color: '#facc15', fontSize: 20, marginTop: 5 },
  metricsGrid: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#1e293b', marginTop: 14, paddingTop: 14 },
  metricLabel: { color: '#64748b', fontSize: 10, fontWeight: '900', marginBottom: 4 },
  metricValue: { color: '#fff', fontSize: 14, fontWeight: '900' },
  metricValueGreen: { color: '#34d399', fontSize: 14, fontWeight: '900' },
  inputGrid: { flexDirection: 'row', marginTop: 12 },
  inputBox: { flex: 1, marginRight: 8 },
  inputLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '800', marginBottom: 6 },
  input: { backgroundColor: '#020617', borderWidth: 1, borderColor: '#1e293b', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11, color: '#fff', fontSize: 15 },
  textArea: { minHeight: 98, textAlignVertical: 'top', marginTop: 12 },
  bigMetric: { color: '#fff', fontSize: 36, fontWeight: '900', marginTop: 12 },
  macroValue: { color: '#22d3ee', fontSize: 18, fontWeight: '900' },
  loginGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 14 },
  smallButton: { borderWidth: 1, borderColor: '#334155', borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginRight: 8, marginBottom: 8, backgroundColor: '#020617' },
  smallButtonPrimary: { backgroundColor: '#22d3ee', borderColor: '#22d3ee' },
  smallButtonText: { color: '#fff', fontWeight: '900', fontSize: 12 },
  smallButtonPrimaryText: { color: '#020617' },
  listItem: { borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 12, marginTop: 12 },
  listTitle: { color: '#fff', fontSize: 15, fontWeight: '900', marginBottom: 3 },
  learnRow: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 12, marginTop: 12 },
  learnNumber: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#155e75', color: '#67e8f9', textAlign: 'center', lineHeight: 28, fontWeight: '900', marginRight: 10 },
  learnText: { flex: 1, color: '#cbd5e1', lineHeight: 20, fontSize: 14 },
  primaryButton: { marginTop: 12, borderRadius: 16, backgroundColor: '#22d3ee', paddingVertical: 13, alignItems: 'center' },
  primaryButtonText: { color: '#020617', fontWeight: '900' },
  bottomNav: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 24, padding: 8, flexDirection: 'row' },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 16 },
  navItemActive: { backgroundColor: '#082f49' },
  navLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '900' },
  navLabelActive: { color: '#22d3ee' },
});
