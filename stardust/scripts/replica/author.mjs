#!/usr/bin/env node
/**
 * author.mjs — replica Phase 3: clean re-authoring of one captured page into a prototype.
 *
 * Reads the settled rendered-DOM sidecar (stardust/current/pages/<slug>.html) as the VERBATIM content
 * source (headings, body richtext, CTAs+hrefs, alt text, icons) and re-emits clean semantic markup with
 * the prototype's own class vocabulary (canon.css / <archetype>.css). AEM wrappers, inline styles,
 * tracking ids and framework classes are dropped; text nodes, inline markup (b/i/a/br/span) and the
 * AEM richtext byte patterns (<p><br></p> spacers) are kept as captured (granularity parity).
 *
 * usage: node stardust/scripts/replica/author.mjs <slug> [--out stardust/prototypes] [--css canon.css,product.css]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';
import { parseHTML } from 'linkedom';
import { readdirSync } from 'node:fs';
import { pathToFileURL } from 'node:url';

const argv = process.argv.slice(2); const slug = argv[0];
const opt = (k, d) => { const i = argv.indexOf(k); return i > 0 ? argv[i + 1] : d; };
const outDir = opt('--out', 'stardust/prototypes');
const types = JSON.parse(readFileSync('stardust/current/_page-types.json', 'utf8'));
const family = types.pages[slug]?.archetypeFamily || 'unknown';
const familyCss = existsSync(`${outDir}/css/${family}.css`) ? `css/${family}.css` : null;
const cssFiles = opt('--css', ['css/ffe-tokens.css', 'css/canon.css', familyCss].filter(Boolean).join(',')).split(',');
// module registry: stardust/scripts/replica/modules/*.mjs export default { '<aem-class>': (node, ctx) => Element, '__header'/'__footer' (chrome overrides for a variant) }
const registry = {};
const modDir = new URL('./modules/', import.meta.url);
for (const f of existsSync(modDir) ? readdirSync(modDir).filter(f => f.endsWith('.mjs')) : []) { const m = await import(pathToFileURL(path.join(modDir.pathname, f)).href); Object.assign(registry, m.default || {}); }
const ORIGIN = 'https://www.sparebank1.no';
const src = readFileSync(`stardust/current/pages/${slug}.html`, 'utf8');
const rec = JSON.parse(readFileSync(`stardust/current/pages/${slug}.json`, 'utf8'));
const { document: D } = parseHTML(src);
const variant = /nettsider-frontend/.test(src) ? 'frontend' : 'base';
const { document: O } = parseHTML('<!doctype html><html lang="nb"><head></head><body></body></html>');
const log = { unknownModules: [], dropped: [], notes: [] };

// ---------------------------------------------------------------- helpers
const abs = (u) => (!u ? u : u.startsWith('/') && !u.startsWith('//') ? ORIGIN + u : u);
const txt = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
const el = (tag, attrs = {}, children = []) => { const e = O.createElement(tag); for (const [k, v] of Object.entries(attrs)) if (v !== null && v !== undefined && v !== false) e.setAttribute(k, v === true ? '' : v); for (const c of children) if (c) e.append(typeof c === 'string' ? O.createTextNode(c) : c); return e; };
const svgOf = (node) => { if (!node) return null; const s = O.createElement('template'); s.innerHTML = node.outerHTML.replace(/\s(id|data-[a-z-]+)="[^"]*"/g, ''); return s.content.firstChild; };
const KEEP_ATTR = new Set(['href', 'src', 'srcset', 'sizes', 'media', 'alt', 'width', 'height', 'type', 'role', 'for', 'colspan', 'rowspan', 'title', 'target', 'rel', 'lang', 'dir', 'aria-label', 'aria-hidden', 'aria-expanded', 'aria-controls', 'aria-describedby', 'placeholder', 'name', 'value', 'start', 'datetime', 'loading', 'fetchpriority']);
const KEEP_CLASS = /^(lead-blue|subtle-text|subtle-text-white|h[1-6]|visually-hidden|ffe-h[1-6]|ffe-text-link|ffe-link-text|ffe-body-paragraph|ffe-lead-paragraph|ffe-small-text|ffe-micro-text|ffe-bullet-list|ffe-numbered-list|table-wrapper|checked-list|icon-list|arrow-right|arrow-down|arrow-up|inline-svg)$/;
/** copy a richtext fragment: verbatim text + inline markup, cleaned attributes, absolutised URLs, lazy → src */
function cleanCopy(node, depth = 0) {
  if (node.nodeType === 3) return O.createTextNode(node.data);
  if (node.nodeType !== 1) return null;
  const tag = node.tagName.toLowerCase();
  if (['script', 'style', 'link', 'noscript', 'template', 'iframe'].includes(tag)) { if (tag === 'iframe') log.dropped.push('iframe ' + node.getAttribute('src')); return null; }
  if (tag === 'svg') return svgOf(node);
  const out = O.createElement(tag);
  for (const a of node.attributes) {
    if (KEEP_ATTR.has(a.name)) out.setAttribute(a.name, ['href', 'src', 'srcset'].includes(a.name) ? (a.name === 'srcset' ? a.value.split(',').map(s => { const [u, d] = s.trim().split(/\s+/); return [abs(u), d].filter(Boolean).join(' '); }).join(', ') : abs(a.value)) : a.value);
  }
  if (node.hasAttribute('data-lazy-src') && !out.getAttribute('src')) out.setAttribute('src', abs(node.getAttribute('data-lazy-largesrc') || node.getAttribute('data-lazy-src')));
  const cls = (node.getAttribute('class') || '').split(/\s+/).filter(c => KEEP_CLASS.test(c));
  const st = node.getAttribute('style') || ''; const ta = st.match(/text-align:\s*(left|center|right)/); if (ta) cls.push('ta-' + ta[1]);
  if (cls.length) out.setAttribute('class', cls.join(' '));
  for (const c of node.childNodes) { const cc = cleanCopy(c, depth + 1); if (cc) out.append(cc); }
  return out;
}
const richtext = (wrapper, extraClass = '') => { const w = el('div', { class: ('richtext ' + extraClass).trim() }); const tw = wrapper.querySelector('.text-wrapper') || wrapper; for (const c of tw.childNodes) { const cc = cleanCopy(c); if (cc) w.append(cc); } return w; };
const gridClasses = (node) => (node.getAttribute('class') || '').split(/\s+/).filter(c => /^ffe-grid__col--/.test(c) || c === 'columns-grid__column--first').map(c => c === 'columns-grid__column--first' ? 'col--first' : c.replace('ffe-grid__col--', 'col-')).join(' ');
const bgStyle = (node) => { const m = (node?.getAttribute('style') || '').match(/background-color:\s*([^;]+)/i); return m && m[1].trim() && m[1].trim() !== 'transparent' ? `--band-bg:${m[1].trim()}` : null; };
const button = (aNode) => { if (!aNode) return null; const cls = aNode.getAttribute('class') || ''; const kind = /--action/.test(cls) ? 'action' : /--secondary/.test(cls) ? 'secondary' : /--expand/.test(cls) ? 'expand' : /--tertiary/.test(cls) ? 'tertiary' : /--shortcut/.test(cls) ? 'shortcut' : 'primary'; const tag = aNode.tagName.toLowerCase(); const b = el(tag, { class: `btn btn--${kind}`, href: tag === 'a' ? abs(aNode.getAttribute('href')) : null, type: tag === 'button' ? 'button' : null, 'aria-expanded': aNode.getAttribute('aria-expanded') }); const lbl = el('span', { class: 'btn__label' }); for (const c of (aNode.querySelector('.ffe-button__label') || aNode).childNodes) { const cc = cleanCopy(c); if (cc) lbl.append(cc); } b.append(lbl); return b; };
const labelText = (node) => [...(node?.childNodes || [])].filter(n => n.nodeType === 3).map(n => n.data).join('').replace(/\s+/g, ' ').trim() || txt(node);
const buttonWrapper = (node, align) => { const a = node.querySelector('a.ffe-button, button.ffe-button, a.ffe-inline-button, button.ffe-inline-button'); if (!a) return null; const al = align || (node.querySelector('.button-wrapper')?.className.match(/\b(left|center|right)\b/) || [])[1] || 'left'; return el('div', { class: `button-wrap button-wrap--${al}` }, [button(a)]); };
const picture = (node, cls) => { const pic = node.querySelector('picture'); const img = node.querySelector('img'); if (!img) return null; const im = cleanCopy(img); im.setAttribute('class', ['img', cls].filter(Boolean).join(' ')); if (!pic) return im; const p = el('picture'); for (const s of pic.querySelectorAll('source')) p.append(cleanCopy(s)); p.append(im); return p; };
const imageBlock = (node) => { const rounded = /image--all-rounded-small/.test(node.innerHTML) ? 'image--rounded' : ''; const ratio = node.querySelector('.image-ratio'); const ar = (ratio?.getAttribute('style') || '').match(/aspect-ratio:\s*auto\s*([\d.]+)\s*\/\s*([\d.]+)/); const wrap = el('div', { class: ('image ' + rounded).trim(), style: ar ? `--ratio:${ar[1]}/${ar[2]}` : null }); const p = picture(node, 'image__img'); if (p) wrap.append(p); return wrap; };

// ---------------------------------------------------------------- cards
function card(node, variant) {
  const cont = node.querySelector('.card__container') || node; const cls = cont.getAttribute('class') || '';
  const size = /--small/.test(cls) ? 'small' : /--featured/.test(cls) ? 'featured' : 'medium';
  const c = el('div', { class: `card card--${size}${/--clickable/.test(cls) ? ' card--clickable' : ''}${/--no-image/.test(cls) ? ' card--no-image' : ''}${variant ? ' ' + variant : ''}` });
  const imgWrap = cont.querySelector('.card__container-image'); const inlineImg = cont.querySelector('.card__container-content-wrapper .image-wrapper');
  if (imgWrap) { const p = picture(imgWrap, 'card__img'); if (p) c.append(el('div', { class: 'card__media' + (/--center/.test(imgWrap.className) ? ' card__media--center' : '') }, [p])); }
  const body = el('div', { class: 'card__body' }); const wrap = el('div', { class: 'card__content' });
  if (inlineImg) { const p = picture(inlineImg, 'card__icon'); if (p) wrap.append(el('div', { class: 'card__iconwrap' }, [p])); }
  const tag = cont.querySelector('.card__tag'); if (tag) wrap.append(el('span', { class: 'card__tag' }, [txt(tag)]));
  const title = cont.querySelector('.card__title'); if (title) { const a = el(title.tagName.toLowerCase(), { class: 'card__title', href: abs(title.getAttribute('href')) }); for (const ch of title.childNodes) { const cc = cleanCopy(ch); if (cc) a.append(cc); } wrap.append(a); }
  for (const p of cont.querySelectorAll('.ffe-card-body__text')) { const pp = el('p', { class: 'card__text' }); for (const ch of p.childNodes) { const cc = cleanCopy(ch); if (cc) pp.append(cc); } wrap.append(pp); }
  body.append(wrap);
  const arrow = cont.querySelector('.card__container-content-arrow svg'); if (arrow) body.append(el('div', { class: 'card__arrow' }, [svgOf(arrow)]));
  c.append(body); return c;
}

// ---------------------------------------------------------------- module dispatcher (main > * and nested)
function moduleOf(node) {
  const cls = (node.getAttribute('class') || '').split(/\s+/); const k = cls.find(c => !['parbase', 'reference', 'responsive-grid', 'color-fillable', 'aem-GridColumn', 'section'].includes(c)) || '';
  const tag = node.tagName.toLowerCase(); if (tag === 'header' || tag === 'footer' || tag === 'noscript' || tag === 'script') return null; // chrome is authored separately
  if (registry[k]) return registry[k](node, ctx);
  switch (k) {
    case 'aem-main-container': { const a = node.querySelector('a.to-parent__link'); if (a) return el('nav', { class: 'breadcrumb', 'aria-label': 'Tilbake' }, [el('a', { class: 'breadcrumb__link', href: abs(a.getAttribute('href')) }, [svgOf(a.querySelector('svg')), txt(a)])]); const inner = [...node.children].map(moduleOf).filter(Boolean); return inner.length ? el('div', { class: 'container' }, inner) : null; }
    case 'background-container': { const wrap = node.querySelector(':scope > .background-container__wrap'); const s = el('section', { class: 'band', style: bgStyle(wrap) }); const content = el('div', { class: 'band__content' }); for (const ch of (wrap?.querySelector(':scope > .background-container__content') || wrap || node).children) { const m = moduleOf(ch); if (m) content.append(m); } s.append(content); return s; }
    case 'columns-grid': { const wrap = node.querySelector(':scope > .columns-grid__wrap'); const g = el('div', { class: 'cols', style: bgStyle(wrap) }); for (const row of node.querySelectorAll(':scope > .columns-grid__wrap > .ffe-grid > .ffe-grid__row')) { const r = el('div', { class: 'grid-row' + ((row.className.match(/columns-grid__row--col-(\d+)/) || [])[1] ? ' grid-row--cols-' + row.className.match(/columns-grid__row--col-(\d+)/)[1] : '') }); for (const col of row.querySelectorAll(':scope > .columns-grid__column')) { const cont = col.querySelector(':scope > .columns-grid__content'); const align = (cont?.className.match(/columns-grid__content--(start|middle|center|bottom|height-auto)/) || [])[1] || 'start'; const c = el('div', { class: `col ${gridClasses(col)} col--${align}` }); const inner = el('div', { class: 'col__content' }); for (const ch of (cont || col).children) { const m = ch.tagName === 'H2' || ch.tagName === 'H3' || ch.tagName === 'H1' || ch.tagName === 'P' ? cleanCopy(ch) : moduleOf(ch); if (m) inner.append(m); } c.append(inner); r.append(c); } g.append(r); } return g; }
    case 'text': return richtext(node, node.classList.contains('prices__bottom-info') ? 'prices__bottom' : '');
    case 'title': { const h = node.querySelector('h1,h2,h3,h4'); return h ? el('div', { class: 'title' }, [cleanCopy(h)]) : null; }
    case 'button': return buttonWrapper(node);
    case 'button-list-container': { const l = el('div', { class: 'button-list button-list--' + ((node.querySelector('.aem-component-container')?.className.match(/button-list-container--(left|center|right)/) || [])[1] || 'left') }); for (const b of node.querySelectorAll('.button')) { const bw = buttonWrapper(b); if (bw) l.append(bw); } return l; }
    case 'image': return imageBlock(node);
    case 'card': return card(node);
    case 'hr': { const hr = node.querySelector('hr'); return el('hr', { class: 'rule' + (/extra-margin-top/.test(hr?.className || '') ? ' rule--extra-top' : '') + (/extra-margin-bottom/.test(hr?.className || '') ? ' rule--extra-bottom' : '') + (/show-hr/.test(hr?.className || '') ? ' rule--visible' : ''), id: hr?.getAttribute('id') || null }); }
    case 'banner-small': { const grid = node.querySelector('.banner-small__grid'); const color = (grid?.className.match(/banner-small__bg-color(\d)/) || [])[1]; const s = el('section', { class: 'banner-small' + (color ? ' banner-small--color' + color : '') }); const inner = el('div', { class: 'banner-small__inner ' + gridClasses(node.querySelector('.banner-small__grid-col') || node) }); const img = node.querySelector('.banner-small__image'); if (img) { const p = picture(img, 'banner-small__img'); if (p) inner.append(el('div', { class: 'banner-small__media' }, [p])); } const text = el('div', { class: 'banner-small__text' }); const h = node.querySelector('.banner-small__header'); if (h) text.append(el('h2', { class: 'banner-small__heading' }, [...h.childNodes].map(cleanCopy).filter(Boolean))); const info = node.querySelector('.banner-small__infotext'); if (info) text.append(el('p', { class: 'banner-small__info' }, [...info.childNodes].map(cleanCopy).filter(Boolean))); const bottom = node.querySelector('.banner-small__bottom'); if (bottom) { const bb = el('div', { class: 'banner-small__bottom' }); for (const b of bottom.querySelectorAll('.button')) { const bw = buttonWrapper(b); if (bw) bb.append(bw); } const bimg = bottom.querySelector('.banner-small__bottom--image img'); if (bimg) bb.append(el('div', { class: 'banner-small__bottom-image' }, [cleanCopy(bimg)])); text.append(bb); } inner.append(text); s.append(inner); return s; }
    case 'prices': { const wrap = node.querySelector('.prices__wrapper'); const s = el('section', { class: 'prices', style: bgStyle(wrap) }); const t = wrap.querySelector(':scope > .text'); if (t) s.append(richtext(t, 'prices__title')); const list = el('div', { class: 'card-list card-list--price' }); for (const c of wrap.querySelectorAll('.card-list .card')) list.append(card(c, 'card--price')); s.append(list); const bottom = wrap.querySelector('.prices__bottom-info'); if (bottom) { const bi = el('div', { class: 'prices__bottom' }); for (const ch of bottom.children) { const m = moduleOf(ch); if (m) bi.append(m); } s.append(bi); } return s; }
    case 'calculator-loan': { const shadowPath = `stardust/replica/lift/${slug.replace('nb-bank-privat-lan-', '')}-calculator.shadow.html`; const alt = 'stardust/replica/lift/boliglan-calculator.shadow.html'; const p = existsSync(shadowPath) ? shadowPath : alt; if (!existsSync(p)) { log.notes.push('calculator: no shadow snapshot, emitted empty host'); return el('section', { class: 'calculator' }, [el('div', { class: 'calculator__host' })]); } let inner = readFileSync(p, 'utf8').replace(/<link rel="stylesheet" href="[^"]*sb1-lanekalkulator\.css">/, '<link rel="stylesheet" href="assets/sb1-lanekalkulator.css">'); inner = inner.replace(/https:\/\/www\.sparebank1\.no\/nb\/bank\//g, 'https://www.sparebank1.no/nb/bank/'); const host = el('div', { class: 'calculator__host' }); const tpl = O.createElement('template'); tpl.setAttribute('shadowrootmode', 'open'); tpl.innerHTML = inner; host.append(tpl); log.notes.push('calculator-loan: static snapshot of the hydrated shadow DOM (client-rendered widget; dynamics #7 interim tier) — CSS portation of sb1-lanekalkulator.css scoped to the shadow root'); return el('section', { class: 'calculator' }, [host]); }
    case 'faq': { const s = el('section', { class: 'faq' }); const h = node.querySelector('.title h2'); if (h) s.append(el('div', { class: 'faq__title' }, [cleanCopy(h)])); const acc = el('div', { class: 'accordion' }); for (const item of node.querySelectorAll('.ffe-accordion-item')) { const hidden = /display:\s*none/.test(item.getAttribute('style') || '') || item.classList.contains('non-highlighted'); const it = el('div', { class: 'accordion__item' + (hidden ? ' accordion__item--more' : ''), style: hidden ? 'display: none' : null }); const btn = item.querySelector('.ffe-accordion-item__heading-button'); const h3 = el('h3', { class: 'accordion__heading' }); const b = el('button', { type: 'button', class: 'accordion__button', 'aria-expanded': 'false', 'aria-controls': btn?.getAttribute('aria-controls'), id: btn?.getAttribute('id') }); const content = el('span', { class: 'accordion__label' }, [txt(btn?.querySelector('.ffe-accordion-item__heading-button-content')?.childNodes[0]) || txt(btn)]); const iconWrap = el('span', { class: 'accordion__icon' }, [svgOf(btn?.querySelector('svg'))]); b.append(content, iconWrap); h3.append(b); it.append(h3); const panel = item.querySelector('.faq-item__content, [role=region]'); const pn = el('div', { class: 'accordion__panel', id: panel?.getAttribute('id'), role: 'region' }); const body = el('div', { class: 'accordion__body' }); for (const ch of (panel?.querySelector('.ffe-accordion-item__body') || panel || item).children) { if (ch.classList.contains('faq__feedback-box')) { body.append(feedbackInline(ch)); continue; } if (ch.classList.contains('faq-link') || ch.tagName === 'A' && ch.classList.contains('faq-link')) continue; const m = moduleOf(ch); if (m) body.append(m); } const link = item.querySelector('a.faq-link'); if (link) body.append(el('a', { class: 'accordion__link', href: abs(link.getAttribute('href')) }, [el('span', { class: 'visually-hidden' }, [txt(link)]), svgOf(link.querySelector('svg'))])); pn.append(body); it.append(pn); acc.append(it); } s.append(acc); const more = node.querySelector('.faq-button--more'); if (more) s.append(el('div', { class: 'faq__more' }, [el('button', { type: 'button', class: 'btn btn--expand faq__more-btn', 'aria-expanded': 'false' }, [el('span', { class: 'btn__label' }, [txt(more.querySelector('.ffe-button__label'))]), svgOf(more.querySelector('svg'))])])); return s; }
    case 'related-topics': case 'related-products': { const s = el('section', { class: k, style: bgStyle(node.querySelector(':scope > div')) }); const inner = el('div', { class: k + '__inner' }); const h = node.querySelector('.title h2, h2'); if (h) inner.append(el('div', { class: k + '__title' }, [cleanCopy(h)])); const feed = el('div', { class: 'newsfeed' }); const track = el('div', { class: 'newsfeed__track' }); for (const c of node.querySelectorAll('.card')) track.append(card(c, 'card--news')); feed.append(track); inner.append(feed); const btn = node.querySelector(':scope .button'); if (btn && !node.querySelector('.card .button')) { const bw = buttonWrapper(btn, 'center'); if (bw) inner.append(bw); } s.append(inner); return s; }
    case 'feedback': { if (node.querySelector('.feedback--layoutfaq')) return feedbackInline(node); const s = el('section', { class: 'feedback' }); const w = el('div', { class: 'feedback__inner' }); const q = node.querySelector('h2, .feedback-question'); if (q) w.append(el(q.tagName.toLowerCase() === 'h2' ? 'h2' : 'p', { class: 'feedback__question', id: q.getAttribute('id') }, [txt(q)])); w.append(thumbs(node)); s.append(w); return s; }
    case 'referance': { const s = el('section', { class: 'reference' }); for (const t of node.querySelectorAll('.text')) s.append(richtext(t)); return s; }
    case 'visual-nav': case 'static-cards': case 'card-list': { const s = el('section', { class: k, style: bgStyle(node.querySelector(':scope > div')) }); const h = node.querySelector('h2'); if (h) s.append(el('div', { class: k + '__title' }, [cleanCopy(h)])); const list = el('div', { class: 'card-list card-list--' + k }); for (const c of node.querySelectorAll('.card')) list.append(card(c)); s.append(list); return s; }
    case 'shortcuts': { const s = el('section', { class: 'shortcuts' }); const h = node.querySelector('h2'); if (h) s.append(cleanCopy(h)); const ul = el('ul', { class: 'shortcuts__list' }); for (const a of node.querySelectorAll('a')) ul.append(el('li', {}, [el('a', { class: 'shortcuts__link', href: abs(a.getAttribute('href')) }, [txt(a)])])); s.append(ul); return s; }
    case 'tip': { const s = el('section', { class: 'tip' }); const icon = node.querySelector('svg, img'); if (icon) s.append(el('div', { class: 'tip__icon' }, [icon.tagName === 'svg' || icon.tagName === 'SVG' ? svgOf(icon) : cleanCopy(icon)])); for (const t of node.querySelectorAll('.text')) s.append(richtext(t)); for (const b of node.querySelectorAll('.button')) { const bw = buttonWrapper(b); if (bw) s.append(bw); } return s; }
    case 'usp': { const s = el('section', { class: 'usp' });
      // the FFE icon-list variant (.usp-wrap--iconsLeft .icon-list__item: illustration + text) — the original handler read only .usp-item
      for (const item of node.querySelectorAll('.icon-list__item')) { const it = el('div', { class: 'usp__item usp__item--illustrated' }); const img = item.querySelector('.icon-list__item-icon img'); if (img) { const ci = cleanCopy(img); if (ci) it.append(el('span', { class: 'usp__icon' }, [ci])); } const tw = item.querySelector('.icon-list__item-text .text-wrapper') || item.querySelector('.icon-list__item-text'); if (tw) for (const ch of tw.childNodes) { const cc = cleanCopy(ch); if (cc) it.append(cc); } s.append(it); }
      if (node.classList.contains('usp-wrap--iconsLeft') || node.querySelector('.usp-wrap--iconsLeft')) s.classList.add('usp--icons-left');
      for (const item of node.querySelectorAll('.usp-item')) { const it = el('div', { class: 'usp__item' }); const svg = item.querySelector('svg'); if (svg) it.append(el('span', { class: 'usp__icon' }, [svgOf(svg)])); for (const ch of item.childNodes) { if (ch.nodeType === 1 && ch.tagName === 'svg') continue; const cc = cleanCopy(ch); if (cc) it.append(cc); } s.append(it); } return s; }
    default: { if (!k) return null; log.unknownModules.push(k); const s = el('section', { class: `module module--${k}` }); const rt = richtext(node); if (txt(rt)) s.append(rt); return s; }
  }
}
function thumbs(node) { const w = el('div', { class: 'thumbs' }); const btns = [...node.querySelectorAll('.feedback-btn__wrapper button')]; const up = node.querySelector('.feedback-thumbs__link:not(.feedback-thumbs__link--down)') || btns[0]; const down = node.querySelector('.feedback-thumbs__link--down') || btns[1]; w.append(el('button', { type: 'button', class: 'thumbs__btn thumbs__btn--up', 'aria-label': 'Ja' }, [svgOf(up?.querySelector('svg'))])); w.append(el('button', { type: 'button', class: 'thumbs__btn thumbs__btn--down', 'aria-label': 'Nei' }, [svgOf(down?.querySelector('svg'))])); return w; }
function feedbackInline(node) { const w = el('div', { class: 'feedback feedback--inline' }); const q = node.querySelector('.feedback-question, h3'); if (q) w.append(el('p', { class: 'feedback__question', id: q.getAttribute('id') }, [txt(q)])); w.append(thumbs(node)); return w; }

// ---------------------------------------------------------------- chrome
function header() {
  const H = D.querySelector('header'); const h = el('header', { class: 'header' }); const wrap = el('div', { class: 'header__wrap' }); const content = el('div', { class: 'header__content' });
  const top = el('div', { class: 'header__top' });
  const sm = H.querySelector('.header__search-mobile'); if (sm) top.append(el('a', { class: 'header__search-mobile', href: abs(sm.getAttribute('href')), 'aria-label': sm.getAttribute('aria-label') }, [svgOf(sm.querySelector('svg'))]));
  const logoA = H.querySelector('.header__logo a'); const logoImg = H.querySelector('.header__logo img'); top.append(el('div', { class: 'header__logo' }, [el('a', { href: abs(logoA?.getAttribute('href')) }, [el('img', { src: abs(logoImg?.getAttribute('src')), alt: logoImg?.getAttribute('alt'), width: '180', height: '50' })])]));
  top.append(el('button', { type: 'button', class: 'header__hamburger', 'aria-label': 'Meny', 'aria-expanded': 'false', 'aria-controls': 'main-menu' }, [el('span', { class: 'header__hamburger-bar' })]));
  const topnav = el('nav', { class: 'header__topnav', 'aria-label': 'Marked' }); const ul = el('ul'); for (const a of H.querySelectorAll('.header__top-nav a')) { ul.append(el('li', {}, [el('a', { href: abs(a.getAttribute('href')), class: /\bactive\b/.test(a.className) ? 'is-active' : null }, [txt(a)])])); ul.append(O.createTextNode('\n')); } topnav.append(ul); top.append(topnav);
  content.append(top);
  const user = el('div', { class: 'header__user' });
  const sd = H.querySelector('.header__search-desktop'); if (sd) user.append(el('button', { type: 'button', class: 'header__search', 'aria-label': 'Søk' }, [svgOf(sd.querySelector('svg')), el('span', {}, [txt(sd.querySelector('span'))])]));
  const actions = el('div', { class: 'header__actions' }); const bli = H.querySelector('.btn-bli-kunde'); if (bli) actions.append(el('a', { class: 'btn btn--action header__cta', href: abs(bli.getAttribute('href')) }, [txt(bli)]));
  const login = H.querySelector('#login-button, .login-btn'); if (login) actions.append(el('button', { type: 'button', class: 'header__login', 'aria-label': login.getAttribute('aria-label') || 'Logg inn' }, [el('span', {}, [txt(login) || 'Logg inn'])]));
  user.append(actions); content.append(user);
  const nav = el('nav', { class: 'header__mainnav', id: 'main-menu', 'aria-label': 'Hovedmeny' }); const nul = el('ul'); for (const a of H.querySelectorAll('.header__main-nav a')) { nul.append(el('li', {}, [el('a', { href: abs(a.getAttribute('href')), class: /\bactive\b/.test(a.className) ? 'is-active' : null }, [txt(a)])])); nul.append(O.createTextNode('\n')); } nav.append(nul); content.append(nav);
  wrap.append(content); h.append(wrap); return h;
}
function bankChoice() {
  const B = D.querySelector('.bank-choice'); if (!B) return null;
  const s = el('section', { class: 'bank-choice', 'aria-label': B.getAttribute('aria-label') || 'Valg av bank' }); const cont = el('div', { class: 'bank-choice__container' });
  const bgD = B.querySelector('.bank-choice__background--desktop'); cont.append(el('div', { class: 'bank-choice__bg' }, [el('img', { class: 'bank-choice__bg-desktop', src: 'assets/bankchoice_bg.svg', alt: '', 'aria-hidden': 'true', width: '1250', height: '368' }), el('img', { class: 'bank-choice__bg-mobile', src: 'assets/bankchoice_bg_mobile.svg', alt: '', 'aria-hidden': 'true', width: '671', height: '526' })]));
  const wrap = el('div', { class: 'bank-choice__wrap' });
  wrap.append(el('p', { class: 'bank-choice__heading' }, [txt(B.querySelector('.bank-choice__header'))]));
  wrap.append(el('p', { class: 'bank-choice__sublead' }, [txt(B.querySelector('.bank-choice__sublead'))]));
  const search = el('div', { class: 'bank-choice__search', role: 'search' });
  const inp = B.querySelector('.bank-choice__input-field'); const lbl = B.querySelector('.bank-choice__input label');
  search.append(el('div', { class: 'bank-choice__field' }, [el('label', { class: 'bank-choice__label', for: 'postnummer-input' }, [txt(lbl)]), el('input', { class: 'bank-choice__input', id: 'postnummer-input', type: 'tel', inputmode: 'numeric', role: 'searchbox', placeholder: inp?.getAttribute('placeholder') || 'Postnummer', autocomplete: 'postal-code' }), el('div', { class: 'bank-choice__message' })]));
  const mp = B.querySelector('.bank-choice__myposition-button'); search.append(el('div', { class: 'bank-choice__myposition' }, [el('button', { type: 'button', class: 'btn btn--secondary bank-choice__position-btn' }, [el('span', { class: 'btn__label' }, [svgOf(mp?.querySelector('svg')), labelText(mp?.querySelector('.ffe-button__label'))])])]));
  const all = el('div', { class: 'bank-choice__all' }); const ex = B.querySelector('.bank-choice__expand'); all.append(el('button', { type: 'button', class: 'btn btn--inline bank-choice__expand', 'aria-expanded': 'false', 'aria-controls': 'bank-list' }, [el('span', { class: 'btn__label' }, [txt(ex?.querySelector('.ffe-inline-button__label'))]), svgOf(ex?.querySelector('svg'))]));
  const list = el('ol', { class: 'bank-choice__list', id: 'bank-list', hidden: true }); for (const li of B.querySelectorAll('.bank-choice__all-list--item')) { const a = li.querySelector('a'); const strong = a?.querySelector('strong'); list.append(el('li', { class: 'bank-choice__bank' }, [el('div', { class: 'bank-choice__bank-wrap' }, [el('a', { class: 'bank-choice__bank-link', href: abs(a?.getAttribute('href')) }, [txt(a?.childNodes[0]) + ' ', el('strong', {}, [txt(strong)])]), el('span', { class: 'bank-choice__bank-tagline' }, [txt(li.querySelector('.ffe-micro-text'))])]), svgOf(li.querySelector('svg'))])); }
  all.append(list); search.append(all); wrap.append(search); cont.append(wrap); s.append(cont); return s;
}
function footer() {
  const F = D.querySelector('footer'); const f = el('footer', { class: 'footer' });
  const top = el('div', { class: 'footer__top' }); const cs = F.querySelector('.contact-section');
  if (cs) { const c = el('section', { class: 'contact', id: 'contact-us' }); const h = cs.querySelector(':scope > h2'); if (h) c.append(el('h2', { class: 'contact__title' }, [txt(h)])); const p = [...cs.querySelectorAll('.text-container p')].find((x) => !x.closest('.contact-info-section, .customer-action-wrap')); if (p) c.append(el('div', { class: 'richtext contact__text' }, [cleanCopy(p)])); const wrap = el('div', { class: 'contact__actions' }); const ul = el('ul', { class: 'contact__list', role: 'tablist' }); for (const li of cs.querySelectorAll('.customer-action__list-item')) { const a = li.querySelector('a.cs-action'); const item = el('li', { class: 'contact__item', role: 'presentation' }); const btn = el('a', { class: 'contact__action', href: abs(a?.getAttribute('href')) === ORIGIN + '/' ? '#' : abs(a?.getAttribute('href')), id: a?.getAttribute('id'), role: 'tab', 'aria-selected': 'false', 'aria-controls': li.getAttribute('aria-controls') }); btn.append(el('span', { class: 'contact__icon' }, [svgOf(a?.querySelector('.icon-circle svg'))])); btn.append(el('span', { class: 'contact__name' }, [txt(a?.querySelector('.btn-name'))])); btn.append(el('span', { class: 'contact__sub' }, [txt(a?.querySelector('.sub-info'))])); item.append(btn); item.append(el('span', { class: 'contact__caret' }, [svgOf(li.querySelector('.icon svg'))])); ul.append(item); ul.append(O.createTextNode('\n')); } wrap.append(ul);
    for (const panel of cs.querySelectorAll('.contact-info-section')) { const pn = el('div', { class: 'contact__panel', id: panel.getAttribute('id'), role: 'tabpanel', hidden: true }); for (const ch of panel.childNodes) { const cc = cleanCopy(ch); if (cc) pn.append(cc); } wrap.append(pn); }
    c.append(wrap); top.append(c); }
  const tt = F.querySelector('a.to-top'); if (tt) top.append(el('a', { class: 'to-top', href: '#top', 'aria-label': 'Til toppen' }, [el('span', { class: 'visually-hidden' }, ['Til toppen']), el('span', { class: 'to-top__icon' }, [svgOf(tt.querySelector('svg'))])]));
  f.append(top);
  const bottom = el('div', { class: 'footer__bottom' }); const inner = el('div', { class: 'footer__inner' }); const cols = el('div', { class: 'footer__columns' });
  for (const col of F.querySelectorAll('.footer-bottom__column')) { const c = el('div', { class: 'footer__column' + (/column-right/.test(col.className) ? ' footer__column--right' : '') }); for (const links of col.querySelectorAll('.footer-bottom__column-links')) { const social = /social/.test(links.className); const g = el('div', { class: 'footer__links' + (social ? ' footer__links--social' : '') }); const h = links.querySelector('h2'); if (h) g.append(el('h2', { class: 'footer__heading' }, [txt(h)])); const ul = el('ul'); for (const li of links.querySelectorAll('li')) { const a = li.querySelector('a'); if (!a) continue; if (social) { const img = a.querySelector('img'); ul.append(el('li', {}, [el('a', { class: 'footer__social', href: abs(a.getAttribute('href')) }, [el('img', { src: abs(img?.getAttribute('data-lazy-src') || img?.getAttribute('src')), alt: img?.getAttribute('alt') || '', width: '30', height: '30' }), el('span', { class: 'visually-hidden' }, [txt(a.querySelector('.visually-hidden'))])])])); } else ul.append(el('li', {}, [el('a', { href: abs(a.getAttribute('href')) }, [txt(a)])])); } g.append(ul); c.append(g); } cols.append(c); }
  inner.append(cols);
  const small = F.querySelector('.footer-bottom__small-links'); if (small) { const ul = el('ul', { class: 'footer__small' }); for (const a of small.querySelectorAll('a')) { ul.append(el('li', {}, [el('a', { href: abs(a.getAttribute('href')) }, [txt(a)])])); ul.append(O.createTextNode('\n')); } inner.append(ul); }
  const addr = F.querySelector('.footer-bottom__address p'); if (addr) inner.append(el('p', { class: 'footer__address' }, [txt(addr)]));
  bottom.append(inner); f.append(bottom); return f;
}

// ---------------------------------------------------------------- ctx for module files
const ctx = { O, D, el, txt, abs, cleanCopy, richtext, svgOf, picture, imageBlock, card, button, buttonWrapper, labelText, gridClasses, bgStyle, moduleOf, feedbackInline, thumbs, log, slug, family, variant, ORIGIN, KEEP_ATTR, KEEP_CLASS };
// ---------------------------------------------------------------- assemble
const head = O.querySelector('head');
head.innerHTML = `<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=yes"><title>${(rec.title || '').replace(/</g, '&lt;')}</title><meta name="description" content="${(rec.metaDescription || '').replace(/"/g, '&quot;')}"><link rel="icon" href="assets/favicon.png">${cssFiles.map(c => `<link rel="stylesheet" href="${c}">`).join('')}`;
const body = O.querySelector('body'); body.setAttribute('class', 'page page--' + (rec.slots?.archetypeFamily || 'unknown')); body.setAttribute('id', 'top');
body.append(el('a', { class: 'skip-link visually-hidden', href: '#main-menu' }, ['Til hovedmeny']), el('a', { class: 'skip-link visually-hidden', href: '#main-content' }, ['Til hovedinnhold']));
body.append(registry.__header && variant === 'frontend' ? registry.__header(D.querySelector('header'), ctx) : header()); const bc = bankChoice(); if (bc) body.append(bc);
const M = D.querySelector('main'); const main = el('main', { id: 'main-content', class: 'main ' + (M.getAttribute('class') || '').split(/\s+/).filter(c => /page$/.test(c) && !/^js-/.test(c)).join(' ') + ' main--' + variant });
for (const ch of M.children) { const m = moduleOf(ch); if (m) main.append(m); }
body.append(main); body.append(registry.__footer && variant === 'frontend' ? registry.__footer(D.querySelector('footer'), ctx) : footer());
body.append(el('script', { src: 'js/canon.js', defer: true }));
if (existsSync(`${outDir}/js/${family}.js`)) body.append(el('script', { src: `js/${family}.js`, defer: true }));
mkdirSync(outDir, { recursive: true });
const html = '<!doctype html>\n' + O.documentElement.outerHTML.replace(/<template shadowrootmode="open">/g, '<template shadowrootmode="open">');
writeFileSync(path.join(outDir, `${slug}-proposed.html`), html);
console.log(`[${family}/${variant}] wrote ${outDir}/${slug}-proposed.html (${(html.length / 1024).toFixed(0)} KB); main modules: ${main.children.length}; unknown: ${[...new Set(log.unknownModules)].join(', ') || 'none'}; dropped: ${log.dropped.length}; notes: ${log.notes.join(' | ') || '-'}`);
