
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

## W3 — product siblings (2026-09-14)
- **Family-encoder registry: last file wins, no chaining.** `convert.mjs` merges `encoders/*.mjs` alphabetically over the core map, so a shared key registered by two families is owned by the later file: `utility.mjs` (band, cols, tip) sits after `category-hub.mjs` and `product.mjs`, and `tool.mjs` (image, button-wrap, title, module, richtext) after both — each delegating to CORE, never to the previously registered handler. Measured: with `product.mjs` registering `band`/`cols`/`image`/`button-wrap` normally, the band-nested price-and-terms modules (bedriftskonto, billan, egen-pensjonskonto), the in-band step-by-step (utenlandsbetaling) and every top-level image/CTA on the insurance pages were dropped or emitted as prose (9 pages regressed to gaps). Interim in `product.mjs`: the family-gated wrappers are installed on the CORE object itself (`CORE.band/cols/faq/tip/module` → product wrapper → original core), and the new keys are added to CORE so core `band()` can resolve nested modules. Request: make the loader chain (`handler(root, ctx, opts, next)` or merge by family set), and let core `band()` resolve nested children against the merged map, in document order (it hoists all `.grid-row`s first, then the other children — the price-and-terms/steps order inside a band is only right by luck).
- **Blocks cannot nest (FAQ answers holding widgets).** Live FAQ answers on the product siblings carry a coverage *comparison table* (bilforsikring: 2 tables, 29 expandable feature rows, mobile filter tabs), a *guide-carousel* (bankkort), a *columns-grid* (bankid) and *button rows* (billan). An accordion row's cell cannot hold a block/table in DA, so `product.mjs` flattens them to default content (comparison: `<p><strong>feature</strong></p><ul>Dekkes av …</ul><p>details</p>` per row — every live text node, incl. the visually-hidden coverage labels, is kept; carousel: title/copy/screenshot per slide). Canon decision needed: either accept the prose (current), or lift such widgets out of the accordion (a `table comparison` block after the FAQ — changes the live reading order), or allow an accordion `fragment` reference per answer.
- **A columns cell cannot hold a block.** bankkort/kredittkort author a price-and-terms (+ a progressive-disclosure on kredittkort) inside one column of a 2-column grid (image + text in the other). `product.mjs` emits the columns block with the prose only and the price-terms / disclosure blocks right after it (content complete, layout stacks instead of side-by-side). Alternative: a `columns` variant that accepts a block reference — canon decision.
- **`title` module (W2)**: vare-eksperter, bli-kunde, gronne-lan still report `module title emitted as prose` — the `title` key is owned by category-hub/tool (family-gated → prose fallback for product). Left for the owner; the h1 is in the document as prose.
- **Live link placeholders**: leasing carries `<a href="${linksbm.leasingbillan.sok}">` (an AEM link resolved client-side). Lint D4 🔴 on the raw href; `product.mjs` bounces it to the source page with a note — the same justified class as the `lenker.sparebank1.no` runtime rewrites; a site-wide rule in `lib.href()` would be cleaner.
- **Chrome text in blocks**: `carousel` generates "N av M" (counter) and the Forrige/Neste controls; `accordion steps` generates the step numbers. Fixed strings like the accordion's "Åpne" / faq "Var dette nyttig?" — flagging for the i18n/label policy if one lands.

## W4 (om-oss · theme · markedsnytt-listing) — 2026-09-14

1. **Loader collision (= W1 #0), W4 workaround.** `utility.mjs`/`tool.mjs` win `band`, `cols`, `richtext`, `module`, `title`, `image`,
   `button-wrap` for EVERY page and delegate to `CORE.*` outside their family (or return null → prose + gap). om-oss/theme/markedsnytt
   install their overrides as family-gated wrappers ON the core map (`encoders/om-oss.mjs gateCore`) so the official convert.mjs
   works and other families are untouched (boliglan byte-identical). Request stands: dispatch `encoders/<family>.mjs` per page.
2. **`blocks/carousel/carousel.js` was rewritten non-additively** (W3 guide carousel, 22:07): W1's `campaign` decorate + the
   `.carousel.campaign*` CSS vanished; the market-landing and presse heroes rendered as guide slides ("1 av 1", Forrige/Neste).
   W4 restored `campaign` as a variant branch (dispatch on `classList.contains('campaign')`; guide flow untouched) and re-added the
   CSS. Request: arbitrate ownership — lock the dispatch, or move `guide` to its own block.
3. **`cols-9` token couples a grid width with a family quirk**: `.columns.cols-9 .col__text > :first-child { margin-top: 16px }`
   (utility) — the presse frost band (live grid-row--cols-9) has no such margin (h2 flush at y601 = band top + 72). W4 adds `flush`
   to cancel it; the 16px should be its own token (`text-gap`-style) so `cols-N` means only the width.
4. **`lib.mjs rasterName` keeps URL-encoding in the PNG name**: `…/Innovasjons%20workshop%202%20lys%20bakgrunn.svg` →
   `Innovasjons%20workshop%202%20lys%20bakgrunn.png` uploaded literally, while the authored URL decodes to spaces (and serve.mjs
   decodes the request → 404 locally). Request: `decodeURIComponent` + slugify the basename before upload/authoring.
5. **chrome-map covers archetypes only.** om-oss siblings got `/nav` + `/footer` (privat). W4 added the additive `market=om-oss`
   fallback in header.js/footer.js (like bedrift). Still open: the live jobb-og-karriere footer carries the "Kontakt oss" contact
   block that `/footer-om-oss` (presse) lacks → per-page footer documents / a `footer` metadata row for siblings.
6. **content-diff justified class**: ROLE SWAP fires for `<h1><span class="h1">` / `<h2><span class="h2">` (span at the SAME rank),
   not only `.h2–.h6` pseudo-headings at another rank — extend the site-wide justified pattern.
7. **Live desktop `button-list` items keep `margin-bottom: 8px`** (om-oss/theme/markedsnytt replica CSS all carry it); columns.css
   has it on mobile only → W4 `button-gap` variant. Probably site-wide (canon-level): verify on the product page before folding in.
8. **Inline `<picture>` baseline tail (7px)** under illustration/portrait images is a live-wide behaviour (replica inconsistency
   register, all three W4 families) — columns.css `wN` model renders block images. W4 `baseline` variant; consider making it the
   default of the `wN` / `media-plain` cell models after checking the hub pages.

### W1 — 11. replica: kundeservice-hub / canon image module drops the authored image width (sibling bedrift-kundeservice)
Live authors illustration sizes inline (`<img style="max-width:140px;width:100%">`, `style="width:100%;height:200px"`, `max-width:200px`);
`stardust/scripts/replica/modules/market-landing.mjs` carries it as `--w` on `.image`, the kundeservice-hub / canon path does not. The
bedrift-kundeservice prototype therefore renders `dame-kikkert-hoyre.svg` at 1280×1475 (its own eyeball fails) and the EDS document
has nothing to carry into the `wN` cell model. Request: carry `--w` (and `height`) in canon's image module; then convert.mjs receives it.
Also from the sibling round: `author.mjs` unknown modules `progressive-disclosure`, `text-and-image`, `brand-logo`, `product-nav`,
`base-component` reach the prototype as richtext only (W1 encodes them as default content and notes it).

### W1 — 12. rasterise-svg.mjs writes 2× PNGs whose intrinsic size is 2× the SVG box
`serve.mjs` (and the DA pipeline) emit `width/height` from the file, so a rasterised illustration that is not sized by CSS renders at
twice its live size (e.g. `samtale-2` 763×382 → constrained only by the W1 `wN` cell model). Request: rasterise at 1× (or emit the
1× width/height attributes) so prose-placed illustrations keep their live size.
9. **`cards` `height: 100%` + `margin-bottom: 16px` inside a grid cell grows the card by its margin** (W1 patched `cols-8` with
   `height: auto`; W4 `featured`/`flat`). Live card--medium rows do not stretch; consider `height: auto` as the grid default (check boliglan).
10. **gateCore re-entry**: a family handler installed on the core map must capture the original BEFORE gating and never call `CORE[key]`
    inside (theme.mjs reference recursed). If the loader is fixed per-family (#1), the pattern disappears.
11. **`lib.mjs inline()` change of 22:32 (`<br>` moved outside `<b>/<strong>`) changed content/nb/bank/privat/lan/boliglan.html** (33 lines).
    W4's product regression baseline was taken before it; the new document is byte-identical with the W4 encoders removed. Whoever made
    the change should re-run the boliglan document/pixel gate and refresh the product baseline.
12. **`cards static` has no rules** (`static-cards` → `cards static`, emitted by the core cardList for theme/hub siblings): renders as bordered
    medium cards; the prototypes show borderless image + title rows. No lifted values exist (canon.css has none) — needs a lift on a page that
    carries it (hvilke-forsikringer-trenger-man, netthandel-kredittkort).
13. **Prototype-side**: only market-landing.css consumes the authored `--w` on `.image`; the theme/om-oss prototypes render such illustrations at
    column width (netthandel credit-card illustration) while EDS follows the authored width — the sibling prototypes are not gated, so the EDS
    reading (authored width) is kept; worth a note for whoever re-gates a sibling against live.

## W5 (news-article · news-listing · campaign-landing — the nettsider-frontend families) — 2026-09-14

Each item is mirrored locally (encoders/{news-article,news-listing,campaign-landing}.mjs, `_w5-chrome.mjs`, `_w5-template-fix.mjs`); the
canon-level change is requested here, not applied. Product page byte-identical, 0.65 % at 1440.

1. **Roster misclassification (BLOCKING for three documents on a `convert.mjs --all` run).** `_page-types.json` / state.json file
   `nb-bank-om-oss-nyheter-bank-regnskap-nerderiket-html`, `nb-bank-privat-forsikring-kundehistorier-sikrer-seg-mot-vannlekkasje-klok-av-skade-html`
   and `nb-bank-privat-sparing-markedsnytt-artikler-kan-utviklingen-til-teknologifondene-fortsette-videre-i-samme-tempo-html` under **news-article**,
   but their sidecars are `sb1-story__body` pages (story header, no `.sb1-article`) — the replica author.mjs itself picks the campaign-landing module for
   them. convert.mjs dispatches by module root so the story encoder converts them, but `metadataBlock()` writes `template: news-article` from
   `pg.archetypeFamily`, which would render the article card layout + article header. W5 rewrites the row to `campaign-landing` with
   `stardust/scripts/eds/_w5-template-fix.mjs` (idempotent; run after any reconversion). Request: reclassify the three pages as campaign-landing
   (or derive `template` from the prototype's module root / let a family encoder override metadata rows).
2. **chrome.mjs would regress the frontend chrome documents on a rerun.** It ran (17:04Z) before the frontend prototypes were finalised (20:05Z):
   `/footer-frontend-om-oss` was an empty `columns` section, no footer carried the frontend address line (`.footer__info`, not `.footer__address`),
   `/nav-om-oss` (the listing's nav per chrome-map) lacked Søk / Bli kunde, the frontend CTA is a `<button>` (href ""), and `/content/sites/sb1/…`
   hrefs were kept (bounce to an AEM resource path). `_w5-chrome.mjs` regenerates `/nav-om-oss`, `/nav-frontend-om-oss{,-2}`, `/footer-frontend-om-oss{,-2}`
   from the current prototypes. Request: fold into chrome.mjs — `q(footer, '.footer__address, .footer__info')`, the search label from
   `.header__search-text`, a CTA href fallback (`/nb/bank/privat/kundeservice/bestill/bli-kunde`), and the `/content/sites/sb1` normalisation (= W1 #4).
3. **chrome-map lists archetypes only**: the six privat/om-oss article siblings and the three story siblings take `/nav` + `/footer` via the
   header.js/footer.js fallback — the frontend variant renders, but with the privat link columns ("Privat" instead of "Snarveier"). Request: map
   frontend-template siblings to `/nav-frontend-*` / `/footer-frontend-*` (or extend the fallback on `template` ∈ frontend set).
4. **`_pm-svg-scan.mjs` missed an oversize authored SVG**: `…/illustrasjoner/komposisjoner/2025/Barn_som_turner_lys_bakgrunn.svg` on hjemme is
   44,336 B (> 40 KB, pure vector). W5 added the svg-sizes.json entry, rasterised + uploaded (`raster-ledger.json`) and copied the PNG to
   `stardust/prototypes/assets/img/` for the emulation (serve.mjs has no `stardust/rollout/raster/` fallback — same as W1 #7).
5. **`lib.href` and `/content/sites/sb1` paths** — same as W1 #4; mirrored as `href()` in encoders/news-article.mjs (shared by the three family files).
6. **content-diff on frontend pages**: live nests header/footer inside `<main>`; the working scope for live ↔ EDS is
   `--main ".sb1-article, main:not(:has(header))"` (resp. `.sb1-articles__content`, `.sb1-story__body`). Worth a note in the brief.
7. (observation) `serve.mjs`: after the 20:40Z single-paragraph-cell unwrapping, blocks must accept a bare `<picture>` in a media cell (cards.js,
   hero.js, story.js do); restart running emulations — a stale server produced a false 48 % first gate on the listing.
8. (observation) No `stardust/replica/justified/` directory exists, so gate.mjs cannot consume the site-wide justified classes (ROLE SWAP for
   pseudo-heading spans, MISSING CTA for lenker.sparebank1.no). The ledgers carry them verbatim.

## Orchestrator — 2026-09-15
- footer.css no-intro rule (`.contact__title + .contact__actions { margin-top: 72px }`, from the bedrift faq lift) puts the privat footer-2 heading 8px off: live privat no-intro variant measures 64px (kundeservice hub, 360). Verify the two live variants and split the rule by footer document.
- Silent 0-row blocks (core `relatedTopics` on a `.card-list`; `cards news` with no `.newsfeed`) are the most dangerous defect class: convert.mjs should fail a page whose block has 0 rows unless the encoder marks it intentional.
- Every "emulation passed, published failed" case came from a pipeline behaviour the emulation lacked (single-`<p>` cell unwrap, nbsp/blank spacers, edge `<br>`, `<br>` inside inline formatting). serve.mjs now mirrors them — re-gate any page whose emulation gate predates 2026-09-15 before trusting it.
