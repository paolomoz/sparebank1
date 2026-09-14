// _w5-crop.mjs <in.png> <out.png> <x> <y> <w> <h> — crop a PNG region (pngjs), for eyeballing chrome bands
import fs from 'node:fs'; import { PNG } from 'pngjs';
const [inp, out, x, y, w, h] = process.argv.slice(2);
const src = PNG.sync.read(fs.readFileSync(inp));
const X = +x, Y = +y, W = Math.min(+w, src.width - X), H = Math.min(+h, src.height - Y);
const dst = new PNG({ width: W, height: H });
for (let j = 0; j < H; j++) src.data.copy(dst.data, j * W * 4, ((Y + j) * src.width + X) * 4, ((Y + j) * src.width + X + W) * 4);
fs.writeFileSync(out, PNG.sync.write(dst)); console.log(`${out} ${W}x${H} (src ${src.width}x${src.height})`);
