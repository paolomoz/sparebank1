// contact-sheet.mjs — tile per-page screenshots into review sheets for the Phase 2.5 vision gate.
// usage: node stardust/scripts/contact-sheet.mjs <screenshotsDir> <outDir> [perSheet=12]
import { chromium } from 'playwright';
import { readdirSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
const [dir, out, perSheetArg] = process.argv.slice(2);
const perSheet = +(perSheetArg || 12);
mkdirSync(out, { recursive: true });
const files = readdirSync(dir).filter(f => f.endsWith('.png')).sort();
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1600, height: 1200 } });
for (let i = 0; i < files.length; i += perSheet) {
  const chunk = files.slice(i, i + perSheet);
  const cells = chunk.map(f => `<figure><img src="file://${path.resolve(dir, f)}"><figcaption>${f.replace('.png','')}</figcaption></figure>`).join('');
  const html = `<!doctype html><style>body{margin:0;background:#111;font:11px ui-monospace,monospace;color:#ddd}main{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px}figure{margin:0;background:#222;padding:4px}img{width:100%;height:520px;object-fit:cover;object-position:top;display:block;background:#fff}figcaption{padding:4px 2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}</style><main>${cells}</main>`;
  const n = String(i / perSheet + 1).padStart(2, '0');
  const htmlPath = path.resolve(out, `sheet-${n}.html`);
  writeFileSync(htmlPath, html);
  await page.goto('file://' + htmlPath, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(out, `sheet-${n}.png`), fullPage: true });
  console.log(`sheet-${n}.png: ${chunk.join(', ')}`);
}
await b.close();
