/* news-article.js — frontend-clientlib chrome interactions, observed only (stardust/replica/motion/nyhet-1440.json, nyhet-360.json).
   Fired on the live page: (1) search button click → header-search-button--active + icon swap + hamburger-wrapper--search-active
   (the search field itself is client-rendered — dynamics #20 interim: no field, aria state only); (2) hamburger click at 360 →
   header__wrap--active + hamburger.open (bars → cross, transitions) + bank-buttons--mobile-menu-active (fixed bottom bar);
   (3) main-nav hover colour (CSS). NOT fired: header scroll/show morph (header static at every sampled scroll position on
   both widths) — canon.js's morph is neutralised in news-article.css for .header--frontend. */
(function () {
  const header = document.querySelector('.header--frontend'); if (!header) return;
  const wrap = header.querySelector('.header__wrap'); const burger = header.querySelector('.header__hamburger');
  header.querySelectorAll('.header__search').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      header.querySelectorAll('.header__search').forEach((b) => { b.setAttribute('aria-expanded', String(!open)); b.classList.toggle('is-active', !open); });
      if (burger) burger.classList.toggle('header__hamburger--search-active', !open);
      const area = header.querySelector('.header__searcharea'); if (area) area.classList.toggle('is-open', !open);
    });
  });
  if (burger && wrap) burger.addEventListener('click', () => {
    // canon.js already toggles header__wrap--active + is-open; mirror the frontend's extra state
    const open = wrap.classList.contains('header__wrap--active');
    header.querySelectorAll('.header__actions').forEach((a) => a.classList.toggle('header__actions--mobile-menu-active', open));
  });
})();
