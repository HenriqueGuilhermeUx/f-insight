-- F-Insight White Label launch schema
-- Run in Supabase SQL Editor.
-- Safe to rerun: tables/indexes are idempotent and policies are dropped/recreated.

create extension if not exists "uuid-ossp";

create table if not exists public.tenants (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  brand_name text not null,
  cnpj text,
  owner_name text,
  owner_email text,
  phone text,
  status text not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists public.tenant_branding (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  logo_url text,
  primary_color text not null default '#22d3ee',
  secondary_color text not null default '#10b981',
  disclosure text not null default 'Conteúdo educacional e informativo. Não representa recomendação individual, extrato, custódia ou posição real do cliente.',
  updated_at timestamptz not null default now(),
  unique (tenant_id)
);

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  auth_user_id uuid,
  email text not null unique,
  full_name text not null,
  role text not null check (role in ('platform_admin', 'tenant_admin', 'advisor', 'client')),
  created_at timestamptz not null default now()
);

create table if not exists public.advisor_profiles (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  role_title text default 'Assessor de Investimentos',
  status text not null default 'invite_sent',
  created_at timestamptz not null default now()
);

create table if not exists public.client_profiles (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  advisor_id uuid references public.advisor_profiles(id) on delete set null,
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  email text not null,
  phone text,
  investor_profile text check (investor_profile in ('conservador', 'moderado', 'arrojado')) default 'moderado',
  education_level text check (education_level in ('iniciante', 'intermediario', 'avancado')) default 'intermediario',
  interests text[] default '{}',
  status text not null default 'invite_sent',
  created_at timestamptz not null default now()
);

create table if not exists public.client_invites (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  client_id uuid references public.client_profiles(id) on delete cascade,
  token text not null unique,
  email text not null,
  expires_at timestamptz,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.reports (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  advisor_id uuid references public.advisor_profiles(id) on delete set null,
  ticker text,
  title text not null,
  summary text,
  report_type text check (report_type in ('valuation', 'macro', 'educacional', 'reuniao')) default 'educacional',
  pdf_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.report_assignments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  report_id uuid not null references public.reports(id) on delete cascade,
  client_id uuid references public.client_profiles(id) on delete cascade,
  assigned_by uuid references public.advisor_profiles(id) on delete set null,
  status text not null default 'published',
  created_at timestamptz not null default now()
);

create table if not exists public.education_contents (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  title text not null,
  category text not null,
  description text,
  body text,
  created_at timestamptz not null default now()
);

create table if not exists public.content_assignments (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  content_id uuid not null references public.education_contents(id) on delete cascade,
  client_id uuid references public.client_profiles(id) on delete cascade,
  assigned_by uuid references public.advisor_profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  actor_profile_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}',
  created_at timestamptz not null default now()
);

create index if not exists idx_tenant_branding_tenant_id on public.tenant_branding(tenant_id);
create index if not exists idx_profiles_tenant_id on public.profiles(tenant_id);
create index if not exists idx_profiles_auth_user_id on public.profiles(auth_user_id);
create index if not exists idx_advisor_profiles_tenant_id on public.advisor_profiles(tenant_id);
create index if not exists idx_client_profiles_tenant_id on public.client_profiles(tenant_id);
create index if not exists idx_client_profiles_advisor_id on public.client_profiles(advisor_id);
create index if not exists idx_client_invites_token on public.client_invites(token);
create index if not exists idx_reports_tenant_id on public.reports(tenant_id);
create index if not exists idx_report_assignments_client_id on public.report_assignments(client_id);
create index if not exists idx_content_assignments_client_id on public.content_assignments(client_id);
create index if not exists idx_audit_logs_tenant_id on public.audit_logs(tenant_id);

alter table public.tenants enable row level security;
alter table public.tenant_branding enable row level security;
alter table public.profiles enable row level security;
alter table public.advisor_profiles enable row level security;
alter table public.client_profiles enable row level security;
alter table public.client_invites enable row level security;
alter table public.reports enable row level security;
alter table public.report_assignments enable row level security;
alter table public.education_contents enable row level security;
alter table public.content_assignments enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "authenticated read tenants" on public.tenants;
drop policy if exists "authenticated manage tenants" on public.tenants;
drop policy if exists "authenticated manage branding" on public.tenant_branding;
drop policy if exists "authenticated manage profiles" on public.profiles;
drop policy if exists "authenticated manage advisors" on public.advisor_profiles;
drop policy if exists "authenticated manage clients" on public.client_profiles;
drop policy if exists "authenticated manage invites" on public.client_invites;
drop policy if exists "public read invite by token" on public.client_invites;
drop policy if exists "authenticated manage reports" on public.reports;
drop policy if exists "authenticated manage report assignments" on public.report_assignments;
drop policy if exists "authenticated manage contents" on public.education_contents;
drop policy if exists "authenticated manage content assignments" on public.content_assignments;
drop policy if exists "authenticated manage logs" on public.audit_logs;

-- MVP policies. For production, tighten with tenant-aware auth claims.
create policy "authenticated read tenants" on public.tenants for select to authenticated using (true);
create policy "authenticated manage tenants" on public.tenants for all to authenticated using (true) with check (true);
create policy "authenticated manage branding" on public.tenant_branding for all to authenticated using (true) with check (true);
create policy "authenticated manage profiles" on public.profiles for all to authenticated using (true) with check (true);
create policy "authenticated manage advisors" on public.advisor_profiles for all to authenticated using (true) with check (true);
create policy "authenticated manage clients" on public.client_profiles for all to authenticated using (true) with check (true);
create policy "authenticated manage invites" on public.client_invites for all to authenticated using (true) with check (true);
create policy "public read invite by token" on public.client_invites for select to anon using (accepted_at is null and (expires_at is null or expires_at > now()));
create policy "authenticated manage reports" on public.reports for all to authenticated using (true) with check (true);
create policy "authenticated manage report assignments" on public.report_assignments for all to authenticated using (true) with check (true);
create policy "authenticated manage contents" on public.education_contents for all to authenticated using (true) with check (true);
create policy "authenticated manage content assignments" on public.content_assignments for all to authenticated using (true) with check (true);
create policy "authenticated manage logs" on public.audit_logs for all to authenticated using (true) with check (true);

-- Optional demo seed. Safe to rerun.
insert into public.tenants (id, name, brand_name, owner_name, owner_email, status)
values ('00000000-0000-0000-0000-000000000001', 'Escritório Demo', 'Escritório Demo Investimentos', 'Admin Demo', 'admin@demo.com', 'active')
on conflict (id) do nothing;

insert into public.tenant_branding (tenant_id, primary_color, secondary_color)
values ('00000000-0000-0000-0000-000000000001', '#22d3ee', '#10b981')
on conflict (tenant_id) do nothing;
