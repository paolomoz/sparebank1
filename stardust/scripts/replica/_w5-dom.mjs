// _w5-dom.mjs <url> <width> <selector> — rects + a few computed props for matching elements (grid/float debugging)
import { chromium } from 'playwright';
const [url, w, sel] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
const rows = await p.evaluate((sel) => [...document.querySelectorAll(sel)].map((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return `${Math.round(r.y + scrollY)},${Math.round(r.height)} x${Math.round(r.x)} w${Math.round(r.width)} <${e.tagName.toLowerCase()} .${[...e.classList].join('.')}> display=${cs.display} gridRow=${cs.gridRowStart}/${cs.gridRowEnd} gridCol=${cs.gridColumnStart}/${cs.gridColumnEnd} float=${cs.float} margin=${cs.margin} | ${e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40)}`; }), sel);
console.log(rows.join('\n')); await b.close();
