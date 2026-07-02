import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import API_ENDPOINTS from '@/config/api';
import { TenantBranding } from '@/types';

const STORAGE_KEY = 'f-insight-tenant-branding';

export const defaultTenant: TenantBranding = {
  tenantId: 'demo',
  tenantName: 'Escritório Demo',
  brandName: 'Escritório Demo Investimentos',
  logoDataUrl: '',
  primaryColor: '#22d3ee',
  secondaryColor: '#10b981',
  reportFooter: 'Relatório gerado pela plataforma F-Insight White Label.',
  disclosure: 'Material informativo. Não constitui recomendação individual de investimento.',
  subdomain: 'demo.f-insight.com.br',
};

interface TenantContextValue {
  tenant: TenantBranding;
  saveTenant: (tenant: TenantBranding) => Promise<void>;
  resetTenant: () => void;
  buildReportParams: () => URLSearchParams;
}

const TenantContext = createContext<TenantContextValue | undefined>(undefined);

function hexToHsl(hex: string) {
  const clean = hex.replace('#', '').trim();
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return '199 89% 55%';

  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h /= 6;
  }

  return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

function applyTenantTheme(tenant: TenantBranding) {
  const root = document.documentElement;
  root.style.setProperty('--primary', hexToHsl(tenant.primaryColor));
  root.style.setProperty('--accent', hexToHsl(tenant.secondaryColor));
  root.style.setProperty('--ring', hexToHsl(tenant.primaryColor));
  root.style.setProperty('--tenant-primary-hex', tenant.primaryColor);
  root.style.setProperty('--tenant-secondary-hex', tenant.secondaryColor);
}

function loadStoredTenant() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TenantBranding;
  } catch {
    return null;
  }
}

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<TenantBranding>(() => loadStoredTenant() || defaultTenant);

  useEffect(() => {
    applyTenantTheme(tenant);
  }, [tenant]);

  useEffect(() => {
    const hasLocalTenant = Boolean(loadStoredTenant());
    if (hasLocalTenant) return;

    fetch(API_ENDPOINTS.tenants.current)
      .then((response) => (response.ok ? response.json() : null))
      .then((remoteTenant) => {
        if (remoteTenant?.tenantId) setTenant({ ...defaultTenant, ...remoteTenant });
      })
      .catch(() => undefined);
  }, []);

  const value = useMemo<TenantContextValue>(() => ({
    tenant,
    async saveTenant(nextTenant) {
      const normalized = { ...defaultTenant, ...nextTenant, updatedAt: new Date().toISOString() };
      setTenant(normalized);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));

      fetch(API_ENDPOINTS.tenants.current, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(normalized),
      }).catch(() => undefined);
    },
    resetTenant() {
      localStorage.removeItem(STORAGE_KEY);
      setTenant(defaultTenant);
    },
    buildReportParams() {
      const params = new URLSearchParams();
      params.set('tenantId', tenant.tenantId);
      params.set('brandName', tenant.brandName);
      params.set('primaryColor', tenant.primaryColor.replace('#', ''));
      params.set('secondaryColor', tenant.secondaryColor.replace('#', ''));
      params.set('disclosure', tenant.disclosure);
      return params;
    },
  }), [tenant]);

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used inside TenantProvider');
  }
  return context;
}
