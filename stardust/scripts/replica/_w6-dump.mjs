// _w6-dump.mjs <url> <width> <selector>[,<selector>...] [--depth 8] — rect + computed-style dump of the first match of each selector (W6 live geometry lift; consent accepted)
import { chromium } from 'playwright';
const argv = process.argv.slice(2); const [url, w, sels] = argv; const opt = (k, d) => { const i = argv.indexOf(k); return i > 0 ? argv[i + 1] : d; }; const depth = +opt('--depth', 8);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 }, locale: 'nb-NO' });
await p.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); await p.waitForTimeout(1500);
try { const c = p.locator('button:has-text("Godta alle")').first(); if (await c.isVisible({ timeout: 1500 })) { await c.click(); await p.waitForTimeout(500); } } catch {}
await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } window.scrollTo(0, 0); });
await p.waitForTimeout(1200);
for (const sel of sels.split(/,(?![^(]*\))/)) {
  const rows = await p.evaluate(([sel, depth]) => {
    const root = document.querySelector(sel); if (!root) return [`(no match ${sel})`];
    const out = []; const walk = (e, d) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
      const extra = [cs.backgroundColor !== 'rgba(0, 0, 0, 0)' ? `bg:${cs.backgroundColor}` : null, cs.borderRadius !== '0px' ? `br:${cs.borderRadius}` : null, cs.boxShadow !== 'none' ? `sh:${cs.boxShadow.slice(0, 40)}` : null, cs.borderTopWidth !== '0px' ? `bd:${cs.borderTopWidth} ${cs.borderTopColor}` : null, e.tagName === 'IMG' ? `fit:${cs.objectFit} ${e.getAttribute('src')?.split('/').pop().slice(0, 30)}` : null, /^(H[1-6]|P|A|SPAN|BUTTON|LI)$/.test(e.tagName) ? `${cs.fontFamily.split(',')[0].replace(/"/g, '').slice(0, 20)} ${cs.color} ${cs.textAlign}${cs.textDecorationLine !== 'none' ? ' ' + cs.textDecorationLine : ''}` : null, cs.transform !== 'none' ? `tf:${cs.transform}` : null].filter(Boolean).join(' ');
      out.push(`${'  '.repeat(d)}${e.tagName.toLowerCase()}${e.className && typeof e.className === 'string' ? '.' + e.className.trim().split(/\s+/).slice(0, 4).join('.') : ''} y${Math.round(r.y + scrollY)} h${Math.round(r.height)} x${Math.round(r.x)} w${Math.round(r.width)} [${cs.display} m:${cs.marginTop}/${cs.marginBottom} p:${cs.paddingTop} ${cs.paddingRight} ${cs.paddingBottom} ${cs.paddingLeft} ${cs.fontSize}/${cs.lineHeight}] ${extra} ${own.slice(0, 30)}`);
      if (d < depth) [...e.children].filter((c) => !['SCRIPT', 'STYLE', 'LINK', 'SVG', 'PATH'].includes(c.tagName) && c.tagName.toLowerCase() !== 'svg').forEach((c) => walk(c, d + 1)); };
    walk(root, 0); return out;
  }, [sel, depth]);
  console.log(`##### ${sel}`); console.log(rows.join('\n'));
}
await b.close();
