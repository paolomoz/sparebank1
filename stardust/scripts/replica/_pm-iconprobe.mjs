import { chromium } from 'playwright';
const b = await chromium.launch();
for (const [name, url] of [['emulation', 'http://localhost:3010/nb/bank/privat/lan/boliglan'], ['published', 'https://main--sparebank1--paolomoz.aem.live/nb/bank/privat/lan/boliglan']]) {
  const p = await b.newPage({ viewport: { width: 360, height: 844 } }); await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 700) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 80)); } });
  await p.waitForTimeout(1200);
  const r = await p.evaluate(() => { const ic = document.querySelector('.contact__icon'); const svg = ic?.querySelector('svg'); const img = ic?.querySelector('img'); const cs = svg ? getComputedStyle(svg) : null; const paths = svg ? [...svg.querySelectorAll('path')].slice(0, 2).map((x) => [x.getAttribute('fill'), getComputedStyle(x).fill]) : null;
    return { iconHtml: ic?.innerHTML.slice(0, 160), wrapColor: ic ? getComputedStyle(ic).color : null, svgFillAttr: svg?.getAttribute('fill'), svgFill: cs?.fill, svgColor: cs?.color, paths, img: img?.getAttribute('src'), name: getComputedStyle(document.querySelector('.contact__name')).fontFamily.slice(0, 40), nameColor: getComputedStyle(document.querySelector('.contact__name')).color }; });
  console.log(name, JSON.stringify(r, null, 0)); await p.close();
}
await b.close();
