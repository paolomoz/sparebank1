---
_provenance:
  writtenBy: stardust:stardust (hands-off activation) — replica Phase 2 will append the preserve-mode record
  writtenAt: 2026-09-14T14:58:23Z
  againstInput: https://www.sparebank1.no/ — "full migration as is, then a redesigned version; scope the full site, start with a production-ready 100-page iteration"
  readArtifacts:
    - scope/ (sitemaps, census)
    - stardust/roster.md
---

# Direction — sparebank1.no (Flow A: preserve mode / same-design migration)

## Hands-off mode — activated 2026-09-14T14:58:23Z

Activated by the autonomous presales mandate (Paolo, relaying Bertrand's Sparebank1 pilot request,
2026-09-14). `state.json.handsOff: true` is stamped by the extract state writer. Every interactive
gate auto-resolves per master SKILL.md § Hands-off mode; quality gates run at full strength.
Archetype approvals are recorded as `approvedBy: "hands-off"` only after content-diff (0 structural 🔴),
visual-diff, pixel ≤ 10 %, height |Δ| ≤ 8 px, chrome crop, and the motion-observe interaction-parity
pass all pass at 1440 and 360.

### Named assumptions
- **A1 — design-system boundary.** One design system across all 13 properties (shared clientlib
  `/etc.clientlibs/settings/wcm/designs/sb1/nettsider/clientlib_base.*.css`, 425 KB; FFE classes;
  SpareBank1 Regular/Medium/Title-Medium woff2). Iteration 1 = shared property `/nb/bank/`.
- **A2 — volume caps.** 100 pages overall, 20 per template. Roster: 12 header links, 10 footer
  utilities, 22 category hubs, 8 om-oss, 3 market landings, 24 product pages, 12 FAQ, 8 news,
  4 theme, 4 tools, 4 static/stories, 1 listing.
- **A3 — one canonical direction.** Flow A has no direction (preserve mode). Flow B (redesign) lives
  in the sibling project and commits to a single direction there.
- **A4 — inconsistency register empty** (pure replica) unless the gate surfaces a defect.
- **A5 — fonts.** SpareBank1 web fonts are the bank's own proprietary faces served from its
  clientlib. For the pilot they are self-hosted from the captured woff2 (customer-owned brand
  assets on a customer pilot); flagged for the customer's confirmation before any public launch.

---

# Direction — preserve mode (same-design migration) — replica Phase 2, 2026-09-14T15:16:33Z

<!-- _provenance: writtenBy stardust:replica (Phase 2 mechanical promotion); againstInput https://www.sparebank1.no/nb/bank/ (100-page roster); readArtifacts stardust/current/PRODUCT.md, DESIGN.md, DESIGN.json -->

Mode: PRESERVE. The target spec is the captured current state of https://www.sparebank1.no/nb/bank/,
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-09-14T15:16:33Z, byte-identical, cmp-verified). Branch: full-prep
(verbatim promotion — the --prep artifacts exist; no bounded synthesis).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(empty — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

Dynamic surface: stardust:dynamics Phases 1–3 run in this phase → stardust/dynamic-features.md
(+ -plan.md); every row carries a disposition before recreation starts.
