import { el, icon, inlineIcons } from '../../scripts/sb1.js';

/**
 * accordion — FFE accordion (collection pattern). One row per item: [question <p>][answer rich text].
 * Variant `faq`: the "Hva lurer andre på?" list — per item a "Var dette nyttig?" thumbs control (block-owned UI, mirrors the live
 * feedback widget; dynamics #5 interim: no network) and, when the answer ends with a link to the question page, the new-window
 * affordance. Variant `show-N`: only the first N items render at rest; the trailing default-content paragraph after the block
 * ("Se flere spørsmål og svar") becomes the reveal button (EW8: the authored <p> moves into the button-like control).
 * EW7: the question <p> moves into a sibling div; the whole heading row toggles; the button is chevron-only.
 */
export default function decorate(block) {
  const showN = +([...block.classList].find((c) => /^show-\d+$/.test(c)) || '').replace('show-', '') || Infinity;
  const faq = block.classList.contains('faq');
  const acc = el('div', { class: 'accordion__list' });
  [...block.children].forEach((row, i) => {
    const [qCell, aCell] = [...row.children];
    const id = `${block.dataset.blockName || 'acc'}-${i}-${Math.random().toString(36).slice(2, 6)}`;
    const item = el('div', { class: `accordion__item${i >= showN ? ' accordion__item--more' : ''}`, style: i >= showN ? 'display: none' : null });
    const label = el('div', { class: 'accordion__label' }); while (qCell.firstChild) label.append(qCell.firstChild);
    const btn = el('button', { type: 'button', class: 'accordion__button', 'aria-expanded': 'false', 'aria-controls': `${id}-p`, 'aria-label': 'Åpne' }, el('span', { class: 'accordion__icon' }, icon('chevron-small')));
    const head = el('h3', { class: 'accordion__heading' }, el('div', { class: 'accordion__row' }, label, btn));
    const panel = el('div', { class: 'accordion__panel', id: `${id}-p`, role: 'region' });
    const body = el('div', { class: 'accordion__body' }); while (aCell.firstChild) body.append(aCell.firstChild);
    if (faq) {
      const fb = el('div', { class: 'feedback feedback--inline' }, el('p', { class: 'feedback__question' }, 'Var dette nyttig?'), el('div', { class: 'thumbs' }, el('button', { type: 'button', class: 'thumbs__btn thumbs__btn--up', 'aria-label': 'Ja' }, icon('thumbs-up')), el('button', { type: 'button', class: 'thumbs__btn thumbs__btn--down', 'aria-label': 'Nei' }, icon('thumbs-down'))));
      const last = body.lastElementChild; const link = last?.querySelector?.('a') && last.children.length === 1 && last.textContent.trim() === last.querySelector('a').textContent.trim() ? last : null;
      if (link) { link.classList.add('accordion__link'); link.querySelector('a').append(icon('new-window')); body.insertBefore(fb, link); } else body.append(fb);
    }
    panel.append(body); item.append(head, panel); acc.append(item);
    const toggle = () => { const open = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', String(!open)); item.classList.toggle('accordion__item--open', !open); panel.style.height = open ? '0px' : 'auto'; };
    head.addEventListener('click', toggle);
  });
  block.replaceChildren(acc);
  // reveal control: the default-content paragraph right after this block ("Se flere spørsmål og svar")
  if (showN < Infinity) {
    const wrapper = block.closest('.accordion-wrapper') || block; const next = wrapper.nextElementSibling;
    const p = next?.classList.contains('default-content-wrapper') ? next.querySelector('p') : null;
    if (p) {
      const more = el('div', { class: 'faq__more' }); const btn = el('button', { type: 'button', class: 'button secondary faq__more-btn', 'aria-expanded': 'false' });
      btn.append(p); more.append(btn); block.append(more); if (!next.children.length) next.remove();
      btn.addEventListener('click', () => { const open = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', String(!open)); acc.querySelectorAll('.accordion__item--more').forEach((it) => { it.style.display = open ? 'none' : ''; }); });
    }
  }
  inlineIcons(block);
}
