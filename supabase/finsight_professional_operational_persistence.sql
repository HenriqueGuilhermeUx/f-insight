-- F-Insight Professional operational persistence.
-- Applied to production after finsight_professional_private_helpers.sql.
-- Uses private tenant helpers for row-level isolation.

create table if not exists public.advisor_client_messages (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.finsight_tenants(id) on delete cascade,
  advisor_id uuid references public.finsight_advisor_profiles(id) on delete set null,
  client_id uuid references public.finsight_client_profiles(id) on delete set null,
  actor_user_id uuid default auth.uid(),
  sender_role text not null check (sender_role in ('admin','advisor','client')),
  subject text not null,
  body text not null,
  topic text not null default 'education' check (topic in ('report','news','macro','education','meeting','question')),
  status text not null default 'sent' check (status in ('sent','read','archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists advisor_client_messages_tenant_created_idx on public.advisor_client_messages(tenant_id, created_at desc);
create index if not exists advisor_client_messages_client_created_idx on public.advisor_client_messages(client_id, created_at desc);
alter table public.advisor_client_messages enable row level security;

drop policy if exists advisor_client_messages_select on public.advisor_client_messages;
create policy advisor_client_messages_select on public.advisor_client_messages for select to authenticated using (
  private.finsight_is_staff(tenant_id)
  or exists (
    select 1 from public.finsight_client_profiles cp
    where cp.id = client_id and cp.tenant_id = advisor_client_messages.tenant_id and cp.auth_user_id = auth.uid()
  )
);
drop policy if exists advisor_client_messages_insert on public.advisor_client_messages;
create policy advisor_client_messages_insert on public.advisor_client_messages for insert to authenticated with check (
  actor_user_id = auth.uid()
  and (
    private.finsight_is_staff(tenant_id)
    or (
      sender_role = 'client'
      and exists (
        select 1 from public.finsight_client_profiles cp
        where cp.id = client_id and cp.tenant_id = advisor_client_messages.tenant_id and cp.auth_user_id = auth.uid()
      )
    )
  )
);
drop policy if exists advisor_client_messages_update on public.advisor_client_messages;
create policy advisor_client_messages_update on public.advisor_client_messages for update to authenticated
using (
  private.finsight_is_staff(tenant_id)
  or exists (
    select 1 from public.finsight_client_profiles cp
    where cp.id = client_id and cp.tenant_id = advisor_client_messages.tenant_id and cp.auth_user_id = auth.uid()
  )
)
with check (
  private.finsight_is_staff(tenant_id)
  or exists (
    select 1 from public.finsight_client_profiles cp
    where cp.id = client_id and cp.tenant_id = advisor_client_messages.tenant_id and cp.auth_user_id = auth.uid()
  )
);
drop policy if exists advisor_client_messages_delete on public.advisor_client_messages;
create policy advisor_client_messages_delete on public.advisor_client_messages for delete to authenticated using (private.finsight_is_staff(tenant_id));
grant select, insert, update, delete on public.advisor_client_messages to authenticated;

create table if not exists public.follow_up_tasks (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.finsight_tenants(id) on delete cascade,
  advisor_id uuid references public.finsight_advisor_profiles(id) on delete set null,
  client_id uuid references public.finsight_client_profiles(id) on delete set null,
  client_name text not null,
  client_profile text not null default 'moderado',
  title text not null,
  reason text not null check (reason in ('report','macro','content','risk','meeting','news')),
  priority text not null default 'media' check (priority in ('alta','media','baixa')),
  suggested_action text not null default '',
  script text not null default '',
  status text not null default 'open' check (status in ('open','done')),
  due_at timestamptz not null,
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists follow_up_tasks_tenant_status_due_idx on public.follow_up_tasks(tenant_id, status, due_at);
create index if not exists follow_up_tasks_advisor_due_idx on public.follow_up_tasks(advisor_id, due_at);
alter table public.follow_up_tasks enable row level security;
drop policy if exists follow_up_tasks_select on public.follow_up_tasks;
create policy follow_up_tasks_select on public.follow_up_tasks for select to authenticated using (private.finsight_is_staff(tenant_id));
drop policy if exists follow_up_tasks_insert on public.follow_up_tasks;
create policy follow_up_tasks_insert on public.follow_up_tasks for insert to authenticated with check (private.finsight_is_staff(tenant_id));
drop policy if exists follow_up_tasks_update on public.follow_up_tasks;
create policy follow_up_tasks_update on public.follow_up_tasks for update to authenticated using (private.finsight_is_staff(tenant_id)) with check (private.finsight_is_staff(tenant_id));
drop policy if exists follow_up_tasks_delete on public.follow_up_tasks;
create policy follow_up_tasks_delete on public.follow_up_tasks for delete to authenticated using (private.finsight_is_staff(tenant_id));
grant select, insert, update, delete on public.follow_up_tasks to authenticated;

create table if not exists public.scheduled_updates (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.finsight_tenants(id) on delete cascade,
  created_by uuid not null default auth.uid(),
  title text not null,
  kind text not null check (kind in ('macro','news','content','report','meeting','risk')),
  audience text not null check (audience in ('all_clients','client_segment','specific_client','advisors')),
  channel text not null check (channel in ('portal','email','whatsapp','crm')),
  frequency text not null check (frequency in ('daily','weekly','monthly','event_driven')),
  day_of_week text,
  run_time text,
  status text not null default 'active' check (status in ('active','paused')),
  last_run_at timestamptz,
  next_run_at timestamptz not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists scheduled_updates_tenant_status_next_idx on public.scheduled_updates(tenant_id, status, next_run_at);
alter table public.scheduled_updates enable row level security;
drop policy if exists scheduled_updates_select on public.scheduled_updates;
create policy scheduled_updates_select on public.scheduled_updates for select to authenticated using (private.finsight_is_staff(tenant_id));
drop policy if exists scheduled_updates_insert on public.scheduled_updates;
create policy scheduled_updates_insert on public.scheduled_updates for insert to authenticated with check (created_by = auth.uid() and private.finsight_is_staff(tenant_id));
drop policy if exists scheduled_updates_update on public.scheduled_updates;
create policy scheduled_updates_update on public.scheduled_updates for update to authenticated using (private.finsight_is_staff(tenant_id)) with check (private.finsight_is_staff(tenant_id));
drop policy if exists scheduled_updates_delete on public.scheduled_updates;
create policy scheduled_updates_delete on public.scheduled_updates for delete to authenticated using (private.finsight_is_staff(tenant_id));
grant select, insert, update, delete on public.scheduled_updates to authenticated;
