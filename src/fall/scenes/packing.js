/* 5–11 s — Fall break packing list. Items write on and get ticked; the
 * Lime Ricki suit gets pinned to the list (UPF 50+ fabric, too!). */
(function (root) {
  const LR = root.LR;
  const { pop, prog, E, clamp, rnd } = LR;
  const NOTE = [540, 900], ROT = -0.03;
  const ITEM_T = [5.6, 6.4, 7.2, 8.0];
  LR.FALL_ITEM_T = ITEM_T;

  function checkbox(ctx, x, y, k, F) {
    ctx.save();
    ctx.strokeStyle = F.ink; ctx.lineWidth = 3.5; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x - 22, y - 21); ctx.lineTo(x + 23, y - 23); ctx.lineTo(x + 21, y + 22); ctx.lineTo(x - 23, y + 21); ctx.closePath(); ctx.stroke();
    ctx.restore();
    LR.strokeTo(ctx, [[x - 18, y - 2], [x - 4, y + 16], [x + 30, y - 34]], k, { color: F.rust, lw: 8 });
  }

  function sweater(ctx, x, y, s, rot, F) {
    LR.withT(ctx, x, y, rot, s, s, () => {
      const body = [[-90, -100], [-40, -112], [0, -96], [40, -112], [90, -100], [170, 40], [130, 64], [96, -10], [96, 120], [-96, 120], [-96, -10], [-130, 64], [-170, 40]];
      LR.paper(ctx, body, { fill: F.mustard, smooth: false, seed: 701, shadow: { blur: 16, x: 4, y: 10, a: 0.22 }, print: LR.PRINT.vstripes('rgba(0,0,0,0)', 'rgba(120,70,10,.18)', 10, 1) });
      ctx.fillStyle = 'rgba(120,70,10,.3)';
      ctx.fillRect(-96, 100, 192, 20);
      ctx.beginPath(); ctx.ellipse(0, -100, 34, 12, 0, 0, Math.PI * 2); ctx.fill();
    });
  }
  function boot(ctx, x, y, s, rot, F) {
    LR.withT(ctx, x, y, rot, s, s, () => {
      LR.paper(ctx, [[-40, -110], [30, -110], [32, 20], [110, 40], [118, 90], [-44, 90]], { fill: F.bark, smooth: true, seed: 702, shadow: { blur: 14, x: 4, y: 8, a: 0.22 } });
      ctx.strokeStyle = F.mustard; ctx.lineWidth = 4;
      for (let i = 0; i < 4; i++) { ctx.beginPath(); ctx.moveTo(-20, -80 + i * 24); ctx.lineTo(16, -86 + i * 24); ctx.stroke(); }
      ctx.fillStyle = '#2E2019'; ctx.fillRect(-46, 78, 166, 14);
    });
  }

  LR.scene('packing', {
    start: 5.0, end: 11.0,
    get bg() { return LR.FALL.colors.latte; },
    draw(ctx, t) {
      const F = LR.FALL.colors, Cp = LR.FALL.copy;
      LR.leafField(ctx, t, { seed: 21, n: 14, size: [30, 62], speed: [60, 115], shadow: false, grain: 0.25 });
      const inK = E.outBack(clamp((t - 4.8) / 0.6), 1.2);
      ctx.save();
      ctx.translate(NOTE[0], NOTE[1] + (1 - inK) * 300);
      ctx.rotate(ROT + (1 - inK) * 0.12);
      // notepad
      const pts = [...LR.tornLine(-400, -460, 400, -460, 31, 7, 14, false), [400, -460], [400, 330], [-400, 330]];
      LR.paper(ctx, pts, { fill: '#FFFCF5', smooth: false, seed: 31, boil: 0, shadow: { blur: 30, x: 6, y: 16, a: 0.25 }, grain: 0.35 });
      ctx.strokeStyle = 'rgba(120,160,200,.35)'; ctx.lineWidth = 2;
      for (let y = -300; y < 300; y += 92) { ctx.beginPath(); ctx.moveTo(-400, y + 46); ctx.lineTo(400, y + 46); ctx.stroke(); }
      ctx.strokeStyle = 'rgba(220,90,80,.5)';
      ctx.beginPath(); ctx.moveTo(-310, -460); ctx.lineTo(-310, 330); ctx.stroke();
      LR.tape(ctx, -330, -470, 170, 50, -0.4, F.mustard, { seed: 4, alpha: 0.8 });
      LR.tape(ctx, 330, -470, 170, 50, 0.4, F.pumpkin, { seed: 5, alpha: 0.8 });
      LR.hand(ctx, Cp.listTitle, -270, -350, { size: 76, align: 'left', t, t0: 5.15, stagger: 0.03 });
      LR.strokeTo(ctx, [[-270, -308], [-30, -312], [180, -306]], E.inOutCubic(prog(t, 5.6, 6.0)), { color: F.rust, lw: 5 });
      Cp.list.forEach((item, i) => {
        const y = -180 + i * 128;
        const t0 = ITEM_T[i];
        if (t < t0 - 0.1) return;
        checkbox(ctx, -248, y, E.outCubic(prog(t, t0 + 0.45, t0 + 0.7)), F);
        LR.hand(ctx, item, -195, y, { size: 66, weight: 500, align: 'left', t, t0, stagger: 0.025 });
      });
      ctx.restore();
      // things that get packed
      const s1 = LR.pop(t, 6.05, 0.45);
      if (s1 > 0) sweater(ctx, 230, 1420, 0.95 * s1, -0.14, F);
      const s2 = LR.pop(t, 6.85, 0.45);
      if (s2 > 0) boot(ctx, 470, 1450, 0.9 * s2, 0.08, F);
      const s3 = LR.pop(t, 7.65, 0.5);
      if (s3 > 0) {
        LR.drawSuit(ctx, 'onepiece-marigold', 905, 1000, { scale: 0.5 * (0.85 + 0.15 * s3), rot: 0.14, alpha: clamp((t - 7.65) / 0.15), t, sway: 7 });
        // paperclip
        LR.withT(ctx, 880, 845, 0.2, 1, 1, () => {
          ctx.strokeStyle = '#9AA3AE'; ctx.lineWidth = 6; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(-10, 40); ctx.lineTo(-10, -30); ctx.arc(4, -30, 14, Math.PI, 0); ctx.lineTo(18, 50); ctx.arc(4, 50, 14, 0, Math.PI); ctx.lineTo(-10, -12); ctx.stroke();
        });
      }
      LR.hand(ctx, Cp.upfNote, 780, 1300, { size: 56, color: F.rust, rot: -0.08, t, t0: 8.7 });
      LR.strokeTo(ctx, [[880, 1255], [930, 1230], [955, 1190]], E.inOutCubic(prog(t, 9.2, 9.5)), { color: F.rust, lw: 5 });
      LR.strokeTo(ctx, [[935, 1205], [955, 1190], [962, 1214]], E.inOutCubic(prog(t, 9.45, 9.6)), { color: F.rust, lw: 5 });
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
