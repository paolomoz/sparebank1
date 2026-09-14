# EDS conversion brief (deploy/rollout, one archetype group per worker)

You are converting gated replica prototypes of www.sparebank1.no into EDS blocks + DA documents and gating the
EDS render against the SAME live captures the replica was gated on. The product archetype (boliglan) is the gated
reference for everything: read `stardust/scripts/eds/convert.mjs`, `encoders.mjs`, `lib.mjs`, `serve.mjs`,
`blocks/{columns,cards,accordion,banner,feedback,header,footer,bank-choice,breadcrumbs,calculator}/`,
`styles/styles.css` (section skins), `scripts/sb1.js` (block helpers), `stardust/scripts/deploy/davids-model.md`,
`stardust/replica/progress.json → archetypes.product.eds` (how the gate was closed, what was fixed) before starting.

## Inputs (per archetype)
- Prototype: `stardust/prototypes/<slug>-proposed.html` (gated; verbatim content) + its family module
  `stardust/scripts/replica/modules/<family>.mjs` and CSS `stardust/prototypes/css/<family>.css` (the lifted live values —
  reuse them in your block CSS, never re-measure by eye). Replica ledger: `stardust/replica/progress/<family>.json`.
- Live capture (cached, reuse — never re-take): `stardust/replica/gates/<short>-{1440,360}/live.png`
  (short names: lan = category-hub, ks = kundeservice-hub, privat = market-landing, faq, kontakt = utility,
  sperrekort = tool, presse = om-oss, borettslag = theme, markedsnytt, nyhet = news-article, nyheter = news-listing,
  hjemme = campaign-landing). Live URL: `stardust/state.json`. Family → pages: `stardust/current/_page-types.json`.

## Conversion
- `node stardust/scripts/eds/convert.mjs <slug>` writes `content/<da-path>.html` + `stardust/rollout/eds-log/<slug>.json`
  (modules → blocks map, notes, **gaps**). A gap is a module with no encoder (emitted as prose) or an encoder that
  produced nothing. Your job: gaps 0, and every module's content in the DA document (text, hrefs, alt, CTAs).
- Encoders: add ONLY `stardust/scripts/eds/encoders/<family>.mjs` — `export default { '<module-class>': (root, ctx) => ({ html, blocks }) }`
  keyed by the module root's class (the `<main>` child in the prototype); import helpers from `../encoders.mjs`
  (`richtext, cardRows, cardVariant, band, bannerSmall, bandBg, bgToken, styleOf`) and `../lib.mjs`
  (`section, block, row, cell, prose, inline, list, table, pic, imgHtml, ctaHtml, ctaKind, href, esc, q, qa, cls, has, kids, txt, headingTag`).
  The loader in convert.mjs merges family files over the core map. You MAY override a core key only if the product
  page still converts identically (`git diff --stat content/nb/bank/privat/lan/boliglan.html` after re-running convert on it must be empty).
- David's Model (mandatory, `davids-model.md`): default content for prose (heading/text/image/CTAs), one block per
  repeating-unit set, one row per unit, ≤4 columns, no nested blocks, fully-qualified media URLs, no HTML/CSS in
  documents, name/value only for configuration (`metadata`, `section-metadata`), CTAs as emphasised links
  (`<strong>` primary / `<em>` secondary / `<em><strong>` accent). Collapse same-pattern sections into ONE block +
  variants (D9) — reuse `cards`, `columns`, `accordion`, `banner`, `callout` before inventing a block; a new block
  is justified only by a genuinely new repeating unit or widget (e.g. a carousel, an adviser list, a table variant).
  Lint every document: `node stardust/scripts/deploy/davids-model-lint.mjs content/<path>.html` — 0 🔴; each 🟡
  fixed or justified via `ctx.notes.push('lint D#: …')` in your encoder (the note lands in the conversion log).
- Editability (EW): blocks MOVE authored nodes into their slots, never rebuild text; the authored heading/link stays
  the editable unit (card-as-link keeps the heading inside); no text-as-metadata (a link naming a data file is the
  one exemption, `@ew-exempt` documented like calculator.js). Icons: authored `:icon-name:` spans → `inlineIcons()`.
- Blocks: new block = new dir `blocks/<name>/{<name>.js,<name>.css}`. SHARED blocks (cards, columns, accordion,
  banner, callout, feedback, header, footer, bank-choice, breadcrumbs) are **additive only**: add a variant class +
  rules scoped to it, never change an existing rule or the decorate flow for existing variants. `styles/styles.css`:
  append only, at the end, inside `/* ===== <family> ===== */ … /* ===== /<family> ===== */`; new section styles get a
  distinct name; never edit existing rules. Chrome variants (bedrift / om-oss / frontend) live in header.js/footer.js
  via the `/nav-*` `/footer-*` documents (`stardust/rollout/chrome-map.json`) — extend additively.
- Every cross-cutting need (a shared-block rule you cannot express as an additive variant, a canon-level fix) →
  append to `stardust/rollout/eds-requests.md` (create if missing) with the measured evidence; do not apply it.

## Gate (per breakpoint 1440 then 360; the EDS render on the local emulation vs the cached live PNG)
```
node stardust/scripts/eds/serve.mjs --port <yourPort> &      # serves content/ + blocks/ + styles/ with the EDS pipeline
EDS=http://localhost:<yourPort><da-path>; G=stardust/replica/gates/<short>-eds-1440; mkdir -p $G; cp stardust/replica/gates/<short>-1440/live.png $G/
node stardust/scripts/replica/stitch-shot.mjs "$EDS" $G/proto.png --width 1440 --settle
node stardust/scripts/replica/pixel-compare.mjs $G/live.png $G/proto.png --out $G/diff-iterN.png --threshold 10 | tee $G/pixel-iterN.txt
node stardust/scripts/replica/crop-compare.mjs $G/live.png $G/proto.png --y 0 --height <headerH> --out $G/chrome-header-diff.png --threshold 2 | tee $G/chrome-header.txt
node stardust/scripts/replica/crop-compare.mjs $G/live.png $G/proto.png --y <footerY> --height <footerH> --out $G/chrome-footer-diff.png --threshold 2 | tee $G/chrome-footer.txt
node stardust/scripts/diff/content-diff.mjs "http://localhost:8812/<slug>-proposed.html" "$EDS" --profile generic --width 1440 --main main   # prototype ↔ EDS, no live hit
```
- Pass bar (unchanged from the replica gate): pixel ≤ 10 % with every band ≥ 15 % explained; |Δheight| ≤ 8 px;
  header & footer crops ≥ 98 % (the live focused skip link "Til hovedmeny" is a permanent artefact at 360 — also
  measure the header excluding x<115); content-diff prototype ↔ EDS: 0 unexplained structural 🔴 (accordion bodies
  collapse by height, not `hidden`); one live content-diff (live ↔ EDS) at the end as confirmation (≤ 2 live hits per archetype).
- Known permanent residuals: the to-top disc at every chunk seam (~0.3 %), market-landing hero campaign rotation,
  card photo cover-crop, skip link. Record them; do not chase them.
- Fast inner loop (free): `node stardust/scripts/replica/_probe-eds.mjs <url> <width> [y0 y1]` dumps text/image
  rects; run it on the prototype (port 8812) and on your EDS page and align section by section top-down (the product
  round used `/tmp/align.py`-style text matching: fix the FIRST mismatching module, re-stitch the EDS side only).
  Prefix any helper you add with your worker id (`_w1-…`) — shared tree, other workers are running.
- After your archetypes gate: re-run the product regression once —
  `node stardust/scripts/eds/convert.mjs nb-bank-privat-lan-boliglan-html` (diff must be empty) and the 1440 pixel gate
  on `http://localhost:<yourPort>/nb/bank/privat/lan/boliglan` vs `stardust/replica/gates/boliglan-eds-1440/live.png`
  must stay ≤ 0.7 % Δ0. If it moved, your shared-block/styles change is not additive — fix it.
- Then convert the family's SIBLINGS (`_page-types.json → types.<family>.pages`): a sibling needs a prototype first
  (`node stardust/scripts/replica/author.mjs <slug>` generates it from the sidecar with the family module), then
  `convert.mjs <slug>` — report gaps per sibling (0 required), lint each, and eyeball-gate one sibling per family on
  the emulation at 1440 (stitch + view; no live capture — siblings were never captured as PNG; compare against the
  sibling prototype via content-diff instead).

## Outputs (yours only)
- `stardust/scripts/eds/encoders/<family>.mjs`; `blocks/<new-block>/`; additive variant rules; styles.css family block.
- `content/**` documents for the archetype + siblings; `stardust/rollout/eds-log/*.json` (automatic).
- `stardust/replica/gates/<short>-eds-{1440,360}/` evidence.
- `stardust/rollout/eds-progress/<family>.json` — same shape as `progress.json → archetypes.product.eds`
  (document, blocks[], iterations, breakpoints{pixelPct, heightDelta, chrome*, pass, evidence}, justified[], fixesThisRound[],
  siblings{converted, gaps, lint}).
- `stardust/rollout/journal/<family>.md` — journal entry (decisions, findings, open questions).
- `stardust/rollout/eds-requests.md` — append-only cross-cutting requests.
Do not touch stardust/state.json, progress.json, journal.md, status.jsonl, chrome-map.json, or another worker's files.
Report back per archetype: blocks used (new vs reused), per breakpoint pixel %, Δheight, chrome crops, content-diff
reds (justified/not), lint result, siblings converted with gaps, product regression number, requests filed.
