/* Paper-doll character rig.
 * Cut-out puppets hinged at shoulder/elbow/hip/knee, "rubber-hose" limbs,
 * cut-paper hair, and a wardrobe of full-coverage swimwear:
 *   tops:    tankini (hip length, covers midriff), rash guard (long sleeve),
 *            one-piece (with attached swim shorts)
 *   bottoms: swim skirt (to just above the knee), swim shorts
 *   sleeves: cap / short / elbow / wrist
 * Origin of a figure is the hip centre; +y is down. */
(function (root) {
  const LR = root.LR;
  const { DEG, rnd, paper, ellipsePts, boilPts, setShadow, noShadow, shade } = LR;
  const TAU = Math.PI * 2;

  const BUILD = {
    slim:  { T: 98, S: 34, B: 31, Wa: 26, Hp: 31, ua: 50, fa: 46, arm: 16, th: 58, sh: 56, leg: 21, R: 38, neck: 12 },
    curvy: { T: 98, S: 39, B: 41, Wa: 36, Hp: 44, ua: 50, fa: 46, arm: 20, th: 58, sh: 55, leg: 26, R: 38, neck: 12 },
    teen:  { T: 88,  S: 31, B: 28, Wa: 25, Hp: 29, ua: 46, fa: 43, arm: 15, th: 53, sh: 52, leg: 19, R: 37, neck: 11 },
    kid:   { T: 66,  S: 26, B: 25, Wa: 24, Hp: 25, ua: 36, fa: 33, arm: 12, th: 40, sh: 40, leg: 15, R: 36, neck: 8 },
  };
  LR.BUILD = BUILD;

  const DEFAULT_POSE = {
    lean: 0, head: 0,
    shL: 14, elL: 10, shR: 14, elR: 10,
    hipL: 5, knL: 0, hipR: 5, knR: 0,
    flare: 0, hair: 0, mouth: 'smile', eyes: 'open', lookX: 0,
  };
  LR.DEFAULT_POSE = DEFAULT_POSE;

  const LW = 3.4;
  const SH = { blur: 7, x: 2, y: 4, a: 0.24 };
  const inkC = () => LR.C.ink;

  function rot(x, y, a) {
    const c = Math.cos(a), s = Math.sin(a);
    return [x * c - y * s, x * s + y * c];
  }
  function chain(x, y, a1, L1, a2, L2) {
    const d1 = rot(0, L1, a1);
    const j = [x + d1[0], y + d1[1]];
    const d2 = rot(0, L2, a1 + a2);
    return { p0: [x, y], p1: j, p2: [j[0] + d2[0], j[1] + d2[1]], a1, a2 };
  }
  function quadAt(p0, p1, p2, s) {
    const a = [p0[0] + (p1[0] - p0[0]) * s, p0[1] + (p1[1] - p0[1]) * s];
    const b = [p1[0] + (p2[0] - p1[0]) * s, p1[1] + (p2[1] - p1[1]) * s];
    return [a[0] + (b[0] - a[0]) * s, a[1] + (b[1] - a[1]) * s];
  }
  function quadSub(p0, p1, p2, s) {
    return [[p0[0] + (p1[0] - p0[0]) * s, p0[1] + (p1[1] - p0[1]) * s], quadAt(p0, p1, p2, s)];
  }

  function strokeBoth(ctx, path, w, fill, shadow = true) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (shadow) setShadow(ctx, SH);
    ctx.strokeStyle = inkC();
    ctx.lineWidth = w + LW * 2;
    ctx.stroke(path);
    noShadow(ctx);
    ctx.strokeStyle = fill;
    ctx.lineWidth = w;
    ctx.stroke(path);
    ctx.restore();
  }

  function limb(ctx, c, w, skin, seed) {
    const [p0, p1, p2] = boilPts([c.p0, c.p1, c.p2], seed, 0.6);
    const path = new Path2D();
    path.moveTo(p0[0], p0[1]);
    path.quadraticCurveTo(p1[0], p1[1], p2[0], p2[1]);
    strokeBoth(ctx, path, w, skin);
    return { p0, p1, p2 };
  }
  function sleeve(ctx, L, s, w, fabric, trim) {
    const [q1, e] = quadSub(L.p0, L.p1, L.p2, s);
    const path = new Path2D();
    path.moveTo(L.p0[0], L.p0[1]);
    path.quadraticCurveTo(q1[0], q1[1], e[0], e[1]);
    strokeBoth(ctx, path, w, fabric, false);
    if (trim) {
      const a = quadAt(L.p0, L.p1, L.p2, Math.max(0, s - 0.07));
      const b = quadAt(L.p0, L.p1, L.p2, Math.max(0, s - 0.03));
      ctx.save();
      ctx.lineCap = 'butt';
      ctx.strokeStyle = trim;
      ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
      ctx.restore();
    }
  }
  function blob(ctx, x, y, rx, ry, a, fill, seed, o = {}) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(a);
    paper(ctx, ellipsePts(rx, ry, 16, seed, 0.03), { fill, ink: inkC(), lw: o.lw || LW * 0.85, seed, boil: 0.6, shadow: o.shadow, grain: false });
    ctx.restore();
  }

  function isBlink(t, seed) {
    const period = 3.1 + (seed % 5) * 0.37;
    const p = (t + seed * 0.61) % period;
    return p < 0.11;
  }

  // ---------- torso outlines ----------
  function torsoFront(D) {
    const { T, S, B, Wa, Hp } = D;
    return [
      [-S * 0.42, -T - 2], [S * 0.42, -T - 2],
      [S - 3, -T + 3], [S + 1, -T + 14], [B, -T * 0.6], [Wa, -T * 0.3], [Hp, 0], [Hp - 2, 10],
      [-Hp + 2, 10], [-Hp, 0], [-Wa, -T * 0.3], [-B, -T * 0.6], [-S - 1, -T + 14], [-S + 3, -T + 3],
    ];
  }
  function neckline(D, style, side) {
    const { T, S } = D;
    const nw = S * 0.44;
    const dip = { scoop: 24, crew: 6, square: 18, v: 28, high: 3 }[style] || 14;
    if (side) {
      return [[-S * 0.36, -T + 1], [S * 0.1, -T + dip * 0.35], [S * 0.36, -T + dip * 0.75]];
    }
    if (style === 'square') return [[-nw, -T], [-nw * 0.78, -T + dip], [nw * 0.78, -T + dip], [nw, -T]];
    if (style === 'v') return [[-nw, -T], [0, -T + dip], [nw, -T]];
    const pts = [];
    for (let i = 0; i <= 6; i++) {
      const k = i / 6;
      pts.push([-nw + 2 * nw * k, -T + dip * Math.sin(Math.PI * k)]);
    }
    return pts;
  }
  function topFront(D, style, hem) {
    const { T, S, B, Wa, Hp } = D;
    return [
      ...neckline(D, style, false),
      [S - 3, -T + 3], [S + 2, -T + 14], [B + 1, -T * 0.6], [Wa + 2, -T * 0.3], [Hp + 3, 0], [Hp + 5, hem],
      [Hp * 0.45, hem + 3], [0, hem + 2], [-Hp * 0.45, hem + 3],
      [-Hp - 5, hem], [-Hp - 3, 0], [-Wa - 2, -T * 0.3], [-B - 1, -T * 0.6], [-S - 2, -T + 14], [-S + 3, -T + 3],
    ];
  }
  function torsoSide(D) {
    const { T, S, B, Wa, Hp } = D;
    return [
      [-S * 0.34, -T - 2], [S * 0.3, -T - 2],
      [B * 0.62, -T * 0.8], [B * 0.8, -T * 0.6], [Wa * 0.62, -T * 0.3], [Hp * 0.62, -4], [Hp * 0.58, 10],
      [-Hp * 0.74, 10], [-Hp * 0.82, -4], [-Wa * 0.64, -T * 0.36], [-S * 0.62, -T * 0.72], [-S * 0.52, -T + 6],
    ];
  }
  function topSide(D, style, hem) {
    const { T, S, B, Wa, Hp } = D;
    return [
      ...neckline(D, style, true),
      [B * 0.66, -T * 0.8], [B * 0.84, -T * 0.6], [Wa * 0.66, -T * 0.3], [Hp * 0.66, -4], [Hp * 0.7, hem],
      [0, hem + 3],
      [-Hp * 0.86, hem], [-Hp * 0.86, -4], [-Wa * 0.68, -T * 0.36], [-S * 0.66, -T * 0.72], [-S * 0.56, -T + 6],
    ];
  }

  // ---------- hair ----------
  function hairBack(ctx, ch, R, side, pose, t) {
    const hc = ch.hair, st = ch.hairStyle, s = ch.seed || 1;
    const o = { fill: hc, ink: inkC(), lw: LW, seed: s + 40, shadow: SH, grain: 0.4 };
    const sx = side ? -R * 0.22 : 0;
    if (st === 'bob') {
      const pts = [];
      for (let i = 0; i <= 10; i++) { const a = Math.PI + (i / 10) * Math.PI; pts.push([sx + Math.cos(a) * R * 1.14, Math.sin(a) * R * 1.1 - R * 0.02]); }
      pts.push([sx + R * 1.16, R * 0.35], [sx + R * 1.08, R * 0.78], [sx + R * 0.6, R * 0.86], [sx - R * 0.6, R * 0.86], [sx - R * 1.08, R * 0.78], [sx - R * 1.16, R * 0.35]);
      paper(ctx, pts, o);
    } else if (st === 'pony' || st === 'lowpony') {
      const low = st === 'lowpony';
      const bx = side ? -R * 0.78 : R * 0.3, by = low ? -R * 0.1 : -R * 1.0;
      const swing = (pose.hair || 0) * DEG + (side ? 0.9 : 0.5) + Math.sin(t * 3.1 + s) * 0.06;
      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(swing);
      const len = R * (low ? 1.5 : 1.7), wid = R * 0.46;
      const pts = [];
      for (let i = 0; i <= 12; i++) {
        const k = i / 12, a = k * Math.PI;
        pts.push([Math.sin(a) * wid * (0.6 + 0.6 * k) * (k > 0.8 ? 1 - (k - 0.8) * 2 : 1), -Math.cos(a) * 0 + k * len]);
      }
      for (let i = 12; i >= 0; i--) {
        const k = i / 12, a = k * Math.PI;
        pts.push([-Math.sin(a) * wid * (0.5 + 0.5 * k) * 0.8, k * len]);
      }
      paper(ctx, pts, { ...o, seed: s + 41 });
      ctx.restore();
    } else if (st === 'puffs') {
      for (const d of side ? [-1] : [-1, 1]) {
        const cx = side ? -R * 0.7 : d * R * 0.9, cy = -R * 0.78;
        const pts = [];
        for (let i = 0; i < 18; i++) {
          const a = (i / 18) * TAU, r = R * 0.5 * (1 + 0.1 * Math.sin(a * 6 + d));
          pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
        }
        paper(ctx, pts, { ...o, seed: s + 43 + d });
      }
    } else if (st === 'curly') {
      const pts = [];
      for (let i = 0; i < 40; i++) {
        const a = (i / 40) * TAU, r = R * 1.42 * (1 + 0.055 * Math.sin(a * 14));
        pts.push([sx * 1.4 + Math.cos(a) * r, -R * 0.22 + Math.sin(a) * r * 0.95]);
      }
      paper(ctx, pts, { ...o, seed: s + 44 });
    } else if (st === 'bun') {
      const bx = side ? -R * 0.35 : 0;
      ctx.save(); ctx.translate(bx, -R * 1.18);
      paper(ctx, ellipsePts(R * 0.44, R * 0.4, 16, s + 45, 0.05), { ...o, seed: s + 45 });
      ctx.restore();
    } else if (st === 'long') {
      const pts = [];
      for (let i = 0; i <= 10; i++) { const a = Math.PI + (i / 10) * Math.PI; pts.push([sx + Math.cos(a) * R * 1.14, Math.sin(a) * R * 1.12 - R * 0.02]); }
      const sw = (pose.hair || 0) * 0.4;
      pts.push([sx + R * 1.2, R * 0.6], [sx + R * 1.3 + sw, R * 1.7], [sx + R * 1.05 + sw, R * 2.25], [sx + R * 0.5 + sw, R * 2.1],
        [sx + sw, R * 2.3], [sx - R * 0.5 + sw, R * 2.1], [sx - R * 1.05 + sw, R * 2.25], [sx - R * 1.3 + sw, R * 1.7], [sx - R * 1.2, R * 0.6]);
      paper(ctx, pts, { ...o, seed: s + 46 });
    }
  }

  function hairFront(ctx, ch, R, side) {
    const hc = ch.hair, st = ch.hairStyle, s = ch.seed || 1;
    const o = { fill: hc, ink: inkC(), lw: LW, seed: s + 50, grain: 0.4 };
    let pts;
    if (side) {
      pts = [];
      for (let i = 0; i <= 12; i++) { const a = -62 * DEG - (i / 12) * 215 * DEG; pts.push([Math.cos(a) * R * 1.07, Math.sin(a) * R * 1.07]); }
      if (st === 'bob' || st === 'long') pts.push([-R * 0.9, R * 0.85], [-R * 0.3, R * 0.8], [-R * 0.18, R * 0.1]);
      else pts.push([-R * 0.55, R * 0.62], [-R * 0.3, R * 0.2]);
      pts.push([R * 0.05, -R * 0.36], [R * 0.3, -R * 0.52]);
      paper(ctx, pts, o);
    } else if (st === 'bob') {
      pts = [[-R * 0.78, R * 0.66], [-R * 1.12, R * 0.76], [-R * 1.17, R * 0.05]];
      for (let i = 0; i <= 10; i++) { const a = Math.PI + 0.12 + (i / 10) * (Math.PI - 0.24); pts.push([Math.cos(a) * R * 1.16, Math.sin(a) * R * 1.12]); }
      pts.push([R * 1.17, R * 0.05], [R * 1.12, R * 0.76], [R * 0.78, R * 0.66], [R * 0.84, R * 0.02], [R * 0.74, -R * 0.36]);
      const n = 7;
      for (let i = 1; i < n; i++) {
        const x = R * 0.74 - (i / n) * R * 1.48;
        pts.push([x, -R * (i % 2 ? 0.3 : 0.42)]);
      }
      pts.push([-R * 0.74, -R * 0.36], [-R * 0.84, R * 0.02]);
      paper(ctx, pts, { ...o, smooth: true });
    } else if (st === 'pony' || st === 'lowpony' || st === 'bun') {
      pts = [[-R * 1.03, R * 0.18]];
      for (let i = 0; i <= 10; i++) { const a = Math.PI + 0.05 + (i / 10) * (Math.PI - 0.1); pts.push([Math.cos(a) * R * 1.07, Math.sin(a) * R * 1.07]); }
      pts.push([R * 1.03, R * 0.18], [R * 0.86, -R * 0.12], [R * 0.45, -R * 0.5], [-R * 0.1, -R * 0.42], [-R * 0.55, -R * 0.2], [-R * 0.88, -R * 0.02]);
      paper(ctx, pts, o);
      if (st !== 'lowpony') {
        const tx = st === 'bun' ? 0 : R * 0.3;
        ctx.save(); ctx.translate(tx, -R * 1.02);
        paper(ctx, ellipsePts(R * 0.22, R * 0.12, 10, s + 51, 0.05), { fill: ch.tie || LR.C.coral, ink: inkC(), lw: LW * 0.8, seed: s + 51, grain: false });
        ctx.restore();
      }
    } else if (st === 'puffs' || st === 'curly') {
      pts = [[-R * 1.04, R * 0.12]];
      for (let i = 0; i <= 10; i++) { const a = Math.PI + (i / 10) * Math.PI; pts.push([Math.cos(a) * R * 1.08, Math.sin(a) * R * 1.08]); }
      pts.push([R * 1.04, R * 0.12], [R * 0.9, -R * 0.2]);
      for (let i = 1; i < 8; i++) { const x = R * 0.9 - (i / 8) * R * 1.8; pts.push([x, -R * (0.42 + (i % 2) * 0.1)]); }
      pts.push([-R * 0.9, -R * 0.2]);
      paper(ctx, pts, o);
      if (st === 'puffs') {
        for (const d of [-1, 1]) {
          ctx.save(); ctx.translate(d * R * 0.62, -R * 0.62); ctx.rotate(d * 0.7);
          paper(ctx, ellipsePts(R * 0.2, R * 0.1, 10, s + 52 + d, 0.05), { fill: ch.tie || LR.C.lime, ink: inkC(), lw: LW * 0.8, seed: s + 52 + d, grain: false });
          ctx.restore();
        }
      }
    } else if (st === 'long') {
      pts = [[0, -R * 1.1]];
      for (let i = 0; i <= 6; i++) { const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2 + 0.2); pts.push([Math.cos(a) * R * 1.13, Math.sin(a) * R * 1.13]); }
      pts.push([R * 1.16, R * 0.95], [R * 0.86, R * 0.9], [R * 0.84, R * 0.1], [R * 0.55, -R * 0.45], [R * 0.08, -R * 0.78],
        [-R * 0.08, -R * 0.78], [-R * 0.55, -R * 0.45], [-R * 0.84, R * 0.1], [-R * 0.86, R * 0.9], [-R * 1.16, R * 0.95]);
      for (let i = 0; i <= 6; i++) { const a = Math.PI - 0.2 + (i / 6) * (Math.PI / 2 + 0.2); pts.push([Math.cos(a) * R * 1.13, Math.sin(a) * R * 1.13]); }
      paper(ctx, pts, o);
    }
    // cut-paper highlight
    if (!side) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = shade(hc, 0.45);
      ctx.lineCap = 'round';
      ctx.lineWidth = R * 0.1;
      ctx.beginPath();
      ctx.arc(0, 0, R * 0.9, Math.PI * 1.18, Math.PI * 1.38);
      ctx.stroke();
      ctx.restore();
    }
  }

  // ---------- face ----------
  function face(ctx, ch, R, pose, t, side) {
    const ic = inkC();
    const blink = isBlink(t, ch.seed || 1);
    const eyes = pose.eyes === 'open' && blink ? 'closed' : pose.eyes;
    const eyePos = side ? [[R * 0.46, R * 0.06]] : [[-R * 0.37, R * 0.08], [R * 0.37, R * 0.08]];
    const lx = (pose.lookX || 0) * R * 0.05;
    // cheeks
    ctx.save();
    ctx.fillStyle = 'rgba(255,120,130,0.42)';
    for (const [x] of eyePos) {
      ctx.beginPath(); ctx.ellipse(x + (side ? -R * 0.06 : x < 0 ? -R * 0.14 : R * 0.14), R * 0.42, R * 0.17, R * 0.12, 0, 0, TAU); ctx.fill();
    }
    ctx.restore();
    ctx.save();
    ctx.lineCap = 'round';
    ctx.strokeStyle = ic;
    ctx.fillStyle = ic;
    for (const [x, y] of eyePos) {
      if (eyes === 'happy') {
        ctx.lineWidth = R * 0.075;
        ctx.beginPath(); ctx.arc(x, y + R * 0.06, R * 0.12, Math.PI * 1.1, Math.PI * 1.9); ctx.stroke();
      } else if (eyes === 'closed') {
        ctx.lineWidth = R * 0.065;
        ctx.beginPath(); ctx.arc(x, y - R * 0.02, R * 0.11, Math.PI * 0.15, Math.PI * 0.85); ctx.stroke();
      } else if (eyes === 'wide') {
        ctx.beginPath(); ctx.ellipse(x + lx, y, R * 0.1, R * 0.14, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + lx - R * 0.03, y - R * 0.05, R * 0.035, 0, TAU); ctx.fill(); ctx.fillStyle = ic;
      } else {
        ctx.beginPath(); ctx.ellipse(x + lx, y, R * 0.075, R * 0.105, 0, 0, TAU); ctx.fill();
        ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(x + lx - R * 0.025, y - R * 0.04, R * 0.028, 0, TAU); ctx.fill(); ctx.fillStyle = ic;
      }
      // brows
      ctx.lineWidth = R * 0.045;
      ctx.beginPath(); ctx.arc(x, y + R * 0.02, R * 0.2, Math.PI * 1.32, Math.PI * 1.68); ctx.stroke();
    }
    // nose
    ctx.lineWidth = R * 0.045;
    if (side) {
      ctx.save();
      ctx.fillStyle = ch.skin;
      ctx.beginPath(); ctx.arc(R * 0.97, R * 0.24, R * 0.13, -Math.PI * 0.6, Math.PI * 0.6); ctx.fill();
      ctx.lineWidth = LW;
      ctx.beginPath(); ctx.arc(R * 0.97, R * 0.24, R * 0.13, -Math.PI * 0.45, Math.PI * 0.5); ctx.stroke();
      ctx.restore();
    } else {
      ctx.beginPath(); ctx.arc(0, R * 0.26, R * 0.06, Math.PI * 0.1, Math.PI * 0.9); ctx.stroke();
    }
    // mouth
    const mx = side ? R * 0.72 : 0, my = R * 0.5;
    const m = pose.mouth;
    if (m === 'open' || m === 'grin') {
      const w = R * (side ? 0.2 : 0.27), h = R * (m === 'grin' ? 0.2 : 0.26);
      ctx.beginPath();
      ctx.moveTo(mx - w, my - h * 0.2);
      ctx.quadraticCurveTo(mx, my - h * 0.35, mx + w, my - h * 0.2);
      ctx.quadraticCurveTo(mx + w * 0.9, my + h, mx, my + h);
      ctx.quadraticCurveTo(mx - w * 0.9, my + h, mx - w, my - h * 0.2);
      ctx.closePath();
      ctx.fillStyle = '#8A2B3E';
      ctx.fill();
      ctx.save();
      ctx.clip();
      ctx.fillStyle = m === 'grin' ? '#fff' : '#F28A96';
      if (m === 'grin') ctx.fillRect(mx - w, my - h * 0.4, w * 2, h * 0.45);
      else { ctx.beginPath(); ctx.ellipse(mx, my + h * 0.85, w * 0.6, h * 0.45, 0, 0, TAU); ctx.fill(); }
      ctx.restore();
      ctx.lineWidth = R * 0.05;
      ctx.stroke();
    } else if (m === 'o') {
      ctx.fillStyle = '#8A2B3E';
      ctx.beginPath(); ctx.ellipse(mx, my + R * 0.04, R * 0.08, R * 0.1, 0, 0, TAU); ctx.fill();
    } else {
      ctx.lineWidth = R * 0.055;
      ctx.beginPath();
      if (side) ctx.arc(mx - R * 0.05, my - R * 0.1, R * 0.16, Math.PI * 0.2, Math.PI * 0.62);
      else ctx.arc(mx, my - R * 0.12, R * 0.2, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
    }
    ctx.restore();
  }

  function accessories(ctx, ch, R, side, t) {
    const a = ch.acc || {};
    const ic = inkC();
    if (a.goggles) {
      ctx.save();
      ctx.lineCap = 'round';
      ctx.strokeStyle = ic; ctx.lineWidth = R * 0.14 + LW * 2;
      ctx.beginPath();
      if (side) { ctx.moveTo(R * 0.6, -R * 0.5); ctx.quadraticCurveTo(-R * 0.2, -R * 0.62, -R * 1.02, -R * 0.2); }
      else { ctx.moveTo(-R * 1.05, -R * 0.38); ctx.quadraticCurveTo(0, -R * 0.6, R * 1.05, -R * 0.38); }
      ctx.stroke();
      ctx.strokeStyle = a.goggles; ctx.lineWidth = R * 0.14; ctx.stroke();
      ctx.restore();
      for (const x of side ? [R * 0.62] : [-R * 0.34, R * 0.34]) {
        ctx.save(); ctx.translate(x, -R * 0.5);
        paper(ctx, ellipsePts(R * 0.25, R * 0.2, 14, 61, 0.03), { fill: '#7FD9E6', ink: ic, lw: LW * 1.3, seed: 61, grain: false, boil: 0.5 });
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        ctx.beginPath(); ctx.ellipse(-R * 0.08, -R * 0.06, R * 0.07, R * 0.04, -0.5, 0, TAU); ctx.fill();
        ctx.restore();
      }
    }
    if (a.hat) {
      ctx.save();
      ctx.translate(side ? -R * 0.1 : 0, -R * 0.78);
      ctx.rotate(side ? -0.12 : 0);
      paper(ctx, ellipsePts(R * 0.98, R * 0.72, 18, 71, 0.03).filter((p) => p[1] <= 4), { fill: '#F2D28E', ink: ic, lw: LW, seed: 71, shadow: SH });
      ctx.fillStyle = a.hat;
      ctx.beginPath(); ctx.rect(-R * 0.96, -R * 0.32, R * 1.92, R * 0.24); ctx.fill();
      paper(ctx, ellipsePts(R * 1.95, R * 0.36, 26, 72, 0.02), { fill: '#F5DA9B', ink: ic, lw: LW, seed: 72, shadow: SH, print: LR.PRINT.halftone('rgba(160,110,40,.18)', 9, 1.6) });
      ctx.restore();
    }
    if (a.sunnies) {
      for (const x of side ? [R * 0.5] : [-R * 0.36, R * 0.36]) {
        ctx.save(); ctx.translate(x, R * 0.12);
        paper(ctx, LR.heartPts(R * 0.26), { fill: a.sunnies, ink: ic, lw: LW, seed: 81, grain: false, boil: 0.5 });
        ctx.fillStyle = 'rgba(255,255,255,.7)';
        ctx.beginPath(); ctx.ellipse(-R * 0.08, -R * 0.08, R * 0.06, R * 0.03, -0.6, 0, TAU); ctx.fill();
        ctx.restore();
      }
      if (!side) { ctx.save(); ctx.strokeStyle = ic; ctx.lineWidth = LW; ctx.beginPath(); ctx.moveTo(-R * 0.12, R * 0.06); ctx.quadraticCurveTo(0, 0, R * 0.12, R * 0.06); ctx.stroke(); ctx.restore(); }
    }
    if (a.flower) {
      ctx.save(); ctx.translate(side ? -R * 0.4 : R * 0.78, -R * 0.62); ctx.rotate(t * 0.3);
      for (let i = 0; i < 5; i++) {
        ctx.save(); ctx.rotate((i / 5) * TAU);
        paper(ctx, ellipsePts(R * 0.16, R * 0.24, 10, 90 + i, 0.05).map(([x, y]) => [x, y - R * 0.2]), { fill: a.flower, ink: ic, lw: LW * 0.7, seed: 90 + i, grain: false, boil: 0.4 });
        ctx.restore();
      }
      ctx.fillStyle = LR.C.sun; ctx.beginPath(); ctx.arc(0, 0, R * 0.11, 0, TAU); ctx.fill();
      ctx.restore();
    }
  }

  // ---------- bottoms ----------
  function thighPoint(c, dist, D) {
    const k = Math.min(1, dist / D.th);
    return [c.p0[0] + (c.p1[0] - c.p0[0]) * k, c.p0[1] + (c.p1[1] - c.p0[1]) * k];
  }
  function skirt(ctx, ch, D, legs, pose, side) {
    const b = ch.outfit.bottom;
    const L = D.th * (b.len || 0.9);
    const fl = pose.flare || 0;
    const w = D.leg * 0.5 + 9 + fl * 16;
    const lift = fl * 14;
    let pts;
    if (side) {
      const [a, c] = legs;
      const fa = thighPoint(a, L, D), fc = thighPoint(c, L, D);
      const front = fa[0] > fc[0] ? fa : fc, back = fa[0] > fc[0] ? fc : fa;
      const fx = Math.max(front[0] + w, D.Hp * 0.62 + 12 + fl * 10), fy = front[1] + 4 - lift;
      const bx = Math.min(back[0] - w - 4, -D.Hp * 0.86 - 10 - fl * 14), by = Math.max(back[1] + 4 - lift, 18);
      pts = [[-D.Hp * 0.82, -8], [D.Hp * 0.66, -8], [D.Hp * 0.74, 6], [fx, fy]];
      for (let i = 1; i < 6; i++) { const k = i / 6; pts.push([fx + (bx - fx) * k, fy + (by - fy) * k + Math.sin(k * Math.PI * 5) * (2 + fl * 5)]); }
      pts.push([bx, by], [-D.Hp * 0.9, 6]);
    } else {
      const [l, r] = legs;
      const pl = thighPoint(l, L, D), pr = thighPoint(r, L, D);
      const xL = Math.min(pl[0] - w, -D.Hp - 8 - fl * 16), xR = Math.max(pr[0] + w, D.Hp + 8 + fl * 16);
      const yL = Math.max(pl[1], L * 0.6) + 4 - lift, yR = Math.max(pr[1], L * 0.6) + 4 - lift;
      pts = [[-D.Hp - 1, -8], [D.Hp + 1, -8], [D.Hp + 4, 6], [xR, yR]];
      const n = 7;
      for (let i = 1; i < n; i++) { const k = i / n; pts.push([xR + (xL - xR) * k, yR + (yL - yR) * k + (i % 2 ? 3 : -1) + Math.sin(k * 9 + fl * 3) * fl * 5]); }
      pts.push([xL, yL], [-D.Hp - 4, 6]);
    }
    if (b.ruffle) {
      const R2 = pts.map(([x, y]) => [x * 1.06, y > 10 ? y + 12 : y]);
      paper(ctx, R2, { fill: b.ruffle, ink: inkC(), lw: LW, seed: 120, shadow: SH });
    }
    paper(ctx, pts, { fill: b.fill, print: b.print, ink: inkC(), lw: LW, seed: 121, shadow: SH });
    // pleats / waistband
    ctx.save();
    ctx.globalAlpha = 0.45;
    ctx.strokeStyle = inkC(); ctx.lineWidth = 2; ctx.lineCap = 'round';
    const hemMid = pts[3 + 3];
    for (const k of [-0.45, 0, 0.45]) {
      ctx.beginPath(); ctx.moveTo(k * D.Hp * 0.8, 0); ctx.lineTo(k * D.Hp * 0.8 + (hemMid[0] - 0) * 0.15 + k * 14, hemMid[1] - 6); ctx.stroke();
    }
    ctx.restore();
  }
  function shorts(ctx, ch, D, legs, side, fabric, trim) {
    const b = ch.outfit.bottom;
    const s = 0.5 * (b.len || 0.6);
    for (const c of legs) sleeve(ctx, c, s, D.leg + 12, fabric, trim);
    const Hp = D.Hp;
    const pts = side
      ? [[-Hp * 0.86, -8], [Hp * 0.68, -8], [Hp * 0.74, 10], [0, 18], [-Hp * 0.9, 12]]
      : [[-Hp - 2, -8], [Hp + 2, -8], [Hp + 4, 10], [Hp * 0.35, 20], [0, 16], [-Hp * 0.35, 20], [-Hp - 4, 10]];
    paper(ctx, pts, { fill: fabric, ink: inkC(), lw: LW, seed: 131, grain: 0.4 });
  }

  // ---------- main ----------
  // o: {view:'front'|'side', t}
  function drawFigure(ctx, ch, pose, o = {}) {
    const D = BUILD[ch.build || 'slim'];
    const P = Object.assign({}, DEFAULT_POSE, pose);
    const side = o.view === 'side';
    const t = o.t || 0;
    const top = ch.outfit.top, bot = ch.outfit.bottom || { kind: 'none' };
    const topFill = top.fill;
    const topPrint = top.print;
    const topFabric = topPrint || topFill;
    const skin = ch.skin;
    const skinFar = shade(skin, -0.12);
    const seed = ch.seed || 1;

    // ---- legs ----
    let legL, legR;
    if (side) {
      legL = chain(-3, 2, -P.hipL * DEG, D.th, P.knL * DEG, D.sh);
      legR = chain(3, 2, -P.hipR * DEG, D.th, P.knR * DEG, D.sh);
    } else {
      const hx = D.Hp * 0.52;
      legL = chain(-hx, 4, P.hipL * DEG, D.th, -P.knL * DEG, D.sh);
      legR = chain(hx, 4, -P.hipR * DEG, D.th, P.knR * DEG, D.sh);
    }

    // torso frame helpers
    const lean = P.lean * DEG;
    const shY = -D.T + 12;
    const shX = side ? 0 : D.S - 5;
    const neckBase = [0, -D.T];

    // arms (in torso frame)
    let armL, armR;
    if (side) {
      armL = chain(-2, shY, -P.shL * DEG, D.ua, -P.elL * DEG, D.fa);
      armR = chain(2, shY, -P.shR * DEG, D.ua, -P.elR * DEG, D.fa);
    } else {
      armL = chain(-shX, shY, P.shL * DEG, D.ua, P.elL * DEG, D.fa);
      armR = chain(shX, shY, -P.shR * DEG, D.ua, -P.elR * DEG, D.fa);
    }

    const headFrame = (fn) => {
      ctx.save();
      ctx.rotate(lean);
      ctx.translate(neckBase[0], neckBase[1]);
      ctx.rotate(P.head * DEG);
      ctx.translate(side ? D.R * 0.08 : 0, -(D.neck + D.R * 0.86));
      fn();
      ctx.restore();
    };
    const torsoFrame = (fn) => { ctx.save(); ctx.rotate(lean); fn(); ctx.restore(); };

    const sleeveS = { none: 0, cap: 0.2, short: 0.3, elbow: 0.5, three: 0.72, wrist: 0.96 }[top.sleeve || 'cap'];
    const sleeveW = D.arm + 9;

    const bare = !!o.clothesOnly;
    const drawArm = (c, far) => {
      const A = bare ? c : limb(ctx, c, D.arm, far ? skinFar : skin, seed + (far ? 7 : 8));
      if (sleeveS > 0) sleeve(ctx, A, sleeveS, sleeveW, far && side ? shade(topFill, -0.1) : topFabric, top.trim);
      if (!bare) blob(ctx, A.p2[0], A.p2[1], D.arm * 0.66, D.arm * 0.62, 0, far ? skinFar : skin, seed + (far ? 17 : 18), { lw: LW * 0.85 });
    };
    const drawLeg = (c, far, sgn) => {
      if (bare) return c;
      const Lg = limb(ctx, c, D.leg, far ? skinFar : skin, seed + (far ? 5 : 6));
      const ang = c.a1 + c.a2;
      if (side) {
        const f = rot(D.leg * 0.55, 1, ang);
        blob(ctx, Lg.p2[0] + f[0], Lg.p2[1] + f[1], D.leg * 0.95, D.leg * 0.46, ang, far ? skinFar : skin, seed + (far ? 25 : 26));
      } else {
        const f = rot(sgn * D.leg * 0.25, D.leg * 0.12, ang * 0.3);
        blob(ctx, Lg.p2[0] + f[0], Lg.p2[1] + f[1], D.leg * 0.72, D.leg * 0.44, sgn * 0.25 + ang * 0.3, far ? skinFar : skin, seed + (sgn > 0 ? 27 : 28));
      }
      return Lg;
    };

    // ---- back hair (behind everything) ----
    if (!bare) headFrame(() => hairBack(ctx, ch, D.R, side, P, t));

    // ---- far arm (side view) ----
    if (side) torsoFrame(() => drawArm(armL, true));

    // ---- legs ----
    const LL = drawLeg(legL, side, -1);
    const LRg = drawLeg(legR, false, 1);
    const legsDrawn = [
      { p0: LL.p0, p1: LL.p1, p2: LL.p2 },
      { p0: LRg.p0, p1: LRg.p1, p2: LRg.p2 },
    ];

    // ---- bottoms ----
    const onePiece = top.kind === 'onepiece';
    if (onePiece) {
      shorts(ctx, ch, D, legsDrawn, side, topFabric, top.trim);
    } else if (bot.kind === 'shorts') {
      shorts(ctx, ch, D, legsDrawn, side, bot.print || bot.fill, bot.trim);
    }
    if (bot.kind === 'skirt') skirt(ctx, ch, D, legsDrawn, P, side);

    // ---- torso: skin, neck, garment ----
    torsoFrame(() => {
      if (!bare) {
        // neck (in head tilt frame)
        ctx.save();
        ctx.translate(neckBase[0], neckBase[1]);
        ctx.rotate(P.head * DEG * 0.5);
        paper(ctx, LR.rrectPts(-D.R * 0.24, -D.neck - D.R * 0.4, D.R * 0.48, D.neck + D.R * 0.4 + 14, 6), { fill: skin, ink: inkC(), lw: LW, seed: seed + 9, grain: false });
        ctx.restore();
        paper(ctx, side ? torsoSide(D) : torsoFront(D), { fill: skin, seed: seed + 10, grain: false, shadow: SH });
      }
      const hem = onePiece ? 8 : top.hem == null ? 16 : top.hem;
      const tp = side ? topSide(D, top.neck || 'scoop', hem) : topFront(D, top.neck || 'scoop', hem);
      paper(ctx, tp, { fill: topFill, print: topPrint, ink: inkC(), lw: LW, seed: seed + 11, grain: 0.45 });
      // neckline binding
      if (top.trim) {
        const nl = neckline(D, top.neck || 'scoop', side);
        LR.ink(ctx, nl, { color: top.trim, lw: 5, seed: seed + 12, boil: 0.5 });
      }
      // details
      if (top.stripe) {
        ctx.save();
        ctx.beginPath(); LR.trace(ctx, tp, true, true); ctx.clip();
        ctx.fillStyle = top.stripe;
        ctx.fillRect(-D.B - 20, -D.T * 0.62, D.B * 2 + 40, 14);
        ctx.fillStyle = top.stripe2 || LR.C.white;
        ctx.fillRect(-D.B - 20, -D.T * 0.62 + 18, D.B * 2 + 40, 7);
        ctx.restore();
      }
      if (top.zip) {
        LR.ink(ctx, [[side ? D.S * 0.3 : 0, -D.T + 5], [side ? D.S * 0.38 : 0, -D.T + 34]], { color: top.zip, lw: 3.5, seed: 13 });
        ctx.fillStyle = top.zip; ctx.beginPath(); ctx.arc(side ? D.S * 0.38 : 0, -D.T + 36, 3.4, 0, TAU); ctx.fill();
      }
      if (top.knot) {
        const kx = side ? D.B * 0.6 : 0, ky = -D.T * 0.66;
        paper(ctx, ellipsePts(9, 7, 10, 14, 0.05).map(([x, y]) => [x + kx, y + ky]), { fill: top.knot, ink: inkC(), lw: 2.5, seed: 14, grain: false });
        for (const d of side ? [1] : [-1, 1]) {
          paper(ctx, [[kx, ky], [kx + d * 22, ky - 9], [kx + d * 20, ky + 10]], { fill: top.knot, ink: inkC(), lw: 2.5, seed: 15 + d, grain: false });
        }
        paper(ctx, ellipsePts(6, 6, 8, 16, 0.05).map(([x, y]) => [x + kx, y + ky]), { fill: top.knot, ink: inkC(), lw: 2.5, seed: 16, grain: false });
      }
      if (top.ruffle) {
        // flutter ruffle across the neckline
        const nl = neckline(D, top.neck || 'scoop', side);
        for (let i = 0; i < nl.length - 1; i++) {
          const [x, y] = nl[i];
          paper(ctx, ellipsePts(9, 6, 8, 170 + i, 0.08).map(([a, b2]) => [a + x + 4, b2 + y + 7]), { fill: top.ruffle, ink: inkC(), lw: 2, seed: 170 + i, grain: false, boil: 0.4 });
        }
      }
    });

    // ---- arms ----
    torsoFrame(() => {
      if (!side) { drawArm(armL, false); drawArm(armR, false); } else drawArm(armR, false);
    });

    // ---- head ----
    if (!bare) headFrame(() => {
      const R = D.R;
      if (!side) {
        for (const d of [-1, 1]) blob(ctx, d * R * 0.97, R * 0.12, R * 0.17, R * 0.22, 0, skin, seed + 30 + d);
      }
      paper(ctx, ellipsePts(R, R * 1.04, 26, seed + 33, 0.02), { fill: skin, ink: inkC(), lw: LW, seed: seed + 33, shadow: SH, grain: 0.35 });
      if (side) blob(ctx, -R * 0.12, R * 0.12, R * 0.15, R * 0.2, 0, skin, seed + 34);
      face(ctx, ch, R, P, t, side);
      hairFront(ctx, ch, R, side);
      accessories(ctx, ch, R, side, t);
    });

    // key points in figure-local space (for props held in hands, etc.)
    const tw = (p) => rot(p[0], p[1], lean);
    return { handL: tw(armL.p2), handR: tw(armR.p2), footL: legL.p2, footR: legR.p2 };
  }

  // ---------- pose helpers ----------
  // Side-view run cycle (phase in cycles)
  function runPose(phase, k = 1) {
    const a = Math.sin(phase * TAU);
    const b = Math.sin(phase * TAU + Math.PI);
    return {
      hipL: 32 * a * k, knL: (30 + 34 * Math.max(0, -a)) * k,
      hipR: 32 * b * k, knR: (30 + 34 * Math.max(0, -b)) * k,
      shL: -40 * a * k, elL: 70 * k, shR: -40 * b * k, elR: 70 * k,
      lean: 8 * k, head: -4 * k,
    };
  }
  function runBob(phase) { return -Math.abs(Math.sin(phase * TAU)) * 10; }

  Object.assign(LR, { drawFigure, runPose, runBob });
})(typeof self !== 'undefined' ? self : globalThis);
