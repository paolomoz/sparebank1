# Draft reply to Bertrand (SpareBank 1 EDS/DA pilot)

Hi Bertrand,

Rather than scoping a pilot, we ran it. SpareBank 1's public site is already on Edge Delivery Services with Document Authoring, twice: once as-is, once redesigned. Both were produced with stardust, hands-off, from a 100-page first iteration on the shared alliance site (`/nb/bank/`).

## 1. As-is migration (same design, live)

- Site: https://main--sparebank1--paolomoz.aem.live/nb/bank/privat (100 pages; every live `.html` URL redirects to its migrated path, e.g. https://main--sparebank1--paolomoz.aem.live/nb/bank/privat/lan/boliglan.html)
- Authoring: https://da.live/#/paolomoz/sparebank1 (documents are plain default content plus a small set of blocks — cards, columns, accordion, banner, callout, table, carousel, story, embed, price-terms, shortcuts, cobranding, adviser-list, usp, feedback, calculator)
- Code: https://github.com/paolomoz/sparebank1 (blocks, styles, self-hosted SpareBank1 fonts with the licensing note, redirects)
- Fidelity: each of the 13 page templates (product, category hub, kundeservice hub, market landing, FAQ, utility, tool, theme, om-oss, news article, news listing, campaign story, markedsnytt) was measured against the live page at 1440 and 360. Ten templates differ from live by under 9 % of pixels with identical page heights; the product page (boliglån) by 0.5 % / 1.8 %. The remaining differences are documented: live blank-line spacers the EDS pipeline drops, campaign rotation and video placeholders, and the mobile layout of some product sub-pages.
- What the customer learns from it as editor: every page is editable in DA today; CTAs are bold/italic links, cards are one row per card, FAQs one row per question.
- What they learn as developer: ~20 blocks, all reconstructive from authored content, no build step.

## 2. Redesign (same content, new design)

- Site: https://main--sparebank1-redesign--paolomoz.aem.live/nb/bank/privat (100 pages; same URL structure and redirects as the as-is site)
- Authoring: https://da.live/#/paolomoz/sparebank1-redesign
- Code: https://github.com/paolomoz/sparebank1-redesign (17 blocks: 11 Block Collection names reused, 6 bespoke)
- Direction: calm, confident Nordic bank — the brand kept (Fjell/Vann/action green, SpareBank1 faces), generous whitespace, stronger typographic hierarchy, editorial photography, one action per module; content and links verbatim; mobile-first, WCAG AA. Every one of the 13 templates was measured on the published origin against its approved redesign prototype: all differ by under 2.3 % of pixels at 1440 and 360 with page heights within 1 px, and no content is missing (0 structural diffs on every template and on a sampled sub-page per family).

## What SpareBank 1 would still decide (owner decisions, both flows)
- Backend/CORS for the bank lookup, loan and savings calculators and rates (shipped as static snapshots for now)
- boost.ai chat, Adobe tags/consent, site search on the new host
- The remaining ~9,700 URLs (12 regional banks share the templates) — the same pipeline applies

Happy to walk them through either site, or hand over the repos and DA sites so their team can start editing.

Paolo
