#!/usr/bin/env node
/**
 * rasterise-svg.mjs [--all | <svg-url> …] — render oversize authored SVGs (> 40KB, see lib.mjs SVG_LIMIT) to PNG at 2× their
 * intrinsic size with Playwright and upload them to DA media (admin.da.live/source/<org>/<repo>/media/<name>.png).
 * Default set: every `rasterise` entry in stardust/rollout/eds-log/*.json. Ledger stardust/rollout/raster-ledger.json (idempotent).
 * Needs DA_TOKEN (never printed). Local copies land in stardust/rollout/raster/<name>.png.
 */
import fs from 'node:fs'; import path from 'node:path'; import { chromium } from 'playwright';
import { ORG, REPO, rasterName } from './lib.mjs';
const TOKEN = process.env.DA_TOKEN; if (!TOKEN) { console.error('DA_TOKEN missing (set -a; source ~/.claude/.env; set +a)'); process.exit(1); }
const LEDGER = 'stardust/rollout/raster-ledger.json'; const OUT = 'stardust/rollout/raster'; fs.mkdirSync(OUT, { recursive: true });
const args = process.argv.slice(2); let urls = args.filter((a) => !a.startsWith('--'));
if (!urls.length) { const set = new Set(); for (const f of fs.readdirSync('stardust/rollout/eds-log')) (JSON.parse(fs.readFileSync(`stardust/rollout/eds-log/${f}`, 'utf8')).rasterise || []).forEach((u) => set.add(u)); urls = [...set]; }
const ledger = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, 'utf8')) : {};
const browser = await chromium.launch(); let up = 0, skip = 0, fail = 0;
for (const url of urls) {
  const name = rasterName(url);
  if (ledger[url]?.status === 201 && !args.includes('--force')) { skip++; continue; }
  try {
    const svg = await (await fetch(url)).text();
    const page = await browser.newPage({ viewport: { width: 1200, height: 1200 }, deviceScaleFactor: 2 });
    await page.setContent(`<!doctype html><html><body style="margin:0;background:transparent">${svg}</body></html>`);
    const box = await page.evaluate(() => { const s = document.querySelector('svg'); const vb = s.viewBox?.baseVal; const w = s.width?.baseVal?.value || vb?.width || 800; const h = s.height?.baseVal?.value || vb?.height || 600; s.setAttribute('width', w); s.setAttribute('height', h); s.style.display = 'block'; const r = s.getBoundingClientRect(); return { w: Math.ceil(r.width), h: Math.ceil(r.height) }; });
    await page.setViewportSize({ width: Math.max(1, box.w), height: Math.max(1, box.h) });
    const buf = await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: box.w, height: box.h } });
    await page.close();
    fs.writeFileSync(path.join(OUT, name), buf);
    const fd = new FormData(); fd.append('data', new Blob([buf], { type: 'image/png' }), name);
    let status = 0;
    for (let attempt = 0; attempt < 3 && ![200, 201].includes(status); attempt++) {
      const r = await fetch(`https://admin.da.live/source/${ORG}/${REPO}/media/${name}`, { method: 'PUT', headers: { Authorization: `Bearer ${TOKEN}` }, body: fd }); status = r.status;
      if (status === 401) { console.error('401 — DA_TOKEN expired; re-login at https://da.live'); process.exit(2); }
      if (![200, 201].includes(status)) await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
    }
    ledger[url] = { png: name, status: [200, 201].includes(status) ? 201 : status, bytes: buf.length, size: `${box.w}x${box.h}@2x`, at: new Date().toISOString() };
    if ([200, 201].includes(status)) { up++; console.log(`OK  ${name} ${box.w}x${box.h}@2x ${buf.length}B`); } else { fail++; console.log(`FAIL ${status} ${name}`); }
  } catch (e) { fail++; ledger[url] = { png: name, status: 0, error: String(e).slice(0, 200) }; console.log(`FAIL ${name}: ${e}`); }
  fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 1));
}
await browser.close();
console.log(`raster: uploaded ${up}, unchanged ${skip}, failed ${fail} (of ${urls.length})`);
