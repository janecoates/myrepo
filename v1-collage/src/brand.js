/* ------------------------------------------------------------------------
 * BRAND TOKENS — the one file to edit for brand tweaks.
 *
 * Colors, copy and the end-card logo live here. Every scene reads from
 * this object, so a palette change here reflows through the whole film.
 *
 * logoSrc: drop the official Lime Ricki logo (transparent PNG or SVG) into
 * /assets and point this at it, e.g. 'assets/limericki-logo.png'. When set,
 * the end card shows that image in place of the cut-paper lettering.
 * ------------------------------------------------------------------------ */
(function (root) {
  const LR = (root.LR = root.LR || {});

  LR.BRAND = {
    name: 'Lime Ricki',
    wordmark: 'LIME RICKI',
    url: 'limericki.com',
    logoSrc: null,

    // On-screen copy (the full script is in README.md)
    copy: {
      hello: 'Hello, summer!',
      helloNote: 'a Lime Ricki summer mixtape',
      pool: 'Cannonball season.',
      sploosh: 'SPLOOSH!',
      beach: 'Catch every wave.',
      yard: "Sprinkler o'clock!",
      mix: ['Mix.', 'Match.', 'Make a splash.'],
      badges: ['UPF 50+', 'Stays put!', 'XXS–4X', 'For women, by women'],
      tag1: 'Full coverage.',
      tag2: 'Full-on fun.',
    },

    colors: {
      lime: '#9BCB3C',
      limeDeep: '#5E9B2E',
      limePale: '#DDEEA6',
      coral: '#FF6B57',
      coralDeep: '#E04B3F',
      pink: '#F9A8BD',
      pinkPale: '#FDD9E1',
      sun: '#FFC93C',
      sunPale: '#FFE7A1',
      aqua: '#3EC6CF',
      pool: '#44B9D6',
      poolDeep: '#1F8DB0',
      sky: '#AEE0F2',
      navy: '#223263',
      ink: '#2A2340',
      cherry: '#D52A43',
      cream: '#FBF3E3',
      kraft: '#E8D5B2',
      white: '#FFFDF6',
      sand: '#F3D59B',
      grass: '#7DBB45',
    },

    fonts: {
      display: 'Shrikhand',      // headline stickers
      hand: 'Caveat Brush',      // handwritten notes
      note: 'Patrick Hand',      // small print
      ransom: ['Titan One', 'Abril Fatface', 'Alfa Slab One', 'Bowlby One SC', 'Shrikhand'],
    },
  };

  LR.C = LR.BRAND.colors;

  // Skin & hair swatches for a diverse cast
  LR.SKIN = {
    fair: '#F6D3B6', light: '#EDC09A', medium: '#D69A6F', tan: '#B87850', brown: '#8E5A3A', deep: '#6A412B',
  };
  LR.HAIR = {
    black: '#221A1F', dark: '#3A2620', brown: '#6B4027', auburn: '#9A4527', blonde: '#E4B75F', honey: '#C98B3E',
  };
})(typeof self !== 'undefined' ? self : globalThis);
