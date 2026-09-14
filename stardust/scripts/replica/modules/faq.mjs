// modules/faq.mjs — archetype family "faq" (AEM pageType Spørsmål): the whole page is one `question-page` wrapper.
// Live: .question-page (aem-main-container 1280, padding 0 20) > .to-parent (breadcrumb, margin 0 0 16) + .question-page__question-container (max-width 768, centred) > h1 + .question-page__answer (.text richtext) + .faq__feedback-box (inline feedback).
export default {
  'question-page': (node, ctx) => {
    const { el, txt, abs, svgOf, richtext, feedbackInline } = ctx;
    const s = el('section', { class: 'qp' });
    const tp = node.querySelector(':scope > .to-parent a.to-parent__link');
    if (tp) s.append(el('nav', { class: 'qp__breadcrumb', 'aria-label': 'Tilbake' }, [el('a', { class: 'breadcrumb__link', href: abs(tp.getAttribute('href')) }, [svgOf(tp.querySelector('svg')), txt(tp)])]));
    const c = el('div', { class: 'qp__container' });
    const h1 = node.querySelector('h1'); if (h1) c.append(el('h1', { class: 'qp__title' }, [...h1.childNodes].map(n => ctx.cleanCopy(n)).filter(Boolean)));
    const ans = node.querySelector('.question-page__answer'); if (ans) { const a = el('div', { class: 'qp__answer' }); for (const t of ans.querySelectorAll(':scope > .text, :scope > div > .text')) a.append(richtext(t)); if (!a.children.length) a.append(richtext(ans)); c.append(a); }
    const fb = node.querySelector('.faq__feedback-box'); if (fb) c.append(feedbackInline(fb));
    s.append(c); return s;
  },
};
