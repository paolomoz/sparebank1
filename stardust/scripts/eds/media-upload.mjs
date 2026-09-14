#!/usr/bin/env node
/**
 * media-upload.mjs [--all | file …] — upload prototype assets to DA media (admin.da.live/source/<org>/<repo>/media/<file>).
 * Default set: every asset referenced by converted pages (stardust/rollout/eds-log/*.json) + chrome docs (chrome-map.json).
 * Ledger stardust/rollout/media-ledger.json (sha → uploaded) makes re-runs idempotent. Needs DA_TOKEN (never printed).
 */
import fs from 'node:fs'; import path from 'node:path'; import crypto from 'node:crypto';
const TOKEN = process.env.DA_TOKEN; if (!TOKEN) { console.error('DA_TOKEN missing (set -a; source ~/.claude/.env; set +a)'); process.exit(1); }
const ORG = 'paolomoz', REPO = 'sparebank1', SRC = 'stardust/prototypes/assets', SRC2 = 'stardust/prototypes/assets/img', LEDGER = 'stardust/rollout/media-ledger.json';
const TYPES = { svg: 'image/svg+xml', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
const args = process.argv.slice(2);
let files = args.filter((a) => !a.startsWith('--'));
if (!files.length) {
  const set = new Set();
  if (args.includes('--all')) fs.readdirSync(SRC).forEach((f) => set.add(f));
  else {
    for (const f of fs.readdirSync('stardust/rollout/eds-log')) JSON.parse(fs.readFileSync(`stardust/rollout/eds-log/${f}`, 'utf8')).assets.forEach((a) => set.add(a));
    (JSON.parse(fs.readFileSync('stardust/rollout/chrome-map.json', 'utf8')).assets || []).forEach((a) => set.add(a));
  }
  files = [...set];
}
const ledger = fs.existsSync(LEDGER) ? JSON.parse(fs.readFileSync(LEDGER, 'utf8')) : {};
let up = 0, skip = 0, fail = 0;
for (const f of files) {
  if (f === 'null') continue;
  const p = fs.existsSync(path.join(SRC, f)) ? path.join(SRC, f) : path.join(SRC2, f); if (!fs.existsSync(p)) { console.log('missing', f); fail++; continue; }
  const buf = fs.readFileSync(p); const sha = crypto.createHash('sha1').update(buf).digest('hex').slice(0, 12);
  if (ledger[f]?.sha === sha && ledger[f].status === 201) { skip++; continue; }
  const ext = f.split('.').pop().toLowerCase(); const type = TYPES[ext]; if (!type) { console.log('skip type', f); continue; }
  if (ext === 'svg' && buf.length > 40000) console.log('WARN svg >40KB (pipeline may 409 at preview):', f);
  const fd = new FormData(); fd.append('data', new Blob([buf], { type }), f);
  let status = 0;
  for (let attempt = 0; attempt < 3 && ![200, 201].includes(status); attempt++) {
    try { const r = await fetch(`https://admin.da.live/source/${ORG}/${REPO}/media/${f}`, { method: 'PUT', headers: { Authorization: `Bearer ${TOKEN}` }, body: fd }); status = r.status; if (status === 401) { console.error('401 — DA_TOKEN expired'); process.exit(2); } } catch (e) { status = 0; }
    if (![200, 201].includes(status)) await new Promise((r) => setTimeout(r, 1500 * (attempt + 1)));
  }
  ledger[f] = { sha, status: [200, 201].includes(status) ? 201 : status, at: new Date().toISOString(), bytes: buf.length };
  if ([200, 201].includes(status)) up++; else { fail++; console.log('FAIL', status, f); }
  fs.writeFileSync(LEDGER, JSON.stringify(ledger, null, 1));
}
console.log(`media: uploaded ${up}, unchanged ${skip}, failed ${fail} (of ${files.length})`);
process.exit(fail ? 1 : 0);
