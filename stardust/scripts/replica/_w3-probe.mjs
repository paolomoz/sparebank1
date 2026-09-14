// _w3-probe.mjs — W3 helper: outline a sidecar / prototype subtree with linkedom (tag.class + text head), depth-limited.
import { readFileSync } from 'node:fs'; import { parseHTML } from 'linkedom';
const [file, sel, depthS = '6', maxS = '120', ...rest] = process.argv.slice(2);
const { document } = parseHTML(readFileSync(file, 'utf8'));
const depth = +depthS; let lines = 0; const max = +maxS;
const skipTags = new Set(['script', 'style', 'svg', 'noscript', 'link']);
const nodes = [...document.querySelectorAll(sel)].slice(0, +(rest[0] || 5));
console.log(`${nodes.length} match(es) for ${sel}`);
for (const n of nodes) { lines = 0; walk(n, 0); console.log('---'); }
function walk(n, d) {
  if (lines++ > max || d > depth) return;
  if (n.nodeType === 3) { const t = n.data.replace(/\s+/g, ' ').trim(); if (t) console.log('  '.repeat(d) + JSON.stringify(t.slice(0, 110))); return; }
  if (n.nodeType !== 1) return; const tag = n.tagName.toLowerCase(); if (skipTags.has(tag)) { if (tag === 'svg') console.log('  '.repeat(d) + '<svg ' + (n.getAttribute('class') || '') + '>'); return; }
  const attrs = ['class', 'href', 'src', 'alt', 'id', 'style', 'aria-label', 'role', 'aria-expanded', 'srcset', 'media', 'width', 'height', 'data-lazy-src'].filter((a) => n.hasAttribute(a)).map((a) => `${a}="${n.getAttribute(a).slice(0, 100)}"`).join(' ');
  console.log('  '.repeat(d) + `<${tag}${attrs ? ' ' + attrs : ''}>`);
  for (const c of n.childNodes) walk(c, d + 1);
}
