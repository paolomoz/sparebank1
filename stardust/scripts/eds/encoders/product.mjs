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
 */
import fs from 'node:fs';
import * as L from '../lib.mjs';
import { ENCODERS as CORE, richtext, cardRows, bannerSmall, bandBg, bgToken, styleOf } from '../encoders.mjs';

const { section, block, heading, q, qa, cls, esc, inline, pic, href, ctaHtml } = L;

const FAMILY = (() => { try { return Object.fromEntries(JSON.parse(fs.readFileSync('stardust/state.json', 'utf8')).pages.map((p) => [p.slug, p.archetypeFamily])); } catch { return {}; } })();
const ARCHETYPE = 'nb-bank-privat-lan-boliglan-html';
export const isProductSibling = (ctx) => FAMILY[ctx.slug] === 'product' && ctx.slug !== ARCHETYPE;
const NEW_KINDS = '.price-terms, .disclosure, .steps, .accordion-module, .gcarousel, .experts';
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
  const variants = ['disclosure', box ? 'box' : null, box && bg && /^#fff/i.test(bg) ? 'white' : null, root.classList.contains('disclosure--left') ? 'left' : null].filter(Boolean);
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
  return { html: opts.inline ? parts.join('') : section(parts, { style: styleOf('steps', styleTint) }), blocks: ['accordion'] };
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
  if (cols.length === 1 && /grid-row--cols-/.test(row.className)) return { parts: [richtext(q(cols[0], '.col__content'), ctx)], blocks: [], after };
  const variants = cols.map((c) => { const k = cls(c); const span = (k.find((x) => /^col-lg-\d+$/.test(x)) || 'col-lg-12').replace('col-', ''); const off = k.find((x) => /^col-lg-offset-\d+$/.test(x)); const first = k.includes('col--first') ? 'first' : null; const align = (k.find((x) => /^col--(middle|center|bottom)$/.test(x)) || '').replace('col--', ''); return [span, off ? off.replace('col-lg-offset-', 'offset-') : null, first, align].filter(Boolean).join('-'); });
  const cells = cols.map((c) => {
    const cc = q(c, ':scope > .col__content'); if (!cc) return '';
    for (const m of qa(cc, ':scope > .price-terms, :scope > .disclosure')) { const enc = m.classList.contains('price-terms') ? priceTerms : disclosure; const r = enc(m, ctx, { inline: true }); after.push(r.html); blocks.push(...r.blocks); m.remove(); ctx.notes.push(`${m.classList[0]}: authored inside a columns-grid column on live — a columns cell cannot hold a block, so it follows the columns block as a sibling (layout stacks; content complete)`); }
    return richtext(cc, ctx);
  });
  if (q(row, '.lead-blue')) variants.push('lead');
  const parts = cells.some((c) => c.trim()) ? [block('columns', variants, [cells])] : [];
  return { parts, blocks: [...(parts.length ? ['columns'] : []), ...blocks], after };
}
export function productBand(root, ctx, { topLevelCols = false } = {}) {
  const parts = []; const blocks = new Set(); let style = topLevelCols ? 'cols' : 'band';
  const walk = (el) => {
    for (const ch of el.children) {
      const k = cls(ch);
      if (ch.tagName === 'HR') { if (k.includes('rule--extra-top')) style = styleOf(style, 'rule-after'); continue; }
      if (k.includes('band__content')) { walk(ch); continue; }
      if (k.includes('cols') || k.includes('grid-row')) { for (const row of (k.includes('cols') ? qa(ch, ':scope > .grid-row') : [ch])) { const r = gridRow(row, ctx); parts.push(...r.parts, ...r.after); r.blocks.forEach((b) => blocks.add(b)); } continue; }
      const key = k.find((c) => ENC_INLINE[c]); if (key) { const r = ENC_INLINE[key](ch, ctx, { inline: true }); if (r) { parts.push(r.html); r.blocks.forEach((b) => blocks.add(b)); } continue; }
      if (k.includes('banner-small')) { parts.push(bannerSmall(ch, ctx, { inline: true }).html); blocks.add('banner'); continue; }
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

const ENC_INLINE = { 'price-terms': priceTerms, disclosure, steps, 'accordion-module': accordionModule, gcarousel: carousel, experts };
const hasNew = (root) => !!q(root, NEW_KINDS);

export default {
  'price-terms': priceTerms, disclosure, steps, 'accordion-module': accordionModule, gcarousel: carousel, experts,
  image: (root, ctx) => (isProductSibling(ctx) && root.parentElement?.tagName === 'MAIN' ? topImage(root, ctx) : null),
  'button-wrap': (root, ctx) => (isProductSibling(ctx) && root.parentElement?.tagName === 'MAIN' ? topCta(root, ctx) : null),
  band: (root, ctx) => (isProductSibling(ctx) && hasNew(root) ? productBand(root, ctx) : CORE.band(root, ctx)),
  cols: (root, ctx) => (isProductSibling(ctx) && hasNew(root) ? productBand(root, ctx, { topLevelCols: true }) : CORE.cols(root, ctx)),
  faq: (root, ctx) => (isProductSibling(ctx) && q(root, '.comparison, .gcarousel, .accordion__body > .cols') ? productFaq(root, ctx) : CORE.faq(root, ctx)),
};
