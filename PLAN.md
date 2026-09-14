# Plan — sparebank1.no → AEM Edge Delivery Services (Document Authoring)

Written: 2026-09-14 · Owner: Claude (stardust 0.20.0 + impeccable 4.3.1) · Status: see TRACKING.md

## Goal

Presales pilot for SpareBank 1 (Norway, AEM 6.5 on-prem today). Deliver, fully hands-off with stardust:

1. **Migration as-is (replica):** re-platform a production-ready 100-page slice of
   www.sparebank1.no onto EDS + da.live keeping the current design near pixel-perfect.
   → this repo (`paolomoz/sparebank1`).
2. **Redesigned version:** the same 100 pages under a new visual direction, so the customer
   can compare "same site, new platform" with "new platform, new design".
   → sibling project `../sparebank1-redesign` (repo `paolomoz/sparebank1-redesign`), seeded from
   this project's `stardust/current/` extract (one crawl, two flows — never mixed in one project).

## Full-site scope (inventoried, not migrated in iteration 1)

| property | sitemap | pages |
|---|---|---|
| shared alliance site `/nb/bank/` | `nb/bank.sitemap.xml` | 3,124 |
| 12 regional banks (`/nb/<bank>/`, `/nn/sogn-fjordane/`) | 12 sitemaps | 6,697 |
| **total** | 13 sitemaps | **9,821** |

All 13 properties share one AEM design (`sb1/nettsider` clientlib, FFE design system, SpareBank1
web fonts) — one design system, one target. Evidence in `scope/` (sitemaps, census.tsv).

Shared-site page-type census (295-page stratified sample, AEM `pageType`):
Spørsmål/FAQ 41 % · Produkt 22 % · Nyheter/news (untyped) 16 % · Tema 6 % · Kategori 4 % ·
Om oss 2 % · Marked / Verktoy / Underkategori / Oversikt / Kundeservice / Basepage ≤ 1 % each.

## Iteration 1 — 100 pages (hands-off caps: 100 overall, ≤ 20 per template)

Roster in `stardust/roster.md` (source `scope/roster.tsv`). Priority: header + footer links →
section landings → representative detail pages per template. All on `/nb/bank/` (the shared
alliance property; regional banks are the same templates with bank-specific content).

## Flow A (this repo) — same design ⇒ `replica → migrate → rollout`

`replica` subsumes the prep cascade in preserve mode; `prepare-migration` and `direct` are never run here.

0. EDS repo via `eds-new-site` — done (repo, fstab, Code Sync, seed content, both hosts 200).
1. EXTRACT — `extract --prep --dynamics` semantics on the roster (crawl.mjs headless, medium wait,
   concurrency 4) → recipe-completion pass (capture-styles) → vision check → brand surface →
   descriptive PRODUCT/DESIGN → brand-review.html → prep inventory (types, modules, slots).
2. PRESERVE DIRECTION — verbatim promotion to root; empty inconsistency register (pure replica);
   dynamics Phases 1–3 (detect / classify / triage) → `stardust/dynamic-features.md`.
3. RECREATE — one clean prototype per archetype (cumulative canon CSS + per-archetype CSS), values
   lifted from the live clientlib CSS at 1440 and 360.
4. SOURCE-FIDELITY GATE — per archetype × breakpoint: content-diff 0 🔴, visual-diff clean,
   pixel ≤ 10 %, |Δh| ≤ 8 px, chrome crop, motion-observe interaction parity. Cap 3 iterations.
5. HANDOFF — migrate (sibling tier) → deploy (EDS blocks, EW-editable, template-slotted bias) →
   rollout (whole roster, published-origin gate) → qa.

## Flow B (sibling project) — redesign ⇒ `prepare-migration → migrate → rollout`

Seed `stardust/current/` from Flow A, then `direct --prep` (one canonical direction, named
assumptions), `prototype --prep`, migrate, deploy, rollout, qa. Started after Flow A's archetypes
gate (Chromium memory contention on this machine makes parallel pixel gates unreliable).

## Hard blockers (stop, never guess)
Source unreachable · DA_TOKEN expired and unrecoverable · signal-absent brand surface.
