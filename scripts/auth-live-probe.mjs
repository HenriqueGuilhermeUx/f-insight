import fs from 'node:fs';
import crypto from 'node:crypto';

if (process.env.CONTEXT !== 'deploy-preview') {
  console.log('Auth live probe skipped outside Netlify deploy-preview context.');
  process.exit(0);
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const publishableKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const email = 'finsight-e2e-20260918-authprobe@example.com';
const password = `E2E-${crypto.randomBytes(18).toString('base64url')}aA7!`;

if (!supabaseUrl || !publishableKey) {
  throw new Error('Netlify deploy preview is missing Supabase public auth variables.');
}

const response = await fetch(`${supabaseUrl.replace(/\/$/, '')}/auth/v1/signup`, {
  method: 'POST',
  headers: {
    apikey: publishableKey,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email,
    password,
    data: { full_name: 'F-Insight E2E Probe' },
  }),
});

const body = await response.json().catch(() => ({}));
if (!response.ok) {
  throw new Error(`Live Supabase signup failed with HTTP ${response.status}: ${body?.msg || body?.message || body?.error || 'unknown error'}`);
}
if (!body?.user?.id) {
  throw new Error('Live Supabase signup did not return a user id.');
}

const result = {
  ok: true,
  userId: body.user.id,
  email,
  sessionPresent: Boolean(body.access_token),
  emailConfirmedAt: body.user.email_confirmed_at || null,
};

fs.writeFileSync('dist/auth-live-probe.json', JSON.stringify(result, null, 2));
console.log(`Auth live probe succeeded. Session present: ${result.sessionPresent}; confirmed: ${Boolean(result.emailConfirmedAt)}`);
