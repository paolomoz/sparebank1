# markedsnytt-listing — Markedsnytt hub (PRIVAT chrome, productpage main)

Archetype `nb-bank-privat-sparing-markedsnytt-html` → `stardust/prototypes/nb-bank-privat-sparing-markedsnytt-html-proposed.html`.

## What was built
- `modules/markedsnytt-listing.mjs`: `video` (16:9 `.video__wrap`: placeholder logo + iframe; only the iframe whose `src` was captured loads, the lazy ones keep `data-video-url`). A `related-topics` handler adding the newsfeed `.card__date` is in the file but **unreachable**: market-landing.mjs registers the same key and sorts after this file (registry = Object.assign in readdir order). Same for `image` (market-landing's handler emits `--w` + `image--center`; this family's CSS consumes that contract).
- `modules/theme.mjs` (family set `theme` + `markedsnytt-listing`): featured article cards (photo + h6 teaser + centred button, the `.button` sits beside the content wrapper), the reference block's white band/columns-grid, authored max-width / lead classes / inline styles in `.text`.
- `css/markedsnytt-listing.css`: 9/10/11-column rows, hero tucked 36px under the bank-choice band, first band flush after the hero, featured card (270/200 cover image, 16px body, space-between), 16:9 video box, `.text-wrapper` list margins (16/32 desktop, 0/16 mobile), `.h3` in h2, medium-face h3, mobile h4 28px/8px, centred images with `--w`, 250px 1:1 portraits, shortcut button (secondary look, single line, arrow hover), newsfeed rail flush after a band, full-bleed reference.

## Gate
| width | pixel | Δh | header crop | footer crop | content-diff | visual-diff | note |
|---|---|---|---|---|---|---|---|
| 1440 | 6.97 % | 24 | 99.58 % | 99.69 % | 0 🔴 / 3 🟡 (card dates) | 6 advisory cover crops | 4.30 % / Δ-3 with the 3 dates padded in |
| 360 | **12.59 % (FAIL)** | 28 | 96.42 % (99.90 % x≥115) | 98.97 % | 0 🔴 / 3 🟡 (card dates) | 3 advisory cover crops | 5.33 % / Δ1 with the dates padded in — the fail is the 27px shift below the newsfeed rail |

## Iterations (pixel rounds on the cached live PNG)
0. canon-only: 24.2 % / Δ131 (1440), 52.3 % / Δ1152 (360).
1. video handler + featured cards + grids: 16.1 % / Δ34 — body of the article card missed the button (sibling of the wrapper), rows 9/10/11 ok.
2. wrapper flattened, hero -36, ul margins, `.h3`, `.card__date` CSS: 13.6 % / Δ38 (date patch dead — collision found).
3. first band flush (`.main > .cols + .band`), flow-root card richtext, medium h3: 11.7 % / Δ-42.
4. newsfeed rail flush after a band, responsive list margins: 9.98 % / Δ30.
5. `--w` / 250px portraits, shortcut button, `.image` inline baseline: 9.07 % / Δ24; 360 15.3 %.
6. mobile h4 8px/28px, shortcut label nowrap: 360 14.6 % / Δ28.
7. video mirrored as captured (placeholder for the two lazy players): **6.97 % / Δ24 (1440), 12.59 % / Δ28 (360)**; padded diagnostics 4.30 % / 5.33 %.

## Hard blocker recorded
- `.card__date` ×3 (and the card chevron `<img>`) missing → 3 🟡 + 27px shift. Fix belongs to market-landing.mjs (add `'markedsnytt-listing'` to its `related-topics` gate) or canon `card()`; not editable from this family. See canon-requests.md.

## Residuals
- Second YouTube embed renders the player in the prototype (captured src) while the live capture shows the placeholder — 16–27 % in one 500px band per width.
- Live skip link in the header capture; canon topnav 2px; canon footer social icons.
