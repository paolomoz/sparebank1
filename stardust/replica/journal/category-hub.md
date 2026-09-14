## 2026-09-14T17:43:50Z — category-hub archetype (privat/lan) recreated and gated

**Prompt:** worker directive — recreate + gate category-hub, kundeservice-hub, market-landing per ARCHETYPE-BRIEF.md.

**Decisions:**
- visual-nav is client-rendered per breakpoint on live (data-* attributes drive a desktop photo+card and a mobile photo-with-overlapping-card); both variants are authored in one DOM (modules/category-hub.mjs) and toggled at 768px.
- LOfavør cobranding content stays a collapsed static snapshot (dynamics #14); the toggle mirrors the observed class mutations.
- The shared `tip` registry key is now owned by utility.mjs (loads later); category-hub.css styles that markup instead of fighting it — recorded in canon-requests.md.
- Hub-level rhythm (72/48px module gaps, full-width hr/shortcuts/reference, 72/56 column-grid padding) lives in category-hub.css scoped to `.page--category-hub`.

**Artifacts touched:** stardust/scripts/replica/modules/category-hub.mjs, stardust/prototypes/css/category-hub.css, stardust/prototypes/js/category-hub.js, stardust/prototypes/assets/chevron.svg, stardust/prototypes/nb-bank-privat-lan-html-proposed.html, stardust/replica/lift/lan-*.json, stardust/replica/gates/lan-{1440,360}/*, stardust/replica/motion/lan-{1440,360}.json, stardust/replica/progress/category-hub.json, stardust/replica/canon-requests.md, stardust/scripts/replica/_probe.mjs (+ _probe-lan.mjs).

**Findings worth flagging:**
- Gate: 1440 pixel 0.39 % Δ0, header 99.58 %, footer 99.69 %; 360 pixel 1.98 % Δ0, footer 98.93 %, header 96.42 % (0.14 % excluding the live focused skip link); content-diff clean at both widths; visual-diff clean.
- The live site timed out twice on chrome-parity/motion-observe navigations (60 s) when hits were close together; spacing ≥25 s fixed it.
- Inline-block rows (shortcuts) need `vertical-align: top` + zero line-height on the list to match live pitch exactly.

**Open questions:** none.

**Next:** kundeservice-hub, then market-landing.

---
