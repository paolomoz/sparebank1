// campaign-landing.mjs — `.sb1-story__body` (nettsider-frontend "story" campaign page: full-bleed 900 px media blocks with
// centred white content cards, prose sections, anchors, a centred illustration, a CTA and an (empty) factbox).
// Lazy backgrounds / videos are read from the settled DOM saved by the capture pass when it exists for the slug.
import fs from 'node:fs';
import { parseHTML } from 'linkedom';

const settledRoot = (slug) => {
  const map = { 'nb-bank-om-oss-hjemme-html': 'hjemme-settled-1440.html' };
  if (!map[slug]) return null;
  try { const html = fs.readFileSync(new URL(`../../../replica/lift/${map[slug]}`, import.meta.url), 'utf8'); return parseHTML(html).document.querySelector('.sb1-story__body'); } catch { return null; }
};
const has = (n, c) => n?.classList?.contains(c);
// Mobile renditions are chosen client-side (no markup hint after hydration); the 360 lift holds the settled
// background-image per `.image__background`, in DOM order → emitted as --bg-mobile (used below 768 px).
const mobileBackgrounds = (slug) => {
  const map = { 'nb-bank-om-oss-hjemme-html': 'hjemme-360-detail.json' };
  if (!map[slug]) return [];
  try { const L = JSON.parse(fs.readFileSync(new URL(`../../../replica/lift/${map[slug]}`, import.meta.url), 'utf8')); return (L['.image__background'] || []).map((e) => { const m = String(e.style?.backgroundImage || '').match(/url\(\s*["']?([^"')]+)/); return m ? m[1] : null; }); } catch { return []; }
};
const bgUrl = (n) => { const m = (n?.getAttribute('style') || '').match(/url\(\s*["']?([^"')]+)/); return m ? m[1] : null; };

export default {
  'sb1-story__body'(node, ctx) {
    const { el, abs, richtext, button, cleanCopy } = ctx;
    const root = settledRoot(ctx.slug) || node;
    const story = el('section', { class: 'story' });
    const mobiles = mobileBackgrounds(ctx.slug); let bgIndex = 0;

    const block = (b) => {
      const sec = el('section', { class: 'story__block' });
      const media = b.querySelector(':scope > .block-media');
      if (media) {
        const m = el('div', { class: 'story__media' });
        const vid = media.querySelector('video'); const bg = media.querySelector('.image__background'); const img = media.querySelector('img:not(.video__placeholder)');
        if (vid) { const src = vid.querySelector('source')?.getAttribute('src') || vid.getAttribute('src'); m.append(el('video', { class: 'story__video', src: abs(src), title: vid.getAttribute('title'), autoplay: true, muted: true, loop: true, controls: vid.hasAttribute('controls') || null, playsinline: true, preload: 'auto' }, [ctx.txt(vid) || null])); }
        else if (bg && bgUrl(bg)) { const mob = mobiles[bgIndex++]; m.append(el('div', { class: 'story__bg', role: 'img', 'aria-label': '', style: `--bg-desktop:url("${abs(bgUrl(bg))}")` + (mob ? `;--bg-mobile:url("${abs(mob)}")` : '') })); }
        else if (img) m.append(el('img', { class: 'story__bg-img', src: abs(img.getAttribute('src')), alt: img.getAttribute('alt') || '' }));
        sec.append(m);
      }
      const content = b.querySelector(':scope > .block-content');
      if (content) {
        const grid = el('div', { class: 'story__overlay-grid' });
        for (const part of (content.querySelector('.responsive-grid') || content).children) {
          if (has(part, 'text')) grid.append(richtext(part.querySelector('.text-content') || part, 'story__card-text'));
          else if (has(part, 'buttongroup')) { const inner = el('div', { class: 'story__btn-group', role: 'group' }); for (const a of part.querySelectorAll('a.ffe-button, button.ffe-button')) inner.append(el('div', { class: 'story__btn' }, [button(a)])); grid.append(el('div', { class: 'story__card-buttons' }, [inner])); }
          else if (has(part, 'button')) { const a = part.querySelector('a.ffe-button, button.ffe-button'); if (a) grid.append(el('div', { class: 'story__card-button' }, [button(a)])); }
          else { const cc = cleanCopy(part); if (cc) grid.append(cc); }
        }
        sec.append(el('div', { class: 'story__overlay' }, [grid]));
      }
      return sec;
    };

    for (const c of root.children) {
      if (has(c, 'block')) story.append(block(c));
      else if (has(c, 'slidescontainer')) { const s = el('div', { class: 'story__slides' }); for (const b of c.querySelectorAll(':scope > .block')) s.append(block(b)); story.append(s); }
      else if (has(c, 'text')) story.append(el('div', { class: 'story__text' }, [richtext(c.querySelector('.text-content') || c)]));
      else if (has(c, 'anchor')) { const hr = c.querySelector('hr'); story.append(el('div', { class: 'story__anchor' + (/extra-margin-top/.test(hr?.className || '') ? ' story__anchor--extra' : ''), id: hr?.id || null })); }
      else if (has(c, 'image')) { const img = c.querySelector('img'); const max = (c.getAttribute('style') || '').match(/max-width:\s*([^;]+)/); if (img) story.append(el('div', { class: 'story__image', style: max ? `max-width:${max[1].trim()}` : null }, [el('img', { src: abs(img.getAttribute('src')), alt: img.getAttribute('alt') || '', role: img.getAttribute('role') })])); }
      else if (has(c, 'button')) { const a = c.querySelector('a.ffe-button, button.ffe-button'); if (a) story.append(el('div', { class: 'story__button' }, [button(a)])); }
      else if (has(c, 'factbox')) {
        const cols = [...c.querySelectorAll('.factbox__col')].map((col) => { const d = el('div', { class: 'story__factbox-col' + (has(col, 'factbox__col-content') ? ' story__factbox-col--content' : '') }); for (const ch of col.childNodes) { const cc = cleanCopy(ch); if (cc) d.append(cc); } return d; });
        story.append(el('div', { class: 'story__factbox' }, [el('div', { class: 'story__factbox-row' }, cols)]));
      }
      else { const cc = cleanCopy(c); if (cc) story.append(cc); }
    }
    return story;
  },
};
