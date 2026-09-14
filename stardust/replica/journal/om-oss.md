# om-oss — presse archetype (OM OSS chrome)

Archetype `nb-bank-om-oss-presse-html` → `stardust/prototypes/nb-bank-om-oss-presse-html-proposed.html`.

## What was built
- `modules/om-oss.mjs`: `campaign` (12-col split hero, photo md-7 / text md-5, `campaign__wrap--reverse` → photo right, `campaign-bg__align-right` → text box hugs the photo) and `adviser-list` (centred wrapped row of contacts: 180px circle portrait, name, role, phone, `mailto:` "e-post").
- `css/om-oss.css`: campaign geometry (1440: 840×400 cover photo, 450px text box padded 0 40 0 10, flex-centred in a 407px column; 360: 360×240 photo on top, centred text with 20px padding), adviser list (25% columns ≥1024, content-width items on mobile, 18/24 vs 17/20 medium names), 9/10/11-column grid rows (960 / 1066.67 / 1173.33 px), the 200px inline svg illustration column, desktop button-list 8px bottom margins.

## Gate
| width | pixel | Δh | header crop | footer crop | content-diff | visual-diff | live iterations |
|---|---|---|---|---|---|---|---|
| 1440 | 0.68 % | 0 | 98.51 % | 99.16 % | 0 🔴 / 1 🟠 (tabular digits, canon) | 2 advisory (cover crops, same on live) | 2 (chrome-parity re-run after dropping a wrong login override) |
| 360 | 1.74 % | 0 | 96.42 % (99.90 % for x ≥ 115) | 98.36 % | 0 🔴 / 1 🟠 (same) | 1 advisory (cover crop) | 1 |

## Iterations (pixel rounds on the cached live PNG)
0. canon-only: 53 % (unknown modules, 7881px tall).
1. modules + CSS: 2.71 % / Δ7 (1440), 11.13 % / Δ14 (360).
2. no change (canon `img{vertical-align:middle}` removed the live 7px descender line box under inline pictures).
3. `vertical-align: baseline` on the campaign photo, the svg illustration and the portraits: 0.69 % / Δ0 and 1.74 % / Δ0.
4. removed `.header__login{visibility:hidden}` — chrome-parity showed live om-oss DOES show "Logg inn" (green outline button at x=1235): 0.68 %.

## Live-vs-canon findings recorded in canon-requests.md
- grid rows with 9/10/11 columns are not in canon (only 4/6/8).
- `.button-list .button-wrap` keeps `margin-bottom: 8px` on desktop on live.
- footer social `ul` padding-top 11px (live 0) and icon widths; `.btn--secondary:hover` is vann on live, fjell in canon; `.btn--action:hover` is #095139 on live.
- inline images inside `<picture>` are baseline-aligned on live (7px line-box tail); canon sets `img{vertical-align:middle}`.

## Residuals
- Header crop: the focused skip link "Til hovedmeny" (x<115) is in every live capture; excluded it is 99.90 % at 360.
- Footer social row: canon geometry (11px lower, Linkedin 35 vs 30 wide) — canon-level.
