/* 4–10 s — 01 Mix & Match. Tops and bottoms swap on the beat, cycling
 * through combinations and landing on a matching set. */
(function (root) {
  const LR = root.LR;
  const { pop, prog, E, clamp, lerp } = LR;

  const TOPS = ['top-navy-knotted', 'top-red-stripe-scoop', 'top-gingham-ruffle', 'top-teal-stripe-scoop', 'top-bouquet-scoop'];
  const BOTS = ['bottom-navy-stripe', 'bottom-red-stripe', 'bottom-sky-gingham', 'bottom-teal-stripe', 'bottom-bouquet'];
  // [time, slot, index] — lands on 8ths of the bar; ends on the bouquet set
  const SWAPS = [[5.5, 'T', 1], [6.0, 'B', 2], [6.5, 'T', 2], [7.0, 'B', 0], [7.5, 'T', 3], [8.0, 'B', 3], [8.5, 'T', 4], [8.75, 'B', 4]];
  LR.MIX_SWAPS = SWAPS;
  const TOP_Y = 372, BOT_Y = 690, SX = 1330, SC = 0.98;

  function slot(kind, t) {
    let cur = 0, prev = null, at = -1;
    for (const [tt, k, i] of SWAPS) if (k === kind && t >= tt) { prev = cur; cur = i; at = tt; }
    return { cur, prev, k: at < 0 ? 1 : clamp((t - at) / 0.42) };
  }

  function drawSlot(ctx, list, st, y, t, seed) {
    if (st.prev != null && st.k < 1) {
      const e = E.inCubic(st.k);
      LR.drawSuit(ctx, list[st.prev], SX - e * 420, y + e * 30, { scale: SC, rot: -e * 0.3, alpha: 1 - e, t, sway: seed });
      const f = E.outBack(st.k, 1.4);
      LR.drawSuit(ctx, list[st.cur], lerp(SX + 440, SX, f), y, { scale: SC, rot: (1 - f) * 0.3, alpha: clamp(st.k * 3), t, sway: seed });
    } else {
      LR.drawSuit(ctx, list[st.cur], SX, y, { scale: SC, t, sway: seed });
    }
  }

  LR.scene('mixmatch', {
    start: 4.0, end: 10.0,
    get bg() { return LR.C.paper; },
    draw(ctx, t) {
      const C = LR.C, B = LR.BRAND.copy;
      // left column copy
      LR.kicker(ctx, B.mixKicker, 190, 300, { t, t0: 4.2 });
      LR.label(ctx, B.mix, 190, 384, { size: 92, weight: 500, tracking: 0.08, upper: true, align: 'left', t, t0: 4.3, stagger: 0.03 });
      LR.para(ctx, B.mixSub, 192, 488, { size: 34, maxW: 640, t, t0: 4.75 });
      LR.label(ctx, B.mixMath, 192, 650, { size: 34, weight: 500, family: 'Poppins', tracking: 0.01, align: 'left', color: C.red, t, t0: 6.9, stagger: 0.02 });

      // outfit card
      const cardK = E.outCubic(prog(t, 4.05, 4.6));
      if (cardK > 0) {
        ctx.save();
        ctx.globalAlpha = cardK;
        LR.setShadow(ctx, { blur: 30, x: 0, y: 14, a: 0.1 });
        ctx.fillStyle = C.blush;
        ctx.beginPath(); LR.trace(ctx, LR.rrectPts(1060, 170 + (1 - cardK) * 30, 540, 730, 26, 6), true, false); ctx.fill();
        LR.noShadow(ctx);
        ctx.restore();
        LR.label(ctx, 'Top', 1082, 212, { size: 20, weight: 500, tracking: 0.35, upper: true, align: 'left', color: C.periwinkle, t, t0: 4.5 });
        LR.label(ctx, 'Bottom', 1082, 548, { size: 20, weight: 500, tracking: 0.35, upper: true, align: 'left', color: C.periwinkle, t, t0: 4.6 });
      }
      // slots
      const inK = E.outBack(clamp((t - 4.35) / 0.5), 1.3);
      if (inK > 0) {
        ctx.save();
        ctx.translate(0, (1 - inK) * -500);
        drawSlot(ctx, TOPS, slot('T', t), TOP_Y, t, 1);
        ctx.restore();
      }
      const inB = E.outBack(clamp((t - 4.5) / 0.5), 1.3);
      if (inB > 0) {
        ctx.save();
        ctx.translate(0, (1 - inB) * 500);
        drawSlot(ctx, BOTS, slot('B', t), BOT_Y, t, 2);
        ctx.restore();
      }
      // matching set moment
      if (t > 8.85) {
        const k = clamp((t - 8.85) / 0.6);
        for (let i = 0; i < 5; i++) {
          const a = i * 1.3 + 0.4, rr = 300 + i * 18;
          LR.twinkle(ctx, SX + Math.cos(a) * rr * 0.9, 530 + Math.sin(a) * rr, 18 * Math.sin(Math.min(1, k * 1.2) * Math.PI) + 2, i % 2 ? C.red : C.periwinkle, 1 - Math.max(0, k - 0.8) * 5);
        }
        LR.label(ctx, B.mixSet, SX, 945, { size: 26, weight: 400, family: 'Poppins', tracking: 0.02, color: C.text, t, t0: 9.0 });
      }
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
