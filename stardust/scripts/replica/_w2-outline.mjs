// _w2-outline.mjs <url> <width> <selector> — y / height / class of each matching top-level module (for module-by-module alignment)
import { chromium } from 'playwright';
const [url, w, sel = 'main > *'] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' });
await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
await p.waitForTimeout(500);
const rows = await p.evaluate((s) => [...document.querySelectorAll(s)].map((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return [Math.round(r.y + scrollY), Math.round(r.height), Math.round(r.x), Math.round(r.width), `${cs.marginTop}/${cs.paddingTop}..${cs.paddingBottom}/${cs.marginBottom}`, (e.getAttribute('class') || e.tagName.toLowerCase()).slice(0, 60)]; }), sel);
for (const r of rows) console.log(`${String(r[0]).padStart(5)} h${String(r[1]).padStart(4)} x${String(r[2]).padStart(4)} w${String(r[3]).padStart(4)}  ${r[4].padEnd(26)} ${r[5]}`);
await b.close();
