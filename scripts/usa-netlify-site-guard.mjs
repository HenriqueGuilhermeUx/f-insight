/**
 * Fail closed before building the dedicated F-Insight USA Netlify preview.
 * This is a build-time gate, not proof of HTTP or visual deploy safety.
 */
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const siteId = '9f4a4804-6640-49f5-9769-892e1f283ee3';
const branch = 'feature/usa-localized-preview-20261024';

assert.equal(process.env.SITE_ID, siteId,
  'Refusing USA build: SITE_ID is not the dedicated F-Insight USA project');
assert.equal(process.env.BRANCH, branch,
  'Refusing USA build: BRANCH is not the reviewed USA draft branch');
assert.equal(process.env.CONTEXT, 'production',
  'Refusing USA build: only the dedicated project production context is allowed');

const forbidden = Object.keys(process.env).filter(key =>
  /^(?:VITE_|NEXT_PUBLIC_|PUBLIC_|SUPABASE_|STRIPE_|MERCADOPAGO_|FOXBIT_|WOOVI_|PRIVY_|ALCHEMY_)/.test(key) ||
  /^(?:DATABASE_URL|DIRECT_URL|API_URL|BACKEND_URL|OPENAI_API_KEY|NETLIFY_AUTH_TOKEN)$/.test(key)
);
assert.deepEqual(forbidden, [],
  'Refusing USA build: inherited application/provider environment keys: ' + forbidden.join(', '));

const config = readFileSync('deploy/netlify/f-insight/netlify.toml', 'utf8');
for (const required of [
  /publish\s*=\s*"dist-usa-finsight"/,
  /scripts\/usa-netlify-site-guard\.mjs/,
  /vite\.usa\.config\.ts/,
  /scripts\/usa-netlify-isolation-check\.mjs/,
]) {
  assert.match(config, required, 'Missing isolated USA build guard or output');
}
assert.doesNotMatch(config, /onrender\.com|supabase\.co|\/\*\s+\/index\.html/i,
  'Refusing USA build: BR provider or catch-all SPA rewrite in USA config');

console.log('PASS: dedicated F-Insight USA Netlify site/branch/context, no inherited provider environment, isolated build');
