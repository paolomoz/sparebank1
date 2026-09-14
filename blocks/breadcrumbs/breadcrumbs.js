import { el, icon, inlineIcons } from '../../scripts/sb1.js';

/** breadcrumbs — the "‹ Parent" back-link row (template-slotted: the authored <p><a> moves into the nav). */
export default function decorate(block) {
  const a = block.querySelector('a');
  if (!a) return;
  a.classList.add('breadcrumb__link');
  a.prepend(icon('back'));
  const nav = el('nav', { class: 'breadcrumb', 'aria-label': 'Tilbake' });
  nav.append(a.closest('p') || a);
  block.replaceChildren(nav); inlineIcons(block);
}
