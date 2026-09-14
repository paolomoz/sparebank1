# news-listing — EDS conversion journal (W5)

## 2026-09-14 — archetype `nb-bank-om-oss-nyheter-html` gated on the emulation (:3015)

**Decisions**
- Authored rows vs index-backed: the live listing is fed by `nyheter.export.json`. For the pilot the 31 settled cards are AUTHORED rows of ONE
  `cards listing` block (row = [picture][tag p · h2 link · d/m/yyyy p]); the first row is the featured headline (live: the newest feed item renders
  as `newscard__headline`). The page is deliverable without site configuration and the content is verbatim.
  Production wiring the customer must configure at tools.aem.live: a query index over `/nb/bank/om-oss/nyheter/**` exposing title, image, tag
  (the article eyebrow), date (d/m/yyyy) and path — the block keeps the same row shape, so an index-backed variant (`cards listing` reading a
  linked index JSON, `@ew-exempt` like calculator.js) replaces the rows without a content migration. The pager "Se flere artikler" is a secondary
  CTA linking to the live feed page (`?limit=31&offset=31`, fully-qualified — D4; a bounce beats a 404) until then; its arrow is block chrome.
- Two sections: `listing-title` (h1) and `listing` (the white card box from 768 — the section itself is the box; the pager wrapper sits inside it).
- `cards.js` additive: `listing` → tag eyebrow + d/m/yyyy date detection, first row `card--headline`; `cards.css` `listing` variant carries the
  lifted geometry (49 % / 32 % / 339px cards, 190px covers, 488px headline photo, 62/64 headline title).

**Findings**
- Live card crop focus (`top-crop` / `center-crop` / `bottom-crop`) is a per-card DAM setting with no authoring equivalent — centre crop.
- Content-diff counts the whole `ul.card-list` as one outermost editable element (🟡 EDITABLE COUNT 3 vs 32); the authored h2 links / tag / date
  paragraphs are moved into the card slots (EW1), not rebuilt.

**Gate** 1440: pixel 4.12 % Δ−1 · header 98.18 % · footer 98.36 %; 360: pixel 1.03 % Δ0 · header 99.69 % · footer 100 %. Content-diff 0 🔴 (🟡 dates /
editable count); live ↔ EDS 0 🔴 (1 live hit). Lint 0 🔴 0 🟡. Product: byte-identical, 0.65 %. No siblings.
