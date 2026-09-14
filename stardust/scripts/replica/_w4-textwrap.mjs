import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [url, sel] of [['http://localhost:8812/nb-bank-privat-sparing-markedsnytt-html-proposed.html', '.band .richtext p'], ['http://localhost:3014/nb/bank/privat/sparing/markedsnytt', 'main .section .col__text p, main .section.split-video .default-content-wrapper p']]) {
  const p = await b.newPage({ viewport: { width: 360, height: 900 } }); await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(500);
  const rows = await p.evaluate((sel) => [...document.querySelectorAll(sel)].filter((e) => /August ble|Historisk avkastning/.test(e.textContent)).map((e) => { const cs = getComputedStyle(e); const r = e.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)} wrap=${cs.textWrap || cs.textWrapMode} ls=${cs.letterSpacing} ws=${cs.wordSpacing} font=${cs.fontSize}/${cs.lineHeight} ${cs.fontFamily.split(',')[0]} hy=${cs.hyphens} :: ${e.textContent.trim().slice(0, 40)}`; }), sel);
  console.log(url.includes('8812') ? 'PROTO' : 'EDS'); rows.forEach((r) => console.log('  ', r));
  await p.close();
}
await b.close();
