#!/usr/bin/env node
/**
 * _w5-chrome.mjs — W5 helper: re-author the FRONTEND chrome documents (news-article / news-listing / campaign-landing)
 * from the CURRENT prototypes. chrome.mjs ran at 17:04Z, before the frontend prototypes were finalised (20:05Z), so
 * /footer-frontend-om-oss was empty and no footer carried the frontend `.footer__info` address line; /nav-om-oss (the
 * listing page's nav per chrome-map.json) lacked Søk / Bli kunde. Same /nav and /footer contracts as chrome.mjs; the
 * chrome map itself is NOT touched — only the documents it already points at for these three pages.
 *   node stardust/scripts/eds/_w5-chrome.mjs
 */
import fs from 'node:fs';
import * as L from './lib.mjs';
const { q, qa, txt, inline, esc, section, pageDoc, writeFile } = L;
// AEM-internal resource paths (/content/sites/sb1/<path>) are the public path (eds-requests.md W1 #4: core href() bounces them)
const href = (h = '') => L.href(h.replace(/^(https:\/\/www\.sparebank1\.no)?\/content\/sites\/sb1(?=\/)/, ''));
const map = JSON.parse(fs.readFileSync('stardust/rollout/chrome-map.json', 'utf8')).pages;
const PAGES = ['nb-bank-om-oss-nyheter-bankkort-laget-av-resirkulert-plast-html', 'nb-bank-om-oss-nyheter-html', 'nb-bank-om-oss-hjemme-html'];
const BLI_KUNDE = '/nb/bank/privat/kundeservice/bestill/bli-kunde'; // the live frontend "Bli kunde" is a <button> (client-side handler); authored as the same CTA the classic nav carries
const socialIcon = (a) => (/linkedin/i.test(a.getAttribute('href') || '') ? 'linkedin' : /youtube/i.test(a.getAttribute('href') || '') ? 'youtube' : /facebook/i.test(a.getAttribute('href') || '') ? 'facebook' : 'link');
function navDoc(header, ctx) {
  const logoA = q(header, '.header__logo a'); const logo = q(header, '.header__logo img');
  const brand = section([`<p><a href="${esc(href(logoA?.getAttribute('href') || '/'))}"><img src="${esc(logo?.getAttribute('src') || '')}" alt="${esc(logo?.getAttribute('alt') || 'SpareBank 1')}"></a></p>`]);
  const li = (a) => `<li><a href="${esc(href(a.getAttribute('href') || ''))}">${esc(txt(a))}</a></li>`;
  const market = section([`<ul>${qa(header, '.header__topnav a').map(li).join('')}</ul>`]);
  const main = section([`<ul>${qa(header, '.header__mainnav a').map(li).join('')}</ul>`]);
  const search = q(header, '.header__search'); const cta = q(header, '.header__cta'); const login = q(header, '.header__login');
  const tools = section([
    search ? `<p><a href="?search=">${esc(txt(q(search, '.header__search-text')) || 'Søk')}</a></p>` : '',
    cta ? `<p><em><strong><a href="${esc(cta.getAttribute('href') ? href(cta.getAttribute('href')) : BLI_KUNDE)}">${esc(txt(cta))}</a></strong></em></p>` : '',
    login ? `<p><a href="/nb/bank/privat/innlogging">${esc(txt(login) || 'Logg inn')}</a></p>` : '',
  ]);
  return pageDoc([brand, market, main, tools]);
}
function footerDoc(footer, ctx) {
  const sections = [];
  const cols = qa(footer, '.footer__links').map((g) => { const h = q(g, '.footer__heading'); const social = g.classList.contains('footer__links--social'); const items = qa(g, 'li a').map((a) => (social ? `<li><a href="${esc(href(a.getAttribute('href') || ''))}"><span class="icon icon-${socialIcon(a)}"></span> ${esc(a.getAttribute('title') || txt(a) || q(a, 'img')?.getAttribute('alt') || '')}</a></li>` : `<li><a href="${esc(href(a.getAttribute('href') || ''))}">${inline(a, ctx)}</a></li>`)).join(''); return `${h ? `<h2>${esc(txt(h))}</h2>` : ''}<ul>${items}</ul>`; });
  sections.push(section(cols, { style: 'columns' }));
  const small = qa(footer, '.footer__small a'); if (small.length) sections.push(section([`<ul>${small.map((a) => `<li><a href="${esc(href(a.getAttribute('href') || ''))}">${inline(a, ctx)}</a></li>`).join('')}</ul>`], { style: 'small' }));
  const addr = q(footer, '.footer__address, .footer__info'); if (addr) sections.push(section([`<p>${inline(addr, ctx)}</p>`], { style: 'address' }));
  return pageDoc(sections);
}
const written = new Map();
for (const slug of PAGES) {
  const { document } = L.loadProto(slug); const ctx = L.makeCtx(slug);
  const { nav, footer } = map[slug];
  const n = navDoc(q(document, 'header.header'), ctx); const f = footerDoc(q(document, 'footer.footer'), ctx);
  for (const [p, doc] of [[nav, n], [footer, f]]) { if (written.has(p) && written.get(p) !== doc) console.warn(`⚠ ${p} differs between pages — last writer wins (${slug})`); written.set(p, doc); writeFile(`${L.CONTENT_DIR}${p}.html`, doc); console.log(`${slug} → ${p}`); }
}
