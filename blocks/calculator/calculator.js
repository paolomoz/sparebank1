/**
 * calculator — the loan calculator (dynamics #7, interim tier). The live widget is a client-rendered React app in a shadow root
 * whose API (/api/personal/banking/boliglan-kalkulator/*) is host-bound. Until SpareBank 1 exposes it cross-origin, the block
 * renders the captured hydrated state as a static snapshot (data/calculator/<name>.html) inside a shadow root with the widget's
 * own stylesheet ported (blocks/calculator/widget.css) — same pixels, computation disabled.
 * Row: [<p><a href="/data/calculator/boliglan.html">Boliglånskalkulator</a></p>]
 * @ew-exempt all — the authored link names the snapshot file (text-as-metadata); the widget content is captured UI, not authored copy.
 */
export default async function decorate(block) {
  const a = block.querySelector('a'); if (!a) return;
  let url = new URL(a.getAttribute('href'), window.location.href);
  // additive (category-hub siblings): a `widget-*` snapshot captured in its live mobile state (<name>-360.html) serves viewports under 768 — the live apps re-render their layout per breakpoint
  if ([...block.classList].some((c) => c.startsWith('widget-')) && window.matchMedia('(max-width: 767px)').matches) { const m = url.pathname.replace(/\.html$/, '-360.html'); try { const head = await fetch(m, { method: 'HEAD' }); if (head.ok) url = new URL(m, window.location.href); } catch { /* keep the desktop snapshot */ } }
  const label = a.textContent.trim();
  block.textContent = '';
  const host = document.createElement('div'); host.className = 'calculator__host'; host.setAttribute('role', 'region'); host.setAttribute('aria-label', label);
  block.append(host);
  try {
    const res = await fetch(url.pathname); if (!res.ok) throw new Error(`${res.status}`);
    const html = await res.text();
    const root = host.attachShadow({ mode: 'open' });
    root.innerHTML = html;
    root.querySelectorAll('button, input, [role="tab"]').forEach((c) => { c.setAttribute('aria-disabled', 'true'); c.addEventListener('click', (e) => e.preventDefault()); });
    host.title = 'Kalkulatoren viser et eksempel; beregning kobles til når kalkulator-API-et er tilgjengelig.';
  } catch (e) {
    const p = document.createElement('p'); p.className = 'calculator__fallback'; const link = document.createElement('a'); link.href = 'https://www.sparebank1.no/nb/bank/privat/lan/lanekalkulator.html'; link.textContent = label; p.append(link); block.append(p);
  }
}
