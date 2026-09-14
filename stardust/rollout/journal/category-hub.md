# W1 journal — category-hub (lan, 20 pages) · 2026-09-14

## Result
- Archetype `nb-bank-privat-lan-html` → `content/nb/bank/privat/lan.html`, 0 gaps, lint 0 🔴.
- Gate 1440: pixel **0.53 %**, Δh 0, header 99.58 %, footer 98.81 %; content-diff proto↔EDS 1 🔴 (justified), live↔EDS 1 🔴 (same).
- Gate 360: pixel **2.09 %**, Δh 0, header 3.58 % (skip link; 0.10 % excl. x<115), footer 98.60 %.
- Product regression: `boliglan.html` byte-identical with the W1 family files loaded vs core-only (proved after every change).
- Siblings: 19/19 authored + converted, **0 gaps each**, lint 0 🔴 (private-banking: two live placeholder hrefs → `#`, noted).

## Decisions
1. **Visual-nav = one `cards nav` block.** Eight consecutive `.vnav` modules (4 photo, 4 icon) fold into one block, one row per card;
   the row's media (photo vs `/ikoner/` svg) decides the card shape. cards.js got an additive `nav`/`small` branch that keeps the icon
   as a left column beside a *visible* title (the existing small-icon path hides the title — the LO-card pattern).
2. **Shortcuts** = heading as default content + one cell holding a plain `<ul>` of links (D5); the block paints the pills + chevrons.
   The core `shortcuts` encoder selects `.shortcuts__link`, which the prototype does not have (empty list) — overridden, request W1-8.
3. **Cobranding** = own block (in the locked set): single-cell rows read by position — [heading + toggle label] [logo + title]
   [panel column]×N; the toggle label moves into the expand button (EW8); the panel is closed at rest (dynamics #14).
4. **Tip → `callout tip`** (core encoder kept; icon `icons/info.svg`; note records the D1 justification).
5. **Hub band walker** (`hubBand`): document order, `cards small` for the related icon list (core relatedTopics reads only
   `.newsfeed .card` → 0 rows), `hub-related`/`hub-head`/`hub-rule` section tokens for the live spacer/rule geometry, consecutive card
   grids folded into one block (D9). Core keys are overridden family-gated only (`isHub`/`usesWalker` → else `CORE.*`).
6. **Rhythm tokens**: `gap-48` on top-level hub band/cols/banner (live 48/72), `hub-banner` (165 px inner ≥768), `hub-shortcuts`
   (20 px under the h2 <768), `intro`+`lead` for the h1/lead.
7. Rasterised `dame-gar-smiler.svg` (>40 KB) with the orchestrator's `rasterise-svg.mjs`; staged PNGs in
   `stardust/prototypes/assets/img/` because serve.mjs only reads that dir (request W1-7).
8. Standalone sibling modules (`title`, `button-wrap`, `button-list`, `image--center`, `module--*` unknowns) → default content
   (`hub-cta` token; the standalone illustration → one-cell `columns lg-12-wN`, noted as lint D1).

## Findings / requests (all in stardust/rollout/eds-requests.md)
- **W1-0 BLOCKING**: convert.mjs merges family files alphabetically — `utility.mjs`/`tool.mjs` (loaded later) override my
  `band`/`cols`/`richtext`/`tip` for every page → lan/ks/privat regress under the official converter. Documents are produced with
  `stardust/scripts/eds/_w1-convert.mjs` (same file + W1 files re-applied last) until convert.mjs dispatches per family.
- W1-1 core band() nesting/hoisting; W1-2 related `.card-list`; W1-3 syrin tint; W1-4 `/content/sites/sb1` hrefs; W1-5 headingTag
  trailing `<br>`; W1-10 columns col--media detection; W1-11 replica image widths; W1-12 raster 2× dims.

## Residuals (recorded, not chased)
- to-top disc at chunk seams; 360 visual-nav photo cover-crop (live serves .thumb.768); skip link.
- `reference` section carries `rule-visible` twice (core pendingStyle) — harmless.

## Helpers (worker-prefixed)
`stardust/scripts/eds/_w1-convert.mjs`, `stardust/scripts/replica/_w1-rects.mjs`, `stardust/scripts/replica/_w1-crop-x.mjs`.
