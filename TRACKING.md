# Tracking — sparebank1 (Flow A: replica → EDS)

Updated: 2026-09-15T15:10:00Z

| phase | status | evidence |
|---|---|---|
| 0 EDS repo | done | fstab.yaml, status.jsonl (eds-new-site), https://main--sparebank1--paolomoz.aem.live/ 200 |
| 1 extract (100 pages) | done | stardust/current/_prep-summary.md · 100/100 live · vision 95 ok / 5 recaptured |
| 2 preserve direction + dynamics triage | done | stardust/direction.md · stardust/replica/inconsistency-register.md · stardust/dynamic-features.md (20 features, decision batch) |
| 3 recreate archetypes | done — 13/13 approved (hands-off) | stardust/prototypes/*-proposed.html · scripts/replica/author.mjs + modules/<family>.mjs · stardust/replica/progress.json |
| 4 source-fidelity gates | 13/13 PASS (pixel 0.23–7.94 %, Δh ≤ 3, chrome ≥ 98 %; market-landing hero rotation, campaign video, markedsnytt YouTube placeholder justified) | stardust/replica/progress.json · gates/<short>-{1440,360} |
| 5 EDS conversion + deploy | done — 100/100 pages + 12 chrome docs + redirects LIVE on https://main--sparebank1--paolomoz.aem.live; QA sweep 100/100 (200, 0 about:error, .html redirects); 13/13 archetypes gated on the published origin (10 within the bar at both widths; theme Δh 33/47 spacer class, markedsnytt 360 video placeholders); product-sibling mobile fidelity = recorded residual (stardust/rollout/eds-requests.md) | content/**, blocks/**, stardust/rollout/{eds-log,deploy-ledger.json,svg-sizes.json} |
| Flow B redesign (sibling project) | done — LIVE on https://main--sparebank1-redesign--paolomoz.aem.live/nb/bank/privat: 100/100 pages, 13/13 archetypes PASS vs approved prototypes (≤2.28 %, Δh ≤1, 0 content reds), 17 blocks; repo paolomoz/sparebank1-redesign, DA paolomoz/sparebank1-redesign | ../sparebank1-redesign/stardust/{direction.md,journal.md} |

## Decisions
- D1 slug `sparebank1`; repo IS the stardust project root (experian pattern).
- D2 pilot property = shared alliance site `/nb/bank/`; `/nb/bank.html` itself is a noindex JS
  bank-chooser shell (redirects by device preference) → excluded from the roster; `/nb/bank/privat.html`
  is the effective home.
- D3 login pages (`/privat/innlogging.html`, `/bedrift/innlogging.html`) are header/footer links but not
  in the sitemap (authenticated app entry) → kept as external links, not migrated.
- D4 hands-off approvals; quality gates unchanged; empty inconsistency register (pure replica).
- D5 gate breakpoints 1440 + 360 (replica default).
- D6 EDS authoring: live pseudo-heading spans (`.h2–.h6`) become headings at their visual rank; oversize
  authored SVGs (> 40 KB, 67 of 285 on the site) become PNG rasterisations on DA media; internal links
  outside the 100-page roster bounce to www.sparebank1.no (a bounce beats a 404); cards keep the authored
  title link inside a clickable `div` (live model).
- D7 known permanent capture residuals: live focused skip link in the 360 header crop; to-top disc at
  chunk seams; card photo cover-crop; market-landing campaign rotation; campaign video frame.
- D8 2026-09-15 human visual review (Paolo) found systematic loss on category-hub siblings (card bodies/CTAs,
  news rails, tabs, calculators, hero/lead composition, chevrons, media crops). Fixed in two passes (W6 desktop,
  W7 mobile); all seven reviewed pages now ≤ 9.3 % at 360 and ≤ 8.4 % at 1440 on the published origin; the
  general causes and proposed stardust source changes are in stardust/STARDUST-IMPROVEMENTS.md and
  stardust/learnings.md.
