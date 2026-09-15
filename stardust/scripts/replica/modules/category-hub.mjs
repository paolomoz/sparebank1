// category-hub.mjs — module handlers for the category-hub archetype family (privat/lan.html etc.).
// Values and structure lifted from the live DOM at 1440 and 360 (stardust/replica/lift/lan-*-detail.json + live probes).
// The visual-nav component is client-rendered per breakpoint on the live site (data-* driven): both the desktop
// card and the mobile card are authored here and toggled with CSS, so one DOM serves both gate widths.
import { existsSync, readFileSync } from 'node:fs';

const breadcrumb = (node, ctx) => {
  const a = node.querySelector('a.to-parent__link');
  return ctx.el('nav', { class: 'breadcrumb', 'aria-label': 'Tilbake' }, [ctx.el('a', { class: 'breadcrumb__link', href: ctx.abs(a.getAttribute('href')) }, [ctx.svgOf(a.querySelector('svg')), ctx.txt(a)])]);
};
const chevron = (ctx) => ctx.el('img', { src: 'assets/chevron.svg', class: 'vnav__chevron', alt: '', 'aria-hidden': 'true', width: '24', height: '24' });


// ---------------------------------------------------------------- W6 helpers (hub family only; canon reproductions are byte-for-byte author.mjs cases)
const isHubFamily = (ctx) => ctx.family === 'category-hub';
const IGNORE = ['parbase', 'reference', 'responsive-grid', 'color-fillable', 'aem-GridColumn', 'section'];
const keyOf = (node) => (node.getAttribute('class') || '').split(/\s+/).find((c) => c && !IGNORE.includes(c)) || '';
/** Hub child dispatch: the module kinds canon (or a colliding family file) mis-handles go to the hub builders; everything else → ctx.moduleOf. */
function hubModuleOf(ch, ctx) {
  const cl = ch.classList;
  if (cl.contains('card')) return hubCard(ch, ctx);
  if (cl.contains('progressive-disclosure')) return hubDisclosure(ch, ctx);
  if (cl.contains('section') && ch.querySelector(':scope > .section__wrapper')) return hubTabs(ch, ctx);
  if (cl.contains('base-component')) return hubWidget(ch, ctx);
  if (cl.contains('related-topics') || cl.contains('related-products')) return hubRelated(ch, ctx, cl.contains('related-topics') ? 'related-topics' : 'related-products');
  if (cl.contains('text')) return hubText(ch, ctx);
  if (cl.contains('image')) { const m = ctx.moduleOf(ch); const h = /height:\s*(\d+)px/.exec(ch.querySelector('img')?.getAttribute('style') || ''); if (m && h && m.setAttribute) m.setAttribute('style', [(m.getAttribute('style') || ''), `--h:${h[1]}px`].filter(Boolean).join(';')); return m; } // authored fixed image height (live img style) → --h
  return ctx.moduleOf(ch);
}
/** canon card() + the body canon drops: the featured/text-wrapper richtext (h2/h3, paragraphs, links), the CTA button(s), the publication date; contain-fit media flag. */
function hubCard(node, ctx, variant) {
  const { el, txt } = ctx; const cont = node.querySelector('.card__container') || node;
  const c = ctx.card(node, variant); const content = c.querySelector('.card__content'); const body = c.querySelector('.card__body');
  const imgWrap = cont.querySelector('.card__container-image'); const media = c.querySelector('.card__media');
  if (imgWrap && media && /--contain/.test(imgWrap.className)) media.classList.add('card__media--contain');
  const inner = cont.querySelector('.card__container-content');
  if (inner && content) for (const ch of inner.children) {
    const kids = ch.classList.contains('card__container-content-wrapper') ? [...ch.children] : [ch];
    for (const k of kids) {
      if (k.classList.contains('card__title') || k.classList.contains('ffe-card-body__text') || k.classList.contains('card__tag') || k.classList.contains('card__container-content-arrow')) continue;
      if (k.classList.contains('card__date')) { const t = c.querySelector('.card__title'); const d = el('span', { class: 'card__date' }, [txt(k)]); if (t) t.after(d); else content.append(d); continue; }
      const m = hubModuleOf(k, ctx); if (m) content.append(m);
    }
  }
  return c;
}
/** canon richtext + the lead/subtle span classes cleanCopy drops (main-lead 24/32, sub-lead 18/28, subtle-text 14/20) and the authored max-width. */
function hubText(node, ctx) {
  const { richtext, txt } = ctx; const w = richtext(node, node.classList.contains('prices__bottom-info') ? 'prices__bottom' : '');
  const tw = node.querySelector('.text-wrapper') || node;
  const mw = (tw.getAttribute('style') || '').match(/max-width:\s*(\d+(?:\.\d+)?)px/); if (mw) { w.setAttribute('class', w.getAttribute('class') + ' richtext--max'); w.setAttribute('style', `--max:${mw[1]}px`); }
  const dst = [...w.querySelectorAll('span')];
  for (const sp of node.querySelectorAll('span')) { const keep = ['main-lead', 'sub-lead', 'sub-lead-left', 'subtle-text'].filter((k) => sp.classList.contains(k)); if (!keep.length) continue; const t = txt(sp); const d = dst.find((x) => !x.getAttribute('class') && txt(x) === t); if (d) d.setAttribute('class', keep.join(' ')); }
  return w;
}
/** progressive-disclosure: expand pill (or inline text button) + the collapsed content — same shape as the product family's section.disclosure. */
function hubDisclosure(node, ctx) {
  const { el } = ctx; const btn = node.querySelector('.progressive-disclosure__btn, .progressive-disclosure__inline-btn, .js-toggle-btn');
  const align = /align-left/.test(node.innerHTML) ? 'left' : 'center'; const inlineBtn = !!node.querySelector('.progressive-disclosure__inline-btn');
  const content = node.querySelector(':scope > .content, .content'); const id = `w6-disclosure-${++w6Ids}`;
  const s = el('section', { class: `disclosure disclosure--${align}${inlineBtn ? ' disclosure--inline' : ''}` });
  const b = el('button', { type: 'button', class: `btn ${inlineBtn ? 'btn--inline' : 'btn--expand'} disclosure__btn`, 'aria-expanded': 'false', 'aria-controls': id }, [el('span', { class: 'btn__label' }, [ctx.labelText(btn?.querySelector('.ffe-button__label, .ffe-inline-button__label') || btn)])]);
  s.append(el('div', { class: 'disclosure__toggle' }, [b]));
  const bg = ctx.bgStyle(content); const box = el('div', { class: 'disclosure__content' + (content?.classList.contains('bg-default') ? ' disclosure__content--box' : ''), style: bg });
  const innerWrap = el('div', { class: 'disclosure__inner' });
  for (const ch of (content?.querySelector(':scope > .aem-main-container') || content || node).children) { if (ch === btn || ch.contains(btn)) continue; const m = hubModuleOf(ch, ctx); if (m) innerWrap.append(m); }
  box.append(innerWrap); s.append(el('div', { class: 'disclosure__panel', id, role: 'region', hidden: true }, [box])); return s;
}
/** AEM "section" item list (lofavor tabs): one item per section-item — button (title) + content; item 1 active at rest (live desktop master/detail). */
function hubTabs(node, ctx) {
  const { el, txt } = ctx; const s = el('section', { class: 'seclist seclist--hub', style: ctx.bgStyle(node.querySelector('.section__wrapper')) });
  const body = el('div', { class: 'seclist__body' }); const list = el('div', { class: 'seclist__list' }); const detail = el('div', { class: 'seclist__detail' }); let active = null;
  for (const item of node.querySelectorAll('.section-item__wrapper')) {
    const btn = item.querySelector('.section-item__button'); const isActive = item.classList.contains('section-item__wrapper--active'); const id = `w6-seclist-${++w6Ids}`;
    const it = el('div', { class: 'seclist__item' + (isActive ? ' seclist__item--active' : '') });
    it.append(el('button', { type: 'button', class: 'seclist__btn', 'aria-expanded': String(isActive), 'aria-controls': id }, [el('span', { class: 'seclist__text' }, [txt(btn?.querySelector('.section-item__text')) || txt(btn)]), el('span', { class: 'seclist__icon' })]));
    const content = el('div', { class: 'seclist__content', id }); for (const ch of (item.querySelector('.section-item__content')?.children || [])) { const m = hubModuleOf(ch, ctx); if (m) content.append(m); }
    it.append(content); list.append(it); if (isActive) active = content;
  }
  if (active) for (const ch of active.children) detail.append(ch.cloneNode(true));
  body.append(list, detail); s.append(body); return s;
}
/** base-component (client-rendered widget: pension / savings calculator): the captured hydrated snapshot (data/calculator/<name>.html) in a shadow root — dynamics interim, ONE live capture. */
function hubWidget(node, ctx) {
  const { el } = ctx; const name = /pensjonskalkulator/.test(node.innerHTML) ? 'pensjon' : /sparekalkulator/.test(node.innerHTML) ? 'sparing' : null;
  const file = name && `data/calculator/${name}.html`;
  if (!file || !existsSync(file)) { ctx.log.notes.push(`base-component: no widget snapshot for ${name || 'unknown app'} — emitted as richtext`); const rt = ctx.richtext(node); return ctx.txt(rt) ? el('section', { class: 'module module--base-component' }, [rt]) : null; }
  const host = el('div', { class: 'calculator__host' }); const tpl = ctx.O.createElement('template'); tpl.setAttribute('shadowrootmode', 'open'); tpl.innerHTML = readFileSync(file, 'utf8'); host.append(tpl);
  ctx.log.notes.push(`base-component ${name}: static snapshot of the hydrated live widget (dynamics interim) — data/calculator/${name}.html`);
  return el('section', { class: `calculator calculator--${name}`, 'data-widget': name }, [host]);
}
/** related-topics / related-products inside a hub band: canon markup with hub cards (dates, bodies). */
function hubRelated(node, ctx, k) {
  const { el, bgStyle, cleanCopy, buttonWrapper } = ctx;
  const s = el('section', { class: k, style: bgStyle(node.querySelector(':scope > div')) }); const inner = el('div', { class: k + '__inner' });
  const h = node.querySelector('.title h2, h2'); if (h) inner.append(el('div', { class: k + '__title' }, [cleanCopy(h)]));
  const list = node.querySelector('.card-list');
  if (list && k === 'related-products') { const l = el('div', { class: 'card-list card-list--related' + (/card-list__small/.test(list.className) ? ' card-list--small' : '') }); for (const c of list.querySelectorAll(':scope > .card')) l.append(hubCard(c, ctx, 'card--related')); inner.append(l); }
  else { const feed = el('div', { class: 'newsfeed' }); const track = el('div', { class: 'newsfeed__track' }); for (const c of node.querySelectorAll('.card')) track.append(hubCard(c, ctx, 'card--news')); feed.append(track); inner.append(feed); }
  const btn = node.querySelector(':scope .button'); if (btn && !node.querySelector('.card .button')) { const bw = buttonWrapper(btn, 'center'); if (bw) inner.append(bw); }
  s.append(inner); return s;
}
let w6Ids = 0;
// canon reproductions (author.mjs moduleOf cases) for non-hub families
function canonColumnsGrid(node, ctx) {
  const { el, gridClasses, bgStyle, cleanCopy, moduleOf } = ctx;
  const wrap = node.querySelector(':scope > .columns-grid__wrap'); const g = el('div', { class: 'cols', style: bgStyle(wrap) });
  for (const row of node.querySelectorAll(':scope > .columns-grid__wrap > .ffe-grid > .ffe-grid__row')) { const r = el('div', { class: 'grid-row' + ((row.className.match(/columns-grid__row--col-(\d+)/) || [])[1] ? ' grid-row--cols-' + row.className.match(/columns-grid__row--col-(\d+)/)[1] : '') }); for (const col of row.querySelectorAll(':scope > .columns-grid__column')) { const cont = col.querySelector(':scope > .columns-grid__content'); const align = (cont?.className.match(/columns-grid__content--(start|middle|center|bottom|height-auto)/) || [])[1] || 'start'; const c = el('div', { class: `col ${gridClasses(col)} col--${align}` }); const inner = el('div', { class: 'col__content' }); for (const ch of (cont || col).children) { const m = ch.tagName === 'H2' || ch.tagName === 'H3' || ch.tagName === 'H1' || ch.tagName === 'P' ? cleanCopy(ch) : moduleOf(ch); if (m) inner.append(m); } c.append(inner); r.append(c); } g.append(r); }
  return g;
}
function canonCardList(node, ctx, k) {
  const { el, bgStyle, cleanCopy } = ctx; const hub = isHubFamily(ctx);
  const s = el('section', { class: k, style: bgStyle(node.querySelector(':scope > div')) }); const h = node.querySelector('h2'); if (h) s.append(el('div', { class: k + '__title' }, [cleanCopy(h)]));
  if (hub) for (const t of node.querySelectorAll(':scope > div > .text')) { if (t.contains(h)) continue; const rt = hubText(t, ctx); if (ctx.txt(rt)) s.append(el('div', { class: k + '__intro' }, [rt])); } // the live intro paragraph under the title (canon drops it)
  const list = el('div', { class: 'card-list card-list--' + k }); for (const c of node.querySelectorAll('.card')) list.append(hub ? hubCard(c, ctx) : ctx.card(c)); s.append(list); return s;
}
function canonUnknown(node, ctx, k) { ctx.log.unknownModules.push(k); const s = ctx.el('section', { class: `module module--${k}` }); const rt = ctx.richtext(node); if (ctx.txt(rt)) s.append(rt); return s; }

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
    if (type === 'medium' || type === 'big') { // big (eiendom): same photo + card geometry as medium at ≥768; title h3.ffe-h2 36/44 (W6 live dump 2026-09-15)
      const bgDiv = node.querySelector('.nav--med__background, .nav--big');
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

  // ---------------------------------------------------------------- W6 (2026-09-15): category-hub sibling content that canon drops
  // The registry is global and later files win the same key (product: progressive-disclosure/base-component/text/image; theme: card/text/referance;
  // market-landing: image/related-topics), so the hub intercepts its children from the container handlers it owns (columns-grid, background-container,
  // static-cards) via hubModuleOf(); every handler returns canon's exact output for other families.
  'columns-grid': (node, ctx) => {
    if (!isHubFamily(ctx)) return canonColumnsGrid(node, ctx);
    const { el, gridClasses, bgStyle, cleanCopy } = ctx;
    const wrap = node.querySelector(':scope > .columns-grid__wrap'); const g = el('div', { class: 'cols', style: bgStyle(wrap) });
    for (const row of node.querySelectorAll(':scope > .columns-grid__wrap > .ffe-grid > .ffe-grid__row')) {
      const r = el('div', { class: 'grid-row' + ((row.className.match(/columns-grid__row--col-(\d+)/) || [])[1] ? ' grid-row--cols-' + row.className.match(/columns-grid__row--col-(\d+)/)[1] : '') });
      for (const col of row.querySelectorAll(':scope > .columns-grid__column')) {
        const cont = col.querySelector(':scope > .columns-grid__content'); const align = (cont?.className.match(/columns-grid__content--(start|middle|center|bottom|height-auto)/) || [])[1] || 'start';
        const c = el('div', { class: `col ${gridClasses(col)} col--${align}` }); const inner = el('div', { class: 'col__content' });
        for (const ch of (cont || col).children) { const m = /^H[1-3]$|^P$/.test(ch.tagName) ? cleanCopy(ch) : hubModuleOf(ch, ctx); if (m) inner.append(m); }
        c.append(inner); r.append(c);
      }
      g.append(r);
    }
    return g;
  },
  'background-container': (node, ctx) => {
    const { el, bgStyle } = ctx;
    const wrap = node.querySelector(':scope > .background-container__wrap'); const s = el('section', { class: 'band', style: bgStyle(wrap) }); const content = el('div', { class: 'band__content' });
    for (const ch of (wrap?.querySelector(':scope > .background-container__content') || wrap || node).children) { const m = isHubFamily(ctx) ? hubModuleOf(ch, ctx) : ctx.moduleOf(ch); if (m) content.append(m); }
    s.append(content); return s;
  },
  // static-cards / card-list: canon + (hub) the intro paragraph under the title and the full card bodies
  'static-cards': (node, ctx) => canonCardList(node, ctx, 'static-cards'),
  'card-list': (node, ctx) => canonCardList(node, ctx, 'card-list'),
  // text-and-image (tips-og-rad LOfavør box): text column (h2, p, CTA) + media column (partner logo, illustration) — canon knows no such module (unknown → richtext)
  'text-and-image': (node, ctx) => {
    if (!isHubFamily(ctx)) return canonUnknown(node, ctx, 'text-and-image');
    const { el, bgStyle, gridClasses } = ctx;
    const wrap = node.querySelector('.text-and-image__wrap'); const s = el('section', { class: 'text-and-image', style: bgStyle(wrap) });
    const row = el('div', { class: 'grid-row grid-row--cols-12' });
    for (const col of node.querySelectorAll('.ffe-grid__row > .columns-grid__column')) {
      const c = el('div', { class: `col ${gridClasses(col)} col--${/grid-media/.test(col.className) ? 'start' : 'middle'}` }); const inner = el('div', { class: 'col__content' });
      for (const ch of (col.querySelector(':scope > .columns-grid__content') || col).children) { const m = hubModuleOf(ch, ctx); if (m) inner.append(m); }
      c.append(inner); row.append(c);
    }
    s.append(row); return s;
  },
  // brand-logo (lofavor hero): the partner logo under the photo, linked
  'brand-logo': (node, ctx) => {
    if (!isHubFamily(ctx)) return canonUnknown(node, ctx, 'brand-logo');
    const { el, abs } = ctx; const img = node.querySelector('img'); if (!img) return null; const a = node.querySelector('a');
    const im = el('img', { src: abs(img.getAttribute('data-lazy-largesrc') || img.getAttribute('data-lazy-src') || img.getAttribute('src')), alt: img.getAttribute('alt') || '' });
    return el('div', { class: 'image image--brand-logo' }, [a ? el('a', { href: abs(a.getAttribute('href')) }, [im]) : im]);
  },
  'related-products': (node, ctx) => {
    const s = ctx.el('section', { class: 'related-products', style: ctx.bgStyle(node.querySelector('.related-products--wrapper')) });
    const inner = ctx.el('div', { class: 'related-products__inner' });
    const h = node.querySelector('.title h2, h2'); if (h) inner.append(ctx.el('div', { class: 'related-products__title' }, [ctx.cleanCopy(h)]));
    const list = node.querySelector('.card-list');
    const mk = (c, v) => (isHubFamily(ctx) ? hubCard(c, ctx, v) : ctx.card(c, v));
    if (list) { const l = ctx.el('div', { class: 'card-list card-list--related' + (/card-list__small/.test(list.className) ? ' card-list--small' : '') }); for (const c of list.querySelectorAll(':scope > .card')) l.append(mk(c, 'card--related')); inner.append(l); }
    else { const feed = ctx.el('div', { class: 'newsfeed' }); const track = ctx.el('div', { class: 'newsfeed__track' }); for (const c of node.querySelectorAll('.card')) track.append(mk(c, 'card--news')); feed.append(track); inner.append(feed); }
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
