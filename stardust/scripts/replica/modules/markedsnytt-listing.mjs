// markedsnytt-listing family — the Markedsnytt hub (PRIVAT chrome, productpage main). Handlers: `video` (YouTube embed mirrored
// as captured: placeholder + iframe whose src is the loaded src or the lazyload data-video-url) and a family-gated `image`
// that resolves lazyload portraits (data-lazy-src, no src in the captured DOM) before the canon imageBlock.
// Featured article cards and the columns-grid reference block are handled by modules/theme.mjs (shared registry key, family-gated).
export default {
  video(node, { el, abs }) {
    const wrap = node.querySelector('.video-wrap'); const ph = wrap?.querySelector('img.video-placeholder'); const fr = wrap?.querySelector('iframe');
    const s = el('section', { class: 'video' }); const w = el('div', { class: 'video__wrap' });
    if (ph) w.append(el('img', { class: 'video__placeholder', src: abs(ph.getAttribute('src')), alt: ph.getAttribute('alt') || '' }));
    if (fr) { const src = fr.getAttribute('src') || fr.getAttribute('data-video-url'); if (src) w.append(el('iframe', { class: 'video__frame', src, title: fr.getAttribute('title'), allowfullscreen: true, loading: 'lazy', frameborder: '0' })); }
    s.append(w); return s;
  },
  image(node, ctx) {
    if (ctx.family === 'markedsnytt-listing') for (const img of node.querySelectorAll('img[data-lazy-src]:not([src])')) img.setAttribute('src', img.getAttribute('data-lazy-src'));
    return ctx.imageBlock(node);
  },
};
