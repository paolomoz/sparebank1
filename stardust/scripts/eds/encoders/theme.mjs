/**
 * encoders/theme.mjs — family encoders for the bedrift "bransje" theme pages (borettslag-sameie archetype + 3 siblings, BEDRIFT chrome).
 * Own models: the featured card (`cards grid lg-6 featured`: contain-fit illustration + a full richtext body with the checked list),
 * the reference block that wraps a sand columns-grid (→ `columns` in a `cols` section, like every other grid row), the AEM page lead
 * (`theme-intro`: 900px centred main-lead), the top-level image / lead / CTA trio, and the sand "tips" message box (`callout tip warm small`).
 * Reuses the om-oss band walker (cols-N, wN, media-plain, baseline, button-gap …). Gated on the core map like om-oss (see om-oss.mjs
 * header — eds-requests W1 #0 / W4 #1); the `reference` key is shared with markedsnytt-listing (same live component, family set).
 */
import * as L from '../lib.mjs';
import { ENCODERS as CORE, richtext, cardRows, bandBg, bgToken, styleOf } from '../encoders.mjs';
import { familyOf } from './category-hub.mjs';
import { gateCore, omBand } from './om-oss.mjs';
import hub from './category-hub.mjs';

const { section, block, q, qa, cls, esc, inline, pic } = L;
const FAMILY = 'theme';
const REF_FAMILIES = new Set(['theme', 'markedsnytt-listing']);
const isTheme = (ctx) => familyOf(ctx) === FAMILY;
const coreReference = CORE.reference; // captured BEFORE the gate below wraps the key (the fallback must not re-enter the gate)

/** The hr module before a root: plain `hr.rule` = 64px (`rule`); `rule--extra-top` is carried by convert.mjs as `rule` → theme adds `rule-72` (live 72px at ≥1024). */
const ruleBefore = (root) => { const prev = root.previousElementSibling; if (prev?.tagName !== 'HR') return null; return /rule--extra-top/.test(prev.className) ? 'rule-72' : 'rule'; };

/** Featured card body: the live richtext (h2, sub-lead paragraphs, checked list whose item titles are `span.h5` links → authored bold). */
function featuredBody(card, ctx) {
  const rt = q(card, '.card__content .richtext') || q(card, '.card__content');
  for (const s of qa(rt, 'span.h5')) { const st = rt.ownerDocument.createElement('strong'); while (s.firstChild) st.append(s.firstChild); s.replaceWith(st); }
  return richtext(rt, ctx);
}
/** A grid row of featured cards → `cards grid lg-6 featured`, one row per card [illustration][richtext body]. */
function featuredRow(row, cols, ctx) {
  const cards = cols.map((c) => q(c, ':scope > .col__content > .card.card--featured'));
  if (!cards.length || cards.some((c) => !c)) return null;
  const span = (cls(cols[0]).find((c) => /^col-lg-\d+$/.test(c)) || 'col-lg-6').replace('col-', '');
  ctx.notes.push('lint D5 cards featured: the live featured card (contain-fit illustration + h2 + lead paragraphs + checked list of bold link titles) — one row per card [illustration][body]; not clickable on live, the block keeps the authored links as the only links');
  return { html: block('cards', ['grid', span, 'featured'], cards.map((c) => [pic(q(c, '.card__media img'), ctx), featuredBody(c, ctx)])), blocks: ['cards'] };
}

/** band / top-level cols on theme pages: the om-oss walker + featured cards + the trailing centred richtext (`band-tail`). */
const themeBand = (root, ctx, opts = {}) => omBand(root, ctx, { ...opts, rowHook: featuredRow, tailToken: 'band-tail', cardVariant: 'flat', style: styleOf(opts.topLevelCols ? 'theme-cols' : null, opts.style) });

/** reference (theme / markedsnytt): the live block wraps a tinted columns-grid → the grid's `columns` in a `cols` section; the plain-text reference stays core. */
function reference(root, ctx) {
  const colsEl = q(root, ':scope > .cols, :scope > .band'); // theme: a tinted cols; markedsnytt: a band holding two cols
  if (!REF_FAMILIES.has(familyOf(ctx)) || !colsEl) return coreReference(root, ctx);
  if (colsEl.classList.contains('band')) { ctx.notes.push('reference: the live block wraps a white band with two columns-grids (heading row + two text columns) — authored as that band section (gap-48 = the live 48/72 above)'); return omBand(colsEl, ctx, { style: styleOf('gap-48', 'mn-ref'), textMax: false, extraTokens: (row, cols) => (cols.some((c) => q(c, ':scope > .col__content > .richtext > p:first-child')) ? ['text-gap'] : []) }); } // live: --max ignored by the markedsnytt CSS; the richtext keeps its first paragraph's 16px (W2 text-gap)
  ctx.notes.push('reference: on theme/markedsnytt pages the live reference block holds a tinted columns-grid (text + CTAs + image) — authored as the grid\'s columns block in a cols section, not as the small-print reference');
  return omBand(colsEl, ctx, { topLevelCols: true, style: styleOf(ruleBefore(root), 'theme-ref') });
}

/** Top-level richtext: `richtext--max` + main-lead → the 900px page lead (`theme-intro`); a `span.lead` line → `theme-lead`; otherwise the 620px left column. */
function themeRichtext(root, ctx) {
  const max = /--max:\s*(\d+)px/.exec(root.getAttribute('style') || '')?.[1];
  if (q(root, '.main-lead')) return { html: section([richtext(root, ctx)], { style: styleOf('theme-intro', max ? `max-${max}` : null) }), blocks: [] };
  if (q(root, '.lead, .sub-lead')) return { html: section([richtext(root, ctx)], { style: 'theme-lead' }), blocks: [] };
  return { html: section([richtext(root, ctx)], { style: styleOf('narrow', 'gap-48', max ? `max-${max}` : null) }), blocks: [] };
}

/** Top-level modules routed to the `module` fallback (tool.mjs wins `image`/`button-wrap` and returns null outside its family). */
function themeModule(root, ctx, opts, orig) {
  const k = root.classList;
  if (k.contains('image')) {
    const img = q(root, 'img'); if (!img) return null;
    const w = /--w:\s*(\d+)px/.exec(root.getAttribute('style') || '')?.[1];
    ctx.notes.push('image: the live top-level centred illustration (inline picture, authored max-width) → default content picture in a theme-image section');
    return { html: section([pic(img, ctx)], { style: styleOf('theme-image', w ? `w-${w}` : null, k.contains('image--center') ? 'center' : null) }), blocks: [] };
  }
  if (k.contains('button-wrap') || k.contains('button-list')) { // top-level CTA row (live .button-wrap / .button-list): default content emphasised links, `cta` section (center when live centres)
    const html = richtext(root, ctx); if (!html.trim()) return null;
    return { html: section([html], { style: styleOf('cta', /button-(wrap|list)--center/.test(root.className) ? 'center' : null) }), blocks: [] };
  }
  return orig ? orig(root, ctx, opts) : null;
}

/** tip → core callout + the theme look: `warm` (sand body, orange lightbulb — live ffe-message-box--tips), `small` (480px box). */
function themeTip(root, ctx, opts, orig) {
  const r = orig(root, ctx, opts); if (!r) return r;
  ctx.notes.push('lint D1 callout: the FFE message box (round glyph overlapping a tinted box) is a designed component — heading/text/CTA stay authored prose in its one cell; warm = the live tips colours');
  r.html = r.html.replace('<div class="callout tip">', `<div class="callout tip warm${/tip--small/.test(root.className) ? ' small' : ''}">`);
  return r;
}

gateCore('band', FAMILY, (root, ctx) => themeBand(root, ctx));
gateCore('cols', FAMILY, (root, ctx) => themeBand(root, ctx, { topLevelCols: true }));
gateCore('richtext', FAMILY, themeRichtext);
gateCore('module', FAMILY, themeModule);
gateCore('tip', FAMILY, themeTip);
gateCore('reference', FAMILY, reference);
gateCore('reference', 'markedsnytt-listing', reference); // the same live component on the Markedsnytt hub (band-wrapped)

/** intro (AEM page title on theme pages): the full-width centred h1 (W2 `title` skin: margin 16/8 → 16/24) — the hub `intro` skin caps the wrapper at 800px and wraps this title. */
const intro = (root, ctx) => (isTheme(ctx) ? { html: section([richtext(root, ctx)], { style: 'title' }), blocks: [] } : hub.intro(root, ctx));

export default {
  reference,
  intro,
};
