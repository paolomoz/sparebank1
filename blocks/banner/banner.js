import { el } from '../../scripts/sb1.js';

/**
 * banner — the "banner-small" tinted call-out (illustration + heading + line + CTA). Template-slotted: one row [image][body].
 * Variants: color4 (sand), color1 (brand blue). Authored nodes move into .banner-small__media / __text.
 */
export default function decorate(block) {
  if (block.classList.contains('columns')) { decorateColumns(block); return; } // additive variant (market landings)
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

/**
 * `columns` variant — the market-landing two-tone banner: one row per half [illustration?][heading, line, CTA(, partner logo)].
 * Colour variants (color2 frost · color4 sand · color7 white) are read in row order. Authored nodes move into the live
 * .banner-small__columns structure (stardust/prototypes/css/market-landing.css); the first half right-aligns its inner box.
 */
function decorateColumns(block) {
  const colors = [...block.classList].filter((c) => /^color\d$/.test(c));
  const wrap = el('div', { class: 'banner-small__columns' });
  [...block.children].forEach((row, i) => {
    const cells = [...row.children];
    const media = cells.find((c) => c.querySelector('picture, img') && !c.querySelector('h1,h2,h3,h4,h5,h6'));
    const body = cells.find((c) => c !== media && c.textContent.trim()) || cells[cells.length - 1];
    const col = el('div', { class: ['banner-small__column', i ? 'banner-small__column--two' : null, colors[i] ? `banner-small__column--${colors[i]}` : null].filter(Boolean).join(' ') });
    const inner = el('div', { class: `banner-small__inner banner-small__inner--col${i === 0 ? ' banner-small__inner--right' : ''}` });
    const pic = media?.querySelector('picture, img');
    if (pic) { const m = el('div', { class: 'banner-small__media' }); m.append(pic); inner.append(m); }
    const text = el('div', { class: `banner-small__text${pic ? '' : ' banner-small__text--wide'}` }); const bottom = el('div', { class: 'banner-small__bottom' });
    [...body.children].forEach((node) => {
      if (/^H[1-6]$/.test(node.tagName)) { node.classList.add('banner-small__heading'); text.append(node); return; }
      if (node.querySelector?.('picture, img')) { node.classList.add('banner-small__bottom-image'); bottom.append(node); return; }
      if (node.querySelector?.('a')) { bottom.append(node); return; }
      node.classList.add('banner-small__info'); text.append(node);
    });
    text.append(bottom); inner.append(text); col.append(inner); wrap.append(col);
  });
  block.replaceChildren(wrap);
}
