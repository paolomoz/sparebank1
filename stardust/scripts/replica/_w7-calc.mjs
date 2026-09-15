// _w7-calc.mjs <url> <hostSelector> <pillRegex> <noteRegex> — light/shadow DOM probe around two texts inside a calculator snapshot
import { chromium } from 'playwright';
const [url, sel, pillRe, noteRe] = process.argv.slice(2);
const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 360, height: 900 } });
await p.goto(url, { waitUntil: 'networkidle' }); await p.waitForTimeout(1500);
console.log(await p.evaluate(([sel, pillRe, noteRe]) => {
  const h = document.querySelector(sel); const sr = h.shadowRoot || h.firstElementChild?.shadowRoot || null;
  const root = sr || h; const all = [...root.querySelectorAll('*')];
  const pill = all.filter((e) => new RegExp(pillRe).test(e.textContent) && e.children.length < 3).pop();
  const note = all.filter((e) => new RegExp(noteRe).test(e.textContent) && e.children.length < 2).pop();
  const r = (e) => { if (!e) return null; const b = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { tag: e.tagName, cls: (e.className || '').toString().slice(0, 70), y: Math.round(b.y + scrollY), h: Math.round(b.height), mt: cs.marginTop, mb: cs.marginBottom, pt: cs.paddingTop, pb: cs.paddingBottom }; };
  const chain = (e, n) => { const out = []; for (let i = 0; i < n && e; i++) { out.push(r(e)); e = e.parentElement; } return out; };
  return JSON.stringify({ shadow: !!sr, hostChildren: [...h.children].map((c) => c.tagName + '.' + (c.className || '').toString().slice(0, 40)), pill: chain(pill, 4), note: chain(note, 3) }, null, 1);
}, [sel, pillRe, noteRe]));
await b.close();
