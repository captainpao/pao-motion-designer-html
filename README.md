# pao-motion-designer-html

Agentic motion designer: a brief (`SCRIPT.md`) becomes an animated 16:9 slide deck, played in the browser and recordable to mp4.

Plain HTML, CSS and JavaScript with GSAP. No build step, no framework, no npm install.

## Quick start

**macOS:** double-click `start.command`. It starts a local server and opens the project list in your browser. Close the Terminal window to stop it. If macOS blocks it the first time, right-click it and choose **Open**.

**Any system:** from this folder, run

```bash
python3 -m http.server 5199
```

then open http://localhost:5199/ for the project list, or http://localhost:5199/?p=s2bo to play a deck.

> Opening `index.html` directly (a `file://` address) shows a blank page. Browsers don't load JavaScript modules from disk, so it has to be served.

## Playing a deck

The deck plays automatically. The controls sit at the bottom-right of the screen.

| Key | Action |
|---|---|
| `←` `→` `Space` `PageUp` `PageDown` | Previous / next slide |
| `Home` `End` | First / last slide |
| `A` | Autoplay on or off (music follows) |
| `M` | Music on or off |
| `F` | Fullscreen |
| `R` | Record an mp4 (Chrome 126+) |

Browsers hold music until your first click or key press. Recording asks you to share the tab, replays the deck from slide 1 with music, then downloads the mp4.

## Adding a project

1. Write the brief in `projects/<id>/SCRIPT.md`.
2. Write the deck in `projects/<id>/deck.js`, using `projects/s2bo/` as the reference.
3. Put photos, screenshots and optional music in `assets/<id>/`, and record each one's source and licence in `assets/<id>/SOURCES.md`.
4. Add `<id>` to `projects.js`.
5. Run `node check.mjs` to validate the deck, then view every slide.

Screenshots that don't exist yet show a labelled placeholder, so a deck can be laid out before the captures are ready. See [AGENTS.md](AGENTS.md) for the full authoring rules and layout table, and [DESIGN.md](DESIGN.md) for the brand rules.

## Files

```
start.command            # macOS quick start
index.html               # page shell + player controls
style.css                # all styling; brand tokens on :root
src/app.js               # routing, stage scaling, player
src/slide.js             # renders a slide + its GSAP timelines; motion presets
src/deck.js              # deck schema: defaults + validation
src/record.js            # in-browser mp4 recording
projects.js              # list of project ids
projects/<id>/           # SCRIPT.md (brief) + deck.js (deck spec, data only)
assets/<id>/             # photos, screenshots, optional music, SOURCES.md
assets/                  # shared brand assets: logo, fonts, favicon
vendor/gsap.min.js       # GSAP 3.15.1
check.mjs                # deck validation: node check.mjs
AGENTS.md                # guide for coding agents working on this repo
DESIGN.md                # brand and slide-system rules
```

## Requirements

- A modern browser. Recording needs Chrome 126 or later.
- `python3` (or any static file server) to serve the folder.
- Node.js only for `check.mjs`.
