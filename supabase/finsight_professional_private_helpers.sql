-- F-Insight Professional helper hardening.
-- Applied to production after finsight_professional_multitenant.sql.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

create or replace function private.finsight_current_tenant_id() returns uuid language sql stable security definer set search_path=public as $$
 select tenant_id from public.finsight_tenant_memberships where user_id=auth.uid() and status='active' order by created_at limit 1
$$;
create or replace function private.finsight_is_member(p_tenant_id uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.finsight_tenant_memberships where user_id=auth.uid() and tenant_id=p_tenant_id and status='active')
$$;
create or replace function private.finsight_is_staff(p_tenant_id uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.finsight_tenant_memberships where user_id=auth.uid() and tenant_id=p_tenant_id and status='active' and role in ('admin','advisor'))
$$;
create or replace function private.finsight_is_admin(p_tenant_id uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.finsight_tenant_memberships where user_id=auth.uid() and tenant_id=p_tenant_id and status='active' and role='admin')
$$;
create or replace function private.finsight_can_read_report(p_report_id uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.finsight_report_assignments ra join public.finsight_client_profiles cp on cp.id=ra.client_id where ra.report_id=p_report_id and cp.auth_user_id=auth.uid())
$$;
create or replace function private.finsight_can_read_content(p_content_id uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.finsight_content_assignments ca join public.finsight_client_profiles cp on cp.id=ca.client_id where ca.content_id=p_content_id and cp.auth_user_id=auth.uid())
 or (not exists(select 1 from public.finsight_content_assignments ca2 where ca2.content_id=p_content_id) and exists(select 1 from public.finsight_education_contents ec where ec.id=p_content_id and ec.status='published' and private.finsight_is_member(ec.tenant_id)))
$$;

revoke all on function private.finsight_current_tenant_id() from public,anon;
revoke all on function private.finsight_is_member(uuid) from public,anon;
revoke all on function private.finsight_is_staff(uuid) from public,anon;
revoke all on function private.finsight_is_admin(uuid) from public,anon;
revoke all on function private.finsight_can_read_report(uuid) from public,anon;
revoke all on function private.finsight_can_read_content(uuid) from public,anon;
grant execute on function private.finsight_current_tenant_id() to authenticated;
grant execute on function private.finsight_is_member(uuid) to authenticated;
grant execute on function private.finsight_is_staff(uuid) to authenticated;
grant execute on function private.finsight_is_admin(uuid) to authenticated;
grant execute on function private.finsight_can_read_report(uuid) to authenticated;
grant execute on function private.finsight_can_read_content(uuid) to authenticated;

create or replace function public.finsight_my_identity() returns table(tenant_id uuid,role text) language sql stable security invoker set search_path=public as $$
 select m.tenant_id,m.role from public.finsight_tenant_memberships m where m.user_id=auth.uid() and m.status='active' order by m.created_at limit 1
$$;

create or replace function public.finsight_create_advisor_invite(p_name text,p_email text,p_phone text default null,p_role_title text default 'Assessor de Investimentos')
returns table(advisor_id uuid,invite_token text) language plpgsql security invoker set search_path=public,private as $$
declare v_tenant uuid:=private.finsight_current_tenant_id(); v_advisor uuid; v_token text:=encode(gen_random_bytes(18),'hex');
begin
 if v_tenant is null or not private.finsight_is_admin(v_tenant) then raise exception 'admin membership required'; end if;
 insert into public.finsight_advisor_profiles(tenant_id,name,email,phone,role_title,status) values(v_tenant,trim(p_name),lower(trim(p_email)),nullif(trim(coalesce(p_phone,'')),''),coalesce(nullif(trim(p_role_title),''),'Assessor de Investimentos'),'invite_sent') returning id into v_advisor;
 insert into public.finsight_invites(tenant_id,target_type,target_id,role,token,email) values(v_tenant,'advisor',v_advisor,'advisor',v_token,lower(trim(p_email)));
 return query select v_advisor,v_token;
end $$;

create or replace function public.finsight_create_client_invite(p_name text,p_email text,p_phone text default null,p_investor_profile text default 'moderado',p_education_level text default 'intermediario',p_interests text[] default '{}',p_advisor_id uuid default null)
returns table(client_id uuid,invite_token text) language plpgsql security invoker set search_path=public,private as $$
declare v_tenant uuid:=private.finsight_current_tenant_id(); v_client uuid; v_token text:=encode(gen_random_bytes(18),'hex');
begin
 if v_tenant is null or not private.finsight_is_staff(v_tenant) then raise exception 'staff membership required'; end if;
 if p_advisor_id is not null and not exists(select 1 from public.finsight_advisor_profiles where id=p_advisor_id and tenant_id=v_tenant) then raise exception 'advisor does not belong to tenant'; end if;
 insert into public.finsight_client_profiles(tenant_id,advisor_id,name,email,phone,investor_profile,education_level,interests,status)
 values(v_tenant,p_advisor_id,trim(p_name),lower(trim(p_email)),nullif(trim(coalesce(p_phone,'')),''),p_investor_profile,p_education_level,coalesce(p_interests,'{}'),'invite_sent') returning id into v_client;
 insert into public.finsight_invites(tenant_id,target_type,target_id,role,token,email) values(v_tenant,'client',v_client,'client',v_token,lower(trim(p_email)));
 return query select v_client,v_token;
end $$;

drop policy if exists finsight_tenants_select on public.finsight_tenants; create policy finsight_tenants_select on public.finsight_tenants for select to authenticated using(private.finsight_is_member(id));
drop policy if exists finsight_tenants_update on public.finsight_tenants; create policy finsight_tenants_update on public.finsight_tenants for update to authenticated using(private.finsight_is_admin(id)) with check(private.finsight_is_admin(id));
drop policy if exists finsight_memberships_select on public.finsight_tenant_memberships; create policy finsight_memberships_select on public.finsight_tenant_memberships for select to authenticated using(user_id=auth.uid() or private.finsight_is_admin(tenant_id));
drop policy if exists finsight_memberships_manage on public.finsight_tenant_memberships; create policy finsight_memberships_manage on public.finsight_tenant_memberships for all to authenticated using(private.finsight_is_admin(tenant_id)) with check(private.finsight_is_admin(tenant_id));
drop policy if exists finsight_branding_select on public.finsight_tenant_branding; create policy finsight_branding_select on public.finsight_tenant_branding for select to authenticated using(private.finsight_is_member(tenant_id));
drop policy if exists finsight_branding_manage on public.finsight_tenant_branding; create policy finsight_branding_manage on public.finsight_tenant_branding for all to authenticated using(private.finsight_is_admin(tenant_id)) with check(private.finsight_is_admin(tenant_id));
drop policy if exists finsight_advisors_select on public.finsight_advisor_profiles; create policy finsight_advisors_select on public.finsight_advisor_profiles for select to authenticated using(private.finsight_is_member(tenant_id));
drop policy if exists finsight_advisors_manage on public.finsight_advisor_profiles; create policy finsight_advisors_manage on public.finsight_advisor_profiles for all to authenticated using(private.finsight_is_admin(tenant_id)) with check(private.finsight_is_admin(tenant_id));
drop policy if exists finsight_clients_select on public.finsight_client_profiles; create policy finsight_clients_select on public.finsight_client_profiles for select to authenticated using(private.finsight_is_staff(tenant_id) or auth_user_id=auth.uid());
drop policy if exists finsight_clients_manage on public.finsight_client_profiles; create policy finsight_clients_manage on public.finsight_client_profiles for all to authenticated using(private.finsight_is_staff(tenant_id)) with check(private.finsight_is_staff(tenant_id));
drop policy if exists finsight_invites_staff on public.finsight_invites; create policy finsight_invites_staff on public.finsight_invites for all to authenticated using(private.finsight_is_staff(tenant_id)) with check(private.finsight_is_staff(tenant_id));
drop policy if exists finsight_reports_select on public.finsight_reports; create policy finsight_reports_select on public.finsight_reports for select to authenticated using(private.finsight_is_staff(tenant_id) or private.finsight_can_read_report(id));
drop policy if exists finsight_reports_manage on public.finsight_reports; create policy finsight_reports_manage on public.finsight_reports for all to authenticated using(private.finsight_is_staff(tenant_id)) with check(private.finsight_is_staff(tenant_id));
drop policy if exists finsight_report_assignments_select on public.finsight_report_assignments; create policy finsight_report_assignments_select on public.finsight_report_assignments for select to authenticated using(private.finsight_is_staff(tenant_id) or private.finsight_can_read_report(report_id));
drop policy if exists finsight_report_assignments_manage on public.finsight_report_assignments; create policy finsight_report_assignments_manage on public.finsight_report_assignments for all to authenticated using(private.finsight_is_staff(tenant_id)) with check(private.finsight_is_staff(tenant_id));
drop policy if exists finsight_contents_select on public.finsight_education_contents; create policy finsight_contents_select on public.finsight_education_contents for select to authenticated using(private.finsight_is_staff(tenant_id) or private.finsight_can_read_content(id));
drop policy if exists finsight_contents_manage on public.finsight_education_contents; create policy finsight_contents_manage on public.finsight_education_contents for all to authenticated using(private.finsight_is_staff(tenant_id)) with check(private.finsight_is_staff(tenant_id));
drop policy if exists finsight_content_assignments_select on public.finsight_content_assignments; create policy finsight_content_assignments_select on public.finsight_content_assignments for select to authenticated using(private.finsight_is_staff(tenant_id) or private.finsight_can_read_content(content_id));
drop policy if exists finsight_content_assignments_manage on public.finsight_content_assignments; create policy finsight_content_assignments_manage on public.finsight_content_assignments for all to authenticated using(private.finsight_is_staff(tenant_id)) with check(private.finsight_is_staff(tenant_id));
drop policy if exists finsight_audit_select on public.finsight_audit_logs; create policy finsight_audit_select on public.finsight_audit_logs for select to authenticated using(tenant_id is not null and private.finsight_is_admin(tenant_id));
drop policy if exists finsight_audit_insert on public.finsight_audit_logs; create policy finsight_audit_insert on public.finsight_audit_logs for insert to authenticated with check(tenant_id is not null and private.finsight_is_staff(tenant_id) and actor_user_id=auth.uid());

revoke all on function public.finsight_current_tenant_id() from public,anon,authenticated;
revoke all on function public.finsight_current_role() from public,anon,authenticated;
revoke all on function public.finsight_is_member(uuid) from public,anon,authenticated;
revoke all on function public.finsight_is_staff(uuid) from public,anon,authenticated;
revoke all on function public.finsight_is_admin(uuid) from public,anon,authenticated;
revoke all on function public.finsight_can_read_report(uuid) from public,anon,authenticated;
revoke all on function public.finsight_can_read_content(uuid) from public,anon,authenticated;
drop function public.finsight_current_tenant_id();
drop function public.finsight_current_role();
drop function public.finsight_is_member(uuid);
drop function public.finsight_is_staff(uuid);
drop function public.finsight_is_admin(uuid);
drop function public.finsight_can_read_report(uuid);
drop function public.finsight_can_read_content(uuid);
