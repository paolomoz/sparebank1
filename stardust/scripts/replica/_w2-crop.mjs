// _w2-crop.mjs <in.png> <out.png> <y> <height> [x] [width] — crop a PNG region for viewing
import fs from 'node:fs'; import { PNG } from 'pngjs';
const [inp, out, y, h, x = '0', w] = process.argv.slice(2);
const png = PNG.sync.read(fs.readFileSync(inp));
const W = w ? +w : png.width - +x; const H = Math.min(+h, png.height - +y);
const o = new PNG({ width: W, height: H });
for (let r = 0; r < H; r++) png.data.copy(o.data, r * W * 4, ((+y + r) * png.width + +x) * 4, ((+y + r) * png.width + +x + W) * 4);
fs.writeFileSync(out, PNG.sync.write(o));
