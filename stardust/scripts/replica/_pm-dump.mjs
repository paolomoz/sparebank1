// _pm-dump.mjs <url> <width> <selector>[,<selector>...] — dump the subtree rects of the first match of each selector (text=… finds by text and dumps its enclosing module)
import { chromium } from 'playwright';
const [url, w, sels] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' });
await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); });
await p.waitForTimeout(500);
for (const sel of sels.split(/,(?![^(]*\))/)) {
  const rows = await p.evaluate((sel) => {
    let root; if (sel.startsWith('text=')) { const t = sel.slice(5); const hit = [...document.querelectorAll ? [] : document.querySelectorAll('h1,h2,h3,p,span,a')].find((e) => e.textContent.trim().startsWith(t)); root = hit && (hit.closest('.section, section, .block, .module, [class*="cols"], [class*="band"]') || hit.parentElement); } else root = document.querySelector(sel);
    if (!root) return [`(no match ${sel})`];
    const out = []; const walk = (e, d) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
      out.push(`${'  '.repeat(d)}${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).join('.') : ''} y${Math.round(r.y + scrollY)} h${Math.round(r.height)} x${Math.round(r.x)} w${Math.round(r.width)} [${cs.display} m:${cs.marginTop}/${cs.marginBottom} p:${cs.paddingTop}/${cs.paddingBottom} ${cs.fontSize}/${cs.lineHeight}] ${own.slice(0, 30)}`);
      if (d < 7) [...e.children].forEach((c) => walk(c, d + 1)); };
    walk(root, 0); return out;
  }, sel);
  console.log(`##### ${sel}`); console.log(rows.join('\n'));
}
await b.close();
