/**
 * encoders/market-landing.mjs — family encoders for the market landings (/nb/bank/privat.html, bedrift.html, om-oss.html).
 * Bands reuse the hub walker from category-hub.mjs (cols-N grids, `wN` illustration cells, link-list columns — family-gated
 * there to the walker families). Own modules: the campaign hero (→ `carousel campaign`), the two-tone banner (→ `banner
 * columns`), the dated news rail, the hidden page h1 and the runtime dialog shells. The live mobile market strip
 * ("Privat · Gå til bedrift") is header chrome: header.js derives it from the /nav market list on template=market-landing.
 */
import * as L from '../lib.mjs';
import { ENCODERS as CORE, richtext, cardRows, bandBg, styleOf } from '../encoders.mjs';
import hub, { familyOf, normaliseHrefs, tint } from './category-hub.mjs';

const { section, block, heading, q, qa, cls, esc, inline, pic } = L;
const isMarket = (ctx) => familyOf(ctx) === 'market-landing';

/** banner-small--columns → `banner columns colorA colorB`: one row per half [illustration?][heading, line, CTA, partner logo?]; the colour tokens read in row order. */
function bannerColumns(root, ctx) {
  const cols = qa(root, ':scope > .banner-small__columns > .banner-small__column');
  const colors = cols.map((c) => { const m = /--banner-color:\s*(\d)/.exec(c.getAttribute('style') || ''); return m ? `color${m[1]}` : null; });
  ctx.notes.push('lint D3 banner columns: one row per half — [illustration][heading, line, CTA(, partner logo)]; the colour variants are read in row order (like the columns lg-* cell model)');
  const rows = cols.map((c) => {
    const img = q(c, '.banner-small__media img');
    const body = `${heading(q(c, '.banner-small__heading'), ctx)}${q(c, '.banner-small__info') ? `<p>${inline(q(c, '.banner-small__info'), ctx)}</p>` : ''}${qa(c, '.banner-small__bottom a.btn').map((a) => L.ctaHtml(a, ctx)).join('')}${pic(q(c, '.banner-small__bottom-image img'), ctx)}`;
    return [img ? pic(img, ctx) : '', body];
  });
  return { html: section([block('banner', ['columns', ...colors].filter(Boolean), rows)], { style: 'full, gap-48' }), blocks: ['banner'] };
}

export default {
  // runtime dialog shells (send-to-bank) — client UI, nothing to author
  'send-to-bank-modal': (root, ctx) => { ctx.notes.push('send-to-bank-modal: client-rendered dialog shell (dynamics) — no authored content'); return { html: '', blocks: [] }; },
  'send-to-bank__loading': (root, ctx) => { ctx.notes.push('send-to-bank__loading: client-rendered spinner shell (dynamics) — no authored content'); return { html: '', blocks: [] }; },
  // the page h1 is present for a11y/SEO but visually hidden on live → default content in a `visually-hidden` section
  'visually-hidden': (root, ctx) => { ctx.notes.push('h1: live hides the page title visually — default content in a section styled visually-hidden'); return { html: section([heading(root, ctx, root.tagName.toLowerCase() === 'h1' ? 'h1' : 'p')], { style: 'visually-hidden' }), blocks: [] }; },

  // campaign hero carousel → `carousel campaign`, one row per slide [image][heading, lead, text, CTA]
  campaign: (root, ctx) => {
    const slides = qa(root, '.campaign__slide');
    if (!slides.length) { ctx.notes.push('campaign: the empty second carousel instance renders 0px on live — nothing to author'); return { html: '', blocks: [] }; }
    ctx.notes.push('lint D11 carousel: the campaign hero carousel (Block Collection carousel shape) — one row per slide [image][heading, lead, text, CTA]; the live capture shows one slide (campaign rotation = permanent residual); the decorative image link duplicates the CTA and is not authored');
    const rows = slides.map((sl) => [pic(q(sl, '.campaign__img'), ctx), richtext(normaliseHrefs(q(sl, '.campaign__text')), ctx)]);
    const variants = ['campaign', slides.some((s) => /campaign__slide--reverse/.test(s.getAttribute('class') || '')) ? 'reverse' : null, tint(bandBg(slides[0]))];
    return { html: section([block('carousel', variants.filter(Boolean), rows)], { style: 'full' }), blocks: ['carousel'] };
  },

  // two-tone banner (market landings) — otherwise the hub / core banner
  'banner-small': (root, ctx, opts) => (q(root, '.banner-small__columns') ? bannerColumns(root, ctx) : hub['banner-small'](root, ctx, opts)),

  // news rail with publication dates: [tag][title][date] — the date is the short paragraph after the title (cards news marks it)
  'related-topics': (root, ctx) => {
    if (!isMarket(ctx)) return CORE['related-topics'](root, ctx);
    const cards = qa(root, '.newsfeed .card').map(normaliseHrefs);
    const rows = cardRows(cards, ctx).map((row, i) => { const d = q(cards[i], '.card__date'); return d ? [row[0], `${row[1]}<p>${esc(d.textContent.trim())}</p>`] : row; });
    if (cards.some((c) => q(c, '.card__date'))) ctx.notes.push('cards news: a news card carries its publication date as the paragraph after the title (live .card__date)');
    const parts = [richtext(q(root, '.related-topics__title'), ctx), block('cards', ['news'], rows)];
    const btn = q(root, '.button-wrap a.btn'); if (btn) parts.push(L.ctaHtml(btn, ctx));
    return { html: section(parts, { style: styleOf('related', 'market-news', 'gap-48', tint(bandBg(root))) }), blocks: ['cards'] };
  },

  // top-level "Sammenlign priser" text: on market landings the h2 renders at h2 size in the medium face (live .main > .richtext h2), 620px column
  richtext: (root, ctx) => {
    if (!isMarket(ctx)) return CORE.richtext(root, ctx);
    const parts = [...root.children].map((n) => (/^h[1-6]$/i.test(n.tagName) ? heading(n, ctx) : richtext({ childNodes: [n] }, ctx)));
    return { html: section(parts, { style: 'market-compare, center, narrow, gap-48' }), blocks: [] };
  },
};
