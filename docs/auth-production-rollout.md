# F-Insight auth production rollout

Production authentication uses the active Supabase project configured through Netlify public build variables.

Required browser configuration:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

Do not place Supabase secret or service-role keys in frontend variables or source control.

Authorization contract:

- public signup creates a `client` only;
- institutional roles come only from server-controlled `app_metadata`;
- watchlist, alerts and Premium billing use the authenticated user identity once the backend advertises `authenticated-owner-only`;
- the frontend keeps compatibility with the previous API contract during the coordinated rollout.
