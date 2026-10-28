# F-Insight USA — standalone Netlify review artifact

Branch: `feature/usa-localized-preview-20261024`. **Draft only; not a launch approval.**

The dedicated USA entry `usa-preview/main.tsx` imports only the illustrative US page and its locally computed allocation worksheet. `vite.usa.config.ts` deliberately excludes the Brazilian root entry, application router, `public/` directory, PWA, Supabase, market feeds, account services and payments.

Build with `pnpm exec vite build --config vite.usa.config.ts`, then run `node scripts/usa-netlify-isolation-check.mjs`. The GitHub Actions workflow runs those checks plus real-browser QA against the same isolated build and uploads `dist-usa-finsight/` for review.

**Do not connect the dedicated `av-usa-finsight` project to this repository using its default `netlify.toml`**: that config builds the Brazilian app and rewrites all routes. A safe publish must use only the reviewed `dist-usa-finsight` artifact and the included `_redirects` and `_headers` files. Only `/` and `/us` are allowed demo routes; all other routes return 404. No API, login, billing, brokerage, live prices, or data persistence is permitted. All examples are synthetic.

Before any public test, verify the deployed SHA/artifact against CI, actual Netlify deploy state, HTTP 200 for `/` and `/us`, HTTP 404 for `/login`, `/app`, `/api`, and Brazilian routes, CSP/noindex headers, no outgoing network calls, and desktop/mobile keyboard and visual QA. A site record without a successful deploy is **not** published.

No changes to Brazilian production or shared CI failure baselines are authorized.
