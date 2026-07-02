import { ChangeEvent, useState } from 'react';
import {
  BadgeCheck,
  ImagePlus,
  Palette,
  RotateCcw,
  Save,
  Shield,
  Sparkles,
  Upload,
} from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { useTenant, defaultTenant } from '@/context/TenantContext';
import { TenantBranding } from '@/types';

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function WhiteLabelSettings() {
  const { tenant, saveTenant, resetTenant } = useTenant();
  const [form, setForm] = useState<TenantBranding>(tenant);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const updateField = (key: keyof TenantBranding, value: string) => {
    setSaved(false);
    setForm((current) => ({ ...current, [key]: value }));
  };

  const handleLogo = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    updateField('logoDataUrl', dataUrl);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveTenant(form);
    setSaving(false);
    setSaved(true);
  };

  const handleReset = () => {
    resetTenant();
    setForm(defaultTenant);
    setSaved(false);
  };

  return (
    <Layout>
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xs px-2 py-0.5 bg-primary/15 text-primary rounded-full font-medium">
            <Shield className="w-3 h-3 inline mr-1" />
            Mini white-label MVP
          </span>
        </div>
        <h1 className="text-2xl lg:text-3xl font-bold text-white flex items-center gap-3">
          <Palette className="w-7 h-7 text-primary" />
          Marca do Escritório
        </h1>
        <p className="text-slate-400 mt-2 max-w-3xl">
          Configure nome, logo e cores do escritório. O dashboard, os sinais e os relatórios passam a sair com essa identidade visual.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_480px] gap-6">
        <section className="space-y-4">
          <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/40">
            <h2 className="text-lg font-bold text-white mb-4">Dados do escritório</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">ID do escritório</span>
                <input
                  value={form.tenantId}
                  onChange={(event) => updateField('tenantId', event.target.value)}
                  placeholder="ex: alpha-invest"
                  className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
                />
              </label>
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Nome interno</span>
                <input
                  value={form.tenantName}
                  onChange={(event) => updateField('tenantName', event.target.value)}
                  placeholder="Escritório Alpha"
                  className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
                />
              </label>
              <label className="block md:col-span-2">
                <span className="text-sm text-slate-400 mb-2 block">Nome que aparece para o cliente</span>
                <input
                  value={form.brandName}
                  onChange={(event) => updateField('brandName', event.target.value)}
                  placeholder="Alpha Investimentos"
                  className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
                />
              </label>
            </div>
          </div>

          <div className="bg-slate-800/40 rounded-2xl p-5 border border-slate-700/40">
            <h2 className="text-lg font-bold text-white mb-4">Logo e cores</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="md:col-span-1 flex flex-col items-center justify-center gap-3 min-h-[170px] bg-slate-900/70 border border-dashed border-slate-700/70 rounded-xl cursor-pointer hover:border-primary/50 transition-colors">
                {form.logoDataUrl ? (
                  <img src={form.logoDataUrl} alt="Logo do escritório" className="max-h-20 max-w-[150px] object-contain" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-primary/15 flex items-center justify-center">
                    <ImagePlus className="w-7 h-7 text-primary" />
                  </div>
                )}
                <span className="text-sm text-slate-300 flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  Subir logo
                </span>
                <input type="file" accept="image/*" onChange={handleLogo} className="hidden" />
              </label>

              <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="block">
                  <span className="text-sm text-slate-400 mb-2 block">Cor principal</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.primaryColor}
                      onChange={(event) => updateField('primaryColor', event.target.value)}
                      className="w-14 h-12 bg-transparent rounded-lg cursor-pointer"
                    />
                    <input
                      value={form.primaryColor}
                      onChange={(event) => updateField('primaryColor', event.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-xl text-white font-mono focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </label>
                <label className="block">
                  <span className="text-sm text-slate-400 mb-2 block">Cor secundária</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={form.secondaryColor}
                      onChange={(event) => updateField('secondaryColor', event.target.value)}
                      className="w-14 h-12 bg-transparent rounded-lg cursor-pointer"
                    />
                    <input
                      value={form.secondaryColor}
                      onChange={(event) => updateField('secondaryColor', event.target.value)}
                      className="flex-1 px-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-xl text-white font-mono focus:outline-none focus:border-primary/50"
                    />
                  </div>
                </label>
                <label className="block sm:col-span-2">
                  <span className="text-sm text-slate-400 mb-2 block">Texto legal dos relatórios</span>
                  <textarea
                    value={form.disclosure}
                    onChange={(event) => updateField('disclosure', event.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-900/70 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500 focus:outline-none focus:border-primary/50"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Salvando...' : 'Salvar marca'}
            </button>
            <button
              onClick={handleReset}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-slate-800/70 text-slate-200 rounded-xl border border-slate-700/50 hover:border-primary/40 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Voltar para demo
            </button>
            {saved && (
              <span className="inline-flex items-center gap-2 text-emerald-400 text-sm px-2">
                <BadgeCheck className="w-4 h-4" />
                Marca salva e aplicada.
              </span>
            )}
          </div>
        </section>

        <aside className="bg-slate-800/40 rounded-2xl border border-slate-700/40 overflow-hidden h-fit sticky top-24">
          <div className="p-5 border-b border-slate-700/40">
            <p className="text-sm text-slate-400 mb-1">Prévia para o cliente</p>
            <h2 className="text-xl font-bold text-white">Portal White Label</h2>
          </div>
          <div className="p-5" style={{ background: `linear-gradient(135deg, ${form.primaryColor}22, transparent 45%, ${form.secondaryColor}18)` }}>
            <div className="bg-slate-950/80 rounded-2xl border border-slate-700/50 p-4 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center overflow-hidden">
                  {form.logoDataUrl ? (
                    <img src={form.logoDataUrl} alt="Logo" className="w-full h-full object-contain p-1" />
                  ) : (
                    <Sparkles className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-white">{form.brandName || 'Seu Escritório'}</h3>
                  <p className="text-xs text-slate-400">Inteligência de Investimentos</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/40">
                  <p className="text-[11px] text-slate-500">Carteira</p>
                  <p className="text-lg font-bold text-white">+12,4%</p>
                  <p className="text-xs text-emerald-400">ano atual</p>
                </div>
                <div className="bg-slate-900/80 rounded-xl p-3 border border-slate-700/40">
                  <p className="text-[11px] text-slate-500">Sinais</p>
                  <p className="text-lg font-bold text-white">3</p>
                  <p className="text-xs text-primary">ativos</p>
                </div>
              </div>

              <div className="bg-slate-900/80 rounded-xl p-4 border border-slate-700/40">
                <p className="text-xs text-slate-500 mb-2">Relatório em destaque</p>
                <h4 className="font-bold text-white">PETR4 | Valuation</h4>
                <p className="text-sm text-slate-400 mt-1">PDF com logo, cores e disclaimer do escritório.</p>
                <button className="mt-4 w-full py-2 rounded-lg bg-primary text-white text-sm font-semibold">
                  Abrir relatório
                </button>
              </div>
            </div>
          </div>
          <div className="px-5 pb-5">
            <p className="text-xs text-slate-500 leading-relaxed">
              MVP atual: salva a marca no navegador e tenta sincronizar com a API. Para produção completa, o próximo passo é persistir em banco e storage por escritório.
            </p>
          </div>
        </aside>
      </div>
    </Layout>
  );
}
