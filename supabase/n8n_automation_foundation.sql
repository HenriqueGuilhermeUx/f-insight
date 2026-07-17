-- F-Insight + n8n automation foundation
-- Rode este SQL no Supabase para registrar execuções e eventos das automações.

create extension if not exists pgcrypto;

create table if not exists public.automation_runs (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null,
  source text not null default 'n8n',
  event_type text not null,
  status text not null default 'received',
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_automation_runs_tenant_id on public.automation_runs(tenant_id);
create index if not exists idx_automation_runs_event_type on public.automation_runs(event_type);
create index if not exists idx_automation_runs_status on public.automation_runs(status);
create index if not exists idx_automation_runs_created_at on public.automation_runs(created_at desc);

alter table public.automation_runs enable row level security;

-- MVP: leitura pública para o painel admin/demo.
-- Em produção, trocar por política com auth/tenant.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'automation_runs'
      and policyname = 'automation runs public read mvp'
  ) then
    create policy "automation runs public read mvp"
      on public.automation_runs
      for select
      using (true);
  end if;
end $$;
