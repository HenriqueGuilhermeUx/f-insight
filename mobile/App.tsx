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
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import Constants from 'expo-constants';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const extra = (Constants.expoConfig?.extra || {}) as { apiUrl?: string; webUrl?: string };
const API_URL = extra.apiUrl || 'https://f-insight-api.onrender.com';
const WEB_URL = extra.webUrl || 'https://f-insight.netlify.app';

type AppMode = 'public' | 'client' | 'advisor';
type Section = 'today' | 'market' | 'watch' | 'tools' | 'profile';

type LiveIndicator = {
  symbol: string;
  lastPrice: number;
  changePercent: number;
  fetchedAt?: string;
};

type AppMessage = {
  id: string;
  subject: string;
  body: string;
  topic: string;
  createdAt: string;
  senderName: string;
};

const fallbackIndicators: LiveIndicator[] = [
  { symbol: 'PETR4.SA', lastPrice: 38.42, changePercent: 0.72 },
  { symbol: 'VALE3.SA', lastPrice: 61.18, changePercent: -0.35 },
  { symbol: 'ITUB4.SA', lastPrice: 34.9, changePercent: 0.41 },
  { symbol: 'BBDC4.SA', lastPrice: 14.62, changePercent: -0.18 },
  { symbol: 'WEGE3.SA', lastPrice: 42.75, changePercent: 1.12 },
];

const mockMessages: AppMessage[] = [
  {
    id: 'm1',
    subject: 'Cenário da semana',
    body: 'Juros, dólar e commodities seguem como pontos principais para nossa próxima conversa. Leia o resumo antes de tomar decisões.',
    topic: 'Macro',
    senderName: 'Assessor Demo',
    createdAt: new Date().toISOString(),
  },
];

const reports = [
  { ticker: 'PETR4', title: 'Como ler valuation', summary: 'Valor, margem de segurança e riscos' },
  { ticker: 'VALE3', title: 'Dólar e commodities', summary: 'Sensibilidade cambial e cenário global' },
  { ticker: 'ITUB4', title: 'Bancos e juros', summary: 'ROE, crédito, margem e dividendos' },
];

const learning = [
  { title: 'Juros e renda fixa', progress: 68, next: 'Custo de oportunidade' },
  { title: 'Valuation sem complicação', progress: 42, next: 'Margem de segurança' },
  { title: 'Dólar e proteção', progress: 31, next: 'Exposição cambial' },
];

const checklist = [
  'Entendi o cenário macro?',
  'Sei qual risco principal estou assumindo?',
  'Comparei preço, valor e prazo?',
  'Falei com um profissional antes de agir?',
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
  };
  return names[symbol] || cleanSymbol(symbol);
}

function money(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function pct(value: number) {
  return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
}

function updatedAt(value?: string) {
  if (!value) return 'modo educativo';
  return new Date(value).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

function parseNumber(value: string) {
  return Number(value.replace(',', '.'));
}

function openWeb(path: string) {
  void Linking.openURL(`${WEB_URL}${path}`);
}

function Card({ children, style }: { children: React.ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

function Pill({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' | 'red' }) {
  return <Text style={[styles.pill, styles[`pill_${tone}`]]}>{children}</Text>;
}

function IconBox({ name, color = '#22d3ee' }: { name: keyof typeof Ionicons.glyphMap; color?: string }) {
  return (
    <View style={[styles.iconBox, { backgroundColor: `${color}22` }]}>
      <Ionicons name={name} size={22} color={color} />
    </View>
  );
}

export default function App() {
  const [section, setSection] = useState<Section>('today');
  const [mode, setMode] = useState<AppMode>('public');
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [watch, setWatch] = useState(['PETR4.SA', 'ITUB4.SA']);
  const [price, setPrice] = useState('28');
  const [fairValue, setFairValue] = useState('36');
  const [usdExpense, setUsdExpense] = useState('500');
  const [usdRate, setUsdRate] = useState('5.12');
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
  const messages = mode === 'client' || mode === 'advisor' ? mockMessages : [];
  const latestMessage = messages[0];

  const marketMood = useMemo(() => {
    const avg = marketData.reduce((sum, item) => sum + item.changePercent, 0) / marketData.length;
    if (avg > 0.6) return { title: 'Mercado construtivo', text: 'A amostra acompanhada está positiva. Verifique se o movimento vem de fundamentos, fluxo ou notícia.' };
    if (avg < -0.6) return { title: 'Mercado pressionado', text: 'A amostra acompanhada está negativa. Foque em risco, liquidez e qualidade.' };
    return { title: 'Mercado misto', text: 'Sem direção única. Separe empresas, setores e cenário macro antes de agir.' };
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
      Alert.alert('Entre ou veja a demo', 'Para enviar dúvidas ao assessor, use a visão Cliente ou faça login na plataforma.');
      return;
    }
    if (!question.trim()) return;
    Alert.alert('Dúvida enviada', 'O assessor recebeu uma próxima ação para responder sua dúvida.');
    setQuestion('');
  }

  function renderToday() {
    return (
      <View style={styles.stack}>
        <LinearGradient colors={['#083344', '#0f172a', '#020617']} style={styles.hero}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.kicker}>F-INSIGHT APP</Text>
              <Text style={styles.heroTitle}>Seu cockpit financeiro diário.</Text>
            </View>
            <IconBox name="flash" />
          </View>
          <Text style={styles.heroText}>Acompanhe mercado, organize ativos, use ferramentas educativas e converse melhor com seu assessor.</Text>
          <View style={styles.rowWrap}>
            <Pill tone={isLive ? 'green' : 'amber'}>{isLive ? 'dados ao vivo' : 'modo educativo'}</Pill>
            <Pill>atualizado {updatedAt(marketData[0]?.fetchedAt)}</Pill>
          </View>
        </LinearGradient>

        <View style={styles.modeSwitcher}>
          {(['public', 'client', 'advisor'] as AppMode[]).map((item) => (
            <Pressable key={item} onPress={() => setMode(item)} style={[styles.modeButton, mode === item && styles.modeButtonActive]}>
              <Text style={[styles.modeText, mode === item && styles.modeTextActive]}>{item === 'public' ? 'Público' : item === 'client' ? 'Cliente' : 'Assessor'}</Text>
            </Pressable>
          ))}
        </View>

        <Card>
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.cardTitle}>{marketMood.title}</Text>
              <Text style={styles.cardText}>{marketMood.text}</Text>
            </View>
            <IconBox name="analytics" color="#34d399" />
          </View>
        </Card>

        <View style={styles.grid2}>
          <Pressable style={styles.actionCard} onPress={() => setSection('market')}>
            <IconBox name="trending-up" />
            <Text style={styles.actionTitle}>Mercado</Text>
            <Text style={styles.actionText}>Radar, sinais e ativos.</Text>
          </Pressable>
          <Pressable style={styles.actionCard} onPress={() => setSection('tools')}>
            <IconBox name="calculator" color="#f59e0b" />
            <Text style={styles.actionTitle}>Ferramentas</Text>
            <Text style={styles.actionText}>Valor, dólar e checklist.</Text>
          </Pressable>
        </View>

        {latestMessage ? (
          <Card>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.mutedSmall}>MENSAGEM DO ASSESSOR</Text>
                <Text style={styles.cardTitle}>{latestMessage.subject}</Text>
                <Text style={styles.cardText}>{latestMessage.body}</Text>
              </View>
              <IconBox name="chatbubble-ellipses" color="#22c55e" />
            </View>
          </Card>
        ) : (
          <Card>
            <View style={styles.cardHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>Use sem corretora ou carteira.</Text>
                <Text style={styles.cardText}>O app não mostra saldo, patrimônio, extrato ou posição real. Ele ajuda a entender contexto e organizar decisões.</Text>
              </View>
              <IconBox name="shield-checkmark" color="#34d399" />
            </View>
          </Card>
        )}
      </View>
    );
  }

  function renderMarket() {
    return (
      <View style={styles.stack}>
        <View>
          <Text style={styles.screenTitle}>Radar de mercado</Text>
          <Text style={styles.screenSubtitle}>Ativos relevantes para leitura rápida de cenário.</Text>
        </View>
        {loading ? <ActivityIndicator color="#22d3ee" /> : null}
        {marketData.map((item) => {
          const positive = item.changePercent >= 0;
          const watched = watch.includes(item.symbol);
          return (
            <Card key={item.symbol}>
              <View style={styles.assetRow}>
                <View style={styles.symbolBadge}>
                  <Text style={styles.symbolBadgeText}>{cleanSymbol(item.symbol).slice(0, 2)}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.assetTicker}>{cleanSymbol(item.symbol)}</Text>
                  <Text style={styles.assetName}>{symbolName(item.symbol)}</Text>
                </View>
                <View style={styles.assetRight}>
                  <Text style={styles.assetPrice}>{money(item.lastPrice)}</Text>
                  <Text style={[styles.assetChange, positive ? styles.greenText : styles.redText]}>{pct(item.changePercent)}</Text>
                </View>
                <Pressable onPress={() => toggleWatch(item.symbol)} style={styles.starButton}>
                  <Ionicons name={watched ? 'star' : 'star-outline'} size={22} color={watched ? '#facc15' : '#64748b'} />
                </Pressable>
              </View>
            </Card>
          );
        })}
      </View>
    );
  }

  function renderWatch() {
    return (
      <View style={styles.stack}>
        <View>
          <Text style={styles.screenTitle}>Minha lista</Text>
          <Text style={styles.screenSubtitle}>Ativos que você quer acompanhar de perto.</Text>
        </View>
        {watchedAssets.length === 0 ? (
          <Card><Text style={styles.cardText}>Toque na estrela de um ativo no Radar para adicionar à lista.</Text></Card>
        ) : watchedAssets.map((item) => {
          const positive = item.changePercent >= 0;
          return (
            <Card key={item.symbol}>
              <View style={styles.assetRow}>
                <IconBox name={positive ? 'arrow-up-circle' : 'arrow-down-circle'} color={positive ? '#34d399' : '#f87171'} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.assetTicker}>{cleanSymbol(item.symbol)}</Text>
                  <Text style={styles.assetName}>{positive ? 'Sinal positivo no dia' : 'Sinal de pressão no dia'}</Text>
                </View>
                <Text style={[styles.assetChange, positive ? styles.greenText : styles.redText]}>{pct(item.changePercent)}</Text>
              </View>
            </Card>
          );
        })}

        <Card>
          <Text style={styles.cardTitle}>Alertas inteligentes</Text>
          <Text style={styles.cardText}>Próxima evolução: avisar quando um ativo da sua lista cair muito, subir muito, receber relatório ou tiver notícia relevante.</Text>
        </Card>
      </View>
    );
  }

  function renderTools() {
    return (
      <View style={styles.stack}>
        <View>
          <Text style={styles.screenTitle}>Ferramentas</Text>
          <Text style={styles.screenSubtitle}>Simulações simples para apoiar conversa e estudo.</Text>
        </View>

        <Card>
          <View style={styles.cardHeaderSimple}>
            <IconBox name="calculator" />
            <Text style={styles.cardTitle}>Margem de segurança</Text>
          </View>
          <Text style={styles.cardText}>Compare preço atual e valor estimado. Não é recomendação.</Text>
          <View style={styles.inputGrid}>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Preço atual</Text>
              <TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={styles.input} />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Valor estimado</Text>
              <TextInput value={fairValue} onChangeText={setFairValue} keyboardType="decimal-pad" style={styles.input} />
            </View>
          </View>
          <Text style={[styles.bigMetric, (margin || 0) >= 0 ? styles.greenText : styles.redText]}>{margin === null ? '—' : pct(margin)}</Text>
        </Card>

        <Card>
          <View style={styles.cardHeaderSimple}>
            <IconBox name="cash" color="#34d399" />
            <Text style={styles.cardTitle}>Impacto do dólar</Text>
          </View>
          <Text style={styles.cardText}>Simule o custo em reais de um gasto, viagem, importação ou exposição em dólar.</Text>
          <View style={styles.inputGrid}>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Valor em US$</Text>
              <TextInput value={usdExpense} onChangeText={setUsdExpense} keyboardType="decimal-pad" style={styles.input} />
            </View>
            <View style={styles.inputBox}>
              <Text style={styles.inputLabel}>Dólar</Text>
              <TextInput value={usdRate} onChangeText={setUsdRate} keyboardType="decimal-pad" style={styles.input} />
            </View>
          </View>
          <Text style={styles.bigMetric}>{dollarImpact === null ? '—' : money(dollarImpact)}</Text>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Checklist antes de decidir</Text>
          {checklist.map((item, index) => (
            <View key={item} style={styles.checkRow}>
              <View style={styles.checkCircle}><Text style={styles.checkNumber}>{index + 1}</Text></View>
              <Text style={styles.checkText}>{item}</Text>
            </View>
          ))}
        </Card>
      </View>
    );
  }

  function renderProfile() {
    return (
      <View style={styles.stack}>
        <View>
          <Text style={styles.screenTitle}>Perfil e acesso</Text>
          <Text style={styles.screenSubtitle}>O app muda conforme você é público, cliente assessorado ou profissional.</Text>
        </View>

        <Card>
          <Text style={styles.cardTitle}>Relatórios e estudos</Text>
          {reports.map((report) => (
            <Pressable key={report.ticker} onPress={() => openWeb(`/api/reports/valuation/${report.ticker}.pdf`)} style={styles.reportRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.assetTicker}>{report.ticker}</Text>
                <Text style={styles.assetName}>{report.title}</Text>
                <Text style={styles.mutedSmall}>{report.summary}</Text>
              </View>
              <Ionicons name="download-outline" size={22} color="#22d3ee" />
            </Pressable>
          ))}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Aprender</Text>
          {learning.map((item) => (
            <View key={item.title} style={styles.learnBox}>
              <View style={styles.cardHeaderSimple}>
                <Text style={styles.learnTitle}>{item.title}</Text>
                <Text style={styles.mutedSmall}>{item.progress}%</Text>
              </View>
              <View style={styles.progressTrack}><View style={[styles.progressBar, { width: `${item.progress}%` }]} /></View>
              <Text style={styles.mutedSmall}>Próximo: {item.next}</Text>
            </View>
          ))}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Mensagem ao assessor</Text>
          <Text style={styles.cardText}>Disponível para clientes assessorados. Na visão pública, use a demo ou faça login.</Text>
          <TextInput
            value={question}
            onChangeText={setQuestion}
            multiline
            placeholder="Digite sua dúvida..."
            placeholderTextColor="#64748b"
            style={[styles.input, styles.textArea]}
          />
          <Pressable onPress={sendQuestion} style={styles.primaryButton}>
            <Ionicons name="send" size={18} color="#020617" />
            <Text style={styles.primaryButtonText}>Enviar dúvida</Text>
          </Pressable>
        </Card>

        {(mode === 'advisor') ? (
          <Card>
            <Text style={styles.cardTitle}>Acesso profissional</Text>
            <Text style={styles.cardText}>Abra a plataforma web para comunicação, clientes, relatórios e relacionamento.</Text>
            <Pressable onPress={() => openWeb('/assessor')} style={styles.secondaryButton}><Text style={styles.secondaryButtonText}>Abrir workspace</Text></Pressable>
          </Card>
        ) : null}
      </View>
    );
  }

  const content = section === 'today' ? renderToday() : section === 'market' ? renderMarket() : section === 'watch' ? renderWatch() : section === 'tools' ? renderTools() : renderProfile();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="light-content" backgroundColor="#020617" />
      <View style={styles.header}>
        <View style={styles.logoMark}><Ionicons name="trending-up" size={22} color="#fff" /></View>
        <View style={{ flex: 1 }}>
          <Text style={styles.logoText}>F-Insight</Text>
          <Text style={styles.logoSub}>Inteligência financeira</Text>
        </View>
        <Pressable onPress={() => openWeb('/login')} style={styles.loginButton}>
          <Ionicons name="log-in-outline" size={18} color="#34d399" />
          <Text style={styles.loginText}>Entrar</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>{content}</ScrollView>

      <View style={styles.bottomNav}>
        {([
          ['today', 'Hoje', 'home'],
          ['market', 'Mercado', 'stats-chart'],
          ['watch', 'Lista', 'star'],
          ['tools', 'Tools', 'construct'],
          ['profile', 'Perfil', 'person-circle'],
        ] as Array<[Section, string, keyof typeof Ionicons.glyphMap]>).map(([key, label, icon]) => (
          <Pressable key={key} onPress={() => setSection(key)} style={[styles.navItem, section === key && styles.navItemActive]}>
            <Ionicons name={icon} size={20} color={section === key ? '#22d3ee' : '#94a3b8'} />
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
  logoText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  logoSub: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2 },
  loginButton: { flexDirection: 'row', alignItems: 'center', gap: 5, borderColor: '#064e3b', borderWidth: 1, borderRadius: 14, paddingHorizontal: 10, paddingVertical: 8, backgroundColor: '#052e2b' },
  loginText: { color: '#34d399', fontWeight: '800', fontSize: 12 },
  scroll: { padding: 16, paddingBottom: 110 },
  stack: { gap: 14 },
  hero: { borderRadius: 28, padding: 20, borderWidth: 1, borderColor: '#155e75' },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  kicker: { color: '#22d3ee', fontWeight: '900', fontSize: 11, letterSpacing: 2, marginBottom: 8 },
  heroTitle: { color: '#fff', fontSize: 31, lineHeight: 36, fontWeight: '900', maxWidth: 260 },
  heroText: { color: '#cbd5e1', fontSize: 15, lineHeight: 22, marginTop: 14, marginBottom: 14 },
  rowWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: { overflow: 'hidden', borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5, fontSize: 11, fontWeight: '900', textTransform: 'uppercase' },
  pill_blue: { color: '#67e8f9', backgroundColor: '#083344' },
  pill_green: { color: '#86efac', backgroundColor: '#052e16' },
  pill_amber: { color: '#fcd34d', backgroundColor: '#451a03' },
  pill_red: { color: '#fca5a5', backgroundColor: '#450a0a' },
  card: { borderRadius: 24, padding: 16, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  cardHeaderSimple: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  cardText: { color: '#94a3b8', fontSize: 14, lineHeight: 21 },
  mutedSmall: { color: '#64748b', fontSize: 11, fontWeight: '700' },
  iconBox: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  modeSwitcher: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 18, padding: 4, borderWidth: 1, borderColor: '#1e293b' },
  modeButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 14 },
  modeButtonActive: { backgroundColor: '#164e63' },
  modeText: { color: '#94a3b8', fontWeight: '800', fontSize: 12 },
  modeTextActive: { color: '#67e8f9' },
  grid2: { flexDirection: 'row', gap: 12 },
  actionCard: { flex: 1, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 22, padding: 14 },
  actionTitle: { color: '#fff', fontSize: 16, fontWeight: '900', marginTop: 10 },
  actionText: { color: '#94a3b8', fontSize: 12, lineHeight: 18, marginTop: 4 },
  screenTitle: { color: '#fff', fontSize: 30, fontWeight: '900' },
  screenSubtitle: { color: '#94a3b8', fontSize: 14, lineHeight: 21, marginTop: 4 },
  assetRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  symbolBadge: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#083344' },
  symbolBadgeText: { color: '#22d3ee', fontWeight: '900', fontSize: 15 },
  assetTicker: { color: '#fff', fontWeight: '900', fontSize: 16 },
  assetName: { color: '#94a3b8', fontSize: 13, marginTop: 3 },
  assetRight: { alignItems: 'flex-end' },
  assetPrice: { color: '#fff', fontWeight: '900', fontSize: 15 },
  assetChange: { fontWeight: '900', fontSize: 13, marginTop: 3 },
  greenText: { color: '#34d399' },
  redText: { color: '#fb7185' },
  starButton: { padding: 4 },
  inputGrid: { flexDirection: 'row', gap: 10, marginTop: 12 },
  inputBox: { flex: 1 },
  inputLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '800', marginBottom: 6 },
  input: { backgroundColor: '#020617', borderWidth: 1, borderColor: '#1e293b', color: '#fff', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15 },
  textArea: { minHeight: 100, textAlignVertical: 'top', marginTop: 12 },
  bigMetric: { color: '#fff', fontSize: 34, fontWeight: '900', marginTop: 12 },
  checkRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 12 },
  checkCircle: { width: 28, height: 28, borderRadius: 10, backgroundColor: '#083344', alignItems: 'center', justifyContent: 'center' },
  checkNumber: { color: '#22d3ee', fontWeight: '900' },
  checkText: { color: '#cbd5e1', flex: 1, lineHeight: 20 },
  reportRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: '#1e293b' },
  learnBox: { borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 12, marginTop: 12 },
  learnTitle: { color: '#fff', fontWeight: '900' },
  progressTrack: { height: 8, borderRadius: 999, overflow: 'hidden', backgroundColor: '#1e293b', marginVertical: 10 },
  progressBar: { height: '100%', borderRadius: 999, backgroundColor: '#22d3ee' },
  primaryButton: { backgroundColor: '#22d3ee', borderRadius: 16, paddingVertical: 13, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 8, marginTop: 12 },
  primaryButtonText: { color: '#020617', fontWeight: '900' },
  secondaryButton: { borderColor: '#334155', borderWidth: 1, borderRadius: 16, paddingVertical: 13, alignItems: 'center', marginTop: 12 },
  secondaryButtonText: { color: '#fff', fontWeight: '900' },
  bottomNav: { position: 'absolute', left: 14, right: 14, bottom: 14, flexDirection: 'row', backgroundColor: '#020617ee', borderWidth: 1, borderColor: '#1e293b', borderRadius: 24, padding: 7, gap: 4 },
  navItem: { flex: 1, alignItems: 'center', gap: 3, paddingVertical: 8, borderRadius: 18 },
  navItemActive: { backgroundColor: '#0f172a' },
  navLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '800' },
  navLabelActive: { color: '#67e8f9' },
});
