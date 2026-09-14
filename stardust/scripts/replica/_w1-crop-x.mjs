// _w1-crop-x.mjs <a.png> <b.png> --y Y --height H --x X — pixelmatch a y-band of two stitched PNGs from column X rightwards
// (W1 helper: the live focused skip link "Til hovedmeny" occupies x<115 of the 360 header — measure the header without it, as the product gate did)
import fs from 'node:fs'; import { PNG } from 'pngjs'; import pixelmatch from 'pixelmatch';
const args = process.argv.slice(2); const opt = (n, d) => { const i = args.indexOf(`--${n}`); return i !== -1 ? +args[i + 1] : d; };
const [fa, fb] = args.filter((a) => !a.startsWith('--') && !/^\d+$/.test(a));
const y0 = opt('y', 0), h = opt('height', 60), x0 = opt('x', 115);
const A = PNG.sync.read(fs.readFileSync(fa)), B = PNG.sync.read(fs.readFileSync(fb));
const w = Math.min(A.width, B.width) - x0;
const crop = (img) => { const out = new PNG({ width: w, height: h }); for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const si = ((y0 + y) * img.width + (x0 + x)) * 4, di = (y * w + x) * 4; out.data.set(img.data.subarray(si, si + 4), di); } return out; };
const a = crop(A), b = crop(B); const diff = pixelmatch(a.data, b.data, null, w, h, { threshold: 0.1 });
console.log(`header excluding skip link (x>=${x0}): ${diff} / ${w * h} = ${(100 * diff / (w * h)).toFixed(2)}% differing`);
