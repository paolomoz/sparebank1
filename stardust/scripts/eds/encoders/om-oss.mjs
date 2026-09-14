/**
 * encoders/om-oss.mjs — family encoders for the OM OSS pages (presse archetype /nb/bank/om-oss/presse.html + 7 siblings).
 * Own modules: the split photo hero (`campaign` → `carousel campaign` like the market landings, + `white`/`lead` variants) and the
 * press-contact rows (`adviser-list` → NEW block `adviser-list`, one row per contact). Bands/cols reuse the core walker plus the
 * lifted cell models the core lacks (cols-9/10/11 grid width, `wN` illustration column, `lead-2` h2-lead, `subtle` last line).
 *
 * Loader note (eds-requests.md W1 #0): convert.mjs merges encoders/*.mjs alphabetically, so `band`/`cols` are won by utility.mjs
 * for every page (it delegates to CORE.band/CORE.cols outside its family). The om-oss overrides are therefore installed as
 * FAMILY-GATED wrappers on the core map itself (`gateCore`): any other family — the product page included — reaches the original
 * core encoder untouched; the default export only carries keys this file legitimately wins (campaign, adviser-list).
 */
import * as L from '../lib.mjs';
import { ENCODERS as CORE, richtext, cardRows, bandBg, bgToken, styleOf } from '../encoders.mjs';
import ml from './market-landing.mjs';
import { familyOf } from './category-hub.mjs';

const { section, block, heading, q, qa, cls, esc, inline, pic } = L;
const FAMILY = 'om-oss';
const isOmOss = (ctx) => familyOf(ctx) === FAMILY;

/** Install a family-gated override of a core key ON the core map (chainable: a later family gate wraps this one). */
export function gateCore(key, family, fn) {
  const orig = CORE[key];
  CORE[key] = (root, ctx, opts) => (familyOf(ctx) === family ? fn(root, ctx, opts, orig) : (orig ? orig(root, ctx, opts) : null));
  return CORE[key];
}

const gridCols = (row) => { const m = /grid-row--cols-(\d+)/.exec(row.getAttribute('class') || ''); return m && m[1] !== '12' ? `cols-${m[1]}` : null; };
/** An image-only column whose .image carries the live max-width (`--w:200px`) → cell token `wN` (columns.js: centred, uncropped, N px). */
function illustrationWidth(col) {
  const image = q(col, ':scope > .col__content > .image'); if (!image) return null;
  const m = /--w:\s*(\d+)px/.exec(image.getAttribute('style') || ''); return m ? `w${m[1]}` : null;
}

/** adviser-list → `adviser-list` block: one row per contact [portrait][bold name, role, phone, e-post link]; an authored h2 stays default content. */
export function adviserList(root, ctx, opts = {}) {
  const rows = qa(root, '.adviser').map((a) => {
    const img = q(a, 'img'); const name = q(a, '.adviser__name');
    let body = name ? `<p><strong>${inline(name, ctx)}</strong></p>` : '';
    for (const s of qa(a, ':scope > .adviser__subtext')) { const link = q(s, 'a'); body += link ? `<p><a href="${esc(L.href(link.getAttribute('href') || ''))}">${inline(link, ctx)}</a></p>` : `<p>${inline(s, ctx)}</p>`; }
    return [img ? pic(img, ctx) : '', body];
  });
  if (!rows.length) return null;
  if (!ctx.notes.some((n) => n.startsWith('lint D3 adviser-list'))) ctx.notes.push('lint D3 adviser-list: one row per contact [portrait][bold name, role, phone, e-post link] — the block reads the first paragraph as the name, a digits-only paragraph as the phone (live .adviser-name / .adviser-subtext / .adviser-phone)');
  const parts = [heading(q(root, '.adviser-list__title'), ctx), block('adviser-list', [], rows)];
  return { html: opts.inline ? parts.join('') : section(parts, { style: 'gap-48' }), blocks: ['adviser-list'] };
}

/**
 * Family band walker = core band() + the lifted cell/grid models: `cols-N` (live grid-row--cols-9/10/11), `wN` illustration column,
 * `lead-2` (the lead paragraph follows an h2), `subtle` (the last paragraph is the live .subtle-text 14/20 medium), `flush`
 * (the cols-9 text column keeps no live 16px first-child margin — the utility token carries one); band children in document order.
 */
export function omBand(root, ctx, opts = {}) {
  const tint = bgToken(bandBg(root) || bandBg(q(root, '.cols')));
  const parts = []; const blocks = []; let extraStyle = opts.topLevelCols ? 'cols' : 'band';
  const encodeRow = (row) => {
    const cols = qa(row, ':scope > .col');
    const cards = cols.filter((c) => q(c, ':scope > .col__content > .card'));
    const grid = gridCols(row);
    if (cards.length && cards.length === cols.length) { const span = (cls(cols[0]).find((c) => /^col-lg-\d+$/.test(c)) || 'col-lg-3').replace('col-', ''); parts.push(block('cards', ['grid', span, grid], cardRows(cols.map((c) => q(c, '.card')), ctx))); blocks.push('cards'); return; }
    if (cols.length === 1 && grid) { parts.push(richtext(q(cols[0], '.col__content'), ctx)); return; }
    const variants = cols.map((c) => { const k = cls(c); const span = (k.find((x) => /^col-lg-\d+$/.test(x)) || 'col-lg-12').replace('col-', ''); const off = k.find((x) => /^col-lg-offset-\d+$/.test(x)); const first = k.includes('col--first') ? 'first' : null; const align = (k.find((x) => /^col--(middle|center|bottom)$/.test(x)) || '').replace('col--', ''); return [span, off ? off.replace('col-lg-offset-', 'offset-') : null, first, align, illustrationWidth(c)].filter(Boolean).join('-'); });
    const cells = cols.map((c) => richtext(q(c, ':scope > .col__content'), ctx));
    const lead = q(row, '.lead-blue'); if (lead) { const p = lead.closest('p'); const prev = p?.previousElementSibling; variants.push(prev && prev.tagName === 'H2' ? 'lead-2' : 'lead'); }
    if (q(row, '.subtle-text')) variants.push('subtle');
    if (cols.some((c) => illustrationWidth(c) && !/--ratio/.test(q(c, ':scope > .col__content > .image')?.getAttribute("style") || ''))) variants.push('baseline'); // live inline <picture> (7px tail)
    if (q(row, '.button-list')) variants.push('button-gap'); // live desktop 8px under each button
    // an image-only column holding a non-ratio illustration WITHOUT an authored width (live: natural aspect at column width, inline picture) → media-plain + baseline
    if (cols.some((c) => { const im = q(c, ':scope > .col__content > .image'); const st = im?.getAttribute('style') || ''; return im && q(im, 'img') && !/--ratio/.test(st) && !/--w:/.test(st) && [...q(c, ':scope > .col__content').children].every((ch) => /\bimage\b/.test(ch.getAttribute('class') || '')); })) variants.push('media-plain', 'baseline');
    if (grid) { variants.push(grid); if (grid === 'cols-9') variants.push('flush'); }
    parts.push(block('columns', variants, [cells])); blocks.push('columns');
  };
  const walk = (children) => {
    for (const ch of children) {
      if (ch.tagName === 'HR') { extraStyle = styleOf(extraStyle, /rule--extra-top/.test(ch.className) ? 'rule-after' : null); continue; }
      if (ch.classList.contains('band__content')) { walk([...ch.children]); continue; }
      if (ch.classList.contains('cols')) { walk([...ch.children]); continue; }
      if (ch.classList.contains('grid-row')) { encodeRow(ch); continue; }
      if (ch.classList.contains('adviser-list')) { const r = adviserList(ch, ctx, { inline: true }); if (r) { parts.push(r.html); blocks.push(...r.blocks); } continue; }
      const enc = CORE[[...ch.classList].find((c) => CORE[c] && c !== 'band' && c !== 'cols')]; if (enc) { const r = enc(ch, ctx, { inline: true }); if (r) { parts.push(r.html); blocks.push(...r.blocks); } continue; }
      if (ch.classList.contains('richtext')) parts.push(richtext(ch, ctx));
    }
  };
  walk([...root.children]);
  return { html: section(parts, { style: styleOf(extraStyle, tint) }), blocks: [...new Set(blocks)] };
}

/** The presse split hero: one static slide → `carousel campaign reverse white lead` (same live component as the market-landing hero, D9). */
function omCampaign(root, ctx) {
  const img = q(root, '.campaign__img'); const text = q(root, '.campaign__content .richtext') || q(root, '.campaign__content');
  const bg = (root.getAttribute('style') || '').match(/--campaign-bg:\s*([^;]+)/i)?.[1]?.trim().toLowerCase();
  const variants = ['campaign', root.classList.contains('campaign--reverse') ? 'reverse' : null, bgToken(bg) ?? (/#fff(fff)?/.test(bg || '') ? 'white' : null), q(text, '.lead-blue') ? 'lead' : null];
  ctx.notes.push('lint D11 carousel: the presse split hero is the live .campaign component (7/12 photo + 5/12 text) authored as one slide of `carousel campaign` (D9 — same block as the market-landing hero); `white` = untinted, `lead` = h1 + lead paragraph');
  return { html: section([block('carousel', variants.filter(Boolean), [[pic(img, ctx), richtext(text, ctx)]])], { style: 'full' }), blocks: ['carousel'] };
}

/**
 * Top-level modules the loader routes to the `module` FALLBACK on om-oss pages (tool.mjs wins `title`/`image` and returns null outside
 * its family): the AEM page title, the AEM table module (`table full`), the tabs component the capture holds as plain richtext.
 */
function omModule(root, ctx, opts, orig) {
  const k = root.classList;
  if (k.contains('title')) {
    const h = q(root, 'h1, h2'); if (!h) return null;
    ctx.notes.push('title: the AEM page-title module → default content h1 in a `title` section (live: centred, margin 16/8 → 16/24)');
    return { html: section([`<${h.tagName.toLowerCase()}>${inline(h, ctx).trim()}</${h.tagName.toLowerCase()}>`], { style: 'title' }), blocks: [] };
  }
  if (k.contains('table-block')) {
    const t = q(root, 'table'); if (!t) return null;
    const cellHtml = (c) => { const s = inline(c, ctx).replace(/ /g, ' ').replace(/^(\s|<br>)+|(\s|<br>)+$/g, '').trim(); return `<p>${s && c.tagName === 'TH' ? `<strong>${s}</strong>` : s}</p>`; };
    const rows = qa(t, 'tr').map((tr) => [...tr.children].map(cellHtml));
    const cap = q(t, 'caption'); if (cap) ctx.notes.push(`table: the live caption "${cap.textContent.trim()}" is visually hidden (accessible name) — not authored (the page title names the table)`);
    ctx.notes.push('lint D11 table full: the Block Collection data-table block, one row per table row, first row = header; live row-header cells (th) are authored bold; `full` = the live 100%-width wrapping table');
    const parts = []; const title = q(root, '.table-block__title'); if (title && title.textContent.trim()) parts.push(richtext(title, ctx));
    parts.push(block('table', ['full'], rows));
    for (const tx of qa(root, ':scope > .richtext, .table-block__text')) parts.push(richtext(tx, ctx));
    return { html: section(parts, { style: 'gap-48' }), blocks: ['table'] };
  }
  if (k.contains('module--tabs-component')) {
    const html = richtext(root, ctx); if (!html.trim()) return null;
    ctx.notes.push('module tabs-component: the live tabs chrome is client-rendered — the capture holds the panel richtext (pseudo-heading h4 per period + PDF links) → default content (D1), section style module-prose');
    return { html: section([html], { style: 'module-prose, gap-48' }), blocks: [] };
  }
  return orig ? orig(root, ctx, opts) : null;
}
/** Top-level richtext on om-oss pages: the live 620px text column, left-aligned (canon core centres it for the product "Sammenlign priser" block). */
function omRichtext(root, ctx) { return { html: section([richtext(root, ctx)], { style: 'narrow, gap-48' }), blocks: [] }; }

gateCore('module', FAMILY, omModule);
gateCore('richtext', FAMILY, omRichtext);
gateCore('band', FAMILY, (root, ctx) => omBand(root, ctx));
gateCore('cols', FAMILY, (root, ctx) => omBand(root, ctx, { topLevelCols: true }));

export default {
  campaign: (root, ctx) => (isOmOss(ctx) ? omCampaign(root, ctx) : ml.campaign(root, ctx)),
  'adviser-list': (root, ctx, opts) => adviserList(root, ctx, opts),
  // registers the key so convert.mjs does not log a top-level AEM table as "no encoder" (the om-oss fallback gate renders it); other families keep their fallback
  'table-block': (root, ctx, opts) => (isOmOss(ctx) ? omModule(root, ctx, opts, null) : null),
};
