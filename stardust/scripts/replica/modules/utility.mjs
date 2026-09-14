// modules/utility.mjs — archetype family "utility" (Basepage/Prisliste pages, e.g. /privat/kundeservice/kontakt.html).
// New module: `table` (AEM table component) — a real <table> with verbatim cells; the sticky-header / scroll-indicator
// helpers are runtime chrome (hidden at capture) and are not reproduced.
export default {
  // `tip` (ffe-message-box--info callout) — replaces the canon stub for a faithful structure: grid col + icon circle + tinted box
  tip: (node, ctx) => {
    const { el, svgOf, cleanCopy, buttonWrapper, gridClasses } = ctx;
    const col = node.querySelector('[class*="ffe-grid__col"]');
    const s = el('section', { class: 'tip' + (node.querySelector('.tip-content--left') ? ' tip--left' : '') + (node.querySelector('.tip-small__box') ? ' tip--small' : '') });
    const inner = el('div', { class: 'tip__col ' + (col ? gridClasses(col) : '') });
    const box = el('div', { class: 'tip__box' });
    const icon = node.querySelector('.ffe-message-box__icon svg'); if (icon) box.append(el('span', { class: 'tip__icon' }, [svgOf(icon)]));
    const body = el('div', { class: 'tip__body richtext' });
    const content = node.querySelector('.ffe-message-box__box');
    for (const ch of (content ? content.children : [])) { if (ch.classList.contains('button-list-container') || ch.classList.contains('button')) { const m = ctx.moduleOf(ch); if (m) body.append(m); continue; } if (ch.classList.contains('text') || ch.classList.contains('aem-component-container')) { const tw = ch.querySelector('.text-wrapper') || ch; for (const c of tw.childNodes) { const cc = cleanCopy(c); if (cc) body.append(cc); } continue; } const cc = cleanCopy(ch); if (cc) body.append(cc); }
    box.append(body); inner.append(box); s.append(inner); return s;
  },
  table: (node, ctx) => {
    const { el, cleanCopy, richtext, txt } = ctx;
    const s = el('div', { class: 'table-block' });
    const title = node.querySelector(':scope > .aem-component-container > .title h2, :scope .title h2');
    s.append(el('div', { class: 'table-block__title' }, title ? [cleanCopy(title)] : []));
    const t = node.querySelector('table');
    if (t) {
      const wrap = el('div', { class: 'table-block__wrap' });
      const table = el('table', { class: 'table-block__table', width: t.getAttribute('width') });
      for (const ch of t.children) { const cc = cleanCopy(ch); if (cc) table.append(cc); }
      wrap.append(table); s.append(wrap);
    }
    for (const tx of node.querySelectorAll(':scope > .aem-component-container > .text, :scope > .text')) s.append(richtext(tx, 'table-block__text'));
    return s;
  },
};
