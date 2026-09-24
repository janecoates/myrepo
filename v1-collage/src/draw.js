/* Hand-made paper collage primitives.
 * - Shapes are point lists in local coordinates.
 * - `paper()` renders a point list as a cut/torn paper piece: soft drop
 *   shadow, optional white torn-fibre fringe, grain, print overlay and a
 *   wobbly ink outline that "boils" (re-jitters) 12x per second. */
(function (root) {
  const LR = root.LR;
  const { rnd, noise1, fbm1, lerp } = LR;
  const TAU = Math.PI * 2;

  LR.boil = 0; // set by the renderer each frame: Math.floor(t * LR.FPS_BOIL)

  // ---------------- point generators ----------------
  function circlePts(r, n = 28, seed = 1, irr = 0.035) {
    return ellipsePts(r, r, n, seed, irr);
  }
  function ellipsePts(rx, ry, n = 28, seed = 1, irr = 0.035, cx = 0, cy = 0) {
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = (i / n) * TAU;
      const w = 1 + irr * noise1(i * 0.9, seed) + irr * 0.5 * (rnd(seed, i) - 0.5);
      pts.push([cx + Math.cos(a) * rx * w, cy + Math.sin(a) * ry * w]);
    }
    return pts;
  }
  function rrectPts(x, y, w, h, r = 12, seg = 4, seed = 0, irr = 0) {
    r = Math.min(r, w / 2, h / 2);
    const pts = [];
    const corners = [
      [x + w - r, y + r, -Math.PI / 2], [x + w - r, y + h - r, 0],
      [x + r, y + h - r, Math.PI / 2], [x + r, y + r, Math.PI],
    ];
    for (const [cx, cy, a0] of corners) {
      for (let i = 0; i <= seg; i++) {
        const a = a0 + (i / seg) * (Math.PI / 2);
        pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
      }
    }
    if (irr) roughen(pts, seed, irr);
    return pts;
  }
  // A torn line from (x0,y0) to (x1,y1): wobbly low-frequency drift + fibrous jaggies.
  function tornLine(x0, y0, x1, y1, seed = 1, amp = 6, step = 12, includeLast = true) {
    const dx = x1 - x0, dy = y1 - y0, len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len;
    const n = Math.max(2, Math.round(len / step));
    const pts = [];
    for (let i = 0; i <= n; i++) {
      if (i === n && !includeLast) break;
      const k = i / n;
      const edge = i === 0 || i === n ? 0 : 1;
      const off = edge * (amp * fbm1(k * len / 90, seed, 3) + amp * 0.55 * (rnd(seed, i, 7) - 0.5));
      pts.push([x0 + dx * k + nx * off, y0 + dy * k + ny * off]);
    }
    return pts;
  }
  function tornRectPts(x, y, w, h, seed = 1, amp = 5, step = 12) {
    return [
      ...tornLine(x, y, x + w, y, seed, amp, step, false),
      ...tornLine(x + w, y, x + w, y + h, seed + 1, amp, step, false),
      ...tornLine(x + w, y + h, x, y + h, seed + 2, amp, step, false),
      ...tornLine(x, y + h, x, y, seed + 3, amp, step, false),
    ];
  }
  // Polygon from a list of corner points, with each edge subdivided & roughened
  function polyPts(corners, seed = 1, amp = 1.5, step = 18) {
    const pts = [];
    for (let i = 0; i < corners.length; i++) {
      const a = corners[i], b = corners[(i + 1) % corners.length];
      pts.push(...tornLine(a[0], a[1], b[0], b[1], seed + i, amp, step, false));
    }
    return pts;
  }
  function roughen(pts, seed, amp) {
    for (let i = 0; i < pts.length; i++) {
      pts[i][0] += (rnd(seed, i, 11) - 0.5) * 2 * amp;
      pts[i][1] += (rnd(seed, i, 13) - 0.5) * 2 * amp;
    }
    return pts;
  }
  function xform(pts, x = 0, y = 0, rot = 0, sx = 1, sy = sx) {
    const c = Math.cos(rot), s = Math.sin(rot);
    return pts.map(([px, py]) => [x + (px * sx) * c - (py * sy) * s, y + (px * sx) * s + (py * sy) * c]);
  }

  // Per-frame jitter: the "boil" that makes it feel hand-drawn frame by frame.
  function boilPts(pts, seed = 0, amp = 1.1) {
    if (!amp) return pts;
    const f = LR.boil;
    return pts.map((p, i) => [
      p[0] + (rnd(seed * 31 + i, f, 1) - 0.5) * 2 * amp,
      p[1] + (rnd(seed * 31 + i, f, 2) - 0.5) * 2 * amp,
    ]);
  }

  // Offset polygon outward along vertex normals (for torn white fringes)
  function offsetPts(pts, d, seed = 0, rough = 0.7) {
    const n = pts.length;
    let area = 0;
    for (let i = 0; i < n; i++) {
      const a = pts[i], b = pts[(i + 1) % n];
      area += a[0] * b[1] - b[0] * a[1];
    }
    const sgn = area > 0 ? 1 : -1;
    return pts.map((p, i) => {
      const a = pts[(i - 1 + n) % n], b = pts[(i + 1) % n];
      let tx = b[0] - a[0], ty = b[1] - a[1];
      const l = Math.hypot(tx, ty) || 1;
      tx /= l; ty /= l;
      const k = d * (1 - rough + rough * 2 * rnd(seed, i, 5));
      return [p[0] + ty * k * sgn, p[1] - tx * k * sgn];
    });
  }

  // ---------------- tracing ----------------
  function trace(ctx, pts, closed = true, smooth = true) {
    const n = pts.length;
    if (n < 2) return;
    if (!smooth) {
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < n; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      if (closed) ctx.closePath();
      return;
    }
    if (closed) {
      const a = pts[n - 1], b = pts[0];
      ctx.moveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2);
      for (let i = 0; i < n; i++) {
        const p = pts[i], q = pts[(i + 1) % n];
        ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
      }
      ctx.closePath();
    } else {
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < n - 1; i++) {
        const p = pts[i], q = pts[i + 1];
        ctx.quadraticCurveTo(p[0], p[1], (p[0] + q[0]) / 2, (p[1] + q[1]) / 2);
      }
      ctx.lineTo(pts[n - 1][0], pts[n - 1][1]);
    }
  }
  function toPath(pts, closed = true, smooth = true) {
    const p = new Path2D();
    trace(p, pts, closed, smooth);
    return p;
  }

  // ---------------- shadows ----------------
  function setShadow(ctx, s) {
    if (!s) return;
    const o = typeof s === 'object' ? s : {};
    const k = typeof s === 'number' ? s : 1;
    ctx.shadowColor = `rgba(58,36,20,${o.a != null ? o.a : 0.26})`;
    ctx.shadowBlur = (o.blur != null ? o.blur : 12 * k) * LR.pxScale;
    ctx.shadowOffsetX = (o.x != null ? o.x : 3 * k) * LR.pxScale;
    ctx.shadowOffsetY = (o.y != null ? o.y : 6 * k) * LR.pxScale;
  }
  function noShadow(ctx) {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0; ctx.shadowOffsetX = 0; ctx.shadowOffsetY = 0;
  }
  LR.pxScale = 1; // canvas pixels per design pixel (shadows ignore the CTM)

  // ---------------- the paper cutout ----------------
  // o: {fill, print, printAlpha, ink, lw, shadow, fringe, fringeColor, smooth, boil, seed, grain, alpha, sketch}
  function paper(ctx, pts, o = {}) {
    const seed = o.seed || 0;
    const P = boilPts(pts, seed, o.boil == null ? 1.1 : o.boil);
    const smooth = o.smooth !== false;
    const path = toPath(P, true, smooth);
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    if (o.fringe) {
      const F = offsetPts(P, o.fringe, seed + 3, 0.85);
      const fp = toPath(F, true, smooth);
      setShadow(ctx, o.shadow);
      ctx.fillStyle = o.fringeColor || '#FFFBF1';
      ctx.fill(fp);
      noShadow(ctx);
    } else {
      setShadow(ctx, o.shadow);
    }
    ctx.fillStyle = o.fill || '#fff';
    ctx.fill(path);
    noShadow(ctx);
    if (o.print) {
      ctx.save();
      if (o.printAlpha != null) ctx.globalAlpha *= o.printAlpha;
      ctx.fillStyle = o.print;
      ctx.fill(path);
      ctx.restore();
    }
    if (o.grain !== false && LR.tex && LR.tex.grain) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.globalAlpha *= o.grain == null || o.grain === true ? 0.55 : o.grain;
      ctx.fillStyle = LR.tex.grain;
      ctx.fill(path);
      ctx.restore();
    }
    if (o.ink) {
      ctx.lineJoin = 'round';
      ctx.lineCap = 'round';
      ctx.strokeStyle = o.ink;
      ctx.lineWidth = o.lw || 3;
      ctx.stroke(path);
      if (o.sketch) {
        const S = boilPts(pts, seed + 77, 2.2);
        ctx.globalAlpha *= 0.45;
        ctx.lineWidth = (o.lw || 3) * 0.45;
        ctx.stroke(toPath(S, true, smooth));
      }
    }
    ctx.restore();
    return path;
  }

  // Open ink stroke (doodles, grass blades, motion lines)
  function ink(ctx, pts, o = {}) {
    const P = boilPts(pts, o.seed || 0, o.boil == null ? 1 : o.boil);
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.lineJoin = 'round';
    ctx.lineCap = o.cap || 'round';
    ctx.strokeStyle = o.color || LR.C.ink;
    ctx.lineWidth = o.lw || 3;
    if (o.dash) ctx.setLineDash(o.dash);
    ctx.beginPath();
    trace(ctx, P, !!o.closed, o.smooth !== false);
    ctx.stroke();
    ctx.restore();
  }

  function withT(ctx, x, y, rot, sx, sy, fn) {
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    if (sx != null && (sx !== 1 || (sy != null && sy !== 1))) ctx.scale(sx, sy == null ? sx : sy);
    fn(ctx);
    ctx.restore();
  }

  // ---------------- doodles & craft bits ----------------
  function starPts(r, r2 = 0.46, n = 5, rot = -Math.PI / 2) {
    const pts = [];
    for (let i = 0; i < n * 2; i++) {
      const a = rot + (i / (n * 2)) * TAU, rr = i % 2 ? r * r2 : r;
      pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
    }
    return pts;
  }
  function star(ctx, x, y, r, rot, fill, o = {}) {
    withT(ctx, x, y, rot, 1, 1, () => {
      paper(ctx, polyPts(starPts(r, o.inner || 0.47, o.points || 5), o.seed || 5, 0.6, 9), {
        fill, ink: o.ink === undefined ? LR.C.ink : o.ink, lw: o.lw || 2.5, shadow: o.shadow == null ? 0.6 : o.shadow, smooth: false, seed: o.seed || 5,
      });
    });
  }
  // 4-point twinkle
  function sparkle(ctx, x, y, r, color, rot = 0, seed = 3) {
    withT(ctx, x, y, rot, 1, 1, () => {
      const pts = [];
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * TAU - Math.PI / 2, rr = i % 2 ? r * 0.22 : r;
        pts.push([Math.cos(a) * rr, Math.sin(a) * rr]);
      }
      paper(ctx, pts, { fill: color, smooth: false, seed, boil: 0.8, grain: false });
    });
  }
  function squiggle(ctx, x, y, len, amp, o = {}) {
    const pts = [];
    const n = Math.max(6, Math.round(len / 10));
    const waves = o.waves || len / 60;
    for (let i = 0; i <= n; i++) {
      const k = i / n;
      pts.push([x + k * len, y + Math.sin(k * waves * TAU + (o.phase || 0)) * amp]);
    }
    ink(ctx, pts, o);
  }
  function spiralPts(r, turns = 2.5, n = 50) {
    const pts = [];
    for (let i = 0; i <= n; i++) {
      const k = i / n, a = k * turns * TAU;
      pts.push([Math.cos(a) * r * k, Math.sin(a) * r * k]);
    }
    return pts;
  }
  function heartPts(s) {
    const pts = [];
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * TAU;
      const x = 16 * Math.pow(Math.sin(a), 3);
      const y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
      pts.push([x * s / 16, y * s / 16]);
    }
    return pts;
  }
  // Washi tape strip centred at x,y
  function tape(ctx, x, y, w, h, rot, color, o = {}) {
    withT(ctx, x, y, rot, 1, 1, () => {
      const pts = [
        ...LR.tornLine(-w / 2, -h / 2, w / 2, -h / 2, 1, 0.8, 16, false),
        ...zig(w / 2, -h / 2, w / 2, h / 2, o.seed || 3),
        ...LR.tornLine(w / 2, h / 2, -w / 2, h / 2, 2, 0.8, 16, false),
        ...zig(-w / 2, h / 2, -w / 2, -h / 2, (o.seed || 3) + 9),
      ];
      paper(ctx, pts, {
        fill: color, print: o.print, printAlpha: 0.5, alpha: o.alpha == null ? 0.86 : o.alpha,
        shadow: { blur: 4, x: 1, y: 2, a: 0.16 }, smooth: false, seed: o.seed || 3, boil: 0.5,
      });
    });
    function zig(x0, y0, x1, y1, s) {
      const pts = [], n = 6;
      for (let i = 0; i < n; i++) {
        const k = i / n;
        pts.push([x0 + (x1 - x0) * k + (i % 2 ? 3.5 : -2) + (rnd(s, i) - 0.5) * 3, y0 + (y1 - y0) * k]);
      }
      return pts;
    }
  }

  Object.assign(LR, {
    circlePts, ellipsePts, rrectPts, tornLine, tornRectPts, polyPts, roughen, xform, boilPts, offsetPts,
    trace, toPath, setShadow, noShadow, paper, ink, withT, starPts, star, sparkle, squiggle, spiralPts, heartPts, tape,
  });
})(typeof self !== 'undefined' ? self : globalThis);
