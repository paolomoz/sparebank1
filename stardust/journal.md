# Journal — sparebank1.no migration to AEM Edge Delivery (replica → EDS, then redesign)

Chronological log of every prompt execution. Most recent at the bottom.
See `skills/stardust/reference/journal-format.md` for entry format.

---

## 2026-09-14T15:18:31Z — Kickoff: scope, EDS repo, replica Phase 1 (extract --prep --dynamics) + Phase 2 (preserve)

**Prompt:** Reply to Bertrand's Sparebank1 pilot request with a done migration: full as-is migration first, then a redesigned version, all with stardust; scope the full site, start with a production-ready 100-page iteration.

**Decisions:**
- Two flows, two projects: Flow A same-design ⇒ `replica → migrate → rollout` in this repo (`paolomoz/sparebank1`, repo = stardust project root); Flow B redesign ⇒ `prepare-migration → migrate → rollout` in sibling project `../sparebank1-redesign`, seeded from this extract. Never mixed.
- Hands-off mode (autonomous mandate); caps 100 / 20 per template; pure replica (empty register); gates 1440 + 360.
- Full-site scope inventoried: 9,821 URLs / 13 sitemaps; one design system across all 13 properties (A1). Iteration 1 = shared `/nb/bank/` property; `/nb/bank.html` is a JS bank-chooser shell (excluded, D2); login pages linked-not-migrated (D3).
- Roster of 100 (12 header, 10 footer, 22 hubs, 8 om-oss, 3 markets, 24 products, 12 FAQ, 8 news, 4 theme, 4 tools, 4 static, 1 listing) from a 295-page AEM pageType census.
- Page typing from AEM `pageType` + clientlib variant → 13 archetype families (product, category-hub, faq, news-article, om-oss, tool, theme, market-landing, kundeservice-hub, utility, campaign-landing, news-listing, markedsnytt-listing).

**Artifacts touched:** fstab.yaml, .gitignore, PLAN.md, TRACKING.md, stardust/roster.md, stardust/direction.md, stardust/state.json, stardust/status.jsonl, scope/*, stardust/current/{pages/*.json+html (100), assets/{screenshots,fonts,css,logo.svg,favicon.png}, _crawl-log.json (+run1/2/3), _fonts.json, _brand-extraction.json, _ffe-tokens.json, _page-types.json, _modules.json, _prep-inventory.json, _prep-summary.md, PRODUCT.md, DESIGN.md, DESIGN.json, brand-review.html, _dynamics.json}, stardust/validation/{extract-contact-sheets, brand-review}, PRODUCT.md/DESIGN.md/DESIGN.json (root, promoted), stardust/replica/inconsistency-register.md, stardust/scripts/* (crawl + capture-styles + brand-surface + prep + state + brand-review; replica/, diff/, dynamics/ copies).

**Findings worth flagging:**
- SB1 cookie dialog uses Norwegian "Godta alle" — crawl.mjs's text-match consent list missed it on 2/100 pages; patched in the project copy (flag for upstream: add nb/nn/sv/da labels).
- Custom lazy loader (`data-lazy-src`, placeholder = logo.svg): screenshots show placeholders on illustration tiles even at slow wait; real URLs live in the rendered DOM — recreation reads them from there (capture-state for screenshots only).
- capture-styles.mjs (experian-era) dropped the crawl's per-page `dynamic` section on merge → dynamics reach roll-up read 0/100; fixed (now preserved) and reach re-crawled to /tmp and re-attached.
- brand-surface.mjs carried an experian-specific hardcoded tone string; replaced. impeccable 4.3.1 renamed/removed `load-context.mjs` (master setup step 2 cannot run as documented).
- All 13 properties share one clientlib; 12/100 pages (news, campaign) load a `nettsider-frontend` variant of the same design system.

**Open questions:** fonts — SpareBank1 faces are the customer's proprietary web fonts; self-hosted for the pilot (customer-owned assets), to be confirmed before public launch (A5).

**Next:** Phase 2 dynamics triage (re-attach reach, detect on 13 archetypes, curate dynamic-features.md), then Phase 3 recreation starting with the product archetype (boliglån) and the shared chrome.

---

## 2026-09-14T16:31:04Z — Replica Phase 2 (dynamics) + Phase 3/4 product archetype gated; fan-out of the 12 remaining archetypes

**Prompt:** (continuation of the kickoff) — proceed hands-off through recreation and gating.

**Decisions:**
- Dynamics triage: 29 detector findings on 13 archetypes curated into 20 features (`stardust/dynamic-features.md`); 13 ship as `self`, one owner decision batch (CORS/proxy for bank lookup, loan-calculator API, rates, feedback logging; boost.ai chat; Adobe tags/CMP; search choice; regional trees later), 3 decided-out (authenticated apps, pilot tags, regional/nynorsk trees).
- Recreation is generator-driven: `stardust/scripts/replica/author.mjs` re-emits clean markup from the rendered-DOM sidecar (verbatim text/inline markup, cleaned attributes, live SVGs), with a module registry (`modules/<family>.mjs`), per-family CSS (`css/<family>.css`) and a `frontend` clientlib variant hook. Shared canon: `css/ffe-tokens.css` (185 live tokens), `css/canon.css`, `js/canon.js`.
- Loan calculator = static snapshot of the hydrated shadow DOM (declarative shadow DOM) + portation of its own stylesheet, scoped (fallback criterion 2; dynamics #7 interim).
- Product archetype (boliglån) approved hands-off: 1440 pixel 0.37 % Δ0, 360 pixel 1.54 % Δ0, header/footer crops 99.6/99.7 % (1440) and 96.4/99.1 % (360 — header residual is the live focused skip link; 0.14 % otherwise), content-diff 0 unexplained structural red.
- 12 remaining archetypes fanned out to three parallel workers (landing family, FAQ/utility/tool family, frontend-clientlib family) under `stardust/replica/ARCHETYPE-BRIEF.md`; om-oss / theme / markedsnytt-listing queued for a fourth worker.

**Artifacts touched:** stardust/dynamic-features.md, dynamic-features-plan.md, stardust/dynamics/*, stardust/current/_dynamics.json, stardust/scripts/replica/{author.mjs,lift-styles.mjs,harvest-icons.mjs,outline.py,modules/README.md}, stardust/prototypes/{css/*,js/canon.js,assets/*,fonts/*,nb-bank-privat-lan-boliglan-html-proposed.html}, stardust/replica/{progress.json,lift/*,motion/*,gates/boliglan-*/,ARCHETYPE-BRIEF.md}, stardust/state.json (boliglan approved), status.jsonl, TRACKING.md.

**Findings worth flagging:**
- The live site stretches card photos (768×575 → 310×200) with `object-fit: cover; object-position: 50% 0`; visual-diff flags them as STRETCHED on both sides — mirrored, justified.
- content-diff cannot see a hidden accordion body when the build uses the `hidden` attribute but can when the live collapses by height — collapse mechanics must be mirrored (height 0) for inventory symmetry.
- capture-styles.mjs (experian-era) dropped the crawl's `dynamic` section on merge — fixed and re-attached (reach 100/100).
- The live mobile header morph (`.header__wrap.scroll/.show`, clientlib module 2741) is what makes stitched captures show a header at every seam; the prototype mirrors the state machine, and the `.header` must reserve its 60 px or stitch-shot stalls (scroll range shrinks when the wrap goes fixed).
- Live captures show the focused skip link "Til hovedmeny" because focus lands on it after the consent click — a permanent instrument artefact in the header crop.

**Open questions:** none blocking; owner decision batch in dynamic-features.md.

**Next:** merge the workers' family ledgers into progress.json/state.json, then Phase 5 (migrate sibling tier → deploy → rollout) and Flow B (redesign) in the sibling project.

---

## 2026-09-14T19:05:00Z — Product archetype through the EDS conversion gate; six worker families merged

**Prompt:** (continuation, hands-off) — convert the gated product prototype to EDS blocks + DA document and gate the emulation against the live capture; merge the workers' archetype ledgers as they land.

**Decisions:**
- The EDS side is gated on the same live captures as the replica (`stardust/replica/gates/boliglan-eds-{1440,360}/`), on the local emulation (`stardust/scripts/eds/serve.mjs`, port 3010) — the published-origin regime is replayed after deploy.
- Eight iterations took the product page from 20.7 % to **0.59 % (1440, Δh 0)** and **1.88 % (360, Δh 0)**; header 99.58 % / footer 98.69 % (1440), footer 98.40 % (360; header residual = live focused skip link, 0.14 % otherwise). Recorded in `progress.json → archetypes.product.eds`.
- Authoring rule adopted for pseudo-headings: a live heading whose whole text is an FFE `.h2–.h6` span is authored at the **visual** rank (`lib.mjs headingTag()`), so editors get the size they see; `<p><span class="h4">` becomes a real `<h4>`. Global `h4` = 22/28 medium (live `h4`/`.h4`); `h5` = 17/20 → 18/24.
- Icon cards (live `card--small` with an icon in place of the title): the heading stays as the accessible name, visually hidden; the icon sits inside the body. One occurrence in scope (LO card).
- Worker A (category-hub 0.39/1.98 %, kundeservice-hub 0.28/1.09 %, market-landing 5.28/4.85 % with the hero campaign rotation as the only residual) and worker B (faq 0.87/1.35 %, utility 1.78/3.13 %, tool 0.23/0.79 %) merged into `progress.json`; their archetype pages set `approved` (approvedBy hands-off) in `state.json` — 7 of 13 archetypes approved.

**Artifacts touched:** blocks/{columns,cards,accordion,feedback,footer,header}/*, styles/styles.css, stardust/scripts/eds/{lib,encoders}.mjs, content/nb/bank/privat/lan/boliglan.html, stardust/replica/progress.json, stardust/state.json, stardust/status.jsonl, stardust/replica/canon-requests.md, stardust/scripts/replica/{_probe-eds,_pm-dump,_pm-totop}.mjs.

**Findings worth flagging:**
- Flex column containers do not collapse margins; the live text sits in a block `.richtext` — the columns block now wraps non-CTA nodes in `.col__text` so heading/paragraph rhythm matches without per-element overrides.
- JS-built inline-block lists lose the authored whitespace (≈4.4 px per gap) — header.js inserts text nodes between items; a `word-spacing` hack on the `ul` had no effect.
- The live footer underlines its column links (canon.css says none) — canon request logged.
- The live to-top disc never appears in stitched live captures (scroll handler silent under programmatic scroll) but does on both replica and EDS — a permanent ~0.3 % residual per gate.
- A worker overwrote my `_dump.mjs` helper with its own (same name, different signature): helper scripts in a shared tree need owner prefixes (`_pm-*`).

**Open questions:** none blocking; owner decision batch unchanged.

**Next:** merge workers C (om-oss/theme/markedsnytt) and D (news-article/news-listing/campaign-landing); encoders + blocks for the remaining 12 families (fan-out on the same brief pattern, per-family encoder files), sibling conversion, DA deploy + published-origin gate; Flow B in `../sparebank1-redesign`.

---

## 2026-09-14T20:40:00Z — Product page live on the published origin; workers fanned out on the EDS side; Flow B started

**Prompt:** (continuation, hands-off).

**Decisions:**
- The product page is deployed to DA and published: `https://main--sparebank1--paolomoz.aem.live/nb/bank/privat/lan/boliglan` (DA `paolomoz/sparebank1`, chrome `/nav` + `/footer`). Published-origin gate vs the live capture: **1440 0.52 % Δ0** (header 99.58 %, footer 99.55 %), **360 1.83 % Δ0** (footer 98.26 %; header residual = skip link). Live ↔ published content-diff: 9 structural reds, all in two justified classes (pseudo-heading rank; `lenker.sparebank1.no` runtime rewrites).
- Oversize authored SVGs (67 of the site's 285 SVGs exceed the pipeline's 40 KB preview limit; the first one 409'd the product page) are authored as PNG rasterisations on DA media at conversion time (`stardust/rollout/svg-sizes.json`, `rasterise-svg.mjs`).
- Cards follow the live model again: the card is a `div`, the authored title link is the link, the card is clickable by delegation. Unwrapping the anchor had made every card title an unmatched CTA for the content classifier.
- EDS conversion fanned out: W1 (category-hub, kundeservice-hub, market-landing) and W2 (faq, utility, tool) under `stardust/rollout/EDS-BRIEF.md` (family encoder files auto-loaded by convert.mjs; additive-only shared blocks; product regression as the guard). Replica workers C (om-oss/theme/markedsnytt) still running; D merged (10/13 archetypes approved).
- Flow B (redesign) started as a separate agent in `../sparebank1-redesign` (seed from the extraction, `direct` on the modernisation intent, `prepare-migration` through prototype --prep for 13 archetypes; stops before migrate).

**Artifacts touched:** blocks/{cards,feedback,footer}/*, stardust/scripts/eds/{lib,encoders,convert,rasterise-svg,_pm-svg-scan}.mjs, stardust/scripts/eds/encoders/ (loader), stardust/rollout/{EDS-BRIEF.md,svg-sizes.json,raster-ledger.json,deploy-ledger.json,deploy.log,raster/}, content/nav*.html, content/footer*.html (sanitised), stardust/replica/progress.json (product.eds, product.published, 10 archetypes), stardust/state.json, status.jsonl.

**Findings worth flagging:**
- HEAD content-length of the source DAM reports the gzipped SVG size; the pipeline limit applies to raw bytes — measure with GET.
- On the published origin the same CSS produced dark contact icons (currentColor inherited from the action) — the emulation footer crop had passed only because it was 0.4 % above the bar; chrome crops need a visual look, not just a number.
- A worker stall (W2, no progress for 600 s at start) was recovered by a fresh spawn with the same brief.

**Next:** merge W1/W2 (EDS ledgers), C (replica), then EDS conversion for C/D families; sibling conversion + full DA rollout (deploy-batch), redirects, qa sweep; Flow B prototypes.

---

## 2026-09-15T00:20:00Z — Rollout wave 1: 46 pages live; the emulation learns the pipeline's truths

**Prompt:** (continuation, hands-off).

**Decisions:**
- Encoders dispatch per page family (worker groups: landing = category-hub/kundeservice-hub/market-landing, service = utility/tool); genuinely new module kinds are shared, family-gated overrides of core keys are not. A global alphabetical merge had let the last file win everywhere (W1-0).
- Authoring debris is dropped, not reproduced: blank `<h3>&nbsp;</h3>`/`<p>&nbsp;</p>` spacers and leading/trailing `<br>` — the pipeline drops them anyway, and the emulation now does the same (cell single-`<p>` unwrap, nbsp, edge breaks, `<br>` inside inline formatting moved outside). Pages carrying such debris show a justified Δh (sperre-kort 48 px, kundeservice 24 px).
- Two W1 documents had lost their related-products icon list silently (core `relatedTopics` reads only `.newsfeed` → 0 rows): the hub band now routes `related-*` to `hubRelated`. Silent 0-row blocks are the most dangerous defect class in this pipeline — the gate caught it only because the published run measured Δh 318.
- Delivery paths are lowercase with redirect rows for the two mixed-case live URLs; the chrome documents for bedrift and om-oss no longer carry the live hidden error string as their intro.
- Flow B prep is complete (13/13 redesign prototypes approved hands-off, canon, direction); its migrate → rollout runs as a separate agent into `paolomoz/sparebank1-redesign`.

**Artifacts touched:** stardust/scripts/eds/{convert,lib,serve,media-upload,chrome,_pm-pubgate,_pm-svg-scan,rasterise-svg}.mjs, encoders/category-hub.mjs, blocks/footer, content/** (58 docs + redirects), stardust/rollout/{deploy-ledger.json,eds-requests.md,eds-progress/*}, stardust/replica/progress.json (eds ledgers), gates/*-pub-*.

**Findings worth flagging:**
- Every "emulation passed, published failed" case traced to one of four pipeline behaviours the emulation lacked; they are now mirrored, so future emulation gates are truthful.
- HEAD content-length reports gzipped SVG sizes; the 40 KB limit is raw bytes.
- A content reset (`git checkout -- content/`) silently reverted a hand-applied chrome fix; hand edits to generated documents must go through the generator or be committed immediately.
- Open: 360 footer crops on privat (95.5 %) and kundeservice (97.7 %) — checking for horizontal overflow (scrollWidth 364 reported by W1).

**Next:** deploy W5's 12 frontend documents + W3 product siblings + W4 families when they land; published gates for their archetypes; QA sweep; Flow B rollout; reply to Bertrand.

---
