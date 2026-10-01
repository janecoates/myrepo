/* 22–26 s — Every body. Every season. Three facts arrive on big cut-paper
 * maple leaves that flutter down and settle. */
(function (root) {
  const LR = root.LR;
  const { prog, E, clamp } = LR;
  // [x, y, rotation, leaf colour, text colour, t0]
  const LEAVES = [[372, 760, -0.22, 'rust', 'card', 22.3], [712, 1025, 0.2, 'mustard', 'ink', 22.8], [384, 1290, -0.1, 'burgundy', 'card', 23.3]];
  LR.FALL_FACT_T = LEAVES.map((l) => l[5]);

  LR.scene('facts', {
    start: 22.0, end: 26.0,
    get bg() { return LR.FALL.colors.olive; },
    draw(ctx, t) {
      const F = LR.FALL.colors, Cp = LR.FALL.copy;
      LR.leafField(ctx, t, { seed: 51, n: 14, size: [30, 62], speed: [60, 115], shadow: false, grain: 0.25, colors: [F.mustard, F.pumpkin, '#C9862F', F.oat] });
      LR.label(ctx, Cp.every1.toUpperCase(), 540, 300, { size: 84, weight: 700, family: 'Jost', tracking: 0.05, color: F.card, t, t0: 22.15, stagger: 0.03 });
      LR.label(ctx, Cp.every2.toUpperCase(), 540, 396, { size: 84, weight: 700, family: 'Jost', tracking: 0.05, color: F.card, t, t0: 22.45, stagger: 0.03 });
      // leaves first, then all the lettering on top so no leaf hides a fact
      const placed = [];
      LEAVES.forEach(([x, y, rot, lc, tc, t0], i) => {
        const k = clamp((t - t0) / 1.1);
        if (k <= 0) return;
        const e = E.outCubic(k), damp = 1 - E.outQuad(k);
        const px = x + Math.sin(k * Math.PI * 2 + i) * 120 * damp;
        const py = -400 + (y + 400) * e;
        const flip = Math.cos((t - t0) * 6 + i) * damp + (1 - damp);
        const r = rot + Math.sin(k * Math.PI * 2.5 + i) * 0.5 * damp;
        LR.leaf(ctx, px, py, 560, r, flip, 'maple', F[lc], { seed: 90 + i, shadow: { blur: 26, x: 6, y: 16, a: 0.32 } });
        placed.push([px, py, r, tc, t0, i]);
      });
      placed.forEach(([px, py, r, tc, t0, i]) => {
        const tk = clamp((t - t0 - 0.75) / 0.35);
        if (tk <= 0) return;
        const [big, small] = Cp.facts[i];
        ctx.save();
        ctx.translate(px, py - 30);
        ctx.rotate(r * 0.5);
        ctx.globalAlpha = tk;
        LR.label(ctx, big, 0, -14, { size: big.length > 8 ? 62 : 72, weight: 700, family: 'Jost', tracking: 0.03, color: F[tc], hold: true });
        LR.hand(ctx, small, 0, 50, { size: 46, color: F[tc], hold: true });
        ctx.restore();
      });
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
