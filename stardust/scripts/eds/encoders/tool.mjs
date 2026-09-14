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
import { isService } from './utility.mjs';

const { section, q, qa, inline } = L;

const isLead = (root) => { const ps = qa(root, ':scope > p').filter((p) => p.textContent.trim()); return ps.length > 0 && ps.every((p) => p.children.length === 1 && p.children[0].tagName === 'SPAN' && p.textContent.trim() === p.children[0].textContent.trim()); };

/** The hr module before a root: convert.mjs carries rule--visible / rule--extra-top; the live `rule--extra-bottom` (64px below the rule) lands on the next section. */
const ruleBefore = (root) => { const prev = root.previousElementSibling; return prev?.tagName === 'HR' && /rule--extra-bottom/.test(prev.className) ? 'rule' : null; };

export default {
  // a live module container the capture holds EMPTY (the prisliste bank-chooser accordion is rendered client-side): nothing to author, no gap
  // (convert.mjs resolves the FIRST class with an encoder, and `module` precedes `module--…` in the class list — so the core fallback key is wrapped, service-gated)
  module: (root, ctx) => { if (isService(ctx) && root.classList.contains('module--accordion-list-container') && !root.textContent.trim()) { ctx.notes.push('module accordion-list-container: empty in the capture (client-rendered bank chooser — dynamics; nothing authored, no gap)'); return { html: '', blocks: [] }; } return CORE.module(root, ctx); },
  // top-level CTA row (live .button-wrap--center): default content emphasised link, centred by the section style
  'button-wrap': (root, ctx) => { if (!isService(ctx)) return null; const html = richtext(root, ctx); if (!html) return null; return { html: section([html], { style: styleOf('cta', /button-wrap--center/.test(root.className) ? 'center' : null, 'service', ruleBefore(root)) }), blocks: [] }; },
  // top-level image module (live .image--center --w:600px): default content picture; the section style carries the live centring/width
  image: (root, ctx) => {
    if (!isService(ctx)) return null; const img = q(root, 'img'); if (!img) return null;
    const w = /--w:\s*(\d+)px/.exec(root.getAttribute('style') || '')?.[1];
    return { html: section([L.pic(img, ctx)], { style: styleOf('image', /image--center/.test(root.className) ? 'center' : null, w ? `w-${w}` : null, 'service', ruleBefore(root)) }), blocks: [] };
  },
  title: (root, ctx) => {
    if (!isService(ctx)) return null;
    const h1 = q(root, 'h1'); if (!h1) return null;
    return { html: section([`<h1>${inline(h1, ctx).replace(/\s+/g, ' ').trim()}</h1>`], { style: 'title, service' }), blocks: [] };
  },
  richtext: (root, ctx) => {
    if (isService(ctx) && !root.textContent.trim()) { const n = qa(root, ':scope > p').length; ctx.notes.push(`richtext: ${n} empty paragraph(s) only (the live author spacer) → an empty section styled spacer-only-${n}`); return { html: section([], { style: `spacer-only-${n}` }), blocks: [] }; }
    if (!isService(ctx) || !isLead(root)) return CORE.richtext(root, ctx);
    ctx.notes.push('lead-intro: the page lead (live p > span.main-lead / .lead-blue — 24/32 fjell centred in a 700px column) is default content typed by the section style');
    return { html: section([richtext(root, ctx)], { style: 'lead-intro, service' }), blocks: [] };
  },
};
