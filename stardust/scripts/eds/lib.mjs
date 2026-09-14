/**
 * stardust/scripts/eds/lib.mjs — shared ENCODE helpers for the Experian EDS conversion (stardust:rollout Phase C).
 * Prototype DOM (linkedom) → DA body-fragment HTML. David's Model shapes: default content for prose, one block per
 * designed module, CTAs as <strong><a> (primary) / <em><a> (tertiary) / <strong><em><a> (secondary), icons as
 * <span class="icon icon-<name>"> (the runtime's :name: representation), images as content.da.live media URLs.
 */
import fs from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';

export const ORG = 'paolomoz', REPO = 'sparebank1';
export const MEDIA_BASE = `https://content.da.live/${ORG}/${REPO}/media/`;
export const PROTO_DIR = 'stardust/prototypes';
export const MIGRATED_DIR = 'stardust/migrated';
export const CONTENT_DIR = 'content';

export function loadProto(slug) {
  const file = path.join(PROTO_DIR, `${slug}-proposed.html`);
  const html = fs.readFileSync(file, 'utf8');
  const { document } = parseHTML(html);
  return { document, file, html };
}

export function esc(s = '') { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

/** ENCODE context per page: collects the media assets a page references (for the DA media upload). */
export function makeCtx(slug) { return { slug, assets: new Set(), remote: new Set(), rasterise: new Set(), notes: [], gaps: [] }; }
const WP_MEDIA = {};
export const isRemoteBlogMedia = () => false;

/** Pick the largest srcset candidate (the EDS pipeline derives responsive widths itself). */
export function bestSrc(img) {
  const srcset = img.getAttribute('srcset');
  let src = img.getAttribute('src') || '';
  if (srcset) {
    const cands = srcset.split(',').map((c) => c.trim().split(/\s+/)).map(([u, w]) => ({ u, w: parseInt(w || '0', 10) }));
    cands.sort((a, b) => b.w - a.w);
    if (cands[0]?.u) src = cands[0].u;
  }
  return src;
}

/** Map a prototype asset reference to its DA media URL (remote URLs pass through). */
const RASTER = {};
// SVGs over the pipeline's ~40KB limit 409 the whole page at preview: they are authored as a PNG rasterisation hosted on DA media
// (stardust/rollout/svg-sizes.json from _pm-svg-scan.mjs; rasterise-svg.mjs renders + uploads; the PNG name = svg basename + .png)
const SVG_SIZES = fs.existsSync('stardust/rollout/svg-sizes.json') ? JSON.parse(fs.readFileSync('stardust/rollout/svg-sizes.json', 'utf8')) : {};
export const SVG_LIMIT = 40000;
export const rasterName = (url) => `${path.basename(url.split('?')[0]).replace(/\.svg$/i, '')}.png`;
export function mediaUrl(src, ctx) {
  if (!src) return '';
  if (WP_MEDIA[src]) { ctx?.assets.add(WP_MEDIA[src]); return `${MEDIA_BASE}${WP_MEDIA[src]}`; } // rehosted blog media
  if (/^(https?:)?\/\//.test(src) || src.startsWith('data:')) {
    const abs = src.startsWith('//') ? `https:${src}` : src;
    if (/\.svg(\?|$)/i.test(abs) && (SVG_SIZES[abs] || 0) > SVG_LIMIT) { const png = rasterName(abs); ctx?.rasterise?.add(abs); ctx?.notes?.push(`media: ${abs} is ${SVG_SIZES[abs]} bytes of SVG (> ${SVG_LIMIT}) — authored as DA media ${png} (rasterised)`); return `${MEDIA_BASE}${png}`; }
    if (isRemoteBlogMedia(abs)) ctx?.remote.add(abs); return abs;
  }
  let base = path.basename(src.split('?')[0]);
  if (RASTER[base]) base = RASTER[base]; // SVGs over the pipeline's 40KB limit are authored as their PNG rasterisation
  ctx?.assets.add(base);
  return `${MEDIA_BASE}${base}`;
}

export function imgHtml(img, ctx, { alt } = {}) {
  if (!img) return '';
  const src = mediaUrl(bestSrc(img), ctx);
  const a = alt ?? img.getAttribute('alt') ?? '';
  // blog media the CDN refuses to serve to the ingester stays on the source origin: authored as an "Image:" link, turned into <img> by scripts.js
  if (isRemoteBlogMedia(src)) { const w = img.getAttribute('width'); const h = img.getAttribute('height'); return `<a href="${esc(src)}">Image${w && h ? ` ${w}×${h}` : ''}: ${esc(a || 'photo')}</a>`; } // dimensions reserve the box before load
  return `<img src="${esc(src)}" alt="${esc(a)}">`;
}

export function pic(img, ctx) { return img ? `<p>${imgHtml(img, ctx)}</p>` : ''; }

/** Normalise an href: protocol-relative → https; site-internal paths lose their trailing slash (EDS routes /x, not /x/ — delivery-lint P1);
 *  `/#anchor` becomes `#anchor`. Absolute URLs (incl. www.experian.com off-scope pages) pass through unchanged. */
/** Delivered paths (state.migrate.pageMap): internal links outside the roster bounce to the source site (rollout E2: a bounce beats a 404). */
const LOCAL_PATHS = (() => { try { const s = JSON.parse(fs.readFileSync('stardust/state.json', 'utf8')); return new Set(s.pages.map((p) => new URL(p.url).pathname.replace(/\.html$/, '').replace(/\/$/, '') || '/')); } catch { return null; } })();
export const SOURCE_ORIGIN = 'https://www.sparebank1.no';
export function href(h = '') {
  if (h.startsWith('//')) return `https:${h}`;
  if (h.startsWith(SOURCE_ORIGIN + '/')) h = h.slice(SOURCE_ORIGIN.length);
  if (h.startsWith('/#')) return h.slice(1);
  if (/^\/[^/]/.test(h) || h === '/') { let [p, rest] = h.split(/(?=[?#])/); p = p.replace(/\.html$/, ''); const norm = p.length > 1 && p.endsWith('/') ? p.slice(0, -1) : p; if (LOCAL_PATHS && !LOCAL_PATHS.has(norm)) return `${SOURCE_ORIGIN}${h}`; return norm + (rest || ''); }
  return h;
}

/**
 * Serialise inline content (text + a/sup/sub/strong/em/b/i/br/span/img) of an element, dropping attributes the
 * pipeline would strip anyway (class/id/aria/data-*) except href/src/alt. Block-level children are flattened.
 */
/** Heading rank as authored for EDS: a heading whose whole text sits in an FFE pseudo-heading span (<h2><span class="h3">…) takes the
 *  span's visual rank — editors pick heading size by level, so the migrated level is the level the reader sees. */
export function headingTag(n) {
  const own = n.tagName.toLowerCase();
  const kid = n.children.length === 1 && n.children[0].tagName === 'SPAN' && n.textContent.trim() === n.children[0].textContent.trim() ? n.children[0] : null;
  const m = kid && /\b(?:ffe-)?h([1-6])\b/.exec(kid.getAttribute('class') || '');
  return m ? `h${m[1]}` : own;
}

export function inline(el, ctx) {
  if (!el) return '';
  let out = '';
  for (const n of el.childNodes) {
    if (n.nodeType === 3) { out += esc(n.textContent); continue; }
    if (n.nodeType !== 1) continue;
    const t = n.tagName.toLowerCase();
    if (t === 'br') { out += '<br>'; continue; }
    if (t === 'img') { out += imgHtml(n, ctx); continue; }
    if (t === 'a') {
      const cls = n.getAttribute('class') || '';
      const h = href(n.getAttribute('href') || '');
      // disclosure-symbol links carry their symbol in aria-label ("⊛: See disclosure details.") — keep the symbol as the link text
      let text = inline(n, ctx);
      if (!text.trim() && /disclosure-symbol/.test(cls)) { const al = n.getAttribute('aria-label') || ''; text = esc(al.split(':')[0]); }
      out += `<a href="${esc(h)}">${text}</a>`; continue;
    }
    if (t === 'sup' || t === 'sub' || t === 'strong' || t === 'em' || t === 'b' || t === 'i' || t === 'u' || t === 's' || t === 'code' || t === 'small') {
      // the pipeline drops a <br> that sits inside inline formatting (<b>Telefon<br></b>) — move leading/trailing breaks outside the element
      // …and, like the pipeline, edge whitespace moves outside the element (<b>Mer </b>og → <b>Mer</b> og) so words never merge
      let inner = inline(n, ctx); let lead = ''; let tail = '';
      const strip = () => { let m; while ((m = /^(\s+|&nbsp;|<br>)/.exec(inner))) { inner = inner.slice(m[0].length); lead += m[0] === '<br>' ? '<br>' : ' '; } while ((m = /(\s+|&nbsp;|<br>)$/.exec(inner))) { inner = inner.slice(0, -m[0].length); tail = (m[0] === '<br>' ? '<br>' : ' ') + tail; } };
      strip(); lead = lead.replace(/ +/g, ' '); tail = tail.replace(/ +/g, ' ');
      out += inner.trim() ? `${lead}<${t}>${inner}</${t}>${tail}` : lead + inner + tail; continue;
    }
    if (t === 'svg' || t === 'canvas' || t === 'script' || t === 'style' || t === 'button' || t === 'input') continue;
    if (t === 'span' && /\bfw-bold\b/.test(n.getAttribute('class') || '')) { out += `<strong>${inline(n, ctx)}</strong>`; continue; } // bold emphasis span → <strong> (David's Model has no inline class; text-transform is lost — justified per page)
    out += inline(n, ctx); // span / div / other wrappers: flatten
  }
  return out;
}

/** Serialise a heading element as <hN>inline</hN> (tag preserved). */
export function heading(el, ctx, tag) {
  if (!el) return '';
  const t = tag || el.tagName.toLowerCase().replace(/^(?!h[1-6]$).*$/, 'p');
  return `<${t}>${inline(el, ctx)}</${t}>`;
}

export function para(el, ctx) {
  if (!el) return ''; let s = inline(el, ctx); if (!s.trim()) return '';
  // a paragraph with several links and a bold label ("Learn more: A, B") must not read as a CTA row: bold stays visual (<b>), not semantic emphasis
  if ((s.match(/<a /g) || []).length > 1 && /<strong>(?![^<]*<a )/.test(s)) s = s.replace(/<(\/?)strong>/g, '<$1b>');
  return `<p>${s}</p>`;
}

/** Source button class → David's Model authored formatting. */
export function ctaKind(a) {
  const c = a.getAttribute('class') || '';
  if (/btn--action/.test(c)) return 'accent';
  if (/btn--primary/.test(c)) return 'primary';
  if (/btn--secondary|btn--expand/.test(c)) return 'secondary';
  if (/btn--tertiary|btn--inline/.test(c)) return 'tertiary';
  if (/btn/.test(c)) return 'primary';
  return 'link';
}
export function ctaHtml(a, ctx, kind) {
  if (!a) return '';
  const k = kind || ctaKind(a);
  const h = href(a.getAttribute('href') || '');
  const text = inline(a, ctx) || esc(a.getAttribute('aria-label') || '');
  const link = `<a href="${esc(h)}">${text}</a>`;
  if (k === 'accent') return `<p><em><strong>${link}</strong></em></p>`;
  if (k === 'primary') return `<p><strong>${link}</strong></p>`;
  if (k === 'secondary') return `<p><em>${link}</em></p>`;
  if (k === 'tertiary') return `<p>${link}</p>`;
  return `<p>${link}</p>`;
}

/** Icon-font class on an element → the runtime's icon token. */
export function iconName(el) {
  if (!el) return '';
  const m = (el.getAttribute('class') || '').match(/ecs-font-icon-([a-z0-9-]+)/);
  return m ? m[1] : '';
}
export function iconHtml(name) { return name ? `<span class="icon icon-${esc(name)}"></span>` : ''; }
export function iconOf(el) { return iconHtml(iconName(el)); }

/**
 * Rich prose: serialise a container's block children as default content (h1-h6, p, ul/ol, table, hr, img).
 * Unknown wrappers recurse. Used for disclosures, static/text pages, article bodies.
 */
export function prose(el, ctx, opts = {}) {
  if (!el) return '';
  let out = '';
  for (const n of el.childNodes) {
    if (n.nodeType === 3) { if (n.textContent.trim()) out += `<p>${esc(n.textContent.trim())}</p>`; continue; }
    if (n.nodeType !== 1) continue;
    const t = n.tagName.toLowerCase();
    // blank spacers (<h3>&nbsp;</h3>, <p>&nbsp;</p>) are authoring debris the pipeline drops anyway — not content; recorded as a residual
    if (/^(h[1-6]|p)$/.test(t) && !n.textContent.replace(/\u00a0/g, ' ').trim() && !n.querySelector('img, picture, a, br')) { ctx?.notes?.push(`spacer: blank <${t}> dropped (live renders it as vertical space)`); continue; }
    if (/^h[1-6]$/.test(t)) { const ht = headingTag(n); out += `<${ht}>${inline(n, ctx)}</${ht}>`; continue; }
    // live pseudo-headings: <p><span class="h4">…</span></p> (FFE .h2–.h6 classes) → a real heading of that rank
    const pseudo = (e) => { const m = /\b(?:ffe-)?h([2-6])\b/.exec(e.getAttribute('class') || ''); return m ? m[1] : null; };
    if (t === 'p' && n.children.length === 1 && n.children[0].tagName === 'SPAN' && pseudo(n.children[0]) && n.textContent.trim() === n.children[0].textContent.trim()) { out += `<h${pseudo(n.children[0])}>${inline(n.children[0], ctx)}</h${pseudo(n.children[0])}>`; continue; }
    if (t === 'span' && pseudo(n)) { out += `<h${pseudo(n)}>${inline(n, ctx)}</h${pseudo(n)}>`; continue; }
    if (t === 'p') { const s = inline(n, ctx); if (s.trim()) out += `<p>${s}</p>`; continue; }
    if (t === 'ul' || t === 'ol') { out += list(n, ctx); continue; }
    if (t === 'hr') continue; // <hr> is the DA section delimiter: dropped inside cells/prose (article bodies author a divider block instead)
    if (t === 'br') continue;
    if (t === 'img') { out += `<p>${imgHtml(n, ctx)}</p>`; continue; }
    if (t === 'picture') { const i = n.querySelector('img'); if (i) out += `<p>${imgHtml(i, ctx)}</p>`; continue; }
    if (t === 'table') { out += table(n, ctx); continue; }
    if (t === 'a' && n.querySelector('h1,h2,h3,h4,h5,h6,p')) { // card link: image, linked heading, copy
      const h = href(n.getAttribute('href') || ''); const img = n.querySelector('img'); if (img) out += `<p>${imgHtml(img, ctx)}</p>`;
      for (const k of n.children) { const kt = k.tagName.toLowerCase(); if (/^h[1-6]$/.test(kt)) out += `<${kt}><a href="${esc(h)}">${inline(k, ctx)}</a></${kt}>`; else if (kt === 'p') { const s2 = inline(k, ctx); if (s2.trim()) out += `<p>${s2}</p>`; } else if (kt !== 'img') out += prose(k, ctx); }
      continue;
    }
    if (t === 'a' && n.querySelector('img')) { out += `<p><a href="${esc(href(n.getAttribute('href') || ''))}">${imgHtml(n.querySelector('img'), ctx)}</a></p>`; continue; }
    if (t === 'a') { if (/(^|\s)btn(\s|$|-)/.test(n.getAttribute('class') || '')) { out += ctaHtml(n, ctx); continue; } out += `<p><a href="${esc(href(n.getAttribute('href') || ''))}">${inline(n, ctx)}</a></p>`; continue; }
    if (t === 'blockquote') { out += `<blockquote>${prose(n, ctx)}</blockquote>`; continue; }
    if (t === 'button' && n.querySelector('h1,h2,h3,h4,h5,h6,p')) { // card-shaped control (source app handles the action): keep its content
      const img = n.querySelector('img'); if (img) out += `<p>${imgHtml(img, ctx)}</p>`;
      for (const k of n.children) { const kt = k.tagName.toLowerCase(); if (/^h[1-6]$/.test(kt)) out += `<${kt}>${inline(k, ctx)}</${kt}>`; else if (kt === 'p') { const s2 = inline(k, ctx); if (s2.trim()) out += `<p>${s2}</p>`; } else if (kt !== 'img') out += prose(k, ctx); }
      continue;
    }
    if (t === 'button' && n.textContent.trim() && !/\btip-btn\b/.test(n.getAttribute('class') || '')) { out += `<p><strong>${inline(n, ctx)}</strong></p>`; continue; } // accordion/expander trigger text stays as a bold line (the source app handles the toggle)
    if (t === 'svg' || t === 'script' || t === 'style' || t === 'canvas' || t === 'button' || t === 'form' || t === 'input' || t === 'iframe') continue;
    if (t === 'span' || t === 'strong' || t === 'em' || t === 'sup' || t === 'b' || t === 'i' || t === 'small' || t === 'label') { const s = inline(n, ctx); if (s.trim()) out += `<p>${s}</p>`; continue; } // a form label in prose (e.g. "Recommended FICO Score Θ") keeps its text + disclosure link
    out += prose(n, ctx, opts); // div/section/aside/article/li wrappers
  }
  return out;
}

export function list(ul, ctx) {
  const t = ul.tagName.toLowerCase() === 'ol' ? 'ol' : 'ul';
  let out = `<${t}>`;
  for (const li of ul.children) {
    if (li.tagName.toLowerCase() !== 'li') continue;
    let inner = '';
    if ([...li.children].some((c) => /^h[1-6]$/i.test(c.tagName)) || [...li.children].filter((c) => c.tagName.toLowerCase() === 'p').length >= 2) { // block-shaped item (source: h3.h6 lead-in + paragraphs, or several paragraphs) → paragraphs (loose list), lead-in bold-only
      for (const n of li.childNodes) {
        if (n.nodeType === 3) { if (n.textContent.trim()) inner += `<p>${esc(n.textContent.trim())}</p>`; continue; }
        if (n.nodeType !== 1) continue; const tt = n.tagName.toLowerCase();
        if (tt === 'ul' || tt === 'ol') inner += list(n, ctx); else if (/^h[1-6]$/.test(tt)) inner += `<p><strong>${inline(n, ctx)}</strong></p>`; else inner += `<p>${inline(n, ctx)}</p>`;
      }
      out += `<li>${inner}</li>`; continue;
    }
    for (const n of li.childNodes) {
      if (n.nodeType === 3) { inner += esc(n.textContent); continue; }
      if (n.nodeType !== 1) continue;
      const tt = n.tagName.toLowerCase();
      if (tt === 'ul' || tt === 'ol') inner += list(n, ctx);
      else if (tt === 'p' || tt === 'div' || tt === 'span' || tt === 'button') inner += (inner.trim() && n.textContent.trim() ? ' ' : '') + inline(n, ctx);
      else if (/^h[1-6]$/.test(tt)) inner += `<strong>${inline(n, ctx)}</strong>`;
      else inner += inline({ childNodes: [n] }, ctx);
    }
    out += `<li>${inner.replace(/\s+/g, ' ').trim()}</li>`;
  }
  return `${out}</${t}>`;
}

/** Table → authored <table> (EDS renders tables from documents; David's Model keeps data tables as tables). */
export function table(tb, ctx) {
  let out = '<table>';
  for (const tr of tb.querySelectorAll('tr')) {
    out += '<tr>';
    for (const c of tr.children) { const tag = c.tagName.toLowerCase() === 'th' ? 'th' : 'td'; out += `<${tag}>${inline(c, ctx)}</${tag}>`; }
    out += '</tr>';
  }
  return `${out}</table>`;
}

/* ---- block / section builders ---- */
export function cell(html) { return `<div>${html}</div>`; }
export function row(cells) { return `<div>${cells.map(cell).join('')}</div>`; }
export function block(name, variants, rows) {
  const cls = [name, ...(variants || []).filter(Boolean)].join(' ');
  return `<div class="${esc(cls)}">${rows.map((r) => (Array.isArray(r) ? row(r) : r)).join('')}</div>`;
}
export function sectionMeta(meta) {
  const entries = Object.entries(meta || {}).filter(([, v]) => v);
  if (!entries.length) return '';
  return block('section-metadata', [], entries.map(([k, v]) => [k, esc(v)]));
}
export function section(parts, meta) { return `<div>${parts.filter(Boolean).join('')}${sectionMeta(meta)}</div>`; }

/** Text helpers */
export const txt = (el) => (el ? el.textContent.replace(/\s+/g, ' ').trim() : '');
export const q = (el, s) => (el ? el.querySelector(s) : null);
export const qa = (el, s) => (el ? [...el.querySelectorAll(s)] : []);
export const cls = (el) => (el ? (el.getAttribute('class') || '').split(/\s+/).filter(Boolean) : []);
export const has = (el, c) => cls(el).includes(c);

/** Children of `el` that are elements (optionally matching a tag list). */
export const kids = (el, tags) => (el ? [...el.children].filter((c) => !tags || tags.includes(c.tagName.toLowerCase())) : []);

export function writeFile(file, content) { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, content); }

/** Page (DA document) wrapper: body-fragment with header/footer placeholders. */
export function pageDoc(sectionsHtml) {
  return `<body>\n  <header></header>\n  <main>\n${sectionsHtml.map((s) => `    ${s}`).join('\n')}\n  </main>\n  <footer></footer>\n</body>\n`;
}
