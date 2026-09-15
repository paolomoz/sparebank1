# Notes: improving stardust redesign capabilities

Running notes. Goal: stop stardust from producing near-identical redesign suggestions and let it
generate genuinely diverse designs driven by the identified intent. Paolo adds input over time;
each entry is dated.

## 2026-09-15 — problem statement

- **Observed limit.** Across projects stardust converges on the same suggestions and ideas. In the
  SpareBank 1 Flow B redesign the result is "too similar to the original".
- **Evidence in this pilot** (`../sparebank1-redesign/stardust/direction.md`): the hands-off
  direction pinned surprise budget `low`, ground `stark-white`, band padding 64 px (multi-audience
  floor), pill buttons retained, static desktop header, text-over-photo banned, and rejected every
  dark / colour-block reference as "another brand's identity". Only execution details changed, so
  the page silhouette stayed the same. This is a settings/reasoning problem, not a craft problem.
- **What "brand consistent" actually constrains** is small: palette, type faces, illustration
  system, photo tone, a couple of signature motifs. Ground, scale, density, composition, hero
  model, motion are all free — stardust currently treats most of them as pinned.

## Target capability

- **Intent → several divergent directions, not one.** From the same extracted intent, fan out
  2–3 (or more) named concepts that differ in silhouette (e.g. for SB1: Editorial Nordic /
  Fjell colour-block / Task-first bento), build each as a static prototype from the same verbatim
  content, compare side by side at 1440 / 390, then pick and re-run direction.
- **Stardust as a curating designer in phase 1.** Before directing, it should know what exists:
  gather the best ideas from other designs, stitch them together, and align them to the extracted
  brand. Reference knowledge must be broad enough to break its defaults.

## Idea backlog

- Inspiration sources to wire in (beyond the Refero MCP already used): Awwwards category pages
  (e.g. `awwwards.com/inspiration_search/banking/`), Godly, SiteInspire, Landbook, Brand New
  (rebrand critiques), sector award lists (WebAward), plus live sites of sector leaders and recent
  incumbent rebrands (for banks: Danske Bank 2025 identity, Lunar, Monzo, N26, Wise, bunq, Nubank,
  Akua, Xapo, Beem, Tuyo).
- Make reference selection *diverse by construction*: pick references that disagree with each
  other on ground, hero model, density and motion, rather than three that agree with the brand's
  current look.
- Revisit hands-off defaults that flatten output: surprise budget floor, multi-audience density
  floor, "brand-faithful inversions" that re-pin the captured look (pure white, pill radius,
  static header), and the anti-reference list.
- Motion is most of the gap between good and award-level; stardust should propose a motion
  concept per direction (CSS-only, EDS-safe).

## Follow-ups (from Paolo)

- (pending — more input to come)

## 2026-09-15 — round 01 prototype: what the "curating designer" step looked like by hand

Built `../sparebank1-redesign/stardust/prototypes/round-01-danske-ramp/home.html` from a *reference-composition brief*:
"from Danske Bank take card design, bento, gaps, corners, header, footer; from Ramp take typography (not fonts), page width,
buttons; keep SB1 fonts, colours, IA". Observations worth turning into stardust behaviour:

- **Per-source aspect allocation is the unit of a direction.** A brief that names a reference *and the aspects to borrow from it*
  (cards / grid / header / footer / type scale / page width / buttons) produced a clearly different page in one pass, where the
  generic "modernise" phrase produced a look-alike. Stardust should express directions as `{reference → aspects}` tuples, with
  brand-pinned aspects (fonts, palette, IA) listed explicitly as *not borrowed*.
- **Measure, don't describe.** Two Playwright studies (screenshots + getComputedStyle, ~30 min) gave exact numbers (2 px radius,
  6 px gutters, 48/36 padding, 32+80 header, 64 px gutters, 6 px button radius, 300 ms hover). The Refero style text alone would
  not have produced these. Study scripts are in `refs/danske/_*.mjs`; the Ramp spec had to be compiled from JSON after the agent
  died mid-run — make the SPEC.md write-out the first artifact, not the last.
- **Structure references can come from the same sector; type/button references need not.** Danske (bank) for structure kept the
  result bank-appropriate; Ramp (SaaS) for type and buttons modernised it without importing a fintech identity.
- **Verbatim content stayed easy** because the content was pulled as fragments from the approved prototype (`_fragments.json`)
  and the existing gates (`content-check.mjs`, `validate-prototype.mjs`) were reused with `--file/--out`. A round-N prototype
  should always be built from fragments + a new stylesheet, never by editing the previous prototype.
- **Where the mapping needed judgement** (and where stardust would need rules): which SB1 section becomes the "dark promo tile"
  (chose the bank router), how 6 products map onto a 3-up grid, what to do with the 12-bank list inside a fixed-height tile
  (`align-items:start`, tile grows), which brand tints stand in for the reference's grey (Sand-70 / Frost-30 / Syrin-30).
