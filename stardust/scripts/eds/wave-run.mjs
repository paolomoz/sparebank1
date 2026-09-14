#!/usr/bin/env node
/**
 * wave-run.mjs <waveId> <roster.txt> [--stage <name>] [--pixel all|sample|none] [--sample 0.04] [--concurrency 3] [--no-deploy] [--unpark <reason|all>]
 * Resumable wave driver for the full-site replica migration (stardust/full-migration-plan.md § 2). Roster lines: slug|type|url.
 * Stages (each idempotent, per-page state in stardust/replica/waves/<wave>.state.json; a failing page is PARKED, never the wave):
 *   crawl   extract capture (stardust/scripts/crawl.mjs) → stardust/current/pages/<slug>.json + screenshot
 *   state   state.json page entries (status directed, type, capture path)
 *   lift    replica lift 1440 + 360, nav data, asset harvest (stardust/scripts/replica/{lift,nav-data,harvest-assets}.mjs)
 *   build   sibling prototype on the template builder + content gate vs the live source (sibling-build.sh; 🔴 must be 0)
 *   wpmedia blog waves only: harvest-wp-browser.mjs rehosts the bot-walled wp-content images referenced by the new prototypes
 *   migrate stardust/scripts/migrate.mjs <slugs> (content-count acceptance; writes pageMap)
 *   chrome  chrome.mjs → nav and footer docs + chrome-map.json for every prototype (stable names across waves); new/changed docs ride with the next deploy
 *   convert convert.mjs → content/<path>.html; sanitise; davids-model-lint; delivery-lint; gaps > 0 parks
 *   local   gate.mjs --content-only on the emulation for every page; pixel 1440,390 per --pixel policy
 *   deploy  inventory.mjs; media-upload.mjs; deploy-batch (preview → verify → publish) for passing pages; coverage deployed
 *   live    gate.mjs against the live origin (content every page; pixel per policy) — failures are recorded as residuals
 *   close   verify.mjs, link audit, optimize, dashboard, token window, tracking row, status.jsonl, issue board + comment
 * Logs: stardust/replica/waves/<wave>.log
 */
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto'; import { spawnSync, execFileSync, spawn } from 'node:child_process';

const args = process.argv.slice(2); const [waveId, rosterFile] = args; const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i > -1 ? args[i + 1] : d; };
if (!waveId || !rosterFile) { console.error('usage: wave-run.mjs <waveId> <roster.txt> [--stage name] [--pixel all|sample|none] [--sample 0.04] [--concurrency 3] [--no-deploy]'); process.exit(1); }
const ONLY = opt('stage', null); const GCONC = +opt('gate-concurrency', '2'); const PIXEL = opt('pixel', 'all'); const SAMPLE = +opt('sample', '0.04'); const CONC = +opt('concurrency', '3'); const NO_DEPLOY = args.includes('--no-deploy');
const LIVE = 'https://main--experian--paolomoz.aem.live'; const ORG = 'paolomoz'; const REPO = 'experian';
const W = `stardust/replica/waves/${waveId}`; const STATE_F = `${W}.state.json`; const LOG = `${W}.log`;
const log = (s) => { const line = `${new Date().toISOString().slice(11, 19)} ${s}`; console.log(line); fs.appendFileSync(LOG, `${line}\n`); };
const sh = (cmd, cmdArgs, o = {}) => spawnSync(cmd, cmdArgs, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024, ...o });
const run = (cmd, cmdArgs, o = {}) => { const r = sh(cmd, cmdArgs, o); return { ok: r.status === 0, out: `${r.stdout || ''}${r.stderr || ''}` }; };
const pool = async (items, n, fn) => { const q = [...items]; await Promise.all(Array.from({ length: n }, async () => { while (q.length) { const it = q.shift(); try { await fn(it); } catch (e) { log(`  ! ${it?.slug || it}: ${e.message.slice(0, 120)}`); } } })); };
const asyncRun = (cmd, cmdArgs) => new Promise((res) => { const c = spawn(cmd, cmdArgs); let out = ''; c.stdout.on('data', (d) => { out += d; }); c.stderr.on('data', (d) => { out += d; }); c.on('close', (code) => res({ ok: code === 0, out })); c.on('error', (e) => res({ ok: false, out: String(e) })); }); // truly async → the pool parallelises

// ---- state ----
const roster = fs.readFileSync(rosterFile, 'utf8').trim().split('\n').filter(Boolean).map((l) => { const [slug, type, url] = l.split('|').map((x) => x.trim()); return { slug, type, url, path: (new URL(url).pathname.replace(/\/$/, '') || '/') }; });
const st = fs.existsSync(STATE_F) ? JSON.parse(fs.readFileSync(STATE_F, 'utf8')) : { waveId, startedAt: new Date().toISOString(), pages: {} };
for (const r of roster) st.pages[r.slug] = { ...r, ...(st.pages[r.slug] || {}), stage: st.pages[r.slug]?.stage || 'new' };
const UNPARK = opt('unpark', null); const UNPARK_SET = UNPARK ? new Set(UNPARK.split(',')) : null; if (UNPARK_SET) for (const p of Object.values(st.pages)) if (p.parked && (UNPARK_SET.has('all') || UNPARK_SET.has(p.parked))) { const deployOnly = /^(preview|preview-verify|publish|da-token)$/.test(p.parked); delete p.parked; delete p.parkedDetail; if (!deployOnly) { delete p.built; delete p.migrated; delete p.converted; delete p.localOk; } p.stage = deployOnly ? 'local-ok' : 'unparked'; }
const save = () => fs.writeFileSync(STATE_F, JSON.stringify(st, null, 1));
const P = () => Object.values(st.pages); const active = () => P().filter((p) => !p.parked); const park = (p, reason, detail = '') => { p.parked = reason; p.parkedDetail = detail.slice(0, 300); log(`  ⛔ parked ${p.slug}: ${reason} ${detail.slice(0, 120)}`); };
const daPath = (p) => (p.path === '/' ? '/index' : p.path);
const stageOn = (name) => !ONLY || ONLY === name;
save();
if (!st.statusStart) { fs.appendFileSync('stardust/status.jsonl', `${JSON.stringify({ ts: new Date().toISOString(), skill: 'stardust:rollout', phase: `${waveId}`, event: 'start', detail: `${roster.length} pages from ${rosterFile}` })}\n`); st.statusStart = new Date().toISOString(); save(); }
log(`=== wave ${waveId}: ${roster.length} pages · stage ${ONLY || 'all'} · pixel ${PIXEL}`);

// ---- 1 crawl ----
if (stageOn('crawl')) {
  const todo = active().filter((p) => !fs.existsSync(`stardust/current/pages/${p.slug}.json`));
  log(`crawl: ${todo.length} to capture`);
  for (let i = 0; i < todo.length; i += 30) {
    const chunk = todo.slice(i, i + 30);
    const r = run('node', ['stardust/scripts/crawl.mjs', '--url', 'https://www.experian.com', '--pages', chunk.map((p) => p.url).join(','), '--max', '400', '--out', 'stardust/current', '--wait', 'medium', '--concurrency', String(CONC)]);
    if (!r.ok) log(`  crawl chunk ${i / 30} exit≠0: ${r.out.split('\n').filter((l) => /error|Error|WARN/.test(l)).slice(0, 3).join(' | ').slice(0, 200)}`);
  }
  for (const p of active()) { if (!fs.existsSync(`stardust/current/pages/${p.slug}.json`)) park(p, 'capture', 'no capture written'); else if (p.stage === 'new') p.stage = 'crawled'; }
  save();
}

// ---- 2 state ----
if (stageOn('state')) {
  const state = JSON.parse(fs.readFileSync('stardust/state.json', 'utf8')); const have = new Set(state.pages.map((p) => p.slug)); let added = 0;
  for (const p of active()) {
    if (have.has(p.slug)) continue; const cap = JSON.parse(fs.readFileSync(`stardust/current/pages/${p.slug}.json`, 'utf8')); const at = cap._provenance?.fetchedAt || new Date().toISOString();
    state.pages.push({ slug: p.slug, url: p.url, title: cap.title || p.slug, type: p.type, status: 'directed', history: [{ status: 'extracted', at }, { status: 'directed', at: new Date().toISOString(), note: `wave ${waveId}: preserve-mode direction inherited` }], stale: false, staleReason: null, currentStatePath: `stardust/current/pages/${p.slug}.json`, screenshot: cap.screenshot ? `stardust/current/${cap.screenshot}` : null, fidelityTier: 'sibling', wave: waveId }); added += 1;
  }
  state.site.pagesInInventory = state.pages.length; fs.writeFileSync('stardust/state.json', JSON.stringify(state, null, 2)); log(`state: +${added} pages (now ${state.pages.length})`);
}

// ---- 3 lift ----
if (stageOn('lift')) {
  const C = 'stardust/replica/capture'; const todo = active().filter((p) => !(fs.existsSync(`${C}/${p.slug}-1440.json`) && fs.existsSync(`${C}/${p.slug}-360.json`) && fs.existsSync(`${C}/${p.slug}-nav.json`)));
  log(`lift: ${todo.length} to lift`);
  await pool(todo, CONC, async (p) => {
    for (const w of [1440, 360]) { if (fs.existsSync(`${C}/${p.slug}-${w}.json`)) continue; const r = await asyncRun('node', ['stardust/scripts/replica/lift.mjs', p.url, String(w), `${C}/${p.slug}-${w}.json`]); if (!r.ok || !fs.existsSync(`${C}/${p.slug}-${w}.json`)) { park(p, 'lift', `${w}: ${r.out.split('\n').find((l) => /rror/.test(l)) || 'no output'}`); return; } }
    if (!fs.existsSync(`${C}/${p.slug}-nav.json`)) await asyncRun('node', ['stardust/scripts/replica/nav-data.mjs', `${C}/${p.slug}-1440.json`, `${C}/${p.slug}-nav.json`]);
    await asyncRun('node', ['stardust/scripts/replica/harvest-assets.mjs', p.slug]); p.stage = 'lifted';
  });
  save(); log(`lift: done (${active().filter((p) => p.stage === 'lifted' || p.stage > 'lifted').length} lifted)`);
}

// ---- 4 build + content gate vs live ----
if (stageOn('build')) {
  const todo = active().filter((p) => !p.built);
  log(`build: ${todo.length} to build`);
  await pool(todo, CONC, async (p) => {
    const r = await asyncRun('bash', ['stardust/scripts/replica/sibling-build.sh', p.slug, p.type, p.url]);
    const lines = fs.existsSync('stardust/replica/siblings.jsonl') ? fs.readFileSync('stardust/replica/siblings.jsonl', 'utf8').trim().split('\n') : []; let rec = null;
    for (let i = lines.length - 1; i >= 0; i -= 1) { try { const j = JSON.parse(lines[i]); if (j.slug === p.slug) { rec = j; break; } } catch { /* skip */ } }
    if (!rec || rec.build !== 'ok') { park(p, 'build', rec?.error || r.out.split('\n').find((l) => /rror/.test(l)) || 'no build record'); return; }
    p.red = rec.red; p.yellow = rec.yellow; if (rec.red > 0) { const reds = (fs.existsSync(`stardust/replica/gates/${p.slug}-1440/content-diff-sib.txt`) ? fs.readFileSync(`stardust/replica/gates/${p.slug}-1440/content-diff-sib.txt`, 'utf8').split('\n').filter((l) => l.includes('🔴') && /[A-Z]{3}/.test(l)) : []).slice(0, 3).join(' | '); park(p, 'content-red', `${rec.red} 🔴: ${reds}`); return; }
    p.built = true; p.stage = 'built';
  });
  save(); log(`build: ${active().filter((p) => p.built).length} built, ${P().filter((p) => p.parked === 'content-red').length} content-red, ${P().filter((p) => p.parked === 'build').length} build-fail`);
}

// ---- 4b blog media (bot-walled wp-content → DA media via a real browser session) ----
if (stageOn('wpmedia') && active().some((p) => /^(article|blog-listing|unique)$/.test(p.type) && p.built)) {
  const r = run('node', ['stardust/scripts/eds/harvest-wp-browser.mjs']); log(`wp media: ${(r.out.trim().split('\n').find((l) => /browser harvest/.test(l)) || r.out.trim().split('\n').pop() || '').slice(0, 140)}`);
}

// ---- 5 migrate ----
if (stageOn('migrate')) {
  const todo = active().filter((p) => p.built && !p.migrated).map((p) => p.slug);
  log(`migrate: ${todo.length}`);
  for (let i = 0; i < todo.length; i += 40) { const r = run('node', ['stardust/scripts/migrate.mjs', ...todo.slice(i, i + 40), '--force', '--no-audit']); if (!r.ok) log(`  migrate chunk exit≠0: ${r.out.split('\n').filter((l) => /fail|error/i.test(l)).slice(0, 3).join(' | ').slice(0, 240)}`); }
  const state = JSON.parse(fs.readFileSync('stardust/state.json', 'utf8'));
  for (const p of active().filter((p) => p.built)) { const sp = state.pages.find((x) => x.slug === p.slug); if (sp?.status === 'migrated') { p.migrated = true; p.stage = 'migrated'; } else park(p, 'migrate', sp?.contentGap || sp?.status || 'not migrated'); }
  save(); log(`migrate: ${active().filter((p) => p.migrated).length} migrated`);
}

// ---- 5b chrome: nav/footer documents + per-page chrome map (footer legal text varies by page family — the default /footer is the blog variant) ----
if (stageOn('chrome')) {
  const snap = () => Object.fromEntries(fs.readdirSync('content').filter((x) => /^(nav|footer)[^/]*\.html$/.test(x)).map((x) => [x, crypto.createHash('md5').update(fs.readFileSync(`content/${x}`)).digest('hex')]));
  const before = snap(); const r = run('node', ['stardust/scripts/eds/chrome.mjs']); if (!r.ok) log(`  chrome.mjs exit≠0: ${r.out.slice(-200)}`);
  for (const x of Object.keys(snap())) run('node', ['stardust/scripts/deploy/sanitise.js', `content/${x}`]);
  const after = snap(); const dirty = Object.keys(after).filter((x) => before[x] !== after[x]).map((x) => x.replace(/\.html$/, ''));
  st.chromeDirty = [...new Set([...(st.chromeDirty || []), ...dirty])];
  log(`chrome: ${Object.keys(after).length} docs, ${dirty.length} new/changed${dirty.length ? ` (${dirty.join(', ')})` : ''}`); save();
}

// ---- 6 convert + lints ----
if (stageOn('convert')) {
  const todo = active().filter((p) => p.migrated).map((p) => p.slug);
  log(`convert: ${todo.length}`);
  const hashOf = (p) => { const fp = `content${daPath(p)}.html`; return fs.existsSync(fp) ? crypto.createHash('md5').update(fs.readFileSync(fp)).digest('hex') : null; };
  const before = Object.fromEntries(active().filter((p) => p.migrated).map((p) => [p.slug, hashOf(p)])); // a page whose converted HTML changes loses its local-gate pass (encoder fixes land between runs)
  for (let i = 0; i < todo.length; i += 40) { const r = run('node', ['stardust/scripts/eds/convert.mjs', ...todo.slice(i, i + 40)]); if (!r.ok) log(`  convert chunk exit≠0: ${r.out.split('\n').filter((l) => /rror/.test(l)).slice(0, 3).join(' | ').slice(0, 240)}`); }
  for (const p of active().filter((p) => p.migrated)) {
    const lf = `stardust/rollout/eds-log/${p.slug}.json`; if (!fs.existsSync(lf)) { park(p, 'convert', 'no eds-log'); continue; }
    const j = JSON.parse(fs.readFileSync(lf, 'utf8')); const gaps = (j.gaps || []).filter((g) => g.kind !== 'lazy-thumbnail-placeholder'); p.file = `content${daPath(p)}.html`; p.blocks = j.blocks;
    if (gaps.length) { park(p, 'gaps', gaps.map((g) => g.module || g.reason).join(', ')); continue; }
    if (!fs.existsSync(p.file)) { park(p, 'convert', `missing ${p.file}`); continue; }
    run('node', ['stardust/scripts/deploy/sanitise.js', p.file]);
    if (before[p.slug] && hashOf(p) !== before[p.slug]) { delete p.localOk; delete p.localPixel; delete p.deployed; p.stage = 'converted'; }
    const dl = run('node', ['stardust/scripts/rollout/delivery-lint.mjs', '--file', p.file, '--path', daPath(p), '--type', 'page']); const last = dl.out.trim().split('\n').pop() || '';
    const protoHasH1 = fs.existsSync(`stardust/prototypes/${p.slug}-proposed.html`) && /<h1[\s>]/.test(fs.readFileSync(`stardust/prototypes/${p.slug}-proposed.html`, 'utf8').split('<main')[1] || '');
    const onlyNoH1 = /^1 P0 · 0 P1/.test(last) && /expected exactly one <h1>, found 0/.test(dl.out) && !protoHasH1; // source-faithful: paginated listing pages carry no h1 on the live site either (recorded as a deviation, not a defect)
    if (!/^0 P0 · 0 P1/.test(last) && !onlyNoH1) { park(p, 'lint', last.slice(0, 120)); continue; }
    if (onlyNoH1) p.deviation = 'no h1 (source has none)';
    p.converted = true; p.stage = 'converted';
  }
  const dm = run('node', ['stardust/scripts/deploy/davids-model-lint.mjs', 'content/']); if (!/PASS — 0 🔴/.test(dm.out)) log(`  davids-model-lint: ${dm.out.trim().split('\n').pop()}`);
  save(); log(`convert: ${active().filter((p) => p.converted).length} converted`);
}

// ---- helpers for gates ----
const gateResult = (slug) => { const f = `stardust/rollout/gates/${slug}/gate.json`; if (!fs.existsSync(f)) return null; try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return null; } };
const pixelWanted = (p) => { if (PIXEL === 'none') return false; if (PIXEL === 'all') return true; if (p.type !== 'article') return true; let h = 0; for (const c of p.slug) h = (h * 31 + c.charCodeAt(0)) >>> 0; return (h % 10000) / 10000 < SAMPLE; };
const contentRed = (g) => (g?.content?.red ?? null);
const pixelPass = (g) => !!g?.pixel && g.pass === true; // the gate's own verdict: pct ≤ threshold AND |Δh| ≤ 8 per width AND header/footer crops ≤ 2 % AND CLS ≤ 0.1 (plan § 4) — never a sub-metric

// ---- 7 local gates ----
if (stageOn('local')) {
  const todo = active().filter((p) => p.converted && !p.localOk);
  log(`local gates: ${todo.length} (content every page; pixel ${PIXEL})`);
  await pool(todo, GCONC, async (p) => {
    const px = pixelWanted(p); const r = await asyncRun('node', ['stardust/scripts/eds/gate.mjs', p.slug, ...(px ? ['--widths', '1440,390'] : ['--content-only']), ...(px && p.type === 'article' ? ['--align', '80'] : [])]);
    const g = gateResult(p.slug); const red = contentRed(g); if (red === null) { park(p, 'local-gate', r.out.split('\n').find((l) => /rror/.test(l)) || 'no gate.json'); return; }
    if (red > 0) { park(p, 'local-content', (g.content.summary || []).filter((l) => l.includes('🔴')).slice(0, 3).join(' | ')); return; }
    if (px) { p.localPixel = Object.fromEntries(Object.entries(g.pixel).map(([w, v]) => [w, v.aligned ? `${v.aligned.pct}%~@${v.aligned.shift}/Δ${v.heightDelta}` : `${v.pct}%/Δ${v.heightDelta}`])); if (!pixelPass(g)) { park(p, 'local-pixel', JSON.stringify(p.localPixel)); return; } }
    p.localOk = true; p.stage = 'local-ok';
  });
  save(); log(`local gates: ${active().filter((p) => p.localOk).length} pass`);
}

// ---- 8 deploy ----
if (stageOn('deploy') && !NO_DEPLOY) {
  const todo = active().filter((p) => p.localOk && !p.deployed);
  log(`deploy: ${todo.length}`);
  const tokenOk = (() => { try { const t = process.env.DA_TOKEN || ''; const j = JSON.parse(Buffer.from(t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()); const exp = j.created_at ? +j.created_at + +j.expires_in : (j.exp || 0) * 1000; return exp - Date.now() > 5 * 60 * 1000; } catch { return false; } })();
  if (todo.length && !tokenOk) { log('  ⛔ DA_TOKEN missing or expiring — deploy skipped for this run (pages stay ready; re-run --stage deploy with a fresh token)'); for (const p of todo) p.awaitingToken = true;
    if (!st.tokenBlockerPosted) { fs.writeFileSync(`${W}.blocker.md`, `⛔ **Blocker (${new Date().toISOString().slice(0, 16)}Z): DA_TOKEN missing or expired.** ${todo.length} pages of ${waveId} passed every local gate and are waiting to be pushed to DA. Refresh \`DA_TOKEN\` in \`~/.claude/.env\` (log in at https://da.live) — the wave resumes automatically at its next deploy pass.`); try { execFileSync('gh', ['issue', 'comment', '1', '--repo', `${ORG}/${REPO}`, '--body-file', `${W}.blocker.md`], { stdio: 'ignore' }); } catch { /* offline */ } st.tokenBlockerPosted = true; save(); } }
  if (todo.length && tokenOk) { st.tokenBlockerPosted = false;
    // code first: block/style fixes made during the wave must be on main (+ Code Sync) before pages are gated on the live origin
    const dirtyCode = run('git', ['status', '--porcelain', '--', 'blocks', 'styles', 'scripts', 'head.html']).out.trim();
    if (dirtyCode) { run('git', ['add', '--', 'blocks', 'styles', 'scripts', 'head.html']); const c = run('git', ['commit', '-q', '-m', `${waveId}: block/style fixes from the wave gates`, '-m', 'Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>']); const pu = run('git', ['push', '-q']);
      const cs = run('curl', ['-s', '-o', '/dev/null', '-w', '%{http_code}', '-X', 'POST', '-H', `Authorization: Bearer ${process.env.DA_TOKEN}`, `https://admin.hlx.page/code/${ORG}/${REPO}/main/*`]);
      log(`  code: commit ${c.ok ? 'ok' : 'FAILED'} · push ${pu.ok ? 'ok' : 'FAILED'} · code sync ${cs.out.trim()}`); }
    run('node', ['stardust/scripts/rollout/inventory.mjs', '--site-url', 'https://www.experian.com']);
    const mu = run('node', ['stardust/scripts/eds/media-upload.mjs']); log(`  media: ${mu.out.trim().split('\n').pop()?.slice(0, 120)}`);
    const chromeDocs = st.chromeDirty || []; const pf = `${W}.deploy-paths.txt`; fs.writeFileSync(pf, [...chromeDocs, ...todo.map((p) => daPath(p).replace(/^\//, ''))].join('\n') + '\n');
    const common = ['stardust/scripts/deploy/deploy-batch.mjs', '--org', ORG, '--repo', REPO, '--branch', 'main', '--content', 'content', '--paths', pf, '--force', '--concurrency', '4', '--ledger', 'stardust/rollout/deploy-ledger.json', '--log', 'stardust/rollout/deploy-log.jsonl'];
    const prev = run('node', [...common, '--no-publish']); log(`  preview: ${prev.out.trim().split('\n').find((l) => /done\./.test(l))?.slice(0, 120)}`);
    const failed = new Set([...prev.out.matchAll(/FAIL\s+(\/\S+)/g)].map((m) => m[1]));
    for (const p of todo) { if (failed.has(daPath(p))) { park(p, 'preview', (prev.out.split('\n').find((l) => l.includes(daPath(p)) && /409|4\d\d|5\d\d/.test(l)) || '').slice(0, 160)); continue; }
      const v = run('curl', ['-s', '--compressed', ...(process.env.SITE_TOKEN_EXPERIAN ? ['-H', `Authorization: token ${process.env.SITE_TOKEN_EXPERIAN}`] : []), '-o', '/dev/null', '-w', '%{http_code}', `https://main--experian--paolomoz.aem.page${daPath(p)}.plain.html`]); if (v.out.trim() !== '200') { park(p, 'preview-verify', `plain.html ${v.out.trim()}`); } }
    const okPaths = [...chromeDocs.filter((d) => !failed.has(`/${d}`)), ...active().filter((p) => p.localOk && !p.deployed).map((p) => daPath(p).replace(/^\//, ''))]; fs.writeFileSync(pf, okPaths.join('\n') + '\n'); if (chromeDocs.some((d) => failed.has(`/${d}`))) log(`  ⛔ chrome doc preview failed: ${chromeDocs.filter((d) => failed.has(`/${d}`)).join(', ')}`);
    if (okPaths.length) { const live = run('node', common); log(`  publish: ${live.out.trim().split('\n').find((l) => /done\./.test(l))?.slice(0, 120)}`); const lf = new Set([...live.out.matchAll(/FAIL\s+(\/\S+)/g)].map((m) => m[1])); st.chromeDirty = chromeDocs.filter((d) => lf.has(`/${d}`) || failed.has(`/${d}`)); if (chromeDocs.length) log(`  chrome docs published: ${chromeDocs.length - st.chromeDirty.length}/${chromeDocs.length}`);
      for (const p of active().filter((p) => p.localOk && !p.deployed)) { if (lf.has(daPath(p))) park(p, 'publish', ''); else { p.deployed = true; p.stage = 'deployed'; run('node', ['stardust/scripts/rollout/update-coverage.mjs', p.slug, '--status', 'deployed', '--url', `${LIVE}${p.path}`]); } } }
  }
  save(); log(`deploy: ${active().filter((p) => p.deployed).length} live`);
}

// ---- 9 live gates ----
if (stageOn('live') && !NO_DEPLOY) {
  const todo = active().filter((p) => p.deployed && !p.liveChecked);
  log(`live gates: ${todo.length}`);
  await pool(todo, GCONC, async (p) => {
    const px = pixelWanted(p); const r = await asyncRun('node', ['stardust/scripts/eds/gate.mjs', p.slug, '--eds', LIVE, ...(px ? ['--widths', '1440,390'] : ['--content-only']), ...(px && p.type === 'article' ? ['--align', '80'] : [])]);
    const g = gateResult(p.slug); p.liveChecked = true; const red = contentRed(g);
    if (red === null) { p.residual = `live gate did not run: ${(r.out.split('\n').find((l) => /rror/.test(l)) || '').slice(0, 100)}`; return; }
    if (red > 0) p.residual = `live content 🔴 ${red}`;
    if (px) { p.livePixel = Object.fromEntries(Object.entries(g.pixel).map(([w, v]) => [w, v.aligned ? `${v.aligned.pct}%~@${v.aligned.shift}/Δ${v.heightDelta}` : `${v.pct}%/Δ${v.heightDelta}`])); if (!pixelPass(g)) p.residual = `${p.residual ? `${p.residual}; ` : ''}live pixel ${JSON.stringify(p.livePixel)}`; }
    if (fs.existsSync(`stardust/rollout/gates/${p.slug}/gate.json`)) fs.copyFileSync(`stardust/rollout/gates/${p.slug}/gate.json`, `stardust/rollout/gates/${p.slug}/gate-aemlive.json`);
    if (!p.residual) { p.stage = 'verified'; run('node', ['stardust/scripts/rollout/update-coverage.mjs', p.slug, '--status', 'verified', '--url', `${LIVE}${p.path}`]); }
  });
  save(); log(`live gates: ${active().filter((p) => p.liveChecked && !p.residual).length} clean, ${active().filter((p) => p.residual).length} residual`);
}

// ---- 10 close ----
const deployBlocked = active().some((p) => p.awaitingToken && !p.deployed);
if (stageOn('close') && deployBlocked) log('close: skipped — deploy is blocked on DA_TOKEN (pages stay local-ok); re-run --stage deploy, then --stage live and --stage close');
if (stageOn('close') && !deployBlocked) {
  const ver = run('node', ['stardust/scripts/rollout/verify.mjs', '--base', LIVE]); log(`verify: ${ver.out.trim().split('\n').find((l) => /Checked/.test(l))}`);
  const la = run('node', ['stardust/scripts/eds/_link-audit.mjs']); const laLine = la.out.split('\n').filter((l) => /targets|non-200/.test(l)).join(' · '); log(`link audit: ${laLine}`);
  const op = run('node', ['stardust/scripts/rollout/optimize.mjs', '--base', LIVE, '--all']); log(`optimize: ${op.out.split('\n').find((l) => /^Open/.test(l))}`);
  run('node', ['stardust/scripts/rollout/dashboard.mjs']);
  const end = new Date().toISOString(); st.closedAt = end;
  const deployed = active().filter((p) => p.deployed); const parked = P().filter((p) => p.parked); const residual = active().filter((p) => p.residual);
  fs.appendFileSync('stardust/status.jsonl', `${JSON.stringify({ ts: end, skill: 'stardust:rollout', phase: `${waveId}`, event: 'end', detail: `${deployed.length}/${roster.length} live · ${parked.length} parked · ${residual.length} live residuals · ${laLine}` })}\n`);
  // token window + ledger
  const wf = 'stardust/token-windows.json'; const wins = JSON.parse(fs.readFileSync(wf, 'utf8')); const open = wins.find((w) => w.to === null); if (open) open.to = st.statusStart;
  { const ex = wins.find((w) => w.phase === waveId); if (ex) ex.to = end; else wins.push({ label: `${waveId} · ${roster.length} pages (${rosterFile.split('/').pop()})`, phase: waveId, from: st.statusStart, to: end }); } /* re-close extends the wave's window */ fs.writeFileSync(wf, JSON.stringify(wins, null, 2));
  run('node', ['stardust/scripts/eds/token-ledger.mjs', '--windows', wf]);
  const tl = JSON.parse(fs.readFileSync('stardust/token-ledger.json', 'utf8')); const tw = tl.windows.find((w) => w.phase === waveId) || {}; const M = (n) => `${((n || 0) / 1e6).toFixed(2)}M`;
  const tokens = `${tw.msgs || 0} · ${M(tw.fresh)} · ${M(tw.cacheWrite)} · ${M(tw.cacheRead)} · ${M(tw.output)}`;
  // tracking ledger row + parked table + log
  let t = fs.readFileSync('stardust/full-migration-tracking.md', 'utf8');
  const byReason = {}; parked.forEach((p) => { byReason[p.parked] = (byReason[p.parked] || 0) + 1; });
  const pxAll = active().filter((p) => p.localPixel).length; const pxPass = active().filter((p) => p.localPixel && !String(p.parked).includes('pixel')).length;
  const row = `| ${waveId} | ${rosterFile.split('/').pop().replace('.inscope.txt', '')} | ${roster.length} | ${P().filter((p) => p.stage !== 'new' && p.parked !== 'capture').length} | ${P().filter((p) => p.built).length} | ${P().filter((p) => p.converted).length} | ${deployed.length} | ${active().filter((p) => p.liveChecked && !/content/.test(p.residual || '')).length}/${deployed.length} | ${pxPass}/${pxAll} local · ${active().filter((p) => p.livePixel && !/pixel/.test(p.residual || '')).length}/${active().filter((p) => p.livePixel).length} live | ${parked.length} (${Object.entries(byReason).map(([k, v]) => `${k} ${v}`).join(', ') || '—'}) | ${tokens} | ${deployed.length === roster.length ? '✅' : '✅ partial'} ${end.slice(0, 10)} |`;
  t = t.split('\n').filter((l) => !l.startsWith(`| ${waveId} |`)).join('\n'); // re-close replaces the wave's row
  t = t.replace(/\n(## Parked pages)/, `${row}\n\n$1`);
  const parkedRows = parked.map((p) => `| ${p.slug} | ${p.type} | ${p.parked}: ${(p.parkedDetail || '').replace(/\|/g, '/').slice(0, 140)} | no | parked ${end.slice(0, 10)} |`).join('\n');
  { const slugs = new Set(P().map((p) => p.slug)); t = t.split('\n').filter((l) => !(l.startsWith('| ') && slugs.has(l.slice(2).split(' |')[0]))).join('\n'); } // drop this wave's earlier parked rows
  if (parkedRows) t = t.replace(/(\| Slug \| Template \|[^\n]*\n\|---\|---\|---\|---\|---\|\n)/, `$1${parkedRows}\n`);
  t = t.trimEnd() + `\n- ${end.slice(0, 16)} — ${waveId} closed: ${deployed.length}/${roster.length} live · parked ${parked.length} · live residuals ${residual.length} · ${laLine} · tokens ${tokens}.\n`;
  fs.writeFileSync('stardust/full-migration-tracking.md', t);
  // issue comment + board
  const cov = JSON.parse(fs.readFileSync('stardust/rollout/rollout.json', 'utf8')).lastRun;
  const comment = [`## ${waveId} closed — ${deployed.length}/${roster.length} pages live`, '', `Roster: \`${rosterFile}\` · captured ${P().filter((p) => p.parked !== 'capture').length} · built (🔴=0) ${P().filter((p) => p.built).length} · converted ${P().filter((p) => p.converted).length} · deployed ${deployed.length} · live content gate clean ${active().filter((p) => p.liveChecked && !/content/.test(p.residual || '')).length}/${deployed.length} · pixel ${pxPass}/${pxAll} local, ${active().filter((p) => p.livePixel && !/pixel/.test(p.residual || '')).length}/${active().filter((p) => p.livePixel).length} live`, '', `Parked (${parked.length}): ${Object.entries(byReason).map(([k, v]) => `${k} ${v}`).join(', ') || 'none'}`, ...parked.slice(0, 40).map((p) => `- \`${p.path}\` — ${p.parked}: ${(p.parkedDetail || '').slice(0, 120)}`), ...(parked.length > 40 ? [`- … ${parked.length - 40} more in \`stardust/full-migration-tracking.md\``] : []), '', `Live residuals (${residual.length}): ${residual.slice(0, 20).map((p) => `\`${p.path}\` ${p.residual}`).join('; ') || 'none'}`, '', `Site: ${ver.out.trim().split('\n').find((l) => /Checked/.test(l))} · ${laLine} · ${op.out.split('\n').find((l) => /^Open/.test(l))?.trim()} · coverage ${cov?.pages?.verified}/${cov?.pages?.total} verified`, '', `Tokens this wave (turns · fresh · cache write · cache read · output): ${tokens}`, '', `Commit range: see \`git log --since="${st.statusStart}"\``].join('\n');
  fs.writeFileSync(`${W}.comment.md`, comment);
  try { if (st.closeCommentId) { execFileSync('gh', ['api', '-X', 'PATCH', `repos/${ORG}/${REPO}/issues/comments/${st.closeCommentId}`, '-F', `body=@${W}.comment.md`], { stdio: 'ignore' }); log('  issue comment updated'); } else { const url = execFileSync('gh', ['issue', 'comment', '1', '--repo', `${ORG}/${REPO}`, '--body-file', `${W}.comment.md`], { encoding: 'utf8' }).trim(); const id = url.match(/issuecomment-(\d+)/)?.[1]; if (id) st.closeCommentId = id; } } catch (e) { log(`  issue comment failed: ${e.message.slice(0, 100)}`); }
  // commit content + ledgers (code was committed at deploy)
  run('git', ['add', '-A', '--', 'content', 'stardust', 'blocks', 'styles', 'scripts', 'STARDUST-IMPROVEMENT-NOTES.md']); const gc = run('git', ['commit', '-q', '-m', `${waveId}: close — ${deployed.length}/${roster.length} live, ${parked.length} parked`, '-m', 'Co-Authored-By: Claude Fable 5.1 <noreply@anthropic.com>']); const gp = run('git', ['push', '-q']); log(`  git: commit ${gc.ok ? 'ok' : 'nothing/failed'} · push ${gp.ok ? 'ok' : 'FAILED'}`);
  save(); log(`=== ${waveId} closed: ${deployed.length}/${roster.length} live · ${parked.length} parked · tokens ${tokens}`);
}
