/* 10–16 s — "Catch every wave."
 * Layered torn-paper ocean. Tess rides in on a striped surfboard in a
 * long-sleeve rash guard and knee-length swim shorts; on the sand Kiki flies
 * a patchwork kite under a striped umbrella sky. */
(function (root) {
  const LR = root.LR;
  const { pop, E, prog, clamp, withT, lerp, rnd, keys } = LR;
  const TAU = Math.PI * 2;

  const S3 = { y: 600, amp: 18, wl: 330, speed: 1.9 };
  const waveY = (x, t) => S3.y + Math.sin((x / S3.wl) * TAU + t * S3.speed) * S3.amp;
  const waveSlope = (x, t) => Math.cos((x / S3.wl) * TAU + t * S3.speed) * S3.amp * TAU / S3.wl;
  const SURF_SC = 1.28;

  function surferX(t) {
    return keys([
      { t: 9.6, v: 2200 },
      { t: 12.0, v: 1300, e: E.outCubic },
      { t: 16.4, v: 900, e: (k) => k },
    ], t);
  }
  // little air off the lip of the wave, landing on the downbeat at 14.0
  const AIR0 = 13.45, AIR1 = 14.0;
  function air(t) {
    if (t < AIR0 || t > AIR1) return 0;
    return Math.sin(((t - AIR0) / (AIR1 - AIR0)) * Math.PI);
  }

  function gull(ctx, x, y, s, t, seed) {
    const f = Math.sin(t * 7 + seed) * 12;
    LR.ink(ctx, [[x - 34 * s, y - f * s], [x - 16 * s, y - 12 * s], [x, y + 2 * s]], { color: LR.C.ink, lw: 4, seed });
    LR.ink(ctx, [[x, y + 2 * s], [x + 16 * s, y - 12 * s], [x + 34 * s, y - f * s]], { color: LR.C.ink, lw: 4, seed: seed + 1 });
  }

  function kite(ctx, x, y, rot, t) {
    const C = LR.C;
    withT(ctx, x, y, rot, 1, 1, () => {
      const tail = [];
      for (let i = 0; i <= 9; i++) tail.push([Math.sin(t * 5 + i * 0.8) * (8 + i * 2.5), 100 + i * 30]);
      LR.ink(ctx, tail, { color: C.ink, lw: 3, seed: 950 });
      [2, 4, 6, 8].forEach((i, j) => {
        const [bx, by] = tail[i];
        withT(ctx, bx, by, Math.sin(t * 5 + i) * 0.4, 1, 1, () => {
          LR.paper(ctx, [[0, 0], [-20, -11], [-20, 11]], { fill: [C.coral, C.lime, C.sun, C.pink][j], ink: C.ink, lw: 2, seed: 960 + j, smooth: false, grain: false });
          LR.paper(ctx, [[0, 0], [20, -11], [20, 11]], { fill: [C.coral, C.lime, C.sun, C.pink][j], ink: C.ink, lw: 2, seed: 970 + j, smooth: false, grain: false });
        });
      });
      const T = [0, -92], R = [64, 0], B = [0, 112], L = [-64, 0], O = [0, 0];
      const sh = { blur: 12, x: 4, y: 8, a: 0.22 };
      LR.paper(ctx, [T, O, L], { fill: C.coral, ink: C.ink, lw: 3, seed: 940, smooth: false, shadow: sh });
      LR.paper(ctx, [T, R, O], { fill: C.sun, ink: C.ink, lw: 3, seed: 941, smooth: false, print: LR.PRINT.dots('rgba(0,0,0,0)', 'rgba(255,255,255,.6)', 16, 3, 1) });
      LR.paper(ctx, [O, R, B], { fill: C.lime, ink: C.ink, lw: 3, seed: 942, smooth: false });
      LR.paper(ctx, [L, O, B], { fill: C.aqua, ink: C.ink, lw: 3, seed: 943, smooth: false, print: LR.PRINT.stripes('rgba(0,0,0,0)', 'rgba(255,255,255,.5)', 8, 1) });
    });
  }

  function surfboard(ctx) {
    const C = LR.C;
    const pts = [];
    for (let i = 0; i <= 16; i++) { const a = -Math.PI / 2 + (i / 16) * Math.PI; pts.push([120 + Math.cos(a) * 70, Math.sin(a) * 13 - (i < 8 ? 0 : 0)]); }
    pts.push([-150, 12], [-162, 0], [-150, -12]);
    const path = LR.paper(ctx, pts, { fill: C.white, ink: C.ink, lw: 3.5, seed: 980, shadow: 1 });
    ctx.save();
    ctx.clip(path);
    ctx.fillStyle = C.coral; ctx.fillRect(-170, -20, 400, 9);
    ctx.fillStyle = C.lime; ctx.fillRect(-170, -2, 400, 6);
    ctx.restore();
    LR.paper(ctx, [[-120, 10], [-96, 34], [-86, 10]], { fill: C.navy, ink: C.ink, lw: 2.5, seed: 981, smooth: false });
  }

  LR.scene('beach', {
    start: 10.0, end: 16.0,
    draw(ctx, t) {
      const C = LR.C, Bc = LR.BRAND.copy;
      LR.bg(ctx, '#BDE6F3');
      const sx = surferX(t);
      ctx.save();
      LR.camera(ctx, 1.04 + prog(t, 9.7, 16.3) * 0.03, 960, 600, -(sx - 1200) * 0.05, 0);
      LR.halftoneWash(ctx, 0, 0, 800, 20, 6, 'rgba(255,255,255,.6)');
      LR.sun(ctx, 250, 175, 86, t);
      LR.cloud(ctx, 760 + t * 12, 150, 0.9, 21);
      LR.cloud(ctx, 1420 + t * 8, 105, 0.65, 22);
      LR.cloud(ctx, -120 + t * 16, 330, 0.55, 23);
      gull(ctx, 1180 - (t - 10) * 30, 250 + Math.sin(t * 1.3) * 12, 1, t, 31);
      gull(ctx, 1290 - (t - 10) * 26, 205 + Math.sin(t * 1.1 + 1) * 10, 0.8, t, 33);

      // ocean layers (far → near)
      LR.waveStrip(ctx, 430, { fill: '#2A74A0', amp: 5, wl: 160, phase: t * 0.8, seed: 41, foam: 3 });
      LR.waveStrip(ctx, 500, { fill: C.poolDeep, amp: 9, wl: 230, phase: -t * 1.2, seed: 42, foam: 4, print: LR.PRINT.halftone('rgba(255,255,255,.18)', 14, 2.4) });
      const s3 = [];
      for (let x = -60; x <= 1980; x += 14) s3.push([x, waveY(x, t) + (rnd(x, 43, 3) - 0.5) * 3]);
      s3.push([1980, 1140], [-60, 1140]);
      LR.paper(ctx, s3, { fill: C.pool, fringe: 6, smooth: false, seed: 43, shadow: { blur: 14, x: 0, y: -4, a: 0.2 } });

      // surfer
      const by = waveY(sx, t) - 6;
      const ang = Math.atan(waveSlope(sx, t)) * 0.8;
      // wake spray
      for (let i = 0; i < 40; i++) {
        const t0 = 9.8 + i * 0.16;
        if (t0 > t) break;
        const tx = surferX(t0) + 190, ty = waveY(surferX(t0) + 190, t0) - 6;
        LR.splash(ctx, tx, ty, t, t0, { n: 4, speed: 380, spread: 1.4, g: 1500, size: 9, life: 0.7, seed: 1000 + i * 7 });
      }
      const A = air(t);
      const tuck = A;
      withT(ctx, sx, by - A * 75, ang + A * 0.22 + (t > AIR0 && t < AIR1 ? Math.sin(((t - AIR0) / (AIR1 - AIR0)) * Math.PI * 2) * 0.15 : 0), 1, 1, () => {
        withT(ctx, 0, 0, 0, -1.15, 1.15, () => surfboard(ctx));
        const wob = Math.sin(t * 3.2) * 4;
        withT(ctx, 10, -112 * SURF_SC + tuck * 18, 0, -SURF_SC, SURF_SC, () => LR.drawFigure(ctx, LR.CAST.tess, {
          hipL: -28 + tuck * 18, knL: 12 + wob + tuck * 40, hipR: 30 + tuck * 12, knR: 30 - wob + tuck * 34, lean: 16 - tuck * 8, head: -10 - tuck * 6,
          shL: -62 + wob * 2 - tuck * 25, elL: -15, shR: 78 - wob * 2 + tuck * 22, elR: 12, mouth: tuck > 0.3 ? 'open' : 'grin', eyes: tuck > 0.3 ? 'happy' : 'open', hair: -18 - tuck * 30,
        }, { t, view: 'side' }));
      });
      if (A > 0.05) LR.speedLines(ctx, sx + 150, by - A * 75 - 40, Math.PI, 70, 3, 777, A);
      LR.splash(ctx, sx, by - 10, t, AIR0 - 0.02, { n: 14, speed: 700, spread: 1.6, g: 2000, size: 11, life: 0.8, seed: 1500 });
      LR.splash(ctx, sx, by - 10, t, AIR1, { n: 18, speed: 800, spread: 2.2, g: 2000, size: 12, life: 0.9, seed: 1530 });
      LR.ink(ctx, [[sx + 170, by + 8], [sx + 290, by + 22], [sx + 410, by + 18]], { color: '#fff', lw: 6, seed: 990 });

      LR.waveStrip(ctx, 700, { fill: C.aqua, amp: 12, wl: 260, phase: t * 2.2 + 1, seed: 44, foam: 6, chop: true });
      LR.waveStrip(ctx, 772, { fill: '#DDF5F7', amp: 7, wl: 190, phase: -t * 1.4, seed: 45, foam: 0, print: LR.PRINT.halftone('rgba(62,198,207,.25)', 12, 2.4) });
      // sand
      LR.waveStrip(ctx, 812, { fill: C.sand, amp: 6, wl: 420, phase: 0.6, seed: 46, foam: 0, jag: 5, print: LR.PRINT.dots('rgba(0,0,0,0)', 'rgba(170,120,60,.3)', 18, 2.2, 1), shadow: { blur: 16, x: 0, y: -4, a: 0.22 } });

      // beach set dressing
      withT(ctx, 1480, 965, -0.06, 1, 1, () => {
        LR.paper(ctx, LR.polyPts([[-190, -46], [170, -60], [200, 50], [-170, 64]], 47, 1.2, 30), { fill: '#FFF7F2', print: LR.PRINT.gingham(C.coral, '#FFF7F2', 16, 1), ink: C.ink, lw: 3, seed: 47, smooth: false, shadow: 1 });
      });
      LR.umbrella(ctx, 1600, 700, 0.95, 0.12, C.coral, C.white, 48);
      // sandcastle
      withT(ctx, 860, 930, 0, 1, 1, () => {
        LR.paper(ctx, LR.polyPts([[-120, 40], [120, 40], [100, -30], [-100, -30]], 49, 1.5, 20), { fill: '#EBC27D', ink: C.ink, lw: 3, seed: 49, smooth: false, shadow: 1 });
        for (const [x, h] of [[-70, 70], [0, 100], [70, 70]]) {
          LR.paper(ctx, LR.polyPts([[x - 28, -26], [x + 28, -26], [x + 28, -26 - h], [x + 14, -26 - h], [x + 14, -14 - h], [x, -14 - h], [x, -26 - h], [x - 14, -26 - h], [x - 14, -14 - h], [x - 28, -14 - h]].map(([a, b]) => [a, b]), 50 + x, 1, 14), { fill: '#EBC27D', ink: C.ink, lw: 3, seed: 50 + x, smooth: false, print: LR.PRINT.dots('rgba(0,0,0,0)', 'rgba(150,100,40,.3)', 12, 1.6, 1) });
        }
        LR.ink(ctx, [[0, -126], [0, -176]], { color: C.ink, lw: 3.5, seed: 52 });
        withT(ctx, 0, -176, 0, 1, 1, () => LR.paper(ctx, [[0, 0], [44 + Math.sin(t * 7) * 5, 10], [0, 22]], { fill: C.lime, ink: C.ink, lw: 2.5, seed: 53, smooth: false }));
      });
      LR.starfish(ctx, 1080, 1010, 30, 0.4, C.coral, 402);
      LR.shell(ctx, 650, 1030, 26, -0.3, C.pinkPale, 412);
      LR.shell(ctx, 1840, 1015, 22, 0.2, C.sunPale, 413);

      // Kiki + kite
      const kx = 370, ky = 915, ksc = 1.25;
      let kp;
      withT(ctx, kx, ky, 0, ksc, ksc, () => {
        kp = LR.drawFigure(ctx, LR.CAST.kiki, {
          shR: 150 + Math.sin(t * 2.2) * 6, elR: 12, shL: 30, elL: 50 + Math.sin(t * 4) * 10,
          hipL: 10, hipR: 14, knR: 8, mouth: 'open', eyes: 'happy', head: -8, lookX: 1,
        }, { t });
      });
      const hx = kx + kp.handR[0] * ksc, hy = ky + kp.handR[1] * ksc;
      const kiteX = 640 + Math.sin(t * 1.3) * 40, kiteY = 300 + Math.sin(t * 1.9) * 26;
      LR.ink(ctx, [[hx, hy], [(hx + kiteX) / 2 + 30, (hy + kiteY) / 2 + 60], [kiteX, kiteY + 20]], { color: C.ink, lw: 2, seed: 930, boil: 0.5 });
      kite(ctx, kiteX, kiteY, Math.sin(t * 1.6) * 0.18 + 0.15, t);
      ctx.restore();

      LR.stickerText(ctx, Bc.beach, 1010, 112, { t, t0: 10.9, size: 118, fill: C.coral, ink: C.ink, stagger: 0.04, rot: -0.025, print: LR.PRINT.stripes('rgba(0,0,0,0)', 'rgba(255,255,255,.9)', 8, 1), printAlpha: 0.22 });
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
