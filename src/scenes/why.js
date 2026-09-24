/* 20–25 s — 04 Why Lime Ricki. Three pillars from the brand's own words. */
(function (root) {
  const LR = root.LR;
  const { prog, E, clamp } = LR;
  const CARDS = [480, 960, 1440];
  LR.WHY_T0 = [20.5, 21.1, 21.7];

  // simple line icons, drawn progressively (k: 0..1)
  function icon(ctx, kind, x, y, k, color) {
    ctx.save();
    ctx.translate(x, y);
    ctx.strokeStyle = color; ctx.lineWidth = 4.5; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    const p = new Path2D();
    if (kind === 0) { // heart
      p.moveTo(0, 30); p.bezierCurveTo(-60, -8, -40, -52, 0, -26); p.bezierCurveTo(40, -52, 60, -8, 0, 30);
    } else if (kind === 1) { // spool of thread
      p.moveTo(-40, -36); p.lineTo(40, -36); p.moveTo(-40, 36); p.lineTo(40, 36);
      p.moveTo(-28, -36); p.lineTo(-28, 36); p.moveTo(28, -36); p.lineTo(28, 36);
      for (let yy = -22; yy <= 22; yy += 11) { p.moveTo(-28, yy); p.lineTo(28, yy + 5); }
      p.moveTo(28, 20); p.bezierCurveTo(56, 26, 60, 50, 44, 58);
    } else { // map pin
      p.moveTo(0, 40); p.bezierCurveTo(-18, 14, -36, -4, -36, -18); p.arc(0, -18, 36, Math.PI, 0); p.bezierCurveTo(36, -4, 18, 14, 0, 40);
      p.moveTo(12, -18); p.arc(0, -18, 12, 0, Math.PI * 2);
    }
    ctx.setLineDash([400]);
    ctx.lineDashOffset = 400 * (1 - k);
    ctx.stroke(p);
    ctx.restore();
  }

  LR.scene('why', {
    start: 20.0, end: 25.0,
    get bg() { return LR.C.cream; },
    draw(ctx, t) {
      const C = LR.C, B = LR.BRAND.copy;
      LR.kicker(ctx, B.whyKicker, 960, 170, { t, t0: 20.1, align: 'center' });
      LR.label(ctx, B.why, 960, 245, { size: 64, weight: 500, tracking: 0.12, upper: true, t, t0: 20.2, stagger: 0.025 });
      B.pillars.forEach(([title, body], i) => {
        const t0 = LR.WHY_T0[i];
        const k = E.outBack(clamp((t - t0) / 0.55), 1.2);
        if (k <= 0) return;
        const x = CARDS[i], y = 620 + (1 - k) * 80;
        ctx.save();
        ctx.globalAlpha = clamp((t - t0) / 0.25);
        LR.setShadow(ctx, { blur: 34, x: 0, y: 16, a: 0.12 });
        ctx.fillStyle = C.white;
        ctx.beginPath(); LR.trace(ctx, LR.rrectPts(x - 205, y - 245, 410, 490, 24, 6), true, false); ctx.fill();
        LR.noShadow(ctx);
        ctx.strokeStyle = 'rgba(150,173,214,.7)'; ctx.lineWidth = 2; ctx.setLineDash([10, 8]);
        ctx.beginPath(); LR.trace(ctx, LR.rrectPts(x - 187, y - 227, 374, 454, 16, 6), true, false); ctx.stroke();
        ctx.restore();
        icon(ctx, i, x, y - 118, E.inOutCubic(clamp((t - t0 - 0.25) / 0.7)), i === 1 ? C.periwinkle : C.red);
        LR.label(ctx, title, x, y + 8, { size: 26, weight: 500, tracking: 0.14, upper: true, t, t0: t0 + 0.3, stagger: 0.015 });
        LR.para(ctx, body, x, y + 78, { size: 25, align: 'center', maxW: 320, t, t0: t0 + 0.45 });
      });
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
