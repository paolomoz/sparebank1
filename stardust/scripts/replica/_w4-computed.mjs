// _w4-computed.mjs <url> <width> <selector> — computed font/margins of the first matches
import { chromium } from 'playwright';
const [url, w, sel] = process.argv.slice(2); const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
console.log(await p.evaluate((sel) => [...document.querySelectorAll(sel)].slice(0, 4).map((e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return `${e.tagName}.${e.className} ${Math.round(r.width)}x${Math.round(r.height)} font=${cs.fontSize}/${cs.lineHeight} m=${cs.marginTop}/${cs.marginBottom} :: ${e.textContent.trim().slice(0, 30)}`; }).join('\n'), sel));
await b.close();
