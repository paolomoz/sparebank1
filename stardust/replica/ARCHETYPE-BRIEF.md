# Archetype recreation brief (replica Phase 3 + 4) — one archetype family per worker

You are recreating ONE archetype family of www.sparebank1.no as a clean prototype and gating it against the
live page. The product archetype (boliglan) is the gated reference: read
`stardust/prototypes/css/canon.css`, `css/product.css`, `js/canon.js`, `stardust/scripts/replica/author.mjs`,
`stardust/replica/progress.json` before starting. Everything below is mandatory.

## Inputs
- Archetype slug + live URL: from `stardust/current/_page-types.json` (`types.<family>.archetype`) and `stardust/state.json`.
- Content source (verbatim): `stardust/current/pages/<slug>.html` (settled DOM) + `<slug>.json`. Never reword copy,
  never drop CTAs/hrefs/alt, copy live SVGs verbatim (`ctx.svgOf`), lazy images → `data-lazy-src`.
- Outline the DOM: `python3 stardust/scripts/replica/outline.py <sidecar.html> <rootSelector> <depth> <maxLines>`.
- Lift values from the live CSS/computed styles, never the eye:
  `node stardust/scripts/replica/lift-styles.mjs <liveUrl> --width 1440 --sel "<sel,sel,…>" --out stardust/replica/lift/<slug>-1440-detail.json`
  and the same at `--width 360` (mobile is its own authoring pass). Authored rules: grep
  `stardust/current/assets/css/clientlib_base.1156912316.css`. FFE tokens: `stardust/current/_ffe-tokens.json`.

## Authoring
- Add module handlers ONLY in `stardust/scripts/replica/modules/<family>.mjs` (see modules/README.md); add CSS ONLY in
  `stardust/prototypes/css/<family>.css` (auto-linked) and behaviour ONLY in `stardust/prototypes/js/<family>.js` (auto-linked).
  Do NOT edit author.mjs, canon.css, canon.js, product.css or another family's files. If the shared chrome (header,
  bank-choice, footer, contact) is wrong on your page (header variants: bedrift / om-oss / frontend clientlib),
  implement the variant in your module file (`__header` / `__footer` override for the frontend variant; for
  classic variants use a body/main class + rules in your family CSS) and append the finding to
  `stardust/replica/canon-requests.md`.
- Generate: `node stardust/scripts/replica/author.mjs <slug>` → `stardust/prototypes/<slug>-proposed.html`.
  The prototypes dir is served at `http://localhost:8812/` (python http.server already running; verify with curl;
  if it is down: `cd stardust/prototypes && python3 -m http.server 8812 &`).
- Client-rendered widgets (calculators, carousels): static snapshot of the settled DOM (capture the hydrated DOM /
  shadow root with a Playwright probe like the calculator in author.mjs), CSS portation scoped to the widget only.

## Gate (per breakpoint: 1440 then 360; live PNG captured ONCE and reused)
```
LIVE=<liveUrl>; PROTO=http://localhost:8812/<slug>-proposed.html; G=stardust/replica/gates/<short>-1440
node stardust/scripts/replica/stitch-shot.mjs "$LIVE"  $G/live.png  --width 1440 --settle --consent 'button:has-text("Godta alle")'
node stardust/scripts/replica/stitch-shot.mjs "$PROTO" $G/proto.png --width 1440 --settle
node stardust/scripts/replica/pixel-compare.mjs $G/live.png $G/proto.png --out $G/diff-iterN.png --threshold 10
node stardust/scripts/diff/content-diff.mjs "$LIVE" "$PROTO" --profile generic --width 1440 --main main --dismiss --consent 'button:has-text("Godta alle")'
node stardust/scripts/diff/visual-diff.mjs  "$LIVE" "$PROTO" --profile generic --width 1440 --main main --dismiss --consent 'button:has-text("Godta alle")' --out $G/vdiff
node stardust/scripts/replica/chrome-parity.mjs "$LIVE" "$PROTO" --width 1440 --region header=header --region footer=footer --consent 'button:has-text("Godta alle")' --json $G/chrome-parity.json
node stardust/scripts/replica/crop-compare.mjs $G/live.png $G/proto.png --y 0 --height <headerH> --out $G/chrome-header-diff.png
node stardust/scripts/replica/crop-compare.mjs $G/live.png $G/proto.png --y <liveFooterY> --y-b <protoFooterY> --height <footerH> --out $G/chrome-footer-diff.png
```
- Pass bar: content-diff 0 unexplained structural 🔴 (the 2 known justified ones: runtime `lenker.sparebank1.no` href
  rewrite; `SpareBank1-italic` fork); visual flags none/justified; pixel ≤ 10 % with every band ≥ 15 % explained;
  |Δheight| ≤ 8 px; header & footer crops ≥ 98 % (the live focused skip link "Til hovedmeny" at top-left is a known
  instrument artefact — measure the header excluding x<115 too and record it).
- Fast inner loop (free, no live hits): probe element rects on the prototype with a Playwright script and compare
  against the lifted live rects; fix the FIRST mismatching section top-down; re-stitch the prototype only.
- Hit minimisation: ≤ 3 live gate iterations per breakpoint (content/visual diffs at milestones only); pixel rounds
  on the cached live PNG are free. Space live probes ≥ 20 s apart. Hard cap on iterations: after 3 live gate
  iterations log residuals and stop.
- Known live quirks to mirror: card photos are `object-fit: cover; object-position: 50% 0`; `hr.show-hr` = 1px #ccc
  with 64px top margin; top-level `.text` / `.faq` / `.related-topics` / `.referance` have margin-top 72 (≥1024) /
  48 (mobile); hidden accordion items use `style="display:none"`; `.header__wrap` gets `scroll`/`show` on mobile.

## Interaction parity (REQUIRED, observed only)
`node stardust/scripts/replica/motion-observe.mjs "$LIVE" stardust/replica/motion/<short>-1440.json --width 1440 --consent 'button:has-text("Godta alle")' --hover <sel> … --click <sel> …`
(and at 360). Implement ONLY behaviours that fired (class mutations / hover diffs / transitions) — in
`js/<family>.js` — then re-run pixel-compare: the number must return to the gated value. Record
`motion: {observed, implemented, dead[]}`.

## Outputs (yours only)
- `stardust/prototypes/<slug>-proposed.html`, `css/<family>.css`, `js/<family>.js` (if needed), `modules/<family>.mjs`.
- `stardust/replica/gates/<short>-{1440,360}/` evidence (live.png, proto.png, diff-iterN.png, *.txt).
- `stardust/replica/progress/<family>.json` — same shape as the `product` entry in `stardust/replica/progress.json`
  (breakpoints, iterations, result, justified[], residuals[], captureState[], motion, liveHits).
- `stardust/replica/journal/<family>.md` — journal entry per `skills/stardust/reference/journal-format.md`.
- `stardust/replica/canon-requests.md` — append-only: chrome/canon defects you found but must not fix in canon.
Do not touch stardust/state.json, progress.json, journal.md, status.jsonl — the orchestrator merges.
Report back: per breakpoint pixel %, Δheight, chrome crops, content-diff structural reds (justified/not),
residuals, live hits used, and any canon request.
