## 2026-09-14T18:19:12Z — market-landing archetype (privat.html) recreated and gated

**Prompt:** worker directive (third family).

**Decisions:** family CSS imports kundeservice-hub.css (hub grid rows, banner, tip); campaign-carousel rendered as one static slide (12-col grid, 5/7 split, photo right; stacked on mobile) with no controls (none exist on live for a single slide); the mobile-only `.market-nav` strip is inserted verbatim by the campaign handler because author.mjs drops body-level siblings; `related-topics`, `banner-small` and `image` registry keys are overridden but reproduce canon's output for every other family (dates, chevron arrows, two-column banner, authored image max-width only on market pages).

**Artifacts touched:** modules/market-landing.mjs, css/market-landing.css, stardust/prototypes/nb-bank-privat-html-proposed.html, stardust/replica/lift/privat-{1440,360}-{detail,banner}.json, stardust/replica/gates/privat-{1440,360}/*, stardust/replica/motion/privat-1440.json, stardust/replica/progress/market-landing.json, stardust/replica/canon-requests.md (6 entries), scripts/replica/_dump.mjs (probe helper).

**Findings worth flagging:** 1440 pixel 5.28 % Δ0 (0.23 % outside the hero), header 99.58 %, footer 99.69 %; 360 pixel 4.85 % Δ0 (1.52 % outside the hero), footer 98.93 %, header 97.04 % (1.33 % excluding the focused skip link); content-diff none (61/61 texts; 2 missing images fixed → chevrons); visual-diff advisory only. The hero differs because the live campaign rotates between loads (the day's capture shows a different campaign than the sidecar) — permanent residual, geometry identical. Chrome-parity: same canon-level header/footer deltas as lan.

**Open questions:** market-nav breakpoint assumed <1024 (only 360/1440 measured). **Next:** none — three families done.

---
