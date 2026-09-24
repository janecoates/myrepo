/* Textures & prints: paper grain plus the swim-fabric prints (cherries,
 * lime slices, stripes, gingham, daisies, polka dots, halftone).
 * Tiles are painted at 2x and mapped back down so prints stay crisp when
 * characters are scaled up. */
(function (root) {
  const LR = root.LR;
  const { mulberry32, noise1, rnd } = LR;
  const TAU = Math.PI * 2;

  function mk(w, h) {
    if (typeof OffscreenCanvas !== 'undefined') return new OffscreenCanvas(w, h);
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    return c;
  }
  LR.mkCanvas = mk;

  // ---------- paper grain (tileable) ----------
  function makeGrain(size = 512) {
    const c = mk(size, size), g = c.getContext('2d');
    const img = g.createImageData(size, size);
    const rng = mulberry32(1234);
    const cell = 32, per = size / cell;
    // periodic value noise for soft mottling
    const lat = [];
    for (let i = 0; i < per * per; i++) lat.push(rng());
    const L = (x, y) => lat[((y % per + per) % per) * per + ((x % per + per) % per)];
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const fx = x / cell, fy = y / cell, ix = Math.floor(fx), iy = Math.floor(fy);
        const ux = fx - ix, uy = fy - iy, sx = ux * ux * (3 - 2 * ux), sy = uy * uy * (3 - 2 * uy);
        const n = (L(ix, iy) * (1 - sx) + L(ix + 1, iy) * sx) * (1 - sy) + (L(ix, iy + 1) * (1 - sx) + L(ix + 1, iy + 1) * sx) * sy;
        const r = rng();
        let v = 243 + (n - 0.5) * 26 - r * r * 30;
        if (r > 0.9985) v -= 40; // flecks
        const i = (y * size + x) * 4;
        img.data[i] = v + 2; img.data[i + 1] = v; img.data[i + 2] = v - 4; img.data[i + 3] = 255;
      }
    }
    g.putImageData(img, 0, 0);
    // fibres, drawn wrapped so the tile stays seamless
    g.lineCap = 'round';
    for (let k = 0; k < 260; k++) {
      const x = rng() * size, y = rng() * size, a = rng() * TAU, len = 6 + rng() * 22, bend = (rng() - 0.5) * 10;
      const dark = rng() < 0.7;
      g.strokeStyle = dark ? `rgba(110,85,60,${0.05 + rng() * 0.08})` : `rgba(255,255,255,${0.25 + rng() * 0.3})`;
      g.lineWidth = 0.5 + rng() * 0.9;
      for (const ox of [-size, 0, size]) for (const oy of [-size, 0, size]) {
        g.beginPath();
        g.moveTo(x + ox, y + oy);
        g.quadraticCurveTo(x + ox + Math.cos(a) * len / 2 - Math.sin(a) * bend, y + oy + Math.sin(a) * len / 2 + Math.cos(a) * bend, x + ox + Math.cos(a) * len, y + oy + Math.sin(a) * len);
        g.stroke();
      }
    }
    return c;
  }

  // ---------- fabric prints ----------
  const cache = new Map();
  // sc: on-screen scale of the tile (fabric prints read best a little small)
  function tile(key, w, h, paint, sc = 0.62) {
    key += '@' + sc;
    if (cache.has(key)) return cache.get(key);
    const S = 2;
    const c = mk(w * S, h * S), g = c.getContext('2d');
    g.scale(S, S);
    paint(g, w, h);
    const ctx = LR.patternCtx;
    const p = ctx.createPattern(c, 'repeat');
    if (p.setTransform && typeof DOMMatrix !== 'undefined') p.setTransform(new DOMMatrix().scale(sc / S));
    cache.set(key, p);
    return p;
  }
  function circle(g, x, y, r) { g.beginPath(); g.arc(x, y, r, 0, TAU); }

  function cherry(g, x, y, s, rot, C) {
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
    g.lineCap = 'round';
    g.strokeStyle = '#4E7A2A'; g.lineWidth = 1.6;
    g.beginPath(); g.moveTo(-6, 5); g.quadraticCurveTo(-4, -6, 1, -12); g.stroke();
    g.beginPath(); g.moveTo(6, 7); g.quadraticCurveTo(4, -4, 1, -12); g.stroke();
    g.fillStyle = C.limeDeep;
    g.beginPath(); g.ellipse(6, -13, 6, 2.6, -0.4, 0, TAU); g.fill();
    for (const [cx, cy] of [[-6, 7], [6, 9]]) {
      g.fillStyle = C.cherry; circle(g, cx, cy, 6.2); g.fill();
      g.fillStyle = 'rgba(255,255,255,.75)'; circle(g, cx - 2, cy - 2.2, 1.6); g.fill();
    }
    g.restore();
  }
  function limeSlice(g, x, y, r, rot, C) {
    g.save(); g.translate(x, y); g.rotate(rot);
    g.fillStyle = C.limeDeep; circle(g, 0, 0, r); g.fill();
    g.fillStyle = '#F4F9DC'; circle(g, 0, 0, r * 0.84); g.fill();
    g.fillStyle = C.lime; circle(g, 0, 0, r * 0.74); g.fill();
    g.strokeStyle = '#F4F9DC'; g.lineWidth = r * 0.09;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * TAU;
      g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * r * 0.74, Math.sin(a) * r * 0.74); g.stroke();
    }
    g.fillStyle = '#F4F9DC'; circle(g, 0, 0, r * 0.12); g.fill();
    g.restore();
  }
  function daisy(g, x, y, r, rot, petal, center) {
    g.save(); g.translate(x, y); g.rotate(rot);
    g.fillStyle = petal;
    for (let i = 0; i < 6; i++) {
      g.save(); g.rotate((i / 6) * TAU);
      g.beginPath(); g.ellipse(0, -r * 0.55, r * 0.3, r * 0.5, 0, 0, TAU); g.fill();
      g.restore();
    }
    g.fillStyle = center; circle(g, 0, 0, r * 0.3); g.fill();
    g.restore();
  }

  const P = {
    cherries(bg, sc) {
      const C = LR.C; bg = bg || C.cream;
      return tile('cherries' + bg, 84, 84, (g, w, h) => {
        g.fillStyle = bg; g.fillRect(0, 0, w, h);
        cherry(g, 22, 26, 1, -0.2, C);
        cherry(g, 64, 68, 1, 0.25, C);
        cherry(g, 64 - 84, 68, 1, 0.25, C); cherry(g, 64, 68 - 84, 1, 0.25, C); cherry(g, 64 - 84, 68 - 84, 1, 0.25, C);
      }, sc);
    },
    limes(bg, sc) {
      const C = LR.C; bg = bg || C.aqua;
      return tile('limes' + bg, 96, 96, (g, w, h) => {
        g.fillStyle = bg; g.fillRect(0, 0, w, h);
        for (const [x, y, r, a] of [[24, 26, 14, 0.3], [72, 72, 14, 1.1], [72 - 96, 72, 14, 1.1], [72, 72 - 96, 14, 1.1], [-24, -24, 14, 1.1]]) limeSlice(g, x, y, r, a, C);
        g.fillStyle = 'rgba(255,255,255,.8)';
        circle(g, 70, 20, 2.4); g.fill(); circle(g, 22, 74, 2.4); g.fill();
      }, sc);
    },
    stripes(c1, c2, w = 14, sc) {
      return tile(`stripes${c1}${c2}${w}`, 64, w * 2, (g, W, H) => {
        g.fillStyle = c1; g.fillRect(0, 0, W, H);
        g.fillStyle = c2;
        g.beginPath();
        g.moveTo(0, w);
        for (let x = 0; x <= W; x += 4) g.lineTo(x, w + Math.sin((x / W) * TAU * 2) * 0.8);
        g.lineTo(W, H);
        for (let x = W; x >= 0; x -= 4) g.lineTo(x, H + Math.sin((x / W) * TAU) * 0.6);
        g.closePath(); g.fill();
      }, sc);
    },
    vstripes(c1, c2, w = 14, sc) {
      return tile(`vstripes${c1}${c2}${w}`, w * 2, 64, (g, W, H) => {
        g.fillStyle = c1; g.fillRect(0, 0, W, H);
        g.fillStyle = c2; g.fillRect(w, 0, w, H);
      }, sc);
    },
    dots(bg, fg, sp = 26, r = 5, sc) {
      return tile(`dots${bg}${fg}${sp}${r}`, sp, sp, (g, w, h) => {
        g.fillStyle = bg; g.fillRect(0, 0, w, h);
        g.fillStyle = fg;
        for (const [x, y] of [[w / 4, h / 4], [w * 0.75, h * 0.75]]) { circle(g, x, y, r); g.fill(); }
      }, sc);
    },
    gingham(c, bg = '#FFFDF6', s = 18, sc) {
      return tile(`gingham${c}${bg}${s}`, s * 2, s * 2, (g, w, h) => {
        g.fillStyle = bg; g.fillRect(0, 0, w, h);
        g.globalAlpha = 0.55; g.fillStyle = c;
        g.fillRect(0, 0, s, h); g.fillRect(0, 0, w, s);
        g.globalAlpha = 0.25; g.fillRect(0, 0, s, s);
        g.globalAlpha = 1;
      }, sc);
    },
    daisies(bg, petal = '#FFFDF6', center, sc) {
      center = center || LR.C.sun;
      return tile(`daisies${bg}${petal}`, 70, 70, (g, w, h) => {
        g.fillStyle = bg; g.fillRect(0, 0, w, h);
        for (const [x, y, r, a] of [[18, 18, 12, 0], [53, 52, 10, 0.4], [53 - 70, 52, 10, 0.4], [53, 52 - 70, 10, 0.4], [-17, -18, 10, 0.4]]) daisy(g, x, y, r, a, petal, center);
      }, sc);
    },
    halftone(color, sp = 12, r = 2.6, sc = 1) {
      return tile(`half${color}${sp}${r}`, sp, sp, (g, w, h) => {
        g.fillStyle = color;
        circle(g, w / 2, h / 2, r); g.fill();
        circle(g, 0, 0, r * 0.6); g.fill(); circle(g, w, 0, r * 0.6); g.fill(); circle(g, 0, h, r * 0.6); g.fill(); circle(g, w, h, r * 0.6); g.fill();
      }, sc);
    },
    zigzag(c1, c2, sc) {
      return tile(`zig${c1}${c2}`, 40, 28, (g, w, h) => {
        g.fillStyle = c1; g.fillRect(0, 0, w, h);
        g.strokeStyle = c2; g.lineWidth = 5; g.lineJoin = 'round';
        g.beginPath(); g.moveTo(-10, 14); for (let x = -10; x <= 50; x += 10) g.lineTo(x, (x / 10) % 2 ? 6 : 20); g.stroke();
      }, sc);
    },
  };
  LR.PRINT = P;

  LR.initTextures = function (ctx) {
    LR.patternCtx = ctx;
    const grainCanvas = makeGrain(512);
    LR.tex = { grainCanvas, grain: ctx.createPattern(grainCanvas, 'repeat') };
  };
})(typeof self !== 'undefined' ? self : globalThis);
