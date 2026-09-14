/**
 * encoders/product.mjs — family encoders for the PRODUCT siblings (29 pages under types.product.pages; the boliglan archetype
 * is covered by the core map and must convert byte-identically — every core key touched here (band, cols, faq) is FAMILY- and
 * SHAPE-gated: it delegates to the core encoder unless the page is a product sibling AND the module carries one of the new kinds).
 * New module kinds (replica vocabulary → EDS model):
 *   .price-terms       → `price-terms` block, one template-slotted row [title + price figure][terms list, overlay link, footnote]
 *                        (nested inside a band: the block is emitted inline, tint as a block variant)
 *   .disclosure        → `accordion disclosure` (one row [pill label][content]; variants box/white/sand; section style disclosure[-tight])
 *   .steps             → h2 default content + `accordion steps` (one row per step [linked title][content]) in a `steps, sand` section
 *   .accordion-module  → h3 + sub-lead default content + plain `accordion` block in an `accordion-module` section
 *   .gcarousel         → h2 default content + `carousel guide` block (one row per slide [image][body][tab name]) in a `carousel, <tint>` section
 *   .experts           → `cards people` (one row per expert [photo][name h3, role p, bio p, link p])
 *   main > .image      → default content image in an `icon-image[, rounded, w-N | h-N]` section
 *   main > .button-wrap→ default content CTA in a `cta, center` section
 *   FAQ answers holding a comparison table / a carousel / grid columns → flattened to default content (nested blocks are not a thing)
 *   columns-grid columns holding a price-terms/disclosure → the columns block keeps the prose; the modules follow as sibling blocks
 * Registration: convert.mjs merges family files alphabetically and the LAST file wins a shared key — utility.mjs (sorts after
 * product.mjs) re-registers band/cols/tip delegating to CORE, which would make the overrides below unreachable, and core band()
 * resolves nested modules against the CORE map only. So this file installs its family-gated wrappers ON the CORE map
 * (CORE.band/cols/faq/tip → product wrapper → original core for every other page) and adds its NEW keys to CORE so a
 * price-terms/steps/… nested in a band is reachable from core band(). Every wrapper is a no-op off the product siblings
 * (boliglan converts byte-identically). Filed in stardust/rollout/eds-requests.md: chain family overrides in the loader.
 */
import fs from 'node:fs';
import * as L from '../lib.mjs';
import { ENCODERS as CORE, richtext, cardRows, bannerSmall, bandBg, bgToken, styleOf } from '../encoders.mjs';
import { hubRelated } from './category-hub.mjs';

const { section, block, heading, q, qa, cls, esc, inline, pic, href, ctaHtml } = L;

const FAMILY = (() => { try { return Object.fromEntries(JSON.parse(fs.readFileSync('stardust/state.json', 'utf8')).pages.map((p) => [p.slug, p.archetypeFamily])); } catch { return {}; } })();
const ARCHETYPE = 'nb-bank-privat-lan-boliglan-html';
export const isProductSibling = (ctx) => FAMILY[ctx.slug] === 'product' && ctx.slug !== ARCHETYPE;
const NEW_KINDS = '.price-terms, .disclosure, .steps, .accordion-module, .gcarousel, .experts, a[href^="${"], .band__content > .faq, .band__content > .usp, .band__content > .tip, .band__content > .feedback, .band__content > .related-products, .band__content > .related-topics, .band__content > .static-cards, .band__content > .card-list, .band__content > .shortcuts';
/** live hrefs left as unresolved AEM link placeholders (`${linksbm.x.y}` — resolved client-side on live) → bounce to the source page (lint D4 would 🔴 a document-relative href) */
function fixPlaceholderHrefs(root, ctx) {
  for (const a of qa(root, 'a[href^="${"]')) { const src = (() => { try { return JSON.parse(fs.readFileSync('stardust/state.json', 'utf8')).pages.find((p) => p.slug === ctx.slug)?.url; } catch { return null; } })() || 'https://www.sparebank1.no/'; ctx.notes.push(`href: "${a.getAttribute('href')}" is an unresolved live link placeholder (client-side rewrite, like lenker.sparebank1.no) — bounced to the source page ${src}`); a.setAttribute('href', src); }
  return root;
}
const SITES = /^(?:https?:\/\/www\.sparebank1\.no)?\/content\/sites\/sb1\//;
const normaliseHrefs = (root) => { for (const a of qa(root, 'a[href]')) { const h = a.getAttribute('href') || ''; if (SITES.test(h)) a.setAttribute('href', h.replace(SITES, 'https://www.sparebank1.no/')); } return root; };
const wrapOrSection = (html, opts, meta) => (opts?.inline ? html : section([html], meta));
const tintOf = (root) => bgToken(bandBg(root));

/* ------------------------------------------------------------------ price-and-terms ------------------------------------------------------------------ */
export function priceTerms(root, ctx, opts = {}) {
  const title = q(root, '.price-terms__title'); const price = q(root, '.price-terms__price'); const terms = q(root, '.price-terms__terms');
  const link = q(root, '.price-terms__link'); const sub = q(root, '.price-terms__sub');
  let c1 = title ? heading(title, ctx) : '';
  if (price) { const before = q(price, '.price-terms__before'); const fig = [q(price, '.price-terms__number'), q(price, '.price-terms__after')].filter(Boolean).map((s) => s.textContent.trim()).join(' '); if (before) c1 += `<p>${inline(before, ctx)}</p>`; if (fig) c1 += `<p>${esc(fig)}</p>`; }
  let c2 = terms ? L.list(terms, ctx) : '';
  if (link) c2 += `<p><a href="${esc(href(link.getAttribute('href') || ''))}">${inline(link, ctx)}</a></p>`;
  if (sub) c2 += richtext(sub, ctx);
  const size = (cls(price).find((c) => /^price-terms__price--(small|large)$/.test(c)) || '').replace('price-terms__price--', '');
  const variants = [size || null, opts.inline ? tintOf(root) : null].filter(Boolean);
  ctx.notes.push('lint D3 price-terms: template-slotted like banner — one row [title + price figure][check list, overlay link, footnote]; the live "Se … hos en av våre banker" link opens a client-rendered bank-choice overlay (dynamics interim: plain link)');
  if (link && /#price_and_terms/.test(link.getAttribute('href') || '')) ctx.notes.push('price-terms: the overlay link targets its own module anchor on live (bank chooser dialog) — kept verbatim, no-op until the dialog dynamic exists');
  const html = block('price-terms', variants, [[c1, c2]]);
  const tight = root.classList.contains('price-terms--after-plain');
  return { html: wrapOrSection(html, opts, { style: styleOf('price-terms', tight ? 'price-terms-tight' : null, tintOf(root)) }), blocks: ['price-terms'] };
}

/* ------------------------------------------------------------------ progressive-disclosure ------------------------------------------------------------------ */
export function disclosure(root, ctx, opts = {}) {
  const label = q(root, '.disclosure__btn .btn__label'); const content = q(root, '.disclosure__content'); const inner = q(root, '.disclosure__inner') || content;
  const box = content?.classList.contains('disclosure__content--box'); const bg = bandBg(content);
  const centred = inner && qa(inner, 'h1, h2, h3, h4, p').length > 0 && qa(inner, 'h1, h2, h3, h4, p').every((n) => n.classList.contains('ta-center') || !n.textContent.trim());
  const variants = ['disclosure', box ? 'box' : null, box && bg && /^#fff/i.test(bg) ? 'white' : null, root.classList.contains('disclosure--left') ? 'left' : null, centred ? 'center' : null].filter(Boolean);
  if (centred) ctx.notes.push('accordion disclosure center: every heading/paragraph of the live content carries an inline text-align:center — carried as the block variant (David\'s Model has no inline alignment)');
  ctx.notes.push('lint D1 accordion disclosure: the live progressive-disclosure (expand pill + collapsed content box) — one row [pill label][content]; the label <p> moves into the button (EW8)');
  const html = block('accordion', variants, [[`<p>${inline(label, ctx)}</p>`, richtext(inner, ctx)]]);
  const tight = root.classList.contains('disclosure--after-text');
  return { html: wrapOrSection(html, opts, { style: styleOf('disclosure', tight ? 'disclosure-tight' : null) }), blocks: ['accordion'] };
}

/* ------------------------------------------------------------------ step-by-step ------------------------------------------------------------------ */
export function steps(root, ctx, opts = {}) {
  const tint = (cls(root).find((c) => /^steps--/.test(c)) || 'steps--sand').replace('steps--', '');
  const parts = []; const h = q(root, '.steps__title'); if (h) parts.push(heading(h, ctx));
  const rows = qa(root, '.steps__item').map((it) => { const a = q(it, '.steps__link'); const t = q(it, '.steps__step-title'); return [a ? `<p><a href="${esc(href(a.getAttribute('href') || ''))}">${inline(a, ctx)}</a></p>` : `<p>${inline(t, ctx)}</p>`, richtext(q(it, '.steps__content'), ctx)]; });
  parts.push(block('accordion', ['steps'], rows));
  ctx.notes.push('lint D1 accordion steps: the live step-by-step widget (numbered master list + detail panel; mobile: inline expansion) — one row per step [linked step title][content]; step 1 open at rest');
  const styleTint = { sand: 'sand', bluePale: 'frost', white: null, warmLightGrey: 'grey' }[tint] ?? 'sand';
  return { html: opts.inline ? parts.join('') : section(parts, { style: styleOf('steps', styleTint) }), blocks: ['accordion'], style: opts.inline ? styleOf('steps', styleTint) : undefined };
}

/* ------------------------------------------------------------------ generic accordion module ------------------------------------------------------------------ */
export function accordionModule(root, ctx, opts = {}) {
  const inner = q(root, '.accordion-module__inner') || root; const parts = [];
  for (const ch of inner.children) {
    if (ch.classList.contains('accordion')) { parts.push(block('accordion', [], qa(ch, '.accordion__item').map((it) => [`<p>${inline(q(it, '.accordion__label'), ctx)}</p>`, richtext(q(it, '.accordion__body'), ctx)]))); continue; }
    parts.push(richtext({ childNodes: [ch] }, ctx));
  }
  return { html: opts.inline ? parts.join('') : section(parts, { style: 'accordion-module' }), blocks: ['accordion'] };
}

/* ------------------------------------------------------------------ guide-carousel ------------------------------------------------------------------ */
export function carousel(root, ctx, opts = {}) {
  const tint = (cls(root).find((c) => /^gcarousel--(frost|sand|syrin|hvit)/.test(c)) || '').replace('gcarousel--', '').replace(/-30$/, '');
  const layout = (cls(root).find((c) => /^gcarousel--layout\d$/.test(c)) || 'gcarousel--layout1').replace('gcarousel--', '');
  const parts = []; const h = q(root, '.gcarousel__title'); if (h) parts.push(heading(h, ctx));
  const tabs = qa(root, '.gcarousel__tabs [role=tab]');
  const rows = qa(root, '.gcarousel__item').map((it, i) => { const img = q(it, '.gcarousel__image img'); const body = `${heading(q(it, '.gcarousel__heading'), ctx)}${richtext(q(it, '.gcarousel__desc'), ctx)}`; const tab = tabs[i] ? `<p>${inline(tabs[i], ctx)}</p>` : ''; return [img ? pic(img, ctx) : '', body, tab]; });
  parts.push(block('carousel', ['guide', layout !== 'layout1' ? layout : null].filter(Boolean), rows));
  ctx.notes.push('lint D1 carousel: the live guide-carousel (one slide visible, "1 av N", prev/next) — one row per slide [screenshot][title + copy][slide name (the visually-hidden tab label)]; the counter and the Forrige/Neste controls are block chrome');
  const tintTok = { frost: 'frost', sand: 'sand', syrin: 'syrin', hvit: null }[tint] ?? null;
  return { html: opts.inline ? parts.join('') : section(parts, { style: styleOf('carousel', tintTok) }), blocks: ['carousel'] };
}

/* ------------------------------------------------------------------ contentfragmentlist (experts) ------------------------------------------------------------------ */
export function experts(root, ctx, opts = {}) {
  const rows = qa(root, '.expert').map((e) => { normaliseHrefs(e); const img = q(e, '.expert__img'); let body = heading(q(e, '.expert__name'), ctx); for (const p of qa(e, '.expert__org, .expert__desc')) body += `<p>${inline(p, ctx)}</p>`; const a = q(e, '.expert__cta'); if (a) body += `<p><a href="${esc(href(a.getAttribute('href') || ''))}">${inline(a, ctx)}</a></p>`; return [img ? pic(img, ctx) : '', body]; });
  ctx.notes.push('cards people: the experts list (bio cards) — one row per expert [portrait][name h3, role, bio, "Les mer om …" link]; card-as-link via the trailing link (EW6)');
  return { html: opts.inline ? block('cards', ['people'], rows) : section([block('cards', ['people'], rows)], { style: 'experts' }), blocks: ['cards'] };
}

/* ------------------------------------------------------------------ top-level image / CTA ------------------------------------------------------------------ */
export function topImage(root, ctx) {
  const img = q(root, 'img'); if (!img) return null;
  const st = root.getAttribute('style') || ''; const w = /--w:\s*(\d+)px/.exec(st); const hh = /--h:\s*(\d+)px/.exec(st);
  const tokens = ['icon-image', root.classList.contains('image--rounded') ? 'rounded' : null, w ? `w-${w[1]}` : null, hh ? `h-${hh[1]}` : null];
  return { html: section([pic(img, ctx)], { style: styleOf(...tokens) }), blocks: [] };
}
export function topCta(root, ctx) {
  const links = qa(root, 'a.btn, button.btn'); if (!links.length) return null;
  const html = links.map((a) => (a.tagName === 'A' ? ctaHtml(a, ctx) : `<p>${inline(q(a, '.btn__label') || a, ctx)}</p>`)).join('');
  const align = (cls(root).find((c) => /^button-wrap--(center|right|left)$/.test(c)) || 'button-wrap--left').replace('button-wrap--', '');
  return { html: section([html], { style: styleOf('cta', align === 'left' ? null : align) }), blocks: [] };
}

/* ------------------------------------------------------------------ band / cols (document order, nested product modules lifted out of columns) ------------------------------------------------------------------ */
/** mirrors core band()'s grid-row branch; returns { parts, blocks, after } where `after` = modules lifted out of a column (no nested blocks) */
function gridRow(row, ctx) {
  const cols = qa(row, ':scope > .col'); const after = []; const blocks = [];
  const cards = cols.filter((c) => q(c, ':scope > .col__content > .card'));
  if (cards.length && cards.length === cols.length) { const span = (cls(cols[0]).find((c) => /^col-lg-\d+$/.test(c)) || 'col-lg-3').replace('col-', ''); return { parts: [block('cards', ['grid', span], cardRows(cols.map((c) => q(c, '.card')), ctx))], blocks: ['cards'], after }; }
  if (cols.length === 1 && /grid-row--cols-/.test(row.className)) { const n = (/grid-row--cols-(\d+)/.exec(row.className) || [])[1]; return { parts: [richtext(q(cols[0], '.col__content'), ctx)], blocks: [], after, style: n && n !== '12' ? `head-w${n}` : null }; }
  // image-only cell model tokens (columns.js parses them additively): wN = authored max-width · hN = authored fixed height (letterboxed SVG) ·
  // natural = a bare img (logo) at its intrinsic size · rAxB = a photo with an authored aspect ratio other than the core 3:2 crop
  const illo = (c) => { const cc = q(c, ':scope > .col__content'); if (!cc) return null; const kids = [...cc.children]; if (kids.length === 1 && /\bvideo\b/.test(kids[0].className)) { ctx.notes.push('columns video: the live cell is a YouTube embed (poster + lazy iframe) — authored as its poster image in a 16:9 cell (the embed is a dynamics request)'); return 'r16x9-video'; } if (!kids.length || !kids.every((k) => /\bimage\b/.test(k.className))) return null; const im = q(cc, '.image'); const st = im?.getAttribute('style') || ''; const src = q(cc, 'img')?.getAttribute('src') || ''; const w = /--w:\s*(\d+)px/.exec(st); const h = /--h:\s*(\d+)px/.exec(st); const r = /--ratio:\s*([\d.]+)\/([\d.]+)/.exec(st); const svg = /\.svg(\?|$)/i.test(src); const toks = []; if (w) toks.push(`w${w[1]}`); if (h) toks.push(`h${h[1]}`); if (r) { const a = Math.round(+r[1]), b = Math.round(+r[2]); if (Math.abs(a / b - 1.5) > 0.02) toks.push(`r${a}x${b}`); } if (!toks.length && svg && !r) toks.push('w1280'); return toks.join('-') || null; }; // an SVG illustration without w/h/ratio is the live img width:100% uncropped (wN with the container cap)
  const variants = cols.map((c) => { const k = cls(c); const span = (k.find((x) => /^col-lg-\d+$/.test(x)) || 'col-lg-12').replace('col-', ''); const off = k.find((x) => /^col-lg-offset-\d+$/.test(x)); const first = k.includes('col--first') ? 'first' : null; const align = (k.find((x) => /^col--(middle|center|bottom)$/.test(x)) || '').replace('col--', ''); return [span, off ? off.replace('col-lg-offset-', 'offset-') : null, first, align, illo(c)].filter(Boolean).join('-'); });
  // photo cells: every column opens with a rounded photo followed by text (the live 4-up "reasons" grid) → the block keeps the 30px radius / 3:2 crop
  const firstImg = (c) => { const cc = q(c, ':scope > .col__content'); return cc && cc.children.length > 1 && /\bimage\b/.test(cc.children[0].className) ? cc.children[0] : null; };
  if (cols.length > 1 && cols.every((c) => { const im = firstImg(c); return im && /--ratio/.test(im.getAttribute('style') || ''); })) variants.push('photo-cells');
  // illustration cells: every column opens with a fixed-height SVG illustration (live img style="width:100%;height:Npx") followed by text
  const hs = cols.map((c) => { const im = firstImg(c); const m = im && /--h:\s*(\d+)px/.exec(im.getAttribute('style') || ''); return m ? m[1] : null; });
  if (cols.length > 1 && hs.every(Boolean)) variants.push('illo-cells', `h${hs[0]}`);
  const cells = cols.map((c) => {
    const cc = q(c, ':scope > .col__content'); if (!cc) return ''; fixPlaceholderHrefs(cc, ctx);
    for (const m of qa(cc, ':scope > .price-terms, :scope > .disclosure')) { const enc = m.classList.contains('price-terms') ? priceTerms : disclosure; const r = enc(m, ctx, { inline: true }); after.push(r.html); blocks.push(...r.blocks); m.remove(); ctx.notes.push(`${m.classList[0]}: authored inside a columns-grid column on live — a columns cell cannot hold a block, so it follows the columns block as a sibling (layout stacks; content complete)`); }
    return richtext(cc, ctx);
  });
  if (q(row, '.lead-blue')) variants.push('lead');
  const parts = cells.some((c) => c.trim()) ? [block('columns', variants, [cells])] : [];
  return { parts, blocks: [...(parts.length ? ['columns'] : []), ...blocks], after, style: null };
}
/** a core encoder called inline still returns a whole section (`<div>…<div class="section-metadata">…</div></div>`): unwrap it — a nested
 *  section is not decorated by the EDS runtime (its block stays raw rows). Returns the inner html + the section's style tokens. */
function unwrapSection(html) {
  const m = /^<div>([\s\S]*?)(<div class="section-metadata">[\s\S]*?<\/div><\/div><\/div>)?<\/div>$/.exec(html.trim()); if (!m) return { html, style: null };
  const style = m[2] ? (/<div>style<\/div><div>([^<]*)<\/div>/.exec(m[2]) || [])[1] || null : null;
  return { html: m[1], style };
}
export function productBand(root, ctx, { topLevelCols = false } = {}) {
  const parts = []; const blocks = new Set(); let style = styleOf(topLevelCols ? 'cols' : 'band', 'product');
  const content = q(root, ':scope > .band__content') || root; const single = [...content.children].filter((c) => c.tagName !== 'HR').length === 1;
  const walk = (el) => {
    for (const ch of el.children) {
      const k = cls(ch);
      if (ch.tagName === 'HR') { if (k.includes('rule--extra-top')) style = styleOf(style, 'rule-after'); continue; }
      if (k.includes('band__content')) { walk(ch); continue; }
      if (k.includes('cols') || k.includes('grid-row')) { for (const row of (k.includes('cols') ? qa(ch, ':scope > .grid-row') : [ch])) { const r = gridRow(row, ctx); parts.push(...r.parts, ...r.after); r.blocks.forEach((b) => blocks.add(b)); if (r.style) style = styleOf(style, r.style); } continue; }
      if (k.includes('banner-small')) { parts.push(bannerSmall(ch, ctx, { inline: true }).html); blocks.add('banner'); continue; }
      const key = k.find((c) => CORE[c] && !['band', 'cols', 'module', 'richtext'].includes(c));
      if (key) { const r = CORE[key](ch, ctx, { inline: true }); if (r) { const u = unwrapSection(r.html); parts.push(u.html); r.blocks.forEach((b) => blocks.add(b)); const tok = r.style || (single ? u.style : null); if (tok) style = styleOf(style, tok); if (!single && u.style) ctx.notes.push(`band: nested ${key} module — its own section style (${u.style}) is dropped inside a band that holds other modules`); } continue; }
      const html = richtext(ch, ctx); if (html) parts.push(html);
    }
  };
  walk(root);
  return { html: section(parts, { style: styleOf(style, bgToken(bandBg(root) || bandBg(q(root, '.cols')))) }), blocks: [...blocks] };
}

/* ------------------------------------------------------------------ FAQ with widgets inside an answer ------------------------------------------------------------------ */
/** coverage table → default content: one <h4>-less block per feature: <p>feature</p><ul>covered-by…</ul><p>details</p> (the visually-hidden "Dekkes av X" texts ARE the live cell content) */
function comparisonProse(cmp, ctx) {
  let out = '';
  const filter = qa(cmp, '.comparison__tab').map((b) => b.textContent.trim()); if (filter.length) out += `<p>${filter.map(esc).join(' · ')}</p>`;
  for (const table of qa(cmp, 'table')) {
    const heads = qa(table, 'thead th').map((th) => inline(th, ctx).trim()).filter(Boolean); if (heads.length) out += `<p>${heads.join(' · ')}</p>`;
    for (const tr of qa(table, 'tbody > tr')) {
      if (tr.classList.contains('comparison-table__expandable-content')) { const txt = richtext(q(tr, 'td'), ctx); if (txt.trim()) out += txt; continue; }
      const th = q(tr, 'th'); const cells = qa(tr, 'td.comparison-table__content').map((td) => td.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean);
      if (th) out += `<p><strong>${inline(th, ctx).trim()}</strong></p>`; if (cells.length) out += `<ul>${cells.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>`;
    }
  }
  return out;
}
function carouselProse(car, ctx) { let out = heading(q(car, '.gcarousel__title'), ctx); for (const it of qa(car, '.gcarousel__item')) { const img = q(it, '.gcarousel__image img'); if (img) out += pic(img, ctx); out += heading(q(it, '.gcarousel__heading'), ctx) + richtext(q(it, '.gcarousel__desc'), ctx); } return out; }
export function productFaq(root, ctx) {
  const items = qa(root, '.accordion__item'); const visible = items.filter((it) => !/display:\s*none/.test(it.getAttribute('style') || '')).length;
  const rows = items.map((it) => {
    const qEl = q(it, '.accordion__label'); const body = q(it, '.accordion__body'); let answer = '';
    for (const ch of body?.children || []) {
      if (ch.classList.contains('feedback')) continue;
      if (ch.classList.contains('accordion__link')) { answer += `<p><a href="${esc(href(ch.getAttribute('href') || ''))}">${esc(q(ch, '.visually-hidden')?.textContent.trim() || 'Les mer')}</a></p>`; continue; }
      if (ch.classList.contains('comparison')) { answer += comparisonProse(ch, ctx); ctx.notes.push('faq: a coverage comparison table sits inside this answer on live — flattened to default content (feature, covered-by list, details); a table/block cannot nest inside an accordion row'); continue; }
      if (ch.classList.contains('gcarousel')) { answer += carouselProse(ch, ctx); ctx.notes.push('faq: a guide-carousel sits inside this answer on live — its slides are authored as prose (title, copy, screenshot); no nested blocks'); continue; }
      if (ch.classList.contains('cols')) { for (const row of qa(ch, ':scope > .grid-row')) for (const col of qa(row, ':scope > .col')) answer += richtext(q(col, '.col__content'), ctx); ctx.notes.push('faq: a columns-grid sits inside this answer on live — cells authored in order as prose (no nested blocks)'); continue; }
      answer += richtext(ch, ctx);
    }
    return [`<p>${inline(qEl, ctx)}</p>`, answer];
  });
  const more = q(root, '.faq__more-btn .btn__label');
  const parts = [richtext(q(root, '.faq__title'), ctx), block('accordion', ['faq', visible < items.length ? `show-${visible}` : null].filter(Boolean), rows)];
  if (more) parts.push(`<p>${esc(more.textContent.trim())}</p>`);
  return { html: section(parts, { style: 'faq, gap-48' }), blocks: ['accordion'] };
}

/* ------------------------------------------------------------------ section (master/detail list) ------------------------------------------------------------------ */
export function sectionList(root, ctx, opts = {}) {
  const small = root.classList.contains('seclist--small-img'); const parts = [];
  const img = q(root, '.seclist__img'); if (img) parts.push(pic(img, ctx));
  const h = q(root, '.seclist__title'); if (h) parts.push(heading(h, ctx));
  const sub = q(root, '.seclist__header .sub-lead'); if (sub) parts.push(`<p>${inline(sub, ctx)}</p>`);
  // item content: prose; a nested columns-grid (text + illustration side by side on live) is authored illustration FIRST so the block can float it beside the text
  const itemHtml = (content) => { let out = ''; for (const ch of content?.children || []) { if (ch.classList.contains('cols')) { for (const row of qa(ch, ':scope > .grid-row')) { const cols = qa(row, ':scope > .col'); const imgCols = cols.filter((c) => { const cc = q(c, ':scope > .col__content'); return cc && [...cc.children].every((k) => /\bimage\b/.test(k.className)); }); for (const c of [...imgCols, ...cols.filter((c) => !imgCols.includes(c))]) out += richtext(q(c, ':scope > .col__content'), ctx); } if (q(ch, '.col__content > .image')) ctx.notes.push('accordion tabs: an item holds a columns-grid (text + illustration) on live — authored as prose with the illustration first (floated beside the text; no nested blocks)'); continue; } out += richtext({ childNodes: [ch] }, ctx); } return out; };
  const rows = qa(root, '.seclist__item').map((it) => [`<p>${inline(q(it, '.seclist__text'), ctx)}</p>`, itemHtml(q(it, '.seclist__content'))]);
  parts.push(block('accordion', ['tabs'], rows));
  ctx.notes.push('lint D1 accordion tabs: the live "section" master/detail module (list of section-items, active item shown in a detail panel; inline on mobile) — one row per item [item title][content]; item 1 open at rest');
  const style = styleOf('section-list', small ? 'small-img' : 'layout2', tintOf(root));
  return { html: opts.inline ? parts.join('') : section(parts, { style }), blocks: ['accordion'], style: opts.inline ? style : undefined };
}
const ENC_INLINE = { 'price-terms': priceTerms, disclosure, steps, 'accordion-module': accordionModule, gcarousel: carousel, experts, seclist: sectionList };
const hasNew = (root) => !!q(root, NEW_KINDS);

// family-gated wrappers installed on the CORE map (see header): the original core encoders stay the fallback for every other page
const coreBand = CORE.band, coreCols = CORE.cols, coreFaq = CORE.faq, coreTip = CORE.tip, coreModule = CORE.module, coreReference = CORE.reference, coreCalculator = CORE.calculator, coreRelated = CORE['related-products'], coreBanner = CORE['banner-small'], coreRichtext = CORE.richtext, coreShortcuts = CORE.shortcuts;
/** shortcuts: category-hub.mjs authors the hub markup (.shortcuts__title h2 + .shortcuts__item a.btn--shortcut) on every family; the core reader expects .shortcuts__link → 0 links (silent content loss on bankkort/billan/bankkonto) */
function productShortcuts(root, ctx, opts) {
  if (!isProductSibling(ctx) || q(root, '.shortcuts__link') || !q(root, '.shortcuts__item a')) return coreShortcuts(root, ctx, opts);
  const parts = [heading(q(root, 'h2'), ctx), `<ul>${qa(root, '.shortcuts__item a').map((a) => `<li><a href="${esc(href(a.getAttribute('href') || ''))}">${esc(L.txt(q(a, '.btn__label')) || L.txt(a))}</a></li>`).join('')}</ul>`];
  ctx.notes.push('shortcuts: hub-style markup (button pills) read from .shortcuts__item — same block shape as the core (heading + link list)');
  return { html: section([block('shortcuts', [], [[parts.join('')]])], { style: 'gap-72' }), blocks: ['shortcuts'] };
}
/** the hub-style related-products (icon card list — category-hub.mjs authors it on every family) → heading + `cards small`; the core reads .newsfeed cards only (0 rows = silent content loss) */
function productRelated(root, ctx, opts) {
  if (!isProductSibling(ctx) || !q(root, '.card-list')) return coreRelated(root, ctx, opts);
  const r = hubRelated(root, ctx); ctx.notes.push('related-products: the live icon-card list ("Se også") → heading + cards small (hub model); the core newsfeed reader would drop the cards');
  return { html: opts?.inline ? r.parts.join('') : section(r.parts, { style: styleOf('related', 'related-icons', tintOf(root)) }), blocks: r.blocks };
}
/** top-level page text on product siblings: a small-print paragraph (every text node inside .subtle-text → 14/20) and trailing empty author spacers (dropped by the pipeline → padding token) */
function productRichtext(root, ctx, opts) {
  const r = coreRichtext(root, ctx, opts); if (!r || !isProductSibling(ctx) || opts?.inline) return r;
  const ps = qa(root, ':scope > p'); const empty = ps.filter((p) => !p.textContent.trim() && !q(p, 'img')).length; const textPs = ps.filter((p) => p.textContent.trim());
  const small = textPs.length && textPs.every((p) => { const t = p.textContent.trim(); const sub = qa(p, '.subtle-text').map((x) => x.textContent.trim()).join(' '); return sub && sub.replace(/\s+/g, ' ') === t.replace(/\s+/g, ' '); });
  const afterTitle = root.previousElementSibling?.classList.contains('title'); const lead = !!q(root, '.main-lead') || (afterTitle && !!q(root, ':scope > p:first-child > span:only-child > span'));
  if (lead) ctx.notes.push('richtext main-lead: the live page lead (span.main-lead, 24/32 fjell centred) — carried as a section token');
  if (afterTitle) r.html = r.html.replace('center, narrow, gap-72', 'center, narrow, gap-24');
  const add = [small ? 'small-text' : null, lead ? 'main-lead' : null, empty ? `after-spacer-${Math.min(empty, 2)}` : null].filter(Boolean).join(', ');
  if (add) { r.html = r.html.replace(/(<div class="section-metadata"><div><div>style<\/div><div>)([^<]*)/, (m, a, v) => `${a}${v}, ${add}`); if (small) ctx.notes.push('richtext small-text: the live paragraph is wrapped in span.subtle-text (14/20) — carried as a section token (no inline classes in David\'s Model)'); if (empty) ctx.notes.push(`richtext after-spacer-${Math.min(empty, 2)}: ${empty} trailing empty author paragraph(s) reserve 40px each on live; the pipeline drops empty paragraphs`); }
  return r;
}
const wrapped = {
  // top-level image / CTA modules: tool.mjs owns the `image` and `button-wrap` keys (family-gated → null off its family) and convert.mjs then falls back to `module`
  module: (root, ctx, opts) => { if (isProductSibling(ctx) && root.parentElement?.tagName === 'MAIN') { if (root.classList.contains('image')) { const r = topImage(root, ctx); if (r) return r; } if (root.classList.contains('button-wrap')) { const r = topCta(root, ctx); if (r) return r; } } return coreModule(root, ctx, opts); },
  band: (root, ctx, opts) => (isProductSibling(ctx) ? productBand(root, ctx) : coreBand(root, ctx, opts)),
  cols: (root, ctx, opts) => (isProductSibling(ctx) ? productBand(root, ctx, { topLevelCols: true }) : coreCols(root, ctx, opts)),
  // reference: the core hardcodes the archetype's `rule-visible` (hr.show-hr before the module); siblings without the rule get the module's own 72px gap
  reference: (root, ctx, opts) => { const r = coreReference(root, ctx, opts); if (r && isProductSibling(ctx) && !(root.previousElementSibling?.tagName === 'HR' && /rule--visible/.test(root.previousElementSibling.className))) r.html = r.html.replace('reference, center, rule-visible', 'reference, center, gap-72'); return r; },
  // calculator: the core labels every snapshot "Boliglånskalkulator"; the product siblings name theirs by product
  calculator: (root, ctx, opts) => { const r = coreCalculator(root, ctx, opts); if (r && isProductSibling(ctx)) { const label = /forbrukslan/.test(ctx.slug) ? 'Forbrukslånskalkulator' : 'Lånekalkulator'; r.html = r.html.replace('>Boliglånskalkulator<', `>${label}<`); } return r; },
  // tip: the live `ffe-message-box--tips` (lightbulb in a sol ring, sand box) is recognised by its Material icon path → callout variant `tips lightbulb`
  'related-products': productRelated,
  richtext: productRichtext,
  shortcuts: productShortcuts,
  // top-level banner-small on product siblings: the live module sits 72px (48 mobile) under the previous module
  'banner-small': (root, ctx, opts) => { const r = coreBanner(root, ctx, opts); if (r && isProductSibling(ctx) && !opts?.inline && root.parentElement?.tagName === 'MAIN') r.html = r.html.replace(/<\/div>\s*$/, `${L.sectionMeta({ style: 'gap-72' })}</div>`); return r; },
  tip: (root, ctx, opts) => { const r = coreTip(root, ctx, opts); if (r && isProductSibling(ctx)) { ctx.notes.push('lint D1 callout: the FFE message box (round glyph overlapping a tinted box) is a designed component — heading/text/CTA stay authored prose in its one cell'); if (q(root, '.tip__icon svg path[d^="M480-80q-33.67"]')) { r.html = r.html.replace('class="callout tip"', 'class="callout tips lightbulb"'); ctx.notes.push('callout tips lightbulb: the live message box is the `tips` kind (lightbulb glyph, sol ring, sand box) — carried as block variants'); } } return r; },
  faq: (root, ctx, opts) => (isProductSibling(ctx) && q(root, '.comparison, .gcarousel, .accordion__body > .cols') ? productFaq(root, ctx) : coreFaq(root, ctx, opts)),
};
if (!CORE.__productWrapped) { Object.assign(CORE, wrapped, ENC_INLINE); Object.defineProperty(CORE, '__productWrapped', { value: true, enumerable: false }); }

export default {
  ...ENC_INLINE, ...wrapped,
  image: (root, ctx) => (isProductSibling(ctx) && root.parentElement?.tagName === 'MAIN' ? topImage(root, ctx) : null),
  'button-wrap': (root, ctx) => (isProductSibling(ctx) && root.parentElement?.tagName === 'MAIN' ? topCta(root, ctx) : null),
};
