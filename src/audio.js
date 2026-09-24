/* Soundtrack — synthesized from scratch in plain JavaScript (no samples).
 *
 * 120 BPM, 4/4, 15 bars = exactly 30 s, key of C.
 *   Ukulele     Karplus–Strong plucked strings, island strum with a light swing
 *   Bass        warm plucked sine bass, root–fifth bounce
 *   Drums       synth kick, hand claps, shaker, tambourine, snare fills, crash
 *   Whistle     the hook — a breezy whistled melody with vibrato & glides
 *   Glock/Marimba  sparkles, letter-pop arpeggios, mix & match riff
 *   Foley       boing, slide whistle, splash, bubbles, paper tears & slaps,
 *               scissor snips, sprinkler, ocean, rubber duck, party popper
 *
 * Pure function of the sample rate: LR.renderSoundtrack(48000) →
 * { sampleRate, left: Float32Array, right: Float32Array }.
 * Runs in the browser (played via Web Audio) and in Node (tools/render-audio.mjs). */
(function (root) {
  const LR = (root.LR = root.LR || {});

  LR.renderSoundtrack = function (SR = 48000) {
    const DUR = 30, BEAT = 0.5;
    const N = Math.ceil(DUR * SR);
    const L = new Float32Array(N), R = new Float32Array(N), SEND = new Float32Array(N);
    const TAU = Math.PI * 2;
    const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

    function rng(seed) {
      let a = seed | 0;
      return function () {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
      };
    }
    const R0 = rng(20260924);

    // ---------- mixing ----------
    function add(sig, t0, gain = 1, pan = 0, rev = 0) {
      const s0 = Math.round(t0 * SR);
      const a = ((Math.max(-1, Math.min(1, pan)) + 1) * Math.PI) / 4;
      const gl = Math.cos(a) * Math.SQRT2 * gain, gr = Math.sin(a) * Math.SQRT2 * gain, gs = rev * gain;
      const n = sig.length;
      for (let i = 0; i < n; i++) {
        const j = s0 + i;
        if (j < 0) continue;
        if (j >= N) break;
        const v = sig[i];
        L[j] += v * gl; R[j] += v * gr;
        if (gs) SEND[j] += v * gs;
      }
    }

    // ---------- filters (RBJ biquads) ----------
    function biquad(type, f, q = 0.707) {
      const w = (TAU * Math.min(f, SR * 0.45)) / SR, cw = Math.cos(w), sw = Math.sin(w), al = sw / (2 * q);
      let b0, b1, b2, a0, a1, a2;
      if (type === 'lp') { b0 = (1 - cw) / 2; b1 = 1 - cw; b2 = b0; }
      else if (type === 'hp') { b0 = (1 + cw) / 2; b1 = -(1 + cw); b2 = b0; }
      else { b0 = al; b1 = 0; b2 = -al; } // band-pass (constant peak gain)
      a0 = 1 + al; a1 = -2 * cw; a2 = 1 - al;
      return { b0: b0 / a0, b1: b1 / a0, b2: b2 / a0, a1: a1 / a0, a2: a2 / a0, x1: 0, x2: 0, y1: 0, y2: 0 };
    }
    function run(fl, x) {
      const y = fl.b0 * x + fl.b1 * fl.x1 + fl.b2 * fl.x2 - fl.a1 * fl.y1 - fl.a2 * fl.y2;
      fl.x2 = fl.x1; fl.x1 = x; fl.y2 = fl.y1; fl.y1 = y;
      return y;
    }
    function filt(sig, type, f, q) {
      const fl = biquad(type, f, q);
      for (let i = 0; i < sig.length; i++) sig[i] = run(fl, sig[i]);
      return sig;
    }
    function noise(n, seed) {
      const r = rng(seed), out = new Float32Array(n);
      for (let i = 0; i < n; i++) out[i] = r() * 2 - 1;
      return out;
    }
    const buf = (sec) => new Float32Array(Math.max(1, Math.round(sec * SR)));

    // ---------- timing ----------
    const SWING = 0.055; // in beats, applied to off-beat eighths
    function T(bar, beat) {
      const w = Math.floor(beat + 1e-9), f = beat - w;
      let s = f;
      if (Math.abs(f - 0.5) < 1e-6) s = 0.5 + SWING;
      else if (Math.abs(f - 0.25) < 1e-6 || Math.abs(f - 0.75) < 1e-6) s = f + SWING * 0.5;
      return bar * 2 + (w + s) * BEAT;
    }

    // ================= INSTRUMENTS =================
    // --- Ukulele: Karplus–Strong with fractional-delay tuning ---
    const ksCache = new Map();
    function ks(midi, variant) {
      const key = midi * 8 + variant;
      if (ksCache.has(key)) return ksCache.get(key);
      const f = mtof(midi), D = SR / f;
      const Nn = Math.floor(D - 0.6), d = D - 0.5 - Nn, C = (1 - d) / (1 + d);
      const len = Math.round(SR * 1.9);
      const out = new Float32Array(len);
      const line = new Float32Array(Nn);
      const r = rng(midi * 131 + variant * 17 + 5);
      let lp = 0, mean = 0;
      for (let i = 0; i < Nn; i++) { lp += ((r() * 2 - 1) - lp) * 0.5; line[i] = lp; mean += lp; }
      mean /= Nn;
      const pp = Math.max(1, Math.floor(Nn * 0.17)), tmp = line.slice();
      for (let i = 0; i < Nn; i++) line[i] = tmp[i] - mean - 0.75 * (tmp[(i - pp + Nn) % Nn] - mean);
      const t60 = 1.7 - (midi - 60) * 0.035;
      const g = Math.pow(10, -3 / (f * t60));
      let w = 0, prev = 0, apx = 0, apy = 0, peak = 0;
      for (let i = 0; i < len; i++) {
        const x = line[w];
        const avg = 0.5 * (x + prev); prev = x;
        const ap = C * avg + apx - C * apy; apx = avg; apy = ap;
        line[w] = ap * g;
        out[i] = x;
        w++; if (w === Nn) w = 0;
      }
      filt(out, 'lp', 4200, 0.6);
      filt(out, 'hp', 110, 0.7);
      for (let i = 0; i < len; i++) peak = Math.max(peak, Math.abs(out[i]));
      for (let i = 0; i < len; i++) out[i] /= peak || 1;
      ksCache.set(key, out);
      return out;
    }
    const STRINGS = [67, 60, 64, 69]; // G C E A (re-entrant)
    const SHAPES = {
      C: [0, 0, 0, 3], Am: [2, 0, 0, 0], F: [2, 0, 1, 0], G7: [0, 2, 1, 2], G: [0, 2, 3, 2], Em: [0, 4, 3, 2], Dm: [2, 2, 1, 0],
    };
    const UKE = 0.2;
    function strum(t, chord, dir, vel, dur) {
      const fr = SHAPES[chord];
      const order = dir === 'D' ? [0, 1, 2, 3] : [3, 2, 1, 0];
      const spread = dir === 'D' ? 0.013 : 0.008;
      order.forEach((si, k) => {
        const src = ks(STRINGS[si] + fr[si], (k + Math.round(t * 7)) % 3);
        const n = Math.min(src.length, Math.round((dur + 0.04) * SR));
        const s = src.slice(0, n);
        const fade = Math.min(n, Math.round(0.03 * SR));
        for (let i = 0; i < fade; i++) s[n - 1 - i] *= i / fade;
        const v = vel * (dir === 'U' ? 0.62 : 1) * (0.88 + R0() * 0.2) * (dir === 'U' && si === 1 ? 0.6 : 1);
        add(s, t + k * spread, v * UKE, -0.22 + si * 0.06, 0.12);
      });
    }
    const STRUM = [[0, 'D', 1], [1, 'D', 0.78], [1.5, 'U', 0.62], [2.5, 'U', 0.6], [3, 'D', 0.82], [3.5, 'U', 0.6]];

    // --- Bass ---
    const BASS = 0.34;
    function bass(t, midi, dur, vel = 1) {
      const f = mtof(midi), n = Math.round((dur + 0.12) * SR), s = new Float32Array(n);
      const d1 = Math.exp(-2.6 / SR), d2 = Math.exp(-45 / SR), d3 = Math.exp(-40 / SR);
      const att = 0.004 * SR, off = Math.round(dur * SR);
      let ph = 0, e = 1, bend = 0.025, rel = 1;
      for (let i = 0; i < n; i++) {
        ph += (TAU * f * (1 + bend)) / SR;
        bend *= d2; e *= d1;
        if (i > off) rel *= d3;
        const env = (i < att ? i / att : 1) * e * rel;
        const v = Math.sin(ph) + 0.38 * Math.sin(2 * ph) + 0.14 * Math.sin(3 * ph) + 0.05 * Math.sin(4 * ph);
        const z = 1.4 * v * env;
        s[i] = (z / (1 + Math.abs(z) * 0.55)) * 0.8;
      }
      add(s, t, vel * BASS, 0, 0.02);
    }
    const ROOT = { C: 48, Am: 45, F: 41, G7: 43, G: 43, Em: 40, Dm: 38 };

    // --- Drums ---
    function kick(t, vel = 1) {
      const s = buf(0.34), r = rng(Math.round(t * 1000));
      let ph = 0;
      for (let i = 0; i < s.length; i++) {
        const x = i / SR;
        ph += (TAU * (46 + 95 * Math.exp(-x * 32))) / SR;
        s[i] = Math.sin(ph) * Math.min(1, x / 0.002) * Math.exp(-x * 9) + (r() * 2 - 1) * 0.25 * Math.exp(-x * 900);
      }
      add(s, t, vel * 0.55, 0, 0);
    }
    function clap(t, vel = 1) {
      const s = noise(Math.round(0.28 * SR), Math.round(t * 997));
      filt(s, 'bp', 1150, 1.1);
      filt(s, 'hp', 500, 0.7);
      for (let i = 0; i < s.length; i++) {
        const x = i / SR;
        let e = 0;
        for (const o of [0, 0.011, 0.022]) if (x >= o) e = Math.max(e, Math.exp(-(x - o) * 190));
        if (x > 0.026) e = Math.max(e, 0.75 * Math.exp(-(x - 0.026) * 20));
        s[i] *= e * 2.2;
      }
      add(s, t, vel * 0.3, 0.08, 0.18);
    }
    function snare(t, vel = 1) {
      const s = noise(Math.round(0.22 * SR), Math.round(t * 991));
      filt(s, 'bp', 1900, 0.7);
      let ph = 0;
      for (let i = 0; i < s.length; i++) {
        const x = i / SR;
        ph += (TAU * 190) / SR;
        s[i] = s[i] * 2 * Math.exp(-x * 24) + Math.sin(ph) * 0.5 * Math.exp(-x * 34);
      }
      add(s, t, vel * 0.3, -0.05, 0.15);
    }
    function shaker(t, vel = 1) {
      const s = noise(Math.round(0.07 * SR), Math.round(t * 983));
      filt(s, 'hp', 6200, 0.7);
      filt(s, 'hp', 5200, 0.7);
      for (let i = 0; i < s.length; i++) { const x = i / SR; s[i] *= Math.min(1, x / 0.009) * Math.exp(-x * 55); }
      add(s, t, vel * 0.1, 0.35, 0.05);
    }
    function tamb(t, vel = 1) {
      const s = noise(Math.round(0.2 * SR), Math.round(t * 977));
      filt(s, 'hp', 7000, 0.8);
      let p1 = 0, p2 = 0;
      for (let i = 0; i < s.length; i++) {
        const x = i / SR;
        p1 += (TAU * 5230) / SR; p2 += (TAU * 7110) / SR;
        s[i] = (s[i] + 0.25 * Math.sin(p1) + 0.18 * Math.sin(p2)) * Math.exp(-x * 22);
      }
      add(s, t, vel * 0.085, -0.35, 0.1);
    }
    function crash(t, vel = 1) {
      const s = noise(Math.round(2.6 * SR), Math.round(t * 971));
      filt(s, 'hp', 3800, 0.7);
      filt(s, 'hp', 3000, 0.7);
      for (let i = 0; i < s.length; i++) { const x = i / SR; s[i] *= Math.min(1, x / 0.003) * (0.55 * Math.exp(-x * 1.9) + 0.45 * Math.exp(-x * 9)); }
      add(s, t, vel * 0.14, 0.2, 0.25);
    }

    // --- Mallets ---
    function mallet(t, midi, vel, parts, pan = 0, rev = 0.3, len = 1.6) {
      const f = mtof(midi), s = buf(len), r = rng(midi * 7 + Math.round(t * 100));
      const click = Math.round(0.004 * SR);
      for (let i = 0; i < click; i++) s[i] = (r() * 2 - 1) * 0.15 * (1 - i / click);
      for (const [ratio, amp, t60] of parts) {
        // recursive sine oscillator + recursive exponential decay (fast)
        const w = (TAU * f * ratio) / SR;
        if (w >= Math.PI) continue;
        const k = 2 * Math.cos(w), dec = Math.exp(-6.9 / (t60 * SR));
        let y1 = 0, y2 = -Math.sin(w), e = amp;
        const n = Math.min(s.length, Math.round(t60 * 1.6 * SR));
        for (let i = 0; i < n; i++) {
          const y = k * y1 - y2; y2 = y1; y1 = y;
          s[i] += y * e * (i < 72 ? i / 72 : 1);
          e *= dec;
        }
      }
      add(s, t, vel, pan, rev);
    }
    const GLOCK = [[1, 1, 1.5], [2.756, 0.32, 0.45], [5.404, 0.12, 0.2], [8.933, 0.04, 0.1]];
    const MARIMBA = [[1, 1, 0.55], [3.93, 0.22, 0.14], [9.2, 0.05, 0.05]];
    const glock = (t, m, v = 1, pan = 0.25) => mallet(t, m, v * 0.13, GLOCK, pan, 0.35);
    const marimba = (t, m, v = 1, pan = -0.15) => mallet(t, m, v * 0.2, MARIMBA, pan, 0.18, 0.8);

    // --- Whistle: one continuous voice with glides, vibrato & breath ---
    function whistle(notes, gain = 0.2, pan = 0.08) {
      if (!notes.length) return;
      for (const nt of notes) nt.f = mtof(nt.m);
      const t0 = notes[0].t - 0.05;
      const end = notes[notes.length - 1].t + notes[notes.length - 1].d + 0.3;
      const n = Math.round((end - t0) * SR), s = new Float32Array(n), r = rng(4242);
      let f = mtof(notes[0].m), a = 0, ph = 0, ni = 0, br = 0;
      const kf = 1 - Math.exp(-1 / (0.022 * SR));
      const ka = 1 - Math.exp(-1 / (0.018 * SR)), kr = 1 - Math.exp(-1 / (0.045 * SR));
      for (let i = 0; i < n; i++) {
        const tt = t0 + i / SR;
        while (ni < notes.length - 1 && tt >= notes[ni + 1].t) ni++;
        const nt = notes[ni];
        const on = tt >= nt.t && tt < nt.t + nt.d;
        const since = tt - nt.t;
        const artic = since < 0.03 && !nt.slur ? 0.55 : 1;
        const at = on ? (nt.v || 1) * artic : 0;
        if (on || tt < nt.t) f += (nt.f - f) * kf;
        a += (at - a) * (at > a ? ka : kr);
        const vib = Math.min(1, Math.max(0, (since - 0.1) / 0.2)) * 0.22;
        const fi = f * (1 + 0.0578 * vib * Math.sin(TAU * 5.4 * tt));
        ph += (TAU * fi) / SR;
        br += ((r() * 2 - 1) - br) * 0.35;
        s[i] = (Math.sin(ph) + 0.035 * Math.sin(2 * ph) + br * 0.05) * a;
      }
      filt(s, 'lp', 5200, 0.7);
      add(s, t0, gain, pan, 0.32);
    }

    // ================= FOLEY =================
    function pop(t, f0 = 1200, f1 = 480, vel = 1, pan = 0) {
      const s = buf(0.08);
      let ph = 0;
      for (let i = 0; i < s.length; i++) {
        const x = i / SR;
        ph += (TAU * (f1 + (f0 - f1) * Math.exp(-x * 90))) / SR;
        s[i] = Math.sin(ph) * Math.min(1, x / 0.001) * Math.exp(-x * 55);
      }
      add(s, t, vel * 0.16, pan, 0.2);
    }
    function blipNote(t, midi, vel = 1, pan = 0) {
      const f = mtof(midi), s = buf(0.16);
      let ph = 0;
      for (let i = 0; i < s.length; i++) {
        const x = i / SR;
        ph += (TAU * f * (1 + 0.5 * Math.exp(-x * 120))) / SR;
        s[i] = (Math.sin(ph) + 0.2 * Math.sin(2 * ph)) * Math.min(1, x / 0.002) * Math.exp(-x * 26);
      }
      add(s, t, vel * 0.11, pan, 0.3);
    }
    function whoosh(t, dur = 0.5, vel = 1, fa = 400, fb = 2600, pan = 0) {
      const s = noise(Math.round(dur * SR), Math.round(t * 911));
      let fl = biquad('bp', fa, 1.3);
      for (let i = 0; i < s.length; i++) {
        const k = i / s.length;
        if (i % 64 === 0) {
          const fc = fa * Math.pow(fb / fa, Math.sin(k * Math.PI * 0.85));
          const nf = biquad('bp', fc, 1.3);
          nf.x1 = fl.x1; nf.x2 = fl.x2; nf.y1 = fl.y1; nf.y2 = fl.y2; fl = nf;
        }
        s[i] = run(fl, s[i]) * Math.pow(Math.sin(k * Math.PI), 2) * 1.6;
      }
      add(s, t, vel * 0.22, pan, 0.15);
    }
    function boing(t, f0 = 170, vel = 1) {
      const s = buf(0.6);
      let ph = 0;
      for (let i = 0; i < s.length; i++) {
        const x = i / SR;
        const f = f0 * (1 + 0.1 * x) * (1 + 0.32 * Math.sin(TAU * 13 * x) * Math.exp(-x * 4.5));
        ph += (TAU * f) / SR;
        const v = Math.sin(ph) + 0.45 * Math.sin(2 * ph) + 0.2 * Math.sin(3 * ph);
        s[i] = v * Math.min(1, x / 0.003) * Math.exp(-x * 4.8);
      }
      add(s, t, vel * 0.19, -0.1, 0.12);
    }
    function slideWhistle(t, dur, f0, f1, vel = 1) {
      const s = buf(dur + 0.08), r = rng(Math.round(t * 131));
      let ph = 0, br = 0;
      for (let i = 0; i < s.length; i++) {
        const x = i / SR, k = Math.min(1, x / dur);
        const f = f0 * Math.pow(f1 / f0, k * k * (3 - 2 * k)) * Math.pow(2, (0.25 * Math.sin(TAU * 6.5 * x)) / 12);
        ph += (TAU * f) / SR;
        br += ((r() * 2 - 1) - br) * 0.3;
        const env = Math.min(1, x / 0.03) * (x > dur ? Math.exp(-(x - dur) * 60) : 1);
        s[i] = (Math.sin(ph) + 0.08 * Math.sin(2 * ph) + br * 0.06) * env;
      }
      add(s, t, vel * 0.13, 0.1, 0.25);
    }
    function splash(t, vel = 1) {
      const n = Math.round(1.1 * SR), s = noise(n, 5150);
      let fl = biquad('lp', 5000, 0.7);
      for (let i = 0; i < n; i++) {
        const x = i / SR;
        if (i % 64 === 0) { const nf = biquad('lp', 700 + 5200 * Math.exp(-x * 3.2), 0.8); nf.x1 = fl.x1; nf.x2 = fl.x2; nf.y1 = fl.y1; nf.y2 = fl.y2; fl = nf; }
        s[i] = run(fl, s[i]) * Math.min(1, x / 0.006) * (0.65 * Math.exp(-x * 5) + 0.35 * Math.exp(-x * 1.8)) * 1.3;
      }
      let ph = 0;
      for (let i = 0; i < Math.round(0.2 * SR); i++) { const x = i / SR; ph += (TAU * (60 + 40 * Math.exp(-x * 30))) / SR; s[i] += Math.sin(ph) * 0.9 * Math.exp(-x * 14); }
      add(s, t, vel * 0.42, 0.05, 0.18);
      const r = rng(77);
      for (let k = 0; k < 16; k++) plink(t + 0.05 + r() * 0.75, 1000 + r() * 1400, 0.25 + r() * 0.35, (r() - 0.5) * 0.8);
    }
    function plink(t, f0, vel, pan) {
      const s = buf(0.06);
      let ph = 0;
      for (let i = 0; i < s.length; i++) { const x = i / SR; ph += (TAU * f0 * (1 + x * 14)) / SR; s[i] = Math.sin(ph) * Math.exp(-x * 75); }
      add(s, t, vel * 0.14, pan, 0.25);
    }
    function bubble(t, f0, vel = 1, pan = 0) {
      const s = buf(0.07);
      let ph = 0;
      for (let i = 0; i < s.length; i++) { const x = i / SR; ph += (TAU * f0 * Math.exp(x * 16)) / SR; s[i] = Math.sin(ph) * Math.min(1, x / 0.002) * Math.exp(-x * 45); }
      add(s, t, vel * 0.14, pan, 0.3);
    }
    function tear(t, dur = 0.5, vel = 1) {
      const n = Math.round(dur * SR), s = new Float32Array(n), r = rng(Math.round(t * 313));
      for (let i = 0; i < n; i++) {
        const k = i / n;
        const dens = 900 + 2600 * Math.sin(k * Math.PI);
        s[i] = r() < dens / SR ? (r() * 2 - 1) * (0.5 + r()) : 0;
        s[i] += (r() * 2 - 1) * 0.06;
      }
      filt(s, 'bp', 2600, 0.6);
      filt(s, 'hp', 700, 0.7);
      for (let i = 0; i < n; i++) { const k = i / n; s[i] *= Math.pow(Math.sin(Math.min(1, k * 1.15) * Math.PI), 0.7) * 3.2; }
      add(s, t, vel * 0.3, 0, 0.1);
    }
    function slap(t, vel = 1, pan = 0) {
      const s = noise(Math.round(0.12 * SR), Math.round(t * 733));
      filt(s, 'lp', 3200, 0.7);
      let ph = 0;
      for (let i = 0; i < s.length; i++) { const x = i / SR; ph += (TAU * 115) / SR; s[i] = s[i] * Math.exp(-x * 60) * 1.3 + Math.sin(ph) * 0.8 * Math.exp(-x * 30); }
      add(s, t, vel * 0.3, pan, 0.08);
    }
    function scribble(t, dur, vel = 1) {
      const s = noise(Math.round(dur * SR), Math.round(t * 677));
      filt(s, 'bp', 3400, 1.6);
      for (let i = 0; i < s.length; i++) { const x = i / SR, k = x / dur; s[i] *= Math.pow(Math.abs(Math.sin(TAU * 4.5 * x)), 1.5) * Math.sin(k * Math.PI) * 2.2; }
      add(s, t, vel * 0.12, 0.15, 0.05);
    }
    function snip(t, vel = 1) {
      for (const o of [0, 0.075]) {
        const s = noise(Math.round(0.06 * SR), Math.round((t + o) * 541));
        filt(s, 'hp', 4200, 0.8);
        let ph = 0;
        for (let i = 0; i < s.length; i++) { const x = i / SR; ph += (TAU * 3150) / SR; s[i] = s[i] * Math.exp(-x * 400) * 1.2 + Math.sin(ph) * 0.4 * Math.exp(-x * 70); }
        add(s, t + o, vel * 0.22, 0.1, 0.12);
      }
    }
    function squeak(t, vel = 1) {
      const s = buf(0.2);
      let ph = 0;
      for (let i = 0; i < s.length; i++) {
        const x = i / SR;
        const f = 1150 + 260 * (x / 0.2) + 90 * Math.sin(TAU * 30 * x);
        ph += (TAU * f) / SR;
        s[i] = (Math.sin(ph) + 0.3 * Math.sin(2 * ph)) * Math.pow(Math.sin((x / 0.2) * Math.PI), 0.6);
      }
      add(s, t, vel * 0.1, 0.4, 0.2);
    }
    function thup(t, vel = 1, pan = 0) {
      const s = buf(0.12);
      let ph = 0;
      for (let i = 0; i < s.length; i++) { const x = i / SR; ph += (TAU * (95 + 60 * Math.exp(-x * 40))) / SR; s[i] = Math.sin(ph) * Math.exp(-x * 35); }
      add(s, t, vel * 0.22, pan, 0.02);
    }
    function ambience(t0, t1, kind, vel) {
      const n = Math.round((t1 - t0) * SR), s = new Float32Array(n), r = rng(kind === 'ocean' ? 101 : 202);
      let b = 0;
      for (let i = 0; i < n; i++) {
        const x = i / SR;
        const fade = Math.min(1, x / 0.35, (t1 - t0 - x) / 0.35);
        if (kind === 'ocean') {
          b = b * 0.985 + (r() * 2 - 1) * 0.15;
          s[i] = b * (0.45 + 0.55 * Math.pow(Math.sin(TAU * 0.16 * x + 1.2) * 0.5 + 0.5, 2)) * fade;
        } else {
          s[i] = (r() * 2 - 1) * (0.7 + 0.3 * Math.sin(TAU * 0.27 * x)) * fade;
        }
      }
      if (kind === 'ocean') { filt(s, 'lp', 900, 0.7); filt(s, 'hp', 60, 0.7); }
      else { filt(s, 'hp', 3500, 0.7); filt(s, 'lp', 9000, 0.7); }
      add(s, t0, vel, kind === 'ocean' ? -0.1 : 0.05, 0.05);
    }
    function gull(t, vel = 1) {
      const s = buf(0.34);
      let ph = 0;
      for (let i = 0; i < s.length; i++) {
        const x = i / SR, k = x / 0.34;
        const f = 1500 + 520 * Math.sin(k * Math.PI * 0.9) - 250 * k;
        ph += (TAU * f * (1 + 0.012 * Math.sin(TAU * 32 * x))) / SR;
        s[i] = (Math.sin(ph) + 0.5 * Math.sin(2 * ph) + 0.2 * Math.sin(3 * ph)) * Math.pow(Math.sin(k * Math.PI), 1.4);
      }
      filt(s, 'lp', 4000, 0.7);
      add(s, t, vel * 0.045, 0.5, 0.4);
    }

    // ================= ARRANGEMENT =================
    // chord per half bar (bar, beat, chord)
    const CH = [
      [0, 0, 'C'], [1, 0, 'G7'],
      [2, 0, 'C'], [3, 0, 'Am'], [4, 0, 'F'], [5, 0, 'G7'],
      [6, 0, 'C'], [7, 0, 'Am'], [8, 0, 'F'], [9, 0, 'G7'],
      [10, 0, 'F'], [10, 2, 'G7'],
      [11, 0, 'C'], [11, 2, 'Am'], [12, 0, 'F'], [12, 2, 'G'],
      [13, 0, 'C'], [13, 2, 'F'], [13, 3, 'G'],
      [14, 0, 'C'],
    ];
    const chordAt = (bar, beat) => {
      let c = 'C';
      for (const [b, be, ch] of CH) if (b < bar || (b === bar && be <= beat)) c = ch;
      return c;
    };

    // --- ukulele ---
    const strums = [];
    for (let bar = 0; bar < 14; bar++) {
      for (const [beat, dir, v] of STRUM) {
        if (bar === 13 && beat > 0 && beat < 2.5) continue; // leave room for the logo "ta-da"
        strums.push({ t: T(bar, beat), chord: chordAt(bar, beat), dir, v: v * (bar === 0 ? 0.8 : 1) });
      }
    }
    strums.push({ t: T(14, 0), chord: 'C', dir: 'D', v: 1.15, last: true });
    strums.forEach((s, i) => {
      const next = strums[i + 1];
      const dur = s.last ? 1.8 : next.t - s.t;
      strum(s.t, s.chord, s.dir, s.v, dur);
    });
    // a slow flourish on the final chord
    [0.18, 0.36].forEach((o, i) => strum(T(14, 0) + o, 'C', 'D', 0.4 - i * 0.12, 1.5));

    // --- bass ---
    for (let bar = 0; bar < 14; bar++) {
      for (const [beat, which, d, v] of [[0, 'r', 0.9, 1], [1.5, 'r', 0.35, 0.7], [2, '5', 0.9, 0.9], [3.5, 'o', 0.35, 0.7]]) {
        if (bar === 13 && beat > 0 && beat < 2) continue;
        const c = chordAt(bar, beat);
        let m = ROOT[c];
        if (which === '5') m += 7;
        if (which === 'o') m += 12;
        if (m > 55) m -= 12;
        bass(T(bar, beat), m, d, v);
      }
    }
    bass(T(14, 0), 36, 1.6, 1.1);

    // --- drums ---
    for (let bar = 0; bar < 14; bar++) {
      const full = bar >= 1;
      for (let b = 0; b < 4; b++) {
        if (bar === 13 && b === 1) continue;
        if ((b === 0 || b === 2) && (full || b === 2)) kick(T(bar, b), b === 0 ? 1 : 0.85);
        if ((b === 1 || b === 3) && full) clap(T(bar, b), 1);
      }
      if (full && bar % 2 === 1) kick(T(bar, 3.5), 0.55);
      // shaker 16ths with accents on the off-beats
      for (let k = 0; k < 16; k++) {
        const beat = k / 4;
        shaker(T(bar, beat), (k % 2 ? 1 : 0.55) * (full ? 1 : 0.7));
      }
      if (bar >= 6 && bar <= 12) for (const b of [1, 3]) tamb(T(bar, b), 1);
    }
    // snare fills into the mix & match section and into the end card
    for (let k = 0; k < 4; k++) snare(T(10, 3 + k / 4), 0.5 + k * 0.17);
    for (let k = 0; k < 6; k++) snare(T(12, 2.5 + k / 4), 0.45 + k * 0.11);
    crash(26.0, 1);
    kick(26.0, 1.1);
    crash(28.0, 1.2);
    kick(28.0, 1.2);

    // --- whistle hook ---
    const W = [];
    const phrase = (bar, list) => list.forEach(([beat, m, d, slur]) => W.push({ t: T(bar, beat), m, d: d * BEAT * 0.94, slur }));
    phrase(1, [[3, 79, 0.5], [3.5, 83, 0.5]]); // pickup
    phrase(2, [[0, 88, 0.75], [0.75, 86, 0.25, 1], [1, 84, 0.5], [1.5, 88, 0.5], [2, 91, 1.5]]);
    phrase(3, [[0, 93, 0.5], [0.5, 91, 0.5, 1], [1, 88, 0.5], [1.5, 84, 1.2], [3, 88, 0.5], [3.5, 86, 0.5]]);
    phrase(4, [[0, 84, 0.5], [0.5, 81, 0.5], [1, 84, 0.5], [1.5, 89, 1.0], [2.5, 88, 0.5, 1], [3, 86, 1]]);
    phrase(5, [[0, 83, 0.5], [0.5, 86, 0.5], [1, 91, 1.4], [2.5, 89, 0.5], [3, 86, 0.5, 1], [3.5, 83, 0.5]]);
    phrase(6, [[0, 84, 0.5], [0.5, 88, 0.5], [1, 91, 1.0], [2, 93, 0.5], [2.5, 91, 0.5, 1], [3, 88, 1]]);
    phrase(7, [[0, 84, 0.5], [0.5, 88, 0.5], [1, 93, 1.4], [2.5, 91, 0.5], [3, 88, 0.5, 1], [3.5, 84, 0.5]]);
    phrase(8, [[0, 89, 0.5], [0.5, 88, 0.5, 1], [1, 86, 0.5], [1.5, 84, 0.5], [2, 81, 1.0], [3, 84, 0.5], [3.5, 86, 0.5]]);
    phrase(9, [[0, 86, 1.0], [1, 79, 0.5], [1.5, 83, 0.5], [2, 86, 0.5], [2.5, 89, 0.5], [3, 88, 0.5, 1], [3.5, 86, 0.5]]);
    phrase(10, [[0, 84, 1.4], [1.5, 81, 0.5], [2, 79, 1.2]]);
    phrase(13, [[2.5, 88, 0.25], [2.75, 91, 0.25], [3, 93, 0.25], [3.5, 91, 0.5]]);
    phrase(14, [[0, 84, 2.6]]);
    whistle(W, 0.1);

    // --- marimba riff for mix & match (bars 11–12) ---
    const ARP = { C: [60, 64, 67, 72], Am: [57, 60, 64, 69], F: [53, 57, 60, 65], G: [55, 59, 62, 67] };
    for (let bar = 11; bar <= 12; bar++) {
      for (let k = 0; k < 8; k++) {
        const beat = k / 2, c = chordAt(bar, beat);
        const notes = ARP[c] || ARP.C;
        const m = notes[[0, 2, 1, 3, 2, 1, 3, 2][k]] + 12;
        marimba(T(bar, beat), m, k % 2 ? 0.7 : 1);
      }
    }
    // a little marimba answer under the beach bars
    for (const [bar, beat, m] of [[5, 3, 79], [5, 3.5, 76], [6, 3.5, 72], [7, 3, 76], [7, 3.5, 79]]) marimba(T(bar, beat), m, 0.8, 0.3);

    // ================= FOLEY CUES (synced to the picture) =================
    const PENTA = [72, 74, 76, 79, 81, 84, 86, 88, 91, 93, 96];
    // intro
    [84, 88, 91, 96].forEach((m, i) => glock(0.12 + i * 0.045, m, 0.9));
    whoosh(0.2, 0.5, 0.6, 500, 2400, -0.6);
    whoosh(0.42, 0.5, 0.5, 500, 2400, 0.6);
    whoosh(0.56, 0.5, 0.5, 450, 2200, -0.5);
    slap(0.62, 0.45, -0.6); slap(0.84, 0.4, 0.6); slap(0.98, 0.4, -0.5);
    'Hello,'.split('').forEach((c, i) => blipNote(0.5 + i * 0.05 + 0.06, PENTA[i], 0.8, -0.2));
    'summer!'.split('').forEach((c, i) => blipNote(0.8 + i * 0.06 + 0.06, PENTA[i + 3], 0.9, 0.2));
    [[1.25, -0.4], [1.4, 0], [1.55, 0.4]].forEach(([t, p], i) => { bubble(t + 0.05, 380 + i * 70, 1.4, p); pop(t + 0.1, 900, 420, 0.6, p); });
    slap(1.72, 0.5, 0);
    scribble(1.86, 0.75, 1);
    blipNote(2.72, 91, 0.7, 0.3);
    // intro → pool
    tear(3.72, 0.55, 1);
    // pool
    for (let k = 0; k < 7; k++) thup(3.95 + k * 0.19, 0.35, -0.4 + k * 0.05);
    boing(5.0, 185, 0.9);
    boing(5.5, 150, 1.2);
    whoosh(5.72, 0.45, 0.8, 600, 2600, 0);
    slideWhistle(5.76, 0.5, 520, 1560, 1);
    slideWhistle(6.36, 0.58, 1500, 430, 0.9);
    splash(7.0, 1.1);
    const rb = rng(9);
    for (let k = 0; k < 14; k++) bubble(7.1 + rb() * 0.85, 420 + rb() * 700, 0.6 + rb() * 0.5, (rb() - 0.5) * 0.6);
    'SPLOOSH!'.split('').forEach((c, i) => slap(7.04 + i * 0.055 + 0.05, 0.16, 0.4));
    bubble(7.98, 520, 1.2, 0.1); pop(8.02, 1000, 400, 0.6, 0.1);
    [84, 88, 91].forEach((m, i) => glock(8.08 + i * 0.07, m, 0.6, 0));
    // pool → beach
    tear(9.7, 0.6, 1);
    ambience(9.8, 16.2, 'ocean', 0.16);
    whoosh(10.0, 0.9, 0.7, 300, 1600, 0.5);
    gull(10.55, 1); gull(10.95, 0.8); gull(12.6, 0.7);
    whoosh(13.42, 0.55, 0.8, 500, 2600, 0);
    slideWhistle(13.47, 0.26, 700, 1300, 0.55);
    splash(14.0, 0.45);
    [86, 91, 93].forEach((m, i) => glock(10.95 + i * 0.07, m, 0.6, 0));
    // beach → yard
    tear(15.7, 0.6, 1);
    ambience(15.8, 22.1, 'spray', 0.03);
    for (let k = 0; k < 6; k++) { thup(16.62 + k, 0.4, -0.3); thup(17.12 + k, 0.3, 0.3); }
    squeak(18.9, 1); squeak(19.14, 0.8); squeak(21.1, 0.9);
    [88, 91, 96].forEach((m, i) => glock(16.95 + i * 0.07, m, 0.6, 0));
    // yard → mix & match (sheet slides in)
    whoosh(21.72, 0.55, 1, 350, 2000, 0.6);
    slap(22.0, 0.5, 0.3);
    for (const [t, p] of [[22.15, -0.6], [22.3, 0.6], [23.2, -0.6]]) pop(t + 0.08, 1100, 520, 0.7, p);
    for (const t of [22.62, 23.62, 24.62]) whoosh(t, 0.4, 0.6, 700, 3000, 0);
    for (const t of [23.0, 24.0, 25.0]) { snip(t - 0.02, 1); glock(t + 0.02, 96, 0.5, 0); }
    for (const [t, p] of [[22.4, -0.6], [23.4, 0.6], [24.4, -0.6], [25.15, 0.6]]) slap(t + 0.05, 0.75, p);
    // mix → end card
    tear(25.7, 0.6, 1);
    // wordmark letters play a glock arpeggio
    'LIMERICKI'.split('').forEach((c, i) => glock(26.12 + i * 0.075 + 0.07, PENTA[i + 1], 0.75, -0.3 + i * 0.07));
    pop(27.0, 1000, 460, 0.5, -0.2); pop(27.4, 1200, 520, 0.5, 0.2);
    slap(27.9, 0.5, 0);
    scribble(27.98, 0.55, 0.9);
    // final chord: party popper + sparkle
    pop(28.0, 1800, 300, 1.2, 0);
    [72, 76, 79, 84, 88, 91, 96].forEach((m, i) => glock(28.02 + i * 0.05, m, 0.7, -0.3 + i * 0.1));
    tear(28.05, 0.7, 0.35);

    // ================= MASTER =================
    // Freeverb-style reverb on the send bus
    function reverb(input) {
      const sc = SR / 44100;
      const combs = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
      const aps = [556, 441, 341, 225];
      const outs = [];
      for (const spread of [0, 23]) {
        const out = new Float32Array(N);
        const cb = combs.map((d) => ({ b: new Float32Array(Math.round((d + spread) * sc)), i: 0, f: 0 }));
        const ab = aps.map((d) => ({ b: new Float32Array(Math.round((d + spread) * sc)), i: 0 }));
        const fb = 0.8, damp = 0.35;
        for (let n = 0; n < N; n++) {
          const x = input[n] * 0.12;
          let y = 0;
          for (const c of cb) {
            const o = c.b[c.i];
            c.f = o * (1 - damp) + c.f * damp;
            c.b[c.i] = x + c.f * fb;
            if (++c.i >= c.b.length) c.i = 0;
            y += o;
          }
          for (const a of ab) {
            const o = a.b[a.i];
            a.b[a.i] = y + o * 0.5;
            if (++a.i >= a.b.length) a.i = 0;
            y = o - y;
          }
          out[n] = y;
        }
        outs.push(out);
      }
      return outs;
    }
    const [wl, wr] = reverb(SEND);
    for (let i = 0; i < N; i++) { L[i] += wl[i] * 0.9; R[i] += wr[i] * 0.9; }
    // DC/rumble cleanup
    filt(L, 'hp', 30, 0.7); filt(R, 'hp', 30, 0.7);

    // look-ahead peak limiter
    const thr = 0.9, look = Math.round(0.004 * SR), rel = Math.exp(-1 / (0.09 * SR));
    const need = new Float32Array(N);
    for (let i = 0; i < N; i++) { const p = Math.max(Math.abs(L[i]), Math.abs(R[i])); need[i] = p > thr ? thr / p : 1; }
    // running minimum over the look-ahead window (simple deque-free O(N*look/8) via block mins)
    const gmin = new Float32Array(N);
    for (let i = N - 1; i >= 0; i--) {
      let m = need[i];
      for (let k = 1; k < look && i + k < N; k += 8) m = Math.min(m, need[i + k]);
      gmin[i] = m;
    }
    let g = 1;
    for (let i = 0; i < N; i++) {
      const target = gmin[i];
      g = target < g ? target : target + (g - target) * rel;
      L[i] *= g; R[i] *= g;
    }
    // normalise to -1 dBFS and fade the tail
    let peak = 0;
    for (let i = 0; i < N; i++) peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]));
    const norm = peak > 0 ? 0.89 / peak : 1;
    const fadeStart = Math.round(29.35 * SR);
    for (let i = 0; i < N; i++) {
      const f = i > fadeStart ? Math.max(0, 1 - (i - fadeStart) / (N - fadeStart)) : 1;
      L[i] *= norm * f; R[i] *= norm * f;
    }
    return { sampleRate: SR, left: L, right: R };
  };

  if (typeof module !== 'undefined' && module.exports) module.exports = LR;
})(typeof self !== 'undefined' ? self : globalThis);
