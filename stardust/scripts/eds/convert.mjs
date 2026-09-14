#!/usr/bin/env node
/**
 * convert.mjs — replica prototype → DA body-fragment content page (stardust:rollout Phase C ENCODE).
 *   node stardust/scripts/eds/convert.mjs <slug> [slug…] | --all
 * Writes content/<da-path>.html and stardust/rollout/eds-log/<slug>.json (module→block map, notes, gaps).
 * DA path = the live pathname without .html (/nb/bank/privat/lan/boliglan.html → /nb/bank/privat/lan/boliglan).
 * Every <main> child of the prototype is a module root; ENCODERS map it to one DA section. A module with no encoder
 * is emitted as prose default content and logged as a gap (the page is NOT deliverable until 0 gaps).
 * The page's chrome variant (privat / bedrift / om-oss / frontend) selects the /nav and /footer documents via metadata.
 */
import fs from 'node:fs';
import path from 'node:path';
import * as L from './lib.mjs';
import { ENCODERS } from './encoders.mjs';

const args = process.argv.slice(2);
const state = JSON.parse(fs.readFileSync('stardust/state.json', 'utf8'));
const types = JSON.parse(fs.readFileSync('stardust/current/_page-types.json', 'utf8'));
const slugs = args.includes('--all') ? state.pages.map((p) => p.slug) : args.filter((a) => !a.startsWith('--'));
if (!slugs.length) { console.error('usage: convert.mjs <slug…> | --all'); process.exit(1); }
const chromeMap = fs.existsSync('stardust/rollout/chrome-map.json') ? JSON.parse(fs.readFileSync('stardust/rollout/chrome-map.json', 'utf8')).pages : {};

export const daPath = (url) => { const p = new URL(url).pathname.replace(/\.html$/, '').replace(/\/$/, ''); return p || '/index'; };

function metadataBlock(pg, doc, chrome) {
  const meta = (name) => doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`)?.getAttribute('content') || '';
  const title = doc.querySelector('title')?.textContent.trim() || pg.title || '';
  const cap = JSON.parse(fs.readFileSync(`stardust/current/pages/${pg.slug}.json`, 'utf8'));
  const rows = [['title', title], ['description', meta('description') || cap.metaDescription || ''], ['image', cap.og?.image || ''], ['template', pg.archetypeFamily], ['market', /\/nb\/bank\/bedrift/.test(pg.url) ? 'bedrift' : /\/nb\/bank\/om-oss/.test(pg.url) ? 'om-oss' : 'privat'], ['source', pg.url]];
  if (cap.og?.type) rows.push(['og:type', cap.og.type]);
  if (chrome?.nav && chrome.nav !== '/nav') rows.push(['nav', chrome.nav]);
  if (chrome?.footer && chrome.footer !== '/footer') rows.push(['footer', chrome.footer]);
  return L.block('metadata', [], rows.filter(([, v]) => v).map(([k, v]) => [k, L.esc(v)]));
}

for (const slug of slugs) {
  const pg = state.pages.find((p) => p.slug === slug); if (!pg) { console.error(`no page ${slug}`); continue; }
  const protoFile = path.join(L.PROTO_DIR, `${slug}-proposed.html`); if (!fs.existsSync(protoFile)) { console.error(`no prototype for ${slug}`); continue; }
  const { document } = L.loadProto(slug); const ctx = L.makeCtx(slug); ctx.notes = []; ctx.gaps = [];
  const chrome = chromeMap[slug] || { nav: '/nav', footer: '/footer' };
  const sections = [L.section([metadataBlock(pg, document, chrome)])];
  const map = [];
  const bc = document.querySelector('section.bank-choice'); if (bc) { const r = ENCODERS['bank-choice'](bc, ctx); sections.push(r.html); map.push({ module: 'bank-choice', blocks: r.blocks }); }
  let pendingStyle = null;
  for (const root of document.querySelector('main').children) {
    const tag = root.tagName.toLowerCase();
    if (tag === 'hr') { pendingStyle = /rule--visible/.test(root.className) ? 'rule-visible' : /rule--extra-top/.test(root.className) ? 'rule' : pendingStyle; continue; }
    const key = [...root.classList].find((c) => ENCODERS[c]) || (root.classList.contains('richtext') ? 'richtext' : root.classList.contains('module') ? 'module' : null);
    const enc = key ? ENCODERS[key] : null;
    let r = enc ? enc(root, ctx) : null;
    if (!r) { r = ENCODERS.module(root, ctx); if (!r) { ctx.gaps.push(`module ${root.className} produced no content`); continue; } if (!key) ctx.gaps.push(`no encoder for module ${root.className}`); }
    let html = r.html;
    if (pendingStyle) { html = html.replace(/<div class="section-metadata"><div><div>style<\/div><div>([^<]*)<\/div><\/div><\/div>/, (m, v) => `<div class="section-metadata"><div><div>style</div><div>${v}, ${pendingStyle}</div></div></div>`); if (!/section-metadata/.test(html)) html = html.replace(/<\/div>\s*$/, `${L.sectionMeta({ style: pendingStyle })}</div>`); pendingStyle = null; }
    sections.push(html); map.push({ module: key || root.className, blocks: r.blocks });
  }
  const out = L.pageDoc(sections);
  const rel = daPath(pg.url); const file = path.join(L.CONTENT_DIR, `${rel}.html`);
  L.writeFile(file, out);
  fs.mkdirSync('stardust/rollout/eds-log', { recursive: true });
  fs.writeFileSync(`stardust/rollout/eds-log/${slug}.json`, JSON.stringify({ slug, daPath: rel, file, chrome, modules: map, blocks: [...new Set(map.flatMap((m) => m.blocks))], notes: ctx.notes, gaps: ctx.gaps, assets: [...ctx.assets], writtenAt: new Date().toISOString() }, null, 1));
  console.log(`${slug} → ${file} · ${map.length} modules · blocks ${[...new Set(map.flatMap((m) => m.blocks))].join(',')} · gaps ${ctx.gaps.length}${ctx.gaps.length ? ' (' + ctx.gaps.join('; ') + ')' : ''}`);
}
