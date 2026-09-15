// _w6-snap-widget.mjs — W3 snapshot helper + sheet-level media (a <link media> / <style media> mobile sheet is wrapped in its @media) and @supports/@layer/@container recursion
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
  let css = ''; for (const s of sheets) { const sm = s.media?.mediaText; try { let t = ''; for (const r of s.cssRules) t += r.cssText + '\n'; css += sm && sm !== 'all' ? `@media ${sm}{${t}}\n` : t; } catch { css += `/* cross-origin sheet ${s.href} */\n`; } }
  const r = host.getBoundingClientRect();
  // light DOM: keep only the rules whose selectors match something inside the host (the page sheets are huge)
  if (!shadow) { const keep = []; for (const s of document.styleSheets) { let rules = []; try { rules = [...s.cssRules]; } catch { continue; } const sm = s.media?.mediaText && s.media.mediaText !== 'all' ? s.media.mediaText : null; for (const rule of rules) { const walk = (rl, media, wrap) => { if (rl.type === 1) { try { if (host.matches(rl.selectorText) || host.querySelector(rl.selectorText)) { let t = rl.cssText; for (const w of wrap) t = `${w}{${t}}`; keep.push(media ? `@media ${media}{${t}}` : t); } } catch {} } else if (rl.type === 4) { const m = [media, rl.conditionText].filter(Boolean).join(' and '); for (const inner of rl.cssRules) walk(inner, m, wrap); } else if (rl.type === 5) { keep.push(rl.cssText); } else if (rl.cssRules && rl.cssRules.length) { const head = rl.cssText.slice(0, rl.cssText.indexOf('{')).trim(); for (const inner of rl.cssRules) walk(inner, media, [head, ...wrap]); } }; walk(rule, sm, []); } } css = keep.join('\n'); }
  return { shadow, html: root.innerHTML, css, rect: { w: Math.round(r.width), h: Math.round(r.height) }, hostClass: host.className, hostId: host.id };
}, [hostSel]);
const html = `<style>${res.css}</style>\n${res.html}`.replace(/\s(id)="[^"]*"/g, (m) => m); // ids kept: labels/aria wiring
writeFileSync(out, html); writeFileSync(out.replace(/\.html$/, '.json'), JSON.stringify({ url, hostSel, shadow: res.shadow, rect: res.rect, hostClass: res.hostClass, hostId: res.hostId, capturedAt: new Date().toISOString(), bytes: html.length }, null, 1));
console.log(`${out}: shadow=${res.shadow} host ${res.rect.w}x${res.rect.h} html ${res.html.length}B css ${res.css.length}B`); await b.close();
