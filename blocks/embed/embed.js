/**
 * embed — the Block Collection video embed, auto-blocked by scripts.js from a paragraph that is only a fully-qualified YouTube / Vimeo
 * link (D1 URL-based content). The authored link is MOVED under the player as its visually hidden accessible caption (EW1); the
 * iframe title is the link text. 16:9 box (live .video__wrap padding-bottom 56.25%).
 */
export default function decorate(block) {
  const a = block.querySelector('a[href]'); if (!a) return;
  const wrap = document.createElement('div'); wrap.className = 'embed__wrap';
  const frame = document.createElement('iframe');
  frame.src = a.getAttribute('href'); frame.title = a.textContent.trim(); frame.loading = 'lazy';
  frame.setAttribute('allowfullscreen', ''); frame.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
  a.classList.remove('button', 'primary', 'secondary', 'accent'); a.classList.add('embed__caption');
  wrap.append(frame, a);
  block.replaceChildren(wrap);
}
