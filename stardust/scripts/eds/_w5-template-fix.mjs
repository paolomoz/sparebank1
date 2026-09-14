#!/usr/bin/env node
/**
 * _w5-template-fix.mjs — W5 post-step for the three pages the roster (stardust/current/_page-types.json / state.json) files under
 * news-article although their live template is the nettsider-frontend `sb1-story` (their prototypes are `section.story` with the
 * story header): convert.mjs writes `template: news-article` from pg.archetypeFamily, which would render them with the article
 * card layout and the article header. The documents' `template` row is set to `campaign-landing` (the truth of the content;
 * blocks/header, footer and styles key on it). Filed in stardust/rollout/eds-requests.md (W5) for the roster fix.
 *   node stardust/scripts/eds/_w5-template-fix.mjs
 */
import fs from 'node:fs';
const STORY_PAGES = ['nb-bank-om-oss-nyheter-bank-regnskap-nerderiket-html', 'nb-bank-privat-forsikring-kundehistorier-sikrer-seg-mot-vannlekkasje-klok-av-skade-html', 'nb-bank-privat-sparing-markedsnytt-artikler-kan-utviklingen-til-teknologifondene-fortsette-videre-i-samme-tempo-html'];
for (const slug of STORY_PAGES) {
  const logFile = `stardust/rollout/eds-log/${slug}.json`; if (!fs.existsSync(logFile)) { console.log(`skip ${slug} (not converted)`); continue; }
  const log = JSON.parse(fs.readFileSync(logFile, 'utf8')); const html = fs.readFileSync(log.file, 'utf8');
  const fixed = html.replace('<div><div>template</div><div>news-article</div></div>', '<div><div>template</div><div>campaign-landing</div></div>');
  if (fixed !== html) { fs.writeFileSync(log.file, fixed); log.notes = [...(log.notes || []), 'template: news-article → campaign-landing (W5 _w5-template-fix.mjs — the live page is an sb1-story; roster misclassification filed in eds-requests.md)']; fs.writeFileSync(logFile, JSON.stringify(log, null, 1)); console.log(`${slug}: template → campaign-landing`); } else console.log(`${slug}: already campaign-landing`);
}
