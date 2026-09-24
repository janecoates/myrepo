/* Player: boots fonts/textures, mixes the soundtrack, and keeps the canvas
 * locked to the audio clock.
 *   ?t=12.5    render a single still at 12.5 s (no playback)
 *   ?export=1  frame-exact capture mode (used by tools/render-video.mjs)
 *   ?loop=1    loop playback */
(function () {
  const LR = self.LR;
  const qs = new URLSearchParams(location.search);
  const $ = (id) => document.getElementById(id);
  const canvas = $('film');
  const ctx = canvas.getContext('2d');
  const DUR = LR.DURATION;
  const exportMode = qs.has('export');
  const stillT = qs.has('t') ? parseFloat(qs.get('t')) : null;
  const loop = qs.has('loop');

  let actx = null, gain = null, buffer = null, source = null;
  let playing = false, offset = 0, startedAt = 0, perfStart = 0, muted = false;
  let started = false; // until first play, show the poster frame
  const POSTER_T = 3.4;
  let soundtrack = null;

  // Adaptive resolution: if playback can't hold ~40 fps, render fewer pixels.
  let quality = 1, slowFrames = 0, lastFrameAt = 0;
  function sizeCanvas() {
    if (exportMode || stillT != null) { canvas.width = 1920; canvas.height = 1080; return; }
    const r = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.max(640, Math.min(1920, Math.round(r.width * dpr * quality)));
    if (Math.abs(canvas.width - w) > 8) { canvas.width = w; canvas.height = Math.round(w * 9 / 16); }
  }
  function watchPerf(now) {
    if (playing && lastFrameAt) {
      const dt = now - lastFrameAt;
      if (dt > 26 && dt < 250) slowFrames++; else slowFrames = Math.max(0, slowFrames - 1);
      if (slowFrames > 20 && quality > 0.5) { quality = Math.max(0.5, quality * 0.8); slowFrames = 0; }
    }
    lastFrameAt = now;
  }

  function now() {
    if (!playing) return offset;
    if (actx && buffer) return actx.currentTime - startedAt - (actx.outputLatency || 0);
    return offset + (performance.now() - perfStart) / 1000;
  }

  function fmt(t) {
    const m = Math.floor(t / 60), s = t - m * 60;
    return `${m}:${s.toFixed(1).padStart(4, '0')}`;
  }

  function draw(t) {
    LR.renderFrame(ctx, Math.max(0, Math.min(DUR - 1e-3, t)));
  }

  function setPlayIcon() {
    $('playIcon').innerHTML = playing ? '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>' : '<path d="M6 4l15 8-15 8z"/>';
  }

  async function ensureAudio() {
    if (actx || !soundtrack) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      try { actx = new AC({ sampleRate: soundtrack.sampleRate }); } catch (e) { actx = new AC(); }
      buffer = actx.createBuffer(2, soundtrack.left.length, soundtrack.sampleRate);
      buffer.getChannelData(0).set(soundtrack.left);
      buffer.getChannelData(1).set(soundtrack.right);
      gain = actx.createGain();
      gain.gain.value = muted ? 0 : 1;
      gain.connect(actx.destination);
    } catch (e) {
      console.warn('Audio unavailable, playing silently', e);
      actx = null; buffer = null;
    }
  }

  async function play() {
    if (playing) return;
    await ensureAudio();
    if (offset >= DUR - 0.05) offset = 0;
    if (actx) {
      if (actx.state === 'suspended') await actx.resume();
      source = actx.createBufferSource();
      source.buffer = buffer;
      source.connect(gain);
      source.start(0, offset);
      startedAt = actx.currentTime - offset;
    }
    perfStart = performance.now();
    playing = true;
    started = true;
    $('overlay').classList.add('hidden');
    setPlayIcon();
  }
  function pause() {
    if (!playing) return;
    offset = now();
    playing = false;
    if (source) { try { source.stop(); } catch (e) {} source = null; }
    setPlayIcon();
  }
  function seek(t) {
    const was = playing;
    if (was) pause();
    offset = Math.max(0, Math.min(DUR, t));
    started = true;
    if (was) play(); else draw(offset);
  }

  function tick(ts) {
    watchPerf(ts || performance.now());
    let t = now();
    if (playing && t >= DUR) {
      if (loop) { pause(); offset = 0; play(); t = 0; }
      else {
        pause(); offset = DUR; t = DUR;
        $('hint').textContent = 'Play again';
        $('overlay').classList.remove('hidden');
      }
    }
    sizeCanvas();
    draw(started ? t : POSTER_T);
    $('scrub').value = t;
    $('time').textContent = `${fmt(Math.min(t, DUR))} / 0:30`;
    requestAnimationFrame(tick);
  }

  async function boot() {
    await LR.loadFonts();
    LR.initTextures(ctx);
    await LR.loadSuits();

    if (exportMode) {
      document.body.classList.add('export');
      window.LRExport = {
        duration: DUR,
        frame(t) { draw(t); return true; },
        soundtrack(sr) { return LR.renderSoundtrack(sr || 48000); },
      };
      document.title = 'ready';
      return;
    }
    if (stillT != null) {
      draw(stillT);
      document.title = 'done';
      return;
    }

    sizeCanvas();
    offset = 0;
    draw(POSTER_T);
    $('hint').textContent = 'Mixing the soundtrack…';
    await new Promise((r) => setTimeout(r, 30));
    try {
      soundtrack = LR.renderSoundtrack ? LR.renderSoundtrack(48000) : null;
    } catch (e) { console.warn('Soundtrack failed; continuing silently', e); }
    $('hint').textContent = soundtrack ? 'Play with sound' : 'Play';

    $('bigPlay').onclick = () => play();
    $('playBtn').onclick = () => (playing ? pause() : play());
    $('restartBtn').onclick = () => { seek(0); if (!playing) play(); };
    $('scrub').oninput = (e) => { seek(parseFloat(e.target.value)); $('overlay').classList.add('hidden'); };
    $('muteBtn').onclick = toggleMute;
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' && e.key !== ' ') return;
      if (e.key === ' ') { e.preventDefault(); playing ? pause() : play(); }
      else if (e.key === 'r' || e.key === 'R') { seek(0); if (!playing) play(); }
      else if (e.key === 'm' || e.key === 'M') toggleMute();
      else if (e.key === 'ArrowRight') seek(now() + 1);
      else if (e.key === 'ArrowLeft') seek(now() - 1);
    });
    requestAnimationFrame(tick);
  }

  function toggleMute() {
    muted = !muted;
    if (gain) gain.gain.value = muted ? 0 : 1;
    $('muteIcon').innerHTML = muted
      ? '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 9l6 6M22 9l-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'
      : '<path d="M4 9h4l5-4v14l-5-4H4z"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>';
  }

  boot().catch((e) => { console.error(e); document.title = 'ERR ' + e.message; });
})();
