/**
 * scripts/sb1.js — tiny shared helpers for the sparebank1 blocks (node-slotting, never value-slotting: EW1–EW3).
 */

/** Create an element with attributes and children (strings become text nodes). */
export function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  Object.entries(attrs).forEach(([k, v]) => {
    if (v === null || v === undefined || v === false) return;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v; // fixed SVG chrome only — never authored text
    else node.setAttribute(k, v === true ? '' : v);
  });
  children.flat().forEach((c) => { if (c !== null && c !== undefined && c !== false) node.append(c); });
  return node;
}

/** Wrap an AUTHORED node in a layout wrapper (the node keeps its tag, attributes and prose index). */
export function wrapNode(node, cls, tag = 'div') {
  if (!node) return null;
  const w = el(tag, { class: cls });
  node.replaceWith(w);
  w.append(node);
  return w;
}

/** Fixed chrome icon placeholder; inlineIcons() swaps it (and any runtime-decorated <span class="icon"><img>) for the inline SVG so it inherits currentColor. */
export function icon(name, cls = '') {
  return el('span', { class: `icon icon-${name} ${cls}`.trim(), 'aria-hidden': 'true' });
}

const svgCache = new Map();
async function fetchSvg(name) {
  if (!svgCache.has(name)) svgCache.set(name, fetch(`${window.hlx?.codeBasePath || ''}/icons/${name}.svg`).then((r) => (r.ok ? r.text() : '')).catch(() => ''));
  return svgCache.get(name);
}
/** Inline every icon under root as an <svg fill="currentColor"> (fixed chrome, never authored text). */
export async function inlineIcons(root) {
  const spans = [...root.querySelectorAll('span.icon')].filter((s) => !s.querySelector('svg'));
  await Promise.all(spans.map(async (span) => {
    const name = [...span.classList].find((c) => c.startsWith('icon-'))?.slice(5); if (!name) return;
    const text = await fetchSvg(name); if (!text) return;
    const tpl = document.createElement('template'); tpl.innerHTML = text.trim();
    const svg = tpl.content.querySelector('svg'); if (!svg) return;
    svg.setAttribute('fill', 'currentColor'); svg.removeAttribute('width'); svg.removeAttribute('height'); svg.setAttribute('aria-hidden', 'true');
    svg.querySelectorAll('[fill]:not([fill="none"])').forEach((n) => n.setAttribute('fill', 'currentColor'));
    span.replaceChildren(svg);
  }));
}

let n = 0;
export function uid(prefix = 'sb1') { n += 1; return `${prefix}-${n}`; }

/** Text nodes of an authored element (for reading labels without disturbing the node). */
export const text = (node) => (node ? node.textContent.replace(/\s+/g, ' ').trim() : '');

/** Section-level children of a fragment (the default-content wrappers and blocks inside each .section). */
export function sectionsOf(fragment) {
  return [...fragment.children].filter((s) => s.classList.contains('section'));
}
