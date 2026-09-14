// validate-html.mjs — master SKILL.md § Validation rule: render an artifact at 1440×900 / 768×1024 / 390×844, capture console errors+warnings, network failures, uncaught exceptions, horizontal overflow, landmark presence, a11y quick-pass (alt, labels, heading order); save full-page screenshots.
// usage: node stardust/scripts/validate-html.mjs <url-or-file> <outDir> [--name label] [--allow-host regex]
import { chromium } from 'playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const [target, outDir] = process.argv.slice(2); const nameArg = process.argv.indexOf('--name'); const name = nameArg > -1 ? process.argv[nameArg + 1] : 'artifact';
const allowIdx = process.argv.indexOf('--allow-host'); const allow = allowIdx > -1 ? new RegExp(process.argv[allowIdx + 1]) : null;
mkdirSync(outDir, { recursive: true });
const url = /^https?:/.test(target) ? target : 'file://' + path.resolve(target);
const viewports = { desktop: { width: 1440, height: 900 }, tablet: { width: 768, height: 1024 }, mobile: { width: 390, height: 844 } };
const browser = await chromium.launch(); const report = { target: url, viewports: {} }; let issues = 0;
for (const [vp, size] of Object.entries(viewports)) {
  const ctx = await browser.newContext({ viewport: size, deviceScaleFactor: 1 }); const page = await ctx.newPage();
  const console_ = [], netfail = [], exceptions = [];
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) console_.push(`${m.type()}: ${m.text().slice(0, 200)}`); });
  page.on('requestfailed', r => { if (!allow || !allow.test(r.url())) netfail.push(`${r.failure()?.errorText} ${r.url().slice(0, 160)}`); });
  page.on('response', r => { if (r.status() >= 400 && (!allow || !allow.test(r.url()))) netfail.push(`${r.status()} ${r.url().slice(0, 160)}`); });
  page.on('pageerror', e => exceptions.push(e.message.slice(0, 200)));
  await page.goto(url, { waitUntil: 'load', timeout: 60000 }); await page.waitForTimeout(800);
  const h = await page.evaluate(() => document.documentElement.scrollHeight); for (let y = 0; y < h; y += 800) { await page.evaluate(yy => window.scrollTo(0, yy), y); await page.waitForTimeout(60); } await page.evaluate(() => window.scrollTo(0, 0)); await page.waitForTimeout(300);
  const layout = await page.evaluate(() => { const de = document.documentElement; const overflowEls = [...document.querySelectorAll('body *')].filter(el => { const r = el.getBoundingClientRect(); return r.right > de.clientWidth + 1 && r.width > 20 && getComputedStyle(el).position !== 'fixed'; }).slice(0, 5).map(el => el.tagName.toLowerCase() + (el.className ? '.' + String(el.className).split(' ')[0] : '')); const lm = ['header', 'nav', 'main', 'footer'].filter(t => { const e = document.querySelector(t); return e && e.innerText.trim().length > 0; }); const imgsNoAlt = [...document.images].filter(i => !i.hasAttribute('alt')).length; const inputsNoLabel = [...document.querySelectorAll('input:not([type=hidden]),select,textarea')].filter(i => !(i.labels && i.labels.length) && !i.getAttribute('aria-label') && !i.getAttribute('aria-labelledby')).length; const hs = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map(x => +x.tagName[1]); let skips = 0; for (let i = 1; i < hs.length; i++) if (hs[i] - hs[i - 1] > 1) skips++; return { scrollWidth: de.scrollWidth, clientWidth: de.clientWidth, horizontalOverflow: de.scrollWidth > de.clientWidth + 1, overflowEls, landmarks: lm, h1Count: document.querySelectorAll('h1').length, imgsNoAlt, inputsNoLabel, headingSkips: skips, docHeight: de.scrollHeight }; });
  await page.screenshot({ path: path.join(outDir, `${vp}.png`), fullPage: true });
  const vpIssues = [...console_.filter(c => c.startsWith('error')), ...netfail, ...exceptions, ...(layout.horizontalOverflow ? [`horizontal overflow ${layout.scrollWidth}>${layout.clientWidth}: ${layout.overflowEls.join(', ')}`] : []), ...(layout.imgsNoAlt ? [`${layout.imgsNoAlt} img without alt`] : []), ...(layout.inputsNoLabel ? [`${layout.inputsNoLabel} unlabeled inputs`] : [])];
  issues += vpIssues.length; report.viewports[vp] = { console: console_, networkFailures: netfail, exceptions, layout, issues: vpIssues };
  console.log(`[${name} @ ${vp}] issues=${vpIssues.length} docH=${layout.docHeight} landmarks=${layout.landmarks.join('/')} h1=${layout.h1Count} skips=${layout.headingSkips}${vpIssues.length ? '\n   - ' + vpIssues.slice(0, 8).join('\n   - ') : ''}`);
  await ctx.close();
}
await browser.close(); writeFileSync(path.join(outDir, 'report.json'), JSON.stringify(report, null, 2));
console.log(issues ? `VALIDATION: ${issues} issue(s) — fix and re-run` : 'VALIDATION: clean pass'); process.exit(issues ? 1 : 0);
