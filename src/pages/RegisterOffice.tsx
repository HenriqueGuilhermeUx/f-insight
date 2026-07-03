import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, CheckCircle2, Palette, Rocket, Shield } from 'lucide-react';
import { Layout } from '@/components/layout/Layout';
import { registerTenant } from '@/services/workspace';
import { useTenant, defaultTenant } from '@/context/TenantContext';

export default function RegisterOffice() {
  const navigate = useNavigate();
  const { saveTenant } = useTenant();
  const [form, setForm] = useState({
    name: 'Alpha Investimentos',
    brandName: 'Alpha Investimentos',
    cnpj: '',
    ownerName: 'Henrique Campos',
    ownerEmail: 'contato@alphainvest.com.br',
    phone: '',
    primaryColor: '#22d3ee',
    secondaryColor: '#10b981',
  });

  const update = (key: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const { tenant } = registerTenant(form);
    await saveTenant({
      ...defaultTenant,
      tenantId: tenant.id,
      tenantName: tenant.name,
      brandName: tenant.brandName,
      primaryColor: tenant.primaryColor,
      secondaryColor: tenant.secondaryColor,
      logoDataUrl: tenant.logoDataUrl || '',
    });
    navigate('/admin');
  };

  return (
    <Layout>
      <section className="mb-8 rounded-3xl border border-primary/20 bg-gradient-to-br from-primary/15 via-slate-900/80 to-slate-950 p-6 lg:p-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-bold text-primary mb-4">
              <Rocket className="w-3.5 h-3.5" />
              Ativação white-label
            </span>
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight text-white mb-4">
              Cadastre o escritório e comece a operar o portal.
            </h1>
            <p className="text-slate-300 text-lg leading-relaxed max-w-4xl">
              Este fluxo cria a conta do escritório, ativa a marca inicial e libera o painel administrativo para cadastrar assessores, clientes e conteúdos.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-700/40 bg-slate-950/70 p-5 min-w-[280px]">
            <Shield className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-bold text-white mb-2">MVP seguro</h3>
            <p className="text-sm text-slate-400 leading-relaxed">Sem custódia, sem saldos e sem posição real do cliente final nesta fase.</p>
          </div>
        </div>
      </section>

      <form onSubmit={submit} className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6">
        <section className="space-y-4">
          <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-5">
              <Building2 className="w-5 h-5 text-primary" />
              Dados do escritório
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Nome jurídico/comercial</span>
                <input value={form.name} onChange={(e) => update('name', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
              </label>
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Nome no portal do cliente</span>
                <input value={form.brandName} onChange={(e) => update('brandName', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
              </label>
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">CNPJ</span>
                <input value={form.cnpj} onChange={(e) => update('cnpj', e.target.value)} placeholder="opcional no MVP" className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
              </label>
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Telefone</span>
                <input value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="WhatsApp do escritório" className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
              </label>
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Responsável</span>
                <input value={form.ownerName} onChange={(e) => update('ownerName', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
              </label>
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">E-mail do admin</span>
                <input type="email" value={form.ownerEmail} onChange={(e) => update('ownerEmail', e.target.value)} className="w-full rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white outline-none focus:border-primary/50" />
              </label>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 lg:p-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mb-5">
              <Palette className="w-5 h-5 text-primary" />
              Identidade inicial
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Cor principal</span>
                <div className="flex gap-3">
                  <input type="color" value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} className="h-12 w-14 rounded-lg bg-transparent" />
                  <input value={form.primaryColor} onChange={(e) => update('primaryColor', e.target.value)} className="flex-1 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white font-mono outline-none focus:border-primary/50" />
                </div>
              </label>
              <label className="block">
                <span className="text-sm text-slate-400 mb-2 block">Cor secundária</span>
                <div className="flex gap-3">
                  <input type="color" value={form.secondaryColor} onChange={(e) => update('secondaryColor', e.target.value)} className="h-12 w-14 rounded-lg bg-transparent" />
                  <input value={form.secondaryColor} onChange={(e) => update('secondaryColor', e.target.value)} className="flex-1 rounded-xl border border-slate-700/50 bg-slate-950/70 px-4 py-3 text-white font-mono outline-none focus:border-primary/50" />
                </div>
              </label>
            </div>
          </div>

          <button type="submit" className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-white hover:bg-primary/90 transition-colors">
            <CheckCircle2 className="w-4 h-4" />
            Criar escritório e abrir admin
          </button>
        </section>

        <aside className="rounded-3xl border border-slate-700/40 bg-slate-800/40 p-5 h-fit sticky top-24">
          <p className="text-sm text-slate-400 mb-2">Prévia</p>
          <div className="rounded-2xl border border-slate-700/40 bg-slate-950/60 p-5" style={{ background: `linear-gradient(135deg, ${form.primaryColor}22, transparent 45%, ${form.secondaryColor}18)` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black mb-4" style={{ background: `linear-gradient(135deg, ${form.primaryColor}, ${form.secondaryColor})` }}>
              {form.brandName.slice(0, 1)}
            </div>
            <h3 className="text-xl font-black text-white">{form.brandName}</h3>
            <p className="text-sm text-slate-400 mt-2">Portal de inteligência educacional para clientes, assessores e escritório.</p>
          </div>
        </aside>
      </form>
    </Layout>
  );
}
