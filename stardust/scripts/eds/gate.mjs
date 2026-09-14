#!/usr/bin/env node
/**
 * gate.mjs <slug> [--widths 1440,768,390] [--eds http://localhost:3010] [--proto http://localhost:8817] [--threshold 10]
 * Foundation-first / per-page fidelity gate for the EDS build against the approved prototype:
 *   - stitched full-page screenshots on both sides (stardust/scripts/replica/stitch-shot.mjs, symmetric instrument)
 *   - pixel-compare with band breakdown (threshold %, height delta)
 *   - structural content-diff at 1440 (stardust/scripts/diff/content-diff.mjs, eds profile): 🔴 must be 0
 * Writes stardust/rollout/gates/<slug>/{eds,proto,diff}-<w>.png + gate.json; exits 2 on failure.
 */
import fs from 'node:fs'; import { execFileSync } from 'node:child_process';
const args = process.argv.slice(2); const slug = args.find((a) => !a.startsWith('--'));
const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i > -1 ? args[i + 1] : d; };
const contentOnly = args.includes('--content-only'); const widths = contentOnly ? [] : opt('widths', '1440,768,390').split(',').map(Number); const EDS = opt('eds', 'http://localhost:3010'); const PROTO = opt('proto', 'http://localhost:8817'); const threshold = +opt('threshold', 10); const align = +opt('align', 0);
const state = JSON.parse(fs.readFileSync('stardust/state.json', 'utf8')); const pm = Object.values(state.migrate.pageMap).find((p) => p.slug === slug);
const edsUrl = `${EDS}${pm.sourceUrl === '/' ? '/' : pm.sourceUrl.replace(/\/$/, '')}`; const protoUrl = `${PROTO}/${slug}-proposed.html`;
const dir = `stardust/rollout/gates/${slug}`; fs.mkdirSync(dir, { recursive: true });
const run = (cmd, a, ok = [0]) => { try { return execFileSync(cmd, a, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { if (ok.includes(e.status)) return e.stdout; throw new Error(`${cmd} ${a.join(' ')} → exit ${e.status}\n${e.stderr}`); } };
const result = { slug, edsUrl, protoUrl, at: new Date().toISOString(), pixel: {}, content: null, pass: true };
for (const w of widths) {
  run('node', ['stardust/scripts/replica/stitch-shot.mjs', protoUrl, `${dir}/proto-${w}.png`, '--width', String(w)]);
  run('node', ['stardust/scripts/replica/stitch-shot.mjs', edsUrl, `${dir}/eds-${w}.png`, '--width', String(w)]);
  const out = run('node', ['stardust/scripts/replica/pixel-compare.mjs', `${dir}/proto-${w}.png`, `${dir}/eds-${w}.png`, '--out', `${dir}/diff-${w}.png`, '--threshold', String(threshold), ...(align > 0 ? ['--align', String(align)] : []), '--json'], [0, 2]);
  const j = JSON.parse(out.slice(out.indexOf('{')));
  result.pixel[w] = j; const pct = j.pct; const dh = j.heightDelta;
  // ARTICLE template (--align): a faithful long prose page fails a rigid y=0 overlay when one top box differs by ~50 px; consume the offset-aligned pct instead. A uniform offset aligns away (PASS); progressive drift or a missing block cannot be removed by one bounded shift (aligned pct stays high → FAIL), so the height bar is not applied in this mode.
  const usingAlign = align > 0 && j.aligned; const effPct = usingAlign ? j.aligned.pct : pct;
  // height bar: 8 px absolute, or — when the pixels agree (≤ 2 %) — 0.2 % of the page height (sub-pixel image/line rounding accumulates over 25+ offer cards on 18 000 px listing pages; a missing block still fails on pct)
  const hBar = pct <= 2 ? Math.max(8, Math.round(0.002 * (j.compared?.height || 0))) : 8;
  const ok = usingAlign ? (effPct <= threshold) : (pct <= threshold && Math.abs(dh || 0) <= hBar); if (!ok) result.pass = false; j.heightBar = hBar;
  console.log(`[${w}] pixel ${pct}%${usingAlign ? ` (aligned ${effPct}% @${j.aligned.shift}px)` : ''}  Δh ${dh}  ${ok ? 'OK' : 'FAIL'}  hot bands: ${JSON.stringify(((usingAlign ? j.aligned.bands : j.bands) || []).filter((b) => b.pct > threshold).map((b) => `${b.y0}-${b.y1}:${b.pct}%`).slice(0, 4))}`);
}
// chrome crops (header band / footer band) from the stitched PNGs + CLS on the EDS page (deploy contract: chrome crop ≤2%, CLS ≤0.1)
const crop = (w) => { try { return JSON.parse(run('node', ['stardust/scripts/eds/_crop-compare.mjs', `${dir}/proto-${w}.png`, `${dir}/eds-${w}.png`, edsUrl], [0])); } catch (e) { return { error: e.message.slice(0, 200) }; } };
if (!contentOnly) { result.chrome = crop(widths[0]); console.log('chrome crops:', JSON.stringify(result.chrome)); if (result.chrome.header > 2 || result.chrome.footer > 2) result.pass = false; if (typeof result.chrome.cls === 'number' && result.chrome.cls > 0.1) result.pass = false; }
const cd = run('node', ['stardust/scripts/diff/content-diff.mjs', protoUrl, edsUrl, '--width', '1440', '--profile', 'eds'], [0, 1, 2]);
fs.writeFileSync(`${dir}/content-diff.txt`, cd);
const jfile = `stardust/replica/justified/${slug}.json`; const jglobal = 'stardust/replica/justified/_global.json';
const justified = { patterns: [...(fs.existsSync(jglobal) ? JSON.parse(fs.readFileSync(jglobal, 'utf8')).patterns : []), ...(fs.existsSync(jfile) ? JSON.parse(fs.readFileSync(jfile, 'utf8')).patterns : [])] };
const redLines = cd.split('\n').filter((l) => /^\s*🔴/.test(l));
const unjustified = redLines.filter((l) => !(justified?.patterns || []).some((p) => new RegExp(p).test(l)));
const red = unjustified.length; if (redLines.length !== red) console.log(`content-diff: ${redLines.length - red} 🔴 justified (${jfile})`); const amber = (cd.match(/🟡/g) || []).length; const orange = (cd.match(/🟠/g) || []).length;
result.content = { red, amber, orange, summary: cd.trim().split('\n').slice(-3) }; if (red) result.pass = false;
console.log(`content-diff: 🔴 ${red}  🟡 ${amber}  🟠 ${orange}`); if (red) console.log(unjustified.slice(0, 12).join('\n'));
fs.writeFileSync(`${dir}/gate.json`, JSON.stringify(result, null, 2));
console.log(result.pass ? `PASS ${slug}` : `FAIL ${slug}`); process.exit(result.pass ? 0 : 2);
