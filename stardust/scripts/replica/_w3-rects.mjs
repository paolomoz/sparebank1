// _w3-rects.mjs <url> <width> <rootSel> [depth=4] — rects (relative y to the root) of the root's descendants, prototype/emulation only
import { chromium } from 'playwright';
const [url, w, root, depthS = '4'] = process.argv.slice(2);
const b = await chromium.launch(); const page = await b.newPage({ viewport: { width: +w, height: 900 } });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); await page.waitForTimeout(500);
const rows = await page.evaluate(({ root, depth }) => {
  const r0 = document.querySelector(root); if (!r0) return ['no root'];
  const base = r0.getBoundingClientRect(); const cs0 = getComputedStyle(r0); const out = [`ROOT ${root} y=${Math.round(base.y + scrollY)} ${Math.round(base.width)}x${Math.round(base.height)} m=${cs0.margin} p=${cs0.padding} cls=${r0.className}`];
  const walk = (el, d) => { if (d > depth) return; for (const c of el.children) { if (['SVG', 'svg', 'SOURCE', 'PATH'].includes(c.tagName)) continue; const r = c.getBoundingClientRect(); const cs = getComputedStyle(c); out.push(`${'  '.repeat(d)}${c.tagName.toLowerCase()}.${[...c.classList].slice(0, 2).join('.')} y=${Math.round(r.y - base.y)} x=${Math.round(r.x)} ${Math.round(r.width)}x${Math.round(r.height)} m=${cs.margin} p=${cs.padding} f=${cs.fontSize}/${cs.lineHeight} "${(c.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 25)}"`); walk(c, d + 1); } };
  walk(r0, 1); return out;
}, { root, depth: +depthS });
console.log(rows.join('\n')); await b.close();
