/* Fall edition — look, copy, timeline and shared craft helpers.
 * Loaded after film.js + leaves.js, before the fall scenes.
 *
 *   0 –  5  Summer's over.  Suits drift down like leaves; "OVER." gets
 *           scribbled out → "swim season isn't."
 *   5 – 11  Fall break packing list (sweater ✓ boots ✓ Lime Ricki suit ✓ …)
 *  11 – 17  Hot springs season: a vintage postcard; the suit is the stamp
 *  17 – 22  Mix & match on a clothesline, tagged for every getaway
 *  22 – 26  Every body. Every season. Facts written on big cut-paper leaves
 *  26 – 30  swim season, all year — logo, Find your fit
 * Every scene change is a gust of leaves. */
(function (root) {
  const LR = root.LR;
  const { clamp, E } = LR;

  LR.FALL = {
    colors: {
      oat: '#F3EADB', latte: '#E9DCC8', card: '#FBF5EA', rust: '#B5532A', pumpkin: '#E07A3F',
      mustard: '#D9A13B', burgundy: '#7A2E2E', olive: '#5E6340', bark: '#5A3E2B', ink: '#2A211C',
      spring: '#4FA3A0', twine: '#8C6A4A',
    },
    copy: {
      over1: "Summer's", over2: 'over.', isnt: "swim season isn't.",
      listTitle: 'fall break packing list',
      list: ['cozy sweater', 'hiking boots', 'my Lime Ricki suit', 'sunscreen'],
      upfNote: 'UPF 50+ fabric, too!',
      greet: 'Greetings from', pc1: 'HOT SPRINGS', pc2: 'SEASON', stamp: 'UPF 50+', postmark: 'SALT LAKE CITY · UT · ',
      mix: 'Mix & Match', mixSub: 'for every fall getaway', tags: ['hot springs', 'indoor laps', 'sunny escape'],
      separates: 'Tops & bottoms sold separately',
      every1: 'Every body.', every2: 'Every season.',
      facts: [['XXS – 4X', 'inclusive sizing'], ['UPF 50+', 'sun-protective fabric'], ['SHELF BRA', 'built-in & double-lined']],
      allYear: 'swim season, all year.', cta: 'Find your fit',
    },
  };

  LR.FILM.frame = false;
  LR.FILM.grain = 0.2;
  LR.FILM.vignette = 'rgba(90,50,25,0.22)';
  // a few big leaves always drifting in front of everything
  LR.FILM.overlay = (ctx, t) => LR.leafField(ctx, t, { seed: 5, n: 4, size: [74, 112], speed: [120, 180] });

  LR.TRANSITIONS = [
    { at: 5.0, kind: 'leaves', dir: 1, dur: 0.95 },
    { at: 11.0, kind: 'leaves', dir: -1, dur: 0.95 },
    { at: 17.0, kind: 'leaves', dir: 1, dur: 0.95 },
    { at: 22.0, kind: 'leaves', dir: -1, dur: 0.95 },
    { at: 26.0, kind: 'leaves', dir: 1, dur: 0.95 },
  ];

  // Draw a polyline progressively (k: 0..1), e.g. a pen stroke being drawn.
  LR.strokeTo = function (ctx, pts, k, o = {}) {
    if (k <= 0 || pts.length < 2) return;
    let L = 0;
    const seg = [];
    for (let i = 1; i < pts.length; i++) { const d = Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); seg.push(d); L += d; }
    let left = L * clamp(k);
    ctx.save();
    ctx.strokeStyle = o.color || LR.FALL.colors.ink;
    ctx.lineWidth = o.lw || 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length && left > 0; i++) {
      const f = Math.min(1, left / seg[i - 1]);
      ctx.lineTo(pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * f, pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * f);
      left -= seg[i - 1];
    }
    ctx.stroke();
    ctx.restore();
  };

  // Handwritten line (Caveat), optionally rotated
  LR.hand = function (ctx, str, x, y, o = {}) {
    ctx.save();
    ctx.translate(x, y);
    if (o.rot) ctx.rotate(o.rot);
    const w = LR.label(ctx, str, 0, 0, { size: o.size || 60, weight: o.weight || 700, family: 'Caveat', color: o.color || LR.FALL.colors.ink, align: o.align || 'center', t: o.t, t0: o.t0, stagger: o.stagger == null ? 0.028 : o.stagger, dur: 0.25, rise: 4, hold: o.hold });
    ctx.restore();
    return w;
  };

  // Suit fluttering down like a leaf and landing at (x, y)
  LR.fallingSuit = function (ctx, t, name, x, y, sc, rot, t0, dur = 1.6, seed = 1) {
    const k = clamp((t - t0) / dur);
    if (k <= 0) return;
    const e = E.outCubic(k), damp = 1 - E.outQuad(k);
    const px = x + Math.sin(k * Math.PI * 2.4 + seed) * 140 * damp;
    const py = -360 + (y + 360) * e;
    const flip = damp > 0.02 ? Math.cos((t - t0) * 5.5 + seed) * damp + (1 - damp) : 1;
    LR.drawSuit(ctx, name, px, py, { scale: sc, sx: Math.abs(flip) < 0.15 ? 0.15 * Math.sign(flip || 1) : flip, rot: rot + Math.sin(k * Math.PI * 3 + seed) * 0.5 * damp, t: k >= 1 ? t : null, sway: seed });
  };
})(typeof self !== 'undefined' ? self : globalThis);
