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
  if (block.classList.contains('disclosure')) { decorateDisclosure(block); return; } // additive variant (product siblings: progressive-disclosure)
  if (block.classList.contains('steps')) { decorateSteps(block); return; } // additive variant (product siblings: step-by-step)
  if (block.classList.contains('tabs')) { decorateTabs(block); return; } // additive variant (product siblings: the AEM "section" master/detail list)
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

/**
 * `disclosure` variant — the live progressive-disclosure: ONE row [pill label][content]. The authored label <p> moves into an
 * expand pill (EW8, as the faq reveal button does); the content moves into a collapsed box (variant `box` = the tinted 64px-padded
 * panel; `white` = its inline white colour on some pages; `left` = left-aligned pill). aria-expanded/aria-controls contract as live.
 */
function decorateDisclosure(block) {
  const row = block.querySelector(':scope > div'); if (!row) return;
  const [labelCell, contentCell] = [...row.children]; const id = `${block.dataset.blockName || 'disclosure'}-${Math.random().toString(36).slice(2, 6)}`;
  const btn = el('button', { type: 'button', class: 'button secondary disclosure__btn', 'aria-expanded': 'false', 'aria-controls': id });
  while (labelCell?.firstChild) btn.append(labelCell.firstChild);
  const inner = el('div', { class: 'disclosure__inner' }); while (contentCell?.firstChild) inner.append(contentCell.firstChild);
  const content = el('div', { class: `disclosure__content${block.classList.contains('box') ? ' disclosure__content--box' : ''}` }, inner);
  const panel = el('div', { class: 'disclosure__panel', id, role: 'region', hidden: true }, content);
  btn.addEventListener('click', () => { const open = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', String(!open)); panel.hidden = open; block.classList.toggle('disclosure--open', !open); });
  block.replaceChildren(el('div', { class: 'disclosure__toggle' }, btn), panel);
}

/**
 * `steps` variant — the live step-by-step: one row per step [linked step title][content]. Desktop: a numbered master list (lg-4,
 * offset 1) and a detail panel (lg-6) showing the active step; mobile: the active step expands inline. Step 1 is active at rest;
 * the number circles are chrome (index). The authored title link stays the editable unit (click = select step, no navigation).
 */
function decorateSteps(block) {
  const rows = [...block.children];
  const grid = el('div', { class: 'grid-row steps__row steps__row--body' });
  const listCol = el('div', { class: 'col col-sm-12 col-md-5 col-lg-4 col-lg-offset-1' }); const list = el('div', { class: 'steps__list' });
  const infoCol = el('div', { class: 'col col-sm-12 col-md-7 col-lg-6 steps__info-col' }); const info = el('div', { class: 'steps__info', tabindex: '-1' });
  const items = rows.map((row, i) => {
    const [titleCell, contentCell] = [...row.children]; const id = `${block.dataset.blockName || 'steps'}-${i}-${Math.random().toString(36).slice(2, 6)}`;
    const item = el('div', { class: `steps__item${i === 0 ? ' steps__item--active' : ''}` });
    const choice = el('div', { class: 'steps__choice', 'aria-expanded': String(i === 0), id, 'aria-controls': `${id}-c` });
    choice.append(el('div', { class: 'steps__number' }, el('span', {}, String(i + 1))));
    const title = el('div', { class: 'steps__step-title' }); while (titleCell?.firstChild) title.append(titleCell.firstChild); title.querySelectorAll('a').forEach((a) => a.classList.add('steps__link')); choice.append(title);
    choice.append(el('div', { class: 'steps__icon' }, icon('chevron')));
    const content = el('div', { class: 'steps__content', id: `${id}-c` }); const rt = el('div', { class: 'steps__richtext' }); while (contentCell?.firstChild) rt.append(contentCell.firstChild); content.append(rt);
    item.append(choice, content); list.append(item);
    choice.addEventListener('click', (e) => { if (e.target.closest('a')) e.preventDefault(); items.forEach((it) => { it.classList.toggle('steps__item--active', it === item); it.querySelector('.steps__choice').setAttribute('aria-expanded', String(it === item)); }); info.replaceChildren(...[...content.children].map((c) => c.cloneNode(true))); });
    return item;
  });
  const first = list.querySelector('.steps__item--active .steps__content'); if (first) info.replaceChildren(...[...first.children].map((c) => c.cloneNode(true)));
  listCol.append(list); infoCol.append(info); grid.append(listCol, infoCol);
  block.replaceChildren(grid);
  inlineIcons(block);
}

/**
 * `tabs` variant — the live AEM "section" module's item list: one row per item [item title][content]. Desktop: a list of
 * underlined text buttons (active: fjell 2px rule + chevron) beside a detail panel with the active content; mobile: inline.
 * The authored title <p> moves into the button (EW8); item 1 is active at rest.
 */
function decorateTabs(block) {
  const rows = [...block.children];
  const body = el('div', { class: 'seclist__body' }); const list = el('div', { class: 'seclist__list' }); const detail = el('div', { class: 'seclist__detail' });
  const items = rows.map((row, i) => {
    const [titleCell, contentCell] = [...row.children]; const id = `${block.dataset.blockName || 'tabs'}-${i}-${Math.random().toString(36).slice(2, 6)}`;
    const item = el('div', { class: `seclist__item${i === 0 ? ' seclist__item--active' : ''}` });
    const btn = el('button', { type: 'button', class: 'seclist__btn', 'aria-expanded': String(i === 0), 'aria-controls': id });
    const text = el('span', { class: 'seclist__text' }); while (titleCell?.firstChild) text.append(titleCell.firstChild); btn.append(text, el('span', { class: 'seclist__icon' }, icon('chevron')));
    const content = el('div', { class: 'seclist__content', id }); while (contentCell?.firstChild) content.append(contentCell.firstChild);
    item.append(btn, content); list.append(item);
    btn.addEventListener('click', () => { const wasOpen = item.classList.contains('seclist__item--open'); items.forEach((it) => { const on = it === item; it.classList.toggle('seclist__item--active', on); it.classList.toggle('seclist__item--open', on && !wasOpen); it.querySelector('.seclist__btn').setAttribute('aria-expanded', String(on)); }); detail.replaceChildren(...[...content.children].map((c) => c.cloneNode(true))); });
    return item;
  });
  const first = list.querySelector('.seclist__item--active .seclist__content'); if (first) detail.replaceChildren(...[...first.children].map((c) => c.cloneNode(true)));
  body.append(list, detail); block.replaceChildren(body);
  inlineIcons(block);
}
