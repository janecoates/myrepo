# Lime Ricki: Find Your Fit (0:30)

A clean, 30-second information video about what makes Lime Ricki unique. It's built from Lime Ricki's own swimsuit drawings, cut out as paper stickers, plus the script logo, the Jost and Poppins typefaces, and the palette from limericki.com. Everything is plain JavaScript: the canvas draws each frame and the soundtrack is synthesized in code.

- **Watch (16:9):** [`dist/limericki-find-your-fit.mp4`](dist/limericki-find-your-fit.mp4) (1920×1080, 30 fps, H.264 + AAC stereo)
- **Reel (9:16):** [`dist/limericki-find-your-fit-reel.mp4`](dist/limericki-find-your-fit-reel.mp4) (1080×1920 for Instagram Reels, TikTok and YouTube Shorts) · cover frame [`dist/reel-cover.jpg`](dist/reel-cover.jpg) · live page `reel.html`
- **Play live:** open `index.html` in a modern browser. It works offline straight from the file.
  Controls: Space play/pause · R restart · M mute · ←/→ seek.
- **Fall edition (9:16):** [`dist/limericki-fall-reel.mp4`](dist/limericki-fall-reel.mp4) · cover [`dist/fall-cover.jpg`](dist/fall-cover.jpg) · live page `fall.html` (details below)
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

## Fall edition (9:16 reel)

A seasonal, more playful cut with the same brand system and drawings, plus cut-paper autumn leaves, handwriting (Caveat) and a cozy soundtrack. It lives in `fall.html` and `src/fall/`.

| Time | Scene | On screen |
|---|---|---|
| 0:00–0:05 | **Summer's over.** | Swimsuits flutter down like leaves into a pile. "SUMMER'S OVER." gets scribbled out → handwritten *swim season isn't.* |
| 0:05–0:11 | **Fall break packing list** | A taped notepad whose items write on and tick: cozy sweater ✓, hiking boots ✓, my Lime Ricki suit ✓ (the suit gets paper-clipped on), sunscreen ✓. Note: *UPF 50+ fabric, too!* |
| 0:11–0:17 | **Hot springs season** | A vintage postcard: fall mountains, evergreens, a steaming spring. The swimsuit is the postage stamp ("UPF 50+"), postmarked *Salt Lake City · UT*. |
| 0:17–0:22 | **Mix & Match** | Tops and bottoms clothespinned to a twine line, each look on a luggage tag (*hot springs · indoor laps · sunny escape*). One bottom drops away and the matching one clips on. *Tops & bottoms sold separately.* |
| 0:22–0:26 | **Every body. Every season.** | Facts on giant maple leaves: *XXS – 4X*, *UPF 50+*, *Shelf bra (built-in & double-lined)* |
| 0:26–0:30 | **swim season, all year.** | Logo writes on over rust paper; suits fan out; Find your fit · limericki.com; a final flurry of leaves on the last chord |

- **Transitions:** every scene change is a gust of leaves. The next page dissolves in behind them through a feathered edge (`TRANSITION_FX.leaves` in `src/fall/leaves.js`).
- **Palette** (`LR.FALL.colors` in `src/fall/config.js`): oat `#F3EADB`, latte `#E9DCC8`, rust `#B5532A`, pumpkin `#E07A3F`, mustard `#D9A13B`, burgundy `#7A2E2E`, olive `#5E6340`, plus the brand ink and cream.
- **Sound** (`arrangeFall()` in `src/audio.js`): fingerpicked Karplus–Strong guitar, starting wistful in A minor and brightening at the "swim season isn't" twist. Also bass, a brushed half-time kit and a celesta melody. Cues include a wind bed, leaf-rustle gusts, pencil scribbles and ticks, a stamp thud and clothespin clicks.
- **Copy** lives in `LR.FALL.copy` (`src/fall/config.js`). The packing list, getaway tags and "hot springs season" are suggested occasions, not product claims. The facts (UPF 50+, built-in shelf bra, XXS–4X, sold separately, Salt Lake City) come from limericki.com.
- **Render:** `FFMPEG=/path/to/ffmpeg node tools/render-video.mjs --page fall.html` · stills: `node tools/stills.mjs --page fall.html 3.6 14.6`

## Reel (9:16)

`reel.html` renders the same film vertically at 1080×1920, with the same timing, soundtrack and sound cues. Each scene has a tall layout (`LAYOUT.tall` in each file in `src/scenes/`):

- Copy and products sit between y ≈ 240 and 1500, clear of the Reels top bar, the like/comment rail on the right and the caption area at the bottom.
- The tagline breaks onto two lines. The mix & match card stacks under the copy.
- The detail callouts stack on the right of the suit, so leader lines never cross.
- Size chips run in two rows. The "Why" cards stack.
- The end card shows two rows of one-pieces.

Render it with `FFMPEG=/path/to/ffmpeg node tools/render-video.mjs --reel`, and stills with `node tools/stills.mjs --reel 3.4 14.8`.

> Paid Reels placements ask for more room at the bottom (Meta recommends keeping about 35% clear for ads). If this runs as an ad, move the lower content up in the tall layouts.

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
index.html          player page (16:9)
reel.html           player page (9:16 reel) — loads src/format-reel.js
fall.html           fall edition reel — loads src/fall/*
src/fall/           fall edition: setup, leaves engine + gust transition, config/copy, scenes
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
