# Tracking — sparebank1 (Flow A: replica → EDS)

Updated: 2026-09-14T14:58:23Z

| phase | status | evidence |
|---|---|---|
| 0 EDS repo | done | fstab.yaml, status.jsonl (eds-new-site), https://main--sparebank1--paolomoz.aem.live/ 200 |
| 1 extract (100 pages) | done | stardust/current/_prep-summary.md · 100/100 live · vision 95 ok / 5 recaptured |
| 2 preserve direction + dynamics triage | done | stardust/direction.md · stardust/replica/inconsistency-register.md · stardust/dynamic-features.md (20 features, decision batch) |
| 3 recreate archetypes | 1/13 (product) | stardust/prototypes/*-proposed.html · scripts/replica/author.mjs |
| 4 source-fidelity gates | product PASS 1440 0.37% / 360 1.54% | stardust/replica/progress.json · gates/boliglan-* |
| 5 migrate → deploy → rollout → qa | pending | |
| Flow B redesign (sibling project) | pending | ../sparebank1-redesign |

## Decisions
- D1 slug `sparebank1`; repo IS the stardust project root (experian pattern).
- D2 pilot property = shared alliance site `/nb/bank/`; `/nb/bank.html` itself is a noindex JS
  bank-chooser shell (redirects by device preference) → excluded from the roster; `/nb/bank/privat.html`
  is the effective home.
- D3 login pages (`/privat/innlogging.html`, `/bedrift/innlogging.html`) are header/footer links but not
  in the sitemap (authenticated app entry) → kept as external links, not migrated.
- D4 hands-off approvals; quality gates unchanged; empty inconsistency register (pure replica).
- D5 gate breakpoints 1440 + 360 (replica default).
