// Render still frames for review:  node tools/stills.mjs [--reel] 1.5 7.2 12 ...
// (writes out/still-<t>.png, out/reel-<t>.png with --reel, or out/<page>-<t>.png with --page fall.html)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openFilm, grab, ROOT } from './browser.mjs';

const argv = process.argv.slice(2);
const pi = argv.indexOf('--page');
const page = pi >= 0 ? argv.splice(pi, 2)[1] : null;
const reel = argv.includes('--reel');
const file = page || (reel ? 'reel.html' : 'index.html');
const prefix = page ? page.replace('.html', '') : reel ? 'reel' : 'still';
const times = argv.filter((a) => a !== '--reel').map(Number);
if (!times.length) times.push(2, 7, 8.5, 13, 19, 24.5, 29);
const outDir = join(ROOT, 'out');
mkdirSync(outDir, { recursive: true });
const { browser, page: tab } = await openFilm('export=1', file);
for (const t of times) {
  const t0 = Date.now();
  const png = await grab(tab, t, 'png');
  const f = join(outDir, `${prefix}-${t.toFixed(2)}.png`);
  writeFileSync(f, png);
  console.log(f, `${Date.now() - t0}ms`);
}
await browser.close();
