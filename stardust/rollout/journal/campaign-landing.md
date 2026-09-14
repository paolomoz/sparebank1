# campaign-landing — EDS conversion journal (W5)

## 2026-09-14 — archetype `nb-bank-om-oss-hjemme-html` gated on the emulation (:3015)

**Decisions**
- New block `story` (blocks/story): the sb1-story media slides are a genuinely new repeating unit (900px full-bleed media with centred white
  cards) — not a carousel (all slides are visible, stacked). One row per slide: [media][text]. Media = a link to the .mp4 (its text is the live
  video title; autoplay/muted/loop/controls and the "Your browser does not support the video" fallback are block chrome) or one/two pictures
  (wide rendition + the mobile rendition the live page swaps in below 768 → `--bg-desktop` / `--bg-mobile`, `background-attachment: fixed` as on
  live — the stitched captures need the parallax mirrored). The authored pictures / video link stay in the DOM as the hidden editable source.
  Text = h1/h2 · paragraphs · CTA links; consecutive CTAs form the live button group.
- Everything else is default content with section skins: `story-text` (+ `center`, + `after-slides` for the 80/100px after a band), `story-image`
  (600px illustration, radius 30), `story-button`, `anchor-gap` (32px), and the live anchors as section-metadata `id` queued forward onto the
  following sections (a section carries one id: #blikunde → illustration, #samfunn → the heading after it).
- The live factbox is empty on every captured page: nothing authored; the section before it carries `factbox-slot` (its measured slot: 64+0+64 at
  ≥768, 40+56+40 below) so the archetype keeps its bottom rhythm while the story siblings (no factbox) do not inherit it. A factbox WITH content
  would fit `columns lg-7, lg-4-offset-1` (the live grid) — flagged as a gap by the encoder if it ever appears.
- The `<p><span class="h5">` lead is emitted as `<h5>` (site-wide ROLE SWAP class); its line boxes keep the paragraph strut (24/32).
- `Barn_som_turner_lys_bakgrunn.svg` is 44,336 B (> 40 KB, pure vector): added to svg-sizes.json, rasterised and uploaded to DA media
  (rasterise-svg.mjs; PNG staged in stardust/prototypes/assets/img for the emulation).

**Findings**
- Live slide 2 has a `p.ta-center` — no authoring equivalent; left-aligned like the other slides (residual, 2 lines).
- Three roster pages filed under news-article are sb1-story pages; their live `columns-noColor / columns-bgColor` components (figure + caption,
  `.h2/.h3` pseudo-heading text, button groups) and nested bio quotes were never modelled by the replica module (verbatim copies) → default content.
  They need a live lift + module before production; content is complete (0 gaps).

**Gate** 1440: pixel 0.90 % Δ0 · header 99.55 % · footer 100 %; 360: pixel 5.49 % Δ0 · header 99.69 % · footer 100 % (bands y5000–6000 = teater.mp4
frames, known permanent). Content-diff 1 🔴 ROLE SWAP (.h5, justified) + 2 🟠 (video title links); live ↔ EDS identical (1 live hit). Lint 0 🔴 1 🟡
(SVG, rasterised). Product: byte-identical, 0.65 %. Siblings (the 3 story pages): 0 gaps, 0 🔴; eyeball nerderiket @1440 coherent.
