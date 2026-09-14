## 2026-09-14T17:40:00Z — news-article archetype recreated and gated (frontend clientlib variant)

**Prompt:** worker directive — recreate and gate the three `nettsider-frontend` families; news-article first (bankkort-laget-av-resirkulert-plast).

**Decisions:**
- Frontend chrome implemented once as `__header` / `__footer` overrides in `modules/frontend-chrome.mjs`, reusing canon class names so canon.css/js apply, plus `header--frontend` / `footer--frontend` deltas in `css/news-article.css` (the other two frontend families `@import` it).
- Content-diff scoped to the article root on both sides (`--main ".sb1-article, .article"`) because the live template nests header/footer inside `<main>`; chrome is proven by chrome-parity + crop gates instead.
- Live 360 ground truth re-captured with `--wait 5000`: the default settle missed every lazy image (capture-state, not a page defect).
- The frontend header does not morph on scroll (observed static at all positions, both widths) — canon.js's mobile morph neutralised for `.header--frontend`.

**Artifacts touched:** modules/frontend-chrome.mjs, modules/news-article.mjs (created); css/news-article.css, js/news-article.js (created); stardust/prototypes/nb-bank-om-oss-nyheter-bankkort-laget-av-resirkulert-plast-html-proposed.html; gates/nyhet-{1440,360}/ (live.png, proto.png, diff-iter1..5, diff-final, content-diff, visual-diff, chrome-parity, chrome crops); lift/nyhet-*-detail.json; motion/nyhet-*.json; stardust/current/assets/css/frontend_clientlib_base.1156912316.css (harvested); canon-requests.md (tabular-nums); progress/news-article.json.

**Gate:** 1440 pixel 2.84 % Δ1 · header 98.22 % · footer 99.64 %; 360 pixel 7.94 % Δ2 · header 100 % · footer 100 %; content-diff (scoped) findings: none; visual-diff 4 justified (object-fit cover renditions). Live hits: 16.

**Findings worth flagging:**
- `body.ffe-body-text` → `font-variant-numeric: tabular-nums` is inherited site-wide; canon resets it via the `font` shorthand (digit-heavy list items wrapped 9 vs 8 lines).
- Frontend paragraphs use `margin: 0 0 16px`; the teaser is 24/32 fjell with `text-wrap: pretty`.
- Frontend footer column spacing is three auto margins inside a 1216 px row; header buttons carry a 2 px transparent border.

**Open questions:** none.

**Next:** news-listing (nyheter.html), then campaign-landing (om-oss/hjemme.html).

---
