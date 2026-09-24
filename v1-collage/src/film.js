/* Timeline & compositor.
 *   0.0 –  4.0  Hello, summer!      (intro: sunburst, fruit, cast bobbing in waves)
 *   4.0 – 10.0  Cannonball season.  (cut-away pool)
 *  10.0 – 16.0  Catch every wave.   (beach: surfer + kite)
 *  16.0 – 22.0  Sprinkler o'clock!  (backyard: mom & daughter)
 *  22.0 – 26.0  Mix. Match. Make a splash.  (paper-doll outfit swaps + badges)
 *  26.0 – 30.0  End card            (wordmark, tagline, URL)
 * Scene changes are torn-paper wipes centred on the downbeat. */
(function (root) {
  const LR = root.LR;
  const { clamp, E, setShadow, noShadow, rnd } = LR;
  const W = LR.W, H = LR.H;

  LR.SCENES = [];
  LR.scene = (id, def) => { LR.SCENES.push(Object.assign({ id }, def)); };

  LR.TRANSITIONS = [
    { at: 4.0, kind: 'right', dur: 0.6, seed: 11 },
    { at: 10.0, kind: 'up', dur: 0.64, seed: 12 },
    { at: 16.0, kind: 'hole', dur: 0.62, seed: 13 },
    { at: 22.0, kind: 'slide', dur: 0.56, seed: 14 },
    { at: 26.0, kind: 'left', dur: 0.6, seed: 15 },
  ];

  function sceneAt(t) {
    const S = LR.SCENES;
    for (const s of S) if (t >= s.start && t < s.end) return s;
    return t < S[0].start ? S[0] : S[S.length - 1];
  }
  function sceneById(id) { return LR.SCENES.find((s) => s.id === id); }

  function drawScene(ctx, s, t) {
    ctx.save();
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

    const tr = LR.TRANSITIONS.find((x) => t >= x.at - x.dur / 2 && t < x.at + x.dur / 2);
    if (tr) {
      const A = LR.SCENES.find((s) => Math.abs(s.end - tr.at) < 1e-6);
      const B = LR.SCENES.find((s) => Math.abs(s.start - tr.at) < 1e-6);
      const k = (t - (tr.at - tr.dur / 2)) / tr.dur;
      drawScene(ctx, A, t);
      if (tr.kind === 'slide') {
        const e = E.outCubic(clamp(k));
        ctx.save();
        ctx.translate((1 - e) * W * 1.08, (1 - e) * 60);
        ctx.rotate((1 - e) * 0.1);
        setShadow(ctx, { blur: 40, x: -10, y: 14, a: 0.35 });
        ctx.fillStyle = '#FFFBF1';
        ctx.fillRect(-6, -6, W + 12, H + 12);
        noShadow(ctx);
        ctx.beginPath(); ctx.rect(0, 0, W, H); ctx.clip();
        drawScene(ctx, B, t);
        ctx.restore();
      } else {
        const m = LR.tornMask(tr.kind, k, tr.seed);
        // paper edge: white torn fibre band + shadow cast onto the outgoing scene
        ctx.save();
        const off = { right: [10, 0], left: [-10, 0], up: [0, -10] }[tr.kind];
        setShadow(ctx, { blur: 26, x: off ? off[0] * 0.8 : 0, y: off ? off[1] * 0.8 + 6 : 8, a: 0.32 });
        ctx.fillStyle = '#FFFBF1';
        if (tr.kind === 'hole') {
          ctx.translate(W / 2, H / 2); ctx.scale(1.012, 1.012); ctx.translate(-W / 2, -H / 2);
          ctx.fill(m.path);
        } else {
          ctx.translate(off[0], off[1]);
          ctx.fill(m.path);
        }
        ctx.restore();
        ctx.save();
        ctx.clip(m.path);
        drawScene(ctx, B, t);
        ctx.restore();
      }
    } else {
      drawScene(ctx, sceneAt(t), t);
    }
    post(ctx, t);
  }

  let vignette = null;
  function post(ctx, t) {
    ctx.save();
    ctx.setTransform(LR.pxScale, 0, 0, LR.pxScale, 0, 0);
    // paper grain over everything
    ctx.globalCompositeOperation = 'multiply';
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = LR.tex.grain;
    ctx.fillRect(0, 0, W, H);
    // soft vignette
    if (!vignette) {
      vignette = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
      vignette.addColorStop(0, 'rgba(255,255,255,0)');
      vignette.addColorStop(1, 'rgba(120,80,50,0.28)');
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, W, H);
    // stop-motion exposure flicker (12 fps, very subtle)
    ctx.globalCompositeOperation = 'source-over';
    const f = rnd(LR.boil, 77) - 0.5;
    ctx.globalAlpha = Math.abs(f) * 0.035;
    ctx.fillStyle = f > 0 ? '#FFF6E0' : '#2A1A10';
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  // Camera helper for scenes: gentle push/pan about a point
  LR.camera = function (ctx, zoom, cx = W / 2, cy = H / 2, dx = 0, dy = 0) {
    ctx.translate(cx + dx, cy + dy);
    ctx.scale(zoom, zoom);
    ctx.translate(-cx, -cy);
  };

  LR.renderFrame = renderFrame;
  LR.sceneById = sceneById;
})(typeof self !== 'undefined' ? self : globalThis);
