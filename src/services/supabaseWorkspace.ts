import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type {
  WorkspaceAdvisor,
  WorkspaceClient,
  WorkspaceContent,
  WorkspaceReport,
  WorkspaceState,
  WorkspaceTenant,
} from '@/services/workspace';

function enabled() {
  return Boolean(isSupabaseConfigured && supabase);
}

function firstRow<T>(value: T[] | T | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] || null;
  return value || null;
}

function isUuid(value?: string | null) {
  return Boolean(value && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value));
}

export async function syncTenantToSupabase(tenant: WorkspaceTenant, advisor?: WorkspaceAdvisor) {
  if (!enabled()) return null;

  const { data, error } = await supabase!.rpc('finsight_create_tenant', {
    p_name: tenant.name,
    p_brand_name: tenant.brandName,
    p_cnpj: tenant.cnpj || null,
    p_owner_name: advisor?.name || tenant.ownerName,
    p_owner_email: advisor?.email || tenant.ownerEmail,
    p_phone: advisor?.phone || tenant.phone || null,
    p_primary_color: tenant.primaryColor,
    p_secondary_color: tenant.secondaryColor,
  });

  if (error) throw new Error(`Falha ao criar escritório: ${error.message}`);
  const row = firstRow(data as Array<{ tenant_id: string; advisor_id: string }> | null);
  if (!row?.tenant_id || !row.advisor_id) throw new Error('O Supabase não retornou os IDs do novo escritório.');

  const refreshed = await supabase!.auth.refreshSession();
  if (refreshed.error) throw new Error(`Escritório criado, mas a sessão não foi atualizada: ${refreshed.error.message}`);

  return { tenantId: row.tenant_id, advisorId: row.advisor_id };
}

export async function syncAdvisorToSupabase(advisor: WorkspaceAdvisor) {
  if (!enabled()) return null;

  const { data, error } = await supabase!.rpc('finsight_create_advisor_invite', {
    p_name: advisor.name,
    p_email: advisor.email,
    p_phone: advisor.phone || null,
    p_role_title: advisor.roleTitle,
  });

  if (error) throw new Error(`Falha ao cadastrar assessor: ${error.message}`);
  const row = firstRow(data as Array<{ advisor_id: string; invite_token: string }> | null);
  if (!row?.advisor_id || !row.invite_token) throw new Error('O Supabase não retornou o convite do assessor.');
  return { advisorId: row.advisor_id, inviteToken: row.invite_token };
}

export async function syncClientToSupabase(client: WorkspaceClient) {
  if (!enabled()) return null;

  const { data, error } = await supabase!.rpc('finsight_create_client_invite', {
    p_name: client.name,
    p_email: client.email,
    p_phone: client.phone || null,
    p_investor_profile: client.profile,
    p_education_level: client.educationLevel,
    p_interests: client.interests,
    p_advisor_id: isUuid(client.advisorId) ? client.advisorId : null,
  });

  if (error) throw new Error(`Falha ao cadastrar cliente: ${error.message}`);
  const row = firstRow(data as Array<{ client_id: string; invite_token: string }> | null);
  if (!row?.client_id || !row.invite_token) throw new Error('O Supabase não retornou o convite do cliente.');
  return { clientId: row.client_id, inviteToken: row.invite_token };
}

export async function syncReportToSupabase(report: WorkspaceReport) {
  if (!enabled()) return null;
  if (!isUuid(report.tenantId)) throw new Error('Workspace real sem tenant UUID válido.');

  const created = await supabase!
    .from('finsight_reports')
    .insert({
      tenant_id: report.tenantId,
      advisor_id: isUuid(report.advisorId) ? report.advisorId : null,
      ticker: report.ticker,
      title: report.title,
      summary: report.summary,
      report_type: report.type,
    })
    .select('id')
    .single();

  if (created.error || !created.data?.id) {
    throw new Error(`Falha ao publicar relatório: ${created.error?.message || 'sem ID'}`);
  }

  if (isUuid(report.clientId)) {
    const assignment = await supabase!.from('finsight_report_assignments').insert({
      tenant_id: report.tenantId,
      report_id: created.data.id,
      client_id: report.clientId,
      assigned_by: isUuid(report.advisorId) ? report.advisorId : null,
      status: 'published',
    });
    if (assignment.error) throw new Error(`Relatório criado, mas a atribuição falhou: ${assignment.error.message}`);
  }

  return { reportId: created.data.id };
}

export async function syncContentToSupabase(content: WorkspaceContent) {
  if (!enabled()) return null;
  if (!isUuid(content.tenantId)) throw new Error('Workspace real sem tenant UUID válido.');

  const created = await supabase!
    .from('finsight_education_contents')
    .insert({
      tenant_id: content.tenantId,
      title: content.title,
      category: content.category,
      description: content.description,
      body: content.description,
      origin: content.origin || 'office',
      status: content.status || 'published',
      scheduled_at: content.scheduledAt || null,
      published_at: content.publishedAt || null,
    })
    .select('id')
    .single();

  if (created.error || !created.data?.id) {
    throw new Error(`Falha ao salvar conteúdo: ${created.error?.message || 'sem ID'}`);
  }

  if (isUuid(content.clientId)) {
    const assignment = await supabase!.from('finsight_content_assignments').insert({
      tenant_id: content.tenantId,
      content_id: created.data.id,
      client_id: content.clientId,
      assigned_by: null,
    });
    if (assignment.error) throw new Error(`Conteúdo criado, mas a atribuição falhou: ${assignment.error.message}`);
  }

  return { contentId: created.data.id };
}

export interface ProfessionalInvite {
  valid: boolean;
  role: 'advisor' | 'client';
  targetName: string;
  tenantName: string;
  brandName: string;
  expiresAt: string;
  acceptedAt?: string | null;
}

export async function getProfessionalInvite(token: string): Promise<ProfessionalInvite | null> {
  if (!enabled()) return null;
  const { data, error } = await supabase!.rpc('finsight_get_invite', { p_token: token });
  if (error) throw new Error(`Falha ao consultar convite: ${error.message}`);
  const row = firstRow(data as Array<{
    valid: boolean;
    role: 'advisor' | 'client';
    target_name: string;
    tenant_name: string;
    brand_name: string;
    expires_at: string;
    accepted_at?: string | null;
  }> | null);
  if (!row) return null;
  return {
    valid: row.valid,
    role: row.role,
    targetName: row.target_name,
    tenantName: row.tenant_name,
    brandName: row.brand_name,
    expiresAt: row.expires_at,
    acceptedAt: row.accepted_at,
  };
}

export async function acceptProfessionalInvite(token: string) {
  if (!enabled()) throw new Error('Login online não configurado.');
  const { data, error } = await supabase!.rpc('finsight_accept_invite', { p_token: token });
  if (error) throw new Error(`Falha ao aceitar convite: ${error.message}`);
  const row = firstRow(data as Array<{ tenant_id: string; role: 'advisor' | 'client' }> | null);
  if (!row) throw new Error('Convite aceito sem identidade de tenant retornada.');
  const refreshed = await supabase!.auth.refreshSession();
  if (refreshed.error) throw new Error(`Convite aceito, mas a sessão não foi atualizada: ${refreshed.error.message}`);
  return { tenantId: row.tenant_id, role: row.role };
}

export async function loadWorkspaceFromSupabase(): Promise<WorkspaceState | null> {
  if (!enabled()) return null;

  const identityResult = await supabase!.rpc('finsight_my_identity');
  if (identityResult.error) throw new Error(`Falha ao carregar identidade Professional: ${identityResult.error.message}`);
  const identity = firstRow(identityResult.data as Array<{ tenant_id: string; role: string }> | null);
  if (!identity?.tenant_id) return null;

  const tenantId = identity.tenant_id;
  const session = await supabase!.auth.getSession();
  const userId = session.data.session?.user.id || '';

  const [tenantRes, brandingRes, advisorsRes, clientsRes, reportsRes, reportAssignmentsRes, contentsRes, contentAssignmentsRes, invitesRes] = await Promise.all([
    supabase!.from('finsight_tenants').select('*').eq('id', tenantId).single(),
    supabase!.from('finsight_tenant_branding').select('*').eq('tenant_id', tenantId).maybeSingle(),
    supabase!.from('finsight_advisor_profiles').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
    supabase!.from('finsight_client_profiles').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
    supabase!.from('finsight_reports').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
    supabase!.from('finsight_report_assignments').select('*').eq('tenant_id', tenantId),
    supabase!.from('finsight_education_contents').select('*').eq('tenant_id', tenantId).order('created_at', { ascending: false }),
    supabase!.from('finsight_content_assignments').select('*').eq('tenant_id', tenantId),
    supabase!.from('finsight_invites').select('target_type,target_id,token,accepted_at').eq('tenant_id', tenantId),
  ]);

  if (tenantRes.error || !tenantRes.data) throw new Error(`Falha ao carregar escritório: ${tenantRes.error?.message || 'não encontrado'}`);
  const branding = brandingRes.data;
  const advisors = (advisorsRes.data || []).map((row) => ({
    id: row.id,
    tenantId,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    roleTitle: row.role_title,
    status: row.status === 'active' ? 'ativo' as const : 'convite_enviado' as const,
    createdAt: row.created_at,
  }));
  const invites = invitesRes.data || [];
  const clients = (clientsRes.data || []).map((row) => ({
    id: row.id,
    tenantId,
    advisorId: row.advisor_id || '',
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    profile: row.investor_profile,
    educationLevel: row.education_level,
    interests: row.interests || [],
    status: row.status === 'active' ? 'ativo' as const : 'convite_enviado' as const,
    inviteToken: invites.find((item) => item.target_type === 'client' && item.target_id === row.id && !item.accepted_at)?.token || '',
    createdAt: row.created_at,
  }));
  const reportAssignments = reportAssignmentsRes.data || [];
  const reports = (reportsRes.data || []).map((row) => {
    const assignment = reportAssignments.find((item) => item.report_id === row.id);
    return {
      id: row.id,
      tenantId,
      advisorId: row.advisor_id || '',
      clientId: assignment?.client_id || undefined,
      ticker: row.ticker || 'MACRO',
      title: row.title,
      summary: row.summary || '',
      type: row.report_type,
      visibility: assignment ? 'cliente' as const : 'interno' as const,
      createdAt: row.created_at,
    };
  });
  const contentAssignments = contentAssignmentsRes.data || [];
  const contents = (contentsRes.data || []).map((row) => {
    const assignment = contentAssignments.find((item) => item.content_id === row.id);
    return {
      id: row.id,
      tenantId,
      clientId: assignment?.client_id || undefined,
      title: row.title,
      category: row.category,
      description: row.description || '',
      origin: row.origin,
      status: row.status,
      scheduledAt: row.scheduled_at || undefined,
      publishedAt: row.published_at || undefined,
      createdAt: row.created_at,
    };
  });

  const activeAdvisor = (advisorsRes.data || []).find((row) => row.auth_user_id === userId);
  const activeClient = (clientsRes.data || []).find((row) => row.auth_user_id === userId);

  return {
    activeTenantId: tenantId,
    activeAdvisorId: activeAdvisor?.id || advisors[0]?.id || '',
    activeClientId: activeClient?.id || clients[0]?.id || '',
    tenants: [{
      id: tenantRes.data.id,
      name: tenantRes.data.name,
      brandName: tenantRes.data.brand_name,
      cnpj: tenantRes.data.cnpj || '',
      ownerName: tenantRes.data.owner_name || '',
      ownerEmail: tenantRes.data.owner_email || '',
      phone: tenantRes.data.phone || '',
      primaryColor: branding?.primary_color || '#22d3ee',
      secondaryColor: branding?.secondary_color || '#10b981',
      logoDataUrl: branding?.logo_url || '',
      createdAt: tenantRes.data.created_at,
    }],
    advisors,
    clients,
    reports,
    contents,
  };
}
