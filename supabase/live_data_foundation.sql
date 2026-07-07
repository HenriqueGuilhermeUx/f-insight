-- F-Insight production foundation
-- Run this in Supabase SQL Editor.
-- Goal: Supabase as main database + live news/indicators cache + cron logs.

create extension if not exists pgcrypto;

-- 1) Notícias ao vivo/cacheadas pelo backend
create table if not exists public.market_news (
  id uuid primary key default gen_random_uuid(),
  provider text not null default 'finnhub',
  provider_id text not null,
  category text not null default 'general',
  title text not null,
  summary text,
  source text,
  url text,
  image_url text,
  published_at timestamptz not null default now(),
  tags text[] not null default '{}',
  sentiment text not null default 'neutral',
  raw jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(provider, provider_id)
);

create index if not exists idx_market_news_published_at on public.market_news(published_at desc);
create index if not exists idx_market_news_category on public.market_news(category);
create index if not exists idx_market_news_tags on public.market_news using gin(tags);

-- 2) Indicadores/preços cacheados pelo backend
create table if not exists public.market_indicator_snapshots (
  id uuid primary key default gen_random_uuid(),
  symbol text not null,
  provider text not null default 'finnhub',
  last_price numeric,
  change numeric,
  change_percent numeric,
  avg_volume numeric,
  candles jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(symbol, provider)
);

create index if not exists idx_market_indicator_snapshots_symbol on public.market_indicator_snapshots(symbol);
create index if not exists idx_market_indicator_snapshots_fetched_at on public.market_indicator_snapshots(fetched_at desc);

-- 3) Snapshots macro do Banco Central / fontes públicas
create table if not exists public.market_macro_snapshots (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  payload jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_market_macro_snapshots_fetched_at on public.market_macro_snapshots(fetched_at desc);

-- 4) Logs de execução dos crons/refreshs
create table if not exists public.market_refresh_runs (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  status text not null,
  metadata jsonb not null default '{}'::jsonb,
  ran_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_market_refresh_runs_kind on public.market_refresh_runs(kind);
create index if not exists idx_market_refresh_runs_ran_at on public.market_refresh_runs(ran_at desc);

-- 5) Rotinas programadas reais no banco
create table if not exists public.scheduled_updates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  title text not null,
  kind text not null,
  audience text not null default 'all_clients',
  channel text not null default 'portal',
  frequency text not null default 'weekly',
  day_of_week text,
  time text,
  status text not null default 'active',
  last_run_at timestamptz,
  next_run_at timestamptz,
  description text,
  created_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_scheduled_updates_tenant on public.scheduled_updates(tenant_id);
create index if not exists idx_scheduled_updates_status on public.scheduled_updates(status);
create index if not exists idx_scheduled_updates_next_run on public.scheduled_updates(next_run_at);

-- 6) Follow-ups reais do assessor
create table if not exists public.follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  advisor_id uuid references public.advisor_profiles(id) on delete set null,
  client_id uuid references public.client_profiles(id) on delete cascade,
  client_name text,
  client_profile text,
  title text not null,
  reason text not null,
  priority text not null default 'media',
  suggested_action text,
  script text,
  status text not null default 'open',
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_follow_up_tasks_tenant on public.follow_up_tasks(tenant_id);
create index if not exists idx_follow_up_tasks_status on public.follow_up_tasks(status);
create index if not exists idx_follow_up_tasks_due_at on public.follow_up_tasks(due_at);

-- 7) Comunicação assessor-cliente restrita a assuntos econômicos/educacionais
create table if not exists public.advisor_client_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  advisor_id uuid references public.advisor_profiles(id) on delete set null,
  client_id uuid references public.client_profiles(id) on delete cascade,
  sender_role text not null,
  subject text,
  body text not null,
  topic text not null default 'educational',
  status text not null default 'sent',
  related_report_id uuid references public.reports(id) on delete set null,
  related_content_id uuid references public.education_contents(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_advisor_client_messages_tenant on public.advisor_client_messages(tenant_id);
create index if not exists idx_advisor_client_messages_client on public.advisor_client_messages(client_id);
create index if not exists idx_advisor_client_messages_created_at on public.advisor_client_messages(created_at desc);

-- 8) Solicitações da Central de Contato
create table if not exists public.contact_requests (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid references public.tenants(id) on delete cascade,
  advisor_id uuid references public.advisor_profiles(id) on delete set null,
  client_id uuid references public.client_profiles(id) on delete set null,
  requester_role text not null,
  requester_name text,
  requester_email text,
  subject text not null,
  message text,
  status text not null default 'open',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_contact_requests_tenant on public.contact_requests(tenant_id);
create index if not exists idx_contact_requests_status on public.contact_requests(status);

-- RLS: manter ativo. Backend usa service_role. Front usa políticas MVP enquanto não tiver auth tenant-aware completo.
alter table public.market_news enable row level security;
alter table public.market_indicator_snapshots enable row level security;
alter table public.market_macro_snapshots enable row level security;
alter table public.market_refresh_runs enable row level security;
alter table public.scheduled_updates enable row level security;
alter table public.follow_up_tasks enable row level security;
alter table public.advisor_client_messages enable row level security;
alter table public.contact_requests enable row level security;

-- Leitura pública/demo para dados de mercado.
drop policy if exists "public read market news" on public.market_news;
create policy "public read market news" on public.market_news for select to anon, authenticated using (true);

drop policy if exists "public read market indicators" on public.market_indicator_snapshots;
create policy "public read market indicators" on public.market_indicator_snapshots for select to anon, authenticated using (true);

drop policy if exists "public read market macro" on public.market_macro_snapshots;
create policy "public read market macro" on public.market_macro_snapshots for select to anon, authenticated using (true);

drop policy if exists "public read refresh runs" on public.market_refresh_runs;
create policy "public read refresh runs" on public.market_refresh_runs for select to anon, authenticated using (true);

-- MVP: allow anon/auth to manage workflow tables until tenant-aware auth is finalized.
drop policy if exists "mvp manage scheduled updates" on public.scheduled_updates;
create policy "mvp manage scheduled updates" on public.scheduled_updates for all to anon, authenticated using (true) with check (true);

drop policy if exists "mvp manage follow ups" on public.follow_up_tasks;
create policy "mvp manage follow ups" on public.follow_up_tasks for all to anon, authenticated using (true) with check (true);

drop policy if exists "mvp manage advisor client messages" on public.advisor_client_messages;
create policy "mvp manage advisor client messages" on public.advisor_client_messages for all to anon, authenticated using (true) with check (true);

drop policy if exists "mvp manage contact requests" on public.contact_requests;
create policy "mvp manage contact requests" on public.contact_requests for all to anon, authenticated using (true) with check (true);
