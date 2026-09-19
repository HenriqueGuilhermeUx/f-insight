-- F-Insight privacy request queue.
-- Gives authenticated users a self-service way to request account/data deletion.

create table if not exists public.finsight_privacy_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  request_email text not null,
  request_type text not null check (request_type in ('account_delete','data_delete')),
  details text,
  status text not null default 'requested' check (status in ('requested','in_review','completed','rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  processed_at timestamptz
);

alter table public.finsight_privacy_requests enable row level security;

revoke all on table public.finsight_privacy_requests from public, anon;
revoke all on table public.finsight_privacy_requests from authenticated;
grant select, insert on table public.finsight_privacy_requests to authenticated;

drop policy if exists finsight_privacy_requests_select_own on public.finsight_privacy_requests;
create policy finsight_privacy_requests_select_own
  on public.finsight_privacy_requests
  for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists finsight_privacy_requests_insert_own on public.finsight_privacy_requests;
create policy finsight_privacy_requests_insert_own
  on public.finsight_privacy_requests
  for insert
  to authenticated
  with check (user_id = auth.uid());

create index if not exists finsight_privacy_requests_user_created_idx
  on public.finsight_privacy_requests(user_id, created_at desc);
create index if not exists finsight_privacy_requests_status_created_idx
  on public.finsight_privacy_requests(status, created_at asc);
