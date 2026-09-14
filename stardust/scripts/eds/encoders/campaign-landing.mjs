/**
 * encoders/campaign-landing.mjs — family encoder for the "campaign-landing" archetype (nettsider-frontend `sb1-story` template:
 * /nb/bank/om-oss/hjemme.html — and the three story pages the roster files under news-article: bank-regnskap-nerderiket,
 * sikrer-seg-mot-vannlekkasje-klok-av-skade, kan-utviklingen-til-teknologifondene… — convert.mjs dispatches by the module root
 * class, so they land here). The prototype's module root is `section.story` (replica modules/campaign-landing.mjs). Sections:
 *   · `story` block (new: a genuinely new repeating unit — 900px full-bleed media slides with overlay cards; one row per slide
 *     [media: video link | wide picture (+ mobile rendition)][text: heading · paragraphs · CTAs]) — style `story-slides`
 *   · prose `.story__text` → default content, style `story-text` (+ `center` for a live ta-center heading)
 *   · `.story__image` → default content picture, style `story-image` · `.story__button` → CTA paragraph, style `story-button`
 *   · `.story__anchor` → the `id` of the following section (section-metadata id); `--extra` → style `anchor-gap` (32px)
 *   · `.story__factbox` (empty on every captured page) → nothing authored; recorded (a `columns lg-7, lg-4-offset-1` fits the live grid)
 * No core key is overridden; the product page converts byte-identically.
 */
import * as L from '../lib.mjs';
import { richtext } from '../encoders.mjs';
import { quoteHtml } from './news-article.mjs';

const { section, block, q, qa, cls, esc, inline, txt, pic } = L;
const varOf = (el, name) => { const m = (el?.getAttribute('style') || '').match(new RegExp(`${name}:\\s*url\\(\\s*["']?([^"')]+)`)); return m ? m[1] : null; };

/** live richtext inside a story card / text module: `<p><span class="h5">…</span></p>` is a pseudo-heading → h5 (site-wide ROLE SWAP rule);
 *  h1/h2 keep their rank; `.ta-center` on the only heading is reported to the caller for the section style. */
function storyRichtext(el, ctx) {
  let out = '';
  for (const n of el.children) {
    const t = n.tagName.toLowerCase();
    if (t === 'p' && n.children.length === 1 && n.children[0].tagName === 'SPAN' && /\bh[1-6]\b/.test(n.children[0].className) && txt(n) === txt(n.children[0])) { const h = /\b(h[1-6])\b/.exec(n.children[0].className)[1]; out += `<${h}>${inline(n.children[0], ctx)}</${h}>`; ctx.notes.push(`story text: live <p><span class="${h}"> pseudo-heading → <${h}> (site-wide ROLE SWAP rule)`); continue; }
    if (/^h[1-6]$/.test(t)) { const ht = L.headingTag(n); out += `<${ht}>${inline(n, ctx).replace(/\s+/g, ' ').trim()}</${ht}>`; continue; }
    if (t === 'p') { const s = inline(n, ctx); if (s.trim()) out += `<p>${s}</p>`; continue; }
    if (t === 'div' && /\brichtext\b/.test(n.className)) { out += storyRichtext(n, ctx); continue; }
    out += richtext({ childNodes: [n] }, ctx);
  }
  return out;
}

function slideRow(blockEl, ctx) {
  const media = q(blockEl, ':scope > .story__media'); let mediaHtml = '';
  const video = q(media, 'video'); const bg = q(media, '.story__bg'); const img = q(media, 'img.story__bg-img');
  if (video) { const src = video.getAttribute('src') || q(video, 'source')?.getAttribute('src') || ''; mediaHtml = `<p><a href="${esc(L.mediaUrl(src, ctx))}">${esc(video.getAttribute('title') || 'Video')}</a></p>`; ctx.notes.push(`story slide: video authored as a link to the .mp4 (its text = the live title "${video.getAttribute('title') || ''}"); autoplay/muted/loop/controls + the fallback string are the block's chrome`); }
  else if (bg) { const d = varOf(bg, '--bg-desktop'); const m = varOf(bg, '--bg-mobile'); mediaHtml = (d ? `<p><img src="${esc(L.mediaUrl(d, ctx))}" alt=""></p>` : '') + (m && m !== d ? `<p><img src="${esc(L.mediaUrl(m, ctx))}" alt=""></p>` : ''); if (m && m !== d) ctx.notes.push('story slide: two pictures — the wide rendition, then the mobile rendition the live page swaps in below 768 (block: --bg-desktop / --bg-mobile)'); }
  else if (img) mediaHtml = pic(img, ctx);
  const overlay = q(blockEl, '.story__overlay-grid'); let text = '';
  for (const part of overlay?.children || []) {
    const k = cls(part);
    if (k.includes('story__card-text')) text += storyRichtext(part, ctx);
    else if (k.includes('story__card-buttons') || k.includes('story__card-button') || k.includes('story__button')) text += qa(part, 'a.btn').map((a) => L.ctaHtml(a, ctx)).join('');
    else text += richtext(part, ctx);
  }
  if (qa(overlay, 'p.ta-center').length) ctx.notes.push('story slide: a live paragraph is centred (p.ta-center) — David\'s Model carries no inline alignment; the card text stays left-aligned like the other slides (justified residual)');
  return [mediaHtml, text];
}

export default {
  story: (root, ctx) => {
    const out = []; const blocks = new Set();
    const ids = []; let pendingGap = false; let afterSlides = false; // live anchors queue forward: each following section takes one id (a section carries one id)
    const meta = (style) => { const m = { style: [style, pendingGap ? 'anchor-gap' : null, afterSlides && style === 'story-text' ? 'after-slides' : null].filter(Boolean).join(', ') }; if (ids.length) { m.id = ids.shift(); if (ids.length) ctx.notes.push(`anchor: consecutive live anchors — #${m.id} on this section, #${ids.join(', #')} on the next one(s) (a section carries one id; the target shifts by that section's height)`); } pendingGap = false; return m; };
    const push = (parts, style, isSlides = false) => { out.push(section(parts, meta(style))); afterSlides = isSlides; };
    for (const ch of root.children) {
      const k = cls(ch);
      if (k.includes('story__block')) { push([block('story', [], [slideRow(ch, ctx)])], 'story-slides', true); blocks.add('story'); continue; }
      if (k.includes('story__slides')) { push([block('story', [], qa(ch, ':scope > .story__block').map((b) => slideRow(b, ctx)))], 'story-slides', true); blocks.add('story'); continue; }
      if (k.includes('story__anchor')) { if (ch.id) ids.push(ch.id); if (k.includes('story__anchor--extra')) pendingGap = true; continue; }
      if (k.includes('story__text')) { const centred = qa(ch, '.richtext > .ta-center').length && qa(ch, '.richtext > .ta-center').length === qa(ch, '.richtext > *').length; push([storyRichtext(q(ch, '.richtext') || ch, ctx)], centred ? 'story-text, center' : 'story-text'); continue; }
      if (k.includes('story__image')) { const img = q(ch, 'img'); if (img) push([pic(img, ctx)], 'story-image'); continue; }
      if (k.includes('story__button')) { push(qa(ch, 'a.btn').map((a) => L.ctaHtml(a, ctx)), 'story-button'); continue; }
      if (k.includes('story__factbox')) { if (!txt(ch)) { if (out.length) out[out.length - 1] = out[out.length - 1].replace(/(<div class="section-metadata"><div><div>style<\/div><div>)([^<]*)/, '$1$2, factbox-slot'); ctx.notes.push('factbox: the live factbox component is empty on this page (both columns 0px) — nothing authored; the section before it carries `factbox-slot` (the empty component\'s measured slot: 128px at ≥768, 136px below)'); continue; } push([richtext(ch, ctx)], 'story-factbox'); ctx.gaps.push('story factbox with content — no block model yet (a columns lg-7, lg-4-offset-1 fits the live grid)'); continue; }
      if (q(ch, 'blockquote')) { push([quoteHtml(ch, ctx)], 'story-text'); continue; } // the live `quote` component (bio quote)
      const html = richtext(ch, ctx); if (html.trim()) { push([html], 'story-text'); ctx.notes.push(`story: unmodelled live component (sb1-story columns-noColor / columns-bgColor: figure + caption, pseudo-heading text, button group — the replica module carries it as a verbatim copy) emitted as default content; needs a live lift before production`); }
    }
    if (ids.length) ctx.notes.push(`anchor: trailing live anchor(s) #${ids.join(', #')} have no following section — dropped`);
    return out.length ? { html: out.join(''), blocks: [...blocks] } : null;
  },
};
