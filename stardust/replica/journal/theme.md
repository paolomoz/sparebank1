# theme — borettslag-sameie archetype (BEDRIFT chrome)

Archetype `nb-bank-bedrift-bedriftsforsikring-bransjer-borettslag-sameie-html` → `stardust/prototypes/…-borettslag-sameie-html-proposed.html`.

## What was built
- `modules/theme.mjs` (all handlers fall back to canon for other families): `card` (featured card = contain-fit illustration + full richtext body with the checked list; newsfeed cards get their `.card__date`), `referance` (the sand columns-grid with text + button-list + image that canon drops), `text` (authored text-wrapper max-width → `richtext--max`, re-tags `main-lead` / `sub-lead-left` / `lead` spans, mirrors authored inline font-family / font-size / colour).
- `css/theme.css`: title + lead geometry (900px lead, 620px default text-wrapper, centred h1 16/24 margins), band spacing after the lead, featured card (270/200px contain image, 16px body, space-between), checked list with the live ✓ data-URL bullet, the `ffe-message-box--tips` callout (sol #dc8000 icon ring, sand box, tertiary-styled action button), full-bleed reference bands with 11-column rows, 250px inline icon image, bedrift footer contact spacing.

## Gate
| width | pixel | Δh | header crop | footer crop | content-diff | visual-diff | live iterations |
|---|---|---|---|---|---|---|---|
| 1440 | 1.51 % | 0 | 99.58 % | 99.71 % | 0 🔴 / 1 🟠 (tahoma link, fixed after) | 2 advisory cover crops | 1 |
| 360 | 4.17 % | 1 | 96.42 % (99.90 % x≥115) | 99.35 % | none | 3 advisory cover crops | 1 |

## Iterations (pixel rounds on the cached live PNG)
0. canon-only: 26.9 % / Δ703 (1440), 35.8 % / Δ2277 (360) — featured cards empty, reference grids dropped, tip unstyled.
1. handlers + CSS: 20.2 % / Δ198 — remaining: title/lead margins, band gap, tip 24px, reference constrained to 1240px, svg image 0px.
2. flow-root richtext + first-p margin, 72px band gap, tip icon offset, full-bleed reference: 11.0 % / Δ-24.
3. lead max-width specificity, tip icon `top:16px`: 2.78 % / Δ24 (footer contact block).
4. bedrift footer contact +24, sub-lead 17/24 mobile: 2.61 % / Δ-1; 360 still Δ57 (proto tahoma vs live site font in lead spans).
5. site font on lead/subtle spans and links inside tahoma paragraphs, contact +8 mobile: **1.51 % / Δ0 (1440), 4.17 % / Δ1 (360)**.

## Canon findings (appended to canon-requests.md)
- `referance` drops columns-grids; `card()` ignores featured cards and `.card__date`; `title` has no geometry; `.main > .text` lead classes dropped by KEEP_CLASS; `.main > .band` after a lead needs 72/48; `.main > .image` 72/48 margin; `.reference` should not be width-constrained when it wraps a band; h4 mobile line-height 28.
- Registry collision: `related-topics` is owned by market-landing.mjs (sorts after markedsnytt-listing.mjs) — see markedsnytt journal.

## Residuals
- Skip link in the live header capture (x<115); canon topnav 2px line-height; canon footer social icon sizes.
- Card photo bands (JPEG rescale + the fixed to-top button caught in the prototype stitch) ~15 % in two 500px bands, no layout delta.
