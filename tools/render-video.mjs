// Render the film to MP4 (30 fps, H.264 + AAC):
//   FFMPEG=/path/to/ffmpeg node tools/render-video.mjs [--reel | --page fall.html] [out.mp4] [fps]
// 16:9 1920x1080 by default; --reel renders the 9:16 cut (reel.html); --page renders
// any film page (e.g. the fall edition). The page picks its own soundtrack variant.
// Frames are rendered frame-exactly in headless Chromium (index.html?export=1);
// the soundtrack is rendered by the same JS synth in Node.
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openFilm, grab, ROOT } from './browser.mjs';

const argv = process.argv.slice(2);
const pi = argv.indexOf('--page');
const pageFile = pi >= 0 ? argv.splice(pi, 2)[1] : null;
const reel = argv.includes('--reel');
const args = argv.filter((a) => a !== '--reel');
const file = pageFile || (reel ? 'reel.html' : 'index.html');
const out = args[0] || join(ROOT, 'out', 'limericki-' + (pageFile ? pageFile.replace('.html', '') : reel ? 'find-your-fit-reel' : 'find-your-fit') + '.mp4');
const fps = +(args[1] || 30);
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
mkdirSync(join(ROOT, 'out'), { recursive: true });

const { browser, page } = await openFilm('export=1', file);
const variant = await page.evaluate(() => window.LRExport.audio || 'summer');
const wav = join(ROOT, 'out/soundtrack.wav');
execFileSync(process.execPath, [join(ROOT, 'tools/render-audio.mjs'), wav, '48000', variant], { stdio: 'inherit' });

const duration = await page.evaluate(() => window.LRExport.duration);
const frames = Math.round(duration * fps);

const ff = spawn(ffmpeg, [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-i', wav,
  '-c:v', 'libx264', '-preset', 'slow', '-b:v', '6M', '-maxrate', '9M', '-bufsize', '12M', '-pix_fmt', 'yuv420p',
  '-c:a', 'aac', '-b:a', '192k',
  '-movflags', '+faststart', '-t', String(duration),
  out,
], { stdio: ['pipe', 'inherit', 'inherit'] });

const t0 = Date.now();
for (let i = 0; i < frames; i++) {
  const jpg = await grab(page, i / fps, 'jpeg', 0.95);
  if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once('drain', r));
  if (i % 30 === 0) process.stdout.write(`\rframe ${i}/${frames}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
}
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await browser.close();
console.log(`\nwrote ${out} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
