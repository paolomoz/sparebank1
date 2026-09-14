# tool — EDS conversion journal (W2)

Archetype `nb-bank-privat-kundeservice-verktoy-sperre-kort-html` → `content/nb/bank/privat/kundeservice/verktoy/sperre-kort.html`.

## Decisions
- `title` module → default content h1, section `title` (centred, 16/8 → 16/24; flow-root wrapper so the lead keeps its 16px). An AEM title
  module carrying an h2/h3 (klager) → `title-h2`/`title-h3`.
- The page lead (`p > span.main-lead`, class dropped by the replica) → default content, section `lead-intro` (700px centred, 24/32 fjell,
  18/24 mobile); other top-level richtexts keep the core encoder; an all-empty trailing richtext → an empty section `spacer-only-N`.
- Numbered steps: `main .section.service ol` (counter, no markers, li 16 0 0 32, fjell number at −1.8em) — family-scoped, not global.
- Columns variants (additive): `media-illustration` (SVG without --ratio: inline, 250px max), `media-4-3` (the live 1920/1440 rounded photo —
  the block default is 3/2), `text-gap` (live .richtext flow-roots that do not collapse: heading-only block before text 24/40, text after a CTA
  row 16). Callout variants: `left`, `lg-8`/`lg-10` (box width = the live column), `small`, `spacer-N` (trailing `<p>&nbsp;</p>` in the box).
- `tip` lives in utility.mjs only: the loader merges family files alphabetically, so a `tip` key in tool.mjs was overridden by utility.mjs.
- convert.mjs resolves the FIRST class with an encoder — `module` precedes `module--…` — so sibling modules are handled by a service-gated
  wrapper of the core `module` fallback.
- Siblings' live modules: `progressive-disclosure` → default-content head (toggle label p, heading) + `table disclosure` (the block reabsorbs
  the head, EW7/EW8; collapsed by height); `currency-converter` → `calculator currency` snapshot (`data/calculator/valutakalkulator.html`,
  `blocks/calculator/currency.css`; dynamics interim like the loan calculator — rates are API data); `accordion` / `step-by-step` /
  `accordion-list-container` captured as plain richtext (client-side chrome absent from the DOM) → default content `module-prose`; the
  savings calculator (`module--base-component`) is empty in the capture → nothing authored, noted. Service `related-products` icon lists →
  `cards small` via the hub helper (core relatedTopics reads `.newsfeed` cards only → 0 rows, content silently dropped).
- Document-relative `?search` links (the live site search) → fully-qualified on the page URL (D4 🔴 otherwise).

## Gate
- 1440: 0.51 % (Δh 0), header 99.58 %, footer 98.83 %, content-diff 0 🔴, live↔EDS 0 🔴 (1 live hit).
- 360: 1.19 % (Δh 0), header 0.10 % excl. skip link, footer 98.60 %.
- Siblings: 5/5 converted, 0 gaps, 0 🔴. Two SVG illustrations > 40 KB are authored as their PNG rasterisation (rasterise-svg.mjs at deploy;
  the emulation has no local PNG for them). No live captures exist for the sibling modules (disclosure, converter): FFE tokens applied to the
  captured structure — a lift is needed before they are pixel-gated.

## Sibling eyeball — meld-skade (1440)
- Fixed from the outline probes (module-by-module, prototype vs EDS): lead-intro first child keeps its 16px (an h1 heads the lead); `module-prose`
  is the live 1240px `.module` with zero outer paragraph margins (152px); every image WITHOUT `--ratio` is the 250px inline illustration — also
  when `image--rounded` (`media-illustration media-rounded`, 30px radius kept); image-less live `card--medium` cards keep their 200px image row
  (`cards medium`, 20px title). After the round every main section matches the prototype to the pixel (216/104, 362, 152, 370/500/360, +72).
- Not fixable here: the sibling PROTOTYPE footer has no `.contact` section (its replica author dropped the channel row) — the EDS footer equals the
  gated sperrekort footer exactly (contact 483 / list 214 / bottom 527), hence the −467px Δh and the 86.7 % band at the tail;
  `dame-hjemmekontor.svg` (45 KB) is authored as its PNG rasterisation, which the emulation cannot serve before `rasterise-svg.mjs` runs at deploy.
- Prototype-vs-EDS content-diff: 0 🔴 (🟡 Ja/Nei thumbs only).
