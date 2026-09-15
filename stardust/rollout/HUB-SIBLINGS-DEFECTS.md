# category-hub siblings — defects observed on the published origin (2026-09-15, screenshots by Paolo, live site on the right)

All on https://main--sparebank1--paolomoz.aem.live ; compare with https://www.sparebank1.no<path>.html (consent 'button:has-text("Godta alle")').

/nb/bank/privat/sparing
- Hero illustration (sebastian-plakat-flytskjema-v3.png, 710×710 PNG, live natural aspect inside a light-blue circle background) is cropped to the columns block's default rounded 3:2 cover box. The media cell needs the plain/illustration variant (columns.css has `media-plain`, `col--illustration`; the hub gridRow never emits a media token).
- "…viser deg sparing på 1-2-3." — live has `<span class="h6">sparing på 1-2-3</span>` inside the paragraph (medium face, Fjell); EDS renders plain text. Inline pseudo-heading spans that are NOT the whole paragraph must keep their emphasis (map to <strong> + a styles rule if live <strong>/<b> renders in the medium face — check canon.css).

/nb/bank/privat/daglig-bruk
- "Nyttige råd": a related-topics NEWS RAIL (photo cards, .newsfeed) inside a sand band came out as an empty `cards small` (one blank card with an arrow) and a left-aligned h2. hubBand routes every related-* to hubRelated (icon .card-list only) — a `.newsfeed` rail must go to the core relatedTopics (`cards news`, centred heading, dates/tags).
- Shortcuts pills show a DOWN chevron; live shows a RIGHT chevron (also check lån: the icon must be rotated by default, not only on hover).

/nb/bank/privat/pensjon
- Hero: live centred h1 + lead (24/32 Fjell) inside a frost band; EDS left-aligned small h1 + small centred grey text (hub-head composition lost).
- "Få orden på pensjonssparingen din": three illustration cards lost their whole body (title h3, paragraph, "Les mer" link, primary button) — only image + arrow render.
- "Er du medlem i et LO-forbund?": live is a cobranding box (heading, text, secondary button, illustration, LOfavør logo); EDS shows heading + button only.
- "Sjekk pensjonen din…": live client-rendered pension calculator (illustration + bar chart + slider panel + button). EDS shows the illustration and stray labels. Needs a static snapshot like blocks/calculator (dynamics interim) — capture the hydrated widget once from live.
- "Flere saker om pensjon": same empty news rail as daglig-bruk.

/nb/bank/privat/forsikring
- Hero CTAs left-aligned and the small paragraph far below; live centred pill pair + paragraph directly under.
- "Se våre forsikringer": live is 7 white cards (illustration, title link, text, "Se alle ⌄" expander revealing the link list); EDS renders bare illustrations + expanded link lists, no cards, no expander, "Se hva vi dekker…" flush-left.
- "Ønsker du totaltilbud?" / LO banners: the first banner lost its green (#c4e4d8-ish) tint (live color token), both otherwise OK.
- "Hvilke forsikringer passer for meg?": intro paragraph with inline link missing; four photo cards lost title/text/primary button (image + arrow only).
- "Bedrift eller landbruk?": the card grid under it flattened to prose (Kjøretøy og maskin…).
- "Blant Norges beste…": five-star image missing above the illustration.
- "Forsikringsselskapet vårt er Fremtind": columns row (Fremtind round logo + text) in a frost band collapsed to centred prose without the logo/band.

/nb/bank/privat/eiendom
- Three horizontal cards (photo left, title + text right, chevron): EDS renders the text column but the photo cell is empty and the card is a single wide row instead of the 2-column card.
- "Tips og råd" news rail: empty (same class as daglig-bruk).
- Shortcuts chevrons down (same).

/nb/bank/privat/tips-og-rad
- Six category cards (illustration, h3, link list, "Flere tips og råd …" secondary button): EDS shows illustration + heading + links but NO card surface (white box, padding, rule under the illustration) and the buttons are MISSING (content loss).
- "Medlem i et LO-forbund?": cobranding box lost the primary button, the LOfavør logo and the 3 line illustrations (content loss).

/nb/bank/privat/lofavor (added 06:50)
- Hero: live photo is a CIRCLE (rounded 50%) with the LOfavør logo under it, h1 breaks "Er du medlem i / et LO-forbund?", checked-list bullets (✓ icons) and the two CTAs side by side; EDS: rounded-rectangle photo, no logo, plain bullets, CTAs stacked.
- "Våre beste boliglånsrenter" (twice): photo cards lost title/text/"Sjekk renta her" link (image + arrow only) — same card-body loss class.
- "Flere medlemsfordeler": live 4 illustration cards (illustration 200px + title + text) + 4 text cards; EDS renders the small icon variant for two of them (tiny illustration + text, no title) — the card kind/variant detection is wrong when a card has an illustration but no photo.
- Tabbed component (Egen pensjonskonto · Pensjonskapitalbevis · LOfavør Sparekonto Pluss · … with a ✓ list + "Les mer" link per tab) is MISSING entirely (content loss) — live client-chromed tabs; author every tab as content (accordion `tabs` variant exists from W3: `accordion tabs`).
- Three text cards at the bottom (Kjenner kollegaene dine…, LOfavør Forening, Bli medlem) lost their bodies — empty cards with arrows.
