import { getMetadata } from '../../scripts/aem.js';
import { loadFragment } from '../fragment/fragment.js';
import { el, icon, sectionsOf, text, inlineIcons } from '../../scripts/sb1.js';

/**
 * header — the sparebank1.no chrome rebuilt from the /nav document (template-slotted, EW1–EW3):
 *   section 1  brand:   <p><a href="/nb/bank/privat"><img logo></a></p>
 *   section 2  market:  <ul> Privat · Bedrift · Om oss (the active item is derived from the current path)
 *   section 3  main:    <ul> the 9 market sections (active = longest path prefix match)
 *   section 4  tools:   <p><a href="?search=">Søk</a></p> <p><em><strong><a>Bli kunde</a></strong></em></p> <p><a>Logg inn</a></p>
 * Behaviour mirrors the observed live state machine (stardust/replica/motion/*.json, clientlib module 2741):
 * ≤1024px the wrapper gets `scroll` (fixed, hidden above) once scrolled past 130px and `show` when the user scrolls
 * back up ≥400px from the furthest point; the hamburger toggles `header__wrap--active`. Search is an interim link to
 * the live search page (dynamics #20). The desktop header is static.
 * Authored links are MOVED into the layout (their <li>/<p> stay the editable units); nothing is rebuilt from text.
 */
/** Normalise an authored nav item: unwrap the pipeline's <p> (#98); the active item is derived from the current path (longest prefix match). */
function normaliseItems(ul) {
  const here = window.location.pathname.replace(/\/$/, '') || '/';
  let best = null; let bestLen = -1;
  [...ul.children].forEach((li) => {
    const p = li.querySelector(':scope > p'); if (p) p.replaceWith(...p.childNodes);
    const a = li.querySelector('a'); if (!a) return;
    let path; try { path = new URL(a.getAttribute('href'), window.location.href).pathname.replace(/\/$/, ''); } catch { return; }
    if ((here === path || here.startsWith(`${path}/`)) && path.length > bestLen) { best = li; bestLen = path.length; }
  });
  if (best) best.classList.add('is-active');
  // the live lists are inline-block items separated by authored whitespace (≈4.4px at 16px); the pipeline emits <li> back to back
  [...ul.children].forEach((li) => { if (li.nextElementSibling) li.after(document.createTextNode(' ')); });
}

export default async function decorate(block) {
  const navMeta = getMetadata('nav');
  // additive fallback (faq / om-oss siblings): a bedrift- or om-oss-market page without an explicit nav document takes its market chrome (chrome-map lists archetypes only)
  const navPath = navMeta ? new URL(navMeta, window.location).pathname : (getMetadata('market') === 'bedrift' ? '/nav-bedrift' : getMetadata('market') === 'om-oss' ? '/nav-om-oss' : '/nav');
  const fragment = await loadFragment(navPath);
  if (!fragment) return;
  const [brand, market, main, tools] = sectionsOf(fragment);

  const wrap = el('div', { class: 'header__wrap' });
  const content = el('div', { class: 'header__content' });
  const top = el('div', { class: 'header__top' });

  // search (mobile icon link) — interim: links to the live search (dynamics #20)
  const searchP = tools?.querySelector('p a[href*="search"]')?.closest('p');
  const searchA = searchP?.querySelector('a');
  const searchHref = searchA ? new URL(searchA.getAttribute('href'), 'https://www.sparebank1.no/nb/bank/privat/kundeservice.html').href : 'https://www.sparebank1.no/nb/bank/privat/kundeservice.html?search=';
  top.append(el('a', { class: 'header__search-mobile', href: searchHref, 'aria-label': text(searchA) || 'Søk' }, icon('sok')));

  // brand — move the authored logo link
  const logoLink = brand?.querySelector('a');
  if (logoLink) { const logo = el('div', { class: 'header__logo' }); logo.append(logoLink); top.append(logo); }

  top.append(el('button', { type: 'button', class: 'header__hamburger', 'aria-label': 'Meny', 'aria-expanded': 'false', 'aria-controls': 'main-menu' }, el('span', { class: 'header__hamburger-bar' })));

  // market nav — move the authored <ul>
  const marketUl = market?.querySelector('ul');
  if (marketUl) { normaliseItems(marketUl); const nav = el('nav', { class: 'header__topnav', 'aria-label': 'Marked' }); nav.append(marketUl); top.append(nav); }
  content.append(top);

  // tools — search button (desktop), CTA (authored a.button.accent), login
  const user = el('div', { class: 'header__user' });
  if (searchA) user.append(el('button', { type: 'button', class: 'header__search', 'aria-label': text(searchA), 'data-href': searchHref }, icon('sok'), el('span', {}, text(searchA))));
  const actions = el('div', { class: 'header__actions' });
  const ctaA = tools?.querySelector('a.button, p > em a, p > strong a');
  if (ctaA) { ctaA.classList.add('header__cta'); actions.append(ctaA.closest('p') || ctaA); }
  const loginP = [...(tools?.querySelectorAll('p') || [])].find((p) => p !== searchP && !p.contains(ctaA) && p.querySelector('a'));
  if (loginP) { const a = loginP.querySelector('a'); a.classList.add('header__login'); actions.append(loginP); }
  user.append(actions); content.append(user);

  // main nav — move the authored <ul>
  const mainUl = main?.querySelector('ul');
  if (mainUl) { normaliseItems(mainUl); const nav = el('nav', { class: 'header__mainnav', id: 'main-menu', 'aria-label': 'Hovedmeny' }); nav.append(mainUl); content.append(nav); }

  wrap.append(content);
  block.replaceChildren(wrap); inlineIcons(block);

  // nettsider-frontend chrome (news-article · news-listing · campaign-landing): the same authored /nav document, rendered as the
  // frontend header variant (124/60px, bordered pill controls, no scroll morph); the story template drops the main-nav row (78px, sand canvas)
  const template = getMetadata('template');
  if (['news-article', 'news-listing', 'campaign-landing'].includes(template)) {
    block.classList.add('header--frontend');
    if (template === 'campaign-landing') block.classList.add('header--story', 'header--no-bottom-links');
  }

  // market landings (privat / bedrift) show the live mobile market strip under the header — the active market and the way over to
  // the other one — derived from the authored /nav market list (additive; om-oss has no strip on live)
  if (getMetadata('template') === 'market-landing' && marketUl) {
    const isMarketPath = (a) => { try { return /\/nb\/bank\/(privat|bedrift)$/.test(new URL(a.getAttribute('href'), window.location.href).pathname.replace(/\/$/, '')); } catch { return false; } };
    const active = marketUl.querySelector('li.is-active a'); const other = [...marketUl.querySelectorAll('li:not(.is-active) a')].find(isMarketPath);
    if (active && other && isMarketPath(active)) {
      block.append(el('nav', { class: 'header__market-strip', 'aria-label': 'Marked' }, el('span', { class: 'header__market-active' }, text(active)), el('a', { class: 'header__market-goto', href: other.getAttribute('href') }, `Gå til ${text(other).toLowerCase()}`)));
    }
  }

  // behaviour (observed) — mobile scroll morph + hamburger
  const THRESHOLD = 130; let bottomScrollPoint = 0; let last = 0;
  const onScroll = () => {
    const y = window.scrollY || document.documentElement.scrollTop;
    const scrolled = y > THRESHOLD;
    wrap.classList.toggle('scroll', scrolled);
    wrap.classList.toggle('show', scrolled && y < bottomScrollPoint - 400);
    if (y > last) bottomScrollPoint = y; last = y;
  };
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  const burger = wrap.querySelector('.header__hamburger');
  burger.addEventListener('click', () => { const open = burger.getAttribute('aria-expanded') === 'true'; burger.setAttribute('aria-expanded', String(!open)); wrap.classList.toggle('header__wrap--active', !open); burger.classList.toggle('is-open', !open); });
  wrap.querySelector('.header__search')?.addEventListener('click', (e) => { window.location.href = e.currentTarget.dataset.href; });
}
