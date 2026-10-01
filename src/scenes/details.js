/* 10–16 s — 02 The Details. Callouts land on the cherry shoulder-tie
 * one-piece: ties, shelf bra, UPF 50+ fabric, mastectomy friendly. */
(function (root) {
  const LR = root.LR;
  const { prog, E, clamp } = LR;
  const SUIT = 'onepiece-cherry-tie';
  const ART_C = [178, 298.5]; // artwork centre (px)
  // callouts: [anchor in artwork px, label x, label y, side, t0, index into BRAND.copy.callouts]
  const LAYOUT = {
    wide: {
      cx: 1010, cy: 590, sc: 1.12, kick: [190, 190], head: [190, 262, 72], subW: null,
      callouts: [
        [[282, 52], 1260, 330, 'R', 11.0, 0],
        [[122, 212], 190, 470, 'L', 12.0, 1],
        [[262, 330], 1260, 640, 'R', 13.0, 2],
        [[112, 302], 190, 725, 'L', 14.0, 3],
      ],
    },
    // tall: suit on the left, every label stacked on the right (lines never cross)
    tall: {
      cx: 330, cy: 930, sc: 1.0, kick: [120, 300], head: [120, 376, 80], subW: 400,
      callouts: [
        [[282, 52], 600, 640, 'R', 11.0, 0],
        [[235, 205], 600, 820, 'R', 12.0, 1],
        [[215, 262], 600, 1000, 'R', 13.0, 3],
        [[262, 400], 600, 1180, 'R', 14.0, 2],
      ],
    },
  };
  LR.DETAIL_TIMES = LAYOUT.wide.callouts.map((c) => c[4]);

  LR.scene('details', {
    start: 10.0, end: 16.0,
    get bg() { return LR.C.blush; },
    draw(ctx, t) {
      const C = LR.C, B = LR.BRAND.copy;
      const L = LR.tall() ? LAYOUT.tall : LAYOUT.wide;
      const at = (ax, ay) => [L.cx + (ax - ART_C[0]) * L.sc, L.cy + (ay - ART_C[1]) * L.sc];
      LR.kicker(ctx, B.detailsKicker, L.kick[0], L.kick[1], { t, t0: 10.15 });
      LR.label(ctx, B.details, L.head[0], L.head[1], { size: L.head[2], weight: 500, tracking: 0.08, upper: true, align: 'left', t, t0: 10.25, stagger: 0.03 });

      const ink = E.outBack(clamp((t - 10.05) / 0.6), 1.3);
      LR.drawSuit(ctx, SUIT, L.cx, L.cy + (1 - ink) * 160, { scale: L.sc * (0.9 + 0.1 * ink), alpha: clamp((t - 10.05) / 0.25), t, sway: 3 });

      L.callouts.forEach(([anc, lx, ly, side, t0, ci]) => {
        const [title, sub] = B.callouts[ci];
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
        LR.para(ctx, sub, lx, ly + 24, { size: 24, maxW: L.subW, t, t0: t0 + 0.42, dur: 0.5 });
      });
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
