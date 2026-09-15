// theme family — bedrift "bransje" theme pages (borettslag-sameie archetype, BEDRIFT chrome).
// Registry keys below are global; every handler falls back to the canon behaviour (ctx.card / canon referance / canon text)
// unless ctx.family === 'theme', so other families' output is unchanged. Canon gaps recorded in stardust/replica/canon-requests.md.
// featured cards also carry the markedsnytt-listing article list; the registry key is global, so the gate is a family set.
const FEATURED_FAMILIES = new Set(['theme', 'markedsnytt-listing', 'category-hub']); // category-hub added by W6 (2026-09-15): the registry key `referance` is owned here, and the hub's Fremtind reference wraps a columns-grid (forsikring)
const LEAD = ['main-lead', 'main-lead-white', 'main-lead-white-left', 'sub-lead-left', 'sub-lead', 'lead', 'lead-white'];

export default {
  // card — the featured card (card__container--featured): contain-fit illustration on top + a full richtext body (canon card() only knows title/body-text cards).
  card(node, ctx) {
    const cont = node.querySelector('.card__container') || node; const cls = cont.getAttribute('class') || '';
    if (!FEATURED_FAMILIES.has(ctx.family)) return ctx.card(node);
    const { el, picture, moduleOf, txt } = ctx;
    if (!/--featured/.test(cls)) {
      // canon card + the publication date canon drops (.card__date, newsfeed cards)
      const c = ctx.card(node); const date = cont.querySelector('.card__date'); const content = c.querySelector('.card__content');
      if (date && content) content.append(el('span', { class: 'card__date' }, [txt(date)]));
      return c;
    }
    const c = el('div', { class: 'card card--featured' });
    const imgWrap = cont.querySelector('.card__container-image');
    if (imgWrap) { const p = picture(imgWrap, 'card__img'); if (p) c.append(el('div', { class: 'card__media' + (/--contain/.test(imgWrap.className) ? ' card__media--contain' : '') }, [p])); }
    const body = el('div', { class: 'card__body' }); const content = el('div', { class: 'card__content' });
    // live: .card__container-content > (.card__container-content-wrapper > .text…) + .button — the wrapper is flattened
    const inner = cont.querySelector('.card__container-content') || cont;
    for (const ch of inner.children) {
      const kids = ch.classList.contains('card__container-content-wrapper') ? [...ch.children] : [ch];
      for (const k of kids) { const m = moduleOf(k); if (m) content.append(m); }
    }
    body.append(content); c.append(body); return c;
  },
  // referance — on theme pages the reference block wraps a sand columns-grid (text + buttons + image); canon only lifts the .text nodes.
  referance(node, ctx) {
    const { el, richtext, moduleOf } = ctx;
    const s = el('section', { class: 'reference' });
    if (!FEATURED_FAMILIES.has(ctx.family) || !node.querySelector('.columns-grid')) { for (const t of node.querySelectorAll('.text')) s.append(richtext(t)); return s; }
    for (const ch of (node.querySelector('.cq-dd-paragraph') || node).children) { const m = moduleOf(ch); if (m) s.append(m); }
    return s;
  },
  // text — canon richtext + (theme only) the authored max-width wrapper, the lead span classes KEEP_CLASS drops, and the authored inline font-family (captured state).
  text(node, ctx) {
    const { richtext, txt } = ctx;
    const w = richtext(node, node.classList.contains('prices__bottom-info') ? 'prices__bottom' : '');
    if (!FEATURED_FAMILIES.has(ctx.family)) return w;
    const tw = node.querySelector('.text-wrapper') || node;
    const mw = (tw.getAttribute('style') || '').match(/max-width:\s*(\d+(?:\.\d+)?)px/); if (mw) { w.setAttribute('class', w.getAttribute('class') + ' richtext--max'); w.setAttribute('style', `--max:${mw[1]}px`); }
    const dstSpans = [...w.querySelectorAll('span')];
    for (const s of node.querySelectorAll('span')) {
      const keep = LEAD.filter(c => s.classList.contains(c)); if (!keep.length) continue;
      const t = txt(s); const d = dstSpans.find(x => !x.getAttribute('class') && txt(x) === t); if (d) d.setAttribute('class', keep.join(' '));
    }
    // authored inline font-size / colour on inline elements (captured state; KEEP_ATTR drops style)
    const srcInline = [...tw.querySelectorAll('b, i, span')]; const dstInline = [...w.querySelectorAll('b, i, span')];
    if (srcInline.length === dstInline.length) srcInline.forEach((si, i) => { const st = si.getAttribute('style') || ''; const fs = st.match(/font-size:\s*([^;]+)/i); const col = st.match(/(?:^|;)\s*color:\s*([^;]+)/i); const parts = []; if (fs) parts.push(`font-size:${fs[1].trim()}`); if (col) parts.push(`color:${col[1].trim()}`); if (parts.length && txt(dstInline[i]) === txt(si)) dstInline[i].setAttribute('style', parts.join(';')); });
    const srcBlocks = [...tw.querySelectorAll('p, li')]; const dstBlocks = [...w.querySelectorAll('p, li')];
    srcBlocks.forEach((sp, i) => { const ff = (sp.getAttribute('style') || '').match(/font-family:\s*([^;]+)/i); const d = dstBlocks[i]; if (ff && d && txt(d) === txt(sp)) d.setAttribute('style', `font-family:${ff[1].trim()}`); });
    return w;
  },
};
