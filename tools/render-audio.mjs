// Render the synthesized soundtrack to a WAV file (no browser needed):
//   node tools/render-audio.mjs [out.wav] [sampleRate]
import { createRequire } from 'node:module';
import { writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const LR = require(join(ROOT, 'src/audio.js'));

const out = process.argv[2] || join(ROOT, 'out/soundtrack.wav');
const sr = +(process.argv[3] || 48000);
const t0 = Date.now();
const { left, right, sampleRate } = LR.renderSoundtrack(sr);
console.log(`rendered ${(left.length / sampleRate).toFixed(2)}s in ${Date.now() - t0}ms`);

const n = left.length;
const bufOut = Buffer.alloc(44 + n * 4);
bufOut.write('RIFF', 0); bufOut.writeUInt32LE(36 + n * 4, 4); bufOut.write('WAVE', 8);
bufOut.write('fmt ', 12); bufOut.writeUInt32LE(16, 16); bufOut.writeUInt16LE(1, 20); bufOut.writeUInt16LE(2, 22);
bufOut.writeUInt32LE(sampleRate, 24); bufOut.writeUInt32LE(sampleRate * 4, 28); bufOut.writeUInt16LE(4, 32); bufOut.writeUInt16LE(16, 34);
bufOut.write('data', 36); bufOut.writeUInt32LE(n * 4, 40);
for (let i = 0; i < n; i++) {
  const l = Math.max(-1, Math.min(1, left[i])), r = Math.max(-1, Math.min(1, right[i]));
  bufOut.writeInt16LE(Math.round(l * 32767), 44 + i * 4);
  bufOut.writeInt16LE(Math.round(r * 32767), 46 + i * 4);
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, bufOut);
console.log('wrote', out);
