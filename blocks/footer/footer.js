import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { el, icon, sectionsOf, text, inlineIcons } from '../../scripts/sb1.js';

/**
 * footer — rebuilt from the /footer document (default content only), node-slotted (EW1–EW3):
 *   section `contact`        <h2>Kontakt oss</h2> <p>intro link</p> <ul> five channels: icon span + <a>name</a><br>sub-info
 *   sections `contact-panel` the five channel panels (verbatim captured content; shown when a channel is selected)
 *   section `columns`        <h2>Privat</h2><ul>…</ul> <h2>Logg inn</h2><ul>…</ul> <h2>Sosiale medier</h2><ul>icon links</ul>
 *   section `small`          <ul> legal links   ·  section `address` <p>address</p>
 * Plus the fixed "Til toppen" control (observed: `show` once scrolled past 130px). Contact tabs mirror the live
 * customer-action tabs (aria-selected + panel visibility).
 */
export default async function decorate(block) {
  const footerMeta = getMetadata('footer');
  // additive fallback (faq siblings): a bedrift-market page without an explicit footer document takes the bedrift chrome (chrome-map lists archetypes only)
  const footerPath = footerMeta ? new URL(footerMeta, window.location).pathname : (getMetadata('market') === 'bedrift' ? '/footer-bedrift' : getMetadata('market') === 'om-oss' ? '/footer-om-oss' : '/footer');
  const fragment = await loadFragment(footerPath);
  if (!fragment) return;
  const sections = sectionsOf(fragment);
  const byStyle = (name) => sections.filter((s) => s.classList.contains(name));
  const wrapOf = (s) => s?.querySelector(':scope > .default-content-wrapper') || s;

  const root = el('div', { class: 'footer__root' });
  const top = el('div', { class: 'footer__top' });

  // contact
  const contactSec = byStyle('contact')[0];
  if (contactSec) {
    const w = wrapOf(contactSec);
    const contact = el('section', { class: 'contact', id: 'contact-us' });
    const h2 = w.querySelector('h2'); if (h2) { h2.classList.add('contact__title'); contact.append(h2); }
    const intro = [...w.querySelectorAll('p')].find((p) => !p.closest('ul')); if (intro) { const t = el('div', { class: 'contact__text' }); t.append(intro); contact.append(t); }
    const ul = w.querySelector('ul');
    const actions = el('div', { class: 'contact__actions' });
    const panels = byStyle('contact-panel');
    if (ul) {
      ul.classList.add('contact__list'); ul.setAttribute('role', 'tablist');
      [...ul.children].forEach((li, i) => {
        li.classList.add('contact__item'); li.setAttribute('role', 'presentation');
        const a = li.querySelector('a'); const ic = li.querySelector('.icon');
        const panel = panels[i]; const panelId = panel ? (panel.className.match(/\bpanel\d\b/) || [])[0] || `contact-panel-${i + 1}` : null;
        const action = el('a', { class: 'contact__action', href: a?.getAttribute('href') && !a.getAttribute('href').startsWith('#') ? a.getAttribute('href') : '#', role: 'tab', 'aria-selected': 'false', 'aria-controls': panelId });
        const iconWrap = el('span', { class: 'contact__icon' }); if (ic) iconWrap.append(ic); // keep the span.icon so inlineIcons() swaps it for the inline SVG
        action.append(iconWrap);
        // move the authored link (the name) and the trailing text (sub-info) into their slots
        if (a) { const name = el('span', { class: 'contact__name' }); a.replaceWith(action); name.append(...a.childNodes); action.append(name); } else li.prepend(action);
        const sub = el('span', { class: 'contact__sub' });
        [...li.childNodes].forEach((n) => { if (n === action) return; if (n.nodeType === 1 && (n.tagName === 'BR' || n.classList.contains('icon'))) { n.remove(); return; } sub.append(n); });
        action.append(sub);
        li.append(action);
        li.append(el('span', { class: 'contact__caret' }));
        if (panel) { panel.classList.add('contact__panel'); panel.id = panelId; panel.setAttribute('role', 'tabpanel'); panel.hidden = true; panel.classList.remove('section'); }
      });
      actions.append(ul);
      panels.forEach((p) => actions.append(p));
    }
    contact.append(actions);
    top.append(contact);
  }
  top.append(el('a', { class: 'to-top', href: '#top', 'aria-label': 'Til toppen' }, el('span', { class: 'to-top__icon' }, icon('arrow-up'))));
  root.append(top);

  // bottom: columns, small links, address
  const bottom = el('div', { class: 'footer__bottom' }); const inner = el('div', { class: 'footer__inner' });
  const colsSec = byStyle('columns')[0];
  if (colsSec) {
    const w = wrapOf(colsSec); const cols = el('div', { class: 'footer__columns' });
    let group = null; let colLeft = el('div', { class: 'footer__column' }); const colRight = el('div', { class: 'footer__column footer__column--right' });
    [...w.children].forEach((node) => {
      if (/^H[1-6]$/.test(node.tagName)) { group = el('div', { class: 'footer__links' }); node.classList.add('footer__heading'); group.append(node); colLeft.append(group); return; }
      if (node.tagName === 'UL') {
        if (!group) { group = el('div', { class: 'footer__links' }); colLeft.append(group); }
        const social = node.querySelector('.icon');
        if (social) { group.classList.add('footer__links--social'); node.querySelectorAll('a').forEach((a) => { a.classList.add('footer__social'); const t = [...a.childNodes].filter((n) => n.nodeType === 3); t.forEach((n) => { const s = el('span', { class: 'visually-hidden' }); n.replaceWith(s); s.append(n); }); }); colLeft.remove(); colRight.append(group); }
        group.append(node); group = null;
      }
    });
    cols.append(colLeft, colRight); inner.append(cols);
  }
  const small = byStyle('small')[0]; if (small) { const ul = wrapOf(small).querySelector('ul'); if (ul) { ul.classList.add('footer__small'); inner.append(ul); } }
  const addr = byStyle('address')[0]; if (addr) { const p = wrapOf(addr).querySelector('p'); if (p) { p.classList.add('footer__address'); inner.append(p); } }
  bottom.append(inner); root.append(bottom);
  block.replaceChildren(root); inlineIcons(block);
  // nettsider-frontend chrome (news-article · news-listing · campaign-landing): fjell link columns only — no contact band, no to-top
  if (['news-article', 'news-listing', 'campaign-landing'].includes(getMetadata('template'))) block.classList.add('footer--frontend');

  // behaviour (observed): to-top show/hide + smooth scroll; contact tabs
  const toTop = root.querySelector('.to-top');
  const onScroll = () => { const y = window.scrollY || document.documentElement.scrollTop; toTop.classList.toggle('scroll', y > 130); toTop.classList.toggle('show', y > 130); };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  toTop.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
  root.querySelectorAll('.contact__action[role="tab"]').forEach((tab) => tab.addEventListener('click', (e) => {
    if (tab.getAttribute('href') === '#') e.preventDefault();
    const selected = tab.getAttribute('aria-selected') === 'true';
    root.querySelectorAll('.contact__action[role="tab"]').forEach((t) => { t.setAttribute('aria-selected', 'false'); t.closest('.contact__item').classList.remove('is-active'); });
    root.querySelectorAll('.contact__panel').forEach((p) => { p.hidden = true; });
    if (!selected) { tab.setAttribute('aria-selected', 'true'); tab.closest('.contact__item').classList.add('is-active'); const p = document.getElementById(tab.getAttribute('aria-controls')); if (p) p.hidden = false; }
  }));
}
