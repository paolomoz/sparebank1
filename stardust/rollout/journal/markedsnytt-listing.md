# markedsnytt-listing — EDS conversion (W4) · archetype markedsnytt (privat chrome)

Document `content/nb/bank/privat/sparing/markedsnytt.html` · encoder `stardust/scripts/eds/encoders/markedsnytt-listing.mjs` (+ om-oss walker, theme reference) · ledger `stardust/rollout/eds-progress/markedsnytt-listing.json`.

## Gate
| width | pixel (raw) | pixel excl. 3 video boxes | Δh | header crop | footer crop (Δh-aligned) | content-diff |
|---|---|---|---|---|---|---|
| 1440 | 7.29 % | 3.86 % | 1 | 99.58 % | 98.75 % | 8 🔴, all the pseudo-heading-span class |
| 360 | 11.16 % | 7.09 % | 4 | 96.42 % / 99.90 % x≥115 | 98.56 % | — |

The raw 360 figure is over the 10 % bar by the three YouTube boxes alone (live: lazy placeholder logo; EDS: player) — the brief's listed permanent residual; masked on both sides with `_w4-mask.mjs` it reads 7.09 %. The replica gate itself passed with the same placeholder/player residual.

## Decisions
- **Videos are default content, not block cells.** The first model (YouTube link in a `columns` cell) failed lint D1 (🔴 "embed/video URL authored inside a block"). Final model: each live text + video row is default content — the embed link first (= live mobile order), the text second — auto-blocked by a new `scripts.js buildEmbedAutoBlocks` into a new Block Collection `embed` block; a `split-video` section style lays the pairs on the live 11-column grid (`grid-auto-flow: row dense`, text cols 2–6, embed 7–11, rows centred). The band heading is a separate `head` section (no bottom padding) so the pipeline's default-content merging does not pull it into the first text cell.
- **Featured article cards → `cards grid lg-3 featured photo cols-9`** (the theme `featured` variant + `photo`: cover photo, h6 teaser, centred button). `cols-9` gives the 3-up 960 px grid (`lg-3` alone is 4-up).
- **Live in-page anchors** (`hr#artikler`, `hr#kommentarer`, …) become the section `id` (section-metadata `id` row — the pipeline sets it on the section).
- **Kicker + title h3 pair** ("Markedsutsikter med Anders Borg:" / "Hvordan bør investorer…"): live line boxes 42|54 and 64|48 (1440|360) — expressed on the `h3:has(+ h3)` / `h3 + h3` pair inside `split-video`, measured, not guessed.
- Markedsnytt's live CSS has no `.richtext--max` rule → the walker's `text-N` cell model is opted out for this family (theme keeps it).

## Findings
- The `subtle` token (presse: `.subtle-text` paragraph) fired on the expert h4's inline `.subtle-text` span and shrank the text column's last paragraph to 14 px (7 vs 6 lines) — now paragraph-only. Found with a computed-style probe (`_w4-textwrap.mjs`), not by eye.
- `main .section.mn ul li` leaked 32 px of left margin into the card grid's `ul.card-list li` — list rules must be scoped to default content / columns.
- `decorateButtons` (this repo) buttonises only `strong`/`em` links — plain lone links stay links (the reference "Se avtaler…" renders as a 24 px link like live).
- The 22:54 `lib.mjs` change (trailing `<br>` inside inline formatting dropped — pipeline-faithful) removed the blank `<br>&nbsp;` line under two theme featured-card paragraphs → borettslag Δh 5 → 33 after its gate. Filed (#14); not chased — an author cannot express a blank line in the pipeline.

## Siblings
None (`types.markedsnytt-listing.pages` = the archetype only).
