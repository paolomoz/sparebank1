// design-json.mjs — build stardust/current/DESIGN.json: frontmatter tokens parsed from DESIGN.md (single source of truth) + extensions from _brand-extraction.json, _modules.json, _page-types.json.
import { readFileSync, writeFileSync } from 'node:fs';
const out = process.argv[2] || 'stardust/current';
const md = readFileSync(`${out}/DESIGN.md`, 'utf8'); const fm = md.split('---')[1];
// minimal YAML (nested maps, scalars) parser
const root = {}; const stack = [{ indent: -1, obj: root }];
for (const raw of fm.split('\n')) { if (!raw.trim() || raw.trim().startsWith('#')) continue; const indent = raw.match(/^ */)[0].length; const line = raw.trim(); const m = line.match(/^([^:]+):\s*(.*)$/); if (!m) continue; while (stack.length && stack[stack.length - 1].indent >= indent) stack.pop(); const parent = stack[stack.length - 1].obj; const key = m[1].trim(); let val = m[2].trim(); if (val === '') { parent[key] = {}; stack.push({ indent, obj: parent[key] }); } else { if (/^".*"$/.test(val)) val = val.slice(1, -1); else if (/^-?\d+(\.\d+)?$/.test(val)) val = +val; parent[key] = val; } }
const brand = JSON.parse(readFileSync(`${out}/_brand-extraction.json`, 'utf8'));
const mods = JSON.parse(readFileSync(`${out}/_modules.json`, 'utf8'));
const types = JSON.parse(readFileSync(`${out}/_page-types.json`, 'utf8'));
const home = JSON.parse(readFileSync(`${out}/pages/nb-bank-privat-html.json`, 'utf8'));
const design = {
  _provenance: { writtenBy: 'stardust:extract (Phase 4 sidecar; design-json.mjs)', writtenAt: new Date().toISOString(), readArtifacts: [`${out}/DESIGN.md (frontmatter)`, `${out}/_brand-extraction.json`, `${out}/_modules.json`, `${out}/_page-types.json`, `${out}/pages/index.json`], synthesizedInputs: [], stardustVersion: '0.20.0', mode: 'descriptive-current-state' },
  name: root.name, description: root.description,
  colors: root.colors, typography: root.typography, rounded: root.rounded, spacing: root.spacing, components: root.components,
  extensions: {
    componentStyle: brand.componentStyle,
    motifs: brand.motifs,
    voice: brand.voice,
    voiceTable: brand.voiceTable,
    systemComponents: brand.systemComponents,
    iconFont: brand.iconFont ? { family: brand.iconFont.family, localPath: brand.iconFont.localPath, glyphCount: brand.iconFont.glyphCount, glyphs: brand.iconFont.glyphs } : null,
    scaleAudit: brand.type.scaleAudit, typePerLevel: brand.type.headingFamily.perLevel, textRendering: brand.type.textRendering, fontFiles: brand.type.files,
    layout: { containerMaxWidth: brand.spacing.containerMaxWidth, breakpoints: [{ name: 'sm', value: '480px' }, { name: 'md', value: '768px' }, { name: 'lg', value: '1024px' }, { name: 'xl', value: '1280px' }], sectionPadding: { base: '75px', small: '20px' }, gridGap: brand.spacing.gridGap, baseUnit: brand.spacing.baseUnit },
    shadows: brand.motifs.shadows.map((s, i) => ({ name: ['card-hover', 'card-rest', 'focus-ring'][i] || `shadow-${i}`, value: s.value, occurrences: s.occurrences })),
    patterns: { illustrations: 'https://www.sparebank1.no/content/dam/SB1/illustrasjoner/** (flat spot illustrations, lazy-loaded via data-lazy-src)' },
    declaredTokens: home.customProps || {},
    modules: mods.modules.map(m => ({ id: m.id, kind: m.kind, slots: m.slots, instances: m.instances, signals: m.signals, status: 'candidate', note: m.note })),
    pageTypes: types.types,
    metadata: { siteName: 'SpareBank 1', defaultOgImage: home.og?.image || null, themeColor: home.themeColor?.light || '#ffffff', locale: 'nb-NO', organizationJsonLd: { '@type': 'Organization', name: 'SpareBank 1', url: 'https://www.sparebank1.no/', logo: 'https://www.sparebank1.no/content/dam/SB1/nettsider/logo.svg' } },
    embedDominatedPages: brand.embedDominatedPages,
    register: brand.register,
  },
};
writeFileSync(`${out}/DESIGN.json`, JSON.stringify(design, null, 2));
console.log('DESIGN.json written:', Object.keys(design.colors).length, 'colors,', Object.keys(design.components).length, 'components,', design.extensions.modules.length, 'modules,', Object.keys(design.extensions.declaredTokens).length, 'declared tokens');
