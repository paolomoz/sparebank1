// _w7-imgprobe.mjs <url> <width> <selector> — src + natural size + rendered box of matching images
import { chromium } from 'playwright';
const [url, w, sel] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' }); await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); }); await p.waitForTimeout(800);
console.log((await p.evaluate((s) => [...document.querySelectorAll(s)].map((i) => { const r = i.getBoundingClientRect(); return `${Math.round(r.y + scrollY)} ${Math.round(r.width)}x${Math.round(r.height)} nat ${i.naturalWidth}x${i.naturalHeight} fit ${getComputedStyle(i).objectFit} ${i.currentSrc.split('/').slice(-2).join('/').slice(0, 90)}`; }), sel)).join('\n'));
await b.close();
