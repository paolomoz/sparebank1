/**
 * encoders/news-article.mjs — family encoder for the "news-article" archetype (nettsider-frontend `sb1-article` template:
 * /nb/bank/om-oss/nyheter/*.html + the privat kundehistorier / pensjon / markedsnytt articles). The prototype's module root is
 * `article.article` (replica modules/news-article.mjs). Encoded as consecutive DA sections (David's Model):
 *   1. `hero article` block (reused Block Collection hero shape, one row [figure + caption][tag · h1 · author/date]) — section `article-hero`
 *   2. the body as DEFAULT CONTENT sections `article-body`: the teaser as `article-body, lead` (the section skin already carries the
 *      24/32 fjell lead); a floated figure opens `article-body, figure-right|figure-left` holding the image, its italic caption and the
 *      text block that wraps beside it (the live `.article__figure--right + .richtext + .richtext { clear }` boundary); an infobox is a
 *      `callout infobox <tint>` block (reused callout: tinted box, no icon).
 *   3. `article-aside`: "Relaterte artikler" h2 + `cards related` block (reused cards: [picture][h3 link] rows) + "Relaterte tema" h2 + tag links.
 * No core key is overridden; the product page converts byte-identically.
 */
import * as L from '../lib.mjs';
import { richtext } from '../encoders.mjs';

const { section, block, q, qa, esc, inline, txt, pic } = L;
/** AEM-internal resource paths (/content/sites/sb1/<path>) are the public path (eds-requests.md W1 #4: core href() bounces them unnormalised). */
export const href = (h = '') => L.href(h.replace(/^(https:\/\/www\.sparebank1\.no)?\/content\/sites\/sb1(?=\/)/, ''));
const DATE = /^\d{1,2}\.\s*\p{L}+\s+\d{4}$/u;

export function heroBlock(head, ctx) {
  const img = q(head, '.article__hero img'); const cap = q(head, '.article__hero-caption');
  const media = (img ? pic(img, ctx) : '') + (cap && txt(cap) ? `<p>${inline(cap, ctx)}</p>` : '');
  let body = '';
  const tag = q(head, '.article__tag-item'); if (tag) body += `<p>${inline(tag, ctx)}</p>`;
  const h1 = q(head, '.article__title h1'); if (h1) body += `<h1>${inline(h1, ctx).replace(/\s+/g, ' ').trim()}</h1>`;
  for (const n of qa(head, '.article__author-name, .article__date')) if (txt(n)) body += `<p>${inline(n, ctx)}</p>`;
  ctx.notes.push('lint D1 hero: the article header is a designed composition (cover figure + caption, eyebrow tag, centred title, the author/date box that overlaps the aside at ≥1024, the fixed share bar) — Block Collection `hero` shape (D11), one row [media][text]; the share buttons are template chrome, not content');
  if (qa(head, '.article__author-name, .article__date').length > 1) ctx.notes.push('hero: author name + date are consecutive paragraphs after the title; the block styles the date-shaped one (d. month yyyy) as the date');
  return block('hero', ['article', q(head, '.article__hero--top') ? 'top' : null].filter(Boolean), [[media, body]]);
}

const figureHtml = (fig, ctx) => { const img = q(fig, 'img'); const cap = q(fig, 'figcaption'); return (img ? pic(img, ctx) : '') + (cap && txt(cap) ? `<p><em>${inline(cap, ctx)}</em></p>` : ''); };

/** The live `quote` component (bio quote: portrait, quote text, name, a "Les mer om …" bio-modal button) → default content:
 *  the portrait as an image paragraph, then a <blockquote> with the quote and the attribution paragraphs. */
function quoteHtml(node, ctx) {
  const bq = q(node, 'blockquote') || node; const img = q(bq, 'img');
  const spans = qa(bq, 'span').filter((sp) => txt(sp) && !sp.closest('figure') && !qa(sp, 'span').length);
  const [quote, ...rest] = spans.length ? spans : [null];
  const btn = q(bq, 'button');
  ctx.notes.push(`quote: the live bio-quote component is default content — portrait image paragraph + <blockquote> (quote, attribution)${btn ? `; the "${txt(btn).slice(0, 40)}" bio-modal trigger is client UI without captured content (dynamics) — not authored` : ''}`);
  let out = img ? pic(img, ctx) : '';
  out += `<blockquote>${quote ? `<p>${inline(quote, ctx)}</p>` : ''}${rest.map((r) => `<p>${inline(r, ctx)}</p>`).join('')}</blockquote>`;
  return out;
}

export function bodySections(content, ctx) {
  const out = []; const blocks = new Set();
  let parts = []; let style = 'article-body'; let floatOpen = 0; // floatOpen: modules still to absorb into the float section
  const flush = () => { if (parts.length) out.push(section(parts, { style })); parts = []; style = 'article-body'; floatOpen = 0; };
  for (const ch of content.children) {
    const k = L.cls(ch);
    if (k.includes('article__teaser')) { flush(); parts.push(richtext(ch, ctx)); style = 'article-body, lead'; flush(); ctx.notes.push('teaser: the live 24/32 fjell lead paragraph is its own `article-body, lead` section (the existing `lead` section skin)'); continue; }
    if (k.includes('article__figure') && (k.includes('article__figure--right') || k.includes('article__figure--left'))) {
      flush(); style = `article-body, ${k.includes('article__figure--right') ? 'figure-right' : 'figure-left'}`; parts.push(figureHtml(ch, ctx)); floatOpen = 1;
      ctx.notes.push('figure: a floated photo (live right-adjust/left-adjust) is default content — the image paragraph + an italic caption paragraph — in a `figure-right|figure-left` section together with the text block that wraps beside it (David\'s Model has no inline float; the section boundary is the live clear boundary)');
      continue;
    }
    if (k.includes('article__figure')) { parts.push(figureHtml(ch, ctx)); if (q(ch, 'figcaption')) ctx.notes.push('figure caption: the italic paragraph right after an image paragraph is the caption (authoring convention, styled by the article template)'); continue; }
    if (k.includes('article__infobox')) {
      const inner = q(ch, '.article__infobox-content'); const tint = (L.cls(inner).find((c) => c.startsWith('bg--')) || '').replace('bg--', '');
      parts.push(block('callout', ['infobox', tint || null, k.includes('article__infobox--full') ? 'full' : null].filter(Boolean), [[richtext(inner, ctx)]])); blocks.add('callout');
      ctx.notes.push(`lint D1 callout infobox: the live infoBox component (tinted ${tint || 'white'} box, full width, no icon) — the FFE message box shape reused as the \`infobox\` variant; the variant name is the FFE colour token the author picks on live`);
      if (floatOpen) floatOpen -= 1; if (!floatOpen && /figure-/.test(style)) flush();
      continue;
    }
    if (k.includes('module--quote') || q(ch, 'blockquote')) { parts.push(quoteHtml(ch, ctx)); if (floatOpen) { floatOpen -= 1; if (!floatOpen) flush(); } continue; }
    const html = richtext(ch, ctx); if (html.trim()) parts.push(html);
    if (floatOpen) { floatOpen -= 1; if (!floatOpen) flush(); }
  }
  flush();
  return { html: out.join(''), blocks: [...blocks] };
}

export function asideSection(aside, ctx) {
  const parts = []; const blocks = [];
  const rel = q(aside, '.article__related');
  if (rel) {
    const h = q(rel, '.article__aside-heading'); if (h) parts.push(`<h2>${inline(h, ctx)}</h2>`);
    const rows = qa(rel, '.article__related-item').map((it) => { const a = q(it, 'a'); const img = q(it, 'img'); return [img ? pic(img, ctx) : '', `<h3><a href="${esc(href(a?.getAttribute('href') || ''))}">${esc(txt(q(it, '.article__related-text')) || txt(a))}</a></h3>`]; });
    if (rows.length) { parts.push(block('cards', ['related'], rows)); blocks.push('cards'); }
    if (q(rel, '.article__related-image--top')) ctx.notes.push('related: one live thumbnail carries a top-crop focus (DAM rendition setting) — not authored; the card renders the centre crop');
  }
  const tags = q(aside, '.article__tags');
  if (tags) {
    const h = q(tags, '.article__aside-heading'); if (h) parts.push(`<h2>${inline(h, ctx)}</h2>`);
    const links = qa(tags, 'a.article__tag-link').map((a) => `<a href="${esc(href(a.getAttribute('href') || ''))}">${esc(txt(a))}</a>`);
    if (links.length) parts.push(`<ul>${links.map((a) => `<li>${a}</li>`).join('')}</ul>`); // a list of tags (live: inline-block links 16px apart)
  }
  return parts.length ? { html: section(parts, { style: 'article-aside' }), blocks } : { html: '', blocks };
}

export default {
  article: (root, ctx) => {
    const head = q(root, '.article__header'); const content = q(root, '.article__content'); const aside = q(root, '.article__aside');
    const blocks = [];
    let html = '';
    if (head) { html += section([heroBlock(head, ctx)], { style: 'article-hero' }); blocks.push('hero'); }
    if (content) { const b = bodySections(content, ctx); html += b.html; blocks.push(...b.blocks); }
    if (aside) { const a = asideSection(aside, ctx); html += a.html; blocks.push(...a.blocks); }
    return html ? { html, blocks: [...new Set(blocks)] } : null;
  },
};
