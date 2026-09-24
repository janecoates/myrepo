/* 0–4 s — "Hello, summer!"
 * Sunburst paper, a grinning sun, tumbling lime slices & cherries, the
 * headline slapped on like stickers, and three friends popping up out of
 * torn-paper waves to wave hello. */
(function (root) {
  const LR = root.LR;
  const { pop, E, prog, clamp, withT, lerp, rnd } = LR;
  const TAU = Math.PI * 2;

  function flyIn(t, t0, dur, from, to) {
    const k = clamp((t - t0) / dur);
    const e = E.outBack(k, 1.4);
    return [lerp(from[0], to[0], e), lerp(from[1], to[1], e), k];
  }

  LR.scene('intro', {
    start: 0, end: 4.0,
    draw(ctx, t) {
      const C = LR.C, B = LR.BRAND.copy;
      LR.bg(ctx, C.sun);
      ctx.save();
      LR.camera(ctx, 1 + t * 0.01, 960, 560);
      LR.sunburst(ctx, 960, 560, 18, C.sunPale, t * 0.07, 2400, 3);
      // halftone washes
      LR.halftoneWash(ctx, 0, 0, 760, 20, 6.5, 'rgba(255,120,60,.45)');
      LR.halftoneWash(ctx, 1920, 1080, 700, 20, 6, 'rgba(255,255,255,.4)');

      // sun
      const sp = pop(t, 0.1, 0.6);
      if (sp > 0) LR.sun(ctx, 1665, 185 + Math.sin(t * 2) * 6, 108, t, { scale: sp });

      // fruit tumbling in
      {
        const [x, y, k] = flyIn(t, 0.25, 0.7, [-260, -200], [240, 215]);
        if (k > 0) LR.limeSlice(ctx, x, y, 104, -2.4 * (1 - k) + t * 0.15, { seed: 300 });
      }
      {
        const [x, y, k] = flyIn(t, 0.45, 0.7, [2200, 420], [1730, 620]);
        if (k > 0) LR.limeSlice(ctx, x, y, 74, 2 * (1 - k) - t * 0.2, { seed: 330 });
      }
      {
        const [x, y, k] = flyIn(t, 0.6, 0.7, [-200, 820], [250, 590]);
        if (k > 0) LR.cherries(ctx, x, y, 1.15, -0.25 + (1 - k) * 1.5 + Math.sin(t * 2.5) * 0.05, {});
      }
      {
        const s = pop(t, 0.95, 0.5);
        if (s > 0) withT(ctx, 1545, 470, 0.3 + t * 0.1, s, s, () => LR.starfish(ctx, 0, 0, 44, 0, C.coral, 401));
      }
      {
        const s = pop(t, 1.05, 0.5);
        if (s > 0) withT(ctx, 480, 410, -0.2, s, s, () => LR.shell(ctx, 0, 0, 42, 0, C.pink, 411));
      }

      // headline
      LR.stickerText(ctx, 'Hello,', 690, 190, { t, t0: 0.5, size: 150, fill: C.navy, ink: C.ink, rot: -0.1, stagger: 0.05 });
      LR.stickerText(ctx, 'summer!', 950, 370, {
        t, t0: 0.8, size: 245, fill: C.coral, ink: C.ink, rot: -0.04, stagger: 0.06,
        print: LR.PRINT.stripes('rgba(255,255,255,0)', 'rgba(255,255,255,.9)', 10, 1),
        printAlpha: 0.22,
      });
      // sparkles around the headline
      const sparks = [[420, 120, 26], [1440, 520, 30], [560, 500, 20], [1310, 95, 18], [210, 420, 22]];
      sparks.forEach(([x, y, r], i) => {
        const s = pop(t, 1.3 + i * 0.08, 0.35);
        if (s > 0) LR.sparkle(ctx, x, y, r * s * (0.85 + 0.15 * Math.sin(t * 8 + i * 2)), i % 2 ? C.white : C.coral, 0, 30 + i);
      });

      // taped note
      const ns = pop(t, 1.7, 0.4);
      if (ns > 0) {
        withT(ctx, 960, 560, -0.025, ns, ns, () => {
          LR.paper(ctx, LR.tornRectPts(-330, -50, 660, 100, 21, 4, 12), { fill: C.cream, smooth: false, seed: 21, fringe: 3, shadow: 1 });
          LR.tape(ctx, -318, -40, 110, 34, -0.5, C.lime, { seed: 3, print: LR.PRINT.stripes('rgba(0,0,0,0)', 'rgba(255,255,255,.7)', 6, 1) });
          LR.tape(ctx, 320, 40, 110, 34, -0.45, C.pink, { seed: 4, print: LR.PRINT.dots('rgba(0,0,0,0)', 'rgba(255,255,255,.8)', 14, 2.5, 1) });
          LR.handText(ctx, B.helloNote, -8, 2, { t, t0: 1.85, dur: 0.75, size: 62, color: C.navy });
        });
      }
      const hk = pop(t, 2.6, 0.4);
      if (hk > 0) withT(ctx, 1320, 540, 0.2, hk, hk, () => LR.paper(ctx, LR.heartPts(26), { fill: C.coral, ink: C.ink, lw: 3, seed: 55, shadow: 0.6 }));

      // cast bobbing in the waves
      LR.waveStrip(ctx, 790, { fill: C.poolDeep, amp: 12, wl: 300, phase: t * 1.6, seed: 31, foam: 4 });
      const cast = [
        [LR.CAST.june, 560, 930, 1.25, 1.25],
        [LR.CAST.zuri, 960, 945, 1.3, 1.4],
        [LR.CAST.nia, 1370, 935, 1.25, 1.55],
      ];
      cast.forEach(([ch, x, y, sc, t0], i) => {
        const k = clamp((t - t0) / 0.5);
        if (k <= 0) return;
        const rise = (1 - E.outBack(k, 2)) * 320;
        const bob = Math.sin(t * 3.2 + i * 1.7) * 7;
        const wave = Math.sin(t * 11 + i) * 22;
        const pose = {
          shR: 128, elR: 46 + wave, shL: 25, elL: 30,
          mouth: i === 1 ? 'grin' : 'open', eyes: i === 2 ? 'happy' : 'open',
          head: Math.sin(t * 3 + i) * 5, hair: Math.sin(t * 4 + i) * 10,
        };
        withT(ctx, x, y + rise + bob, Math.sin(t * 2.5 + i) * 0.03, sc, sc, () => LR.drawFigure(ctx, ch, pose, { t }));
      });
      LR.waveStrip(ctx, 950, { fill: C.aqua, amp: 13, wl: 240, phase: -t * 2 + 1, seed: 32, foam: 5 });
      LR.waveStrip(ctx, 1025, { fill: C.pool, amp: 10, wl: 200, phase: t * 2.4 + 2, seed: 33, foam: 5, print: LR.PRINT.halftone('rgba(255,255,255,.35)', 14, 2.5) });
      ctx.restore();
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
