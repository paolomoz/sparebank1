/* product.js — product-sibling widgets (static snapshots wired to their declared aria contract; canon.js owns the FAQ accordion,
   header, bank-choice). 1. progressive-disclosure: the expand pill toggles the collapsed content box (live js-toggle-btn,
   aria-expanded/aria-controls). 2. guide-carousel: prev/next switch the active tabpanel and the "N av M" index (wraps).
   3. step-by-step: clicking a step makes it active and moves its content into the detail panel (live step-item__choice contract).
   4. comparison: row expand buttons + the mobile filter tabs (column N shown). */
(function () {
  document.querySelectorAll('.disclosure__btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      const open = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', String(!open));
      const panel = document.getElementById(btn.getAttribute('aria-controls')); if (panel) panel.hidden = open;
      btn.closest('.disclosure').classList.toggle('disclosure--open', !open);
    });
  });

  document.querySelectorAll('.gcarousel').forEach((car) => {
    const items = [...car.querySelectorAll('.gcarousel__item')]; const tabs = [...car.querySelectorAll('.gcarousel__tabs [role=tab]')]; const idx = car.querySelector('.gcarousel__index');
    let i = Math.max(0, items.findIndex((it) => it.classList.contains('gcarousel__item--active')));
    const show = (n) => { i = (n + items.length) % items.length; items.forEach((it, k) => it.classList.toggle('gcarousel__item--active', k === i)); tabs.forEach((t, k) => t.setAttribute('aria-selected', String(k === i))); if (idx) idx.textContent = String(i + 1); };
    const prev = car.querySelector('.gcarousel__prev'); const next = car.querySelector('.gcarousel__next');
    if (prev) prev.addEventListener('click', () => show(i - 1)); if (next) next.addEventListener('click', () => show(i + 1));
  });

  document.querySelectorAll('.steps').forEach((steps) => {
    const items = [...steps.querySelectorAll('.steps__item')]; const info = steps.querySelector('.steps__info');
    items.forEach((item) => {
      const choice = item.querySelector('.steps__choice');
      choice.addEventListener('click', (e) => {
        if (e.target.closest('a')) e.preventDefault();
        items.forEach((it) => { it.classList.toggle('steps__item--active', it === item); it.querySelector('.steps__choice').setAttribute('aria-expanded', String(it === item)); });
        if (info) { info.replaceChildren(...[...item.querySelector('.steps__content').children].map((c) => c.cloneNode(true))); }
      });
    });
  });

  document.querySelectorAll('.comparison').forEach((cmp) => {
    cmp.querySelectorAll('.comparison-table__expand-button').forEach((btn) => {
      btn.addEventListener('click', () => {
        const open = btn.getAttribute('aria-expanded') === 'true'; btn.setAttribute('aria-expanded', String(!open));
        const row = cmp.querySelector('#' + CSS.escape(btn.getAttribute('aria-controls') || '')); if (row) row.classList.toggle('ffe-table__row--collapsed', open);
      });
    });
    const tabs = [...cmp.querySelectorAll('.comparison__tab')]; const table = cmp.querySelector('table');
    tabs.forEach((tab) => tab.addEventListener('click', () => {
      tabs.forEach((t) => { const on = t === tab; t.classList.toggle('comparison__tab--selected', on); t.setAttribute('aria-checked', String(on)); });
      const col = +tab.dataset.col; if (!table) return;
      table.querySelectorAll('tr').forEach((tr) => { const cells = [...tr.children].filter((c) => c.classList.contains('comparison-table__content') || c.classList.contains('comparison-table__header')); cells.forEach((c, k) => c.classList.toggle('comparison--hide-mobile', k !== col - 1)); });
    }));
  });
  document.querySelectorAll('.seclist').forEach((sec) => {
    const items = [...sec.querySelectorAll('.seclist__item')]; const detail = sec.querySelector('.seclist__detail');
    items.forEach((item) => item.querySelector('.seclist__btn').addEventListener('click', () => {
      const wasOpen = item.classList.contains('seclist__item--open');
      items.forEach((it) => { const on = it === item; it.classList.toggle('seclist__item--active', on); it.classList.toggle('seclist__item--open', on && !wasOpen); it.querySelector('.seclist__btn').setAttribute('aria-expanded', String(on)); });
      if (detail) detail.replaceChildren(...[...item.querySelector('.seclist__content').children].map((c) => c.cloneNode(true)));
    }));
  });
})();
