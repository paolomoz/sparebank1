// news-listing.mjs — `.sb1-articles__content` (nettsider-frontend news listing: h1 + featured headline card + news cards fed by
// nyheter.export.json → the settled DOM is the snapshot; "Flere artikler" pager link kept as an anchor). Verbatim content.
import fs from 'node:fs';
const sidecarJson = (slug) => { try { return JSON.parse(fs.readFileSync(new URL(`../../../current/pages/${slug}.json`, import.meta.url), 'utf8')); } catch { return null; } };
export default {
  'sb1-articles__content'(node, ctx) {
    const { el, txt, abs } = ctx;
    const s = el('section', { class: 'articles' });
    const h1 = node.querySelector('.title h1'); if (h1) s.append(el('div', { class: 'articles__title' }, [el('h1', {}, [txt(h1)])]));
    const grid = el('div', { class: 'newscards' });
    // Lazy cards: the sidecar snapshot caught some cards while `lazyload-placeholder` was still up (no <img>). The
    // sidecar JSON's media.images (DOM order, settled) fills the gap: the entry right after the last matched card image.
    const media = (sidecarJson(ctx.slug)?.media?.images || []).map((m) => m.src || m.currentSrc || ''); let mi = -1; const used = new Set();
    const lazySrc = (img) => { if (img) { const i = media.findIndex((s, k) => k > mi && s && s.split('/').pop() === (img.getAttribute('src') || '').split('/').pop()); if (i >= 0) mi = i; used.add(mi); return null; } for (let k = mi + 1; k < media.length; k++) { if (!used.has(k) && /\.thumb\./.test(media[k])) { mi = k; used.add(k); return media[k]; } } return null; };
    for (const card of node.querySelectorAll('.newscards > article.newscard')) {
      const featured = /newscard__headline/.test(card.className); const green = /newscard__green/.test(card.className); const noimg = /newscard__noimage/.test(card.className) || !(card.querySelector('img') || card.querySelector('.lazyload-placeholder'));
      const art = el('article', { class: 'newscard' + (featured ? ' newscard--headline' : '') + (green ? ' newscard--green' : '') + (noimg ? ' newscard--noimage' : '') });
      const a = card.querySelector('a.newscard__click-area'); const link = el('a', { class: 'newscard__link', href: abs(a?.getAttribute('href')) });
      const wrap = el('div', { class: 'newscard__wrap' + (noimg ? '' : ' newscard__wrap--withimage') });
      let img = card.querySelector('img'); const imgWrap = card.querySelector('.newscard__image');
      const lazy = lazySrc(img); if (!img && lazy && card.querySelector('.lazyload-placeholder')) { img = el('img', { src: lazy, alt: '' }); }
      if (img) wrap.append(el('div', { class: 'newscard__image' + (/top-crop/.test(imgWrap?.className || '') ? ' newscard__image--top' : '') + (/center-crop/.test(imgWrap?.className || '') ? ' newscard__image--center' : '') + (/bottom-crop/.test(imgWrap?.className || '') ? ' newscard__image--bottom' : '') }, [el('img', { src: abs(img.getAttribute('src')), alt: img.getAttribute('alt') || '', loading: featured ? null : 'lazy' })]));
      const content = el('div', { class: 'newscard__content' }); const text = el('div', { class: 'newscard__text' });
      const tag = card.querySelector('.tag__item'); if (tag) text.append(el('div', { class: 'newscard__tag' }, [el('span', { class: 'newscard__tag-item' }, [txt(tag)])]));
      const title = card.querySelector('.newscard__title'); if (title) text.append(el('h2', { class: 'newscard__title' }, [txt(title)]));
      const date = card.querySelector('.newscard__date'); if (date) text.append(el('div', { class: 'newscard__date' }, [txt(date)]));
      content.append(text); wrap.append(content); link.append(wrap); art.append(link); grid.append(art);
    }
    const foot = node.querySelector('.newscards-footer'); if (foot) { const f = el('div', { class: 'newscards__footer' }); const g = el('div', { class: 'newscards__pager', role: 'group', 'aria-label': foot.querySelector('[role=group]')?.getAttribute('aria-label') || 'Flere artikler' }); for (const a of foot.querySelectorAll('a')) { const icon = a.querySelector('.ffe-icons'); const m = (icon?.getAttribute('style') || '').match(/mask-image:\s*(url\([^)]*\))/); g.append(el('a', { class: 'btn btn--shortcut newscards__more', href: abs(a.getAttribute('href')) }, [el('span', { class: 'btn__label' }, [ctx.labelText(a.querySelector('.ffe-button__label')) || txt(a), icon ? el('span', { class: 'newscards__more-icon', role: 'img', style: m ? `--icon:${m[1].replace(/&quot;/g, '"')}` : null }) : null])])); } f.append(g); grid.append(f); }
    s.append(grid);
    return s;
  },
};
