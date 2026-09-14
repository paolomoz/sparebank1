/* canon.js — interaction parity, observed only (stardust/replica/motion/*.json + live probes 2026-09-14).
   1. Mobile header scroll morph: .header__wrap gets `scroll` when scrollY > 130 (fixed, top -130px) and `show`
      when scrolling back up more than 400px from the furthest point (top 0) — lifted from clientlib module 2741.
   2. "Til toppen" button: `show` when scrolled (bottom 0), hidden at top.
   3. FAQ accordion: aria-expanded toggle, one panel per item; "Se flere spørsmål og svar" reveals the hidden items.
   4. Bank-choice "Se alle banker": collapse toggle of the 12-bank list.
   5. Hamburger: toggles .header__wrap--active (mobile menu).
   6. Contact tabs: aria-selected + panel visibility (static panels captured verbatim).
   Nothing else fires on the live page (0 animations; hover states are CSS-only, lifted from hover diffs). */
(function () {
  const wrap = document.querySelector('.header__wrap');
  const toTop = document.querySelector('.to-top');
  const THRESHOLD = 130; let bottomScrollPoint = 0; let last = 0;
  function onScroll() {
    const y = window.scrollY || document.documentElement.scrollTop;
    const scrolled = y > THRESHOLD;
    if (wrap) { wrap.classList.toggle('scroll', scrolled); wrap.classList.toggle('show', scrolled && y < bottomScrollPoint - 400); }
    if (toTop) { toTop.classList.toggle('scroll', scrolled); toTop.classList.toggle('show', scrolled); }
    if (y > last) bottomScrollPoint = y; last = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();
  if (toTop) toTop.addEventListener('click', (e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); });

  document.querySelectorAll('.accordion__button').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      const panel = document.getElementById(btn.getAttribute('aria-controls')) || btn.closest('.accordion__item').querySelector('.accordion__panel');
      if (panel) panel.style.height = open ? '0px' : 'auto';
      btn.closest('.accordion__item').classList.toggle('accordion__item--open', !open);
    });
  });
  document.querySelectorAll('.faq__more-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      btn.closest('.faq').querySelectorAll('.accordion__item--more').forEach((it) => { it.style.display = open ? 'none' : ''; });
      btn.querySelector('.btn__label').textContent = open ? 'Se flere spørsmål og svar' : 'Se færre spørsmål og svar';
    });
  });
  document.querySelectorAll('.bank-choice__expand').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      const list = document.getElementById(btn.getAttribute('aria-controls')); if (list) list.hidden = open;
      btn.closest('.bank-choice__all').classList.toggle('bank-choice__all--open', !open);
    });
  });
  const burger = document.querySelector('.header__hamburger');
  if (burger && wrap) burger.addEventListener('click', () => { const open = burger.getAttribute('aria-expanded') === 'true'; burger.setAttribute('aria-expanded', String(!open)); wrap.classList.toggle('header__wrap--active', !open); burger.classList.toggle('is-open', !open); });
  document.querySelectorAll('.contact__action[role="tab"]').forEach((tab) => {
    tab.addEventListener('click', (e) => {
      if (tab.getAttribute('href') === '#' || tab.getAttribute('href') === '#/' ) e.preventDefault();
      const selected = tab.getAttribute('aria-selected') === 'true';
      document.querySelectorAll('.contact__action[role="tab"]').forEach((t) => { t.setAttribute('aria-selected', 'false'); t.closest('.contact__item').classList.remove('is-active'); });
      document.querySelectorAll('.contact__panel').forEach((p) => { p.hidden = true; });
      if (!selected) { tab.setAttribute('aria-selected', 'true'); tab.closest('.contact__item').classList.add('is-active'); const p = document.getElementById(tab.getAttribute('aria-controls')); if (p) p.hidden = false; }
    });
  });
  const pn = document.getElementById('postnummer-input');
  if (pn) pn.addEventListener('input', () => { const ok = /^\d{4}$/.test(pn.value); const msg = pn.parentElement.querySelector('.bank-choice__message'); if (msg) msg.textContent = pn.value && !ok ? 'Skriv inn et gyldig postnummer (4 siffer).' : ''; if (ok) { const btn = document.querySelector('.bank-choice__expand'); if (btn && btn.getAttribute('aria-expanded') !== 'true') btn.click(); } });
})();
