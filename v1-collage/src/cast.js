/* The cast and their full-coverage swim looks. Built after textures init
 * (prints need a canvas context). */
(function (root) {
  const LR = root.LR;

  LR.buildCast = function () {
    const C = LR.C, P = LR.PRINT, S = LR.SKIN, Hr = LR.HAIR;
    LR.CAST = {
      // Pool: cherry-print tankini with cap sleeves + lime swim skirt
      june: {
        build: 'teen', skin: S.medium, hair: Hr.dark, hairStyle: 'pony', tie: C.coral, seed: 3,
        acc: { goggles: C.lime },
        outfit: {
          top: { kind: 'tankini', fill: C.cream, print: P.cherries(), sleeve: 'short', neck: 'scoop', trim: C.lime },
          bottom: { kind: 'skirt', fill: C.lime, print: P.dots('rgba(0,0,0,0)', 'rgba(255,255,255,.35)', 22, 3), len: 0.95 },
        },
      },
      // Beach: long-sleeve rash guard + knee-length swim shorts
      tess: {
        build: 'slim', skin: S.fair, hair: Hr.blonde, hairStyle: 'bob', seed: 5,
        acc: {},
        outfit: {
          top: { kind: 'rash', fill: C.navy, sleeve: 'wrist', neck: 'crew', stripe: C.lime, stripe2: C.white, zip: C.white },
          bottom: { kind: 'shorts', fill: C.coral, len: 0.92 },
        },
      },
      // Beach kite flyer: daisy one-piece with attached shorts + sun hat
      kiki: {
        build: 'kid', skin: S.tan, hair: Hr.brown, hairStyle: 'lowpony', seed: 13,
        acc: { hat: C.coral },
        outfit: {
          top: { kind: 'onepiece', fill: C.sun, print: P.daisies(C.sun), sleeve: 'short', neck: 'crew', trim: C.coral },
          bottom: { kind: 'none', len: 0.75 },
        },
      },
      // Backyard mom: striped knot-front tankini + ruffle swim skirt
      nia: {
        build: 'curvy', skin: S.brown, hair: Hr.black, hairStyle: 'curly', seed: 7,
        acc: { flower: C.coral },
        outfit: {
          top: { kind: 'tankini', fill: C.white, print: P.stripes(C.coral, C.white, 12), sleeve: 'short', neck: 'square', knot: C.coral },
          bottom: { kind: 'skirt', fill: C.navy, len: 0.95, ruffle: C.coral },
        },
      },
      // Backyard daughter: lime-slice one-piece with shorts
      zuri: {
        build: 'kid', skin: S.brown, hair: Hr.black, hairStyle: 'puffs', tie: C.lime, seed: 9,
        acc: { sunnies: C.pink },
        outfit: {
          top: { kind: 'onepiece', fill: C.aqua, print: P.limes(), sleeve: 'short', neck: 'crew', trim: C.lime },
          bottom: { kind: 'none', len: 0.7 },
        },
      },
      // Mix & match model
      rosa: {
        build: 'curvy', skin: S.tan, hair: Hr.dark, hairStyle: 'long', seed: 11,
        acc: { flower: C.sun },
        outfit: null, // set per look in the mix & match scene
      },
    };

    // Mix & match looks (paper-doll outfit cards)
    LR.LOOKS = [
      {
        top: { kind: 'tankini', fill: C.lime, print: P.dots(C.lime, 'rgba(255,255,255,.55)', 24, 4), sleeve: 'short', neck: 'scoop', trim: C.white },
        bottom: { kind: 'skirt', fill: C.navy, len: 1.0 },
      },
      {
        top: { kind: 'tankini', fill: C.white, print: P.stripes(C.cherry, C.white, 12), sleeve: 'elbow', neck: 'square', knot: C.cherry },
        bottom: { kind: 'shorts', fill: C.cherry, len: 0.95 },
      },
      {
        top: { kind: 'tankini', fill: C.pink, print: P.cherries(C.pinkPale), sleeve: 'short', neck: 'v', ruffle: C.white },
        bottom: { kind: 'skirt', fill: C.coral, print: P.gingham(C.coralDeep, '#FFE9E3', 14), len: 1.0 },
      },
      {
        top: { kind: 'rash', fill: C.aqua, sleeve: 'three', neck: 'crew', stripe: C.sun, stripe2: C.coral, zip: C.white },
        bottom: { kind: 'skirt', fill: C.lime, print: P.dots(C.lime, 'rgba(34,50,99,.35)', 20, 3.5), len: 1.0, ruffle: C.sun },
      },
    ];
  };
})(typeof self !== 'undefined' ? self : globalThis);
