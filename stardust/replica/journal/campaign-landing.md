## 2026-09-14T20:05:00Z — campaign-landing archetype recreated and gated (frontend clientlib variant, sb1-story)

**Prompt:** worker directive — third `nettsider-frontend` family (om-oss/hjemme.html: full-bleed video/photo blocks with centred white cards, prose, illustration, CTA, empty factbox).

**Decisions:**
- Source for lazy media = the settled DOM saved during capture (`lift/hjemme-settled-1440.html`); mobile renditions from the 360 lift, carried as `--bg-desktop` / `--bg-mobile`.
- `background-attachment: fixed` mirrored from the frontend CSS (`.block-media .image__container`) — the stitched live capture shows viewport-relative image fragments and only a fixed prototype reproduces them (23.45 % → 2.51 % at 1440).
- Fade-in / factbox reveal implemented from motion-observe only; the declared `block-media--scrolling` parallax mode never fired and was left out.
- Header variant `header--story` (sand canvas, 78 px, no bottom links) added to `frontend-chrome.mjs`; lazy footer social icons now fall back to the sidecar JSON.
- Content-diff scoped to `.sb1-story__body` / `.story`; chrome by chrome-parity + crop gates.

**Artifacts touched:** modules/campaign-landing.mjs; modules/frontend-chrome.mjs (header--story, social-icon fallback); css/campaign-landing.css; css/news-article.css (story header rules); js/campaign-landing.js; stardust/prototypes/nb-bank-om-oss-hjemme-html-proposed.html; gates/hjemme-{1440,360}/ (live.png, proto.png, diff-iter1/2, diff-final, pixel-iter1/2, pixel-final, content-diff-iter1, visual-diff-iter1 (1440), chrome-parity-iter1, chrome-header/footer-diff.png); lift/hjemme-{1440,360}-detail.json, lift/hjemme-settled-1440.html; motion/hjemme-{1440,360}.json; progress/campaign-landing.json.

**Gate:** 1440 pixel 0.84 % Δ0 · header 99.61 % · footer 99.64 %; 360 pixel 5.22 % Δ0 · header 100 % · footer 100 % (two bands ≥15 % = the teater.mp4 block, playback frame); content-diff 0 structural at both widths (2 🟡 video fallback texts, now emitted); visual-diff 3 flags justified. Geometry probe vs lift: 0 mismatches at both widths. Live hits: 12.

**Findings worth flagging:**
- Card = three white boxes with negative margins; canon's `.richtext > :first-child{margin-top:0}` silently removed the heading's 40 px margin.
- Fixed-attachment backgrounds make stitched captures non-comparable unless mirrored — worth a note in the capture procedure.
- Live picks background renditions per viewport in JS (different photo at 360 for one slide) — a DA author would need explicit mobile/desktop image fields.

**Open questions:** none.

**Next:** none for this worker — all three frontend families gated.

---
