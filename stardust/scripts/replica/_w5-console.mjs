// _w5-console.mjs <url> <width> — print console errors / failed requests / block statuses for an EDS page
import { chromium } from 'playwright';
const [url, w] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +(w || 1440), height: 900 } });
p.on('console', (m) => { if (['error', 'warning'].includes(m.type())) console.log(`[console.${m.type()}]`, m.text().slice(0, 300)); });
p.on('pageerror', (e) => console.log('[pageerror]', String(e).slice(0, 300)));
p.on('requestfailed', (r) => console.log('[requestfailed]', r.url().slice(0, 120), r.failure()?.errorText));
p.on('response', (r) => { if (r.status() >= 400 && !/sparebank1\.no/.test(r.url())) console.log(`[${r.status()}]`, r.url().slice(0, 140)); });
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
console.log(await p.evaluate(() => [...document.querySelectorAll('.block')].map((b) => `${b.className} → ${b.dataset.blockStatus}`).join('\n')));
await b.close();
