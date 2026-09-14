/**
 * encoders/news-listing.mjs — family encoder for the "news-listing" archetype (nettsider-frontend `sb1-articles` template:
 * /nb/bank/om-oss/nyheter.html). The prototype's module root is `section.articles` (replica modules/news-listing.mjs).
 * Encoded as two DA sections (David's Model):
 *   1. `listing-title`: the h1 as default content
 *   2. `listing`: ONE `cards listing` block — one row per article [picture][tag p · h2 link · date p]; the FIRST row is the featured
 *      headline card (live: the newest feed item renders as `newscard__headline`), the pager "Se flere artikler" as an emphasised link
 *      (secondary pill) in default content after the block.
 * Feed decision (recorded in the journal): live is fed by nyheter.export.json; for the pilot the 31 settled cards are AUTHORED rows
 * (verbatim), so the page is deliverable without site configuration. Production wiring = a query index at tools.aem.live
 * (see stardust/rollout/journal/news-listing.md) feeding the same block shape.
 * No core key is overridden; the product page converts byte-identically.
 */
import * as L from '../lib.mjs';
import { href } from './news-article.mjs';

const { section, block, q, qa, esc, inline, txt, pic } = L;

export default {
  articles: (root, ctx) => {
    const html = []; const blocks = [];
    const h1 = q(root, '.articles__title h1'); if (h1) html.push(section([`<h1>${inline(h1, ctx)}</h1>`], { style: 'listing-title' }));
    const cards = qa(root, '.newscards > article.newscard');
    const rows = cards.map((card) => {
      const a = q(card, 'a.newscard__link'); const img = q(card, '.newscard__image img'); const imgWrap = q(card, '.newscard__image');
      const tag = q(card, '.newscard__tag-item'); const title = q(card, '.newscard__title'); const date = q(card, '.newscard__date');
      let body = '';
      if (tag) body += `<p>${inline(tag, ctx)}</p>`;
      if (title) body += `<h2><a href="${esc(href(a?.getAttribute('href') || ''))}">${inline(title, ctx).replace(/\s+/g, ' ').trim()}</a></h2>`;
      if (date) body += `<p>${esc(txt(date))}</p>`;
      if (imgWrap && /newscard__image--(top|bottom)/.test(imgWrap.className)) ctx.notes.push(`listing: "${txt(title).slice(0, 40)}" carries a live ${/top/.test(imgWrap.className) ? 'top' : 'bottom'}-crop focus (DAM rendition setting) — not authored; the card renders the centre crop`);
      return [img ? pic(img, ctx) : '', body];
    });
    const parts = [];
    if (rows.length) {
      const variants = ['listing']; if (cards.some((c) => /newscard--green/.test(c.className))) ctx.notes.push('listing: a live green card variant exists in the template but not on this page');
      parts.push(block('cards', variants, rows)); blocks.push('cards');
      ctx.notes.push('lint D5 cards listing: one row per article (picture · tag · title link · date); the first row is the featured headline (live: newest feed item, `newscard__headline`); card-as-link keeps the authored h2 link inside (EW6)');
    }
    const more = q(root, '.newscards__more'); if (more) { const label = txt(q(more, '.btn__label')) || txt(more); const moreHref = new URL(more.getAttribute('href') || '', 'https://www.sparebank1.no/nb/bank/om-oss/nyheter.html').href; parts.push(`<p><em><a href="${esc(moreHref)}">${esc(label)}</a></em></p>`); ctx.notes.push('pager: "Se flere artikler" is a secondary CTA in default content pointing at the live feed page (?limit=31&offset=31, fully-qualified — D4; rollout E2: a bounce beats a 404 until the index-backed listing is configured); the arrow glyph is the pager\'s own chrome (CSS), not authored'); }
    if (parts.length) html.push(section(parts, { style: 'listing' }));
    return html.length ? { html: html.join(''), blocks } : null;
  },
};
