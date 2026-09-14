import { el, icon, inlineIcons, uid } from '../../scripts/sb1.js';

/**
 * cobranding — the LOfavør co-branding expander on hub pages. Single-cell rows, read by position:
 *   row 1  header: heading paragraph + the toggle-label paragraph (the label MOVES into the expand button — EW8)
 *   row 2  intro of the expanded panel (partner logo + title)
 *   row 3+ one panel column each (text, CTAs, illustration)
 * The panel is closed at rest (live: client-rendered on demand; dynamics #14 static snapshot). Variant `sand`: panel tint.
 */
export default function decorate(block) {
  const rows = [...block.children].map((r) => r.firstElementChild).filter(Boolean);
  const [head, intro, ...cols] = rows; if (!head) return;
  const id = uid('cobranding');
  const header = el('div', { class: 'cobranding__header' });
  const ps = [...head.children]; const label = ps.length > 1 ? ps[ps.length - 1] : null;
  ps.forEach((p) => { if (p !== label) { p.classList.add('cobranding__heading'); header.append(p); } });
  const btn = el('button', { type: 'button', class: 'button secondary cobranding__toggle', 'aria-expanded': 'false', 'aria-controls': id });
  if (label) { label.classList.add('cobranding__label'); btn.append(label); }
  btn.append(icon('expand', 'cobranding__close'));
  header.append(btn);
  const panel = el('div', { class: 'cobranding__panel', id, hidden: true });
  if (intro) { intro.classList.add('cobranding__intro'); panel.append(intro); }
  if (cols.length) { const wrap = el('div', { class: 'cobranding__columns' }); cols.forEach((c) => { c.classList.add('cobranding__col'); wrap.append(c); }); panel.append(wrap); }
  block.replaceChildren(header, panel);
  btn.addEventListener('click', () => { const open = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', String(!open)); btn.classList.toggle('cobranding__toggle--open', !open); panel.hidden = open; });
  inlineIcons(block);
}
