# F-Insight USA — standalone Netlify review artifact

Branch: `feature/usa-localized-preview-20261024`. **Draft only; not a launch approval.**

The dedicated USA entry `usa-preview/main.tsx` imports only the illustrative US page and its locally computed allocation worksheet. `vite.usa.config.ts` deliberately excludes the Brazilian root entry, application router, `public/` directory, PWA, Supabase, market feeds, account services and payments.

Build with `pnpm exec vite build --config vite.usa.config.ts`, then run `node scripts/usa-netlify-isolation-check.mjs`. The GitHub Actions workflow runs those checks plus real-browser QA against the same isolated build and uploads `dist-usa-finsight/` for review.

**Do not connect the dedicated `av-usa-finsight` project to this repository using its default `netlify.toml`**: that config builds the Brazilian app and rewrites all routes. A safe publish must use only the reviewed `dist-usa-finsight` artifact and the included `_redirects` and `_headers` files. Only `/` and `/us` are allowed demo routes; all other routes return 404. No API, login, billing, brokerage, live prices, or data persistence is permitted. All examples are synthetic.

Before any public test, verify the deployed SHA/artifact against CI, actual Netlify deploy state, HTTP 200 for `/` and `/us`, HTTP 404 for `/login`, `/app`, `/api`, and Brazilian routes, CSP/noindex headers, no outgoing network calls, and desktop/mobile keyboard and visual QA. A site record without a successful deploy is **not** published.

No changes to Brazilian production or shared CI failure baselines are authorized.

## Dedicated Netlify Git build (2026-10-28)

The dedicated project `av-usa-finsight` (site ID `9f4a4804-6640-49f5-9769-892e1f283ee3`) has a separate `deploy/netlify/f-insight/netlify.toml`. **Only in that USA project**, select `deploy/netlify/f-insight` as the Netlify **Package directory** and leave **Base directory** unset. Do not modify the Brazilian site's settings or the root `netlify.toml`.

The dedicated build runs `scripts/usa-netlify-site-guard.mjs` before installing or building. It requires the exact USA site ID, the `feature/usa-localized-preview-20261024` branch and Netlify's `production` context; it rejects inherited frontend, database, API and financial-provider environment keys. The build uses `vite.usa.config.ts`, publishes only `dist-usa-finsight` and runs the existing artifact isolation check. CI exercises both accepted and rejected guard scenarios. This is a build safety gate, **not a deploy approval**.

Keep SSO team login enabled on every deploy. After configuring the project, verify the resulting deploy ID, exact commit SHA, processed redirect/header rules, authenticated HTTP responses and network requests, and mobile/desktop visuals. Reject any deployment that serves the Brazilian SPA or lacks the USA security headers. The Netlify integration may not expose Package directory editing; in that case leave the site unpublished rather than connecting the default build. Do not merge the draft PR or enable real login, billing, APIs or providers.
