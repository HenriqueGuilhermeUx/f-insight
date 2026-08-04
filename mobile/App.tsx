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
type Section = 'today' | 'market' | 'watch' | 'tools' | 'profile';

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
  const fixed = Number.isFinite(value) ? value.toFixed(2) : '0.00';
  return `R$ ${fixed.replace('.', ',')}`;
}

function pct(value: number) {
  if (!Number.isFinite(value)) return '0,00%';
  return `${value >= 0 ? '+' : ''}${value.toFixed(2).replace('.', ',')}%`;
}

function clock(value?: string) {
  if (!value) return 'modo educativo';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'modo educativo';
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${hh}:${mm}`;
}

function parseNumber(value: string) {
  const parsed = Number(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function openWeb(path: string) {
  const safePath = path.startsWith('/') ? path : `/${path}`;
  void Linking.openURL(`${WEB_URL}${safePath}`);
}

function Card({ children }: { children: React.ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

function Badge({ children, tone = 'blue' }: { children: React.ReactNode; tone?: 'blue' | 'green' | 'amber' | 'red' }) {
  const style = tone === 'green' ? styles.badgeGreen : tone === 'amber' ? styles.badgeAmber : tone === 'red' ? styles.badgeRed : styles.badgeBlue;
  return <Text style={[styles.badge, style]}>{children}</Text>;
}

function IconMark({ label, tone = 'blue' }: { label: string; tone?: 'blue' | 'green' | 'amber' | 'red' }) {
  const boxStyle = tone === 'green' ? styles.iconGreen : tone === 'amber' ? styles.iconAmber : tone === 'red' ? styles.iconRed : styles.iconBlue;
  return (
    <View style={[styles.iconMark, boxStyle]}>
      <Text style={styles.iconText}>{label}</Text>
    </View>
  );
}

export default function App() {
  const [section, setSection] = useState<Section>('today');
  const [mode, setMode] = useState<AppMode>('public');
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [indicators, setIndicators] = useState<LiveIndicator[]>([]);
  const [watch, setWatch] = useState<string[]>(['PETR4.SA', 'ITUB4.SA']);
  const [price, setPrice] = useState('28');
  const [fairValue, setFairValue] = useState('36');
  const [usdExpense, setUsdExpense] = useState('500');
  const [usdRate, setUsdRate] = useState('5.12');
  const [question, setQuestion] = useState('');

  useEffect(() => {
    let active = true;
    fetch(`${API_URL}/api/live/indicators`)
      .then((res) => (res.ok ? res.json() : null))
      .then((payload) => {
        if (!active) return;
        const data = Array.isArray(payload?.data) ? payload.data : [];
        setIndicators(data);
        setIsLive(data.length > 0);
      })
      .catch(() => {
        if (!active) return;
        setIndicators([]);
        setIsLive(false);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const marketData = indicators.length > 0 ? indicators : fallbackIndicators;
  const watchedAssets = marketData.filter((item) => watch.includes(item.symbol));
  const latestMessage = mode === 'public' ? null : {
    subject: 'Cenário da semana',
    body: 'Juros, dólar e commodities seguem como pontos principais para nossa próxima conversa.',
  };

  const marketMood = useMemo(() => {
    const avg = marketData.reduce((sum, item) => sum + item.changePercent, 0) / marketData.length;
    if (avg > 0.6) return { title: 'Mercado construtivo', text: 'A amostra acompanhada está positiva. Verifique fundamento, fluxo e notícia.' };
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
    setWatch((current) => current.includes(symbol) ? current.filter((item) => item !== symbol) : [...current, symbol]);
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
      <View>
        <View style={styles.hero}>
          <Text style={styles.kicker}>F-INSIGHT APP</Text>
          <Text style={styles.heroTitle}>Seu cockpit financeiro diário.</Text>
          <Text style={styles.heroText}>Acompanhe mercado, organize ativos, use ferramentas educativas e converse melhor com seu assessor.</Text>
          <View style={styles.badgeRow}>
            <Badge tone={isLive ? 'green' : 'amber'}>{isLive ? 'dados ao vivo' : 'modo educativo'}</Badge>
            <Badge>atualizado {clock(marketData[0]?.fetchedAt)}</Badge>
          </View>
        </View>

        <View style={styles.modeSwitcher}>
          {(['public', 'client', 'advisor'] as AppMode[]).map((item) => (
            <Pressable key={item} onPress={() => setMode(item)} style={[styles.modeButton, mode === item ? styles.modeButtonActive : null]}>
              <Text style={[styles.modeText, mode === item ? styles.modeTextActive : null]}>{item === 'public' ? 'Público' : item === 'client' ? 'Cliente' : 'Assessor'}</Text>
            </Pressable>
          ))}
        </View>

        <Card>
          <View style={styles.rowTop}>
            <View style={styles.flex1}>
              <Text style={styles.cardTitle}>{marketMood.title}</Text>
              <Text style={styles.cardText}>{marketMood.text}</Text>
            </View>
            <IconMark label="IA" tone="green" />
          </View>
        </Card>

        <View style={styles.twoCols}>
          <Pressable style={styles.actionCard} onPress={() => setSection('market')}>
            <IconMark label="M" />
            <Text style={styles.actionTitle}>Mercado</Text>
            <Text style={styles.actionText}>Radar, sinais e ativos.</Text>
          </Pressable>
          <Pressable style={styles.actionCard} onPress={() => setSection('tools')}>
            <IconMark label="ƒ" tone="amber" />
            <Text style={styles.actionTitle}>Ferramentas</Text>
            <Text style={styles.actionText}>Valor, dólar e checklist.</Text>
          </Pressable>
        </View>

        {latestMessage ? (
          <Card>
            <Text style={styles.mutedSmall}>MENSAGEM DO ASSESSOR</Text>
            <Text style={styles.cardTitle}>{latestMessage.subject}</Text>
            <Text style={styles.cardText}>{latestMessage.body}</Text>
          </Card>
        ) : (
          <Card>
            <Text style={styles.cardTitle}>Use sem corretora ou carteira.</Text>
            <Text style={styles.cardText}>O app não mostra saldo, patrimônio, extrato ou posição real. Ele ajuda a entender contexto e organizar decisões.</Text>
          </Card>
        )}
      </View>
    );
  }

  function renderMarket() {
    return (
      <View>
        <Text style={styles.screenTitle}>Radar de mercado</Text>
        <Text style={styles.screenSubtitle}>Ativos relevantes para leitura rápida de cenário.</Text>
        {loading ? <ActivityIndicator color="#22d3ee" style={styles.loader} /> : null}
        {marketData.map((item) => {
          const positive = item.changePercent >= 0;
          const watched = watch.includes(item.symbol);
          return (
            <Card key={item.symbol}>
              <View style={styles.assetRow}>
                <View style={styles.symbolBadge}><Text style={styles.symbolBadgeText}>{cleanSymbol(item.symbol).slice(0, 2)}</Text></View>
                <View style={styles.flex1}>
                  <Text style={styles.assetTicker}>{cleanSymbol(item.symbol)}</Text>
                  <Text style={styles.assetName}>{symbolName(item.symbol)}</Text>
                </View>
                <View style={styles.assetRight}>
                  <Text style={styles.assetPrice}>{money(item.lastPrice)}</Text>
                  <Text style={[styles.assetChange, positive ? styles.greenText : styles.redText]}>{pct(item.changePercent)}</Text>
                </View>
                <Pressable onPress={() => toggleWatch(item.symbol)} style={styles.starButton}>
                  <Text style={[styles.starText, watched ? styles.starActive : null]}>{watched ? '★' : '☆'}</Text>
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
      <View>
        <Text style={styles.screenTitle}>Minha lista</Text>
        <Text style={styles.screenSubtitle}>Ativos que você quer acompanhar de perto.</Text>
        {watchedAssets.length === 0 ? <Card><Text style={styles.cardText}>Toque na estrela de um ativo no Radar para adicionar à lista.</Text></Card> : null}
        {watchedAssets.map((item) => {
          const positive = item.changePercent >= 0;
          return (
            <Card key={item.symbol}>
              <View style={styles.assetRow}>
                <IconMark label={positive ? '↑' : '↓'} tone={positive ? 'green' : 'red'} />
                <View style={styles.flex1}>
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
          <Text style={styles.cardText}>Próxima evolução: avisar quando um ativo cair muito, subir muito, receber relatório ou tiver notícia relevante.</Text>
        </Card>
      </View>
    );
  }

  function renderTools() {
    return (
      <View>
        <Text style={styles.screenTitle}>Ferramentas</Text>
        <Text style={styles.screenSubtitle}>Simulações simples para apoiar conversa e estudo.</Text>

        <Card>
          <Text style={styles.cardTitle}>Margem de segurança</Text>
          <Text style={styles.cardText}>Compare preço atual e valor estimado. Não é recomendação.</Text>
          <View style={styles.inputGrid}>
            <View style={styles.inputBox}><Text style={styles.inputLabel}>Preço atual</Text><TextInput value={price} onChangeText={setPrice} keyboardType="decimal-pad" style={styles.input} /></View>
            <View style={styles.inputBox}><Text style={styles.inputLabel}>Valor estimado</Text><TextInput value={fairValue} onChangeText={setFairValue} keyboardType="decimal-pad" style={styles.input} /></View>
          </View>
          <Text style={[styles.bigMetric, (margin || 0) >= 0 ? styles.greenText : styles.redText]}>{margin === null ? '—' : pct(margin)}</Text>
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Impacto do dólar</Text>
          <Text style={styles.cardText}>Simule o custo em reais de gasto, viagem, importação ou exposição em dólar.</Text>
          <View style={styles.inputGrid}>
            <View style={styles.inputBox}><Text style={styles.inputLabel}>Valor em US$</Text><TextInput value={usdExpense} onChangeText={setUsdExpense} keyboardType="decimal-pad" style={styles.input} /></View>
            <View style={styles.inputBox}><Text style={styles.inputLabel}>Dólar</Text><TextInput value={usdRate} onChangeText={setUsdRate} keyboardType="decimal-pad" style={styles.input} /></View>
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
      <View>
        <Text style={styles.screenTitle}>Perfil e acesso</Text>
        <Text style={styles.screenSubtitle}>O app muda conforme você é público, cliente assessorado ou profissional.</Text>

        <Card>
          <Text style={styles.cardTitle}>Relatórios e estudos</Text>
          {reports.map((report) => (
            <Pressable key={report.ticker} onPress={() => openWeb(`/relatorios/${report.ticker}`)} style={styles.reportRow}>
              <View style={styles.flex1}>
                <Text style={styles.assetTicker}>{report.ticker}</Text>
                <Text style={styles.assetName}>{report.title}</Text>
                <Text style={styles.mutedSmall}>{report.summary}</Text>
              </View>
              <Text style={styles.linkSymbol}>↗</Text>
            </Pressable>
          ))}
        </Card>

        <Card>
          <Text style={styles.cardTitle}>Aprender</Text>
          {learning.map((item) => (
            <View key={item.title} style={styles.learnBox}>
              <View style={styles.rowTop}>
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
          <TextInput value={question} onChangeText={setQuestion} multiline placeholder="Digite sua dúvida..." placeholderTextColor="#64748b" style={[styles.input, styles.textArea]} />
          <Pressable onPress={sendQuestion} style={styles.primaryButton}><Text style={styles.primaryButtonText}>Enviar dúvida</Text></Pressable>
        </Card>

        {mode === 'advisor' ? (
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
        <View style={styles.logoMark}><Text style={styles.logoMarkText}>FI</Text></View>
        <View style={styles.flex1}>
          <Text style={styles.logoText}>F-Insight</Text>
          <Text style={styles.logoSub}>Inteligência financeira</Text>
        </View>
        <Pressable onPress={() => openWeb('/login')} style={styles.loginButton}><Text style={styles.loginText}>Entrar</Text></Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>{content}</ScrollView>

      <View style={styles.bottomNav}>
        {([
          ['today', 'Hoje', '⌂'],
          ['market', 'Mercado', '▥'],
          ['watch', 'Lista', '★'],
          ['tools', 'Tools', 'ƒ'],
          ['profile', 'Perfil', '◎'],
        ] as Array<[Section, string, string]>).map(([key, label, icon]) => (
          <Pressable key={key} onPress={() => setSection(key)} style={[styles.navItem, section === key ? styles.navItemActive : null]}>
            <Text style={[styles.navIcon, section === key ? styles.navIconActive : null]}>{icon}</Text>
            <Text style={[styles.navLabel, section === key ? styles.navLabelActive : null]}>{label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#020617' },
  flex1: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 18, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#0f172a', backgroundColor: '#020617' },
  logoMark: { width: 42, height: 42, borderRadius: 16, backgroundColor: '#0891b2', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  logoMarkText: { color: '#fff', fontSize: 15, fontWeight: '900' },
  logoText: { color: '#fff', fontSize: 20, fontWeight: '900' },
  logoSub: { color: '#64748b', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.2 },
  loginButton: { borderColor: '#064e3b', borderWidth: 1, borderRadius: 14, paddingHorizontal: 12, paddingVertical: 8, backgroundColor: '#052e2b' },
  loginText: { color: '#34d399', fontWeight: '800', fontSize: 12 },
  scroll: { padding: 16, paddingBottom: 110 },
  hero: { borderRadius: 28, padding: 20, borderWidth: 1, borderColor: '#155e75', backgroundColor: '#083344', marginBottom: 14 },
  kicker: { color: '#22d3ee', fontWeight: '900', fontSize: 11, letterSpacing: 2, marginBottom: 8 },
  heroTitle: { color: '#fff', fontSize: 31, lineHeight: 36, fontWeight: '900' },
  heroText: { color: '#cbd5e1', fontSize: 15, lineHeight: 22, marginTop: 14, marginBottom: 14 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap' },
  badge: { borderRadius: 999, overflow: 'hidden', paddingHorizontal: 10, paddingVertical: 5, fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1, marginRight: 8, marginBottom: 8 },
  badgeBlue: { backgroundColor: '#0e749033', color: '#67e8f9' },
  badgeGreen: { backgroundColor: '#16a34a33', color: '#86efac' },
  badgeAmber: { backgroundColor: '#f59e0b33', color: '#fcd34d' },
  badgeRed: { backgroundColor: '#dc262633', color: '#fca5a5' },
  modeSwitcher: { flexDirection: 'row', backgroundColor: '#0f172a', borderRadius: 18, padding: 4, borderWidth: 1, borderColor: '#1e293b', marginBottom: 14 },
  modeButton: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: 14 },
  modeButtonActive: { backgroundColor: '#22d3ee' },
  modeText: { color: '#94a3b8', fontWeight: '900', fontSize: 12 },
  modeTextActive: { color: '#020617' },
  card: { backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 24, padding: 16, marginBottom: 14 },
  rowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { color: '#fff', fontSize: 18, fontWeight: '900', marginBottom: 6 },
  cardText: { color: '#94a3b8', fontSize: 14, lineHeight: 20 },
  iconMark: { width: 46, height: 46, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginLeft: 12 },
  iconBlue: { backgroundColor: '#0e749033' },
  iconGreen: { backgroundColor: '#16a34a33' },
  iconAmber: { backgroundColor: '#f59e0b33' },
  iconRed: { backgroundColor: '#dc262633' },
  iconText: { color: '#fff', fontWeight: '900', fontSize: 16 },
  twoCols: { flexDirection: 'row', marginBottom: 14 },
  actionCard: { flex: 1, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 22, padding: 14, marginRight: 10 },
  actionTitle: { color: '#fff', fontWeight: '900', fontSize: 16, marginTop: 12 },
  actionText: { color: '#94a3b8', fontSize: 12, marginTop: 4, lineHeight: 17 },
  mutedSmall: { color: '#64748b', fontSize: 11, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.8 },
  screenTitle: { color: '#fff', fontSize: 29, fontWeight: '900', marginBottom: 4 },
  screenSubtitle: { color: '#94a3b8', fontSize: 15, marginBottom: 14, lineHeight: 22 },
  loader: { marginBottom: 12 },
  assetRow: { flexDirection: 'row', alignItems: 'center' },
  symbolBadge: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#155e75', marginRight: 12 },
  symbolBadgeText: { color: '#22d3ee', fontWeight: '900' },
  assetTicker: { color: '#fff', fontSize: 16, fontWeight: '900' },
  assetName: { color: '#94a3b8', fontSize: 12, marginTop: 2 },
  assetRight: { alignItems: 'flex-end', marginRight: 10 },
  assetPrice: { color: '#fff', fontSize: 14, fontWeight: '900' },
  assetChange: { fontSize: 13, fontWeight: '900', marginTop: 3 },
  greenText: { color: '#34d399' },
  redText: { color: '#f87171' },
  starButton: { padding: 4 },
  starText: { color: '#64748b', fontSize: 28 },
  starActive: { color: '#facc15' },
  inputGrid: { flexDirection: 'row', marginTop: 12 },
  inputBox: { flex: 1, marginRight: 10 },
  inputLabel: { color: '#94a3b8', fontSize: 11, fontWeight: '800', marginBottom: 6 },
  input: { backgroundColor: '#020617', borderWidth: 1, borderColor: '#1e293b', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 11, color: '#fff', fontSize: 15 },
  textArea: { minHeight: 100, textAlignVertical: 'top', marginTop: 12 },
  bigMetric: { color: '#fff', fontSize: 35, fontWeight: '900', marginTop: 14 },
  checkRow: { flexDirection: 'row', alignItems: 'center', marginTop: 13 },
  checkCircle: { width: 28, height: 28, borderRadius: 999, backgroundColor: '#22d3ee33', alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  checkNumber: { color: '#22d3ee', fontWeight: '900', fontSize: 12 },
  checkText: { color: '#cbd5e1', flex: 1, fontSize: 14 },
  reportRow: { flexDirection: 'row', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 12, marginTop: 12 },
  linkSymbol: { color: '#22d3ee', fontSize: 22, fontWeight: '900', marginLeft: 12 },
  learnBox: { borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 13, marginTop: 13 },
  learnTitle: { color: '#fff', fontWeight: '900', fontSize: 14 },
  progressTrack: { height: 7, backgroundColor: '#1e293b', borderRadius: 999, overflow: 'hidden', marginVertical: 9 },
  progressBar: { height: '100%', backgroundColor: '#22d3ee' },
  primaryButton: { marginTop: 12, borderRadius: 16, backgroundColor: '#22d3ee', paddingVertical: 13, alignItems: 'center' },
  primaryButtonText: { color: '#020617', fontWeight: '900' },
  secondaryButton: { marginTop: 12, borderRadius: 16, borderWidth: 1, borderColor: '#334155', paddingVertical: 13, alignItems: 'center' },
  secondaryButtonText: { color: '#fff', fontWeight: '900' },
  bottomNav: { position: 'absolute', left: 12, right: 12, bottom: 12, backgroundColor: '#0f172a', borderWidth: 1, borderColor: '#1e293b', borderRadius: 24, padding: 8, flexDirection: 'row', justifyContent: 'space-between' },
  navItem: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 16 },
  navItemActive: { backgroundColor: '#082f49' },
  navIcon: { color: '#94a3b8', fontSize: 18, fontWeight: '900' },
  navIconActive: { color: '#22d3ee' },
  navLabel: { color: '#94a3b8', fontSize: 10, fontWeight: '900', marginTop: 3 },
  navLabelActive: { color: '#22d3ee' },
});
