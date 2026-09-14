// market-landing.mjs — module handlers for the market-landing archetype (privat.html, bedrift.html, om-oss.html).
// Geometry lifted from stardust/replica/lift/privat-1440-detail.json / privat-360-detail.json and live DOM probes.
// Registry keys `image` and `banner-small` override canon's handlers: they reproduce canon's markup byte-for-byte in the
// plain case and only add (a) the authored inline max-width of illustration images as a CSS variable, (b) the
// two-column banner variant (`.banner-small__columns`).
const bannerColumn = (wrapper, ctx) => {
  const grid = wrapper.querySelector('.banner-small__grid'); const color = (grid?.className.match(/banner-small__bg-color(\d)/) || [])[1];
  const col = ctx.el('div', { class: 'banner-small__column' + (/banner-small__columns--two/.test(wrapper.className) ? ' banner-small__column--two' : ''), style: color ? `--banner-color:${color}` : null });
  const inner = ctx.el('div', { class: 'banner-small__inner banner-small__inner--col' + (color ? ' banner-small__inner--color' + color : '') + (/columns--right/.test(wrapper.innerHTML) ? ' banner-small__inner--right' : '') });
  const img = wrapper.querySelector('.banner-small__image'); if (img) { const p = ctx.picture(img, 'banner-small__img'); if (p) inner.append(ctx.el('div', { class: 'banner-small__media' }, [p])); }
  const textNode = wrapper.querySelector('.banner-small__text'); const text = ctx.el('div', { class: 'banner-small__text' + (/columns--col2/.test(textNode?.className || '') ? ' banner-small__text--wide' : '') });
  const h = wrapper.querySelector('.banner-small__header'); if (h) text.append(ctx.el('h2', { class: 'banner-small__heading' }, [...h.childNodes].map(ctx.cleanCopy).filter(Boolean)));
  const info = wrapper.querySelector('.banner-small__infotext'); if (info) text.append(ctx.el('p', { class: 'banner-small__info' }, [...info.childNodes].map(ctx.cleanCopy).filter(Boolean)));
  const bottom = wrapper.querySelector('.banner-small__bottom');
  if (bottom) { const bb = ctx.el('div', { class: 'banner-small__bottom' }); for (const b of bottom.querySelectorAll('.button')) { const bw = ctx.buttonWrapper(b); if (bw) bb.append(bw); } const bi = bottom.querySelector('.banner-small__bottom--image'); const bimg = bi?.querySelector('img'); if (bi) bb.append(ctx.el('div', { class: 'banner-small__bottom-image' }, bimg ? [ctx.cleanCopy(bimg)] : [])); text.append(bb); }
  inner.append(text); col.append(inner); return col;
};
// `.market-nav` ("Privat" / "Gå til bedrift") is a body-level strip between the header and the bank picker (mobile only).
// author.mjs only emits header / bank-choice / main / footer, so the strip is inserted here, verbatim from the sidecar, before
// the bank picker (canon request filed: author.mjs should emit it natively).
const marketNav = (ctx) => {
  const src = ctx.D.querySelector('body .market-nav'); const body = ctx.O.querySelector('body');
  if (!src || !body || body.querySelector('.market-nav')) return;
  const nav = ctx.el('nav', { class: 'market-nav', 'aria-label': 'Marked' });
  const active = src.querySelector('.market-nav--active'); if (active) nav.append(ctx.el('span', { class: 'market-nav__active' }, [ctx.txt(active)]));
  const goto = src.querySelector('.market-nav--goto a'); if (goto) nav.append(ctx.el('a', { class: 'market-nav__goto', href: ctx.abs(goto.getAttribute('href')) }, [ctx.txt(goto)]));
  const anchor = body.querySelector('.bank-choice, main'); if (anchor) body.insertBefore(nav, anchor); else body.append(nav);
};
export default {
  // related-topics — canon markup; on market-landing pages the news cards also carry their publication date (live `.card__date`,
  // dropped by canon's card builder — canon request filed). Other families get canon's exact output.
  'related-topics': (node, ctx) => {
    const k = 'related-topics'; const s = ctx.el('section', { class: k, style: ctx.bgStyle(node.querySelector(':scope > div')) }); const inner = ctx.el('div', { class: k + '__inner' });
    const h = node.querySelector('.title h2, h2'); if (h) inner.append(ctx.el('div', { class: k + '__title' }, [ctx.cleanCopy(h)]));
    const feed = ctx.el('div', { class: 'newsfeed' }); const track = ctx.el('div', { class: 'newsfeed__track' });
    for (const c of node.querySelectorAll('.card')) {
      const card = ctx.card(c, 'card--news');
      if (ctx.family === 'market-landing' || ctx.family === 'markedsnytt-listing') { // both families carry the live .card__date (registry key owned here; markedsnytt-listing.mjs sorts before this file)
        const d = c.querySelector('.card__date'); if (d) card.querySelector('.card__content')?.append(ctx.el('span', { class: 'card__date' }, [ctx.txt(d)]));
        const arrowImg = c.querySelector('.card__container-content-arrow img'); if (arrowImg && !card.querySelector('.card__arrow')) card.querySelector('.card__body')?.append(ctx.el('div', { class: 'card__arrow' }, [ctx.cleanCopy(arrowImg)])); // live chevron is an <img>, canon only carries <svg> arrows
      }
      track.append(card);
    }
    feed.append(track); inner.append(feed);
    const btn = node.querySelector(':scope .button'); if (btn && !node.querySelector('.card .button')) { const bw = ctx.buttonWrapper(btn, 'center'); if (bw) inner.append(bw); }
    s.append(inner); return s;
  },
  // hidden send-to-bank dialog shells (client-rendered on demand) — mirrored empty and hidden
  'send-to-bank-modal': (node, ctx) => ctx.el('div', { class: 'send-to-bank-modal', hidden: true, 'aria-hidden': 'true' }),
  'send-to-bank__loading': (node, ctx) => ctx.el('div', { class: 'send-to-bank__loading', hidden: true, 'aria-hidden': 'true' }, [ctx.el('span', { class: 'ffe-loading-spinner' })]),
  // visually hidden page h1 ("Privat")
  'visually-hidden': (node, ctx) => node.tagName.toLowerCase() === 'h1' ? ctx.el('h1', { class: 'visually-hidden' }, [ctx.txt(node)]) : ctx.el('div', { class: 'visually-hidden' }, [ctx.txt(node)]),
  // campaign carousel — on the captured pages a single slide (empty second instance renders 0px)
  'campaign-carousel': (node, ctx) => {
    marketNav(ctx);
    const s = ctx.el('section', { class: 'campaign' });
    const slides = [...node.querySelectorAll('.campaign-carousel__element')];
    if (!slides.length) { s.setAttribute('class', 'campaign campaign--empty'); return s; }
    const list = ctx.el('div', { class: 'campaign__list' });
    for (const sl of slides) {
      const row = sl.querySelector('.campaign__wrap-bg'); const reverse = /--reverse/.test(row?.className || '');
      const slide = ctx.el('div', { class: 'campaign__slide' + (reverse ? ' campaign__slide--reverse' : ''), style: ctx.bgStyle(row) });
      const a = sl.querySelector('a.campaign-bg__img'); const media = ctx.el('div', { class: 'campaign__media' });
      const link = ctx.el('a', { class: 'campaign__media-link', href: ctx.abs(a?.getAttribute('href')), 'aria-hidden': 'true', tabindex: '-1' }); const pic = a && ctx.picture(a, 'campaign__img'); if (pic) link.append(pic); media.append(link);
      const content = ctx.el('div', { class: 'campaign__content' }); const inner = ctx.el('div', { class: 'campaign__text' + (/align-right/.test(sl.querySelector('.campaign-content')?.className || '') ? ' campaign__text--right' : '') });
      for (const t of sl.querySelectorAll('.campaign-content .text')) inner.append(ctx.richtext(t));
      for (const b of sl.querySelectorAll('.campaign-content .button')) { const bw = ctx.buttonWrapper(b); if (bw) inner.append(bw); }
      content.append(inner);
      slide.append(media, content); list.append(slide);
    }
    s.append(list); return s;
  },
  // image — canon markup + the authored max-width (illustrations carry `style="max-width:70px;width:100%"`)
  'image': (node, ctx) => {
    const block = ctx.imageBlock(node); if (!block) return null;
    const img = node.querySelector('img'); const mw = (img?.getAttribute('style') || '').match(/max-width:\s*(\d+px)/);
    if (mw) block.setAttribute('style', ((block.getAttribute('style') || '') + `;--w:${mw[1]}`).replace(/^;/, ''));
    if (node.querySelector('.image-center')) block.setAttribute('class', block.getAttribute('class') + ' image--center');
    return block;
  },
  // banner-small — canon single variant reproduced; plus the two-column variant used on market landings
  'banner-small': (node, ctx) => {
    const cols = node.querySelector('.banner-small__columns');
    if (cols) { const s = ctx.el('section', { class: 'banner-small banner-small--columns' }); const wrap = ctx.el('div', { class: 'banner-small__columns' }); for (const w of cols.querySelectorAll(':scope > .banner-small__wrapper')) wrap.append(bannerColumn(w, ctx)); s.append(wrap); return s; }
    const grid = node.querySelector('.banner-small__grid'); const color = (grid?.className.match(/banner-small__bg-color(\d)/) || [])[1];
    const s = ctx.el('section', { class: 'banner-small' + (color ? ' banner-small--color' + color : '') });
    const inner = ctx.el('div', { class: 'banner-small__inner ' + ctx.gridClasses(node.querySelector('.banner-small__grid-col') || node) });
    const img = node.querySelector('.banner-small__image'); if (img) { const p = ctx.picture(img, 'banner-small__img'); if (p) inner.append(ctx.el('div', { class: 'banner-small__media' }, [p])); }
    const text = ctx.el('div', { class: 'banner-small__text' });
    const h = node.querySelector('.banner-small__header'); if (h) text.append(ctx.el('h2', { class: 'banner-small__heading' }, [...h.childNodes].map(ctx.cleanCopy).filter(Boolean)));
    const info = node.querySelector('.banner-small__infotext'); if (info) text.append(ctx.el('p', { class: 'banner-small__info' }, [...info.childNodes].map(ctx.cleanCopy).filter(Boolean)));
    const bottom = node.querySelector('.banner-small__bottom');
    if (bottom) { const bb = ctx.el('div', { class: 'banner-small__bottom' }); for (const b of bottom.querySelectorAll('.button')) { const bw = ctx.buttonWrapper(b); if (bw) bb.append(bw); } const bimg = bottom.querySelector('.banner-small__bottom--image img'); if (bimg) bb.append(ctx.el('div', { class: 'banner-small__bottom-image' }, [ctx.cleanCopy(bimg)])); text.append(bb); }
    inner.append(text); s.append(inner); return s;
  },
};
