/* 26–30 s — swim season, all year. Logo writes on over rust paper; the
 * suits fan out below; one last flurry of leaves on the final chord. */
(function (root) {
  const LR = root.LR;
  const { prog, E, clamp } = LR;
  const FAN = ['onepiece-garden-tie', 'onepiece-marigold', 'onepiece-cherry-tie', 'onepiece-bouquet-corset', 'onepiece-red-stripe-keyhole'];
  LR.FALL_FAN_T = 26.25;

  LR.scene('fallEnd', {
    start: 26.0, end: 30.01,
    get bg() { return LR.FALL.colors.rust; },
    draw(ctx, t) {
      const F = LR.FALL.colors, Cp = LR.FALL.copy;
      LR.leafField(ctx, t, { seed: 61, n: 14, size: [30, 62], speed: [60, 115], shadow: false, grain: 0.25, colors: [F.mustard, F.oat, F.pumpkin, F.burgundy] });
      LR.hand(ctx, Cp.allYear, 540, 560, { size: 92, color: F.oat, rot: -0.04, t, t0: 26.3 });
      LR.drawLogo(ctx, 540, 770, 860, F.card, E.inOutCubic(prog(t, 26.6, 27.7)), { shadow: { blur: 12, x: 0, y: 4, a: 0.18 } });
      LR.label(ctx, Cp.cta, 540, 965, { size: 44, weight: 500, tracking: 0.32, upper: true, color: F.card, t, t0: 27.6, stagger: 0.03 });
      const r = E.outCubic(prog(t, 27.9, 28.3)) * 36;
      if (r > 0) { ctx.strokeStyle = F.mustard; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(540 - r, 1008); ctx.lineTo(540 + r, 1008); ctx.stroke(); }
      LR.label(ctx, LR.BRAND.url, 540, 1052, { size: 30, weight: 400, family: 'Poppins', tracking: 0.04, color: F.oat, t, t0: 28.0 });
      FAN.forEach((name, i) => {
        const t0 = LR.FALL_FAN_T + i * 0.09;
        const k = E.outBack(clamp((t - t0) / 0.6), 1.4);
        if (k <= 0) return;
        const u = i - 2;
        LR.drawSuit(ctx, name, 540 + u * 165, 1330 + Math.abs(u) * 26 + (1 - k) * 500, { scale: 0.4, rot: u * 0.09, t, sway: 20 + i });
      });
      if (t > 27.9) {
        ctx.save();
        ctx.globalAlpha = clamp((t - 27.9) / 0.6);
        LR.leafField(ctx, t, { seed: 71, n: 12, size: [40, 70], speed: [140, 220] });
        ctx.restore();
      }
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
