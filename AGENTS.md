# AGENTS.md

Agentic motion designer: a brief (`SCRIPT.md`) becomes an animated 16:9 slide deck, played in the browser and recordable to mp4.
Stack: plain HTML, CSS and ES-module JavaScript, with GSAP (vendored) for animation. No build step, no framework, no npm.

**The one rule that keeps projects consistent:** a project is *data only* (`projects/<id>/deck.js` + `assets/<id>/`). All rendering, layout, styling and motion live in `src/` and `style.css` and are shared by every project. If a project needs something the schema can't express, extend `src/` once for everyone (see [Adding a feature](#adding-a-feature)), never per project.

## Commands

```bash
python3 -m http.server 5199    # / lists every project, /?p=<id> plays one (any static server works)
node check.mjs                 # validates every deck listed in projects.js against the schema
```

ES modules don't load from `file://`, so always open the deck through a server.

A change is done only when `node check.mjs` passes, the browser console shows no errors other than the 404s for screenshots that are still placeholders, **and** you have looked at every slide you touched (see [Checking your work](#checking-your-work)).

## Files

```
projects.js               # list of project ids; a static site can't list folders, so register each one here
projects/<id>/SCRIPT.md   # the brief: source of truth for on-screen wording
projects/<id>/deck.js     # the deck spec (`export default { ... }`), authored from SCRIPT.md
assets/<id>/*.jpg|png     # photos and screenshots, referenced by file name from deck.js
assets/<id>/music.mp3     # optional background track (mp3|m4a|ogg|wav); set `music:` in deck.js to enable the music button
assets/<id>/SOURCES.md    # where every image/track came from, its licence, and screenshots still to capture
assets/                   # shared brand assets: logo.svg, fonts/, favicon (never edit)
exports/                  # recorded mp4s (<id>-autoplay.mp4)
index.html                # page shell + the player controls markup
style.css                 # all styling; brand tokens on :root
src/deck.js               # schema: defaults + validation (Deck → Slide → Item / Group / Media)
src/slide.js              # renders one slide + builds its GSAP timelines; motion presets; the h() element builder
src/app.js                # routing (index at /, a deck at /?p=<id>), stage scaling, player and controls
src/record.js             # in-browser mp4 recording
vendor/gsap.min.js        # GSAP 3.15.1, loaded as a classic script (window.gsap)
check.mjs                 # deck validation, run with node
DESIGN.md                 # brand rules (colour, type, shape, motion, voice) + the slide system
```

The `/` index shows every id in `projects.js`. Its cover is the first slide's image, so give slide 1 a photo.

## New project

1. **Script.** Take the user's `projects/<id>/SCRIPT.md`, or write one. `<id>` is short, lowercase, hyphenated (`s2bo`). Use `projects/s2bo/` as the reference for both files.
2. **Deck.** Write `projects/<id>/deck.js` with `export default { ... }`. Pick each slide's shape from the [layout table](#choosing-a-layout). The schema is documented at the top of `src/deck.js`.
3. **Register.** Add `<id>` to the array in `projects.js`.
4. **Assets.** Put photos in `assets/<id>/` and record each one in `assets/<id>/SOURCES.md` (file, slide, source URL, licence). Screenshots that don't exist yet need no file: list them under "Screenshots still needed" and the slide shows a labelled placeholder.
5. **Music** (optional): `assets/<id>/music.mp3`, `music: 'music.mp3'` in deck.js, plus a SOURCES.md row with title, artist, length, source, licence and any attribution text.
6. **Check.** `node check.mjs`, then screenshot every slide at its end state.

## Writing deck.js

### Copy rules

- **Wording is verbatim from SCRIPT.md.** Restructure into fields (`kicker`, `heading`, `items`, `groups`, `aside`); never rephrase, shorten, or add copy. When the user changes on-screen wording, change `deck.js` **and** `SCRIPT.md` together so they don't drift.
- `## Slide N: Title` in the script is a structural name, not on-screen copy. The line under it is the `heading`.
- `kicker` only on the opening title slide. Never a kicker that repeats the heading.
- Numbers only where order matters. Scripts number lists by habit. Use `marker: 'number'` (the default) only for real sequences the reader performs; otherwise `marker: 'none'` (a short blue rule per item).
- Headings and items in sentence case, ending with a full stop as the script has them. Product names in title case.

### Choosing a layout

The renderer picks the layout from which fields you set. Choose by content, then set exactly those fields:

| Content | Fields | Renders as |
|---|---|---|
| Opening / closing slide | `layout: 'title'`, `heading`, `items`, `media: photo` | Indigo hero over the photo. `items[0]` is the lead line; the rest go in the bottom meta row. `kicker` (opening only) sits above the heading. |
| 2–4 short points | `items` only | Points side by side in columns |
| Points + one supporting photo | `items`, `media: { kind: 'photo' }` | Points stacked left, photo panel bleeding off the right edge |
| Points + one product screen | `items`, `media: { kind: 'screenshot' }` | Points stacked left, browser frame right |
| Points + two related screens | `items`, `media: [back, front]` | Points left; two frames overlapping, `back` top-left behind, `front` bottom-right in front, sliding in from left and right |
| Steps the reader performs, each with a screen | `items` with `media` per item | Columns, one screenshot per step |
| Two parties / two sides | `groups` (2), `variant: 'plain'` | Two cards joined by a connector |
| Points + a short list | `items`, `aside: { variant: 'bullets' }` | Points stacked left, white card right |
| Points + a status sequence | `items`, `aside: { variant: 'steps' }` | Points in columns; full-width green card below with steps left to right, revealed one at a time |
| Points + a to-do / readiness list | `items`, `aside: { variant: 'checks' }` | Points stacked left; green card right whose boxes tick one at a time |

Rules:
- One of `groups`, `aside`, or `media` per content slide. Never combine slide-level `media` with `aside`.
- Screenshots on about half the slides at most.
- Keep within what s2bo proves fits: up to 3 items per slide, up to 5 steps, 2 groups, headings on one line. Going beyond is allowed only after a screenshot shows no overflow (nothing may overlap the footer at the bottom-left).
- `media.label` is real alt text describing the screen or photo; it is also the placeholder caption.
- `holdSeconds` (default 2.5) is the autoplay pause after each slide finishes animating. Leave it unless the user asks.

## Adding a feature

When the layout table has no fit:

1. Ask whether an existing layout can carry the content first. Reuse beats a new variant.
2. Extend the schema in `src/deck.js`: add the field or enum value to the validator, with a default if it has one, and document it in the schema comment at the top of the file, saying what it renders as.
3. Render it in `renderSlide()` in `src/slide.js` using `h()`. Add its entrance to the timeline in `enter()`, following the motion rules below.
4. Style it in `style.css` with tokens only (new colours go on `:root` first, mapped to a DESIGN.md token).
5. Add a row to the layout table above, and to DESIGN.md's slide system if it introduces a visual rule.
6. Check that **every existing project** still renders unchanged.

Never: per-project CSS, per-project JS, `if (id === ...)` branches, or inline styles in `deck.js`.

## Motion rules

- Each slide's timelines are built inside `gsap.context(..., slideElement)`, so selector strings are scoped to that slide. `enter()` builds one timeline per slide; `exit()` adds the exit to the same context. The player remounts the slide element on navigation, so the timeline replays, and `ctx.revert()` cleans it up.
- **Durations and eases come from the presets at the top of `src/slide.js`** (`dur.fast` 0.3s, `dur.base` 0.5s, `dur.slow` 0.75s; `ease.enter`, `ease.draw`, `ease.exit`; `stagger` 0.07s). No raw numbers except distances in px.
- Entrance order on every slide: chrome → photo → heading (mask wipe up) → items (rise + fade, staggered) → cards / frames → details inside cards.
- **Sequences reveal one at a time** so each step can be read: steps, checks, and anything with order use a stagger of `dur.fast`–`dur.base`, not the default `stagger`.
- Movement is composed: rise, wipe, slide or draw. No bounce, spring, elastic, rotation, or overshoot.
- Animate `transform` and `opacity` only (`x`, `y`, `scale`, `scaleX/Y`, `autoAlpha`, `clipPath`, `strokeDashoffset`), never `top/left/width/height`.
- **Timelines must be deterministic and seekable:** no `Math.random()`, no `Date.now()`, no CSS transitions or animations on slide content.
- Exit is shared (content lifts and fades); don't add per-slide exits.
- `nullTargetWarn` is off on purpose (in `src/app.js`): the timeline targets every layout's parts and most slides lack some.

## Player (all projects, don't re-implement)

- **Stage: fixed 1440×810.** Windowed it scales down to fit, never above 1440px wide; fullscreen scales up. Author everything in stage pixels, never viewport units. Nothing renders outside the stage.
- **Controls** bottom-right of the screen, dimmed until hovered. The markup is in `index.html`; `src/app.js` wires it up and sets icons and disabled states in `update()`.
  - prev / next with `n / total`: `←` `→` (also `Space`, `PageUp/Down`, `Home`, `End`)
  - autoplay: `A`. Advances after each timeline plus `holdSeconds`; stops on the last slide; play on the last slide restarts.
  - music: `M`. On by default together with autoplay; browsers hold it until the viewer's first click or key. Disabled without `music:` in the deck.
  - fullscreen: `F`
  - record: `R`. Chrome 126+ only. Asks to share this tab, replays the deck from slide 1 with music, then downloads an mp4. Save it as `exports/<id>-autoplay.mp4`.
- Player state is plain variables inside `play()` in `src/app.js`. Anything that changes `index`, `autoplay` or `done` must go through `go()`, `toggleAutoplay()` or `schedule()`, so the autoplay timer and controls stay in step.

## Checking your work

Look at every slide you changed at its **end state** (after the timeline finishes, ~4s), and once mid-animation if you changed motion. With a server on port 5199:

```bash
python3 -m http.server 5199 &
playwright-cli open 'http://localhost:5199/?p=<id>'      # quote the URL: zsh globs the '?'
playwright-cli resize 1440 810
playwright-cli press a                                   # pause autoplay so it doesn't advance under you
playwright-cli press ArrowRight                          # repeat to reach slide N (or End / ArrowLeft)
sleep 4 && playwright-cli screenshot --filename=<scratch>/slide-N.png
playwright-cli console                                   # only placeholder-screenshot 404s are expected
playwright-cli close; pkill -f "http.server 5199"; rm -rf .playwright-cli
```

Check: no text overflow or overlap, nothing touching the footer or the controls, frames and cards aligned to the 96px side margins, the placeholder label readable.

## Code style

- Plain ES modules, no build step. Don't add npm, a bundler, TypeScript or a framework. Don't add a dependency when GSAP or the platform covers it; if one is truly needed, vendor a pinned file into `vendor/`.
- Build DOM with `h()` from `src/slide.js`. Smallest change that works. No abstraction for a single use.
- Comment *why*, not what, especially for CSS overrides.

## Don'ts

- Don't edit `assets/logo.svg`, `assets/fonts/`, `vendor/`, or any downloaded asset. The logo has `fill="none"` on its root, so it is fetched and inlined as markup, then coloured via CSS; that is intended.
- Don't use images without recording source and licence in SOURCES.md.
- Never put deck text or model output into `innerHTML`. `h()` inserts strings as text nodes; `innerHTML` is only for constant icon markup and the local logo file. Don't `eval` model output. LLM-generated decks go through `normalize()` before they are rendered.
- Don't commit API keys (`.env` is gitignored).
- Don't push. Commit only when asked.
