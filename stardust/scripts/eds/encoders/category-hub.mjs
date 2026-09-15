/**
 * encoders/category-hub.mjs — family encoders for the hub landings (category-hub: /nb/bank/privat/lan.html + 19 siblings;
 * kundeservice-hub.mjs imports the shared hub helpers from here).
 * Core keys overridden here (band, cols, banner-small, shortcuts, tip) are FAMILY-GATED: a page outside the hub families
 * falls through to the core encoder unchanged, so the product page (boliglan) converts byte-identically. Cross-cutting
 * findings (core band() nesting, related-products .card-list, /content/sites/sb1 hrefs, the syrin tint) are filed in
 * stardust/rollout/eds-requests.md — mirrored locally, not applied to the core.
 */
import fs from 'node:fs';
import * as L from '../lib.mjs';
import { ENCODERS as CORE, richtext, cardRows, bannerSmall, bandBg, bgToken, styleOf } from '../encoders.mjs';

const { section, block, heading, q, qa, cls, esc, inline, pic, ctaHtml } = L;
const { imgHtml } = L;

const FAMILY = (() => { try { return Object.fromEntries(JSON.parse(fs.readFileSync('stardust/state.json', 'utf8')).pages.map((p) => [p.slug, p.archetypeFamily])); } catch { return {}; } })();
export const familyOf = (ctx) => FAMILY[ctx.slug] || '';
export const HUB_FAMILIES = new Set(['category-hub', 'kundeservice-hub']);
export const isHub = (ctx) => HUB_FAMILIES.has(familyOf(ctx));
/** Families whose bands go through the document-order walker (hub families + the market landings). */
export const WALKER_FAMILIES = new Set([...HUB_FAMILIES, 'market-landing']);
export const usesWalker = (ctx) => WALKER_FAMILIES.has(familyOf(ctx));

/** AEM-internal resource paths (/content/sites/sb1/<path>) ARE the public <path>: normalised before lib.href resolves roster vs bounce. */
const SITES = /^(?:https?:\/\/www\.sparebank1\.no)?\/content\/sites\/sb1\//;
export const href = (h = '') => L.href(h.replace(SITES, '/'));
export function normaliseHrefs(root, ctx) {
  for (const a of qa(root, 'a[href]')) {
    const h = a.getAttribute('href') || '';
    if (SITES.test(h)) { a.setAttribute('href', h.replace(SITES, 'https://www.sparebank1.no/')); continue; }
    // live authoring placeholders ("Legg inn link til …", "${links.x}") are not URLs: authored as "#" (lint D4), recorded
    if (h && !/^(https?:|\/|#|mailto:|tel:|\?)/.test(h)) { ctx?.notes?.push(`href: live placeholder "${h.slice(0, 60)}" on "${a.textContent.trim().slice(0, 40)}" → "#" (authoring error on the live page)`); a.setAttribute('href', '#'); }
  }
  return root;
}

/** W6: live inline pseudo-heading spans that are NOT the whole paragraph (<p>… <span class="h6">sparing på 1-2-3</span>.</p>) keep their medium face
 *  as authored emphasis (<strong> renders in the medium face site-wide, styles.css b/strong); lib.inline would flatten the span to plain text. */
export function pseudoInline(root) {
  for (const sp of qa(root, 'p span[class]')) {
    if (!/\b(?:ffe-)?h[2-6]\b/.test(sp.getAttribute('class') || '')) continue;
    const p = sp.closest('p'); if (!p || p.textContent.trim() === sp.textContent.trim()) continue; // whole-paragraph spans → lib.prose heading rank swap
    const st = sp.ownerDocument.createElement('strong'); while (sp.firstChild) st.append(sp.firstChild); sp.replaceWith(st);
  }
  // a linked heading whose whole text is a pseudo-heading span (<h3><a><span class="h4">Bil</span></a></h3>, forsikring boxes) takes the span's visual rank like lib.headingTag does for a bare span
  for (const h of qa(root, 'h1, h2, h3, h4, h5')) {
    const a = h.children.length === 1 && h.children[0].tagName === 'A' ? h.children[0] : null; const sp = a && a.children.length === 1 && a.children[0].tagName === 'SPAN' ? a.children[0] : null;
    const m = sp && h.textContent.trim() === sp.textContent.trim() && /\b(?:ffe-)?h([2-6])\b/.exec(sp.getAttribute('class') || '');
    if (m && `h${m[1]}` !== h.tagName.toLowerCase()) { const nh = h.ownerDocument.createElement(`h${m[1]}`); for (const at of h.attributes) nh.setAttribute(at.name, at.value); while (h.firstChild) nh.append(h.firstChild); h.replaceWith(nh); }
  }
  return root;
}
/** Hub prose prep: href normalisation + inline pseudo-heading spans → <strong>. */
export const prep = (root, ctx) => (root ? pseudoInline(normaliseHrefs(root, ctx)) : root);
const isSvg = (img) => /\.svg(\?|$)/i.test(img?.getAttribute('src') || '');
/** W6 card rows: canon [media][body] + the bodies canon drops — featured/boxed richtext (headings, paragraphs, links), CTA buttons, publication dates.
 *  A body with a `.richtext` (live text-wrapper) is authored as prose (title heading keeps its own link); tag/title/text cards go the core way + date. */
export function hubCardRows(cards, ctx) {
  return cards.map((card) => {
    prep(card, ctx);
    const img = q(card, '.card__media img, .card__iconwrap img');
    const content = q(card, '.card__content'); const rt = q(content, ':scope > .richtext');
    let body = '';
    if (rt) { for (const ch of content.children) body += /\brichtext\b/.test(ch.className) ? richtext(ch, ctx) : /\bbutton-wrap\b|\bbutton-list\b/.test(ch.className) ? qa(ch, 'a.btn').map((a) => ctaHtml(a, ctx)).join('') : richtext({ childNodes: [ch] }, ctx); }
    else {
      const title = q(card, '.card__title'); const tag = q(card, '.card__tag'); const texts = qa(card, '.card__text'); const date = q(card, '.card__date');
      const hrefV = title?.tagName === 'A' ? href(title.getAttribute('href') || '') : '';
      if (tag) body += `<p>${inline(tag, ctx)}</p>`;
      if (title) body += hrefV ? `<h3><a href="${esc(hrefV)}">${inline(title, ctx)}</a></h3>` : `<h3>${inline(title, ctx)}</h3>`;
      if (date) body += `<p>${esc(date.textContent.trim())}</p>`;
      for (const t of texts) body += `<p>${inline(t, ctx)}</p>`;
      for (const bw of qa(content, ':scope > .button-wrap, :scope > .button-list')) body += qa(bw, 'a.btn').map((a) => ctaHtml(a, ctx)).join('');
    }
    return [img ? pic(img, ctx) : '', body];
  });
}
/** Block variants for a set of hub cards (one live pattern per block, D9): featured (+photo when the media is a cover photo, +center when the live text is
 *  centred), illustrated (medium clickable card with a contain-fit illustration — never the small icon card), plain (medium text-only cards, 20px title). */
export function hubCardVariants(cards) {
  const v = [];
  const featured = cards.every((c) => c.classList.contains('card--featured'));
  if (featured) {
    v.push('featured', 'hub');
    if (cards.some((c) => q(c, '.card__media') && !q(c, '.card__media--contain'))) v.push('photo');
    if (cards.every((c) => !q(c, '.card__content h1, .card__content h2, .card__content h3, .card__content h4') || qa(c, '.card__content :is(h1,h2,h3,h4)').every((h) => /\bta-center\b/.test(h.className)))) v.push('center');
    const texts = cards.flatMap((c) => qa(c, '.card__content .richtext > p').filter((p) => !q(p, 'a') || p.textContent.trim() !== q(p, 'a').textContent.trim()));
    if (texts.length && texts.every((p) => q(p, 'span.sub-lead, span.sub-lead-left'))) v.push('lead-text'); // live: every card paragraph is a sub-lead span (18/28)
    return v;
  }
  if (cards.every((c) => q(c, '.card__media--contain'))) v.push('illustrated');
  else if (cards.every((c) => !q(c, '.card__media img, .card__iconwrap img'))) v.push('plain');
  else v.push('hub'); // photo cards (live card__container-image--center): the content wrapper keeps the live 106px minimum
  return v;
}
/** A "boxed" grid cell: the live white background-container inside a grid column (illustration, h3 (+link), text, expander) — forsikring / tips-og-rad. */
const boxOf = (col) => { const cc = q(col, ':scope > .col__content'); const kids = cc ? [...cc.children] : []; const b = kids.length === 1 && kids[0].matches('section.band') ? kids[0] : null; return b && /--band-bg:\s*#fff/i.test(b.getAttribute('style') || '') ? b : null; };
/** Boxed cell → [media][body][expander?]: the expander cell holds the toggle label paragraph first, then the hidden list (lint D3 positional; EW8 label → button). */
export function boxRows(boxes, ctx) {
  return boxes.map((b) => {
    prep(b, ctx); const c = q(b, '.band__content') || b;
    const img = q(c, ':scope > .image img');
    let body = ''; for (const ch of c.children) { if (/\bimage\b/.test(ch.className) || /\bdisclosure\b/.test(ch.className)) continue; body += /\brichtext\b/.test(ch.className) ? richtext(ch, ctx) : /\bbutton-wrap\b|\bbutton-list\b/.test(ch.className) ? qa(ch, 'a.btn').map((a) => ctaHtml(a, ctx)).join('') : richtext({ childNodes: [ch] }, ctx); }
    const d = q(c, ':scope > .disclosure'); let exp = '';
    if (d) { const label = q(d, '.disclosure__btn .btn__label')?.textContent.replace(/\s+/g, ' ').trim() || ''; exp = `<p>${esc(label)}</p>${richtext(q(d, '.disclosure__inner') || q(d, '.disclosure__content'), ctx)}`; }
    return exp ? [img ? pic(img, ctx) : '', body, exp] : [img ? pic(img, ctx) : '', body];
  });
}
/** Media cell model of an image-only column: authored ratio → nearest media-W-H; SVG without ratio/width → media-plain; a second image (partner logo) → media-logo. */
function mediaTokens(col) {
  const cc = q(col, ':scope > .col__content'); if (!cc) return [];
  const images = [...cc.children].filter((ch) => /\bimage\b/.test(ch.className)); if (!images.length || images.length !== cc.children.length) return [];
  const out = []; const im = images[0]; const st = im.getAttribute('style') || ''; const img = q(im, 'img');
  const ratio = /--ratio:\s*([\d.]+)\/([\d.]+)/.exec(st);
  if (ratio) { const r = ratio[1] / ratio[2]; const near = [['4-3', 4 / 3], ['16-9', 16 / 9], ['2-1', 2], ['1-1', 1], ['5-8', 5 / 8], ['3-4', 3 / 4]].find(([, v]) => Math.abs(r / v - 1) < 0.04); if (near) out.push(`media-${near[0]}`); }
  else if (!/--w:/.test(st) && isSvg(img)) out.push('media-plain');
  if (images.length > 1 && /brand-logo/.test(images[1].className)) out.push('media-logo');
  return out;
}
const hasCheckedList = (root) => !!q(root, '.checked-list ul');
/** W6: live tinted wraps that follow another wrap touch (no 72px module margin) — band, cols, static-cards, related-*, text-and-image, a reference holding cols. */
const BANDLIKE = /\b(band|cols|static-cards|related-products|related-topics|text-and-image)\b/;
export const flushToken = (root, ctx) => { if (familyOf(ctx) !== 'category-hub') return null; let prev = root.previousElementSibling; while (prev && prev.tagName === 'HR' && !/rule--(extra-top|visible)/.test(prev.className)) prev = prev.previousElementSibling; /* a plain hr module between two wraps adds nothing on live (sparing cols → frost band) */ if (!prev) return null; const k = prev.getAttribute('class') || ''; return BANDLIKE.test(k) || (/\breference\b/.test(k) && q(prev, ':scope > .cols')) ? 'hub-flush' : null; };

/** Band tint token: the core palette plus the hub tint the core map lacks (syrin-30 = --ffe-farge-syrin-30). */
const TINT = { '#f2f2f9': 'syrin' };
export const tint = (hex) => (hex ? (bgToken(hex) ?? TINT[hex] ?? null) : null);

/** Append section-style tokens to an encoder result (same section-metadata patch convert.mjs applies for a preceding hr). */
export function withStyle(r, ...tokens) {
  const add = tokens.filter(Boolean).join(', '); if (!r || !add) return r;
  if (/<div class="section-metadata"><div><div>style<\/div><div>/.test(r.html)) r.html = r.html.replace(/(<div class="section-metadata"><div><div>style<\/div><div>)([^<]*)/, (m, a, v) => `${a}${v}, ${add}`);
  else r.html = r.html.replace(/<\/div>\s*$/, `${L.sectionMeta({ style: add })}</div>`);
  return r;
}

const gridCols = (row) => { const m = /grid-row--cols-(\d+)/.exec(row.getAttribute('class') || ''); return m && m[1] !== '12' ? `cols-${m[1]}` : null; };

/** An image-only column holding an illustration (SVG, not a /foto/ photo) renders at its authored max-width, centred, uncropped:
 *  the prototype carries it as `--w` on .image (market-landing); the hub illustration (kundeservice cols) is the lifted 400px. → cell model token `wN`. */
function illustrationWidth(col, ctx) {
  const cc = q(col, ':scope > .col__content'); if (!cc) return null;
  const image = q(cc, ':scope > .image'); const img = image && q(image, 'img'); if (!img) return null;
  const m = /--w:\s*(\d+)px/.exec(image.getAttribute('style') || ''); if (m) return `w${m[1]}`; // authored max-width (live img style)
  const imageOnly = [...cc.children].every((ch) => /\bimage\b/.test(ch.getAttribute('class') || ''));
  return imageOnly && familyOf(ctx) === 'kundeservice-hub' && /\.svg(\?|$)/i.test(img.getAttribute('src') || '') ? 'w400' : null; // the kundeservice illustration column (lifted 400px; other hubs let the image fill its column)
}
/** A link-list column: a heading / label followed by ≥2 paragraphs that are each a single plain link (market-landing bands). */
function isLinkList(col) {
  const cc = q(col, ':scope > .col__content'); if (!cc || q(cc, 'a.btn, .button-wrap')) return false;
  const ps = qa(cc, '.richtext > p').filter((p) => p.textContent.trim());
  const links = ps.filter((p) => p.children.length === 1 && p.children[0].tagName === 'A' && p.textContent.trim() === p.children[0].textContent.trim());
  return links.length >= 2 && links.length >= ps.length - 1;
}

/** One live .grid-row → { kind: 'cards' | 'columns' | 'prose' } — mirrors core band(): card-grid row, single centred heading row, text/image columns.
 *  Adds: `cols-N` (the live grid is N columns wide, centred), `chat` (a boost.ai entry field in the last column). */
export function gridRow(row, ctx) {
  const cols = qa(row, ':scope > .col');
  const cards = cols.filter((c) => q(c, ':scope > .col__content > .card'));
  if (cards.length && cards.length === cols.length) {
    const span = (cls(cols[0]).find((c) => /^col-lg-\d+$/.test(c)) || 'col-lg-3').replace('col-', '');
    const cardEls = cols.map((c) => q(c, '.card'));
    if (familyOf(ctx) === 'category-hub') { const hv = hubCardVariants(cardEls); if (hv.includes('featured')) ctx.notes.push('lint D5 cards featured hub: the live featured card (illustration/photo + h2/h3 + paragraphs + link + CTA) — one row per card [media][body]; the body is the live text-wrapper prose, the CTA its emphasised link'); return { kind: 'cards', variants: ['grid', span, gridCols(row), ...hv].filter(Boolean), rows: hubCardRows(cardEls, ctx) }; }
    return { kind: 'cards', variants: ['grid', span, gridCols(row)].filter(Boolean), rows: cardRows(cardEls.map((c) => normaliseHrefs(c)), ctx) };
  }
  const boxes = cols.map(boxOf);
  if (familyOf(ctx) === 'category-hub' && boxes.length && boxes.every(Boolean)) { // white boxes in a grid row = the hub category cards (illustration, title, text, expander)
    const span = (cls(cols[0]).find((c) => /^col-lg-\d+$/.test(c)) || 'col-lg-4').replace('col-', '');
    const rows = boxRows(boxes, ctx);
    ctx.notes.push(`lint D3 cards boxed: the live white background-container cells of a grid row (illustration, title, text${rows.some((r) => r.length > 2) ? ', expander' : ''}) — one row per box [media][body]${rows.some((r) => r.length > 2) ? '[expander: label paragraph, then the revealed list (EW8: the label moves into the expand button)]' : ''}`);
    const hs = boxes.map((b) => /--h:\s*(\d+)px/.exec(q(b, '.image')?.getAttribute('style') || '')?.[1]).filter(Boolean); const h = hs.length === boxes.length && new Set(hs).size === 1 ? `h${hs[0]}` : null; // live img style height (letterboxed illustration)
    const inlineExp = boxes.some((b) => q(b, '.disclosure--inline'));
    const subtle = boxes.every((b) => { const ps = qa(b, '.band__content > .richtext > p').filter((p) => !q(p, 'a')); return ps.length && ps.every((p) => q(p, 'span.subtle-text')); }); // live: every box paragraph is a subtle-text span (14/20)
    if (subtle) ctx.notes.push('lint D1 cards boxed subtle-text: every live box paragraph is a span.subtle-text (14/20) — carried as the block variant (no inline size in David\'s Model)');
    return { kind: 'cards', variants: ['grid', span, gridCols(row), 'boxed', h, inlineExp ? 'inline-expand' : null, subtle ? 'subtle-text' : null].filter(Boolean), rows };
  }
  if (cols.length === 1 && /grid-row--cols-/.test(row.getAttribute('class') || '')) { if (familyOf(ctx) === 'category-hub' && cls(cols[0]).includes('col--center')) { ctx.w6 ??= {}; ctx.w6.center = true; } return { kind: 'prose', html: richtext(familyOf(ctx) === 'category-hub' ? prep(q(cols[0], '.col__content'), ctx) : q(cols[0], '.col__content'), ctx) }; }
  const variants = cols.map((c) => { const k = cls(c); const span = (k.find((x) => /^col-lg-\d+$/.test(x)) || 'col-lg-12').replace('col-', ''); const off = k.find((x) => /^col-lg-offset-\d+$/.test(x)); const first = k.includes('col--first') ? 'first' : null; const align = (k.find((x) => /^col--(middle|center|bottom)$/.test(x)) || '').replace('col--', ''); return [span, off ? off.replace('col-lg-offset-', 'offset-') : null, first, align, illustrationWidth(c, ctx)].filter(Boolean).join('-'); });
  if (familyOf(ctx) === 'category-hub') { // W6 media cell models + prose models the core lacks
    cols.forEach((c) => mediaTokens(c).forEach((t) => { if (!variants.includes(t)) variants.push(t); }));
    if (cols.some((c) => qa(c, '.button-list .button-wrap').length > 1)) variants.push('cta-stack'); // live: CTAs inside a grid column stack (52px pitch), not inline
    if (cols.some(hasCheckedList)) variants.push('checked');
    if (cols.some((c) => q(c, ':scope > .col__content > hr.rule--extra-top:last-child'))) variants.push('rule-after'); // live hr module (extra-margin-top, 64px) closing the column
    if (gridCols(row) === 'cols-9') variants.push('flush'); // the utility cols-9 rule adds a 16px first-child margin the live hub row does not have
  }
  const cells = cols.map((c) => {
    const cc = q(c, ':scope > .col__content'); if (familyOf(ctx) === 'category-hub') { for (const junk of qa(cc, '.image[style*="--w:3px"]')) { junk.remove(); ctx.notes.push('image: a live 3px LO logo (authoring debris) dropped'); } }
    let html = richtext(familyOf(ctx) === 'category-hub' ? prep(cc, ctx) : normaliseHrefs(cc, ctx), ctx);
    const chat = q(cc, 'form.chat-field');
    if (chat) { html += `<p>${esc(q(chat, 'textarea')?.getAttribute('placeholder') || q(chat, 'label')?.textContent.trim() || '')}</p>`; variants.push('chat'); ctx.notes.push('columns chat: the boost.ai entry field (dynamics #6 interim, no backend) — the trailing paragraph of the last cell is the field label (EW8: the authored <p> moves into the <label>); "Send melding" is fixed control chrome'); }
    return html;
  });
  if (cols.some(isLinkList)) variants.push('link-list');
  if (q(row, '.lead-blue')) { const ps = qa(row, '.col__content .richtext p').filter((p) => p.textContent.trim()); const leads = ps.filter((p) => q(p, '.lead-blue')); variants.push(leads.length === ps.length ? 'lead-all' : 'lead'); } // lead-all: every text paragraph is a lead (live h2 + .lead-blue ×N)
  const gc = gridCols(row); if (gc) variants.push(gc);
  return { kind: 'columns', variants, cells };
}

/** Hub related-products: a .card-list--small of icon cards → heading (default content) + `cards small`, one row per card. */
export function hubRelated(root, ctx) {
  const list = q(root, '.card-list');
  const title = richtext(q(root, '.related-products__title, .related-topics__title'), ctx);
  const rows = cardRows(qa(list, ':scope > .card').map(normaliseHrefs), ctx);
  return { parts: [title, block('cards', ['small'], rows)], blocks: ['cards'] };
}

/** W6 — a related-topics NEWS rail inside a hub band (daglig-bruk, eiendom, pensjon): centred heading (default content) + `cards news` with tag/title/date, trailing CTA. */
export function hubNews(root, ctx) {
  const title = richtext(q(root, '.related-topics__title, .related-products__title'), ctx);
  const cards = qa(root, '.newsfeed .card').map((c) => normaliseHrefs(c, ctx));
  const rows = hubCardRows(cards, ctx);
  if (cards.some((c) => q(c, '.card__date'))) ctx.notes.push('cards news: a news card carries its publication date as the paragraph after the title (live .card__date)');
  const parts = [title, block('cards', ['news', 'hub'], rows)]; const btn = q(root, '.button-wrap a.btn'); if (btn) parts.push(ctaHtml(btn, ctx));
  return { parts, blocks: ['cards'] };
}

/** A hub band / top-level cols: children in DOCUMENT order (core band() hoists the grid rows and nests a whole section for a
 *  .richtext or nested .band child). The empty nested band (live spacer under the h1) and the inner rule become section style
 *  tokens (hub-head, hub-rule); consecutive same-shaped card grids merge into ONE cards block (D9). */
export function hubBand(root, ctx, { topLevelCols = false } = {}) {
  let parts = []; const blocks = new Set(); const styles = [topLevelCols ? 'cols' : 'band'];
  const chunks = []; // W6: a non-empty nested band (live: its own 24px wrap padding) or a visible rule splits the band into consecutive flush sections
  const cut = (kind) => { if (parts.length) chunks.push({ parts, kind: chunks.kind || null }); parts = []; chunks.kind = kind; lastCards = null; };
  let lastCards = null;
  const push = (p) => {
    if (p.kind === 'cards') { if (lastCards && lastCards.variants.join() === p.variants.join()) { lastCards.rows.push(...p.rows); return; } lastCards = p; parts.push(p); blocks.add('cards'); return; }
    lastCards = null;
    if (p.kind === 'columns') { parts.push(block('columns', p.variants, [p.cells])); blocks.add('columns'); } else if (p.html) parts.push(p.html);
  };
  const walk = (el) => {
    for (const ch of el.children) {
      const k = cls(ch);
      if (ch.tagName === 'HR') { if (k.includes('rule--visible') && (parts.length || chunks.length) && familyOf(ctx) === 'category-hub') { cut(['rule-visible', 'hub-rule-tail']); ctx.notes.push('band: a visible rule between band modules → the section is split at the rule (rule-visible carries the live 1px line + 64/72px rhythm)'); continue; } if (k.includes('rule--extra-top') && chunks.length && !parts.length && familyOf(ctx) === 'category-hub') { chunks.kind = [chunks.kind, 'hub-rule-64'].flat().filter(Boolean); continue; } /* an extra-margin-top hr right after a nested band: 64px above the next chunk */ if (k.includes('rule--extra-top') && parts.length) styles.push('hub-rule'); continue; }
      if (k.includes('band__content')) { walk(ch); continue; }
      if (k.includes('band')) { if (!ch.textContent.trim()) { styles.push('hub-head'); ctx.notes.push('band: the empty nested band (live 48/32px spacer under the h1) is layout → section style hub-head'); } else if (familyOf(ctx) === 'category-hub') { cut('hub-nested'); walk(ch); cut(null); ctx.notes.push('band: a nested band (live wrap padding 24px) → its own flush section chunk (hub-nested)'); } else walk(ch); continue; }
      if (k.includes('cols')) { qa(ch, ':scope > .grid-row').forEach((row) => push(gridRow(row, ctx))); continue; }
      if (k.includes('grid-row')) { push(gridRow(ch, ctx)); continue; }
      if (k.includes('title') && familyOf(ctx) === 'category-hub') { lastCards = null; const html = richtext(ch, ctx); if (html) { if (!parts.length && q(ch, 'h1')) styles.push('hub-h1'); parts.push(html); } continue; } // a title module inside the band (tips-og-rad h1) is prose, not the standalone title encoder
      const encKey = k.find((c) => !['band', 'cols', 'richtext', 'image', 'module', 'banner-small', 'related-products', 'related-topics', 'title'].includes(c) && (OWN[c] || CORE[c])); // related-* take the hubRelated branch below (core relatedTopics reads only .newsfeed → 0 rows, silently) // prose-shaped children keep the richtext path below // a module inside the band (faq, tip, prices…): its encoder's parts, inlined
      if (encKey) {
        const r = (OWN[encKey] || CORE[encKey])(ch, ctx); lastCards = null;
        if (r && r.html) { const style = /<div class="section-metadata"><div><div>style<\/div><div>([^<]*)<\/div>/.exec(r.html)?.[1] || ''; style.split(',').map((t) => t.trim()).filter((t) => t && !/^gap-/.test(t)).forEach((t) => styles.push(t)); let inner = r.html.replace(/^<div>/, ''); inner = /<div class="section-metadata">/.test(inner) ? inner.replace(/<div class="section-metadata">[\s\S]*$/, '') : inner.replace(/<\/div>\s*$/, ''); parts.push(inner); (r.blocks || []).forEach((b) => blocks.add(b)); }
        else { const html = richtext(prep(ch, ctx), ctx); if (html) parts.push(html); } // the module's encoder declined (family gate) → its prose stays in the band (e.g. a CTA row)
        continue;
      }
      if (k.includes('related-products') || k.includes('related-topics')) { lastCards = null; const r = q(ch, '.newsfeed') ? hubNews(ch, ctx) : hubRelated(ch, ctx); parts.push(...r.parts); r.blocks.forEach((b) => blocks.add(b)); styles.push(q(ch, '.newsfeed') ? 'hub-news' : 'hub-related'); continue; }
      if (k.includes('banner-small')) { lastCards = null; parts.push(bannerSmall(ch, ctx, { inline: true }).html); blocks.add('banner'); continue; }
      lastCards = null; const html = richtext(prep(ch, ctx), ctx); if (html) { parts.push(html); const mw = /--max:\s*(\d+)px/.exec(ch.getAttribute('style') || '')?.[1]; if (mw && /\brichtext--max\b/.test(ch.className) && familyOf(ctx) === 'category-hub') styles.push(`prose-${mw}`); } // .richtext / .image / other prose (prose-N = the live text-wrapper max-width)
    }
  };
  walk(root);
  if (parts.length || !chunks.length) chunks.push({ parts, kind: chunks.kind || null });
  const render = (ps) => ps.map((p) => (typeof p === 'string' ? p : block('cards', p.variants, p.rows)));
  if (chunks.some((c) => c.parts.some((p) => typeof p !== 'string' && p.variants.includes('grid')))) ctx.notes.push('cards grid: consecutive same-shaped card rows folded into one block (D9)');
  if (ctx.w6?.center) { styles.push('hub-center'); ctx.w6.center = false; } // a centred single-column prose row (live col--center): its paragraphs centre too
  const bandTint = tint(bandBg(root) || bandBg(q(root, '.cols')));
  if (chunks.length === 1) return { html: section(render(chunks[0].parts), { style: styleOf(...styles, bandTint) }), blocks: [...blocks] };
  // several chunks: the first keeps the module margin + top padding (hub-open), the last the bottom padding (hub-close), the middle ones neither (hub-mid); every chunk shares the tint
  const html = chunks.map((c, i) => { const pos = i === 0 ? 'hub-open' : i === chunks.length - 1 ? 'hub-close' : 'hub-mid'; const own = (i ? styles.filter((t) => t !== 'hub-h1' && t !== 'hub-head') : styles); return section(render(c.parts), { style: styleOf(...own, pos, ...[c.kind].flat(), bandTint) }); }).join('');
  return { html, blocks: [...blocks] };
}

/** Does this band/cols need the hub walker (a case core band() mis-encodes) — otherwise the core encoder runs, byte-identical. */
const needsHubBand = (root) => !!q(root, ':scope > .band__content > :not(.cols):not(.grid-row):not(hr):not(.banner-small), :scope > .band__content > .cols > .grid-row[class*="grid-row--cols-"]:not([class*="cols-12"]), :scope > .grid-row[class*="grid-row--cols-"]:not([class*="cols-12"]), form.chat-field, :scope > .richtext, :scope > .band')
  || (!!bandBg(root) && bgToken(bandBg(root)) == null && !!TINT[bandBg(root)]);

const OWN = {
  // intro: h1 + centred lead → default content (section skin `intro`; `lead` types the paragraph 24/32 fjell as the live .main-lead)
  intro: (root, ctx) => {
    // W6: the live lead column is the authored text-wrapper max-width (800 on lån, 850 forsikring, 600 sparing) or the FFE default 600 when none is authored (eiendom/daglig-bruk live captures wrap at ≤600)
    const mw = familyOf(ctx) === 'category-hub' ? (/--max:\s*(\d+)px/.exec(q(root, '.intro__lead')?.getAttribute('style') || '')?.[1] || '600') : null;
    return { html: section([richtext(root, ctx)], { style: styleOf('intro', 'lead', mw && mw !== '800' ? `lead-${mw}` : null) }), blocks: [] };
  },

  // visual-nav: consecutive .vnav modules (photo cards, then icon rows) → ONE `cards nav` block, one row per card; the row's media decides the card shape
  vnav: (root, ctx) => {
    ctx.w1 ??= {}; ctx.w1.vnav ??= new Set();
    if (ctx.w1.vnav.has(root)) return { html: '', blocks: [] }; // folded into the first sibling's block
    const group = []; for (let n = root; n && n.classList?.contains('vnav'); n = n.nextElementSibling) group.push(n);
    group.forEach((s) => ctx.w1.vnav.add(s));
    const rows = group.map((s) => {
      const a = q(s, 'a.vnav__link'); const title = q(s, '.vnav__dtitle, .vnav__stitle'); const text = q(s, '.vnav__dlead, .vnav__stext');
      const photo = q(s, '.vnav__photo'); const m = photo && /--img-desktop:url\("?([^")]+)"?\)/.exec(photo.getAttribute('style') || '');
      const media = m ? `<p><img src="${esc(L.mediaUrl(m[1], ctx))}" alt="${esc(photo.getAttribute('aria-label') || '')}"></p>` : pic(q(s, '.vnav__sicon img'), ctx);
      return [media, `<h3><a href="${esc(href(a?.getAttribute('href') || ''))}">${inline(title, ctx).trim()}</a></h3><p>${inline(text, ctx).trim()}</p>`];
    });
    ctx.notes.push(`cards nav: ${group.length} visual-nav modules (${group.filter((s) => q(s, '.vnav__photo')).length} photo, ${group.filter((s) => !q(s, '.vnav__photo')).length} icon) folded into one block — one row per card`);
    const big = group.some((s) => s.classList.contains('vnav--big')); if (big) ctx.notes.push('cards nav big: the live "big" visual-nav card (photo + card with a 36/44 title-medium heading and a 19.2/32 lead) — variant big');
    return { html: section([block('cards', ['nav', big ? 'big' : null].filter(Boolean), rows)], { style: 'visual-nav' }), blocks: ['cards'] };
  },

  // shortcuts: heading (default content) + one cell holding the plain list of links (D5 simple list; the block paints the pills)
  shortcuts: (root, ctx) => {
    if (!isHub(ctx)) return CORE.shortcuts(root, ctx);
    ctx.notes.push('lint D1 shortcuts: one cell with a plain list of links (D5 simple list) — the block renders the live pill buttons with chevrons; the heading above stays default content');
    const links = qa(root, '.shortcuts__item a, .shortcuts__link');
    const list = `<ul>${links.map((a) => `<li><a href="${esc(href(a.getAttribute('href') || ''))}">${inline(a, ctx).replace(/\s+/g, ' ').trim()}</a></li>`).join('')}</ul>`;
    return { html: section([heading(q(root, 'h2'), ctx), block('shortcuts', [], [[list]])], { style: 'center, gap-48, hub-shortcuts' }), blocks: ['shortcuts'] };
  },

  // cobranding (LOfavør expander): single-cell rows read by position — [heading + toggle label] [logo + title] [panel column]×N
  cobranding: (root, ctx) => {
    ctx.notes.push('lint D3 cobranding: single-cell rows read by position — row 1 heading + toggle label (EW8: the label moves into the expand button), row 2 partner logo + title, rows 3+ one panel column each; the panel is closed at rest (dynamics #14 static snapshot)');
    const hdr = q(root, '.cobranding__header'); const content = q(root, '.cobranding__content');
    const headRow = `<p>${inline(q(hdr, '.cobranding__heading'), ctx).trim()}</p><p>${esc((q(hdr, '.btn__label')?.textContent || '').replace(/\s+/g, ' ').trim())}</p>`;
    const intro = `${pic(q(content, '.cobranding__logo img'), ctx)}${heading(q(content, ':scope > h2'), ctx).replace(/>\s+/g, '>').replace(/\s+</g, '<')}`;
    const colRows = qa(content, ':scope > .cobranding__columns > .cobranding__col').map((col) => [richtext(normaliseHrefs(col, ctx), ctx)]);
    const rows = [[headRow], ...(intro ? [[intro]] : []), ...colRows];
    return { html: section([block('cobranding', [tint(bandBg(content))].filter(Boolean), rows)], { style: 'gap-48' }), blocks: ['cobranding'] };
  },

  // faq: a live pseudo-heading <h2><span class="h4">…</span><br></h2> must keep its visual rank — the stray trailing <br> defeats lib.headingTag (request filed); pre-cleaned here for hub pages
  faq: (root, ctx) => { if (isHub(ctx)) for (const h of qa(root, '.accordion__body h1, .accordion__body h2, .accordion__body h3, .accordion__body h4')) for (const br of qa(h, 'br')) if (!br.nextSibling || !br.nextSibling.textContent.trim()) br.remove(); return CORE.faq(root, ctx); },

  // standalone modules seen on hub siblings — default content (David's Model D1), family-gated
  title: (root, ctx) => (isHub(ctx) ? { html: section([richtext(root, ctx)]), blocks: [] } : null),
  'button-wrap': (root, ctx) => (isHub(ctx) ? { html: section([richtext(normaliseHrefs(root, ctx), ctx)], { style: styleOf('hub-cta', /--center/.test(root.getAttribute('class') || '') ? 'center' : null) }), blocks: [] } : null),
  'button-list': (root, ctx) => (isHub(ctx) ? { html: section([richtext(normaliseHrefs(root, ctx), ctx)], { style: styleOf('hub-cta', /--center/.test(root.getAttribute('class') || '') || familyOf(ctx) === 'category-hub' ? 'center' : null) }), blocks: [] } : null), // category-hub: the live top-level button-list-container centres its pills (forsikring 1440 dump) whatever its --left token says
  // a standalone centred illustration with an authored max-width → one-cell columns block carrying the wN cell model (note: lint D1)
  image: (root, ctx) => {
    if (!isHub(ctx)) return null;
    const img = q(root, 'img'); if (!img) return null;
    const m = /--w:\s*(\d+)px/.exec(root.getAttribute('style') || '');
    ctx.notes.push(`lint D1 columns (image): a standalone illustration authored at ${m ? m[1] : 'its'}px — the one-cell columns block carries the wN sizing model the default-content image cannot express`);
    return { html: section([block('columns', [`lg-12${m ? `-w${m[1]}` : ''}`], [[pic(img, ctx)]])], { style: 'gap-48' }), blocks: ['columns'] };
  },
  // replica-level unknowns (module--text-and-image, module--progressive-disclosure): the prototype carries their richtext only → default content, noted
  module: (root, ctx) => {
    if (!usesWalker(ctx)) return CORE.module(root, ctx);
    const kind = (cls(root).find((c) => /^module--/.test(c)) || 'module').replace('module--', '');
    const html = richtext(normaliseHrefs(root, ctx), ctx); if (!html.trim()) return null;
    ctx.notes.push(`module ${kind}: the replica prototype carries this module as richtext only (author.mjs unknown) — authored as default content; replica request filed`);
    return { html: section([html], { style: 'gap-48' }), blocks: [] };
  },

  // tip → core callout; the note records the D1 justification
  tip: (root, ctx) => { const r = CORE.tip(root, ctx); if (r && isHub(ctx)) ctx.notes.push('lint D1 callout: the FFE message box (round icon overlapping a tinted box) is a designed component — heading/text/CTA stay authored prose in its one cell'); return r; },

  // top-level banner-small on hub pages carries the module rhythm (48/72px above); inside a band the core handles it
  'banner-small': (root, ctx, opts) => { if (!isHub(ctx) || opts?.inline) return CORE['banner-small'](root, ctx, opts); const r = bannerSmall(root, ctx, { inline: true }); return { html: section([r.html], { style: 'gap-48, hub-banner' }), blocks: r.blocks }; },

  // band / cols: the hub walker only where the core encoder mis-encodes (document order, nested bands, related icon lists, cols-N grids, syrin tint)
  // + the hub module rhythm: live category-hub .main > .band/.cols carry margin-top 48/72; kundeservice-hub bands sit flush (its top band opens the page), its cols carry it
  band: (root, ctx) => { if (usesWalker(ctx)) normaliseHrefs(root, ctx); const r = usesWalker(ctx) && (needsHubBand(root) || familyOf(ctx) === 'category-hub') ? hubBand(root, ctx) : CORE.band(root, ctx); return familyOf(ctx) === 'category-hub' ? withStyle(r, 'gap-48', flushToken(root, ctx)) : r; },
  cols: (root, ctx) => { if (usesWalker(ctx)) normaliseHrefs(root, ctx); const r = usesWalker(ctx) && (needsHubBand(root) || familyOf(ctx) === 'category-hub') ? hubBand(root, ctx, { topLevelCols: true }) : CORE.cols(root, ctx); return isHub(ctx) ? withStyle(r, 'gap-48', flushToken(root, ctx)) : r; },

  // ---------------------------------------------------------------- W6 (2026-09-15): sibling modules the hub encoder lost or flattened
  // title + the lead paragraph that follows (live .title h1 + .text p > span.main-lead — pensjon): ONE intro section (h1 centred, lead 24/32 fjell)
  title: (root, ctx) => {
    if (!isHub(ctx)) return null;
    const next = root.nextElementSibling;
    if (familyOf(ctx) === 'category-hub' && next && /\brichtext\b/.test(next.className) && qa(next, ':scope > p').length && [...next.children].every((ch) => ch.tagName === 'P')) {
      ctx.w6 ??= {}; ctx.w6.consumed ??= new Set(); ctx.w6.consumed.add(next);
      const mw = /--max:\s*(\d+)px/.exec(next.getAttribute('style') || '')?.[1]; return { html: section([richtext(root, ctx), richtext(prep(next, ctx), ctx)], { style: styleOf('intro', 'lead', 'gap-72', 'hub-title-lead', mw ? `lead-${mw}` : null) }), blocks: [] }; // live .title module carries margin-top 72 (pensjon 1440 dump); the h1's own 16px collapses into it
    }
    return { html: section([richtext(root, ctx)]), blocks: [] };
  },
  // richtext at top level: the lead consumed by the title above → nothing; the note under a CTA row (forsikring) → hub-note (16px under, centred; subtle = the live 14/20 span); otherwise core
  richtext: (root, ctx) => {
    if (familyOf(ctx) !== 'category-hub') return CORE.richtext(root, ctx);
    if (ctx.w6?.consumed?.has(root)) return { html: '', blocks: [] };
    const prev = root.previousElementSibling; const ps = qa(root, ':scope > p');
    if (prev && /\bimage\b/.test(prev.className) && prev.parentElement?.tagName === 'MAIN') { const r = CORE.richtext(prep(root, ctx), ctx); return withStyle(r, 'hub-tight'); } // live: the text module sits 16px under a standalone illustration (forsikring "Bedrift eller landbruk?")
    if (prev && /\bbutton-(list|wrap)\b/.test(prev.className) && ps.length && ps.every((p) => /\bta-center\b/.test(p.className))) { const subtle = ps.every((p) => q(p, 'span.subtle-text')); if (subtle) ctx.notes.push('lint D1 richtext hub-note subtle: the whole paragraph is a live span.subtle-text (14/20) — carried as the section style (David\'s Model has no inline size)'); return { html: section([richtext(prep(root, ctx), ctx)], { style: styleOf('hub-note', subtle ? 'subtle' : null) }), blocks: [] }; }
    { const r = CORE.richtext(prep(root, ctx), ctx); const mw = /--max:\s*(\d+)px/.exec(root.getAttribute('style') || '')?.[1]; return mw && mw !== '640' ? withStyle(r, `prose-${mw}`) : r; } // the live text-wrapper max-width (pensjon tail 450)
  },
  // static-cards: title + the live intro paragraph (canon dropped it) + the cards with the hub variants (featured photo/center …)
  'static-cards': (root, ctx) => {
    if (familyOf(ctx) !== 'category-hub') return CORE['static-cards'](root, ctx);
    prep(root, ctx); const cards = qa(root, '.card-list .card'); const hv = hubCardVariants(cards);
    const parts = [richtext(q(root, '.static-cards__title'), ctx), richtext(q(root, '.static-cards__intro'), ctx), block('cards', ['static', ...hv], hv.includes('featured') ? hubCardRows(cards, ctx) : cardRows(cards, ctx))];
    if (hv.includes('featured')) ctx.notes.push('lint D5 cards static featured hub: the live featured card list (photo + centred h3 + lead + CTA) — one row per card [media][body]');
    return { html: section(parts, { style: styleOf('band', 'hub-static', tint(bandBg(root)), 'gap-48', flushToken(root, ctx)) }), blocks: ['cards'] };
  },
  // reference: the forsikring Fremtind reference wraps a syrin columns-grid (logo + text) → columns in a tinted section; plain text references stay core
  reference: (root, ctx) => {
    if (familyOf(ctx) !== 'category-hub' || !q(root, ':scope > .cols')) return CORE.reference(root, ctx);
    const r = hubBand(root, ctx, { topLevelCols: true }); r.html = r.html.replace(/(<div class="section-metadata"><div><div>style<\/div><div>)([^<]*)/, (m, a, v) => `${a}${v.replace(/\bcols\b/, 'reference-cols')}`);
    ctx.notes.push('reference cols: the live reference module holds a columns-grid (partner logo + text) in a syrin band — columns block, section style reference-cols');
    return withStyle(r, flushToken(root, ctx));
  },
  // standalone progressive-disclosure (forsikring "Bedrift eller landbruk?"): the expand pill reveals a whole card grid → `accordion disclosure next` (one row: the label)
  // + the revealed content as the NEXT section (style disclosure-panel, hidden at rest) — a cell cannot hold a block (no nested blocks)
  disclosure: (root, ctx) => {
    if (familyOf(ctx) !== 'category-hub') return null;
    prep(root, ctx); const label = q(root, '.disclosure__btn .btn__label')?.textContent.replace(/\s+/g, ' ').trim() || ''; const inner = q(root, '.disclosure__inner') || q(root, '.disclosure__content');
    const centred = root.classList.contains('disclosure--center'); const tight = root.classList.contains('disclosure--after-text');
    ctx.notes.push('lint D1 accordion disclosure next: the live progressive-disclosure pill reveals a card grid + text — the label row toggles the following section (disclosure-panel, hidden at rest; EW8: the label moves into the button); no nested blocks');
    const head = section([block('accordion', ['disclosure', 'next', centred ? 'center' : 'left'], [[`<p>${esc(label)}</p>`]])], { style: styleOf('disclosure', tight ? 'disclosure-tight' : null) });
    const panel = hubBand(inner, ctx, { topLevelCols: true }); panel.html = panel.html.replace(/(<div class="section-metadata"><div><div>style<\/div><div>)([^<]*)/, (m, a, v) => `${a}${v.replace(/\bcols\b/, 'disclosure-panel')}`);
    return { html: head + panel.html, blocks: ['accordion', ...panel.blocks] };
  },
  // AEM "section" item list (lofavor): `accordion tabs` — one row per item [title][content]; item 1 active at rest (W3's block variant)
  seclist: (root, ctx) => {
    if (familyOf(ctx) !== 'category-hub') return null;
    prep(root, ctx);
    const rows = qa(root, '.seclist__list > .seclist__item').map((it) => [`<p>${esc(q(it, '.seclist__text')?.textContent.replace(/\s+/g, ' ').trim() || '')}</p>`, [...(q(it, '.seclist__content')?.children || [])].map((ch) => (/\brichtext\b/.test(ch.className) ? richtext(ch, ctx) : /\bbutton-wrap\b|\bbutton-list\b/.test(ch.className) ? qa(ch, 'a.btn').map((a) => ctaHtml(a, ctx)).join('') : richtext({ childNodes: [ch] }, ctx))).join('')]);
    ctx.notes.push('lint D3 accordion tabs: the live AEM section item list (client-chromed master/detail) — one row per item [title][content]; the title moves into the tab button (EW8)');
    return { html: section([block('accordion', ['tabs', 'hub', hasCheckedList(root) ? 'checked' : null].filter(Boolean), rows)]), blocks: ['accordion'] };
  },
  // top-level related-topics news rail (sparing "Tips og råd"): centred heading + `cards news` with tag/title/date (the core reads no dates)
  'related-topics': (root, ctx) => {
    if (familyOf(ctx) !== 'category-hub') return CORE['related-topics'](root, ctx);
    const r = hubNews(root, ctx);
    return { html: section(r.parts, { style: styleOf('related', 'gap-48', tint(bandBg(root)), flushToken(root, ctx)) }), blocks: r.blocks };
  },
  // client-rendered widgets (pension / savings calculator): the calculator block with the captured live snapshot named by data-widget (core names it after the slug)
  calculator: (root, ctx) => {
    const name = root.getAttribute('data-widget'); if (familyOf(ctx) !== 'category-hub' || !name) return CORE.calculator(root, ctx);
    const label = { pensjon: 'Pensjonskalkulator', sparing: 'Sparekalkulator' }[name] || 'Kalkulator';
    ctx.notes.push(`lint D1 calculator ${name}: bespoke client-rendered widget (dynamics interim) — the link names the captured snapshot /data/calculator/${name}.html (@ew-exempt, as calculator.js documents)`);
    return { html: section([block('calculator', [`widget-${name}`], [[`<p><a href="/data/calculator/${name}.html">${label}</a></p>`]])], { style: 'hub-widget' }), blocks: ['calculator'] };
  },
  // text-and-image (tips-og-rad LOfavør box): text column + media column (partner logo above the illustration) → columns, section style text-and-image
  'text-and-image': (root, ctx) => {
    if (familyOf(ctx) !== 'category-hub') return null;
    const row = q(root, ':scope > .grid-row'); if (!row) return null;
    const g = gridRow(row, ctx); if (g.kind !== 'columns') return null;
    g.variants = g.variants.filter((v) => v !== 'media-logo').map((v) => v.replace(/-middle$/, '')); g.variants.push('logo-first'); // live: both columns start-aligned // partner logo ABOVE the illustration (lofavor's media-logo has it below the photo)
    ctx.notes.push('columns text-and-image: the live text-and-image module (text + CTA beside the partner logo and an illustration) — the media cell holds both images (logo first, media-logo model)');
    return { html: section([block('columns', g.variants, [g.cells])], { style: styleOf('text-and-image', tint(bandBg(root)), 'gap-48', flushToken(root, ctx)) }), blocks: ['columns'] };
  },
};
export default OWN;
