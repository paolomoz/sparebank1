import { chromium } from 'playwright';
const [url, w, sel] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
console.log(await p.evaluate((s) => { const e = document.querySelector(s); return e ? e.outerHTML : 'no match'; }, sel));
await b.close();
