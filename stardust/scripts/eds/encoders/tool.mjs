/**
 * encoders/tool.mjs — family encoders for the "tool" archetype (Verktøy pages — sperre-kort.html + 5 siblings). The band /
 * cols walker, the table block and the family gate are shared with utility.mjs (both are "service" pages).
 * Adds (service-gated; every other page falls through to the core encoder / module fallback unchanged):
 *   title     — the AEM page-title module (div.title > h1) → default content h1, section style `title` (centred, margin 16/8 → 16/24)
 *   richtext  — a top-level page lead (p > span.main-lead / .lead-blue) → default content, section style `lead-intro`
 *               (700px centred column, 24/32 fjell centred, 18/24 on mobile); any other richtext keeps the core encoder
 *   (tip — the FFE message box variants live in utility.mjs: the loader merges utility.mjs after tool.mjs)
 */
import * as L from '../lib.mjs';
import { ENCODERS as CORE, richtext, styleOf } from '../encoders.mjs';
import { isService, serviceBand } from './utility.mjs';
import { hubRelated } from './category-hub.mjs';
import { readFileSync } from 'node:fs';

/** The page's live URL (for document-relative hrefs such as the site search `?search`). */
const URLS = (() => { try { return Object.fromEntries(JSON.parse(readFileSync('stardust/state.json', 'utf8')).pages.map((p) => [p.slug, p.url])); } catch { return {}; } })();
export const absQuery = (html, ctx) => html.replace(/href="\?([^"]*)"/g, (m, qs) => { ctx.notes.push(`href: document-relative "?${qs}" (the live site search) → fully-qualified on the page URL (D4)`); return `href="${L.esc((URLS[ctx.slug] || L.SOURCE_ORIGIN) + '?' + qs)}"`; });

const { section, block, q, qa, inline, esc } = L;

const isLead = (root) => { const ps = qa(root, ':scope > p').filter((p) => p.textContent.trim()); return ps.length > 0 && ps.every((p) => p.children.length === 1 && p.children[0].tagName === 'SPAN' && p.textContent.trim() === p.children[0].textContent.trim()); };

/** The hr module before a root: convert.mjs carries rule--visible / rule--extra-top; the live `rule--extra-bottom` (64px below the rule) lands on the next section. */
const ruleBefore = (root) => { const prev = root.previousElementSibling; return prev?.tagName === 'HR' && /rule--extra-bottom/.test(prev.className) ? 'rule' : null; };

export default {
  // a live module container the capture holds EMPTY (the prisliste bank-chooser accordion is rendered client-side): nothing to author, no gap
  // (convert.mjs resolves the FIRST class with an encoder, and `module` precedes `module--…` in the class list — so the core fallback key is wrapped, service-gated)
  module: (root, ctx) => {
    if (!isService(ctx)) return CORE.module(root, ctx);
    const kind = [...root.classList].find((c) => c.startsWith('module--'))?.slice(8) || 'module';
    if (!root.textContent.trim()) { ctx.notes.push(`module ${kind}: empty in the capture (client-rendered — dynamics; nothing authored, no gap)`); return { html: '', blocks: [] }; }
    // progressive-disclosure: a toggle label + (heading, note) + a data table hidden at rest → default content head + `table disclosure`
    // (the block reabsorbs the head: the label moves beside the chevron button — EW7/EW8 — the rest heads the collapsible panel)
    if (kind === 'progressive-disclosure') {
      const label = q(root, 'button'); const t = q(root, 'table'); const head = [...qa(root, 'h1, h2, h3, h4')].filter((h) => !t || !t.contains(h));
      const parts = [`<p>${inline(label, ctx).replace(/\s+/g, ' ').trim()}</p>`, ...head.map((h) => `<${h.tagName.toLowerCase()}>${inline(h, ctx).replace(/\s+/g, ' ').trim()}</${h.tagName.toLowerCase()}>`)];
      const blocks = [];
      if (t) { const rows = qa(t, 'tr').map((tr) => [...tr.children].map((c) => { const ps = qa(c, 'p'); return ps.length ? ps.map((p) => `<p>${inline(p, ctx).trim()}</p>`).join('') : `<p>${inline(c, ctx).trim()}</p>`; })); parts.push(block('table', ['disclosure'], rows)); blocks.push('table'); }
      ctx.notes.push('lint D11 table disclosure: the live progressive-disclosure (toggle button → heading + data table) — the toggle label and heading are default content the block reabsorbs; the table is the Block Collection table (4 columns)');
      return { html: section(parts, { style: 'disclosure, service' }), blocks };
    }
    // currency-converter: a client-rendered React widget (rates from an API) → the calculator snapshot pattern (dynamics interim, like the loan calculator)
    if (kind === 'currency-converter') {
      ctx.notes.push('lint D1 calculator currency: the live currency converter is a client-rendered widget (dynamics interim) — the row links the captured snapshot /data/calculator/valutakalkulator.html (@ew-exempt in calculator.js)');
      return { html: section([block('calculator', ['currency'], [['<p><a href="/data/calculator/valutakalkulator.html">Valutakalkulator</a></p>']])]), blocks: ['calculator'] };
    }
    // accordion / step-by-step / accordion-list-container … captured as plain richtext (the live module chrome is client-rendered): default content
    const html = absQuery(richtext(root, ctx), ctx); if (!html.trim()) return null;
    ctx.notes.push(`module ${kind}: captured as plain richtext (its client-side chrome is not in the DOM) → default content, section style module-prose`);
    return { html: section([html], { style: 'module-prose, service' }), blocks: [] };
  },
  // service related-products (icon card list — core relatedTopics reads .newsfeed cards only → 0 rows): heading + `cards small`, as the hubs
  'related-products': (root, ctx) => { if (!isService(ctx) || !q(root, '.card-list')) return CORE['related-products'](root, ctx); const r = hubRelated(root, ctx); return { html: section(r.parts, { style: 'related, service' }), blocks: r.blocks }; },
  // top-level CTA row (live .button-wrap--center): default content emphasised link, centred by the section style
  'button-wrap': (root, ctx) => { if (!isService(ctx)) return null; const html = richtext(root, ctx); if (!html) return null; return { html: section([html], { style: styleOf('cta', /button-wrap--center/.test(root.className) ? 'center' : null, 'service', ruleBefore(root)) }), blocks: [] }; },
  // top-level image module (live .image--center --w:600px): default content picture; the section style carries the live centring/width
  image: (root, ctx) => {
    if (!isService(ctx)) return null; const img = q(root, 'img'); if (!img) return null;
    const w = /--w:\s*(\d+)px/.exec(root.getAttribute('style') || '')?.[1];
    return { html: section([L.pic(img, ctx)], { style: styleOf('image', /image--center/.test(root.className) ? 'center' : null, w ? `w-${w}` : null, 'service', ruleBefore(root)) }), blocks: [] };
  },
  title: (root, ctx) => {
    // the AEM page-title module is generic (product siblings, om-oss experts carry it too): the `service` token stays family-scoped
    const h = q(root, 'h1, h2, h3'); if (!h) return null; const t = h.tagName.toLowerCase();
    return { html: section([`<${t}>${inline(h, ctx).replace(/\s+/g, ' ').trim()}</${t}>`], { style: `title${t === 'h1' ? '' : '-' + t}${isService(ctx) ? ', service' : ''}` }), blocks: [] };
  },
  richtext: (root, ctx) => {
    if (isService(ctx) && !root.textContent.trim()) { const n = qa(root, ':scope > p').length; ctx.notes.push(`richtext: ${n} empty paragraph(s) only (the live author spacer) → an empty section styled spacer-only-${n}`); return { html: section([], { style: `spacer-only-${n}` }), blocks: [] }; }
    if (!isService(ctx) || !isLead(root)) return CORE.richtext(root, ctx);
    ctx.notes.push('lead-intro: the page lead (live p > span.main-lead / .lead-blue — 24/32 fjell centred in a 700px column) is default content typed by the section style');
    return { html: section([richtext(root, ctx)], { style: 'lead-intro, service' }), blocks: [] };
  },
};
