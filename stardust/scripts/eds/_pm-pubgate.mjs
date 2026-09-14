// _pm-pubgate.mjs <short> <da-path> [--widths 1440,360] [--origin https://main--sparebank1--paolomoz.aem.live]
// published-origin gate: stitch the published page, pixel vs stardust/replica/gates/<short>-<w>/live.png, header + footer crops (footer measured on the page)
import { execFileSync } from 'node:child_process'; import fs from 'node:fs'; import { chromium } from 'playwright';
const [short, daPath] = process.argv.slice(2); const opt = (k, d) => { const i = process.argv.indexOf(k); return i > 0 ? process.argv[i + 1] : d; };
const widths = opt('--widths', '1440,360').split(',').map(Number); const origin = opt('--origin', 'https://main--sparebank1--paolomoz.aem.live');
const g0 = (s, re) => (s.match(re) || [])[1];
const run = (args) => { try { return execFileSync('node', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }); } catch (e) { return (e.stdout || '') + (e.stderr || ''); } };
const b = await chromium.launch(); const out = {};
for (const w of widths) {
  const G = `stardust/replica/gates/${short}-pub-${w}`; fs.mkdirSync(G, { recursive: true });
  const live = `stardust/replica/gates/${short}-${w}/live.png`; if (!fs.existsSync(live)) { console.log(`${short} ${w}: no live capture at ${live}`); continue; }
  fs.copyFileSync(live, `${G}/live.png`);
  const url = `${origin}${daPath}`;
  run(['stardust/scripts/replica/stitch-shot.mjs', url, `${G}/proto.png`, '--width', String(w), '--settle']);
  const n = fs.readdirSync(G).filter((f) => /^pixel-iter\d+/.test(f)).length + 1;
  const px = run(['stardust/scripts/replica/pixel-compare.mjs', `${G}/live.png`, `${G}/proto.png`, '--out', `${G}/diff-iter${n}.png`, '--threshold', '10']); fs.writeFileSync(`${G}/pixel-iter${n}.txt`, px);
  const p = await b.newPage({ viewport: { width: w, height: w > 1000 ? 900 : 844 } }); await p.goto(url, { waitUntil: 'networkidle' });
  await p.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); } window.scrollTo(0, 0); }); await p.waitForTimeout(500);
  const m = await p.evaluate(() => { const f = document.querySelector('footer').getBoundingClientRect(); const h = document.querySelector('header').getBoundingClientRect(); return { fy: Math.round(f.y + scrollY), fh: Math.round(f.height), hh: Math.round(h.height), doc: document.documentElement.scrollHeight }; }); await p.close();
  const hdr = run(['stardust/scripts/replica/crop-compare.mjs', `${G}/live.png`, `${G}/proto.png`, '--y', '0', '--height', String(m.hh), '--out', `${G}/chrome-header-diff.png`, '--threshold', '2']); fs.writeFileSync(`${G}/chrome-header.txt`, hdr);
  const dh = +(g0(px, /height delta (-?\d+)px/) || 0); // pixel-compare reports A(live) - B(published); the live footer sits at fy + dh
  const ftr = run(['stardust/scripts/replica/crop-compare.mjs', `${G}/live.png`, `${G}/proto.png`, '--y', String(m.fy + dh), '--y-b', String(m.fy), '--height', String(m.fh), '--out', `${G}/chrome-footer-diff.png`, '--threshold', '2']); fs.writeFileSync(`${G}/chrome-footer.txt`, ftr);
  const g = (s, re) => (s.match(re) || [])[1];
  out[w] = { pixel: g(px, /= ([\d.]+)%/), dh: g(px, /height delta (-?\d+)px/), bands: [...px.matchAll(/y\s+(\d+–\d+): ([\d.]+)%\s+◄/g)].map((x) => `${x[1]} ${x[2]}%`), header: g(hdr, /match ([\d.]+)%/), footer: g(ftr, /match ([\d.]+)%/), footerY: m.fy, footerH: m.fh, headerH: m.hh, docH: m.doc };
  console.log(`${short} ${w}: pixel ${out[w].pixel}% Δh ${out[w].dh} header ${out[w].header}% footer ${out[w].footer}% (footer y${m.fy} h${m.fh}, doc ${m.doc})${out[w].bands.length ? ' hot: ' + out[w].bands.join(', ') : ''}`);
}
await b.close(); fs.writeFileSync(`stardust/replica/gates/${short}-pub-summary.json`, JSON.stringify(out, null, 1));
