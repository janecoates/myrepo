/* Fall edition — page setup (load right after core.js, before film.js).
 * A vertical 9:16 reel with its own soundtrack variant. */
(function (root) {
  const LR = root.LR;
  LR.W = 1080;
  LR.H = 1920;
  LR.AUDIO = 'fall';
  LR.POSTER_T = 3.6;
})(typeof self !== 'undefined' ? self : globalThis);
