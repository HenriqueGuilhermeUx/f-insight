-- F-Insight Public Portal MVP
-- Captura usuários públicos do /portal para funil, conteúdo e upsell B2B.

create extension if not exists pgcrypto;

create table if not exists public.public_portal_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  name text null,
  profile text not null default 'investidor',
  interests text[] not null default array[]::text[],
  source text not null default 'public_portal',
  status text not null default 'active',
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_public_portal_leads_profile on public.public_portal_leads(profile);
create index if not exists idx_public_portal_leads_created_at on public.public_portal_leads(created_at desc);

alter table public.public_portal_leads enable row level security;

-- MVP: permitir cadastro público por e-mail.
-- Em produção, manter insert/update controlado por função/backend se necessário.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'public_portal_leads'
      and policyname = 'public portal lead insert mvp'
  ) then
    create policy "public portal lead insert mvp"
      on public.public_portal_leads
      for insert
      to anon, authenticated
      with check (true);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'public_portal_leads'
      and policyname = 'public portal lead update own email mvp'
  ) then
    create policy "public portal lead update own email mvp"
      on public.public_portal_leads
      for update
      to anon, authenticated
      using (true)
      with check (true);
  end if;
end $$;
