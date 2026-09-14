// _w1-rects.mjs <url> <width> <selector> [selector…] — bounding rects (+ a few box styles) for arbitrary selectors (W1 alignment helper)
import { chromium } from 'playwright';
const [url, w, ...sels] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' });
await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 50)); } window.scrollTo(0, 0); });
await p.waitForTimeout(500);
const out = await p.evaluate((sels) => sels.flatMap((s) => [...document.querySelectorAll(s)].slice(0, 6).map((e, i) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return `${s}[${i}]  x${Math.round(r.x)} y${Math.round(r.y + scrollY)} w${Math.round(r.width)} h${Math.round(r.height)}  pad ${cs.padding} mar ${cs.margin} disp ${cs.display} rows ${cs.gridTemplateRows} minh ${cs.minHeight} lh ${cs.lineHeight} fs ${cs.fontSize}`; })), sels);
console.log(out.join('\n')); await b.close();
