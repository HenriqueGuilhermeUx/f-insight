-- Follow-up hardening applied after finsight_professional_multitenant.sql.
-- Internal RLS helper functions live in a non-exposed schema; only intentional RPCs remain public.

create schema if not exists private;
revoke all on schema private from public, anon;
grant usage on schema private to authenticated;

-- Production database migration name: finsight_professional_private_helpers.
-- See the Supabase migration history for the applied definitions and policy rewiring.
-- Public SECURITY DEFINER RPCs intentionally retained:
--   finsight_create_tenant: verified authenticated user self-provisions one tenant.
--   finsight_get_invite: possession of a high-entropy token returns sanitized invite metadata.
--   finsight_accept_invite: authenticated user may accept only a matching-email invite.
-- Identity, advisor invite and client invite operations use normal RLS/security-invoker paths.
