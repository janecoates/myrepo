/* Lime Ricki "Summer Fun" — core helpers: seeded randomness, noise, easing, timing.
 * Everything is deterministic: the whole film is a pure function of time `t`,
 * so any frame can be rendered (or scrubbed to) in isolation. */
(function (root) {
  const LR = (root.LR = root.LR || {});

  LR.W = 1920;
  LR.H = 1080;
  LR.FPS_BOIL = 12; // "line boil" rate — hand-drawn outlines redraw 12x per second

  // ---------- hashing / randomness ----------
  function hashi(x) {
    x |= 0;
    x = Math.imul(x ^ (x >>> 16), 0x7feb352d);
    x = Math.imul(x ^ (x >>> 15), 0x846ca68b);
    return (x ^ (x >>> 16)) >>> 0;
  }
  // deterministic random in [0,1) from up to three integers
  function rnd(a, b = 0, c = 0) {
    return hashi(Math.imul(a | 0, 0x9e3779b1) ^ hashi(Math.imul(b | 0, 0x85ebca6b) ^ hashi(c | 0))) / 4294967296;
  }
  function rrange(lo, hi, a, b, c) { return lo + (hi - lo) * rnd(a, b, c); }
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // ---------- math ----------
  const clamp = (x, a = 0, b = 1) => (x < a ? a : x > b ? b : x);
  const lerp = (a, b, k) => a + (b - a) * k;
  const smooth = (k) => k * k * (3 - 2 * k);
  // normalized progress of t through [a,b], clamped
  const prog = (t, a, b) => clamp((t - a) / (b - a));
  const DEG = Math.PI / 180;

  // 1D value noise in [-1,1]
  function noise1(x, seed = 0) {
    const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
    return lerp(rnd(i, seed), rnd(i + 1, seed), u) * 2 - 1;
  }
  function fbm1(x, seed = 0, oct = 4) {
    let a = 0.5, s = 0, f = 1, n = 0;
    for (let o = 0; o < oct; o++) { s += a * noise1(x * f, seed + o * 1013); n += a; f *= 2.07; a *= 0.5; }
    return s / n;
  }

  // ---------- easing ----------
  const E = {
    linear: (k) => k,
    inQuad: (k) => k * k,
    outQuad: (k) => 1 - (1 - k) * (1 - k),
    inOut: (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
    outCubic: (k) => 1 - Math.pow(1 - k, 3),
    inCubic: (k) => k * k * k,
    inOutCubic: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
    outBack: (k, s = 1.9) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2),
    inBack: (k, s = 1.7) => (s + 1) * k * k * k - s * k * k,
    outElastic: (k) => {
      if (k <= 0) return 0; if (k >= 1) return 1;
      return Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;
    },
    outBounce: (k) => {
      const n = 7.5625, d = 2.75;
      if (k < 1 / d) return n * k * k;
      if (k < 2 / d) return n * (k -= 1.5 / d) * k + 0.75;
      if (k < 2.5 / d) return n * (k -= 2.25 / d) * k + 0.9375;
      return n * (k -= 2.625 / d) * k + 0.984375;
    },
  };

  // Pop-in scale: 0 → overshoot → 1 (the "sticker slap")
  function pop(t, t0, dur = 0.45) {
    const k = prog(t, t0, t0 + dur);
    return k <= 0 ? 0 : E.outBack(k, 2.4);
  }
  // Wiggle that decays after an impact at t0
  function wobbleAfter(t, t0, amp = 1, freq = 9, decay = 5) {
    if (t < t0) return 0;
    const d = t - t0;
    return amp * Math.sin(d * freq * Math.PI * 2) * Math.exp(-d * decay);
  }

  // Keyframe sampler over numbers or flat objects of numbers.
  // keys: [{t, v, e}] where e is the easing INTO this key.
  function keys(ks, t) {
    if (t <= ks[0].t) return ks[0].v;
    for (let i = 1; i < ks.length; i++) {
      const b = ks[i];
      if (t <= b.t) {
        const a = ks[i - 1];
        const k = (b.e || E.inOut)((t - a.t) / (b.t - a.t));
        return mix(a.v, b.v, k);
      }
    }
    return ks[ks.length - 1].v;
  }
  function mix(a, b, k) {
    if (typeof a === 'number') return a + (b - a) * k;
    const o = {};
    for (const key in a) {
      const va = a[key], vb = b[key] === undefined ? va : b[key];
      o[key] = typeof va === 'number' ? va + (vb - va) * k : k < 0.5 ? va : vb;
    }
    for (const key in b) if (!(key in o)) o[key] = b[key];
    return o;
  }

  // ---------- musical clock (120 BPM, 4/4, 15 bars = 30 s) ----------
  LR.BPM = 120;
  LR.BEAT = 60 / LR.BPM;
  LR.BAR = LR.BEAT * 4;
  LR.DURATION = 30;
  LR.beat = (n) => n * LR.BEAT;

  // ---------- color ----------
  function hexRgb(h) {
    h = h.replace('#', '');
    if (h.length === 3) h = h.split('').map((c) => c + c).join('');
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  // amt < 0 darkens toward a warm ink, amt > 0 lightens toward paper white
  function shade(hex, amt) {
    const [r, g, b] = hexRgb(hex);
    const tgt = amt < 0 ? [40, 28, 45] : [255, 252, 244];
    const k = Math.abs(amt);
    const m = (a, b2) => Math.round(a + (b2 - a) * k);
    return `rgb(${m(r, tgt[0])},${m(g, tgt[1])},${m(b, tgt[2])})`;
  }
  function rgba(hex, a) {
    const [r, g, b] = hexRgb(hex);
    return `rgba(${r},${g},${b},${a})`;
  }

  Object.assign(LR, { hexRgb, shade, rgba, hashi, rnd, rrange, mulberry32, clamp, lerp, smooth, prog, DEG, noise1, fbm1, E, pop, wobbleAfter, keys, mix });

  if (typeof module !== 'undefined' && module.exports) module.exports = LR;
})(typeof self !== 'undefined' ? self : globalThis);
