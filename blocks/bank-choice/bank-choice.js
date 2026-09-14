import { el, icon, inlineIcons } from '../../scripts/sb1.js';

/**
 * bank-choice — the alliance "Vi er flere banker i hele Norge" band (fixed composition → template-slotted, EW1/EW2).
 * Rows: [heading] [lede] [label | placeholder] [position button label] [expand label] then one row per bank: [link][tagline].
 * Interim tier (dynamics #1): the 12-bank list renders and links; the postcode field validates four digits and expands the
 * list until the postcode→bank service is exposed cross-origin; the geolocation button is present and disabled without the service.
 * @ew-exempt <p> placeholder (row 3 cell 2) — attribute of the input, not displayed text
 */
export default function decorate(block) {
  const rows = [...block.children].map((r) => [...r.children]);
  const [headingRow, ledeRow, fieldRow, posRow, expandRow, ...bankRows] = rows;
  const container = el('div', { class: 'bank-choice__container' });
  container.append(el('div', { class: 'bank-choice__bg' }, el('img', { class: 'bank-choice__bg-desktop', src: '/img/bankchoice_bg.svg', alt: '', 'aria-hidden': 'true', width: 1250, height: 368 }), el('img', { class: 'bank-choice__bg-mobile', src: '/img/bankchoice_bg_mobile.svg', alt: '', 'aria-hidden': 'true', width: 671, height: 526 })));
  const wrap = el('div', { class: 'bank-choice__wrap' });
  const heading = headingRow?.[0]?.querySelector('p, h1, h2'); if (heading) { wrap.append(el('div', { class: 'bank-choice__heading' }, heading)); }
  const lede = ledeRow?.[0]?.querySelector('p'); if (lede) wrap.append(el('div', { class: 'bank-choice__sublead' }, lede));
  const search = el('div', { class: 'bank-choice__search', role: 'search' });
  const label = fieldRow?.[0]?.querySelector('p'); const placeholder = fieldRow?.[1]?.textContent.trim() || 'Postnummer';
  const field = el('div', { class: 'bank-choice__field' });
  if (label) { const l = el('label', { class: 'bank-choice__label', for: 'postnummer-input' }); l.append(...label.childNodes); label.replaceWith(l); field.append(l); }
  field.append(el('input', { class: 'bank-choice__input', id: 'postnummer-input', type: 'tel', inputmode: 'numeric', role: 'searchbox', placeholder, autocomplete: 'postal-code' }), el('div', { class: 'bank-choice__message', 'aria-live': 'polite' }));
  search.append(field);
  const pos = posRow?.[0]?.querySelector('p');
  if (pos) { const btn = el('button', { type: 'button', class: 'button secondary bank-choice__position-btn' }); const lbl = el('span', { class: 'bank-choice__btn-label' }); lbl.append(icon('pin'), pos); btn.append(lbl); search.append(el('div', { class: 'bank-choice__myposition' }, btn)); }
  const all = el('div', { class: 'bank-choice__all' });
  const expandP = expandRow?.[0]?.querySelector('p');
  const expandBtn = el('button', { type: 'button', class: 'bank-choice__expand', 'aria-expanded': 'false', 'aria-controls': 'bank-list' });
  if (expandP) { const lbl = el('span', { class: 'bank-choice__btn-label' }); lbl.append(expandP); expandBtn.append(lbl); }
  expandBtn.append(icon('chevron'));
  all.append(expandBtn);
  const list = el('ol', { class: 'bank-choice__list', id: 'bank-list', hidden: true });
  bankRows.forEach(([linkCell, tagCell]) => {
    const a = linkCell?.querySelector('a'); const tag = tagCell?.querySelector('p');
    if (!a) return;
    a.classList.add('bank-choice__bank-link');
    const wrapEl = el('div', { class: 'bank-choice__bank-wrap' }); wrapEl.append(a.closest('p') || a); if (tag) { tag.classList.add('bank-choice__bank-tagline'); wrapEl.append(tag); }
    list.append(el('li', { class: 'bank-choice__bank' }, wrapEl, icon('chevron-small')));
  });
  all.append(list); search.append(all); wrap.append(search); container.append(wrap);
  block.replaceChildren(container); inlineIcons(block);

  const input = container.querySelector('#postnummer-input'); const msg = container.querySelector('.bank-choice__message');
  const toggle = (open) => { expandBtn.setAttribute('aria-expanded', String(open)); list.hidden = !open; all.classList.toggle('bank-choice__all--open', open); };
  expandBtn.addEventListener('click', () => toggle(expandBtn.getAttribute('aria-expanded') !== 'true'));
  input.addEventListener('input', () => { const ok = /^\d{4}$/.test(input.value); msg.textContent = input.value && !ok ? 'Skriv inn et gyldig postnummer (4 siffer).' : ''; if (ok) toggle(true); });
  const posBtn = container.querySelector('.bank-choice__position-btn'); if (posBtn) posBtn.addEventListener('click', () => toggle(true)); // interim: no bank lookup service on this host (dynamics #1)
}
