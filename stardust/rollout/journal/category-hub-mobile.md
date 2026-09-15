# W7 journal — category-hub siblings at 360 (mobile fidelity pass) · 2026-09-15

Ledger: `stardust/rollout/eds-progress/category-hub-mobile.json`. Requests: `stardust/rollout/eds-requests.md` § W7.
Scope: the seven HUB-SIBLINGS-DEFECTS pages at 360 (forsikring, pensjon, sparing, lofavor, tips-og-rad, daglig-bruk, eiendom); 1440 must not move.
Method: live 360 PNG (cached capture) profiled row by row (`stardust/scripts/replica/_w7-rows.py`: ink runs + band-colour edges) against the emulation
(:3017) stitched the same way, plus W6's live DOM dumps (`/tmp/w6/dump-*-360.txt`) and `_w6-dump.mjs` on the emulation; the prototype
(:8812) was consulted but NOT trusted at 360 (forsikring: the prototype hero CTAs and the boxed cards were ~400px off live).
No new live captures; 0 live hits so far.

## Instruments
- `stardust/scripts/replica/_w7-rows.py <png> <y0> <y1> [x0 x1 gap]` — ink-row runs + background edges (the live PNG is the only 360 truth we have).
- `stardust/scripts/replica/_w7-drift.py live-rows emu-rows [-v]` — aligns the two run lists and prints the live→EDS offset wherever it changes.
- `stardust/scripts/replica/_w7-sbs.py`, `_w7-crop.py` — side-by-side crops (live | EDS) for eyeballing.
- `stardust/scripts/replica/_w7-inner.mjs`, `_w7-imgprobe.mjs` — decorated HTML / image natural sizes on the emulation.

## forsikring (published 29.83 % Δh −276 → emulation 5.30 % Δh +4; 1440 8.37 % Δh −29 vs W6 8.23 %)
The published page is 276px TALLER than live at 360 (pixel-compare reports live − EDS). Causes, top-down (all measured, none guessed):
| Module | Live 360 | EDS was | Fix (mobile-only unless noted) |
|---|---|---|---|
| Hero CTAs | two full-width 320px pills, 20px under the lead, 8px apart | intrinsic-width centred pills, 24px module margin | `hub-cta` wrapper margin 0, `a.button` flex 100 %, wrapper 0/8 |
| Hero note | 14px glyphs on the paragraph's 24px strut (2 lines = 48), 24 under the pills, 64 to the band | 14/20, 16 under, 48 to the band (margin collapse) | line-height 24, margin-top 24, section padding-bottom 16 |
| Band sub-lead ("Se hva vi dekker…") | plain 16/24 in a ≤242px column ("…kjøp det / du trenger.") | 18/28 in 328 | `band.hub-center h2 + p` 16/24, max-width 240 |
| Boxed category cards ×7 | box 312 in the 328 column (x24), image 280×200, title 28, text 48 (14px on 24 strut), expander centred, card 387, pitch 403 | li padding 16 (image 264), text 20px pitch, card `height:100 %` resolved against a li that already holds the card's 16px margin (+16 absorbed by the flex content), expander stretched to 100 % and left-aligned (`.card__expand` width leaked onto `--inline`) | li padding 8, text line-height 24 (drop the 4px ::after), `height:auto; margin-bottom:0`; **general**: `.card__expand--inline { width:auto; gap:8px }` (live centres it at 1440 too: x195 in a 240 box) and `.cards.boxed .card__media img { object-position: 50% 50% }` (the 280×150 SVG keeps xMidYMid meet inside the 200px img at every width; the generic photo top-anchor was wrong) |
| Two-tone banner | mint edge 54px lower: the column has no top padding, the illustration hangs 60px above the tint; pill 28 under the text / 8 above the column padding | column padding-top 54, pill centred in an 80px box | `.banner.columns { padding-top:54 }`, column padding-top 0, bottom `justify-content:flex-start` |
| Calculator columns illustration | inline SVG: ~6px descender slack under the image | block picture, none | `p:has(> picture) { padding-bottom: 6px }` on that layout |
| Featured photo cards ×4 ("Hvilke forsikringer…") | heading centred + balanced (2 lines), sub-lead 17/24 full width, cards x24 w312 (li 8px), title 20/24, pitch 391, list x16 w328, 32 under the last card | heading left (product static skin's `:has()` rule outranks `hub-static`), 16px intro, li full-bleed with 32px padding + 16 margin + 16 flex gap (pitch 443), title 28 | `hub-static:has(> .cards-wrapper > .cards.static)` h2 centre/balance/mb 8, p 17/24 (mt 24), section padding 16/32, `.cards.static.featured.hub li { padding:8px; margin:0 }`, list `gap:0`, title 24 (scoped to `static.featured.hub`: pensjon's grid featured keep the live h2>span.h3 28) |
| Standalone illustration → "Bedrift eller landbruk?" | image module, no column padding, ~6 slack; paragraph 17/24; pill wraps to 2 lines (68px) | col padding 16; 16px; 44px pill with overflowing label | `.columns.lg-12-w175 .col { padding-bottom: 6px }`, `hub-tight p` 17/24, `.disclosure__btn { height:auto }` |
| "Tips og råd" static cards | 48 after the pill, heading centred, 8 → cards (16 with the li), cards x24 w312, pitch 282 | 72, left, 24, full-bleed, pitch 298 | `hub-static` margin-top 48 (hub-flush still wins), h2 mb 8, `.cards.static.hub li { padding:8px; margin:0 }`, gap 0 |
| FAQ band | content x24–335 (items text x44, pill 311 wide), title → items 62, pill → note 64, note 14px on 24 strut, note → rule 80, rule → "Ordliste" 64, h3 22px, link → band end 64 | 16px band padding, wrapper slack 8, note 24 under the pill at 14/20, 48, 20px h3, wrapper slack 8 | `band.faq` padding 24, wrapper pb 0, note margin-top 64 / 14px/24px, `hub-close.rule-visible` padding-top 64, h3 22/24, wrapper pb 0 |
| "Blant Norges beste" / Fremtind | h2 balanced ("Blant Norges beste / på skadeoppgjør", "Forsikringsselskapet / vårt er Fremtind"), inline-SVG slack ~7 under the media-plain images, Fremtind text 14px on 24 (3 lines) | greedy wrap, none, 16px (4 lines) | `text-wrap: balance` on `main .section h2` at ≤767 (live h2s balance — 5 cases across forsikring/pensjon), `.columns.media-plain .col--media .col__text > p:last-child { padding-bottom: 7px }`, `reference-cols p` 14/24 |
| Feedback | hr inset 20 (x20–339), 68 to the question | full-width section border, 52 | `rule-visible:has(> .feedback-wrapper)`: border via `::before` inset 20, padding-top 64 (same inset for the `hub-close` band rule, 16) |
Residuals at 360: one band ≥ 15 % — 8000–8500 (18.1 %): the four "Tips og råd" photo cards (live serves `.thumb.768` cover crops — W6's permanent class; geometry matches to ±1px). Boxed card 1 illustration ±1px; the mint banner pill 8px (fixed in iter11); everything else within ±4px of live (drift trace: −2…−4 from the FAQ pill to the footer).
1440: 8.37 % Δh −29 (W6 emulation 8.23 %, published 8.26 %; same two hot bands 2000–2500 21.4 %, 4000–4500 26.8 %). The +0.14 % is in the boxed-cards band (crop 700–1300: 6.24 % vs 5.57 %): the boxes sit 19px lower than live at 1440 (W6 residual, box top 786 vs 767) and the now-correct centred illustration (ink +36 in the box, live +36) no longer partially cancels that offset the way W6's top-anchored ink (−17) did. Not chased (a 1440 fix is W6's band model, out of scope).

## pensjon (published 22.33 % Δh −8 → emulation iter4 8.31 % Δh +40, iter5 pending; the recorded live blank-`<p>` spacer (56px, "Flere saker om pensjon" band) is the only Δh left)
| Module | Live 360 | EDS was | Fix (mobile-only) |
|---|---|---|---|
| Title + lead (`hub-title-lead`) | 48 under the bank-choice, lead spans the 320 column (6 lines) | 72, lead in the 280 intro column (7 lines) → band +48 | `intro.hub-title-lead` margin-top 48, `h1 + p` max-width none |
| Featured cards ×3 (`grid lg-4 featured hub`) | title is the live `h2 > span.h3` (28px line) — unlike forsikring's h3 20/24 | my forsikring title rule (24) had leaked in | scoped that rule to `.cards.static.featured.hub` |
| Widget intro (`hub-widget` columns) | h5 "Er dette nok for deg?" 17px on a 24 line | 17/20 | `hub-widget .col__text h5` line-height 24 |
| "Gode råd" (`cols hub-center`) | heading centred, sub-lead 17/24 across the 328 column, 34 to the cards | heading left, 16px (my forsikring 240px rule applied), 18 to the cards (no wrapper slack in a `cols` section) | `hub-center h2` centre; the 240/16px sub-lead rule scoped to `band.hub-center` (forsikring), `cols.hub-center h2 + p` 17/24, wrapper padding-bottom 16 |
| Question-mark illustration (`lg-3-offset-0-first-w180`) | inline SVG, ~7 slack under the 180px image | none | `p:has(> picture)` padding-bottom 7 |
| Photo + caption (`lg-5-offset-0-first lg-4-middle`) | photo at its natural 1.6 aspect (328×205), 62 under the band edge, caption 14px on 24 strut 16 under the photo, 30 to the heading | 3:2 cover (219), 48, 16px caption flush to the photo, 16 | `aspect-ratio:auto; height:auto`, col padding 14/30, caption `margin-top:16; 14px/24px` |
| "Se også" icon cards (`cards small`) | a 3-line title grows the card (104 vs 88) | fixed 86px grid row | `grid-template-rows: minmax(86px, auto)` |
| News rail (`cards news hub`) | heading → card 17, card 371 (photo 205, tag 20 under it, date 10 above the border), band padding is the whole gap under the cards, prose 108 after | 24, 385 (photo 200, body 16/16), li 8 + block 24 + section 48 + 72 | h2 mb 16, media 205, body padding 11/2, li mb 0, block pb 0, `hub-news + .prose-450` margin-top 48 |
| Prose (`prose-450`) | 280px column ("Skal du starte utbetaling av din / pensjon?" wraps) | 320 | `> * { max-width: 280px }` |
| h2 wrapping | "Sjekk pensjonen din og / se hvor mye mer pensjon / du kan få ved å spare selv" — balanced (2nd page confirming it) | greedy | `main .section h2 { text-wrap: balance }` at ≤767 |
Residuals: −56 from the news band on (live blank `<p></p>` spacer, DA drops it — W4 #14 / W6 justified class); feedback question left-aligned on live at x21 vs centred (x30) — 9px, not chased; the calculator snapshot (mobile DOM captured by W6) matches to −2.

## sparing (published 13.44 % Δh 40 → emulation 2.61 % Δh 0)
| Module | Live 360 | EDS was | Fix (mobile-only) |
|---|---|---|---|
| Visual-nav text cards (`cards nav`, shared with lån) | content-sized cards (1-line text 114, 2-line 137) with 24 between them — lån pitches 139/162/162, sparing 162; the paragraph spans the whole 285px body (x37–313), the chevron sits on the title row; wraps avoid orphans ("…godt liv / som pensjonist") | fixed 114px card, body vertically centred, text column 261 (arrow column), 48 between text cards (W1's 114 + 48 matched only the 2-line pitch) | `.card--small { height:auto; align-items:flex-start }`, `li + li { margin-top:24 }`, body `1fr`, arrow absolute `top:0; right:-1px` (W1's body is `position:relative`), `text-wrap: pretty`. **Lån 360 improves: W1 2.09 % → 1.80 %, Δh 0** (`stardust/replica/gates/lan-w7-360/`) |
| Widget intro (`band prose-450 hub-widget`) | column ≈316 (line x24–336 fits), centred, paragraph → widget 42 | 280 (my pensjon value), left, +16 wrapper slack | `prose-450 > *` 316 (pensjon's 318px bold line still wraps), `hub-widget.prose-450 p` centred, wrapper padding-bottom 0 |
| News rail (`related gap-48 hub-flush`) | 48 under the frost band, heading → card 17, card 337 (2-line title) | flush (26), heading margin 8, card 322 (my pensjon "fix" — wrong: the live 371 run excluded the card's 14px bottom, the live card is 385 = W6's) | `related.hub-flush` margin-top 24, `related:has(.cards.news) h2` mb 16, news-card rule reverted to W6's |
| Feedback after the rail | card bottom → question 131 | 99 | `related + :has(> .feedback-wrapper)` padding-top 32 |
Residual: the savings-calculator snapshot (shadow root, W6 `data/calculator/sparing-360.html`) has 33px less between the results pill and the footnote than live (pill→note 43 vs 63+) and is 24px shorter in total; the rest of the page absorbs it (Δh 0). Out of scope (data file) → request. One hot band 4500–5000 (16.3 %): that footnote shift + the news photo cover crop.

## lofavor (published 12.91 % Δh 16 → in progress)
Findings (live rows; the white card boxes are invisible on tinted bands, the rounded top edge (h6) and bottom edge (h11) runs bracket them):
- h1 "Er du medlem i / et LO-forbund?" is balanced on live (EDS broke at the hyphen) → `main .section h1, h2 { text-wrap: balance }` at ≤767.
- `cols-8` nested photo pair: card = the 280px nested column (x40–319); EDS li padding 8 made it 264 → li side padding 0.
- Featured photo/text cards: live h3 20/24 (28 only on pensjon's `h2 > span.h3` illustration cards) → `.featured.hub.photo .card__title, .featured.hub .card--no-image .card__title` 24.
- Illustrated cards ("Flere medlemsfordeler"): live 310 = 2 + media 200 (8px padding, contain) + body 16 + [title 24 + 8 + text 48] + 16; EDS 326→332: title 28, text margin 16, and `height:100%` absorbing the card's own margin (boxed-card class) → title 24, text mt 8, `height:auto`.
- Plain text cards: live 110–112 content-sized; EDS 128 (stretched) → `height:auto`.
- Tabs (`accordion tabs hub`): live list x24–335, item 61 (18 + 24 + 18 + rule); EDS full-bleed, 53 → margin 0 8px, button padding 18.
- The live capture has no breadcrumb row at 360 while EDS renders "‹ Privat" (tips-og-rad's live does show it — not hidden by rule); no height impact, recorded as a content residual.

Corrections during the lofavor pass: the list offset was a margin collapse (the first `li`'s 16px collapses through the `ul` top — `li:first-child { margin-top: 32px }` instead of list padding); the live nested wrap padding is 16 at 360, not W6's 24 (heading 63 under the band edge, cards x40 = 16 + 16 + li 8) — `hub-nested > div` 16; the illustrated text gap is 4 (card 310); pills → band 72 = the live button-wrapper's 8 under the last pill (`cta-stack .button-list` padding-bottom 8).

## tips-og-rad (published 10.69 % Δh 8 → in progress)
- The six category boxes (`cards grid lg-4 boxed`, illustration + h3 + link list + secondary pill): live pill 68 (label "Flere tips og råd om …" wraps to 2 lines), EDS 44 with the label overflowing → `.cards.boxed .card__expand { height:auto }` (+24 × 6 = 144 of the 172). Nested wrap 16 (see lofavor) puts the box content at x56 like live.
- Illustration ink 212×115 on live vs 196×107 in EDS for the same 248px image: the rasterised PNG (W6 `rasterise-svg`) carries more canvas padding than the SVG viewBox — a raster artefact, ~5px per box, recorded.

## daglig-bruk / eiendom (published 9.48 % Δh −32 / 7.60 % Δh −8)
Both passed the pixel bar already on the emulation (7.18 % / 8.44 %) once the news-card fixes landed; their Δh +32 came from MY removal of W6's news-block bottom (rail padding 24 + li 8) — live keeps it on every page, so the pensjon/sparing compensations (prose margin 30, feedback padding 32) were wrong and are gone; the pensjon prose keeps `margin-top: 0` (94 = 8 + 24 + 48 + 16 − 2). Their hot bands (daglig-bruk 3000–3500 29 %, eiendom 2000–2500 19 %) are the news-card photo cover crops (live `.thumb.768`), geometry ±1px.

## Cross-page model notes (what the live 360 renders that the block skins did not)
1. Paragraph strut: 14px `subtle-text` spans keep the 24px line box of the enclosing 16/24 paragraph (hero note, box texts, FAQ note, Fremtind text, captions).
2. `text-wrap: balance` on h1/h2 (5 headings across forsikring/pensjon/lofavor wrap balanced), `text-wrap: pretty` on nav-card paragraphs.
3. Inline SVG illustrations (`inline-svg` img) leave ~6–7px descender slack under the image; photos (`image--all-rounded`) do not.
4. `height: 100%` on a card inside a grid `li` that also carries the card's 16px margin makes the card absorb its own margin (boxed, illustrated, plain, featured text cards) — content-sized on live.
5. Live 360 module gaps: 48 (not 72) for `hub-static` after a pill, `hub-title-lead` after the bank-choice; nested wrap 16 (not 24); news rail heading → card 17; pills full-width; expanders/pills grow with a wrapping label.

## Final emulation gates (:3017 vs cached 360 captures) — all seven under the bar
| page | before (published 360) | after (emulation 360) | Δh explanation | 1440 |
|---|---|---|---|---|
| forsikring | 29.83 % Δ−276 | **5.30 % Δ+4** | — | 8.37 % Δ−29 (W6 8.23, same bands; boxes 19px low is W6's) |
| pensjon | 22.33 % Δ−8 | **8.96 % Δ+61** | 56 = recorded live blank `<p>` spacer, 5 residual | untouched |
| sparing | 13.44 % Δ40 | **2.61 % Δ0** | — (calculator snapshot −24 absorbed) | untouched |
| lofavor | 12.91 % Δ16 | **8.38 % Δ+2** | — | untouched |
| tips-og-rad | 10.69 % Δ8 | **1.09 % Δ0** | — | 4.76 % Δ−7 (= W6) |
| daglig-bruk | 9.48 % Δ−32 | **4.10 % Δ0** | — | untouched |
| eiendom | 7.60 % Δ−8 | **5.12 % Δ0** | — | untouched |
| lån (archetype) | 0.41 % published / 2.09 % W1 emulation | **1.80 % Δ0** | — | not re-run (mobile-only rules; no boxed cards) |
Every band ≥ 15 % is a photo cover-crop band (live `.thumb.768` variants), the pensjon spacer shift, or the sparing calculator footnote shift — all recorded classes. Footer crops are measured by `_pm-pubgate.mjs` after the push.
Files: styles/styles.css (W7 mobile block), blocks/{cards,banner,accordion,columns}/*.css (W7 blocks); helpers `stardust/scripts/replica/_w7-{rows,drift,sbs,crop}.py`, `_w7-{inner,imgprobe,calc}.mjs`. No documents, encoder or data changed. Push request: `stardust/rollout/W7-PUSH-REQUEST`. Live hits: 0.
