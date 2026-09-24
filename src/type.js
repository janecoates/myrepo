/* Clean typography in the limericki.com style: Jost caps with wide tracking
 * for headings, Poppins for body copy. Letters and lines ease up into place. */
(function (root) {
  const LR = root.LR;
  const { clamp, E } = LR;

  LR.font = (size, weight = 400, family = 'Poppins') => `${weight} ${size}px "${family}"`;

  // Tracked single-line label. o: {size, weight, family, tracking(em), upper, color,
  //   align, t, t0, stagger, dur, rise, hold, alpha}
  LR.label = function (ctx, str, x, y, o = {}) {
    const size = o.size || 40;
    const track = (o.tracking || 0) * size;
    const s = o.upper ? str.toUpperCase() : str;
    ctx.save();
    ctx.font = LR.font(size, o.weight || 500, o.family || 'Jost');
    ctx.textBaseline = 'middle';
    ctx.textAlign = 'left';
    const chars = [...s];
    const ws = chars.map((c) => ctx.measureText(c).width);
    const total = ws.reduce((a, b) => a + b, 0) + track * (chars.length - 1);
    let cx = o.align === 'left' ? x : o.align === 'right' ? x - total : x - total / 2;
    const t0 = o.t0 || 0, st = o.stagger == null ? 0.022 : o.stagger, dur = o.dur || 0.55;
    const rise = o.rise == null ? size * 0.4 : o.rise;
    ctx.fillStyle = o.color || LR.C.ink;
    chars.forEach((c, i) => {
      const k = o.hold ? 1 : clamp((o.t - (t0 + i * st)) / dur);
      if (k > 0 && c !== ' ') {
        const e = E.outCubic(k);
        ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha) * e;
        ctx.fillText(c, cx, y + (1 - e) * rise);
      }
      cx += ws[i] + track;
    });
    ctx.restore();
    return total;
  };

  LR.wrap = function (ctx, text, maxW) {
    const out = [];
    for (const para of text.split('\n')) {
      let line = '';
      for (const word of para.split(' ')) {
        const test = line ? line + ' ' + word : word;
        if (maxW && ctx.measureText(test).width > maxW && line) { out.push(line); line = word; }
        else line = test;
      }
      out.push(line);
    }
    return out;
  };

  // Paragraph: wraps to maxW, each line fades/rises in. Returns height used.
  LR.para = function (ctx, text, x, y, o = {}) {
    const size = o.size || 32, lh = size * (o.leading || 1.45);
    ctx.save();
    ctx.font = LR.font(size, o.weight || 400, o.family || 'Poppins');
    ctx.textBaseline = 'middle';
    ctx.textAlign = o.align || 'left';
    ctx.fillStyle = o.color || LR.C.text;
    const lines = LR.wrap(ctx, text, o.maxW);
    lines.forEach((ln, i) => {
      const k = o.hold ? 1 : clamp((o.t - ((o.t0 || 0) + i * (o.lineStagger || 0.12))) / (o.dur || 0.6));
      if (k <= 0) return;
      const e = E.outCubic(k);
      ctx.globalAlpha = (o.alpha == null ? 1 : o.alpha) * e;
      ctx.fillText(ln, x, y + i * lh + (1 - e) * 16);
    });
    ctx.restore();
    return lines.length * lh;
  };

  // Section kicker: "01 ——" in periwinkle, rule grows out after the number
  LR.kicker = function (ctx, num, x, y, o = {}) {
    const k = clamp((o.t - (o.t0 || 0)) / 0.6);
    if (k <= 0) return;
    const e = E.outCubic(k);
    const color = o.color || LR.C.periwinkle;
    const w = LR.label(ctx, num, x, y, { size: o.size || 28, weight: 500, tracking: 0.2, color, align: o.align || 'left', t: o.t, t0: o.t0, stagger: 0.05 });
    const len = 90 * e;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    if (o.align === 'center') {
      ctx.moveTo(x + w / 2 + 22, y); ctx.lineTo(x + w / 2 + 22 + len, y);
      ctx.moveTo(x - w / 2 - 22, y); ctx.lineTo(x - w / 2 - 22 - len, y);
    } else {
      ctx.moveTo(x + w + 22, y); ctx.lineTo(x + w + 22 + len, y);
    }
    ctx.stroke();
    ctx.restore();
  };
})(typeof self !== 'undefined' ? self : globalThis);
