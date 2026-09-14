// _probe-eds.mjs <url> <width> [y0 y1] — dump text/image leaf rects for aligning two renders
import { chromium } from 'playwright';
const [url, w, y0 = 0, y1 = 1e9] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' });
await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
await p.waitForTimeout(700);
const rows = await p.evaluate(([y0, y1]) => {
  const out = []; const sel = 'h1,h2,h3,h4,h5,h6,p,li,a,button,img,svg,hr,input,label,span,td,th,summary,dt,dd';
  for (const e of document.querySelectorAll(sel)) {
    const r = e.getBoundingClientRect(); if (!r.height || !r.width) continue; const y = Math.round(r.y + scrollY); if (y < y0 || y > y1) continue;
    const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
    const t = own || (e.tagName === 'IMG' || e.tagName === 'SVG' ? `<${e.tagName.toLowerCase()} ${(e.getAttribute('src') || e.getAttribute('class') || '').split('/').pop().slice(0, 30)}>` : (e.children.length === 0 ? e.textContent.trim() : ''));
    if (!t && !['HR', 'INPUT', 'IMG', 'SVG'].includes(e.tagName)) continue;
    const cs = getComputedStyle(e);
    out.push([y, Math.round(r.height), Math.round(r.x), Math.round(r.width), e.tagName.toLowerCase(), t.slice(0, 40), `${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily.split(',')[0].replace(/"/g, '').slice(0, 22)} ${cs.fontWeight}`]);
  }
  return out;
}, [+y0, +y1]);
for (const r of rows) console.log(`${String(r[0]).padStart(5)} ${String(r[1]).padStart(4)} x${String(r[2]).padStart(4)} w${String(r[3]).padStart(4)} ${r[4].padEnd(5)} ${r[6].padEnd(44)} ${r[5]}`);
await b.close();
