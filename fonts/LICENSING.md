# Font licensing

| file | family | foundry / owner | status |
|---|---|---|---|
| `SpareBank1-Regular-Web.woff2` | SpareBank1-regular | SpareBank 1 (proprietary brand face, served from `www.sparebank1.no` clientlib) | **pilot use — licence to be confirmed by SpareBank 1 before production** |
| `SpareBank1-Medium-Web.woff2` | SpareBank1-medium | SpareBank 1 | same |
| `SpareBank1-Title-Medium-Web.woff2` | SpareBank1-title-medium | SpareBank 1 | same |

Why they are here: the replica must render the bank's own type to be a faithful migration; the fonts are the
customer's assets and the target is the customer's pilot property. No third-party font is redistributed.

Remove path (if the licence cannot be confirmed): delete the three `.woff2` files and the `@font-face` rules in
`styles/fonts.css`. Every stack in `styles/styles.css` names a metric-matched local fallback second
(`sparebank1-regular-fallback` etc., Arial-based with size-adjust/ascent/descent overrides), so the site keeps
its line boxes and falls back to Arial without layout shift.
