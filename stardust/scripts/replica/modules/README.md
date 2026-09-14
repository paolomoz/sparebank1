# author.mjs module registry

Each `*.mjs` here exports `default = { '<aem-component-class>': (node, ctx) => Element | null }`.
`author.mjs` calls the handler for any top-level (or nested) module whose first meaningful class matches
the key — BEFORE its built-in switch, so a key can also override a built-in. Special keys:
`__header(headerNode, ctx)` / `__footer(footerNode, ctx)` are used for the `frontend` clientlib variant.
`ctx` exposes: O (output document), D (source document), el(tag, attrs, children), txt(node), abs(url),
cleanCopy(node) (verbatim richtext copy with attribute cleaning), richtext(wrapper, extraClass), svgOf(svg),
picture(node, imgClass), imageBlock(node), card(node, variant), button(a), buttonWrapper(node, align),
labelText(node), gridClasses(node), bgStyle(node), moduleOf(node) (recurse), feedbackInline(node), thumbs(node),
log, slug, family, variant, ORIGIN.
Rules: verbatim text (never reword), keep hrefs/alt, copy live SVGs verbatim (svgOf), no inline styles except
`--band-bg`, class vocabulary = your archetype's CSS (`stardust/prototypes/css/<family>.css`) + canon.css.
One file per archetype family, named `<family>.mjs`. Never edit another family's file.
