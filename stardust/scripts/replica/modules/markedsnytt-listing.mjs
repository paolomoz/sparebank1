// markedsnytt-listing family — the Markedsnytt hub (PRIVAT chrome, productpage main). Handlers: `video` (YouTube embed mirrored
// as captured: placeholder + iframe whose src is the loaded src or the lazyload data-video-url) and the CSS contract for
// market-landing's `image` handler (`--w` max-width, `image--center`).
// Featured article cards and the columns-grid reference block are handled by modules/theme.mjs (shared registry key, family-gated).
export default {
  video(node, { el, abs }) {
    const wrap = node.querySelector('.video-wrap'); const ph = wrap?.querySelector('img.video-placeholder'); const fr = wrap?.querySelector('iframe');
    const s = el('section', { class: 'video' }); const w = el('div', { class: 'video__wrap' });
    if (ph) w.append(el('img', { class: 'video__placeholder', src: abs(ph.getAttribute('src')), alt: ph.getAttribute('alt') || '' }));
    if (fr) { const src = fr.getAttribute('src') || fr.getAttribute('data-video-url'); if (src) w.append(el('iframe', { class: 'video__frame', src, title: fr.getAttribute('title'), allowfullscreen: true, loading: 'lazy', frameborder: '0' })); }
    s.append(w); return s;
  },
  // related-topics — canon's newsfeed rail verbatim, plus (markedsnytt-listing only) the publication date canon card() drops.
  'related-topics'(node, ctx) {
    const { el, bgStyle, cleanCopy, card, buttonWrapper, txt } = ctx; const k = 'related-topics';
    const s = el('section', { class: k, style: bgStyle(node.querySelector(':scope > div')) }); const inner = el('div', { class: k + '__inner' });
    const h = node.querySelector('.title h2, h2'); if (h) inner.append(el('div', { class: k + '__title' }, [cleanCopy(h)]));
    const feed = el('div', { class: 'newsfeed' }); const track = el('div', { class: 'newsfeed__track' });
    for (const c of node.querySelectorAll('.card')) {
      const cc = card(c, 'card--news');
      if (ctx.family === 'markedsnytt-listing') { const date = c.querySelector('.card__date'); const content = cc.querySelector('.card__content'); if (date && content) content.append(el('span', { class: 'card__date' }, [txt(date)])); }
      track.append(cc);
    }
    feed.append(track); inner.append(feed);
    const btn = node.querySelector(':scope .button'); if (btn && !node.querySelector('.card .button')) { const bw = buttonWrapper(btn, 'center'); if (bw) inner.append(bw); }
    s.append(inner); return s;
  },
  // NOTE: no `image` handler here — market-landing.mjs owns that registry key (it sorts after this file) and already emits
  // the authored max-width as `--w` plus `image--center`; markedsnytt-listing.css consumes that contract.

};
