// om-oss family — OM OSS chrome pages (presse archetype). Handlers: `campaign` (split photo hero), `adviser-list` (press contacts).
// Content verbatim from the rendered-DOM sidecar; geometry lifted from live (stardust/replica/lift/presse-{1440,360}-detail*.json).
export default {
  // campaign — full-width 12-col hero: photo (md-7) + centred text column (md-5); `campaign__wrap--reverse` puts the photo on the right.
  campaign(node, { el, picture, richtext, txt, bgStyle }) {
    const row = node.querySelector('.campaign__wrap-bg');
    const reverse = /campaign__wrap--reverse/.test(row?.className || '');
    const media = node.querySelector('.campaign-bg');
    const contentCol = node.querySelector('.campaign__wrap-content');
    const content = contentCol?.querySelector('.campaign-content');
    const alignRight = /campaign-bg__align-right/.test(content?.className || '');
    const bg = (row?.getAttribute('style') || '').match(/background-color:\s*([^;]+)/i);
    const s = el('section', { class: 'campaign' + (reverse ? ' campaign--reverse' : ''), style: bg ? `--campaign-bg:${bg[1].trim()}` : null });
    const grid = el('div', { class: 'campaign__grid' });
    const m = el('div', { class: 'campaign__media' }); const pic = media && picture(media, 'campaign__img'); if (pic) m.append(pic);
    const c = el('div', { class: 'campaign__col' });
    const box = el('div', { class: 'campaign__content' + (alignRight ? ' campaign__content--right' : '') });
    const text = content?.querySelector('.text') || content || contentCol; if (text && txt(text)) box.append(richtext(text));
    c.append(box);
    grid.append(m, c); s.append(grid); return s;
  },
  // adviser-list — centred header + wrapped row of contacts (circle portrait, name, role, phone, e-post link).
  'adviser-list'(node, { el, picture, txt, abs, cleanCopy }) {
    const s = el('section', { class: 'adviser-list' });
    const h2 = node.querySelector('.adviser-list__header h2');
    if (h2 && txt(h2)) { const h = el('h2', { class: 'adviser-list__title' }); for (const ch of h2.childNodes) { const cc = cleanCopy(ch); if (cc) h.append(cc); } s.append(el('div', { class: 'adviser-list__header' }, [h])); }
    const list = el('div', { class: 'adviser-list__list' });
    for (const a of node.querySelectorAll('.adviser-list__list > .adviser')) {
      const li = el('div', { class: 'adviser' });
      const imgWrap = a.querySelector('.adviser-image'); const pic = imgWrap && picture(imgWrap, 'adviser__img'); if (pic) li.append(el('span', { class: 'adviser__image' }, [pic]));
      const name = a.querySelector('.adviser-name'); if (name) li.append(el('div', { class: 'adviser__name' }, [txt(name)]));
      for (const sub of a.querySelectorAll(':scope > .adviser-subtext')) {
        const link = sub.querySelector('a');
        const d = el('div', { class: 'adviser__subtext' + (/adviser-phone/.test(sub.className) ? ' adviser__phone' : '') });
        if (link) d.append(el('a', { class: 'adviser__email', href: abs(link.getAttribute('href')) }, [txt(link)])); else d.append(txt(sub));
        li.append(d);
      }
      list.append(li);
    }
    s.append(list); return s;
  },
};
