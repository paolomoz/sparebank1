// kundeservice-hub.mjs — module handlers for the kundeservice-hub archetype (privat/kundeservice.html, bedrift/kundeservice.html).
// Geometry lifted from stardust/replica/lift/ks-1440-detail.json / ks-360-detail.json.
export default {
  // boost.ai chat entry field (dynamics #6 — interim: UI rendered as captured, submission disabled)
  'chat-field': (node, ctx) => {
    const ta = node.querySelector('textarea'); const label = node.querySelector('label'); const btn = node.querySelector('button');
    const s = ctx.el('form', { class: 'chat-field', action: 'https://www.sparebank1.no/nb/bank/privat/kundeservice.html', method: 'get', 'data-dynamics': 'chat (boost.ai) — interim: no backend connected' });
    const wrap = ctx.el('div', { class: 'chat-field__root' });
    wrap.append(ctx.el('label', { class: 'chat-field__label visually-hidden', for: 'chat-field-input' }, [ctx.txt(label) || ta?.getAttribute('placeholder') || '']));
    wrap.append(ctx.el('textarea', { class: 'chat-field__input', id: 'chat-field-input', name: 'q', rows: '1', placeholder: ta?.getAttribute('placeholder') || '' }));
    wrap.append(ctx.el('button', { type: 'submit', class: 'chat-field__button', 'aria-label': ctx.txt(btn?.querySelector('.ffe-screenreader-only')) || 'Send melding' }, [ctx.el('span', { class: 'visually-hidden' }, [ctx.txt(btn?.querySelector('.ffe-screenreader-only')) || 'Send melding']), ctx.svgOf(btn?.querySelector('svg'))]));
    s.append(wrap); return s;
  },
};
