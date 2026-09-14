# theme — EDS conversion (W4) · archetype borettslag-sameie (bedrift chrome)

Document `content/nb/bank/bedrift/bedriftsforsikring/bransjer/borettslag-sameie.html` · encoder `stardust/scripts/eds/encoders/theme.mjs` (+ the om-oss walker) · ledger `stardust/rollout/eds-progress/theme.json`.

## Gate
| width | pixel | Δh | header crop | footer crop (Δh-aligned) | content-diff proto ↔ EDS | live ↔ EDS |
|---|---|---|---|---|---|---|
| 1440 | 3.66 % (iter 4) | 5 | 99.58 % | 98.78 % | 0 🔴 | 0 🔴 |
| 360 | 3.79 % (iter 3) | 1 | 96.42 % / 99.90 % x≥115 | 98.97 % | — | — |

Replica closed at 1.51 % / 4.17 %. The 1440 hot band (3500–4000, 17 %) is the same card-photo band the replica carried at 15 %.

## Decisions
- **Featured card = `cards grid lg-6 featured`**, one row per card `[illustration][richtext body]`. The live `span.h5` list titles are authored `<strong><a>` (what an author would type); the body keeps h2 + lead paragraphs + the checked list. Not clickable on live → cards.js `featured` leaves the authored links as the only links (and never treats the SVG as an icon). The `checked-list` wrapper class is lost in EDS; the block styles every list of a featured card as a checked list (the only list shape the live card has).
- **Reference blocks with a columns-grid** (live `section.reference > .cols`) are the grid's `columns` in a `cols` section — the small-print `reference` skin (product) does not apply. Shared with markedsnytt (family set). The hr modules before them drive two different gaps on live: plain `hr.rule` 48 | 64, `rule--extra-top` 64 | 72 (mobile | ≥1024) → `theme-ref.rule` / `theme-ref.rule-72` (convert.mjs already carries `rule` for extra-top).
- **Sand "tips" box → `callout tip warm small`**: additive `warm` = sand body + orange ring + lightbulb glyph (`icons/tips.svg` from the live path); callout.js picks the glyph by the variant (one conditional, existing flow untouched).
- **Photo ratios**: the live `--ratio` is arbitrary (1211/903, 1500/842, 503/800…); the walker snaps to the nearest of 4:3 · 16:9 · 2:1 · 1:1 · 5:8 · 3:4 (`media-W-H`, 3:2 default) — ≤3 px at column width.
- **`height: 100%` cards grow by their own 16 px margin** inside a grid cell (W1 saw it on cols-8) → `featured` and the theme card grids (`flat`) use `height: auto`.
- **Title**: W2's `title` skin (full-width centred h1) instead of the hub `intro` skin (800 px wrapper wrapped this h1 to two lines).

## Findings
- `theme.reference` fell into the gate it installs (fallback to `CORE.reference` = itself): stack overflow on bedriftsforsikring. Fixed by capturing the original before gating — a gateCore user must never call `CORE[key]` from inside its handler.
- The boliglan document changed under me at 22:32 through `lib.mjs inline()` (`<br>` moved out of `<b>`); converting with the three W4 encoder files removed reproduces the new document byte-for-byte, so the W4 encoders have zero effect on the product page (pixel 0.65 %).
- Mobile: live `1em` lead margins are 17 px (17 px face) vs 18 px on desktop; a section already carries the 20 px gutter, so a `> div { padding: 0 20px }` skin doubles it below 768.

## Siblings (3)
bedriftsforsikring (top-level `button-list` → `cta` section; banner-small, faq, plain reference → core), netthandel-kredittkort (six cols bands; eyeballed @1440 — matches, see ledger residuals), hvilke-forsikringer-trenger-man (syrin band, static-cards, related-topics). All 0 gaps, lint 0 🔴.

## Open questions
- `cards static` needs lifted values (no canon rules; the prototype renders image + title rows without borders) — whose variant is it (hub/category-hub emits `static-cards` too)?
- The theme prototype ignores authored `--w` outside market-landing.css; the EDS follows the authored width. Which is live? (no sibling capture)
