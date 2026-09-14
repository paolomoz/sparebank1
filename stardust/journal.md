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
