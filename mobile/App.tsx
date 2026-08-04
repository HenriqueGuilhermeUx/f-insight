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

type AppMode = 'public' | 'client' | 'advisor';
type Section = 'dashboard' | 'radar' | 'screener' | 'mercado' | 'mais';

type LiveIndicator = {
  symbol: string;
  lastPrice: number;
  changePercent: number;
  fetchedAt?: string;
};

const fallbackIndicators: LiveIndicator[] = [
  { symbol: 'PETR4.SA', lastPrice: 38.42, changePercent: 0.72 },
  { symbol: 'VALE3.SA', lastPrice: 61.18, changePercent: -0.35 },
  { symbol: 'ITUB4.SA', lastPrice: 34.9, changePercent: 0.41 },
  { symbol: 'BBDC4.SA', lastPrice: 14.62, changePercent: -0.18 },
  { symbol: 'WEGE3.SA', lastPrice: 42.75, changePercent: 1.12 },
  { symbol: 'BBAS3.SA', lastPrice: 29.8, changePercent: 0.22 },
  { symbol: 'ABEV3.SA', lastPrice: 12.34, changePercent: -0.41 },
  { symbol: 'RENT3.SA', lastPrice: 52.1, changePercent: 1.03 },
];

const indexes = [
  { label: 'IBOVESPA', value: '178.002', change: '0,00%', tone: 'flat' },
  { label: 'S&P 500', value: '7.600', change: '+1,48%', tone: 'up' },
  { label: 'Dólar', value: 'R$ 5,10', change: '+0,15%', tone: 'up' },
  { label: 'Bitcoin', value: 'US$ 63.898', change: '+1,90%', tone: 'up' },
];

const news = [
  { title: 'Bolsas globais avançam enquanto investidores monitoram juros, commodities e dólar.', source: 'Mercado Global', time: 'agora' },
  { title: 'Temporada de balanços coloca margens, geração de caixa e endividamento no centro da análise.', source: 'F-Insight Research', time: '2h' },
  { title: 'Ações ligadas a commodities reagem a câmbio e China; bancos seguem sensíveis à curva de juros.', source: 'Radar Brasil', time: '4h' },
];

const screener = [
  { ticker: 'PETR4', name: 'Petrobras PN', pe: '5,1x', pvp: '1,2x', dy: '12,4%', roe: '23%', tag: 'Valor' },
  { ticker: 'BBAS3', name: 'Banco do Brasil ON', pe: '4,8x', pvp: '0,9x', dy: '9,8%', roe: '21%', tag: 'Dividendos' },
  { ticker: 'VALE3', name: 'Vale ON', pe: '6,7x', pvp: '1,4x', dy: '7,1%', roe: '18%', tag: 'Commodities' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco PN', pe: '8,9x', pvp: '1,7x', dy: '6,2%', roe: '20%', tag: 'Qualidade' },
  { ticker: 'WEGE3', name: 'WEG ON', pe: '32,0x', pvp: '8,4x', dy: '1,5%', roe: '27%', tag: 'Crescimento' },
];

const featureBlocks = [
  { title: 'Análise Técnica', text: 'RSI, MACD, tendência, médias, volatilidade e leitura de preço.', icon: 'TA' },
  { title: 'IA Financeira', text: 'Resumo de cenário, explicação de indicadores e perguntas para decisão.', icon: 'IA' },
  { title: 'Alertas', text: 'Preço-alvo, queda forte, alta incomum, notícia e relatório disponível.', icon: 'AL' },
  { title: 'Macro & Juros', text: 'SELIC, inflação, dólar, commodities e curva de juros.', icon: 'MA' },
  { title: 'Graham & Valor', text: 'Margem de segurança, múltiplos, dividendos e qualidade.', icon: 'GV' },
  { title: 'Backtesting', text: 'Teste hipóteses com histórico antes de seguir uma estratégia.', icon: 'BT' },
];

const learning = [
  'P/L baixo pode ser oportunidade, mas também pode indicar risco ou lucro cíclico.',
  'Dividend yield alto precisa ser comparado com payout, caixa e estabilidade do lucro.',
  'Juros altos aumentam a régua mínima para renda variável.',
  'Preço é uma cotação; valor é uma estimativa com premissas.',
];

function cleanSymbol(symbol: string) {
  return symbol.replace('.SA', '');
}

function symbolName(symbol: string) {
  const names: Record<string, string> = {
    'PETR4.SA': 'Petrobras PN',
    'VALE3.SA': 'Vale ON',
    'ITUB4.SA': 'Itaú Unibanco PN',
    'BBDC4.SA': 'Bradesco PN',
    'WEGE3.SA': 'WEG ON',
    'BBAS3.SA': 'Banco do Brasil ON',
    'ABEV3.SA': 'Ambev ON',
    'RENT3.SA': 'Localiza ON',
  };
  return names[symbol] || cleanSymbol(symbol);
}

function money(value: number) {
  const fixed = Number.isFinite(value) ? value.toFixed(2) : '0.00';
  return `R$ ${fixed.replace('.', ',')}`;
}

function pct(value: number) {
  if (!Number.isFinite(value)) return '0,00%';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2).replace('.', ',')}%`;
}

function clock(value?: string) {
  if (!value) return 'educativo';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'educativo';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function parseNumber(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function openWeb(path: string) {
  const safePath = path.startsWith('/') ? path : `/${path}`;
  void Linking.openURL(`${WEB_URL}${safePath}`);
}

function Card({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return <View style={[styles.card, accent && styles.cardAccent]}>{children}</View>;
}

function Badge({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' | 'red' | 'gray' }) {
  const style = tone === 'green' ? styles.badgeGreen : tone === 'amber' ? styles.badgeAmber : tone === 'red' ? styles.badgeRed : tone === 'gray' ? styles.badgeGray : styles.badgeBlue;
  return <Text style={[styles.badge, style]}>{children}</Text>;
}

function Mark({ label, tone = 'blue' }: { label: string; tone?: 'blue' | 'green' | 'amber' | 'red' }) {
  const style = tone === 'green' ? styles.markGreen : tone === 'amber' ? styles.markAmber : tone === 'red' ? styles.markRed : styles.markBlue;
  return <View style={[styles.mark, style]}><Text style={styles.markText}>{label}</Text></View>;
}

export default function App() {
  const [section, setSection] = useState<Section>('dashboard');
  const [mode, setMode] = useState<AppMode>('public');
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [watch, setWatch] = useState(['PETR4.SA', 'ITUB4.SA', 'VALE3.SA']);
  const [price, setPrice] = useState('28');
  const [fairValue, setFairValue] = useState('36');
  const [usdExpense, setUsdExpense] = useState('500');
  const [usdRate, setUsdRate] = useState('5.10');
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
  const updatedAt = clock(marketData[0]?.fetchedAt);

  const marketMood = useMemo(() => {
    const avg = marketData.reduce((sum, item) => sum + item.changePercent, 0) / marketData.length;
    if (avg > 0.6) return { title: 'Mercado construtivo', text: 'A amostra acompanhada está positiva. Confirme se o movimento vem de fundamentos, fluxo ou notícia.' };
    if (avg < -0.6) return { title: 'Mercado pressionado', text: 'A amostra está negativa. Foque em risco, liquidez, caixa e qualidade.' };
    return { title: 'Mercado misto', text: 'Sem direção única. Separe empresas, setores, valuation e cenário macro.' };
  }, [marketData]);

  const margin = useMemo(() => {
    const current = parseNumber(price);
    const target = parseNumber(fairValue);
    if (!current || !target) return null;
    return ((target - current) / target) * 100;
  }, [price, fairValue]);

  const dollarImpact = useMemo(() => {
    const amount = parseNumber(usdExpense);
    const rate = parseNumber(usdRate);
    if (!amount || !rate) return null;
    return amount * rate;
  }, [usdExpense, usdRate]);

  function toggleWatch(symbol: string) {
    setWatch((current) => (current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol]));
  }

  function sendQuestion() {
    if (mode === 'public') {
      Alert.alert('Acesso cliente', 'Para enviar dúvidas ao assessor, altere para Cliente ou faça login na plataforma.');
      return;
    }
    if (!question.trim()) return;
    Alert.alert('Dúvida enviada', 'O assessor recebeu uma próxima ação para responder sua dúvida.');
    setQuestion('');
  }

  function renderHeader() {
    return (
      <View style={styles.header}>
        <View style={styles.logoMark}><Text style={styles.logoMarkText}>F</Text></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.logoText}>F-Insight</Text>
          <Text style={styles.logoSub}>Dados · Radar · IA financeira</Text>
        </View>
        <Pressable onPress={() => openWeb('/login')} style={styles.loginButton}><Text style={styles.loginText}>Entrar</Text></Pressable>
      </View>
    );
  }

  function renderModeSwitcher() {
    return (
      <View style={styles.modeSwitcher}>
        {(['public', 'client', 'advisor'] as AppMode[]).map((item) => (
          <Pressable key={item} onPress={() => setMode(item)} style={[styles.modeButton, mode === item && styles.modeButtonActive]}>
            <Text style={[styles.modeText, mode === item && styles.modeTextActive]}>{item === 'public' ? 'Público' : item === 'client' ? 'Cliente' : 'Assessor'}</Text>
          </Pressable>
        ))}
      </View>
    );
  }

  function renderDashboard() {
    return (
      <View style={styles.stack}>
        <View style={styles.hero}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.kicker}>DADOS EM TEMPO REAL</Text>
              <Text style={styles.heroTitle}>Inteligência financeira ao seu alcance.</Text>
            </View>
            <Mark label="AI" />
          </View>
          <Text style={styles.heroText}>Análise técnica, fundamentos, macro, alertas de preço e IA financeira para investir melhor — gratuito e sem complicação.</Text>
          <View style={styles.rowWrap}>
            <Badge tone={isLive ? 'green' : 'amber'}>{isLive ? 'API ativa' : 'modo educativo'}</Badge>
            <Badge>atualizado {updatedAt}</Badge>
            <Badge tone="gray">sem recomendação</Badge>
          </View>
        </View>

        {renderModeSwitcher()}

        <View style={styles.indexGrid}>
          {indexes.map((item) => (
            <View key={item.label} style={styles.indexCard}>
              <Text style={styles.indexLabel}>{item.label}</Text>
              <Text style={styles.indexValue}>{item.value}</Text>
              <Text style={item.tone === 'up' ? styles.positive : styles.mutedStrong}>{item.change}</Text>
            </View>
          ))}
        </View>

        <Card accent>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{marketMood.title}</Text>
              <Text style={styles.cardText}>{marketMood.text}</Text>
            </View>
            <Mark label="MKT" tone="green" />
          </View>
        </Card>

        <View style={styles.grid2}>
          <Pressable style={styles.actionCard} onPress={() => setSection('radar')}>
            <Mark label="RA" />
            <Text style={styles.actionTitle}>Radar</Text>
            <Text style={styles.actionText}>Ativos, sinais e lista.</Text>
          </Pressable>
          <Pressable style={styles.actionCard} onPress={() => setSection('screener')}>
            <Mark label="GV" tone="amber" />
            <Text style={styles.actionTitle}>Valor</Text>
            <Text style={styles.actionText}>P/L, P/VP, DY e ROE.</Text>
          </Pressable>
        </View>

        <Card>
          <Text style={styles.cardTitle}>Últimas notícias</Text>
          {news.map((item) => (
            <View key={item.title} style={styles.newsRow}>
              <Badge tone="gray">{item.time}</Badge>
              <View style={{ flex: 1 }}>
                <Text style={styles.newsTitle}>{item.title}</Text>
                <Text style={styles.smallMuted}>{item.source}</Text>
              </View>
            </View>
          ))}
        </Card>
      </View>
    );
  }

  function renderRadar() {
    return (
      <View style={styles.stack}>
        <View>
          <Text style={styles.screenTitle}>Radar de Ativos</Text>
          <Text style={styles.screenSubtitle}>Preço, variação, direção e lista de acompanhamento.</Text>
        </View>
        {loading ? <ActivityIndicator color="#22d3ee" /> : null}
        {marketData.map((item) => {
          const positive = item.changePercent >= 0;
          const watched = watch.includes(item.symbol);
          return (
            <Pressable key={item.symbol} onPress={() => toggleWatch(item.symbol)}>
              <Card>
                <View style={styles.assetRow}>
                  <Mark label={cleanSymbol(item.symbol).slice(0, 2)} tone={positive ? 'green' : 'red'} />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.assetTicker}>{cleanSymbol(item.symbol)}</Text>
                    <Text style={styles.assetName}>{symbolName(item.symbol)}</Text>
                    <Text style={styles.smallMuted}>{watched ? 'Na sua lista' : 'Toque para acompanhar'}</Text>
                  </View>
                  <View style={styles.assetRight}>
                    <Text style={styles.assetPrice}>{money(item.lastPrice)}</Text>
                    <Text style={positive ? styles.positive : styles.negative}>{pct(item.changePercent)}</Text>
                    <Text style={styles.star}>{watched ? '★' : '☆'}</Text>
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        })}
      </View>
    );
  }

  function renderScreener() {
    return (
      <View style={styles.stack}>
        <View>
          <Text style={styles.screenTitle}>Screener</Text>
          <Text style={styles.screenSubtitle}>Filtros fundamentalistas para estudar empresas brasileiras.</Text>
        </View>
        <View style={styles.rowWrap}>
          <Badge>P/L</Badge><Badge>P/VP</Badge><Badge>Dividend Yield</Badge><Badge>ROE</Badge><Badge tone="amber">Graham & Valor</Badge>
        </View>
        {screener.map((row) => (
          <Card key={row.ticker}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1 }}>
                <Text style={styles.assetTicker}>{row.ticker}</Text>
                <Text style={styles.assetName}>{row.name}</Text>
              </View>
              <Badge tone="amber">{row.tag}</Badge>
            </View>
            <View style={styles.metricGrid}>
              <View><Text style={styles.metricLabel}>P/L</Text><Text style={styles.metricValue}>{row.pe}</Text></View>
              <View><Text style={styles.metricLabel}>P/VP</Text><Text style={styles.metricValue}>{row.pvp}</Text></View>
              <View><Text style={styles.metricLabel}>DY</Text><Text style={styles.metricValueGreen}>{row.dy}</Text></View>
              <View><Text style={styles.metricLabel}>ROE</Text><Text style={styles.metricValue}>{row.roe}</Text></View>
            </View>
          </Card>
        ))}
      </View>
    );
  }

  function renderMercado() {
    return (
      <View style={styles.stack}>
        <View>
          <Text style={styles.screenTitle}>Mercado</Text>
          <Text style={styles.screenSubtitle}>Macro, trading, RWA, CriptoZen e alertas.</Text>
        </View>
        <Card accent>
          <Text style={styles.cardTitle}>Macro & Juros</Text>
          <Text style={styles.cardText}>SELIC, inflação, dólar, commodities e curva de juros mudam a régua de valuation e risco.</Text>
          <View style={styles.rowWrap}><Badge>SELIC</Badge><Badge>Dólar</Badge><Badge>IPCA</Badge><Badge>Commodities</Badge></View>
        </Card>
        <View style={styles.grid2Wrap}>
          {featureBlocks.map((item) => (
            <View key={item.title} style={styles.featureCard}>
              <Mark label={item.icon} />
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureText}>{item.text}</Text>
            </View>
          ))}
        </View>
        <Card>
          <Text style={styles.cardTitle}>CriptoZen</Text>
          <Text style={styles.cardText}>Bitcoin, stablecoins e ativos digitais com leitura simples: preço, risco, narrativa, liquidez e cenário macro.</Text>
        </Card>
        <Card>
          <Text style={styles.cardTitle}>RWA</Text>
          <Text style={styles.cardText}>Acompanhe a tese de ativos reais tokenizados: crédito, recebíveis, imóveis, carbono, infraestrutura e liquidez.</Text>
        </Card>
      </View>
    );
  }

  function renderMais() {
    return (
      <View style={styles.stack}>
        <View>
          <Text style={styles.screenTitle}>Mais</Text>
          <Text style={styles.screenSubtitle}>Ferramentas, aprendizado, acesso premium e área do assessor.</Text>
        </View>

        <Card>
          <Text style={styles.cardTitle}>Ferramentas</Text>
          <Text style={styles.cardText}>Margem de segurança</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputBox}><Text style={styles.inputLabel}>Preço</Text><TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={styles.input} /></View>
            <View style={styles.inputBox}><Text style={styles.inputLabel}>Valor justo</Text><TextInput value={fairValue} onChangeText={setFairValue} keyboardType="decimal-pad" style={styles.input} /></View>
          </View>
          <Text style={[styles.bigMetric, (margin || 0) >= 0 ? styles.positive : styles.negative]}>{margin === null ? '—' : pct(margin)}</Text>
          <Text style={styles.cardText}>Impacto do dólar</Text>
          <View style={styles.inputRow}>
            <View style={styles.inputBox}><Text style={styles.inputLabel}>US$</Text><TextInput value={usdExpense} onChangeText={setUsdExpense} keyboardType="decimal-pad" style={styles.input} /></View>
            <View style={styles.inputBox}><Text style={styles.inputLabel}>Dólar</Text><TextInput value={usdRate} onChangeText={setUsdRate} keyboardType="decimal-pad" style={styles.input} /></View>
          </View>
          <Text style={styles.bigMetric}>{dollarImpact === null ? '—' : money(dollarImpact)}</Text>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Aprender</Text>
          {learning.map((item, index) => (
            <View key={item} style={styles.learnRow}>
              <Mark label={String(index + 1)} tone="amber" />
              <Text style={styles.learnText}>{item}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Mensagem ao assessor</Text>
          <Text style={styles.cardText}>Disponível para cliente assessorado. Na visão pública, use login ou demonstração.</Text>
          <TextInput value={question} onChangeText={setQuestion} multiline placeholder="Digite sua dúvida..." placeholderTextColor="#64748b" style={[styles.input, styles.textArea]} />
          <Pressable onPress={sendQuestion} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Enviar dúvida</Text></Pressable>
        </Card>

        {mode === 'advisor' ? (
          <Card accent>
            <Text style={styles.cardTitle}>Área profissional</Text>
            <Text style={styles.cardText}>Abra clientes, relatórios, comunicação, automações e relacionamento no painel web.</Text>
            <Pressable onPress={() => openWeb('/assessor')} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Abrir workspace</Text></Pressable>
          </Card>
        ) : null}

        <Card>
          <Text style={styles.cardTitle}>Premium</Text>
          <Text style={styles.cardText}>Alertas, rankings completos, relatórios, IA financeira, white-label para escritórios e CriptoZen.</Text>
          <Pressable onPress={() => openWeb('/precos')} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Conhecer Premium</Text></Pressable>
        </Card>
      </View>
    );
  }

  const content = section === 'dashboard' ? renderDashboard() : section === 'radar' ? renderRadar() : section === 'screener' ? renderScreener() : section === 'mercado' ? renderMercado() : renderMais();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      {renderHeader()}
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>{content}</ScrollView>
      <View style={styles.bottomNav}>
        {([
          ['dashboard', 'Dash'], ['radar', 'Radar'], ['screener', 'Ativos'], ['mercado', 'Mercado'], ['mais', 'Mais'],
        ] as Array<[Section, string]>).map(([key, label]) => (
          <Pressable key={key} onPress={() => setSection(key)} style={[styles.navItem, section === key && styles.navItemActive]}>
            <Text style={[styles.navDot, section === key && styles.navDotActive]}>●</Text>
            <Text style={[styles.navLabel, section === key && styles.navLabelActive]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  header: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#0f172a', backgroundColor: '#020617' },
  logoMark: { width: 42, height: 42, borderRadius: 16, backgroundColor: '#0891b2', alignItems: 'center', justifyContent: 'center' },
  logoMarkText: { color: '#fff', fontWeight: '900', fontSize: 22 },
  logoText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  logoSub: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2 },
  loginButton: { borderColor: '#064e3b', borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#052e2b' },
  loginText: { color: '#34d399', fontWeight: '900', fontSize: 12 },
  scroll: { padding: 16, paddingBottom: 110 },
  stack: { gap: 14 },
  hero: { borderRadius: 28, padding: 20, borderWidth: 1, borderColor: '#155e75', backgroundColor: '#082f49' },
  kicker: { color: '#22d3ee', fontWeight: '900', fontSize: 11, letterSpacing: 2, marginBottom: 8 },
  heroTitle: { color: '#fff', fontSize: 31, lineHeight: 36, fontWeight: '900' },
  heroText: { color: '#cbd5e1', fontSize: 15, lineHeight: 22, marginTop: 14, marginBottom: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  modeSwitcher: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 18, padding: 4, borderWidth: 1, borderColor: '#1e293b' },
  modeButton: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14 },
  modeButtonActive: { backgroundColor: '#22d3ee' },
  modeText: { color: '#94a3b8', fontWeight: '900', fontSize: 12 },
  modeTextActive: { color: '#020617' },
  card: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 24, padding: 16 },
  cardAccent: { borderColor: '#155e75', backgroundColor: '#0b2236' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  cardText: { color: '#94a3b8', fontSize: 14, lineHeight: 20, marginTop: 4 },
  badge: { borderRadius: 999, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 0.6 },
  badgeBlue: { backgroundColor: '#0e749022', color: '#67e8f9' },
  badgeGreen: { backgroundColor: '#16a34a22', color: '#86efac' },
  badgeAmber: { backgroundColor: '#f59e0b22', color: '#fcd34d' },
  badgeRed: { backgroundColor: '#dc262622', color: '#fca5a5' },
  badgeGray: { backgroundColor: '#33415566', color: '#cbd5e1' },
  mark: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  markBlue: { backgroundColor: '#155e75' },
  markGreen: { backgroundColor: '#064e3b' },
  markAmber: { backgroundColor: '#78350f' },
  markRed: { backgroundColor: '#7f1d1d' },
  markText: { color: '#fff', fontWeight: '900', fontSize: 13 },
  indexGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  indexCard: { width: '48%', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 20, padding: 14 },
  indexLabel: { color: '#64748b', fontWeight: '900', fontSize: 11, letterSpacing: 1 },
  indexValue: { color: '#fff', fontWeight: '900', fontSize: 20, marginTop: 8 },
  positive: { color: '#34d399', fontWeight: '900' },
  negative: { color: '#f87171', fontWeight: '900' },
  mutedStrong: { color: '#94a3b8', fontWeight: '900' },
  grid2: { flexDirection: 'row', gap: 12 },
  grid2Wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  actionCard: { flex: 1, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 22, padding: 14 },
  actionTitle: { color: '#fff', fontWeight: '900', fontSize: 16, marginTop: 12 },
  actionText: { color: '#94a3b8', fontSize: 12, marginTop: 4, lineHeight: 17 },
  newsRow: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 12, marginTop: 12 },
  newsTitle: { color: '#fff', fontWeight: '800', fontSize: 13, lineHeight: 18 },
  smallMuted: { color: '#64748b', fontSize: 11, marginTop: 3 },
  screenTitle: { color: '#fff', fontSize: 29, fontWeight: '900' },
  screenSubtitle: { color: '#94a3b8', fontSize: 15, marginTop: 5, lineHeight: 22 },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  assetTicker: { color: '#fff', fontSize: 16, fontWeight: '900' },
  assetName: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  assetRight: { alignItems: 'flex-end' },
  assetPrice: { color: '#fff', fontSize: 14, fontWeight: '900' },
  star: { color: '#facc15', fontSize: 18, marginTop: 2 },
  metricGrid: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 14, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#1e293b' },
  metricLabel: { color: '#64748b', fontSize: 11, fontWeight: '900' },
  metricValue: { color: '#fff', fontWeight: '900', marginTop: 4 },
  metricValueGreen: { color: '#34d399', fontWeight: '900', marginTop: 4 },
  featureCard: { width: '48%', backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 22, padding: 14 },
  featureTitle: { color: '#fff', fontWeight: '900', fontSize: 15, marginTop: 10 },
  featureText: { color: '#94a3b8', fontSize: 12, lineHeight: 17, marginTop: 5 },
  inputRow: { flexDirection: 'row', gap: 10, marginTop: 10, marginBottom: 10 },
  inputBox: { flex: 1 },
  inputLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '800', marginBottom: 6 },
  input: { backgroundColor: '#020617', borderWidth: 1, borderColor: '#1e293b', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11, color: '#fff', fontSize: 15 },
  textArea: { minHeight: 100, textAlignVertical: 'top', marginTop: 12 },
  bigMetric: { color: '#fff', fontSize: 32, fontWeight: '900', marginTop: 6, marginBottom: 10 },
  learnRow: { flexDirection: 'row', gap: 10, borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 12, marginTop: 12 },
  learnText: { color: '#cbd5e1', flex: 1, fontSize: 14, lineHeight: 20 },
  primaryButton: { marginTop: 12, borderRadius: 16, backgroundColor: '#22d3ee', paddingVertical: 13, alignItems: 'center' },
  primaryButtonText: { color: '#020617', fontWeight: '900' },
  secondaryButton: { marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: '#334155', paddingVertical: 13, alignItems: 'center' },
  secondaryButtonText: { color: '#fff', fontWeight: '900' },
  bottomNav: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 24, padding: 8, flexDirection: 'row', justifyContent: 'space-between' },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 16 },
  navItemActive: { backgroundColor: '#082f49' },
  navDot: { color: '#334155', fontSize: 8 },
  navDotActive: { color: '#22d3ee' },
  navLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '900', marginTop: 3 },
  navLabelActive: { color: '#22d3ee' },
});
