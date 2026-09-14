# faq — EDS conversion journal (W2)

Archetype `nb-bank-bedrift-kundeservice-bm-lan-finansiering-fast-flytende-rente-bedriftslan-html` → `content/nb/bank/bedrift/kundeservice/bm-lan-finansiering/fast-flytende-rente-bedriftslan.html`.

## Decisions
- The prototype's single `section.qp` module becomes TWO DA sections: a `breadcrumbs question` block section and a `question`
  section (default content h1 + answer prose + `feedback inline` block). Kept apart so the core `main .section:has(> .breadcrumbs-wrapper)`
  rules do not bleed into the answer column. No new block; both variants are additive rules in the existing block CSS.
- The h1's rhythm is a padding, not a margin: the live answer `.richtext` is a flow-root, so its first paragraph keeps its own 16px on top
  of the h1's 8/24 — a margin would collapse (measured 16px short on iter1).
- `/footer-bedrift` carried `<p>Det oppstod en uventet feil. Vennligst prøv på nytt.</p>` as the contact intro — chrome.mjs scraped the
  hidden error fallback that the live footer never shows (the replica had to hide it too, faq.css). Removed the paragraph from the chrome
  document (the live bedrift footer has NO intro text) and filed the chrome.mjs fix; `footer-2` (kundeservice hub, W1) carries the same text.
  The no-intro spacing (title 8/24 + actions 64) is an additive `.contact__title + .contact__actions` rule.
- Siblings are not in `chrome-map.json`, so convert.mjs gives them the default `/nav` + `/footer` (privat) although their market is bedrift
  (measured: a 56px taller footer with the privat intro link). Additive fallback in header.js/footer.js: `market=bedrift` without an explicit
  nav/footer metadata → `/nav-bedrift` / `/footer-bedrift`. Filed the convert.mjs request (derive the chrome from the market for siblings).

## Gate
- 1440: 1.22 % (Δh 1px), header 99.58 %, footer 98.03 %, prototype↔EDS content-diff 0 🔴, live↔EDS 0 🔴 (1 live hit).
- 360: 1.52 % (Δh 1px), header 3.58 % / 0.10 % excluding the skip link (x<115), footer 0.99 % with `--y-b 1799` (2.29 % unshifted — the 1px Δh).
- Siblings: 11/11 converted, 0 gaps, 0 🔴 (3 🟡: bank-choice D3, breadcrumbs/feedback D1 — all justified in the conversion log notes).
  Eyeball `hvordan-flytte-avtalegiro-efaktura-ehf`: 0.48 % vs its prototype, Δh 0, content-diff clean.

## Findings / open
- The prototype renders the bank-choice band outside `<main>`; the EDS page authors it as the first section → the content-diff reports its
  texts as EXTRA (same words, same pixels) — permanent justification for every bank-choice page.
- Thumbs buttons are icon-only with aria-labels (live too): "Ja"/"Nei" show as MISSING BODY 🟡.
