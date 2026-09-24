// Shared headless-Chromium launcher for the render tools.
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export async function openFilm(query = 'export=1') {
  const opts = { args: ['--allow-file-access-from-files'] };
  // Use a preinstalled Chromium if PLAYWRIGHT_CHROMIUM is set or a known path exists
  const pre = process.env.PLAYWRIGHT_CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
  if (existsSync(pre)) opts.executablePath = pre;
  const browser = await chromium.launch(opts);
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('pageerror:', e.message));
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.error('console:', m.text()); });
  await page.goto(pathToFileURL(join(ROOT, 'index.html')).href + '?' + query);
  await page.waitForFunction(() => document.title === 'ready' || document.title.startsWith('ERR'), null, { timeout: 60000 });
  const title = await page.title();
  if (title.startsWith('ERR')) throw new Error(title);
  return { browser, page };
}

// Render time t and return PNG/JPEG bytes of the canvas.
export async function grab(page, t, type = 'png', quality = 0.95) {
  const b64 = await page.evaluate(([t, type, q]) => {
    window.LRExport.frame(t);
    const c = document.getElementById('film');
    return c.toDataURL(type === 'png' ? 'image/png' : 'image/jpeg', q).split(',')[1];
  }, [t, type, quality]);
  return Buffer.from(b64, 'base64');
}
