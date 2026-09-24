/* 16–22 s — "Sprinkler o'clock!"
 * Backyard collage: bunting, picket fence, hydrangeas, a striped house wall.
 * Nia and Zuri (matching the Lime Ricki way: coordinating, not identical)
 * hop through an oscillating sprinkler on the beat. */
(function (root) {
  const LR = root.LR;
  const { pop, E, prog, clamp, withT, lerp, rnd } = LR;
  const TAU = Math.PI * 2;
  const SPR = [960, 870];

  const sweep = (t) => Math.sin(t * 1.7) * 0.85;

  // Oscillating-sprinkler water: each jet is a continuous arcing stream near
  // the nozzle that breaks up into droplets further out.
  function sprinklerDrops(ctx, t) {
    const C = LR.C;
    const jets = 5, G = 1500;
    const pos = (j, te) => {
      const sp = 780 + j * 52;
      const a = sweep(te) + (j - 2) * 0.035;
      const age = t - te;
      return [SPR[0] + (j - 2) * 7 + Math.sin(a) * sp * age, SPR[1] - 32 - Math.cos(a) * sp * age + 0.5 * G * age * age];
    };
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (let j = 0; j < jets; j++) {
      // stream
      const pts = [];
      for (let k = 0; k <= 22; k++) {
        const te = t - k * 0.02;
        if (te < 15.5) break;
        pts.push(pos(j, te));
      }
      if (pts.length > 2) {
        ctx.strokeStyle = C.poolDeep; ctx.lineWidth = 9;
        ctx.beginPath(); LR.trace(ctx, pts, false, true); ctx.stroke();
        ctx.strokeStyle = '#C8F1F7'; ctx.lineWidth = 5.5;
        ctx.beginPath(); LR.trace(ctx, pts, false, true); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,255,255,.9)'; ctx.lineWidth = 2;
        ctx.beginPath(); LR.trace(ctx, pts, false, true); ctx.stroke();
      }
    }
    // droplets
    const drops = [];
    for (let j = 0; j < jets; j++) {
      for (let k = 0; k < 26; k++) {
        const te = Math.floor(t / 0.045) * 0.045 - 0.44 - k * 0.045;
        const age = t - te;
        if (te < 15.5 || age > 1.6) continue;
        const [x0, y0] = pos(j, te);
        const jx = (rnd(k + Math.round(te * 100), j) - 0.5) * 30 * (age - 0.44);
        const y = y0 + (rnd(k + Math.round(te * 100), j, 2) - 0.5) * 20 * (age - 0.44);
        if (y > 1010) continue;
        drops.push([x0 + jx, y, 3 + ((j + k) % 3) * 1.3]);
      }
    }
    ctx.fillStyle = C.poolDeep;
    ctx.beginPath();
    for (const [x, y, r] of drops) { ctx.moveTo(x + r + 2, y); ctx.arc(x, y, r + 2, 0, TAU); }
    ctx.fill();
    ctx.fillStyle = '#C8F1F7';
    ctx.beginPath();
    for (const [x, y, r] of drops) { ctx.moveTo(x + r, y); ctx.arc(x, y, r, 0, TAU); }
    ctx.fill();
    ctx.restore();
  }

  function sprinkler(ctx, t) {
    const C = LR.C;
    withT(ctx, SPR[0], SPR[1], 0, 1, 1, () => {
      LR.paper(ctx, LR.rrectPts(-90, -8, 180, 30, 12), { fill: C.sun, ink: C.ink, lw: 3.5, seed: 1101, shadow: 1 });
      for (const d of [-1, 1]) LR.paper(ctx, [[d * 70, -4], [d * 58, -34], [d * 46, -4]], { fill: C.sun, ink: C.ink, lw: 3, seed: 1102 + d, smooth: false });
      withT(ctx, 0, -30, sweep(t), 1, 1, () => {
        LR.paper(ctx, LR.rrectPts(-68, -10, 136, 20, 10), { fill: '#C9CFD9', ink: C.ink, lw: 3, seed: 1104 });
        ctx.fillStyle = C.ink;
        for (let i = -3; i <= 3; i++) { ctx.beginPath(); ctx.arc(i * 17, -4, 2.6, 0, TAU); ctx.fill(); }
      });
      LR.ink(ctx, [[90, 10], [240, 40], [420, 30], [620, 60]], { color: C.limeDeep, lw: 9, seed: 1105 });
    });
  }

  function hop(t, offset, period = 1.0) {
    const p = (((t - offset) % period) + period) % period / period;
    const airborne = p > 0.08 && p < 0.62;
    const k = airborne ? (p - 0.08) / 0.54 : 0;
    const h = airborne ? Math.sin(k * Math.PI) : 0;
    const squash = !airborne ? Math.sin(((p + 0.38) % 1) / 0.46 * Math.PI) * (p > 0.62 || p < 0.08 ? 1 : 0) : 0;
    return { h, k, airborne, squash: Math.max(0, squash) };
  }

  function house(ctx) {
    const C = LR.C;
    const path = LR.paper(ctx, LR.polyPts([[1560, 130], [1990, 60], [1990, 640], [1560, 640]], 1201, 1.5, 30), { fill: C.sunPale, ink: C.ink, lw: 3.5, seed: 1201, smooth: false, shadow: 1 });
    ctx.save(); ctx.clip(path);
    ctx.strokeStyle = 'rgba(160,110,50,.35)'; ctx.lineWidth = 3;
    for (let y = 150; y < 640; y += 34) { ctx.beginPath(); ctx.moveTo(1540, y); ctx.lineTo(2000, y - 6); ctx.stroke(); }
    ctx.restore();
    // window
    LR.paper(ctx, LR.rrectPts(1650, 240, 230, 200, 8), { fill: '#9ED6EA', ink: C.ink, lw: 4, seed: 1202, shadow: 0.7, print: LR.PRINT.halftone('rgba(255,255,255,.5)', 14, 3) });
    for (const d of [0, 1]) {
      const x = d ? 1880 : 1650;
      LR.paper(ctx, [[x, 240], [x + (d ? -70 : 70), 240], [x + (d ? -40 : 40), 360], [x, 440]], { fill: C.pink, print: LR.PRINT.gingham(C.coral, C.pinkPale, 10), ink: C.ink, lw: 3, seed: 1203 + d, smooth: true });
    }
    LR.paper(ctx, LR.rrectPts(1630, 436, 270, 26, 6), { fill: C.white, ink: C.ink, lw: 3, seed: 1205 });
  }

  function fence(ctx, x0, x1, yTop, yBot) {
    const C = LR.C;
    LR.paper(ctx, LR.polyPts([[x0, yTop + 50], [x1, yTop + 44], [x1, yTop + 72], [x0, yTop + 78]], 1301, 1, 30), { fill: C.white, ink: C.ink, lw: 3, seed: 1301, smooth: false, shadow: 0.6 });
    LR.paper(ctx, LR.polyPts([[x0, yBot - 70], [x1, yBot - 76], [x1, yBot - 48], [x0, yBot - 42]], 1302, 1, 30), { fill: C.white, ink: C.ink, lw: 3, seed: 1302, smooth: false, shadow: 0.6 });
    for (let x = x0 + 10, i = 0; x < x1; x += 62, i++) {
      const w = 42, top = yTop + (rnd(i, 13) - 0.5) * 8;
      LR.paper(ctx, [[x, yBot], [x, top + 22], [x + w / 2, top], [x + w, top + 22], [x + w, yBot]], { fill: C.white, ink: C.ink, lw: 3, seed: 1310 + i, smooth: false, shadow: { blur: 8, x: 3, y: 4, a: 0.2 }, boil: 0.7 });
    }
  }

  function bush(ctx, x, y, w, h, seed, flower) {
    const C = LR.C;
    const pts = [];
    for (let i = 0; i <= 30; i++) {
      const a = Math.PI + (i / 30) * Math.PI;
      const r = 1 + 0.09 * Math.sin(a * 9 + seed);
      pts.push([x + Math.cos(a) * w * r, y + Math.sin(a) * h * r]);
    }
    pts.push([x + w, y + 20], [x - w, y + 20]);
    LR.paper(ctx, pts, { fill: C.grass, ink: C.ink, lw: 3, seed, shadow: 1, print: LR.PRINT.dots('rgba(0,0,0,0)', 'rgba(40,90,30,.25)', 20, 3, 1) });
    for (let i = 0; i < 7; i++) {
      const fx = x + (rnd(i, seed) - 0.5) * w * 1.5, fy = y - h * (0.25 + rnd(i, seed, 2) * 0.55);
      ctx.save(); ctx.fillStyle = flower;
      ctx.beginPath();
      for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; ctx.moveTo(fx + Math.cos(a) * 14 + 6, fy + Math.sin(a) * 12); ctx.arc(fx + Math.cos(a) * 14, fy + Math.sin(a) * 12, 6, 0, TAU); }
      ctx.fill(); ctx.restore();
    }
  }

  function kiddiePool(ctx, t) {
    const C = LR.C;
    withT(ctx, 1560, 960, 0, 1, 1, () => {
      LR.paper(ctx, LR.ellipsePts(250, 78, 40, 1401, 0.01), { fill: C.coral, ink: C.ink, lw: 3.5, seed: 1401, shadow: 1, print: LR.PRINT.vstripes('rgba(0,0,0,0)', 'rgba(255,255,255,.95)', 26, 1) });
      LR.paper(ctx, LR.ellipsePts(206, 52, 36, 1402, 0.01).map(([a, b]) => [a, b - 8]), { fill: '#7FD6E6', ink: C.ink, lw: 3, seed: 1402, print: LR.PRINT.halftone('rgba(255,255,255,.4)', 12, 2.5) });
      // rubber duck
      withT(ctx, 40 + Math.sin(t * 1.4) * 60, -24 + Math.sin(t * 3.3) * 4, Math.sin(t * 2.6) * 0.12, 1, 1, () => {
        LR.paper(ctx, LR.ellipsePts(46, 28, 18, 1403), { fill: C.sun, ink: C.ink, lw: 3, seed: 1403, shadow: 0.6 });
        LR.paper(ctx, LR.circlePts(22, 14, 1404).map(([a, b]) => [a - 26, b - 34]), { fill: C.sun, ink: C.ink, lw: 3, seed: 1404 });
        LR.paper(ctx, [[-46, -34], [-64, -30], [-46, -24]], { fill: C.coral, ink: C.ink, lw: 2.5, seed: 1405, smooth: false });
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(-32, -40, 3.4, 0, TAU); ctx.fill();
      });
    });
  }

  LR.scene('backyard', {
    start: 16.0, end: 22.0,
    draw(ctx, t) {
      const C = LR.C, Bc = LR.BRAND.copy;
      LR.bg(ctx, '#C9E9F4');
      ctx.save();
      LR.camera(ctx, 1.02 + prog(t, 15.6, 22.4) * 0.04, 960, 700);
      LR.halftoneWash(ctx, 1920, 0, 900, 20, 6, 'rgba(255,255,255,.55)');
      LR.cloud(ctx, 520 + t * 10, 270, 0.7, 31);
      LR.cloud(ctx, 1260 + t * 7, 230, 0.55, 32);
      // tree
      LR.paper(ctx, [[140, 620], [210, 620], [196, 300], [156, 300]], { fill: '#A7703F', ink: C.ink, lw: 3.5, seed: 1501, smooth: false, shadow: 1 });
      for (const [x, y, r, c] of [[110, 260, 120, C.limeDeep], [260, 230, 130, C.grass], [180, 140, 120, C.lime]]) {
        LR.paper(ctx, LR.circlePts(r, 26, 1502 + x, 0.06).map(([a, b]) => [a + x, b + y]), { fill: c, ink: C.ink, lw: 3.5, seed: 1502 + x, shadow: 1, print: LR.PRINT.dots('rgba(0,0,0,0)', 'rgba(255,255,255,.2)', 26, 4, 1) });
      }
      for (const [x, y] of [[90, 220], [230, 170], [300, 280], [170, 110]]) LR.cherries(ctx, x, y, 0.45, 0.2, {});
      house(ctx);
      fence(ctx, -40, 1570, 390, 640);
      bush(ctx, 420, 640, 150, 110, 1601, C.pink);
      bush(ctx, 1260, 640, 170, 100, 1602, '#9FB8F0');
      // lawn
      LR.waveStrip(ctx, 626, { fill: C.grass, amp: 5, wl: 380, phase: 0.3, seed: 1701, foam: 0, jag: 6, print: LR.PRINT.vstripes('rgba(0,0,0,0)', 'rgba(255,255,255,.1)', 70, 1), shadow: { blur: 16, x: 0, y: -4, a: 0.24 } });
      LR.grassBlades(ctx, 0, 1920, 650, 70, 1702, C.limeDeep, 30);
      for (const [x, y, r] of [[120, 760, 22], [330, 980, 20], [760, 700, 16], [1180, 1010, 20], [1760, 720, 18], [1330, 760, 14]]) LR.daisy(ctx, x, y, r, t * 0.2 + x, 1800 + x);
      // bunting
      LR.bunting(ctx, -30, 60, 1950, 70, 90, 14, [C.coral, C.lime, C.sun, C.aqua, C.pink, C.navy], t, 1900);

      kiddiePool(ctx, t);
      sprinkler(ctx, t);

      // Nia & Zuri hopping through the spray on the beat
      const cast = [
        [LR.CAST.nia, 620, 905, 1.42, 16.0],
        [LR.CAST.zuri, 1270, 915, 1.5, 16.5],
      ];
      cast.forEach(([ch, x, y, sc, off], i) => {
        const J = hop(t, off);
        const lift = J.h * (i ? 150 : 120);
        const s = J.squash;
        const star = J.airborne ? Math.sin(J.k * Math.PI) : 0;
        const pose = {
          shL: lerp(35, 165, star) + (i ? 0 : 0), elL: lerp(40, 10, star), shR: lerp(35, 165, star), elR: lerp(40, 10, star),
          hipL: lerp(6, 26, star), hipR: lerp(6, 26, star), knL: lerp(s * 40, 10, star), knR: lerp(s * 40, 10, star),
          flare: star, mouth: J.airborne ? 'grin' : 'open', eyes: J.airborne ? 'happy' : 'open', head: (i ? -1 : 1) * 6 * star,
          hair: star * 20,
        };
        // ground shadow
        ctx.save();
        ctx.fillStyle = 'rgba(40,70,20,.22)';
        ctx.beginPath(); ctx.ellipse(x, y + 132 * sc * 0.93, 70 * sc * (1 - J.h * 0.35), 14 * sc, 0, 0, TAU); ctx.fill();
        ctx.restore();
        withT(ctx, x, y - lift + s * 10, (i ? -1 : 1) * 0.05 * star, sc, sc * (1 - s * 0.04), () => LR.drawFigure(ctx, ch, pose, { t }));
      });
      sprinklerDrops(ctx, t);
      ctx.restore();

      LR.stickerText(ctx, Bc.yard, 960, 262, { t, t0: 16.9, size: 124, fill: C.lime, ink: C.ink, stagger: 0.045, rot: -0.03, print: LR.PRINT.dots('rgba(0,0,0,0)', 'rgba(255,255,255,.9)', 14, 2.6, 1), printAlpha: 0.3 });
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
