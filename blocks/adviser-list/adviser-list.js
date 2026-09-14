import { el } from '../../scripts/sb1.js';

/**
 * adviser-list — the live press-contact / adviser rows (om-oss presse: .adviser-list > .adviser). One row per contact:
 *   [portrait][name (bold paragraph), role, phone, e-post link]
 * The authored paragraphs are MOVED into the contact card (EW1): the first paragraph is the name, a digits-only paragraph
 * the phone, a paragraph holding only a link the e-mail line. Circle portrait 180px, wrapped centred row, 25% cells at ≥1024.
 */
export default function decorate(block) {
  const list = el('div', { class: 'adviser-list__list' });
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const media = cells.find((c) => c.querySelector('picture, img'));
    const body = cells.find((c) => c !== media && c.textContent.trim()) || cells[cells.length - 1];
    const item = el('div', { class: 'adviser' });
    if (media) { const pic = media.querySelector('picture, img'); item.append(el('span', { class: 'adviser__image' }, pic)); }
    [...body.children].forEach((node, i) => {
      if (i === 0) { node.classList.add('adviser__name'); item.append(node); return; }
      node.classList.add('adviser__subtext');
      const t = node.textContent.trim();
      if (/^[\d\s+()-]+$/.test(t)) node.classList.add('adviser__phone');
      if (node.querySelector('a') && node.children.length === 1) node.classList.add('adviser__email');
      item.append(node);
    });
    list.append(item);
  });
  block.replaceChildren(list);
}
