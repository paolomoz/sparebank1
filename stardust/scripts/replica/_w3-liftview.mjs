// _w3-liftview.mjs <lift.json> [selRegex] — compact view of a lift-styles dump: per selector, first 2 matches: rect + key styles
import { readFileSync } from 'node:fs';
const [file, re = '.'] = process.argv.slice(2); const j = JSON.parse(readFileSync(file, 'utf8')); const R = new RegExp(re);
const P = ['display','position','width','maxWidth','height','margin','padding','gap','gridTemplateColumns','flexDirection','justifyContent','alignItems','fontFamily','fontSize','fontWeight','lineHeight','textAlign','textTransform','color','backgroundColor','borderRadius','border','top','right','bottom','left','objectFit','order','opacity','boxShadow','textDecoration'];
const short = (v) => String(v).replace(/rgba?\(([^)]+)\)/g, (m, a) => { const n = a.split(',').map((x) => +x.trim()); return n[3] === 0 ? 'transparent' : '#' + n.slice(0, 3).map((x) => x.toString(16).padStart(2, '0')).join('') + (n[3] !== undefined && n[3] !== 1 ? '/' + n[3] : ''); }).replace(/"SpareBank1-([a-z-]+)"[^;]*/g, 'SB1-$1').replace(/, sans-serif/g, '');
for (const [sel, arr] of Object.entries(j)) {
  if (sel.startsWith('_') || !R.test(sel) || !Array.isArray(arr)) continue;
  console.log(`\n## ${sel} (${arr.length})`);
  for (const m of arr.slice(0, 2)) { const s = m.style; const kv = P.filter((p) => s[p] && !['none', 'normal', 'auto', 'static', '0px', 'transparent', 'rgba(0, 0, 0, 0)', 'visible', 'start', 'stretch', 'flex-start', 'row', '0', '1'].includes(s[p]) && !(p === 'border' && /^0px/.test(s[p]))).map((p) => `${p}=${short(s[p])}`).join(' '); console.log(`  <${m.tag}.${(m.cls || '').split(' ').slice(0, 3).join('.')}> "${m.text.slice(0, 40)}" rect=${m.rect.x},${m.rect.y} ${m.rect.w}x${m.rect.h}\n    ${kv}${m.before ? '\n    ::before ' + JSON.stringify(m.before).slice(0, 120) : ''}`); }
}
