/* 10–16 s — 02 The Details. Callouts land on the cherry shoulder-tie
 * one-piece: ties, shelf bra, UPF 50+ fabric, mastectomy friendly. */
(function (root) {
  const LR = root.LR;
  const { prog, E, clamp } = LR;
  const SUIT = 'onepiece-cherry-tie', CX = 1010, CY = 590, SC = 1.12;
  const ART_C = [178, 298.5]; // artwork centre (px)
  const at = (ax, ay) => [CX + (ax - ART_C[0]) * SC, CY + (ay - ART_C[1]) * SC];
  // [anchor in artwork px, label x, label y, side, t0]
  const CALLOUTS = [
    [[282, 52], 1260, 330, 'R', 11.0],
    [[122, 212], 190, 470, 'L', 12.0],
    [[262, 330], 1260, 640, 'R', 13.0],
    [[112, 302], 190, 725, 'L', 14.0],
  ];
  LR.DETAIL_TIMES = CALLOUTS.map((c) => c[4]);

  LR.scene('details', {
    start: 10.0, end: 16.0,
    get bg() { return LR.C.blush; },
    draw(ctx, t) {
      const C = LR.C, B = LR.BRAND.copy;
      LR.kicker(ctx, B.detailsKicker, 190, 190, { t, t0: 10.15 });
      LR.label(ctx, B.details, 190, 262, { size: 72, weight: 500, tracking: 0.08, upper: true, align: 'left', t, t0: 10.25, stagger: 0.03 });

      const ink = E.outBack(clamp((t - 10.05) / 0.6), 1.3);
      LR.drawSuit(ctx, SUIT, CX, CY + (1 - ink) * 160, { scale: SC * (0.9 + 0.1 * ink), alpha: clamp((t - 10.05) / 0.25), t, sway: 3 });

      CALLOUTS.forEach(([anc, lx, ly, side, t0], i) => {
        const [title, sub] = B.callouts[i];
        const [ax, ay] = at(anc[0], anc[1]);
        const dot = E.outBack(clamp((t - t0) / 0.3), 2.2);
        if (dot <= 0) return;
        // label geometry
        ctx.save();
        ctx.font = LR.font(32, 600);
        const tw = Math.max(ctx.measureText(title).width, (ctx.font = LR.font(24, 400), ctx.measureText(sub).width));
        ctx.restore();
        const ex = side === 'R' ? lx - 22 : lx + tw + 22;
        const line = E.inOutCubic(clamp((t - t0 - 0.08) / 0.32));
        ctx.save();
        ctx.strokeStyle = C.ink; ctx.lineWidth = 2; ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(ax, ay);
        ctx.lineTo(ax + (ex - ax) * line, ay + (ly - ay) * line);
        ctx.stroke();
        ctx.fillStyle = C.white; ctx.beginPath(); ctx.arc(ax, ay, 11 * dot, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(ax, ay, 6.5 * dot, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        LR.label(ctx, title, lx, ly - 18, { size: 32, weight: 600, family: 'Poppins', align: 'left', color: C.ink, t, t0: t0 + 0.3, stagger: 0.012 });
        LR.para(ctx, sub, lx, ly + 24, { size: 24, t, t0: t0 + 0.42, dur: 0.5 });
      });
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
