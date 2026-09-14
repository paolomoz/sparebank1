
## W1 (category-hub · kundeservice-hub · market-landing) — 2026-09-14

Each item is mirrored locally in `stardust/scripts/eds/encoders/{category-hub,kundeservice-hub,market-landing}.mjs` (family-gated,
product page byte-identical); the core change is requested here, not applied.

1. **core `band()` hoists grid rows and nests whole sections** (`encoders.mjs band`). It iterates `qa(root, '.grid-row')` first and then,
   for non-grid `band__content` children, calls `ENCODERS[cls]` — for a `.richtext` child that is `richtextSection`, so the band's own
   h1 lands in a nested `<div>` section *after* the card grids (kundeservice: "Kundeservice" h1 emitted after "Hjelp med BankID" cards,
   `section-metadata style=center, narrow, gap-72` nested inside the band). An empty nested `.band` (live spacer) becomes a nested
   empty section too. Evidence: `content/nb/bank/privat/kundeservice.html` before 20:45 (see git-less snapshot in the W1 journal).
   Request: walk `band__content` children in document order (the W1 `hubBand` walker in category-hub.mjs does this) — or make the
   hoisting conditional on the band having only grid rows.
2. **`relatedTopics` reads only `.newsfeed .card`** — hub pages carry `.card-list.card-list--small` icon cards → `cards news` with **0 rows**
   (silent content loss, not counted as a gap): lan "Populære lån" (12 cards), kundeservice "Hjelp til andre ting" (9). Request: fall back to
   `.card-list > .card` and emit `cards small` (W1 `hubRelated`). Also: a `cards` block with 0 rows should count as a gap in convert.mjs.
3. **`bgToken` lacks `#f2f2f9`** (`--ffe-farge-syrin-30`, kundeservice bands + the campaign slide) → the tint is dropped. Request: add
   `'#f2f2f9': 'syrin'` + `main .section.syrin { background: #f2f2f9 }` (W1 mirrors both).
4. **`/content/sites/sb1/<path>` hrefs** (AEM-internal resource paths; visual-nav `data-link`, news cards) reach `lib.href` unnormalised →
   bounce to `https://www.sparebank1.no/content/sites/sb1/nb/...`. Request: strip the `/content/sites/sb1` prefix in `lib.href` before
   the roster check (W1 `normaliseHrefs`/`href` in category-hub.mjs).
5. **`lib.headingTag` needs an only-child span** — live authors `<h2><span class="h4">…</span><br></h2>` (kundeservice FAQ bodies, 6 of 7
   pseudo-headings) → emitted as `<h2>` (36/44) instead of `<h4>`. Request: ignore trailing `<br>`/whitespace children (W1 pre-cleans in a
   family-gated `faq` override).
6. **`content/footer-2.html` (kundeservice chrome) carries the live error-state string as the contact intro**: section 0 =
   `<h2>Kontakt oss</h2><p>Det oppstod en uventet feil. Vennligst prøv på nytt.</p><ul>…` — footer.js renders it as `.contact__text`
   (x100 y3279 w1240 h56 at 1440). Live has no intro on the kundeservice footer (footer content 930px vs 1010 on lan; the replica proto
   matches at 930). Effect: EDS kundeservice is 80px taller than live at both widths and its footer crop fails (85.95 % / 83.03 %) while
   the main content gates clean. Request: drop that paragraph from footer-2.html (the same string sits, correctly hidden, in the
   "Søk etter et kontor" panel of every footer doc).
7. **`serve.mjs` serves DA media only from `stardust/prototypes/assets/img/`**, which did not exist; rasterised PNGs land in
   `stardust/rollout/raster/`. W1 created `assets/img/` and copied `dame-gar-smiler.png`, `samtale-2.png` there. Request: let
   `/__media/` fall back to `stardust/rollout/raster/` (and to `https://content.da.live/…` when neither exists).
8. **`core.shortcuts` selects `.shortcuts__link`**, which the prototype does not have (`.shortcuts__item a`) → empty list. Superseded by
   the W1 family encoder (heading as default content + one cell list); fix or retire the core key.
9. (observation) `reference` sections get `rule-visible` twice (`reference, center, rule-visible, rule-visible`) when preceded by
   `hr.rule--visible` — harmless duplicate class; convert.mjs's pendingStyle patch could skip tokens already present.

### W1 — 0. convert.mjs loader: family files collide (BLOCKING for the hub + market pages)
`convert.mjs` merges `encoders/*.mjs` with `Object.assign` in alphabetical order, so a core key overridden by two family files is
won by the later file for EVERY page. Today: `utility.mjs` (band, cols, tip) and `tool.mjs` (richtext) load after `category-hub.mjs` /
`market-landing.mjs`; all four files gate on their own family and delegate to `CORE.*` otherwise — so on category-hub / kundeservice-hub /
market-landing pages the W1 walker is bypassed and the core output returns (kundeservice h1 nested after the cards, lan "Populære lån" as
a 0-row `cards news`, privat bands in a 12-col grid with button-list links). Verified 21:45: official convert vs
`stardust/scripts/eds/_w1-convert.mjs` (identical to convert.mjs + the three W1 files re-applied last).
Request: dispatch family overrides by the page's family — load `encoders/<pg.archetypeFamily>.mjs` over the core map per page (or
chain: pass the previously merged handler so a family file can delegate to it instead of to CORE). Until then W1 documents are
produced with `_w1-convert.mjs`; a `convert.mjs --all` run will regress `content/nb/bank/privat.html`, `privat/lan.html`,
`privat/kundeservice.html` and their siblings.

### W1 — 10. columns.js `col--media` detection sees the text wrapper, not the cell
`decorate()` groups every non-CTA node of a cell into one `.col__text` div and THEN tests
`[...content.children].every((c) => c.querySelector('picture, img') …)` — with a single wrapper child that holds an image anywhere,
every mixed (image + text) cell becomes `col--media` (3/2 cover-crop, 30px radius, `p { margin: 0 }`). Not visible on the product page
(no mixed cells); on the hubs the "Snakk med rådgiver" photo columns and the market-landing link-list columns hit it (W1 scopes its
illustration rules with `:not(.link-list)` / `:has()` guards). Request: run the media test on the cell's original children before
grouping (or on `.col__text`'s children).

## W2 (faq / utility / tool) — cross-cutting requests, not applied

1. **chrome.mjs — hidden contact text scraped into /footer-\*.** `content/footer-bedrift.html` and `content/footer-2.html` carry
   `<p>Det oppstod en uventet feil. Vennligst prøv på nytt.</p>` as the contact intro: it is the live footer's hidden error fallback
   (the replica hid `.contact__text` on faq for the same reason; live faq footer crop shows no intro text). Skip `display:none`/error
   paragraphs when generating the contact section. W2 removed the paragraph from footer-bedrift.html by hand (regeneration would reintroduce it).
2. **convert.mjs metadataBlock — chrome for pages absent from chrome-map.json.** Siblings get `/nav` + `/footer` (privat) regardless of
   market; a bedrift sibling rendered the privat footer (+56px, wrong intro link). Derive nav/footer from `market` (bedrift → `/nav-bedrift`,
   `/footer-bedrift`) when the slug is not mapped. Interim: additive fallback in header.js/footer.js on `market` metadata.
3. **core band() (encoders.mjs)** on non-hub pages: (a) a `.table-block` child is dropped silently (kontakt lost its 13-row table with 0 gaps
   logged); (b) a `.richtext` child is emitted through `richtextSection` → a nested section-metadata inside the band section; (c) `grid-row--cols-N`
   is not carried; (d) `.lead-blue` on every paragraph, `p.ta-center`, non-rounded / 4:3 images lose their shape. Mirrored family-gated in
   `encoders/utility.mjs` (serviceBand / serviceRow) — the hub walker in category-hub.mjs fixes the same class of defects for the hubs.
4. **columns variant model — identical tokens collapse.** `Columns (lg-3-offset-1-first, lg-3, lg-3)` reaches the DOM as two classes; the third
   cell falls back to `lg-12`. W2 added an additive fill in columns.js (a short list repeats its last token). A positional model
   (`c1-lg-3, c2-lg-3, c3-lg-3`) or per-cell metadata would be the canonical fix; W1's hub documents carry the same shape.
5. **convert.mjs encoder resolution** picks the FIRST class with an encoder: `module` always wins over `module--<kind>`, so a family cannot key
   an encoder on a specific module kind without wrapping the core `module` fallback. Prefer the most specific class (or `module--*` before `module`).
6. **relatedTopics/relatedProducts (core)** read `.newsfeed .card` only: a `.card-list--small` related list on a non-hub page yields a `cards news`
   block with 0 rows and no gap (sparekalkulator, iban). The hub helper `hubRelated` handles it; W2 gates it for the service families.
7. **Authored empty paragraphs (`<p>&nbsp;</p>`) are author spacers on live** (40px each: kontakt band, sperre-kort message box, prisliste tail);
   the pipeline drops them. W2 models them as `spacer-N` style tokens / callout variants; a canon-level convention would avoid per-family tokens.
8. **Dynamics:** the currency converter (valutakalkulator) is shipped as a static snapshot (`calculator currency`, rates frozen at capture); the
   savings calculator (sparekalkulator `module--base-component`) and the prisliste bank chooser are empty in the capture — nothing authored.
