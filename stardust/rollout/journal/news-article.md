# news-article — EDS conversion journal (W5)

## 2026-09-14 — archetype `nb-bank-om-oss-nyheter-bankkort-laget-av-resirkulert-plast-html` gated on the emulation (:3015)

**Decisions**
- The article template is three kinds of DA section: `article-hero` (one `hero article` block: [cover + caption][tag · h1 · date] — the share bar is
  template chrome), `article-body` default content (the teaser as `article-body, lead`, reusing the existing `lead` skin), `article-aside`
  (h2 + `cards related` + h2 + tag list). `<main>` IS the live `.article` white card: a 70 % / 30 % grid at ≥1024 (body sections in column 1,
  the aside spanning column 2), so no wrapper block is needed.
- A floated figure has no David's Model equivalent. The live clear boundary (`.article__figure--right + .richtext + .richtext { clear }`) IS a
  section boundary: the figure section (`article-body, figure-right|left`) holds the image paragraph, its italic caption paragraph and the one
  text block that wraps beside it. Captions: "the italic paragraph right after an image paragraph" (authoring convention, styled by the template).
- The infoBox is the FFE message box without the icon → `callout infobox <ffe-colour-token>` (sand-70 · frost-30 · nordlys-30 · green-mint —
  the token the live author picks). The bio `quote` component → portrait image paragraph + `<blockquote>`; its "Les mer om …" modal trigger has no
  captured content (dynamics) and is not authored.
- Related articles → `cards related` (rows [picture][h3 link]); tags → a `<ul>` of links (inline-block, 16px apart).
- Frontend chrome: the same authored /nav and /footer documents; `blocks/header` and `blocks/footer` add `header--frontend` / `footer--frontend`
  from the page's `template` metadata (news-article · news-listing · campaign-landing), `header--story` on campaign-landing. The frontend chrome
  documents were regenerated from the current prototypes with `stardust/scripts/eds/_w5-chrome.mjs` (chrome.mjs ran before the frontend
  prototypes existed: empty footer, no address line, no Søk/Bli kunde on /nav-om-oss, AEM `/content/sites/sb1` hrefs).
- The live "Bli kunde" in the frontend header is a `<button>` with a client handler; authored as the classic nav's CTA (`/nb/bank/privat/kundeservice/bestill/bli-kunde`).

**Findings**
- A `<header>` element inside a block is sized by the foundation `header { height: var(--nav-height) }` rule — use a div (`hero__header`).
- Section boundaries change margin collapsing: the live body is one flow (p 16px collapses with h2 40px / infobox 40px; a float's 24px sits after
  the 16px). Contract: sections contain the trailing 16px; the wrapper is a flow-root; first-child headings carry 24px; the callout 24/8px; the
  section after a figure section opens at +41 (the live 1px padding-top keeps the 40px inside); mobile figure first-child 8px.
- The live footer divider is `hr { height: 0; border: 1px }` = a 2px line with 40px above and below.
- The `.h5`/`.h2`/`.h3` pseudo-heading spans of the frontend templates are emitted as headings (site-wide ROLE SWAP class).
- 3 of the 10 roster pages of this family are sb1-STORY pages (their sidecars have `.sb1-story__body`, no `.sb1-article`): bank-regnskap-nerderiket,
  sikrer-seg-mot-vannlekkasje-klok-av-skade, kan-utviklingen-til-teknologifondene… — converted by the campaign-landing encoder; `template`
  corrected by `_w5-template-fix.mjs`; roster fix requested.

**Gate** 1440: pixel 3.18 % Δ1 · header 98.18 % · footer 100 %; 360: pixel 8.00 % Δ2 · header 99.69 % · footer 100 %. Content-diff prototype ↔ EDS
0 🔴 (5 🟠 related ctas); live ↔ EDS identical (1 live hit). Lint 0 🔴 1 🟡 (justified). Product: byte-identical, 0.65 %.

**Siblings** 9 converted, 0 gaps, 0 🔴 (6 articles + 3 story pages). Eyeball bruk-mobilbanken @1440: coherent (left-floated figure wraps, quote, aside).

**Open questions** — the article siblings under /nb/bank/privat/** have no chrome-map entry and take /nav + /footer (privat link columns instead of
the frontend "Snarveier" set); the quote component and the story `columns-*` components on the siblings were never lifted from live.
