// _w4-xcut.mjs <in.png> <x0> <out.png> — keep columns x >= x0 (measure a chrome crop excluding the live skip link at x<115)
import fs from 'node:fs'; import { PNG } from 'pngjs';
const [inp, x0, out] = process.argv.slice(2); const A = PNG.sync.read(fs.readFileSync(inp)); const X = +x0;
const o = new PNG({ width: A.width - X, height: A.height });
for (let y = 0; y < A.height; y++) for (let x = X; x < A.width; x++) { const si = (y * A.width + x) * 4; const di = (y * o.width + (x - X)) * 4; o.data[di] = A.data[si]; o.data[di + 1] = A.data[si + 1]; o.data[di + 2] = A.data[si + 2]; o.data[di + 3] = A.data[si + 3]; }
fs.writeFileSync(out, PNG.sync.write(o));
