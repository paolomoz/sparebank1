#!/usr/bin/env node
// _w2-siblings.mjs <family> [--author] — author (optional) + convert + lint every sibling of a family (the archetype excluded); prints a JSON summary
import { execSync } from 'node:child_process'; import fs from 'node:fs';
const [family, ...flags] = process.argv.slice(2);
const types = JSON.parse(fs.readFileSync('stardust/current/_page-types.json', 'utf8'));
const arche = JSON.parse(fs.readFileSync(`stardust/replica/progress/${family}.json`, 'utf8')).archetype;
const sibs = types.types[family].pages.filter((s) => s !== arche);
const out = [];
for (const s of sibs) {
  if (flags.includes('--author')) execSync(`node stardust/scripts/replica/author.mjs ${s}`, { stdio: 'ignore' });
  const conv = execSync(`node stardust/scripts/eds/convert.mjs ${s}`, { encoding: 'utf8' }).trim();
  const log = JSON.parse(fs.readFileSync(`stardust/rollout/eds-log/${s}.json`, 'utf8'));
  let lint = ''; try { lint = execSync(`node stardust/scripts/deploy/davids-model-lint.mjs ${log.file}`, { encoding: 'utf8' }); } catch (e) { lint = e.stdout + e.stderr; }
  const m = /(\d+) 🔴, (\d+) 🟡/.exec(lint) || [0, -1, -1]; const red = +m[1]; const yellow = +m[2];
  out.push({ slug: s, daPath: log.daPath, blocks: log.blocks, gaps: log.gaps, lint: { red, yellow }, notes: log.notes.filter((n) => !/^lint D/.test(n)) });
  console.log(`${s}: blocks ${log.blocks.join(',')} · gaps ${log.gaps.length}${log.gaps.length ? ' (' + log.gaps.join('; ') + ')' : ''} · lint 🔴${red} 🟡${yellow}`);
}
fs.writeFileSync(`stardust/rollout/eds-progress/_w2-${family}-siblings.json`, JSON.stringify(out, null, 1));
