#!/usr/bin/env node
/**
 * chrome.mjs — author the /nav* and /footer* DA documents from the replica prototypes (default content only, D12)
 * and write stardust/rollout/chrome-map.json (slug → { nav, footer }). One nav/footer per chrome VARIANT (privat,
 * bedrift, om-oss, frontend…) keyed by the top-nav active item + main-nav item set (nav) and the link columns (footer).
 *   node stardust/scripts/eds/chrome.mjs
 * /nav contract (read by blocks/header): section 1 brand (logo link) · section 2 market nav <ul> (active = <strong>) ·
 * section 3 main nav <ul> (active = <strong>) · section 4 tools: <p>Søk link</p>, <p><em><strong>Bli kunde</strong></em></p>, <p>Logg inn link</p>.
 * /footer contract (read by blocks/footer): section 1 contact: h2, intro p, <ul> channels (icon span + name + <br> sub) ·
 * sections 2..6 the five contact panels (verbatim captured content) · section 7 link columns (h2 + ul, ×3; social = icon links) ·
 * section 8 small links <ul> · section 9 address <p>.
 */
import fs from 'node:fs'; import crypto from 'node:crypto';
import * as L from './lib.mjs';
const { q, qa, txt, inline, prose, esc, href, section, pageDoc, writeFile } = L;

const state = JSON.parse(fs.readFileSync('stardust/state.json', 'utf8'));
const marketOf = (p) => (/\/nb\/bank\/bedrift/.test(p.url) ? 'bedrift' : /\/nb\/bank\/om-oss/.test(p.url) ? 'om-oss' : 'privat');
const order = { privat: 0, bedrift: 1, 'om-oss': 2 };
const slugs = state.pages.filter((p) => fs.existsSync(`${L.PROTO_DIR}/${p.slug}-proposed.html`)).sort((a, b) => order[marketOf(a)] - order[marketOf(b)] || a.slug.localeCompare(b.slug)).map((p) => p.slug);
const prev = fs.existsSync('stardust/rollout/chrome-map.json') ? JSON.parse(fs.readFileSync('stardust/rollout/chrome-map.json', 'utf8')) : { variants: {}, pages: {} };
const hash = (s) => crypto.createHash('md5').update(s).digest('hex').slice(0, 8);
const ICON = { 'Ring oss': 'ring-oss', 'Avtal møte': 'avtal-mote', 'Skriv til oss': 'skriv-til-oss', 'Finn kontor': 'finn-kontor', Chat: 'chat' };
const socialIcon = (a) => (/linkedin/i.test(a.getAttribute('href') || '') ? 'linkedin' : /youtube/i.test(a.getAttribute('href') || '') ? 'youtube' : /facebook/i.test(a.getAttribute('href') || '') ? 'facebook' : 'link');

function navDoc(header, ctx) {
  const logoA = q(header, '.header__logo a'); const logo = q(header, '.header__logo img');
  const brand = section([`<p><a href="${esc(href(logoA?.getAttribute('href') || '/'))}"><img src="${esc(logo?.getAttribute('src') || '')}" alt="${esc(logo?.getAttribute('alt') || 'SpareBank 1')}"></a></p>`]);
  const li = (a) => `<li><a href="${esc(href(a.getAttribute('href') || ''))}">${inline(a, ctx)}</a></li>`;
  const market = section([`<ul>${qa(header, '.header__topnav a').map(li).join('')}</ul>`]);
  const main = section([`<ul>${qa(header, '.header__mainnav a').map(li).join('')}</ul>`]);
  const search = q(header, '.header__search'); const cta = q(header, '.header__cta'); const login = q(header, '.header__login');
  const tools = section([
    search ? `<p><a href="?search=">${esc(txt(q(search, 'span')) || 'Søk')}</a></p>` : '',
    cta ? `<p><em><strong><a href="${esc(href(cta.getAttribute('href') || ''))}">${esc(txt(cta))}</a></strong></em></p>` : '',
    login ? `<p><a href="/nb/bank/privat/innlogging">${esc(txt(login) || 'Logg inn')}</a></p>` : '',
  ]);
  return pageDoc([brand, market, main, tools]);
}

function footerDoc(footer, ctx) {
  const sections = [];
  const contact = q(footer, '.contact');
  if (contact) {
    const chan = qa(contact, '.contact__action').map((a) => { const name = txt(q(a, '.contact__name')); const sub = txt(q(a, '.contact__sub')); return `<li><span class="icon icon-${ICON[name] || 'chat'}"></span> <a href="${esc(a.getAttribute('href') && a.getAttribute('href') !== '#' ? href(a.getAttribute('href')) : '#' + (a.getAttribute('aria-controls') || ''))}">${esc(name)}</a>${sub ? `<br>${esc(sub)}` : ''}</li>`; }).join('');
    sections.push(section([`<h2>${esc(txt(q(contact, '.contact__title')))}</h2>`, (/Det oppstod en uventet feil/.test(txt(q(contact, '.contact__text'))) ? '' : prose(q(contact, '.contact__text'), ctx)), // the live hidden error string is not an intro (eds-requests W1-6/W2) `<ul>${chan}</ul>`], { style: 'contact' }));
    for (const panel of qa(contact, '.contact__panel')) { const html = (prose(panel, ctx) || '<p></p>').replace(/href="(https:\/\/www\.sparebank1\.no)?\/(nb|nn)\/(gudbrandsdal|hallingdal|helgeland|lom-skjaak|nord-norge|nordmore|ringerike-hadeland|smn|sogn-fjordane|sor-norge|ostfold-akershus|ostlandet)\/[^"]*"/g, 'href="https://www.sparebank1.no/$2/$3/privat.html"'); sections.push(section([html], { style: `contact-panel, ${panel.getAttribute('id') || ''}` })); }
  }
  const cols = qa(footer, '.footer__links').map((g) => { const h = q(g, '.footer__heading'); const social = g.classList.contains('footer__links--social'); const items = qa(g, 'li a').map((a) => (social ? `<li><a href="${esc(href(a.getAttribute('href') || ''))}"><span class="icon icon-${socialIcon(a)}"></span> ${esc(txt(a) || q(a, 'img')?.getAttribute('alt') || '')}</a></li>` : `<li><a href="${esc(href(a.getAttribute('href') || ''))}">${inline(a, ctx)}</a></li>`)).join(''); return `${h ? `<h2>${esc(txt(h))}</h2>` : ''}<ul>${items}</ul>`; });
  sections.push(section(cols, { style: 'columns' }));
  const small = qa(footer, '.footer__small a'); if (small.length) sections.push(section([`<ul>${small.map((a) => `<li><a href="${esc(href(a.getAttribute('href') || ''))}">${inline(a, ctx)}</a></li>`).join('')}</ul>`], { style: 'small' }));
  const addr = q(footer, '.footer__address'); if (addr) sections.push(section([`<p>${inline(addr, ctx)}</p>`], { style: 'address' }));
  return pageDoc(sections);
}

const variants = { nav: {}, footer: {} }; const pages = {};
for (const slug of slugs) {
  const { document } = L.loadProto(slug); const ctx = L.makeCtx(slug);
  const header = q(document, 'header.header'); const footer = q(document, 'footer.footer');
  const out = {};
  const pg = state.pages.find((p) => p.slug === slug); const market = marketOf(pg); const fe = /main--frontend/.test(q(document, 'main')?.className || '');
  if (header) { const doc = navDoc(header, ctx); const key = hash(doc); if (!variants.nav[key]) { const base = fe ? `/nav-frontend-${market}` : market === 'privat' ? '/nav' : `/nav-${market}`; variants.nav[key] = { path: base, doc, pages: [] }; } variants.nav[key].pages.push(slug); out.nav = variants.nav[key].path; }
  if (footer) { const doc = footerDoc(footer, ctx); const key = hash(doc); if (!variants.footer[key]) { const base = fe ? `/footer-frontend-${market}` : market === 'privat' ? '/footer' : `/footer-${market}`; variants.footer[key] = { path: base, doc, pages: [] }; } variants.footer[key].pages.push(slug); out.footer = variants.footer[key].path; }
  pages[slug] = out;
}
// disambiguate nav variant paths that collided on the market name
for (const group of [variants.nav, variants.footer]) { const seen = {}; for (const v of Object.values(group)) { if (seen[v.path]) { seen[v.path] += 1; v.path = `${v.path}-${seen[v.path]}`; } else seen[v.path] = 1; } }
for (const [slug, o] of Object.entries(pages)) { const nv = Object.values(variants.nav).find((v) => v.pages.includes(slug)); if (nv) o.nav = nv.path; const fv = Object.values(variants.footer).find((v) => v.pages.includes(slug)); if (fv) o.footer = fv.path; }
for (const v of [...Object.values(variants.nav), ...Object.values(variants.footer)]) writeFile(`${L.CONTENT_DIR}${v.path}.html`, v.doc);
fs.mkdirSync('stardust/rollout', { recursive: true });
fs.writeFileSync('stardust/rollout/chrome-map.json', JSON.stringify({ writtenAt: new Date().toISOString(), variants: { nav: Object.values(variants.nav).map((v) => ({ path: v.path, pages: v.pages })), footer: Object.values(variants.footer).map((v) => ({ path: v.path, pages: v.pages })) }, pages }, null, 1));
console.log(`nav variants: ${Object.values(variants.nav).map((v) => `${v.path} (${v.pages.length})`).join(', ')} · footer variants: ${Object.values(variants.footer).map((v) => `${v.path} (${v.pages.length})`).join(', ')} · ${slugs.length} pages mapped`);
