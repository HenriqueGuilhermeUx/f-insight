-- F-Insight White Label launch schema
-- Run this in Supabase SQL Editor when moving from demo/localStorage to production persistence.

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
  updated_at timestamptz not null default now()
);

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  tenant_id uuid references public.tenants(id) on delete cascade,
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

-- MVP policies for authenticated users. Tighten before production with tenant-aware auth claims.
create policy "authenticated read tenants" on public.tenants for select to authenticated using (true);
create policy "authenticated manage tenants" on public.tenants for all to authenticated using (true) with check (true);

create policy "authenticated manage branding" on public.tenant_branding for all to authenticated using (true) with check (true);
create policy "authenticated manage profiles" on public.profiles for all to authenticated using (true) with check (true);
create policy "authenticated manage advisors" on public.advisor_profiles for all to authenticated using (true) with check (true);
create policy "authenticated manage clients" on public.client_profiles for all to authenticated using (true) with check (true);
create policy "authenticated manage invites" on public.client_invites for all to authenticated using (true) with check (true);
create policy "authenticated manage reports" on public.reports for all to authenticated using (true) with check (true);
create policy "authenticated manage report assignments" on public.report_assignments for all to authenticated using (true) with check (true);
create policy "authenticated manage contents" on public.education_contents for all to authenticated using (true) with check (true);
create policy "authenticated manage content assignments" on public.content_assignments for all to authenticated using (true) with check (true);
create policy "authenticated manage logs" on public.audit_logs for all to authenticated using (true) with check (true);
