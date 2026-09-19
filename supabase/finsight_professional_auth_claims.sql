-- F-Insight Professional server-controlled authorization claims.
-- Applied after the multitenant foundation and private helper hardening.

create or replace function public.finsight_create_tenant(p_name text,p_brand_name text,p_cnpj text default null,p_owner_name text default null,p_owner_email text default null,p_phone text default null,p_primary_color text default '#22d3ee',p_secondary_color text default '#10b981')
returns table(tenant_id uuid,advisor_id uuid) language plpgsql security definer set search_path=public,auth as $$
declare v_user uuid:=auth.uid(); v_email text; v_tenant uuid; v_advisor uuid;
begin
 if v_user is null then raise exception 'authentication required'; end if;
 select email into v_email from auth.users where id=v_user and email_confirmed_at is not null;
 if v_email is null then raise exception 'confirmed email required'; end if;
 if exists(select 1 from public.finsight_tenant_memberships where user_id=v_user and status='active') then raise exception 'user already belongs to active tenant'; end if;
 insert into public.finsight_tenants(name,brand_name,cnpj,owner_name,owner_email,phone)
 values(nullif(trim(p_name),''),coalesce(nullif(trim(p_brand_name),''),nullif(trim(p_name),'')),nullif(trim(coalesce(p_cnpj,'')),''),coalesce(nullif(trim(coalesce(p_owner_name,'')),''),split_part(v_email,'@',1)),coalesce(nullif(trim(coalesce(p_owner_email,'')),''),v_email),nullif(trim(coalesce(p_phone,'')),'')) returning id into v_tenant;
 insert into public.finsight_tenant_memberships(tenant_id,user_id,role) values(v_tenant,v_user,'admin');
 insert into public.finsight_tenant_branding(tenant_id,primary_color,secondary_color) values(v_tenant,coalesce(nullif(p_primary_color,''),'#22d3ee'),coalesce(nullif(p_secondary_color,''),'#10b981'));
 insert into public.finsight_advisor_profiles(tenant_id,auth_user_id,name,email,phone,role_title,status)
 values(v_tenant,v_user,coalesce(nullif(trim(coalesce(p_owner_name,'')),''),split_part(v_email,'@',1)),v_email,nullif(trim(coalesce(p_phone,'')),''),'Administrador do Escritório','active') returning id into v_advisor;
 update auth.users set raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb)||jsonb_build_object('role','admin','tenant_id',v_tenant::text) where id=v_user;
 insert into public.finsight_audit_logs(tenant_id,actor_user_id,action,entity_type,entity_id) values(v_tenant,v_user,'tenant.created','tenant',v_tenant);
 return query select v_tenant,v_advisor;
end $$;

create or replace function public.finsight_accept_invite(p_token text)
returns table(tenant_id uuid,role text) language plpgsql security definer set search_path=public,auth as $$
declare v_user uuid:=auth.uid(); v_email text; v_invite public.finsight_invites%rowtype;
begin
 if v_user is null then raise exception 'authentication required'; end if;
 select lower(email) into v_email from auth.users where id=v_user;
 select * into v_invite from public.finsight_invites where token=p_token for update;
 if v_invite.id is null or v_invite.accepted_at is not null or v_invite.expires_at<=now() then raise exception 'invite invalid or expired'; end if;
 if v_email is distinct from lower(v_invite.email) then raise exception 'invite email mismatch'; end if;
 if exists(select 1 from public.finsight_tenant_memberships where user_id=v_user and status='active') then raise exception 'user already belongs to active tenant'; end if;
 insert into public.finsight_tenant_memberships(tenant_id,user_id,role) values(v_invite.tenant_id,v_user,v_invite.role);
 if v_invite.target_type='advisor' then update public.finsight_advisor_profiles set auth_user_id=v_user,status='active' where id=v_invite.target_id and tenant_id=v_invite.tenant_id;
 else update public.finsight_client_profiles set auth_user_id=v_user,status='active' where id=v_invite.target_id and tenant_id=v_invite.tenant_id; end if;
 update public.finsight_invites set accepted_at=now() where id=v_invite.id;
 update auth.users set raw_app_meta_data=coalesce(raw_app_meta_data,'{}'::jsonb)||jsonb_build_object('role',v_invite.role,'tenant_id',v_invite.tenant_id::text) where id=v_user;
 return query select v_invite.tenant_id,v_invite.role;
end $$;
