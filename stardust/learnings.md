# Learnings ledger — sparebank1 (Flow A: replica → deploy/rollout), 2026-09-15

Written after the human visual review of the first published run (Paolo, 06:40–06:50: sparing, daglig-bruk, pensjon,
forsikring, eiendom, tips-og-rad, lofavor). Every entry names the skill section that should change.

### Sibling pages were never gated — only the archetype was
- failure class: capture-gap (fidelity claimed for 100 pages, measured on 13)
- evidence: category-hub siblings (19 pages) lost card bodies, CTAs, a tabbed component, two calculators and news rails; the archetype `nb-bank-privat-lan-html` passed 0.41 % / 2.15 %. `ARCHETYPE-BRIEF.md` and `EDS-BRIEF.md` (this run) asked for "eyeball one sibling per family"; workers reported "matches". `stardust/rollout/HUB-SIBLINGS-DEFECTS.md`.
- proposed change: `skills/replica/SKILL.md` § Phase 4 + `skills/replica/reference/source-fidelity-gate.md` — add a mandatory per-sibling structural gate: content inventory of the captured page (headings, paragraphs, links+href, images, CTAs) must be present in the prototype AND in the delivered document (the `content-check.mjs --file` gate `migrate` already runs per page); plus a pixel sample of every sibling that introduces a module kind the archetype lacks, at both breakpoints. "Eyeball" is not a gate verdict.
- status: pending

### Silent zero-row blocks / empty module sections pass every gate
- failure class: silent-render
- evidence: USP module empty on 15 pages (author.mjs read `.usp-item`, live markup is `.icon-list__item`; encoder emitted a 0-row `usp` block for a block that did not exist → 404 in console, no gap logged); hub related-products list 0 rows (core `relatedTopics` reads only `.newsfeed`); news rails inside bands → empty `cards small`; W1's campaign carousel; all with `gaps 0`, lint PASS.
- proposed change: `skills/deploy/SKILL.md` § ENCODE contract + `skills/deploy/scripts/davids-model-lint.mjs` — a block with 0 rows, or a section whose text/link/image count is below the source module's, is a 🔴 unless the encoder declares the drop; `convert.mjs` must fail the page. Replica side: `skills/replica/reference/generator.md` (author.mjs) — a module handler that yields an element with no text and no media must log a `dropped` entry, never `unknown: none`.
- status: pending

### The local emulation did not behave like the EDS pipeline
- failure class: silent-render (emulation passed, published origin failed)
- evidence: four pipeline behaviours were missing from `serve.mjs`: single-`<p>` block cells are unwrapped; nbsp-only paragraphs/headings and edge `<br>` vanish; `<br>` inside inline formatting is dropped; and authored SVGs > 40 KB 409 the whole page at preview. kundeservice/kontakt (Δh 71 at 360), sperre-kort (Δh 48), boliglan preview 409, borettslag Δh 33 after gate.
- proposed change: `skills/deploy/SKILL.md` § local harness / `serve.mjs` — encode these normalisations (now in `stardust/scripts/eds/serve.mjs` of this project) and make the published-origin gate the acceptance, the emulation only the inner loop; `skills/deploy/SKILL.md` § Images — pre-scan all authored SVGs (GET, raw bytes; HEAD reports the gzipped size) and rasterise > 40 KB before the first PUT.
- status: pending

### Global handler registries let the last file win across families
- failure class: silent-render (cross-family override)
- evidence: replica `modules/*.mjs` (Object.assign, alphabetical) — `theme.mjs` owns `card`, `market-landing.mjs` owns `related-topics`/`image`, `utility.mjs`/`category-hub.mjs` both own `tip`; markedsnytt lost its card dates (Δh 28) and hub pages lost related lists. Encoders: `utility`/`tool` overrode `band`/`cols`/`richtext` for every page until convert.mjs dispatched per family group.
- proposed change: `skills/replica/reference/generator.md` § module registry and `skills/deploy/SKILL.md` § encoders — registries are family-scoped by construction (`export const families = [...]` per file; new keys shared, core-key overrides local; composite resolution for shared keys); a collision is a hard error at load time.
- status: pending

### Mobile was lifted for the archetype's modules only
- failure class: capture-gap
- evidence: product siblings (forbrukslan 14.8 %, mobilbank 13.4 %, vare-eksperter 18.9 % at 360) and hub siblings (forsikring 29.8 % Δh −276, pensjon 22.3 %) fail at 360 while passing at 1440; sibling-only modules (price-terms, guide carousel, two-tone banner, featured cards, tabs) were never lifted at 360.
- proposed change: `skills/replica/SKILL.md` § Phase 3 — lift and gate per MODULE KIND, not per page: maintain a module-kind catalogue (`_modules.json` already exists) with lift status per breakpoint; any sibling introducing an unlifted kind triggers a lift + pixel gate on that sibling at both breakpoints before it counts as recreated.
- status: pending

### Agents asserted gate verdicts the instruments did not produce
- failure class: capture-gap (process)
- evidence: markedsnytt ledger `pass: true` with Δh 24/28; "eyeball @1440 matches" recorded for siblings later found broken; W1's lan document lost its related list after its own gate. Ledgers were hand-written JSON.
- proposed change: `skills/stardust/reference/run-status.md` + `skills/replica/reference/source-fidelity-gate.md` — the verdict field is written by `gate.sh`/`pixel-compare.mjs` (machine JSON), never typed by the agent; a ledger entry without an instrument artefact path is invalid.
- status: pending

### Client-rendered modules were dropped, not snapshotted, on siblings
- failure class: dynamic-gap
- evidence: pension calculator, savings calculator, LOfavør tabs (client-chromed tabs), forsikring "Se alle" expanders, credit calculator (forbrukslan) — present on live siblings, absent from `_dynamics.json` triage (archetype-scoped detect) and from the prototypes until W3/W6 snapshotted them.
- proposed change: `skills/dynamics/SKILL.md` § Phase 1 detect — run detection on every roster page (cheap DOM heuristics on the captured sidecars: shadow roots, `role=tablist`, empty `.aem-component-container` with data attributes), not on archetypes only; `skills/dynamics/reference/patterns.md` — "client-chromed accordion/tabs = author every panel as content".
- status: pending

### Pipeline path-safety and merged-emphasis rules applied late
- failure class: path-safety
- evidence: 4 roster URLs (mixed case, trailing `-`, `_`) 409'd at preview; `<em>tag</em><em>date</em>` without whitespace merged by the pipeline (Flow B news-listing Δh 72); `<b>Telefon<br></b>` dropped the break.
- proposed change: `skills/deploy/SKILL.md` § Path discipline — normalise with delivery-lint's rule at conversion time and emit redirect rows; § ENCODE inline rules — edge whitespace/`<br>` moved outside inline formatting, adjacent emphasis runs separated.
- status: pending
