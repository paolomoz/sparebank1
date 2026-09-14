// _w4-mask.mjs <in.png> <out.png> <x,y,w,h>… — paint rectangles black (measure a gate excluding a known permanent residual, e.g. video placeholders)
import fs from 'node:fs'; import { PNG } from 'pngjs';
const [inp, out, ...rects] = process.argv.slice(2); const A = PNG.sync.read(fs.readFileSync(inp));
for (const r of rects) { const [x, y, w, h] = r.split(',').map(Number); for (let yy = y; yy < Math.min(y + h, A.height); yy++) for (let xx = x; xx < Math.min(x + w, A.width); xx++) { const i = (yy * A.width + xx) * 4; A.data[i] = 0; A.data[i + 1] = 0; A.data[i + 2] = 0; A.data[i + 3] = 255; } }
fs.writeFileSync(out, PNG.sync.write(A)); console.log(`masked ${rects.length} rect(s) → ${out}`);
