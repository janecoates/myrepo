/* 16–20 s — 03 XXS – 4X. The size run chips in on eighth notes. */
(function (root) {
  const LR = root.LR;
  const { pop, prog, E, clamp } = LR;
  LR.SIZE_T0 = 16.8; LR.SIZE_STEP = 0.22;

  LR.scene('sizes', {
    start: 16.0, end: 20.0,
    get bg() { return LR.C.periwinkle; },
    draw(ctx, t) {
      const C = LR.C, B = LR.BRAND.copy;
      const s1 = pop(t, 16.2, 0.55), s2 = pop(t, 16.35, 0.55);
      if (s1 > 0) LR.drawSuit(ctx, 'onepiece-sky-gingham', 250, 640, { scale: 0.8 * (0.85 + 0.15 * s1), rot: -0.1, alpha: clamp((t - 16.2) / 0.2), t, sway: 5 });
      if (s2 > 0) LR.drawSuit(ctx, 'onepiece-berry-stripe', 1670, 640, { scale: 0.8 * (0.85 + 0.15 * s2), rot: 0.1, alpha: clamp((t - 16.35) / 0.2), t, sway: 6 });
      LR.kicker(ctx, B.sizesKicker, 960, 250, { t, t0: 16.15, color: C.white, align: 'center' });
      LR.label(ctx, B.sizes, 960, 420, { size: 200, weight: 500, tracking: 0.04, color: C.white, t, t0: 16.3, stagger: 0.05, dur: 0.6 });
      // size chips
      ctx.save();
      ctx.font = LR.font(30, 500, 'Jost');
      const ws = B.sizeRun.map((s) => Math.max(92, ctx.measureText(s).width + 50));
      ctx.restore();
      const gap = 16, total = ws.reduce((a, b) => a + b, 0) + gap * (ws.length - 1);
      let x = 960 - total / 2;
      B.sizeRun.forEach((s, i) => {
        const t0 = LR.SIZE_T0 + i * LR.SIZE_STEP;
        const k = pop(t, t0, 0.4);
        const w = ws[i], cx = x + w / 2;
        x += w + gap;
        if (k <= 0) return;
        ctx.save();
        ctx.translate(cx, 610);
        ctx.scale(k, k);
        LR.setShadow(ctx, { blur: 14, x: 0, y: 6, a: 0.14 });
        ctx.fillStyle = C.white;
        ctx.beginPath(); LR.trace(ctx, LR.rrectPts(-w / 2, -32, w, 64, 32, 6), true, false); ctx.fill();
        LR.noShadow(ctx);
        ctx.fillStyle = C.ink;
        ctx.font = LR.font(30, 500, 'Jost');
        ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(s, 0, 2);
        ctx.restore();
      });
      LR.para(ctx, B.sizesSub, 960, 745, { size: 34, align: 'center', color: C.white, t, t0: 18.75 });
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
