import { el, icon, inlineIcons, uid } from '../../scripts/sb1.js';

/**
 * carousel — Block Collection carousel shape, one row per slide. Two live components share it (D9):
 *   `campaign` (market-landing hero, om-oss split hero): [image][heading, lead, text, CTA]; tinted slide, 7/12 photo + 5/12 text
 *     at ≥768, photo above centred text below; `reverse` = photo on the right. Controls only when more than one slide is authored
 *     (the live campaign rotation is server-side — permanent residual). Additive variants: `white` (untinted), `lead` (h1 + lead).
 *   default = the live guide-carousel (product siblings, W3): [screenshot][title + copy][slide name]; variant `guide` (layout1:
 *     phone screenshots 250px column left, 470px copy right, 495px tall slides ≥768; frost/sand tint via the section). One slide
 *     visible; "N av M" counter + Forrige/Neste secondary pills are block chrome (fixed strings, like the accordion's "Åpne");
 *     the slide names (authored, visually hidden on live) feed the tablist.
 * Authored nodes are moved into the slide (EW1), never rebuilt. The variant is dispatched first so neither flow touches the other.
 */
export default function decorate(block) {
  if (block.classList.contains('campaign')) { decorateCampaign(block); return; }
  decorateGuide(block);
}

/** campaign — W1 market-landing model (restored after the guide rewrite; see stardust/rollout/eds-requests.md W4). */
function decorateCampaign(block) {
  const rows = [...block.children];
  const track = el('div', { class: 'carousel__slides' });
  rows.forEach((row, i) => {
    const cells = [...row.children];
    const media = cells.find((c) => c.querySelector('picture, img') && !c.querySelector('h1,h2,h3,h4,h5,h6'));
    const body = cells.find((c) => c !== media && c.textContent.trim()) || cells[cells.length - 1];
    const slide = el('div', { class: `carousel__slide${i ? '' : ' carousel__slide--active'}`, role: 'group', 'aria-roledescription': 'slide', 'aria-label': `${i + 1} / ${rows.length}`, hidden: i ? true : null });
    if (media) { media.className = 'carousel__media'; slide.append(media); }
    const content = el('div', { class: 'carousel__content' }); const text = el('div', { class: 'carousel__text' });
    while (body.firstChild) text.append(body.firstChild);
    content.append(text); slide.append(content); track.append(slide);
  });
  block.replaceChildren(track);
  if (rows.length > 1) {
    const dots = el('div', { class: 'carousel__dots', role: 'tablist' });
    const slides = [...track.children];
    slides.forEach((s, i) => {
      const b = el('button', { type: 'button', class: `carousel__dot${i ? '' : ' carousel__dot--active'}`, role: 'tab', 'aria-selected': String(!i), 'aria-label': `Vis ${i + 1}` });
      b.addEventListener('click', () => { slides.forEach((x, j) => { x.hidden = j !== i; x.classList.toggle('carousel__slide--active', j === i); }); dots.querySelectorAll('button').forEach((d, j) => { d.classList.toggle('carousel__dot--active', j === i); d.setAttribute('aria-selected', String(j === i)); }); });
      dots.append(b);
    });
    block.append(dots);
  }
}

/** guide — the live guide-carousel (W3 product siblings), unchanged. */
function decorateGuide(block) {
  const rows = [...block.children]; const id = uid('carousel');
  const content = el('div', { class: 'gcarousel__content' });
  const idx = el('span', { class: 'gcarousel__index' }, '1');
  const indicators = el('p', { class: 'gcarousel__indicators' }, idx, ` av ${rows.length}`);
  const tabs = el('ul', { class: 'visually-hidden gcarousel__tabs', role: 'tablist', 'aria-label': 'Velg en slide' });
  const items = rows.map((row, i) => {
    const cells = [...row.children];
    const media = cells.find((c) => c.querySelector('picture, img') && !c.querySelector('h1,h2,h3,h4,h5,h6'));
    const body = cells.find((c) => c !== media && c.querySelector('h1,h2,h3,h4,h5,h6')) || cells.find((c) => c !== media);
    const name = cells.find((c) => c !== media && c !== body && c.textContent.trim());
    const item = el('div', { class: `gcarousel__item${i === 0 ? ' gcarousel__item--active' : ''}`, role: 'tabpanel', id: `${id}-p${i}`, 'aria-label': `Slide ${i + 1} of ${rows.length}` });
    const teaser = el('div', { class: 'gcarousel__teaser' });
    if (media) { const pic = media.querySelector('picture, img'); pic.querySelectorAll?.('img').forEach((im) => im.classList.add('gcarousel__img')); if (pic.tagName === 'IMG') pic.classList.add('gcarousel__img'); teaser.append(el('div', { class: 'gcarousel__image' }, pic)); }
    const text = el('div', { class: 'gcarousel__text' });
    if (body) { const h = body.querySelector('h1,h2,h3,h4,h5,h6'); if (h) h.classList.add('gcarousel__heading'); const desc = el('div', { class: 'gcarousel__desc' }); while (body.firstChild) { const n = body.firstChild; if (n === h) text.append(n); else desc.append(n); } text.append(desc); }
    teaser.append(text); item.append(teaser);
    const tab = el('li', { role: 'tab', id: `${id}-t${i}`, 'aria-controls': `${id}-p${i}`, 'aria-selected': String(i === 0) });
    if (name) { while (name.firstChild) tab.append(name.firstChild); } else tab.append(body?.querySelector('.gcarousel__heading')?.textContent || `Slide ${i + 1}`);
    tabs.append(tab); return item;
  });
  const actions = el('div', { class: 'gcarousel__actions' });
  const prev = el('button', { type: 'button', class: 'button secondary gcarousel__prev', 'aria-label': 'Forrige' }, el('span', { class: 'gcarousel__icon' }, icon('arrow')), el('span', { class: 'visually-hidden' }, 'Forrige'));
  const next = el('button', { type: 'button', class: 'button secondary gcarousel__next', 'aria-label': 'Neste' }, el('span', { class: 'gcarousel__icon' }, icon('arrow')), el('span', { class: 'visually-hidden' }, 'Neste'));
  actions.append(prev, ' ', next);
  content.append(indicators, tabs, ...items, actions);
  block.replaceChildren(content);
  let i = 0;
  const show = (n) => { i = (n + items.length) % items.length; items.forEach((it, k) => it.classList.toggle('gcarousel__item--active', k === i)); [...tabs.children].forEach((t, k) => t.setAttribute('aria-selected', String(k === i))); idx.textContent = String(i + 1); };
  prev.addEventListener('click', () => show(i - 1)); next.addEventListener('click', () => show(i + 1));
  inlineIcons(block);
}
