// frontend-chrome.mjs — header/footer for the `nettsider-frontend` clientlib variant (news-article, news-listing,
// campaign-landing). Content verbatim from the rendered-DOM sidecar; class vocabulary = canon header/footer names
// (so canon.css + canon.js apply) plus `header--frontend` / `footer--frontend` for the variant deltas in news-article.css.
// Lifted geometry: stardust/replica/lift/nyhet-1440-detail.json / nyhet-360-detail.json + frontend_clientlib_base CSS.
const maskOf = (span) => { const m = (span?.getAttribute('style') || '').match(/mask-image:\s*(url\([^)]*\))/); return m ? m[1].replace(/&quot;/g, '"') : null; };

export default {
  __header(H, ctx) {
    const { el, txt, abs, svgOf } = ctx; if (!H) return null;
    const disableBottom = /header--disable-bottom-links/.test(H.className);
    const h = el('header', { class: 'header header--frontend' + (disableBottom ? ' header--no-bottom-links' : '') + (/sb1-story__header/.test(H?.className || '') ? ' header--story' : '') });
    const wrap = el('div', { class: 'header__wrap' }); const content = el('div', { class: 'header__content' });
    const top = el('div', { class: 'header__top' });
    // mobile search button (absolute, left) — the icon is a CSS mask (data: SVG) on the live page; carried as a custom property
    const sb = H.querySelector('.header-search-button'); const glass = sb?.querySelector('.header-search-button__icon--glass'); const cross = sb?.querySelector('.header-search-button__icon--cross');
    const searchBtn = el('button', { type: 'button', class: 'header__search header__search--frontend', 'aria-label': sb?.getAttribute('aria-label') || 'Utvid søkefelt', 'aria-expanded': 'false', 'aria-controls': 'header-searcharea' }, [
      el('span', { class: 'header__search-icon header__search-icon--cross', role: 'img', style: maskOf(cross) ? `--icon:${maskOf(cross)}` : null }),
      el('span', { class: 'header__search-icon header__search-icon--glass', role: 'img', style: maskOf(glass) ? `--icon:${maskOf(glass)}` : null }),
      el('span', { class: 'header__search-text' }, [txt(sb?.querySelector('.header-search-button__text')) || 'Søk'])]);
    top.append(searchBtn);
    const logoA = H.querySelector('.header__logo a'); const logoImg = H.querySelector('.header__logo img');
    top.append(el('div', { class: 'header__logo' }, [el('a', { href: abs(logoA?.getAttribute('href')) }, [el('img', { src: abs(logoImg?.getAttribute('src')), alt: logoImg?.getAttribute('alt') || '', width: '170', height: '49' })])]));
    top.append(el('button', { type: 'button', class: 'header__hamburger', 'aria-label': 'Meny', 'aria-expanded': 'false', 'aria-controls': 'main-menu' }, [el('span', { class: 'header__hamburger-bar' })]));
    const topnav = el('nav', { class: 'header__topnav', 'aria-label': 'Marked' }); const ul = el('ul');
    for (const a of H.querySelectorAll('.header__top-nav a')) { ul.append(el('li', {}, [el('a', { href: abs(a.getAttribute('href')), class: /\bactive\b/.test(a.className) ? 'is-active' : null }, [txt(a)])])); ul.append(ctx.O.createTextNode('\n')); }
    topnav.append(ul); top.append(topnav); content.append(top);
    const user = el('div', { class: 'header__user' }); user.append(searchBtn.cloneNode(true)); // desktop position of the same control
    user.firstChild.classList.add('header__search--desktop'); searchBtn.classList.add('header__search--mobile');
    const actions = el('div', { class: 'header__actions' });
    const bli = H.querySelector('.bank-buttons__button--customer'); if (bli) actions.append(el('button', { type: 'button', class: 'btn btn--action header__cta' }, [el('span', { class: 'btn__label' }, [txt(bli) + ' '])]));
    const login = H.querySelector('.bank-buttons__button--login'); if (login) actions.append(el('button', { type: 'button', class: 'header__login', 'aria-label': login.getAttribute('aria-label') || 'Logg inn', 'aria-expanded': 'false', 'aria-controls': 'login-choices' }, [el('span', {}, [txt(login) || 'Logg inn'])]));
    user.append(actions); user.append(el('section', { id: 'login-choices', role: 'region', 'aria-labelledby': 'login-button', hidden: true })); content.append(user);
    const nav = el('nav', { class: 'header__mainnav', id: 'main-menu', 'aria-label': 'Hovedmeny' }); const nul = el('ul');
    for (const a of H.querySelectorAll('.header__main-nav a')) { nul.append(el('li', {}, [el('a', { href: abs(a.getAttribute('href')), class: /\bactive\b/.test(a.className) ? 'is-active' : null }, [' ' + txt(a) + ' '])])); nul.append(ctx.O.createTextNode('\n')); }
    nav.append(nul); content.append(nav); wrap.append(content); h.append(wrap);
    h.append(el('div', { id: 'header-searcharea', class: 'header__searcharea' }));
    return h;
  },
  __footer(F, ctx) {
    const { el, txt, abs, cleanCopy } = ctx; if (!F) return null;
    const f = el('footer', { class: 'footer footer--frontend' });
    const grid = el('div', { class: 'footer__grid' });
    const topRow = el('div', { class: 'footer__row footer__row--top' }); const cols = el('div', { class: 'footer__columns' });
    for (const col of F.querySelectorAll('.footer-columns__top .footer-columns__column')) {
      const social = /social-media/.test(col.className);
      const c = el('div', { class: 'footer__links' + (social ? ' footer__links--social' : '') });
      const h = col.querySelector('h2'); if (h) c.append(el('h2', { class: 'footer__heading' }, [txt(h)]));
      const ul = el('ul', { class: 'footer__list' + (social ? ' footer__list--horizontal' : '') });
      for (const li of col.querySelectorAll('li')) { const a = li.querySelector('a'); if (!a) continue; if (social) { const img = a.querySelector('img'); ul.append(el('li', {}, [el('a', { class: 'footer__social', href: abs(a.getAttribute('href')), target: a.getAttribute('target'), rel: a.getAttribute('rel'), title: a.getAttribute('title') }, [el('img', { src: abs(img?.getAttribute('src')), alt: img?.getAttribute('alt') || '', width: '30', height: '30' })])])); } else ul.append(el('li', {}, [el('a', { class: 'footer__link', href: abs(a.getAttribute('href')) }, [txt(a)])])); }
      c.append(ul); cols.append(c);
    }
    topRow.append(cols); grid.append(topRow);
    grid.append(el('hr', { class: 'footer__divider' }));
    const bottomRow = el('div', { class: 'footer__row footer__row--bottom' }); const bl = el('ul', { class: 'footer__list footer__list--horizontal footer__small' });
    for (const a of F.querySelectorAll('.footer-columns__bottom a')) { bl.append(el('li', {}, [el('a', { class: 'footer__link', href: abs(a.getAttribute('href')) }, [txt(a)])])); bl.append(ctx.O.createTextNode('\n')); }
    bottomRow.append(el('div', { class: 'footer__bottom-col' }, [bl])); grid.append(bottomRow); f.append(grid);
    const info = F.querySelector('.footer-info'); if (info) f.append(el('div', { class: 'footer__info' }, [txt(info)]));
    return f;
  },
};
