import { el } from '../../scripts/sb1.js';

/**
 * columns — the FFE 12-column text/image row (collection pattern, reconstructive). One row, one cell per column.
 * Block variants carry the lifted sizing MODEL per cell, in cell order: `lg-4-offset-1-middle`, `lg-7-first`, `lg-6-middle`…
 * (span at ≥1024, optional offset, `first` = order -1 on mobile, vertical alignment). Authored elements are moved, never rebuilt.
 */
export default function decorate(block) {
  const variants = [...block.classList].filter((c) => /^lg-\d+/.test(c));
  const row = block.querySelector(':scope > div'); if (!row) return;
  const grid = el('div', { class: 'grid-row' });
  [...row.children].forEach((cell, i) => {
    const v = variants[i] || 'lg-12';
    const span = (v.match(/^lg-(\d+)/) || [, '12'])[1]; const offset = (v.match(/offset-(\d+)/) || [])[1];
    const align = (v.match(/-(middle|center|bottom)/) || [])[1]; const first = /-first/.test(v);
    const col = el('div', { class: ['col', `col-lg-${span}`, offset !== undefined ? `col-lg-offset-${offset}` : null, first ? 'col--first' : null, align ? `col--${align}` : null].filter(Boolean).join(' ') });
    const content = el('div', { class: 'col__content' });
    while (cell.firstChild) content.append(cell.firstChild);
    // consecutive CTA paragraphs (a paragraph that is only a link) form one button row, as the live button-list does;
    // the text between CTA rows is grouped in a block wrapper (live .richtext) so heading/paragraph margins collapse
    const isCta = (n) => n.tagName === 'P' && n.children.length === 1 && n.firstElementChild.tagName === 'A' && n.textContent.trim() === n.firstElementChild.textContent.trim();
    let run = []; let text = null;
    const flush = () => { if (run.length > 1) { const list = el('div', { class: 'button-list' }); run[0].before(list); run.forEach((n) => list.append(n)); } run = []; };
    [...content.children].forEach((n) => {
      if (isCta(n)) { text = null; run.push(n); return; }
      flush();
      if (!text) { text = el('div', { class: 'col__text' }); n.before(text); }
      text.append(n);
    });
    flush();
    // an image-only cell is the media column
    if (content.children.length && [...content.children].every((c) => c.querySelector?.('picture, img') || c.matches?.('picture, img'))) col.classList.add('col--media');
    col.append(content); grid.append(col);
  });
  block.replaceChildren(grid);
}
