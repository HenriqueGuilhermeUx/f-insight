-- Restrict newly created operational tables to authenticated CRUD only.
revoke all on public.advisor_client_messages from anon, authenticated;
revoke all on public.follow_up_tasks from anon, authenticated;
revoke all on public.scheduled_updates from anon, authenticated;

grant select, insert, update, delete on public.advisor_client_messages to authenticated;
grant select, insert, update, delete on public.follow_up_tasks to authenticated;
grant select, insert, update, delete on public.scheduled_updates to authenticated;
