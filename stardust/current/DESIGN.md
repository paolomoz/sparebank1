---
name: SpareBank 1 — sparebank1.no (current state)
description: "Vi er flere banker i hele Norge — SpareBank1 title face, Fjell/Vann blues, Sand/Frost tinted bands, flat spot illustrations, pill buttons, 96px rounded imagery"
colors:
  fjell: "#002776"
  vann: "#005aa4"
  natt: "#001032"
  frost: "#7eb5d2"
  frost-30: "#d8e9f2"
  sand: "#f8e9dd"
  sand-30: "#fdf8f5"
  sand-70: "#faf0e7"
  myrull: "#fae4e0"
  multe: "#f8b181"
  lyng: "#873953"
  baer: "#e44244"
  nordlys: "#33af85"
  action-green: "#00754e"
  text: "#020a0a"
  koksgraa: "#323232"
  moerkgraa: "#676767"
  graa: "#adadad"
  lysgraa: "#d8d8d8"
  white: "#ffffff"
  focus-orange: "#dc8000"
typography:
  display:
    fontFamily: "SpareBank1-title-medium, arial, sans-serif"
    fontSize: "46px"
    fontWeight: 400
    lineHeight: "56px"
    letterSpacing: "normal"
  headline:
    fontFamily: "SpareBank1-title-medium, arial, sans-serif"
    fontSize: "36px"
    fontWeight: 400
    lineHeight: "44px"
    letterSpacing: "normal"
  title:
    fontFamily: "SpareBank1-title-medium, arial, sans-serif"
    fontSize: "28px"
    fontWeight: 400
    lineHeight: "36px"
    letterSpacing: "normal"
  subtitle:
    fontFamily: "SpareBank1-medium, arial, sans-serif"
    fontSize: "22px"
    fontWeight: 400
    lineHeight: "28px"
    letterSpacing: "normal"
  lead:
    fontFamily: "SpareBank1-regular, arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: "28px"
    letterSpacing: "normal"
  body:
    fontFamily: "SpareBank1-regular, arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: "24px"
    letterSpacing: "normal"
  small:
    fontFamily: "SpareBank1-regular, arial, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "normal"
  micro:
    fontFamily: "SpareBank1-regular, arial, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: "20px"
    letterSpacing: "normal"
rounded:
  xs: "4px"
  sm: "5px"
  md: "16px"
  lg: "30px"
  image: "96px"
  pill: "6em"
  circle: "50%"
spacing:
  2xs: "4px"
  xs: "8px"
  sm: "16px"
  md: "24px"
  lg: "32px"
  xl: "40px"
  2xl: "48px"
  3xl: "64px"
  4xl: "80px"
  section: "75px"
  5xl: "160px"
components:
  button-primary:
    backgroundColor: "{colors.vann}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "8px 24px"
  button-primary-hover:
    backgroundColor: "{colors.fjell}"
    textColor: "{colors.white}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "{colors.vann}"
    rounded: "{rounded.pill}"
    padding: "8px 24px"
  button-action:
    backgroundColor: "{colors.action-green}"
    textColor: "{colors.white}"
    rounded: "{rounded.pill}"
    padding: "8px 24px"
  button-inline:
    backgroundColor: "transparent"
    textColor: "{colors.vann}"
    rounded: "{rounded.lg}"
    padding: "8px 17px"
  card:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text}"
    rounded: "{rounded.sm}"
    padding: "16px 32px"
  input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.text}"
    rounded: "{rounded.xs}"
    padding: "8px 16px"
  band-sand:
    backgroundColor: "{colors.sand-30}"
    textColor: "{colors.text}"
  band-frost:
    backgroundColor: "{colors.frost-30}"
    textColor: "{colors.text}"
  band-brand:
    backgroundColor: "{colors.vann}"
    textColor: "{colors.white}"
---

<!-- _provenance: writtenBy stardust:extract Phase 4 (descriptive current state, authored from _brand-extraction.json + _ffe-tokens.json (185 --ffe-* custom properties) + assets/css/clientlib_base.1156912316.css + pages/*.json computed styles; impeccable document.md used as the format spec). writtenAt 2026-09-14T15:55:00Z. Every value below is observed on www.sparebank1.no/nb/bank/*; nothing is prescribed. -->

# Design System: SpareBank 1 — sparebank1.no (current state)

## Overview

**Creative North Star: "The Friendly Local Bank, at National Scale"** _(descriptive label for the observed system, not a redesign direction)_

SpareBank 1's public site runs on the bank's own open design system, **FFE** ("Felles Front End"),
exposed as 185 `--ffe-*` custom properties. The system is calm, blue and generous: a deep **Fjell**
blue for headings and links, **Vann** blue for the primary action, a green **action** button for
"do it now" tasks (log in, apply), and warm **Sand** / cool **Frost** tints for alternating content
bands on white. Photography is real-people, warm, and always shown with a very round (96px) corner;
flat spot illustrations (people, houses, animals in Fjell/Frost/Multe/Lyng) carry the friendlier
moments. Every shared-site page opens with the alliance's signature **"Vi er flere banker i hele
Norge"** band — a blue illustrated landscape with a postcode field that routes the visitor to one of
the 12 regional banks. Type is the bank's proprietary **SpareBank1** family (title-medium for
headings, regular for body) in a single weight, ad-hoc ramp 46/36/28/22/18/16. Density is medium;
1280px container; cards are white with a 1px soft shadow and 5px radius; buttons are pills. Voice is
second-person bokmål, short and reassuring ("Se hva du kan spare!", "Bli kunde", "Bruk min posisjon").

## Colors

Source: `_ffe-tokens.json` (`--ffe-farge-*` brand palette + `--ffe-color-*` semantic tokens) and the
cross-page computed-color aggregate in `_brand-extraction.json § palette` (100 pages).

| role | token | value | observed use |
|---|---|---|---|
| Heading / link-hover / footer bg | `--ffe-farge-fjell` | `#002776` | h1–h3, link hover, footer bottom band (2,289 occurrences) |
| Primary action / links | `--ffe-farge-vann` | `#005aa4` | primary buttons, links (`--ffe-g-link-color`), bank-choice band bg, icon circles (1,301) |
| Action green | `--ffe-v-button-action-color-bg` | `#00754e` | "Logg inn", "Bli kunde", "Søk boliglån" action buttons (392) |
| Body text | `--ffe-g-text-color` | `#020a0a` | body copy |
| Secondary text | `--ffe-farge-moerkgraa` | `#676767` | card body copy, breadcrumb, borders (306) |
| Visited link | `--ffe-g-link-color-visited` / lyng | `#873953` | visited links; illustration accent |
| Sand tint band | `--ffe-farge-sand-30` / `-70` / sand | `#fdf8f5` / `#faf0e7` / `#f8e9dd` | warm content bands, tip callouts |
| Frost tint band | `--ffe-farge-frost-30` / frost | `#d8e9f2` / `#7eb5d2` | cool content bands, kundeservice hub bg, sky in illustrations |
| Feedback / accents | baer `#e44244`, nordlys `#33af85`, multe `#f8b181`, myrull `#fae4e0` | illustration + status colours only |
| Focus ring | `--ffe-color-border-interactive-focus` | `#dc8000` | keyboard focus outline |
| Surfaces | white `#ffffff`; `lysgraa #d8d8d8` rules; `graa #adadad` disabled | 6,418 white backgrounds |

The full brand palette also carries 30/70 tints of every hue (`--ffe-farge-<hue>-30/-70`). Dark-mode
tokens exist in the CSS (`@media (prefers-color-scheme: dark)`, 125 rules) but the site forces light.

## Typography

Source: `_brand-extraction.json § type`, `_fonts.json`, `--ffe-fontsize-*` / `--ffe-g-font*` tokens.

- **Families (proprietary, self-hosted from the clientlib):** `SpareBank1-title-medium` (h1–h3, `--ffe-g-font-heading`), `SpareBank1-medium` (h4–h6, strong, `--ffe-g-font-heading-small` / `-strong`), `SpareBank1-regular` (body, `--ffe-g-font`). Fallback `arial, sans-serif`. All faces are weight 400 — hierarchy is carried by size and by the title face, never by weight. Files: `assets/fonts/SpareBank1-{Title-Medium,Medium,Regular}-Web.woff2` (32–37 KB each; `font-display: fallback`).
- **Ramp (desktop, observed on 93–446 headings each):** h1 46/56 · h2 36/44 · h3 28/36 · h4 22/28 · h5 18/24 · h6 16/16 (tokens `--ffe-fontsize-h1..h6` = 2.875/2.25/1.75/1.375/1.125/1 rem). Lead paragraph 18/28 (`.ffe-lead-paragraph`; token 1.5rem on hero leads), body 16/24, small 14/20, micro 12/20. Scale is ad-hoc (ratios 1.28/1.29/1.27/1.22/1.13).
- **Rendering group:** `text-rendering: auto`, `-webkit-font-smoothing: auto`, `font-synthesis: weight style small-caps`, `font-kerning: auto`, `font-variant-numeric: tabular-nums` on paragraphs; `text-wrap: pretty` on `.ffe-body-paragraph`. Heading `text-wrap` is initial.
- Headings are sentence case (1 % uppercase); no letter-spacing anywhere; links underlined in Vann.

## Layout

Source: `containerModel` per page, `.ffe-grid*` rules, `@media` census of the clientlib.

- **Container** 1280px max (`.aem-main-container`, 78/100 pages), centred with 80px side margins at 1440; 20px inline padding on narrow viewports.
- **Grid** FFE 12-column CSS grid (`.ffe-grid__col--{sm,md,lg}-N`, `grid-column: span N`), 8px gap (`--ffe-spacing: 8px`). Content columns typically 12 → 6/6 or 8/4 at `lg`.
- **Breakpoints** 480 · 768 · 1024 · 1280px (`min-width` rules: 768 ×228, 1024 ×121, 480 ×64, 1280 ×9). Mobile is a single column; the bank-choice band restacks (illustration hidden below 768).
- **Vertical rhythm** 75px section padding on bands (24 occurrences), 20px inside cards; spacing tokens 4/8/16/24/32/40/48/64/80/160.
- **Page skeleton (shared site):** header (top bar Privat/Bedrift/Om oss + logo + Søk / Bli kunde / Logg inn, second row 9 market sections) → bank-choice band → breadcrumb back-link ("‹ Låne") → content modules → FAQ → "Hva synes du om denne siden?" → "Kontakt oss" icon row → footer (Fjell, 3 link columns + social) → bottom legal row.
- Header is static (not sticky); a floating "back to top" circle button appears at the left on scroll.

## Elevation & Depth

Flat, tonal layering: depth comes from tinted bands (Sand/Frost on white) and from the rounded photo
masks, not from shadows. Cards carry one soft ambient shadow `0 1px 4px 0 rgba(38,38,38,.3)`
(rest) and `0 2px 3px 2px rgba(38,38,38,.3)` / `0 3px 8px 0` on hover; focus is a 2px Vann ring
(`0 0 0 2px #005aa4`) or the orange outline. No gradients except a single hero scrim on news photo
heroes (text-overlay hero).

## Shapes

- **Imagery:** 96px corner radius on hero/feature photos and illustration containers (785 occurrences) — the single most recognisable shape motif; circular (50 %) crops for portraits and icon buttons.
- **Buttons:** pills (`--ffe-v-buttons-border-radius: 6em`; computed 30–96px); inline text-buttons 22px.
- **Cards & inputs:** 5px (`.ffe-card-base`), 4px (`--ffe-g-border-radius`), 16px on tinted callouts/tips.
- **Icons:** thin-line FFE icons inside 60px Vann circles ("Kontakt oss" row), monochrome SVG.

## Components

Observed cross-page (`_modules.json`, `_brand-extraction.json § componentStyle`):

- **Buttons:** primary = white on Vann, 2px Vann border, pill, 8px 24px, 16px text (357 instances / 90 pages); secondary = Vann on white, transparent border; action = white on green `#00754e` (log-in / apply); inline = transparent, Vann text, 22px radius ("Se alle banker"). Hover darkens to Fjell.
- **Bank-choice band:** Vann background, white heading "Vi er flere banker i hele Norge", lede "Velg en bank for å se betingelser", postcode input + "Bruk min posisjon" secondary button + "Se alle banker" inline button, landscape illustration (mountains, lighthouse, boat, seal) left/right. On 70/100 pages.
- **Background band (hero/feature):** 96px-rounded photo or illustration beside heading + lead + button row; white, Sand or Frost background.
- **Visual-nav / static cards / related-products:** white cards, 5px radius, soft shadow, image top or left, title in Fjell, one-line copy, chevron; 3–4 per row.
- **FAQ accordion:** `.ffe-accordion` items with `h3.ffe-h6` question, chevron, "Se flere spørsmål og svar" link.
- **Feedback strip:** "Hva synes du om denne siden?" with thumbs up/down (58 pages).
- **Contact row:** "Kontakt oss" + five Vann circles (Ring oss · Avtal møte · Skriv til oss · Finn kontor · Chat).
- **Tip callout:** Sand tint, 16px radius, lightbulb icon. **Banner-small:** tinted band with illustration + button (LOfavør).
- **Footer:** Fjell `#002776` band, white links in 3 columns (Privat/Bedrift · Logg inn · Sosiale medier), bottom row of legal links and company name.

## Do's and Don'ts

_Descriptive of the observed system:_

- Do keep hierarchy through size and the title face; the system never uses bold weights.
- Do alternate white / Sand / Frost bands; never stack two tinted bands of the same hue.
- Do round photography at 96px and portraits as circles; illustrations are flat, four-colour, no outlines.
- Don't use gradients, drop shadows on bands, or uppercase headings — none appear on the live site.
- Don't rehost the SpareBank1 fonts outside customer-owned properties (proprietary faces; see direction.md A5).
