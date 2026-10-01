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
      const tall = LR.tall(), mid = LR.W / 2;
      // wide: one row of seven; tall: rows of four and three
      const L = tall
        ? { pos: [[195, 760], [425, 760], [655, 760], [885, 760], [310, 1110], [540, 1110], [770, 1110]], sc: 0.5, logo: [380, 820], cta: 1360, rule: 1402, url: 1446,
            sparks: [[200, 300, 22], [880, 320, 26], [770, 460, 16], [290, 470, 14]] }
        : { pos: ROW.map((_, i) => [300 + i * 220, 585]), sc: 0.53, logo: [212, 700], cta: 880, rule: 922, url: 966,
            sparks: [[640, 150, 22], [1290, 170, 26], [1180, 280, 16], [720, 290, 14]] };
      ROW.forEach((name, i) => {
        const t0 = LR.FIT_T0 + i * LR.FIT_STEP;
        const k = E.outBack(clamp((t - t0) / 0.6), 1.4);
        if (k <= 0) return;
        const [x, y] = L.pos[i];
        LR.drawSuit(ctx, name, x, y + (1 - k) * 520, { scale: L.sc, rot: (i - 3) * 0.015, t, sway: 10 + i });
      });
      const rev = E.inOutCubic(prog(t, 25.95, 27.1));
      LR.drawLogo(ctx, mid, L.logo[0], L.logo[1], C.white, rev, { shadow: { blur: 10, x: 0, y: 3, a: 0.1 } });
      LR.label(ctx, B.cta, mid, L.cta, { size: 44, weight: 500, tracking: 0.32, upper: true, t, t0: 27.2, stagger: 0.03 });
      const r = E.outCubic(prog(t, 27.5, 28.0)) * 36;
      if (r > 0) { ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(mid - r, L.rule); ctx.lineTo(mid + r, L.rule); ctx.stroke(); }
      LR.label(ctx, LR.BRAND.url, mid, L.url, { size: 30, weight: 400, family: 'Poppins', tracking: 0.04, color: C.text, t, t0: 27.6 });
      // final-chord sparkle on the logo
      if (t > 28.0) {
        const k = clamp((t - 28.0) / 0.9);
        L.sparks.forEach(([x, y, r2], i) => {
          const s = Math.sin(Math.min(1, k * 1.3 + i * 0.1) * Math.PI);
          LR.twinkle(ctx, x, y, r2 * s, C.white, 0.95);
        });
      }
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
