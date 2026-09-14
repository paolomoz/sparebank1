import { el, icon, inlineIcons } from '../../scripts/sb1.js';

/**
 * cards — every FFE card list on the site (collection pattern, reconstructive). One row per card:
 *   [picture?][body: optional tag <p>, <h3><a>title</a></h3>, text <p>…]  (a body-only row = card without media)
 * Variants: `grid lg-N` (band card grid, N = column span), `price` (small text cards, 4-up), `news` (related-topics rail, 300px cards),
 * `nav` (visual-nav: image card / icon card), `static`. Card-as-link (EW6): the title anchor's href becomes the card's;
 * the authored heading stays inside as the editable unit. Live hover: surface #e7f1f9 + 1px ring; title underline.
 */
export default function decorate(block) {
  const news = block.classList.contains('news'); const price = block.classList.contains('price');
  const nav = block.classList.contains('nav'); const smallList = block.classList.contains('small'); // additive variants (hub visual-nav, hub icon list)
  const featured = block.classList.contains('featured'); // additive variant (theme / markedsnytt featured card): full richtext body, not clickable, the illustration is never an icon
  const listing = block.classList.contains('listing'); // additive variant (news-listing): tag eyebrow + d/m/yyyy date paragraphs, first row = the featured headline
  const list = el('ul', { class: 'card-list' });
  [...block.children].forEach((row) => {
    const cells = [...row.children];
    const media = cells.find((c) => c.querySelector('picture, img') && !c.querySelector('h1,h2,h3,h4,h5,h6'));
    const body = cells.find((c) => c !== media && c.textContent.trim()) || cells[cells.length - 1]; // rows are [media][body]; the media cell may be empty
    const title = body.querySelector('h1,h2,h3,h4,h5,h6'); const link = featured ? null : (title?.querySelector('a') || body.querySelector('a')); // featured: not clickable on live
    const href = link?.getAttribute('href');
    // live model: the card is a <div>; the authored title link is the link (EW1/EW6 — moved, never rebuilt); the whole card is clickable via JS
    const card = el('div', { class: `card ${media ? 'card--medium' : 'card--small card--no-image'}${price ? ' card--price' : ''}${news ? ' card--news' : ''}${href ? ' card--clickable' : ''}` });
    const bodyEl = el('div', { class: 'card__body' }); const content = el('div', { class: 'card__content' });
    if (media) {
      const pic = media.querySelector('picture, img'); const img = media.querySelector('img');
      const src = img?.getAttribute('src') || ''; const small = !featured && img && ((img.getAttribute('width') && +img.getAttribute('width') <= 80) || /\/ikoner\//.test(src) || (/\.svg(\?|$)/.test(src) && !/bankchoice/.test(src)));
      const iconColumn = small && (nav || smallList); // nav / small: the icon is a left column beside a visible title (live visual-nav icon row, hub related icon card)
      const m = el('div', { class: small && !iconColumn ? 'card__iconwrap' : 'card__media' }); m.append(pic);
      // a photo heads the card; a small icon sits inside the body above the title (live card--small)
      if (small) card.classList.replace('card--medium', 'card--small');
      if (small && !iconColumn) { content.append(m); if (title) title.classList.add('visually-hidden'); /* the icon is the visible title; the heading stays as the accessible name (live) */ } else card.append(m);
    }
    [...body.children].forEach((node) => {
      if (node === title) { node.classList.add('card__title'); content.append(node); return; }
      // the tag line: a short link-less paragraph before the title (live renders it uppercase)
      const t = node.textContent.trim();
      if (node.tagName === 'P' && t && t.length < 30 && !node.querySelector('a') && !content.querySelector('.card__title') && (news || listing || t === t.toUpperCase())) { node.classList.add('card__tag'); content.append(node); return; }
      // news rail: the short date-shaped paragraph after the title is the publication date (live .card__date) — additive
      if (news && node.tagName === 'P' && content.querySelector('.card__title') && /^\d{1,2}\.\s*\p{L}+\s+\d{4}$/u.test(t)) { node.classList.add('card__date'); content.append(node); return; }
      if (listing && node.tagName === 'P' && content.querySelector('.card__title') && /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(t)) { node.classList.add('card__date'); content.append(node); return; } // additive (news-listing): the feed's d/m/yyyy date
      node.classList.add('card__text'); content.append(node);
    });
    bodyEl.append(content, el('div', { class: 'card__arrow' }, icon('arrow')));
    card.append(bodyEl);
    if (href && link) card.addEventListener('click', (e) => { if (e.target.closest('a')) return; if (e.metaKey || e.ctrlKey) window.open(href, '_blank'); else window.location.href = href; });
    if (listing && !list.children.length) card.classList.add('card--headline'); // additive (news-listing): the first authored row is the featured headline card (live: the newest feed item)
    list.append(el('li', {}, card));
  });
  block.replaceChildren(list);
  inlineIcons(block);
}
