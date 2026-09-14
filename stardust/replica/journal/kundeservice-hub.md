## 2026-09-14T17:49:56Z — kundeservice-hub archetype (privat/kundeservice) recreated and gated

**Prompt:** worker directive (second family).

**Decisions:** family CSS imports category-hub.css (shared icon-card list, banner, tip); chat-field is a static form (dynamics #6 interim); the 10/8-column FFE rows are sized as percentages of the 1280 container (min(83.33%, 1066.67px)); image-less medium cards collapse their image row.

**Artifacts touched:** modules/kundeservice-hub.mjs, css/kundeservice-hub.css, stardust/prototypes/nb-bank-privat-kundeservice-html-proposed.html, stardust/replica/lift/ks-*.json, stardust/replica/gates/ks-{1440,360}/*, stardust/replica/motion/ks-1440.json, stardust/replica/progress/kundeservice-hub.json.

**Findings worth flagging:** 1440 pixel 0.28 % Δ0, header 99.58 %, footer 99.66 %; 360 pixel 1.09 % Δ0, footer 98.93 %, header 96.42 % (0.14 % excluding the focused skip link); content-diff none; visual-diff none. The live footer on this page has an empty contact paragraph (994/1555 px footers), mirrored automatically.

**Open questions:** none. **Next:** market-landing.

---
