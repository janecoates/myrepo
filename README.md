# Lime Ricki: Summer Fun (0:30)

A 30-second animation in a whimsical, hand-drawn collage style about summer fun in full-coverage, modest swimwear. It's built entirely in plain JavaScript: the canvas draws every frame and the soundtrack is synthesized in code. There are no image files, audio files or frameworks.

- **Watch the render:** [`dist/limericki-summer-fun.mp4`](dist/limericki-summer-fun.mp4) (1920×1080, 30 fps, H.264 + AAC stereo)
- **Play it live:** open `index.html` in any modern browser. It works offline straight from the file, with no server or install.
  Controls: Space play/pause · R restart · M mute · ←/→ seek.
- **Storyboard:** [`dist/storyboard.jpg`](dist/storyboard.jpg) · **Poster frame:** [`dist/poster.jpg`](dist/poster.jpg)

---

## Concept: "a Lime Ricki summer mixtape"

Summer is a mixtape. Five quick "tracks" each get their own hand-cut collage page, all set to one sunny ukulele-and-whistle tune. The cast is diverse in age, size and skin tone: a teen, a surfer, a mom and daughter, a kid with a kite, and a curvy model. They cannonball, surf, fly kites, hop through sprinklers and mix-and-match looks, and **everyone stays covered and comfortable the whole time**. The suits never ride up, and nobody has to tug. That's the point.

The tone is joyful, crafty and a little goofy. It should feel like a scrapbook that came to life: torn paper, washi tape, sticker lettering, ransom-note cut-outs, halftone dots and outlines that wobble 12 times a second.

## Script / shot list

| Time | Scene | On-screen copy | Action | Sound |
|---|---|---|---|---|
| 0:00–0:04 | **Hello, summer** (sunburst paper) | *Hello, summer!* · note: *a Lime Ricki summer mixtape* | A grinning paper sun, tumbling lime slices and cherries. Headline letters slap on like stickers. Three friends pop up out of torn-paper waves to wave hello. | Ukulele strum kicks in; glock sparkle; each headline letter "plinks" up a scale; pencil scribble on the note |
| 0:04–0:10 | **Cannonball season** (cut-away pool) | *SPLOOSH!* (ransom letters) · *Cannonball season.* | June sprints down the diving board (boing… BOING), tucks into a cannonball, splashes into a cut-away pool, sinks in a fizz of bubbles and pops back up waving. Zuri cheers from a lime-slice float. | Footsteps, boings, slide whistle up and down, big splash, bubbles; the whistle melody enters |
| 0:10–0:16 | **Catch every wave** (layered torn-paper ocean) | *Catch every wave.* | Tess surfs in on a striped board in a long-sleeve rash guard and knee-length shorts, then pops a little air off the wave. Kiki flies a patchwork kite from the sand. | Ocean wash, gulls, surf whoosh and spray |
| 0:16–0:22 | **Sprinkler o'clock** (backyard) | *Sprinkler o'clock!* | Nia and Zuri hop through an oscillating sprinkler on the beat under bunting, beside a picket fence, a kiddie pool and a rubber duck. | Grass thumps, sprinkler hiss, duck squeaks, tambourine lift |
| 0:22–0:26 | **Mix. Match. Make a splash.** (paper-doll page) | Badges: *UPF 50+* · *Stays put!* · *XXS–4X, every body* · *for women, by women* | Paper-doll outfit cut-outs (with fold tabs) fly onto Rosa on each downbeat, swapping tops and bottoms. Badges slap on. | Whooshes, scissor snips, sticker slaps; bouncy marimba riff |
| 0:26–0:30 | **End card** (lime paper, fabric swatches) | **LIME RICKI** · *Full coverage.* · *Full-on fun.* · *limericki.com* | Wordmark letters land one by one, the whole cast pops up waving, and confetti falls on the final chord. | Crash plus "ta-da"; the wordmark plays a glockenspiel run; party popper; the final whistle note rings out |

**Hero line:** *Full coverage. Full-on fun.*

## Style guide

**Collage techniques (all procedural):**
- **Torn paper:** fractal edges with a white torn-fibre fringe and soft drop shadows, so every layer sits on the one below.
- **Line boil:** ink outlines re-jitter 12× per second, like hand-redrawn animation, while the motion itself stays smooth.
- **Paper grain & light:** a tileable fibre texture multiplied over every shape and the whole frame, a warm vignette, and a very subtle stop-motion exposure flicker.
- **Craft details:** halftone gradients, washi tape, sticker lettering with a die-cut white border, ransom-note cut letters, a paper-doll cut line with a scissors doodle.
- **Transitions:** torn-paper wipes and a paper sheet sliding in, each landing on a downbeat.

**Palette** (tokens in [`src/brand.js`](src/brand.js)):

| Token | Hex | Use |
|---|---|---|
| lime | `#9BCB3C` | hero color, end card, fruit |
| limeDeep | `#5E9B2E` | rinds, leaves |
| coral | `#FF6B57` | headlines, sun rays, accents |
| sun | `#FFC93C` | intro paper, badges |
| aqua / pool | `#3EC6CF` / `#44B9D6` | water, prints |
| navy | `#223263` | secondary headlines, rash guard |
| pink | `#F9A8BD` | gingham, hearts |
| cherry | `#D52A43` | cherry print (a nod to Lime Ricki's cherry swim prints) |
| cream / kraft | `#FBF3E3` / `#E8D5B2` | paper stock |
| ink | `#2A2340` | all outlines |

**Type** (SIL Open Font License, embedded): Shrikhand for sticker headlines, Caveat Brush for handwritten notes, and Titan One, Abril Fatface, Alfa Slab One, Bowlby One SC and Shrikhand for the ransom letters.

**Modesty rules the characters follow** (see [`src/figure.js`](src/figure.js) and [`src/cast.js`](src/cast.js)):
- Every top has sleeves: cap, short, elbow, three-quarter or wrist length.
- Tankinis are hip length and overlap the bottoms, so the midriff is always covered, even mid-cannonball.
- Necklines are crew, square, modest scoop or V.
- Bottoms are swim skirts or swim shorts that reach just above the knee. One-pieces include attached shorts.
- The wardrobe mixes tankinis with swim skirts, rash guards with swim shorts, knot-front and ruffle details, and cherry, lime-slice, daisy, stripe, gingham and polka-dot prints.

## Sound

Everything is synthesized from scratch in [`src/audio.js`](src/audio.js): no samples, no libraries.
- **Music:** 120 BPM in C major, 15 bars, exactly 30 s. Karplus–Strong ukulele with a swung island strum, plucked bass, synth kick, claps, shaker, tambourine, snare fills and crashes. The hook is a whistled melody with glides and vibrato. A marimba riff and glockenspiel sparkles fill in around it.
- **Foley, cued to picture:** boing, slide whistle, splash with droplet plinks, bubbles, paper tears on every transition, sticker slaps, pencil scribble, scissor snips, sprinkler hiss, ocean, gulls, rubber-duck squeaks and a party popper.
- **Mastering:** reverb bus, look-ahead limiter, peak at −1 dBFS, about −16 dBFS RMS.

## Brand notes, please review

1. **Logo:** The end card shows *LIME RICKI* in cut-paper ransom letters as a stand-in. To use the official logo, drop it into `assets/` (transparent PNG or SVG) and set `logoSrc: 'assets/your-logo.png'` in [`src/brand.js`](src/brand.js). It will pop in on the end card in place of the lettering.
2. **Colors:** limericki.com was unreachable from the sandbox this was built in, so the palette comes from the name (lime) and Lime Ricki's public "bold color & graphic patterns" language, not the site's CSS. Swap in exact brand hex codes in `src/brand.js` and every scene updates.
3. **Claims on the badges:** *UPF 50+*, *stays put*, *XXS–4X* and *for women, by women* were taken from Lime Ricki's public product and about pages. Please confirm them with product and legal before this runs. All copy is editable in `BRAND.copy`.

## Customizing

| What | Where |
|---|---|
| Colors, copy, logo | `src/brand.js` |
| Characters & outfits | `src/cast.js` (people) · `LR.LOOKS` (mix & match looks) |
| Scene timing & transitions | `src/film.js` (`TRANSITIONS`) and each file in `src/scenes/` |
| Music & sound cues | `src/audio.js` (arrangement at the bottom; foley cues use the same timecodes as the scenes) |

## Rendering

The page itself needs nothing. The export tools use Node 18+, Playwright (Chromium) and ffmpeg:

```bash
npm install                                   # Playwright, for headless rendering
npm run stills -- 2 7.1 13.7 23.3 29          # review PNGs in out/
npm run audio                                 # out/soundtrack.wav (pure Node, no browser)
FFMPEG=/path/to/ffmpeg npm run video          # out/limericki-summer-fun.mp4
```

Every frame is a pure function of time (seeded randomness, analytic particles), so renders are frame-exact and repeatable. Add `?t=12.5` to the page URL for a single still, or `?loop=1` to loop playback. The live player lowers its render resolution automatically if a device can't keep up.

## Files

```
index.html            player page (poster frame, play/pause, scrub, mute)
src/core.js           seeded RNG, noise, easing, keyframes, color helpers
src/brand.js          brand tokens: palette, copy, fonts, logo
src/fonts.js          embedded OFL fonts (generated by tools/embed-fonts.mjs)
src/draw.js           paper cut-outs, torn edges, line boil, tape, doodles
src/patterns.js       paper grain + swim prints (cherries, limes, stripes, gingham…)
src/text.js           sticker headlines, ransom letters, handwritten notes
src/figure.js         paper-doll character rig + full-coverage swimwear
src/props.js          sun, waves, fruit, umbrella, splash, confetti, transitions
src/cast.js           the cast and their looks
src/film.js           timeline, torn-paper transitions, post effects
src/scenes/*.js       the six scenes
src/audio.js          the synthesized soundtrack
src/main.js           playback, audio sync, export hooks
tools/                stills / audio / video render scripts
dist/                 rendered MP4, poster, storyboard
assets/fonts/         font files + OFL license
```
