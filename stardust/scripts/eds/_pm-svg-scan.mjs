// _pm-svg-scan.mjs — HEAD every unique authored SVG (list on stdin) → stardust/rollout/svg-sizes.json { url: bytes }
import fs from 'node:fs';
const urls = fs.readFileSync(0, 'utf8').split('\n').map((s) => s.trim()).filter((u) => u && u.length < 500 && /^https?:/.test(u));
const out = fs.existsSync('stardust/rollout/svg-sizes.json') ? JSON.parse(fs.readFileSync('stardust/rollout/svg-sizes.json', 'utf8')) : {};
let i = 0; const todo = urls.filter((u) => out[u] === undefined);
async function worker() { while (i < todo.length) { const u = todo[i++]; try { const r = await fetch(u, { redirect: 'follow' }); const n = r.ok ? (await r.arrayBuffer()).byteLength : 0; out[u] = r.ok ? n : -r.status; } catch { out[u] = -1; } } }
await Promise.all(Array.from({ length: 8 }, worker));
fs.mkdirSync('stardust/rollout', { recursive: true }); fs.writeFileSync('stardust/rollout/svg-sizes.json', JSON.stringify(out, null, 1));
const big = Object.entries(out).filter(([, n]) => n > 40000).sort((a, b) => b[1] - a[1]);
console.log(`${urls.length} svgs scanned (${todo.length} new); >40KB: ${big.length}; unreachable: ${Object.values(out).filter((n) => n < 0).length}`);
big.forEach(([u, n]) => console.log(`${String(n).padStart(8)} ${u}`));
