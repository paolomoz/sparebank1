## 2026-09-14T19:10:00Z — news-listing archetype recreated and gated (frontend clientlib variant)

**Prompt:** worker directive — second of the three `nettsider-frontend` families (nyheter.html listing: h1 + headline card + 30 news cards + "Flere artikler" pager).

**Decisions:**
- Chrome reused from `modules/frontend-chrome.mjs` + `css/news-article.css` (imported); only the listing module/CSS are new.
- Three cards were captured mid-lazy-load in the sidecar (placeholder, no `<img>`): restored from the sidecar JSON `media.images` in DOM order rather than re-crawling — the settled 360 live probe confirms the three renditions.
- Live 360 ground truth = stitched PNG with `--wait 5000`; the pre-lazy lift was used for typography only.
- Content-diff scoped to `.sb1-articles__content` / `.articles` (chrome inside `<main>`), chrome proven by chrome-parity + crop gates.

**Artifacts touched:** modules/news-listing.mjs; css/news-listing.css; js/news-listing.js; stardust/prototypes/nb-bank-om-oss-nyheter-html-proposed.html; gates/nyheter-{1440,360}/ (live.png, proto.png, diff-iter1/2, pixel-iter1/2, content-diff-iter1, visual-diff-iter1 (1440), chrome-parity-iter1, chrome-header/footer-diff.png); lift/nyheter-{1440,360}-detail.json, lift/nyheter-360-cards-settled.json; motion/nyheter-{1440,360}.json; progress/news-listing.json.

**Gate:** 1440 pixel 0.96 % Δ0 · header 98.22 % · footer 99.58 %; 360 pixel 0.71 % Δ0 · header 100 % · footer 99.88 %; content-diff (scoped) none at both widths; visual-diff 31 STRETCHED IMAGE flags all justified (live object-fit: cover boxes). Live hits: 12.

**Findings worth flagging:**
- First pixel round failed (45 % / 38 %) on three causes: headline width overridden by a later single-class width rule, wrong h1 size/margins, three image-less lazy cards. Geometry probe against the lift found each top-down.
- Regular card gap is 16 (mobile) / 24 (desktop); headline card 24 / 40. Pager footer is 136 px (group padding 40 + 48 button + 8 margin).
- Chrome-parity at 360 runs pre-lazy (footer Δy 1053) — the stitched crop gate is the authoritative footer measure on frontend pages.

**Open questions:** none.

**Next:** campaign-landing (om-oss/hjemme.html).

---
