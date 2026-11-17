# Standard Chartered — DESIGN.md

Working reference for anyone building with this design system. Sections 1–10 are the brand; section 11 is how this repo applies it to slides. In this repo the tokens live on `:root` in `src/index.css` (short names, e.g. `--sc-blue` → `--blue`); use the token, not the literal. When you add a token here, add it there too.

**Sources:** SC Masterbrand Guidelines (Lippincott, 2021) · live sc.com · SCDS (Nitro 6). Brand promise: *Here for good.*

---

## 1. Brand identity

**Trustmark** — two intertwined spirals (S + C), blue over green. Never recolour, rotate, or separate the spirals. On dark surfaces use the all-white lockup.

**Wordmark** — "Standard" (Light 300) stacked over "Chartered" (Bold 700). On light surfaces: Standard in SC Blue, Chartered in SC Green. On dark: both white, with "Standard" at 60–75% opacity.

File: `assets/logo.svg` (full lockup). Its root has `fill="none"`, so it is inlined and coloured by CSS: brand colours on white, all white on indigo. There is no separate white or trustmark-only file.

---

## 2. Colour

### Brand palette

| Token | Hex | PMS | Use |
|---|---|---|---|
| `--sc-blue` | `#0473EA` | 2387 C | **Primary.** CTAs, links, active states |
| `--sc-blue-dark` | `#0061C7` | 2728 C | Hover / pressed on primary |
| `--sc-blue-deep` | `#2C3A87` | 2748 C | Dark hero panels, corporate sections |
| `--sc-indigo` | `#020B43` | — | Deepest dark surface — footer, dark sections |
| `--sc-blue-70` | `#4F9DF0` | — | Icons, secondary UI |
| `--sc-blue-50` | `#7BB6F5` | — | Illustration, data viz |
| `--sc-blue-20` | `#C3DEFA` | — | Card backgrounds, hover fills |
| `--sc-green` | `#38D200` | 2286 C | Sustainability, success, eyebrow labels |
| `--sc-green-70` | `#74DF4C` | — | Illustration |
| `--sc-green-50` | `#92E773` | — | Data viz |
| `--sc-green-20` | `#CDF4BF` | — | Tag and success backgrounds |
| `--sc-green-10` | `#EBFAE5` | — | Light backgrounds |
| `--sc-gold` | `#C9A84C` | — | Private Banking only |

### Neutrals

`--sc-grey-brand` `#525355` (PMS 425 C) is the brand grey; the neutral ramp derives from its tints. Body copy `--sc-gray-800` `#333333`; headlines `--sc-gray-900` `#1A1A1A`; page tint `--sc-off-white` `#F5F5F5`.

### Rules

- One brand colour dominates per surface. Blue *or* green, not both competing.
- Green is an accent — eyebrows, success, sustainability. It is not a second primary.
- Max two background colours per deck or page.
- Never place `--sc-green` text on white below headline size; it fails contrast. Use `--sc-green-dark` for small green text.
- No gradients in UI chrome. Gradients appear only as photographic overlays (indigo → transparent).

---

## 3. Typography

**SC Prosper Sans** — bespoke brand typeface, in `assets/fonts/`. Loaded cuts: Light 300, Regular 400, Bold 700. Do not use 500 or 600.

Stack: `'SC Prosper Sans', 'Plus Jakarta Sans', sans-serif`

### Scale

| Role | Size | Weight | Line-height |
|---|---|---|---|
| Display | 64px | 700 | 1.1 |
| H1 | 48px | 700 | 1.1 |
| H2 | 36px | 700 | 1.25 |
| H3 | 28px | 400 | 1.25 |
| H4 | 22px | 400 | 1.25 |
| H5 | 18px | 700 | 1.25 |
| Body Large | 18px | 300 | 1.65 |
| Body | 16px | 400 | 1.5 |
| Body Small | 14px | 400 | 1.5 |
| Caption | 12px | 400 | 1.5 |
| UI Label | 13px | 700 | 1.4, +0.02em |
| Eyebrow | 11px | 700 | uppercase, +0.1em |

Headlines tighten to `-0.01em`. Display and H1/H2 carry Bold; H3/H4 sit at Regular for a lighter editorial feel. Lead paragraphs use Light 300 — this Light/Bold contrast is the signature of the type system, so avoid filling the middle with 500/600.

Numbers in financial contexts: `font-variant-numeric: tabular-nums`.

**Casing** — headlines and CTAs in sentence case. Product names in title case (Priority Banking, SC Mobile). Eyebrows in uppercase.

---

## 4. Space and layout

8px base grid. Container `1280px`, gutters 80 / 40 / 24px (desktop / tablet / mobile).

Section padding 80px desktop, 48px mobile. Card padding 32px. Card-to-card gap 24px.

Lay sibling groups out with flex or grid plus `gap` — never margins on individual children.

---

## 5. Shape and depth

| Element | Radius |
|---|---|
| Buttons | `9999px` — **pill, always** |
| Inputs, badges, chips | `4px` |
| Cards, modals | `8px` |
| Feature cards | `12px` |
| Hero panels | `0` |

Elevation: cards `0 2px 8px rgba(0,0,0,.08)`, hover `0 4px 16px rgba(0,0,0,.10)`, overlays `0 8px 24px rgba(0,0,0,.12)`. No inner shadows, no coloured shadows.

Borders are 1px and quiet — `--sc-gray-200` for dividers, `--sc-gray-300` for inputs.

Focus ring: `0 0 0 3px rgba(4,115,234,.25)`.

---

## 6. Components

**Buttons** — pill, Regular 400 weight (sc.com CTAs are not bold). Primary is solid `--sc-blue` on white text; secondary is a 1.5px blue outline; ghost is text-only. On dark surfaces, primary inverts to a white pill with blue text. Padding 12px 24px at default size.

**Cards** — white, 8px radius, shadow-sm, 32px padding, no border. Lift shadow on hover; never scale or translate more than 2px.

**Navigation** — 64px bar, white with blur, 1px bottom border. Mega-menu panels drop to 8px bottom corners with shadow-md. Active item in `--sc-blue`, Bold.

**Forms** — 4px radius, 1px `--sc-gray-300` border, 11px 14px padding. Labels 13px Bold above the field. Errors in `--sc-error` with an inline icon.

**Badges** — 4px radius, 11px Bold uppercase, tinted background with matching text colour (`--sc-green-20` + `--sc-green-dark`).

---

## 7. Motion

| Token | Value | Use |
|---|---|---|
| `--sc-transition-fast` | 150ms ease-out | Colour shifts, icon swaps |
| `--sc-transition-base` | 200ms ease-out | Buttons, shadows, underlines |
| `--sc-transition-slow` | 350ms ease-out | Page and panel transitions |

Composed, never playful. No spring or bounce easing. No transform-heavy hovers.

---

## 8. Imagery and iconography

**Photography** — people-first, culturally diverse, warm natural light. Aspirational but authentic. Full-bleed heroes carry an indigo-to-transparent overlay so white type clears 4.5:1.

**Icons** — stroke-based, 1.5–2px weight, rounded caps, 24px default (16px inline, 32px feature). Monochrome in `--sc-blue` or `--sc-gray-600`. Lucide is the stand-in for SC's proprietary set.

**Never** — emoji, hand-drawn illustration, stock-photo clichés, decorative SVG scenery.

---

## 9. Voice

Direct, warm, optimistic, internationally minded. Short active sentences. Address the reader as "you", the bank as "we". No jargon, no hype.

Tone shifts by segment: Priority and Retail warmer and lifestyle-led; CCIB formal and insight-driven; Private Bank understated.

> "We help people and businesses prosper across Asia, Africa and the Middle East."

---

## 10. Accessibility

Body text ≥ 4.5:1; headline-scale type may sit at 3:1. Full-opacity ink on accent and photographic grounds — never alpha-muted type. Hit targets ≥ 44px on touch. Every interactive element carries a visible focus ring.

---

## 11. Slide system (this repo)

How sections 1–10 apply to 1440×810 slides. These are decisions already made and checked on the s2bo deck; follow them for every project. Where they differ from the web rules above, the slide rule wins on slides.

### Surfaces

- Two only: **white** for content slides, **`--sc-indigo`** for title slides (opening and closing). No other slide backgrounds.
- Title slides: full-bleed photo under the indigo overlay (the only gradient allowed), all-white logo, white type, and the blue-over-green vertical bar beside the heading.
- Cards: white by default. Cards that show progress (steps, checklists) use **`--sc-green-10`**. Dividers and rails inside a green card use a brand-grey tint (`--sc-grey-brand` at 35%), because `--sc-gray-200` disappears on green.

### Colour roles

| Colour | On slides it is used for |
|---|---|
| `--sc-blue` | Item rules and numbers, step dots, checkboxes and ticks, connectors |
| `--sc-green` | Title kicker, the green half of the title bar, the final step's dot. Never small text. |
| `--sc-green-20` + `--sc-green-dark` | Tags |
| `--sc-green-10` | Progress cards (steps, checks) |
| `--sc-indigo` | Title slide surface, content headings |
| `--sc-gray-900` / `-800` / `--sc-grey-brand` | Item text / card text / labels, notes, footer |

Blue dominates; green stays an accent. No new colours without adding them to section 2 first.

### Type on the stage

| Role | Size | Weight |
|---|---|---|
| Title slide heading | 96px | 700 |
| Title slide lead line | 36px | 300 |
| Content heading | 64px | 700, `--sc-indigo` |
| Item text (columns) | 30px | 300 |
| Item text (stacked beside media/card) | 28px | 300 |
| Group card text | 40px | 700 |
| Card item text | 22px | 400 |
| Card label (eyebrow) | 14px | 700, uppercase, +0.1em |
| Notes | 18px | 400, `--sc-grey-brand` |

The Light 300 / Bold 700 contrast is the look. Don't introduce sizes between these. If copy doesn't fit, cut layout density, not font size.

### Shape and space

- Side margins 96px; logo top-left, deck title bottom-left as the footer. Nothing crosses into the footer row.
- Cards 12px radius (feature-card radius), shadow-sm, 32–44px padding. Screenshot frames 8px radius with a browser bar.
- Tags 4px radius, uppercase.
- Gaps, not margins, between siblings.

### Motion

Slides use the presets in `src/motion.ts` (0.3 / 0.5 / 0.75s), not the 150–350ms UI transitions in section 7, because slide entrances are read rather than clicked. The character rule still holds: composed `ease-out`-style movement, no bounce or spring, nothing playful. Sequences (steps, checks) reveal one item at a time.

### Imagery

- Photos from sc.com (abstract architecture and city aerials suit corporate and transaction-banking decks), downloaded at the largest size served, recorded in `assets/<id>/SOURCES.md` with a usage-rights note.
- Product screens in a browser frame at 16:10, captured at 1280×800.
- No icons or illustration on slides beyond the built-in markers (rules, dots, checkboxes).

---

## Files (this repo)

```
src/index.css        tokens on :root + all slide styling
assets/logo.svg      SC lockup (inlined, CSS-coloured)
assets/fonts/        SC Prosper Sans (300/400/700 loaded)
assets/<id>/         per-project photos, screenshots, music, SOURCES.md
```
