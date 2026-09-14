// modules/product.mjs — product family SIBLING modules (the boliglan archetype is covered by author.mjs + product.css).
// Registry keys = the live AEM component class. Values lifted from live (stardust/replica/lift/_w3-{pt,gc,bio,pd,st}-{1440,360}.json)
// and the authored rules (stardust/replica/lift/_w3-css-*.txt). Client-rendered widgets (guide-carousel, step-by-step,
// progressive-disclosure, comparison) are static snapshots of the settled DOM; behaviour in stardust/prototypes/js/product.js.
//   price-and-terms       → section.price-terms   (title · [price figure] · check list · overlay link · sub text)
//   progressive-disclosure→ section.disclosure     (expand pill + collapsed content box)
//   step-by-step          → section.steps          (sand band · numbered master list · detail panel)
//   accordion             → section.accordion-module (h3 · sub-lead · canon accordion items)
//   guide-carousel        → section.gcarousel      (tinted band · 1 of N · active slide · prev/next)
//   contentfragmentlist   → section.experts        (bio cards, 2-up ≥1280)
//   comparison            → div.comparison         (coverage table inside a FAQ answer, verbatim table + mobile filter tabs)
//   columns / base-component → null (empty live placeholders: spare-i-fond `.columns`, forbrukslan's unhydrated credit-calculator host)
import marketLanding from './market-landing.mjs';

const FAMILY = 'product';
const ICON_KEEP = /^(comparison|ffe-table|visually-hidden)/;
let uid = 0; const nextId = (p) => `${p}-${++uid}`;

/** copy a live subtree like ctx.cleanCopy but keep the classes matching `keep` (the comparison table needs its own class contract) */
function copyKeeping(node, ctx, keep) {
  const out = ctx.cleanCopy(node); if (!out || node.nodeType !== 1) return out;
  const walk = (src, dst) => {
    if (!src || !dst || src.nodeType !== 1 || dst.nodeType !== 1 || src.tagName.toLowerCase() === 'svg') return;
    const cls = (src.getAttribute('class') || '').split(/\s+/).filter((c) => keep.test(c));
    if (cls.length) dst.setAttribute('class', [...new Set([...(dst.getAttribute('class') || '').split(/\s+/).filter(Boolean), ...cls])].join(' '));
    if (src.hasAttribute('id')) dst.setAttribute('id', src.getAttribute('id'));
    const se = [...src.childNodes].filter((n) => n.nodeType === 1 && !['script', 'style', 'link', 'noscript', 'template', 'iframe'].includes(n.tagName.toLowerCase()));
    const de = [...dst.childNodes].filter((n) => n.nodeType === 1);
    se.forEach((s, i) => walk(s, de[i]));
  };
  walk(node, out); return out;
}

/** canon accordion items (same vocabulary as author.mjs `faq`, so canon.js toggles them) from live .ffe-accordion-item nodes */
function accordionItems(items, ctx) {
  const { el, txt, svgOf } = ctx; const acc = el('div', { class: 'accordion' });
  for (const item of items) {
    const btn = item.querySelector('.ffe-accordion-item__heading-button'); const id = nextId('acc');
    const it = el('div', { class: 'accordion__item' });
    const b = el('button', { type: 'button', class: 'accordion__button', 'aria-expanded': 'false', 'aria-controls': `${id}-p`, id: `${id}-b` });
    const content = btn?.querySelector('.ffe-accordion-item__heading-button-content');
    b.append(el('span', { class: 'accordion__label' }, [txt([...(content?.childNodes || [])].find((n) => n.nodeType === 3)) || txt(btn)]), el('span', { class: 'accordion__icon' }, [svgOf(btn?.querySelector('svg'))]));
    it.append(el('h3', { class: 'accordion__heading' }, [b]));
    const body = el('div', { class: 'accordion__body' });
    for (const ch of (item.querySelector('.ffe-accordion-item__body') || item.querySelector('[role=region]') || item).children) { const m = ctx.moduleOf(ch); if (m) body.append(m); }
    it.append(el('div', { class: 'accordion__panel', id: `${id}-p`, role: 'region', 'aria-labelledby': `${id}-b` }, [body])); acc.append(it);
  }
  return acc;
}

const richFrom = (ctx, wrapper, cls) => { const rt = ctx.richtext(wrapper, cls); return ctx.txt(rt) || rt.querySelector('img,picture') ? rt : null; };

export default {
  // price-and-terms — centred module (768 wrapper): h2 · optional price figure (before / number / after) + check list · overlay link · footnote
  'price-and-terms': (node, ctx) => {
    const { el, txt, cleanCopy, abs } = ctx;
    const root = node.querySelector(':scope > [class*="price-and-terms--"]') || node;
    const bg = ctx.bgStyle(root);
    const prev = node.previousElementSibling; const afterPlain = prev && !prev.classList.contains('color-fillable') && node.parentElement?.tagName === 'MAIN';
    const s = el('section', { class: 'price-terms' + (bg ? ' price-terms--tinted' : '') + (afterPlain ? ' price-terms--after-plain' : ''), style: bg, id: root.getAttribute('id') });
    const inner = el('div', { class: 'price-terms__inner' });
    const h = node.querySelector('.price-and-terms__title h1, .price-and-terms__title h2, .price-and-terms__title h3'); if (h) { const hh = cleanCopy(h); hh.setAttribute('class', 'price-terms__title'); inner.append(hh); }
    const wrap = node.querySelector('.price-and-terms__wrap-price-and-terms, .price-and-terms__wrap-terms, .price-and-terms__wrap-price');
    if (wrap) {
      const price = wrap.querySelector('.price-and-terms__price'); const terms = wrap.querySelector('.price-and-terms__terms');
      const grid = el('div', { class: 'price-terms__grid' + (price ? ' price-terms__grid--with-price' : '') + (price && !terms ? ' price-terms__grid--price-only' : '') });
      if (price) {
        const size = (price.className.match(/price-and-terms--price-(small|medium|large)/) || [])[1] || 'medium';
        const p = el('div', { class: `price-terms__price price-terms__price--${size}` });
        for (const ch of price.childNodes) { // spans + the whitespace between them (live renders "Eff. rente 16,6 %")
          if (ch.nodeType === 3) { if (/\s/.test(ch.data)) p.append(ctx.O.createTextNode(' ')); continue; }
          if (ch.nodeType !== 1) continue; const k = (ch.className.match(/price-and-terms__(before|number|after)-text/) || [])[1]; if (k) p.append(el('span', { class: `price-terms__${k}` }, [txt(ch)]));
        }
        grid.append(p);
      }
      if (terms) { const ul = el('ul', { class: 'price-terms__terms' }); for (const li of terms.querySelectorAll(':scope > li')) { const l = el('li', { class: 'price-terms__term' }); for (const ch of li.childNodes) { const cc = cleanCopy(ch); if (cc) l.append(cc); } ul.append(l); } grid.append(el('div', { class: 'price-terms__item' }, [ul])); }
      inner.append(grid);
    }
    const link = node.querySelector('.price-and-terms__list-link a');
    if (link) { const a = el('a', { class: 'price-terms__link', href: abs(link.getAttribute('href')) }); for (const ch of link.childNodes) { if (ch.nodeType === 1 && ch.classList.contains('price-and-terms__link-title')) a.append(el('span', { class: 'price-terms__link-title' }, [txt(ch)])); else { const cc = cleanCopy(ch); if (cc) a.append(cc); } } inner.append(el('div', { class: 'price-terms__cta' }, [el('div', { class: 'button-wrap' }, [a])])); }
    // the `.bank-choice-overlay` dialog the link opens is client-rendered and empty in the settled DOM (dynamics interim) — not reproduced
    const sub = node.querySelector('.price-and-terms__sub-text'); if (sub) inner.append(ctx.richtext(sub, 'price-terms__sub'));
    s.append(inner); return s;
  },

  // progressive-disclosure — "Les mer / Vilkår" expand pill; the content box (sand by default, inline colour wins) is collapsed at rest
  'progressive-disclosure': (node, ctx) => {
    const { el, svgOf } = ctx; const id = nextId('disclosure');
    const btn = node.querySelector('.progressive-disclosure__btn, .js-toggle-btn'); const align = /align-left/.test(node.innerHTML) ? 'left' : 'center';
    const content = node.querySelector(':scope > .content, .content');
    const prev = node.previousElementSibling; const afterText = prev && prev.classList.contains('text');
    const s = el('section', { class: `disclosure disclosure--${align}` + (afterText ? ' disclosure--after-text' : '') });
    const b = el('button', { type: 'button', class: 'btn btn--expand disclosure__btn', 'aria-expanded': 'false', 'aria-controls': id }, [el('span', { class: 'btn__label' }, [ctx.labelText(btn?.querySelector('.ffe-button__label') || btn)])]);
    s.append(el('div', { class: 'disclosure__toggle' }, [b]));
    const bg = ctx.bgStyle(content); const box = el('div', { class: 'disclosure__content' + (content?.classList.contains('bg-default') ? ' disclosure__content--box' : ''), style: bg });
    const innerWrap = el('div', { class: 'disclosure__inner' });
    for (const ch of (content?.querySelector(':scope > .aem-main-container') || content || node).children) { if (ch === btn || ch.contains(btn)) continue; const m = ctx.moduleOf(ch); if (m) innerWrap.append(m); }
    box.append(innerWrap); s.append(el('div', { class: 'disclosure__panel', id, role: 'region', hidden: true }, [box])); return s;
  },

  // step-by-step — tinted band: h2 (offset 1) · master list of numbered steps (lg-4) · detail panel (lg-6); step 1 active at rest
  'step-by-step': (node, ctx) => {
    const { el, txt, abs, svgOf, gridClasses, cleanCopy } = ctx;
    const wrap = node.querySelector('.step__wrap'); const tint = (wrap?.className.match(/step__wrap-(\w+)/) || [])[1] || 'sand';
    const s = el('section', { class: `steps steps--${tint}` });
    const rows = [...node.querySelectorAll('.ffe-grid > .ffe-grid__row')];
    const hdrCol = rows[0]?.querySelector('.columns-grid__column'); const h = node.querySelector('.step__header h1, .step__header h2, .step__header h3');
    if (h) { const hh = cleanCopy(h); hh.setAttribute('class', 'steps__title'); s.append(el('div', { class: 'grid-row steps__row' }, [el('div', { class: `col ${gridClasses(hdrCol || node)}` }, [el('header', { class: 'steps__header' }, [hh])])])); }
    const body = rows[1] || rows[0]; const cols = [...(body?.querySelectorAll(':scope > .columns-grid__column') || [])];
    const row = el('div', { class: 'grid-row steps__row steps__row--body' });
    const listCol = el('div', { class: `col ${gridClasses(cols[0] || node)}` }); const list = el('div', { class: 'steps__list' });
    let activeContent = null;
    for (const item of node.querySelectorAll('.step-item__wrapper')) {
      const choice = item.querySelector('.step-item__choice'); const active = choice?.classList.contains('step-item__choice--active'); const id = nextId('step');
      const it = el('div', { class: 'steps__item' + (active ? ' steps__item--active' : '') });
      const a = choice?.querySelector('.step__title a');
      const head = el('div', { class: 'steps__choice', 'aria-expanded': String(!!active), id, 'aria-controls': `${id}-c` });
      head.append(el('div', { class: 'steps__number' }, [el('span', {}, [txt(choice?.querySelector('.step__number'))])]));
      head.append(el('div', { class: 'steps__step-title' }, [a ? el('a', { class: 'steps__link', href: abs(a.getAttribute('href')) }, [txt(a)]) : txt(choice?.querySelector('.step__title'))]));
      const icon = choice?.querySelector('.step-item__icon'); if (icon) head.append(el('div', { class: 'steps__icon' }, [svgOf(icon)]));
      it.append(head);
      const content = el('div', { class: 'steps__content', id: `${id}-c` });
      const info = item.querySelector('.step-item__content .step-item__content-info');
      for (const ch of (info?.children || [])) { const m = ctx.moduleOf(ch); if (m) content.append(m); }
      it.append(content); list.append(it);
      if (active) activeContent = item;
    }
    listCol.append(list); row.append(listCol);
    const infoLive = node.querySelector('.step__info'); const infoCol = el('div', { class: `col steps__info-col ${gridClasses(cols[1] || node)}` });
    const panel = el('div', { class: 'steps__info', id: infoLive?.getAttribute('id') || nextId('steps-info'), tabindex: '-1' });
    for (const ch of (infoLive?.querySelector('.step-item__content-info')?.children || [])) { const m = ctx.moduleOf(ch); if (m) panel.append(m); }
    // live moves the active step's content into the panel (its own slot is empty at capture): mirror by copying the panel back into the active item for mobile
    const activeItem = list.querySelector('.steps__item--active .steps__content'); if (activeItem && !activeItem.children.length) for (const ch of panel.children) activeItem.append(ch.cloneNode(true));
    infoCol.append(panel); row.append(infoCol); s.append(row); return s;
  },

  // accordion — the generic AEM accordion (not the FAQ): 768 container, h3 + sub-lead, canon accordion items
  accordion: (node, ctx) => {
    const { el, cleanCopy } = ctx; const s = el('section', { class: 'accordion-module' }); const inner = el('div', { class: 'accordion-module__inner' });
    const cont = node.querySelector('.accordion-container') || node;
    for (const ch of cont.children) {
      if (ch.classList.contains('ffe-accordion')) { inner.append(accordionItems([...ch.querySelectorAll(':scope > .ffe-accordion-item')], ctx)); continue; }
      const cc = cleanCopy(ch); if (!cc) continue; if (/ffe-sub-lead-paragraph/.test(ch.className)) cc.setAttribute('class', 'sub-lead'); inner.append(cc);
    }
    s.append(inner); return s;
  },

  // guide-carousel — tinted band, "1 av N" indicator, hidden tablist (slide names), one active tabpanel, prev/next secondary pills
  'guide-carousel': (node, ctx) => {
    const { el, txt, cleanCopy, svgOf } = ctx;
    const wrap = node.querySelector('.guide-carousel__wrap') || node; const tint = (wrap.className.match(/guide-carousel__(frost-30|sand-30|syrin-30|hvit)/) || [])[1] || 'hvit';
    const content = node.querySelector('.cmp-carousel__content'); const layout = (content?.className.match(/guide-carousel__layout(\d)/) || [])[1] || '1';
    const s = el('section', { class: `gcarousel gcarousel--${tint} gcarousel--layout${layout}`, role: 'group', 'aria-roledescription': 'karusell' });
    const c = el('div', { class: 'gcarousel__content' });
    const h = content?.querySelector('.guide-carousel__title'); if (h) { const hh = cleanCopy(h); hh.setAttribute('class', 'gcarousel__title'); c.append(hh); }
    const ind = content?.querySelector('.guide__indicators'); if (ind) { const p = el('p', { class: 'gcarousel__indicators' }); for (const ch of ind.childNodes) { if (ch.nodeType === 1) p.append(el('span', { class: 'gcarousel__index' }, [txt(ch)])); else if (ch.nodeType === 3) p.append(ctx.O.createTextNode(ch.data)); } c.append(p); }
    const tabs = content?.querySelector('.cmp-carousel__indicators'); if (tabs) { const ul = el('ul', { class: 'visually-hidden gcarousel__tabs', role: 'tablist', 'aria-label': tabs.getAttribute('aria-label') }); for (const li of tabs.querySelectorAll(':scope > li')) ul.append(el('li', { role: 'tab', 'aria-selected': String(li.classList.contains('cmp-carousel__indicator--active')) }, [txt(li)])); c.append(ul); }
    const items = [...(content?.querySelectorAll(':scope > .cmp-carousel__item') || [])];
    items.forEach((item, i) => {
      const it = el('div', { class: 'gcarousel__item' + (item.classList.contains('cmp-carousel__item--active') ? ' gcarousel__item--active' : ''), role: 'tabpanel', 'aria-label': item.getAttribute('aria-label') || `Slide ${i + 1} of ${items.length}` });
      const teaser = el('div', { class: 'gcarousel__teaser' });
      const imgWrap = item.querySelector('.cmp-teaser__image'); const pic = imgWrap && ctx.picture(imgWrap, 'gcarousel__img'); if (pic) teaser.append(el('div', { class: 'gcarousel__image' }, [pic]));
      const text = el('div', { class: 'gcarousel__text' });
      const t = item.querySelector('.cmp-teaser__title'); if (t) { const tt = cleanCopy(t); tt.setAttribute('class', 'gcarousel__heading'); text.append(tt); }
      const d = item.querySelector('.cmp-teaser__description'); if (d) text.append(ctx.richtext(d, 'gcarousel__desc'));
      teaser.append(text); it.append(teaser); c.append(it);
    });
    const actions = content?.querySelector('.cmp-carousel__actions');
    if (actions) { const act = el('div', { class: 'gcarousel__actions' }); const mk = (b, kind) => { if (!b) return; act.append(el('button', { type: 'button', class: `btn btn--secondary gcarousel__${kind}`, 'aria-label': b.getAttribute('aria-label') }, [el('span', { class: 'gcarousel__icon' }, [svgOf(b.querySelector('svg'))]), el('span', { class: 'visually-hidden' }, [txt(b.querySelector('.cmp-carousel__action-text')) || b.getAttribute('aria-label')])])); act.append(ctx.O.createTextNode(' ')); }; mk(actions.querySelector('.cmp-carousel__action--previous'), 'prev'); mk(actions.querySelector('.cmp-carousel__action--next'), 'next'); c.append(act); }
    s.append(c); return s;
  },

  // contentfragmentlist — the experts list (bio cards); an empty list (second instance on vare-eksperter) renders nothing on live
  contentfragmentlist: (node, ctx) => {
    const { el, txt, cleanCopy, abs } = ctx; const bios = [...node.querySelectorAll('.bio')]; if (!bios.length) { ctx.log.notes.push('contentfragmentlist: empty list on live — omitted'); return null; }
    const s = el('section', { class: 'experts', role: 'list' });
    for (const b of bios) {
      const card = el('div', { class: 'expert', role: 'listitem', 'aria-label': b.getAttribute('aria-label') });
      const img = b.querySelector('.bio__image img'); if (img) { const im = cleanCopy(img); im.setAttribute('class', 'expert__img'); card.append(el('div', { class: 'expert__image' }, [im])); }
      const text = el('div', { class: 'expert__text' });
      const name = b.querySelector('.bio__name'); if (name) text.append(el('h3', { class: 'expert__name' }, [...name.childNodes].map(cleanCopy).filter(Boolean)));
      const org = b.querySelector('.bio__org'); if (org) { const p = el('p', { class: 'expert__org' }); for (const ch of org.childNodes) { if (ch.nodeType === 1 && ch.classList.contains('bio__jobtitle')) p.append(el('span', { class: 'expert__role' }, [txt(ch)])); else { const cc = cleanCopy(ch); if (cc) p.append(cc); } } text.append(p); }
      for (const d of b.querySelectorAll('.bio__desc')) { const p = el('p', { class: 'expert__desc' }); for (const ch of d.childNodes) { const cc = cleanCopy(ch); if (cc) p.append(cc); } text.append(p); }
      const link = b.querySelector('.bio__link a'); if (link) { const row = el('div', { class: 'expert__link' }); const ic = b.querySelector('.bio__link-icon'); if (ic) row.append(el('img', { class: 'expert__link-icon', src: abs(ic.getAttribute('src')), alt: '', 'aria-hidden': 'true', width: '24', height: '24' })); row.append(el('a', { class: 'expert__cta', href: abs(link.getAttribute('href')) }, [txt(link)])); text.append(row); }
      card.append(text); s.append(card);
    }
    return s;
  },

  // comparison — coverage matrix (inside a FAQ answer on bilforsikring): mobile filter tabs + the verbatim ffe-table with expandable rows
  comparison: (node, ctx) => {
    const { el, txt } = ctx; const s = el('div', { class: 'comparison' });
    const filter = node.querySelector('.comparison__filter-container');
    if (filter) { const g = el('div', { class: 'comparison__filter', role: 'radiogroup' }); filter.querySelectorAll('button').forEach((b, i) => g.append(el('button', { type: 'button', role: 'radio', class: 'comparison__tab' + (/--selected/.test(b.className) ? ' comparison__tab--selected' : ''), 'aria-checked': String(/--selected/.test(b.className)), 'data-col': String(i + 1) }, [txt(b)]))); s.append(g); }
    const table = node.querySelector('table'); if (table) { const t = copyKeeping(table, ctx, ICON_KEEP); t.setAttribute('class', ((t.getAttribute('class') || '') + ' comparison__table').trim()); s.append(el('div', { class: 'comparison__scroll' }, [t])); }
    ctx.log.notes.push('comparison: static snapshot of the coverage table (expand buttons + mobile filter tabs wired in product.js)');
    return s;
  },

  // empty live placeholders — nothing to author
  columns: (node, ctx) => { if (node.children.length === 0 && !ctx.txt(node)) { ctx.log.notes.push('columns: empty live placeholder omitted'); return null; } return ctx.richtext(node); },
  'base-component': (node, ctx) => { const host = node.querySelector('.external-component > *'); ctx.log.notes.push(`base-component: external widget host${host ? ' #' + host.getAttribute('id') : ''} is empty in the settled DOM (client-rendered, not hydrated at capture) — omitted`); return null; },

  // image — delegate to market-landing's handler (the registry key is shared); product pages add the authored fixed height (`style="height:100px"`) as --h
  image: (node, ctx) => {
    const block = marketLanding.image(node, ctx); if (!block || ctx.family !== FAMILY) return block;
    const img = node.querySelector('img'); const h = (img?.getAttribute('style') || '').match(/height:\s*(\d+px)/);
    if (h && !/max-width/.test(img.getAttribute('style') || '')) block.setAttribute('style', ((block.getAttribute('style') || '') + `;--h:${h[1]}`).replace(/^;/, ''));
    return block;
  },
};
