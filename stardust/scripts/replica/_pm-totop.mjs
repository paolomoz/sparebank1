import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [name, url] of [['replica', 'http://localhost:8812/nb-bank-privat-lan-boliglan-html-proposed.html'], ['eds', 'http://localhost:3010/nb/bank/privat/lan/boliglan']]) {
  const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(() => window.scrollTo(0, 3000)); await p.waitForTimeout(900);
  const r = await p.evaluate(() => { const t = document.querySelector('.to-top'); if (!t) return 'no .to-top'; const cs = getComputedStyle(t); const rc = t.getBoundingClientRect(); return { cls: t.className, y: Math.round(rc.y), h: Math.round(rc.height), display: cs.display, position: cs.position, bottom: cs.bottom, opacity: cs.opacity, visibility: cs.visibility, transition: cs.transition, parent: t.parentElement.className, scrollY: window.scrollY }; });
  console.log(name, JSON.stringify(r)); await p.close();
}
await b.close();
