import { useState, useEffect } from 'react';
import {
  Newspaper,
  Search,
  Tag,
  TrendingUp,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { cn, getRelativeTime } from '@/lib/utils';
import { mockData } from '@/services/marketData';
import { Layout } from '@/components/layout/Layout';
import API_ENDPOINTS from '@/config/api';
import { NewsItem } from '@/types';

type FeedMode = 'live' | 'demo';

function NewsCard({ news, featured = false }: { news: NewsItem; featured?: boolean }) {
  return (
    <a
      href={news.url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        'block bg-slate-800/40 hover:bg-slate-800/70 rounded-xl overflow-hidden border border-slate-700/40 transition-all group',
        featured && 'md:col-span-2 md:row-span-2',
        'hover:border-cyan-500/30 hover:shadow-lg hover:shadow-cyan-500/5'
      )}
    >
      {news.image && (
        <div className="bg-slate-800 overflow-hidden aspect-video">
          <img src={news.image} alt={news.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className={cn('p-4', featured && 'p-6')}>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="text-xs text-slate-400 bg-slate-700/50 px-2 py-0.5 rounded font-medium">{news.source}</span>
          <span className="text-xs text-slate-500">{getRelativeTime(news.publishedAt)}</span>
          {news.sentiment && (
            <span className={cn(
              'text-xs px-2 py-0.5 rounded font-medium',
              news.sentiment === 'positive' ? 'bg-emerald-500/20 text-emerald-400' :
              news.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
              'bg-amber-500/20 text-amber-400'
            )}>
              {news.sentiment === 'positive' ? '↑ Alta' : news.sentiment === 'negative' ? '↓ Baixa' : '→ Neutro'}
            </span>
          )}
        </div>
        <h3 className={cn('font-semibold text-white group-hover:text-cyan-300 transition-colors', featured ? 'text-xl mb-3' : 'text-base mb-2')}>
          {news.title}
        </h3>
        <p className={cn('text-sm text-slate-400', featured ? 'line-clamp-3' : 'line-clamp-2')}>{news.summary}</p>
        {news.tags && news.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            {news.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded flex items-center gap-1">
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </a>
  );
}

function CategoryFilter({ selected, onSelect }: { selected: string; onSelect: (cat: string) => void }) {
  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'brasil', label: 'Brasil' },
    { id: 'global', label: 'Global' },
    { id: 'crypto', label: 'Cripto' },
    { id: 'tech', label: 'Tech' },
    { id: 'commodities', label: 'Commodities' },
  ];

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelect(cat.id)}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all',
            selected === cat.id ? 'bg-primary/20 text-primary border border-primary/30' : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
          )}
        >
          {cat.label}
        </button>
      ))}
    </div>
  );
}

export default function News() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedMode, setFeedMode] = useState<FeedMode>('demo');
  const [checkedAt, setCheckedAt] = useState('');

  useEffect(() => {
    const loadNews = async () => {
      setLoading(true);
      setCheckedAt(new Date().toISOString());
      try {
        const response = await fetch(API_ENDPOINTS.news.list);
        if (!response.ok) throw new Error('News API unavailable');
        const data = await response.json();
        if (!Array.isArray(data) || data.length === 0) throw new Error('Empty news API response');
        setNews(data.slice(0, 20));
        setFeedMode('live');
      } catch (e) {
        setNews(mockData.news);
        setFeedMode('demo');
      } finally {
        setLoading(false);
      }
    };
    loadNews();
  }, []);

  const filteredNews = news.filter((item) => {
    if (category !== 'all') {
      const matchesCategory = item.tags?.some((tag) => tag.toLowerCase().includes(category));
      if (!matchesCategory) return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.tags?.some((t) => t.toLowerCase().includes(q));
    }
    return true;
  });

  return (
    <Layout>
      <div className="mb-6 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <h1 className="text-3xl lg:text-4xl font-black text-white flex items-center gap-3">
              <Newspaper className="w-8 h-8 text-cyan-400" />
              Notícias do Mercado
            </h1>
            <p className="text-slate-300 mt-2">Última hora sobre finanças, economia e investimentos, com indicação clara de fonte ao vivo ou modo demo.</p>
          </div>
          <div className={cn('rounded-2xl border p-4 min-w-[260px]', feedMode === 'live' ? 'border-emerald-500/20 bg-emerald-500/10' : 'border-amber-500/20 bg-amber-500/10')}>
            <div className="flex items-center gap-2 mb-1">
              {feedMode === 'live' ? <Wifi className="w-5 h-5 text-emerald-400" /> : <WifiOff className="w-5 h-5 text-amber-400" />}
              <p className="font-bold text-white">{feedMode === 'live' ? 'Feed ao vivo' : 'Modo demo'}</p>
            </div>
            <p className="text-xs text-slate-300">
              {feedMode === 'live' ? 'Dados recebidos do backend /api/news.' : 'Backend indisponível ou sem itens. Usando notícias de demonstração.'}
            </p>
            {checkedAt && <p className="text-[11px] text-slate-500 mt-2">Checado em {new Date(checkedAt).toLocaleString('pt-BR')}</p>}
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar notícias..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 transition-colors"
          />
        </div>
      </div>

      <div className="mb-6">
        <CategoryFilter selected={category} onSelect={setCategory} />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => <div key={i} className="bg-slate-800/40 rounded-xl h-64 skeleton" />)}
        </div>
      ) : filteredNews.length === 0 ? (
        <div className="text-center py-12 bg-slate-800/40 rounded-xl border border-slate-700/40">
          <Newspaper className="w-12 h-12 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400">Nenhuma notícia encontrada</p>
          <p className="text-sm text-slate-500 mt-2">Tente ajustar os filtros</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNews.map((item, index) => <NewsCard key={item.id} news={item} featured={index === 0} />)}
        </div>
      )}

      <div className="mt-8 bg-slate-800/40 rounded-xl p-6 border border-slate-700/40">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-400" />
          Resumo do Dia
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">Ibovespa</p>
            <p className="text-xl font-bold text-white">+1.46%</p>
            <p className="text-xs text-emerald-400 mt-1">↑ Alta</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">Dólar</p>
            <p className="text-xl font-bold text-white">R$ 5.02</p>
            <p className="text-xs text-red-400 mt-1">↓ Queda</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-xs text-slate-400 mb-2">Bitcoin</p>
            <p className="text-xl font-bold text-white">+2.73%</p>
            <p className="text-xs text-emerald-400 mt-1">↑ Forte Alta</p>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        <span className="text-xs text-slate-500">Fontes:</span>
        {['Reuters', 'Bloomberg', 'CoinDesk', 'Estadão', 'Valor'].map((source) => (
          <span key={source} className="text-xs px-2 py-1 bg-slate-800/50 text-slate-400 rounded">{source}</span>
        ))}
      </div>
    </Layout>
  );
}
