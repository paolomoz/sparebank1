# W1 journal — kundeservice-hub (ks, 2 pages) · 2026-09-14

## Result
- Archetype `nb-bank-privat-kundeservice-html` → `content/nb/bank/privat/kundeservice.html`, 0 gaps, lint 0 🔴.
- Gate 1440: pixel 3.65 %, **Δh −80**, header 99.58 %, footer 85.95 % — main content bands y0–3000 ≤ 0.9 %; the whole delta is the
  `/footer-2` chrome doc (its contact intro is the live error-state string "Det oppstod en uventet feil…", +80 px; live/proto footer
  is 930 px). **Blocked by chrome** — request W1-6; expected to close once the paragraph is dropped.
- Gate 360: pixel 5.80 %, Δh −81 (same cause), header skip-link artefact (0.10 % excl.), footer 83.03 % (same cause).
- content-diff proto↔EDS and live↔EDS: 15 🔴, all pseudo-heading rank swaps (`<h2><span class="h4">` → h4) inside collapsed FAQ bodies.
- Sibling `nb-bank-bedrift-kundeservice-html`: authored, 0 gaps, lint 0 🔴; its FAQ sits inside a tinted band — the walker now inlines the
  accordion (`band, faq`); its prototype carries unconstrained illustrations (replica width loss, W1-11).

## Decisions
1. First band in document order: h1 (default content) → `hub-head` token for the live empty spacer band → `columns … chat lead-all cols-10`
   → `hub-rule` (the inner rule) → the two 2-card rows folded into one `cards grid lg-4 cols-8` (live 853 px, 2-up).
2. **Chat field**: `columns chat` — the trailing paragraph of the last cell is the field label (EW8, moved into `<label>`, placeholder
   mirrors it); "Send melding" is control chrome (icons/send.svg). Dynamics #6 interim.
3. **lead-all**: every paragraph of the text column is a lead (live h2 + `.lead-blue`×N); the core `lead` rule styles only `h1 + p`.
4. **wN cell model** (columns): an illustration column renders at N px max, centred, uncropped (`lg-5-first-w400`); the 400 is the lifted
   kundeservice value (the sidecar's `style="max-width:400px"`), applied only for this family; `<picture>` aspect reset.
5. `syrin` (#f2f2f9) section tint; `related, syrin` for the top-level icon list (`cards small`).
6. FAQ: trailing `<br>` in `<h2><span class="h4">…<br></h2>` pre-cleaned so headingTag keeps the visual rank (W1-5).

## Requests
W1-0 (loader), W1-1, W1-2, W1-3, W1-5, **W1-6 footer-2 intro**, W1-7, W1-11, W1-12.
