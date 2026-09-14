import { el } from '../../scripts/sb1.js';

/**
 * carousel — Block Collection carousel shape: one row per slide [image][body]. Variant `campaign`: the market-landing
 * hero (tinted slide, 7/12 photo + 5/12 text at ≥768, photo above centred text below; `reverse` = photo on the right).
 * Authored nodes are moved into the slide (EW1). Controls appear only when more than one slide is authored; the live
 * campaign rotation is server-side (permanent residual).
 */
export default function decorate(block) {
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
