export type UserRole = 'admin' | 'advisor' | 'client';
export type ClientProfile = 'conservador' | 'moderado' | 'arrojado';
export type EducationLevel = 'iniciante' | 'intermediario' | 'avancado';

export interface WorkspaceTenant {
  id: string;
  name: string;
  brandName: string;
  cnpj?: string;
  ownerName: string;
  ownerEmail: string;
  phone?: string;
  primaryColor: string;
  secondaryColor: string;
  logoDataUrl?: string;
  createdAt: string;
}

export interface WorkspaceAdvisor {
  id: string;
  tenantId: string;
  name: string;
  email: string;
  phone?: string;
  roleTitle: string;
  status: 'ativo' | 'convite_enviado';
  createdAt: string;
}

export interface WorkspaceClient {
  id: string;
  tenantId: string;
  advisorId: string;
  name: string;
  email: string;
  phone?: string;
  profile: ClientProfile;
  educationLevel: EducationLevel;
  interests: string[];
  status: 'ativo' | 'convite_enviado';
  inviteToken: string;
  createdAt: string;
}

export interface WorkspaceReport {
  id: string;
  tenantId: string;
  advisorId: string;
  clientId?: string;
  ticker: string;
  title: string;
  summary: string;
  type: 'valuation' | 'macro' | 'educacional' | 'reuniao';
  visibility: 'interno' | 'cliente' | 'grupo';
  createdAt: string;
}

export interface WorkspaceContent {
  id: string;
  tenantId: string;
  clientId?: string;
  title: string;
  category: 'macro' | 'renda_fixa' | 'acoes' | 'dolar' | 'dividendos' | 'risco';
  description: string;
  createdAt: string;
}

export interface WorkspaceState {
  tenants: WorkspaceTenant[];
  advisors: WorkspaceAdvisor[];
  clients: WorkspaceClient[];
  reports: WorkspaceReport[];
  contents: WorkspaceContent[];
  activeTenantId: string;
  activeAdvisorId: string;
  activeClientId: string;
}

const STORAGE_KEY = 'f-insight-launch-workspace';

function now() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}_${Date.now().toString(36)}`;
}

function makeInviteToken() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function createDefaultWorkspace(): WorkspaceState {
  const tenantId = 'tenant_demo';
  const advisorId = 'advisor_demo';
  const clientId = 'client_demo';

  return {
    activeTenantId: tenantId,
    activeAdvisorId: advisorId,
    activeClientId: clientId,
    tenants: [
      {
        id: tenantId,
        name: 'Escritório Demo',
        brandName: 'Escritório Demo Investimentos',
        cnpj: '',
        ownerName: 'Admin Demo',
        ownerEmail: 'admin@demo.com',
        phone: '',
        primaryColor: '#22d3ee',
        secondaryColor: '#10b981',
        createdAt: now(),
      },
    ],
    advisors: [
      {
        id: advisorId,
        tenantId,
        name: 'Assessor Demo',
        email: 'assessor@demo.com',
        phone: '',
        roleTitle: 'Assessor de Investimentos',
        status: 'ativo',
        createdAt: now(),
      },
    ],
    clients: [
      {
        id: clientId,
        tenantId,
        advisorId,
        name: 'Cliente Final Demo',
        email: 'cliente@demo.com',
        phone: '',
        profile: 'moderado',
        educationLevel: 'intermediario',
        interests: ['Juros', 'Dividendos', 'Dólar', 'Valuation'],
        status: 'ativo',
        inviteToken: 'DEMO01',
        createdAt: now(),
      },
    ],
    reports: [
      {
        id: 'report_demo_petr4',
        tenantId,
        advisorId,
        clientId,
        ticker: 'PETR4',
        title: 'Como ler um relatório de valuation',
        summary: 'Material orientativo sobre preço, valor intrínseco e margem de segurança.',
        type: 'valuation',
        visibility: 'cliente',
        createdAt: now(),
      },
      {
        id: 'report_demo_macro',
        tenantId,
        advisorId,
        clientId,
        ticker: 'MACRO',
        title: 'Juros, dólar e inflação: o que acompanhar',
        summary: 'Resumo conceitual para apoiar a próxima conversa com o assessor.',
        type: 'macro',
        visibility: 'cliente',
        createdAt: now(),
      },
    ],
    contents: [
      {
        id: 'content_demo_renda_fixa',
        tenantId,
        clientId,
        title: 'Renda fixa na prática',
        category: 'renda_fixa',
        description: 'Diferença entre pós-fixado, prefixado e IPCA+ em linguagem simples.',
        createdAt: now(),
      },
      {
        id: 'content_demo_dolar',
        tenantId,
        clientId,
        title: 'Dólar e diversificação internacional',
        category: 'dolar',
        description: 'Como o câmbio pode afetar empresas, fundos globais e proteção patrimonial.',
        createdAt: now(),
      },
    ],
  };
}

export function getWorkspace(): WorkspaceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = createDefaultWorkspace();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return JSON.parse(raw) as WorkspaceState;
  } catch {
    return createDefaultWorkspace();
  }
}

export function saveWorkspace(workspace: WorkspaceState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
  return workspace;
}

export function registerTenant(input: Partial<WorkspaceTenant>) {
  const workspace = getWorkspace();
  const tenant: WorkspaceTenant = {
    id: makeId('tenant'),
    name: input.name || 'Novo Escritório',
    brandName: input.brandName || input.name || 'Novo Escritório',
    cnpj: input.cnpj || '',
    ownerName: input.ownerName || 'Responsável',
    ownerEmail: input.ownerEmail || 'admin@escritorio.com',
    phone: input.phone || '',
    primaryColor: input.primaryColor || '#22d3ee',
    secondaryColor: input.secondaryColor || '#10b981',
    logoDataUrl: input.logoDataUrl || '',
    createdAt: now(),
  };

  const advisor: WorkspaceAdvisor = {
    id: makeId('advisor'),
    tenantId: tenant.id,
    name: tenant.ownerName,
    email: tenant.ownerEmail,
    phone: tenant.phone,
    roleTitle: 'Administrador do Escritório',
    status: 'ativo',
    createdAt: now(),
  };

  workspace.tenants.push(tenant);
  workspace.advisors.push(advisor);
  workspace.activeTenantId = tenant.id;
  workspace.activeAdvisorId = advisor.id;
  saveWorkspace(workspace);
  return { workspace, tenant, advisor };
}

export function addAdvisor(input: Omit<WorkspaceAdvisor, 'id' | 'createdAt' | 'status'>) {
  const workspace = getWorkspace();
  const advisor: WorkspaceAdvisor = {
    ...input,
    id: makeId('advisor'),
    status: 'convite_enviado',
    createdAt: now(),
  };
  workspace.advisors.push(advisor);
  saveWorkspace(workspace);
  return advisor;
}

export function addClient(input: Omit<WorkspaceClient, 'id' | 'createdAt' | 'status' | 'inviteToken'>) {
  const workspace = getWorkspace();
  const client: WorkspaceClient = {
    ...input,
    id: makeId('client'),
    status: 'convite_enviado',
    inviteToken: makeInviteToken(),
    createdAt: now(),
  };
  workspace.clients.push(client);
  workspace.activeClientId = client.id;
  saveWorkspace(workspace);
  return client;
}

export function publishReport(input: Omit<WorkspaceReport, 'id' | 'createdAt'>) {
  const workspace = getWorkspace();
  const report: WorkspaceReport = {
    ...input,
    id: makeId('report'),
    createdAt: now(),
  };
  workspace.reports.unshift(report);
  saveWorkspace(workspace);
  return report;
}

export function getWorkspaceStats() {
  const workspace = getWorkspace();
  const tenantId = workspace.activeTenantId;
  const advisors = workspace.advisors.filter((item) => item.tenantId === tenantId);
  const clients = workspace.clients.filter((item) => item.tenantId === tenantId);
  const reports = workspace.reports.filter((item) => item.tenantId === tenantId);
  const contents = workspace.contents.filter((item) => item.tenantId === tenantId);

  return {
    tenant: workspace.tenants.find((item) => item.id === tenantId) || workspace.tenants[0],
    advisors,
    clients,
    reports,
    contents,
    publishedReports: reports.filter((item) => item.visibility === 'cliente').length,
  };
}

export function getInviteUrl(token: string) {
  return `${window.location.origin}/convite/${token}`;
}
