// prep-slots.mjs — extract --prep § 4 typed content slots per page (generic, type-aware), merged into pages/<slug>.json#slots.
import { readFileSync, writeFileSync, readdirSync } from 'node:fs';
const dir = 'stardust/current/pages'; const types = JSON.parse(readFileSync('stardust/current/_page-types.json', 'utf8'));
const inMain = (dp) => dp && !/^(header|footer|nav)|footer|header__|optin|bank-choice/.test(dp);
let n = 0; const summary = {};
for (const f of readdirSync(dir).filter(f => f.endsWith('.json'))) {
  const p = JSON.parse(readFileSync(`${dir}/${f}`, 'utf8')); const t = types.pages[p.slug]?.type || 'unique'; const fam = types.pages[p.slug]?.archetypeFamily;
  const hs = (p.headings || []).filter(h => inMain(h.domPath)); const h1 = hs.find(h => h.level === 1);
  const paras = (p.body || []).filter(b => typeof b === 'object' ? (b.text || '').length > 40 : String(b).length > 40).map(b => typeof b === 'object' ? b.text : b);
  const ctas = (p.ctas || []).filter(c => !c.inHeader && !c.inFooter && c.label && inMain(c.domPath));
  const imgs = (p.media?.images || []).filter(i => i.visible && i.rect && i.rect.top > 150 && i.rect.width >= 120 && !/logo\.svg/.test(i.currentSrc || i.src || ''));
  const faq = hs.filter(h => /faq-item__heading/.test(h.domPath || '')).map(h => h.text);
  const slots = { pageType: t, archetypeFamily: fam, headline: h1?.text || p.heroHeadline || p.title, deck: p.heroLede || paras[0] || null, meta: { title: p.title, description: p.metaDescription, canonical: p.canonical, og: p.og }, breadcrumb: ctas.find(c => /aem-main-container|breadcrumb/.test(c.domPath || ''))?.label || null, sections: hs.filter(h => h.level === 2).map(h => h.text), h3: hs.filter(h => h.level === 3).map(h => h.text), paragraphs: paras.length, primaryCtas: ctas.slice(0, 6).map(c => ({ label: c.label, href: c.href })), images: imgs.slice(0, 12).map(i => ({ src: i.currentSrc || i.src, alt: i.alt, w: Math.round(i.rect.width), h: Math.round(i.rect.height) })), faqItems: faq, hasFeedback: hs.some(h => /synes du om denne siden/i.test(h.text)), hasContactRow: hs.some(h => /^Kontakt oss$/i.test(h.text)), hasBankChoice: (p.ctas || []).some(c => c.label === 'Bruk min posisjon') };
  if (t === 'article' && fam === 'news-article') { slots.kicker = hs.find(h => h.level === 2 && h.text === h.text.toUpperCase())?.text || null; slots.share = ctas.filter(c => /^Del på/.test(c.label)).map(c => c.label); slots.related = hs.filter(h => /RELATERTE/.test(h.text)).map(h => h.text); }
  p.slots = slots; writeFileSync(`${dir}/${f}`, JSON.stringify(p, null, 2)); n++; summary[t] = (summary[t] || 0) + 1;
}
console.log('slots written for', n, 'pages', JSON.stringify(summary));
