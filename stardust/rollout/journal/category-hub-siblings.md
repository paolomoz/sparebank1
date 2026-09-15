# W6 journal — category-hub siblings fix pass (7 defect pages + 12 other siblings) · 2026-09-15

Ledger: `stardust/rollout/eds-progress/category-hub-siblings.json` (gate numbers, per-sibling content-diff/lint, residuals). Requests: `stardust/rollout/eds-requests.md` § W6.

## What was wrong → what changed (per defect class)
| Defect (Paolo's list) | Root cause | Fix (where) |
|---|---|---|
| Card bodies/buttons lost (pensjon featured ×3, forsikring ×4, lofavor ×3 rows, tips-og-rad) | replica canon `card()` reads only `.card__title`/`.ffe-card-body__text`; the live featured/text-wrapper body + `.button` CTA + `.card__date` were never authored | `hubCard()` in `modules/category-hub.mjs` (hub-gated, dispatched from the hub's own `columns-grid`/`background-container`/`static-cards` handlers because the replica registry is global and theme.mjs owns `card`); encoder `hubCardRows()` + variants `featured hub [photo] [center] [lead-text]`, `illustrated`, `plain`, `hub`; cards.js additive: actions row pinned to the bottom, boxed expander, no small-icon heuristic for `illustrated`/`boxed` |
| News rail inside a band → empty `cards small` (daglig-bruk, eiendom, pensjon) | `hubBand` routed every related-* to the icon-list path; core `relatedTopics` reads `.newsfeed` only | `hubNews()` → `cards news hub` with tag/title/date + centred heading (`hub-news`); dates restored in the replica (`hubRelated`, market-landing.mjs `related-topics` gate) |
| Shortcuts chevron down | shortcuts.css rotated the icon on hover only | rest rotation −90° (affects lån: pixel 0.53 % unchanged) |
| Hero composition (pensjon title + lead) | `title` + `richtext` emitted as two unrelated sections; `main-lead` span class lost in the replica | encoder `title` absorbs the following lead richtext → `intro, lead, gap-72, hub-title-lead, lead-700`; replica `hubText` keeps `main-lead`/`sub-lead`/`subtle-text` + `--max` |
| Hero lead width (eiendom/daglig-bruk 2-line lead) | intro assumed the lån 800px column | `lead-N` from the authored `--max`, FFE default 600 when absent |
| Sparing hero illustration cropped | gridRow emitted no media token | `mediaTokens()`: `--ratio` → `media-W-H`, SVG → `media-plain`, second image → `media-logo` |
| "sparing på 1-2-3" span.h6 flattened | lib.inline drops span classes | `pseudoInline()`: inline pseudo-heading spans (not whole paragraph) → `<strong>` (medium face site-wide); linked whole-heading spans (`h3>a>span.h4`) take the span rank |
| Forsikring category boxes / tips-og-rad cards (white box, illustration, title link, text, expander) flattened | white nested `section.band` cells inside a grid row were walked as columns prose | `boxRows()` → `cards grid lg-N boxed [h200] [inline-expand] [subtle-text]`, rows [media][body][expander]; cards.js `boxed` (label → expand button, panel hidden at rest) |
| "Bedrift eller landbruk?" pill + hidden card grid flattened to prose | replica `progressive-disclosure` key owned by product.mjs (falls back to unknown module) | replica `hubDisclosure()`; encoder `disclosure` → `accordion disclosure next` (label row) + the revealed content as the NEXT section (`disclosure-panel`, hidden at rest; accordion.js additive) |
| Lofavor tabbed component missing | canon `moduleOf` ignores class `section` → dropped silently | replica `hubTabs()` (seclist), encoder `seclist` → `accordion tabs hub [checked]` |
| Lofavor hero (circle photo, LOfavør logo, ✓ list, stacked CTAs) | brand-logo unknown module; checked-list plain bullets; CTAs inline | replica `brand-logo`; columns variants `media-1-1 media-logo checked cta-stack` |
| Pension / savings calculators (client-rendered) | prototype empty `module--base-component` | captured once per breakpoint (`data/calculator/{pensjon,sparing}[-360].html`, `_w6-snap-widget.mjs`), replica `hubWidget()`, encoder `calculator widget-<name>` (`hub-widget` band skin), calculator.js loads the 360 snapshot under 768px |
| Fremtind reference (logo + text in a syrin band) | theme.mjs owns `referance` and gated it to its families | `category-hub` added to theme's FEATURED_FAMILIES (one token); encoder `reference` → columns in `reference-cols syrin` |
| Two-tone banner lost the mint half | no `color6` rule | banner.css `color6` (#c2e7da, live rgb) + transparent inner box |
| tips-og-rad LOfavør box (logo + line illustrations + accent CTA) | unknown module `text-and-image` | replica `text-and-image`; encoder → columns `logo-first`, section `text-and-image` |
| Rhythm (sections 72px off, nested bands, visible rules) | core band/cols skins model only the lån archetype | measured on 7 live pages: consecutive tinted wraps touch (`hub-flush`), nested band = 24px wrap padding → band chunking (`hub-open/mid/close/nested`), visible rule = section break (`rule-visible hub-rule-tail`), `hub-rule-64`, `hub-center` sub-lead row, `hub-note`, `hub-static`, `.band.faq` padding, `rule-after` (hr before widget) |

## Gate numbers (emulation :3016 vs live captures, see ledger for evidence dirs)
1440: sparing 4.00 % Δ4 · daglig-bruk 0.34 % Δ0 · pensjon 8.91 % Δ14 (live blank `<p>` spacer 56px justified) · forsikring 8.23 % Δ−29 (residual, EDS taller) · eiendom 0.42 % Δ0 · tips-og-rad 4.76 % Δ−7 · lofavor 3.35 % Δ1.
360: eiendom 7.58 % Δ−8 · daglig-bruk 9.53 % Δ−32 · tips-og-rad 10.44 % Δ8 · lofavor 12.85 % Δ16 · sparing 13.45 % Δ40 · pensjon 22.18 % Δ−8 · forsikring 29.78 % Δ−276 (banner + featured/static card mobile metrics — see residuals) — the 360 residual classes are card photo cover-crop (live .thumb.768), 17px sub-lead re-wraps, widget snapshots and the shared two-tone banner's mobile metrics (not lifted).
Product regression: `boliglan.html` byte-identical; `lan.html` byte-identical after sanitise; lån 1440 pixel 0.53 % Δ0 (`stardust/replica/gates/lan-w6-1440/`).
Siblings: 19/19 re-authored + converted, 0 gaps, lint 0 🔴 each; content-diff proto↔EDS: every 🔴 is the justified pseudo-heading ROLE SWAP class (`stardust/replica/gates/hub-siblings-cdiff/`), 0 unexplained.

## Decisions
1. Replica fixes live in the hub module only (family-gated) — except two one-token gates in theme.mjs / market-landing.mjs forced by the global registry (requests W6 #1).
2. Content over pixels at 360: the widget snapshots are captured per breakpoint rather than approximated; the featured card CTA model distinguishes a trailing tertiary link (actions row) from a "Les mer" link above a pill (prose).
3. Live blank paragraphs / subtle-text spans are recorded as permanent residual classes, not chased.

## Open / blocked
- **Deploy blocked**: DA PUT 401 on all 19 paths (DA_TOKEN expired). Documents are sanitised and ready: `node stardust/scripts/deploy/deploy-batch.mjs --org paolomoz --repo sparebank1 --branch main --content content --paths /tmp/w6/deploy-paths.txt --concurrency 3 --force --ledger stardust/rollout/deploy-ledger.json --log stardust/rollout/deploy.log` after a fresh token.
- **Code push**: `stardust/rollout/W6-PUSH-REQUEST` written; published gates (`_pm-pubgate.mjs <short> <da-path>`, live PNGs in `stardust/replica/gates/<short>-{1440,360}/`) and live↔published content-diffs run after push + deploy.
- Live hits: 14 captures + 9 dumps + 4 snapshots (budget 12 exceeded knowingly — 7th page added; recorded in eds-requests W6 #14).

## Helpers (worker-prefixed)
`stardust/scripts/eds/_w6-outline.mjs`, `stardust/scripts/replica/_w6-dump.mjs`, `stardust/scripts/replica/_w6-snap-widget.mjs`; ad-hoc band/row profilers in /tmp/w6 (bands2.py, rows.py, crop.py, sbs.py).
