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

const { section, block, heading, q, qa, cls, esc, inline, pic } = L;

const FAMILY = (() => { try { return Object.fromEntries(JSON.parse(fs.readFileSync('stardust/state.json', 'utf8')).pages.map((p) => [p.slug, p.archetypeFamily])); } catch { return {}; } })();
export const familyOf = (ctx) => FAMILY[ctx.slug] || '';
export const HUB_FAMILIES = new Set(['category-hub', 'kundeservice-hub']);
export const isHub = (ctx) => HUB_FAMILIES.has(familyOf(ctx));

/** AEM-internal resource paths (/content/sites/sb1/<path>) ARE the public <path>: normalised before lib.href resolves roster vs bounce. */
const SITES = /^(?:https?:\/\/www\.sparebank1\.no)?\/content\/sites\/sb1\//;
export const href = (h = '') => L.href(h.replace(SITES, '/'));
export function normaliseHrefs(root) { for (const a of qa(root, 'a[href]')) { const h = a.getAttribute('href') || ''; if (SITES.test(h)) a.setAttribute('href', h.replace(SITES, 'https://www.sparebank1.no/')); } return root; }

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
function illustrationWidth(col) {
  const cc = q(col, ':scope > .col__content'); if (!cc) return null;
  const imgs = qa(cc, 'img'); if (!imgs.length || [...cc.children].some((ch) => !/\bimage\b/.test(ch.getAttribute('class') || ''))) return null;
  const src = imgs[0].getAttribute('src') || ''; if (!/\.svg(\?|$)/i.test(src)) return null;
  const m = /--w:\s*(\d+)px/.exec(q(cc, '.image')?.getAttribute('style') || ''); return `w${m ? m[1] : 400}`;
}

/** One live .grid-row → { kind: 'cards' | 'columns' | 'prose' } — mirrors core band(): card-grid row, single centred heading row, text/image columns.
 *  Adds: `cols-N` (the live grid is N columns wide, centred), `chat` (a boost.ai entry field in the last column). */
export function gridRow(row, ctx) {
  const cols = qa(row, ':scope > .col');
  const cards = cols.filter((c) => q(c, ':scope > .col__content > .card'));
  if (cards.length && cards.length === cols.length) {
    const span = (cls(cols[0]).find((c) => /^col-lg-\d+$/.test(c)) || 'col-lg-3').replace('col-', '');
    return { kind: 'cards', variants: ['grid', span, gridCols(row)].filter(Boolean), rows: cardRows(cols.map((c) => normaliseHrefs(q(c, '.card'))), ctx) };
  }
  if (cols.length === 1 && /grid-row--cols-/.test(row.getAttribute('class') || '')) return { kind: 'prose', html: richtext(q(cols[0], '.col__content'), ctx) };
  const variants = cols.map((c) => { const k = cls(c); const span = (k.find((x) => /^col-lg-\d+$/.test(x)) || 'col-lg-12').replace('col-', ''); const off = k.find((x) => /^col-lg-offset-\d+$/.test(x)); const first = k.includes('col--first') ? 'first' : null; const align = (k.find((x) => /^col--(middle|center|bottom)$/.test(x)) || '').replace('col--', ''); return [span, off ? off.replace('col-lg-offset-', 'offset-') : null, first, align, illustrationWidth(c)].filter(Boolean).join('-'); });
  const cells = cols.map((c) => {
    const cc = q(c, ':scope > .col__content'); let html = richtext(normaliseHrefs(cc), ctx);
    const chat = q(cc, 'form.chat-field');
    if (chat) { html += `<p>${esc(q(chat, 'textarea')?.getAttribute('placeholder') || q(chat, 'label')?.textContent.trim() || '')}</p>`; variants.push('chat'); ctx.notes.push('columns chat: the boost.ai entry field (dynamics #6 interim, no backend) — the trailing paragraph of the last cell is the field label (EW8: the authored <p> moves into the <label>); "Send melding" is fixed control chrome'); }
    return html;
  });
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

/** A hub band / top-level cols: children in DOCUMENT order (core band() hoists the grid rows and nests a whole section for a
 *  .richtext or nested .band child). The empty nested band (live spacer under the h1) and the inner rule become section style
 *  tokens (hub-head, hub-rule); consecutive same-shaped card grids merge into ONE cards block (D9). */
export function hubBand(root, ctx, { topLevelCols = false } = {}) {
  const parts = []; const blocks = new Set(); const styles = [topLevelCols ? 'cols' : 'band'];
  let lastCards = null;
  const push = (p) => {
    if (p.kind === 'cards') { if (lastCards && lastCards.variants.join() === p.variants.join()) { lastCards.rows.push(...p.rows); return; } lastCards = p; parts.push(p); blocks.add('cards'); return; }
    lastCards = null;
    if (p.kind === 'columns') { parts.push(block('columns', p.variants, [p.cells])); blocks.add('columns'); } else if (p.html) parts.push(p.html);
  };
  const walk = (el) => {
    for (const ch of el.children) {
      const k = cls(ch);
      if (ch.tagName === 'HR') { if (k.includes('rule--extra-top') && parts.length) styles.push('hub-rule'); continue; }
      if (k.includes('band__content')) { walk(ch); continue; }
      if (k.includes('band')) { if (!ch.textContent.trim()) { styles.push('hub-head'); ctx.notes.push('band: the empty nested band (live 48/32px spacer under the h1) is layout → section style hub-head'); } else walk(ch); continue; }
      if (k.includes('cols')) { qa(ch, ':scope > .grid-row').forEach((row) => push(gridRow(row, ctx))); continue; }
      if (k.includes('grid-row')) { push(gridRow(ch, ctx)); continue; }
      if (k.includes('related-products') || k.includes('related-topics')) { const r = hubRelated(ch, ctx); lastCards = null; parts.push(...r.parts); r.blocks.forEach((b) => blocks.add(b)); styles.push('hub-related'); continue; }
      if (k.includes('banner-small')) { lastCards = null; parts.push(bannerSmall(ch, ctx, { inline: true }).html); blocks.add('banner'); continue; }
      lastCards = null; const html = richtext(normaliseHrefs(ch), ctx); if (html) parts.push(html); // .richtext / .image / other prose
    }
  };
  walk(root);
  const html = parts.map((p) => (typeof p === 'string' ? p : block('cards', p.variants, p.rows)));
  if (parts.some((p) => typeof p !== 'string' && p.variants.includes('grid'))) ctx.notes.push('cards grid: consecutive same-shaped card rows folded into one block (D9)');
  return { html: section(html, { style: styleOf(...styles, tint(bandBg(root) || bandBg(q(root, '.cols')))) }), blocks: [...blocks] };
}

/** Does this band/cols need the hub walker (a case core band() mis-encodes) — otherwise the core encoder runs, byte-identical. */
const needsHubBand = (root) => !!q(root, ':scope > .band__content > .richtext, :scope > .band__content > .band, :scope > .band__content > .related-products, :scope > .band__content > .related-topics, :scope > .band__content > .cols > .grid-row[class*="grid-row--cols-"]:not([class*="cols-12"]), :scope > .grid-row[class*="grid-row--cols-"]:not([class*="cols-12"]), form.chat-field, :scope > .richtext, :scope > .band')
  || (!!bandBg(root) && bgToken(bandBg(root)) == null && !!TINT[bandBg(root)]);

export default {
  // intro: h1 + centred lead → default content (section skin `intro`; `lead` types the paragraph 24/32 fjell as the live .main-lead)
  intro: (root, ctx) => ({ html: section([richtext(root, ctx)], { style: 'intro, lead' }), blocks: [] }),

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
    return { html: section([block('cards', ['nav'], rows)], { style: 'visual-nav' }), blocks: ['cards'] };
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
    const colRows = qa(content, ':scope > .cobranding__columns > .cobranding__col').map((col) => [richtext(normaliseHrefs(col), ctx)]);
    const rows = [[headRow], ...(intro ? [[intro]] : []), ...colRows];
    return { html: section([block('cobranding', [tint(bandBg(content))].filter(Boolean), rows)], { style: 'gap-48' }), blocks: ['cobranding'] };
  },

  // faq: a live pseudo-heading <h2><span class="h4">…</span><br></h2> must keep its visual rank — the stray trailing <br> defeats lib.headingTag (request filed); pre-cleaned here for hub pages
  faq: (root, ctx) => { if (isHub(ctx)) for (const h of qa(root, '.accordion__body h1, .accordion__body h2, .accordion__body h3, .accordion__body h4')) for (const br of qa(h, 'br')) if (!br.nextSibling || !br.nextSibling.textContent.trim()) br.remove(); return CORE.faq(root, ctx); },

  // tip → core callout; the note records the D1 justification
  tip: (root, ctx) => { const r = CORE.tip(root, ctx); if (r && isHub(ctx)) ctx.notes.push('lint D1 callout: the FFE message box (round icon overlapping a tinted box) is a designed component — heading/text/CTA stay authored prose in its one cell'); return r; },

  // top-level banner-small on hub pages carries the module rhythm (48/72px above); inside a band the core handles it
  'banner-small': (root, ctx, opts) => { if (!isHub(ctx) || opts?.inline) return CORE['banner-small'](root, ctx, opts); const r = bannerSmall(root, ctx, { inline: true }); return { html: section([r.html], { style: 'gap-48, hub-banner' }), blocks: r.blocks }; },

  // band / cols: the hub walker only where the core encoder mis-encodes (document order, nested bands, related icon lists, cols-N grids, syrin tint)
  // + the hub module rhythm: live category-hub .main > .band/.cols carry margin-top 48/72; kundeservice-hub bands sit flush (its top band opens the page), its cols carry it
  band: (root, ctx) => { const r = isHub(ctx) && needsHubBand(root) ? hubBand(root, ctx) : CORE.band(root, ctx); return familyOf(ctx) === 'category-hub' ? withStyle(r, 'gap-48') : r; },
  cols: (root, ctx) => { const r = isHub(ctx) && needsHubBand(root) ? hubBand(root, ctx, { topLevelCols: true }) : CORE.cols(root, ctx); return isHub(ctx) ? withStyle(r, 'gap-48') : r; },
};
