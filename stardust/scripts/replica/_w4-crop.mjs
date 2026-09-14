// _w4-crop.mjs <a.png> <b.png> <y> <height> <out.png> — side-by-side crop of two stitched captures (W4 inner loop)
import fs from 'node:fs'; import { PNG } from 'pngjs';
const [a, b, y, h, out] = process.argv.slice(2);
const A = PNG.sync.read(fs.readFileSync(a)); const B = PNG.sync.read(fs.readFileSync(b));
const Y = +y, H = +h; const W = A.width + 10 + B.width; const o = new PNG({ width: W, height: H });
o.data.fill(255);
const blit = (src, x0) => { for (let yy = 0; yy < H; yy++) { const sy = Y + yy; if (sy >= src.height) break; for (let xx = 0; xx < src.width; xx++) { const si = (sy * src.width + xx) * 4; const di = (yy * W + x0 + xx) * 4; o.data[di] = src.data[si]; o.data[di + 1] = src.data[si + 1]; o.data[di + 2] = src.data[si + 2]; o.data[di + 3] = 255; } } };
blit(A, 0); blit(B, A.width + 10);
for (let yy = 0; yy < H; yy++) for (let xx = A.width; xx < A.width + 10; xx++) { const di = (yy * W + xx) * 4; o.data[di] = 255; o.data[di + 1] = 0; o.data[di + 2] = 0; }
fs.writeFileSync(out, PNG.sync.write(o)); console.log(`wrote ${out} ${W}x${H}`);
