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

function page(name) {
  fs.writeFileSync(`dist/${name}.html`, '<!doctype html><meta charset="utf-8"><title>F-Insight auth probe</title><p>probe outcome recorded</p>');
}

if (!supabaseUrl || !publishableKey) {
  page('probe-missing-env');
  process.exit(1);
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
  page(`probe-http-${response.status}`);
  process.exit(1);
}
if (!body?.user?.id) {
  page('probe-no-user');
  process.exit(1);
}

page(body.access_token ? 'probe-success-session' : 'probe-success-confirmation-required');
fs.writeFileSync('dist/auth-live-probe.json', JSON.stringify({
  ok: true,
  userId: body.user.id,
  email,
  sessionPresent: Boolean(body.access_token),
  emailConfirmedAt: body.user.email_confirmed_at || null,
}, null, 2));
