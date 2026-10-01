/* 11–17 s — Hot springs season: a vintage postcard of fall mountains and a
 * steaming spring. The swimsuit is the stamp; postmarked Salt Lake City. */
(function (root) {
  const LR = root.LR;
  const { pop, prog, E, clamp, rnd } = LR;
  const TAU = Math.PI * 2;
  const PC = [540, 860], PW = 820, PH = 1080;
  LR.FALL_STAMP_T = 13.6; LR.FALL_POSTMARK_T = 14.2;

  function ridge(x0, x1, base, peaks, seed) {
    const pts = [[x0, 600]];
    const n = 36;
    for (let i = 0; i <= n; i++) {
      const u = i / n, x = x0 + (x1 - x0) * u;
      let y = base;
      for (const [px, ph, pw] of peaks) y = Math.min(y, base - ph * Math.max(0, 1 - Math.abs(x - px) / pw));
      pts.push([x, y + (rnd(i, seed) - 0.5) * 8]);
    }
    pts.push([x1, 600]);
    return pts;
  }

  function scenery(ctx, t, F) {
    const rise = (t0) => (1 - E.outCubic(clamp((t - t0) / 0.7))) * 220;
    const g = ctx.createLinearGradient(0, -500, 0, 100);
    g.addColorStop(0, '#F7DDBB'); g.addColorStop(1, '#F0B98C');
    ctx.fillStyle = g; ctx.fillRect(-380, -510, 760, 1020);
    ctx.fillStyle = '#FBEBD0'; ctx.beginPath(); ctx.arc(150, -40 + rise(11.3) * 0.3, 70, 0, TAU); ctx.fill();
    ctx.save(); ctx.translate(0, rise(11.35));
    LR.paper(ctx, ridge(-400, 400, 60, [[-200, 300, 260], [120, 360, 300], [330, 240, 200]], 41), { fill: '#C9876A', smooth: false, boil: 0, seed: 41, grain: 0.3 });
    ctx.restore();
    ctx.save(); ctx.translate(0, rise(11.55));
    LR.paper(ctx, ridge(-400, 400, 170, [[-280, 250, 260], [40, 300, 280], [300, 220, 220]], 42), { fill: F.rust, smooth: false, boil: 0, seed: 42, grain: 0.3, shadow: { blur: 14, x: 0, y: -4, a: 0.2 } });
    for (let i = 0; i < 16; i++) {
      const x = -360 + rnd(i, 43) * 720, y = 40 + rnd(i, 44) * 120;
      ctx.fillStyle = i % 3 ? F.mustard : F.pumpkin;
      ctx.beginPath(); ctx.arc(x, y, 14 + rnd(i, 45) * 16, 0, TAU); ctx.fill();
    }
    ctx.restore();
    ctx.save(); ctx.translate(0, rise(11.75));
    LR.paper(ctx, ridge(-400, 400, 300, [[-300, 140, 240], [-40, 110, 260], [260, 160, 240]], 46), { fill: '#6F7444', smooth: false, boil: 0, seed: 46, grain: 0.3, shadow: { blur: 14, x: 0, y: -4, a: 0.2 } });
    for (let i = 0; i < 9; i++) {
      const x = -350 + i * 88 + rnd(i, 47) * 30, y = 200 + rnd(i, 48) * 50, h = 90 + rnd(i, 49) * 60;
      LR.paper(ctx, [[x, y - h], [x + h * 0.32, y], [x - h * 0.32, y]], { fill: i % 2 ? '#3E4A35' : F.burgundy, smooth: false, boil: 0, seed: 50 + i, grain: 0.3 });
    }
    ctx.restore();
    // the spring
    ctx.save(); ctx.translate(0, rise(12.0));
    ctx.fillStyle = '#7B6A5A'; ctx.fillRect(-380, 300, 760, 220);
    LR.paper(ctx, LR.ellipsePts(320, 118, 40, 51, 0.02).map(([x, y]) => [x, y + 380]), { fill: F.spring, seed: 51, boil: 0, grain: 0.25 });
    LR.paper(ctx, LR.ellipsePts(230, 70, 34, 52, 0.03).map(([x, y]) => [x, y + 372]), { fill: '#7CC4BC', seed: 52, boil: 0, grain: false });
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * TAU, x = Math.cos(a) * 330, y = 380 + Math.sin(a) * 128;
      LR.paper(ctx, LR.ellipsePts(34 + rnd(i, 53) * 16, 22 + rnd(i, 54) * 8, 12, 60 + i, 0.08).map(([px, py]) => [px + x, py + y]), { fill: i % 2 ? '#9C8B78' : '#857360', seed: 60 + i, boil: 0, grain: 0.3, shadow: { blur: 6, x: 1, y: 3, a: 0.25 } });
    }
    ctx.restore();
    // steam
    const sk = clamp((t - 12.2) / 0.6);
    if (sk > 0) {
      ctx.save();
      ctx.lineCap = 'round';
      for (let i = 0; i < 6; i++) {
        const x0 = -200 + i * 80, life = ((t * 0.35 + i * 0.37) % 1);
        ctx.strokeStyle = `rgba(255,255,255,${0.55 * sk * Math.sin(life * Math.PI)})`;
        ctx.lineWidth = 16 - life * 8;
        ctx.beginPath();
        for (let k = 0; k <= 16; k++) {
          const u = k / 16, y = 360 - u * 300 - life * 160;
          const x = x0 + Math.sin(u * 5 + t * 1.6 + i) * 24 * (0.4 + u);
          k ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function stamp(ctx, x, y, rot, s, F) {
    LR.withT(ctx, x, y, rot, s, s, () => {
      const w = 230, h = 280, r = 10;
      ctx.save();
      LR.setShadow(ctx, { blur: 14, x: 3, y: 8, a: 0.3 });
      ctx.fillStyle = '#FFFDF8';
      ctx.beginPath(); ctx.rect(-w / 2, -h / 2, w, h); ctx.fill();
      LR.noShadow(ctx);
      ctx.globalCompositeOperation = 'destination-out';
      for (let px = -w / 2; px <= w / 2 + 1; px += 23) for (const py of [-h / 2, h / 2]) { ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill(); }
      for (let py = -h / 2; py <= h / 2 + 1; py += 23) for (const px of [-w / 2, w / 2]) { ctx.beginPath(); ctx.arc(px, py, r, 0, TAU); ctx.fill(); }
      ctx.restore();
      ctx.fillStyle = '#96ADD6'; ctx.fillRect(-w / 2 + 20, -h / 2 + 20, w - 40, h - 40);
      LR.drawSuit(ctx, 'onepiece-cherry-tie', 0, -6, { scale: 0.3, shadow: null });
      ctx.fillStyle = '#FFFFFF'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = LR.font(30, 700, 'Jost'); ctx.fillText(LR.FALL.copy.stamp, 0, h / 2 - 44);
      ctx.font = LR.font(15, 500, 'Jost'); ctx.fillText('L I M E   R I C K I', 0, -h / 2 + 36);
    });
  }

  function postmark(ctx, x, y, k, F) {
    if (k <= 0) return;
    const s = 1 + (1 - E.outCubic(k)) * 0.2;
    ctx.save();
    ctx.translate(x, y); ctx.rotate(-0.18); ctx.scale(s, s);
    ctx.globalAlpha = 0.78 * Math.min(1, k * 3);
    ctx.strokeStyle = F.ink; ctx.fillStyle = F.ink; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, 0, 96, 0, TAU); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 62, 0, TAU); ctx.stroke();
    const txt = LR.FALL.copy.postmark;
    ctx.font = LR.font(20, 700, 'Jost'); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const chars = [...txt];
    chars.forEach((c, i) => { const a = -Math.PI / 2 + (i / chars.length) * TAU; ctx.save(); ctx.rotate(a + Math.PI / 2); ctx.fillText(c, 0, -79); ctx.restore(); });
    ctx.font = LR.font(34, 700, 'Jost'); ctx.fillText('FALL', 0, 2);
    for (let j = 0; j < 4; j++) {
      ctx.beginPath();
      for (let i = 0; i <= 30; i++) { const xx = -120 - i * 9, yy = -36 + j * 24 + Math.sin(i * 0.6) * 7; i ? ctx.lineTo(xx, yy) : ctx.moveTo(xx, yy); }
      ctx.stroke();
    }
    ctx.restore();
  }

  LR.scene('postcard', {
    start: 11.0, end: 17.0,
    get bg() { return LR.FALL.colors.rust; },
    draw(ctx, t) {
      const F = LR.FALL.colors, Cp = LR.FALL.copy;
      LR.leafField(ctx, t, { seed: 31, n: 14, size: [30, 62], speed: [60, 115], shadow: false, grain: 0.25, colors: [F.mustard, F.oat, F.pumpkin, '#E9C38A'] });
      const k = E.outBack(clamp((t - 10.9) / 0.65), 1.3);
      ctx.save();
      ctx.translate(PC[0], PC[1] + (1 - k) * 700);
      ctx.rotate(0.035 - (1 - k) * 0.35);
      LR.setShadow(ctx, { blur: 40, x: 8, y: 22, a: 0.35 });
      ctx.fillStyle = F.card;
      ctx.fillRect(-PW / 2, -PH / 2, PW, PH);
      LR.noShadow(ctx);
      ctx.save();
      ctx.beginPath(); ctx.rect(-PW / 2 + 30, -PH / 2 + 30, PW - 60, PH - 60); ctx.clip();
      scenery(ctx, t, F);
      ctx.restore();
      // retro title
      LR.hand(ctx, Cp.greet, -300, -420, { size: 64, color: '#FFFFFF', align: 'left', rot: -0.06, t, t0: 12.3 });
      for (const [txt, y, t0] of [[Cp.pc1, -318, 12.6], [Cp.pc2, -222, 12.9]]) {
        ctx.save(); ctx.translate(6, 6);
        LR.label(ctx, txt, 0, y, { size: 90, weight: 700, family: 'Jost', tracking: 0.03, color: F.burgundy, t, t0, stagger: 0.035 });
        ctx.restore();
        LR.label(ctx, txt, 0, y, { size: 90, weight: 700, family: 'Jost', tracking: 0.03, color: F.card, t, t0, stagger: 0.035 });
      }
      ctx.restore();
      const ss = LR.pop(t, LR.FALL_STAMP_T, 0.45);
      if (ss > 0) stamp(ctx, 840, 1290, 0.1, ss, F);
      postmark(ctx, 700, 1245, clamp((t - LR.FALL_POSTMARK_T) / 0.25), F);
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
