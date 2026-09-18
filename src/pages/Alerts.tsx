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
  ToggleLeft,
  ToggleRight,
  Wifi,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn, formatPercent, formatPrice, getAssetTypeLabel } from '@/lib/utils';
import { Layout } from '@/components/layout/Layout';
import { useAuth } from '@/context/AuthContext';
import {
  createAlert,
  deleteAlert,
  fetchAlerts,
  type RemoteAlert,
  updateAlert,
} from '@/services/userPreferencesApi';
import {
  catalogEntry,
  fetchLiveAssetSnapshots,
  searchAssetCatalog,
  type LiveAssetSnapshot,
} from '@/services/liveMarket';

function parseAlertType(type: string) {
  const [metricRaw, conditionRaw] = String(type || 'price_above').split('_');
  return {
    metric: metricRaw === 'percent' ? 'percent' as const : 'price' as const,
    condition: conditionRaw === 'below' ? 'below' as const : 'above' as const,
  };
}

function currentMetric(alert: RemoteAlert, snapshot?: LiveAssetSnapshot) {
  if (!snapshot?.dataAvailable) return null;
  const parsed = parseAlertType(alert.type);
  return parsed.metric === 'percent' ? snapshot.asset.changePercent : snapshot.asset.price;
}

function isTriggered(alert: RemoteAlert, snapshot?: LiveAssetSnapshot) {
  if (alert.enabled === false) return false;
  const current = currentMetric(alert, snapshot);
  if (current === null) return false;
  const { condition } = parseAlertType(alert.type);
  return condition === 'above' ? current >= Number(alert.value) : current <= Number(alert.value);
}

export default function Alerts() {
  const { user } = useAuth();
  const [alerts, setAlerts] = useState<RemoteAlert[]>([]);
  const [snapshots, setSnapshots] = useState<Record<string, LiveAssetSnapshot>>({});
  const [loading, setLoading] = useState(true);
  const [marketLoading, setMarketLoading] = useState(false);
  const [marketSource, setMarketSource] = useState('');
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

    async function loadAlerts() {
      if (!user?.id) {
        if (active) {
          setAlerts([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      try {
        const remote = await fetchAlerts(user.id);
        if (active) setAlerts(remote);
      } catch {
        if (active) toast.error('Não foi possível sincronizar seus alertas agora.');
      } finally {
        if (active) setLoading(false);
      }
    }

    void loadAlerts();
    return () => {
      active = false;
    };
  }, [user?.id]);

  const tickerKey = useMemo(
    () => [...new Set(alerts.map((alert) => alert.ticker.toUpperCase()))].sort().join('|'),
    [alerts],
  );

  useEffect(() => {
    let active = true;

    async function loadMarket() {
      if (!tickerKey) {
        setSnapshots({});
        setMarketSource('');
        return;
      }

      setMarketLoading(true);
      try {
        const result = await fetchLiveAssetSnapshots(tickerKey.split('|'));
        if (!active) return;
        setSnapshots(Object.fromEntries(result.snapshots.map((item) => [item.asset.ticker, item])));
        setMarketSource(result.source);
      } catch {
        if (!active) return;
        setSnapshots({});
        setMarketSource('indisponível');
      } finally {
        if (active) setMarketLoading(false);
      }
    }

    void loadMarket();
    return () => {
      active = false;
    };
  }, [tickerKey]);

  const searchResults = useMemo(() => searchAssetCatalog(searchQuery), [searchQuery]);
  const activeCount = alerts.filter((alert) => alert.enabled !== false).length;
  const triggeredCount = alerts.filter((alert) => isTriggered(alert, snapshots[alert.ticker.toUpperCase()])).length;
  const liveCount = Object.values(snapshots).filter((snapshot) => snapshot.dataAvailable).length;

  async function handleToggle(alert: RemoteAlert) {
    setBusyId(alert.id);
    const nextEnabled = alert.enabled === false;
    const previous = alerts;
    setAlerts((current) => current.map((item) => item.id === alert.id ? { ...item, enabled: nextEnabled } : item));

    try {
      const result = await updateAlert(alert.id, { enabled: nextEnabled });
      setAlerts((current) => current.map((item) => item.id === alert.id ? result.alert : item));
    } catch {
      setAlerts(previous);
      toast.error('Não foi possível atualizar o alerta.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(alert: RemoteAlert) {
    setBusyId(alert.id);
    const previous = alerts;
    setAlerts((current) => current.filter((item) => item.id !== alert.id));

    try {
      await deleteAlert(alert.id);
      toast.success('Alerta removido.');
    } catch {
      setAlerts(previous);
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

    const validTarget = alertType === 'price'
      ? Number.isFinite(numericTarget) && numericTarget > 0
      : Number.isFinite(numericTarget);

    if (!selectedTicker || !validTarget) {
      toast.error(alertType === 'price'
        ? 'Escolha um ativo e informe um preço alvo maior que zero.'
        : 'Escolha um ativo e informe uma variação percentual válida.');
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
      setAlerts((current) => [result.alert, ...current]);
      setShowCreateModal(false);
      setSearchQuery('');
      setSelectedTicker('');
      setTargetValue('');
      setAlertType('price');
      setCondition('above');
      toast.success('Alerta criado e salvo.');
    } catch {
      toast.error('Não foi possível criar o alerta agora.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-bold text-white">
            <Bell className="h-6 w-6 text-amber-400" />
            Meus Alertas
          </h1>
          <p className="mt-1 text-slate-400">
            Condições persistentes de acompanhamento, comparadas com dados atuais da API F-Insight.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 font-bold text-white transition hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Novo alerta
        </button>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4">
          <p className="mb-1 text-xs text-slate-400">Total</p>
          <p className="text-2xl font-bold text-white">{alerts.length}</p>
        </div>
        <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4">
          <p className="mb-1 text-xs text-slate-400">Ativos</p>
          <p className="text-2xl font-bold text-emerald-400">{activeCount}</p>
        </div>
        <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4">
          <p className="mb-1 text-xs text-slate-400">Condição atingida</p>
          <p className="text-2xl font-bold text-amber-400">{triggeredCount}</p>
        </div>
        <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-4">
          <p className="mb-1 text-xs text-slate-400">Com dado atual</p>
          <p className="text-2xl font-bold text-cyan-400">{liveCount}</p>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-3 text-xs text-slate-500">
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/50 bg-slate-900/60 px-3 py-1.5">
            {marketLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Wifi className="h-3.5 w-3.5" />}
            {marketLoading ? 'Atualizando referências...' : `Fonte: ${marketSource || 'API F-Insight'}`}
          </span>
          <Link to="/watchlist" className="text-cyan-300 hover:text-cyan-200">Abrir Watchlist</Link>
        </div>
      )}

      {loading ? (
        <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-12 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-primary" />
          <p className="mt-3 text-slate-400">Sincronizando alertas...</p>
        </div>
      ) : alerts.length === 0 ? (
        <div className="rounded-xl border border-slate-700/40 bg-slate-800/40 p-12 text-center">
          <Bell className="mx-auto mb-4 h-16 w-16 text-slate-600" />
          <h3 className="mb-2 text-xl font-bold text-white">Nenhum alerta configurado</h3>
          <p className="mb-6 text-slate-400">Crie uma condição de preço ou variação para acompanhar um ativo.</p>
          <button onClick={() => setShowCreateModal(true)} className="rounded-xl bg-primary px-6 py-3 font-bold text-white hover:bg-primary/90">
            <Plus className="mr-2 inline h-4 w-4" />
            Criar primeiro alerta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {alerts.map((alert) => {
            const snapshot = snapshots[alert.ticker.toUpperCase()];
            const { metric, condition: parsedCondition } = parseAlertType(alert.type);
            const current = currentMetric(alert, snapshot);
            const triggered = isTriggered(alert, snapshot);
            const meta = catalogEntry(alert.ticker);
            const busy = busyId === alert.id;

            return (
              <div
                key={alert.id}
                className={cn(
                  'rounded-xl border bg-slate-800/40 p-4 transition-all',
                  alert.enabled === false ? 'border-slate-700/20 opacity-60' : triggered ? 'border-amber-500/30' : 'border-slate-700/40',
                )}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-mono font-bold text-cyan-400">{alert.ticker}</p>
                      {triggered && <span className="rounded bg-amber-500/20 px-2 py-0.5 text-[10px] font-bold text-amber-300">ATINGIDA</span>}
                    </div>
                    <p className="truncate text-xs text-slate-400">{meta?.name || alert.ticker}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      disabled={busy}
                      onClick={() => handleToggle(alert)}
                      aria-label={alert.enabled === false ? 'Ativar alerta' : 'Desativar alerta'}
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-700/50 hover:text-white disabled:opacity-50"
                    >
                      {alert.enabled === false ? <ToggleLeft className="h-5 w-5" /> : <ToggleRight className="h-5 w-5 text-emerald-400" />}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => handleDelete(alert)}
                      aria-label="Excluir alerta"
                      className="rounded-lg p-2 text-slate-400 transition hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <div className="mb-3 rounded-lg bg-slate-950/50 p-3">
                  <div className="flex items-center justify-between gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      {metric === 'price' ? <DollarSign className="h-4 w-4 text-blue-400" /> : <Activity className="h-4 w-4 text-purple-400" />}
                      <span className="text-slate-400">{parsedCondition === 'above' ? 'Acima de' : 'Abaixo de'}</span>
                    </div>
                    <span className="font-mono font-bold text-white">
                      {metric === 'percent'
                        ? formatPercent(Number(alert.value))
                        : formatPrice(Number(alert.value), meta?.currency || 'BRL')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Referência atual</span>
                  <span className="font-mono text-slate-300">
                    {current === null
                      ? 'indisponível'
                      : metric === 'percent'
                        ? formatPercent(current)
                        : formatPrice(current, snapshot?.asset.currency || meta?.currency || 'BRL')}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-600">
                  <span>{meta ? getAssetTypeLabel(meta.type) : 'Ativo'}</span>
                  <span>{snapshot?.provider || 'sem fonte atual'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-6 rounded-xl border border-slate-700/40 bg-slate-800/30 p-4 text-xs leading-relaxed text-slate-400">
        Alertas são ferramentas informativas. Uma condição atingida não constitui recomendação e o F-Insight não executa ordens.
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-slate-700/50 bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-800 p-4">
              <div>
                <h3 className="text-lg font-bold text-white">Novo alerta</h3>
                <p className="text-xs text-slate-500">A cotação usada na comparação vem da API F-Insight.</p>
              </div>
              <button onClick={() => setShowCreateModal(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4 p-4">
              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">Ativo</label>
                {selectedTicker ? (
                  <div className="flex items-center justify-between rounded-xl border border-cyan-500/20 bg-cyan-500/10 p-3">
                    <div>
                      <p className="font-mono font-bold text-cyan-300">{selectedTicker}</p>
                      <p className="text-xs text-slate-400">{catalogEntry(selectedTicker)?.name || selectedTicker}</p>
                    </div>
                    <button onClick={() => setSelectedTicker('')} className="rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <input
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Ticker ou nome..."
                        className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 py-3 pl-10 pr-4 text-white outline-none placeholder:text-slate-500 focus:border-primary/50"
                      />
                    </div>
                    {searchQuery.trim().length >= 2 && (
                      <div className="mt-2 max-h-48 space-y-1 overflow-y-auto">
                        {searchResults.map((entry) => (
                          <button
                            key={entry.ticker}
                            onClick={() => {
                              setSelectedTicker(entry.ticker);
                              setSearchQuery('');
                            }}
                            className="flex w-full items-center justify-between rounded-lg bg-slate-800/50 p-3 text-left hover:bg-slate-800"
                          >
                            <div>
                              <p className="font-mono font-bold text-cyan-400">{entry.ticker}</p>
                              <p className="text-xs text-slate-400">{entry.name}</p>
                            </div>
                            <span className="text-xs text-slate-500">{getAssetTypeLabel(entry.type)}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setAlertType('price')}
                  className={cn('rounded-xl border p-3 text-sm font-bold', alertType === 'price' ? 'border-blue-500/40 bg-blue-500/10 text-blue-300' : 'border-slate-700/50 text-slate-400')}
                >
                  Preço
                </button>
                <button
                  onClick={() => setAlertType('percent')}
                  className={cn('rounded-xl border p-3 text-sm font-bold', alertType === 'percent' ? 'border-purple-500/40 bg-purple-500/10 text-purple-300' : 'border-slate-700/50 text-slate-400')}
                >
                  Variação %
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setCondition('above')}
                  className={cn('rounded-xl border p-3 text-sm font-bold', condition === 'above' ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300' : 'border-slate-700/50 text-slate-400')}
                >
                  Acima de
                </button>
                <button
                  onClick={() => setCondition('below')}
                  className={cn('rounded-xl border p-3 text-sm font-bold', condition === 'below' ? 'border-red-500/40 bg-red-500/10 text-red-300' : 'border-slate-700/50 text-slate-400')}
                >
                  Abaixo de
                </button>
              </div>

              <div>
                <label className="mb-2 block text-xs font-bold uppercase tracking-wide text-slate-400">
                  {alertType === 'price' ? 'Preço alvo' : 'Variação alvo (%)'}
                </label>
                <input
                  value={targetValue}
                  onChange={(event) => setTargetValue(event.target.value)}
                  inputMode="decimal"
                  placeholder={alertType === 'price' ? 'Ex.: 40,00' : 'Ex.: -3,0 ou 5,0'}
                  className="w-full rounded-xl border border-slate-700/50 bg-slate-800/50 px-4 py-3 font-mono text-white outline-none placeholder:text-slate-500 focus:border-primary/50"
                />
              </div>

              <button
                disabled={saving}
                onClick={handleCreate}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 font-bold text-white transition hover:bg-primary/90 disabled:opacity-50"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
                Salvar alerta
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
