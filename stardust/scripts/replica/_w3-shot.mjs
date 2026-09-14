// _w3-shot.mjs <url> <selector> <out.png> [--width 1440] [--pad 24] [--click <sel>] — element screenshot (local prototypes / emulation only)
import { chromium } from 'playwright';
const argv = process.argv.slice(2); const [url, sel, out] = argv; const opt = (k, d) => { const i = argv.indexOf(k); return i > 0 ? argv[i + 1] : d; };
const width = +opt('--width', 1440); const pad = +opt('--pad', 24); const click = opt('--click', null);
const b = await chromium.launch(); const page = await b.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 }); await page.waitForTimeout(800);
if (click) { await page.locator(click).first().click(); await page.waitForTimeout(400); }
const loc = page.locator(sel).first(); await loc.scrollIntoViewIfNeeded(); await page.waitForTimeout(300);
const r = await loc.boundingBox(); if (!r) { console.log('no element', sel); process.exit(1); }
const full = await page.evaluate(() => document.documentElement.scrollHeight);
await page.setViewportSize({ width, height: Math.min(full, 16000) }); await page.waitForTimeout(300);
const r2 = await loc.boundingBox();
await page.screenshot({ path: out, clip: { x: 0, y: Math.max(0, r2.y - pad), width, height: Math.min(r2.height + 2 * pad, 4000) } });
console.log(`${out}: ${sel} at y=${Math.round(r2.y)} ${Math.round(r2.width)}x${Math.round(r2.height)}`); await b.close();
