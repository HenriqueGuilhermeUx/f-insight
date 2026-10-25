# Alternative Ventures USA — f-insight localization preview

Date: 2026-10-24
Branch: `feature/usa-localized-preview-20261024`
Status: **Preview only — not released, not production-enabled, no US checkout/account activation**.

## Purpose

A safe first step toward the US edition: direct English-language positioning and product discovery, without substituting American currencies, regulatory claims or data providers in existing Brazilian workflows.

## Changes

- `/us` serves a standalone English product preview.
- Files: `src/pages/USPreview.tsx`, `src/pages/USPreview.css`.
- The existing entry point `src/main.tsx` mounts the preview on that exact path only.
- Localized page title, metadata and `html[lang]` with cleanup on unmount.
- No calls to protected APIs, no user accounts, no pricing and no new form submission.
- Existing Brazilian routes, authentication, financial sources, app workflows, mobile screens, database and providers are untouched.

## Legal and regional boundaries

US real-time market data, NASDAQ/NYSE licensing, advice/SEC status, instruments, currency and billing must be verified before enabling US users. Existing Brazilian signals, macro indicators, sources and prices are not presented as US.

## Verification and release gates

- [ ] Run existing lint, tests, typecheck, build and security checks on this branch.
- [ ] Confirm `/us` loads directly and after page refresh under Netlify or the deployed hosting setup.
- [ ] Smoke-test the existing default Brazilian landing, authenticated app and critical actions.
- [ ] Check mobile width 320–430px, tablet and desktop, keyboard navigation, contrast and screen reader semantics.
- [ ] Confirm US sales terms, privacy disclosure, trademark, support and commercial content with product owner.
- [ ] Enable US activation only after region-scoped auth, infrastructure, data residency and entitlements are validated.

**Do not merge, publish, or redirect Brazilian traffic automatically.**

## Operational browser-only demonstration (2026-10-25)

An English hypothetical USD asset allocation worksheet was added to `/us` with editable budget and stocks/bonds/cash weights, simple allocation arithmetic, user-driven review checklist and optional manual copy. No real-time market data, portfolio execution, personalization or financial recommendations. It is not a production financial advisory service.

## Interactive preview inventory

- `/us` includes a hypothetical USD asset-allocation worksheet with Stocks, Bonds and Cash categories.
- User-entered illustrative figures are computed locally, without live market data, brokerage operations, performance forecasts or personalized advice.
- A local research checklist and clipboard export demonstrate the future US experience.
