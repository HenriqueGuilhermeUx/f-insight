-- F-Insight Billing MVP - Woovi/Pix
-- Rode este SQL no Supabase antes de usar cobrança real.

create extension if not exists pgcrypto;

create table if not exists public.billing_invoices (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid null,
  plan_id text not null,
  plan_name text not null,
  customer_name text not null,
  customer_email text null,
  customer_tax_id text null,
  amount_cents integer not null,
  currency text not null default 'BRL',
  status text not null default 'pending',
  provider text not null default 'woovi',
  correlation_id text not null unique,
  provider_charge_id text null,
  payment_link_url text null,
  br_code text null,
  qr_code_image text null,
  paid_at timestamptz null,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_billing_invoices_tenant_id on public.billing_invoices(tenant_id);
create index if not exists idx_billing_invoices_status on public.billing_invoices(status);
create index if not exists idx_billing_invoices_correlation_id on public.billing_invoices(correlation_id);

alter table public.billing_invoices enable row level security;

-- MVP: leitura pública apenas para demo/admin frontend.
-- Em produção, trocar por políticas com auth/tenant.
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'billing_invoices'
      and policyname = 'billing invoices public read mvp'
  ) then
    create policy "billing invoices public read mvp"
      on public.billing_invoices
      for select
      using (true);
  end if;
end $$;
