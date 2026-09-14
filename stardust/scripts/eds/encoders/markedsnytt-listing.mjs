/**
 * encoders/markedsnytt-listing.mjs — family encoder for the Markedsnytt hub (/nb/bank/privat/sparing/markedsnytt.html, privat chrome).
 * Own models: the featured article card (`cards grid lg-3 featured photo cols-9`: cover photo + h6 teaser + centred button), the YouTube
 * rows (D1: a video URL may not live inside a block → default-content embed links auto-blocked by scripts.js into `embed`, laid out by the
 * `split-video` section on the live 11-column grid), the expert portrait column (`expert`: 250px rounded 1:1 portrait + centred h4),
 * stacked CTA rows (`stack-cta`), the dated news rail (`cards news`, date paragraph after the title), the hero tucked under the
 * bank-choice band (`mn-hero`) and the live in-page anchors (hr#artikler / hr#kommentarer → section id). Reuses the om-oss band walker;
 * gated on the core map (see om-oss.mjs header). NOTE: this file sorts BEFORE market-landing.mjs, whose `related-topics` key wins the
 * merged map → gated on the core map (market-landing delegates to CORE outside its family); the band-wrapped reference block is
 * handled by theme.mjs (family set).
 */
import * as L from '../lib.mjs';
import { ENCODERS as CORE, richtext, cardRows, bandBg, bgToken, styleOf } from '../encoders.mjs';
import { familyOf, normaliseHrefs, tint } from './category-hub.mjs';
import { gateCore, omBand } from './om-oss.mjs';

const { section, block, q, qa, cls, esc, inline, pic } = L;
const FAMILY = 'markedsnytt-listing';

/** Featured article cards (photo + h6 teaser + centred button) → `cards grid lg-N featured photo cols-9`, one row per card [photo][body]. */
function featuredRow(row, cols, ctx) {
  const cards = cols.map((c) => q(c, ':scope > .col__content > .card.card--featured'));
  if (!cards.length || cards.some((c) => !c)) return null;
  const span = (cls(cols[0]).find((c) => /^col-lg-\d+$/.test(c)) || 'col-lg-3').replace('col-', '');
  const grid = /grid-row--cols-(\d+)/.exec(row.getAttribute('class') || '')?.[1];
  ctx.notes.push('lint D5 cards featured photo: the live featured article card (cover photo, h6 teaser, centred "Les saken her" button) — one row per card [photo][teaser + CTA]; not clickable on live, the button is the only link');
  return { html: block('cards', ['grid', span, 'featured', 'photo', grid && grid !== '12' ? `cols-${grid}` : null], cards.map((c) => [pic(q(c, '.card__media img'), ctx), richtext(normaliseHrefs(q(c, '.card__content'), ctx), ctx)])), blocks: ['cards'] };
}

/** Before a cell is serialised: the YouTube module becomes a plain embed link (title = link text); the live shortcut pill is the secondary look. */
function prepCol(col, ctx) {
  for (const v of qa(col, '.video')) {
    const fr = q(v, 'iframe'); const url = fr?.getAttribute('data-video-url') || fr?.getAttribute('src'); if (!url) { v.remove(); continue; }
    const doc = col.ownerDocument; const p = doc.createElement('p'); const a = doc.createElement('a'); a.setAttribute('href', url); a.textContent = fr.getAttribute('title') || 'Video'; p.append(a); v.replaceWith(p);
    if (!ctx.notes.some((n) => n.startsWith('video:'))) ctx.notes.push('video: the live YouTube embed is authored as its fully-qualified embed URL (link text = the video title) as default content; scripts.js auto-blocks it into `embed` (D1). Live shows the lazy placeholder image until the player scrolls in — permanent residual (brief)');
  }
  for (const b of qa(col, 'a.btn--shortcut')) { b.setAttribute('class', b.getAttribute('class').replace('btn--shortcut', 'btn--secondary')); ctx.notes.push('cta: live ffe-button--shortcut (outline pill with arrow) authored as the secondary emphasis — the arrow glyph is block chrome the columns block does not add (residual)'); }
}
/** Cell tokens the walker cannot infer from the grid classes. */
function extraTokens(row, cols) {
  const t = [];
  if (cols.some((c) => qa(c, ':scope > .col__content > .button-wrap').length >= 2)) t.push('stack-cta'); // live: stacked button-wraps, not an inline button-list
  if (cols.some((c) => q(c, ':scope > .col__content > .image--center[style*="--ratio"]') && q(c, ':scope > .col__content > .richtext'))) t.push('expert'); // 250px rounded portrait + centred h4
  return t;
}

/**
 * A band whose grid rows pair a text column with a YouTube module → TWO sections: the heading row(s) as default content (`head`),
 * then every pair as default content — the embed link FIRST (live mobile order), then the text — in a `split-video` section whose CSS
 * grid is the live 11-column row (scripts.js auto-blocks the link into `embed`). No block holds a video URL (lint D1).
 */
function videoBand(root, ctx, topLevel) {
  const base = styleOf(topLevel ? 'cols' : 'band', 'mn', bgToken(bandBg(root)));
  const anchor = q(root, 'hr[id]')?.getAttribute('id') || null;
  const head = []; const pairs = [];
  for (const row of qa(root, '.grid-row')) {
    const cols = qa(row, ':scope > .col');
    const vcol = cols.find((c) => q(c, '.video'));
    if (!vcol) { head.push(richtext(q(cols[0], '.col__content'), ctx)); continue; }
    const tcol = cols.find((c) => c !== vcol); prepCol(vcol, ctx); if (tcol) prepCol(tcol, ctx);
    pairs.push(richtext(q(vcol, '.col__content'), ctx) + (tcol ? richtext(q(tcol, '.col__content'), ctx) : ''));
  }
  ctx.notes.push('lint D1 embed: the live text + YouTube rows are default content (embed link first = live mobile order, then the text); scripts.js auto-blocks the link into `embed`; the section style split-video lays the pairs on the live 11-column grid — no block holds a video URL');
  return { html: section(head, { style: styleOf(base, 'head'), id: anchor }) + section(pairs, { style: styleOf(base, 'split-video') }), blocks: ['embed'] };
}

const mnBand = (root, ctx, opts = {}) => (q(root, '.video') ? videoBand(root, ctx, !!opts.topLevelCols) : omBand(root, ctx, { ...opts, rowHook: featuredRow, prepCol, extraTokens, cardVariant: 'flat', textMax: false, style: styleOf('mn', opts.style) }));

/** The dated news rail: [tag][title][date] — the date is the paragraph after the title (cards news marks it); card hrefs normalised. */
function relatedTopics(root, ctx) {
  const cards = qa(root, '.newsfeed .card, .card-list .card').map((c) => normaliseHrefs(c, ctx));
  const rows = cardRows(cards, ctx).map((row, i) => { const d = q(cards[i], '.card__date'); return d ? [row[0], `${row[1]}<p>${esc(d.textContent.trim())}</p>`] : row; });
  if (cards.some((c) => q(c, '.card__date'))) ctx.notes.push('cards news: a news card carries its publication date as the paragraph after the title (live .card__date)');
  const parts = [richtext(q(root, '.related-topics__title'), ctx), block('cards', ['news'], rows)];
  const btn = q(root, '.button-wrap a.btn'); if (btn) parts.push(L.ctaHtml(btn, ctx));
  const flush = root.previousElementSibling?.classList.contains('band') ? 'mn-flush' : null; // live .main > .band + .related-topics { margin-top: 0 }
  return { html: section(parts, { style: styleOf('related', 'gap-48', flush, tint(bandBg(root))) }), blocks: ['cards'] };
}

gateCore('band', FAMILY, (root, ctx) => mnBand(root, ctx));
gateCore('cols', FAMILY, (root, ctx) => mnBand(root, ctx, { topLevelCols: true, style: root.previousElementSibling?.classList.contains('breadcrumb') ? 'mn-hero' : null }));
gateCore('related-topics', FAMILY, relatedTopics);

export default {};
