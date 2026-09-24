/* 26–30 s — End card.
 * Lime paper, a border of fabric-swatch scraps, the whole cast waving from
 * the edges, cut-paper LIME RICKI lettering (or the official logo if
 * BRAND.logoSrc is set), the tagline, and the URL on a taped tag.
 * Confetti lands on the final chord. */
(function (root) {
  const LR = root.LR;
  const { pop, E, prog, clamp, withT, lerp, rnd } = LR;
  const TAU = Math.PI * 2;

  let logoImg = null, logoReady = false;
  function logo() {
    const src = LR.BRAND.logoSrc;
    if (!src || typeof Image === 'undefined') return null;
    if (!logoImg) {
      logoImg = new Image();
      logoImg.onload = () => { logoReady = true; };
      logoImg.src = src;
    }
    return logoReady ? logoImg : null;
  }
  LR.preloadLogo = function () {
    return new Promise((res) => {
      if (!LR.BRAND.logoSrc) return res();
      logo();
      if (logoReady) return res();
      logoImg.addEventListener('load', res);
      logoImg.addEventListener('error', res);
    });
  };

  function swatches(ctx, t) {
    const C = LR.C, P = LR.PRINT;
    const list = [
      [-30, -40, 380, 230, -0.12, C.cream, P.cherries()],
      [330, -70, 300, 190, 0.08, C.white, P.stripes(C.coral, C.white, 12)],
      [1300, -60, 330, 200, -0.06, C.aqua, P.limes()],
      [1620, -30, 360, 250, 0.1, C.sun, P.daisies(C.sun)],
      [-60, 380, 200, 260, 0.06, C.pink, P.gingham(C.coral, C.pinkPale, 16)],
      [1790, 400, 200, 260, -0.07, C.navy, P.dots(C.navy, 'rgba(255,255,255,.7)', 24, 4)],
    ];
    list.forEach(([x, y, w, h, r, fill, print], i) => {
      withT(ctx, x + w / 2, y + h / 2, r + Math.sin(t * 1.5 + i) * 0.01, 1, 1, () => {
        LR.paper(ctx, LR.tornRectPts(-w / 2, -h / 2, w, h, 3000 + i * 7, 6, 12), { fill, print, smooth: false, seed: 3000 + i, fringe: 4, shadow: 1 });
      });
    });
  }

  LR.scene('endcard', {
    start: 26.0, end: 30.01,
    draw(ctx, t) {
      const C = LR.C, Bc = LR.BRAND.copy, B = LR.BRAND;
      LR.bg(ctx, C.lime);
      LR.sunburst(ctx, 960, 470, 22, 'rgba(255,255,255,.16)', -t * 0.05, 2400, 9);
      LR.halftoneWash(ctx, 960, 1180, 900, 22, 7, 'rgba(94,155,46,.45)');
      swatches(ctx, t);

      // centre panel
      const ps = 1 - (1 - E.outBack(clamp((t - 25.75) / 0.5), 1.6)) * 0.08;
      withT(ctx, 960, 510, -0.012, ps, ps, () => {
        LR.paper(ctx, LR.tornRectPts(-500, -360, 1000, 720, 3101, 7, 14), { fill: C.cream, smooth: false, seed: 3101, fringe: 5, shadow: { blur: 34, x: 8, y: 16, a: 0.32 } });
        LR.tape(ctx, -470, -330, 170, 46, -0.62, C.coral, { seed: 11, print: LR.PRINT.dots('rgba(0,0,0,0)', 'rgba(255,255,255,.8)', 14, 2.5, 1) });
        LR.tape(ctx, 470, -330, 170, 46, 0.62, C.aqua, { seed: 12, print: LR.PRINT.stripes('rgba(0,0,0,0)', 'rgba(255,255,255,.6)', 6, 1) });
        LR.tape(ctx, 470, 330, 170, 46, -0.62, C.sun, { seed: 13 });
        LR.tape(ctx, -470, 330, 170, 46, 0.62, C.pink, { seed: 14 });
      });
      // lime slices orbiting the lettering
      const l1 = pop(t, 26.05, 0.5), l2 = pop(t, 26.2, 0.5);
      if (l1 > 0) withT(ctx, 1440, 205, 0, l1, l1, () => LR.limeSlice(ctx, 0, 0, 62, t * 0.6, { seed: 3200 }));
      if (l2 > 0) withT(ctx, 1400, 800, 0, l2, l2, () => LR.limeSlice(ctx, 0, 0, 52, -t * 0.7, { seed: 3210 }));

      // wordmark: official logo if provided, else cut-paper lettering
      const img = logo();
      if (img) {
        const s = pop(t, 26.15, 0.55);
        if (s > 0) {
          const k = Math.min(840 / img.width, 230 / img.height) * s;
          ctx.save();
          LR.setShadow(ctx, { blur: 14, x: 3, y: 6, a: 0.25 });
          ctx.drawImage(img, 960 - (img.width * k) / 2, 350 - (img.height * k) / 2, img.width * k, img.height * k);
          ctx.restore();
        }
      } else {
        LR.ransomText(ctx, B.wordmark, 960, 345, { t, t0: 26.12, size: 122, stagger: 0.075, seed: 23, rot: -0.02 });
      }
      LR.stickerText(ctx, Bc.tag1, 960, 540, { t, t0: 26.95, size: 96, fill: C.navy, ink: C.ink, stagger: 0.03, rot: -0.02 });
      LR.stickerText(ctx, Bc.tag2, 975, 655, {
        t, t0: 27.35, size: 112, fill: C.coral, ink: C.ink, stagger: 0.035, rot: -0.03,
        print: LR.PRINT.stripes('rgba(0,0,0,0)', 'rgba(255,255,255,.9)', 9, 1), printAlpha: 0.22,
      });
      // URL tag
      const us = pop(t, 27.85, 0.45);
      if (us > 0) {
        withT(ctx, 960, 790, 0.015, us, us, () => {
          LR.paper(ctx, LR.tornRectPts(-230, -46, 460, 92, 3301, 3.5, 12), { fill: C.white, smooth: false, seed: 3301, fringe: 3, shadow: 1 });
          LR.tape(ctx, -226, -30, 90, 30, -0.5, C.lime, { seed: 15 });
          LR.handText(ctx, B.url, 0, 4, { t, t0: 27.95, dur: 0.55, size: 64, color: C.navy, underline: C.coral });
        });
      }

      // the whole cast, waving from the edges
      const cast = [
        [LR.CAST.nia, 175, 800, 1.12, 26.25, 'front'],
        [LR.CAST.rosa && Object.assign({}, LR.CAST.rosa, { outfit: LR.LOOKS[0] }), 1755, 800, 1.12, 26.35, 'front'],
        [LR.CAST.june, 1590, 815, 1.12, 26.45, 'front'],
        [LR.CAST.tess, 330, 805, 1.1, 26.3, 'front'],
        [LR.CAST.zuri, 250, 905, 1.2, 26.55, 'front'],
        [LR.CAST.kiki, 1680, 912, 1.2, 26.6, 'front'],
      ];
      cast.forEach(([ch, x, y, sc, t0], i) => {
        const k = clamp((t - t0) / 0.5);
        if (k <= 0 || !ch) return;
        const rise = (1 - E.outBack(k, 1.8)) * 420;
        const wave = Math.sin(t * 9 + i * 1.3) * 22;
        const cheer = t > 28.0 && t < 28.9;
        const hopY = cheer ? -Math.abs(Math.sin((t - 28) * Math.PI * 2.2)) * 26 : 0;
        const pose = i % 2
          ? { shR: 130, elR: 46 + wave, shL: 20, elL: 20 }
          : { shL: 130, elL: 46 + wave, shR: 20, elR: 20 };
        if (cheer) Object.assign(pose, { shL: 160, shR: 160, elL: 15, elR: 15, flare: 0.6 });
        Object.assign(pose, { mouth: i % 3 === 0 ? 'grin' : 'open', eyes: cheer || i % 3 === 1 ? 'happy' : 'open', head: Math.sin(t * 2.5 + i) * 6, hair: Math.sin(t * 3 + i) * 12 });
        withT(ctx, x, y + rise + hopY, Math.sin(t * 2 + i) * 0.02, sc, sc, () => LR.drawFigure(ctx, ch, pose, { t }));
      });

      LR.confetti(ctx, t, 27.9, { n: 90, spread: 1.4, seed: 700 });
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
