import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [n, u] of [['emu', 'http://localhost:3010/nb/bank/privat/kundeservice/verktoy/sperre-kort'], ['pub', 'https://main--sparebank1--paolomoz.aem.live/nb/bank/privat/kundeservice/verktoy/sperre-kort']]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); await p.goto(u, { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  const r = await p.evaluate(() => [...document.querySelectorAll('main h1,main h2,main h3,main h4')].filter((h) => !h.textContent.trim()).map((h) => { const r = h.getBoundingClientRect(); const cs = getComputedStyle(h); return { tag: h.tagName, y: Math.round(r.y + scrollY), h: Math.round(r.height), display: cs.display, mb: cs.marginBottom, parent: h.parentElement.className, prev: h.previousElementSibling?.tagName, next: h.nextElementSibling?.tagName + ':' + (h.nextElementSibling?.textContent || '').trim().slice(0, 30), html: h.outerHTML.slice(0, 80) }; }));
  console.log(n, JSON.stringify(r)); await p.close();
}
await b.close();
