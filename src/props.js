/* Collage props: backgrounds, water, sun, fruit, beach & backyard pieces,
 * particles. All are pure functions of time for frame-exact rendering. */
(function (root) {
  const LR = root.LR;
  const { rnd, paper, ink, ellipsePts, circlePts, tornLine, polyPts, withT, E, prog, clamp, shade } = LR;
  const TAU = Math.PI * 2;
  const W = LR.W, H = LR.H;
  const inkC = () => LR.C.ink;

  function bg(ctx, color, print, printAlpha = 1) {
    ctx.fillStyle = color;
    ctx.fillRect(-40, -40, W + 80, H + 80);
    if (print) {
      ctx.save(); ctx.globalAlpha = printAlpha; ctx.fillStyle = print; ctx.fillRect(-40, -40, W + 80, H + 80); ctx.restore();
    }
  }

  // Halftone gradient: dots shrink with distance from (cx,cy)
  // (static, so it is rendered once into an offscreen canvas and re-used)
  const washCache = new Map();
  function halftoneWash(ctx, cx, cy, radius, sp, maxR, color, angle = 0.4) {
    const key = [cx, cy, radius, sp, maxR, color, angle].join('|');
    let c = washCache.get(key);
    if (!c) {
      const S = 1.5, size = Math.ceil(radius * 2 + maxR * 4);
      c = LR.mkCanvas(Math.ceil(size * S), Math.ceil(size * S));
      const g = c.getContext('2d');
      g.scale(S, S);
      g.translate(size / 2 - cx, size / 2 - cy);
      paintWash(g, cx, cy, radius, sp, maxR, color, angle);
      c.S = S; c.size = size;
      washCache.set(key, c);
    }
    ctx.drawImage(c, cx - c.size / 2, cy - c.size / 2, c.size, c.size);
  }
  function paintWash(ctx, cx, cy, radius, sp, maxR, color, angle) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    const c = Math.cos(angle), s = Math.sin(angle);
    const n = Math.ceil(radius / sp) + 1;
    for (let i = -n; i <= n; i++) {
      for (let j = -n; j <= n; j++) {
        const u = i * sp + (j % 2 ? sp / 2 : 0), v = j * sp * 0.87;
        const x = cx + u * c - v * s, y = cy + u * s + v * c;
        const d = Math.hypot(x - cx, y - cy);
        const r = maxR * (1 - d / radius);
        if (r < 0.6) continue;
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, TAU);
      }
    }
    ctx.fill();
    ctx.restore();
  }

  function sunburst(ctx, cx, cy, n, color, rot, len = 2400, seed = 3) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rot);
    for (let i = 0; i < n; i++) {
      const a0 = (i / n) * TAU, a1 = ((i + 0.5) / n) * TAU;
      const pts = [[0, 0], ...tornLine(Math.cos(a0) * 60, Math.sin(a0) * 60, Math.cos(a0) * len, Math.sin(a0) * len, seed + i, 5, 40, true),
        ...tornLine(Math.cos(a1) * len, Math.sin(a1) * len, Math.cos(a1) * 60, Math.sin(a1) * 60, seed + i + 50, 5, 40, true)];
      paper(ctx, pts, { fill: color, smooth: false, seed: seed + i, boil: 0.8, grain: 0.35 });
    }
    ctx.restore();
  }

  // A horizontal strip of water/land with a wavy torn top edge that fills down to yBottom
  function waveStrip(ctx, y, o) {
    const amp = o.amp == null ? 14 : o.amp, wl = o.wl || 260, ph = o.phase || 0;
    const x0 = o.x0 == null ? -60 : o.x0, x1 = o.x1 == null ? W + 60 : o.x1;
    const yb = o.bottom == null ? H + 60 : o.bottom;
    const pts = [];
    const step = o.step || 14;
    for (let x = x0; x <= x1; x += step) {
      const j = (rnd(Math.round(x / step), o.seed || 1, 3) - 0.5) * (o.jag == null ? 3 : o.jag);
      pts.push([x, y + Math.sin((x / wl) * TAU + ph) * amp + (o.chop ? Math.sin((x / wl) * TAU * 2.7 + ph * 1.7) * amp * 0.25 : 0) + j]);
    }
    pts.push([x1, yb], [x0, yb]);
    paper(ctx, pts, {
      fill: o.fill, print: o.print, printAlpha: o.printAlpha, fringe: o.foam == null ? 5 : o.foam, fringeColor: o.foamColor,
      shadow: o.shadow == null ? { blur: 14, x: 0, y: -4, a: 0.2 } : o.shadow, smooth: false, seed: o.seed || 1, boil: 1, ink: o.ink, lw: o.lw,
    });
    return pts;
  }

  function sun(ctx, x, y, r, t, o = {}) {
    withT(ctx, x, y, 0, o.scale == null ? 1 : o.scale, null, () => {
      // rays ring
      ctx.save();
      ctx.rotate(t * 0.35);
      const rays = [];
      const n = 14;
      for (let i = 0; i < n * 2; i++) {
        const a = (i / (n * 2)) * TAU, rr = i % 2 ? r * 1.12 : r * 1.52;
        rays.push([Math.cos(a) * rr, Math.sin(a) * rr]);
      }
      paper(ctx, rays, { fill: o.rays || LR.C.coral, ink: inkC(), lw: 3, smooth: false, seed: 201, shadow: 1 });
      ctx.restore();
      paper(ctx, circlePts(r, 36, 202, 0.02), { fill: o.fill || LR.C.sun, ink: inkC(), lw: 3.5, seed: 202, shadow: 0.8, print: LR.PRINT.halftone('rgba(255,140,40,.25)', 14, 3) });
      if (o.face !== false) {
        // happy face
        ctx.save();
        ctx.fillStyle = 'rgba(255,110,110,.5)';
        for (const d of [-1, 1]) { ctx.beginPath(); ctx.ellipse(d * r * 0.5, r * 0.2, r * 0.16, r * 0.1, 0, 0, TAU); ctx.fill(); }
        ctx.strokeStyle = inkC(); ctx.lineCap = 'round'; ctx.lineWidth = r * 0.06;
        for (const d of [-1, 1]) { ctx.beginPath(); ctx.arc(d * r * 0.32, -r * 0.05, r * 0.12, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke(); }
        ctx.beginPath(); ctx.arc(0, r * 0.08, r * 0.3, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
        ctx.restore();
      }
    });
  }

  function limeSlice(ctx, x, y, r, rot, o = {}) {
    const C = LR.C;
    withT(ctx, x, y, rot, 1, 1, () => {
      const s = o.seed || 300;
      paper(ctx, circlePts(r, 32, s, 0.02), { fill: C.limeDeep, ink: inkC(), lw: 3.5, seed: s, shadow: o.shadow == null ? 1 : o.shadow });
      paper(ctx, circlePts(r * 0.86, 30, s + 1, 0.02), { fill: '#F3F8D8', seed: s + 1, grain: 0.3 });
      // segments
      const n = 8;
      for (let i = 0; i < n; i++) {
        const a0 = (i / n) * TAU + 0.07, a1 = ((i + 1) / n) * TAU - 0.07;
        const pts = [[Math.cos((a0 + a1) / 2) * r * 0.1, Math.sin((a0 + a1) / 2) * r * 0.1]];
        for (let k = 0; k <= 5; k++) { const a = a0 + (a1 - a0) * (k / 5); pts.push([Math.cos(a) * r * 0.76, Math.sin(a) * r * 0.76]); }
        paper(ctx, pts, { fill: o.flesh || C.lime, seed: s + 2 + i, grain: 0.3, boil: 0.6 });
      }
      // juicy highlights
      ctx.save(); ctx.globalAlpha = 0.6; ctx.fillStyle = '#fff';
      for (let i = 0; i < 5; i++) { const a = rnd(i, s) * TAU, rr = r * (0.3 + rnd(i, s, 2) * 0.35); ctx.beginPath(); ctx.ellipse(Math.cos(a) * rr, Math.sin(a) * rr, r * 0.05, r * 0.025, a, 0, TAU); ctx.fill(); }
      ctx.restore();
    });
  }

  function cherries(ctx, x, y, s, rot, o = {}) {
    const C = LR.C;
    withT(ctx, x, y, rot, s, s, () => {
      ink(ctx, [[-22, 20], [-14, -20], [4, -52]], { color: '#4E7A2A', lw: 5, seed: 311 });
      ink(ctx, [[22, 26], [16, -16], [4, -52]], { color: '#4E7A2A', lw: 5, seed: 312 });
      paper(ctx, ellipsePts(24, 10, 14, 313).map(([a, b]) => [a + 26, b - 54]).map(([a, b]) => [a, b + (a - 26) * -0.4]), { fill: C.limeDeep, ink: inkC(), lw: 3, seed: 313, shadow: 0.5 });
      for (const [cx, cy] of [[-22, 30], [22, 36]]) {
        paper(ctx, circlePts(26, 24, 314 + cx).map(([a, b]) => [a + cx, b + cy]), { fill: C.cherry, ink: inkC(), lw: 3.5, seed: 314 + cx, shadow: 1 });
        ctx.fillStyle = 'rgba(255,255,255,.8)';
        ctx.beginPath(); ctx.ellipse(cx - 9, cy - 9, 6, 4, -0.6, 0, TAU); ctx.fill();
      }
    });
  }

  function cloud(ctx, x, y, s, seed = 1, o = {}) {
    withT(ctx, x, y, 0, s, s, () => {
      const pts = [];
      const bumps = [[-90, -10, 50], [-40, -45, 60], [25, -55, 66], [85, -20, 50]];
      for (let i = 0; i <= 40; i++) {
        const a = Math.PI + (i / 40) * Math.PI;
        const px = Math.cos(a) * 140;
        let py = 0;
        for (const [bx, by, br] of bumps) {
          const dx = px - bx;
          if (Math.abs(dx) < br) py = Math.min(py, by - Math.sqrt(br * br - dx * dx) * 0.9);
        }
        pts.push([px, py]);
      }
      pts.push([140, 10], [-140, 10]);
      paper(ctx, pts, { fill: o.fill || LR.C.white, ink: o.ink === undefined ? null : o.ink, lw: 3, seed, shadow: { blur: 16, x: 3, y: 8, a: 0.14 }, fringe: 0, boil: 1.2 });
    });
  }

  function umbrella(ctx, x, y, s, rot, c1, c2, seed = 7) {
    withT(ctx, x, y, rot, s, s, () => {
      paper(ctx, LR.rrectPts(-6, -20, 12, 350, 6), { fill: '#F4EBDD', ink: inkC(), lw: 3, seed: seed + 1, shadow: 0.7 });
      const R = 240, Hh = 150, n = 6;
      const dome = [];
      for (let k = 0; k <= 24; k++) {
        const xx = -R + (2 * R * k) / 24;
        dome.push([xx, -Hh * Math.pow(Math.max(0, 1 - (xx / R) ** 2), 0.55)]);
      }
      for (let j = 1; j < n * 6; j++) {
        const xx = R - (2 * R * j) / (n * 6);
        dome.push([xx, 16 * Math.abs(Math.sin((Math.PI * j) / 6))]);
      }
      const path = paper(ctx, dome, { fill: c1, ink: inkC(), lw: 3.5, seed: seed + 2, shadow: 1, boil: 0.8 });
      ctx.save();
      ctx.clip(path);
      for (let i = 1; i < n; i += 2) {
        const xa = -R + (2 * R * i) / n, xb = -R + (2 * R * (i + 1)) / n;
        paper(ctx, [[0, -Hh - 30], [xa * 1.05, 40], [xb * 1.05, 40]], { fill: c2, smooth: false, seed: seed + 10 + i, boil: 0.8 });
      }
      ctx.restore();
      ctx.save();
      ctx.lineJoin = 'round';
      ctx.strokeStyle = inkC(); ctx.lineWidth = 3.5;
      ctx.stroke(path);
      ctx.restore();
      paper(ctx, circlePts(12, 10, seed + 30).map(([a, b]) => [a, b - Hh - 4]), { fill: c2, ink: inkC(), lw: 3, seed: seed + 30 });
    });
  }
  function starfish(ctx, x, y, r, rot, color, seed = 401) {
    withT(ctx, x, y, rot, 1, 1, () => {
      paper(ctx, LR.starPts(r, 0.42, 5), { fill: color, ink: inkC(), lw: 3, seed, shadow: 0.8, print: LR.PRINT.halftone('rgba(255,255,255,.45)', 10, 2) });
    });
  }
  function shell(ctx, x, y, r, rot, color, seed = 411) {
    withT(ctx, x, y, rot, 1, 1, () => {
      const pts = [[0, r * 0.35]];
      for (let i = 0; i <= 14; i++) {
        const a = Math.PI + 0.25 + (i / 14) * (Math.PI - 0.5);
        const rr = r * (1 + (i % 2 ? 0.06 : 0));
        pts.push([Math.cos(a) * rr, Math.sin(a) * rr * 0.9]);
      }
      paper(ctx, pts, { fill: color, ink: inkC(), lw: 3, seed, shadow: 0.7, smooth: true });
      ctx.save(); ctx.strokeStyle = inkC(); ctx.lineWidth = 2; ctx.globalAlpha = 0.6;
      for (let i = 1; i < 5; i++) { const a = Math.PI + 0.4 + (i / 5) * (Math.PI - 0.8); ctx.beginPath(); ctx.moveTo(0, r * 0.3); ctx.lineTo(Math.cos(a) * r * 0.85, Math.sin(a) * r * 0.78); ctx.stroke(); }
      ctx.restore();
    });
  }
  function beachBall(ctx, x, y, r, rot, seed = 421) {
    const C = LR.C;
    const cols = [C.coral, C.white, C.sun, C.white, C.aqua, C.white];
    withT(ctx, x, y, rot, 1, 1, () => {
      paper(ctx, circlePts(r, 30, seed), { fill: C.white, seed, shadow: 1 });
      for (let i = 0; i < 6; i++) {
        const a0 = (i / 6) * TAU, a1 = ((i + 1) / 6) * TAU;
        const pts = [[0, 0]];
        for (let k = 0; k <= 5; k++) { const a = a0 + (a1 - a0) * (k / 5); pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
        paper(ctx, pts, { fill: cols[i], seed: seed + i, boil: 0.5, grain: 0.3 });
      }
      paper(ctx, circlePts(r, 30, seed + 9), { fill: 'rgba(0,0,0,0)', ink: inkC(), lw: 3.5, seed: seed + 9, grain: false });
      paper(ctx, circlePts(r * 0.16, 12, seed + 10), { fill: C.white, ink: inkC(), lw: 2.5, seed: seed + 10, grain: false });
      ctx.save(); ctx.globalAlpha = 0.5; ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.ellipse(-r * 0.4, -r * 0.45, r * 0.2, r * 0.1, -0.7, 0, TAU); ctx.fill(); ctx.restore();
    });
  }

  function bunting(ctx, x0, y0, x1, y1, sag, n, colors, t, seed = 500) {
    const pt = (k) => [x0 + (x1 - x0) * k, y0 + (y1 - y0) * k + Math.sin(k * Math.PI) * sag];
    const line = [];
    for (let i = 0; i <= 20; i++) line.push(pt(i / 20));
    ink(ctx, line, { color: inkC(), lw: 3, seed });
    for (let i = 0; i < n; i++) {
      const k = (i + 0.5) / n;
      const [px, py] = pt(k);
      const sw = Math.sin(t * 2.2 + i * 0.9) * 0.08;
      withT(ctx, px, py, sw, 1, 1, () => {
        paper(ctx, [[-34, 0], [34, 0], [0, 70]], { fill: colors[i % colors.length], ink: inkC(), lw: 2.5, seed: seed + i, smooth: false, shadow: 0.7, print: i % 3 === 1 ? LR.PRINT.dots('rgba(0,0,0,0)', 'rgba(255,255,255,.7)', 18, 3.5) : null });
      });
    }
  }

  // Burst of paper droplets: returns nothing; purely a function of t.
  function splash(ctx, x, y, t, t0, o = {}) {
    const d = t - t0;
    if (d < 0 || d > (o.life || 1.6)) return;
    const n = o.n || 26, seed = o.seed || 601;
    const g = o.g || 1500;
    const cols = o.colors || ['#FFFFFF', '#CFF3F7', '#8FE0EA', LR.C.aqua];
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + (rnd(i, seed, 1) - 0.5) * (o.spread || 2.2);
      const sp = (o.speed || 900) * (0.45 + rnd(i, seed, 2) * 0.75);
      const delay = rnd(i, seed, 3) * 0.08;
      const dd = d - delay;
      if (dd < 0) continue;
      const px = x + Math.cos(a) * sp * dd + (rnd(i, seed, 6) - 0.5) * 40;
      const py = y + Math.sin(a) * sp * dd + 0.5 * g * dd * dd;
      if (o.floor != null && py > o.floor) continue;
      const r = (o.size || 16) * (0.5 + rnd(i, seed, 4)) * (1 - clamp(dd / (o.life || 1.6)) * 0.4);
      const vx = Math.cos(a) * sp, vy = Math.sin(a) * sp + g * dd;
      const ang = Math.atan2(vy, vx);
      withT(ctx, px, py, ang + Math.PI / 2, 1, 1, () => {
        // teardrop pointing along velocity
        const pts = [];
        for (let k = 0; k < 14; k++) {
          const aa = (k / 14) * TAU;
          const st = aa > Math.PI * 0.5 && aa < Math.PI * 1.5 ? 1 : 1;
          pts.push([Math.cos(aa) * r * st, Math.sin(aa) * r * (Math.sin(aa) > 0 ? 1.7 : 1)]);
        }
        paper(ctx, pts, { fill: cols[i % cols.length], ink: o.ink === false ? null : inkC(), lw: 2.2, seed: seed + i, boil: 0.5, grain: false, shadow: o.shadow == null ? { blur: 5, x: 2, y: 3, a: 0.18 } : o.shadow });
      });
    }
  }

  // Cartoon splash crown: a fan of rounded water "tongues" rising from (x,y)
  function splashCrown(ctx, x, y, h, w, seed = 650) {
    if (h < 6) return;
    const C = LR.C;
    const n = 7;
    const order = [0, 6, 1, 5, 2, 4, 3];
    for (const i of order) {
      const u = (i / (n - 1)) * 2 - 1;
      const ang = u * 0.62;
      const len = h * (0.6 + 0.4 * Math.cos(u * 1.4)) * (0.85 + rnd(i, seed) * 0.3);
      const bw = 26 + (1 - Math.abs(u)) * 18;
      withT(ctx, x + u * w * 0.55, y + Math.abs(u) * 8, ang, 1, 1, () => {
        const r = bw * 0.46;
        const pts = [[-bw / 2, 10], [-bw * 0.3, -len * 0.45], [-r * 0.9, -len + r * 0.4]];
        for (let k = 0; k <= 8; k++) { const a = Math.PI + (k / 8) * Math.PI; pts.push([Math.cos(a) * r, -len + Math.sin(a) * r]); }
        pts.push([r * 0.9, -len + r * 0.4], [bw * 0.3, -len * 0.45], [bw / 2, 10]);
        paper(ctx, pts, { fill: i % 2 ? '#E9FBFE' : '#C6F0F6', ink: inkC(), lw: 3.2, seed: seed + i, shadow: 0.7, print: LR.PRINT.halftone('rgba(62,198,207,.3)', 11, 2.2), boil: 0.8 });
      });
    }
    paper(ctx, ellipsePts(w, 26, 20, seed + 20).map(([a, b]) => [a + x, b + y + 4]), { fill: '#E9FBFE', ink: inkC(), lw: 3.2, seed: seed + 20, print: LR.PRINT.halftone('rgba(62,198,207,.3)', 11, 2.2) });
  }

  // Falling paper confetti over the whole frame
  function confetti(ctx, t, t0, o = {}) {
    const d = t - t0;
    if (d < 0) return;
    const n = o.n || 70, seed = o.seed || 700;
    const cols = o.colors || [LR.C.coral, LR.C.lime, LR.C.sun, LR.C.aqua, LR.C.pink, LR.C.white];
    for (let i = 0; i < n; i++) {
      const delay = rnd(i, seed, 1) * (o.spread || 1.2);
      const dd = d - delay;
      if (dd < 0) continue;
      const x = rnd(i, seed, 2) * (W + 200) - 100 + Math.sin(dd * 2 + i) * 40;
      const y = -60 + dd * (180 + rnd(i, seed, 3) * 200);
      if (y > H + 60) continue;
      const rot = dd * (2 + rnd(i, seed, 4) * 4) + i;
      const w = 12 + rnd(i, seed, 5) * 14, h = 7 + rnd(i, seed, 6) * 8;
      const sx = Math.cos(dd * (3 + rnd(i, seed, 7) * 4));
      withT(ctx, x, y, rot, sx, 1, () => {
        const shape = i % 3;
        const pts = shape === 0 ? [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]]
          : shape === 1 ? circlePts(h * 0.7, 10, seed + i) : [[0, -h], [h, h * 0.7], [-h, h * 0.7]];
        paper(ctx, pts, { fill: cols[i % cols.length], smooth: shape === 1, seed: seed + i, grain: false, boil: 0.4, shadow: { blur: 3, x: 1, y: 2, a: 0.15 } });
      });
    }
  }

  // Ripple rings (ink ellipses) expanding from x,y
  function ripples(ctx, x, y, t, t0, o = {}) {
    const n = o.n || 3;
    for (let i = 0; i < n; i++) {
      const d = t - t0 - i * 0.22;
      if (d < 0 || d > 1.4) continue;
      const k = d / 1.4;
      const rx = (o.r || 60) + k * (o.grow || 260);
      ctx.save();
      ctx.globalAlpha = (1 - k) * 0.9;
      ink(ctx, ellipsePts(rx, rx * 0.22, 30, 800 + i, 0.03), { color: o.color || '#FFFFFF', lw: 5 * (1 - k) + 1.5, closed: true, seed: 800 + i });
      ctx.restore();
    }
  }

  function grassBlades(ctx, x0, x1, y, n, seed, color, h = 26) {
    ctx.save();
    for (let i = 0; i < n; i++) {
      const x = x0 + rnd(i, seed) * (x1 - x0), yy = y + rnd(i, seed, 2) * 30;
      const hh = h * (0.6 + rnd(i, seed, 3) * 0.8);
      ink(ctx, [[x - 6, yy], [x - 2, yy - hh * 0.6], [x + (rnd(i, seed, 4) - 0.5) * 10, yy - hh]], { color, lw: 3, seed: seed + i, boil: 0.8 });
    }
    ctx.restore();
  }

  function daisy(ctx, x, y, r, rot, seed = 900) {
    withT(ctx, x, y, rot, 1, 1, () => {
      for (let i = 0; i < 7; i++) {
        ctx.save(); ctx.rotate((i / 7) * TAU);
        paper(ctx, ellipsePts(r * 0.28, r * 0.5, 10, seed + i).map(([a, b]) => [a, b - r * 0.55]), { fill: LR.C.white, ink: inkC(), lw: 2, seed: seed + i, grain: false, boil: 0.5 });
        ctx.restore();
      }
      paper(ctx, circlePts(r * 0.3, 12, seed + 9), { fill: LR.C.sun, ink: inkC(), lw: 2, seed: seed + 9, grain: false });
    });
  }

  // Scribbled motion lines behind a moving object
  function speedLines(ctx, x, y, dir, len, n, seed, alpha = 1) {
    ctx.save();
    ctx.globalAlpha *= alpha;
    for (let i = 0; i < n; i++) {
      const off = (i - (n - 1) / 2) * 22;
      const l = len * (0.6 + rnd(i, seed) * 0.5);
      const c = Math.cos(dir), s = Math.sin(dir);
      const sx = x - c * 30 - s * off, sy = y - s * 30 + c * off;
      ink(ctx, [[sx, sy], [sx - c * l, sy - s * l]], { color: LR.C.ink, lw: 3.5, seed: seed + i });
    }
    ctx.restore();
  }

  // Torn-paper transition mask. Returns a Path2D covering the "new" region.
  // kind: 'right' (reveal left→right), 'left', 'up' (reveal bottom→top), 'hole' (from centre)
  function tornMask(kind, k, seed) {
    const p = new Path2D();
    const e = E.inOutCubic(clamp(k));
    if (kind === 'hole') {
      const r = e * 1250;
      const pts = [];
      for (let i = 0; i < 90; i++) {
        const a = (i / 90) * TAU;
        const rr = r * (1 + 0.06 * LR.noise1(i * 0.35, seed) + (rnd(i, seed) - 0.5) * 0.04);
        pts.push([W / 2 + Math.cos(a) * rr, H / 2 + Math.sin(a) * rr]);
      }
      LR.trace(p, pts, true, false);
      return { path: p, edge: pts, closed: true };
    }
    let edge;
    if (kind === 'right' || kind === 'left') {
      const x = kind === 'right' ? -120 + e * (W + 240) : W + 120 - e * (W + 240);
      const tilt = 120;
      edge = tornLine(x + tilt, -60, x - tilt, H + 60, seed, 22, 16);
      const poly = kind === 'right' ? [[-100, -60], ...edge, [-100, H + 60]] : [[W + 100, -60], ...edge, [W + 100, H + 60]];
      LR.trace(p, poly, true, false);
    } else {
      const y = H + 120 - e * (H + 240);
      edge = tornLine(-60, y - 80, W + 60, y + 80, seed, 22, 16);
      const poly = [[-60, H + 100], ...edge, [W + 60, H + 100]];
      LR.trace(p, poly, true, false);
    }
    return { path: p, edge, closed: false };
  }

  Object.assign(LR, {
    bg, halftoneWash, sunburst, waveStrip, sun, limeSlice, cherries, cloud, umbrella, starfish, shell, beachBall, bunting,
    splash, splashCrown, confetti, ripples, grassBlades, daisy, speedLines, tornMask,
  });
})(typeof self !== 'undefined' ? self : globalThis);
