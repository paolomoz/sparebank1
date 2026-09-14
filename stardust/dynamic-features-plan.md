<!-- _provenance: writtenBy stardust:dynamics (Phase 3 plan, hands-off); writtenAt 2026-09-14T16:10:00Z; readArtifacts stardust/dynamic-features.md, stardust/dynamics/dynamic-features.generated-plan.json -->

# Dynamic features — plan (sparebank1.no iteration 1)

Static first, then wire. Every page works as a static page before any phase below replaces a
degradation with live behaviour. Verification per phase: flow works on the published origin at
1440 and 360, a `parity.json` row, a journal entry, a commit.

| phase | features | deliverable | authoring contract | verification | owner decision | effort |
|---|---|---|---|---|---|---|
| P3 prototype (replica Phase 3) | #4 FAQ accordion, #6 contact tabs (static panels), #1 bank list collapse, #2/#3 dialogs (markup + open/close) | interaction parity in the archetype prototypes (motion-observe evidence only) | `faq-accordion` rows = question / answer richtext; `contact` block = 5 tabs + panels; `bank-choice` block = heading, lede, input label, 12 bank rows | motion-observe.mjs live → prototype behaviour match; pixel re-run returns to gated value | none | in Phase 3 |
| D2-a listings | #11 news + markedsnytt rails and listing pages, #13 metadata | `helix-query.yaml` (2 indexes) + `news-listing` / `article-rail` blocks reading the index; per-page `<meta>` (template, category, published-time, tema, market) | block authored empty → fetches the index, filters by category/tema, sorts newest-first, paginates 12 | rail renders the 6+2 roster articles; listing page shows 8 real cards + pager | none (contract in dynamic-features.md) | 1 wave |
| D2-b interactive | #2 overlay dialog, #3 login dialog, #17 glossary modal, #8 savings calculator (client compute), #16 YouTube | block JS: `dialog` element per CTA with the 12-bank list; `login-dialog` fragment; glossary `<abbr>`→dialog; `savings-calculator` block (inputs → compound-interest projection) ; `video` block | dialog opens/closes, focus trap, ESC; calculator reproduces captured example values ±1 kr | none | 1 wave |
| D2-c interim tiers (scaffolded) | #1 postcode lookup, #5 feedback POST, #7 loan-calculator API, #9 rates, #20 search, #6 chat | `scripts/site-config.js` with disabled endpoints + owner notes; UI renders, network calls stubbed with explicit "not connected" states | config keys named per feature; flipping a key enables the call | owner: SB1 (CORS/proxy for `/openapi/nettsider/ressurser/bank/*`, `/api/personal/banking/boliglan-kalkulator/*`, rates, `/LogServlet`; boost.ai; search choice) | 1 wave + owner |
| D2-d tags | #15 Adobe Launch / Web SDK + CMP | `head.html` hook + consent-gated loader, disabled on the pilot origin | owner supplies property/edge config ids | owner: SB1/Adobe | at go-live |
| later iterations | #18 regional-bank + nynorsk trees | 12 more `/nb/<bank>/` trees (6,697 pages) reusing the same blocks; bank-choice routes internally | — | owner: scope order of banks | iterations 2+ |

Phase 5 parity: `stardust/dynamics/parity.json` replayable checks per row (dialog open, accordion toggle, listing count ≥ 6, calculator example values, links to auth apps 200 on source host).
