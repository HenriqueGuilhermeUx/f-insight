-- F-Insight temporary MVP demo policies
-- Use ONLY while there is no production login/auth flow.
-- This lets the public frontend write demo data to Supabase with the anon key.
-- Before real launch, remove these policies and use tenant-aware authenticated RLS.

drop policy if exists "mvp anon manage tenants" on public.tenants;
drop policy if exists "mvp anon manage branding" on public.tenant_branding;
drop policy if exists "mvp anon manage advisors" on public.advisor_profiles;
drop policy if exists "mvp anon manage clients" on public.client_profiles;
drop policy if exists "mvp anon manage invites" on public.client_invites;
drop policy if exists "mvp anon manage reports" on public.reports;
drop policy if exists "mvp anon manage report assignments" on public.report_assignments;
drop policy if exists "mvp anon manage contents" on public.education_contents;
drop policy if exists "mvp anon manage content assignments" on public.content_assignments;
drop policy if exists "mvp anon manage logs" on public.audit_logs;

create policy "mvp anon manage tenants"
on public.tenants
for all
to anon
using (true)
with check (true);

create policy "mvp anon manage branding"
on public.tenant_branding
for all
to anon
using (true)
with check (true);

create policy "mvp anon manage advisors"
on public.advisor_profiles
for all
to anon
using (true)
with check (true);

create policy "mvp anon manage clients"
on public.client_profiles
for all
to anon
using (true)
with check (true);

create policy "mvp anon manage invites"
on public.client_invites
for all
to anon
using (true)
with check (true);

create policy "mvp anon manage reports"
on public.reports
for all
to anon
using (true)
with check (true);

create policy "mvp anon manage report assignments"
on public.report_assignments
for all
to anon
using (true)
with check (true);

create policy "mvp anon manage contents"
on public.education_contents
for all
to anon
using (true)
with check (true);

create policy "mvp anon manage content assignments"
on public.content_assignments
for all
to anon
using (true)
with check (true);

create policy "mvp anon manage logs"
on public.audit_logs
for all
to anon
using (true)
with check (true);
