// _w2-modules.mjs <slug> <selector> — print the prototype's matching module roots (svg stripped, long texts truncated)
import * as L from './lib.mjs';
const [slug, sel] = process.argv.slice(2);
const { document } = L.loadProto(slug);
for (const el of document.querySelectorAll(sel)) console.log(el.outerHTML.replace(/<svg[\s\S]*?<\/svg>/g, '').replace(/>([^<]{60})[^<]*</g, '>$1…<').replace(/\s+/g, ' ') + '\n');
