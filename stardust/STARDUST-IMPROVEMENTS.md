# Stardust source improvements — generalised from the SpareBank 1 pilot (2026-09-14/15)

Purpose: a self-contained brief for a session that works on the stardust plugin source
(`adobe-skills/stardust`, tested against 0.20.0 here). Everything below was learned on one
site (www.sparebank1.no, AEM 6.5, 100-page roster, 13 archetype families) run twice
hands-off: Flow A `replica → deploy/rollout` and Flow B `direct → prepare-migration → migrate
→ rollout`. Evidence lives in this project (`/Users/paolo/stardust/2026-08/sparebank1`,
sibling `../sparebank1-redesign`); each item names where to look, but the suggestions are
written to apply to any site.

The headline: **Flow B (migrate) produced 13/13 archetypes and 100/100 pages that passed the
published-origin gate on the first pass; Flow A (replica) passed its 13 archetypes but shipped
sibling pages with silent content loss that only a human visual review caught.** The
difference is not the design work — it is that `migrate` runs a per-page content-verbatim gate
and the replica flow does not. Most of what follows is about closing that class of gap.

---

## 1. Gates: measure every delivered page, not only archetypes

### 1.1 Per-page content-inventory gate in the replica flow (highest value)
- Problem: `replica` gates one archetype per family against live pixels; siblings get a
  "sibling-variance" probe and, in practice, an eyeball. On siblings the generator's generic
  handlers dropped card bodies, CTAs, link lists, whole tabbed components and calculators —
  and the encoders faithfully encoded the loss. Nothing turned red.
- Change: `skills/replica/SKILL.md` Phase 4 + `reference/source-fidelity-gate.md`: a mandatory
  content-inventory gate for EVERY roster page — the captured DOM's headings, paragraphs,
  links (+href), images (+alt) and CTAs must be present (a) in the prototype and (b) in the
  delivered document. `migrate` already has this (`content-check.mjs --file`); lift it into a
  shared script under `skills/diff/scripts/` and call it from replica, deploy and rollout.
- Acceptance: a page with fewer texts/links/images than its source cannot reach `migrated`
  or `live`; the run report lists per-page counts.

### 1.2 Zero-row blocks and empty module sections are red
- Problem: encoders that find nothing emit a 0-row block (`<div class="usp"></div>`) and log
  "gaps 0"; the block dir may not even exist (404 in console). Replica handlers that match no
  child emit an empty `<section>` and log "unknown: none". Three separate instances in one run
  (icon list, related-products list, news rails inside bands).
- Change: `skills/deploy/scripts/davids-model-lint.mjs` — 🔴 for a block with 0 rows or a
  section whose inventory is below its source module, unless the encoder records
  `ctx.drops.push(reason)`. `convert.mjs` (deploy § conversion driver) fails the page. Replica
  generator: a handler returning an element with no text and no media logs a `dropped`
  entry; `unknown modules` must fail the sibling, not warn.
- Acceptance: the 15-page USP loss reproduces as 15 🔴 on the first convert.

### 1.3 Gate verdicts are written by instruments, never by the agent
- Problem: ledgers were hand-typed JSON; one said `pass: true` with Δh 24/28; "eyeball
  matches" was recorded for pages later found broken.
- Change: `skills/stardust/reference/run-status.md` + gate docs: `gate.sh`/`pixel-compare.mjs`
  emit machine JSON (`--json`), the ledger entry is that JSON plus artefact paths; an entry
  without an artefact path is invalid. Provide `pubgate.mjs` (this project:
  `stardust/scripts/eds/_pm-pubgate.mjs`) as the standard published-origin gate: stitch,
  pixel, header crop, footer crop with the footer measured on the page and aligned per side
  (`--y-b`), one JSON summary.

### 1.4 The published origin is the acceptance; the emulation is the inner loop
- Problem: pages passed on the local harness and failed on aem.live. Four pipeline behaviours
  were missing from `serve.mjs`: a block cell holding a single `<p>` is unwrapped; nbsp-only
  paragraphs/headings and leading/trailing `<br>` vanish; a `<br>` inside inline formatting
  (`<b>x<br></b>`) is dropped; external `<img>` becomes `<picture>` that shrink-wraps in flex.
  Also: authored SVG > 40 KB 409s the whole page at preview; mixed-case / trailing-dash /
  underscore paths fail verification; `<em>a</em><em>b</em>` merges into one run.
- Change: `skills/deploy/SKILL.md` § local harness — ship a `serve.mjs` that mirrors these
  (reference implementation: this project's `stardust/scripts/eds/serve.mjs`), and state that
  emulation numbers are provisional until the same page is gated on aem.live. Add a
  "pipeline truths" reference page listing every known normalisation with its symptom.
- Acceptance: a fixture document exercising each behaviour renders identically on the
  harness and on a preview origin.

### 1.5 Mobile is lifted and gated per module kind, not per page
- Problem: 360 values were lifted for the archetype's modules only. Every sibling-only module
  (price/terms, guide carousel, two-tone banner, featured cards, tabs) failed at 360 while
  passing at 1440 (14–30 % pixel, Δh up to −276).
- Change: `skills/replica/SKILL.md` Phase 3 — the module-kind catalogue (`_modules.json`)
  carries lift status per breakpoint; a sibling that introduces an unlifted kind triggers a
  lift + pixel gate at both breakpoints before the family counts as recreated.
- Acceptance: the family ledger lists module kinds × breakpoints with a lift artefact each.

### 1.6 Known permanent capture artefacts, named once
- The live focused skip link after the consent click (top-left of every 360 header crop);
  the fixed to-top disc at every chunk seam (live scroll handlers do not fire on
  programmatic scrollTo); campaign rotation; lazy video placeholders vs players; card-photo
  cover crops. Put them in `source-fidelity-gate.md` § Known artefacts with the standard
  exclusion (header crop excluding x<115; mask boxes) so every run stops re-discovering them.

---

## 2. Generators and encoders: dispatch, coverage, dynamics

### 2.1 Family-scoped handler registries by construction
- Problem: both the replica module registry (`modules/*.mjs`, `Object.assign` in file order)
  and the encoder map merged globally; the alphabetically last family owned `card`,
  `related-topics`, `image`, `tip`, `band`, `cols`, `richtext` for every page. Five parallel
  workers turned this into cross-family regressions visible only as height deltas.
- Change: `skills/replica/reference/generator.md` + `skills/deploy/SKILL.md` § encoders:
  each family file declares `export const families = [...]`; core-key overrides apply only to
  those families; genuinely new keys are shared, and when several families own the same new
  key they are tried in sequence until one answers (reference: `encodersFor()` in this
  project's `stardust/scripts/eds/convert.mjs`). A collision on a core key without a family
  declaration is a load-time error.

### 2.2 Module-kind coverage is asserted before conversion
- Problem: siblings carried live module kinds the archetype never had (icon list, tabs,
  step-by-step, price/terms, calculators, contentfragment lists, `section` wrappers). The
  generator's fallback produced lossy `.module--x` prose.
- Change: `replica` Phase 3 — diff the union of module kinds across the family's pages against
  the handlers present (both sides); unhandled kinds block the family. Source of truth: the
  existing `_modules.json` census plus class-token scan of each sidecar.

### 2.3 Dynamics detection on every roster page
- Problem: `dynamics` Phase 1 ran on archetypes; client-rendered calculators, tabbed
  components and expanders on siblings were never triaged and were dropped.
- Change: `skills/dynamics/SKILL.md` § Phase 1 — cheap DOM heuristics over every captured
  sidecar (shadow roots, `role=tablist/tabpanel`, `aria-expanded` controls, empty
  `.aem-component-container` with data attributes, `<form>`); `reference/patterns.md` — new
  patterns "client-chromed accordion/tabs → author every panel as content" and
  "hydrated widget → per-breakpoint static snapshot (`data/<widget>[-360].html`) with a
  disabled-controls notice".

### 2.4 Authoring rules the pipeline forces (fold into the ENCODE contract)
- Pseudo-heading spans (`<p><span class="h4">`, `<h2><span class="h5">`): author at the visual
  rank; inline spans that are not the whole paragraph → `<strong>` (+ a styles rule if the
  live `<b>` renders in the medium face). Record the content-diff ROLE SWAP class as
  justified once, not per page.
- Blank spacers (`<h3>&nbsp;</h3>`, `<p>&nbsp;</p>`, edge `<br>`): drop, record a residual;
  they cannot be authored and the pipeline drops them anyway.
- Edge whitespace and `<br>` move outside inline formatting; adjacent emphasis runs get a
  space; a `<li>` carrying a heading or several paragraphs is expanded to default content.
- Card model: `<div class="card card--clickable">` with the authored title link INSIDE (click
  delegation). Unwrapping the anchor made every card title an unmatched CTA for content-diff
  and broke EW editability.
- Media: keep source-domain URLs; scan ALL authored SVGs by raw byte size (GET — HEAD reports
  the gzipped size) and rasterise > 40 KB to DA media before the first PUT (reference:
  `rasterise-svg.mjs` + `svg-sizes.json`); validate `<svg` in the response (a wrong DAM path
  returns HTML with 200). `url()` parsing must tolerate parentheses inside quoted URLs.
- Paths: normalise with delivery-lint's path-safety rule at conversion time (lowercase,
  `_`→`-`, collapse/strip dashes) and emit redirect rows for the originals; publish the
  redirects sheet (`redirects.json`, `:type: sheet`) with the first wave.
- Links outside the roster stay absolute to the source origin (a bounce beats a 404).
- Chrome documents: pages in a non-default market need explicit `nav`/`footer` metadata rows
  even when they use the default documents, because the header/footer blocks fall back to the
  market variant.

### 2.5 Column/cards defaults must not be the archetype's
- Problem: `columns` defaulted every media cell to the product hero's rounded 3:2 cover
  crop; an illustration on a sibling was cropped. Cards defaulted to the archetype's variant
  set.
- Change: deploy § blocks — the encoder emits an explicit media token per cell
  (`media-plain | media-4-3 | media-1-1 | media-logo | media-illustration`) derived from the
  source (`--ratio`, image class, intrinsic size); no implicit crop.

---

## 3. Orchestration of parallel workers

- Family groups: one worker per family group with its own encoder file(s), per-group CSS
  blocks appended to `styles.css` inside delimited comments, additive-only edits to shared
  blocks, owner-prefixed helper scripts (`_w3-*`). A worker rewriting a shared block (the
  carousel) or a shared helper (`_dump.mjs`) cost two rounds. Put this protocol in
  `skills/rollout/SKILL.md` § Concurrency (Flow B used per-group CSS files
  `styles/styles-<group>.css` imported from `styles.css`, which avoided every collision).
- Every worker ends with a product-archetype regression (document byte-identical, pixel
  within a fixed delta) — keep, it caught three regressions.
- Workers stall (600 s watchdog, API errors) roughly once per long run; "continue from disk"
  recovers without rework when ledgers/journals are written incrementally. Say so in the
  brief template.
- Do not `git checkout -- content/` to compare converter versions when workers also
  hand-edited generated documents — a hand fix to a chrome document was silently reverted.
  Hand edits go through the generator or are committed immediately.
- `deploy-batch --force --paths` starts an empty ledger; merge the previous ledger or the
  delivery record collapses to the last wave (Flow B L18). Use the append-only log for counts.

---

## 4. Instruments to add or upgrade in `skills/*/scripts/`

| Instrument | What it does | Reference implementation |
|---|---|---|
| `pubgate.mjs` | published-origin gate: stitch + pixel + header/footer crops with the footer measured on the page and aligned per side; JSON summary | `stardust/scripts/eds/_pm-pubgate.mjs` |
| `probe-rects.mjs` + `align.py` | dump text/image rects (h1–h6, p, li, a, img…) of two renders and align by text to print dy/dh/font deltas — the fastest way to find the first diverging module | `stardust/scripts/replica/_probe-eds.mjs`, `stardust/scripts/eds/_pm-align.py` |
| `svg-scan.mjs` | GET every authored SVG, record raw bytes, list > 40 KB | `stardust/scripts/eds/_pm-svg-scan.mjs` |
| `rasterise-svg.mjs` | render oversize SVGs to PNG @2x, validate `<svg`, upload to DA media, ledger | `stardust/scripts/eds/rasterise-svg.mjs` |
| `qa-sweep.mjs` | every roster page: plain + page 200, `about:error` count, live-URL redirect, chrome docs, console errors and horizontal overflow on a sample | `stardust/scripts/eds/_pm-qa-sweep.mjs` |
| `overflow.mjs` | scrollWidth + widest elements at 360 (caught a 4 px rail bleed) | `stardust/scripts/replica/_pm-overflow.mjs` |
| `serve.mjs` | emulation with the pipeline truths of § 1.4 | `stardust/scripts/eds/serve.mjs` |
| `content-check --file` | per-page content-verbatim gate (exists in migrate; promote to shared) | `../sparebank1-redesign/stardust/scripts/…` |

---

## 5. Smaller items (fold where they fit)
- `stitch-shot`/`crop-compare`: the footer crop needs `--y-b` alignment whenever Δh ≠ 0;
  `pubgate` should do this automatically (it does in the reference).
- Hands-off mode: state explicitly that "approval" for siblings is the per-page gate of § 1.1,
  and that the run report must list pages by gate status (gated-live / content-verified /
  residual class), never "100 pages migrated" without qualification.
- Journal/ledger hygiene: `progress.json` should not accept helper-file names as archetypes
  (a merge picked up `_w2-*` ledgers); ledgers under `progress/` are per family only.
- zsh: `$VAR` does not word-split (`${=VAR}`); `=foo` at word start is equals-expansion
  (`echo =====` fails). Both bit scripted loops.
- Ports: a stale server from another project on the default port answered 200 with the wrong
  site; `gate.sh` already asserts a marker — make `serve.mjs` refuse EADDRINUSE loudly and
  give each worker its own port in the brief.
- DA tokens expire ~24 h: a long run should pre-flight the token before every deploy wave and
  stop with a precise message (it did; keep).

---

## 6. What worked and should be kept
- Generator-driven replica (verbatim text, live SVGs, cleaned attributes) with a module
  registry per family; the archetype pixel gate at 1440 + 360 with live PNG captured once.
- David's Model lint + the emphasis-CTA convention; default content for prose; one block per
  repeating unit; template-slotted blocks only for genuine widgets.
- Published-origin gating with chrome crops; the redirects sheet for the whole roster.
- Flow B's per-page content-verbatim gate and per-group CSS files — the reasons the redesign
  needed no visual-review fixes.
