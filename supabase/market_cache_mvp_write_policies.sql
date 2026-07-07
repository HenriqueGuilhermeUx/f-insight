-- F-Insight MVP write policies for market cache
-- Run this in Supabase SQL Editor if backend refresh returns:
-- "new row violates row-level security policy" for market_* tables.
--
-- Best production setup: backend must use SUPABASE_SERVICE_ROLE_KEY.
-- This script is an MVP fallback to allow inserts/upserts while auth/RLS is being finalized.

alter table public.market_news enable row level security;
alter table public.market_indicator_snapshots enable row level security;
alter table public.market_macro_snapshots enable row level security;
alter table public.market_refresh_runs enable row level security;

-- News cache
DROP POLICY IF EXISTS "mvp write market news" ON public.market_news;
CREATE POLICY "mvp write market news"
ON public.market_news
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Indicator cache
DROP POLICY IF EXISTS "mvp write market indicators" ON public.market_indicator_snapshots;
CREATE POLICY "mvp write market indicators"
ON public.market_indicator_snapshots
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Macro cache
DROP POLICY IF EXISTS "mvp write market macro" ON public.market_macro_snapshots;
CREATE POLICY "mvp write market macro"
ON public.market_macro_snapshots
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Refresh logs
DROP POLICY IF EXISTS "mvp write refresh runs" ON public.market_refresh_runs;
CREATE POLICY "mvp write refresh runs"
ON public.market_refresh_runs
FOR ALL
TO anon, authenticated
USING (true)
WITH CHECK (true);
