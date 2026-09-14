// harvest-icons.mjs — collect inline SVGs from a rendered-DOM sidecar (verbatim vectors, never approximated), keyed by a context label.
import { readFileSync, writeFileSync } from 'node:fs';
import { parseHTML } from 'linkedom';
const [file, out] = process.argv.slice(2);
const { document } = parseHTML(readFileSync(file, 'utf8'));
const icons = {}; const seen = new Map();
for (const svg of document.querySelectorAll('svg')) {
  const html = svg.outerHTML.replace(/\s+/g, ' ').trim(); if (html.length > 6000) continue;
  const anc = svg.closest('a, button, li, h3, div'); const ctx = [svg.getAttribute('class'), anc?.getAttribute('class'), anc?.getAttribute('aria-label'), (anc?.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40)].filter(Boolean).join(' | ');
  const key = html.replace(/ id="[^"]*"/g, '').slice(0, 400);
  if (seen.has(key)) { seen.get(key).contexts.push(ctx); continue; }
  const e = { svg: html, contexts: [ctx], w: svg.getAttribute('width'), h: svg.getAttribute('height'), viewBox: svg.getAttribute('viewBox') }; seen.set(key, e); icons[`icon-${Object.keys(icons).length + 1}`] = e;
}
writeFileSync(out, JSON.stringify(icons, null, 1));
for (const [k, v] of Object.entries(icons)) console.log(k, v.viewBox, v.w + 'x' + v.h, '|', v.contexts.slice(0, 3).join(' || ').slice(0, 160), '| n=' + v.contexts.length);
