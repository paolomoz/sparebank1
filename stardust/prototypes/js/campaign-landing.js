/* campaign-landing.js — observed only (stardust/replica/motion/hjemme-1440.json, hjemme-360.json).
   Fired on the live page: (1) `.block-media` gets `block-media--visible` while its block intersects the viewport (opacity 0→1,
   1s ease-out) and loses it again when it leaves; (2) the factbox content column gets `is-visible` on intersection
   (opacity/transform transitions .6s/1.4s); (3) button hovers (CSS); (4) header search / hamburger states as on every
   frontend page (below, same inventory as js/news-article.js). NOT fired: `block-media--scrolling` (fixed parallax mode
   declared in the frontend CSS) — not implemented. Header static (78 px / 60 px) at every sampled scroll position. */
(function () {
  const media = document.querySelectorAll('.story__block .story__media');
  const facts = document.querySelectorAll('.story__factbox-col--content');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        const m = en.target.querySelector(':scope > .story__media');
        if (m) m.classList.toggle('is-visible', en.isIntersecting);
      });
    }, { threshold: 0.01 });
    media.forEach((m) => io.observe(m.parentElement));
    const io2 = new IntersectionObserver((entries) => { entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add('is-visible'); io2.unobserve(en.target); } }); }, { threshold: 0.01 });
    facts.forEach((f) => io2.observe(f));
  } else { media.forEach((m) => m.classList.add('is-visible')); facts.forEach((f) => f.classList.add('is-visible')); }

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
    const open = wrap.classList.contains('header__wrap--active');
    header.querySelectorAll('.header__actions').forEach((a) => a.classList.toggle('header__actions--mobile-menu-active', open));
  });
})();
