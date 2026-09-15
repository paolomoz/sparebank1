// _w6-outline.mjs <html file> [maxDepth=6] [selector=main] — compact element outline (tag.class, style vars, text snippet, img basename, href) for prototype ↔ document comparison
import fs from 'node:fs'; import { parseHTML } from 'linkedom';
const [file, md = '6', sel = 'main'] = process.argv.slice(2);
const { document } = parseHTML(fs.readFileSync(file, 'utf8'));
const root = document.querySelector(sel); if (!root) { console.log('no', sel); process.exit(0); }
const SKIP = new Set(['svg', 'script', 'style', 'source']);
const walk = (e, d) => {
  const t = e.tagName.toLowerCase(); if (SKIP.has(t)) return;
  const own = [...e.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').replace(/\s+/g, ' ').trim();
  const cls = (e.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean).join('.');
  const st = e.getAttribute('style') ? ` {${e.getAttribute('style').slice(0, 70)}}` : '';
  const src = t === 'img' ? ` src=${(e.getAttribute('src') || '').split('/').pop().slice(0, 50)} alt="${(e.getAttribute('alt') || '').slice(0, 30)}"` : '';
  const hr = t === 'a' ? ` href=${(e.getAttribute('href') || '').slice(-50)}` : '';
  const inl = /^(p|h[1-6]|li|a|span|strong|em|b|td|th|label|button)$/.test(t) ? ` "${e.textContent.replace(/\s+/g, ' ').trim().slice(0, 60)}"` : own ? ` "${own.slice(0, 60)}"` : '';
  console.log(`${'  '.repeat(d)}${t}${cls ? '.' + cls : ''}${st}${src}${hr}${inl}`);
  if (d < +md && !/^(p|h[1-6]|li|a|span|strong|em|b|td|th|label|button)$/.test(t)) [...e.children].forEach((c) => walk(c, d + 1));
};
[...root.children].forEach((c) => walk(c, 0));
