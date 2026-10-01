/* Vertical 9:16 reel format (Instagram Reels / TikTok / Shorts).
 * Loaded right after core.js by reel.html; every scene reads LR.W / LR.H and
 * switches to its tall layout. Key copy and products stay inside the
 * platform safe zone (roughly y 240–1500, clear of the right-hand buttons). */
(function (root) {
  const LR = root.LR;
  LR.W = 1080;
  LR.H = 1920;
})(typeof self !== 'undefined' ? self : globalThis);
