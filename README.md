# Lime Ricki: Find Your Fit (0:30)

A clean, 30-second information video about what makes Lime Ricki unique. It's built from Lime Ricki's own swimsuit drawings, cut out as paper stickers, plus the script logo, the Jost and Poppins typefaces, and the palette from limericki.com. Everything is plain JavaScript: the canvas draws each frame and the soundtrack is synthesized in code.

- **Watch:** [`dist/limericki-find-your-fit.mp4`](dist/limericki-find-your-fit.mp4) (1920×1080, 30 fps, H.264 + AAC stereo)
- **Play live:** open `index.html` in a modern browser. It works offline straight from the file.
  Controls: Space play/pause · R restart · M mute · ←/→ seek.
- **Storyboard:** [`dist/storyboard.jpg`](dist/storyboard.jpg) · **Poster:** [`dist/poster.jpg`](dist/poster.jpg)
- **Earlier version:** the hand-drawn collage cut (v1) lives in [`v1-collage/`](v1-collage/index.html), with its render in [`dist/v1-collage-summer-fun.mp4`](dist/v1-collage-summer-fun.mp4).

## Script / shot list

| Time | Page | On screen | Motion | Sound |
|---|---|---|---|---|
| 0:00–0:04 | **Hello** (blush) | Script logo · *Cute, stylish, full-coverage swimwear* | A dashed "cut here" frame traces itself. The logo writes on like a pen stroke while six drawings pin up around it like a mood board. | Ukulele groove; a glockenspiel run follows the logo; soft paper taps |
| 0:04–0:10 | **01 Mix & Match** (paper) | *Tops, bottoms & one-pieces designed to play together.* · *5 tops × 5 bottoms = 25 looks* · *…or wear the matching set* | Tops and bottoms swap on the beat through combinations, landing on the bouquet set. | Card swishes, each swap a pitched chime |
| 0:10–0:16 | **02 The Details** (blush) | Callouts on the cherry shoulder-tie one-piece: *Adjustable shoulder ties*, *Built-in shelf bra (double-lined, sewn-in pads)*, *UPF 50+ fabric (80% nylon, 20% spandex)*, *Mastectomy friendly (select one-piece styles)* | Leader lines draw out one per bar. | A soft chime per callout |
| 0:16–0:20 | **03 XXS – 4X** (periwinkle) | *Inclusive sizing for every body, designed so you can feel your best.* | Nine size chips pop in on eighth notes. | The chips play up the scale |
| 0:20–0:25 | **04 Why Lime Ricki** (cream) | *18+ years of swim* · *Responsibly made* · *Designed in the USA* | Three cards; their line icons draw themselves. | Taps and chimes |
| 0:25–0:30 | **Find your fit** (petal pink) | White script logo · *FIND YOUR FIT* · *limericki.com* | The one-piece collection lines up under the logo; sparkles land on the final chord. | Logo arpeggio; the final chord rings out |

## Sources for every claim

All copy is quoted or lightly condensed from limericki.com:

- **Home page:** "Full Coverage Swimwear". "Find cute, stylish, full-coverage swimwear". "For over 18 years, we've been designing swimsuits for women…" "High-quality swim produced in small batches and sewn to last." "Sizes XXS – 4X: Inclusive sizing for every body, designed so you can feel your best." "Lime Ricki is based in Salt Lake City, where we design and ship every suit."
- **Product pages** (e.g. Field Study Shoulder-Tie One-Piece, Sky Gingham High-Waist Bottom): "Adjustable tie-shoulder straps… create the perfect amount of support", "Double lined shelf bra with sewn-in bra pads", "UPF 50+ sun protection", "80% nylon, 20% spandex", "Mastectomy friendly", and "Mix and match this versatile swim skirt with all your favorite tops".
- **Needs review:** "Mastectomy friendly" appears on the one-piece listings. It's captioned "select one-piece styles", so please confirm that framing. The counts in *5 tops × 5 bottoms = 25 looks* refer to the pieces shown on screen.

## Design system

- **Palette** (sampled from the live site): ink `#1C1C1C`, body text `#5C5C5C`, blush `#FFF1EF`, pink `#F2D7D3`, petal `#FBE3E6` (the illustration artboard pink), cream `#F2EEE9`, periwinkle `#96ADD6`, red-orange `#E85234`.
- **Type:** Jost 500 in caps with wide tracking for headings, like the site navigation. Poppins for body copy, like the site body. Both use the SIL Open Font License and are embedded.
- **Logo:** traced from the site's white wordmark asset into a vector path (`src/logo.js`), so it stays sharp at 1080p and can be drawn in any color. If you have the master SVG, paste its path data into `LR.LOGO.d`.
- **Illustrations:** your two artboards were cut into 17 transparent PNGs in `assets/suits/`: 7 one-pieces, 5 tops and 5 bottoms. They're shown as die-cut stickers with a white margin and a soft shadow, and they sway gently. To swap art, replace a PNG with the same name.
- **Motif:** the dashed cut line from the artboard frames every page. Pages change like fresh sheets of paper sliding in on the downbeat.

## Sound

Everything is synthesized in [`src/audio.js`](src/audio.js); there are no audio files.
- **Music:** 120 BPM in C major, 15 bars, exactly 30 s. Ukulele (Karplus–Strong), plucked bass, a light kit (soft kick, claps, shaker, tambourine), and a vibraphone melody. A marimba riff and glockenspiel sparkles fill in around it.
- **Cues, timed to the picture:** paper swishes on page turns, soft taps as drawings land, and pitched chimes for swaps, callouts and size chips (the size run plays up a scale).
- **Mastering:** peak at −1 dBFS, about −16 dBFS RMS.

## Editing

| What | Where |
|---|---|
| Copy, colors | `src/brand.js` |
| Drawings | `assets/suits/*.png` (names listed in `src/suits.js`) |
| Page timing | `src/film.js` (`TRANSITIONS`) and each file in `src/scenes/` |
| Music & cues | `src/audio.js` (the cue list sits just above `MASTER`) |

## Rendering

```bash
npm install                                   # Playwright, for headless rendering
npm run stills -- 3.4 9.5 14.8 19.6 24.6 29.5 # PNG stills in out/
npm run audio                                 # out/soundtrack.wav (pure Node)
FFMPEG=/path/to/ffmpeg npm run video          # out/limericki-find-your-fit.mp4
```

Every frame is a pure function of time, so renders are frame-exact. Add `?t=12.5` to the page URL for a single still, or `?loop=1` to loop.

## Files

```
index.html          player page
src/brand.js        palette, copy, fonts
src/logo.js         vector wordmark + write-on reveal
src/suits.js        illustration loader + die-cut sticker renderer
src/type.js         tracked caps labels, paragraphs, section kickers
src/film.js         timeline, page-slide transitions, cut-line frame
src/scenes/         hello · mixmatch · details · sizes · why · fit
src/audio.js        synthesized soundtrack + sound cues
src/core.js, draw.js, patterns.js, fonts.js, main.js   engine, paper texture, fonts, player
assets/suits/       the cut-out drawings
assets/fonts/       OFL font files + license
tools/              stills / audio / video render scripts, font embedder
v1-collage/         the earlier hand-drawn collage version (self-contained)
```
