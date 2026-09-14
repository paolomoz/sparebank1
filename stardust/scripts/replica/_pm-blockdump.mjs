import { chromium } from 'playwright';
const [url, sel] = process.argv.slice(2); const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errs = []; p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 200)); }); p.on('pageerror', (e) => errs.push('pageerror ' + String(e).slice(0, 200)));
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(1000);
const r = await p.evaluate((sel) => [...document.querySelectorAll(sel)].map((e) => ({ cls: e.className, h: Math.round(e.getBoundingClientRect().height), html: e.outerHTML.slice(0, 700) })), sel);
console.log(JSON.stringify(r, null, 1).slice(0, 2500)); console.log('console errors:', errs.slice(0, 5)); await b.close();
