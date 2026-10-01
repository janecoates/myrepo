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
      const tall = LR.tall(), cx = LR.W / 2;
      // wide: suits flank the type; tall: suits sit below it
      const L = tall
        ? { s1: [320, 1255, 0.72, -0.08], s2: [760, 1255, 0.72, 0.08], kickY: 330, bigY: 470, big: 170, rows: [[0, 5], [5, 9]], rowY: [650, 740], subY: 860 }
        : { s1: [250, 640, 0.8, -0.1], s2: [1670, 640, 0.8, 0.1], kickY: 250, bigY: 420, big: 200, rows: [[0, 9]], rowY: [610], subY: 745 };
      const s1 = pop(t, 16.2, 0.55), s2 = pop(t, 16.35, 0.55);
      if (s1 > 0) LR.drawSuit(ctx, 'onepiece-sky-gingham', L.s1[0], L.s1[1], { scale: L.s1[2] * (0.85 + 0.15 * s1), rot: L.s1[3], alpha: clamp((t - 16.2) / 0.2), t, sway: 5 });
      if (s2 > 0) LR.drawSuit(ctx, 'onepiece-berry-stripe', L.s2[0], L.s2[1], { scale: L.s2[2] * (0.85 + 0.15 * s2), rot: L.s2[3], alpha: clamp((t - 16.35) / 0.2), t, sway: 6 });
      LR.kicker(ctx, B.sizesKicker, cx, L.kickY, { t, t0: 16.15, color: C.white, align: 'center' });
      LR.label(ctx, B.sizes, cx, L.bigY, { size: L.big, weight: 500, tracking: 0.04, color: C.white, t, t0: 16.3, stagger: 0.05, dur: 0.6 });
      // size chips
      ctx.save();
      ctx.font = LR.font(30, 500, 'Jost');
      const ws = B.sizeRun.map((s) => Math.max(92, ctx.measureText(s).width + 50));
      ctx.restore();
      const gap = 16;
      const chips = [];
      L.rows.forEach(([a, b], r) => {
        const row = ws.slice(a, b);
        let x = cx - (row.reduce((p, q) => p + q, 0) + gap * (row.length - 1)) / 2;
        row.forEach((w, j) => { chips[a + j] = [x + w / 2, L.rowY[r]]; x += w + gap; });
      });
      B.sizeRun.forEach((s, i) => {
        const t0 = LR.SIZE_T0 + i * LR.SIZE_STEP;
        const k = pop(t, t0, 0.4);
        const w = ws[i], [chipX, chipY] = chips[i];
        if (k <= 0) return;
        ctx.save();
        ctx.translate(chipX, chipY);
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
      LR.para(ctx, B.sizesSub, cx, L.subY, { size: 34, align: 'center', color: C.white, t, t0: 18.75 });
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
