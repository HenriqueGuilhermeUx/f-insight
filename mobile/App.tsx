import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://f-insight-api.onrender.com';
const WEB_URL = process.env.EXPO_PUBLIC_WEB_URL || 'https://f-insight.netlify.app';

type Tab = 'hoje' | 'radar' | 'ativos' | 'mercado' | 'mais';
type Tone = 'up' | 'down' | 'neutral' | 'attention';

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
  { symbol: 'BBAS3.SA', lastPrice: 29.8, changePercent: 0.22 },
  { symbol: 'WEGE3.SA', lastPrice: 42.75, changePercent: 1.12 },
  { symbol: 'BBDC4.SA', lastPrice: 14.62, changePercent: -0.18 },
  { symbol: 'ABEV3.SA', lastPrice: 12.34, changePercent: -0.41 },
  { symbol: 'RENT3.SA', lastPrice: 52.1, changePercent: 1.03 },
];

const marketTiles = [
  { label: 'IBOV', value: '178.002', change: 'acompanhar', tone: 'neutral' as Tone },
  { label: 'S&P 500', value: '7.600', change: '+1,48%', tone: 'up' as Tone },
  { label: 'Dólar', value: 'R$ 5,10', change: '+0,15%', tone: 'up' as Tone },
  { label: 'Bitcoin', value: 'US$ 63.898', change: '+1,90%', tone: 'up' as Tone },
];

const macroTiles = [
  { label: 'Selic', value: '15,00%', note: 'Régua alta para comparar risco x retorno.', tone: 'attention' as Tone },
  { label: 'CDI', value: 'próx. Selic', note: 'Referência diária da renda fixa pós-fixada.', tone: 'neutral' as Tone },
  { label: 'IPCA', value: 'monitorar', note: 'Inflação influencia juros, consumo e valuation.', tone: 'attention' as Tone },
  { label: 'IFIX', value: 'radar', note: 'FIIs reagem a juros, P/VP e dividend yield.', tone: 'neutral' as Tone },
];

const news = [
  { title: 'Mercado acompanha juros, dólar, commodities e temporada de resultados.', source: 'F-Insight Radar', time: 'agora' },
  { title: 'Bancos, petróleo, mineração e energia seguem entre os setores de maior atenção.', source: 'F-Insight Research', time: 'hoje' },
  { title: 'Juros altos exigem disciplina em valuation, qualidade e margem de segurança.', source: 'F-Insight Macro', time: 'hoje' },
];

const screenerRows = [
  { ticker: 'PETR4', name: 'Petrobras PN', pe: '5,1x', pvp: '1,2x', dy: '12,4%', roe: '23%', tag: 'Valor' },
  { ticker: 'BBAS3', name: 'Banco do Brasil ON', pe: '4,8x', pvp: '0,9x', dy: '9,8%', roe: '21%', tag: 'Dividendos' },
  { ticker: 'VALE3', name: 'Vale ON', pe: '6,7x', pvp: '1,4x', dy: '7,1%', roe: '18%', tag: 'Commodities' },
  { ticker: 'ITUB4', name: 'Itaú Unibanco PN', pe: '8,9x', pvp: '1,7x', dy: '6,2%', roe: '20%', tag: 'Qualidade' },
];

const learning = [
  'Preço é cotação. Valor depende de premissas, risco e horizonte.',
  'P/L baixo pode ser oportunidade ou armadilha. Olhe lucro, dívida e ciclo.',
  'Dividend yield alto precisa de caixa, lucro e payout sustentável.',
  'Juros altos elevam a régua para renda variável e reduzem tolerância a erro.',
];

const premiumFeatures = [
  'IA Financeira completa',
  'Screener avançado',
  'Graham & Valor completo',
  'Carteira simulada',
  'Alertas inteligentes',
  'Backtesting',
  'Relatórios semanais',
  'Watchlists ilimitadas',
];

function openWeb(path: string) {
  const safePath = path.startsWith('/') ? path : `/${path}`;
  void Linking.openURL(`${WEB_URL}${safePath}`);
}

function openLoggedArea() {
  Alert.alert('Área Logada', 'Escolha qual área deseja acessar:', [
    { text: 'Cliente', onPress: () => openWeb('/cliente') },
    { text: 'Assessor', onPress: () => openWeb('/assessor') },
    { text: 'Escritório/Admin', onPress: () => openWeb('/admin') },
    { text: 'Cancelar', style: 'cancel' },
  ]);
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
  if (!value) return 'modo educativo';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'modo educativo';
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

function toneText(tone: Tone) {
  if (tone === 'up') return styles.greenText;
  if (tone === 'down') return styles.redText;
  if (tone === 'attention') return styles.amberText;
  return styles.mutedText;
}

function Card({ children, compact = false }: { children: React.ReactNode; compact?: boolean }) {
  return <View style={[styles.card, compact && styles.compactCard]}>{children}</View>;
}

function Pill({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' | 'dark' }) {
  const pillStyle = tone === 'green' ? styles.pillGreen : tone === 'amber' ? styles.pillAmber : tone === 'dark' ? styles.pillDark : styles.pillBlue;
  return <Text style={[styles.pill, pillStyle]}>{children}</Text>;
}

function Button({ label, onPress, primary = false, amber = false }: { label: string; onPress: () => void; primary?: boolean; amber?: boolean }) {
  return (
    <Pressable onPress={onPress} style={[styles.button, primary && styles.buttonPrimary, amber && styles.buttonAmber]}>
      <Text style={[styles.buttonText, (primary || amber) && styles.buttonTextDark]}>{label}</Text>
    </Pressable>
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>('hoje');
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [watch, setWatch] = useState(['PETR4.SA', 'ITUB4.SA', 'BBAS3.SA']);

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
  const movers = [...marketData].sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
  const avgChange = marketData.reduce((sum, item) => sum + item.changePercent, 0) / marketData.length;

  const marketMood = useMemo(() => {
    if (avgChange > 0.6) return { title: 'Mercado construtivo', text: 'A amostra acompanhada está positiva. Confirme fundamento, fluxo e notícia.' };
    if (avgChange < -0.6) return { title: 'Mercado pressionado', text: 'A amostra está negativa. Foque em risco, liquidez e qualidade.' };
    return { title: 'Mercado misto', text: 'Sem direção única. Separe empresas, setores, valuation e macro.' };
  }, [avgChange]);

  function toggleWatch(symbol: string) {
    setWatch((current) => (current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol]));
  }

  function renderHeader() {
    return (
      <View style={styles.header}>
        <View>
          <Text style={styles.brand}>F-Insight</Text>
          <Text style={styles.subtitle}>Inteligência financeira</Text>
        </View>
        <Pressable onPress={openLoggedArea} style={styles.loggedButton}>
          <Text style={styles.loggedButtonText}>Área Logada</Text>
        </Pressable>
      </View>
    );
  }

  function renderHoje() {
    return (
      <View style={styles.stack}>
        <Card>
          <View style={styles.heroBadges}>
            <Pill tone={isLive ? 'green' : 'amber'}>{isLive ? 'API ativa' : 'fallback educativo'}</Pill>
            <Pill tone="dark">Atualizado {clock(marketData[0]?.fetchedAt)}</Pill>
          </View>
          <Text style={styles.heroTitle}>Mercado, macro, notícias e ferramentas para estudar melhor.</Text>
          <Text style={styles.heroText}>Comece grátis. Aprofunde com Premium. Área logada de assessores e escritórios fica separada.</Text>
          <View style={styles.buttonRow}>
            <Button label="Criar conta grátis" primary onPress={() => openWeb('/login')} />
            <Button label="Premium R$19,90" amber onPress={() => openWeb('/premium')} />
          </View>
        </Card>

        <View style={styles.tileGrid}>
          {marketTiles.map((item) => (
            <View key={item.label} style={styles.tile}>
              <Text style={styles.tileLabel}>{item.label}</Text>
              <Text style={styles.tileValue}>{item.value}</Text>
              <Text style={toneText(item.tone)}>{item.change}</Text>
            </View>
          ))}
        </View>

        <View style={styles.tileGrid}>
          {macroTiles.map((item) => (
            <View key={item.label} style={styles.tile}>
              <Text style={styles.tileLabel}>{item.label}</Text>
              <Text style={styles.tileValue}>{item.value}</Text>
              <Text style={toneText(item.tone)}>{item.note}</Text>
            </View>
          ))}
        </View>

        <Card>
          <Text style={styles.cardTitle}>{marketMood.title}</Text>
          <Text style={styles.cardText}>{marketMood.text}</Text>
        </Card>

        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Últimas notícias</Text>
            <Pressable onPress={() => openWeb('/noticias')}><Text style={styles.linkText}>ver</Text></Pressable>
          </View>
          {news.map((item) => (
            <View key={item.title} style={styles.newsRow}>
              <Text style={styles.newsTitle}>{item.title}</Text>
              <Text style={styles.newsMeta}>{item.source} · {item.time}</Text>
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
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Radar Brasil</Text>
            <Pressable onPress={() => openWeb('/radar')}><Text style={styles.linkText}>abrir web</Text></Pressable>
          </View>
          {loading && <ActivityIndicator color="#22d3ee" />}
          {marketData.map((asset) => {
            const up = asset.changePercent >= 0;
            const selected = watch.includes(asset.symbol);
            return (
              <Pressable key={asset.symbol} onPress={() => toggleWatch(asset.symbol)} style={styles.assetRow}>
                <View style={styles.assetMain}>
                  <Text style={styles.assetTicker}>{cleanSymbol(asset.symbol)}</Text>
                  <Text style={styles.assetName}>{symbolName(asset.symbol)}</Text>
                </View>
                <View style={styles.assetRight}>
                  <Text style={styles.assetPrice}>{money(asset.lastPrice)}</Text>
                  <Text style={up ? styles.greenText : styles.redText}>{pct(asset.changePercent)}</Text>
                </View>
                <Text style={selected ? styles.starOn : styles.starOff}>{selected ? '★' : '☆'}</Text>
              </Pressable>
            );
          })}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Minha lista</Text>
          {watchedAssets.length === 0 ? <Text style={styles.cardText}>Toque na estrela de um ativo para acompanhar.</Text> : watchedAssets.map((asset) => (
            <Text key={asset.symbol} style={styles.watchItem}>{cleanSymbol(asset.symbol)} · {money(asset.lastPrice)} · {pct(asset.changePercent)}</Text>
          ))}
        </Card>
      </View>
    );
  }

  function renderAtivos() {
    return (
      <View style={styles.stack}>
        <Card>
          <Text style={styles.sectionTitle}>Análises e fundamentos</Text>
          <View style={styles.buttonGrid}>
            <Button label="Graham & Valor" onPress={() => openWeb('/graham-valor')} />
            <Button label="Screener" onPress={() => openWeb('/screener-acoes')} />
            <Button label="Backtesting" onPress={() => openWeb('/backtesting')} />
            <Button label="IA Financeira" onPress={() => openWeb('/premium')} />
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Amostra do screener</Text>
          {screenerRows.map((row) => (
            <View key={row.ticker} style={styles.screenerRow}>
              <View style={styles.assetMain}>
                <Text style={styles.assetTicker}>{row.ticker}</Text>
                <Text style={styles.assetName}>{row.name}</Text>
              </View>
              <View style={styles.metricsWrap}>
                <Text style={styles.metric}>P/L {row.pe}</Text>
                <Text style={styles.metric}>P/VP {row.pvp}</Text>
                <Text style={styles.metricGreen}>DY {row.dy}</Text>
              </View>
            </View>
          ))}
        </Card>
      </View>
    );
  }

  function renderMercado() {
    return (
      <View style={styles.stack}>
        <Card>
          <Text style={styles.sectionTitle}>Painel macro</Text>
          {macroTiles.map((item) => (
            <View key={item.label} style={styles.macroRow}>
              <View>
                <Text style={styles.assetTicker}>{item.label}</Text>
                <Text style={styles.assetName}>{item.note}</Text>
              </View>
              <Text style={styles.assetPrice}>{item.value}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Maiores movimentos</Text>
          {movers.slice(0, 5).map((asset) => (
            <Text key={asset.symbol} style={styles.watchItem}>{cleanSymbol(asset.symbol)} · {pct(asset.changePercent)} · {symbolName(asset.symbol)}</Text>
          ))}
        </Card>
      </View>
    );
  }

  function renderMais() {
    return (
      <View style={styles.stack}>
        <Card>
          <Text style={styles.sectionTitle}>Premium R$ 19,90/mês</Text>
          <Text style={styles.cardText}>Para investidores independentes que querem IA completa, ferramentas profundas e carteira simulada.</Text>
          <View style={styles.featureList}>
            {premiumFeatures.map((item) => <Text key={item} style={styles.featureItem}>✓ {item}</Text>)}
          </View>
          <Button label="Conhecer Premium" amber onPress={() => openWeb('/premium')} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Área Logada</Text>
          <Text style={styles.cardText}>Cliente assessorado, assessor, escritório e admin entram por uma área separada.</Text>
          <Button label="Abrir Área Logada" primary onPress={openLoggedArea} />
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Aprender</Text>
          {learning.map((item) => <Text key={item} style={styles.featureItem}>• {item}</Text>)}
        </Card>

        <Card>
          <Text style={styles.disclaimer}>Informações educativas. Não constituem recomendação de investimento, consultoria individualizada ou garantia de rentabilidade.</Text>
        </Card>
      </View>
    );
  }

  const content = tab === 'hoje' ? renderHoje() : tab === 'radar' ? renderRadar() : tab === 'ativos' ? renderAtivos() : tab === 'mercado' ? renderMercado() : renderMais();

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" translucent={false} />
      {renderHeader()}
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {content}
      </ScrollView>
      <View style={styles.tabBar}>
        {([
          ['hoje', 'Hoje'],
          ['radar', 'Radar'],
          ['ativos', 'Ativos'],
          ['mercado', 'Mercado'],
          ['mais', 'Mais'],
        ] as [Tab, string][]).map(([key, label]) => (
          <Pressable key={key} onPress={() => setTab(key)} style={styles.tabItem}>
            <Text style={tab === key ? styles.tabTextActive : styles.tabText}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const safeTop = Platform.OS === 'android' ? StatusBar.currentHeight || 0 : 0;
const safeBottom = Platform.OS === 'android' ? 18 : 28;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    paddingTop: safeTop,
    backgroundColor: '#020617',
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1e293b',
    backgroundColor: '#020617',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: '#f8fafc',
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  loggedButton: {
    borderWidth: 1,
    borderColor: '#10b98155',
    backgroundColor: '#10b98118',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  loggedButtonText: {
    color: '#6ee7b7',
    fontSize: 12,
    fontWeight: '900',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 108 + safeBottom,
  },
  stack: {
    gap: 14,
  },
  card: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0f172a',
    padding: 16,
  },
  compactCard: {
    padding: 12,
  },
  heroBadges: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  pill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontSize: 10,
    fontWeight: '900',
    textTransform: 'uppercase',
    overflow: 'hidden',
  },
  pillBlue: { color: '#67e8f9', backgroundColor: '#06b6d420' },
  pillGreen: { color: '#6ee7b7', backgroundColor: '#10b98122' },
  pillAmber: { color: '#fcd34d', backgroundColor: '#f59e0b22' },
  pillDark: { color: '#94a3b8', backgroundColor: '#020617' },
  heroTitle: {
    color: '#f8fafc',
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '900',
  },
  heroText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 21,
    marginTop: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  button: {
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#334155',
    backgroundColor: '#020617',
    paddingHorizontal: 14,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#22d3ee',
    borderColor: '#22d3ee',
  },
  buttonAmber: {
    backgroundColor: '#fbbf24',
    borderColor: '#fbbf24',
  },
  buttonText: {
    color: '#f8fafc',
    fontSize: 13,
    fontWeight: '900',
  },
  buttonTextDark: {
    color: '#020617',
  },
  tileGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  tile: {
    width: '48%',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
    backgroundColor: '#0f172a',
    padding: 14,
    minHeight: 116,
  },
  tileLabel: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '900',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  tileValue: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
  },
  greenText: { color: '#34d399', fontSize: 12, fontWeight: '900' },
  redText: { color: '#fb7185', fontSize: 12, fontWeight: '900' },
  amberText: { color: '#fbbf24', fontSize: 12, fontWeight: '800', lineHeight: 17 },
  mutedText: { color: '#94a3b8', fontSize: 12, fontWeight: '800', lineHeight: 17 },
  cardTitle: {
    color: '#f8fafc',
    fontSize: 18,
    fontWeight: '900',
    marginBottom: 8,
  },
  cardText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 21,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#f8fafc',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 12,
  },
  linkText: {
    color: '#67e8f9',
    fontSize: 12,
    fontWeight: '900',
  },
  newsRow: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingTop: 12,
    paddingBottom: 12,
  },
  newsTitle: {
    color: '#e2e8f0',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '800',
  },
  newsMeta: {
    color: '#64748b',
    fontSize: 11,
    marginTop: 5,
    fontWeight: '700',
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 13,
  },
  assetMain: {
    flex: 1,
  },
  assetRight: {
    alignItems: 'flex-end',
  },
  assetTicker: {
    color: '#67e8f9',
    fontSize: 16,
    fontWeight: '900',
  },
  assetName: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 2,
  },
  assetPrice: {
    color: '#f8fafc',
    fontSize: 14,
    fontWeight: '900',
  },
  starOn: {
    color: '#fbbf24',
    fontSize: 22,
    width: 24,
    textAlign: 'center',
  },
  starOff: {
    color: '#475569',
    fontSize: 22,
    width: 24,
    textAlign: 'center',
  },
  watchItem: {
    color: '#cbd5e1',
    fontSize: 13,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
  },
  buttonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  screenerRow: {
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 12,
  },
  metricsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 7,
    marginTop: 8,
  },
  metric: {
    color: '#cbd5e1',
    backgroundColor: '#020617',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
    fontSize: 11,
    fontWeight: '900',
  },
  metricGreen: {
    color: '#6ee7b7',
    backgroundColor: '#10b98118',
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
    overflow: 'hidden',
    fontSize: 11,
    fontWeight: '900',
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    paddingVertical: 12,
  },
  featureList: {
    marginTop: 12,
    marginBottom: 12,
    gap: 7,
  },
  featureItem: {
    color: '#cbd5e1',
    fontSize: 13,
    lineHeight: 19,
  },
  disclaimer: {
    color: '#64748b',
    fontSize: 11,
    lineHeight: 17,
  },
  tabBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingTop: 10,
    paddingBottom: safeBottom,
    paddingHorizontal: 8,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    backgroundColor: '#020617',
    flexDirection: 'row',
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 14,
  },
  tabText: {
    color: '#64748b',
    fontSize: 11,
    fontWeight: '900',
  },
  tabTextActive: {
    color: '#22d3ee',
    fontSize: 11,
    fontWeight: '900',
  },
});
