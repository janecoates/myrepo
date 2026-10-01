/* 0–4 s — Hello. The script logo writes itself on while the dashed cut line
 * traces the frame; the swim drawings pin up around it like a mood board. */
(function (root) {
  const LR = root.LR;
  const { pop, prog, E, clamp } = LR;

  // [art, x, y, scale, rotation, pin-up time]
  const LAYOUT = {
    wide: {
      board: [
        ['onepiece-garden-tie', 290, 590, 0.62, -0.1, 0.55],
        ['top-red-stripe-scoop', 610, 205, 0.6, 0.08, 0.7],
        ['bottom-sky-gingham', 1320, 205, 0.54, -0.07, 0.85],
        ['onepiece-cherry-tie', 1630, 600, 0.62, 0.09, 1.0],
        ['top-gingham-ruffle', 640, 885, 0.56, -0.05, 1.15],
        ['bottom-navy-stripe', 1290, 880, 0.56, 0.07, 1.3],
      ],
      cx: 960, logoY: 455, logoW: 860, tagY: 642, tagSize: 30, ruleY: 705,
    },
    tall: {
      board: [
        ['onepiece-garden-tie', 225, 480, 0.6, -0.1, 0.55],
        ['top-red-stripe-scoop', 540, 370, 0.6, 0.08, 0.7],
        ['onepiece-cherry-tie', 860, 490, 0.6, 0.09, 0.85],
        ['top-gingham-ruffle', 240, 1290, 0.56, -0.06, 1.0],
        ['onepiece-marigold', 545, 1320, 0.5, 0.04, 1.15],
        ['bottom-navy-stripe', 845, 1290, 0.56, 0.07, 1.3],
      ],
      cx: 540, logoY: 860, logoW: 880, tagY: 1030, tagSize: 34, ruleY: 1150, split: true,
    },
  };

  LR.scene('hello', {
    start: 0, end: 4.0,
    get bg() { return LR.C.blush; },
    draw(ctx, t) {
      const C = LR.C, B = LR.BRAND.copy;
      const L = LR.tall() ? LAYOUT.tall : LAYOUT.wide;
      ctx.save();
      LR.camera(ctx, 1 + t * 0.008, LR.W / 2, LR.H / 2);
      L.board.forEach(([name, x, y, sc, rot, t0], i) => {
        const s = pop(t, t0, 0.55);
        if (s <= 0) return;
        const drop = (1 - clamp((t - t0) / 0.4)) * 40;
        LR.drawSuit(ctx, name, x, y - drop, { scale: sc * (0.85 + 0.15 * s), alpha: clamp((t - t0) / 0.2), rot: rot + (1 - clamp((t - t0) / 0.5)) * 0.15, t, sway: i });
      });
      const rev = E.inOutCubic(prog(t, 0.3, 1.75));
      LR.drawLogo(ctx, L.cx, L.logoY, L.logoW, C.ink, rev);
      // tall frames break the tagline after its last comma
      const cut = B.hello.lastIndexOf(',');
      const lines = L.split && cut > 0 ? [B.hello.slice(0, cut + 1), B.hello.slice(cut + 1).trim()] : [B.hello];
      lines.forEach((ln, i) => LR.label(ctx, ln, L.cx, L.tagY + i * L.tagSize * 1.7, { size: L.tagSize, weight: 500, tracking: 0.28, upper: true, color: C.text, t, t0: 1.85 + i * 0.25, stagger: 0.016 }));
      const r = E.outCubic(prog(t, 2.4, 3.0)) * 70;
      if (r > 0) {
        ctx.strokeStyle = C.red; ctx.lineWidth = 3; ctx.lineCap = 'round';
        ctx.beginPath(); ctx.moveTo(L.cx - r, L.ruleY); ctx.lineTo(L.cx + r, L.ruleY); ctx.stroke();
      }
      ctx.restore();
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
