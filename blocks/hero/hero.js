import { el, icon, inlineIcons } from '../../scripts/sb1.js';

/**
 * hero — Block Collection hero shape. The boilerplate hero (picture behind a heading) is CSS-only and unchanged: decorate()
 * returns early unless a variant asks for structure.
 *
 * `article` variant (news-article family — the nettsider-frontend `sb1-article` header): one row
 *   [cover picture + optional caption paragraph][eyebrow tag paragraph(s) · h1 · author / date paragraph(s)]
 * Authored nodes are MOVED into their slots (EW1): the picture into a <figure>, the caption paragraph into its <figcaption>,
 * the paragraphs before the title become the tag, the paragraphs after it the author box (a "9. februar 2022"-shaped one is
 * the date). The share bar (Facebook / LinkedIn / X) is fixed template chrome, as on live — never authored text.
 * `top` sub-variant: the cover keeps its top edge (live top-crop focus).
 */
const SHARE = [
  ['facebook', 'Del på Facebook', (u) => `https://www.facebook.com/sharer/sharer.php?u=${u}`],
  ['linkedin', 'Del på LinkedIn', (u) => `https://www.linkedin.com/sharing/share-offsite/?url=${u}`],
  ['twitter', 'Del på Twitter', (u) => `https://twitter.com/intent/tweet?url=${u}`],
];
const DATE = /^\d{1,2}\.\s*\S+\s+\d{4}$/;

export default function decorate(block) {
  if (!block.classList.contains('article')) return;
  const row = block.querySelector(':scope > div'); if (!row) return;
  const cells = [...row.children];
  const media = cells.find((c) => c.querySelector('picture, img') && !c.querySelector('h1, h2, h3'));
  const body = cells.find((c) => c !== media && c.textContent.trim()) || cells[cells.length - 1];
  const header = el('div', { class: 'hero__header' }); // a div: the global `header { height }` chrome rule must not size it

  if (media) {
    const fig = el('figure', { class: 'hero__figure' });
    const pic = media.querySelector('picture, img'); const picP = pic.closest('p');
    fig.append(el('div', { class: 'hero__figure-container' }, pic)); if (picP && !picP.textContent.trim()) picP.remove();
    const cap = [...media.querySelectorAll('p')].find((p) => p.textContent.trim());
    if (cap) { const fc = el('figcaption', { class: 'hero__caption' }); while (cap.firstChild) fc.append(cap.firstChild); cap.remove(); fig.append(fc); }
    header.append(fig);
  }
  const title = body.querySelector('h1, h2, h3');
  const tagWrap = el('div', { class: 'hero__tag' }); const author = el('div', { class: 'hero__author' }); const authorText = el('div', { class: 'hero__author-text' });
  let afterTitle = false;
  [...body.children].forEach((node) => {
    if (node === title) { afterTitle = true; header.append(tagWrap.children.length ? tagWrap : '', el('div', { class: 'hero__title' }, node)); return; }
    if (!node.textContent.trim()) { node.remove(); return; }
    if (!afterTitle) { node.classList.add('hero__tag-item'); tagWrap.append(node); return; }
    node.classList.add(DATE.test(node.textContent.trim()) ? 'hero__date' : 'hero__author-name'); authorText.append(node);
  });
  if (!title && tagWrap.children.length) header.append(tagWrap);
  if (authorText.children.length) { author.append(authorText); header.append(author); }

  const share = el('div', { class: 'hero__share' });
  SHARE.forEach(([name, label, url]) => {
    const btn = el('button', { type: 'button', class: 'hero__share-btn', 'aria-label': label }, icon(`share-${name}`));
    btn.addEventListener('click', () => window.open(url(encodeURIComponent(window.location.href)), '_blank', 'noopener,width=600,height=500'));
    share.append(el('div', { class: 'hero__share-item' }, btn));
  });
  header.append(share);
  block.replaceChildren(header);
  inlineIcons(block);
}
