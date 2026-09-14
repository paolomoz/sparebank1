#!/usr/bin/env node
// _w3-siblings.mjs [--author] — convert + lint every product sibling (archetype excluded); writes stardust/rollout/eds-progress/product-siblings.json (siblings part)
import { execSync } from 'node:child_process'; import fs from 'node:fs';
const flags = process.argv.slice(2);
const types = JSON.parse(fs.readFileSync('stardust/current/_page-types.json', 'utf8'));
const sibs = types.types.product.pages.filter((s) => s !== 'nb-bank-privat-lan-boliglan-html');
const out = [];
for (const s of sibs) {
  if (flags.includes('--author')) execSync(`node stardust/scripts/replica/author.mjs ${s}`, { stdio: 'ignore' });
  execSync(`node stardust/scripts/eds/convert.mjs ${s}`, { encoding: 'utf8' });
  const log = JSON.parse(fs.readFileSync(`stardust/rollout/eds-log/${s}.json`, 'utf8'));
  let lint = ''; try { lint = execSync(`node stardust/scripts/deploy/davids-model-lint.mjs ${log.file}`, { encoding: 'utf8' }); } catch (e) { lint = (e.stdout || '') + (e.stderr || ''); }
  const m = /(\d+) 🔴, (\d+) 🟡/.exec(lint) || [0, -1, -1]; const red = +m[1]; const yellow = +m[2];
  const reds = lint.split('\n').filter((l) => /🔴/.test(l) && !/\d+ 🔴/.test(l)).map((l) => l.trim().slice(0, 160));
  const yellows = lint.split('\n').filter((l) => /🟡/.test(l) && !/\d+ 🟡/.test(l)).map((l) => l.trim().slice(0, 160));
  out.push({ slug: s, daPath: log.daPath, blocks: log.blocks, gaps: log.gaps, lint: { red, yellow, reds, yellows }, notes: log.notes.filter((n) => !/^lint D/.test(n)), lintJustifications: log.notes.filter((n) => /^lint D/.test(n)) });
  console.log(`${s.replace(/^nb-bank-|-html$/g, '')}: blocks ${log.blocks.join(',')} · gaps ${log.gaps.length}${log.gaps.length ? ' (' + log.gaps.join('; ').slice(0, 200) + ')' : ''} · lint 🔴${red} 🟡${yellow}`);
}
fs.mkdirSync('stardust/rollout/eds-progress', { recursive: true });
fs.writeFileSync('stardust/rollout/eds-progress/_w3-siblings-raw.json', JSON.stringify(out, null, 1));
console.log(`\n${out.filter((o) => !o.gaps.length).length}/${out.length} gap-free · 🔴 total ${out.reduce((a, o) => a + o.lint.red, 0)} · 🟡 total ${out.reduce((a, o) => a + o.lint.yellow, 0)}`);
