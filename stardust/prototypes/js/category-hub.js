/* category-hub.js — interaction parity for hub pages, observed only (stardust/replica/motion/lan-1440.json, lan-360.json):
   - LOfavør co-branding toggle: the expand button gains `ffe-button--expanded`, its label gets `hide`, the content shows.
   - visual-nav cards: NO hover change fired on live (dead ffe-card-base:hover) → nothing implemented.
   - shortcut buttons: hover handled in CSS (colour/background swap + chevron rotate/translate, lifted from the hover diff). */
(function () {
  document.querySelectorAll('.cobranding__toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      btn.classList.toggle('is-expanded', !open);
      const c = document.getElementById(btn.getAttribute('aria-controls'));
      if (c) c.style.display = open ? 'none' : '';
    });
  });
})();
