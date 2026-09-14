# om-oss — EDS conversion (W4) · archetype presse

Document `content/nb/bank/om-oss/presse.html` · encoder `stardust/scripts/eds/encoders/om-oss.mjs` · ledger `stardust/rollout/eds-progress/om-oss.json`.

## Gate
| width | pixel | Δh | header crop | footer crop | content-diff (proto ↔ EDS) | live content-diff |
|---|---|---|---|---|---|---|
| 1440 | 0.68 % (iter 3) | 0 | 98.51 % | 98.83 % | 0 unexplained 🔴 (4 ROLE SWAP = pseudo-heading spans, site-wide class) | same 4 + tabular-digit 🟠 (replica ledger) |
| 360 | 3.37 % (iter 2) | 0 | 96.42 % / 99.90 % x≥115 | 97.89 % / 98.42 % above the to-top disc | — | — |

The replica gate closed at 0.68 % / 1.74 %; EDS 1440 equals it, 360 carries +1.6 points from the hero band (skip link + the live 768px hero rendition and left-aligned lead — the gated replica renders exactly like EDS there, lifted `textAlign: center`; Δh 0).

## Decisions
- **Hero → `carousel campaign reverse white lead`, one slide.** Same live component (`.campaign`) as the market-landing hero, so the same block (D9); `white` (untinted) and `lead` (h1 + lead paragraph) are additive variants. A `hero` block would have been a second block for one live component.
- **`adviser-list` — new block** (brief: "an adviser list" is a legitimate new repeating unit). One row per contact `[portrait][bold name, role, phone, e-post link]`; the block reads the first paragraph as the name (a heading would have added five headings to the outline the live page does not have). Two live module instances → two blocks (3 + 2 contacts; merging would reflow 25 % cells to 4 + 1).
- **Band walker.** The core `band()` emits 12-column rows and dispatches band children on the CORE map only; om-oss needs `cols-9/10/11`, the `w200` illustration cell, `lead-2`, `subtle`, `baseline`, `button-gap`, `media-plain`, and the adviser lists inside the frost band. Written as `omBand` (document-order walk, like W1's hub walker).
- **Loader collision (eds-requests W1 #0).** `utility.mjs`/`tool.mjs` load after `om-oss.mjs` and win `band`/`cols`/`richtext`/`module`/`title` for every page (they delegate to `CORE.*` outside their family). Rather than a private converter, the om-oss overrides are installed as **family-gated wrappers on the core map** (`gateCore`): the official `convert.mjs` keeps working for these pages, and every other family — the product page included — reaches the original untouched (boliglan document byte-identical; pixel 0.65 %).
- **Rhythm findings** (all lifted/measured with `_w4-rects.mjs`, not by eye): the live `.subtle-text` line keeps the paragraph's 24 px strut (p = 48 px for two 14 px lines); inline `<picture>` on the text baseline adds the 7 px tail under illustrations (replica inconsistency register) → `baseline`; live desktop `button-list` items keep `margin-bottom: 8px` → `button-gap`; the utility `cols-9` token carries a 16 px first-child quirk foreign to om-oss → `flush`.

## Findings
- `carousel.js` had been **rewritten non-additively** (W3's guide carousel, 22:07) — W1's `campaign` decorate was gone, the presse and market-landing heroes rendered as guide slides. Restored as a variant branch (`campaign` → old flow; default → guide flow, untouched). Filed.
- Sibling chrome: chrome-map lists archetypes only → om-oss siblings fell back to `/nav` + `/footer` (privat). Additive `market=om-oss` fallback in header.js/footer.js (mirrors the bedrift fallback). The live jobb-og-karriere footer additionally carries the "Kontakt oss" contact block, which `/footer-om-oss` (presse) lacks — needs a per-page footer document (filed).
- `rasterName` keeps a literal `%20` in the PNG name (`Innovasjons%20workshop…png`), so the DA media URL and the uploaded object disagree, and serve.mjs (which decodes) cannot find the local copy. Mirrored under the decoded name for the emulation; filed.

## Siblings (7, prototypes generated with author.mjs)
All 0 gaps, lint 0 🔴. `title` (AEM page title), `table-block` (selskapsinformasjon → `table full`) and the investor `module--tabs-component` (client-rendered tabs; the capture holds the panel richtext → default content, D1) are handled through the family-gated `module` fallback because `tool.mjs` wins `title` and returns null outside its family. Top-level richtext on om-oss pages is the 620 px left-aligned text column (`narrow, gap-48`), not the centred product "Sammenlign priser" block. Eyeball: jobb-og-karriere @1440 — layout matches the prototype; residuals = footer contact block + PNG name (above).

## Open questions
- Should `/footer-om-oss` variants be generated per sibling from the sidecar (footer contact block present/absent)? Worker C / orchestrator.
- `carousel` ownership: three families now share the block (W1 campaign, W3 guide, W4 campaign variants) — lock the dispatch or split `guide` into its own block?
