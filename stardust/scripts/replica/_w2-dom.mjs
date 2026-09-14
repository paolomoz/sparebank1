// _w2-dom.mjs <url> <width> <selector> — print the decorated outerHTML of matching elements (attributes + structure, text truncated)
import { chromium } from 'playwright';
const [url, w, sel] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
const out = await p.evaluate((s) => [...document.querySelectorAll(s)].map((e) => e.outerHTML.replace(/>([^<]{40})[^<]*</g, '>$1…<')), sel);
console.log(out.join('\n\n')); await b.close();
