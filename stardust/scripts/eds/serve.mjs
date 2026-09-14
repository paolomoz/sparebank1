#!/usr/bin/env node
/**
 * serve.mjs — local Edge Delivery emulation for gating BEFORE deploy (no DA, no dev server):
 *   /<path>            → full document: head.html + styles + scripts.js, <main> from content/<path>.html (metadata block removed)
 *   /<path>.plain.html → the content page's <main> (what the runtime fetches for /nav, /footer, fragments)
 *   everything else    → repo files (blocks/, scripts/, styles/, img/, icons/, fonts/)
 *   content.da.live media URLs are rewritten to stardust/prototypes/assets/img/<file> so pages render with the real assets.
 * Usage: node stardust/scripts/eds/serve.mjs [--port 3010]
 */
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path'; import { parseHTML } from 'linkedom'; import { imageSize } from 'image-size';
const port = +(process.argv[process.argv.indexOf('--port') + 1] || 3010);
const ROOT = process.cwd();
const TYPES = { html: 'text/html', js: 'text/javascript', css: 'text/css', svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', woff2: 'font/woff2', json: 'application/json', ico: 'image/x-icon' };
const MEDIA = /https:\/\/content\.da\.live\/paolomoz\/sparebank1\/media\//g;
const head = fs.readFileSync('head.html', 'utf8');
function mainOf(file) {
  const html = fs.readFileSync(file, 'utf8').replace(MEDIA, '/__media/');
  const { document } = parseHTML(`<html><body>${html.match(/<main>([\s\S]*?)<\/main>/)?.[1] || ''}</body></html>`);
  // the pipeline consumes the metadata block and renders section-metadata as attributes on the section div (style → classes, other keys → data-*)
  [...document.querySelectorAll('div.metadata')].forEach((m) => m.remove());
  [...document.querySelectorAll('body > div')].forEach((sec) => {
    const sm = sec.querySelector(':scope > div.section-metadata'); if (!sm) return;
    [...sm.children].forEach((row) => { const [k, v] = [...row.children].map((c) => c.textContent.trim()); if (!k) return;
      if (k.toLowerCase() === 'style') v.split(',').map((x) => x.trim().toLowerCase().replace(/[^0-9a-z]+/g, '-').replace(/^-+|-+$/g, '')).filter(Boolean).forEach((c) => sec.classList.add(c));
      else sec.setAttribute(`data-${k.toLowerCase().replace(/[^0-9a-z]+/g, '-')}`, v); });
    sm.remove();
  });
  // like the pipeline: a block cell holding a single paragraph is unwrapped (the cell's children become the paragraph's inline run)
  [...document.querySelectorAll('main > div > div:not(.section-metadata):not(.default-content-wrapper) > div > div')].forEach((cell) => {
    const kids = [...cell.childNodes].filter((n) => n.nodeType !== 3 || n.textContent.trim());
    if (kids.length === 1 && kids[0].nodeType === 1 && kids[0].tagName === 'P') { const p = kids[0]; p.replaceWith(...p.childNodes); }
  });
  // like the pipeline (markdown has no small/span/empty paragraphs): unwrap <small>/<span>, drop empty <p>
  [...document.querySelectorAll('small, span:not([class])')].forEach((e) => e.replaceWith(...e.childNodes));
  [...document.querySelectorAll('p, h1, h2, h3, h4, h5, h6')].forEach((p) => { if (!p.textContent.replace(/\u00a0/g, ' ').trim() && !p.querySelector('img, picture, a, span')) { if (/^H/.test(p.tagName)) p.textContent = ''; else p.remove(); } }); // nbsp-only headings survive as empty (0px) like the pipeline
  // like the pipeline (markdown loose lists): when any item of a list holds a block child, EVERY item's inline run is wrapped in <p>
  [...document.querySelectorAll('ul, ol')].forEach((list) => {
    const items = [...list.children].filter((li) => li.tagName === 'LI'); if (!items.some((li) => [...li.children].some((c) => /^(P|UL|OL|DIV|TABLE|H[1-6])$/.test(c.tagName)))) return;
    items.forEach((li) => { let run = []; const flush = () => { if (run.some((n) => n.nodeType === 1 || n.textContent.trim())) { const p = document.createElement('p'); run[0].before(p); run.forEach((n) => p.append(n)); } run = []; };
      [...li.childNodes].forEach((n) => { if (n.nodeType === 1 && /^(P|UL|OL|DIV|TABLE|H[1-6])$/.test(n.tagName)) { flush(); } else run.push(n); }); flush(); });
  });
  // like the pipeline: <img> gets intrinsic width/height (and a <picture> wrapper) from the media
  [...document.querySelectorAll('img[src^="/__media/"]')].forEach((img) => {
    try { const f = path.join(ROOT, 'stardust/prototypes/assets/img', path.basename(img.getAttribute('src'))); const d = imageSize(fs.readFileSync(f)); if (d.width) { img.setAttribute('width', d.width); img.setAttribute('height', d.height); } } catch {}
    img.setAttribute('loading', 'lazy');
    const pic = document.createElement('picture'); img.replaceWith(pic); pic.append(img);
  });
  return document.body.innerHTML;
}
function metaOf(file) {
  const html = fs.readFileSync(file, 'utf8');
  const m = html.match(/<div class="metadata">([\s\S]*?)<\/div><\/div><\/div>/); const out = {};
  if (m) for (const r of `${m[1]}</div></div>`.matchAll(/<div><div>([^<]*)<\/div><div>([\s\S]*?)<\/div><\/div>/g)) out[r[1].trim()] = r[2].replace(/<[^>]+>/g, '').trim();
  return out;
}
http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0]);
  try {
    if (url.startsWith('/__media/')) { const f = path.join(ROOT, 'stardust/prototypes/assets/img', path.basename(url)); if (!fs.existsSync(f)) throw 404; res.writeHead(200, { 'content-type': TYPES[f.split('.').pop()] || 'application/octet-stream' }); return res.end(fs.readFileSync(f)); }
    if (url.endsWith('.plain.html')) { const f = path.join(ROOT, 'content', `${url.replace(/\.plain\.html$/, '')}.html`); if (!fs.existsSync(f)) throw 404; res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(mainOf(f)); }
    const file = path.join(ROOT, url);
    if (url !== '/' && fs.existsSync(file) && fs.statSync(file).isFile()) { res.writeHead(200, { 'content-type': TYPES[file.split('.').pop()] || 'application/octet-stream' }); return res.end(fs.readFileSync(file)); }
    const cf = path.join(ROOT, 'content', `${url === '/' ? 'index' : url.replace(/\/$/, '')}.html`);
    if (!fs.existsSync(cf)) throw 404;
    const meta = metaOf(cf);
    const metas = Object.entries(meta).map(([k, v]) => `<meta name="${k}" content="${v.replace(/"/g, '&quot;')}">`).join('\n');
    const doc = `<!DOCTYPE html><html><head><title>${meta.title || ''}</title>\n${metas}\n${head}\n</head><body><header></header><main>${mainOf(cf)}</main><footer></footer></body></html>`;
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); res.end(doc);
  } catch (e) { res.writeHead(e === 404 ? 404 : 500, { 'content-type': 'text/plain' }); res.end(e === 404 ? 'not found' : String(e)); }
}).listen(port, () => console.log(`eds emulation on http://localhost:${port}`));
