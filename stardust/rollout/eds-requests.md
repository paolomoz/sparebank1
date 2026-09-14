
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
