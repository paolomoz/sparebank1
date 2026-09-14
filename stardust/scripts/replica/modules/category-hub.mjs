// category-hub.mjs — module handlers for the category-hub archetype family (privat/lan.html etc.).
// Values and structure lifted from the live DOM at 1440 and 360 (stardust/replica/lift/lan-*-detail.json + live probes).
// The visual-nav component is client-rendered per breakpoint on the live site (data-* driven): both the desktop
// card and the mobile card are authored here and toggled with CSS, so one DOM serves both gate widths.
const breadcrumb = (node, ctx) => {
  const a = node.querySelector('a.to-parent__link');
  return ctx.el('nav', { class: 'breadcrumb', 'aria-label': 'Tilbake' }, [ctx.el('a', { class: 'breadcrumb__link', href: ctx.abs(a.getAttribute('href')) }, [ctx.svgOf(a.querySelector('svg')), ctx.txt(a)])]);
};
const chevron = (ctx) => ctx.el('img', { src: 'assets/chevron.svg', class: 'vnav__chevron', alt: '', 'aria-hidden': 'true', width: '24', height: '24' });

export default {
  // intro block (h1 + centred lead) — the same wrapper class carries the breadcrumb on product pages
  'aem-main-container': (node, ctx) => {
    if (node.querySelector('a.to-parent__link')) return breadcrumb(node, ctx);
    const h1 = node.querySelector('.title h1, h1');
    if (!h1) { const inner = [...node.children].map(ctx.moduleOf).filter(Boolean); return inner.length ? ctx.el('div', { class: 'container' }, inner) : null; }
    const s = ctx.el('section', { class: 'intro' });
    s.append(ctx.cleanCopy(h1));
    const tw = node.querySelector('.text-wrapper');
    if (tw) { const rt = ctx.richtext(tw, 'intro__lead'); const mw = (tw.getAttribute('style') || '').match(/max-width:\s*(\d+px)/); if (mw) rt.setAttribute('style', `--max:${mw[1]}`);
      // cleanCopy drops the AEM span class: restore `main-lead` on the copied spans (same document order)
      const srcSpans = [...tw.querySelectorAll('span')]; const outSpans = [...rt.querySelectorAll('span')]; srcSpans.forEach((sp, i) => { if (/\bmain-lead/.test(sp.className) && outSpans[i]) outSpans[i].setAttribute('class', ((outSpans[i].getAttribute('class') || '') + ' main-lead').trim()); });
      s.append(rt); }
    return s;
  },
  // visual-nav: data-type medium (photo card) or small (icon row)
  'visual-nav': (node, ctx) => {
    const root = node.querySelector('.component-root') || node;
    const type = root.getAttribute('data-type') || (node.querySelector('.nav--small') ? 'small' : 'medium');
    const a = node.querySelector('a.nav--wrapper, a.nav--small');
    const href = ctx.abs(a?.getAttribute('href') || root.getAttribute('data-link'));
    const title = root.getAttribute('data-title') || ctx.txt(node.querySelector('h3'));
    const text = root.getAttribute('data-text') || ctx.txt(node.querySelector('p'));
    const alt = root.getAttribute('data-image-alt') || '';
    const s = ctx.el('section', { class: `vnav vnav--${type}` });
    if (type === 'medium') {
      const bgDiv = node.querySelector('.nav--med__background');
      const m = (bgDiv?.getAttribute('style') || '').match(/url\("?([^")]+)"?\)/);
      const imgBase = (m ? m[1] : root.getAttribute('data-image-src') || '').replace(/\.thumb\.\d+\.\d+\.jpg$/, '');
      const link = ctx.el('a', { class: 'vnav__link', href });
      const photo = ctx.el('div', { class: 'vnav__photo', role: 'img', 'aria-label': alt, style: `--img-desktop:url("${ctx.abs(imgBase)}.thumb.1280.1280.jpg");--img-mobile:url("${ctx.abs(imgBase)}.thumb.768.768.jpg")` });
      // mobile card (rendered inside the photo on the live mobile DOM)
      const mcard = ctx.el('div', { class: 'vnav__mcard' }, [ctx.el('div', { class: 'vnav__mcard-content' }, [ctx.el('div', { class: 'vnav__mcard-header' }, [ctx.el('h3', { class: 'vnav__mtitle' }, [title]), chevron(ctx)]), ctx.el('p', { class: 'vnav__mtext' }, [text])])]);
      photo.append(mcard);
      const dcard = ctx.el('div', { class: 'vnav__dcard' }, [ctx.el('div', { class: 'vnav__dcard-content' }, [ctx.el('div', { class: 'vnav__dtext' }, [ctx.el('h3', { class: 'vnav__dtitle' }, [title]), ctx.el('p', { class: 'vnav__dlead' }, [text])]), ctx.el('div', { class: 'vnav__dicon' }, [chevron(ctx)])])]);
      link.append(photo, dcard); s.append(link);
    } else {
      const icon = node.querySelector('.nav--small__card__content__icon img');
      const link = ctx.el('a', { class: 'vnav__link vnav__link--small', href });
      const card = ctx.el('div', { class: 'vnav__scard' });
      if (icon) card.append(ctx.el('div', { class: 'vnav__sicon' }, [ctx.el('img', { src: ctx.abs(icon.getAttribute('src')), alt: icon.getAttribute('alt') || '', width: '44', height: '44' })]));
      card.append(ctx.el('div', { class: 'vnav__scontent' }, [ctx.el('div', { class: 'vnav__sheader' }, [ctx.el('h3', { class: 'vnav__stitle' }, [title]), chevron(ctx)]), ctx.el('p', { class: 'vnav__stext' }, [text])]));
      card.append(ctx.el('div', { class: 'vnav__sarrow' }, [chevron(ctx)]));
      link.append(card); s.append(link);
    }
    return s;
  },
  'shortcuts': (node, ctx) => {
    const s = ctx.el('section', { class: 'shortcuts' });
    const h = node.querySelector('h2'); if (h) s.append(ctx.el('div', { class: 'shortcuts__title' }, [ctx.cleanCopy(h)]));
    const ul = ctx.el('ul', { class: 'shortcuts__list' });
    for (const li of node.querySelectorAll('.shortcuts-list__item')) { const a = li.querySelector('a'); if (!a) continue; const lbl = ctx.el('span', { class: 'btn__label' }, [ctx.labelText(a.querySelector('.ffe-button__label')), ctx.svgOf(a.querySelector('svg'))]); ul.append(ctx.el('li', { class: 'shortcuts__item' }, [ctx.el('a', { class: 'btn btn--shortcut', href: ctx.abs(a.getAttribute('href')) }, [lbl])])); ul.append(ctx.O.createTextNode('\n')); }
    s.append(ul); return s;
  },
  // LOfavør co-branding: header (heading + expand button) visible; the client-rendered content is mirrored
  // as captured, collapsed (display:none) — dynamics #14 static-snapshot
  'cobranding': (node, ctx) => {
    const s = ctx.el('section', { class: 'cobranding' });
    const hdr = node.querySelector('.cobranding__header'); const h = hdr?.querySelector('.ffe-h4'); const btn = hdr?.querySelector('button');
    const head = ctx.el('div', { class: 'cobranding__header' });
    if (h) head.append(ctx.el('p', { class: 'cobranding__heading' }, [ctx.txt(h)]));
    if (btn) head.append(ctx.el('button', { type: 'button', class: 'btn btn--expand cobranding__toggle', 'aria-expanded': 'false', 'aria-controls': 'cobranding-content' }, [ctx.el('span', { class: 'btn__label' }, [ctx.labelText(btn.querySelector('.ffe-button__label'))]), ctx.svgOf(btn.querySelector('svg'))]));
    s.append(head);
    const content = node.querySelector('.cobranding__content');
    if (content) {
      const c = ctx.el('div', { class: 'cobranding__content', id: 'cobranding-content', style: 'display: none' });
      const bg = ctx.bgStyle(content); if (bg) c.setAttribute('style', 'display: none;' + bg);
      const logo = content.querySelector('.image-wrapper img'); if (logo) c.append(ctx.el('div', { class: 'cobranding__logo' }, [ctx.el('img', { src: ctx.abs(logo.getAttribute('data-lazy-src') || logo.getAttribute('src')), alt: logo.getAttribute('alt') || '' })]));
      const h2 = content.querySelector('h2'); if (h2) c.append(ctx.cleanCopy(h2));
      const cols = ctx.el('div', { class: 'cobranding__columns' });
      const col1 = ctx.el('div', { class: 'cobranding__col' }); for (const t of content.querySelectorAll('.cobranding__column .text')) col1.append(ctx.richtext(t)); for (const b of content.querySelectorAll('.cobranding__column .button')) { const bw = ctx.buttonWrapper(b); if (bw) col1.append(bw); }
      const col2 = ctx.el('div', { class: 'cobranding__col cobranding__col--2' }); const img2 = content.querySelector('.cobranding__column2--image img'); if (img2) col2.append(ctx.el('div', { class: 'cobranding__illustration' }, [ctx.el('img', { src: ctx.abs(img2.getAttribute('data-lazy-src') || img2.getAttribute('src')), alt: img2.getAttribute('alt') || '' })])); for (const t of content.querySelectorAll('.cobranding__column2 .text')) col2.append(ctx.richtext(t)); for (const b of content.querySelectorAll('.cobranding__column2 .button')) { const bw = ctx.buttonWrapper(b); if (bw) col2.append(bw); }
      cols.append(col1, col2); c.append(cols); s.append(c);
    }
    return s;
  },

  // related-products: on hub pages a `.card-list.card-list__small` of icon cards (86px icon column); elsewhere a newsfeed
  'related-products': (node, ctx) => {
    const s = ctx.el('section', { class: 'related-products', style: ctx.bgStyle(node.querySelector('.related-products--wrapper')) });
    const inner = ctx.el('div', { class: 'related-products__inner' });
    const h = node.querySelector('.title h2, h2'); if (h) inner.append(ctx.el('div', { class: 'related-products__title' }, [ctx.cleanCopy(h)]));
    const list = node.querySelector('.card-list');
    if (list) { const l = ctx.el('div', { class: 'card-list card-list--related' + (/card-list__small/.test(list.className) ? ' card-list--small' : '') }); for (const c of list.querySelectorAll(':scope > .card')) l.append(ctx.card(c, 'card--related')); inner.append(l); }
    else { const feed = ctx.el('div', { class: 'newsfeed' }); const track = ctx.el('div', { class: 'newsfeed__track' }); for (const c of node.querySelectorAll('.card')) track.append(ctx.card(c, 'card--news')); feed.append(track); inner.append(feed); }
    const btn = node.querySelector(':scope > div > .button, .related-products__wrap > .button'); if (btn) { const bw = ctx.buttonWrapper(btn, 'center'); if (bw) inner.append(bw); }
    s.append(inner); return s;
  },
  // tip: FFE message box (info) with a round icon overlapping the box
  'tip': (node, ctx) => {
    const box = node.querySelector('.ffe-message-box'); const kind = (box?.className.match(/ffe-message-box--(\w+)/) || [])[1] || 'info';
    const s = ctx.el('section', { class: 'tip' });
    const inner = ctx.el('div', { class: `tip__box tip__box--${kind} ${ctx.gridClasses(node.querySelector('.ffe-grid__row > div') || node)}` });
    const icon = box?.querySelector('.ffe-message-box__icon svg'); if (icon) inner.append(ctx.el('span', { class: 'tip__icon' }, [ctx.svgOf(icon)]));
    const body = ctx.el('div', { class: 'tip__content' });
    for (const ch of (box?.querySelector('.ffe-message-box__box') || node).children) { if (ch.classList.contains('button-list-container') || ch.classList.contains('button')) { const m = ctx.moduleOf(ch); if (m) body.append(m); } else body.append(ctx.cleanCopy(ch)); }
    inner.append(body); s.append(inner); return s;
  },
};
