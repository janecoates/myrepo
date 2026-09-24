/* Hand-lettering: sticker headlines, ransom-note cut letters, and
 * handwritten notes that write themselves on. */
(function (root) {
  const LR = root.LR;
  const { rnd, pop, prog, paper, tornRectPts, setShadow, noShadow, E } = LR;

  const font = (fam, size) => `${size}px "${fam}"`;
  LR.font = font;

  function layout(ctx, str, spacing) {
    const out = [];
    let x = 0;
    for (const ch of str) {
      const w = ctx.measureText(ch).width;
      out.push({ ch, x, w });
      x += w + spacing;
    }
    return { letters: out, width: x - spacing };
  }

  // Sticker headline: each letter pops in (overshoot), sits on a thick
  // white die-cut border with a soft shadow, and gently boils.
  function stickerText(ctx, str, x, y, o) {
    const size = o.size || 120;
    const t = o.t;
    const t0 = o.t0 || 0;
    const stagger = o.stagger == null ? 0.045 : o.stagger;
    ctx.save();
    ctx.translate(x, y);
    if (o.rot) ctx.rotate(o.rot);
    if (o.scale) ctx.scale(o.scale, o.scale);
    ctx.font = font(o.font || LR.BRAND.fonts.display, size);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    const L = layout(ctx, str, o.spacing || 0);
    const x0 = o.align === 'left' ? 0 : -L.width / 2;
    const items = [];
    L.letters.forEach((l, i) => {
      if (l.ch === ' ') return;
      const s = o.hold ? 1 : pop(t, t0 + i * stagger, o.dur || 0.42);
      if (s <= 0.001) return;
      const baseRot = (rnd(i, o.seed || 1, 3) - 0.5) * (o.tilt == null ? 0.14 : o.tilt);
      const boilRot = (rnd(i, LR.boil, 9) - 0.5) * 0.035;
      const dy = (rnd(i, o.seed || 1, 4) - 0.5) * size * 0.07 + (o.wave ? Math.sin(t * 5 + i * 0.7) * o.wave : 0);
      items.push({ ...l, cx: x0 + l.x + l.w / 2, dy, rot: baseRot + boilRot, s, i });
    });
    const ow = o.outlineW == null ? size * 0.2 : o.outlineW;
    ctx.lineJoin = 'round';
    ctx.miterLimit = 2;
    // pass 1: die-cut white border + shadow
    if (ow > 0) {
      for (const it of items) {
        ctx.save();
        ctx.translate(it.cx, it.dy); ctx.rotate(it.rot); ctx.scale(it.s, it.s);
        setShadow(ctx, o.shadow == null ? { blur: 10, x: 3, y: 6, a: 0.3 } : o.shadow);
        ctx.strokeStyle = o.outline || '#FFFDF6';
        ctx.lineWidth = ow;
        ctx.strokeText(it.ch, 0, 0);
        noShadow(ctx);
        ctx.fillStyle = o.outline || '#FFFDF6';
        ctx.fillText(it.ch, 0, 0);
        ctx.restore();
      }
    }
    // pass 2: ink edge + color fill (+ optional print)
    for (const it of items) {
      ctx.save();
      ctx.translate(it.cx, it.dy); ctx.rotate(it.rot); ctx.scale(it.s, it.s);
      if (o.ink) {
        ctx.strokeStyle = o.ink;
        ctx.lineWidth = o.inkW || size * 0.06;
        ctx.strokeText(it.ch, 0, 0);
      }
      const fills = Array.isArray(o.fill) ? o.fill : [o.fill || LR.C.coral];
      ctx.fillStyle = fills[it.i % fills.length];
      ctx.fillText(it.ch, 0, 0);
      if (o.print) {
        ctx.globalAlpha = o.printAlpha || 0.35;
        ctx.fillStyle = o.print;
        ctx.fillText(it.ch, 0, 0);
        ctx.globalAlpha = 1;
      }
      if (o.shine !== false) {
        ctx.globalAlpha = 0.28;
        ctx.fillStyle = '#fff';
        ctx.save();
        ctx.beginPath();
        ctx.rect(-it.w, -size, it.w * 2, size * 0.62);
        ctx.clip();
        ctx.fillText(it.ch, -size * 0.018, -size * 0.02);
        ctx.restore();
        ctx.globalAlpha = 1;
      }
      ctx.restore();
    }
    ctx.restore();
    return L.width;
  }

  // Ransom-note lettering: every letter on its own scrap of paper.
  const RANSOM_PAIRS = () => {
    const C = LR.C;
    return [
      [C.lime, C.ink], [C.coral, C.white], [C.sun, C.ink], [C.navy, C.white], [C.white, C.coral],
      [C.pink, C.navy], [C.aqua, C.white], [C.cream, C.limeDeep], [C.cherry, C.white],
    ];
  };
  function ransomText(ctx, str, x, y, o) {
    const size = o.size || 110;
    const t = o.t, t0 = o.t0 || 0, stagger = o.stagger == null ? 0.07 : o.stagger;
    const seed = o.seed || 7;
    const fonts = o.fonts || LR.BRAND.fonts.ransom;
    const pairs = o.pairs || RANSOM_PAIRS();
    ctx.save();
    ctx.translate(x, y);
    if (o.rot) ctx.rotate(o.rot);
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'center';
    // layout
    const items = [];
    let cx = 0, idx = 0;
    const gap = size * 0.06;
    for (const ch of str) {
      if (ch === ' ') { cx += size * 0.3; continue; }
      const fnt = fonts[Math.floor(rnd(idx, seed, 1) * fonts.length)];
      const fs = size * (0.82 + rnd(idx, seed, 2) * 0.3);
      ctx.font = font(fnt, fs);
      const w = ctx.measureText(ch).width;
      const pad = size * 0.14;
      const bw = w + pad * 2, bh = size * (1.02 + rnd(idx, seed, 3) * 0.2);
      items.push({ ch, fnt, fs, w, bw, bh, x: cx + bw / 2, i: idx, pair: pairs[Math.floor(rnd(idx, seed, 4) * pairs.length)] });
      cx += bw + gap;
      idx++;
    }
    const total = cx - gap;
    const x0 = o.align === 'left' ? 0 : -total / 2;
    for (const it of items) {
      const tt = t0 + it.i * stagger;
      const s = o.hold ? 1 : pop(t, tt, 0.38);
      if (s <= 0.001) continue;
      const rot = (rnd(it.i, seed, 5) - 0.5) * 0.24 + (rnd(it.i, LR.boil, 6) - 0.5) * 0.02;
      const dy = (rnd(it.i, seed, 8) - 0.5) * size * 0.14;
      ctx.save();
      ctx.translate(x0 + it.x, dy);
      ctx.rotate(rot);
      ctx.scale(s, s);
      const torn = rnd(it.i, seed, 9) > 0.45;
      const pts = torn ? tornRectPts(-it.bw / 2, -it.bh / 2, it.bw, it.bh, seed * 13 + it.i, 3.5, 10)
        : LR.polyPts([[-it.bw / 2, -it.bh / 2], [it.bw / 2, -it.bh / 2], [it.bw / 2, it.bh / 2], [-it.bw / 2, it.bh / 2]], seed + it.i, 0.7, 20);
      paper(ctx, pts, {
        fill: it.pair[0], smooth: false, seed: seed * 7 + it.i, fringe: torn ? 3 : 0,
        shadow: { blur: 9, x: 3, y: 6, a: 0.3 }, boil: 0.7,
        print: rnd(it.i, seed, 10) > 0.75 ? LR.PRINT.halftone('rgba(255,255,255,.35)', 10, 2) : null,
      });
      ctx.font = font(it.fnt, it.fs);
      ctx.fillStyle = it.pair[1];
      ctx.fillText(it.ch, 0, size * 0.04);
      ctx.restore();
    }
    ctx.restore();
    return total;
  }

  // Handwritten note that writes on left-to-right.
  function handText(ctx, str, x, y, o) {
    const size = o.size || 60;
    const k = o.hold ? 1 : prog(o.t, o.t0 || 0, (o.t0 || 0) + (o.dur || 0.8));
    if (k <= 0) return;
    ctx.save();
    ctx.translate(x + (rnd(LR.boil, 3) - 0.5) * 0.8, y + (rnd(LR.boil, 4) - 0.5) * 0.8);
    if (o.rot) ctx.rotate(o.rot);
    ctx.font = font(o.font || LR.BRAND.fonts.hand, size);
    ctx.textBaseline = 'middle';
    const w = ctx.measureText(str).width;
    const x0 = o.align === 'left' ? 0 : o.align === 'right' ? -w : -w / 2;
    ctx.beginPath();
    ctx.rect(x0 - 10, -size, (w + 20) * E.outQuad(k), size * 2);
    ctx.clip();
    ctx.textAlign = 'left';
    if (o.outline) {
      ctx.lineJoin = 'round';
      ctx.strokeStyle = o.outline;
      ctx.lineWidth = o.outlineW || size * 0.16;
      ctx.strokeText(str, x0, 0);
    }
    ctx.fillStyle = o.color || LR.C.ink;
    ctx.fillText(str, x0, 0);
    if (o.underline) {
      LR.squiggle(ctx, x0, size * 0.45, w, size * 0.05, { color: o.underline, lw: size * 0.06, waves: w / 70, seed: 5 });
    }
    ctx.restore();
    return w;
  }

  Object.assign(LR, { stickerText, ransomText, handText });
})(typeof self !== 'undefined' ? self : globalThis);
