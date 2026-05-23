import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  Plus,
  TrendingUp,
  TrendingDown,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Search,
  ChevronRight,
  Clock,
  DollarSign,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatPrice } from '@/lib/utils';
import { mockData } from '@/services/marketData';
import { useAppStore } from '@/hooks/useStore';
import { Layout } from '@/components/layout/Layout';

interface Alert {
  id: string;
  ticker: string;
  name: string;
  type: 'price' | 'percent' | 'rsi' | 'macd';
  condition: 'above' | 'below';
  targetValue: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: string;
}

const demoAlerts: Alert[] = [
  { id: '1', ticker: 'PETR4', name: 'Petrobras PN', type: 'price', condition: 'above', targetValue: 40.00, currentPrice: 38.52, isActive: true, createdAt: '2024-01-15' },
  { id: '2', ticker: 'BTC', name: 'Bitcoin', type: 'price', condition: 'above', targetValue: 70000, currentPrice: 69542, isActive: true, createdAt: '2024-01-14' },
  { id: '3', ticker: 'VALE3', name: 'Vale ON', type: 'percent', condition: 'below', targetValue: 5, currentPrice: 68.90, isActive: true, createdAt: '2024-01-13' },
  { id: '4', ticker: 'AAPL', name: 'Apple Inc.', type: 'price', condition: 'above', targetValue: 180, currentPrice: 178.72, isActive: false, createdAt: '2024-01-10' },
];

function AlertCard({ alert, onToggle, onDelete }: { alert: Alert; onToggle: (id: string) => void; onDelete: (id: string) => void }) {
  const isTriggered = alert.condition === 'above'
    ? alert.currentPrice >= alert.targetValue
    : alert.currentPrice <= alert.targetValue;

  return (
    <div className={cn(
      'bg-slate-800/40 rounded-xl p-4 border transition-all',
      alert.isActive ? 'border-slate-700/40' : 'border-slate-700/20 opacity-60'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center">
            <span className="text-xs font-bold text-cyan-400">{alert.ticker.slice(0, 3)}</span>
          </div>
          <div>
            <p className="font-mono font-bold text-cyan-400">{alert.ticker}</p>
            <p className="text-xs text-slate-400">{alert.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {alert.isActive && isTriggered && (
            <span className="text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded animate-pulse">
              Disparado!
            </span>
          )}
          <button
            onClick={() => onToggle(alert.id)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              alert.isActive
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-slate-700/50 text-slate-400 hover:text-white'
            )}
          >
            {alert.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          </button>
          <button
            onClick={() => onDelete(alert.id)}
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Alert Details */}
      <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-xs px-2 py-0.5 rounded',
              alert.type === 'price' ? 'bg-blue-500/20 text-blue-400' :
              alert.type === 'percent' ? 'bg-purple-500/20 text-purple-400' :
              alert.type === 'rsi' ? 'bg-amber-500/20 text-amber-400' :
              'bg-cyan-500/20 text-cyan-400'
            )}>
              {alert.type.toUpperCase()}
            </span>
            <span className="text-slate-400">
              {alert.condition === 'above' ? 'Acima de' : 'Abaixo de'}
            </span>
          </div>
          <span className="font-mono font-bold text-white">
            {alert.type === 'percent' ? `${alert.targetValue}%` : formatPrice(alert.targetValue, alert.ticker.includes('BTC') || alert.ticker.includes('ETH') ? 'USD' : 'BRL')}
          </span>
        </div>
      </div>

      {/* Current Price */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Preço atual:</span>
        <span className="font-mono text-slate-300">{formatPrice(alert.currentPrice, alert.ticker.includes('BTC') || alert.ticker.includes('ETH') ? 'USD' : 'BRL')}</span>
      </div>
    </div>
  );
}

export default function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>(demoAlerts);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggle = (id: string) => {
    setAlerts(alerts.map(a =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    ));
  };

  const handleDelete = (id: string) => {
    setAlerts(alerts.filter(a => a.id !== id));
  };

  const activeCount = alerts.filter(a => a.isActive).length;
  const triggeredCount = alerts.filter(a => a.isActive && (
    (a.condition === 'above' && a.currentPrice >= a.targetValue) ||
    (a.condition === 'below' && a.currentPrice <= a.targetValue)
  )).length;

  return (
    <Layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bell className="w-6 h-6 text-amber-400" />
            Meus Alertas
          </h1>
          <p className="text-slate-400 mt-1">
            Configure notificações para seus ativos favoritos
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Alerta
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
          <p className="text-xs text-slate-400 mb-1">Total de Alertas</p>
          <p className="text-2xl font-bold text-white">{alerts.length}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
          <p className="text-xs text-slate-400 mb-1">Ativos</p>
          <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
          <p className="text-xs text-slate-400 mb-1">Disparados</p>
          <p className="text-2xl font-bold text-amber-400">{triggeredCount}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
          <p className="text-xs text-slate-400 mb-1">Inativos</p>
          <p className="text-2xl font-bold text-slate-400">{alerts.length - activeCount}</p>
        </div>
      </div>

      {/* Alert Types */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link
          to="/alertas-preco"
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <DollarSign className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-slate-300">Alertas de Preço</span>
        </Link>
        <Link
          to="/alertas-tecnicos"
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Activity className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-slate-300">Alertas Técnicos</span>
        </Link>
        <Link
          to="/alertas-dividendos"
          className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-sm text-slate-300">Alertas de Dividendos</span>
        </Link>
      </div>

      {/* Alerts List */}
      {alerts.length === 0 ? (
        <div className="bg-slate-800/40 rounded-xl border border-slate-700/40 p-12 text-center">
          <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum alerta configurado</h3>
          <p className="text-slate-400 mb-6">
            Crie alertas para receber notificações sobre variações de preço
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4 inline mr-2" />
            Criar Primeiro Alerta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {alerts.map((alert) => (
            <AlertCard
              key={alert.id}
              alert={alert}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-700/50 w-full max-w-lg animate-fade-in">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">Criar Novo Alerta</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              {/* Asset Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Ativo</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar ativo..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
                    autoFocus
                  />
                </div>
              </div>

              {/* Alert Type */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Tipo de Alerta</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'price', label: 'Preço', icon: DollarSign, color: 'blue' },
                    { id: 'percent', label: 'Variação %', icon: Activity, color: 'purple' },
                  ].map((type) => (
                    <button
                      key={type.id}
                      className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl hover:border-primary/50 transition-colors flex items-center gap-2"
                    >
                      <type.icon className={cn(
                        'w-4 h-4',
                        type.color === 'blue' ? 'text-blue-400' : 'text-purple-400'
                      )} />
                      <span className="text-sm text-slate-300">{type.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Condição</label>
                <div className="grid grid-cols-2 gap-2">
                  <button className="p-3 bg-emerald-500/20 border border-emerald-500/30 rounded-xl text-emerald-400 font-medium flex items-center justify-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Acima de
                  </button>
                  <button className="p-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white flex items-center justify-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Abaixo de
                  </button>
                </div>
              </div>

              {/* Target Value */}
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Valor Alvo</label>
                <input
                  type="number"
                  placeholder="Ex: 40.00"
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 font-mono"
                />
              </div>

              {/* Submit */}
              <button className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium">
                Criar Alerta
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}