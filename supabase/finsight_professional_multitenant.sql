-- F-Insight Professional secure multitenant foundation
-- Namespaced for the shared AV Data Hub Supabase project.
-- Safe to rerun: tables/indexes/functions/policies are idempotent or replaced.

create extension if not exists pgcrypto;

create table if not exists public.finsight_tenants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand_name text not null,
  cnpj text,
  owner_name text,
  owner_email text,
  phone text,
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.finsight_tenant_memberships (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.finsight_tenants(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('admin','advisor','client')),
  status text not null default 'active' check (status in ('active','inactive')),
  created_at timestamptz not null default now(),
  unique (tenant_id, user_id)
);

create unique index if not exists finsight_membership_one_active_tenant_per_user
  on public.finsight_tenant_memberships(user_id)
  where status = 'active';

create table if not exists public.finsight_tenant_branding (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null unique references public.finsight_tenants(id) on delete cascade,
  logo_url text,
  primary_color text not null default '#22d3ee',
  secondary_color text not null default '#10b981',
  disclosure text not null default 'Conteúdo educacional e informativo. Não representa recomendação individual, extrato, custódia ou posição real do cliente.',
  updated_at timestamptz not null default now()
);

create table if not exists public.finsight_advisor_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.finsight_tenants(id) on delete cascade,
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  role_title text not null default 'Assessor de Investimentos',
  status text not null default 'invite_sent' check (status in ('invite_sent','active','inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.finsight_client_profiles (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.finsight_tenants(id) on delete cascade,
  advisor_id uuid references public.finsight_advisor_profiles(id) on delete set null,
  auth_user_id uuid references auth.users(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  investor_profile text not null default 'moderado' check (investor_profile in ('conservador','moderado','arrojado')),
  education_level text not null default 'intermediario' check (education_level in ('iniciante','intermediario','avancado')),
  interests text[] not null default '{}',
  status text not null default 'invite_sent' check (status in ('invite_sent','active','inactive')),
  created_at timestamptz not null default now()
);

create table if not exists public.finsight_invites (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.finsight_tenants(id) on delete cascade,
  target_type text not null check (target_type in ('advisor','client')),
  target_id uuid not null,
  role text not null check (role in ('advisor','client')),
  token text not null unique,
  email text not null,
  expires_at timestamptz not null default (now() + interval '14 days'),
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.finsight_reports (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.finsight_tenants(id) on delete cascade,
  advisor_id uuid references public.finsight_advisor_profiles(id) on delete set null,
  ticker text,
  title text not null,
  summary text,
  report_type text not null default 'educacional' check (report_type in ('valuation','macro','educacional','reuniao')),
  pdf_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.finsight_report_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.finsight_tenants(id) on delete cascade,
  report_id uuid not null references public.finsight_reports(id) on delete cascade,
  client_id uuid not null references public.finsight_client_profiles(id) on delete cascade,
  assigned_by uuid references public.finsight_advisor_profiles(id) on delete set null,
  status text not null default 'published',
  created_at timestamptz not null default now()
);

create table if not exists public.finsight_education_contents (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.finsight_tenants(id) on delete cascade,
  title text not null,
  category text not null,
  description text,
  body text,
  origin text not null default 'office' check (origin in ('f_insight','office','advisor')),
  status text not null default 'published' check (status in ('draft','scheduled','published')),
  scheduled_at timestamptz,
  published_at timestamptz,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.finsight_content_assignments (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.finsight_tenants(id) on delete cascade,
  content_id uuid not null references public.finsight_education_contents(id) on delete cascade,
  client_id uuid not null references public.finsight_client_profiles(id) on delete cascade,
  assigned_by uuid references public.finsight_advisor_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.finsight_audit_logs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.finsight_tenants(id) on delete cascade,
  actor_user_id uuid references auth.users(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_finsight_memberships_tenant on public.finsight_tenant_memberships(tenant_id);
create index if not exists idx_finsight_memberships_user on public.finsight_tenant_memberships(user_id);
create index if not exists idx_finsight_advisors_tenant on public.finsight_advisor_profiles(tenant_id);
create index if not exists idx_finsight_clients_tenant on public.finsight_client_profiles(tenant_id);
create index if not exists idx_finsight_clients_advisor on public.finsight_client_profiles(advisor_id);
create index if not exists idx_finsight_invites_token on public.finsight_invites(token);
create index if not exists idx_finsight_reports_tenant on public.finsight_reports(tenant_id);
create index if not exists idx_finsight_contents_tenant on public.finsight_education_contents(tenant_id);

create or replace function public.finsight_current_tenant_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select tenant_id
  from public.finsight_tenant_memberships
  where user_id = auth.uid() and status = 'active'
  order by created_at
  limit 1
$$;

create or replace function public.finsight_current_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.finsight_tenant_memberships
  where user_id = auth.uid() and status = 'active'
  order by created_at
  limit 1
$$;

create or replace function public.finsight_is_member(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.finsight_tenant_memberships
    where user_id = auth.uid() and tenant_id = p_tenant_id and status = 'active'
  )
$$;

create or replace function public.finsight_is_staff(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.finsight_tenant_memberships
    where user_id = auth.uid() and tenant_id = p_tenant_id and status = 'active' and role in ('admin','advisor')
  )
$$;

create or replace function public.finsight_is_admin(p_tenant_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.finsight_tenant_memberships
    where user_id = auth.uid() and tenant_id = p_tenant_id and status = 'active' and role = 'admin'
  )
$$;

create or replace function public.finsight_my_identity()
returns table (tenant_id uuid, role text)
language sql
stable
security definer
set search_path = public
as $$
  select m.tenant_id, m.role
  from public.finsight_tenant_memberships m
  where m.user_id = auth.uid() and m.status = 'active'
  order by m.created_at
  limit 1
$$;

create or replace function public.finsight_create_tenant(
  p_name text,
  p_brand_name text,
  p_cnpj text default null,
  p_owner_name text default null,
  p_owner_email text default null,
  p_phone text default null,
  p_primary_color text default '#22d3ee',
  p_secondary_color text default '#10b981'
)
returns table (tenant_id uuid, advisor_id uuid)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_tenant_id uuid;
  v_advisor_id uuid;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  select email into v_email
  from auth.users
  where id = v_user_id and email_confirmed_at is not null;

  if v_email is null then
    raise exception 'confirmed email required';
  end if;

  if exists (select 1 from public.finsight_tenant_memberships where user_id = v_user_id and status = 'active') then
    raise exception 'user already belongs to an active tenant';
  end if;

  insert into public.finsight_tenants (name, brand_name, cnpj, owner_name, owner_email, phone)
  values (
    nullif(trim(p_name), ''),
    coalesce(nullif(trim(p_brand_name), ''), nullif(trim(p_name), '')),
    nullif(trim(coalesce(p_cnpj, '')), ''),
    coalesce(nullif(trim(coalesce(p_owner_name, '')), ''), split_part(v_email, '@', 1)),
    coalesce(nullif(trim(coalesce(p_owner_email, '')), ''), v_email),
    nullif(trim(coalesce(p_phone, '')), '')
  ) returning id into v_tenant_id;

  insert into public.finsight_tenant_memberships (tenant_id, user_id, role)
  values (v_tenant_id, v_user_id, 'admin');

  insert into public.finsight_tenant_branding (tenant_id, primary_color, secondary_color)
  values (v_tenant_id, coalesce(nullif(p_primary_color,''),'#22d3ee'), coalesce(nullif(p_secondary_color,''),'#10b981'));

  insert into public.finsight_advisor_profiles (tenant_id, auth_user_id, name, email, phone, role_title, status)
  values (
    v_tenant_id,
    v_user_id,
    coalesce(nullif(trim(coalesce(p_owner_name, '')), ''), split_part(v_email, '@', 1)),
    v_email,
    nullif(trim(coalesce(p_phone, '')), ''),
    'Administrador do Escritório',
    'active'
  ) returning id into v_advisor_id;

  insert into public.finsight_audit_logs (tenant_id, actor_user_id, action, entity_type, entity_id)
  values (v_tenant_id, v_user_id, 'tenant.created', 'tenant', v_tenant_id);

  return query select v_tenant_id, v_advisor_id;
end;
$$;

create or replace function public.finsight_create_advisor_invite(
  p_name text,
  p_email text,
  p_phone text default null,
  p_role_title text default 'Assessor de Investimentos'
)
returns table (advisor_id uuid, invite_token text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid := public.finsight_current_tenant_id();
  v_advisor_id uuid;
  v_token text := encode(gen_random_bytes(18), 'hex');
begin
  if v_tenant_id is null or not public.finsight_is_admin(v_tenant_id) then
    raise exception 'admin membership required';
  end if;

  insert into public.finsight_advisor_profiles (tenant_id, name, email, phone, role_title, status)
  values (v_tenant_id, trim(p_name), lower(trim(p_email)), nullif(trim(coalesce(p_phone,'')),''), coalesce(nullif(trim(p_role_title),''),'Assessor de Investimentos'), 'invite_sent')
  returning id into v_advisor_id;

  insert into public.finsight_invites (tenant_id, target_type, target_id, role, token, email)
  values (v_tenant_id, 'advisor', v_advisor_id, 'advisor', v_token, lower(trim(p_email)));

  return query select v_advisor_id, v_token;
end;
$$;

create or replace function public.finsight_create_client_invite(
  p_name text,
  p_email text,
  p_phone text default null,
  p_investor_profile text default 'moderado',
  p_education_level text default 'intermediario',
  p_interests text[] default '{}',
  p_advisor_id uuid default null
)
returns table (client_id uuid, invite_token text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tenant_id uuid := public.finsight_current_tenant_id();
  v_client_id uuid;
  v_token text := encode(gen_random_bytes(18), 'hex');
begin
  if v_tenant_id is null or not public.finsight_is_staff(v_tenant_id) then
    raise exception 'staff membership required';
  end if;

  if p_advisor_id is not null and not exists (
    select 1 from public.finsight_advisor_profiles where id = p_advisor_id and tenant_id = v_tenant_id
  ) then
    raise exception 'advisor does not belong to tenant';
  end if;

  insert into public.finsight_client_profiles (
    tenant_id, advisor_id, name, email, phone, investor_profile, education_level, interests, status
  ) values (
    v_tenant_id,
    p_advisor_id,
    trim(p_name),
    lower(trim(p_email)),
    nullif(trim(coalesce(p_phone,'')),''),
    p_investor_profile,
    p_education_level,
    coalesce(p_interests, '{}'),
    'invite_sent'
  ) returning id into v_client_id;

  insert into public.finsight_invites (tenant_id, target_type, target_id, role, token, email)
  values (v_tenant_id, 'client', v_client_id, 'client', v_token, lower(trim(p_email)));

  return query select v_client_id, v_token;
end;
$$;

create or replace function public.finsight_get_invite(p_token text)
returns table (
  valid boolean,
  role text,
  target_name text,
  tenant_name text,
  brand_name text,
  expires_at timestamptz,
  accepted_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  return query
  select
    (i.accepted_at is null and i.expires_at > now()) as valid,
    i.role,
    case when i.target_type = 'advisor' then a.name else c.name end as target_name,
    t.name,
    t.brand_name,
    i.expires_at,
    i.accepted_at
  from public.finsight_invites i
  join public.finsight_tenants t on t.id = i.tenant_id
  left join public.finsight_advisor_profiles a on i.target_type = 'advisor' and a.id = i.target_id
  left join public.finsight_client_profiles c on i.target_type = 'client' and c.id = i.target_id
  where i.token = p_token
  limit 1;
end;
$$;

create or replace function public.finsight_accept_invite(p_token text)
returns table (tenant_id uuid, role text)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_user_id uuid := auth.uid();
  v_email text;
  v_invite public.finsight_invites%rowtype;
begin
  if v_user_id is null then
    raise exception 'authentication required';
  end if;

  select lower(email) into v_email from auth.users where id = v_user_id;
  select * into v_invite from public.finsight_invites where token = p_token for update;

  if v_invite.id is null or v_invite.accepted_at is not null or v_invite.expires_at <= now() then
    raise exception 'invite invalid or expired';
  end if;
  if v_email is distinct from lower(v_invite.email) then
    raise exception 'invite email mismatch';
  end if;
  if exists (select 1 from public.finsight_tenant_memberships where user_id = v_user_id and status = 'active') then
    raise exception 'user already belongs to an active tenant';
  end if;

  insert into public.finsight_tenant_memberships (tenant_id, user_id, role)
  values (v_invite.tenant_id, v_user_id, v_invite.role);

  if v_invite.target_type = 'advisor' then
    update public.finsight_advisor_profiles set auth_user_id = v_user_id, status = 'active' where id = v_invite.target_id and tenant_id = v_invite.tenant_id;
  else
    update public.finsight_client_profiles set auth_user_id = v_user_id, status = 'active' where id = v_invite.target_id and tenant_id = v_invite.tenant_id;
  end if;

  update public.finsight_invites set accepted_at = now() where id = v_invite.id;

  return query select v_invite.tenant_id, v_invite.role;
end;
$$;

alter table public.finsight_tenants enable row level security;
alter table public.finsight_tenant_memberships enable row level security;
alter table public.finsight_tenant_branding enable row level security;
alter table public.finsight_advisor_profiles enable row level security;
alter table public.finsight_client_profiles enable row level security;
alter table public.finsight_invites enable row level security;
alter table public.finsight_reports enable row level security;
alter table public.finsight_report_assignments enable row level security;
alter table public.finsight_education_contents enable row level security;
alter table public.finsight_content_assignments enable row level security;
alter table public.finsight_audit_logs enable row level security;

drop policy if exists finsight_tenants_select on public.finsight_tenants;
drop policy if exists finsight_tenants_update on public.finsight_tenants;
create policy finsight_tenants_select on public.finsight_tenants for select to authenticated using (public.finsight_is_member(id));
create policy finsight_tenants_update on public.finsight_tenants for update to authenticated using (public.finsight_is_admin(id)) with check (public.finsight_is_admin(id));

drop policy if exists finsight_memberships_select on public.finsight_tenant_memberships;
drop policy if exists finsight_memberships_manage on public.finsight_tenant_memberships;
create policy finsight_memberships_select on public.finsight_tenant_memberships for select to authenticated using (user_id = auth.uid() or public.finsight_is_admin(tenant_id));
create policy finsight_memberships_manage on public.finsight_tenant_memberships for all to authenticated using (public.finsight_is_admin(tenant_id)) with check (public.finsight_is_admin(tenant_id));

drop policy if exists finsight_branding_select on public.finsight_tenant_branding;
drop policy if exists finsight_branding_manage on public.finsight_tenant_branding;
create policy finsight_branding_select on public.finsight_tenant_branding for select to authenticated using (public.finsight_is_member(tenant_id));
create policy finsight_branding_manage on public.finsight_tenant_branding for all to authenticated using (public.finsight_is_admin(tenant_id)) with check (public.finsight_is_admin(tenant_id));

drop policy if exists finsight_advisors_select on public.finsight_advisor_profiles;
drop policy if exists finsight_advisors_manage on public.finsight_advisor_profiles;
create policy finsight_advisors_select on public.finsight_advisor_profiles for select to authenticated using (public.finsight_is_member(tenant_id));
create policy finsight_advisors_manage on public.finsight_advisor_profiles for all to authenticated using (public.finsight_is_admin(tenant_id)) with check (public.finsight_is_admin(tenant_id));

drop policy if exists finsight_clients_select on public.finsight_client_profiles;
drop policy if exists finsight_clients_manage on public.finsight_client_profiles;
create policy finsight_clients_select on public.finsight_client_profiles for select to authenticated using (public.finsight_is_staff(tenant_id) or auth_user_id = auth.uid());
create policy finsight_clients_manage on public.finsight_client_profiles for all to authenticated using (public.finsight_is_staff(tenant_id)) with check (public.finsight_is_staff(tenant_id));

drop policy if exists finsight_invites_staff on public.finsight_invites;
create policy finsight_invites_staff on public.finsight_invites for all to authenticated using (public.finsight_is_staff(tenant_id)) with check (public.finsight_is_staff(tenant_id));

drop policy if exists finsight_reports_select on public.finsight_reports;
drop policy if exists finsight_reports_manage on public.finsight_reports;
create policy finsight_reports_select on public.finsight_reports for select to authenticated using (
  public.finsight_is_staff(tenant_id) or exists (
    select 1 from public.finsight_report_assignments ra
    join public.finsight_client_profiles cp on cp.id = ra.client_id
    where ra.report_id = finsight_reports.id and cp.auth_user_id = auth.uid()
  )
);
create policy finsight_reports_manage on public.finsight_reports for all to authenticated using (public.finsight_is_staff(tenant_id)) with check (public.finsight_is_staff(tenant_id));

drop policy if exists finsight_report_assignments_select on public.finsight_report_assignments;
drop policy if exists finsight_report_assignments_manage on public.finsight_report_assignments;
create policy finsight_report_assignments_select on public.finsight_report_assignments for select to authenticated using (
  public.finsight_is_staff(tenant_id) or exists (
    select 1 from public.finsight_client_profiles cp where cp.id = client_id and cp.auth_user_id = auth.uid()
  )
);
create policy finsight_report_assignments_manage on public.finsight_report_assignments for all to authenticated using (public.finsight_is_staff(tenant_id)) with check (public.finsight_is_staff(tenant_id));

drop policy if exists finsight_contents_select on public.finsight_education_contents;
drop policy if exists finsight_contents_manage on public.finsight_education_contents;
create policy finsight_contents_select on public.finsight_education_contents for select to authenticated using (
  public.finsight_is_staff(tenant_id)
  or (status = 'published' and public.finsight_is_member(tenant_id))
);
create policy finsight_contents_manage on public.finsight_education_contents for all to authenticated using (public.finsight_is_staff(tenant_id)) with check (public.finsight_is_staff(tenant_id));

drop policy if exists finsight_content_assignments_select on public.finsight_content_assignments;
drop policy if exists finsight_content_assignments_manage on public.finsight_content_assignments;
create policy finsight_content_assignments_select on public.finsight_content_assignments for select to authenticated using (
  public.finsight_is_staff(tenant_id) or exists (
    select 1 from public.finsight_client_profiles cp where cp.id = client_id and cp.auth_user_id = auth.uid()
  )
);
create policy finsight_content_assignments_manage on public.finsight_content_assignments for all to authenticated using (public.finsight_is_staff(tenant_id)) with check (public.finsight_is_staff(tenant_id));

drop policy if exists finsight_audit_admin_select on public.finsight_audit_logs;
drop policy if exists finsight_audit_staff_insert on public.finsight_audit_logs;
create policy finsight_audit_admin_select on public.finsight_audit_logs for select to authenticated using (tenant_id is not null and public.finsight_is_admin(tenant_id));
create policy finsight_audit_staff_insert on public.finsight_audit_logs for insert to authenticated with check (tenant_id is not null and public.finsight_is_staff(tenant_id) and actor_user_id = auth.uid());

revoke all on function public.finsight_create_tenant(text,text,text,text,text,text,text,text) from public, anon;
revoke all on function public.finsight_create_advisor_invite(text,text,text,text) from public, anon;
revoke all on function public.finsight_create_client_invite(text,text,text,text,text,text[],uuid) from public, anon;
revoke all on function public.finsight_accept_invite(text) from public, anon;
revoke all on function public.finsight_my_identity() from public, anon;
revoke all on function public.finsight_get_invite(text) from public;

grant execute on function public.finsight_create_tenant(text,text,text,text,text,text,text,text) to authenticated;
grant execute on function public.finsight_create_advisor_invite(text,text,text,text) to authenticated;
grant execute on function public.finsight_create_client_invite(text,text,text,text,text,text[],uuid) to authenticated;
grant execute on function public.finsight_accept_invite(text) to authenticated;
grant execute on function public.finsight_my_identity() to authenticated;
grant execute on function public.finsight_get_invite(text) to anon, authenticated;
