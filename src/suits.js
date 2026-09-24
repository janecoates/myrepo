/* The swimsuit illustrations (flat drawings supplied by Lime Ricki),
 * cut out of the artboards into transparent PNGs in assets/suits/.
 * Each is rendered as a die-cut sticker: white border + soft paper shadow.
 * To swap art, replace a PNG (same name) — scenes pick it up automatically. */
(function (root) {
  const LR = (root.LR = root.LR || {});

  const NAMES = [
    'onepiece-garden-tie', 'onepiece-marigold', 'onepiece-cherry-tie', 'onepiece-sky-gingham',
    'onepiece-berry-stripe', 'onepiece-bouquet-corset', 'onepiece-red-stripe-keyhole',
    'top-bouquet-scoop', 'top-teal-stripe-scoop', 'top-red-stripe-scoop', 'top-gingham-ruffle', 'top-navy-knotted',
    'bottom-bouquet', 'bottom-teal-stripe', 'bottom-red-stripe', 'bottom-sky-gingham', 'bottom-navy-stripe',
  ];
  LR.SUIT_NAMES = NAMES;
  LR.SUITS = {};

  const BORDER = 11; // die-cut margin, in artwork pixels

  function sticker(img) {
    const pad = BORDER + 4;
    const w = img.naturalWidth + pad * 2, h = img.naturalHeight + pad * 2;
    const sil = LR.mkCanvas(w, h), s = sil.getContext('2d');
    s.drawImage(img, pad, pad);
    s.globalCompositeOperation = 'source-in';
    s.fillStyle = '#FFFFFF';
    s.fillRect(0, 0, w, h);
    const out = LR.mkCanvas(w, h), g = out.getContext('2d');
    for (let i = 0; i < 28; i++) {
      const a = (i / 28) * Math.PI * 2;
      g.drawImage(sil, Math.cos(a) * BORDER, Math.sin(a) * BORDER);
    }
    for (let i = 0; i < 16; i++) {
      const a = (i / 16) * Math.PI * 2;
      g.drawImage(sil, Math.cos(a) * BORDER * 0.55, Math.sin(a) * BORDER * 0.55);
    }
    g.drawImage(img, pad, pad);
    return { canvas: out, w, h };
  }

  LR.loadSuits = function (base = 'assets/suits/') {
    return Promise.all(NAMES.map((name) => new Promise((resolve) => {
      const img = new Image();
      img.onload = () => { LR.SUITS[name] = Object.assign({ img }, sticker(img)); resolve(); };
      img.onerror = () => { console.warn('missing suit art', name); resolve(); };
      img.src = base + name + '.png';
    })));
  };

  // Draw a suit sticker centred at (x, y). o: {scale, rot, alpha, shadow, sway: seed}
  LR.drawSuit = function (ctx, name, x, y, o = {}) {
    const S = LR.SUITS[name];
    if (!S) return;
    const sc = o.scale == null ? 1 : o.scale;
    if (sc <= 0.001) return;
    let rot = o.rot || 0, dy = 0;
    if (o.t != null && o.sway != null) {
      rot += Math.sin(o.t * 1.3 + o.sway * 1.7) * 0.018;
      dy = Math.sin(o.t * 1.7 + o.sway * 2.3) * 4;
    }
    ctx.save();
    if (o.alpha != null) ctx.globalAlpha *= o.alpha;
    ctx.translate(x, y + dy);
    ctx.rotate(rot);
    ctx.scale(sc, sc);
    LR.setShadow(ctx, o.shadow === undefined ? { blur: 22, x: 4, y: 12, a: 0.2 } : o.shadow);
    ctx.drawImage(S.canvas, -S.w / 2, -S.h / 2);
    ctx.restore();
  };
  LR.suitSize = (name) => { const S = LR.SUITS[name]; return S ? [S.w, S.h] : [0, 0]; };
})(typeof self !== 'undefined' ? self : globalThis);
