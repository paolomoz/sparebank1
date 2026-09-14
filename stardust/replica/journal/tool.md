## 2026-09-14T17:38:35Z — tool archetype (sperre-kort) recreated + gated

**Prompt:** worker fork — recreate and gate the `tool` family (archetype /privat/kundeservice/verktoy/sperre-kort.html).

**Decisions:**
- No new module: title, lead text, columns grids, tip (shared handler from modules/utility.mjs, now carrying `tip--left` / `tip--small`), rules and feedback are canon; family CSS lifts the page-title block, the 700px lead, the 10-column centred rows, the numbered-step list counter, the inline SVG illustration and the 72/48 module gaps.
- Login-modal CTAs keep their nettbank hrefs; the dialog is dynamics #3 (Phase 5).

**Artifacts touched:** stardust/prototypes/css/tool.css, stardust/scripts/replica/modules/utility.mjs (tip variants), stardust/prototypes/nb-bank-privat-kundeservice-verktoy-sperre-kort-html-proposed.html, stardust/replica/gates/sperrekort-{1440,360}/, stardust/replica/lift/sperrekort-{1440,360}-detail.json, stardust/replica/motion/sperrekort-1440.json, stardust/replica/progress/tool.json, stardust/replica/canon-requests.md.

**Gate:** 1440 pixel 0.23 % Δ0 · header 99.58 % · footer 99.69 % · content-diff none · visual none. 360 pixel 0.79 % Δ0 · footer 98.93 % · header 96.4 % (0.14 % excl. live focused skip link). Live hits: 11 (one wasted on a poisoned 15,830px stitch, re-captured).

**Findings worth flagging:** a live stitched capture can come back 3× the document height when the page grows during the scroll pass — always compare the stitch height with the lifted docH before gating.

**Next:** orchestrator merges progress/*.json + journal/*.md; canon-requests.md lists the shared fixes.

---
