/* 17–22 s — Mix & Match: tops and bottoms clipped to a clothesline, each
 * look tagged for a fall getaway. One bottom swaps to make a matching set. */
(function (root) {
  const LR = root.LR;
  const { pop, prog, E, clamp, lerp } = LR;
  const COLS = [200, 540, 880];
  const TOPS = ['top-navy-knotted', 'top-bouquet-scoop', 'top-red-stripe-scoop'];
  const BOTS = ['bottom-navy-stripe', 'bottom-sky-gingham', 'bottom-red-stripe'];
  const LINE_T = 640, LINE_B = 975, SC = 0.78;
  LR.FALL_PIN_T = [17.45, 17.6, 17.75, 17.95, 18.1, 18.25];
  LR.FALL_TAG_T = [19.0, 19.35, 19.7];
  LR.FALL_SWAP_T = 20.5;

  const sag = (x, y0) => y0 + Math.sin((x / LR.W) * Math.PI) * 34;

  function hang(ctx, name, x, lineY, t, t0, seed) {
    const k = clamp((t - t0) / 0.55);
    if (k <= 0) return;
    const [, h] = LR.suitSize(name);
    const py = sag(x, lineY);
    const drop = (1 - E.outBack(k, 1.6)) * -260;
    const swing = Math.sin((t - t0) * 5 + seed) * 0.18 * Math.exp(-(t - t0) * 1.6) + Math.sin(t * 1.3 + seed) * 0.02;
    ctx.save();
    ctx.translate(x, py + drop);
    ctx.rotate(swing);
    LR.drawSuit(ctx, name, 0, (h * SC) / 2 - 18, { scale: SC, alpha: clamp(k * 4) });
    for (const dx of [-46, 46]) {
      ctx.fillStyle = '#C9A27C'; ctx.fillRect(dx - 7, -26, 14, 48);
      ctx.strokeStyle = 'rgba(70,45,25,.6)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(dx, -22); ctx.lineTo(dx, 18); ctx.stroke();
    }
    ctx.restore();
  }

  function tag(ctx, x, y, text, k, F) {
    if (k <= 0) return;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.sin(x) * 0.08);
    ctx.scale(Math.max(0.05, E.outBack(k, 1.5)), 1);
    ctx.strokeStyle = F.twine; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(-80, -10); ctx.quadraticCurveTo(-120, -60, -110, -100); ctx.stroke();
    LR.paper(ctx, [[-90, -34], [100, -34], [110, -24], [110, 34], [100, 44], [-90, 44], [-112, 5]], { fill: '#D9BF94', smooth: false, boil: 0, seed: 81, shadow: { blur: 10, x: 2, y: 6, a: 0.22 }, grain: 0.4 });
    ctx.fillStyle = F.latte; ctx.beginPath(); ctx.arc(-80, 5, 9, 0, Math.PI * 2); ctx.fill();
    LR.hand(ctx, text, 14, 6, { size: 40, color: F.ink, hold: true });
    ctx.restore();
  }

  LR.scene('clothesline', {
    start: 17.0, end: 22.0,
    get bg() { return LR.FALL.colors.oat; },
    draw(ctx, t) {
      const F = LR.FALL.colors, Cp = LR.FALL.copy;
      LR.leafField(ctx, t, { seed: 41, n: 14, size: [30, 62], speed: [60, 115], shadow: false, grain: 0.25 });
      LR.label(ctx, Cp.mix.toUpperCase(), 540, 315, { size: 104, weight: 700, family: 'Jost', tracking: 0.04, color: F.ink, t, t0: 17.15, stagger: 0.035 });
      LR.hand(ctx, Cp.mixSub, 540, 420, { size: 66, color: F.rust, t, t0: 17.5 });
      // twine lines
      for (const [ly, t0] of [[LINE_T, 17.2], [LINE_B, 17.35]]) {
        const pts = [];
        for (let i = 0; i <= 30; i++) { const x = -10 + (i / 30) * (LR.W + 20); pts.push([x, sag(x, ly)]); }
        LR.strokeTo(ctx, pts, E.inOutCubic(prog(t, t0, t0 + 0.45)), { color: F.twine, lw: 4 });
      }
      TOPS.forEach((n, i) => hang(ctx, n, COLS[i], LINE_T, t, LR.FALL_PIN_T[i], i + 1));
      BOTS.forEach((n, i) => {
        if (i === 1 && t >= LR.FALL_SWAP_T) {
          // the gingham bottom drops away; the matching bouquet bottom clips on
          const d = t - LR.FALL_SWAP_T;
          if (d < 0.6) {
            ctx.save(); ctx.globalAlpha = 1 - d / 0.6; ctx.translate(0, d * d * 2400);
            hang(ctx, n, COLS[i], LINE_B, t, LR.FALL_PIN_T[3 + i], 9);
            ctx.restore();
          }
          hang(ctx, 'bottom-bouquet', COLS[i], LINE_B, t, LR.FALL_SWAP_T + 0.12, 10);
        } else hang(ctx, n, COLS[i], LINE_B, t, LR.FALL_PIN_T[3 + i], 4 + i);
      });
      Cp.tags.forEach((txt, i) => tag(ctx, COLS[i] + 10, 1300, txt, clamp((t - LR.FALL_TAG_T[i]) / 0.4), F));
      LR.label(ctx, Cp.separates, 540, 1440, { size: 30, weight: 400, family: 'Poppins', tracking: 0.02, color: F.bark, t, t0: 18.6 });
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
