import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  Shield,
  Target,
  TrendingUp,
  TrendingDown,
  ChevronRight,
  Award,
  Star,
  Info,
  Filter,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice, formatPercent, getScoreColor, getScoreBgColor, getGradeFromScore } from '@/lib/utils';
import { fetchGrahamPicks, mockData } from '@/services/marketData';
import { Layout } from '@/components/layout/Layout';
import { Asset, GrahamScore } from '@/types';

function GrahamCard({ pick, rank }: { pick: any; rank: number }) {
  const scoreColor = getScoreColor(pick.score);
  const bgColor = getScoreBgColor(pick.score);
  const grade = getGradeFromScore(pick.score);

  return (
    <Link
      to={`/ativo/${pick.ticker}`}
      className="bg-slate-800/40 hover:bg-slate-800/70 rounded-xl p-4 border border-slate-700/40 hover:border-emerald-500/30 transition-all group"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-lg font-black text-slate-600">#{rank}</span>
          <div>
            <p className="font-mono font-bold text-cyan-400 group-hover:text-cyan-300 text-lg">
              {pick.ticker}
            </p>
            <p className="text-xs text-slate-400">{pick.name}</p>
          </div>
        </div>
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          pick.score >= 80 ? 'bg-emerald-500/20' : pick.score >= 60 ? 'bg-cyan-500/20' : 'bg-amber-500/20'
        )}>
          <span className={cn('text-2xl font-black', scoreColor)}>
            {pick.score}
          </span>
        </div>
      </div>

      {/* Score Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-slate-400">Graham Score</span>
          <span className={cn('font-bold px-2 py-0.5 rounded', bgColor, scoreColor)}>{grade}</span>
        </div>
        <div className="w-full bg-slate-700/50 rounded-full h-2">
          <div
            className={cn(
              'h-2 rounded-full transition-all',
              pick.score >= 80 ? 'bg-emerald-400' : pick.score >= 60 ? 'bg-cyan-400' : 'bg-amber-400'
            )}
            style={{ width: `${Math.min(100, pick.score)}%` }}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-slate-900/50 rounded-lg p-2">
          <p className="text-[10px] text-slate-500">P/L</p>
          <p className={cn('text-sm font-bold font-mono', pick.pe <= 15 ? 'text-emerald-400' : 'text-slate-300')}>
            {pick.pe?.toFixed(1)}x
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2">
          <p className="text-[10px] text-slate-500">P/VP</p>
          <p className={cn('text-sm font-bold font-mono', pick.pb <= 1.5 ? 'text-emerald-400' : 'text-slate-300')}>
            {pick.pb?.toFixed(2)}x
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2">
          <p className="text-[10px] text-slate-500">DY</p>
          <p className={cn('text-sm font-bold font-mono', pick.dy >= 6 ? 'text-emerald-400' : 'text-slate-300')}>
            {pick.dy?.toFixed(1)}%
          </p>
        </div>
        <div className="bg-slate-900/50 rounded-lg p-2">
          <p className="text-[10px] text-slate-500">ROE</p>
          <p className={cn('text-sm font-bold font-mono', pick.roe >= 15 ? 'text-emerald-400' : 'text-slate-300')}>
            {pick.roe?.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Verdict */}
      <div className="mt-4 pt-3 border-t border-slate-700/30">
        <div className="flex items-center justify-between text-xs">
          <span className={cn(
            'px-2 py-1 rounded font-medium',
            pick.score >= 80 ? 'bg-emerald-500/20 text-emerald-400' :
            pick.score >= 60 ? 'bg-cyan-500/20 text-cyan-400' :
            'bg-amber-500/20 text-amber-400'
          )}>
            {pick.score >= 80 ? 'Excelente' : pick.score >= 60 ? 'Bom' : 'Regular'}
          </span>
          <span className="text-slate-500 flex items-center gap-1">
            <Info className="w-3 h-3" />
            Ver detalhes
          </span>
        </div>
      </div>
    </Link>
  );
}

function AnalysisCard({ title, description, icon: Icon, color, to }: { title: string; description: string; icon: any; color: string; to: string }) {
  return (
    <Link
      to={to}
      className="bg-slate-800/40 hover:bg-slate-800/70 rounded-xl p-6 border border-slate-700/40 hover:border-primary/30 transition-all group"
    >
      <div className="flex items-start gap-4">
        <div className={cn(
          'w-12 h-12 rounded-xl flex items-center justify-center',
          color === 'cyan' && 'bg-cyan-500/20',
          color === 'emerald' && 'bg-emerald-500/20',
          color === 'amber' && 'bg-amber-500/20',
          color === 'purple' && 'bg-purple-500/20',
        )}>
          <Icon className={cn(
            'w-6 h-6',
            color === 'cyan' && 'text-cyan-400',
            color === 'emerald' && 'text-emerald-400',
            color === 'amber' && 'text-amber-400',
            color === 'purple' && 'text-purple-400',
          )} />
        </div>
        <div className="flex-1">
          <h3 className="font-bold text-white group-hover:text-primary transition-colors mb-1">
            {title}
          </h3>
          <p className="text-sm text-slate-400">{description}</p>
        </div>
        <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-white transition-colors" />
      </div>
    </Link>
  );
}

function ValuationCard({ asset }: { asset: Asset }) {
  return (
    <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
      <div className="flex items-center justify-between mb-3">
        <span className="font-mono font-bold text-cyan-400">{asset.ticker}</span>
        <span className="text-xs text-slate-400">{asset.name}</span>
      </div>
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-xs text-slate-400">Preço Atual</span>
          <span className="text-sm font-mono text-white">{formatPrice(asset.price, asset.currency)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-400">Valor Intrínseco</span>
          <span className="text-sm font-mono text-emerald-400">R$ 45.50</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-400">Margem de Segurança</span>
          <span className="text-sm font-mono text-emerald-400">+18%</span>
        </div>
        <div className="flex justify-between">
          <span className="text-xs text-slate-400">Upside</span>
          <span className="text-sm font-mono text-cyan-400">22%</span>
        </div>
      </div>
    </div>
  );
}

export default function Analyses() {
  const [grahamPicks, setGrahamPicks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const picks = await fetchGrahamPicks();
        setGrahamPicks(picks);
      } catch (e) {
        setGrahamPicks(mockData.grahamPicks);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  return (
    <Layout>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-medium">
            <Shield className="w-3 h-3 inline mr-1" />
            Graham & Doddsville
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <BarChart3 className="w-6 h-6 text-cyan-400" />
          Análises Especializadas
        </h1>
        <p className="text-slate-400 mt-1">
          Análises fundamentalistas, valuation e métricas avançadas
        </p>
      </div>

      {/* Analysis Types */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <AnalysisCard
          title="Graham & Doddsville"
          description="Os melhores ativos por margem de segurança, P/L e solidez financeira"
          icon={Shield}
          color="emerald"
          to="/graham"
        />
        <AnalysisCard
          title=" valuation DCF"
          description="Análise de fluxo de caixa descontado e preço justo"
          icon={Target}
          color="cyan"
          to="/valuation"
        />
        <AnalysisCard
          title="Análise Técnica"
          description="Indicadores, suportes, resistências e padrões gráficos"
          icon={TrendingUp}
          color="purple"
          to="/tecnica"
        />
        <AnalysisCard
          title="Comparador de Ativos"
          description="Compare métricas e fundamentos lado a lado"
          icon={BarChart3}
          color="amber"
          to="/comparar"
        />
      </div>

      {/* Graham Top Picks */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full font-medium">
                <Award className="w-3 h-3 inline mr-1" />
                Ranking
              </span>
            </div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Top Picks Graham
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Baseado nos critérios de Benjamin Graham para investimentos defensivos
            </p>
          </div>
          <Link
            to="/graham"
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            Ver ranking completo <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Criteria Explanation */}
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40 mb-6">
          <h3 className="text-sm font-semibold text-white mb-3">Critérios de Avaliação</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">P/L</p>
              <p className="text-sm font-semibold text-emerald-400">Menor que 15x</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">P/VP</p>
              <p className="text-sm font-semibold text-emerald-400">Menor que 1.5x</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">DY</p>
              <p className="text-sm font-semibold text-emerald-400">Acima de 6%</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3">
              <p className="text-xs text-slate-400 mb-1">ROE</p>
              <p className="text-sm font-semibold text-emerald-400">Acima de 15%</p>
            </div>
          </div>
        </div>

        {/* Picks Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-slate-800/40 rounded-xl h-64 skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {grahamPicks.slice(0, 8).map((pick, index) => (
              <GrahamCard key={pick.ticker} pick={pick} rank={index + 1} />
            ))}
          </div>
        )}
      </section>

      {/* Valuation Preview */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Target className="w-5 h-5 text-cyan-400" />
              valuation Rápido
            </h2>
            <p className="text-sm text-slate-400 mt-1">
              Preço justo e margem de segurança calculados
            </p>
          </div>
          <Link
            to="/valuation"
            className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            Ver todos <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {mockData.stocks.br.slice(0, 4).map((asset) => (
            <ValuationCard key={asset.ticker} asset={asset} />
          ))}
        </div>
      </section>

      {/* Educational Section */}
      <section className="bg-gradient-to-r from-cyan-900/20 to-transparent rounded-xl p-6 border border-cyan-500/20">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-cyan-500/20 rounded-xl flex items-center justify-center">
            <Info className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="font-bold text-white mb-2">Sobre a Análise de Graham</h3>
            <p className="text-sm text-slate-300 mb-4">
              Benjamin Graham, mentor de Warren Buffett, desenvolveu um sistema de análise de ações
              focado em investimentos defensivos. O objetivo é encontrar empresas sólidas
              negociadas abaixo de seu valor intrínseco, garantindo margem de segurança.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">P/L Máximo 15x</span>
              <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">P/VP Máximo 1.5x</span>
              <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">DY Mínimo 6%</span>
              <span className="text-xs px-2 py-1 bg-cyan-500/20 text-cyan-400 rounded">ROE Mínimo 15%</span>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}