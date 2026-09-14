// _w3-snap-widget.mjs <liveUrl> <hostSel> <waitText> <out.html> [--width 1440] — static snapshot of a client-rendered widget's settled DOM
// (shadow root or light DOM) with its stylesheet rules inlined as <style>, for the replica calculator__host / EDS calculator block. ONE live hit.
import { writeFileSync } from 'node:fs'; import { chromium } from 'playwright';
const argv = process.argv.slice(2); const [url, hostSel, waitText, out] = argv; const opt = (k, d) => { const i = argv.indexOf(k); return i > 0 ? argv[i + 1] : d; }; const width = +opt('--width', 1440);
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width, height: 900 }, locale: 'nb-NO', userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36' });
const page = await ctx.newPage(); await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 }); await page.waitForTimeout(1500);
try { const c = page.locator('button:has-text("Godta alle")').first(); if (await c.isVisible({ timeout: 1500 })) { await c.click(); await page.waitForTimeout(500); } } catch {}
await page.locator(hostSel).first().scrollIntoViewIfNeeded(); await page.waitForTimeout(500);
await page.waitForFunction(([sel, t]) => { const h = document.querySelector(sel); const root = h?.shadowRoot || h; return root && root.textContent.includes(t); }, [hostSel, waitText], { timeout: 30000 });
await page.waitForTimeout(1500);
const res = await page.evaluate(([sel]) => {
  const host = document.querySelector(sel); const root = host.shadowRoot || host; const shadow = !!host.shadowRoot;
  const sheets = shadow ? [...root.adoptedStyleSheets, ...root.styleSheets] : [...document.styleSheets];
  let css = ''; for (const s of sheets) { try { for (const r of s.cssRules) css += r.cssText + '\n'; } catch { css += `/* cross-origin sheet ${s.href} */\n`; } }
  const r = host.getBoundingClientRect();
  // light DOM: keep only the rules whose selectors match something inside the host (the page sheets are huge)
  if (!shadow) { const keep = []; for (const s of document.styleSheets) { let rules = []; try { rules = [...s.cssRules]; } catch { continue; } for (const rule of rules) { const walk = (rl, media) => { if (rl.type === 1) { try { if (host.matches(rl.selectorText) || host.querySelector(rl.selectorText)) keep.push(media ? `@media ${media}{${rl.cssText}}` : rl.cssText); } catch {} } else if (rl.type === 4) { for (const inner of rl.cssRules) walk(inner, rl.conditionText); } else if (rl.type === 5) { keep.push(rl.cssText); } }; walk(rule, null); } } css = keep.join('\n'); }
  return { shadow, html: root.innerHTML, css, rect: { w: Math.round(r.width), h: Math.round(r.height) }, hostClass: host.className, hostId: host.id };
}, [hostSel]);
const html = `<style>${res.css}</style>\n${res.html}`.replace(/\s(id)="[^"]*"/g, (m) => m); // ids kept: labels/aria wiring
writeFileSync(out, html); writeFileSync(out.replace(/\.html$/, '.json'), JSON.stringify({ url, hostSel, shadow: res.shadow, rect: res.rect, hostClass: res.hostClass, hostId: res.hostId, capturedAt: new Date().toISOString(), bytes: html.length }, null, 1));
console.log(`${out}: shadow=${res.shadow} host ${res.rect.w}x${res.rect.h} html ${res.html.length}B css ${res.css.length}B`); await b.close();
