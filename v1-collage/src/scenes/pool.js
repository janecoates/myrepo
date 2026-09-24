/* 4–10 s — "Cannonball season."
 * A cut-away pool (we can see underwater through the "glass"). June sprints
 * down the diving board, bounces twice (boing, BOING), tucks into a
 * cannonball, SPLOOSH — sinks in a fizz of bubbles, and pops back up
 * grinning and waving. Her cherry tankini + swim skirt stay put the whole way. */
(function (root) {
  const LR = root.LR;
  const { pop, E, prog, clamp, withT, lerp, rnd, keys } = LR;
  const TAU = Math.PI * 2;

  const BOARD_Y = 500, TIP_X = 640, FULCRUM_X = 250;
  const SURF_Y = 612, POOL_X0 = 460, POOL_X1 = 1740, POOL_BOT = 1010;
  const SC = 1.2;
  const HIP_ON_BOARD = BOARD_Y - 118;
  const ENTRY = [1040, SURF_Y + 10];
  const T_RUN_END = 5.0, T_HOP = 5.5, T_LAUNCH = 5.75, T_SPLASH = 7.0, T_SURFACE = 7.95;

  function boardBend(t) {
    // tip deflection (px, +down)
    const land1 = Math.exp(-((t - 5.0) ** 2) / 0.004) * 16;
    const press = t > 5.5 && t < T_LAUNCH ? Math.sin(prog(t, 5.5, T_LAUNCH) * Math.PI) * 46 : 0;
    const recoil = t >= T_LAUNCH ? LR.wobbleAfter(t, T_LAUNCH, -26, 5.5, 5) : 0;
    return land1 + press + recoil;
  }

  // June's state: position, rotation, pose
  function june(t) {
    const C = LR.C;
    const phase = t * 2.6;
    if (t < T_RUN_END) {
      const k = prog(t, 3.6, T_RUN_END);
      const x = lerp(-160, TIP_X - 70, E.outQuad(k) * 0.35 + k * 0.65);
      const run = LR.runPose(phase, 1);
      return { x, y: HIP_ON_BOARD + LR.runBob(phase), rot: 0, pose: { ...run, mouth: 'open', hair: -30 }, view: 'side' };
    }
    if (t < T_LAUNCH) {
      // hop 1 (5.0–5.5) then crouch on the bending tip
      const x = TIP_X - 70 + prog(t, 5.0, 5.5) * 30;
      let y = HIP_ON_BOARD, crouch = 0;
      if (t < T_HOP) {
        const k = prog(t, 5.0, T_HOP);
        y -= Math.sin(k * Math.PI) * 56;
        crouch = k < 0.15 ? (0.15 - k) * 4 : 0;
      } else {
        const k = prog(t, T_HOP, T_LAUNCH);
        crouch = Math.sin(k * Math.PI) * 0.9;
        y += boardBend(t) * 0.9;
      }
      const air = t < T_HOP && t > 5.05;
      return {
        x, y: y + crouch * 30, rot: 0, view: 'side',
        pose: {
          hipL: 20 * crouch + (air ? 10 : 0), knL: 60 * crouch + (air ? 30 : 0), hipR: 20 * crouch + (air ? -6 : 0), knR: 60 * crouch + (air ? 20 : 0),
          shL: air ? 150 : -30 * crouch, elL: 20, shR: air ? 160 : -40 * crouch, elR: 20, lean: 18 * crouch, mouth: 'open', hair: air ? 40 : -10, flare: air ? 0.6 : 0,
        },
      };
    }
    if (t < T_SPLASH) {
      // ballistic arc from the tip to the water with a cannonball tuck
      const k = prog(t, T_LAUNCH, T_SPLASH);
      const x0 = TIP_X - 40, y0 = HIP_ON_BOARD + 20;
      const x = lerp(x0, ENTRY[0], k);
      const y = lerp(y0, ENTRY[1], k) - Math.sin(k * Math.PI) * 250 - k * (1 - k) * 40;
      const tuck = clamp((t - 5.85) / 0.18);
      const spin = -E.inOut(k) * 0.9;
      const open = clamp((t - 6.9) / 0.1);
      return {
        x, y, rot: spin, view: 'side',
        pose: {
          hipL: lerp(20, 112, tuck), knL: lerp(10, 150, tuck), hipR: lerp(-10, 118, tuck), knR: lerp(10, 148, tuck),
          shL: lerp(160, 58, tuck), elL: lerp(10, 70, tuck), shR: lerp(170, 62, tuck), elR: lerp(10, 72, tuck),
          lean: lerp(-10, 34, tuck), head: lerp(-10, 12, tuck), mouth: tuck > 0.5 ? 'o' : 'open', eyes: tuck > 0.5 ? 'closed' : 'wide',
          hair: 60, flare: 0.8 * (1 - open * 0.5),
        },
      };
    }
    if (t < 7.35) {
      // still balled up, sinking in a fizz of bubbles
      const k = prog(t, T_SPLASH, 7.35);
      return {
        x: ENTRY[0] + k * 20, y: ENTRY[1] + 30 + E.outQuad(k) * 150, rot: -0.9 - k * 0.8, view: 'side',
        pose: {
          hipL: 112, knL: 150, hipR: 118, knR: 148, shL: 58, elL: 70, shR: 62, elR: 72,
          lean: 34, head: 12, mouth: 'o', eyes: 'closed', hair: 70, flare: 0.5,
        },
      };
    }
    if (t < T_SURFACE) {
      // unfold and kick back up to the surface, arms overhead
      const k = prog(t, 7.35, T_SURFACE);
      const kick = Math.sin(t * 16);
      return {
        x: ENTRY[0] + 30 + k * 10, y: lerp(SURF_Y + 330, SURF_Y + 150, E.inOut(k)), rot: Math.sin(t * 5) * 0.05, view: 'front',
        pose: {
          hipL: 6 + kick * 7, knL: 18 + kick * 12, hipR: 6 - kick * 7, knR: 18 - kick * 12,
          shL: 168, elL: 8, shR: 168, elR: 8,
          mouth: 'o', eyes: 'closed', flare: 0.35, hair: 20 + kick * 10,
        },
      };
    }
    // surfaced: bob & wave
    const k = clamp((t - T_SURFACE) / 0.35);
    const pop1 = (1 - E.outBack(k, 2.2)) * 70;
    const bob = Math.sin((t - T_SURFACE) * 3.4) * 6;
    const wave = Math.sin(t * 10) * 22;
    return {
      x: ENTRY[0] + 40, y: SURF_Y + 62 + pop1 + bob, rot: Math.sin(t * 2.4) * 0.03, view: 'front',
      pose: {
        shR: 128, elR: 48 + wave, shL: 40 + Math.sin(t * 5) * 8, elL: 20, hipL: 10 + Math.sin(t * 6) * 6, hipR: 10 - Math.sin(t * 6) * 6, knL: 20, knR: 20,
        mouth: 'grin', eyes: t > 8.6 && t < 9.4 ? 'happy' : 'open', flare: 0.5, head: Math.sin(t * 3) * 6, hair: Math.sin(t * 4) * 12,
      },
    };
  }

  function drawBoard(ctx, t) {
    const C = LR.C;
    const bend = boardBend(t);
    // stand
    LR.paper(ctx, LR.polyPts([[168, 560], [278, 560], [262, BOARD_Y + 14], [184, BOARD_Y + 14]], 61, 1, 20), { fill: C.navy, ink: C.ink, lw: 3.5, seed: 61, shadow: 1, smooth: false });
    // board: top & bottom edges bending past the fulcrum
    const top = [], bot = [];
    for (let x = 40; x <= TIP_X; x += 20) {
      const u = Math.max(0, (x - FULCRUM_X) / (TIP_X - FULCRUM_X));
      const dy = bend * u * u;
      top.push([x, BOARD_Y + dy]);
      bot.push([x, BOARD_Y + 22 + dy]);
    }
    const pts = [...top, ...bot.reverse()];
    const path = LR.paper(ctx, pts, { fill: C.lime, ink: C.ink, lw: 3.5, seed: 62, shadow: 1, smooth: false, boil: 0.6 });
    ctx.save();
    ctx.clip(path);
    ctx.fillStyle = C.white;
    for (let x = 60; x < TIP_X; x += 70) {
      const u = Math.max(0, (x - FULCRUM_X) / (TIP_X - FULCRUM_X));
      ctx.fillRect(x, BOARD_Y + bend * u * u + 8, 30, 6);
    }
    ctx.restore();
    return bend;
  }

  function drawWater(ctx, t, front) {
    const C = LR.C;
    const surf = [];
    for (let x = POOL_X0 - 10; x <= POOL_X1 + 10; x += 16) {
      const ripple = t > T_SPLASH ? Math.exp(-(t - T_SPLASH) * 1.4) * 16 * Math.sin((x - ENTRY[0]) / 38 - (t - T_SPLASH) * 9) * Math.exp(-Math.abs(x - ENTRY[0]) / 420) : 0;
      surf.push([x, SURF_Y + Math.sin(x / 90 + t * 2.2) * 6 + Math.sin(x / 37 - t * 3.1) * 2 + ripple]);
    }
    if (!front) {
      const pts = [...surf, [POOL_X1 + 10, POOL_BOT], [POOL_X0 - 10, POOL_BOT]];
      const g = ctx.createLinearGradient(0, SURF_Y, 0, POOL_BOT);
      g.addColorStop(0, '#6CD0E4'); g.addColorStop(1, C.poolDeep);
      const path = LR.paper(ctx, pts, { fill: g, seed: 70, smooth: false, boil: 0.5, grain: 0.35 });
      ctx.save();
      ctx.clip(path);
      // tile grid
      ctx.strokeStyle = 'rgba(255,255,255,.22)'; ctx.lineWidth = 2;
      ctx.beginPath();
      for (let x = POOL_X0; x < POOL_X1; x += 64) { ctx.moveTo(x, SURF_Y - 20); ctx.lineTo(x, POOL_BOT); }
      for (let y = SURF_Y + 40; y < POOL_BOT; y += 64) { ctx.moveTo(POOL_X0, y); ctx.lineTo(POOL_X1, y); }
      ctx.stroke();
      // lane stripe on the floor
      ctx.fillStyle = 'rgba(34,50,99,.55)';
      ctx.fillRect(POOL_X0 + 60, POOL_BOT - 34, POOL_X1 - POOL_X0 - 120, 16);
      ctx.fillRect(POOL_X1 - 90, POOL_BOT - 110, 16, 92);
      // caustics
      for (let i = 0; i < 9; i++) {
        const y = SURF_Y + 80 + i * 38;
        const x0 = POOL_X0 + ((i * 263 + t * 40) % (POOL_X1 - POOL_X0 - 200));
        LR.squiggle(ctx, x0, y, 150 + (i % 3) * 40, 5, { color: 'rgba(255,255,255,.35)', lw: 3, waves: 2.5, phase: t * 3 + i, seed: 80 + i });
      }
      ctx.restore();
      return;
    }
    // front: translucent water veil over whatever is below the surface
    const pts = [...surf, [POOL_X1 + 10, POOL_BOT], [POOL_X0 - 10, POOL_BOT]];
    const path = LR.toPath(pts, true, false);
    ctx.save();
    ctx.globalAlpha = 0.3;
    ctx.fillStyle = '#4FC3DA';
    ctx.fill(path);
    ctx.globalAlpha = 1;
    // surface foam line
    LR.ink(ctx, surf, { color: '#FFFFFF', lw: 7, seed: 71, boil: 0.6 });
    LR.ink(ctx, surf.map(([x, y]) => [x, y + 9]), { color: 'rgba(255,255,255,.45)', lw: 3, seed: 72, boil: 0.8 });
    ctx.restore();
  }

  function limeFloat(ctx, t) {
    const x = 1470 + Math.sin(t * 0.8) * 20, y = SURF_Y + 4 + Math.sin(t * 2.3) * 5;
    const tip = t > T_SPLASH ? Math.exp(-(t - T_SPLASH) * 1.5) * Math.sin((t - T_SPLASH) * 8) * 0.25 : 0;
    // Zuri lounging in the lime float, cheering when the splash lands
    const cheer = t > T_SPLASH + 0.1;
    const jig = Math.sin(t * 9) * 10;
    withT(ctx, x - 6, y + 6, Math.sin(t * 1.7) * 0.06 + tip, 1.05, 1.05, () => LR.drawFigure(ctx, LR.CAST.zuri, {
      shL: cheer ? 150 + jig : 60, elL: cheer ? 20 : 60, shR: cheer ? 150 - jig : 60, elR: cheer ? 20 : 60,
      hipL: 30, knL: 40, hipR: 30, knR: 40, mouth: cheer ? 'grin' : 'smile', eyes: cheer ? 'happy' : 'open', head: Math.sin(t * 2) * 6,
    }, { t }));
    withT(ctx, x, y, Math.sin(t * 1.7) * 0.06 + tip, 1, 0.38, () => {
      LR.limeSlice(ctx, 0, 0, 92, t * 0.1, { seed: 360, shadow: 0.5 });
      LR.paper(ctx, LR.circlePts(34, 20, 361), { fill: '#63C9DD', ink: LR.C.ink, lw: 3.5, seed: 361 });
    });
  }

  LR.scene('pool', {
    start: 4.0, end: 10.0,
    draw(ctx, t) {
      const C = LR.C, B = LR.BRAND.copy;
      LR.bg(ctx, C.sky);
      ctx.save();
      const cam = keys([
        { t: 3.6, v: { x: 760, y: 540, z: 1.22 } },
        { t: 5.0, v: { x: 780, y: 520, z: 1.26 } },
        { t: 5.75, v: { x: 820, y: 500, z: 1.26 } },
        { t: 6.4, v: { x: 950, y: 410, z: 1.2 } },
        { t: 7.0, v: { x: 1040, y: 560, z: 1.28 } },
        { t: 7.6, v: { x: 1060, y: 640, z: 1.3 } },
        { t: 8.3, v: { x: 1040, y: 560, z: 1.25 } },
        { t: 10.4, v: { x: 1040, y: 560, z: 1.3 } },
      ], t);
      ctx.translate(960, 540); ctx.scale(cam.z, cam.z); ctx.translate(-cam.x, -cam.y);
      // sky bits
      LR.halftoneWash(ctx, 1920, 0, 800, 20, 5.5, 'rgba(255,255,255,.55)');
      LR.sun(ctx, 1660, 300, 72, t, { face: true });
      LR.cloud(ctx, 700 + t * 14, 150, 0.8, 11);
      LR.cloud(ctx, 1350 + t * 9, 250, 0.6, 12);
      // hedge
      const hedge = [];
      for (let x = -40; x <= 1960; x += 18) hedge.push([x, 468 - Math.abs(Math.sin(x / 70)) * 34 + (rnd(x, 5) - 0.5) * 6]);
      hedge.push([1960, 580], [-40, 580]);
      LR.paper(ctx, hedge, { fill: C.grass, ink: C.ink, lw: 3, seed: 90, smooth: true, shadow: 1, print: LR.PRINT.dots('rgba(0,0,0,0)', 'rgba(255,255,255,.25)', 30, 4, 1) });
      // palm
      withT(ctx, 1860, 560, 0, 1, 1, () => {
        LR.paper(ctx, [[-14, 0], [14, 0], [-10, -330], [-40, -330]], { fill: '#B98552', ink: C.ink, lw: 3.5, seed: 91, smooth: false, shadow: 1, print: LR.PRINT.stripes('rgba(0,0,0,0)', 'rgba(90,50,20,.25)', 9, 1) });
        for (let i = 0; i < 6; i++) {
          const a = -Math.PI / 2 + (i - 2.5) * 0.52 + Math.sin(t * 1.6 + i) * 0.04;
          withT(ctx, -25, -330, a, 1, 1, () => {
            const pts = [[0, -8], [80, -30], [170, -18], [230, 20], [170, 8], [80, 10], [0, 8]];
            LR.paper(ctx, pts, { fill: i % 2 ? C.limeDeep : C.grass, ink: C.ink, lw: 3, seed: 92 + i, shadow: 0.8 });
          });
        }
      });
      // ground cut-away (kraft earth) + decks
      LR.paper(ctx, [[-60, 575], [1980, 575], [1980, 1140], [-60, 1140]], { fill: C.kraft, seed: 93, smooth: false, print: LR.PRINT.dots('rgba(0,0,0,0)', 'rgba(120,80,40,.18)', 22, 3, 1), shadow: { blur: 10, x: 0, y: -2, a: 0.2 } });
      // pool shell
      LR.paper(ctx, LR.polyPts([[POOL_X0 - 26, 575], [POOL_X1 + 26, 575], [POOL_X1 + 26, POOL_BOT + 26], [POOL_X0 - 26, POOL_BOT + 26]], 94, 1.2, 24), { fill: '#EDE6D6', ink: C.ink, lw: 3.5, seed: 94, smooth: false });
      drawWater(ctx, t, false);
      // deck tops
      for (const [x0, x1, s] of [[-60, POOL_X0 - 26, 95], [POOL_X1 + 26, 1980, 96]]) {
        LR.paper(ctx, LR.polyPts([[x0, 556], [x1, 556], [x1, 586], [x0, 586]], s, 1, 24), { fill: C.cream, ink: C.ink, lw: 3, seed: s, smooth: false, shadow: 0.8, print: LR.PRINT.vstripes('rgba(0,0,0,0)', 'rgba(62,198,207,.25)', 22, 1) });
      }
      // pool ladder
      ctx.save();
      ctx.lineCap = 'round';
      for (const dx of [0, 26]) {
        LR.ink(ctx, [[1666 + dx, 560], [1666 + dx, 520], [1690 + dx, 500], [1712 + dx, 520], [1712 + dx, 760]], { color: C.ink, lw: 12, seed: 97 + dx });
        LR.ink(ctx, [[1666 + dx, 560], [1666 + dx, 520], [1690 + dx, 500], [1712 + dx, 520], [1712 + dx, 760]], { color: '#DADDE6', lw: 6, seed: 97 + dx });
      }
      ctx.restore();
      // beach ball on the far deck
      LR.beachBall(ctx, 1830, 520 + Math.abs(Math.sin(t * 3)) * -10, 38, t * 0.5, 421);
      // flip-flops
      for (const [x, c] of [[70, C.coral], [118, C.coral]]) {
        withT(ctx, x, 552, -0.1, 1, 0.5, () => LR.paper(ctx, LR.ellipsePts(20, 44, 16, x), { fill: c, ink: C.ink, lw: 3, seed: x, shadow: 0.5 }));
      }

      limeFloat(ctx, t);

      // June
      const J = june(t);
      const underwater = t >= T_SPLASH;
      if (!underwater) drawBoard(ctx, t);
      if (t < T_LAUNCH + 0.4 && t > 3.7) {
        LR.speedLines(ctx, J.x - 40, J.y - 60, 0, 90, 3, 110, clamp((T_RUN_END - t) * 2) * clamp((t - 3.9) * 3));
      }
      withT(ctx, J.x, J.y, J.rot, SC, SC, () => LR.drawFigure(ctx, LR.CAST.june, J.pose, { t, view: J.view }));
      if (underwater) drawBoard(ctx, t);

      // bubbles
      if (t > T_SPLASH) {
        for (let i = 0; i < 22; i++) {
          const t0 = T_SPLASH + rnd(i, 3) * 0.9;
          const d = t - t0;
          if (d < 0 || d > 1.4) continue;
          const x = ENTRY[0] + (rnd(i, 4) - 0.5) * 160 + Math.sin(d * 6 + i) * 10;
          const y = ENTRY[1] + 220 - d * 260 - rnd(i, 5) * 60;
          if (y < SURF_Y + 6) continue;
          const r = 6 + rnd(i, 6) * 12;
          LR.paper(ctx, LR.circlePts(r, 12, 300 + i).map(([a, b]) => [a + x, b + y]), { fill: 'rgba(255,255,255,.55)', ink: '#FFFFFF', lw: 2.5, seed: 300 + i, grain: false, boil: 0.4 });
        }
      }
      drawWater(ctx, t, true);
      LR.ripples(ctx, ENTRY[0], SURF_Y + 4, t, T_SPLASH, { r: 70, grow: 330, n: 3 });
      LR.ripples(ctx, ENTRY[0] + 40, SURF_Y + 4, t, T_SURFACE, { r: 40, grow: 200, n: 2 });

      // splash crown + droplets
      if (t > T_SPLASH - 0.02 && t < T_SPLASH + 0.95) {
        const k = prog(t, T_SPLASH, T_SPLASH + 0.95);
        const h = Math.pow(Math.sin(k * Math.PI), 0.6) * 250;
        LR.splashCrown(ctx, ENTRY[0], SURF_Y + 6, h, 110 + k * 90, 650);
      }
      LR.splash(ctx, ENTRY[0], SURF_Y - 20, t, T_SPLASH, { n: 30, speed: 1150, spread: 1.9, g: 2300, size: 15, seed: 601, life: 1.4 });
      LR.splash(ctx, ENTRY[0] + 40, SURF_Y - 10, t, T_SURFACE, { n: 12, speed: 650, spread: 2.2, g: 2000, size: 10, seed: 640, life: 0.9 });

      ctx.restore();
      // words (screen space)
      ctx.save();
      LR.ransomText(ctx, B.sploosh, 1420, 300, { t, t0: T_SPLASH + 0.04, size: 108, stagger: 0.055, rot: -0.07, seed: 17 });
      LR.stickerText(ctx, B.pool, 960, 118, { t, t0: 8.05, size: 112, fill: C.navy, ink: C.ink, stagger: 0.035, rot: -0.02, print: LR.PRINT.dots('rgba(0,0,0,0)', 'rgba(255,255,255,.9)', 14, 2.5, 1), printAlpha: 0.25 });
      ctx.restore();
    },
  });
})(typeof self !== 'undefined' ? self : globalThis);
