// _w5-shrink.mjs <in.png> <out.png> <y0> <h> [factor=2] — crop a band and downscale by an integer factor (eyeballing long pages)
import fs from 'node:fs'; import { PNG } from 'pngjs';
const [inp, out, y0, h, f = '2'] = process.argv.slice(2); const F = +f;
const src = PNG.sync.read(fs.readFileSync(inp)); const Y = +y0; const H = Math.min(+h, src.height - Y);
const W = Math.floor(src.width / F), HH = Math.floor(H / F); const dst = new PNG({ width: W, height: HH });
for (let y = 0; y < HH; y++) for (let x = 0; x < W; x++) for (let c = 0; c < 4; c++) { let s = 0; for (let dy = 0; dy < F; dy++) for (let dx = 0; dx < F; dx++) s += src.data[(((Y + y * F + dy) * src.width) + (x * F + dx)) * 4 + c]; dst.data[(y * W + x) * 4 + c] = Math.round(s / (F * F)); }
fs.writeFileSync(out, PNG.sync.write(dst)); console.log(`${out} ${W}x${HH}`);
