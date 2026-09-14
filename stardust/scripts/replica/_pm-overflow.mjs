import { chromium } from 'playwright';
const b = await chromium.launch();
for (const path of process.argv.slice(2)) {
  const p = await b.newPage({ viewport: { width: 360, height: 844 } }); await p.goto(`https://main--sparebank1--paolomoz.aem.live${path}`, { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
  const r = await p.evaluate(() => { const sw = document.documentElement.scrollWidth; const wide = [...document.querySelectorAll('body *')].map((e) => ({ e, r: e.getBoundingClientRect() })).filter((x) => x.r.right > 360.5 && x.r.width > 0).slice(0, 6).map((x) => `${x.e.tagName.toLowerCase()}.${String(x.e.className).split(' ').slice(0, 2).join('.')} right=${Math.round(x.r.right)} w=${Math.round(x.r.width)}`); return { sw, wide }; });
  console.log(path, 'scrollWidth', r.sw, r.wide.join(' | ')); await p.close();
}
await b.close();
