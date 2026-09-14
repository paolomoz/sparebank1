# Product siblings — W3 journal (2026-09-14)

Scope: the 29 siblings of the product archetype (boliglan untouched). 12 converted gap-free before; the rest carried module kinds the archetype
does not have. Both sides were built: replica handlers (`stardust/scripts/replica/modules/product.mjs`, CSS in the delimited block of
`stardust/prototypes/css/product.css`, `stardust/prototypes/js/product.js`) and EDS encoders/blocks (`stardust/scripts/eds/encoders/product.mjs`,
`blocks/carousel`, `blocks/price-terms`, additive variants on accordion/cards/columns/callout, `styles/styles.css` product-siblings block).

## What the live modules are, and how they were modelled
- **price-and-terms** (10 pages): centred 768px module — h2, optional price figure (before/number/after spans, h1 face), ✓ check list, an
  `overlay-btn` link that opens a client-rendered bank-chooser dialog, small footnote. Replica `section.price-terms` (static; the dialog is
  empty in the settled DOM and stays a dynamics item). EDS: new `price-terms` block (template-slotted like banner: one row [title + figure][list,
  link, footnote]) — chosen over `columns` because the module must render identically nested inside a band (no section style available) and
  inside a columns column (bankkort/kredittkort: a cell cannot hold a block → the block follows the columns block).
- **progressive-disclosure** (6 pages + nested): expand pill + collapsed content box → `accordion disclosure` (additive variant, one row).
- **step-by-step** (utenlandsbetaling): sand band, numbered master list + detail panel → h2 + `accordion steps` (additive variant).
- **accordion** (generic AEM accordion): h3 + sub-lead + plain `accordion` block, section `accordion-module`.
- **guide-carousel** (mobilbank; bankkort inside a FAQ answer): 5-slide tabpanel carousel → new `carousel` block (collection pattern:
  [screenshot][title + copy][slide name]); the FAQ-nested one is prose.
- **contentfragmentlist** (vare-eksperter): bio cards → `cards people` (additive CSS only; card-as-link via the trailing link).
- **section** (forbrukslan, mobilbank, barneforsikring — found on the way, 500–570px of dropped content): the AEM master/detail "section"
  module. author.mjs ignores `section` as a wrapper class, so the replica registers the handler under the EMPTY key (documented hack, canon
  request filed). EDS: default content [illustration, h2, sub-lead] + `accordion tabs`, section `section-list` (grid skin, full-bleed tint).
- **comparison** (bilforsikring, inside a FAQ answer): 2 coverage tables, 29 expandable rows → replica verbatim table + mobile filter tabs; EDS
  prose per feature (a table cannot nest in an accordion row) — every text/href kept.
- **image--center / button-wrap--center** (top-level): default content in `icon-image` / `cta, center` sections (tokens `w-N`, `h-N`, `rounded`).
- **module--columns** (spare-i-fond): an empty `<div class="columns">` on live — omitted.
- **base-component** (forbrukslan): the consumer-credit calculator, empty at capture. Re-captured hydrated (`_w3-snap-widget.mjs`, 1 live hit):
  shadow-root snapshot + its stylesheet + the ffe tokens as `:host` → replica `calculator__host`, EDS `calculator` block via
  `data/calculator/privat-lan-forbrukslan.html`.
- Also fixed on the way (siblings never gated before): hub-style `related-products` and `shortcuts` markup (category-hub replica handlers fire on
  every family; the core EDS readers dropped their cards/pills silently), `tips` message boxes (lightbulb; matched on the live Material path),
  static-cards, the video module (poster), SVG illustration cells (`--h`, `w1280`, `rAxB` tokens), cols-N heading widths, hero overlap and
  banner gaps, the `${linksbm.*}` link placeholder (leasing, lint 🔴 → bounced to the source page).

## Registry collisions (the biggest time sink)
Both loaders merge family files alphabetically and the last file wins a key: utility.mjs owns band/cols/tip, tool.mjs owns image/button-wrap/
title/module, theme.mjs owns text/reference/intro, market-landing owns image (replica). My overrides are therefore installed as family-gated
wrappers ON the core encoder object (band, cols, faq, tip, module, reference, calculator, related-products, banner-small, richtext, shortcuts)
and the new keys are added to the core map so core `band()` can resolve nested modules. Every wrapper is a no-op off the product siblings
(boliglan converts byte-identically — isolation diff run 3×). Replica: `image` wraps market-landing's handler; `text` is dead (theme.mjs wins),
so the page lead is styled structurally (`.title + .richtext > p > span`). Filed in eds-requests / canon-requests.

## Gates (3 local iterations; numbers in the two progress JSONs)
- Prototype: forbrukslan 1440 3.94% Δ-5 PASS · mobilbank 1440 8.50% Δ-4 PASS (photo bands) · vare-eksperter 1440 1.71% Δ+1 PASS, 360 7.60% Δ-6 PASS ·
  forbrukslan 360 15.47% Δ+30 FAIL · mobilbank 360 11.72% Δ+5 FAIL.
- EDS: forbrukslan 1440 3.98% Δ-4 PASS · mobilbank 1440 10.33% Δ8 (marginal; photo bands) · forbrukslan 360 14.84% Δ-7 · mobilbank 360 13.29% Δ-71 ·
  vare-eksperter blocked by chrome (slug missing from chrome-map → privat nav/footer) and the W2 `title` module (main-only 13.5%).
- Regression: boliglan document unchanged; 1440 pixel 0.65% Δ0 (bar 0.7).
- Content-diff prototype↔EDS: only ROLE SWAP structural reds (justified class) on the 3 gated pages; bilforsikring's 5 MISSING CTA are inside the
  flattened comparison prose (hrefs present in the document).
- 26/29 siblings gap-free, lint 🔴 0 (🟡 121: the usual widget/positional notes + SVG advisories). The 3 gaps are `title` (W2).

## Open questions / decisions for the orchestrator
1. Blocks inside FAQ answers (comparison table, carousel, columns) — accept prose, or lift out of the accordion?
2. price-and-terms / disclosure inside a columns column — sibling blocks (current) vs a columns variant that references a block.
3. Loader chaining for family encoders/handlers (both sides).
4. chrome-map entry for vare-eksperter (om-oss chrome); `title` encoder (W2) — both needed before its EDS gate can pass.
5. The 360 columns-block cell metrics (mobile line boxes, list bullets) — core tuning that the archetype never exercised.
