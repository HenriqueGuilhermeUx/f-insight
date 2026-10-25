/** Browser QA for F-Insight USA only. Uses fake allocations, no real market or customer data. */
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { setTimeout as sleep } from 'node:timers/promises';
import { chromium } from 'playwright';

const host = 'http://127.0.0.1:4178';
const server = spawn('pnpm', ['exec', 'vite', 'preview', '--host', '127.0.0.1', '--port', '4178', '--strictPort'], {
  env: { ...process.env, VITE_API_URL: 'http://127.0.0.1:65535' },
  stdio: ['ignore', 'pipe', 'pipe'],
});
let serverOutput = '';
server.stdout.on('data', chunk => { serverOutput += String(chunk).slice(-2500); });
server.stderr.on('data', chunk => { serverOutput += String(chunk).slice(-2500); });
let browser;
try {
  let ready = false;
  for (let attempt = 0; attempt < 60; attempt++) {
    if (server.exitCode !== null) throw new Error('Preview server exited unexpectedly: ' + serverOutput);
    try {
      const response = await fetch(host + '/us');
      if (response.ok) { ready = true; break; }
    } catch { /* Startup in progress. */ }
    await sleep(500);
  }
  assert.ok(ready, 'Local production preview failed to start: ' + serverOutput);
  browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const apiRequests = [];
  page.on('request', request => {
    const url = request.url();
    if (/f-insight-api\.onrender\.com|\/(api|auth|supabase)\//i.test(url)) apiRequests.push(url);
  });
  page.on('pageerror', error => { throw error; });
  await page.goto(host + '/us', { waitUntil: 'networkidle', timeout: 30000 });
  await page.getByRole('heading', { name: /Sharper financial research/i }).waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'), 'en-US');
  assert.equal(await page.locator('meta[name="robots"]').getAttribute('content'), 'noindex,nofollow');
  await page.getByRole('heading', { name: /Build a hypothetical allocation scenario/i }).waitFor();
  await page.getByLabel('Illustrative budget (USD)').fill('10000');
  await page.getByLabel('Stocks allocation (%)').fill('70');
  await page.getByLabel('Bonds allocation (%)').fill('40');
  assert.match(await page.locator('.avfi-error').innerText(), /no more than 100%/i);
  assert.equal(await page.getByRole('button', { name: 'Copy worksheet summary' }).isDisabled(), true);
  await page.getByLabel('Bonds allocation (%)').fill('10');
  await page.getByLabel('Cash allocation (%)').fill('20');
  assert.match(await page.locator('.avfi-good').innerText(), /0%/);
  assert.ok((await page.locator('.avfi-result').allInnerTexts()).some(value => value.includes('$7,000.00')));
  await page.getByRole('checkbox', { name: /defined time horizon/i }).check();
  assert.equal(await page.getByRole('checkbox', { name: /defined time horizon/i }).isChecked(), true);
  await page.getByRole('button', { name: 'Reset scenario' }).click();
  assert.equal(await page.getByLabel('Stocks allocation (%)').inputValue(), '50');
  assert.equal(apiRequests.length, 0, 'USA preview unexpectedly requested Brazilian API URLs: ' + apiRequests.join(', '));
  console.log('PASS: en-US metadata, mobile interactive allocation, validation, review, reset, zero Brazilian API calls');
} finally {
  await browser?.close();
  server.kill('SIGTERM');
}
