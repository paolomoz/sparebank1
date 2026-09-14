/**
 * encoders/utility.mjs — family encoders for the "service" families: utility (Basepage/Prisliste — kontakt.html + 1 sibling)
 * and tool (Verktøy — sperre-kort.html + 5 siblings; tool.mjs adds the title/lead modules and imports the walker from here).
 * Core keys overridden here (band, cols) are FAMILY-GATED (`isService(ctx)`): every other page falls through to the core
 * encoder unchanged, so the product page converts byte-identically.
 * What the core band() gets wrong on these pages (filed in stardust/rollout/eds-requests.md): the AEM table module
 * (.table-block) is dropped silently, a .richtext child is emitted as a NESTED section (section-metadata inside a section),
 * grid-row--cols-N is not carried, a second lead paragraph / p.ta-center / a non-rounded image lose their live shape.
 * Data table → the Block Collection `table` block (D11): the EDS pipeline turns every authored <table> into a block named
 * after its first row, so the collection block IS the native data table; one block row per table row, first row = header.
 */
import fs from 'node:fs';
import * as L from '../lib.mjs';
import { ENCODERS as CORE, richtext, cardRows, bannerSmall, bandBg, bgToken, styleOf } from '../encoders.mjs';

const { section, block, q, qa, cls, esc, inline } = L;

const PAGES = (() => { try { return JSON.parse(fs.readFileSync('stardust/state.json', 'utf8')).pages; } catch { return []; } })();
const FAMILY = Object.fromEntries(PAGES.map((p) => [p.slug, p.archetypeFamily])); const PAGE_URL = Object.fromEntries(PAGES.map((p) => [p.slug, p.url]));
export const familyOf = (ctx) => FAMILY[ctx.slug] || '';
export const SERVICE_FAMILIES = new Set(['utility', 'tool']);
export const isService = (ctx) => SERVICE_FAMILIES.has(familyOf(ctx));

const gridCols = (row) => { const m = /grid-row--cols-(\d+)/.exec(row.getAttribute('class') || ''); return m && m[1] !== '12' ? `cols-${m[1]}` : null; };

/** One live .grid-row → { kind: 'cards' | 'columns' | 'prose' } — mirrors core band(), plus the live shapes the core drops. */
export function serviceRow(row, ctx) {
  const cols = qa(row, ':scope > .col');
  const cards = cols.filter((c) => q(c, ':scope > .col__content > .card'));
  if (cards.length && cards.length === cols.length) {
    const span = (cls(cols[0]).find((c) => /^col-lg-\d+$/.test(c)) || 'col-lg-3').replace('col-', '');
    const medium = cards.every((c) => cls(q(c, '.card')).includes('card--medium') && !q(c, '.card__media img, .card__iconwrap img')); // live image-less medium cards keep the 200px image row
    if (medium) ctx.notes.push('cards medium: image-less live card--medium (the 200px image row stays, 20px title) — block variant');
    return { kind: 'cards', variants: ['grid', span, gridCols(row), medium ? 'medium' : null].filter(Boolean), rows: cardRows(cols.map((c) => q(c, '.card')), ctx) };
  }
  if (cols.length === 1 && gridCols(row)) return { kind: 'prose', html: richtext(q(cols[0], '.col__content'), ctx) }; // centred heading row → default content
  const variants = cols.map((c) => { const k = cls(c); const span = (k.find((x) => /^col-lg-\d+$/.test(x)) || 'col-lg-12').replace('col-', ''); const off = k.find((x) => /^col-lg-offset-\d+$/.test(x)); const first = k.includes('col--first') ? 'first' : null; const align = (k.find((x) => /^col--(middle|center|bottom)$/.test(x)) || '').replace('col--', ''); return [span, off ? off.replace('col-lg-offset-', 'offset-') : null, first, align].filter(Boolean).join('-'); });
  const cells = cols.map((c) => richtext(q(c, ':scope > .col__content'), ctx));
  const ps = qa(row, '.col__content .richtext p').filter((p) => p.textContent.trim());
  const leads = ps.filter((p) => q(p, '.lead-blue'));
  if (leads.length) variants.push(leads.length === ps.length ? 'lead-all' : 'lead');
  if (ps.length && ps.every((p) => /\bta-center\b/.test(p.getAttribute('class') || ''))) { variants.push('text-center'); ctx.notes.push('columns text-center: every paragraph of the row is a live p.ta-center — centred by the block variant (David\'s Model has no inline alignment)'); }
  const img = q(row, '.col__content > .image');
  if (img) { // the media column's shape: `media-plain` (fixed ratio, no radius — a square PNG), `media-illustration` (no ratio — an inline SVG, 250px max), `media-4-3` (the live 1920/1440 rounded photo; the block default is 3/2)
    const m = /--ratio:\s*([\d.]+)\/([\d.]+)/.exec(img.getAttribute('style') || ''); const ratio = m ? +m[1] / +m[2] : null;
    const rounded = cls(img).includes('image--rounded');
    if (!ratio) { variants.push('media-illustration'); if (rounded) variants.push('media-rounded'); } // live: every image WITHOUT --ratio is the inline 250px illustration (rounded or not)
    else if (!rounded) variants.push('media-plain');
    else if (Math.abs(ratio - 4 / 3) < 0.02) variants.push('media-4-3');
  }
  // live text blocks that do NOT collapse margins: a heading alone in its .richtext before a text .richtext, or a .richtext after a CTA row
  if (cols.some((c) => { const ch = qa(c, ':scope > .col__content > *'); return ch.some((x, i) => i > 0 && x.classList.contains('richtext') && (ch[i - 1].classList.contains('button-wrap') || (ch[i - 1].classList.contains('richtext') && /^H[1-6]$/.test(ch[i - 1].lastElementChild?.tagName || '')))); })) { variants.push('text-gap'); ctx.notes.push('columns text-gap: the live column holds several .richtext blocks (flow-roots) — a heading-only block before text, or text after a CTA row, keeps its 16px margin instead of collapsing'); }
  const gc = gridCols(row); if (gc) variants.push(gc);
  return { kind: 'columns', variants, cells };
}

/** The AEM table module → `table` block (+ its optional title / trailing texts as default content around it). */
export function tableBlock(root, ctx) {
  const parts = []; const t = q(root, 'table');
  const title = q(root, '.table-block__title'); if (title && title.textContent.trim()) parts.push(richtext(title, ctx));
  if (t) {
    const rows = qa(t, 'tr').map((tr) => [...tr.children].map((c) => `<p>${inline(c, ctx).trim()}</p>`));
    const cap = q(t, 'caption'); if (cap) ctx.notes.push(`table: the live caption "${cap.textContent.trim()}" is visually hidden (accessible name) — not authored (EW5 text-as-metadata would be the alternative; the heading context names the table)`);
    ctx.notes.push('lint D11 table: the Block Collection data-table block — one row per table row, first row = header (the live header cells are bold td); the EDS pipeline turns any authored <table> into a block, so this IS the native table');
    parts.push(block('table', ['contact'], rows));
  }
  for (const tx of qa(root, ':scope > .richtext, .table-block__text')) parts.push(richtext(tx, ctx));
  return { parts, blocks: t ? ['table'] : [] };
}

/** A band / top-level cols: children in DOCUMENT order (grid rows, table module, richtext, rule, banner-small). */
export function serviceBand(root, ctx, { topLevelCols = false } = {}) {
  const parts = []; const blocks = new Set(); const styles = [topLevelCols ? 'cols' : 'band', 'service'];
  const push = (p) => { if (p.kind === 'cards') { parts.push(block('cards', p.variants, p.rows)); blocks.add('cards'); } else if (p.kind === 'columns') { parts.push(block('columns', p.variants, [p.cells])); blocks.add('columns'); } else if (p.html) parts.push(p.html); };
  const walk = (el) => {
    for (const ch of el.children) {
      const k = cls(ch);
      if (ch.tagName === 'HR') { if (k.includes('rule--extra-top') && parts.length) styles.push('rule-after'); continue; }
      if (k.includes('band__content')) { walk(ch); continue; }
      if (k.includes('cols')) { qa(ch, ':scope > .grid-row').forEach((row) => push(serviceRow(row, ctx))); continue; }
      if (k.includes('grid-row')) { push(serviceRow(ch, ctx)); continue; }
      if (k.includes('table-block')) { const r = tableBlock(ch, ctx); parts.push(...r.parts); r.blocks.forEach((b) => blocks.add(b)); styles.push('table-band'); continue; }
      if (k.includes('banner-small')) { parts.push(bannerSmall(ch, ctx, { inline: true }).html); blocks.add('banner'); continue; }
      if (k.includes('module') && !ch.textContent.trim()) { ctx.notes.push(`module ${[...ch.classList].find((c) => c.startsWith('module--')) || 'module'}: empty in the capture (client-rendered widget — dynamics; nothing authored)`); continue; }
      if (k.includes('richtext')) { const sp = [...ch.children].findIndex((c) => c.textContent.trim()); if (sp > 0) { styles.push(`spacer-${sp}`); ctx.notes.push(`richtext: ${sp} leading empty paragraph(s) (the live author spacer <p>&nbsp;</p>) → section style spacer-${sp}; the pipeline drops empty paragraphs`); } }
      const html = richtext(ch, ctx); if (html) parts.push(html); // .richtext / .image / other prose
    }
  };
  walk(root);
  for (let i = 0; i < parts.length; i++) parts[i] = parts[i].replace(/href="\?([^"]*)"/g, (m, qs) => { ctx.notes.push(`href: document-relative "?${qs}" (the live site search) → fully-qualified on the page URL (D4)`); return `href="${esc((PAGE_URL[ctx.slug] || L.SOURCE_ORIGIN) + '?' + qs)}"`; });
  if (parts.some((p) => /^<h[1-6]>/.test(p)) && !topLevelCols) styles.push('center');
  if (topLevelCols && qa(root, ':scope > .grid-row').some((r) => qa(r, ':scope > .col').length === 1 && gridCols(r))) styles.push('center'); // the single centred heading row
  const bg = bandBg(root) || bandBg(q(root, '.cols'));
  return { html: section(parts, { style: styleOf(...styles, bgToken(bg) ?? ({ '#f2f2f9': 'syrin' })[bg] ?? null) }), blocks: [...blocks] };
}

export default {
  // tip → core callout (the FFE message box); the note records the D1 justification for the service families
  tip: (root, ctx) => { // + the live width (tip__col col-lg-N → callout lg-N; lg-6 is the block default) and alignment (tip--left → left), `small` = the 480px box
    const r = CORE.tip(root, ctx); if (!r || !isService(ctx)) return r;
    ctx.notes.push('lint D1 callout: the FFE message box (round info glyph overlapping a tinted box) is a designed component — heading/text/CTA stay authored prose in its one cell');
    const span = cls(q(root, '.tip__col')).find((c) => /^col-lg-\d+$/.test(c));
    const variants = [cls(root).includes('tip--left') ? 'left' : null, span && span !== 'col-lg-6' ? span.replace('col-', '') : null, cls(root).includes('tip--small') ? 'small' : null].filter(Boolean);
    const body = q(root, '.tip__body'); const trailing = body ? [...(q(body, ':scope > div') || body).children].reverse().findIndex((c) => c.textContent.trim()) : 0; // trailing <p>&nbsp;</p> author spacers (dropped by the pipeline) → 40px each
    if (trailing > 0) { variants.push(`spacer-${trailing}`); ctx.notes.push(`callout: ${trailing} trailing empty paragraph(s) in the live message box (author spacer) → variant spacer-${trailing}`); }
    if (variants.length) r.html = r.html.replace('<div class="callout tip">', `<div class="callout tip ${variants.join(' ')}">`);
    return r;
  },
  band: (root, ctx) => (isService(ctx) ? serviceBand(root, ctx) : CORE.band(root, ctx)),
  cols: (root, ctx) => (isService(ctx) ? serviceBand(root, ctx, { topLevelCols: true }) : CORE.cols(root, ctx)),
};
