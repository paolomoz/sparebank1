<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-09-14T15:16:32.167Z · input stardust/current/_dynamics.json (6 pages, 18 findings) · target probe https://main--sparebank1--paolomoz.aem.page -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-cms-app-settings-object-digitaldata | A | CMS / app settings object digitalData | 5/6 | static-snapshot | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 2 | a-first-party-api-get-bin-sb1-components-footer | A | first-party API GET /bin/sb1/components/footer | 1/6 | data-fed | needs-business-decision | pending | off-origin-data | which tier for the target host; consumer on the migrated pages? | **dead on target (404)** |
| 3 | cr-client-rendered-slot-tab-js-tab-content-default | CR | client-rendered slot tab js-tab-content default | 1/6 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 4 | cr-client-rendered-slot-tab-js-tab-content | CR | client-rendered slot tab js-tab-content  | 1/6 | static-snapshot | self | pending | settled-dom-snapshot | inspect the consumer |  |
| 5 | cr-main-empty-at-load-filled-after-client-rendered-page | CR | main empty at load, filled after (client-rendered page) | 1/6 | static-snapshot | needs-human-capture | pending | client-rendered-page | human-browser capture; never migrate blank |  |
| 6 | d-first-party-data-file-get-nb-bank-om-oss-nyheter-export-js | D | first-party data file GET /nb/bank/om-oss/nyheter.export.json | 1/6 | data-fed | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 7 | i18n-locale-variants-nn-nn-nn-nn-nn | I18N | locale variants nn,nn,nn,nn,nn | 3/6 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 8 | i18n-locale-variants-no | I18N | locale variants no | 1/6 | rebuild-native | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 9 | l-listing-candidate-tabs-content-aem-main-container-5-cards | L | listing candidate tabs__content aem-main-container (5 cards) | 1/6 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 10 | l-listing-candidate-ul-12-cards | L | listing candidate ul (12 cards) | 1/6 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 11 | l-listing-candidate-text-wrapper-4-cards | L | listing candidate text-wrapper  (4 cards) | 1/6 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 12 | l-listing-candidate-text-wrapper-5-cards | L | listing candidate text-wrapper  (5 cards) | 1/6 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 13 | l-listing-candidate-text-wrapper-9-cards | L | listing candidate text-wrapper  (9 cards) | 1/6 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 14 | l-listing-candidate-text-wrapper-3-cards | L | listing candidate text-wrapper  (3 cards) | 1/6 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 15 | l-listing-candidate-newscards-32-cards | L | listing candidate newscards (32 cards) | 1/6 | index-backed | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 16 | m-modal-trigger-overlay-btn-target-outside-dom-at-capture | M | modal trigger overlay-btn → target outside DOM at capture | 2/6 | rebuild-native | self | pending | modal-loader | none |  |
| 17 | m-modal-trigger-overlay-btn-chrome-only-target-outside-dom-a | M | modal trigger overlay-btn (chrome only) → target outside DOM at capture | 1/6 | rebuild-native | self | pending | chrome-interaction | none (motion-observe evidence) |  |
| 18 | x-sign-in-account-links | X | sign-in / account links | 1/6 | decided-out | needs-backend | pending | decided-out | auth / commerce on the new host? |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 6 row(s) — read-settings, settled-dom-snapshot, sheet-sync, modal-loader, chrome-interaction.
- **One owner decision batch:** 11 row(s) — which tier for the target host; consumer on the migrated pages? · human-browser capture; never migrate blank · scope of the locale trees · index-driven or editorially curated?.
- **Already delivered by the capture pipeline:** 0 row(s) — no work.
- **Host-bound on the target:** 2 of 2 probed API paths — the off-origin data work.

## Phases

- **listings** — 7
- **capture** — 3
- **locale wave** — 2
- **interactive** — 2
- **detect** — 1
- **off-origin data** — 1
- **data** — 1
- **register** — 1
