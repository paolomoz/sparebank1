---
_provenance:
  writtenBy: stardust:extract (Phase 4, descriptive — authored directly from the captured surface; impeccable init.md § Step 4 used as the format spec)
  writtenAt: 2026-09-14T15:55:00Z
  againstInput: https://www.sparebank1.no/ (100-page hands-off roster on /nb/bank/, stardust/roster.md)
  readArtifacts:
    - stardust/current/pages/*.json (100)
    - stardust/current/_brand-extraction.json
    - stardust/current/_page-types.json
    - stardust/current/_modules.json
    - scope/ (13 sitemaps, 9,821 URLs; census.tsv)
  mode: descriptive-current-state
---

# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Existing production site: Adobe Experience Manager 6.5 (on-premise) at `www.sparebank1.no`, one
site design (`/etc.clientlibs/settings/wcm/designs/sb1/nettsider/`) shared by 13 properties — the
alliance site `/nb/bank/` and 12 regional banks. Front end is the bank's own open design system
**FFE** (185 `--ffe-*` tokens, `ffe-grid`, `ffe-button`, `ffe-accordion`) plus AEM components
(`columns-grid`, `background-container`, `visual-nav`, `faq`, `feedback`, `contact-section`,
`bank-choice`). A second clientlib variant `nettsider-frontend` serves the news-article and campaign
templates (12/100 pages). Interactive widgets are React apps mounted into the page (loan/savings
calculators, currency calculator, bank-choice). Served through CloudFront + Envoy. Third parties:
Adobe Analytics/Target/Edge, Demdex, boost.ai chat, YouTube, Cision. _provenance: observed (clientlib
paths, `window.SB1.config`, endpoint reach signals in `_crawl-log.json#dynamicSurface`)._

## Users

Norwegian retail customers (privat) and small/medium businesses (bedrift) of the SpareBank 1
alliance — people choosing a mortgage, car loan or refinancing, opening accounts and cards, saving
in funds or for children, sorting out pension, buying insurance (Fremtind), and getting help
(FAQ, block a card, report a claim, complaints). A third audience reads about the alliance itself
(om oss: press, investors, careers, sustainability, privacy). Visitors are routed to their
regional bank by postcode or location ("Vi er flere banker i hele Norge"). _provenance: observed
(nav taxonomy Privat · Bedrift · Om oss; market sections Daglig bruk · Låne · Spare · Pensjon ·
Forsikring · Eiendom · Tips og råd · Kundeservice · LOfavør-fordeler; bank-choice band on 70/100 pages)._

## Product Purpose

The shared site is the alliance's product and service catalogue: it explains each product in plain
bokmål, shows prices and conditions once a bank is chosen, and hands off to the authenticated
nettbank/mobilbank or to application flows ("Søk boliglån", "Bli kunde", "Logg inn"). Success is a
started application, a log-in, a booked adviser meeting, or a self-served answer (FAQ, tools).
_provenance: observed (CTA frequency: Logg inn 100 pages, Bli kunde 66, Bruk min posisjon 70; product page
button rows link to `/bank/nettbank-privat/*` application apps)._

## Positioning

Not one bank but an alliance of independent local savings banks with shared products, one brand and
one platform: "Vi er flere banker i hele Norge" — local advisers and offices everywhere, national
products and digital services, LOfavør member benefits for LO union members, and a friendly,
illustrated, jargon-free tone. _provenance: observed (bank-choice band copy, "Vi er flere banker med
rådgivere i hele Norge", LOfavør banners on 13 pages, om-oss/hjemme campaign "Der du føler deg hjemme")._

## Operating Context

Every shared-site page carries: global header (top bar + 9 market sections), the bank-choice band,
a back-link breadcrumb, an FAQ accordion, a page-feedback strip, the "Kontakt oss" channel row and
the Fjell-blue footer. Prices, rates and some conditions are bank-specific and load only after a
bank is chosen (rate service, `artikler.export.json` listings, `/openapi/nettsider/ressurser/bank/user`
identity call, cookie-consent identity endpoint). Regulated financial copy — IPID insurance
documents, "effektiv rente" examples, terms (vilkår), privacy statements — appears verbatim and must be
preserved. Login and application flows live on `/bank/nettbank-privat/*` and
`kundeforsikring.sparebank1.no` (out of scope; linked). _provenance: observed (system components, dynamic
endpoint roll-up, footer links)._

## Capabilities and Constraints

- Full-site scope: 9,821 URLs across 13 sitemaps; iteration 1 = 100 pages on `/nb/bank/`
  (see `stardust/roster.md`). Shared-site template census (295-page sample): FAQ 41 %, product 22 %,
  news 16 %, theme 6 %, category 4 %, om-oss 2 %, others ≤ 1 %.
- Content shapes in the 100-page inventory (`_page-types.json`): product/program 34 · landing 26
  (3 market, 20 category hubs, 2 kundeservice hubs, 1 campaign) · article 22 (12 FAQ, 10 news) ·
  static 10 · form/tool 6 · listing 2. 13 archetype families.
- Interactive surfaces that are part of the content: bank-choice (postcode/geolocation, 70 pages),
  FAQ accordions (27), page feedback (74), loan/savings/currency calculators (React, 6 pages), price
  cards fed by a rate service, YouTube embeds (8), tables (10), glossary modals, article listings fed
  by `*.export.json`, share links on news articles. Triage in `stardust/dynamic-features.md`.
- Illustrations are lazy-loaded through a custom `data-lazy-src` mechanism (placeholder = the logo);
  the real asset URLs are in the rendered DOM. No CDN blocking observed: all assets resolve.
- Two login pages linked from header/footer are not in the sitemap (authenticated apps) — linked, not migrated.
- Terminology: bokmål throughout (one regional bank, Sogn og Fjordane, uses nynorsk); LOfavør,
  BSU, BankID, Vipps, eFaktura, AvtaleGiro, IPID, Fremtind (insurer), nettbank/mobilbank.

## Brand Commitments

Name "SpareBank 1" with the red "1" mark (`logo.svg`); proprietary SpareBank1 type family; the FFE
design system and its Norwegian nature-named palette (Fjell, Vann, Frost, Sand, Multe, Lyng, Bær,
Nordlys, Myrull, Natt); flat spot illustrations; the alliance bank-choice band. _provenance: observed._

## Evidence on Hand

- 100 live Playwright renders: `stardust/current/pages/<slug>.json` + `.html` (settled DOM), full-page
  screenshots in `assets/screenshots/`, contact sheets in `stardust/validation/extract-contact-sheets/`.
- Fonts (3 woff2) in `assets/fonts/`; clientlib CSS/JS bundles in `assets/css/`; logo + favicon in `assets/`.
- `_ffe-tokens.json` (185 tokens), `_brand-extraction.json`, `_modules.json`, `_page-types.json`,
  `_prep-inventory.json`, `_crawl-log.json` (+ run1/run2/run3 copies), `_aem-typing-draft.json`.
- Absent (do not fabricate): bank-specific prices/rates (load after bank choice), calculator internals,
  chat transcripts, authenticated content, real user testimonials beyond the published kundehistorier.

## Product Principles

1. **One brand, many banks** — every page must keep the path to a regional bank one step away.
2. **Plain language first** — explain the product before selling it; FAQ answers are first-class content.
3. **Self-service before contact** — tools, FAQs and guides come before the contact row, which is always present.
4. **Preserve regulated copy verbatim** — terms, rate examples, IPIDs and privacy text are not editorial.
5. **Warm and local in tone** — real people, real places, friendly illustrations; never corporate-cold.

## Accessibility & Inclusion

FFE ships WCAG-oriented components: visible orange focus rings, `aria-hidden` decorative images, skip
link "Til hovedmeny", accordion buttons with `aria-expanded`, sentence-case headings, 16px body with
24px line-height, tabular numerals for figures. Public-sector-adjacent Norwegian sites are subject to
the WCAG 2.1 AA requirement (forskrift om universell utforming av IKT). _provenance: observed markup +
regulatory context (inferred)._
