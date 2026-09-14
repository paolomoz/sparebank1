// lift-styles.mjs — replica Phase 3 § CSS lifting: per-element computed styles + rects for the elements the gate measures,
// at a given width, from a LIVE url (or a local prototype). Uses the shared live-session hardening.
// usage: node stardust/scripts/replica/lift-styles.mjs <url> --width 1440 [--out file.json] [--sel "<css>,<css>…"] [--consent "<sel>"]
import { writeFileSync } from 'node:fs';
import { chromium } from 'playwright';
const argv = process.argv.slice(2); const url = argv[0];
const opt = (k, d) => { const i = argv.indexOf(k); return i > 0 ? argv[i + 1] : d; };
const width = +opt('--width', 1440); const out = opt('--out', null); const consentSel = opt('--consent', 'button:has-text("Godta alle")');
const extraSel = opt('--sel', '').split(',').map(s => s.trim()).filter(Boolean);
const DEFAULT_SELS = ['html', 'body', 'header', 'header .header__top-wrap', 'header .header__logo img', 'header nav', 'header nav a', 'header .ffe-button', 'header button', '.bank-choice', '.bank-choice h2', '.bank-choice p', '.bank-choice input', '.bank-choice button', '.bank-choice img', 'main', 'main > div', 'main h1', 'main h2', 'main h3', 'main p', 'main a.ffe-button', 'main .ffe-button', 'main .primary-btn', 'main .card', 'main .card__container', 'main .ffe-accordion-item', 'main .faq-item__heading', 'main .contact-section', 'main .contact-section a', 'main .feedback', 'main .background-container', 'main .columns-grid', 'main .visual-nav', 'main img', 'main picture', 'footer', 'footer h2', 'footer a', 'footer .footer-bottom', 'footer .bottom-content', 'main .aem-main-container', 'main .ffe-grid', 'main .ffe-grid__row', 'main .ffe-grid__col--sm-12'];
const PROPS = ['display', 'position', 'width', 'height', 'maxWidth', 'minHeight', 'margin', 'padding', 'gap', 'rowGap', 'columnGap', 'gridTemplateColumns', 'flexDirection', 'flexWrap', 'justifyContent', 'alignItems', 'fontFamily', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'textTransform', 'textAlign', 'textDecoration', 'color', 'backgroundColor', 'backgroundImage', 'backgroundSize', 'backgroundPosition', 'border', 'borderRadius', 'boxShadow', 'opacity', 'overflow', 'objectFit', 'aspectRatio', 'textWrap', 'whiteSpace', 'textRendering', 'webkitFontSmoothing', 'fontVariantNumeric', 'zIndex', 'top', 'left', 'right', 'bottom', 'transform', 'boxSizing', 'verticalAlign', 'listStyle'];
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width, height: 900 }, deviceScaleFactor: 1, locale: 'nb-NO', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36', reducedMotion: 'reduce' });
const page = await ctx.newPage(); await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); await page.waitForTimeout(1500);
try { const c = page.locator(consentSel).first(); if (await c.isVisible({ timeout: 1500 })) { await c.click(); await page.waitForTimeout(500); } } catch {}
await page.mouse.move(2, 880);
// settle: slow scroll to trigger lazy loaders, then back to top
await page.evaluate(async () => { const h = document.documentElement.scrollHeight; for (let y = 0; y < h; y += 400) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } window.scrollTo(0, 0); await new Promise(r => setTimeout(r, 600)); });
const data = await page.evaluate(({ sels, props }) => {
  const res = {}; const seen = new Set();
  for (const sel of sels) { let els; try { els = [...document.querySelectorAll(sel)]; } catch { continue; } if (!els.length) continue;
    res[sel] = els.slice(0, 12).map(el => { const cs = getComputedStyle(el); const r = el.getBoundingClientRect(); const o = { tag: el.tagName.toLowerCase(), cls: el.className?.toString().slice(0, 120), text: (el.innerText || '').replace(/\s+/g, ' ').trim().slice(0, 60), rect: { x: Math.round(r.x), y: Math.round(r.y + window.scrollY), w: Math.round(r.width), h: Math.round(r.height) }, style: {} }; for (const p of props) o.style[p] = cs[p]; const bf = getComputedStyle(el, '::before'); if (bf.content && bf.content !== 'none') o.before = { content: bf.content, bg: bf.backgroundImage, w: bf.width, h: bf.height }; return o; }); }
  res.__doc = { scrollHeight: document.documentElement.scrollHeight, fonts: [...document.fonts].map(f => f.family + ' ' + f.status), mainClass: document.querySelector('main')?.className, bodyClass: document.body.className, sections: [...(document.querySelector('main')?.children || [])].map(c => ({ cls: c.className.toString().slice(0, 80), y: Math.round(c.getBoundingClientRect().y + window.scrollY), h: Math.round(c.getBoundingClientRect().height), bg: getComputedStyle(c).backgroundColor })) };
  return res;
}, { sels: [...DEFAULT_SELS, ...extraSel], props: PROPS });
await b.close();
const o = out || `stardust/replica/lift/${new URL(url).pathname.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '')}-${width}.json`;
writeFileSync(o, JSON.stringify({ _provenance: { writtenBy: 'stardust:replica lift-styles.mjs', writtenAt: new Date().toISOString(), url, width }, ...data }, null, 1));
console.log('lifted', Object.keys(data).length - 1, 'selector groups →', o, '| docH', data.__doc.scrollHeight, '| fonts', data.__doc.fonts.join(', '));
console.log('sections:'); data.__doc.sections.forEach(s => console.log(`  y=${s.y} h=${s.h} ${s.bg} ${s.cls}`));
