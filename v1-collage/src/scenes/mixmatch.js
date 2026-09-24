/* 22–26 s — "Mix. Match. Make a splash."
 * A paper-doll page. Rosa models a look; cut-out outfit cards (with little
 * fold tabs) fly onto her on each downbeat, swapping tops & bottoms, while
 * feature badges slap on around her: UPF 50+, stays put, XXS–4X, for women
 * by women. */
(function (root) {
  const LR = root.LR;
  const { pop, E, prog, clamp, withT, lerp, rnd } = LR;
  const TAU = Math.PI * 2;
  const DOLL = [960, 640], DOLL_SC = 1.8, CARD_SC = 1.25;
  const SWAPS = [23.0, 24.0, 25.0];
  const CARDS = [
    { look: 1, pos: [410, 575], rot: -0.14, appear: 22.15, fly: 22.62 },
    { look: 2, pos: [1510, 575], rot: 0.12, appear: 22.3, fly: 23.62 },
    { look: 3, pos: [410, 575], rot: -0.08, appear: 23.2, fly: 24.62 },
  ];
  const POSES = [
    { shR: 128, elR: 46, shL: 20, elL: 20, mouth: 'open' },
    { shL: 48, elL: -81, shR: 48, elR: -81, hipL: 9, hipR: 9, mouth: 'grin', eyes: 'happy' },
    { shL: 150, elL: 25, shR: 150, elR: 25, hipL: 12, hipR: 12, mouth: 'open', eyes: 'happy' },
    { shL: 48, elL: -81, shR: 140, elR: 30, hipL: 8, hipR: 6, mouth: 'grin', head: 8 },
  ];

  const cardCache = new Map();
  function outfitCard(look) {
    if (cardCache.has(look)) return cardCache.get(look);
    const W = 330, H = 360, ax = W / 2, ay = 205;
    const mk = LR.mkCanvas;
    const a = mk(W, H), g = a.getContext('2d');
    const ch = Object.assign({}, LR.CAST.rosa, { outfit: LR.LOOKS[look] });
    g.translate(ax, ay); g.scale(CARD_SC, CARD_SC);
    const saveBoil = LR.boil; LR.boil = 0;
    // fold tabs
    const D = LR.BUILD.curvy;
    for (const d of [-1, 1]) {
      LR.paper(g, [[d * 18, -D.T - 2], [d * 30, -D.T - 22], [d * 50, -D.T - 20], [d * 44, -D.T + 4]], { fill: '#FFFDF6', ink: LR.C.ink, lw: 2, seed: 2000 + d, smooth: false, grain: false });
      LR.paper(g, [[d * (D.Hp + 6), -4], [d * (D.Hp + 26), 2], [d * (D.Hp + 24), 24], [d * (D.Hp + 6), 22]], { fill: '#FFFDF6', ink: LR.C.ink, lw: 2, seed: 2010 + d, smooth: false, grain: false });
    }
    LR.drawFigure(g, ch, { shL: 22, elL: 6, shR: 22, elR: 6, hipL: 5, hipR: 5 }, { clothesOnly: true, t: 0 });
    LR.boil = saveBoil;
    // die-cut white border
    const b = mk(W, H), h = b.getContext('2d');
    const sil = mk(W, H), s = sil.getContext('2d');
    s.drawImage(a, 0, 0);
    s.globalCompositeOperation = 'source-in';
    s.fillStyle = '#FFFDF6';
    s.fillRect(0, 0, W, H);
    for (let i = 0; i < 20; i++) {
      const ang = (i / 20) * TAU;
      h.drawImage(sil, Math.cos(ang) * 11, Math.sin(ang) * 11);
    }
    h.drawImage(a, 0, 0);
    const card = { canvas: b, ax, ay };
    cardCache.set(look, card);
    return card;
  }

  function drawCard(ctx, look, x, y, rot, sc, shadow = 1) {
    const c = outfitCard(look);
    ctx.save();
    ctx.translate(x, y); ctx.rotate(rot); ctx.scale(sc, sc);
    LR.setShadow(ctx, { blur: 18 * shadow, x: 5 * shadow, y: 10 * shadow, a: 0.3 });
    ctx.drawImage(c.canvas, -c.ax, -c.ay);
    ctx.restore();
  }

  function badgeUPF(ctx, s) {
    const C = LR.C;
    LR.paper(ctx, LR.starPts(118, 0.8, 18), { fill: C.sun, ink: C.ink, lw: 3.5, seed: 2101, smooth: false, shadow: 1, print: LR.PRINT.halftone('rgba(255,140,40,.3)', 12, 2.6) });
    LR.paper(ctx, LR.circlePts(78, 28, 2102), { fill: C.white, ink: C.ink, lw: 3, seed: 2102 });
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = C.navy;
    ctx.font = LR.font('Titan One', 36); ctx.fillText('UPF', 0, -26);
    ctx.fillStyle = C.coral;
    ctx.font = LR.font('Titan One', 60); ctx.fillText('50+', 0, 20);
  }
  function badgeStays(ctx) {
    const C = LR.C;
    const pts = [];
    for (let i = 0; i < 72; i++) { const a = (i / 72) * TAU; const r = 112 + (i % 6 < 3 ? 6 : -2) * Math.sin(((i % 6) / 6) * Math.PI); pts.push([Math.cos(a) * r, Math.sin(a) * r]); }
    LR.paper(ctx, LR.circlePts(114, 40, 2201).map(([x, y], i) => { const a = Math.atan2(y, x); const k = 1 + 0.06 * Math.abs(Math.sin(a * 8)); return [x * k, y * k]; }), { fill: C.coral, ink: C.ink, lw: 3.5, seed: 2201, shadow: 1, print: LR.PRINT.dots('rgba(0,0,0,0)', 'rgba(255,255,255,.25)', 16, 3, 1) });
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = C.white;
    ctx.font = LR.font('Shrikhand', 44); ctx.fillText('Stays', 0, -20);
    ctx.font = LR.font('Shrikhand', 50); ctx.fillText('put!', 0, 30);
  }
  function badgeSizes(ctx) {
    const C = LR.C;
    const pts = [[-150, -50], [110, -50], [150, 0], [110, 50], [-150, 50]];
    LR.paper(ctx, LR.polyPts(pts, 2301, 1, 18), { fill: C.lime, ink: C.ink, lw: 3.5, seed: 2301, smooth: false, shadow: 1 });
    LR.paper(ctx, LR.circlePts(12, 12, 2302).map(([x, y]) => [x + 112, y]), { fill: '#FFFDF6', ink: C.ink, lw: 3, seed: 2302 });
    LR.ink(ctx, [[124, 0], [170, -30], [200, -10], [230, -50]], { color: C.ink, lw: 3, seed: 2303 });
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = C.navy;
    ctx.font = LR.font('Titan One', 50); ctx.fillText('XXS–4X', -22, 4);
    ctx.font = LR.font('Caveat Brush', 34);
    ctx.fillStyle = C.ink;
    ctx.fillText('every body', -20, 78);
  }
  function badgeWomen(ctx) {
    const C = LR.C;
    for (const d of [-1, 1]) LR.paper(ctx, [[d * 170, -10], [d * 250, -10], [d * 222, 30], [d * 250, 70], [d * 170, 70]], { fill: C.navy, ink: C.ink, lw: 3, seed: 2401 + d, smooth: false, shadow: 0.6 });
    LR.paper(ctx, LR.polyPts([[-200, -40], [200, -40], [200, 40], [-200, 40]], 2403, 1, 20), { fill: C.navy, ink: C.ink, lw: 3.5, seed: 2403, smooth: false, shadow: 1, print: LR.PRINT.stripes('rgba(0,0,0,0)', 'rgba(255,255,255,.08)', 6, 1) });
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillStyle = C.white;
    ctx.font = LR.font('Caveat Brush', 50);
    ctx.fillText('for women, by women', 0, 2);
  }

  LR.scene('mixmatch', {
    start: 22.0, end: 26.0,
    draw(ctx, t) {
      const C = LR.C, Bc = LR.BRAND.copy;
      LR.bg(ctx, '#FFE3E9', LR.PRINT.gingham(C.pink, '#FFF1F4', 34, 1));
      LR.halftoneWash(ctx, 1920, 1080, 800, 22, 6, 'rgba(255,107,87,.3)');
      // paper-doll page
      withT(ctx, 960, 600, -0.012, 1, 1, () => {
        LR.paper(ctx, LR.tornRectPts(-330, -420, 660, 830, 2501, 6, 14), { fill: C.cream, smooth: false, seed: 2501, fringe: 4, shadow: { blur: 30, x: 6, y: 14, a: 0.3 } });
        ctx.save();
        ctx.setLineDash([16, 12]);
        ctx.strokeStyle = 'rgba(42,35,64,.5)';
        ctx.lineWidth = 3;
        ctx.beginPath(); LR.trace(ctx, LR.rrectPts(-296, -386, 592, 762, 30, 6), true, false); ctx.stroke();
        ctx.restore();
        // tiny scissors doodle on the cut line
        withT(ctx, -296, -250, Math.PI / 2, 1, 1, () => {
          for (const d of [-1, 1]) {
            LR.ink(ctx, [[0, 0], [30, d * 10]], { color: C.ink, lw: 4, seed: 2510 + d });
            LR.ink(ctx, LR.circlePts(9, 10, 2512 + d).map(([x, y]) => [x - 10, y + d * 12]), { color: C.ink, lw: 3.5, closed: true, seed: 2512 + d });
          }
        });
        LR.tape(ctx, -300, -410, 150, 42, -0.6, C.lime, { seed: 7, print: LR.PRINT.stripes('rgba(0,0,0,0)', 'rgba(255,255,255,.6)', 6, 1) });
        LR.tape(ctx, 300, -410, 150, 42, 0.6, C.aqua, { seed: 8, print: LR.PRINT.dots('rgba(0,0,0,0)', 'rgba(255,255,255,.8)', 14, 2.5, 1) });
      });

      // the model
      const look = t < SWAPS[0] ? 0 : t < SWAPS[1] ? 1 : t < SWAPS[2] ? 2 : 3;
      const lastSwap = look === 0 ? 21.5 : SWAPS[look - 1];
      const pp = clamp((t - lastSwap) / 0.35);
      const squash = look === 0 ? 0 : (1 - E.outElastic(pp)) * 0.1;
      const rosa = Object.assign({}, LR.CAST.rosa, { outfit: LR.LOOKS[look] });
      const pose = Object.assign({}, POSES[look]);
      if (look === 0) pose.elR = 46 + Math.sin(t * 10) * 22;
      pose.head = (pose.head || 0) + Math.sin(t * 3) * 4;
      pose.hair = Math.sin(t * 2.5) * 10;
      const breath = Math.sin(t * 4) * 0.008;
      // ground shadow
      ctx.save(); ctx.fillStyle = 'rgba(80,40,30,.16)'; ctx.beginPath(); ctx.ellipse(DOLL[0], DOLL[1] + 228, 150, 22, 0, 0, TAU); ctx.fill(); ctx.restore();
      withT(ctx, DOLL[0], DOLL[1], 0, DOLL_SC * (1 + squash), DOLL_SC * (1 - squash + breath), () => LR.drawFigure(ctx, rosa, pose, { t }));
      // swap poof
      if (look > 0) {
        const d = t - lastSwap;
        if (d < 0.6) {
          for (let i = 0; i < 10; i++) {
            const a = (i / 10) * TAU + look;
            const r = 150 + E.outCubic(d / 0.6) * 170;
            const s = (1 - d / 0.6);
            LR.sparkle(ctx, DOLL[0] + Math.cos(a) * r, DOLL[1] - 120 + Math.sin(a) * r * 0.9, 24 * s + 4, i % 2 ? C.sun : C.white, a, 2600 + i);
          }
        }
      }

      // outfit cards: pop in beside the page, then fly onto the model
      for (const c of CARDS) {
        const swapT = c.fly + 0.38;
        if (t < c.appear || t >= swapT) continue;
        const s = pop(t, c.appear, 0.4);
        const k = clamp((t - c.fly) / (swapT - c.fly));
        const e = E.inOutCubic(k);
        const tx = DOLL[0], ty = DOLL[1];
        const x = lerp(c.pos[0], tx, e), y = lerp(c.pos[1], ty, e) - Math.sin(k * Math.PI) * 120;
        const rot = lerp(c.rot + Math.sin(t * 3 + c.look) * 0.03, 0, e) + Math.sin(k * Math.PI) * 0.25 * Math.sign(c.pos[0] - 960);
        const sc = lerp(1, DOLL_SC / CARD_SC, e) * s;
        drawCard(ctx, c.look, x, y, rot, sc, 1 + Math.sin(k * Math.PI));
      }

      // badges
      const badges = [
        [badgeUPF, 255, 255, -0.12, 22.4],
        [badgeStays, 1665, 250, 0.1, 23.4],
        [badgeSizes, 260, 885, -0.06, 24.4],
        [badgeWomen, 1620, 900, 0.05, 25.15],
      ];
      for (const [fn, x, y, r, t0] of badges) {
        const s = pop(t, t0, 0.42);
        if (s <= 0) continue;
        withT(ctx, x, y, r + LR.wobbleAfter(t, t0, 0.08, 3, 4), s, s, () => fn(ctx));
      }

      // headline
      LR.stickerText(ctx, Bc.mix.join(' '), 960, 92, { t, t0: 22.05, size: 92, fill: [C.navy], ink: C.ink, stagger: 0.03, rot: -0.015, print: LR.PRINT.dots('rgba(0,0,0,0)', 'rgba(255,255,255,.9)', 12, 2.2, 1), printAlpha: 0.25 });
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
