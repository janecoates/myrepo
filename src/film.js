/* Timeline & compositor.
 *   0 –  4  Hello        script logo writes on; cut-out suits pin up around it
 *   4 – 10  01 Mix & Match   tops and bottoms swap on the beat → matching set
 *  10 – 16  02 The Details   callouts on a shoulder-tie one-piece
 *  16 – 20  03 XXS – 4X      the size run
 *  20 – 25  04 Why Lime Ricki   18+ years of swim · responsibly made · designed in USA
 *  25 – 30  Find your fit    the collection lines up under the logo
 * Scenes change with a clean paper-sheet slide on the downbeat; a dashed
 * "cut here" frame (from the illustration artboards) holds it all together. */
(function (root) {
  const LR = root.LR;
  const { clamp, E, setShadow, noShadow } = LR;
  const W = LR.W, H = LR.H;

  LR.SCENES = [];
  LR.scene = (id, def) => { LR.SCENES.push(Object.assign({ id }, def)); };

  LR.TRANSITIONS = [
    { at: 4.0, from: 'right', dur: 0.75 },
    { at: 10.0, from: 'right', dur: 0.75 },
    { at: 16.0, from: 'bottom', dur: 0.75 },
    { at: 20.0, from: 'right', dur: 0.75 },
    { at: 25.0, from: 'bottom', dur: 0.75 },
  ];

  function sceneAt(t) {
    for (const s of LR.SCENES) if (t >= s.start && t < s.end) return s;
    return t < LR.SCENES[0].start ? LR.SCENES[0] : LR.SCENES[LR.SCENES.length - 1];
  }
  function drawScene(ctx, s, t) {
    ctx.save();
    ctx.fillStyle = s.bg || LR.C.blush;
    ctx.fillRect(-10, -10, W + 20, H + 20);
    s.draw(ctx, t);
    ctx.restore();
  }

  function renderFrame(ctx, t) {
    const scale = ctx.canvas.width / W;
    LR.pxScale = scale;
    LR.boil = Math.floor(t * LR.FPS_BOIL);
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = 'source-over';

    // transition windows start a little before the downbeat and land on it
    const tr = LR.TRANSITIONS.find((x) => t >= x.at - x.dur * 0.55 && t < x.at + x.dur * 0.45);
    if (tr) {
      const A = LR.SCENES.find((s) => Math.abs(s.end - tr.at) < 1e-6);
      const B = LR.SCENES.find((s) => Math.abs(s.start - tr.at) < 1e-6);
      const k = clamp((t - (tr.at - tr.dur * 0.55)) / tr.dur);
      const e = E.inOutCubic(k);
      const horiz = tr.from === 'right';
      // outgoing page drifts back a little and dims
      ctx.save();
      if (horiz) ctx.translate(-e * W * 0.22, 0); else ctx.translate(0, -e * H * 0.22);
      drawScene(ctx, A, t);
      ctx.fillStyle = `rgba(40,28,28,${0.14 * e})`;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      // incoming page slides over it like a fresh sheet of paper
      ctx.save();
      if (horiz) ctx.translate((1 - e) * W, 0); else ctx.translate(0, (1 - e) * H);
      setShadow(ctx, { blur: 46, x: horiz ? -14 : 0, y: horiz ? 6 : -14, a: 0.22 });
      ctx.fillStyle = B.bg || LR.C.blush;
      ctx.fillRect(0, 0, W, H);
      noShadow(ctx);
      ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
      drawScene(ctx, B, t);
      ctx.restore();
    } else {
      drawScene(ctx, sceneAt(t), t);
    }
    cutFrame(ctx, t);
    post(ctx);
  }

  // Dashed "cut here" frame; traces itself on at the very start.
  let framePts = null;
  function cutFrame(ctx, t) {
    const inset = 34, r = 22;
    if (!framePts) {
      const pts = LR.rrectPts(inset, inset, W - inset * 2, H - inset * 2, r, 8);
      // start the trace at the top-centre
      let best = 0;
      pts.forEach((p, i) => { if (p[1] < inset + 1 && Math.abs(p[0] - W / 2) < Math.abs(pts[best][0] - W / 2)) best = i; });
      framePts = pts.slice(best).concat(pts.slice(0, best + 1));
      let L = 0;
      framePts.len = [0];
      for (let i = 1; i < framePts.length; i++) { L += Math.hypot(framePts[i][0] - framePts[i - 1][0], framePts[i][1] - framePts[i - 1][1]); framePts.len.push(L); }
      framePts.total = L;
    }
    const k = E.inOutCubic(clamp((t - 0.05) / 1.1));
    if (k <= 0) return;
    const upto = framePts.total * k;
    ctx.save();
    ctx.strokeStyle = 'rgba(28,28,28,0.32)';
    ctx.lineWidth = 2.2;
    ctx.setLineDash([13, 10]);
    ctx.beginPath();
    ctx.moveTo(framePts[0][0], framePts[0][1]);
    for (let i = 1; i < framePts.length; i++) {
      if (framePts.len[i] > upto) {
        const a = framePts[i - 1], b = framePts[i];
        const f = (upto - framePts.len[i - 1]) / (framePts.len[i] - framePts.len[i - 1]);
        ctx.lineTo(a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f);
        break;
      }
      ctx.lineTo(framePts[i][0], framePts[i][1]);
    }
    ctx.stroke();
    ctx.restore();
  }

  let vignette = null;
  function post(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.13;
    ctx.fillStyle = LR.tex.grain;
    ctx.fillRect(0, 0, W, H);
    if (!vignette) {
      vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.45, W / 2, H / 2, H * 1.1);
      vignette.addColorStop(0, 'rgba(255,255,255,0)');
      vignette.addColorStop(1, 'rgba(150,110,100,0.14)');
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // gentle camera push about a point
  LR.camera = function (ctx, zoom, cx = W / 2, cy = H / 2) {
    ctx.translate(cx, cy);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);
  };

  // soft 4-point sparkle (clean, no outline)
  LR.twinkle = function (ctx, x, y, r, color, alpha = 1) {
    if (r <= 0.5) return;
    ctx.save();
    ctx.globalAlpha *= alpha;
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 - Math.PI / 2, rr = i % 2 ? r * 0.18 : r;
      const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr;
      i ? ctx.lineTo(px, py) : ctx.moveTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  };

  LR.renderFrame = renderFrame;
})(typeof self !== 'undefined' ? self : globalThis);
