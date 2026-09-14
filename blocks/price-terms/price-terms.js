import { el } from '../../scripts/sb1.js';

/**
 * price-terms — the live "Priser og vilkår" module (template-slotted like banner): ONE row, two cells.
 *   cell 1: heading, then (optional) two paragraphs = the price figure label ("Eff. rente") and the figure ("16,6 %")
 *   cell 2: the check list <ul>, a link-only paragraph = the "Se alle priser / Se … hos en av våre banker" link, further
 *           paragraphs = the footnote (small text).
 * Variants: `large` / `small` (figure size; default medium), tint tokens when nested in a band. The live link opens a
 * client-rendered bank-choice overlay (dynamics interim: a plain link). Authored nodes are moved, never rebuilt (EW1).
 */
export default function decorate(block) {
  const row = block.querySelector(':scope > div'); if (!row) return;
  const [c1, c2] = [...row.children];
  const inner = el('div', { class: 'price-terms__inner' });
  const grid = el('div', { class: 'price-terms__grid' }); const price = el('div', { class: 'price-terms__price' });
  [...(c1?.children || [])].forEach((n) => {
    if (/^H[1-6]$/.test(n.tagName)) { n.classList.add('price-terms__title'); inner.append(n); return; }
    n.classList.add(price.children.length ? 'price-terms__figure' : 'price-terms__before'); price.append(n);
  });
  if (price.children.length) { grid.append(price); grid.classList.add('price-terms__grid--with-price'); }
  const item = el('div', { class: 'price-terms__item' }); const cta = el('div', { class: 'price-terms__cta' }); const sub = el('div', { class: 'price-terms__sub' });
  [...(c2?.children || [])].forEach((n) => {
    if (n.tagName === 'UL' || n.tagName === 'OL') { n.classList.add('price-terms__terms'); item.append(n); return; }
    const a = n.querySelector('a'); if (a && n.children.length === 1 && n.textContent.trim() === a.textContent.trim()) { a.classList.add('price-terms__link'); n.classList.add('price-terms__cta-row'); cta.append(n); return; }
    sub.append(n);
  });
  if (item.children.length) grid.append(item);
  if (grid.children.length) inner.append(grid);
  if (cta.children.length) inner.append(cta);
  if (sub.children.length) inner.append(sub);
  block.replaceChildren(inner);
}
