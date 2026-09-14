// _w4-rects.mjs <url> <width> <selector> [y0 y1] — dump container rects (y h x w tag.class) for aligning two renders (W4 inner loop)
import { chromium } from 'playwright';
const [url, w, sel, y0 = 0, y1 = 1e9] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' });
await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
await p.waitForTimeout(500);
const rows = await p.evaluate(([sel, y0, y1]) => [...document.querySelectorAll(sel)].map((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return [Math.round(r.y + scrollY), Math.round(r.height), Math.round(r.x), Math.round(r.width), `${e.tagName.toLowerCase()}.${[...e.classList].slice(0, 3).join('.')}`, `m ${cs.marginTop}/${cs.marginBottom} p ${cs.paddingTop}/${cs.paddingBottom} ${cs.display}`, (e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 30)]; }).filter((r) => r[1] && r[0] >= y0 && r[0] <= y1), [sel, +y0, +y1]);
for (const r of rows) console.log(`${String(r[0]).padStart(5)} ${String(r[1]).padStart(4)} x${String(r[2]).padStart(4)} w${String(r[3]).padStart(4)} ${r[4].padEnd(42)} ${r[5].padEnd(40)} ${r[6]}`);
await b.close();
