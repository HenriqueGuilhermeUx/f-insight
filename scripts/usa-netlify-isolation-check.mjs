/** Fail closed: inspect only the standalone US publish directory, never Brazilian dist/. */
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repo = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dir = resolve(repo, 'dist-usa-finsight');
const read = name => readFileSync(resolve(dir, name), 'utf8');
const walk = (path = dir) => readdirSync(path).flatMap(name => {
  const full = resolve(path, name);
  return statSync(full).isDirectory() ? walk(full) : [relative(dir, full).replaceAll('\\', '/')];
});
const names = walk().sort();
for (const required of ['index.html', '404.html', '_headers', '_redirects', 'robots.txt']) {
  assert.ok(names.includes(required), 'Missing USA artifact file: ' + required);
}
assert.ok(names.some(name => /^assets\/[\w.-]+\.js$/.test(name)), 'USA JavaScript missing');
assert.ok(names.some(name => /^assets\/[\w.-]+\.css$/.test(name)), 'USA stylesheet missing');
for (const name of names) {
  assert.match(name, /^(?:index\.html|404\.html|_headers|_redirects|robots\.txt|assets\/[\w.-]+\.(?:js|css))$/, 'Unexpected BR or PWA asset: ' + name);
}
assert.match(read('index.html'), /lang="en-US"/);
assert.match(read('index.html'), /noindex,nofollow/);
assert.doesNotMatch(read('index.html'), /manifest|serviceWorker|src\/main\.tsx/i);
const headers = read('_headers');
for (const rule of ["default-src 'none'", "connect-src 'none'", "form-action 'none'", "frame-ancestors 'none'", 'X-Robots-Tag: noindex']) {
  assert.ok(headers.includes(rule), 'Missing deny-by-default header: ' + rule);
}
const redirects = read('_redirects');
assert.match(redirects, /^\/us \/index\.html 200$/m);
assert.match(redirects, /^\/\* \/404\.html 404$/m);
assert.doesNotMatch(redirects, /^\/\* \/index\.html 200$/m);
const bundle = names.filter(name => /\.(?:js|css|html)$/.test(name)).map(read).join('\n');
for (const forbidden of [/onrender\.com/i, /supabase\.co/i, /alternativeventures\.com\.br/i, /mercadopago/i, /\/api\//i, /\/login\b/i, /\/cadastro\b/i, /serviceWorker\.register/i, /manifest\.json/i, /f-insight\.netlify\.app/i]) {
  assert.ok(!forbidden.test(bundle), 'Brazilian route, provider or PWA leaked into USA bundle: ' + forbidden);
}
assert.match(bundle, /F-Insight USA/);
assert.match(bundle, /hypothetical allocation/i);
console.log('PASS: standalone F-Insight USA bundle, route allowlist, no BR API/PWA assets, noindex, deny-by-default CSP');
