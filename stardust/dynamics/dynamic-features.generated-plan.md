<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-09-14T15:23:33.139Z · input stardust/current/_dynamics.json (13 pages, 29 findings) · target probe https://main--sparebank1--paolomoz.aem.page -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-cms-app-settings-object-digitaldata | A | CMS / app settings object digitalData | 10/13 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 2 | a-first-party-api-get-bin-sb1-components-footer | A | first-party API GET /bin/sb1/components/footer | 3/13 (reach 12/100) | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 3 | a-first-party-api-post-api-personal-banking-boliglan-kalkula | A | first-party API POST /api/personal/banking/boliglan-kalkulator/economy | 1/13 (reach 2/100) | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 4 | a-first-party-api-post-api-personal-banking-boliglan-kalkula | A | first-party API POST /api/personal/banking/boliglan-kalkulator/annuity-loan | 1/13 (reach 2/100) | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 5 | cr-main-empty-at-load-filled-after-client-rendered-page | CR | main empty at load, filled after (client-rendered page) | 3/13 | static-snapshot | needs-human-capture | pending | client-rendered-page | human-browser capture; never migrate blank |  |
| 6 | cr-client-rendered-slot-main-js-productpage-productpage | CR | client-rendered slot main js-productpage productpage | 2/13 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 7 | cr-client-rendered-slot-cobranding-content-js-cobranding-con | CR | client-rendered slot cobranding__content js-cobranding-content  | 1/13 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 8 | cr-client-rendered-slot-js-faq-toggle-faq-button-more-ffe-bu | CR | client-rendered slot js-faq-toggle faq-button--more ffe-button | 1/13 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 9 | d-first-party-data-file-get-nb-bank-privat-sparing-markedsny | D | first-party data file GET /nb/bank/privat/sparing/markedsnytt/artikler.export.json | 2/13 (reach 6/100) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 10 | d-first-party-data-file-get-nb-bank-om-oss-hjemme-export-jso | D | first-party data file GET /nb/bank/om-oss/hjemme.export.json | 1/13 (reach 1/100) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 11 | d-first-party-data-file-get-nb-bank-om-oss-nyheter-bankkort- | D | first-party data file GET /nb/bank/om-oss/nyheter/bankkort-laget-av-resirkulert-plast.export.json | 1/13 (reach 1/100) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 12 | d-first-party-data-file-get-nb-bank-om-oss-nyheter-export-js | D | first-party data file GET /nb/bank/om-oss/nyheter.export.json | 1/13 (reach 3/100) | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 13 | i18n-locale-variants-nn-nn-nn-nn-nn | I18N | locale variants nn,nn,nn,nn,nn | 9/13 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 14 | i18n-locale-variants-no | I18N | locale variants no | 1/13 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 15 | l-listing-candidate-shortcuts-list-container-7-cards | L | listing candidate shortcuts-list__container (7 cards) | 1/13 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 16 | l-listing-candidate-card-list-card-list-small-12-cards | L | listing candidate card-list card-list__small (12 cards) | 1/13 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 17 | l-listing-candidate-card-list-card-list-price-10-cards | L | listing candidate card-list card-list__price (10 cards) | 1/13 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 18 | l-listing-candidate-ffe-accordion-15-cards | L | listing candidate ffe-accordion (15 cards) | 1/13 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 19 | l-listing-candidate-card-list-card-list-small-9-cards | L | listing candidate card-list card-list__small (9 cards) | 1/13 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 20 | l-listing-candidate-newscards-32-cards | L | listing candidate newscards (32 cards) | 1/13 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 21 | l-listing-candidate-newsfeed-list-newsfeed-wrap-3-cards | L | listing candidate newsfeed-list newsfeed-wrap (3 cards) | 1/13 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 22 | m-modal-trigger-overlay-btn-target-outside-dom-at-capture | M | modal trigger overlay-btn → target outside DOM at capture | 5/13 | rebuild-native | self | pending | modal-loader | none |  |
| 23 | m-modal-trigger-overlay-btn-chrome-only-target-outside-dom-a | M | modal trigger overlay-btn (chrome only) → target outside DOM at capture | 4/13 | rebuild-native | self | pending | chrome-interaction | none (motion-observe evidence) |  |
| 24 | m-modal-trigger-js-overlay-btn-a-content | M | modal trigger js-overlay-btn → a:content | 1/13 | rebuild-native | self | pending | modal-loader | none |  |
| 25 | m-modal-trigger-loginmodal-target-outside-dom-at-capture | M | modal trigger loginModal → target outside DOM at capture | 1/13 (reach 16/100) | rebuild-native | self | pending | modal-loader | none |  |
| 26 | t-analytics-adobe-analytics-experience-cloud-id | T | analytics: Adobe Analytics / Experience Cloud ID | 2/13 | embed-passthrough | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 27 | v-video-youtube | V | video: YouTube | 1/13 | embed-passthrough | self | pending | media-as-url | none (player ids are public) |  |
| 28 | v-iframe-without-src-runtime-injected-embed | V | iframe without src (runtime-injected embed) | 1/13 | embed-passthrough | needs-human-capture | pending | embed-passthrough | resolve the runtime src from a rendered capture |  |
| 29 | x-sign-in-account-links | X | sign-in / account links | 2/13 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 13 row(s) — read-settings, settled-dom-snapshot, sheet-sync, modal-loader, chrome-interaction, media-as-url.
- **One owner decision batch:** 15 row(s) — which tier for the target host; consumer on the migrated pages? · human-browser capture; never migrate blank · scope of the locale trees · index-driven or editorially curated? · which tags run on the new host; property ids · resolve the runtime src from a rendered capture.
- **Already delivered by the capture pipeline:** 0 row(s) — no work.
- **Host-bound on the target:** 7 of 6 probed API paths — the off-origin data work.

## Phases

- **listings** — 7
- **capture** — 4
- **data** — 4
- **interactive** — 4
- **off-origin data** — 3
- **locale wave** — 2
- **detect** — 1
- **tags** — 1
- **media** — 1
- **embeds** — 1
- **register** — 1
