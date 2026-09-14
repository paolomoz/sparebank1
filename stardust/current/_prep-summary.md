<!-- _provenance: writtenBy stardust:extract --prep (via stardust:replica Phase 1); writtenAt 2026-09-14T15:45:00Z; readArtifacts: stardust/state.json, stardust/current/_crawl-log.json, _page-types.json, _modules.json, pages/*.json -->

extract --prep complete
=======================

Inventory:    100 pages crawled (100 new; roster stardust/roster.md; 3 runs: 100 medium + 6 slow recaptures + 3 after consent fix)
Provenance:   100/100 live (every page has Playwright evidence: renderedBy playwright, waitMs 2500/5000, httpStatus 200, stylePass merged on 100/100)
Discovered:   9,821 URLs across 13 sitemaps (shared /nb/bank/ 3,124 + 12 regional banks 6,697); iteration 1 = 100 on /nb/bank/
Page types:   program 34 · landing 26 · article 22 · static 10 · form 6 · listing 2
              (LLM-inferred from AEM pageType + clientlib variant + vision check; catalog in _page-types.json)
Archetype families (13 → one gated prototype each):
              product 30 · category-hub 20 · faq 12 · news-article 10 · om-oss 8 · tool 6 · theme 4 ·
              market-landing 3 · kundeservice-hub 2 · utility 2 · campaign-landing 1 · news-listing 1 · markedsnytt-listing 1

Module candidates: 45 (_modules.json; top-level <main> AEM component wrappers)
  columns-grid          52 pages ×145   text+image columns (workhorse)
  background-container  53 pages ×107   hero / tinted feature band, 96px-rounded imagery
  visual-nav            17 pages ×76    image card navigation grid
  feedback              58 pages ×58    "Hva synes du om denne siden?" (dynamic)
  referance             38 pages ×38    "Sammenlign priser" CTA band
  related-products      19 · faq 17 · static-cards 17 · tip 16 · banner-small 12 · shortcuts 10 · related-topics 10 · usp 9 · sb1-article 7 · calculator-loan 2 · prices 1 · currency-converter 1
  bank-choice band      70 pages        (rendered outside <main>; system component — "Vi er flere banker i hele Norge")

System components: site-header (5 variants: privat / bedrift / om-oss / frontend / minimal), site-footer (6 variants), bank-choice band, contact-section, feedback, breadcrumb back-link

Typed slots:  filled per page (pages/<slug>.json § slots: headline, deck, meta, sections, h3, ctas, images, faqItems, flags)

Dynamic surface (reach, _crawl-log.json#dynamicSurface): 26 same-site data endpoints on 100 pages
  (bank/user identity, footer JSON, artikler.export.json listings, consent identity, rate/price services,
  calculators), 0 search forms, 0 hydrated shells → depth + triage in stardust:dynamics (Phase 2).

Vision check: 95 ok · 5 recaptured (2 consent-dialog captures — crawler label list patched; 3 lazy-placeholder
  captures — custom data-lazy-src loader, real URLs in rendered DOM) · 0 suspect.
Wait summary: 92 resolved at medium (2.5 s), 8 at slow (5 s), 0 fallbacks.
Media summary: illustrations lazy-load via data-lazy-src (placeholder = logo.svg); all assets resolve (no CDN block).

Next: replica Phase 2 — mechanical promotion + empty inconsistency register + dynamics Phases 1–3.
