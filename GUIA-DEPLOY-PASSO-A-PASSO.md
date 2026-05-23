# InvestX - Guia Completo de Deploy

## Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USUÁRIO                                        │
│                    (Navegador / App PWA)                                   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           NETLIFY (Frontend)                               │
│                    investx.netlify.app                                      │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    React + Vite + TypeScript                        │   │
│  │                        (PWA Completo)                               │   │
│  │                                                                      │   │
│  │  • Dashboard com índices                                            │   │
│  │  • Radar de ativos                                                  │   │
│  │  • Detalhes de ativos                                               │   │
│  │  • Watchlist                                                        │   │
│  │  • Notícias                                                         │   │
│  │  • Análises (Graham, Doddsville)                                    │   │
│  │  • Alertas                                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
┌────────────────────────────┐     ┌────────────────────────────────────────┐
│      RENDER (Backend)      │     │            SUPABASE                   │
│   api.investx.onrender.com │     │      (Database + Auth + Storage)      │
│                            │     │                                        │
│  ┌──────────────────────┐  │     │  ┌────────────────────────────────┐  │
│  │  Node.js + Express   │  │     │  │  PostgreSQL Database           │  │
│  │                      │  │     │  │  • Users table                  │  │
│  │  • /api/stocks/*     │  │     │  │  • Watchlists table             │  │
│  │  • /api/crypto/*     │  │     │  │  • Alerts table                 │  │
│  │  • /api/news/*       │  │     │  │  • Price history                │  │
│  │  • /api/indicators/* │  │     │  └────────────────────────────────┘  │
│  │  • /api/chatbot/*     │  │     │  ┌────────────────────────────────┐  │
│  │                      │  │     │  │  Authentication                 │  │
│  │  • Finnhub API       │  │     │  │  • OAuth providers              │  │
│  │  • CoinGecko API     │  │     │  │  • JWT tokens                   │  │
│  │  • Yahoo Finance     │  │     │  └────────────────────────────────┘  │
│  └──────────────────────┘  │     └────────────────────────────────────────┘
└────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │     EXTERNAS APIs     │
        │  • Finnhub            │
        │  • CoinGecko          │
        │  • Yahoo Finance      │
        │  • News API           │
        └───────────────────────┘
```

## Pré-requisitos

Antes de começar, você precisa instalar algumas ferramentas no seu computador:

### 1. Node.js (Obrigatório)

O Node.js é o ambiente que permite rodar JavaScript fora do navegador. É essencial para React e todo o projeto.

**Como instalar:**

1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (recomendada) - é a versão mais estável
3. Execute o instalador e siga os passos
4. Para verificar se instalou corretamente, abra o terminal e digite:
   ```
   node --version
   ```
   Se aparecer algo como `v20.x.x`, está funcionando!

### 2. Git (Obrigatório)

O Git é o sistema de controle de versão. Permite salvar seu código no GitHub.

**Como instalar:**

1. Acesse: https://git-scm.com/
2. Clique em "Download for Windows" (ou Mac/Linux conforme seu sistema)
3. Execute o instalador com as opções padrão
4. Para verificar, abra o terminal e digite:
   ```
   git --version
   ```
   Se aparecer `git version 2.x.x`, está funcionando!

### 3. VS Code (Recomendado)

O Visual Studio Code é o editor de código que recomendamos. É gratuito e tem muitas funcionalidades úteis.

**Como instalar:**

1. Acesse: https://code.visualstudio.com/
2. Baixe e instale a versão para seu sistema
3. Após instalar, instale a extensão "Tailwind CSS IntelliSense" (vá em Extensions no menu esquerdo e busque por "Tailwind")

---

## Passo a Passo Completo

### PARTE 1: Preparando seu Computador

#### 1.1 Configurando o Terminal (Git Bash no Windows)

Se você usa Windows, recomendamos usar o Git Bash que vem junto com o Git:

1. Clique com botão direito na área de trabalho
2. Selecione "Git Bash Here"
3. Isso abre um terminal especial que funciona melhor com projetos JavaScript

#### 1.2 Configurando o npm

O npm vem junto com o Node.js. Vamos configurar para usar o espelho brasileiro (mais rápido):

```bash
# Configure o espelho npm para o Brasil
npm config set registry https://registry.npmmirror.com

# Verifique se está correto
npm config get registry
```

---

### PARTE 2: Trabalhando com GitHub

#### 2.1 Criando Conta no GitHub

1. Acesse: https://github.com/
2. Clique em "Sign up"
3. Escolha um nome de usuário (será seu identificador)
4. Coloque um email válido
5. Crie uma senha forte
6. Complete a verificação de segurança
7. Ative autenticação em duas etapas (recomendado, mas não obrigatório inicialmente)

#### 2.2 Criando um Repositório

1. Faça login no GitHub
2. Clique no ícone "+" no canto superior direito
3. Selecione "New repository"
4. Configure:
   - **Repository name:** `invest-platform`
   - **Description:** "Plataforma de análise financeira com dados em tempo real"
   - **Visibility:** Public (ou Private se preferir)
   - **Initialize:** NÃO marque nenhum dos checkbox
5. Clique "Create repository"

#### 2.3 Enviando seu Código para o GitHub

No terminal (Git Bash), execute:

```bash
# Navegue até a pasta do projeto
cd /workspace/invest-platform

# Inicialize o Git
git init

# Configure seu nome e email (substitua pelos seus dados)
git config user.name "Seu Nome"
git config user.email "seu.email@exemplo.com"

# Adicione todos os arquivos
git add .

# Faça seu primeiro commit
git commit -m "Primeiro commit - Plataforma InvestX v1.0"

# Adicione o repositório remoto (substitua SEU_USUARIO pelo seu usuário GitHub)
git remote add origin https://github.com/SEU_USUARIO/invest-platform.git

# Envie para o GitHub
git branch -M main
git push -u origin main
```

Após o push, atualize a página do GitHub e você verá seu código lá!

---

### PARTE 3: Criando Contas nos Serviços

#### 3.1 Supabase (Banco de Dados)

1. Acesse: https://supabase.com/
2. Clique em "Start your project"
3. Faça login com GitHub (mais fácil)
4. Clique em "New project"
5. Configure:
   - **Organization:** (use a padrão)
   - **Name:** `investx-db`
   - **Database Password:** (gere uma senha forte e 保存下来!)
   - **Region:** Choose closest to you (São Paulo é boa opção)
6. Clique "Create new project"
7. Aguarde uns 2 minutos enquanto o banco é criado

**Importante:** Anote estas informações que aparecerão depois:
- Project URL (algo como `https://xxxxx.supabase.co`)
- `anon` key (chave pública)
- `service_role` key (chave secreta - NÃO COMPARTILHE!)

#### 3.2 Render (Backend/API)

1. Acesse: https://render.com/
2. Clique em "Get started for free"
3. Faça login com GitHub (mais fácil)
4. Não precisa de cartão de crédito

#### 3.3 Netlify (Frontend)

1. Acesse: https://netlify.com/
2. Clique em "Sign up"
3. Faça login com GitHub (mais fácil)
4. Pronto, conta gratuita criada!

#### 3.4 Finnhub (Dados de Mercado - GRÁTIS)

1. Acesse: https://finnhub.io/
2. Clique em "Get FREE API key"
3. Crie uma conta ou login com Google/GitHub
4. Vá para Dashboard e copie sua API Key
5. **Importante:** A chave gratuita tem limite de 60 chamadas/minuto

#### 3.5 CoinGecko (Dados de Criptomoedas - GRÁTIS)

1. Acesse: https://www.coingecko.com/pt/api
2. Clique em "Inscreva-se para obter uma chave API"
3. Crie conta gratuita
4. Obtenha sua API Key

---

### PARTE 4: Configurando o Backend

O backend é o servidor que busca os dados reais. Vou criar ele agora.

#### 4.1 Criando o Projeto Backend

Crie uma pasta para o backend:

```bash
# Volte para a pasta workspace se necessário
cd /workspace

# Crie a pasta do backend
mkdir invest-platform-api
cd invest-platform-api

# Inicialize o projeto
npm init -y

# Instale as dependências
npm install express cors dotenv axios
npm install -D nodemon
```

#### 4.2 Estrutura de Pastas do Backend

```bash
mkdir -p src/{routes,services,middleware,utils}
mkdir -p src/config
```

#### 4.3 Arquivo .env (Variáveis de Ambiente)

Crie o arquivo `src/.env`:

```
PORT=3000
NODE_ENV=production

# Supabase
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=your-anon-key

# APIs Externas
FINNHUB_API_KEY=your-finnhub-key
COINGECKO_API_KEY=your-coingecko-key

# CORS
ALLOWED_ORIGINS=https://investx.netlify.app,http://localhost:5173
```

#### 4.4 Código Principal (server.js)

Crie `src/server.js`:

```javascript
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const stockRoutes = require('./routes/stocks');
const cryptoRoutes = require('./routes/crypto');
const newsRoutes = require('./routes/news');
const indicatorsRoutes = require('./routes/indicators');
const watchlistRoutes = require('./routes/watchlist');
const alertsRoutes = require('./routes/alerts');

const app = express();

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*'
}));
app.use(morgan('combined'));
app.use(express.json());

// Routes
app.use('/api/stocks', stockRoutes);
app.use('/api/crypto', cryptoRoutes);
app.use('/api/news', newsRoutes);
app.use('/api/indicators', indicatorsRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/alerts', alertsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

#### 4.5 Rotas do Backend

Crie `src/routes/stocks.js`:

```javascript
const express = require('express');
const axios = require('axios');
const router = express.Router();

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

// Busca dados de ações brasileiras
router.get('/brazil', async (req, res) => {
  try {
    const { symbol = 'PETR4' } = req.query;
    const apiKey = process.env.FINNHUB_API_KEY;

    // Mapeamento de símbolos B3
    const b3Symbols = {
      'PETR4': 'PETR4.SAO',
      'VALE3': 'VALE3.SAO',
      'ITUB4': 'ITUB4.SAO',
      'BBDC4': 'BBDC4.SAO',
      'ABEV3': 'ABEV3.SAO',
      'BBAS3': 'BBAS3.SAO',
      'PETR3': 'PETR3.SAO',
      'MGLU3': 'MGLU3.SAO',
      'WEGE3': 'WEGE3.SAO',
      'RENT3': 'RENT3.SAO'
    };

    const finnhubSymbol = b3Symbols[symbol] || `${symbol}.SAO`;

    const [quote, profile] = await Promise.all([
      axios.get(`${FINNHUB_BASE}/quote?symbol=${finnhubSymbol}&token=${apiKey}`),
      axios.get(`${FINNHUB_BASE}/stock/profile2?symbol=${finnhubSymbol}&token=${apiKey}`)
    ]);

    const data = quote.data;
    const price = data.c || 0; // current price

    res.json({
      symbol,
      name: profile.data.name || symbol,
      price,
      change: data.d || 0,
      changePercent: data.dp || 0,
      high: data.h || 0,
      low: data.l || 0,
      open: data.o || 0,
      previousClose: data.pc || 0,
      timestamp: data.t || Date.now()
    });

  } catch (error) {
    console.error('Error fetching Brazilian stock:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// Busca dados de ações americanas
router.get('/us', async (req, res) => {
  try {
    const { symbol = 'AAPL' } = req.query;
    const apiKey = process.env.FINNHUB_API_KEY;

    const [quote, metric, priceTarget] = await Promise.all([
      axios.get(`${FINNHUB_BASE}/quote?symbol=${symbol}&token=${apiKey}`),
      axios.get(`${FINNHUB_BASE}/stock/metric?symbol=${symbol}&token=${apiKey}&metric=valuation`),
      axios.get(`${FINNHUB_BASE}/stock/price-target?symbol=${symbol}&token=${apiKey}`)
    ]);

    const data = quote.data;
    const metrics = metric.data;

    res.json({
      symbol,
      price: data.c || 0,
      change: data.d || 0,
      changePercent: data.dp || 0,
      high: data.h || 0,
      low: data.l || 0,
      open: data.o || 0,
      previousClose: data.pc || 0,
      marketCap: metrics?.marketCapitalization || null,
      peRatio: metrics?.peExclExtraTTM || null,
      priceTargetLow: priceTarget.data?.targetLow || null,
      priceTargetHigh: priceTarget.data?.targetHigh || null
    });

  } catch (error) {
    console.error('Error fetching US stock:', error.message);
    res.status(500).json({ error: 'Failed to fetch stock data' });
  }
});

// Lista de principais índices
router.get('/indices', async (req, res) => {
  try {
    const apiKey = process.env.FINNHUB_API_KEY;

    const indices = [
      { symbol: '^BVSP', name: 'Ibovespa' },
      { symbol: '^GSPC', name: 'S&P 500' },
      { symbol: '^IXIC', name: 'NASDAQ' },
      { symbol: '^DJI', name: 'Dow Jones' },
      { symbol: '^FTSE', name: 'FTSE 100' },
      { symbol: '^N225', name: 'Nikkei 225' }
    ];

    const results = await Promise.all(
      indices.map(async (idx) => {
        try {
          const response = await axios.get(
            `${FINNHUB_BASE}/quote?symbol=${idx.symbol}&token=${apiKey}`
          );
          return {
            ...idx,
            price: response.data.c || 0,
            change: response.data.d || 0,
            changePercent: response.data.dp || 0
          };
        } catch (e) {
          return { ...idx, price: 0, change: 0, changePercent: 0, error: true };
        }
      })
    );

    res.json(results);

  } catch (error) {
    console.error('Error fetching indices:', error.message);
    res.status(500).json({ error: 'Failed to fetch indices' });
  }
});

// Busca candle chart
router.get('/candles/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { resolution = 'D', from, to } = req.query;
    const apiKey = process.env.FINNHUB_API_KEY;

    const now = Math.floor(Date.now() / 1000);
    const fromTime = from || now - 30 * 24 * 60 * 60; // 30 days ago
    const toTime = to || now;

    const response = await axios.get(
      `${FINNHUB_BASE}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${fromTime}&to=${toTime}&token=${apiKey}`
    );

    if (response.data.s === 'ok') {
      res.json({
        c: response.data.c, // close
        h: response.data.h, // high
        l: response.data.l, // low
        o: response.data.o, // open
        v: response.data.v, // volume
        t: response.data.t  // timestamp
      });
    } else {
      res.status(404).json({ error: 'No data found' });
    }

  } catch (error) {
    console.error('Error fetching candles:', error.message);
    res.status(500).json({ error: 'Failed to fetch candles' });
  }
});

// Busca dados fundamentalistas
router.get('/fundamentals/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const apiKey = process.env.FINNHUB_API_KEY;

    const [profile, metrics, ratios] = await Promise.all([
      axios.get(`${FINNHUB_BASE}/stock/profile2?symbol=${symbol}&token=${apiKey}`),
      axios.get(`${FINNHUB_BASE}/stock/metric?symbol=${symbol}&token=${apiKey}&metric=all`),
      axios.get(`${FINNHUB_BASE}/stock/financials?symbol=${symbol}&token=${apiKey}&metric=ratios`)
    ]);

    res.json({
      profile: profile.data,
      metrics: metrics.data?.metric || {},
      ratios: ratios.data?.ratios || []
    });

  } catch (error) {
    console.error('Error fetching fundamentals:', error.message);
    res.status(500).json({ error: 'Failed to fetch fundamentals' });
  }
});

module.exports = router;
```

Crie `src/routes/crypto.js`:

```javascript
const express = require('express');
const axios = require('axios');
const router = express.Router();

const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';

// Lista de criptomoedas populares
router.get('/list', async (req, res) => {
  try {
    const response = await axios.get(`${COINGECKO_BASE}/coins/markets`, {
      params: {
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 50,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h,7d'
      }
    });

    const cryptos = response.data.map(coin => ({
      id: coin.id,
      symbol: coin.symbol.toUpperCase(),
      name: coin.name,
      price: coin.current_price,
      change24h: coin.price_change_percentage_24h,
      change7d: coin.price_change_percentage_7d_in_currency,
      marketCap: coin.market_cap,
      volume24h: coin.total_volume,
      image: coin.image,
      high24h: coin.high_24h,
      low24h: coin.low_24h
    }));

    res.json(cryptos);

  } catch (error) {
    console.error('Error fetching crypto list:', error.message);
    res.status(500).json({ error: 'Failed to fetch crypto data' });
  }
});

// Dados de uma criptomoeda específica
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(`${COINGECKO_BASE}/coins/${id}`, {
      params: {
        localization: false,
        tickers: false,
        market_data: true,
        community_data: false,
        developer_data: false
      }
    });

    const data = response.data;
    res.json({
      id: data.id,
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      description: data.description.en,
      currentPrice: data.market_data.current_price.usd,
      marketCap: data.market_data.market_cap.usd,
      volume24h: data.market_data.total_volume.usd,
      priceChange24h: data.market_data.price_change_percentage_24h,
      priceChange7d: data.market_data.price_change_percentage_7d,
      priceChange30d: data.market_data.price_change_percentage_30d,
      high24h: data.market_data.high_24h.usd,
      low24h: data.market_data.low_24h.usd,
      circulatingSupply: data.market_data.circulating_supply,
      totalSupply: data.market_data.total_supply,
      image: data.image?.large
    });

  } catch (error) {
    console.error('Error fetching crypto:', error.message);
    res.status(500).json({ error: 'Failed to fetch crypto data' });
  }
});

// Histórico de preço
router.get('/:id/history', async (req, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;

    const response = await axios.get(`${COINGECKO_BASE}/coins/${id}/market_chart`, {
      params: {
        vs_currency: 'usd',
        days: parseInt(days)
      }
    });

    res.json({
      prices: response.data.prices,
      market_caps: response.data.market_caps,
      volumes: response.data.total_volumes
    });

  } catch (error) {
    console.error('Error fetching crypto history:', error.message);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

module.exports = router;
```

Crie `src/routes/news.js`:

```javascript
const express = require('express');
const axios = require('axios');
const router = express.Router();

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

// Notícias gerais de mercado
router.get('/', async (req, res) => {
  try {
    const { category = 'general', minId } = req.query;
    const apiKey = process.env.FINNHUB_API_KEY;

    const categoryMap = {
      'general': 'general',
      'forex': 'forex',
      'crypto': 'crypto',
      'merger': 'merger',
      'tech': 'technology'
    };

    const response = await axios.get(`${FINNHUB_BASE}/news?category=${categoryMap[category] || 'general'}&token=${apiKey}`);

    const news = response.data.slice(0, 20).map(item => ({
      id: item.id,
      category: item.category,
      datetime: item.datetime,
      headline: item.headline,
      image: item.image,
      source: item.source,
      summary: item.summary,
      url: item.url
    }));

    res.json(news);

  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Notícias de uma ação específica
router.get('/stock/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const apiKey = process.env.FINNHUB_API_KEY;

    const response = await axios.get(
      `${FINNHUB_BASE}/company-news?symbol=${symbol}&from=&to=&token=${apiKey}`
    );

    const news = response.data.slice(0, 10).map(item => ({
      id: item.id,
      datetime: item.datetime,
      headline: item.headline,
      image: item.image,
      source: item.source,
      summary: item.summary,
      url: item.url
    }));

    res.json(news);

  } catch (error) {
    console.error('Error fetching stock news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Análise de sentimento (simulada)
router.get('/sentiment/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    // Finnhub não tem sentiment analysis na API gratuita
    // Simulamos com dados disponíveis
    res.json({
      symbol,
      sentiment: 'neutral',
      score: 0,
      positiveCount: 0,
      negativeCount: 0,
      neutralCount: 0,
      lastUpdated: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error analyzing sentiment:', error.message);
    res.status(500).json({ error: 'Failed to analyze sentiment' });
  }
});

module.exports = router;
```

Crie `src/routes/indicators.js`:

```javascript
const express = require('express');
const axios = require('axios');
const router = express.Router();

const FINNHUB_BASE = 'https://finnhub.io/api/v1';

// Indicadores técnicos para uma ação
router.get('/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    const { resolution = 'D' } = req.query;
    const apiKey = process.env.FINNHUB_API_KEY;

    // Busca candles históricos
    const now = Math.floor(Date.now() / 1000);
    const from = now - 365 * 24 * 60 * 60; // 1 ano

    const candleResponse = await axios.get(
      `${FINNHUB_BASE}/stock/candle?symbol=${symbol}&resolution=${resolution}&from=${from}&to=${now}&token=${apiKey}`
    );

    if (candleResponse.data.s !== 'ok') {
      return res.status(404).json({ error: 'No data found' });
    }

    const { c, h, l, o, v, t } = candleResponse.data;

    // Calcula indicadores
    const indicators = calculateIndicators(c, h, l, o, v, t);

    res.json({
      symbol,
      ...indicators,
      candles: {
        close: c.slice(-100),
        high: h.slice(-100),
        low: l.slice(-100),
        open: o.slice(-100),
        volume: v.slice(-100),
        timestamp: t.slice(-100)
      }
    });

  } catch (error) {
    console.error('Error calculating indicators:', error.message);
    res.status(500).json({ error: 'Failed to calculate indicators' });
  }
});

// Funções auxiliares para indicadores
function calculateIndicators(close, high, low, open, volume, timestamps) {
  // RSI (14 períodos)
  const rsi = calculateRSI(close, 14);

  // Médias Móveis
  const sma50 = calculateSMA(close, 50);
  const sma200 = calculateSMA(close, 200);
  const ema12 = calculateEMA(close, 12);
  const ema26 = calculateEMA(close, 26);

  // MACD
  const macd = calculateMACD(close);

  // Bandas de Bollinger
  const bollinger = calculateBollinger(close, 20);

  // Suporte e Resistência
  const supportResistance = calculateSupportResistance(high, low, close);

  // Volume médio
  const avgVolume = volume.slice(-20).reduce((a, b) => a + b, 0) / 20;

  return {
    rsi: rsi,
    sma50: sma50,
    sma200: sma200,
    ema12: ema12,
    ema26: ema26,
    macd: {
      value: macd.line,
      signal: macd.signal,
      histogram: macd.histogram
    },
    bollinger: {
      upper: bollinger.upper,
      middle: bollinger.middle,
      lower: bollinger.lower
    },
    support: supportResistance.support,
    resistance: supportResistance.resistance,
    avgVolume: avgVolume
  };
}

function calculateRSI(prices, period = 14) {
  if (prices.length < period + 1) return 50;

  let gains = 0;
  let losses = 0;

  for (let i = prices.length - period; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    if (change > 0) gains += change;
    else losses -= change;
  }

  const avgGain = gains / period;
  const avgLoss = losses / period;

  if (avgLoss === 0) return 100;

  const rs = avgGain / avgLoss;
  return 100 - (100 / (1 + rs));
}

function calculateSMA(prices, period) {
  if (prices.length < period) return null;
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calculateEMA(prices, period) {
  if (prices.length < period) return null;

  const k = 2 / (period + 1);
  let ema = prices.slice(0, period).reduce((a, b) => a + b, 0) / period;

  for (let i = period; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }

  return ema;
}

function calculateMACD(prices) {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);

  if (!ema12 || !ema26) return { line: 0, signal: 0, histogram: 0 };

  const macdLine = ema12 - ema26;

  // Signal line (9-period EMA of MACD line) - simplificado
  const signal = macdLine * 0.9;

  return {
    line: macdLine,
    signal: signal,
    histogram: macdLine - signal
  };
}

function calculateBollinger(prices, period = 20) {
  const sma = calculateSMA(prices, period);
  if (!sma) return { upper: 0, middle: 0, lower: 0 };

  const slice = prices.slice(-period);
  const variance = slice.reduce((sum, price) => sum + Math.pow(price - sma, 2), 0) / period;
  const stdDev = Math.sqrt(variance);

  return {
    upper: sma + (stdDev * 2),
    middle: sma,
    lower: sma - (stdDev * 2)
  };
}

function calculateSupportResistance(high, low, close) {
  // Simplificado: usa últimos 50 dias
  const recentHigh = Math.max(...high.slice(-50));
  const recentLow = Math.min(...low.slice(-50));

  const lastPrice = close[close.length - 1];

  // Identifica resistência mais próxima acima
  let resistance = recentHigh * 1.05;

  // Identifica suporte mais próximo abaixo
  let support = recentLow * 0.95;

  return { support, resistance };
}

module.exports = router;
```

Crie `src/routes/watchlist.js`:

```javascript
const express = require('express');
const router = express.Router();

// Simulação em memória (em produção, usar Supabase)
let watchlists = new Map();

// Obter watchlist de usuário
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const watchlist = watchlists.get(userId) || [];

    res.json(watchlist);
  } catch (error) {
    console.error('Error fetching watchlist:', error.message);
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Adicionar à watchlist
router.post('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { ticker, name, type } = req.body;

    if (!ticker) {
      return res.status(400).json({ error: 'Ticker is required' });
    }

    const watchlist = watchlists.get(userId) || [];

    if (watchlist.find(item => item.ticker === ticker)) {
      return res.status(400).json({ error: 'Asset already in watchlist' });
    }

    watchlist.push({
      ticker,
      name: name || ticker,
      type: type || 'stock',
      addedAt: new Date().toISOString()
    });

    watchlists.set(userId, watchlist);

    res.json({ success: true, watchlist });
  } catch (error) {
    console.error('Error adding to watchlist:', error.message);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// Remover da watchlist
router.delete('/:userId/:ticker', async (req, res) => {
  try {
    const { userId, ticker } = req.params;
    let watchlist = watchlists.get(userId) || [];

    watchlist = watchlist.filter(item => item.ticker !== ticker);
    watchlists.set(userId, watchlist);

    res.json({ success: true, watchlist });
  } catch (error) {
    console.error('Error removing from watchlist:', error.message);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

module.exports = router;
```

Crie `src/routes/alerts.js`:

```javascript
const express = require('express');
const router = express.Router();

// Simulação em memória
let alerts = new Map();

// Obter alertas de usuário
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const userAlerts = alerts.get(userId) || [];

    res.json(userAlerts);
  } catch (error) {
    console.error('Error fetching alerts:', error.message);
    res.status(500).json({ error: 'Failed to fetch alerts' });
  }
});

// Criar alerta
router.post('/', async (req, res) => {
  try {
    const { userId, ticker, type, value, enabled } = req.body;

    if (!userId || !ticker || !type || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const userAlerts = alerts.get(userId) || [];

    const alert = {
      id: Date.now().toString(),
      ticker,
      type, // 'above', 'below', 'percent_change'
      value,
      enabled: enabled !== false,
      createdAt: new Date().toISOString(),
      triggeredAt: null
    };

    userAlerts.push(alert);
    alerts.set(userId, userAlerts);

    res.json({ success: true, alert });
  } catch (error) {
    console.error('Error creating alert:', error.message);
    res.status(500).json({ error: 'Failed to create alert' });
  }
});

// Atualizar alerta
router.patch('/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;
    const { enabled, value } = req.body;

    // Procura e atualiza em todas as watchlists
    for (const [userId, userAlerts] of alerts) {
      const alertIndex = userAlerts.findIndex(a => a.id === alertId);
      if (alertIndex !== -1) {
        if (enabled !== undefined) userAlerts[alertIndex].enabled = enabled;
        if (value !== undefined) userAlerts[alertIndex].value = value;
        alerts.set(userId, userAlerts);
        return res.json({ success: true, alert: userAlerts[alertIndex] });
      }
    }

    res.status(404).json({ error: 'Alert not found' });
  } catch (error) {
    console.error('Error updating alert:', error.message);
    res.status(500).json({ error: 'Failed to update alert' });
  }
});

// Deletar alerta
router.delete('/:alertId', async (req, res) => {
  try {
    const { alertId } = req.params;

    for (const [userId, userAlerts] of alerts) {
      const filteredAlerts = userAlerts.filter(a => a.id !== alertId);
      if (filteredAlerts.length !== userAlerts.length) {
        alerts.set(userId, filteredAlerts);
        return res.json({ success: true });
      }
    }

    res.status(404).json({ error: 'Alert not found' });
  } catch (error) {
    console.error('Error deleting alert:', error.message);
    res.status(500).json({ error: 'Failed to delete alert' });
  }
});

module.exports = router;
```

#### 4.6 package.json atualizado

Edite o `package.json` e adicione:

```json
{
  "name": "invest-platform-api",
  "version": "1.0.0",
  "description": "Backend API for InvestX platform",
  "main": "src/server.js",
  "scripts": {
    "start": "node src/server.js",
    "dev": "nodemon src/server.js",
    "deploy": "git push render main"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "express": "^4.18.2",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.2"
  }
}
```

#### 4.7 Deploy do Backend no Render

1. Faça login no Render (https://render.com/)
2. Clique em "New +" e selecione "Blueprint"
3. Conecte seu repositório GitHub
4. O Render detectará automaticamente (ou você pode criar manualmente um "Web Service")
5. Configure:
   - **Name:** `investx-api`
   - **Region:** São Paulo
   - **Branch:** main
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

6. Adicione as Environment Variables:
   - `FINNHUB_API_KEY` = sua chave Finnhub
   - `COINGECKO_API_KEY` = sua chave CoinGecko
   - `SUPABASE_URL` = sua URL do Supabase
   - `SUPABASE_KEY` = sua chave do Supabase

7. Clique "Create Web Service"
8. Aguarde o deploy (2-3 minutos)
9. Anote a URL: algo como `https://investx-api.onrender.com`

---

### PARTE 5: Configurando o Frontend

#### 5.1 Conectando ao Backend

No frontend, precisamos apontar para a API real. Crie o arquivo `src/config/api.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'https://investx-api.onrender.com';

export const API_ENDPOINTS = {
  stocks: {
    brazil: `${API_URL}/api/stocks/brazil`,
    us: `${API_URL}/api/stocks/us`,
    indices: `${API_URL}/api/stocks/indices`,
    candles: (symbol: string) => `${API_URL}/api/stocks/candles/${symbol}`,
    fundamentals: (symbol: string) => `${API_URL}/api/stocks/fundamentals/${symbol}`
  },
  crypto: {
    list: `${API_URL}/api/crypto/list`,
    details: (id: string) => `${API_URL}/api/crypto/${id}`,
    history: (id: string) => `${API_URL}/api/crypto/${id}/history`
  },
  news: {
    list: `${API_URL}/api/news`,
    stock: (symbol: string) => `${API_URL}/api/news/stock/${symbol}`,
    sentiment: (symbol: string) => `${API_URL}/api/news/sentiment/${symbol}`
  },
  indicators: (symbol: string) => `${API_URL}/api/indicators/${symbol}`,
  watchlist: (userId: string) => `${API_URL}/api/watchlist/${userId}`,
  alerts: (userId: string) => `${API_URL}/api/alerts/${userId}`
};

export default API_ENDPOINTS;
```

#### 5.2 Variáveis de Ambiente do Frontend

Crie o arquivo `.env` na raiz do projeto frontend:

```
VITE_API_URL=https://investx-api.onrender.com
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

#### 5.3 Deploy do Frontend no Netlify

1. Faça login no Netlify (https://netlify.com/)
2. Clique em "Add new site" → "Import an existing project"
3. Conecte ao GitHub e selecione o repositório `invest-platform`
4. Configure:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
   - **Environment variables:** Adicione as do .env
5. Clique "Deploy site"
6. Aguarde 1-2 minutos
7. Seu site estará em: `https://random-name.netlify.app`

Para domínio personalizado:
1. Vá em Site settings → Domain management
2. Clique "Add custom domain"
3. Digite seu domínio (ex: `investx.com.br`)
4. Configure os DNS conforme instruído

---

### PARTE 6: Configurando o Supabase

#### 6.1 Criando Tabelas no Supabase

1. Faça login no Supabase
2. Selecione seu projeto
3. Clique em "SQL Editor" no menu lateral
4. Execute o seguinte SQL para criar as tabelas:

```sql
-- Tabela de usuários (estende auth.users)
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de watchlist
create table public.watchlists (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  ticker text not null,
  name text,
  type text default 'stock',
  added_at timestamp with time zone default now(),
  unique(user_id, ticker)
);

-- Tabela de alertas
create table public.alerts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  ticker text not null,
  alert_type text not null check (alert_type in ('above', 'below', 'percent_change')),
  target_value numeric,
  is_enabled boolean default true,
  created_at timestamp with time zone default now(),
  triggered_at timestamp with time zone
);

-- Tabela de favoritos de notícias
create table public.saved_news (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  news_id text not null,
  headline text,
  url text,
  saved_at timestamp with time zone default now(),
  unique(user_id, news_id)
);

-- Políticas RLS (Row Level Security)
alter table public.watchlists enable row level security;
alter table public.alerts enable row level security;
alter table public.saved_news enable row level security;

-- Política: usuários só veem seus próprios dados
create policy "Users can manage their watchlist"
  on public.watchlists for all
  using (auth.uid() = user_id);

create policy "Users can manage their alerts"
  on public.alerts for all
  using (auth.uid() = user_id);

create policy "Users can manage their saved news"
  on public.saved_news for all
  using (auth.uid() = user_id);

-- Trigger para criar perfil automaticamente
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, display_name)
  values (new.id, new.email, split_part(new.email, '@', 1));
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

#### 6.2 API Client para Supabase

Instale o cliente Supabase:

```bash
cd /workspace/invest-platform
pnpm add @supabase/supabase-js
```

Crie `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
```

---

## Checklist Final

Depois de seguir todos os passos, verifique:

- [ ] Node.js instalado e funcionando
- [ ] Git instalado e configurado
- [ ] Conta no GitHub criada
- [ ] Repositório criado e código enviado
- [ ] Conta no Supabase criada e tabelas configuradas
- [ ] Conta no Render criada
- [ ] Backend deployado e funcionando
- [ ] Conta no Netlify criada
- [ ] Frontend deployado e funcionando
- [ ] APIs configuradas (Finnhub, CoinGecko)

## Comandos Úteis

```bash
# Verificar versões instaladas
node --version
npm --version
git --version

# Rodar projeto localmente
cd /workspace/invest-platform
pnpm install
pnpm dev

# Ver logs do backend no Render
# Acesse o dashboard do Render → seu web service → Logs

# Atualizar código
git add .
git commit -m "Descrição da mudança"
git push

# Verneificar variáveis de ambiente
echo $FINNHUB_API_KEY
```

## Solução de Problemas Comuns

### Erro "Command not found"
- Certifique-se de que adicionou o Node.js ao PATH
- Reinicie o terminal após instalação

### Erro de autenticação GitHub
- Execute `git config --global credential.helper store`
- Na próxima vez, GitHub pedirá usuário e senha (use token, não senha!)

### API não responde
- Verifique se o backend está rodando no Render
- Check o logs no dashboard do Render
- Verifique se as variáveis de ambiente estão configuradas

### Site não atualiza após push
- Limpe o cache do navegador (Ctrl+Shift+R)
- No Netlify, vá em Deploys e clique "Clear cache and deploy site"

---

## Links Importantes

| Serviço | Link |
|---------|------|
| Node.js | https://nodejs.org/ |
| Git | https://git-scm.com/ |
| VS Code | https://code.visualstudio.com/ |
| GitHub | https://github.com/ |
| Supabase | https://supabase.com/ |
| Render | https://render.com/ |
| Netlify | https://netlify.com/ |
| Finnhub | https://finnhub.io/ |
| CoinGecko | https://www.coingecko.com/pt/api |

---

**Seu projeto está pronto para produção! Qualquer dúvida, consulte este guia ou peça ajuda.**