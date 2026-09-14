import { el, icon, inlineIcons } from '../../scripts/sb1.js';

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
  if (block.classList.contains('disclosure')) buildDisclosure(block, wrap);
}

/**
 * `disclosure` variant (live progressive-disclosure module): the section's leading default content is reabsorbed (EW8) — its first
 * paragraph is the toggle label (moved beside a chevron-only button, EW7), the remaining head (heading, note) opens the panel that
 * holds the table; the panel is collapsed by height at rest (aria-expanded=false).
 */
function buildDisclosure(block, wrap) {
  const head = block.parentElement?.previousElementSibling;
  if (!head?.classList.contains('default-content-wrapper')) return;
  const label = head.firstElementChild; if (!label) return;
  const id = `${block.dataset.blockName || 'table'}-${Math.random().toString(36).slice(2, 6)}`;
  const toggle = el('div', { class: 'table__toggle' });
  const labelWrap = el('div', { class: 'table__label' }); labelWrap.append(label);
  const btn = el('button', { type: 'button', class: 'table__button', 'aria-expanded': 'false', 'aria-controls': id, 'aria-label': 'Åpne' }, icon('chevron-small'));
  toggle.append(labelWrap, btn);
  const panel = el('div', { class: 'table__panel', id, role: 'region' });
  const panelHead = el('div', { class: 'table__head' }); while (head.firstChild) panelHead.append(head.firstChild); head.remove();
  panel.append(panelHead, wrap);
  block.querySelector('.table__title')?.remove();
  block.prepend(toggle); block.append(panel);
  toggle.addEventListener('click', () => { const open = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', String(!open)); block.classList.toggle('table--open', !open); });
  inlineIcons(block);
}
