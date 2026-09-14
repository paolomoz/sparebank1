// _pm-qa-sweep.mjs — read-only sweep of the published origin: every roster page 200 + 0 about:error + title; redirects; chrome docs; console errors on a sample
import fs from 'node:fs'; import { chromium } from 'playwright';
const ORIGIN = 'https://main--sparebank1--paolomoz.aem.live';
const st = JSON.parse(fs.readFileSync('stardust/state.json', 'utf8'));
const norm = (p) => p.toLowerCase().split('/').map((s) => s.replace(/_/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')).join('/').replace(/\/{2,}/g, '/');
const pages = st.pages.map((p) => ({ slug: p.slug, family: p.archetypeFamily, live: p.url.split('sparebank1.no')[1], path: norm(p.url.split('sparebank1.no')[1].replace(/\.html$/, '')) }));
const out = { at: new Date().toISOString(), origin: ORIGIN, pages: [], chrome: {}, redirects: {}, console: [] };
let i = 0; async function worker() { while (i < pages.length) { const pg = pages[i++]; try {
  const r = await fetch(`${ORIGIN}${pg.path}.plain.html`); const html = r.ok ? await r.text() : ''; const errs = (html.match(/about:error/g) || []).length; const imgs = (html.match(/<img /g) || []).length;
  const r2 = await fetch(`${ORIGIN}${pg.path}`, { redirect: 'manual' });
  const rl = await fetch(`${ORIGIN}${pg.live}`, { redirect: 'manual' }); const loc = rl.headers.get('location') || '';
  out.pages.push({ path: pg.path, family: pg.family, plain: r.status, page: r2.status, aboutError: errs, imgs, liveUrlRedirect: rl.status === 301 && loc.endsWith(pg.path) ? 'ok' : `${rl.status} ${loc}` });
} catch (e) { out.pages.push({ path: pg.path, family: pg.family, error: String(e).slice(0, 120) }); } } }
await Promise.all(Array.from({ length: 6 }, worker));
for (const c of ['nav', 'nav-bedrift', 'nav-om-oss', 'nav-om-oss-2', 'nav-frontend-om-oss', 'nav-frontend-om-oss-2', 'footer', 'footer-2', 'footer-bedrift', 'footer-om-oss', 'footer-frontend-om-oss', 'footer-frontend-om-oss-2', 'redirects.json']) out.chrome[c] = (await fetch(`${ORIGIN}/${c}${c.endsWith('.json') ? '' : '.plain.html'}`)).status;
for (const [from, to] of [['/', '/nb/bank/privat'], ['/nb/bank/privat/lan/boliglan.html', '/nb/bank/privat/lan/boliglan']]) { const r = await fetch(`${ORIGIN}${from}`, { redirect: 'manual' }); out.redirects[from] = `${r.status} → ${(r.headers.get('location') || '').replace(ORIGIN, '')}`; }
const b = await chromium.launch(); const sample = pages.filter((p, k) => k % 10 === 0);
for (const pg of sample) { const p = await b.newPage({ viewport: { width: 1440, height: 900 } }); const errs = []; p.on('pageerror', (e) => errs.push(String(e).slice(0, 120))); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text().slice(0, 120)); }); p.on('requestfailed', (q) => errs.push('reqfail ' + q.url().slice(0, 100)));
  await p.goto(`${ORIGIN}${pg.path}`, { waitUntil: 'networkidle' }).catch((e) => errs.push(String(e).slice(0, 80))); await p.waitForTimeout(800);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth); out.console.push({ path: pg.path, errors: errs.slice(0, 5), overflow: sw > 1440 }); await p.close(); }
await b.close();
fs.mkdirSync('stardust/rollout/qa', { recursive: true }); fs.writeFileSync('stardust/rollout/qa/sweep.json', JSON.stringify(out, null, 1));
const ok = out.pages.filter((p) => p.plain === 200 && p.page === 200 && p.aboutError === 0).length;
console.log(`pages: ${ok}/${out.pages.length} plain+page 200 and 0 about:error`); out.pages.filter((p) => !(p.plain === 200 && p.page === 200 && p.aboutError === 0)).forEach((p) => console.log('  ✗', p.path, p.plain, p.page, 'about:error', p.aboutError, p.error || ''));
console.log('live-url redirects not ok:', out.pages.filter((p) => p.liveUrlRedirect !== 'ok').map((p) => `${p.path} (${p.liveUrlRedirect})`).slice(0, 10));
console.log('chrome:', JSON.stringify(out.chrome)); console.log('redirects:', JSON.stringify(out.redirects));
out.console.forEach((c) => { if (c.errors.length || c.overflow) console.log('  console/overflow', c.path, c.errors, c.overflow ? 'OVERFLOW' : ''); });
