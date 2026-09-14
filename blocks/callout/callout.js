import { el, icon, inlineIcons } from '../../scripts/sb1.js';

/**
 * callout — the FFE message box: a round icon overlapping a tinted box that holds the authored heading / text / CTA.
 * One row, one cell of default content (moved into the box, never rebuilt — EW1). Variants: `tip` (info glyph, frost
 * tint — the hub "Samtykke Altinn" box), `tips` (sand tint). The icon is fixed chrome.
 */
export default function decorate(block) {
  const cell = block.querySelector(':scope > div > div'); if (!cell) return;
  const box = el('div', { class: 'callout__box' });
  const ic = el('span', { class: 'callout__icon' }, icon('info'));
  const body = el('div', { class: 'callout__body' });
  while (cell.firstChild) body.append(cell.firstChild);
  if (block.classList.contains('infobox')) box.append(body); else box.append(ic, body); // additive (news-article): the infoBox variant has no icon
  block.replaceChildren(box);
  inlineIcons(block);
}
