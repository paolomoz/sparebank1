## 2026-09-14T16:47:28Z — faq archetype (Spørsmål question page, bedrift chrome) recreated + gated

**Prompt:** worker fork — recreate and gate the `faq` family (archetype fast-flytende-rente-bedriftslan) per ARCHETYPE-BRIEF.md.

**Decisions:**
- One module handler `question-page` (modules/faq.mjs): breadcrumb → h1 → answer richtext (flow-root, first-paragraph margin kept) → inline feedback; family CSS only.
- Bedrift chrome variant renders from the DOM through the canon header()/footer(); verified with chrome-parity (only canon-level deltas remain).
- Footer defect (hidden contact-panel paragraph picked up by footer()) worked around in faq.css and filed in canon-requests.md.

**Artifacts touched:** stardust/scripts/replica/modules/faq.mjs, stardust/prototypes/css/faq.css, stardust/prototypes/nb-bank-bedrift-kundeservice-bm-lan-finansiering-fast-flytende-rente-bedriftslan-html-proposed.html, stardust/replica/gates/faq-{1440,360}/, stardust/replica/lift/faq-{1440,360}-detail.json, stardust/replica/motion/faq-1440.json, stardust/replica/progress/faq.json, stardust/replica/canon-requests.md.

**Gate:** 1440 pixel 0.87 % Δ1 · header 99.58 % · footer 98.90 % · content-diff 0 🔴 (1 🟡 = JSON-LD script text) · visual none. 360 pixel 1.35 % Δ1 · footer 98.03 % · header 96.4 % (0.14 % excluding the live focused skip link). Live hits: 8.

**Findings worth flagging:** live `.question-page__answer .text` contains its paragraph margins (BFC) — mirror with `display: flow-root`; the list indent differs per breakpoint (li margin-left 32 desktop / 16 mobile, ul margin-left 16 desktop only).

**Open questions:** none. **Next:** utility (kontakt) archetype.

---
