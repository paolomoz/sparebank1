# W1 journal — market-landing (privat, 3 pages) · 2026-09-14

## Result
- Archetype `nb-bank-privat-html` → `content/nb/bank/privat.html`, 0 gaps, lint 0 🔴.
- Gate 1440: pixel **5.56 %** (43.3 % in the hero band = the campaign-rotation residual, identical to the replica gate; every other
  band ≤ 1.6 %), Δh 0, header 99.58 %, footer 98.81 %; content-diff proto↔EDS 2 🔴 / live↔EDS 2 🔴 (pseudo-heading ranks).
- Gate 360: pixel **8.32 %** (hero 44.4 % residual; banner band 14.1 % vs replica 10.9 %), Δh 0, header skip-link artefact
  (0.10 % excl.), **footer crop 4.28 % — open**: every measured rect equals live/prototype to the pixel; the diff is a uniform ~1 px
  double-strike of all text/icons below the hero; scrollWidth 364 (news-rail −20 px margins) is identical on the gated prototype.
  Not reproduced on lan-360 (1.40 %). Recorded for the orchestrator (final evidence: pixel-iter5.txt / chrome-footer.txt).
- Siblings: bedrift + om-oss authored, converted, 0 gaps, lint 0 🔴. bedrift eyeball @1440 vs prototype: 2 🔴 = the `<br>`-split
  hero heading text and a CTA inside the replica-unknown `product-nav` module (authored as default content, noted).

## Decisions
1. **Campaign hero = `carousel campaign`** (Block Collection shape; one row per slide [image][heading, lead, text, CTA]; `reverse`,
   tint variants; controls only when >1 slide). W3 also created `blocks/carousel` (guide carousel) — merged by W3 into one block with
   variant dispatch; my campaign code/CSS is intact under a marker. Section token `full` (no gutter, no max-width).
2. **Two-tone banner = `banner columns color2 color4`**: one row per half, colour tokens in row order (the columns lg-* precedent);
   banner.js additive branch; live 600 px inner boxes, first half right-aligned.
3. **Link-list bands** = `columns link-list cols-10 lg-3-offset-1-first-w70 …`: `wN` carries each illustration's authored max-width
   (`--w` from the prototype), `link-list` stops the CTA grouping and types the 22/44 heading line; the `col--media` mis-detection on
   mixed cells (W1-10) is guarded with `:not(.link-list)`.
4. **News rail dates**: the date is the paragraph after the title; `cards news` marks a Norwegian-date-shaped paragraph as
   `.card__date` (same text-shape rule family as the existing uppercase tag detection). `market-news` token: fixed 1248 px track,
   4 px seam before card 3 (live).
5. **Mobile market strip** ("Privat · Gå til bedrift") is header chrome: header.js derives it from the /nav market list on
   `template=market-landing` for privat/bedrift (om-oss has none on live); the header block keeps 60 + 52 px so the fixed wrap on
   scroll does not collapse it (this collapse caused a −57 px drift in every chunk before the fix).
6. Hidden page h1 → default content in a `visually-hidden` section; send-to-bank shells and the empty second campaign → nothing
   authored (noted). "Sammenlign priser" → `market-compare` (h2 at h2 size in the medium face, 14 px line), `narrow, center, gap-48`.
7. `/content/sites/sb1/…` hrefs normalised before the roster check (W1-4).

## Requests
W1-0 (loader — BLOCKING), W1-4, W1-10, W1-12; carousel merge documented by W3 (eds-requests W4).
