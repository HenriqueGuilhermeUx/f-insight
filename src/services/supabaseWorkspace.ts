import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import type { WorkspaceAdvisor, WorkspaceClient, WorkspaceReport, WorkspaceTenant } from '@/services/workspace';

const DEMO_TENANT_ID = '00000000-0000-0000-0000-000000000001';

function enabled() {
  return Boolean(isSupabaseConfigured && supabase);
}

function dbTenantId(id: string) {
  return id && !id.startsWith('tenant_') ? id : DEMO_TENANT_ID;
}

function dbOptionalId(id?: string) {
  if (!id) return null;
  if (id.startsWith('advisor_') || id.startsWith('client_') || id.startsWith('report_')) return null;
  return id;
}

export async function syncTenantToSupabase(tenant: WorkspaceTenant, advisor?: WorkspaceAdvisor) {
  if (!enabled()) return;

  const created = await supabase!
    .from('tenants')
    .insert({
      name: tenant.name,
      brand_name: tenant.brandName,
      cnpj: tenant.cnpj || null,
      owner_name: tenant.ownerName,
      owner_email: tenant.ownerEmail,
      phone: tenant.phone || null,
      status: 'active',
    })
    .select('id')
    .single();

  if (created.error || !created.data?.id) {
    console.warn('Supabase tenant sync failed:', created.error?.message);
    return;
  }

  await supabase!.from('tenant_branding').upsert({
    tenant_id: created.data.id,
    logo_url: tenant.logoDataUrl || null,
    primary_color: tenant.primaryColor,
    secondary_color: tenant.secondaryColor,
  }, { onConflict: 'tenant_id' });

  if (advisor) {
    await supabase!.from('advisor_profiles').insert({
      tenant_id: created.data.id,
      name: advisor.name,
      email: advisor.email,
      phone: advisor.phone || null,
      role_title: advisor.roleTitle,
      status: advisor.status,
    });
  }
}

export async function syncAdvisorToSupabase(advisor: WorkspaceAdvisor) {
  if (!enabled()) return;
  const result = await supabase!.from('advisor_profiles').insert({
    tenant_id: dbTenantId(advisor.tenantId),
    name: advisor.name,
    email: advisor.email,
    phone: advisor.phone || null,
    role_title: advisor.roleTitle,
    status: advisor.status,
  });
  if (result.error) console.warn('Supabase advisor sync failed:', result.error.message);
}

export async function syncClientToSupabase(client: WorkspaceClient) {
  if (!enabled()) return;
  const created = await supabase!
    .from('client_profiles')
    .insert({
      tenant_id: dbTenantId(client.tenantId),
      advisor_id: dbOptionalId(client.advisorId),
      name: client.name,
      email: client.email,
      phone: client.phone || null,
      investor_profile: client.profile,
      education_level: client.educationLevel,
      interests: client.interests,
      status: client.status,
    })
    .select('id')
    .single();

  if (created.error || !created.data?.id) {
    console.warn('Supabase client sync failed:', created.error?.message);
    return;
  }

  await supabase!.from('client_invites').insert({
    tenant_id: dbTenantId(client.tenantId),
    client_id: created.data.id,
    token: client.inviteToken,
    email: client.email,
  });
}

export async function syncReportToSupabase(report: WorkspaceReport) {
  if (!enabled()) return;
  const created = await supabase!
    .from('reports')
    .insert({
      tenant_id: dbTenantId(report.tenantId),
      advisor_id: dbOptionalId(report.advisorId),
      ticker: report.ticker,
      title: report.title,
      summary: report.summary,
      report_type: report.type,
    })
    .select('id')
    .single();

  if (created.error || !created.data?.id) {
    console.warn('Supabase report sync failed:', created.error?.message);
    return;
  }

  const clientId = dbOptionalId(report.clientId);
  if (clientId) {
    await supabase!.from('report_assignments').insert({
      tenant_id: dbTenantId(report.tenantId),
      report_id: created.data.id,
      client_id: clientId,
      assigned_by: dbOptionalId(report.advisorId),
      status: 'published',
    });
  }
}
