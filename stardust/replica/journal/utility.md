## 2026-09-14T17:15:20Z — utility archetype (kontakt) recreated + gated

**Prompt:** worker fork — recreate and gate the `utility` family (archetype /privat/kundeservice/kontakt.html).

**Decisions:**
- New `table` handler (modules/utility.mjs): real <table> with verbatim cells (13 banks × phone × contact), caption kept visually hidden, mobile scroll-indicator row mirrored statically.
- Replaced the canon `tip` stub with the live ffe-message-box structure (icon circle + tinted box) — global registry override, CSS in utility.css (filed in canon-requests.md).
- Fixed narrowed centred rows (cols-6/8/9) at higher specificity; band after cols gets margin-top 0; band text 810px centred with kept paragraph margins; h3 in medium face; balanced 2-line h3 at 360.

**Artifacts touched:** stardust/scripts/replica/modules/utility.mjs, stardust/prototypes/css/utility.css, stardust/prototypes/nb-bank-privat-kundeservice-kontakt-html-proposed.html, stardust/replica/gates/kontakt-{1440,360}/, stardust/replica/lift/kontakt-{1440,360}-detail.json, stardust/replica/motion/kontakt-1440.json, stardust/replica/progress/utility.json, stardust/replica/canon-requests.md.

**Gate:** 1440 pixel 1.78 % Δ−1 · header 99.58 % · footer 99.69 % · content-diff none · visual none. 360 pixel 3.13 % Δ−1 · footer 99.24 % · header 96.4 % (0.14 % excl. live focused skip link). Live hits: 9.

**Findings worth flagging:** the AEM table keeps `white-space: nowrap` cells so the 688px table overflows the 328px mobile scroller; the `.text-wrapper.max-width` inline max-width (810px here, 300px on address columns) is dropped by cleanCopy — carried as a family rule.

**Next:** tool (sperre-kort) archetype.

---
