// news-article.mjs — `.sb1-article` (nettsider-frontend article template, layout1). Verbatim content from the sidecar.
// Structure mirrored: header (hero image + caption, tag, h1, author/date, share), content (teaser, richtext, floated
// image, infoBox), aside (related articles, related themes). Geometry: stardust/replica/lift/nyhet-*-detail.json.
const richBlock = (ctx, node, cls) => { const w = ctx.el('div', { class: cls }); for (const c of (node.querySelector('.text-content') || node).childNodes) { if (c.nodeType === 1 && /glossary-(backdrop|modal)/.test(c.className)) continue; const cc = ctx.cleanCopy(c); if (cc) w.append(cc); } return w; };
const figure = (ctx, node, cls) => { const img = node.querySelector('img'); if (!img) return null; const fig = ctx.el('figure', { class: cls }); const im = ctx.cleanCopy(img); im.removeAttribute('class'); im.setAttribute('class', cls + '-img'); if (img.getAttribute('role') === 'presentation') im.setAttribute('alt', ''); fig.append(ctx.el('div', { class: cls + '-container' }, [im])); const cap = node.querySelector('figcaption'); if (cap) fig.append(ctx.el('figcaption', { class: cls + '-caption' }, [ctx.txt(cap)])); return fig; };

export default {
  'sb1-article'(node, ctx) {
    const { el, txt, abs, svgOf } = ctx;
    const layout = (node.closest('body')?.className.match(/sb1-article__layout(\d)/) || [, '1'])[1];
    const art = el('article', { class: `article article--layout${layout}` });
    // ---- header
    const H = node.querySelector('.sb1-article__header'); const head = el('header', { class: 'article__header' });
    const heroWrap = H?.querySelector('.sb1-article__header-image'); if (heroWrap) { const fig = figure(ctx, heroWrap, 'article__hero'); if (fig) { if (/top-crop/.test(heroWrap.className)) fig.classList.add('article__hero--top'); head.append(fig); } }
    const tag = H?.querySelector('.tag__item'); if (tag) head.append(el('div', { class: 'article__tag' }, [el('span', { class: 'article__tag-item' }, [txt(tag)])]));
    const h1 = H?.querySelector('h1'); if (h1) head.append(el('div', { class: 'article__title' }, [el('h1', {}, [...h1.childNodes].map(ctx.cleanCopy).filter(Boolean))]));
    const author = H?.querySelector('.author'); if (author) { const a = el('div', { class: 'article__author' }); const t = el('div', { class: 'article__author-text' }); const name = author.querySelector('.author-text > div:not(.author-text__date)'); if (name && txt(name)) t.append(el('div', { class: 'article__author-name' }, [txt(name)])); const d = author.querySelector('.author-text__date'); if (d) t.append(el('div', { class: 'article__date' }, [txt(d)])); a.append(t); head.append(a); }
    const some = H?.querySelector('.some'); if (some) { const s = el('div', { class: 'article__share' }); for (const b of some.querySelectorAll('.some__item-button')) s.append(el('div', { class: 'article__share-item' }, [el('button', { type: 'button', class: 'article__share-btn', id: b.getAttribute('id'), 'aria-label': b.getAttribute('aria-label') }, [svgOf(b.querySelector('svg'))])])); head.append(s); }
    art.append(head);
    // ---- content
    const C = node.querySelector('.sb1-article__content'); const body = el('div', { class: 'article__content' });
    for (const ch of C?.children || []) {
      const cls = ch.className || '';
      if (/sb1-article__content-teaser/.test(cls)) body.append(richBlock(ctx, ch, 'article__teaser richtext'));
      else if (/right-adjust|left-adjust/.test(cls) && /\bimage\b/.test(cls)) { const fig = figure(ctx, ch, 'article__figure'); if (fig) { fig.classList.add(/right-adjust/.test(cls) ? 'article__figure--right' : 'article__figure--left'); body.append(fig); } }
      else if (/infoBox/.test(cls)) { const box = el('aside', { class: 'article__infobox' + (/infoBox__fullWidth/.test(cls) ? ' article__infobox--full' : '') }); const content = ch.querySelector('.infoBox__content'); const bg = (content?.className.match(/sb1-bgcolor__([a-z0-9-]+)/) || [])[1]; const inner = el('div', { class: 'article__infobox-content' + (bg ? ' bg--' + bg : '') }); for (const t of content?.querySelectorAll(':scope > .text') || []) inner.append(richBlock(ctx, t, 'richtext')); box.append(inner); body.append(box); }
      else if (/\btext\b/.test(cls)) body.append(richBlock(ctx, ch, 'article__text richtext'));
      else if (/\bimage\b/.test(cls)) { const fig = figure(ctx, ch, 'article__figure'); if (fig) body.append(fig); }
      else { const m = ctx.moduleOf(ch); if (m) body.append(m); else ctx.log.unknownModules.push('sb1-article/' + cls.split(' ')[0]); }
    }
    art.append(body);
    // ---- aside
    const A = node.querySelector('.sb1-article__aside'); const aside = el('aside', { class: 'article__aside' });
    const rel = A?.querySelector('.related-list'); if (rel) { const r = el('section', { class: 'article__related' }); const h = rel.querySelector('.related-list__header'); if (h) r.append(el('h2', { class: 'article__aside-heading' }, [txt(h)])); for (const item of rel.querySelectorAll('.related-list__item')) { const a = item.querySelector('a'); const img = item.querySelector('img'); const it = el('article', { class: 'article__related-item' }); const link = el('a', { href: abs(a?.getAttribute('href')) }); if (img) link.append(el('div', { class: 'article__related-image' + (/top-crop/.test(item.querySelector('.sb1-article__header-image')?.className || '') ? ' article__related-image--top' : '') }, [el('img', { src: abs(img.getAttribute('src')), alt: img.getAttribute('alt') || '', loading: 'lazy' })])); link.append(el('span', { class: 'article__related-text' }, [txt(item.querySelector('.related-list__text'))])); it.append(link); r.append(it); } aside.append(r); }
    const tags = A?.querySelector('.tags'); if (tags) { const t = el('section', { class: 'article__tags' }); const h = tags.querySelector('h2'); if (h) t.append(el('h2', { class: 'article__aside-heading' }, [txt(h)])); for (const a of tags.querySelectorAll('a')) t.append(el('a', { class: 'article__tag-link', href: abs(a.getAttribute('href')) }, [txt(a)])); aside.append(t); }
    art.append(aside);
    return art;
  },
};
