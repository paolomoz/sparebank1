/**
 * encoders/faq.mjs — family encoder for the "faq" archetype (AEM Spørsmål question pages, /nb/bank/bedrift/kundeservice/**).
 * The prototype's whole page is ONE module root `section.qp` (replica modules/faq.mjs): back-link + h1 + answer richtext +
 * inline "Var dette nyttig?" feedback. Encoded as TWO DA sections (David's Model):
 *   1. `breadcrumbs question` block (reused; variant = the question-page geometry: flush top, 16px below, 40px inset)
 *   2. default content (h1 + answer prose) + `feedback inline` block (reused; variant = the live inline thumbs row),
 *      section style `question` (the live 768px centred column).
 * No core key is overridden; the product page converts byte-identically.
 */
import * as L from '../lib.mjs';
import { richtext } from '../encoders.mjs';

const { section, block, q, esc, inline, href, txt } = L;

export default {
  qp: (root, ctx) => {
    const parts = []; const blocks = [];
    const a = q(root, '.qp__breadcrumb a');
    let crumb = '';
    if (a) {
      ctx.notes.push('lint D1 breadcrumbs: bespoke navigation widget (nav landmark, chevron, back-link) — not default content; variant `question` = the question-page geometry');
      crumb = section([block('breadcrumbs', ['question'], [[`<p><a href="${esc(href(a.getAttribute('href') || ''))}">${esc(txt(a))}</a></p>`]])]);
      blocks.push('breadcrumbs');
    }
    const h1 = q(root, '.qp__title'); if (h1) parts.push(`<h1>${inline(h1, ctx).replace(/\s+/g, ' ').trim()}</h1>`);
    const answer = q(root, '.qp__answer'); if (answer) parts.push(richtext(answer, ctx));
    const fq = q(root, '.feedback--inline .feedback__question');
    if (fq) {
      ctx.notes.push('lint D1 feedback: interactive widget (thumbs up/down, thanks state; dynamics #5 interim) — the row carries its question only; variant `inline` = the live left-aligned row under the answer');
      parts.push(block('feedback', ['inline'], [[`<p>${inline(fq, ctx).trim()}</p>`]])); blocks.push('feedback');
    }
    return { html: crumb + section(parts, { style: 'question' }), blocks };
  },
};
