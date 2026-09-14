import { el } from '../../scripts/sb1.js';

/**
 * table — the Block Collection data table (D11): one block row per table row, one cell per column; the first row is the
 * header unless the block carries `no-header`. Authored cells are MOVED into the <td>/<th> (EW1 — the cell's <p> stays
 * the editable unit). Variant `contact` = the live "Finn din bank" AEM table (65% width, centred, 1px #d8d8d8 row rules,
 * no-wrap cells, bold header cells; mobile: a horizontal scroller with the orange scroll-indicator pill above it).
 */
export default function decorate(block) {
  const header = !block.classList.contains('no-header');
  const table = el('table');
  const thead = el('thead'); const tbody = el('tbody');
  [...block.children].forEach((row, i) => {
    const tr = el('tr');
    [...row.children].forEach((cell) => {
      const c = el(header && i === 0 ? 'th' : 'td', header && i === 0 ? { scope: 'col' } : {});
      while (cell.firstChild) c.append(cell.firstChild);
      tr.append(c);
    });
    (header && i === 0 ? thead : tbody).append(tr);
  });
  if (header) table.append(thead);
  table.append(tbody);
  const wrap = el('div', { class: 'table__wrap' }); wrap.append(table);
  block.replaceChildren(el('div', { class: 'table__title' }), wrap);
}
