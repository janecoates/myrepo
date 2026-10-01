/* Fall edition: cut-paper autumn leaves.
 * - LR.leaf()       one leaf (maple / oak / aspen) with 3D "flutter"
 * - LR.leafField()  an endless, deterministic fall of leaves (pure f(t))
 * - TRANSITION_FX.leaves  a gust of leaves sweeps across; the next scene is
 *                   revealed behind it through a feathered edge */
(function (root) {
  const LR = root.LR;
  const { rnd, clamp, E, paper, shade } = LR;
  const TAU = Math.PI * 2;

  LR.LEAF_COLORS = ['#B5532A', '#E07A3F', '#D9A13B', '#7A2E2E', '#C9862F', '#8C5A2B', '#6F7444'];

  // Outlines in leaf space: tip at (0,-1), stem base near (0,0.3)
  const MAPLE = [[0, -1], [0.12, -0.72], [0.32, -0.8], [0.28, -0.55], [0.62, -0.64], [0.5, -0.4], [0.84, -0.3], [0.58, -0.13],
    [0.68, 0.04], [0.36, 0.02], [0.3, 0.2], [0.08, 0.12], [0.03, 0.3], [-0.03, 0.3], [-0.08, 0.12], [-0.3, 0.2], [-0.36, 0.02],
    [-0.68, 0.04], [-0.58, -0.13], [-0.84, -0.3], [-0.5, -0.4], [-0.62, -0.64], [-0.28, -0.55], [-0.32, -0.8], [-0.12, -0.72]];
  function oak() {
    const L = [], R = [];
    for (let i = 0; i <= 24; i++) {
      const u = i / 24, y = -1 + u * 1.25;
      const env = Math.sin(Math.min(1, u * 1.08) * Math.PI) ** 0.7;
      const w = (0.24 + 0.13 * Math.max(0, Math.sin(u * Math.PI * 4.5))) * env + 0.02;
      R.push([w, y]); L.unshift([-w, y]);
    }
    return [...R, [0.04, 0.3], [-0.04, 0.3], ...L];
  }
  function aspen() {
    const pts = [];
    for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push([0.42 * Math.sin(Math.PI * u) ** 0.85 * (1 - 0.25 * u), -1 + u * 1.2]); }
    for (let i = 20; i >= 0; i--) { const u = i / 20; pts.push([-0.42 * Math.sin(Math.PI * u) ** 0.85 * (1 - 0.25 * u), -1 + u * 1.2]); }
    return pts;
  }
  const SHAPES = { maple: MAPLE, oak: oak(), aspen: aspen() };
  const KINDS = ['maple', 'oak', 'aspen'];
  LR.LEAF_KINDS = KINDS;

  // x,y centre; size = tip-to-stem length in px; flip ∈ [-1,1] squashes the leaf
  // across its width as it tumbles (negative shows the paler back side).
  LR.leaf = function (ctx, x, y, size, rot, flip, kind, color, o = {}) {
    const pts = SHAPES[kind] || MAPLE;
    const f = Math.abs(flip) < 0.08 ? 0.08 * Math.sign(flip || 1) : flip;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.scale(size * 0.62 * f, size * 0.62);
    const fill = f < 0 ? shade(color, 0.22) : color;
    const vein = shade(color, -0.32);
    // keep outline widths constant regardless of the leaf's scale
    const s = size * 0.62;
    paper(ctx, pts, {
      fill, smooth: kind !== 'maple', boil: 0, seed: o.seed || 1, grain: o.grain == null ? 0.4 : o.grain,
      shadow: o.shadow === false ? null : (o.shadow || { blur: 10, x: 3, y: 6, a: 0.22 }),
      ink: o.ink || null, lw: (o.lw || 2.5) / s,
    });
    ctx.strokeStyle = vein;
    ctx.globalAlpha *= 0.75;
    ctx.lineCap = 'round';
    ctx.lineWidth = 2.2 / s;
    ctx.beginPath();
    ctx.moveTo(0, 0.55); ctx.lineTo(0, 0.25); ctx.lineTo(0, -0.88);
    if (kind === 'maple') {
      ctx.moveTo(0, 0.05); ctx.lineTo(0.62, -0.58); ctx.moveTo(0, 0.05); ctx.lineTo(-0.62, -0.58);
      ctx.moveTo(0, 0.12); ctx.lineTo(0.58, 0.02); ctx.moveTo(0, 0.12); ctx.lineTo(-0.58, 0.02);
    } else {
      for (let k = 0; k < 4; k++) {
        const yy = -0.15 - k * 0.2;
        ctx.moveTo(0, yy + 0.08); ctx.lineTo(0.22, yy - 0.06); ctx.moveTo(0, yy + 0.08); ctx.lineTo(-0.22, yy - 0.06);
      }
    }
    ctx.stroke();
    ctx.restore();
  };

  // Endless falling leaves. Positions are a pure function of t, so the same
  // field drawn in two scenes lines up perfectly through a transition.
  LR.leafField = function (ctx, t, o = {}) {
    const W = LR.W, H = LR.H;
    const n = o.n || 12, seed = o.seed || 1;
    const [s0, s1] = o.size || [28, 54];
    const [v0, v1] = o.speed || [70, 140];
    const cols = o.colors || LR.LEAF_COLORS;
    for (let i = 0; i < n; i++) {
      const sz = s0 + (s1 - s0) * rnd(i, seed, 1);
      const sp = v0 + (v1 - v0) * rnd(i, seed, 2);
      const span = H + 400;
      const tt = t + rnd(i, seed, 3) * (span / sp);
      const y = -200 + ((tt * sp) % span);
      const x = rnd(i, seed, 4) * (W + 120) - 60 + Math.sin(tt * (0.5 + rnd(i, seed, 5) * 0.7) + i) * (40 + 90 * rnd(i, seed, 6));
      const rot = rnd(i, seed, 7) * TAU + Math.sin(tt * (0.6 + rnd(i, seed, 8))) * 0.9;
      const flip = Math.cos(tt * (1.4 + 1.8 * rnd(i, seed, 9)) + i);
      LR.leaf(ctx, x, y, sz, rot, flip, KINDS[i % 3], cols[(i + seed) % cols.length], {
        seed: seed * 50 + i, shadow: o.shadow === false ? false : null, grain: o.grain,
      });
    }
  };

  // ---- the leaf-gust transition ----
  let off = null;
  LR.TRANSITION_FX.leaves = function (ctx, A, B, t, tr, drawScene) {
    const W = LR.W, H = LR.H, S = LR.pxScale;
    const t0 = tr.at - tr.dur * 0.55;
    const k = clamp((t - t0) / tr.dur);
    const e = E.inOutCubic(k);
    const dir = tr.dir || 1;
    const feather = 320;
    const front = dir > 0 ? -feather + e * (W + feather * 2) : W + feather - e * (W + feather * 2);
    drawScene(ctx, A, t);
    // incoming scene rendered offscreen, then faded in behind the gust
    const cw = ctx.canvas.width, ch = ctx.canvas.height;
    if (!off || off.width !== cw || off.height !== ch) off = LR.mkCanvas(cw, ch);
    const g = off.getContext('2d');
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.globalCompositeOperation = 'source-over';
    g.globalAlpha = 1;
    g.clearRect(0, 0, cw, ch);
    g.setTransform(S, 0, 0, S, 0, 0);
    drawScene(g, B, t);
    g.globalCompositeOperation = 'destination-in';
    const grad = g.createLinearGradient(front - feather / 2, 0, front + feather / 2, 0);
    grad.addColorStop(0, dir > 0 ? 'rgba(0,0,0,1)' : 'rgba(0,0,0,0)');
    grad.addColorStop(1, dir > 0 ? 'rgba(0,0,0,0)' : 'rgba(0,0,0,1)');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    g.globalCompositeOperation = 'source-over';
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.drawImage(off, 0, 0);
    ctx.restore();
    // the gust itself
    const n = 64, seed = Math.round(tr.at * 10);
    for (let i = 0; i < n; i++) {
      const lag = (rnd(i, seed, 1) - 0.5) * 2;
      const x = front + dir * lag * 300 + Math.sin(t * 7 + i) * 20;
      const yBase = rnd(i, seed, 2) * (H + 200) - 100;
      const y = yBase + Math.sin(k * Math.PI * 1.5 + i) * 90 * dir;
      const sz = 46 + rnd(i, seed, 3) * 80;
      const a = Math.sin(clamp(k * 1.15 - Math.abs(lag) * 0.12) * Math.PI);
      if (a <= 0.02) continue;
      ctx.save();
      ctx.globalAlpha = Math.min(1, a * 1.6);
      LR.leaf(ctx, x, y, sz, rnd(i, seed, 4) * TAU + k * 9 * dir, Math.cos(k * 14 + i), KINDS[i % 3], LR.LEAF_COLORS[i % LR.LEAF_COLORS.length], { seed: seed * 7 + i });
      ctx.restore();
    }
  };
})(typeof self !== 'undefined' ? self : globalThis);
