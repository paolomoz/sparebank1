import { el, icon, inlineIcons } from '../../scripts/sb1.js';

/**
 * shortcuts — the hub "Snarveier" pill-button row. One cell: a plain list of links (D5 simple list). Each authored <a>
 * is moved into place (EW1 — never rebuilt) and gets the fixed chevron affordance appended as chrome; the live hover
 * (Vann fill, chevron rotate/translate) is CSS. The heading above the block is default content.
 */
export default function decorate(block) {
  const list = block.querySelector('ul') || el('ul');
  list.classList.add('shortcuts__list');
  [...list.children].forEach((li) => {
    li.classList.add('shortcuts__item');
    const a = li.querySelector('a'); if (!a) return;
    a.classList.add('shortcuts__link');
    a.append(icon('chevron'));
  });
  block.replaceChildren(list);
  inlineIcons(block);
}
