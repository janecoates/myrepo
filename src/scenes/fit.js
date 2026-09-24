/* 25–30 s — Find your fit. The one-piece collection lines up under the
 * white script logo (as on the illustration artboard). */
(function (root) {
  const LR = root.LR;
  const { pop, prog, E, clamp } = LR;
  const ROW = ['onepiece-garden-tie', 'onepiece-marigold', 'onepiece-sky-gingham', 'onepiece-cherry-tie', 'onepiece-berry-stripe', 'onepiece-bouquet-corset', 'onepiece-red-stripe-keyhole'];
  LR.FIT_T0 = 25.25; LR.FIT_STEP = 0.1;

  LR.scene('fit', {
    start: 25.0, end: 30.01,
    get bg() { return LR.C.petal; },
    draw(ctx, t) {
      const C = LR.C, B = LR.BRAND.copy;
      ROW.forEach((name, i) => {
        const t0 = LR.FIT_T0 + i * LR.FIT_STEP;
        const k = E.outBack(clamp((t - t0) / 0.6), 1.4);
        if (k <= 0) return;
        const x = 300 + i * 220;
        LR.drawSuit(ctx, name, x, 585 + (1 - k) * 520, { scale: 0.53, rot: (i - 3) * 0.015, t, sway: 10 + i });
      });
      const rev = E.inOutCubic(prog(t, 25.95, 27.1));
      LR.drawLogo(ctx, 960, 212, 700, C.white, rev, { shadow: { blur: 10, x: 0, y: 3, a: 0.1 } });
      LR.label(ctx, B.cta, 960, 880, { size: 44, weight: 500, tracking: 0.32, upper: true, t, t0: 27.2, stagger: 0.03 });
      const r = E.outCubic(prog(t, 27.5, 28.0)) * 36;
      if (r > 0) { ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(960 - r, 922); ctx.lineTo(960 + r, 922); ctx.stroke(); }
      LR.label(ctx, LR.BRAND.url, 960, 966, { size: 30, weight: 400, family: 'Poppins', tracking: 0.04, color: C.text, t, t0: 27.6 });
      // final-chord sparkle on the logo
      if (t > 28.0) {
        const k = clamp((t - 28.0) / 0.9);
        [[640, 150, 22], [1290, 170, 26], [1180, 280, 16], [720, 290, 14]].forEach(([x, y, r2], i) => {
          const s = Math.sin(Math.min(1, k * 1.3 + i * 0.1) * Math.PI);
          LR.twinkle(ctx, x, y, r2 * s, C.white, 0.95);
        });
      }
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
