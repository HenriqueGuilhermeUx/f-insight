import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  Bell,
  DollarSign,
  Loader2,
  Plus,
  Search,
  Trash2,
  TrendingDown,
  TrendingUp,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatPrice } from '@/lib/utils';
import { mockData } from '@/services/marketData';
import { createAlert, deleteAlert, fetchAlerts, type RemoteAlert, updateAlert } from '@/services/userPreferencesApi';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';

interface AlertView {
  id: string;
  ticker: string;
  name: string;
  type: 'price' | 'percent';
  condition: 'above' | 'below';
  targetValue: number;
  currentPrice: number;
  isActive: boolean;
  createdAt: string;
}

const allAssets = [
  ...mockData.stocks.br,
  ...mockData.stocks.us,
  ...mockData.crypto,
  ...mockData.etfs,
  ...mockData.fiis,
];

function assetByTicker(ticker: string) {
  return allAssets.find((asset) => asset.ticker.toUpperCase() === ticker.toUpperCase());
}

function fromRemote(alert: RemoteAlert): AlertView {
  const [typeRaw, conditionRaw] = String(alert.type || 'price_above').split('_');
  const asset = assetByTicker(alert.ticker);
  return {
    id: alert.id,
    ticker: alert.ticker,
    name: asset?.name || alert.ticker,
    type: typeRaw === 'percent' ? 'percent' : 'price',
    condition: conditionRaw === 'below' ? 'below' : 'above',
    targetValue: Number(alert.value),
    currentPrice: asset?.price || 0,
    isActive: alert.enabled !== false,
    createdAt: alert.createdAt,
  };
}

function AlertCard({ alert, onToggle, onDelete, busy }: {
  alert: AlertView;
  onToggle: (alert: AlertView) => void;
  onDelete: (alert: AlertView) => void;
  busy: boolean;
}) {
  const isTriggered = alert.currentPrice > 0 && (
    alert.condition === 'above'
      ? alert.currentPrice >= alert.targetValue
      : alert.currentPrice <= alert.targetValue
  );

  return (
    <div className={cn(
      'bg-slate-800/40 rounded-xl p-4 border transition-all',
      alert.isActive ? 'border-slate-700/40' : 'border-slate-700/20 opacity-60',
    )}>
      <div className="flex items-start justify-between mb-3 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-slate-700/50 rounded-lg flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-cyan-400">{alert.ticker.slice(0, 3)}</span>
          </div>
          <div className="min-w-0">
            <p className="font-mono font-bold text-cyan-400">{alert.ticker}</p>
            <p className="text-xs text-slate-400 truncate">{alert.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {alert.isActive && isTriggered && (
            <span className="hidden sm:inline text-xs px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded">Condição atingida</span>
          )}
          <button
            disabled={busy}
            onClick={() => onToggle(alert)}
            aria-label={alert.isActive ? 'Desativar alerta' : 'Ativar alerta'}
            className={cn(
              'p-2 rounded-lg transition-colors disabled:opacity-50',
              alert.isActive
                ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30'
                : 'bg-slate-700/50 text-slate-400 hover:text-white',
            )}
          >
            {alert.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
          </button>
          <button
            disabled={busy}
            onClick={() => onDelete(alert)}
            aria-label="Excluir alerta"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="bg-slate-900/50 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between gap-3 text-sm">
          <div className="flex items-center gap-2">
            <span className={cn(
              'text-xs px-2 py-0.5 rounded',
              alert.type === 'price' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400',
            )}>
              {alert.type === 'price' ? 'PREÇO' : 'VARIAÇÃO %'}
            </span>
            <span className="text-slate-400">{alert.condition === 'above' ? 'Acima de' : 'Abaixo de'}</span>
          </div>
          <span className="font-mono font-bold text-white">
            {alert.type === 'percent'
              ? `${alert.targetValue}%`
              : formatPrice(alert.targetValue, alert.ticker.includes('BTC') || alert.ticker.includes('ETH') ? 'USD' : 'BRL')}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500">Preço de referência:</span>
        <span className="font-mono text-slate-300">
          {alert.currentPrice > 0
            ? formatPrice(alert.currentPrice, alert.ticker.includes('BTC') || alert.ticker.includes('ETH') ? 'USD' : 'BRL')
            : 'Atualização pendente'}
        </span>
      </div>
    </div>
  );
}

export default function Alerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<AlertView[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicker, setSelectedTicker] = useState('');
  const [alertType, setAlertType] = useState<'price' | 'percent'>('price');
  const [condition, setCondition] = useState<'above' | 'below'>('above');
  const [targetValue, setTargetValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    async function load() {
      if (!user?.id) {
        if (active) {
          setAlerts([]);
          setLoading(false);
        }
        return;
      }
      try {
        const remote = await fetchAlerts(user.id);
        if (active) setAlerts(remote.map(fromRemote));
      } catch {
        if (active) toast.error('Não foi possível sincronizar seus alertas agora.');
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, [user?.id]);

  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length < 2) return [];
    return allAssets
      .filter((asset) => asset.ticker.toLowerCase().includes(query) || asset.name.toLowerCase().includes(query))
      .slice(0, 8);
  }, [searchQuery]);

  const activeCount = alerts.filter((alert) => alert.isActive).length;
  const triggeredCount = alerts.filter((alert) => alert.isActive && alert.currentPrice > 0 && (
    (alert.condition === 'above' && alert.currentPrice >= alert.targetValue) ||
    (alert.condition === 'below' && alert.currentPrice <= alert.targetValue)
  )).length;

  async function handleToggle(alert: AlertView) {
    setBusyId(alert.id);
    const nextEnabled = !alert.isActive;
    setAlerts((current) => current.map((item) => item.id === alert.id ? { ...item, isActive: nextEnabled } : item));
    try {
      await updateAlert(alert.id, { enabled: nextEnabled });
    } catch {
      setAlerts((current) => current.map((item) => item.id === alert.id ? { ...item, isActive: alert.isActive } : item));
      toast.error('Não foi possível atualizar o alerta.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(alert: AlertView) {
    setBusyId(alert.id);
    const snapshot = alerts;
    setAlerts((current) => current.filter((item) => item.id !== alert.id));
    try {
      await deleteAlert(alert.id);
      toast.success('Alerta removido.');
    } catch {
      setAlerts(snapshot);
      toast.error('Não foi possível remover o alerta.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleCreate() {
    const numericTarget = Number(targetValue.replace(',', '.'));
    if (!user?.id) {
      toast.error('Entre na sua conta para salvar alertas.');
      return;
    }
    if (!selectedTicker || !Number.isFinite(numericTarget) || numericTarget <= 0) {
      toast.error('Escolha um ativo e informe um valor alvo válido.');
      return;
    }

    setSaving(true);
    try {
      const result = await createAlert({
        userId: user.id,
        ticker: selectedTicker,
        type: `${alertType}_${condition}`,
        value: numericTarget,
        enabled: true,
      });
      setAlerts((current) => [fromRemote(result.alert), ...current]);
      setShowCreateModal(false);
      setSearchQuery('');
      setSelectedTicker('');
      setTargetValue('');
      setAlertType('price');
      setCondition('above');
      toast.success('Alerta criado.');
    } catch {
      toast.error('Não foi possível criar o alerta agora.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-3">
            <Bell className="w-6 h-6 text-amber-400" />
            Meus Alertas
          </h1>
          <p className="text-slate-400 mt-1">Crie condições de acompanhamento e mantenha tudo sincronizado na sua conta.</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Novo Alerta
        </button>
      </div>

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
          <p className="text-xs text-slate-400 mb-1">Condição atingida</p>
          <p className="text-2xl font-bold text-amber-400">{triggeredCount}</p>
        </div>
        <div className="bg-slate-800/40 rounded-xl p-4 border border-slate-700/40">
          <p className="text-xs text-slate-400 mb-1">Inativos</p>
          <p className="text-2xl font-bold text-slate-400">{alerts.length - activeCount}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg">
          <DollarSign className="w-4 h-4 text-blue-400" />
          <span className="text-sm text-slate-300">Preço</span>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg">
          <Activity className="w-4 h-4 text-purple-400" />
          <span className="text-sm text-slate-300">Variação %</span>
        </div>
        <Link to="/watchlist" className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-lg hover:bg-slate-800 transition-colors">
          <Search className="w-4 h-4 text-cyan-400" />
          <span className="text-sm text-slate-300">Minha Watchlist</span>
        </Link>
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-12 text-center">
          <Loader2 className="w-8 h-8 text-primary mx-auto animate-spin" />
          <p className="text-slate-400 mt-3">Sincronizando alertas...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="bg-slate-800/40 rounded-xl border border-slate-700/40 p-12 text-center">
          <Bell className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">Nenhum alerta configurado</h3>
          <p className="text-slate-400 mb-6">Crie seu primeiro alerta para acompanhar uma condição de mercado.</p>
          <button onClick={() => setShowCreateModal(true)} className="px-6 py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors">
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
              busy={busyId === alert.id}
              onToggle={handleToggle}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-700/40 bg-slate-800/30 p-4 text-xs text-slate-400">
        Alertas são ferramentas informativas de acompanhamento. O F-Insight não executa ordens e não transforma uma condição atingida em recomendação de compra ou venda.
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-2xl border border-slate-700/50 w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-white">Criar Novo Alerta</h3>
                <p className="text-xs text-slate-500 mt-1">Acompanhamento educativo, sem execução automática.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800">✕</button>
            </div>

            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Ativo</label>
                {selectedTicker ? (
                  <div className="flex items-center justify-between rounded-xl border border-primary/30 bg-primary/10 p-3">
                    <div>
                      <p className="font-mono font-bold text-cyan-400">{selectedTicker}</p>
                      <p className="text-xs text-slate-400">{assetByTicker(selectedTicker)?.name || selectedTicker}</p>
                    </div>
                    <button onClick={() => setSelectedTicker('')} className="text-xs text-slate-300 hover:text-white">Trocar</button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar ativo..."
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
                        autoFocus
                      />
                    </div>
                    {searchResults.length > 0 && (
                      <div className="mt-2 max-h-44 overflow-y-auto rounded-xl border border-slate-700/40 bg-slate-950 p-1">
                        {searchResults.map((asset) => (
                          <button
                            key={asset.ticker}
                            onClick={() => { setSelectedTicker(asset.ticker); setSearchQuery(''); }}
                            className="w-full flex items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-slate-800"
                          >
                            <span className="font-mono font-bold text-cyan-400">{asset.ticker}</span>
                            <span className="text-xs text-slate-500 truncate ml-3">{asset.name}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Tipo</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setAlertType('price')} className={cn('p-3 border rounded-xl flex items-center gap-2', alertType === 'price' ? 'bg-blue-500/15 border-blue-500/40 text-blue-300' : 'bg-slate-800/50 border-slate-700/50 text-slate-400')}>
                    <DollarSign className="w-4 h-4" /> Preço
                  </button>
                  <button onClick={() => setAlertType('percent')} className={cn('p-3 border rounded-xl flex items-center gap-2', alertType === 'percent' ? 'bg-purple-500/15 border-purple-500/40 text-purple-300' : 'bg-slate-800/50 border-slate-700/50 text-slate-400')}>
                    <Activity className="w-4 h-4" /> Variação %
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Condição</label>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => setCondition('above')} className={cn('p-3 border rounded-xl flex items-center justify-center gap-2', condition === 'above' ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300' : 'bg-slate-800/50 border-slate-700/50 text-slate-400')}>
                    <TrendingUp className="w-4 h-4" /> Acima de
                  </button>
                  <button onClick={() => setCondition('below')} className={cn('p-3 border rounded-xl flex items-center justify-center gap-2', condition === 'below' ? 'bg-red-500/15 border-red-500/40 text-red-300' : 'bg-slate-800/50 border-slate-700/50 text-slate-400')}>
                    <TrendingDown className="w-4 h-4" /> Abaixo de
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Valor alvo</label>
                <input
                  type="number"
                  inputMode="decimal"
                  value={targetValue}
                  onChange={(event) => setTargetValue(event.target.value)}
                  placeholder={alertType === 'percent' ? 'Ex: 5' : 'Ex: 40.00'}
                  className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50 font-mono"
                />
              </div>

              <button
                disabled={saving}
                onClick={handleCreate}
                className="w-full py-3 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors font-medium disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {saving && <Loader2 className="w-4 h-4 animate-spin" />}
                Criar Alerta
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
