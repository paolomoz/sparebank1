import { el } from '../../scripts/sb1.js';

/**
 * banner — the "banner-small" tinted call-out (illustration + heading + line + CTA). Template-slotted: one row [image][body].
 * Variants: color4 (sand), color1 (brand blue). Authored nodes move into .banner-small__media / __text.
 */
export default function decorate(block) {
  const row = block.querySelector(':scope > div'); if (!row) return;
  const cells = [...row.children];
  const media = cells.find((c) => c.querySelector('picture, img')); const body = cells.find((c) => c !== media) || cells[0];
  const inner = el('div', { class: 'banner-small__inner' });
  if (media) { const m = el('div', { class: 'banner-small__media' }); m.append(media.querySelector('picture, img')); inner.append(m); }
  const text = el('div', { class: 'banner-small__text' });
  const bottom = el('div', { class: 'banner-small__bottom' });
  [...body.children].forEach((node) => {
    if (/^H[1-6]$/.test(node.tagName)) { node.classList.add('banner-small__heading'); text.append(node); return; }
    if (node.querySelector?.('a')) { bottom.append(node); return; }
    node.classList.add('banner-small__info'); text.append(node);
  });
  text.append(bottom); inner.append(text);
  block.replaceChildren(inner);
}
