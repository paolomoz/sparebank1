import { el, inlineIcons } from '../../scripts/sb1.js';

/**
 * usp — the FFE icon list ("USP" module, live .usp .icon-list): one row per item, [icon][text]. The icon cell holds an authored
 * :icon-name: span or a small image; the text cell is the authored prose (moved, never rebuilt — EW1). Items flow as a centred
 * wrapping row (canon.css .usp / .usp__item: flex 1 1 200px, 14/20, 32px Vann icon).
 */
export default function decorate(block) {
  const list = el('ul', { class: 'usp__list' });
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const iconCell = cells.length > 1 ? cells[0] : null; const textCell = cells[cells.length - 1];
    const item = el('li', { class: 'usp__item' });
    if (iconCell) { const icon = el('div', { class: 'usp__icon' }); while (iconCell.firstChild) icon.append(iconCell.firstChild); item.append(icon); }
    const text = el('div', { class: 'usp__text' }); while (textCell.firstChild) text.append(textCell.firstChild); item.append(text);
    list.append(item);
  });
  block.replaceChildren(list);
  inlineIcons(block);
}
