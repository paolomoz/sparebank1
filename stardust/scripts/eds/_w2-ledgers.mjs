// _w2-ledgers.mjs — write stardust/rollout/eds-progress/{utility,tool}.json from the gate evidence (W2)
import fs from 'node:fs';
const load=(f)=>JSON.parse(fs.readFileSync(f,'utf8'));
const us=load('stardust/rollout/eds-progress/_w2-utility-siblings.json'), ts=load('stardust/rollout/eds-progress/_w2-tool-siblings.json');
const sib=(arr,eye)=>({converted:arr.length,gaps:arr.reduce((n,s)=>n+s.gaps.length,0),lint:{red:arr.reduce((n,s)=>n+s.lint.red,0),yellowMax:Math.max(...arr.map(s=>s.lint.yellow))},eyeball:eye,list:arr.map(s=>({slug:s.slug,daPath:s.daPath,blocks:s.blocks,gaps:s.gaps.length,lint:s.lint}))});
const reg={document:"byte-identical after re-convert (final run after every shared-block change)",pixelPct1440:0.65,bar:0.7,pass:true};
const meld = fs.existsSync('stardust/rollout/eds-progress/_w2-meld-skade-eyeball.json') ? load('stardust/rollout/eds-progress/_w2-meld-skade-eyeball.json') : {slug:"nb-bank-privat-forsikring-meld-skade-html",contentDiffRed:0,evidence:"stardust/replica/gates/tool-eds-siblings/"};
const utility={
 regime:"published-origin (local EDS emulation :3012, content/nb/bank/privat/kundeservice/kontakt.html + blocks) vs live capture (stardust/replica/gates/kontakt-{1440,360}/live.png)",
 at:new Date().toISOString(), worker:"W2", family:"utility", archetype:"nb-bank-privat-kundeservice-kontakt-html", document:"content/nb/bank/privat/kundeservice/kontakt.html",
 encoder:"stardust/scripts/eds/encoders/utility.mjs (family-gated band/cols walker serviceBand/serviceRow, table block, tip variants)",
 blocks:["columns (variants cols-8 lead-all media-plain · cols-9 text-center — reused + additive)","table (NEW — Block Collection data table; variant contact)","callout tip (reused)","header (/nav)","footer (/footer)"],
 newBlocks:["table"], chrome:{nav:"/nav",footer:"/footer"}, iterations:4,
 breakpoints:{
  "1440":{pixelPct:1.74,heightDelta:-1,chromeHeaderPct:0.42,chromeFooterPct:1.93,contentDiffRed:0,pass:true,evidence:"stardust/replica/gates/kontakt-eds-1440/ (pixel-iter4.txt, chrome-header.txt, chrome-footer.txt, content-diff-iter1.txt, content-diff-live.txt)"},
  "360":{pixelPct:3.06,heightDelta:-1,chromeHeaderPct:3.58,chromeHeaderPctExcludingSkipLink:0.10,chromeFooterPct:1.09,pass:true,evidence:"stardust/replica/gates/kontakt-eds-360/ (pixel-iter2.txt, chrome-header.txt, chrome-header-x115.txt, chrome-footer.txt)"}},
 justified:[
  {flag:"360 header crop 3.58% > 2%",why:"live focused skip link (x<115); 0.10% excluding it",permanent:true},
  {flag:"360 band y1000–1500 7.8%",why:"the 688px table in the 328px scroller — glyph antialiasing across 13 rows (replica residual 9.6%, same cause)",permanent:true},
  {flag:"content-diff 🟡 MISSING BODY \"Finn din bank\"",why:"the live table caption is visually hidden (accessible name only) — not authored; the heading context names the table",permanent:true},
  {flag:"to-top disc at chunk seams",why:"known permanent residual",permanent:true}],
 fixesThisRound:[
  "table block (blocks/table): Block Collection model — the pipeline turns every authored <table> into a block, so a default-content table cannot survive deploy; variant contact = live 65% centred table + mobile scroll-indicator pill",
  "utility.mjs serviceBand: document-order walker (core band() dropped the .table-block silently and nested the richtext as a section inside the section), cols-N, lead-all, text-center, media-plain, spacer-N",
  "columns.js additive fill: identical variant tokens (lg-3, lg-3) collapse in the DOM classList → the last token repeats for the missing cells",
  "columns.css additive: cols-9 grid (+ its live first-paragraph 16px), text-center, media-plain",
  "styles.css service skins: h3 medium face, heading-row → columns rhythm 24/40, centred heading padded like a grid column (balances onto two lines at 360 like live), table-band (810px richtext, no core wrapper padding), spacer-1/2, callout → cols 48/72"],
 productRegression:reg,
 siblings:sib(us,{slug:"nb-bank-privat-kundeservice-bestill-prisliste-html",vsPrototype:"not a visual reference — the utility replica CSS never styled title/lead/image (prototype h1 + image full-width); EDS follows the gated tool geometry; viewed at 1440",contentDiffRed:0,evidence:"stardust/replica/gates/utility-eds-siblings/"}),
 requests:["core band(): .table-block dropped / .richtext nested / cols-N lost / lead-all, ta-center, image shape lost (mirrored family-gated)","columns variant model: identical tokens collapse (additive fill applied; positional model proposed)","authored <p>&nbsp;</p> spacers dropped by the pipeline (spacer-N tokens)"]
};
const tool={
 regime:"published-origin (local EDS emulation :3012, content/nb/bank/privat/kundeservice/verktoy/sperre-kort.html + blocks) vs live capture (stardust/replica/gates/sperrekort-{1440,360}/live.png)",
 at:new Date().toISOString(), worker:"W2", family:"tool", archetype:"nb-bank-privat-kundeservice-verktoy-sperre-kort-html", document:"content/nb/bank/privat/kundeservice/verktoy/sperre-kort.html",
 encoder:"stardust/scripts/eds/encoders/tool.mjs (title, lead richtext, module wrapper, related-products, button-wrap, image) + utility.mjs (walker, tip)",
 blocks:["bank-choice","breadcrumbs","columns (variants cols-10 media-illustration text-gap · media-4-3 — reused + additive)","callout tip left lg-8 spacer-2 (reused + additive)","feedback","header (/nav)","footer (/footer)"],
 newBlocks:["(siblings) table disclosure variant on the new table block; calculator currency snapshot"], chrome:{nav:"/nav",footer:"/footer"}, iterations:2,
 breakpoints:{
  "1440":{pixelPct:0.51,heightDelta:0,chromeHeaderPct:0.42,chromeFooterPct:1.17,contentDiffRed:0,pass:true,evidence:"stardust/replica/gates/sperrekort-eds-1440/ (pixel-iter2.txt, chrome-header.txt, chrome-footer.txt, content-diff-iter1.txt, content-diff-live.txt)"},
  "360":{pixelPct:1.19,heightDelta:0,chromeHeaderPct:3.58,chromeHeaderPctExcludingSkipLink:0.10,chromeFooterPct:1.40,pass:true,evidence:"stardust/replica/gates/sperrekort-eds-360/ (pixel-iter2.txt, chrome-header.txt, chrome-header-x115.txt, chrome-footer.txt)"}},
 justified:[
  {flag:"360 header crop 3.58% > 2%",why:"live focused skip link (x<115); 0.10% excluding it",permanent:true},
  {flag:"content-diff 🟡 MISSING BODY Ja / Nei",why:"icon-only thumbs buttons with aria-labels (live too)",permanent:true},
  {flag:"content-diff 🟠/🟡 EXTRA bank-choice texts",why:"the prototype renders the bank-choice band outside <main>",permanent:true},
  {flag:"to-top disc at chunk seams",why:"known permanent residual",permanent:true}],
 fixesThisRound:[
  "tool.mjs: title → default content h1 (section title, 16/8 → 16/24, flow-root), page lead → lead-intro (700px, 24/32 fjell centred), spacer-only-N empty sections",
  "styles.css service: ol counter numbering (no markers, li 16 0 0 32, fjell number −1.8em), lead-intro → cols 48/72, title-h2, module-prose, disclosure",
  "columns.css additive: media-illustration (SVG 250px inline), media-4-3, text-gap (24/40 heading→text, 16 after a CTA row)",
  "callout.css additive: left, lg-8/lg-10 box width, small, spacer-1/2 (trailing <p>&nbsp;</p> in the live box — the 80px Δh of iter1)",
  "siblings: table disclosure variant (progressive-disclosure), calculator currency snapshot (data/calculator/valutakalkulator.html + blocks/calculator/currency.css), module-prose for client-chromed modules, service related-products → cards small, ?search hrefs fully-qualified"],
 productRegression:reg,
 siblings:sib(ts,meld),
 requests:["convert.mjs encoder resolution picks `module` before `module--<kind>`","core relatedTopics reads .newsfeed cards only (0 rows on service pages)","dynamics: currency converter snapshot (rates frozen), savings calculator + prisliste bank chooser empty in capture"]
};
fs.writeFileSync('stardust/rollout/eds-progress/utility.json', JSON.stringify(utility,null,1));
fs.writeFileSync('stardust/rollout/eds-progress/tool.json', JSON.stringify(tool,null,1));
console.log('ledgers written: utility siblings', utility.siblings.converted, 'gaps', utility.siblings.gaps, '| tool siblings', tool.siblings.converted, 'gaps', tool.siblings.gaps, 'red', tool.siblings.lint.red);
