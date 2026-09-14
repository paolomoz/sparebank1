# utility — EDS conversion journal (W2)

Archetype `nb-bank-privat-kundeservice-kontakt-html` → `content/nb/bank/privat/kundeservice/kontakt.html`. It "converted with 0 gaps" before
this round, but the render was wrong in five places — the log could not see them because the core `band()` fails silently.

## Decisions
- Data table = the Block Collection `table` block (new `blocks/table/`, D11), NOT a default-content `<table>`: the EDS pipeline turns every
  authored table into a block named after its first row, so a raw `<table>` in a DA document does not survive deploy as a table; the
  collection block IS the native data table. One block row per table row, first row = header (`no-header` variant available). Variant
  `contact` = the live kontakt geometry (65 % width, centred, 1px row rules, nowrap; the mobile orange scroll-indicator pill). The hidden
  live caption ("Finn din bank") is not authored (accessible-name only; the heading context names the table) — the one 🟡 of the gate.
- Family walker `serviceBand` (utility.mjs, family-gated for utility + tool): document order, `.table-block` → table block, `.richtext` →
  prose IN the same section (core nests a whole section → section-metadata inside a section), `cols-N` carried, `lead-all` (every paragraph
  is a live `.lead-blue`), `text-center` (every paragraph is `p.ta-center`), `media-plain` (fixed-ratio, non-rounded image → no radius, natural
  aspect), and `spacer-N` (N leading `<p>&nbsp;</p>` author spacers the pipeline drops → 40px each).
- `columns.js` additive fill: identical authored tokens (`lg-3, lg-3`) collapse in the DOM classList, so a three-column row rendered its third
  cell as `lg-12` (W1's hub blocks `lg-3-offset-1-first lg-3 lg-3` carry the same latent defect) — a short variant list repeats its last token.
- Section skins: `service` (h3 medium face; heading row → columns rhythm 24/40 + the `cols-9` first-paragraph 16px; centred heading row
  padded like a grid column), `table-band` (810px centred richtext, no core 16px wrapper padding), callout → cols 48/72.

## Gate
- 1440: 1.74 % (Δh −1), header 99.58 %, footer 98.07 %, content-diff 0 🔴 (🟡 "Finn din bank" caption), live↔EDS 0 🔴 (1 live hit).
- 360: 3.06 % (Δh −1; replica was 3.13 %), header 0.10 % excl. skip link, footer 98.91 % (`--y-b 2791`). Band 1000–1500 at 7.8 % = the
  table scroller glyphs (replica residual 9.6 %, same cause).
- Sibling `bestill-prisliste`: 0 gaps, 0 🔴. Its prototype is NOT a visual reference — the utility replica CSS never styled the title / lead /
  centred image modules (h1 and image rendered full-width, 1440px), so the pixel compare against it is meaningless (20 %); the EDS render follows
  the gated tool geometry (title, lead-intro, centred CTA, 600px illustration, rule) and the content-diff is clean. The live bank-chooser
  (`module--accordion-list-container`) is empty in the capture (client-rendered) → nothing authored, noted, no gap.
