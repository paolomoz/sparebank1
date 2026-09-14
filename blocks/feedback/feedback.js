import { el, icon, inlineIcons } from '../../scripts/sb1.js';

/**
 * feedback — "Hva synes du om denne siden?" page-level thumbs (dynamics #5: interim, no network — the live widget POSTs to
 * /LogServlet; here a click shows the live site's thank-you state). Row: [question <p>]; the question is moved into the h2 slot.
 */
export default function decorate(block) {
  const q = block.querySelector('p, h2, h3');
  const inner = el('div', { class: 'feedback__inner' });
  if (q) { const h = el('div', { class: 'feedback__question' }); h.append(q); inner.append(h); }
  const thumbs = el('div', { class: 'thumbs' }, el('button', { type: 'button', class: 'button secondary thumbs__btn thumbs__btn--up', 'aria-label': 'Ja' }, icon('thumbs-up')), el('button', { type: 'button', class: 'button secondary thumbs__btn thumbs__btn--down', 'aria-label': 'Nei' }, icon('thumbs-down')));
  inner.append(thumbs);
  block.replaceChildren(inner);
  thumbs.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => { thumbs.replaceWith(el('p', { class: 'feedback__thanks' }, 'Takk for tilbakemeldingen')); }));
  inlineIcons(block);
}
