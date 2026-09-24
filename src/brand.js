/* ------------------------------------------------------------------------
 * BRAND TOKENS — the one file to edit for brand tweaks.
 * Palette and type are taken from limericki.com; copy and facts are
 * quoted or lightly condensed from the site (home page + product pages).
 * ------------------------------------------------------------------------ */
(function (root) {
  const LR = (root.LR = root.LR || {});

  LR.BRAND = {
    name: 'Lime Ricki',
    url: 'limericki.com',

    copy: {
      hello: 'Cute, stylish, full-coverage swimwear',
      mixKicker: '01',
      mix: 'Mix & Match',
      mixSub: 'Tops, bottoms & one-pieces designed to play together.',
      mixMath: '5 tops × 5 bottoms = 25 looks',
      mixSet: '…or wear the matching set',
      detailsKicker: '02',
      details: 'The Details',
      callouts: [
        ['Adjustable shoulder ties', 'Create the perfect amount of support'],
        ['Built-in shelf bra', 'Double-lined, with sewn-in pads'],
        ['UPF 50+ fabric', '80% nylon, 20% spandex'],
        ['Mastectomy friendly', 'Select one-piece styles'],
      ],
      sizesKicker: '03',
      sizes: 'XXS – 4X',
      sizeRun: ['XXS', 'XS', 'S', 'M', 'L', 'XL', '2X', '3X', '4X'],
      sizesSub: 'Inclusive sizing for every body,\ndesigned so you can feel your best.',
      whyKicker: '04',
      why: 'Why Lime Ricki',
      pillars: [
        ['Women owned', 'Designing swimsuits for women, by women for over 18 years.'],
        ['Responsibly made', 'High-quality swim made in small batches and sewn to last.'],
        ['Designed in the USA', 'Based in Salt Lake City, where we design and ship every suit.'],
      ],
      cta: 'Find your fit',
    },

    // limericki.com palette (sampled from the live site CSS)
    colors: {
      ink: '#1C1C1C',        // logo + headings
      text: '#5C5C5C',       // body copy
      blush: '#FFF1EF',      // page tint
      pink: '#F2D7D3',       // blush pink panels
      petal: '#FBE3E6',      // illustration-sheet pink
      cream: '#F2EEE9',      // cream panels
      paper: '#FBF8F4',
      periwinkle: '#96ADD6', // accent blue
      red: '#E85234',        // promo red-orange
      white: '#FFFFFF',
    },

    fonts: { head: 'Jost', body: 'Poppins' },
  };
  LR.C = LR.BRAND.colors;
})(typeof self !== 'undefined' ? self : globalThis);
