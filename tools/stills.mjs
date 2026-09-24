// Render still frames for review:  node tools/stills.mjs 1.5 7.2 12 ...
// (writes out/still-<t>.png)
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { openFilm, grab, ROOT } from './browser.mjs';

const times = process.argv.slice(2).map(Number);
if (!times.length) times.push(2, 7, 8.5, 13, 19, 24.5, 29);
const outDir = join(ROOT, 'out');
mkdirSync(outDir, { recursive: true });
const { browser, page } = await openFilm();
for (const t of times) {
  const t0 = Date.now();
  const png = await grab(page, t, 'png');
  const f = join(outDir, `still-${t.toFixed(2)}.png`);
  writeFileSync(f, png);
  console.log(f, `${Date.now() - t0}ms`);
}
await browser.close();
