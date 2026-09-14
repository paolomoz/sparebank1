#!/usr/bin/env node
/**
 * capture-styles.mjs — recipe-completion pass for stardust:extract.
 *
 * The bundled crawl.mjs (0.18.5) writes headings (tag+text), body, ctas (label+href), media.imgs,
 * customProps, _signals and screenshots — but NOT the recipe fields playwright-recipe.md § Capture
 * list requires for brand-surface aggregation and migrate: heading/CTA computed styles, landmarks
 * with sectioned children, link inventory, forms, widgets, components, perSectionStyle,
 * embedDominance, cssCustomProperties, font files (network intercept), @font-face rules, icon-font
 * detection, hero headline/lede. This pass re-renders every captured page under the same recipe
 * (1440×900 @2x, reduced motion, dcl + grace + 4-step scroll + reveal pass) and MERGES the missing
 * fields into pages/<slug>.json, preserving crawl.mjs's _provenance (renderedBy/fetchedAt/waitMs/
 * waitMode/httpStatus) and adding _provenance.stylePass.
 *
 * usage: node stardust/scripts/capture-styles.mjs [--out stardust/current] [--concurrency 4] [--only slug,slug]
 */
import { chromium } from 'playwright';
import { readFileSync, writeFileSync, readdirSync, existsSync, mkdirSync } from 'node:fs';
import path from 'node:path';

const args = { out: 'stardust/current', concurrency: 4, only: null };
for (let i = 2; i < process.argv.length; i++) {
  const k = process.argv[i];
  if (k === '--out') args.out = process.argv[++i];
  else if (k === '--concurrency') args.concurrency = +process.argv[++i] || 4;
  else if (k === '--only') args.only = process.argv[++i].split(',');
}
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36';
const pagesDir = path.join(args.out, 'pages');
const fontsDir = path.join(args.out, 'assets', 'fonts');
mkdirSync(fontsDir, { recursive: true });
const files = readdirSync(pagesDir).filter(f => f.endsWith('.json') && !f.startsWith('_'));
const queue = files.filter(f => !args.only || args.only.includes(f.replace('.json', '')));

const fontFiles = new Map(); // url -> { localPath, contentType, bytes }
const fontFaceRules = new Map(); // key family|weight|style|src -> rule
const iconFontPages = {};

const CAPTURE = () => {
  const vis = (el) => {
    if (!el || !(el instanceof Element)) return false;
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.opacity === '0') return false;
    if (el.closest('[aria-hidden="true"],[hidden]')) return false;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0) return false;
    return true;
  };
  const absTop = (el) => el.getBoundingClientRect().top + window.scrollY;
  const domPath = (el) => {
    const parts = [];
    let n = el, depth = 0;
    while (n && n.nodeType === 1 && depth < 6 && n !== document.body) {
      let s = n.tagName.toLowerCase();
      if (n.id) { s += '#' + n.id; parts.unshift(s); break; }
      const cls = [...n.classList].filter(c => c.length < 40).slice(0, 2);
      if (cls.length) s += '.' + cls.join('.');
      const p = n.parentElement;
      if (p) { const sib = [...p.children].filter(c => c.tagName === n.tagName); if (sib.length > 1) s += `:nth-child(${[...p.children].indexOf(n) + 1})`; }
      parts.unshift(s); n = p; depth++;
    }
    return parts.join(' > ');
  };
  const junk = (t) => {
    const s = (t || '').trim().toLowerCase();
    if (!s) return true;
    if (/[{}]/.test(s)) return true;
    if (/^(thank you|our apologies|sign in|sign up|subscribe|newsletter|follow us|share this|related|contact us)$/.test(s)) return true;
    if (/(featured products|limited-time offer|% off|save \d+%)/.test(s)) return true;
    if (/^\d[\d,]*\s*(products?|results?|items?)$/.test(s) || /^\d[\d,]*$/.test(s)) return true;
    return false;
  };
  const num = (v) => { const n = parseFloat(v); return Number.isFinite(n) ? n : v; };
  const styleOf = (el, props) => { const cs = getComputedStyle(el); const o = {}; for (const p of props) o[p] = cs[p]; return o; };
  const txt = (el) => (el.innerText || '').replace(/\s+\n/g, '\n').replace(/[ \t]+/g, ' ').trim();

  // meta
  const meta = (n) => document.querySelector(`meta[name="${n}"]`)?.content || null;
  const og = (p) => document.querySelector(`meta[property="og:${p}"]`)?.content || null;
  const themeColor = {};
  for (const m of document.querySelectorAll('meta[name="theme-color"]')) { const k = /dark/.test(m.media || '') ? 'dark' : 'light'; themeColor[k] = m.content; }

  // headings
  const hEls = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(vis);
  const headings = hEls.map(h => ({
    level: +h.tagName[1], text: txt(h), id: h.id || null, domPath: domPath(h), top: Math.round(absTop(h)),
    style: (() => { const s = styleOf(h, ['fontFamily', 'fontWeight', 'fontSize', 'lineHeight', 'letterSpacing', 'color', 'textTransform']); return { fontFamily: s.fontFamily, fontWeight: num(s.fontWeight), fontSize: s.fontSize, lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, color: s.color, textTransform: s.textTransform }; })(),
  }));
  // hero headline / lede
  let heroSource = 'dom';
  const heroCands = hEls.filter(h => /^H[123]$/.test(h.tagName) && absTop(h) <= 820 && h.getBoundingClientRect().width >= 120 && !junk(txt(h)));
  heroCands.sort((a, b) => parseFloat(getComputedStyle(b).fontSize) - parseFloat(getComputedStyle(a).fontSize));
  let heroHeadline = heroCands[0] ? txt(heroCands[0]) : '';
  let heroLede = '';
  for (const p of document.querySelectorAll('p')) { if (!vis(p) || absTop(p) > 1300) continue; const t = txt(p); if (t.length >= 40 && t.length <= 400 && !junk(t)) { heroLede = t; break; } }
  const md = meta('description') || '';
  if (!heroHeadline) { heroHeadline = (md.split(/(?<=\.)\s/)[0] || '').trim(); heroSource = 'meta-fallback'; }
  if (!heroLede) { heroLede = md; if (heroSource === 'dom' && md) heroSource = heroHeadline ? 'dom' : 'meta-fallback'; }

  // sections helper
  const purposeOf = (el, hasH, ctaN, pN) => {
    const c = (el.className || '').toString().toLowerCase() + ' ' + (el.id || '').toLowerCase();
    if (/hero|masthead|banner/.test(c)) return 'hero';
    if (/testimonial|review|quote|rating/.test(c)) return 'social-proof';
    if (/faq|accordion/.test(c)) return 'faq';
    if (/footer/.test(c)) return 'footer-nav';
    if (el.querySelector('form')) return 'form';
    if (ctaN >= 1 && pN <= 2 && hasH && !el.querySelector('img')) return 'cta-band';
    if (el.querySelectorAll('[class*="card" i]').length >= 3) return 'feature-list';
    if (pN >= 3) return 'rich-text';
    return 'unknown';
  };
  const sectionRecord = (el) => {
    const hs = [...el.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(vis);
    const firstH = hs[0] ? txt(hs[0]) : null;
    const body = [...el.querySelectorAll('p,blockquote')].filter(vis).filter(p => !p.closest('[role="dialog"]')).map(p => txt(p)).filter(Boolean);
    const lists = [...el.querySelectorAll('ul,ol')].filter(l => vis(l) && !l.closest('nav') && l.querySelectorAll('li').length >= 2 && l.querySelectorAll('a').length < l.querySelectorAll('li').length).map(l => ({ ordered: l.tagName === 'OL', items: [...l.children].filter(li => li.tagName === 'LI').map(li => txt(li)).filter(Boolean) })).filter(l => l.items.length);
    const qa = [];
    for (const d of el.querySelectorAll('details')) { const s = d.querySelector('summary'); if (s) qa.push({ q: txt(s), a: (d.textContent || '').replace(txt(s), '').replace(/\s+/g, ' ').trim() || null }); }
    for (const t of el.querySelectorAll('[aria-expanded][aria-controls]')) { const panel = document.getElementById(t.getAttribute('aria-controls')); if (t.closest('nav,header,footer')) continue; qa.push({ q: txt(t) || (t.textContent || '').trim(), a: panel ? (panel.textContent || '').replace(/\s+/g, ' ').trim() || null : null }); }
    const quotes = [...el.querySelectorAll('blockquote,[class*="testimonial" i],[class*="review-card" i]')].filter(vis).map(q => ({ text: txt(q).slice(0, 600), attribution: q.querySelector('cite,[class*="author" i],[class*="name" i]') ? txt(q.querySelector('cite,[class*="author" i],[class*="name" i]')) : null, rating: (q.querySelector('[aria-label*="out of 5" i]')?.getAttribute('aria-label') || '').match(/(\d(?:\.\d)?) out of 5/)?.[1] ? +(q.querySelector('[aria-label*="out of 5" i]').getAttribute('aria-label').match(/(\d(?:\.\d)?) out of 5/)[1]) : null }));
    const ctaN = el.querySelectorAll('a,button').length;
    const words = txt(el).split(/\s+/).filter(Boolean).length;
    const r = el.getBoundingClientRect();
    return { tag: el.tagName.toLowerCase(), role: el.getAttribute('role'), id: el.id || null, classes: [...el.classList].slice(0, 6), purpose: purposeOf(el, !!firstH, ctaN, body.length), headlineRef: firstH ? headings.findIndex(h => h.text === firstH) : null, innerTextSummary: txt(el).slice(0, 240), wordCount: words, rect: { top: Math.round(absTop(el)), height: Math.round(r.height), width: Math.round(r.width) }, body, lists, qa, quotes };
  };
  // landmarks
  const lmSel = 'header,nav,main,aside,footer,[role="banner"],[role="navigation"],[role="main"],[role="complementary"],[role="contentinfo"]';
  const lmEls = [...document.querySelectorAll(lmSel)].filter(el => !el.closest('[role="dialog"]'));
  const landmarks = lmEls.filter(el => !lmEls.some(o => o !== el && o.contains(el) && o.tagName === el.tagName)).map(el => {
    const kids = [...el.children].filter(c => c.tagName !== 'SCRIPT' && c.tagName !== 'STYLE' && vis(c));
    // sections = direct children; if a single wrapper child, descend one level
    let secs = kids;
    if (kids.length === 1 && kids[0].children.length > 1) secs = [...kids[0].children].filter(vis);
    return { tag: el.tagName.toLowerCase(), role: el.getAttribute('role') || ({ header: 'banner', nav: 'navigation', main: 'main', aside: 'complementary', footer: 'contentinfo' })[el.tagName.toLowerCase()] || null, id: el.id || null, classes: [...el.classList].slice(0, 6), childElementCount: el.children.length, innerText: txt(el), children: secs.slice(0, 60).map(sectionRecord) };
  });
  // ctas
  const btnLike = (el) => { const cs = getComputedStyle(el); const bg = cs.backgroundColor; const transparent = !bg || bg === 'transparent' || /rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)/.test(bg); const pad = parseFloat(cs.paddingLeft) + parseFloat(cs.paddingTop); const bordered = parseFloat(cs.borderTopWidth) > 0 && cs.borderTopStyle !== 'none'; return (!transparent || bordered) && parseFloat(cs.borderRadius) > 2 && pad > 4; };
  const ctaEls = [...document.querySelectorAll('button,[role="button"],a')].filter(el => vis(el) && !el.closest('[role="dialog"]') && (el.tagName !== 'A' ? true : btnLike(el)));
  const ctas = ctaEls.slice(0, 200).map(el => { const s = styleOf(el, ['backgroundColor', 'color', 'fontFamily', 'fontWeight', 'fontSize', 'borderRadius', 'padding', 'boxShadow', 'border', 'textTransform', 'letterSpacing']); return { label: txt(el).slice(0, 80) || (el.getAttribute('aria-label') || '').slice(0, 80), href: el.getAttribute('href') || null, tag: el.tagName.toLowerCase(), domPath: domPath(el), style: { ...s, fontWeight: num(s.fontWeight) }, appearsAbove: absTop(el) < 900 ? 'fold' : 'below-fold', inHeader: !!el.closest('header,[role="banner"]'), inFooter: !!el.closest('footer,[role="contentinfo"]') }; });
  // links
  const seen = new Set(); const links = { internal: [], external: [] };
  for (const a of document.querySelectorAll('a[href]')) { const raw = a.getAttribute('href'); if (!raw || /^(mailto:|tel:|javascript:|#)/.test(raw)) continue; let u; try { u = new URL(raw, location.href); } catch { continue; } const href = u.host === location.host ? u.pathname + u.search : u.href; const text = txt(a).slice(0, 120); const k = href + '|' + text; if (seen.has(k)) continue; seen.add(k); (u.host === location.host ? links.internal : links.external).push({ href, text, domPath: domPath(a), region: a.closest('header,[role="banner"]') ? 'header' : a.closest('footer,[role="contentinfo"]') ? 'footer' : a.closest('nav') ? 'nav' : 'main' }); }
  // media
  const images = [...document.images].map(img => { const r = img.getBoundingClientRect(); return { src: img.getAttribute('src'), currentSrc: img.currentSrc || null, srcset: img.getAttribute('srcset') || null, sizes: img.getAttribute('sizes') || null, alt: img.getAttribute('alt'), naturalWidth: img.naturalWidth, naturalHeight: img.naturalHeight, rect: { top: Math.round(absTop(img)), width: Math.round(r.width), height: Math.round(r.height) }, loading: img.getAttribute('loading'), domPath: domPath(img), visible: vis(img) }; });
  const inlineSvgs = [...document.querySelectorAll('svg')].filter(vis).slice(0, 80).map(s => { const r = s.getBoundingClientRect(); return { viewBox: s.getAttribute('viewBox'), domPath: domPath(s), width: Math.round(r.width), height: Math.round(r.height), ariaLabel: s.getAttribute('aria-label'), markupLength: s.outerHTML.length, inHeader: !!s.closest('header,[role="banner"]') }; });
  const cssBackgrounds = [];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect(); if (r.width < 100 || r.height < 80) continue;
    for (const pseudo of [null, '::before', '::after']) { const bi = getComputedStyle(el, pseudo).backgroundImage; if (!bi || bi === 'none') continue; const urls = [...bi.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map(m => m[1]); for (const u of urls) cssBackgrounds.push({ url: u, domPath: domPath(el) + (pseudo || ''), boundingClientRect: { x: Math.round(r.x), y: Math.round(absTop(el)), width: Math.round(r.width), height: Math.round(r.height) }, backgroundSize: getComputedStyle(el, pseudo).backgroundSize, backgroundPosition: getComputedStyle(el, pseudo).backgroundPosition, backgroundRepeat: getComputedStyle(el, pseudo).backgroundRepeat }); const grads = [...bi.matchAll(/(linear|radial|conic)-gradient\([^)]*\)/g)].map(m => m[0]); if (grads.length && !pseudo) cssBackgrounds.push({ gradient: grads[0], domPath: domPath(el), boundingClientRect: { x: Math.round(r.x), y: Math.round(absTop(el)), width: Math.round(r.width), height: Math.round(r.height) } }); }
  }
  const videos = [...document.querySelectorAll('video')].map(v => ({ src: v.currentSrc || v.getAttribute('src') || v.querySelector('source')?.getAttribute('src') || null, poster: v.getAttribute('poster'), autoplay: v.autoplay, domPath: domPath(v), rect: { top: Math.round(absTop(v)), width: Math.round(v.getBoundingClientRect().width), height: Math.round(v.getBoundingClientRect().height) } }));
  const mainEl = document.querySelector('main') || document.body; const mainH = mainEl.getBoundingClientRect().height || 1;
  const iframes = [...document.querySelectorAll('iframe')].map(f => { const r = f.getBoundingClientRect(); let host = null; try { host = new URL(f.src, location.href).host; } catch {} return { src: f.getAttribute('src'), title: f.getAttribute('title'), host, crossOrigin: host && host !== location.host, rect: { top: Math.round(absTop(f)), width: Math.round(r.width), height: Math.round(r.height) }, viewportCoveragePct: Math.round(100 * (r.width * r.height) / (1440 * 900)), mainHeightCoveragePct: Math.round(100 * r.height / mainH), visible: vis(f) }; });
  const dom = iframes.filter(f => f.crossOrigin && f.visible && (f.viewportCoveragePct > 50 || f.mainHeightCoveragePct > 80))[0];
  const embedDominance = dom ? { dominated: true, iframeSrc: dom.src, viewportCoveragePct: dom.viewportCoveragePct, mainHeightCoveragePct: dom.mainHeightCoveragePct } : { dominated: false, iframeSrc: null, viewportCoveragePct: null, mainHeightCoveragePct: null };
  // forms
  const forms = [...document.querySelectorAll('form')].map(f => ({ action: f.getAttribute('action'), method: (f.getAttribute('method') || 'get').toLowerCase(), id: f.id || null, domPath: domPath(f), fields: [...f.querySelectorAll('input,select,textarea')].filter(i => i.type !== 'hidden').map(i => ({ type: i.type || i.tagName.toLowerCase(), name: i.name || null, label: (i.labels && i.labels[0] ? txt(i.labels[0]) : null) || i.getAttribute('aria-label') || i.placeholder || null, required: i.required })), thirdParty: (() => { const a = (f.getAttribute('action') || '') + ' ' + f.innerHTML.slice(0, 2000); return /stripe/i.test(a) ? 'stripe' : /calendly/i.test(a) ? 'calendly' : /typeform/i.test(a) ? 'typeform' : /mailchimp|list-manage/i.test(a) ? 'mailchimp' : /hubspot|hsforms/i.test(a) ? 'hubspot' : /marketo/i.test(a) ? 'marketo' : null; })() }));
  // widgets
  const widgets = { modals: [...document.querySelectorAll('dialog,[role="dialog"],[aria-modal="true"]')].map(m => ({ domPath: domPath(m), open: vis(m), label: m.getAttribute('aria-label') || m.getAttribute('aria-labelledby') || null })), accordions: [...new Set([...document.querySelectorAll('details')].map(d => d.parentElement))].map(p => ({ domPath: domPath(p), itemCount: p.querySelectorAll('details').length })).concat([...new Set([...document.querySelectorAll('[aria-expanded][aria-controls]:not(nav *):not(header *)')].map(t => t.parentElement?.parentElement))].filter(Boolean).map(p => ({ domPath: domPath(p), itemCount: p.querySelectorAll('[aria-expanded][aria-controls]').length })).filter(a => a.itemCount >= 2)), tabs: [...document.querySelectorAll('[role="tablist"]')].map(t => ({ domPath: domPath(t), tabCount: t.querySelectorAll('[role="tab"]').length })) };
  // components (closed list)
  const count = (sel) => { const els = [...document.querySelectorAll(sel)].filter(vis); return { count: els.length, examples: [...new Set(els.slice(0, 6).map(domPath))].slice(0, 2) }; };
  const gridParents = [...document.querySelectorAll('body *')].filter(el => { const cs = getComputedStyle(el); if (!(cs.display.includes('grid') || (cs.display.includes('flex') && cs.flexWrap === 'wrap'))) return false; const kids = [...el.children].filter(vis); if (kids.length < 3) return false; const w = kids.map(k => Math.round(k.getBoundingClientRect().width)); return w.every(x => Math.abs(x - w[0]) <= 2) && w[0] > 120; });
  const statRow = [...document.querySelectorAll('body *')].filter(el => { const kids = [...el.children]; return kids.length >= 3 && kids.length <= 6 && kids.filter(k => /\b\d{2,}(%|\+|k|m)?\b/i.test(txt(k)) && txt(k).length < 120).length >= 3; });
  const components = { cards: count('[class*="card" i]:not([class*="card-grid" i]):not([class*="cards" i])'), grids: { count: gridParents.length, examples: gridParents.slice(0, 2).map(domPath) }, accordions: { count: widgets.accordions.length, examples: widgets.accordions.slice(0, 2).map(a => a.domPath) }, tabs: { count: widgets.tabs.length, examples: widgets.tabs.slice(0, 2).map(t => t.domPath) }, tables: count('table:not([role="presentation"])'), modals: { count: widgets.modals.length, examples: widgets.modals.slice(0, 2).map(m => m.domPath) }, carousels: count('[class*="carousel" i],[class*="swiper" i],[class*="slick" i],[class*="slider" i]'), videos: { count: videos.length, examples: videos.slice(0, 2).map(v => v.domPath) }, iframes: { count: iframes.length, examples: iframes.slice(0, 2).map(f => f.src) }, dataVizEmbeds: count('iframe[src*="datawrapper"],iframe[src*="flourish"],iframe[src*="tableau"],[class*="chart" i],canvas'), teamTiles: count('[class*="team" i] [class*="member" i]'), pricingTiles: count('[class*="pricing" i] [class*="tier" i],[class*="plan-card" i]'), testimonialCards: count('[class*="testimonial" i],blockquote'), logoStrip: count('[class*="logo-strip" i],[class*="partner-logos" i],[class*="logos" i]'), timeline: count('[class*="timeline" i],ol[class*="step" i]'), breadcrumbs: count('nav[aria-label*="breadcrumb" i],[class*="breadcrumb" i]'), statRow: { count: statRow.length, examples: statRow.slice(0, 2).map(domPath) }, ctaBand: { count: landmarks.flatMap(l => l.children).filter(c => c.purpose === 'cta-band').length, examples: [] }, formFields: { count: forms.reduce((n, f) => n + f.fields.length, 0), examples: forms.slice(0, 2).map(f => f.domPath) }, other: [] };
  // per-section style (direct children of main)
  const mode = (arr) => { const m = new Map(); for (const v of arr) if (v) m.set(v, (m.get(v) || 0) + 1); return [...m.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || null; };
  const effBg = (el) => { let n = el; while (n && n !== document.documentElement) { const bg = getComputedStyle(n).backgroundColor; if (bg && bg !== 'transparent' && !/rgba\(\s*\d+,\s*\d+,\s*\d+,\s*0\s*\)/.test(bg)) return bg; n = n.parentElement; } return getComputedStyle(document.body).backgroundColor; };
  const perSectionStyle = (() => { const main = document.querySelector('main') || document.body; let secs = [...main.children].filter(vis); if (secs.length === 1 && secs[0].children.length > 1) secs = [...secs[0].children].filter(vis); return secs.slice(0, 60).map(el => { const cs = getComputedStyle(el); const desc = [...el.querySelectorAll('*')].filter(vis).slice(0, 400); const textEls = desc.filter(d => d.childNodes && [...d.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())); const bi = cs.backgroundImage; return { sectionRef: domPath(el), purpose: purposeOf(el, !!el.querySelector('h1,h2,h3'), el.querySelectorAll('a,button').length, el.querySelectorAll('p').length), background: { color: effBg(el), hasImage: /url\(/.test(bi) || !!el.querySelector('img'), hasGradient: /gradient/.test(bi) }, text: { dominantColor: mode(textEls.map(t => getComputedStyle(t).color)) }, spacing: { paddingBlock: `${cs.paddingTop} ${cs.paddingBottom}`, paddingInline: `${cs.paddingLeft} ${cs.paddingRight}`, gap: mode(desc.map(d => getComputedStyle(d).gap).filter(g => g && g !== 'normal' && g !== '0px')), marginBlock: `${cs.marginTop} ${cs.marginBottom}` }, borderRadius: mode(desc.map(d => getComputedStyle(d).borderRadius).filter(r => r && r !== '0px')), fontFamilies: [...new Set(textEls.map(t => getComputedStyle(t).fontFamily.split(',')[0].replace(/["']/g, '').trim()))].slice(0, 4), shadowsUsed: [...new Set(desc.map(d => getComputedStyle(d).boxShadow).filter(s => s && s !== 'none'))].slice(0, 3), rect: { top: Math.round(absTop(el)), height: Math.round(el.getBoundingClientRect().height) } }; }); })();
  // css custom properties + @font-face from same-origin sheets
  const cssCustomProperties = []; const fontFaces = []; let sheetErrors = 0;
  for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch { sheetErrors++; continue; } const walk = (rs) => { for (const r of rs) { if (r.type === 1 && /(^|,)\s*(:root|html)\s*(,|$)/.test(r.selectorText || '')) { for (const p of r.style) if (p.startsWith('--')) cssCustomProperties.push({ name: p, value: r.style.getPropertyValue(p).trim() }); } else if (r.type === 5) { fontFaces.push({ family: r.style.getPropertyValue('font-family').replace(/["']/g, '').trim(), weight: r.style.getPropertyValue('font-weight') || '400', style: r.style.getPropertyValue('font-style') || 'normal', display: r.style.getPropertyValue('font-display') || null, src: r.style.getPropertyValue('src'), unicodeRange: r.style.getPropertyValue('unicode-range') || null, cssText: r.cssText.slice(0, 600), sheet: sh.href || 'inline' }); } else if (r.cssRules) walk(r.cssRules); } }; walk(rules); }
  // icon font
  const iconEls = [...document.querySelectorAll('[class^="icon-"],[class*=" icon-"],i.icon,[data-icon],[class*="atlas-icon" i],[class^="ei-"],[class*=" ei-"]')].slice(0, 300);
  const glyphs = new Map(); let iconFamily = null;
  for (const el of iconEls) { const cs = getComputedStyle(el, '::before'); const c = cs.content; if (!c || c === 'none' || c === '""' || c === 'normal') continue; if (/^"[\w\s.,-]{2,}"$/.test(c)) continue; const fam = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim(); if (/^(system-ui|-apple-system|arial|helvetica|roboto|sans-serif|serif)$/i.test(fam)) continue; iconFamily = iconFamily || fam; const cls = [...el.classList].find(k => /icon|^ei-/.test(k)) || el.className; const cp = c.replace(/"/g, ''); const key = cls + '|' + cp; if (!glyphs.has(key)) glyphs.set(key, { class: cls, codepoint: '\\' + cp.codePointAt(0).toString(16).toUpperCase(), name: (cls.match(/icon-(.+)$/) || cls.match(/^ei-(.+)$/) || [])[1] || null }); }
  const iconFont = iconFamily ? { family: iconFamily, glyphs: [...glyphs.values()] } : null;
  // text rendering group
  const bcs = getComputedStyle(document.body);
  const textRendering = { textRendering: bcs.textRendering, webkitFontSmoothing: bcs.webkitFontSmoothing, fontSynthesis: bcs.fontSynthesis, fontKerning: bcs.fontKerning, fontVariantNumeric: bcs.fontVariantNumeric, bodyFontFamily: bcs.fontFamily, bodyFontSize: bcs.fontSize, bodyLineHeight: bcs.lineHeight, bodyColor: bcs.color, bodyBackground: bcs.backgroundColor, htmlFontSize: getComputedStyle(document.documentElement).fontSize };
  // container model probe: widest common content width
  const containerCands = [...document.querySelectorAll('main *')].filter(vis).map(el => { const cs = getComputedStyle(el); return { w: Math.round(el.getBoundingClientRect().width), mw: cs.maxWidth, ml: cs.marginLeft, mr: cs.marginRight, domPath: null, el }; }).filter(c => c.mw && c.mw !== 'none' && /px|rem|%/.test(c.mw));
  const containerMode = mode(containerCands.map(c => c.mw));
  const containerModel = { maxWidthMode: containerMode, sample: containerCands.filter(c => c.mw === containerMode).slice(0, 2).map(c => ({ domPath: domPath(c.el), renderedWidth: c.w, marginLeft: c.ml, marginRight: c.mr })), documentHeight: Math.round(document.documentElement.scrollHeight), viewport: { width: innerWidth, height: innerHeight } };
  const wordCount = txt(document.body).split(/\s+/).filter(Boolean).length;
  return { title: document.title, metaDescription: md || null, canonical: document.querySelector('link[rel="canonical"]')?.href || null, og: { title: og('title'), description: og('description'), image: og('image'), type: og('type'), siteName: og('site_name') }, themeColor, language: document.documentElement.lang || null, generator: meta('generator'), heroHeadline, heroLede, heroSource, headings, landmarks, ctas, links, media: { images, inlineSvgs, cssBackgrounds, videos, iframes }, forms, widgets, components, perSectionStyle, embedDominance, cssCustomProperties, fontFaces, sheetErrors, iconFont, textRendering, containerModel, stats: { wordCount, ctaCount: ctas.length, internalLinkCount: links.internal.length, externalLinkCount: links.external.length, imageCount: images.length, headingCount: headings.length } };
};

async function revealPass(page) {
  await page.evaluate(() => {
    for (const d of document.querySelectorAll('details')) d.open = true;
    for (const t of document.querySelectorAll('[aria-expanded="false"][aria-controls]')) { if (t.closest('[role="dialog"],nav,header')) continue; try { t.click(); } catch {} }
    for (const t of document.querySelectorAll('[role="tab"][aria-selected="false"]')) { try { t.click(); } catch {} }
  }).catch(() => {});
  await page.waitForTimeout(400);
}
async function scrollPass(page) {
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  const step = Math.max(900, Math.ceil(h / 4));
  for (let y = step; y < h + step; y += step) { await page.evaluate((yy) => window.scrollTo(0, yy), y); await page.waitForTimeout(300); }
  await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
}

const browser = await chromium.launch({ headless: true });
let idx = 0; const results = [];
async function worker(wid) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, userAgent: UA, locale: 'en-US', reducedMotion: 'reduce', colorScheme: 'light', ignoreHTTPSErrors: true });
  ctx.on('response', async (res) => { try { const u = res.url(); const ct = res.headers()['content-type'] || ''; if (/\.(woff2?|ttf|otf|eot)(\?|$)/i.test(u) || ct.startsWith('font/') || /font-woff/.test(ct)) { if (fontFiles.has(u)) return; fontFiles.set(u, null); const body = await res.body(); const base = path.basename(new URL(u).pathname); const local = path.join(fontsDir, base); if (!existsSync(local)) writeFileSync(local, body); fontFiles.set(u, { localPath: path.relative(process.cwd(), local), contentType: ct, bytes: body.length }); } } catch {} });
  const page = await ctx.newPage();
  // consent dismissal pre-flight (recipe § Pre-flight) on first page
  let first = true;
  while (idx < queue.length) {
    const f = queue[idx++]; const slug = f.replace('.json', '');
    const rec = JSON.parse(readFileSync(path.join(pagesDir, f), 'utf8'));
    const url = rec.finalUrl || rec.url; const t0 = Date.now();
    try {
      const resp = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
      await page.waitForTimeout(2000);
      if (first) { await page.evaluate(() => { try { window.OneTrust?.RejectAll?.(); } catch {} }); for (const sel of ['#onetrust-reject-all-handler', '#onetrust-accept-btn-handler', '[aria-label*="close" i][class*="cookie" i]']) { try { await page.click(sel, { timeout: 1500 }); break; } catch {} } first = false; }
      await scrollPass(page); await revealPass(page);
      const cap = await page.evaluate(CAPTURE);
      // resolve check for up to 40 visible images (HEAD w/ UA + Referer)
      const imgs = cap.media.images.filter(i => i.visible && (i.currentSrc || i.src)).slice(0, 40);
      await Promise.all(imgs.map(async (i) => { const u = i.currentSrc || new URL(i.src, url).href; try { const r = await ctx.request.head(u, { headers: { Referer: url }, timeout: 8000 }); i.resolves = r.ok() && /image\//.test(r.headers()['content-type'] || ''); } catch { i.resolves = false; } }));
      if (cap.iconFont) iconFontPages[slug] = cap.iconFont;
      for (const ff of cap.fontFaces) { const k = `${ff.family}|${ff.weight}|${ff.style}|${ff.src}`; if (!fontFaceRules.has(k)) fontFaceRules.set(k, ff); }
      // merge — keep crawl.mjs provenance + body/codeBlocks/customProps/_signals/screenshot
      const merged = { _provenance: { ...rec._provenance, stylePass: { fetchedAt: new Date(t0).toISOString(), waitMs: Date.now() - t0, httpStatus: resp?.status() ?? null, viewport: '1440x900@2x', script: 'stardust/scripts/capture-styles.mjs' } }, slug: rec.slug, url: rec.url, finalUrl: rec.finalUrl || page.url(), renderedBy: rec.renderedBy, fetchedAt: rec.fetchedAt, title: rec.title || cap.title, metaDescription: rec.description ?? cap.metaDescription, canonical: cap.canonical, og: cap.og, themeColor: cap.themeColor, language: cap.language, generator: cap.generator, heroHeadline: cap.heroHeadline, heroLede: cap.heroLede, heroSource: cap.heroSource, headings: cap.headings.length ? cap.headings : (rec.headings || []).map(h => ({ level: +h.tag[1], text: h.text })), headingsCrawl: rec.headings, body: rec.body, codeBlocks: rec.codeBlocks, landmarks: cap.landmarks, ctas: cap.ctas, ctasCrawl: rec.ctas, links: cap.links, media: { ...cap.media, imgsCrawl: rec.media?.imgs, allImgCount: rec.media?.allImgCount, modals: rec.media?.modals }, forms: cap.forms, widgets: cap.widgets, components: cap.components, perSectionStyle: cap.perSectionStyle, embedDominance: cap.embedDominance, cssCustomProperties: cap.cssCustomProperties.length ? cap.cssCustomProperties : Object.entries(rec.customProps || {}).map(([name, value]) => ({ name, value })), customProps: rec.customProps, fontFaces: cap.fontFaces, iconFont: cap.iconFont, textRendering: cap.textRendering, containerModel: cap.containerModel, _signals: rec._signals, dynamic: rec.dynamic, renderedHtml: rec.renderedHtml, screenshot: rec.screenshot, stats: cap.stats };
      writeFileSync(path.join(pagesDir, f), JSON.stringify(merged, null, 2));
      results.push({ slug, ok: true, ms: Date.now() - t0, headings: cap.headings.length, ctas: cap.ctas.length, sections: cap.perSectionStyle.length, imgs: cap.media.images.length, bg: cap.media.cssBackgrounds.length, forms: cap.forms.length, fontFaces: cap.fontFaces.length });
      console.error(`[styles] OK   ${slug}  ${Date.now() - t0}ms h=${cap.headings.length} cta=${cap.ctas.length} sec=${cap.perSectionStyle.length} img=${cap.media.images.length} bg=${cap.media.cssBackgrounds.length}`);
    } catch (e) { results.push({ slug, ok: false, error: e.message.split('\n')[0] }); console.error(`[styles] FAIL ${slug}: ${e.message.split('\n')[0]}`); }
  }
  await ctx.close();
}
await Promise.all(Array.from({ length: args.concurrency }, (_, i) => worker(i)));
await browser.close();
const fontsOut = { _provenance: { writtenBy: 'stardust:extract (capture-styles.mjs)', writtenAt: new Date().toISOString() }, files: [...fontFiles.entries()].filter(([, v]) => v).map(([url, v]) => ({ url, ...v })), fontFaces: [...fontFaceRules.values()], iconFontPages };
writeFileSync(path.join(args.out, '_fonts.json'), JSON.stringify(fontsOut, null, 2));
writeFileSync(path.join(args.out, '_style-pass-log.json'), JSON.stringify({ writtenAt: new Date().toISOString(), results }, null, 2));
console.error(`[styles] done. ${results.filter(r => r.ok).length}/${results.length} ok; fonts saved: ${fontsOut.files.length}; @font-face rules: ${fontsOut.fontFaces.length}`);
