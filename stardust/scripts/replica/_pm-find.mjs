import { chromium } from 'playwright';
const [url, w, text] = process.argv.slice(2); const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 844 } });
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(800);
const r = await p.evaluate((text) => [...document.querySelectorAll('main *')].filter((e) => e.children.length === 0 && e.textContent.trim().startsWith(text)).slice(0, 3).map((e) => { const chain = []; let n = e; while (n && n !== document.body && chain.length < 6) { const cs = getComputedStyle(n); chain.push(`${n.tagName.toLowerCase()}.${String(n.className).split(' ').slice(0, 2).join('.')}[${cs.display}${cs.visibility !== 'visible' ? ' ' + cs.visibility : ''} h${Math.round(n.getBoundingClientRect().height)}]`); n = n.parentElement; } return chain.join(' < '); }), text);
console.log(r.join('\n') || 'not found'); await b.close();
