// Render the film to MP4 (1920x1080, 30 fps, H.264 + AAC):
//   FFMPEG=/path/to/ffmpeg node tools/render-video.mjs [out.mp4] [fps]
// Frames are rendered frame-exactly in headless Chromium (index.html?export=1);
// the soundtrack is rendered by the same JS synth in Node.
import { spawn, execFileSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { openFilm, grab, ROOT } from './browser.mjs';

const out = process.argv[2] || join(ROOT, 'out/limericki-summer-fun.mp4');
const fps = +(process.argv[3] || 30);
const ffmpeg = process.env.FFMPEG || 'ffmpeg';
mkdirSync(join(ROOT, 'out'), { recursive: true });

const wav = join(ROOT, 'out/soundtrack.wav');
execFileSync(process.execPath, [join(ROOT, 'tools/render-audio.mjs'), wav, '48000'], { stdio: 'inherit' });

const { browser, page } = await openFilm();
const duration = await page.evaluate(() => window.LRExport.duration);
const frames = Math.round(duration * fps);

const ff = spawn(ffmpeg, [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  '-i', wav,
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '21', '-pix_fmt', 'yuv420p', '-tune', 'animation',
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
