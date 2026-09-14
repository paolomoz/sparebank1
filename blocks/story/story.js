import { el } from '../../scripts/sb1.js';

/**
 * story — the nettsider-frontend `sb1-story` campaign slides (campaign-landing family). One row per slide:
 *   [media: a link to an .mp4 (its text = the video title) OR one/two pictures (wide rendition, optional mobile rendition)]
 *   [text: h1/h2 · paragraphs · CTA links (<em><strong> = green action, <em> = secondary) — may be empty]
 * The slide is a 900px full-bleed band: the media fills it (video cover / parallax background with `background-attachment: fixed`,
 * as on live), the text sits in centred white cards. Authored nodes are MOVED into the overlay (EW1); the pictures stay in the
 * media slot (hidden) as the editable source of the CSS background. Motion (stardust/replica/motion/hjemme-*.json): the media
 * fades in on intersection (`is-visible`, 1s ease-out). The video fallback string is template chrome, verbatim from live.
 */
const VIDEO_FALLBACK = 'Your browser does not support the video';
const isCta = (n) => n.tagName === 'P' && n.children.length === 1 && n.firstElementChild.tagName === 'A' && n.textContent.trim() === n.firstElementChild.textContent.trim();
const isVideoLink = (a) => /\.(mp4|webm|mov)(\?|$)/i.test(a.getAttribute('href') || '');

export default function decorate(block) {
  const slides = [...block.children].map((row) => {
    const cells = [...row.children];
    const mediaCell = cells.find((c) => c.querySelector('picture, img') || [...c.querySelectorAll('a')].some(isVideoLink));
    const textCell = cells.find((c) => c !== mediaCell) || null;
    const slide = el('section', { class: 'story__slide' });
    const media = el('div', { class: 'story__media' });
    if (mediaCell) {
      const video = [...mediaCell.querySelectorAll('a')].find(isVideoLink);
      if (video) {
        const v = el('video', { class: 'story__video', src: video.getAttribute('href'), title: video.textContent.trim() || null, autoplay: true, muted: true, loop: true, controls: true, playsinline: true, preload: 'auto' }, VIDEO_FALLBACK);
        v.muted = true; media.append(v);
        const p = video.closest('p') || video; p.classList.add('story__source'); media.append(p); // the authored link stays the editable source
      } else {
        const imgs = [...mediaCell.querySelectorAll('img')];
        const [wide, mobile] = imgs;
        const bg = el('div', { class: 'story__bg', role: 'img', 'aria-label': wide?.getAttribute('alt') || '', style: `--bg-desktop:url("${wide?.getAttribute('src') || ''}")${mobile ? `;--bg-mobile:url("${mobile.getAttribute('src')}")` : ''}` });
        media.append(bg);
        const src = el('div', { class: 'story__source' }); while (mediaCell.firstChild) src.append(mediaCell.firstChild); media.append(src);
      }
    }
    slide.append(media);
    const overlay = el('div', { class: 'story__overlay' }); const grid = el('div', { class: 'story__overlay-grid' }); overlay.append(grid);
    if (textCell && textCell.textContent.trim()) {
      let text = null; let ctas = [];
      const flushCtas = () => {
        if (!ctas.length) return;
        if (ctas.length === 1) { const w = el('div', { class: 'story__card-button' }); w.append(ctas[0]); grid.append(w); } else { const g = el('div', { class: 'story__btn-group', role: 'group' }); ctas.forEach((p) => { p.classList.add('story__btn'); g.append(p); }); grid.append(el('div', { class: 'story__card-buttons' }, g)); }
        ctas = [];
      };
      [...textCell.children].forEach((n) => {
        if (isCta(n)) { text = null; ctas.push(n); return; }
        flushCtas();
        if (!text) { text = el('div', { class: 'story__card-text' }); grid.append(text); }
        text.append(n);
      });
      flushCtas();
    }
    slide.append(overlay);
    return slide;
  });
  block.replaceChildren(...slides);
  // observed: block-media fades in once it intersects (opacity 0 → 1, 1s ease-out)
  const medias = block.querySelectorAll('.story__media');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } }), { threshold: 0.05 });
    medias.forEach((m) => io.observe(m));
  } else medias.forEach((m) => m.classList.add('is-visible'));
}
