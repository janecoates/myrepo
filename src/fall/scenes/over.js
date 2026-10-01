/* 0–5 s — Summer's over. Swimsuits drift down like autumn leaves, then
 * "OVER." gets scribbled out: swim season isn't. */
(function (root) {
  const LR = root.LR;
  const { prog, E, clamp } = LR;
  const PILE = [
    ['onepiece-garden-tie', 300, 1235, -0.16, 0.6, 0.25, 1],
    ['top-navy-knotted', 720, 1120, 0.14, 0.72, 0.55, 2],
    ['onepiece-red-stripe-keyhole', 790, 1335, 0.12, 0.56, 0.85, 3],
    ['bottom-bouquet', 480, 1395, -0.06, 0.66, 1.15, 4],
  ];
  LR.FALL_PILE = PILE;

  LR.scene('over', {
    start: 0, end: 5.0,
    get bg() { return LR.FALL.colors.oat; },
    draw(ctx, t) {
      const F = LR.FALL.colors, Cp = LR.FALL.copy;
      LR.leafField(ctx, t, { seed: 11, n: 14, size: [30, 62], speed: [60, 115], shadow: false, grain: 0.25 });
      LR.drawLogo(ctx, 540, 300, 330, F.ink, E.inOutCubic(prog(t, 0.1, 0.9)));
      PILE.forEach(([name, x, y, rot, sc, t0, seed]) => LR.fallingSuit(ctx, t, name, x, y, sc, rot, t0, 1.6, seed));
      LR.label(ctx, Cp.over1.toUpperCase(), 540, 560, { size: 132, weight: 700, family: 'Jost', tracking: 0.03, color: F.ink, t, t0: 0.35, stagger: 0.04 });
      LR.label(ctx, Cp.over2.toUpperCase(), 540, 700, { size: 132, weight: 700, family: 'Jost', tracking: 0.03, color: F.ink, t, t0: 0.75, stagger: 0.05 });
      // scribble it out
      const zig = [];
      for (let i = 0; i <= 9; i++) zig.push([350 + i * 42, 690 + (i % 2 ? -26 : 22)]);
      LR.strokeTo(ctx, zig, E.inOutCubic(prog(t, 2.2, 2.6)), { color: F.pumpkin, lw: 13 });
      LR.hand(ctx, Cp.isnt, 560, 872, { size: 108, color: F.rust, rot: -0.06, t, t0: 2.65, stagger: 0.035 });
      const sw = [];
      for (let i = 0; i <= 24; i++) { const u = i / 24; sw.push([250 + u * 600, 950 - u * 30 + Math.sin(u * Math.PI) * 18]); }
      LR.strokeTo(ctx, sw, E.inOutCubic(prog(t, 3.4, 3.9)), { color: F.rust, lw: 7 });
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
